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
    getStudentPerformanceData(studentId) {
        const evals = WeeklyEval.getByStudent(studentId);
        if (evals.length === 0) return null;

        const subjects = Curriculum.getAllSubjects();
        const data = {
            labels: [],
            scores: [],
            colors: []
        };

        subjects.forEach((subj, index) => {
            const scores = evals.map(e => e.subjects[subj.key]?.score || 0).filter(s => s > 0);
            const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

            data.labels.push(subj.name);
            data.scores.push(avg.toFixed(1));
            data.colors.push(this.colors.subjects[index]);
        });

        return data;
    },

    // Sınıf haftalık ortalamalar
    getClassWeeklyAverages() {
        const students = Students.getAll();
        if (students.length === 0) return null;

        const weeks = Curriculum.getAllWeeks();
        const data = {
            labels: [],
            averages: []
        };

        weeks.forEach(week => {
            let weekTotal = 0;
            let weekCount = 0;

            students.forEach(student => {
                const eval_ = WeeklyEval.getByStudentAndWeek(student.id, week.week);
                if (eval_) {
                    const subjects = Curriculum.getAllSubjects();
                    subjects.forEach(subj => {
                        const score = eval_.subjects[subj.key]?.score || 0;
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
    getWeakTopics(threshold = 3) {
        const students = Students.getAll();
        const subjects = Curriculum.getAllSubjects();
        const weakTopics = [];

        students.forEach(student => {
            const evals = WeeklyEval.getByStudent(student.id);

            evals.forEach(eval_ => {
                const weekInfo = Curriculum.getWeek(eval_.week);
                const topics = Curriculum.getWeekTopics(eval_.week);

                subjects.forEach(subj => {
                    const score = eval_.subjects[subj.key]?.score || 0;
                    if (score > 0 && score < threshold) {
                        weakTopics.push({
                            studentName: student.name,
                            studentId: student.id,
                            week: eval_.week,
                            weekDates: weekInfo?.dates || '',
                            subject: subj.name,
                            subjectIcon: subj.icon,
                            topic: topics[subj.key]?.topic || '',
                            score: score,
                            note: eval_.subjects[subj.key]?.note || ''
                        });
                    }
                });
            });
        });

        // Puana göre sırala (en düşük önce)
        return weakTopics.sort((a, b) => a.score - b.score);
    },

    // Bireysel öğrenci radar chart
    renderStudentRadarChart(studentId) {
        const canvas = document.getElementById('studentRadarChart');
        if (!canvas) return;

        const data = this.getStudentPerformanceData(studentId);
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
    renderClassWeeklyChart() {
        const canvas = document.getElementById('classWeeklyChart');
        if (!canvas) return;

        const data = this.getClassWeeklyAverages();
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
    renderWeakTopicsList() {
        const container = document.getElementById('weakTopicsContainer');
        if (!container) return;

        const weakTopics = this.getWeakTopics(3);

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
function initializeGeneralEvaluation() {
    const students = Students.getAll();

    if (students.length === 0) {
        document.getElementById('generalEvalContent').innerHTML =
            showEmptyState('👥', 'Henüz öğrenci yok', 'Önce öğrenci ekleyin.');
        return;
    }

    // Öğrenci seçici doldur
    const select = document.getElementById('studentSelectForChart');
    if (select) {
        select.innerHTML = '<option value="">-- Öğrenci Seçin --</option>';
        students.forEach(s => {
            select.innerHTML += `<option value="${s.id}">${s.name}</option>`;
        });
    }

    // Grafikleri render et
    Charts.renderClassWeeklyChart();
    Charts.renderWeakTopicsList();
}

// Öğrenci seçildiğinde radar chart göster
function onStudentSelectForChart(selectElement) {
    const studentId = selectElement.value;
    if (studentId) {
        Charts.renderStudentRadarChart(studentId);
    } else {
        const canvas = document.getElementById('studentRadarChart');
        if (canvas) canvas.style.display = 'none';
    }
}
