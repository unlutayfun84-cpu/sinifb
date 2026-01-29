// =============================================
// SINIF YÖNETİM SİSTEMİ - ÖDEV YÖNETİMİ (SUPABASE)
// =============================================

const Homework = {
    async getAll() { return await SupabaseDB.getHomework(); },
    async getById(id) { const all = await this.getAll(); return all.find(h => h.id === id); },
    async getActive() { const today = getToday(); const all = await this.getAll(); return all.filter(h => h.dueDate >= today); },
    async getForStudent(studentId) {
        const all = await this.getAll();
        return all.filter(h => h.studentIds && h.studentIds.includes(studentId));
    },

    async add(data) {
        const newHomework = {
            id: generateId(),
            title: data.title.trim(),
            description: data.description ? data.description.trim() : '',
            dueDate: data.dueDate,
            assignedDate: getToday(),
            studentIds: data.studentIds || []
        };
        await SupabaseDB.addHomework(newHomework);
        return newHomework;
    },

    async update(id, data) {
        const updates = {};
        if (data.title) updates.title = data.title.trim();
        if (data.description !== undefined) updates.description = data.description.trim();
        if (data.dueDate) updates.dueDate = data.dueDate;
        if (data.studentIds) updates.studentIds = data.studentIds;

        await SupabaseDB.updateHomework(id, updates);
        return await this.getById(id);
    },

    async delete(id) {
        await SupabaseDB.deleteHomework(id);
        return true;
    },

    async getCount() { const all = await this.getAll(); return all.length; },
    async getActiveCount() { const active = await this.getActive(); return active.length; }
};

// UI Fonksiyonları
async function renderHomeworkList() {
    const container = document.getElementById('homeworkListContainer');
    if (!container) return;

    const homeworks = await Homework.getAll();
    const students = await Students.getAll();

    if (homeworks.length === 0) {
        container.innerHTML = showEmptyState('📝', 'Henüz ödev yok', 'Yeni ödev eklemek için yukarıdaki butonu kullanın.');
        return;
    }

    let html = '<div class="homework-list">';
    homeworks.forEach(hw => {
        const studentNames = hw.studentIds.map(id => {
            const s = students.find(st => st.id === id);
            return s ? s.name : '';
        }).filter(n => n).join(', ');

        const isOverdue = hw.dueDate < getToday();
        html += `
            <div class="homework-card ${isOverdue ? 'overdue' : ''}">
                <div class="homework-header">
                    <h3>📝 ${hw.title}</h3>
                    <div class="flex items-center gap-2">
                        <span class="badge ${isOverdue ? 'badge-danger' : 'badge-success'}">
                            ${isOverdue ? '⏰ Süresi Geçti' : '✅ Aktif'}
                        </span>
                        <button class="btn btn-sm btn-ghost" onclick="editHomework('${hw.id}')">✏️</button>
                        <button class="btn btn-sm btn-ghost text-danger" onclick="deleteHomework('${hw.id}')">🗑️</button>
                    </div>
                </div>
                <p class="text-muted">${hw.description || 'Açıklama yok'}</p>
                <div class="homework-meta">
                    <span>📅 Son Tarih: ${formatDate(hw.dueDate)}</span>
                    <span>👥 ${hw.studentIds.length} öğrenci</span>
                </div>
                <p class="text-sm text-muted mt-2">📍 ${studentNames}</p>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

async function renderParentHomework() {
    const container = document.getElementById('parentHomeworkContainer');
    if (!container) return;

    const user = Auth.getCurrentUser();
    if (!user || user.type !== 'parent') return;

    const homeworks = await Homework.getForStudent(user.studentId);

    if (homeworks.length === 0) {
        container.innerHTML = showEmptyState('📝', 'Henüz ödev yok');
        return;
    }

    let html = '<div class="homework-list">';
    homeworks.forEach(hw => {
        const isOverdue = hw.dueDate < getToday();
        html += `
            <div class="homework-card ${isOverdue ? 'overdue' : ''}">
                <div class="homework-header">
                    <h3>📝 ${hw.title}</h3>
                    <span class="badge ${isOverdue ? 'badge-danger' : 'badge-success'}">
                        ${isOverdue ? '⏰ Süresi Geçti' : '✅ Aktif'}
                    </span>
                </div>
                <p>${hw.description || 'Açıklama yok'}</p>
                <div class="homework-meta">
                    <span>📅 Son Tarih: ${formatDate(hw.dueDate)}</span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

async function openAddHomeworkModal() {
    document.getElementById('homeworkModalTitle').textContent = '➕ Yeni Ödev';
    document.getElementById('homeworkForm').reset();
    document.getElementById('homeworkId').value = '';
    document.getElementById('homeworkDueDate').value = getToday();

    const students = await Students.getAll();
    document.getElementById('homeworkStudentCheckboxContainer').innerHTML = createStudentCheckboxList(students, []);
    showModal('homeworkModal');
}

// Öğrenci seçim bölümünü göster/gizle
async function toggleHomeworkStudentSelection() {
    const isGeneral = document.getElementById('isHomeworkGeneral').checked;
    const section = document.getElementById('homeworkStudentSelectionSection');

    if (isGeneral) {
        section.style.display = 'none';
    } else {
        section.style.display = 'block';
        // Öğrenci listesini yükle (henüz yüklenmemişse)
        const container = document.getElementById('homeworkStudentCheckboxContainer');
        if (container && container.innerHTML.trim() === '') {
            const students = await Students.getAll();
            container.innerHTML = createStudentCheckboxList(students, []);
        }
    }
}

async function editHomework(id) {
    const homework = await Homework.getById(id);
    if (!homework) return;

    document.getElementById('homeworkModalTitle').textContent = '✏️ Ödev Düzenle';
    document.getElementById('homeworkId').value = homework.id;
    document.getElementById('homeworkTitle').value = homework.title;
    document.getElementById('homeworkDescription').value = homework.description;
    document.getElementById('homeworkDueDate').value = homework.dueDate;

    const students = await Students.getAll();
    document.getElementById('homeworkStudentCheckboxContainer').innerHTML = createStudentCheckboxList(students, homework.studentIds);
    showModal('homeworkModal');
}

async function saveHomework(event) {
    event.preventDefault();

    const id = document.getElementById('homeworkId').value;
    const title = document.getElementById('homeworkTitle').value.trim();
    const description = document.getElementById('homeworkDescription').value.trim();
    const dueDate = document.getElementById('homeworkDueDate').value;

    if (!title || !dueDate) {
        showToast('Lütfen tüm alanları doldurun!', 'error');
        return;
    }

    // Tüm sınıfa mı yoksa seçili öğrencilere mi atanacak?
    const isGeneral = document.getElementById('isHomeworkGeneral').checked;
    let studentIds = [];

    if (isGeneral) {
        // Tüm öğrencileri al
        const allStudents = await Students.getAll();
        studentIds = allStudents.map(s => s.id);
    } else {
        // Seçili öğrencileri al
        const checkboxes = document.querySelectorAll('#homeworkStudentCheckboxContainer input[type="checkbox"]:checked');
        studentIds = Array.from(checkboxes).map(cb => cb.value);
    }

    if (studentIds.length === 0) {
        showToast('En az bir öğrenci seçmelisiniz!', 'error');
        return;
    }

    try {
        if (id) {
            await Homework.update(id, { title, description, dueDate, studentIds });
            showToast('Ödev güncellendi!');
        } else {
            await Homework.add({ title, description, dueDate, studentIds });
            showToast('Ödev oluşturuldu!');
        }

        hideModal('homeworkModal');
        await renderHomeworkList();
        await updateStats();
    } catch (error) {
        console.error('Error saving homework:', error);
        showToast('Bir hata oluştu!', 'error');
    }
}

async function deleteHomework(id) {
    const homework = await Homework.getById(id);
    if (!homework) return;

    const confirmed = await confirmAction(`"${homework.title}" ödevini silmek istediğinize emin misiniz?`);

    if (confirmed) {
        try {
            await Homework.delete(id);
            showToast('Ödev silindi!');
            await renderHomeworkList();
            await updateStats();
        } catch (error) {
            console.error('Error deleting homework:', error);
            showToast('Bir hata oluştu!', 'error');
        }
    }
}
