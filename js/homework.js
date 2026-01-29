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
            subject: data.subject || '',
            fileData: data.fileData || null,
            fileName: data.fileName || '',
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
        if (data.subject !== undefined) updates.subject = data.subject;
        if (data.fileData !== undefined) updates.fileData = data.fileData;
        if (data.fileName !== undefined) updates.fileName = data.fileName;
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

    // Ders bilgilerini al
    const allSubjects = Curriculum.getAllSubjects();

    let html = '<div class="homework-list">';
    homeworks.forEach(hw => {
        const studentNames = hw.studentIds.map(id => {
            const s = students.find(st => st.id === id);
            return s ? s.name : '';
        }).filter(n => n).join(', ');

        // Ders bilgisini bul
        const subjectInfo = hw.subject ? allSubjects.find(s => s.key === hw.subject) : null;
        const subjectDisplay = subjectInfo ? `${subjectInfo.icon} ${subjectInfo.name}` : '';

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
                ${subjectDisplay ? `<p class="text-primary"><strong>${subjectDisplay}</strong></p>` : ''}
                <p class="text-muted">${hw.description || 'Açıklama yok'}</p>
                ${hw.fileName ? `
                    <div class="homework-file" style="margin: 8px 0; padding: 8px; background: var(--bg-secondary); border-radius: 8px; display: flex; align-items: center; gap: 8px;">
                        <span>${hw.fileName.endsWith('.pdf') ? '📄' : '📷'}</span>
                        <a href="${hw.fileData}" download="${hw.fileName}" style="color: var(--primary); text-decoration: underline;">${hw.fileName}</a>
                    </div>
                ` : ''}
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

    // Ders bilgilerini al
    const allSubjects = Curriculum.getAllSubjects();

    let html = '<div class="homework-list">';
    homeworks.forEach(hw => {
        const isOverdue = hw.dueDate < getToday();

        // Ders bilgisini bul
        const subjectInfo = hw.subject ? allSubjects.find(s => s.key === hw.subject) : null;
        const subjectDisplay = subjectInfo ? `${subjectInfo.icon} ${subjectInfo.name}` : '';

        html += `
            <div class="homework-card ${isOverdue ? 'overdue' : ''}">
                <div class="homework-header">
                    <h3>📝 ${hw.title}</h3>
                    <span class="badge ${isOverdue ? 'badge-danger' : 'badge-success'}">
                        ${isOverdue ? '⏰ Süresi Geçti' : '✅ Aktif'}
                    </span>
                </div>
                ${subjectDisplay ? `<p class="text-primary"><strong>${subjectDisplay}</strong></p>` : ''}
                <p>${hw.description || 'Açıklama yok'}</p>
                ${hw.fileName && hw.fileData ? `
                    <div class="homework-file" style="margin: 8px 0; padding: 12px; background: var(--bg-secondary); border-radius: 8px; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5rem;">${hw.fileName.endsWith('.pdf') ? '📄' : '📷'}</span>
                        <a href="${hw.fileData}" download="${hw.fileName}" class="btn btn-sm btn-primary">
                            📥 ${hw.fileName} - İndir
                        </a>
                    </div>
                ` : ''}
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

    // Ders listesini doldur
    const subjectSelect = document.getElementById('homeworkSubject');
    if (subjectSelect) {
        subjectSelect.innerHTML = '<option value="">-- Ders Seçin --</option>';
        const subjects = Curriculum.getAllSubjects();
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.key;
            option.textContent = `${subject.icon} ${subject.name}`;
            subjectSelect.appendChild(option);
        });
    }

    // Dosya önizleme alanını temizle
    const filePreview = document.getElementById('homeworkFilePreview');
    if (filePreview) {
        filePreview.innerHTML = '';
    }

    // Dosya input'unu temizle
    const fileInput = document.getElementById('homeworkFile');
    if (fileInput) {
        fileInput.value = '';
    }

    const students = await Students.getAll();
    document.getElementById('homeworkStudentCheckboxContainer').innerHTML = createStudentCheckboxList(students, []);
    showModal('homeworkModal');
}

// Dosya önizleme fonksiyonu
function setupHomeworkFilePreview() {
    const fileInput = document.getElementById('homeworkFile');
    const preview = document.getElementById('homeworkFilePreview');

    if (fileInput && preview) {
        fileInput.addEventListener('change', function (e) {
            preview.innerHTML = '';
            const file = e.target.files[0];

            if (file) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        preview.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--bg-secondary); border-radius: 8px;">
                                <img src="${e.target.result}" style="max-width: 100px; max-height: 100px; border-radius: 4px;">
                                <span>📷 ${file.name}</span>
                            </div>
                        `;
                    };
                    reader.readAsDataURL(file);
                } else if (file.type === 'application/pdf') {
                    preview.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--bg-secondary); border-radius: 8px;">
                            <span style="font-size: 2rem;">📄</span>
                            <span>${file.name}</span>
                        </div>
                    `;
                }
            }
        });
    }
}

// Sayfa yüklendiğinde dosya önizleme eventini ayarla
document.addEventListener('DOMContentLoaded', setupHomeworkFilePreview);

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
    const subject = document.getElementById('homeworkSubject').value;
    const fileInput = document.getElementById('homeworkFile');

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

    // Dosya verisi hazırla
    let fileData = null;
    let fileName = '';

    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileName = file.name;
        try {
            fileData = await imageToBase64(file);
        } catch (err) {
            console.error('File read error:', err);
            showToast('Dosya okunamadı: ' + err.message, 'error');
            return;
        }
    }

    try {
        if (id) {
            await Homework.update(id, { title, description, subject, fileData, fileName, dueDate, studentIds });
            showToast('Ödev güncellendi!');
        } else {
            await Homework.add({ title, description, subject, fileData, fileName, dueDate, studentIds });
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
