// =============================================
// SINIF YÖNETİM SİSTEMİ - ÖDEV YÖNETİMİ
// =============================================

const Homework = {
    getAll() { return Storage.get(CONFIG.STORAGE_KEYS.HOMEWORK) || []; },
    getById(id) { return this.getAll().find(h => h.id === id); },
    getActive() { const today = getToday(); return this.getAll().filter(h => h.dueDate >= today); },
    getForStudent(studentId) {
        return this.getAll().filter(h => h.isGeneral || (h.targetStudents && h.targetStudents.includes(studentId)));
    },
    add(data) {
        const items = this.getAll();
        const newItem = {
            id: generateId(), title: data.title.trim(),
            description: data.description ? data.description.trim() : '',
            dueDate: data.dueDate, subject: data.subject || 'Genel',
            isGeneral: data.isGeneral || false, targetStudents: data.targetStudents || [],
            completedBy: [], createdAt: getToday()
        };
        items.unshift(newItem);
        Storage.set(CONFIG.STORAGE_KEYS.HOMEWORK, items);
        return newItem;
    },
    update(id, data) {
        const items = this.getAll();
        const index = items.findIndex(h => h.id === id);
        if (index === -1) return null;
        items[index] = { ...items[index], ...data };
        Storage.set(CONFIG.STORAGE_KEYS.HOMEWORK, items);
        return items[index];
    },
    delete(id) {
        const items = this.getAll();
        const filtered = items.filter(h => h.id !== id);
        if (filtered.length === items.length) return false;
        Storage.set(CONFIG.STORAGE_KEYS.HOMEWORK, filtered);
        return true;
    },
    markCompleted(homeworkId, studentId) {
        const items = this.getAll();
        const index = items.findIndex(h => h.id === homeworkId);
        if (index === -1) return null;
        if (!items[index].completedBy.includes(studentId)) {
            items[index].completedBy.push(studentId);
            Storage.set(CONFIG.STORAGE_KEYS.HOMEWORK, items);
        }
        return items[index];
    },
    markIncomplete(homeworkId, studentId) {
        const items = this.getAll();
        const index = items.findIndex(h => h.id === homeworkId);
        if (index === -1) return null;
        items[index].completedBy = items[index].completedBy.filter(id => id !== studentId);
        Storage.set(CONFIG.STORAGE_KEYS.HOMEWORK, items);
        return items[index];
    },
    getCount() { return this.getAll().length; },
    getActiveCount() { return this.getActive().length; },
    getSubjects() { return ['Türkçe', 'Matematik', 'Hayat Bilgisi', 'Resim', 'Müzik', 'Beden Eğitimi', 'Genel']; }
};

// UI FONKSİYONLARI
function renderHomeworkList() {
    const container = document.getElementById('homeworkListContainer');
    if (!container) return;
    const homeworks = Homework.getAll();
    const students = Students.getAll();
    const today = getToday();
    if (homeworks.length === 0) {
        container.innerHTML = showEmptyState('📝', 'Henüz ödev yok', 'Yeni ödev eklemek için yukarıdaki butonu kullanın.');
        return;
    }
    let html = '<div class="announcement-list">';
    homeworks.forEach(homework => {
        const isOverdue = homework.dueDate < today;
        const isDueToday = homework.dueDate === today;
        let statusBadge = isOverdue ? '<span class="badge badge-danger">⏰ Süresi geçti</span>' : isDueToday ? '<span class="badge badge-warning">📌 Bugün!</span>' : '<span class="badge badge-success">✅ Aktif</span>';
        const targetInfo = homework.isGeneral ? '<span class="badge badge-primary">🌐 Tüm sınıf</span>' : `<span class="badge badge-warning">👤 ${homework.targetStudents.length} öğrenci</span>`;
        const targetCount = homework.isGeneral ? students.length : homework.targetStudents.length;
        const completedCount = homework.completedBy.length;
        const pct = targetCount > 0 ? Math.round((completedCount / targetCount) * 100) : 0;
        html += `<div class="announcement-card" style="border-left-color: ${isOverdue ? 'var(--danger)' : isDueToday ? 'var(--warning)' : 'var(--success)'}">
            <div class="announcement-header"><div><h3 class="announcement-title">📝 ${homework.title}</h3><div class="flex gap-2 mt-2 flex-wrap">${statusBadge}${targetInfo}<span class="badge badge-primary">${homework.subject}</span></div></div>
            <div class="flex items-center gap-2"><span class="announcement-date">📅 ${formatDate(homework.dueDate)}</span><button class="btn btn-sm btn-ghost" onclick="editHomework('${homework.id}')">✏️</button><button class="btn btn-sm btn-ghost text-danger" onclick="deleteHomework('${homework.id}')">🗑️</button></div></div>
            <p class="announcement-content">${homework.description || 'Açıklama yok'}</p>
            <div class="mt-4"><div class="flex items-center justify-between mb-2"><span class="text-sm font-medium">Tamamlama</span><span class="text-sm text-muted">${completedCount}/${targetCount} (%${pct})</span></div>
            <div style="background:var(--gray-200);border-radius:var(--radius-full);height:8px;overflow:hidden"><div style="background:linear-gradient(135deg,var(--success) 0%,#059669 100%);height:100%;width:${pct}%"></div></div></div>
            <button class="btn btn-sm btn-outline mt-3" onclick="showHomeworkDetails('${homework.id}')">👁️ Detaylar</button></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderParentHomework() {
    const container = document.getElementById('parentHomeworkContainer');
    if (!container) return;
    const user = Auth.getCurrentUser();
    if (!user || user.type !== 'parent') return;
    const homeworks = Homework.getForStudent(user.studentId);
    const today = getToday();
    if (homeworks.length === 0) { container.innerHTML = showEmptyState('📝', 'Henüz ödev yok'); return; }
    let html = '<div class="announcement-list">';
    homeworks.forEach(hw => {
        const isOverdue = hw.dueDate < today;
        const isCompleted = hw.completedBy.includes(user.studentId);
        let badge = isCompleted ? '<span class="badge badge-success">✅ Tamamlandı</span>' : isOverdue ? '<span class="badge badge-danger">⏰ Geçti</span>' : '<span class="badge badge-primary">⏳ Bekliyor</span>';
        html += `<div class="announcement-card"><div class="announcement-header"><div><h3 class="announcement-title">📝 ${hw.title}</h3><div class="flex gap-2 mt-2">${badge}<span class="badge badge-primary">${hw.subject}</span></div></div><span class="announcement-date">📅 ${formatDate(hw.dueDate)}</span></div><p class="announcement-content">${hw.description || ''}</p></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function openAddHomeworkModal() {
    document.getElementById('homeworkModalTitle').textContent = '➕ Yeni Ödev';
    document.getElementById('homeworkForm').reset();
    document.getElementById('homeworkId').value = '';
    document.getElementById('isHomeworkGeneral').checked = true;
    document.getElementById('homeworkDueDate').min = getToday();
    loadHomeworkStudentCheckboxes();
    loadSubjectSelect();
    toggleHomeworkStudentSelection();
    showModal('homeworkModal');
}

function loadSubjectSelect() {
    const select = document.getElementById('homeworkSubject');
    if (!select) return;
    select.innerHTML = Homework.getSubjects().map(s => `<option value="${s}">${s}</option>`).join('');
}

function loadHomeworkStudentCheckboxes(selectedIds = []) {
    const container = document.getElementById('homeworkStudentCheckboxContainer');
    if (!container) return;
    container.innerHTML = createStudentCheckboxList(Students.getAll(), selectedIds);
}

function toggleHomeworkStudentSelection() {
    const container = document.getElementById('homeworkStudentSelectionSection');
    if (container) container.style.display = document.getElementById('isHomeworkGeneral').checked ? 'none' : 'block';
}

function editHomework(id) {
    const hw = Homework.getById(id);
    if (!hw) return;
    document.getElementById('homeworkModalTitle').textContent = '✏️ Ödev Düzenle';
    document.getElementById('homeworkId').value = hw.id;
    document.getElementById('homeworkTitle').value = hw.title;
    document.getElementById('homeworkDescription').value = hw.description;
    document.getElementById('homeworkDueDate').value = hw.dueDate;
    document.getElementById('isHomeworkGeneral').checked = hw.isGeneral;
    loadSubjectSelect();
    document.getElementById('homeworkSubject').value = hw.subject;
    loadHomeworkStudentCheckboxes(hw.targetStudents);
    toggleHomeworkStudentSelection();
    showModal('homeworkModal');
}

function saveHomework(event) {
    event.preventDefault();
    const id = document.getElementById('homeworkId').value;
    const title = document.getElementById('homeworkTitle').value.trim();
    const description = document.getElementById('homeworkDescription').value.trim();
    const dueDate = document.getElementById('homeworkDueDate').value;
    const subject = document.getElementById('homeworkSubject').value;
    const isGeneral = document.getElementById('isHomeworkGeneral').checked;
    if (!title || !dueDate) { showToast('Başlık ve tarih gerekli!', 'error'); return; }
    let targetStudents = [];
    if (!isGeneral) {
        targetStudents = Array.from(document.querySelectorAll('#homeworkStudentCheckboxContainer input:checked')).map(cb => cb.value);
        if (targetStudents.length === 0) { showToast('En az bir öğrenci seçin!', 'error'); return; }
    }
    if (id) { Homework.update(id, { title, description, dueDate, subject, isGeneral, targetStudents }); showToast('Ödev güncellendi!'); }
    else { Homework.add({ title, description, dueDate, subject, isGeneral, targetStudents }); showToast('Ödev oluşturuldu!'); }
    hideModal('homeworkModal');
    renderHomeworkList();
    updateStats();
}

async function deleteHomework(id) {
    const hw = Homework.getById(id);
    if (!hw) return;
    if (await confirmAction(`"${hw.title}" ödevini silmek istediğinize emin misiniz?`)) {
        Homework.delete(id);
        showToast('Ödev silindi!');
        renderHomeworkList();
        updateStats();
    }
}

function showHomeworkDetails(id) {
    const hw = Homework.getById(id);
    if (!hw) return;
    const students = Students.getAll();
    const targets = hw.isGeneral ? students : students.filter(s => hw.targetStudents.includes(s.id));
    let html = `<div class="mb-4"><h4 class="font-bold mb-2">Ödev: ${hw.title}</h4><p>Ders: ${hw.subject} | Teslim: ${formatDate(hw.dueDate)}</p></div><table class="table"><thead><tr><th>Öğrenci</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>`;
    targets.forEach(s => {
        const done = hw.completedBy.includes(s.id);
        html += `<tr><td>${s.name}</td><td>${done ? '<span class="badge badge-success">✅</span>' : '<span class="badge badge-warning">⏳</span>'}</td><td><button class="btn btn-sm ${done ? 'btn-outline' : 'btn-success'}" onclick="toggleHomeworkCompletion('${hw.id}','${s.id}',${done})">${done ? 'Geri Al' : 'Tamamla'}</button></td></tr>`;
    });
    html += '</tbody></table>';
    document.getElementById('homeworkDetailsContent').innerHTML = html;
    showModal('homeworkDetailsModal');
}

function toggleHomeworkCompletion(hwId, sId, done) {
    if (done) Homework.markIncomplete(hwId, sId);
    else Homework.markCompleted(hwId, sId);
    showToast(done ? 'Geri alındı!' : 'Tamamlandı!');
    showHomeworkDetails(hwId);
    renderHomeworkList();
}
