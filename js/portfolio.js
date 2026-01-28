// =============================================
// SINIF YÖNETİM SİSTEMİ - PORTFOLYO YÖNETİMİ
// =============================================

const Portfolio = {
    // Tüm portfolyo öğelerini getir
    getAll() {
        return Storage.get(CONFIG.STORAGE_KEYS.PORTFOLIO) || [];
    },

    // Tek öğe getir
    getById(id) {
        const items = this.getAll();
        return items.find(p => p.id === id);
    },

    // Öğrencinin portfolyosunu getir
    getByStudent(studentId) {
        return this.getAll().filter(p => p.studentId === studentId);
    },

    // Veli ile paylaşılanları getir
    getSharedWithParent(studentId) {
        return this.getByStudent(studentId).filter(p => p.sharedWithParent);
    },

    // Portfolyo öğesi ekle
    add(data) {
        const items = this.getAll();

        const newItem = {
            id: generateId(),
            studentId: data.studentId,
            title: data.title.trim(),
            description: data.description ? data.description.trim() : '',
            imageData: data.imageData || null,
            category: data.category || 'Genel',
            date: getToday(),
            sharedWithParent: data.sharedWithParent || false
        };

        items.unshift(newItem);
        Storage.set(CONFIG.STORAGE_KEYS.PORTFOLIO, items);

        return newItem;
    },

    // Portfolyo öğesi güncelle
    update(id, data) {
        const items = this.getAll();
        const index = items.findIndex(p => p.id === id);

        if (index === -1) return null;

        items[index] = {
            ...items[index],
            title: data.title ? data.title.trim() : items[index].title,
            description: data.description !== undefined ? data.description.trim() : items[index].description,
            category: data.category || items[index].category,
            sharedWithParent: data.sharedWithParent !== undefined ? data.sharedWithParent : items[index].sharedWithParent
        };

        Storage.set(CONFIG.STORAGE_KEYS.PORTFOLIO, items);
        return items[index];
    },

    // Portfolyo öğesi sil
    delete(id) {
        const items = this.getAll();
        const filtered = items.filter(p => p.id !== id);

        if (filtered.length === items.length) return false;

        Storage.set(CONFIG.STORAGE_KEYS.PORTFOLIO, filtered);
        return true;
    },

    // Veli ile paylaşımı değiştir
    toggleShare(id) {
        const item = this.getById(id);
        if (!item) return null;

        return this.update(id, { sharedWithParent: !item.sharedWithParent });
    },

    // Toplam öğe sayısı
    getCount() {
        return this.getAll().length;
    },

    // Kategoriler
    getCategories() {
        return ['Resim', 'Yazı', 'El İşi', 'Matematik', 'Fen', 'Müzik', 'Beden Eğitimi', 'Genel'];
    }
};

// =============================================
// PORTFOLYO UI FONKSİYONLARI
// =============================================

function renderPortfolioList() {
    const container = document.getElementById('portfolioListContainer');
    if (!container) return;

    const students = Students.getAll();
    const portfolio = Portfolio.getAll();

    if (portfolio.length === 0) {
        container.innerHTML = showEmptyState('📁', 'Henüz ürün dosyası yok', 'Öğrenci çalışmalarını eklemek için yukarıdaki butonu kullanın.');
        return;
    }

    // Öğrencilere göre grupla
    let html = '';

    students.forEach(student => {
        const studentItems = Portfolio.getByStudent(student.id);
        if (studentItems.length === 0) return;

        html += `
            <div class="mb-6">
                <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                    👤 ${student.name}
                    <span class="badge badge-primary">${studentItems.length} ürün</span>
                </h3>
                <div class="portfolio-grid">
        `;

        studentItems.forEach(item => {
            const sharedBadge = item.sharedWithParent
                ? '<span class="badge badge-success">✅ Veli ile paylaşıldı</span>'
                : '<span class="badge badge-warning">🔒 Paylaşılmadı</span>';

            html += `
                <div class="portfolio-item">
                    ${item.imageData
                    ? `<img src="${item.imageData}" alt="${item.title}" class="portfolio-image">`
                    : '<div class="portfolio-image flex items-center justify-center text-4xl">📄</div>'
                }
                    <div class="portfolio-info">
                        <h4>${item.title}</h4>
                        <p>${item.description || 'Açıklama yok'}</p>
                        <div class="flex items-center justify-between mt-3">
                            <span class="text-sm text-muted">${item.category} • ${formatDate(item.date)}</span>
                        </div>
                        <div class="mt-3">
                            ${sharedBadge}
                        </div>
                        <div class="flex gap-2 mt-3">
                            <button class="btn btn-sm ${item.sharedWithParent ? 'btn-outline' : 'btn-success'}" onclick="togglePortfolioShare('${item.id}')">
                                ${item.sharedWithParent ? '🔒 Paylaşımı Kaldır' : '✅ Veli ile Paylaş'}
                            </button>
                            <button class="btn btn-sm btn-ghost" onclick="editPortfolioItem('${item.id}')">✏️</button>
                            <button class="btn btn-sm btn-ghost text-danger" onclick="deletePortfolioItem('${item.id}')">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Veli için portfolyo
function renderParentPortfolio() {
    const container = document.getElementById('parentPortfolioContainer');
    if (!container) return;

    const user = Auth.getCurrentUser();
    if (!user || user.type !== 'parent') return;

    const items = Portfolio.getSharedWithParent(user.studentId);

    if (items.length === 0) {
        container.innerHTML = showEmptyState('📁', 'Henüz paylaşılan ürün yok');
        return;
    }

    let html = '<div class="portfolio-grid">';

    items.forEach(item => {
        html += `
            <div class="portfolio-item">
                ${item.imageData
                ? `<img src="${item.imageData}" alt="${item.title}" class="portfolio-image">`
                : '<div class="portfolio-image flex items-center justify-center text-4xl">📄</div>'
            }
                <div class="portfolio-info">
                    <h4>${item.title}</h4>
                    <p>${item.description || ''}</p>
                    <span class="text-sm text-muted">${item.category} • ${formatDate(item.date)}</span>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Portfolyo ekleme modalını aç
function openAddPortfolioModal() {
    document.getElementById('portfolioModalTitle').textContent = '➕ Yeni Ürün Ekle';
    document.getElementById('portfolioForm').reset();
    document.getElementById('portfolioId').value = '';
    document.getElementById('imagePreview').innerHTML = '';

    // Öğrenci listesini yükle
    loadStudentSelect('portfolioStudent');

    // Kategori listesini yükle
    loadCategorySelect();

    showModal('portfolioModal');
}

// Öğrenci select'ini yükle
function loadStudentSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const students = Students.getAll();

    select.innerHTML = '<option value="">-- Öğrenci Seçin --</option>';
    students.forEach(student => {
        select.innerHTML += `<option value="${student.id}">${student.name}</option>`;
    });
}

// Kategori select'ini yükle
function loadCategorySelect() {
    const select = document.getElementById('portfolioCategory');
    if (!select) return;

    const categories = Portfolio.getCategories();

    select.innerHTML = '';
    categories.forEach(cat => {
        select.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
}

// Portfolyo düzenleme
function editPortfolioItem(id) {
    const item = Portfolio.getById(id);
    if (!item) return;

    document.getElementById('portfolioModalTitle').textContent = '✏️ Ürün Düzenle';
    document.getElementById('portfolioId').value = item.id;
    document.getElementById('portfolioTitle').value = item.title;
    document.getElementById('portfolioDescription').value = item.description;

    loadStudentSelect('portfolioStudent');
    document.getElementById('portfolioStudent').value = item.studentId;

    loadCategorySelect();
    document.getElementById('portfolioCategory').value = item.category;

    document.getElementById('shareWithParent').checked = item.sharedWithParent;

    // Resim önizleme
    const preview = document.getElementById('imagePreview');
    if (item.imageData) {
        preview.innerHTML = `<img src="${item.imageData}" alt="Önizleme" style="max-width: 200px; border-radius: var(--radius);">`;
    } else {
        preview.innerHTML = '';
    }

    showModal('portfolioModal');
}

// Resim önizleme
function previewImage(input) {
    const preview = document.getElementById('imagePreview');

    if (input.files && input.files[0]) {
        const file = input.files[0];

        if (file.size > CONFIG.MAX_IMAGE_SIZE) {
            showToast('Dosya boyutu çok büyük! Maksimum 10MB olmalıdır.', 'error');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Önizleme" style="max-width: 200px; border-radius: var(--radius);">`;
        };
        reader.readAsDataURL(file);
    }
}

// Portfolyo formunu kaydet
async function savePortfolioItem(event) {
    event.preventDefault();

    const id = document.getElementById('portfolioId').value;
    const studentId = document.getElementById('portfolioStudent').value;
    const title = document.getElementById('portfolioTitle').value.trim();
    const description = document.getElementById('portfolioDescription').value.trim();
    const category = document.getElementById('portfolioCategory').value;
    const sharedWithParent = document.getElementById('shareWithParent').checked;
    const imageInput = document.getElementById('portfolioImage');

    if (!studentId || !title) {
        showToast('Lütfen öğrenci seçin ve başlık girin!', 'error');
        return;
    }

    let imageData = null;

    // Yeni resim yüklendi mi?
    if (imageInput.files && imageInput.files[0]) {
        try {
            imageData = await imageToBase64(imageInput.files[0]);
        } catch (error) {
            showToast(error.message, 'error');
            return;
        }
    } else if (id) {
        // Düzenleme modunda mevcut resmi koru
        const existing = Portfolio.getById(id);
        if (existing) imageData = existing.imageData;
    }

    if (id) {
        Portfolio.update(id, { title, description, category, sharedWithParent });
        showToast('Ürün güncellendi!');
    } else {
        Portfolio.add({ studentId, title, description, category, sharedWithParent, imageData });
        showToast('Ürün eklendi!');
    }

    hideModal('portfolioModal');
    renderPortfolioList();
    updateStats();
}

// Paylaşımı değiştir
function togglePortfolioShare(id) {
    const item = Portfolio.toggleShare(id);
    if (item) {
        showToast(item.sharedWithParent ? 'Ürün veli ile paylaşıldı!' : 'Paylaşım kaldırıldı!');
        renderPortfolioList();
    }
}

// Portfolyo öğesi sil
async function deletePortfolioItem(id) {
    const item = Portfolio.getById(id);
    if (!item) return;

    const confirmed = await confirmAction(`"${item.title}" ürününü silmek istediğinize emin misiniz?`);

    if (confirmed) {
        Portfolio.delete(id);
        showToast('Ürün silindi!');
        renderPortfolioList();
        updateStats();
    }
}
