// =============================================
// SINIF YÖNETİM SİSTEMİ - MÜFREDAT VERİTABANI
// =============================================

const Curriculum = {
    // 2025-2026 Eğitim Öğretim Yılı Haftalık Müfredat
    weeks: [
        { week: 1, dates: "8-12 Eylül", month: "Eylül" },
        { week: 2, dates: "15-19 Eylül", month: "Eylül" },
        { week: 3, dates: "22-26 Eylül", month: "Eylül" },
        { week: 4, dates: "29 Eylül-3 Ekim", month: "Eylül-Ekim" },
        { week: 5, dates: "6-10 Ekim", month: "Ekim" },
        { week: 6, dates: "13-17 Ekim", month: "Ekim" },
        { week: 7, dates: "20-24 Ekim", month: "Ekim" },
        { week: 8, dates: "27-31 Ekim", month: "Ekim" },
        { week: 9, dates: "3-7 Kasım", month: "Kasım" },
        { week: 10, dates: "17-21 Kasım", month: "Kasım" },
        { week: 11, dates: "24-28 Kasım", month: "Kasım" },
        { week: 12, dates: "1-5 Aralık", month: "Aralık" },
        { week: 13, dates: "8-12 Aralık", month: "Aralık" },
        { week: 14, dates: "15-19 Aralık", month: "Aralık" },
        { week: 15, dates: "22-26 Aralık", month: "Aralık" },
        { week: 16, dates: "29 Aralık-2 Ocak", month: "Aralık-Ocak" },
        { week: 17, dates: "5-9 Ocak", month: "Ocak" },
        { week: 18, dates: "12-16 Ocak", month: "Ocak" },
        { week: 19, dates: "19-23 Ocak", month: "Ocak" },
        { week: 20, dates: "9-13 Şubat", month: "Şubat" },
        { week: 21, dates: "16-20 Şubat", month: "Şubat" },
        { week: 22, dates: "23-27 Şubat", month: "Şubat" },
        { week: 23, dates: "2-6 Mart", month: "Mart" },
        { week: 24, dates: "9-13 Mart", month: "Mart" },
        { week: 25, dates: "16-20 Mart", month: "Mart" },
        { week: 26, dates: "23-27 Mart", month: "Mart" },
        { week: 27, dates: "30 Mart-3 Nisan", month: "Mart-Nisan" },
        { week: 28, dates: "6-10 Nisan", month: "Nisan" },
        { week: 29, dates: "13-17 Nisan", month: "Nisan" },
        { week: 30, dates: "20-24 Nisan", month: "Nisan" },
        { week: 31, dates: "27 Nisan-1 Mayıs", month: "Nisan-Mayıs" },
        { week: 32, dates: "4-8 Mayıs", month: "Mayıs" },
        { week: 33, dates: "11-15 Mayıs", month: "Mayıs" },
        { week: 34, dates: "18-22 Mayıs", month: "Mayıs" },
        { week: 35, dates: "25-29 Mayıs", month: "Mayıs" },
        { week: 36, dates: "1-5 Haziran", month: "Haziran" },
        { week: 37, dates: "8-12 Haziran", month: "Haziran" }
    ],

    // Dersler ve Haftalık Konuları
    subjects: {
        turkce: {
            name: "Türkçe",
            icon: "📖",
            topics: {
                1: "İlk Okuma Yazma Hazırlık Çalışmaları",
                2: "1. Tema: Güzel Davranışlarımız (a-A sesi)",
                3: "1. Tema: Güzel Davranışlarımız (n-N sesi)",
                4: "1. Tema: Güzel Davranışlarımız (e-E sesi)",
                5: "1. Tema: Güzel Davranışlarımız (t-T sesi)",
                6: "2. Tema: Atatürk (i-İ sesi)",
                7: "2. Tema: Atatürk (r-R sesi)",
                8: "2. Tema: Atatürk (s-S sesi)",
                9: "2. Tema: Atatürk (l-L sesi)",
                10: "3. Tema: Milli Mücadele (o-O sesi)",
                11: "3. Tema: Milli Mücadele (k-K sesi)",
                12: "3. Tema: Milli Mücadele (ü-Ü sesi)",
                13: "3. Tema: Milli Mücadele (u-U sesi)",
                14: "4. Tema: Erdemler (m-M sesi)",
                15: "4. Tema: Erdemler (b-B sesi)",
                16: "4. Tema: Erdemler (d-D sesi)",
                17: "4. Tema: Erdemler (y-Y sesi)",
                18: "Genel Tekrar - 1. Dönem Sonu",
                19: "Yarıyıl Tatili",
                20: "5. Tema: Vatanımız (ş-Ş sesi)",
                21: "5. Tema: Vatanımız (z-Z sesi)",
                22: "5. Tema: Vatanımız (ç-Ç sesi)",
                23: "5. Tema: Vatanımız (g-G sesi)",
                24: "6. Tema: Doğa ve Evren (c-C sesi)",
                25: "6. Tema: Doğa ve Evren (p-P sesi)",
                26: "6. Tema: Doğa ve Evren (h-H sesi)",
                27: "6. Tema: Doğa ve Evren (ğ-Ğ sesi)",
                28: "7. Tema: Sağlık ve Spor (f-F sesi)",
                29: "7. Tema: Sağlık ve Spor (v-V sesi)",
                30: "7. Tema: Sağlık ve Spor (ö-Ö sesi)",
                31: "7. Tema: Sağlık ve Spor (j-J sesi)",
                32: "8. Tema: Birey ve Toplum",
                33: "8. Tema: Birey ve Toplum",
                34: "8. Tema: Birey ve Toplum",
                35: "Okuma Yazma Pekiştirme",
                36: "Genel Tekrar",
                37: "Yıl Sonu Değerlendirme"
            }
        },
        matematik: {
            name: "Matematik",
            icon: "🔢",
            topics: {
                1: "Nesnelerin Geometrisi (1) - Şekiller",
                2: "Nesnelerin Geometrisi (1) - Şekiller",
                3: "Nesnelerin Geometrisi (1) - Uzamsal İlişkiler",
                4: "Sayılar ve Nicelikler (1) - 0-5 Arası",
                5: "Sayılar ve Nicelikler (1) - 6-10 Arası",
                6: "Sayılar ve Nicelikler (1) - Sayma",
                7: "Sayılar ve Nicelikler (1) - Karşılaştırma",
                8: "Sayılar ve Nicelikler (1) - Sıralama",
                9: "Sayılar ve Nicelikler (1) - Toplama",
                10: "Sayılar ve Nicelikler (1) - Çıkarma",
                11: "Sayılar ve Nicelikler (1) - Problem Çözme",
                12: "Sayılar ve Nicelikler (1) - 11-20 Arası",
                13: "Sayılar ve Nicelikler (1) - Onluk-Birlik",
                14: "Sayılar ve Nicelikler (1) - Toplama-Çıkarma",
                15: "Sayılar ve Nicelikler (1) - Problemler",
                16: "Ölçme (1) - Uzunluk",
                17: "Sayılar ve Nicelikler (2) - 21-50 Arası",
                18: "Genel Tekrar - 1. Dönem Sonu",
                19: "Yarıyıl Tatili",
                20: "Sayılar ve Nicelikler (2) - 51-100 Arası",
                21: "Sayılar ve Nicelikler (2) - Onluk-Birlik",
                22: "Sayılar ve Nicelikler (2) - Toplama",
                23: "Sayılar ve Nicelikler (2) - Çıkarma",
                24: "Sayılar ve Nicelikler (2) - Problem Çözme",
                25: "Nesnelerin Geometrisi (2) - Örüntüler",
                26: "Nesnelerin Geometrisi (2) - Simetri",
                27: "Ölçme (2) - Tartma",
                28: "Ölçme (2) - Sıvı Ölçme",
                29: "Ölçme (2) - Zaman",
                30: "Ölçme (2) - Para",
                31: "Veri İşleme - Grafik Okuma",
                32: "Veri İşleme - Grafik Oluşturma",
                33: "Problem Çözme Stratejileri",
                34: "Matematiksel Düşünme",
                35: "Pekiştirme Çalışmaları",
                36: "Genel Tekrar",
                37: "Yıl Sonu Değerlendirme"
            }
        },
        hayatBilgisi: {
            name: "Hayat Bilgisi",
            icon: "🌍",
            topics: {
                1: "Ben ve Okulum - Okula Uyum",
                2: "Ben ve Okulum - Sınıf Kuralları",
                3: "Ben ve Okulum - Arkadaşlık",
                4: "Ben ve Okulum - Okul Çevresi",
                5: "Ben ve Okulum - Görevlerimiz",
                6: "Ben ve Okulum - Değerlendirme",
                7: "Sağlığım ve Güvenliğim - Temizlik",
                8: "Sağlığım ve Güvenliğim - Beslenme",
                9: "Sağlığım ve Güvenliğim - Güvenlik",
                10: "Sağlığım ve Güvenliğim - Trafik",
                11: "Sağlığım ve Güvenliğim - Afetler",
                12: "Sağlığım ve Güvenliğim - Değerlendirme",
                13: "Ailem ve Toplum - Ailem",
                14: "Ailem ve Toplum - Aile Bireyleri",
                15: "Ailem ve Toplum - Görevlerimiz",
                16: "Ailem ve Toplum - Değerlendirme",
                17: "Atatürk - Hayatı",
                18: "Genel Tekrar - 1. Dönem Sonu",
                19: "Yarıyıl Tatili",
                20: "Atatürk - İlkeleri",
                21: "Atatürk - Değerlendirme",
                22: "Doğa ve Çevre - Canlılar",
                23: "Doğa ve Çevre - Bitkiler",
                24: "Doğa ve Çevre - Hayvanlar",
                25: "Doğa ve Çevre - Mevsimler",
                26: "Doğa ve Çevre - Çevre Koruma",
                27: "Doğa ve Çevre - Değerlendirme",
                28: "Ülkemiz - Vatan Sevgisi",
                29: "Ülkemiz - Milli Bayramlar",
                30: "Ülkemiz - Milli Semboller",
                31: "Ülkemiz - Değerlendirme",
                32: "Zaman ve Mekân - Gün-Hafta-Ay",
                33: "Zaman ve Mekân - Yönler",
                34: "Zaman ve Mekân - Harita",
                35: "Pekiştirme Çalışmaları",
                36: "Genel Tekrar",
                37: "Yıl Sonu Değerlendirme"
            }
        },
        muzik: {
            name: "Müzik",
            icon: "🎵",
            topics: {
                1: "Tanışma Şarkıları",
                2: "Ritim Çalışmaları",
                3: "Basit Melodiler",
                4: "Çocuk Şarkıları",
                5: "Ritim Aletleri",
                6: "Dinleme Çalışmaları",
                7: "Şarkı Söyleme",
                8: "Müzikli Oyunlar",
                9: "Cumhuriyet Bayramı Şarkıları",
                10: "Sesin Özellikleri",
                11: "Tempo ve Ritim",
                12: "Yeni Yıl Şarkıları",
                13: "Kış Temalı Şarkılar",
                14: "Dinleme ve Hareket",
                15: "Şarkı Eşliğinde Oyun",
                16: "1. Dönem Değerlendirme",
                17: "Tekrar ve Pekiştirme",
                18: "Genel Tekrar",
                19: "Yarıyıl Tatili",
                20: "Bahar Şarkıları",
                21: "Doğa ve Müzik",
                22: "Hayvan Şarkıları",
                23: "Neşeli Şarkılar",
                24: "Ulusal Marşlar",
                25: "23 Nisan Şarkıları",
                26: "Dans ve Müzik",
                27: "19 Mayıs Şarkıları",
                28: "Yaz Şarkıları",
                29: "Müzikli Hikayeler",
                30: "Okul Şarkıları",
                31: "Konser Hazırlığı",
                32: "Repertuar Çalışması",
                33: "Toplu Söyleme",
                34: "Yıl Sonu Gösterisi Hazırlığı",
                35: "Prova Çalışmaları",
                36: "Genel Tekrar",
                37: "Yıl Sonu Gösterisi"
            }
        },
        bedenEgitimi: {
            name: "Beden Eğitimi",
            icon: "⚽",
            topics: {
                1: "Tanışma Oyunları",
                2: "Temel Hareketler - Yürüme",
                3: "Temel Hareketler - Koşma",
                4: "Temel Hareketler - Atlama",
                5: "Denge Hareketleri",
                6: "Koordinasyon Oyunları",
                7: "Top Oyunları (1)",
                8: "Top Oyunları (2)",
                9: "Takım Oyunları",
                10: "Jimnastik Hareketleri",
                11: "Esneme ve Gevşeme",
                12: "Kış Oyunları",
                13: "Salon Oyunları",
                14: "Ritim ve Hareket",
                15: "Yaratıcı Hareket",
                16: "1. Dönem Değerlendirme",
                17: "Tekrar ve Pekiştirme",
                18: "Genel Tekrar",
                19: "Yarıyıl Tatili",
                20: "Açık Alan Oyunları",
                21: "Koşu Oyunları",
                22: "Atlama Oyunları",
                23: "Atma Oyunları",
                24: "Takım Sporları",
                25: "Dans ve Hareket",
                26: "Mini Yarışmalar",
                27: "Parkur Aktiviteleri",
                28: "Spor Günü Hazırlığı",
                29: "Yüzme Bilinci",
                30: "Doğa Yürüyüşü",
                31: "Piknik Oyunları",
                32: "Futbol Temelleri",
                33: "Basketbol Temelleri",
                34: "Voleybol Temelleri",
                35: "Spor Festivali Hazırlığı",
                36: "Genel Tekrar",
                37: "Yıl Sonu Spor Şenliği"
            }
        },
        gorselSanatlar: {
            name: "Görsel Sanatlar",
            icon: "🎨",
            topics: {
                1: "Tanışma ve Malzeme Tanıma",
                2: "Serbest Çizim",
                3: "Renkler (Ana Renkler)",
                4: "Renkler (Ara Renkler)",
                5: "Şekiller ve Çizgiler",
                6: "Boyama Teknikleri",
                7: "Kolaj Çalışması",
                8: "Sonbahar Temalı Çalışma",
                9: "Cumhuriyet Temalı Çalışma",
                10: "Atatürk Resmi",
                11: "Kağıt Katlama",
                12: "Yeni Yıl Kartı",
                13: "Kış Temalı Resim",
                14: "Hamur Çalışması",
                15: "El İşi Projesi",
                16: "1. Dönem Sergisi",
                17: "Tekrar ve Pekiştirme",
                18: "Genel Tekrar",
                19: "Yarıyıl Tatili",
                20: "Bahar Çiçekleri",
                21: "Hayvan Resimleri",
                22: "Doğa Resimleri",
                23: "3 Boyutlu Çalışma",
                24: "23 Nisan Temalı Çalışma",
                25: "Anneler Günü Kartı",
                26: "Babalar Günü Kartı",
                27: "Mozaik Çalışması",
                28: "Portre Çalışması",
                29: "Manzara Resmi",
                30: "İmgeleme Çalışması",
                31: "Grup Projesi (1)",
                32: "Grup Projesi (2)",
                33: "Yıl Sonu Sergisi Hazırlığı",
                34: "Sergi Düzenleme",
                35: "Değerlendirme",
                36: "Genel Tekrar",
                37: "Yıl Sonu Sergisi"
            }
        }
    },

    // Haftayı getir
    getWeek(weekNum) {
        return this.weeks.find(w => w.week === weekNum);
    },

    // Tüm haftaları getir
    getAllWeeks() {
        return this.weeks;
    },

    // Ders konusunu getir
    getTopic(subjectKey, weekNum) {
        const subject = this.subjects[subjectKey];
        if (!subject) return null;
        return subject.topics[weekNum] || "Konu belirtilmemiş";
    },

    // Tüm dersleri getir
    getAllSubjects() {
        return Object.entries(this.subjects).map(([key, value]) => ({
            key,
            name: value.name,
            icon: value.icon
        }));
    },

    // Hafta için tüm konuları getir
    getWeekTopics(weekNum) {
        const topics = {};
        for (const [key, subject] of Object.entries(this.subjects)) {
            topics[key] = {
                name: subject.name,
                icon: subject.icon,
                topic: subject.topics[weekNum] || "Konu belirtilmemiş"
            };
        }
        return topics;
    },

    // Mevcut haftayı hesapla
    getCurrentWeek() {
        const today = new Date();
        const startDate = new Date('2025-09-08'); // Okul başlangıcı
        const diffTime = today - startDate;
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        return Math.max(1, Math.min(37, diffWeeks));
    }
};
