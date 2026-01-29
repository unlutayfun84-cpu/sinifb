// =============================================
// SINIF YÖNETİM SİSTEMİ - DEĞERLENDİRME
// =============================================

const Evaluations = {
    async getAll() { return await SupabaseDB.getEvaluations(); },
    async getById(id) { const all = await this.getAll(); return all.find(e => e.id === id); },
    async getByStudent(studentId) { const all = await this.getAll(); return all.filter(e => e.studentId === studentId); },
    async getLatestByStudent(studentId) {
        const evals = await this.getByStudent(studentId);
        return evals.sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
    },
    async add(data) {
        const newItem = {
            id: generateId(),
            studentId: data.studentId,
            period: data.period,
            date: getToday(),
            academic: data.academic || 3,
            social: data.social || 3,
            artistic: data.artistic || 3,
            physical: data.physical || 3,
            communication: data.communication || 3,
            notes: data.notes || ''
        };
        await SupabaseDB.addEvaluation(newItem);
        return newItem;
    },
    async update(id, data) {
        await SupabaseDB.updateEvaluation(id, data);
        return await this.getById(id);
    },
    async delete(id) {
        await SupabaseDB.deleteEvaluation(id);
        return true;
    },
    async getCount() { const all = await this.getAll(); return all.length; },
    getPeriods() { return ['1. Dönem', '2. Dönem', 'Yıl Sonu']; },
    getCategories() {
        return [
            { key: 'academic', label: '📚 Akademik Başarı', icon: '📚' },
            { key: 'social', label: '🤝 Sosyal Beceriler', icon: '🤝' },
            { key: 'artistic', label: '🎨 Sanatsal Yetenekler', icon: '🎨' },
            { key: 'physical', label: '⚽ Fiziksel Gelişim', icon: '⚽' },
            { key: 'communication', label: '💬 İletişim Becerileri', icon: '💬' }
        ];
    },
    getRatingLabel(rating) {
        const labels = { 1: 'Geliştirilmeli', 2: 'Kabul Edilebilir', 3: 'İyi', 4: 'Çok İyi', 5: 'Mükemmel' };
        return labels[rating] || '';
    }
};

// UI FONKSİYONLARI
async function renderEvaluationList() {
    const container = document.getElementById('evaluationListContainer');
    if (!container) return;
    const students = await Students.getAll();
    if (students.length === 0) {
        container.innerHTML = showEmptyState('⭐', 'Henüz öğrenci yok', 'Önce öğrenci ekleyin.');
        return;
    }
    let html = '<div class="table-container"><table class="table"><thead><tr><th>Öğrenci</th><th>Son Değerlendirme</th><th>Ortalama</th><th>İşlemler</th></tr></thead><tbody>';
    for (const student of students) {
        const latest = await Evaluations.getLatestByStudent(student.id);
        let avgBadge = '<span class="text-muted">-</span>';
        let periodInfo = '<span class="text-muted">Henüz değerlendirilmedi</span>';
        if (latest) {
            const avg = ((latest.academic + latest.social + latest.artistic + latest.physical + latest.communication) / 5).toFixed(1);
            avgBadge = createStarRating(Math.round(avg));
            periodInfo = `${latest.period} - ${formatDate(latest.date)}`;
        }
        html += `<tr><td><div class="flex items-center gap-2"><span>👤</span><strong>${student.name}</strong></div></td><td>${periodInfo}</td><td>${avgBadge}</td><td><div class="flex gap-2"><button class="btn btn-sm btn-primary" onclick="openAddEvaluationModal('${student.id}')">➕ Değerlendir</button><button class="btn btn-sm btn-outline" onclick="viewStudentEvaluations('${student.id}')">📊 Geçmiş</button></div></td></tr>`;
    }
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

async function renderParentEvaluations() {
    const container = document.getElementById('parentEvaluationsContainer');
    if (!container) return;
    const user = Auth.getCurrentUser();
    if (!user || user.type !== 'parent') return;
    const evals = await Evaluations.getByStudent(user.studentId);
    if (evals.length === 0) { container.innerHTML = showEmptyState('⭐', 'Henüz değerlendirme yok'); return; }
    const categories = Evaluations.getCategories();
    let html = '<div class="announcement-list">';
    evals.forEach(ev => {
        html += `<div class="card mb-4"><div class="flex justify-between items-center mb-4"><h3 class="font-bold">${ev.period}</h3><span class="text-muted">${formatDate(ev.date)}</span></div>`;
        categories.forEach(cat => {
            const rating = ev[cat.key];
            html += `<div class="flex justify-between items-center mb-3"><span>${cat.icon} ${cat.label.split(' ').slice(1).join(' ')}</span><div class="flex items-center gap-2">${createStarRating(rating)}<span class="text-sm text-muted">(${Evaluations.getRatingLabel(rating)})</span></div></div>`;
        });
        if (ev.notes) html += `<div class="mt-4 p-3 bg-gray-50" style="background:var(--gray-100);border-radius:var(--radius)"><strong>Öğretmen Notu:</strong><p class="mt-2">${ev.notes}</p></div>`;
        html += '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

async function openAddEvaluationModal(studentId) {
    const student = await Students.getById(studentId);
    if (!student) return;
    document.getElementById('evaluationModalTitle').textContent = `⭐ ${student.name} - Değerlendirme`;
    document.getElementById('evaluationForm').reset();
    document.getElementById('evaluationId').value = '';
    document.getElementById('evaluationStudentId').value = studentId;
    loadPeriodSelect();
    const categories = Evaluations.getCategories();
    const ratingContainer = document.getElementById('ratingInputsContainer');
    ratingContainer.innerHTML = '';
    categories.forEach(cat => {
        ratingContainer.innerHTML += `<div class="form-group"><label class="form-label">${cat.label}</label>${createStarRating(3, true, cat.key)}<input type="hidden" name="${cat.key}" value="3"></div>`;
    });
    showModal('evaluationModal');
}

function loadPeriodSelect() {
    const select = document.getElementById('evaluationPeriod');
    if (!select) return;
    select.innerHTML = Evaluations.getPeriods().map(p => `<option value="${p}">${p}</option>`).join('');
}

async function saveEvaluation(event) {
    event.preventDefault();
    const id = document.getElementById('evaluationId').value;
    const studentId = document.getElementById('evaluationStudentId').value;
    const period = document.getElementById('evaluationPeriod').value;
    const notes = document.getElementById('evaluationNotes').value.trim();
    const categories = Evaluations.getCategories();
    const data = { studentId, period, notes };
    categories.forEach(cat => {
        const input = document.querySelector(`input[name="${cat.key}"]`);
        data[cat.key] = input ? parseInt(input.value) : 3;
    });
    if (id) { await Evaluations.update(id, data); showToast('Değerlendirme güncellendi!'); }
    else { await Evaluations.add(data); showToast('Değerlendirme kaydedildi!'); }
    hideModal('evaluationModal');
    await renderEvaluationList();
}

async function viewStudentEvaluations(studentId) {
    const student = await Students.getById(studentId);
    if (!student) return;
    const evals = await Evaluations.getByStudent(studentId);
    const categories = Evaluations.getCategories();
    let html = `<h3 class="font-bold mb-4">👤 ${student.name}</h3>`;
    if (evals.length === 0) { html += '<p class="text-muted">Henüz değerlendirme yok.</p>'; }
    else {
        evals.forEach(ev => {
            html += `<div class="card mb-4"><div class="flex justify-between items-center mb-3"><strong>${ev.period}</strong><span class="text-muted">${formatDate(ev.date)}</span><button class="btn btn-sm btn-ghost text-danger" onclick="deleteEvaluation('${ev.id}')">🗑️</button></div>`;
            categories.forEach(cat => {
                html += `<div class="flex justify-between items-center mb-2"><span class="text-sm">${cat.icon} ${cat.label.split(' ').slice(1).join(' ')}</span>${createStarRating(ev[cat.key])}</div>`;
            });
            if (ev.notes) html += `<p class="text-sm text-muted mt-3">${ev.notes}</p>`;
            html += '</div>';
        });
    }
    document.getElementById('evaluationHistoryContent').innerHTML = html;
    showModal('evaluationHistoryModal');
}

async function deleteEvaluation(id) {
    if (await confirmAction('Bu değerlendirmeyi silmek istiyor musunuz?')) {
        await Evaluations.delete(id);
        showToast('Değerlendirme silindi!');
        hideModal('evaluationHistoryModal');
        await renderEvaluationList();
    }
}
