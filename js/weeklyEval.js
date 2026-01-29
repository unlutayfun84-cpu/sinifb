// =============================================
// SINIF YÖNETİM SİSTEMİ - HAFTALIK DEĞERLENDİRME (SUPABASE)
// =============================================

const WeeklyEvaluation = {
    STORAGE_KEY: CONFIG.STORAGE_KEYS.WEEKLY_EVALUATIONS,

    async getAll() { return await SupabaseDB.getWeeklyEvaluations(); },
    async getById(id) { const all = await this.getAll(); return all.find(e => e.id === id); },
    async getByStudent(studentId) { const all = await this.getAll(); return all.filter(e => e.studentId === studentId); },
    async getByWeek(studentId, weekNum) {
        const all = await this.getAll();
        return all.find(e => e.studentId === studentId && e.week === weekNum);
    },

    async add(data) {
        const newEval = {
            id: generateId(),
            studentId: data.studentId,
            week: data.week,
            subjects: data.subjects,
            learned: data.learned || '',
            toImprove: data.toImprove || '',
            date: getToday()
        };
        await SupabaseDB.addWeeklyEvaluation(newEval);
        return newEval;
    },

    async update(id, data) {
        const updates = {};
        if (data.subjects) updates.subjects = data.subjects;
        if (data.learned !== undefined) updates.learned = data.learned;
        if (data.toImprove !== undefined) updates.toImprove = data.toImprove;

        await SupabaseDB.updateWeeklyEvaluation(id, updates);
        return await this.getById(id);
    },

    async delete(id) {
        await SupabaseDB.deleteWeeklyEvaluation(id);
        return true;
    }
};

// UI Fonksiyonları
async function renderWeeklyEvaluationList() {
    const container = document.getElementById('weeklyEvalListContainer');
    if (!container) return;

    const students = await Students.getAll();
    const evaluations = await WeeklyEvaluation.getAll();

    if (students.length === 0) {
        container.innerHTML = showEmptyState('👥', 'Henüz öğrenci yok', 'Önce öğrenci ekleyin.');
        return;
    }

    let html = '<div class="weekly-eval-container">';

    for (const student of students) {
        const studentEvals = evaluations.filter(e => e.studentId === student.id);

        html += `
            <div class="student-eval-section">
                <div class="student-eval-header">
                    <h3>👤 ${student.name}</h3>
                    <button class="btn btn-sm btn-primary" onclick="openWeeklyEvalModal('${student.id}')">
                        ➕ Haftalık Değerlendirme Ekle
                    </button>
                </div>
                <div class="eval-timeline">
        `;

        if (studentEvals.length === 0) {
            html += '<p class="text-muted">Henüz değerlendirme yok</p>';
        } else {
            studentEvals.sort((a, b) => b.week - a.week).forEach(ev => {
                html += `
                    <div class="eval-card">
                        <div class="eval-card-header">
                            <h4>📅 Hafta ${ev.week}</h4>
                            <div class="flex gap-2">
                                <span class="text-muted">${formatDate(ev.date)}</span>
                                <button class="btn btn-sm btn-ghost" onclick="editWeeklyEval('${ev.id}')">✏️</button>
                                <button class="btn btn-sm btn-ghost text-danger" onclick="deleteWeeklyEval('${ev.id}')">🗑️</button>
                            </div>
                        </div>
                        <div class="eval-subjects">
                            ${renderSubjectStars(ev.subjects)}
                        </div>
                        ${ev.learned ? `<p><strong>✅ Öğrendikleri:</strong> ${ev.learned}</p>` : ''}
                        ${ev.toImprove ? `<p><strong>📝 Geliştirilecekler:</strong> ${ev.toImprove}</p>` : ''}
                    </div>
                `;
            });
        }

        html += '</div></div>';
    }

    html += '</div>';
    container.innerHTML = html;
}

async function renderParentWeeklyEvaluations() {
    const container = document.getElementById('parentWeeklyEvalContainer');
    if (!container) return;

    const user = Auth.getCurrentUser();
    if (!user || user.type !== 'parent') return;

    const evaluations = await WeeklyEvaluation.getByStudent(user.studentId);

    if (evaluations.length === 0) {
        container.innerHTML = showEmptyState('📊', 'Henüz değerlendirme yok');
        return;
    }

    // Ortalama hesapla
    const avgScores = {};
    evaluations.forEach(ev => {
        Object.entries(ev.subjects).forEach(([subject, score]) => {
            if (!avgScores[subject]) avgScores[subject] = [];
            avgScores[subject].push(score);
        });
    });

    let html = '<div class="parent-eval-summary"><h3>📊 Ders Ortalamaları</h3><div class="subject-averages">';
    Object.entries(avgScores).forEach(([subject, scores]) => {
        const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
        html += `
            <div class="subject-avg-card">
                <h4>${subject}</h4>
                <div class="stars">${'⭐'.repeat(Math.round(avg))}</div>
                <p>${avg} / 5</p>
            </div>
        `;
    });
    html += '</div></div>';

    html += '<div class="eval-timeline">';
    evaluations.sort((a, b) => b.week - a.week).forEach(ev => {
        html += `
            <div class="eval-card">
                <div class="eval-card-header">
                    <h4>📅 Hafta ${ev.week}</h4>
                    <span class="text-muted">${formatDate(ev.date)}</span>
                </div>
                <div class="eval-subjects">
                    ${renderSubjectStars(ev.subjects)}
                </div>
                ${ev.learned ? `<p><strong>✅ Öğrendikleri:</strong> ${ev.learned}</p>` : ''}
                ${ev.toImprove ? `<p><strong>📝 Geliştirilecekler:</strong> ${ev.toImprove}</p>` : ''}
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

async function openWeeklyEvalModal(studentId) {
    const students = await Students.getAll();
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const titleEl = document.getElementById('weeklyEvalModalTitle');
    if (titleEl) {
        titleEl.textContent = `📊 ${student.name} - Haftalık Değerlendirme`;
    } else {
        console.warn('WeeklyEval: weeklyEvalModalTitle element not found');
    }
    document.getElementById('weeklyEvalForm').reset();
    document.getElementById('weeklyEvalStudentId').value = studentId;

    // Hafta dropdown'ını doldur
    const weekSelect = document.getElementById('weeklyEvalWeek');
    const allWeeks = Curriculum.getAllWeeks();
    const existingEvals = await WeeklyEvaluation.getByStudent(studentId);
    const existingWeeks = existingEvals.map(e => e.week);

    // Mevcut haftayı hesapla
    const currentWeek = Curriculum.getCurrentWeek();

    weekSelect.innerHTML = '<option value="">-- Hafta Seçin --</option>';
    allWeeks.forEach(w => {
        const hasEval = existingWeeks.includes(w.week);
        const isCurrent = w.week === currentWeek;
        weekSelect.innerHTML += `
            <option value="${w.week}" ${isCurrent ? 'selected' : ''}>
                Hafta ${w.week} - ${w.dates} ${hasEval ? '✅' : ''} ${isCurrent ? '(Bu Hafta)' : ''}
            </option>
        `;
    });

    // Ders listesini yükle
    loadSubjectInputs();

    showModal('weeklyEvalModal');
}

async function editWeeklyEval(id) {
    const evaluation = await WeeklyEvaluation.getById(id);
    if (!evaluation) return;

    const students = await Students.getAll();
    const student = students.find(s => s.id === evaluation.studentId);

    document.getElementById('weeklyEvalModalTitle').textContent = `✏️ ${student?.name || 'Öğrenci'} - Değerlendirme Düzenle`;
    document.getElementById('weeklyEvalStudentId').value = evaluation.studentId;

    // Hafta dropdown'ını doldur
    const weekSelect = document.getElementById('weeklyEvalWeek');
    const allWeeks = Curriculum.getAllWeeks();
    const existingEvals = await WeeklyEvaluation.getByStudent(evaluation.studentId);
    const existingWeeks = existingEvals.map(e => e.week);

    weekSelect.innerHTML = '<option value="">-- Hafta Seçin --</option>';
    allWeeks.forEach(w => {
        const hasEval = existingWeeks.includes(w.week);
        const isSelected = w.week === evaluation.week;
        weekSelect.innerHTML += `
            <option value="${w.week}" ${isSelected ? 'selected' : ''}>
                Hafta ${w.week} - ${w.dates} ${hasEval ? '✅' : ''}
            </option>
        `;
    });

    document.getElementById('weeklyEvalLearned').value = evaluation.learned;
    document.getElementById('weeklyEvalNeedsWork').value = evaluation.toImprove;

    loadSubjectInputs(evaluation.subjects);

    showModal('weeklyEvalModal');
}

function loadSubjectInputs(existingScores = {}) {
    const container = document.getElementById('weeklyEvalSubjects');
    const subjects = ['Türkçe', 'Matematik', 'Hayat Bilgisi', 'İngilizce', 'Beden Eğitimi', 'Müzik', 'Görsel Sanatlar'];

    let html = '';
    subjects.forEach(subject => {
        const score = existingScores[subject] || 3;
        html += `
            <div class="subject-input-group" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; margin-bottom: 8px; background: var(--gray-50); border-radius: 8px;">
                <label style="font-weight: 500; min-width: 120px;">${subject}</label>
                <div class="star-rating" data-subject="${subject}" style="display: flex; gap: 4px;">
                    ${[1, 2, 3, 4, 5].map(star => `
                        <span class="star ${star <= score ? 'active' : ''}" 
                              style="cursor: pointer; font-size: 1.5rem; transition: transform 0.2s;"
                              onclick="setStarRating('${subject}', ${star})">⭐</span>
                    `).join('')}
                </div>
                <input type="hidden" id="score_${subject.replace(/\s/g, '_')}" value="${score}">
            </div>
        `;
    });

    container.innerHTML = html;
}

function setStarRating(subject, rating) {
    const container = document.querySelector(`[data-subject="${subject}"]`);
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
    document.getElementById(`score_${subject.replace(/\s/g, '_')}`).value = rating;
}

async function saveWeeklyEvaluation(event) {
    event.preventDefault();

    const studentId = document.getElementById('weeklyEvalStudentId').value;
    const week = parseInt(document.getElementById('weeklyEvalWeek').value);
    const learned = document.getElementById('weeklyEvalLearned').value.trim();
    const toImprove = document.getElementById('weeklyEvalNeedsWork').value.trim();

    const subjects = {};
    ['Türkçe', 'Matematik', 'Hayat Bilgisi', 'İngilizce', 'Beden Eğitimi', 'Müzik', 'Görsel Sanatlar'].forEach(subject => {
        const scoreInput = document.getElementById(`score_${subject.replace(/\s/g, '_')}`);
        subjects[subject] = parseInt(scoreInput.value);
    });

    try {
        // Mevcut değerlendirme var mı kontrol et (id saklamadığımız için week ve studentId ile bakıyoruz)
        const existing = await WeeklyEvaluation.getByWeek(studentId, week);

        if (existing) {
            await WeeklyEvaluation.update(existing.id, { subjects, learned, toImprove });
            showToast('Değerlendirme güncellendi!');
        } else {
            await WeeklyEvaluation.add({ studentId, week, subjects, learned, toImprove });
            showToast('Değerlendirme eklendi!');
        }

        hideModal('weeklyEvalModal');
        await renderWeeklyEvaluationList();
    } catch (error) {
        console.error('Error saving evaluation:', error);
        showToast('Bir hata oluştu!', 'error');
    }
}

async function deleteWeeklyEval(id) {
    const confirmed = await confirmAction('Bu değerlendirmeyi silmek istediğinize emin misiniz?');

    if (confirmed) {
        try {
            await WeeklyEvaluation.delete(id);
            showToast('Değerlendirme silindi!');
            await renderWeeklyEvaluationList();
        } catch (error) {
            console.error('Error deleting evaluation:', error);
            showToast('Bir hata oluştu!', 'error');
        }
    }
}

function renderSubjectStars(subjects) {
    let html = '<div class="subject-stars-grid">';
    Object.entries(subjects).forEach(([subject, score]) => {
        html += `
            <div class="subject-star-item">
                <span class="subject-name">${subject}:</span>
                <span class="stars">${'⭐'.repeat(score)}</span>
            </div>
        `;
    });
    html += '</div>';
    return html;
}
