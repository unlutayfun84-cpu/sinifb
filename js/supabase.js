// =============================================
// SINIF YÖNETİM SİSTEMİ - SUPABASE CLIENT
// =============================================

const SUPABASE_CONFIG = {
    url: 'https://xmtrcuxjdatlepkvdwnl.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdHJjdXhqZGF0bGVwa3Zkd25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTQ2NDAsImV4cCI6MjA4NTE5MDY0MH0.vs6PILTcy6l8lQGtmOBONYkCQgL_Rx7o2gFLTzliv_M'
};

// Supabase client oluştur (CDN üzerinden)
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// =============================================
// SUPABASE HELPER FONKSİYONLARI
// =============================================

const SupabaseDB = {
    // Öğrenciler
    async getStudents() {
        const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: true });
        if (error) {
            console.error('Supabase error:', error);
            return [];
        }
        return data.map(s => ({
            id: s.id,
            name: s.name,
            parentPassword: s.parent_password
        }));
    },

    async addStudent(student) {
        const { data, error } = await supabase.from('students').insert([{
            id: student.id,
            name: student.name,
            parent_password: student.parentPassword
        }]).select();
        if (error) throw error;
        return data[0];
    },

    async updateStudent(id, updates) {
        const { data, error } = await supabase.from('students').update({
            name: updates.name,
            parent_password: updates.parentPassword
        }).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    async deleteStudent(id) {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    // Duyurular
    async getAnnouncements() {
        const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
        if (error) {
            console.error('Supabase error:', error);
            return [];
        }
        return data;
    },

    async addAnnouncement(announcement) {
        const { data, error } = await supabase.from('announcements').insert([announcement]).select();
        if (error) throw error;
        return data[0];
    },

    async updateAnnouncement(id, updates) {
        const { data, error } = await supabase.from('announcements').update(updates).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    async deleteAnnouncement(id) {
        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    // Portfolyo
    async getPortfolio() {
        const { data, error } = await supabase.from('portfolio').select('*').order('date', { ascending: false });
        if (error) {
            console.error('Supabase error:', error);
            return [];
        }
        return data.map(p => ({
            id: p.id,
            studentId: p.student_id,
            title: p.title,
            description: p.description,
            imageData: p.image_data,
            category: p.category,
            date: p.date,
            sharedWithParent: p.shared_with_parent
        }));
    },

    async addPortfolio(portfolio) {
        const { data, error } = await supabase.from('portfolio').insert([{
            id: portfolio.id,
            student_id: portfolio.studentId,
            title: portfolio.title,
            description: portfolio.description,
            image_data: portfolio.imageData,
            category: portfolio.category,
            date: portfolio.date,
            shared_with_parent: portfolio.sharedWithParent
        }]).select();
        if (error) throw error;
        return data[0];
    },

    async updatePortfolio(id, updates) {
        const dbUpdates = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.sharedWithParent !== undefined) dbUpdates.shared_with_parent = updates.sharedWithParent;

        const { data, error } = await supabase.from('portfolio').update(dbUpdates).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    async deletePortfolio(id) {
        const { error } = await supabase.from('portfolio').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    // Ödevler
    async getHomework() {
        const { data, error } = await supabase.from('homework').select('*').order('due_date', { ascending: false });
        if (error) {
            console.error('Supabase error:', error);
            return [];
        }
        return data.map(h => ({
            id: h.id,
            title: h.title,
            description: h.description,
            dueDate: h.due_date,
            assignedDate: h.assigned_date,
            studentIds: h.student_ids
        }));
    },

    async addHomework(homework) {
        const { data, error } = await supabase.from('homework').insert([{
            id: homework.id,
            title: homework.title,
            description: homework.description,
            due_date: homework.dueDate,
            assigned_date: homework.assignedDate,
            student_ids: homework.studentIds
        }]).select();
        if (error) throw error;
        return data[0];
    },

    async updateHomework(id, updates) {
        const dbUpdates = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
        if (updates.studentIds) dbUpdates.student_ids = updates.studentIds;

        const { data, error } = await supabase.from('homework').update(dbUpdates).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    async deleteHomework(id) {
        const { error } = await supabase.from('homework').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    // Haftalık Değerlendirmeler
    async getWeeklyEvaluations() {
        const { data, error } = await supabase.from('weekly_evaluations').select('*').order('week', { ascending: true });
        if (error) {
            console.error('Supabase error:', error);
            return [];
        }
        return data.map(e => ({
            id: e.id,
            studentId: e.student_id,
            week: e.week,
            subjects: e.subjects,
            learned: e.learned,
            toImprove: e.to_improve,
            date: e.date
        }));
    },

    async addWeeklyEvaluation(evaluation) {
        const { data, error } = await supabase.from('weekly_evaluations').insert([{
            id: evaluation.id,
            student_id: evaluation.studentId,
            week: evaluation.week,
            subjects: evaluation.subjects,
            learned: evaluation.learned,
            to_improve: evaluation.toImprove,
            date: evaluation.date
        }]).select();
        if (error) throw error;
        return data[0];
    },

    async updateWeeklyEvaluation(id, updates) {
        const dbUpdates = {};
        if (updates.subjects) dbUpdates.subjects = updates.subjects;
        if (updates.learned !== undefined) dbUpdates.learned = updates.learned;
        if (updates.toImprove !== undefined) dbUpdates.to_improve = updates.toImprove;

        const { data, error } = await supabase.from('weekly_evaluations').update(dbUpdates).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    async deleteWeeklyEvaluation(id) {
        const { error } = await supabase.from('weekly_evaluations').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    // Admin Şifresi
    async getAdminPassword() {
        const { data, error } = await supabase.from('admin_settings').select('value').eq('key', 'admin_password').single();
        if (error || !data) return null;
        return data.value;
    },

    async setAdminPassword(password) {
        const { error } = await supabase.from('admin_settings').upsert({
            key: 'admin_password',
            value: password,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
        return true;
    }
};
