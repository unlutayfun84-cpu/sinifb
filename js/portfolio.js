// =============================================
// SINIF YÖNETİM SİSTEMİ - PORTFOLYO YÖNETİMİ (SUPABASE)
// =============================================

const Portfolio = {
    async getAll() { return await SupabaseDB.getPortfolio(); },
    async getById(id) { const all = await this.getAll(); return all.find(p => p.id === id); },
    async getByStudent(studentId) { const all = await this.getAll(); return all.filter(p => p.studentId === studentId); },
    async getSharedWithParent(studentId) {
        const all = await this.getByStudent(studentId);
        return all.filter(p => p.sharedWithParent);
    },

    async add(data) {
        const newItem = {
            id: generateId(),
            studentId: data.studentId,
            title: data.title.trim(),
            description: data.description ? data.description.trim() : '',
            imageData: data.imageData || null,
            category: data.category,
            date: getToday(),
            sharedWithParent: data.sharedWithParent || false
        };
        await SupabaseDB.addPortfolio(newItem);
        return newItem;
    },

    async update(id, data) {
        const updates = {};
        if (data.title) updates.title = data.title.trim();
        if (data.description !== undefined) updates.description = data.description.trim();
        if (data.category) updates.category = data.category;
        if (data.sharedWithParent !== undefined) updates.sharedWithParent = data.sharedWithParent;

        await SupabaseDB.updatePortfolio(id, updates);
        return await this.getById(id);
    },

    async delete(id) {
        await SupabaseDB.deletePortfolio(id);
        return true;
    },

    async toggleShare(id) {
        const item = await this.getById(id);
        if (!item) return null;
        return await this.update(id, { sharedWithParent: !item.sharedWithParent });
    },

    async getCount() { const all = await this.getAll(); return all.length; }
};

// UI Fonksiyonları
async function renderPortfolioList() {
    const container = document.getElementById('portfolioListContainer');
    if (!container) return;

    const students = await Students.getAll();
    const portfolio = await Portfolio.getAll();

    if (portfolio.length === 0) {
        container.innerHTML = showEmptyState('📁', 'Henüz portfolyo öğesi yok', 'Yeni öğe eklemek için yukarıdaki butonu kullanın.');
        return;
    }

    let html = '<div class="portfolio-grid">';
    portfolio.forEach(item => {
        const student = students.find(s => s.id === item.studentId);
        const studentName = student ? student.name : 'Bilinmeyen';

        html += `
            <div class="portfolio-card">
                ${item.imageData ? `<img src="${item.imageData}" alt="${item.title}" class="portfolio-image">` : '<div class="portfolio-placeholder">📁</div>'}
                <div class="portfolio-content">
                    <h3>${item.title}</h3>
                    <p class="text-muted">${item.description || 'Açıklama yok'}</p>
                    <div class="portfolio-meta">
                        <span class="badge badge-${getCategoryColor(item.category)}">${item.category}</span>
                        <span>👤 ${studentName}</span>
                        <span>📅 ${formatDate(item.date)}</span>
                    </div>
                    <div class="portfolio-actions">
                        <button class="btn btn-sm ${item.sharedWithParent ? 'btn-success' : 'btn-ghost'}" 
                                onclick="togglePortfolioShare('${item.id}')" 
                                title="${item.sharedWithParent ? 'Veli ile paylaşılıyor' : 'Veli ile paylaş'}">
                            ${item.sharedWithParent ? '✅ Paylaşıldı' : '👁️ Paylaş'}
                        </button>
                        <button class="btn btn-sm btn-ghost" onclick="editPortfolio('${item.id}')">✏️</button>
                        <button class="btn btn-sm btn-ghost text-danger" onclick="deletePortfolio('${item.id}')">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

async function renderParentPortfolio() {
    const container = document.getElementById('parentPortfolioContainer');
    if (!container) return;

    const user = Auth.getCurrentUser();
    if (!user || user.type !== 'parent') return;

    const portfolio = await Portfolio.getSharedWithParent(user.studentId);

    if (portfolio.length === 0) {
        container.innerHTML = showEmptyState('📁', 'Henüz portfolyo öğesi yok');
        return;
    }

    let html = '<div class="portfolio-grid">';
    portfolio.forEach(item => {
        html += `
            <div class="portfolio-card">
                ${item.imageData ? `
                    <a href="${item.imageData}" target="_blank" title="Büyütmek için tıklayın">
                        <img src="${item.imageData}" alt="${item.title}" class="portfolio-image" style="cursor: pointer;">
                    </a>
                ` : '<div class="portfolio-placeholder">📁</div>'}
                <div class="portfolio-content">
                    <h3>${item.title}</h3>
                    <p>${item.description || 'Açıklama yok'}</p>
                    <div class="portfolio-meta">
                        <span class="badge badge-${getCategoryColor(item.category)}">${item.category}</span>
                        <span>📅 ${formatDate(item.date)}</span>
                    </div>
                    ${item.imageData ? `
                        <div style="margin-top: 10px;">
                            <a href="${item.imageData}" download="${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.png" class="btn btn-sm btn-primary">
                                📥 Fotoğrafı İndir
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

async function openAddPortfolioModal() {
    document.getElementById('portfolioModalTitle').textContent = '➕ Yeni Portfolyo Öğesi';
    document.getElementById('portfolioForm').reset();
    document.getElementById('portfolioId').value = '';
    document.getElementById('imagePreview').innerHTML = '';

    // Öğrenci listesini doldur
    const students = await Students.getAll();
    const select = document.getElementById('portfolioStudent');
    select.innerHTML = '<option value="">-- Öğrenci Seçin --</option>';
    students.forEach(s => {
        select.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });

    // Kategori listesini doldur
    const categorySelect = document.getElementById('portfolioCategory');
    if (categorySelect) {
        categorySelect.innerHTML = `
            <option value="">-- Kategori Seçin --</option>
            <option value="Sanat">🎨 Sanat</option>
            <option value="Fen">🔬 Fen</option>
            <option value="Matematik">🔢 Matematik</option>
            <option value="Türkçe">📖 Türkçe</option>
            <option value="Müzik">🎵 Müzik</option>
            <option value="Beden Eğitimi">⚽ Beden Eğitimi</option>
            <option value="Diğer">📁 Diğer</option>
        `;
    }

    showModal('portfolioModal');
}

async function editPortfolio(id) {
    const item = await Portfolio.getById(id);
    if (!item) return;

    document.getElementById('portfolioModalTitle').textContent = '✏️ Portfolyo Düzenle';
    document.getElementById('portfolioId').value = item.id;
    document.getElementById('portfolioTitle').value = item.title;
    document.getElementById('portfolioDescription').value = item.description;
    document.getElementById('shareWithParent').checked = item.sharedWithParent;

    if (item.imageData) {
        document.getElementById('imagePreview').innerHTML = `<img src="${item.imageData}" alt="Preview" style="max-width: 200px;">`;
    }

    // Öğrenci listesini doldur
    const students = await Students.getAll();
    const select = document.getElementById('portfolioStudent');
    select.innerHTML = '<option value="">-- Öğrenci Seçin --</option>';
    students.forEach(s => {
        select.innerHTML += `<option value="${s.id}" ${s.id === item.studentId ? 'selected' : ''}>${s.name}</option>`;
    });

    // Kategori listesini doldur
    const categorySelect = document.getElementById('portfolioCategory');
    if (categorySelect) {
        categorySelect.innerHTML = `
            <option value="">-- Kategori Seçin --</option>
            <option value="Sanat" ${item.category === 'Sanat' ? 'selected' : ''}>🎨 Sanat</option>
            <option value="Fen" ${item.category === 'Fen' ? 'selected' : ''}>🔬 Fen</option>
            <option value="Matematik" ${item.category === 'Matematik' ? 'selected' : ''}>🔢 Matematik</option>
            <option value="Türkçe" ${item.category === 'Türkçe' ? 'selected' : ''}>📖 Türkçe</option>
            <option value="Müzik" ${item.category === 'Müzik' ? 'selected' : ''}>🎵 Müzik</option>
            <option value="Beden Eğitimi" ${item.category === 'Beden Eğitimi' ? 'selected' : ''}>⚽ Beden Eğitimi</option>
            <option value="Diğer" ${item.category === 'Diğer' ? 'selected' : ''}>📁 Diğer</option>
        `;
    }

    showModal('portfolioModal');
}

async function savePortfolio(event) {
    event.preventDefault();

    const id = document.getElementById('portfolioId').value;
    const studentId = document.getElementById('portfolioStudent').value;
    const title = document.getElementById('portfolioTitle').value.trim();
    const description = document.getElementById('portfolioDescription').value.trim();
    const category = document.getElementById('portfolioCategory').value;
    const sharedWithParent = document.getElementById('shareWithParent').checked;

    if (!studentId || !title || !category) {
        showToast('Lütfen tüm alanları doldurun!', 'error');
        return;
    }

    const fileInput = document.getElementById('portfolioImage');
    let imageData = null;

    try {
        if (fileInput.files.length > 0) {
            imageData = await imageToBase64(fileInput.files[0]);
        }

        if (id) {
            await Portfolio.update(id, { title, description, category, sharedWithParent });
            showToast('Portfolyo güncellendi!');
        } else {
            await Portfolio.add({ studentId, title, description, imageData, category, sharedWithParent });
            showToast('Portfolyo eklendi!');
        }

        hideModal('portfolioModal');
        await renderPortfolioList();
        await updateStats();
    } catch (error) {
        console.error('Error saving portfolio:', error);
        showToast(error.message || 'Bir hata oluştu!', 'error');
    }
}

async function deletePortfolio(id) {
    const item = await Portfolio.getById(id);
    if (!item) return;

    const confirmed = await confirmAction(`"${item.title}" portfolyo öğesini silmek istediğinize emin misiniz?`);

    if (confirmed) {
        try {
            await Portfolio.delete(id);
            showToast('Portfolyo silindi!');
            await renderPortfolioList();
            await updateStats();
        } catch (error) {
            console.error('Error deleting portfolio:', error);
            showToast('Bir hata oluştu!', 'error');
        }
    }
}

async function togglePortfolioShare(id) {
    try {
        await Portfolio.toggleShare(id);
        await renderPortfolioList();
        showToast('Paylaşım durumu güncellendi!');
    } catch (error) {
        console.error('Error toggling share:', error);
        showToast('Bir hata oluştu!', 'error');
    }
}

function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function getCategoryColor(category) {
    const colors = {
        'Sanat': 'purple',
        'Fen': 'green',
        'Matematik': 'blue',
        'Türkçe': 'orange',
        'Diğer': 'gray'
    };
    return colors[category] || 'gray';
}
