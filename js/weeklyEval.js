// =============================================
// SINIF YÖNETİM SİSTEMİ - HAFTALIK DEĞERLENDİRME
// =============================================

const WeeklyEval = {
    STORAGE_KEY: CONFIG.STORAGE_KEYS.WEEKLY_EVALUATIONS,

    getAll() { return Storage.get(this.STORAGE_KEY) || []; },

    getById(id) { return this.getAll().find(e => e.id === id); },

    getByStudent(studentId) { return this.getAll().filter(e => e.studentId === studentId); },

    getByStudentAndWeek(studentId, weekNum) {
        return this.getAll().find(e => e.studentId === studentId && e.week === weekNum);
    },

    add(data) {
        const items = this.getAll();
        // Aynı hafta için varsa güncelle
        const existingIndex = items.findIndex(e => e.studentId === data.studentId && e.week === data.week);

        const evalData = {
            id: existingIndex >= 0 ? items[existingIndex].id : generateId(),
            studentId: data.studentId,
            week: data.week,
            date: getToday(),
            subjects: data.subjects, // { turkce: {score, note}, matematik: {...}, ... }
            generalNote: data.generalNote || '',
            learned: data.learned || '',      // Öğrendiği konular
            needsWork: data.needsWork || ''   // Geliştirilmesi gereken konular
        };

        if (existingIndex >= 0) {
            items[existingIndex] = evalData;
        } else {
            items.unshift(evalData);
        }

        Storage.set(this.STORAGE_KEY, items);
        return evalData;
    },

    delete(id) {
        const items = this.getAll();
        const filtered = items.filter(e => e.id !== id);
        if (filtered.length === items.length) return false;
        Storage.set(this.STORAGE_KEY, filtered);
        return true;
    },

    // Öğrenci için özet getir
    getStudentSummary(studentId) {
        const evals = this.getByStudent(studentId);
        if (evals.length === 0) return null;

        const subjects = Curriculum.getAllSubjects();
        const summary = {};

        subjects.forEach(subj => {
            const scores = evals.map(e => e.subjects[subj.key]?.score || 0).filter(s => s > 0);
            summary[subj.key] = {
                name: subj.name,
                icon: subj.icon,
                avgScore: scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0,
                evalCount: scores.length
            };
        });

        return summary;
    },

    getRatingLabel(rating) {
        const labels = { 1: 'Geliştirilmeli', 2: 'Başlangıç', 3: 'Gelişiyor', 4: 'İyi', 5: 'Çok İyi' };
        return labels[rating] || '';
    }
};

// =============================================
// HAFTALIK DEĞERLENDİRME UI
// =============================================

function renderWeeklyEvaluationList() {
    const container = document.getElementById('weeklyEvalListContainer');
    if (!container) return;

    const students = Students.getAll();
    const currentWeek = Curriculum.getCurrentWeek();

    if (students.length === 0) {
        container.innerHTML = showEmptyState('⭐', 'Henüz öğrenci yok', 'Önce öğrenci ekleyin.');
        return;
    }

    // Hafta seçici
    let weekOptions = '';
    Curriculum.getAllWeeks().forEach(w => {
        const selected = w.week === currentWeek ? 'selected' : '';
        weekOptions += `<option value="${w.week}" ${selected}>${w.week}. Hafta (${w.dates})</option>`;
    });

    let html = `
        <div class="card mb-4">
            <div class="flex items-center gap-4 flex-wrap">
                <div class="form-group" style="margin:0; min-width: 250px;">
                    <label class="form-label">📅 Hafta Seçin</label>
                    <select id="weekSelector" class="form-select" onchange="loadWeekEvaluations()">
                        ${weekOptions}
                    </select>
                </div>
                <div id="weekTopicsPreview" class="flex-1"></div>
            </div>
        </div>
        <div id="weekEvalStudentList"></div>
    `;

    container.innerHTML = html;
    loadWeekEvaluations();
}

function loadWeekEvaluations() {
    const weekNum = parseInt(document.getElementById('weekSelector').value);
    const weekInfo = Curriculum.getWeek(weekNum);
    const topics = Curriculum.getWeekTopics(weekNum);
    const students = Students.getAll();

    // Hafta konularını göster
    const topicsPreview = document.getElementById('weekTopicsPreview');
    let topicsHtml = '<div class="flex gap-2 flex-wrap">';
    Object.values(topics).forEach(t => {
        topicsHtml += `<span class="badge badge-primary">${t.icon} ${t.name}</span>`;
    });
    topicsHtml += '</div>';
    topicsPreview.innerHTML = topicsHtml;

    // Öğrenci listesi
    const listContainer = document.getElementById('weekEvalStudentList');
    let html = '<div class="table-container"><table class="table"><thead><tr><th>Öğrenci</th><th>Değerlendirme Durumu</th><th>İşlemler</th></tr></thead><tbody>';

    students.forEach(student => {
        const existing = WeeklyEval.getByStudentAndWeek(student.id, weekNum);
        let status = '<span class="badge badge-warning">⏳ Değerlendirilmedi</span>';

        if (existing) {
            const avgScores = Object.values(existing.subjects).map(s => s.score).filter(s => s > 0);
            const avg = avgScores.length > 0 ? (avgScores.reduce((a, b) => a + b, 0) / avgScores.length).toFixed(1) : 0;
            status = `<span class="badge badge-success">✅ Değerlendirildi (Ort: ${avg}⭐)</span>`;
        }

        html += `<tr>
            <td><div class="flex items-center gap-2"><span>👤</span><strong>${student.name}</strong></div></td>
            <td>${status}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="openWeeklyEvalModal('${student.id}', ${weekNum})">
                    ${existing ? '✏️ Düzenle' : '➕ Değerlendir'}
                </button>
                ${existing ? `<button class="btn btn-sm btn-outline" onclick="viewWeeklyEvalDetails('${student.id}', ${weekNum})">👁️ Detay</button>` : ''}
            </td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    listContainer.innerHTML = html;
}

function openWeeklyEvalModal(studentId, weekNum) {
    const student = Students.getById(studentId);
    const weekInfo = Curriculum.getWeek(weekNum);
    const topics = Curriculum.getWeekTopics(weekNum);
    const existing = WeeklyEval.getByStudentAndWeek(studentId, weekNum);

    document.getElementById('weeklyEvalModalTitle').textContent = `📊 ${student.name} - ${weekNum}. Hafta Değerlendirmesi`;
    document.getElementById('weeklyEvalStudentId').value = studentId;
    document.getElementById('weeklyEvalWeek').value = weekNum;

    // Ders bazlı değerlendirme alanları
    let subjectsHtml = '';
    const subjects = Curriculum.getAllSubjects();

    subjects.forEach(subj => {
        const topic = topics[subj.key];
        const existingScore = existing?.subjects?.[subj.key]?.score || 3;
        const existingNote = existing?.subjects?.[subj.key]?.note || '';

        subjectsHtml += `
            <div class="card mb-3" style="padding: var(--spacing-4);">
                <div class="flex items-center gap-2 mb-2">
                    <span style="font-size: 1.5rem;">${subj.icon}</span>
                    <strong>${subj.name}</strong>
                </div>
                <p class="text-sm text-muted mb-3">📌 ${topic.topic}</p>
                <div class="flex items-center gap-4 mb-2">
                    <span class="text-sm">Puan:</span>
                    ${createStarRating(existingScore, true, `score_${subj.key}`)}
                    <input type="hidden" name="score_${subj.key}" value="${existingScore}">
                </div>
                <input type="text" name="note_${subj.key}" class="form-input" placeholder="Kısa not (opsiyonel)" value="${existingNote}" style="font-size: 0.875rem;">
            </div>
        `;
    });

    document.getElementById('weeklyEvalSubjects').innerHTML = subjectsHtml;

    // Genel notlar
    document.getElementById('weeklyEvalLearned').value = existing?.learned || '';
    document.getElementById('weeklyEvalNeedsWork').value = existing?.needsWork || '';
    document.getElementById('weeklyEvalGeneralNote').value = existing?.generalNote || '';

    showModal('weeklyEvalModal');
}

function saveWeeklyEvaluation(event) {
    event.preventDefault();

    const studentId = document.getElementById('weeklyEvalStudentId').value;
    const weekNum = parseInt(document.getElementById('weeklyEvalWeek').value);
    const learned = document.getElementById('weeklyEvalLearned').value.trim();
    const needsWork = document.getElementById('weeklyEvalNeedsWork').value.trim();
    const generalNote = document.getElementById('weeklyEvalGeneralNote').value.trim();

    // Ders puanlarını topla
    const subjects = {};
    Curriculum.getAllSubjects().forEach(subj => {
        const scoreInput = document.querySelector(`input[name="score_${subj.key}"]`);
        const noteInput = document.querySelector(`input[name="note_${subj.key}"]`);
        subjects[subj.key] = {
            score: scoreInput ? parseInt(scoreInput.value) : 3,
            note: noteInput ? noteInput.value.trim() : ''
        };
    });

    WeeklyEval.add({
        studentId,
        week: weekNum,
        subjects,
        learned,
        needsWork,
        generalNote
    });

    showToast('Haftalık değerlendirme kaydedildi!');
    hideModal('weeklyEvalModal');
    loadWeekEvaluations();
}

function viewWeeklyEvalDetails(studentId, weekNum) {
    const student = Students.getById(studentId);
    const evalData = WeeklyEval.getByStudentAndWeek(studentId, weekNum);
    const topics = Curriculum.getWeekTopics(weekNum);

    if (!evalData) return;

    let html = `
        <div class="mb-4">
            <h3 class="font-bold">${student.name}</h3>
            <p class="text-muted">${weekNum}. Hafta - ${formatDate(evalData.date)}</p>
        </div>
    `;

    // Ders puanları
    html += '<div class="mb-4">';
    Curriculum.getAllSubjects().forEach(subj => {
        const data = evalData.subjects[subj.key];
        const topic = topics[subj.key];
        html += `
            <div class="flex items-center justify-between mb-3 p-3" style="background: var(--gray-50); border-radius: var(--radius);">
                <div>
                    <span>${subj.icon} <strong>${subj.name}</strong></span>
                    <p class="text-sm text-muted">${topic.topic}</p>
                    ${data?.note ? `<p class="text-sm" style="color: var(--primary);">${data.note}</p>` : ''}
                </div>
                <div>${createStarRating(data?.score || 0)}</div>
            </div>
        `;
    });
    html += '</div>';

    // Özet bilgiler
    if (evalData.learned) {
        html += `<div class="alert alert-success mb-3"><strong>✅ Öğrendikleri:</strong><p>${evalData.learned}</p></div>`;
    }
    if (evalData.needsWork) {
        html += `<div class="alert alert-warning mb-3"><strong>📌 Geliştirilecek:</strong><p>${evalData.needsWork}</p></div>`;
    }
    if (evalData.generalNote) {
        html += `<div class="alert alert-info"><strong>📝 Genel Not:</strong><p>${evalData.generalNote}</p></div>`;
    }

    document.getElementById('weeklyEvalDetailsContent').innerHTML = html;
    showModal('weeklyEvalDetailsModal');
}

// VELİ PANELİ İÇİN
function renderParentWeeklyEvaluations() {
    const container = document.getElementById('parentWeeklyEvalContainer');
    if (!container) return;

    const user = Auth.getCurrentUser();
    if (!user || user.type !== 'parent') return;

    const evals = WeeklyEval.getByStudent(user.studentId).sort((a, b) => b.week - a.week);

    if (evals.length === 0) {
        container.innerHTML = showEmptyState('📊', 'Henüz haftalık değerlendirme yok');
        return;
    }

    // Özet göster
    const summary = WeeklyEval.getStudentSummary(user.studentId);
    let summaryHtml = '<div class="stats-grid mb-6">';
    Object.values(summary).forEach(s => {
        summaryHtml += `
            <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); font-size: 1.5rem;">${s.icon}</div>
                <div class="stat-info">
                    <h3>${s.avgScore}⭐</h3>
                    <p>${s.name}</p>
                </div>
            </div>
        `;
    });
    summaryHtml += '</div>';

    // Haftalık değerlendirmeler
    let html = summaryHtml + '<h3 class="font-bold mb-4">📅 Haftalık Değerlendirmeler</h3><div class="announcement-list">';

    evals.forEach(evalData => {
        const weekInfo = Curriculum.getWeek(evalData.week);

        html += `
            <div class="announcement-card">
                <div class="announcement-header">
                    <h4 class="font-bold">${evalData.week}. Hafta</h4>
                    <span class="text-muted">${weekInfo?.dates || ''}</span>
                </div>
                <div class="flex gap-2 flex-wrap mb-3">
        `;

        Curriculum.getAllSubjects().forEach(subj => {
            const score = evalData.subjects[subj.key]?.score || 0;
            const color = score >= 4 ? 'success' : score >= 3 ? 'primary' : 'warning';
            html += `<span class="badge badge-${color}">${subj.icon} ${score}⭐</span>`;
        });

        html += '</div>';

        if (evalData.learned) {
            html += `<p class="text-sm mb-2"><span style="color: var(--success);">✅</span> <strong>Öğrendikleri:</strong> ${evalData.learned}</p>`;
        }
        if (evalData.needsWork) {
            html += `<p class="text-sm"><span style="color: var(--warning);">📌</span> <strong>Geliştirilecek:</strong> ${evalData.needsWork}</p>`;
        }

        html += '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
}
