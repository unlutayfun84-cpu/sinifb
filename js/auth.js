// =============================================
// SINIF YÖNETİM SİSTEMİ - KİMLİK DOĞRULAMA
// =============================================

const Auth = {
    // Admin girişi
    async loginAsAdmin(password) {
        const adminPassword = await SupabaseDB.getAdminPassword() || getAdminPassword();

        if (password === adminPassword) {
            const user = {
                type: 'admin',
                name: 'Öğretmen',
                loginTime: new Date().toISOString()
            };
            Storage.set(CONFIG.STORAGE_KEYS.CURRENT_USER, user);
            return { success: true, user };
        }
        return { success: false, message: 'Şifre hatalı!' };
    },

    // Admin şifresini güncelle
    async updateAdminPassword(oldPassword, newPassword) {
        const currentPassword = await SupabaseDB.getAdminPassword() || getAdminPassword();

        if (oldPassword !== currentPassword) {
            return { success: false, message: 'Mevcut şifre hatalı!' };
        }

        if (newPassword.length < 4) {
            return { success: false, message: 'Yeni şifre en az 4 karakter olmalıdır!' };
        }

        await SupabaseDB.setAdminPassword(newPassword);
        Storage.set(CONFIG.STORAGE_KEYS.ADMIN_PASSWORD, newPassword);
        return { success: true, message: 'Şifre başarıyla güncellendi!' };
    },

    // Veli girişi
    async loginAsParent(studentId, password) {
        const students = await Students.getAll();
        const student = students.find(s => s.id === studentId);

        if (!student) {
            return { success: false, message: 'Öğrenci bulunamadı!' };
        }

        if (student.parentPassword !== password) {
            return { success: false, message: 'Veli şifresi hatalı!' };
        }

        const user = {
            type: 'parent',
            name: student.name + ' Velisi',
            studentId: student.id,
            studentName: student.name,
            loginTime: new Date().toISOString()
        };
        Storage.set(CONFIG.STORAGE_KEYS.CURRENT_USER, user);
        return { success: true, user };
    },

    // Çıkış
    logout() {
        Storage.remove(CONFIG.STORAGE_KEYS.CURRENT_USER);
        window.location.href = 'index.html';
    },

    // Aktif kullanıcıyı al
    getCurrentUser() {
        return Storage.get(CONFIG.STORAGE_KEYS.CURRENT_USER);
    },

    // Admin mi kontrol et
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.type === 'admin';
    },

    // Veli mi kontrol et
    isParent() {
        const user = this.getCurrentUser();
        return user && user.type === 'parent';
    },

    // Giriş yapılmış mı kontrol et
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    // Sayfa erişim kontrolü
    requireAuth(requiredType = null) {
        const user = this.getCurrentUser();

        if (!user) {
            window.location.href = 'index.html';
            return false;
        }

        if (requiredType && user.type !== requiredType) {
            window.location.href = 'index.html';
            return false;
        }

        return true;
    }
};

// =============================================
// GİRİŞ SAYFASI FONKSİYONLARI
// =============================================

// Tab değiştirme
function switchLoginTab(tabName) {
    // Tab butonlarını güncelle
    document.querySelectorAll('.login-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Form görünürlüğünü güncelle
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tabName}Form`).classList.add('active');
}

// Admin giriş formu işle
async function handleAdminLogin(event) {
    event.preventDefault();

    const password = document.getElementById('adminPassword').value;
    const result = await Auth.loginAsAdmin(password);

    if (result.success) {
        showToast('Hoş geldiniz, Öğretmen!');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 500);
    } else {
        showToast(result.message, 'error');
        document.getElementById('adminPassword').value = '';
    }
}

// Veli giriş formu işle
async function handleParentLogin(event) {
    event.preventDefault();

    const studentId = document.getElementById('studentSelect').value;
    const password = document.getElementById('parentPassword').value;

    if (!studentId) {
        showToast('Lütfen öğrenci seçin!', 'error');
        return;
    }

    const result = await Auth.loginAsParent(studentId, password);

    if (result.success) {
        showToast('Hoş geldiniz!');
        setTimeout(() => {
            window.location.href = 'parent.html';
        }, 500);
    } else {
        showToast(result.message, 'error');
        document.getElementById('parentPassword').value = '';
    }
}

// Öğrenci listesini yükle (veli girişi için)
async function loadStudentOptions() {
    const select = document.getElementById('studentSelect');
    if (!select) return;

    const students = await Students.getAll();

    select.innerHTML = '<option value="">-- Öğrenci Seçin --</option>';

    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        select.appendChild(option);
    });
}

// Sayfa yüklendiğinde öğrenci listesini yükle
document.addEventListener('DOMContentLoaded', () => {
    const studentSelect = document.getElementById('studentSelect');
    if (studentSelect) {
        loadStudentOptions();
    }
});
