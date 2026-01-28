// =============================================
// SINIF YÖNETİM SİSTEMİ - ÖĞRENCİ YÖNETİMİ
// =============================================

const Students = {
    // Tüm öğrencileri getir
    getAll() {
        return Storage.get(CONFIG.STORAGE_KEYS.STUDENTS) || [];
    },

    // Tek öğrenci getir
    getById(id) {
        const students = this.getAll();
        return students.find(s => s.id === id);
    },

    // Öğrenci ekle
    add(data) {
        const students = this.getAll();

        const newStudent = {
            id: generateId(),
            name: data.name.trim(),
            parentPassword: data.parentPassword || this.generatePassword(),
            createdAt: getToday(),
            notes: data.notes || ''
        };

        students.push(newStudent);
        Storage.set(CONFIG.STORAGE_KEYS.STUDENTS, students);

        return newStudent;
    },

    // Öğrenci güncelle
    update(id, data) {
        const students = this.getAll();
        const index = students.findIndex(s => s.id === id);

        if (index === -1) return null;

        students[index] = {
            ...students[index],
            name: data.name ? data.name.trim() : students[index].name,
            parentPassword: data.parentPassword || students[index].parentPassword,
            notes: data.notes !== undefined ? data.notes : students[index].notes
        };

        Storage.set(CONFIG.STORAGE_KEYS.STUDENTS, students);
        return students[index];
    },

    // Öğrenci sil
    delete(id) {
        const students = this.getAll();
        const filtered = students.filter(s => s.id !== id);

        if (filtered.length === students.length) return false;

        Storage.set(CONFIG.STORAGE_KEYS.STUDENTS, filtered);

        // İlişkili verileri de temizle
        this.cleanupRelatedData(id);

        return true;
    },

    // Otomatik şifre oluştur
    generatePassword() {
        const chars = '0123456789';
        let password = '';
        for (let i = 0; i < 4; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return 'veli' + password;
    },

    // İlişkili verileri temizle
    cleanupRelatedData(studentId) {
        // Portfolyo öğelerini temizle
        const portfolio = Storage.get(CONFIG.STORAGE_KEYS.PORTFOLIO) || [];
        const filteredPortfolio = portfolio.filter(p => p.studentId !== studentId);
        Storage.set(CONFIG.STORAGE_KEYS.PORTFOLIO, filteredPortfolio);

        // Değerlendirmeleri temizle
        const evaluations = Storage.get(CONFIG.STORAGE_KEYS.EVALUATIONS) || [];
        const filteredEvaluations = evaluations.filter(e => e.studentId !== studentId);
        Storage.set(CONFIG.STORAGE_KEYS.EVALUATIONS, filteredEvaluations);

        // Duyurulardaki öğrenci referanslarını temizle
        const announcements = Storage.get(CONFIG.STORAGE_KEYS.ANNOUNCEMENTS) || [];
        announcements.forEach(a => {
            if (a.targetStudents && a.targetStudents.includes(studentId)) {
                a.targetStudents = a.targetStudents.filter(id => id !== studentId);
            }
        });
        Storage.set(CONFIG.STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    },

    // Öğrenci sayısını getir
    getCount() {
        return this.getAll().length;
    }
};

// =============================================
// ÖĞRENCİ LİSTESİ UI FONKSİYONLARI
// =============================================

function renderStudentList() {
    const container = document.getElementById('studentListContainer');
    if (!container) return;

    const students = Students.getAll();

    if (students.length === 0) {
        container.innerHTML = showEmptyState('👥', 'Henüz öğrenci eklenmemiş', 'Yeni öğrenci eklemek için yukarıdaki butonu kullanın.');
        return;
    }

    let html = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Öğrenci Adı</th>
                        <th>Veli Şifresi</th>
                        <th>Eklenme Tarihi</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
    `;

    students.forEach(student => {
        html += `
            <tr>
                <td>
                    <div class="flex items-center gap-2">
                        <span class="emoji">👤</span>
                        <strong>${student.name}</strong>
                    </div>
                </td>
                <td>
                    <code class="badge badge-primary">${student.parentPassword}</code>
                </td>
                <td>${formatDate(student.createdAt)}</td>
                <td>
                    <div class="flex gap-2">
                        <button class="btn btn-sm btn-ghost" onclick="editStudent('${student.id}')" title="Düzenle">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-ghost text-danger" onclick="deleteStudent('${student.id}')" title="Sil">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// Öğrenci ekleme modalını aç
function openAddStudentModal() {
    document.getElementById('studentModalTitle').textContent = '➕ Yeni Öğrenci Ekle';
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('parentPassword').placeholder = 'Boş bırakılırsa otomatik oluşturulur';
    showModal('studentModal');
}

// Öğrenci düzenleme modalını aç
function editStudent(id) {
    const student = Students.getById(id);
    if (!student) return;

    document.getElementById('studentModalTitle').textContent = '✏️ Öğrenci Düzenle';
    document.getElementById('studentId').value = student.id;
    document.getElementById('studentName').value = student.name;
    document.getElementById('parentPassword').value = student.parentPassword;
    document.getElementById('studentNotes').value = student.notes || '';

    showModal('studentModal');
}

// Öğrenci formunu kaydet
function saveStudent(event) {
    event.preventDefault();

    const id = document.getElementById('studentId').value;
    const name = document.getElementById('studentName').value.trim();
    const parentPassword = document.getElementById('parentPassword').value.trim();
    const notes = document.getElementById('studentNotes').value.trim();

    if (!name) {
        showToast('Öğrenci adı boş olamaz!', 'error');
        return;
    }

    if (id) {
        // Güncelle
        Students.update(id, { name, parentPassword, notes });
        showToast('Öğrenci bilgileri güncellendi!');
    } else {
        // Yeni ekle
        const student = Students.add({ name, parentPassword, notes });
        showToast(`${student.name} başarıyla eklendi! Veli şifresi: ${student.parentPassword}`);
    }

    hideModal('studentModal');
    renderStudentList();
    updateStats();
}

// Öğrenci sil
async function deleteStudent(id) {
    const student = Students.getById(id);
    if (!student) return;

    const confirmed = await confirmAction(`"${student.name}" adlı öğrenciyi silmek istediğinize emin misiniz?\n\nBu işlem öğrenciye ait tüm verileri (portfolyo, değerlendirmeler) de silecektir.`);

    if (confirmed) {
        Students.delete(id);
        showToast('Öğrenci silindi!');
        renderStudentList();
        updateStats();
    }
}
