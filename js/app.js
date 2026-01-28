// =============================================
// SINIF YÖNETİM SİSTEMİ - ANA UYGULAMA
// =============================================

// Varsayılan Ayarlar
const CONFIG = {
    DEFAULT_ADMIN_PASSWORD: 'ogretmen2026',
    STORAGE_KEYS: {
        ADMIN_PASSWORD: 'sinif_admin_sifre',
        STUDENTS: 'sinif_ogrenciler',
        ANNOUNCEMENTS: 'sinif_duyurular',
        PORTFOLIO: 'sinif_portfolyo',
        HOMEWORK: 'sinif_odevler',
        EVALUATIONS: 'sinif_degerlendirmeler',
        WEEKLY_EVALUATIONS: 'sinif_haftalik_degerlendirme',
        CURRENT_USER: 'sinif_aktif_kullanici'
    },
    MAX_IMAGE_SIZE: 10 * 1024 * 1024 // 10MB
};

// Mevcut admin şifresini getir
function getAdminPassword() {
    return Storage.get(CONFIG.STORAGE_KEYS.ADMIN_PASSWORD) || CONFIG.DEFAULT_ADMIN_PASSWORD;
}

// =============================================
// STORAGE YARDIMCI FONKSİYONLARI
// =============================================

const Storage = {
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clear() {
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};

// =============================================
// YARDIMCI FONKSİYONLAR
// =============================================

// Benzersiz ID oluştur
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Tarihi formatla
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
}

// Bugünün tarihini al
function getToday() {
    return new Date().toISOString().split('T')[0];
}

// Toast bildirimi göster
function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Modal göster/gizle
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Tüm modalleri kapat
function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

// Modal dışına tıklama ile kapatma
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeAllModals();
    }
});

// ESC tuşu ile modal kapatma
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

// Onay dialogu
function confirmAction(message) {
    return new Promise((resolve) => {
        const confirmed = confirm(message);
        resolve(confirmed);
    });
}

// Resmi Base64'e çevir
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        if (file.size > CONFIG.MAX_IMAGE_SIZE) {
            reject(new Error('Dosya boyutu çok büyük! Maksimum 10MB olmalıdır.'));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Yıldız rating HTML'i oluştur
function createStarRating(currentRating = 0, editable = false, inputName = '') {
    let html = '<div class="star-rating"' + (inputName ? ` data-input="${inputName}"` : '') + '>';

    for (let i = 1; i <= 5; i++) {
        const activeClass = i <= currentRating ? 'active' : '';
        const editable_attr = editable ? 'onclick="handleStarClick(this, ' + i + ')" style="cursor:pointer"' : '';
        // Emoji yerine renklendirilebilir karakter kullanıyoruz (★)
        html += `<span class="star ${activeClass}" data-value="${i}" ${editable_attr}>★</span>`;
    }

    html += '</div>';
    return html;
}

// Yıldız tıklama işleyicisi
function handleStarClick(star, value) {
    const container = star.closest('.star-rating');
    const inputName = container.dataset.input;

    // Tüm yıldızları güncelle
    container.querySelectorAll('.star').forEach((s, index) => {
        if (index < value) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });

    // Hidden input'u güncelle (varsa)
    if (inputName) {
        // Form içindeki inputu bul (daha spesifik bir arama)
        const form = container.closest('form');
        const input = form ? form.querySelector(`input[name="${inputName}"]`) : document.querySelector(`input[name="${inputName}"]`);
        if (input) {
            input.value = value;
            // Native change event tetikle (ihtiyaç duyulursa)
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}

// Öğrenci seçim listesi oluştur
function createStudentCheckboxList(students, selectedIds = []) {
    if (!students || students.length === 0) {
        return '<p class="text-muted">Henüz öğrenci eklenmemiş.</p>';
    }

    let html = '<div class="student-checkbox-list">';

    students.forEach(student => {
        const checked = selectedIds.includes(student.id) ? 'checked' : '';
        html += `
            <label class="form-checkbox">
                <input type="checkbox" name="students" value="${student.id}" ${checked}>
                <span>${student.name}</span>
            </label>
        `;
    });

    html += '</div>';
    return html;
}

// Sayfa yenileme olmadan içerik güncelleme
function updateContent(containerId, html) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = html;
    }
}

// Boş durum göster
function showEmptyState(emoji, title, description = '') {
    return `
        <div class="empty-state">
            <div class="emoji">${emoji}</div>
            <h3>${title}</h3>
            ${description ? `<p>${description}</p>` : ''}
        </div>
    `;
}

// =============================================
// VERİ BAŞLATMA
// =============================================

function initializeData() {
    // Öğrenciler yoksa boş array oluştur
    if (!Storage.get(CONFIG.STORAGE_KEYS.STUDENTS)) {
        Storage.set(CONFIG.STORAGE_KEYS.STUDENTS, []);
    }

    // Duyurular yoksa boş array oluştur
    if (!Storage.get(CONFIG.STORAGE_KEYS.ANNOUNCEMENTS)) {
        Storage.set(CONFIG.STORAGE_KEYS.ANNOUNCEMENTS, []);
    }

    // Portfolyo yoksa boş array oluştur
    if (!Storage.get(CONFIG.STORAGE_KEYS.PORTFOLIO)) {
        Storage.set(CONFIG.STORAGE_KEYS.PORTFOLIO, []);
    }

    // Ödevler yoksa boş array oluştur
    if (!Storage.get(CONFIG.STORAGE_KEYS.HOMEWORK)) {
        Storage.set(CONFIG.STORAGE_KEYS.HOMEWORK, []);
    }

    // Değerlendirmeler yoksa boş array oluştur
    if (!Storage.get(CONFIG.STORAGE_KEYS.EVALUATIONS)) {
        Storage.set(CONFIG.STORAGE_KEYS.EVALUATIONS, []);
    }

    // Haftalık Değerlendirmeler yoksa boş array oluştur
    if (!Storage.get(CONFIG.STORAGE_KEYS.WEEKLY_EVALUATIONS)) {
        Storage.set(CONFIG.STORAGE_KEYS.WEEKLY_EVALUATIONS, []);
    }
}

// Sayfa yüklendiğinde veriyi başlat
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
});

// =============================================
// DATA EXPORT/IMPORT (Yedekleme)
// =============================================

function exportData() {
    const data = {
        students: Storage.get(CONFIG.STORAGE_KEYS.STUDENTS),
        announcements: Storage.get(CONFIG.STORAGE_KEYS.ANNOUNCEMENTS),
        portfolio: Storage.get(CONFIG.STORAGE_KEYS.PORTFOLIO),
        homework: Storage.get(CONFIG.STORAGE_KEYS.HOMEWORK),
        evaluations: Storage.get(CONFIG.STORAGE_KEYS.EVALUATIONS),
        weeklyEvaluations: Storage.get(CONFIG.STORAGE_KEYS.WEEKLY_EVALUATIONS),
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `sinif-yedek-${getToday()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('Veriler başarıyla yedeklendi!');
}

function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.students) Storage.set(CONFIG.STORAGE_KEYS.STUDENTS, data.students);
                if (data.announcements) Storage.set(CONFIG.STORAGE_KEYS.ANNOUNCEMENTS, data.announcements);
                if (data.portfolio) Storage.set(CONFIG.STORAGE_KEYS.PORTFOLIO, data.portfolio);
                if (data.homework) Storage.set(CONFIG.STORAGE_KEYS.HOMEWORK, data.homework);
                if (data.evaluations) Storage.set(CONFIG.STORAGE_KEYS.EVALUATIONS, data.evaluations);
                if (data.weeklyEvaluations) Storage.set(CONFIG.STORAGE_KEYS.WEEKLY_EVALUATIONS, data.weeklyEvaluations);

                showToast('Veriler başarıyla geri yüklendi!');
                resolve(true);
            } catch (error) {
                showToast('Dosya okunamadı!', 'error');
                reject(error);
            }
        };

        reader.onerror = reject;
        reader.readAsText(file);
    });
}
