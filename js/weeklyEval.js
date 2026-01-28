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
            studentEvals.sort((a, b) => b.week - a.week).forEach(eval => {
                html += `
                    <div class="eval-card">
                        <div class="eval-card-header">
                            <h4>📅 Hafta ${eval.week}</h4>
                            <div class="flex gap-2">
                                <span class="text-muted">${formatDate(eval.date)}</span>
                                <button class="btn btn-sm btn-ghost" onclick="editWeeklyEval('${eval.id}')">✏️</button>
                                <button class="btn btn-sm btn-ghost text-danger" onclick="deleteWeeklyEval('${eval.id}')">🗑️</button>
                            </div>
                        </div>
                        <div class="eval-subjects">
                            ${renderSubjectStars(eval.subjects)}
                        </div>
                        ${eval.learned ? `<p><strong>✅ Öğrendikleri:</strong> ${eval.learned}</p>` : ''}
                        ${eval.toImprove ? `<p><strong>📝 Geliştirilecekler:</strong> ${eval.toImprove}</p>` : ''}
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
    evaluations.forEach(eval => {
        Object.entries(eval.subjects).forEach(([subject, score]) => {
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
    evaluations.sort((a, b) => b.week - a.week).forEach(eval => {
        html += `
            <div class="eval-card">
                <div class="eval-card-header">
                    <h4>📅 Hafta ${eval.week}</h4>
                    <span class="text-muted">${formatDate(eval.date)}</span>
                </div>
                <div class="eval-subjects">
                    ${renderSubjectStars(eval.subjects)}
                </div>
                ${eval.learned ? `<p><strong>✅ Öğrendikleri:</strong> ${eval.learned}</p>` : ''}
                ${eval.toImprove ? `<p><strong>📝 Geliştirilecekler:</strong> ${eval.toImprove}</p>` : ''}
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

    document.getElementById('evalModalTitle').textContent = `📊 ${student.name} - Haftalık Değerlendirme`;
    document.getElementById('evalForm').reset();
    document.getElementById('evalId').value = '';
    document.getElementById('evalStudentId').value = studentId;

    // Hafta numarasını otomatik belirle
    const existingEvals = await WeeklyEvaluation.getByStudent(studentId);
    const nextWeek = existingEvals.length > 0 ? Math.max(...existingEvals.map(e => e.week)) + 1 : 1;
    document.getElementById('evalWeek').value = nextWeek;

    // Ders listesini yükle
    loadSubjectInputs();

    showModal('weeklyEvalModal');
}

async function editWeeklyEval(id) {
    const eval = await WeeklyEvaluation.getById(id);
    if (!eval) return;

    const students = await Students.getAll();
    const student = students.find(s => s.id === eval.studentId);

    document.getElementById('evalModalTitle').textContent = `✏️ ${student?.name || 'Öğrenci'} - Değerlendirme Düzenle`;
    document.getElementById('evalId').value = eval.id;
    document.getElementById('evalStudentId').value = eval.studentId;
    document.getElementById('evalWeek').value = eval.week;
    document.getElementById('evalLearned').value = eval.learned;
    document.getElementById('evalToImprove').value = eval.toImprove;

    loadSubjectInputs(eval.subjects);

    showModal('weeklyEvalModal');
}

function loadSubjectInputs(existingScores = {}) {
    const container = document.getElementById('subjectInputsContainer');
    const subjects = ['Türkçe', 'Matematik', 'Hayat Bilgisi', 'İngilizce', 'Beden Eğitimi', 'Müzik', 'Görsel Sanatlar'];

    let html = '';
    subjects.forEach(subject => {
        const score = existingScores[subject] || 3;
        html += `
            <div class="subject-input-group">
                <label>${subject}</label>
                <div class="star-rating" data-subject="${subject}">
                    ${[1, 2, 3, 4, 5].map(star => `
                        <span class="star ${star <= score ? 'active' : ''}" 
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

async function saveWeeklyEval(event) {
    event.preventDefault();

    const id = document.getElementById('evalId').value;
    const studentId = document.getElementById('evalStudentId').value;
    const week = parseInt(document.getElementById('evalWeek').value);
    const learned = document.getElementById('evalLearned').value.trim();
    const toImprove = document.getElementById('evalToImprove').value.trim();

    const subjects = {};
    ['Türkçe', 'Matematik', 'Hayat Bilgisi', 'İngilizce', 'Beden Eğitimi', 'Müzik', 'Görsel Sanatlar'].forEach(subject => {
        const scoreInput = document.getElementById(`score_${subject.replace(/\s/g, '_')}`);
        subjects[subject] = parseInt(scoreInput.value);
    });

    try {
        if (id) {
            await WeeklyEvaluation.update(id, { subjects, learned, toImprove });
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
