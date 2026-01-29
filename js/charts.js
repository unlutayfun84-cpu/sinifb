// =============================================
// SINIF YÖNETİM SİSTEMİ - GRAFİK MODÜLÜ
// =============================================

const Charts = {
    // Grafik renk paleti
    colors: {
        primary: '#6366F1',
        secondary: '#F59E0B',
        success: '#10B981',
        danger: '#EF4444',
        info: '#3B82F6',
        warning: '#F59E0B',
        subjects: [
            'rgba(99, 102, 241, 0.8)',   // Türkçe - Indigo
            'rgba(245, 158, 11, 0.8)',   // Matematik - Amber
            'rgba(16, 185, 129, 0.8)',   // Hayat Bilgisi - Green
            'rgba(139, 92, 246, 0.8)',   // Müzik - Purple
            'rgba(239, 68, 68, 0.8)',    // Beden Eğitimi - Red
            'rgba(59, 130, 246, 0.8)'    // Görsel Sanatlar - Blue
        ]
    },

    // Öğrenci performans verisi hesapla
    async getStudentPerformanceData(studentId) {
        const evals = await WeeklyEvaluation.getByStudent(studentId);
        if (evals.length === 0) return null;

        const subjects = Curriculum.getAllSubjects();
        const data = {
            labels: [],
            scores: [],
            colors: []
        };

        subjects.forEach((subj, index) => {
            const scores = evals.map(e => e.subjects[subj.name] || 0).filter(s => s > 0);
            const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

            data.labels.push(subj.name);
            data.scores.push(avg.toFixed(1));
            data.colors.push(this.colors.subjects[index]);
        });

        return data;
    },

    // Sınıf haftalık ortalamalar
    async getClassWeeklyAverages() {
        const students = await Students.getAll();
        if (!Array.isArray(students) || students.length === 0) return null;

        const weeks = Curriculum.getAllWeeks();
        const data = {
            labels: [],
            averages: []
        };

        const allEvals = await WeeklyEvaluation.getAll();

        weeks.forEach(week => {
            let weekTotal = 0;
            let weekCount = 0;

            students.forEach(student => {
                const ev_ = allEvals.find(e => e.studentId === student.id && e.week === week.week);
                if (ev_) {
                    const subjects = Curriculum.getAllSubjects();
                    subjects.forEach(subj => {
                        const score = ev_.subjects[subj.name] || 0;
                        if (score > 0) {
                            weekTotal += score;
                            weekCount++;
                        }
                    });
                }
            });

            if (weekCount > 0) {
                data.labels.push(`${week.week}. Hafta`);
                data.averages.push((weekTotal / weekCount).toFixed(2));
            }
        });

        return data;
    },

    // Zayıf konuları tespit et
    async getWeakTopics(threshold = 3) {
        const students = await Students.getAll();
        if (!Array.isArray(students)) return []; // Safety check

        const subjects = Curriculum.getAllSubjects();
        const weakTopics = [];

        const allEvals = await WeeklyEvaluation.getAll();

        students.forEach(student => {
            const evals = allEvals.filter(e => e.studentId === student.id);

            evals.forEach(ev_ => {
                const weekInfo = Curriculum.getWeek(ev_.week);
                const topics = Curriculum.getWeekTopics(ev_.week);

                subjects.forEach(subj => {
                    const score = ev_.subjects[subj.name] || 0;
                    if (score > 0 && score < threshold) {
                        weakTopics.push({
                            studentName: student.name,
                            studentId: student.id,
                            week: ev_.week,
                            weekDates: weekInfo?.dates || '',
                            subject: subj.name,
                            subjectIcon: subj.icon,
                            topic: topics[subj.key]?.topic || '',
                            score: score,
                            note: ''
                        });
                    }
                });
            });
        });

        // Puana göre sırala (en düşük önce)
        return weakTopics.sort((a, b) => a.score - b.score);
    },

    // Bireysel öğrenci radar chart
    async renderStudentRadarChart(studentId) {
        const canvas = document.getElementById('studentRadarChart');
        if (!canvas) return;

        const data = await this.getStudentPerformanceData(studentId);
        if (!data) {
            canvas.style.display = 'none';
            return;
        }

        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');

        // Eski chart varsa yok et
        if (window.studentRadarChartInstance) {
            window.studentRadarChartInstance.destroy();
        }

        window.studentRadarChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Ders Ortalaması',
                    data: data.scores,
                    backgroundColor: data.colors,
                    borderColor: data.colors.map(c => c.replace('0.8', '1')),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Ders Bazlı Performans',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    },

    // Sınıf geneli haftalık chart
    async renderClassWeeklyChart() {
        const canvas = document.getElementById('classWeeklyChart');
        if (!canvas) return;

        const data = await this.getClassWeeklyAverages();
        if (!data || data.labels.length === 0) {
            canvas.style.display = 'none';
            return;
        }

        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');

        // Eski chart varsa yok et
        if (window.classWeeklyChartInstance) {
            window.classWeeklyChartInstance.destroy();
        }

        window.classWeeklyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Sınıf Ortalaması',
                    data: data.averages,
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 0.5
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Haftalık Sınıf Performansı',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    },

    // Zayıf konular listesi render
    async renderWeakTopicsList() {
        const container = document.getElementById('weakTopicsContainer');
        if (!container) return;

        const weakTopics = await this.getWeakTopics(3);

        if (weakTopics.length === 0) {
            container.innerHTML = showEmptyState('🎉', 'Harika!', 'Tüm öğrenciler konuları başarıyla öğreniyor.');
            return;
        }

        let html = `
            <div class="alert alert-warning mb-4">
                <strong>⚠️ Dikkat:</strong> ${weakTopics.length} adet 3 yıldızın altında değerlendirme bulundu.
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Öğrenci</th>
                            <th>Hafta</th>
                            <th>Ders</th>
                            <th>Konu</th>
                            <th>Puan</th>
                            <th>Not</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        weakTopics.forEach(item => {
            const scoreColor = item.score === 1 ? 'danger' : item.score === 2 ? 'warning' : 'primary';
            html += `
                <tr>
                    <td><strong>${item.studentName}</strong></td>
                    <td>${item.week}. Hafta<br><span class="text-sm text-muted">${item.weekDates}</span></td>
                    <td>${item.subjectIcon} ${item.subject}</td>
                    <td class="text-sm">${item.topic}</td>
                    <td><span class="badge badge-${scoreColor}">${item.score}⭐</span></td>
                    <td class="text-sm text-muted">${item.note || '-'}</td>
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
};

// Genel değerlendirme sayfasını başlat
async function initializeGeneralEvaluation() {
    const students = await Students.getAll();

    if (!Array.isArray(students) || students.length === 0) {
        if (document.getElementById('generalEvalContent')) {
            document.getElementById('generalEvalContent').innerHTML =
                showEmptyState('👥', 'Henüz öğrenci yok', 'Önce öğrenci ekleyin.');
        }
        return;
    }

    // Öğrenci seçici doldur
    const select = document.getElementById('studentSelectForChart');
    if (select) {
        select.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Öğrenci Seçin --';
        select.appendChild(defaultOption);

        console.log('Charts.js: initializeGeneralEvaluation - Students:', students);

        if (Array.isArray(students)) {
            students.forEach(s => {
                const option = document.createElement('option');
                option.value = s.id;
                option.textContent = s.name;
                select.appendChild(option);
            });
        }
    }

    // Grafikleri render et
    await Charts.renderClassWeeklyChart();
    await Charts.renderWeakTopicsList();
}

// Öğrenci seçildiğinde radar chart göster
async function onStudentSelectForChart(selectElement) {
    const studentId = selectElement.value;
    if (studentId) {
        await Charts.renderStudentRadarChart(studentId);
    } else {
        const canvas = document.getElementById('studentRadarChart');
        if (canvas) canvas.style.display = 'none';
    }
}
