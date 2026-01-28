// =============================================
// SINIF YÖNETİM SİSTEMİ - DUYURU YÖNETİMİ (SUPABASE)
// =============================================

const Announcements = {
    // Tüm duyuruları getir
    async getAll() {
        return await SupabaseDB.getAnnouncements();
    },

    // Tek duyuru getir
    async getById(id) {
        const announcements = await this.getAll();
        return announcements.find(a => a.id === id);
    },

    // Genel duyuruları getir
    async getGeneral() {
        const all = await this.getAll();
        return all.filter(a => a.isGeneral);
    },

    // Öğrenciye özel duyuruları getir
    async getForStudent(studentId) {
        const all = await this.getAll();
        return all.filter(a =>
            a.isGeneral || (a.targetStudents && a.targetStudents.includes(studentId))
        );
    },

    // Duyuru ekle
    async add(data) {
        const newAnnouncement = {
            id: generateId(),
            title: data.title.trim(),
            content: data.content.trim(),
            date: getToday(),
            isGeneral: data.isGeneral || false,
            targetStudents: data.targetStudents || []
        };

        await SupabaseDB.addAnnouncement(newAnnouncement);
        return newAnnouncement;
    },

    // Duyuru güncelle
    async update(id, data) {
        const updates = {
            title: data.title ? data.title.trim() : undefined,
            content: data.content ? data.content.trim() : undefined,
            isGeneral: data.isGeneral,
            targetStudents: data.targetStudents
        };

        // Undefined değerleri temizle
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        await SupabaseDB.updateAnnouncement(id, updates);
        return await this.getById(id);
    },

    // Duyuru sil
    async delete(id) {
        await SupabaseDB.deleteAnnouncement(id);
        return true;
    },

    // Duyuru sayısını getir
    async getCount() {
        const all = await this.getAll();
        return all.length;
    }
};

// =============================================
// DUYURU UI FONKSİYONLARI
// =============================================

async function renderAnnouncementList() {
    const container = document.getElementById('announcementListContainer');
    if (!container) return;

    const announcements = await Announcements.getAll();
    const students = await Students.getAll();

    if (announcements.length === 0) {
        container.innerHTML = showEmptyState('📢', 'Henüz duyuru yok', 'Yeni duyuru eklemek için yukarıdaki butonu kullanın.');
        return;
    }

    let html = '<div class="announcement-list">';

    announcements.forEach(announcement => {
        const targetInfo = announcement.isGeneral
            ? '<span class="badge badge-primary">🌐 Genel Duyuru</span>'
            : `<span class="badge badge-warning">👤 Özel (${announcement.targetStudents?.length || 0} öğrenci)</span>`;

        // Hedef öğrencilerin isimlerini al
        let targetNames = '';
        if (!announcement.isGeneral && announcement.targetStudents && announcement.targetStudents.length > 0) {
            const names = announcement.targetStudents.map(id => {
                const student = students.find(s => s.id === id);
                return student ? student.name : '';
            }).filter(n => n);
            targetNames = `<p class="text-sm text-muted mt-2">📍 ${names.join(', ')}</p>`;
        }

        html += `
            <div class="announcement-card ${announcement.isGeneral ? '' : 'private'}">
                <div class="announcement-header">
                    <div>
                        <h3 class="announcement-title">
                            ${announcement.isGeneral ? '📢' : '💌'} ${announcement.title}
                        </h3>
                        ${targetInfo}
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="announcement-date">${formatDate(announcement.date)}</span>
                        <button class="btn btn-sm btn-ghost" onclick="editAnnouncement('${announcement.id}')" title="Düzenle">✏️</button>
                        <button class="btn btn-sm btn-ghost text-danger" onclick="deleteAnnouncement('${announcement.id}')" title="Sil">🗑️</button>
                    </div>
                </div>
                <p class="announcement-content">${announcement.content}</p>
                ${targetNames}
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Veli için duyuruları göster
async function renderParentAnnouncements() {
    const container = document.getElementById('parentAnnouncementsContainer');
    if (!container) return;

    const user = Auth.getCurrentUser();
    if (!user || user.type !== 'parent') return;

    const announcements = await Announcements.getForStudent(user.studentId);

    if (announcements.length === 0) {
        container.innerHTML = showEmptyState('📢', 'Henüz duyuru yok');
        return;
    }

    let html = '<div class="announcement-list">';

    announcements.forEach(announcement => {
        html += `
            <div class="announcement-card ${announcement.isGeneral ? '' : 'private'}">
                <div class="announcement-header">
                    <h3 class="announcement-title">
                        ${announcement.isGeneral ? '📢' : '💌'} ${announcement.title}
                    </h3>
                    <span class="announcement-date">${formatDate(announcement.date)}</span>
                </div>
                <p class="announcement-content">${announcement.content}</p>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Duyuru ekleme modalını aç
async function openAddAnnouncementModal() {
    document.getElementById('announcementModalTitle').textContent = '➕ Yeni Duyuru';
    document.getElementById('announcementForm').reset();
    document.getElementById('announcementId').value = '';
    document.getElementById('isGeneral').checked = true;
    toggleStudentSelection();

    // Öğrenci listesini yükle
    await loadStudentCheckboxes();

    showModal('announcementModal');
}

// Duyuru düzenleme modalını aç
async function editAnnouncement(id) {
    const announcement = await Announcements.getById(id);
    if (!announcement) return;

    document.getElementById('announcementModalTitle').textContent = '✏️ Duyuru Düzenle';
    document.getElementById('announcementId').value = announcement.id;
    document.getElementById('announcementTitle').value = announcement.title;
    document.getElementById('announcementContent').value = announcement.content;
    document.getElementById('isGeneral').checked = announcement.isGeneral;

    await loadStudentCheckboxes(announcement.targetStudents);
    toggleStudentSelection();

    showModal('announcementModal');
}

// Öğrenci checkbox listesini yükle
async function loadStudentCheckboxes(selectedIds = []) {
    const container = document.getElementById('studentCheckboxContainer');
    if (!container) return;

    const students = await Students.getAll();
    container.innerHTML = createStudentCheckboxList(students, selectedIds);
}

// Genel/Özel duyuru arasında geçiş
function toggleStudentSelection() {
    const isGeneral = document.getElementById('isGeneral').checked;
    const container = document.getElementById('studentSelectionSection');

    if (container) {
        container.style.display = isGeneral ? 'none' : 'block';
    }
}

// Duyuru formunu kaydet
async function saveAnnouncement(event) {
    event.preventDefault();

    const id = document.getElementById('announcementId').value;
    const title = document.getElementById('announcementTitle').value.trim();
    const content = document.getElementById('announcementContent').value.trim();
    const isGeneral = document.getElementById('isGeneral').checked;

    if (!title || !content) {
        showToast('Lütfen tüm alanları doldurun!', 'error');
        return;
    }

    // Seçili öğrencileri al
    let targetStudents = [];
    if (!isGeneral) {
        const checkboxes = document.querySelectorAll('#studentCheckboxContainer input[type="checkbox"]:checked');
        targetStudents = Array.from(checkboxes).map(cb => cb.value);

        if (targetStudents.length === 0) {
            showToast('Özel duyuru için en az bir öğrenci seçmelisiniz!', 'error');
            return;
        }
    }

    try {
        if (id) {
            await Announcements.update(id, { title, content, isGeneral, targetStudents });
            showToast('Duyuru güncellendi!');
        } else {
            await Announcements.add({ title, content, isGeneral, targetStudents });
            showToast('Duyuru oluşturuldu!');
        }

        hideModal('announcementModal');
        await renderAnnouncementList();
        await updateStats();
    } catch (error) {
        console.error('Error saving announcement:', error);
        showToast('Bir hata oluştu!', 'error');
    }
}

// Duyuru sil
async function deleteAnnouncement(id) {
    const announcement = await Announcements.getById(id);
    if (!announcement) return;

    const confirmed = await confirmAction(`"${announcement.title}" duyurusunu silmek istediğinize emin misiniz?`);

    if (confirmed) {
        try {
            await Announcements.delete(id);
            showToast('Duyuru silindi!');
            await renderAnnouncementList();
            await updateStats();
        } catch (error) {
            console.error('Error deleting announcement:', error);
            showToast('Bir hata oluştu!', 'error');
        }
    }
}
