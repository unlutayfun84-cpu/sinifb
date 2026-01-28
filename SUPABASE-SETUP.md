# 🚀 Supabase Kurulum Rehberi

## Adım 1: Supabase Hesabı Oluşturma

1. **Supabase'e Git**: https://supabase.com
2. **Sign Up** butonuna tıklayın
3. **GitHub** ile giriş yapın (veya email ile)
4. Hesabınız oluşturulacak

## Adım 2: Yeni Proje Oluşturma

1. Dashboard'da **"New Project"** butonuna tıklayın
2. Proje bilgilerini doldurun:
   - **Name**: `sinif-yonetim`
   - **Database Password**: Güçlü bir şifre belirleyin (KAYDET!)
   - **Region**: `Europe West (Frankfurt)` seçin (Türkiye'ye en yakın)
   - **Pricing Plan**: `Free` (ücretsiz)
3. **Create new project** butonuna tıklayın
4. Proje oluşturulması 2-3 dakika sürer, bekleyin ⏳

## Adım 3: Veritabanı Tablolarını Oluşturma

1. Sol menüden **"SQL Editor"** seçin
2. **"New query"** butonuna tıklayın
3. Proje klasöründeki **`supabase-schema.sql`** dosyasını açın
4. Tüm SQL kodunu kopyalayın
5. Supabase SQL Editor'e yapıştırın
6. **"Run"** (▶️) butonuna tıklayın
7. "Success. No rows returned" mesajını görmelisiniz ✅

## Adım 4: API Anahtarlarını Alma

1. Sol menüden **"Project Settings"** (⚙️) seçin
2. **"API"** sekmesine tıklayın
3. Şu bilgileri kopyalayın:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Bu bilgileri bir yere kaydedin! 📝

## Adım 5: Bana Bilgileri Verin

Kopyaladığınız bilgileri bana şu formatta gönderin:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Ben bu bilgilerle kodu güncelleyeceğim! 🎉

---

## ❓ Sorun mu yaşıyorsunuz?

- SQL hatası alırsanız, SQL Editor'ü temizleyip tekrar deneyin
- Proje oluşturma uzun sürerse, sayfayı yenileyin
- API anahtarlarını bulamazsanız, Project Settings → API'ye gidin

Hazır olduğunuzda bilgileri gönderin! 🚀
