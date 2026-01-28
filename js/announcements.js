// =============================================
// SINIF YÖNETİM SİSTEMİ - DUYURU YÖNETİMİ
// =============================================

const Announcements = {
    // Tüm duyuruları getir
    getAll() {
        return Storage.get(CONFIG.STORAGE_KEYS.ANNOUNCEMENTS) || [];
    },

    // Tek duyuru getir
    getById(id) {
        const announcements = this.getAll();
        return announcements.find(a => a.id === id);
    },

    // Genel duyuruları getir
    getGeneral() {
        return this.getAll().filter(a => a.isGeneral);
    },

    // Öğrenciye özel duyuruları getir
    getForStudent(studentId) {
        return this.getAll().filter(a =>
            a.isGeneral || (a.targetStudents && a.targetStudents.includes(studentId))
        );
    },

    // Duyuru ekle
    add(data) {
        const announcements = this.getAll();

        const newAnnouncement = {
            id: generateId(),
            title: data.title.trim(),
            content: data.content.trim(),
            isGeneral: data.isGeneral || false,
            targetStudents: data.targetStudents || [],
            createdAt: getToday(),
            createdTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };

        announcements.unshift(newAnnouncement); // Yeni duyuruları başa ekle
        Storage.set(CONFIG.STORAGE_KEYS.ANNOUNCEMENTS, announcements);

        return newAnnouncement;
    },

    // Duyuru güncelle
    update(id, data) {
        const announcements = this.getAll();
        const index = announcements.findIndex(a => a.id === id);

        if (index === -1) return null;

        announcements[index] = {
            ...announcements[index],
            title: data.title ? data.title.trim() : announcements[index].title,
            content: data.content ? data.content.trim() : announcements[index].content,
            isGeneral: data.isGeneral !== undefined ? data.isGeneral : announcements[index].isGeneral,
            targetStudents: data.targetStudents || announcements[index].targetStudents
        };

        Storage.set(CONFIG.STORAGE_KEYS.ANNOUNCEMENTS, announcements);
        return announcements[index];
    },

    // Duyuru sil
    delete(id) {
        const announcements = this.getAll();
        const filtered = announcements.filter(a => a.id !== id);

        if (filtered.length === announcements.length) return false;

        Storage.set(CONFIG.STORAGE_KEYS.ANNOUNCEMENTS, filtered);
        return true;
    },

    // Duyuru sayısını getir
    getCount() {
        return this.getAll().length;
    }
};

// =============================================
// DUYURU UI FONKSİYONLARI
// =============================================

function renderAnnouncementList() {
    const container = document.getElementById('announcementListContainer');
    if (!container) return;

    const announcements = Announcements.getAll();
    const students = Students.getAll();

    if (announcements.length === 0) {
        container.innerHTML = showEmptyState('📢', 'Henüz duyuru yok', 'Yeni duyuru eklemek için yukarıdaki butonu kullanın.');
        return;
    }

    let html = '<div class="announcement-list">';

    announcements.forEach(announcement => {
        const targetInfo = announcement.isGeneral
            ? '<span class="badge badge-primary">🌐 Genel Duyuru</span>'
            : `<span class="badge badge-warning">👤 Özel (${announcement.targetStudents.length} öğrenci)</span>`;

        // Hedef öğrencilerin isimlerini al
        let targetNames = '';
        if (!announcement.isGeneral && announcement.targetStudents.length > 0) {
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
                        <span class="announcement-date">${formatDate(announcement.createdAt)} ${announcement.createdTime}</span>
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
function renderParentAnnouncements() {
    const container = document.getElementById('parentAnnouncementsContainer');
    if (!container) return;

    const user = Auth.getCurrentUser();
    if (!user || user.type !== 'parent') return;

    const announcements = Announcements.getForStudent(user.studentId);

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
                    <span class="announcement-date">${formatDate(announcement.createdAt)}</span>
                </div>
                <p class="announcement-content">${announcement.content}</p>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Duyuru ekleme modalını aç
function openAddAnnouncementModal() {
    document.getElementById('announcementModalTitle').textContent = '➕ Yeni Duyuru';
    document.getElementById('announcementForm').reset();
    document.getElementById('announcementId').value = '';
    document.getElementById('isGeneral').checked = true;
    toggleStudentSelection();

    // Öğrenci listesini yükle
    loadStudentCheckboxes();

    showModal('announcementModal');
}

// Duyuru düzenleme modalını aç
function editAnnouncement(id) {
    const announcement = Announcements.getById(id);
    if (!announcement) return;

    document.getElementById('announcementModalTitle').textContent = '✏️ Duyuru Düzenle';
    document.getElementById('announcementId').value = announcement.id;
    document.getElementById('announcementTitle').value = announcement.title;
    document.getElementById('announcementContent').value = announcement.content;
    document.getElementById('isGeneral').checked = announcement.isGeneral;

    loadStudentCheckboxes(announcement.targetStudents);
    toggleStudentSelection();

    showModal('announcementModal');
}

// Öğrenci checkbox listesini yükle
function loadStudentCheckboxes(selectedIds = []) {
    const container = document.getElementById('studentCheckboxContainer');
    if (!container) return;

    const students = Students.getAll();
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
function saveAnnouncement(event) {
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

    if (id) {
        Announcements.update(id, { title, content, isGeneral, targetStudents });
        showToast('Duyuru güncellendi!');
    } else {
        Announcements.add({ title, content, isGeneral, targetStudents });
        showToast('Duyuru oluşturuldu!');
    }

    hideModal('announcementModal');
    renderAnnouncementList();
    updateStats();
}

// Duyuru sil
async function deleteAnnouncement(id) {
    const announcement = Announcements.getById(id);
    if (!announcement) return;

    const confirmed = await confirmAction(`"${announcement.title}" duyurusunu silmek istediğinize emin misiniz?`);

    if (confirmed) {
        Announcements.delete(id);
        showToast('Duyuru silindi!');
        renderAnnouncementList();
        updateStats();
    }
}
