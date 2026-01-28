// =============================================
// SINIF YÖNETİM SİSTEMİ - ÖĞRENCİ YÖNETİMİ (SUPABASE)
// =============================================

const Students = {
    // Tüm öğrencileri getir
    async getAll() {
        return await SupabaseDB.getStudents();
    },

    // Tek öğrenci getir
    async getById(id) {
        const students = await this.getAll();
        return students.find(s => s.id === id);
    },

    // Öğrenci ekle
    async add(data) {
        const newStudent = {
            id: generateId(),
            name: data.name.trim(),
            parentPassword: data.parentPassword || generateRandomPassword()
        };

        await SupabaseDB.addStudent(newStudent);
        return newStudent;
    },

    // Öğrenci güncelle
    async update(id, data) {
        const updates = {
            name: data.name ? data.name.trim() : undefined,
            parentPassword: data.parentPassword
        };

        // Undefined değerleri temizle
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        await SupabaseDB.updateStudent(id, updates);
        return await this.getById(id);
    },

    // Öğrenci sil
    async delete(id) {
        await SupabaseDB.deleteStudent(id);
        return true;
    },

    // Toplam öğrenci sayısı
    async getCount() {
        const students = await this.getAll();
        return students.length;
    }
};

// Rastgele şifre oluştur
function generateRandomPassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 6; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// =============================================
// ÖĞRENCİ UI FONKSİYONLARI
// =============================================

async function renderStudentList() {
    const container = document.getElementById('studentListContainer');
    if (!container) return;

    const students = await Students.getAll();

    if (students.length === 0) {
        container.innerHTML = showEmptyState('👥', 'Henüz öğrenci yok', 'Öğrenci eklemek için yukarıdaki butonu kullanın.');
        return;
    }

    let html = '<div class="table-container"><table class="table"><thead><tr><th>Öğrenci Adı</th><th>Veli Şifresi</th><th>İşlemler</th></tr></thead><tbody>';

    students.forEach(student => {
        html += `
            <tr>
                <td><strong>${student.name}</strong></td>
                <td><code>${student.parentPassword}</code></td>
                <td>
                    <button class="btn btn-sm btn-ghost" onclick="editStudent('${student.id}')">✏️</button>
                    <button class="btn btn-sm btn-ghost text-danger" onclick="deleteStudent('${student.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function openAddStudentModal() {
    document.getElementById('studentModalTitle').textContent = '➕ Yeni Öğrenci Ekle';
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('parentPassword').value = generateRandomPassword();
    showModal('studentModal');
}

async function editStudent(id) {
    const student = await Students.getById(id);
    if (!student) return;

    document.getElementById('studentModalTitle').textContent = '✏️ Öğrenci Düzenle';
    document.getElementById('studentId').value = student.id;
    document.getElementById('studentName').value = student.name;
    document.getElementById('parentPassword').value = student.parentPassword;
    showModal('studentModal');
}

async function saveStudent(event) {
    event.preventDefault();

    const id = document.getElementById('studentId').value;
    const name = document.getElementById('studentName').value.trim();
    const parentPassword = document.getElementById('parentPassword').value.trim();

    if (!name) {
        showToast('Lütfen öğrenci adı girin!', 'error');
        return;
    }

    try {
        if (id) {
            await Students.update(id, { name, parentPassword });
            showToast('Öğrenci güncellendi!');
        } else {
            await Students.add({ name, parentPassword });
            showToast('Öğrenci eklendi!');
        }

        hideModal('studentModal');
        await renderStudentList();
        await updateStats();
    } catch (error) {
        console.error('Error saving student:', error);
        showToast('Bir hata oluştu!', 'error');
    }
}

async function deleteStudent(id) {
    const student = await Students.getById(id);
    if (!student) return;

    const confirmed = await confirmAction(`"${student.name}" öğrencisini silmek istediğinize emin misiniz?`);

    if (confirmed) {
        try {
            await Students.delete(id);
            showToast('Öğrenci silindi!');
            await renderStudentList();
            await updateStats();
        } catch (error) {
            console.error('Error deleting student:', error);
            showToast('Bir hata oluştu!', 'error');
        }
    }
}
