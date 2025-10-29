# 🌍 Tur Operatörü CRM - Özellik Analizi

## 📊 Piyasa Araştırması Özeti

Türkiye ve dünya genelinde tur operatörü yazılımları incelendi. İşte temel bulgular:

---

## 🎯 Temel Modüller (Mutlaka Olmalı)

### 1. 📅 Rezervasyon Yönetimi
**Öncelik:** 🔴 Kritik

#### Özellikler:
- ✅ Online/Offline rezervasyon alma
- ✅ Müsaitlik kontrolü (araç, rehber, otel)
- ✅ Otomatik rezervasyon kodu üretimi
- ✅ Durum takibi (Beklemede, Onaylandı, İptal, Tamamlandı)
- ✅ Grup rezervasyonları
- ✅ Son dakika rezervasyonları
- ⚡ Çakışma uyarısı sistemi
- ⚡ SMS/Email otomatik bildirim

#### Gerçek Hayat Senaryosu:
```
Örnek: 15 kişilik grup, 5 günlük Kapadokya turu
- Gün 1: İstanbul → Kapadokya (transfer + otel)
- Gün 2: Kapadokya turu (rehber + araç)
- Gün 3: Balon turu + underground city
- Gün 4: Kapadokya → İstanbul
- Gün 5: Çıkış
```

---

### 2. 🏨 Otel Yönetimi
**Öncelik:** 🔴 Kritik

#### Özellikler:
- ✅ Otel havuzu (anlaşmalı oteller)
- ✅ Fiyat listesi (sezonluk, oda tipi)
- ✅ Kontak bilgileri (rezervasyon, muhasebe)
- ✅ Otel özellikleri (yıldız, konum, tesisler)
- ✅ Müsaitlik takvimi
- ⚡ Otomatikotel rezervasyon maili
- ⚡ Oda tipi yönetimi (Single, Double, Suite)
- ⚡ Pansiyon tipleri (BB, HB, FB, All Inclusive)
- ⚡ Çocuk yaşına göre indirim
- ⚡ Erken rezervasyon indirimi

#### Database İhtiyacı:
```typescript
Hotel {
  name, address, city, country
  stars, phone, email
  contactPerson
  facilities[] // Havuz, Spa, WiFi
  roomTypes[] // Single, Double, Suite
  priceList[] // Sezonluk fiyatlar
  contractedRates // Anlaşmalı fiyat
  notes
}

HotelRoomType {
  hotelId, type, capacity
  pricePerNight, currency
  season (low/mid/high)
}
```

---

### 3. 🚗 Araç Yönetimi
**Öncelik:** 🔴 Kritik

#### Özellikler:
- ✅ Araç filosu (plaka, marka, model, yıl)
- ✅ Araç tipleri (Sedan, Minivan, Minibüs, Otobüs)
- ✅ Kapasite bilgisi
- ✅ Şoför bilgileri (adı, telefonu, ehliyet)
- ✅ Müsaitlik kontrolü
- ⚡ Araç bakım takibi (muayene, sigorta, bakım tarihi)
- ⚡ Yakıt tüketimi takibi
- ⚡ Kilometre kayıtları
- ⚡ Hasar kayıtları

#### Araç Tipleri ve Kapasiteler:
```
Sedan: 3-4 kişi (özel transferler)
Minivan: 6-8 kişi (aile turları)
Minibüs: 14-16 kişi (küçük grup)
Midibüs: 25-30 kişi (orta grup)
Otobüs: 45-50 kişi (büyük grup)
Lüks araç: VIP transferler
```

#### Database İhtiyacı:
```typescript
Vehicle {
  plate, brand, model, year
  type (CAR, VAN, MINIBUS, BUS)
  capacity
  driverName, driverPhone
  insuranceExpiry
  maintenanceDate
  notes
}

VehicleSchedule {
  vehicleId
  reservationId
  startDate, endDate
  status (AVAILABLE, BOOKED, MAINTENANCE)
}
```

---

### 4. 👨‍🏫 Rehber Yönetimi
**Öncelik:** 🔴 Kritik

#### Özellikler:
- ✅ Rehber profili (ad, soyad, telefon, email)
- ✅ Dil bilgisi (TR, EN, DE, RU, AR, FR, ES, İT, JP)
- ✅ Uzmanlık alanları (Tarihi yerler, Müzeler, Doğa)
- ✅ Sertifikalar (Profesyonel Rehber, Turist Rehberi)
- ✅ Günlük ücret
- ✅ Müsaitlik takvimi
- ⚡ Performans değerlendirme
- ⚡ Müşteri geri bildirimleri
- ⚡ Komisyon hesaplama

#### Rehber Kategorileri:
```
Profesyonel Turist Rehberi (devlet sertifikalı)
Tur Lideri (grup yönetimi)
Transfer Hostesi
Özel Alan Rehberi (müze, saray vb.)
```

#### Database İhtiyacı:
```typescript
Guide {
  firstName, lastName
  phone, email
  languages[] // ["TR", "EN", "DE"]
  specializations[] // ["History", "Museums"]
  licenseNumber
  dailyRate
  commission
  rating
}

GuideSchedule {
  guideId
  reservationId
  date
  status (AVAILABLE, BOOKED, OFF)
}
```

---

### 5. 💰 Fiyatlandırma & Paket Yönetimi
**Öncelik:** 🟡 Önemli

#### Özellikler:
- ✅ Paket tur oluşturma (günlük itinerary)
- ✅ Dinamik fiyatlandırma (kişi sayısı, sezon)
- ✅ Maliyet hesaplama
  - Otel maliyeti
  - Araç maliyeti
  - Rehber ücreti
  - Yemek maliyeti
  - Müze/aktivite giriş ücretleri
- ✅ Kar marjı belirleme
- ⚡ Multi-currency (USD, EUR, TRY)
- ⚡ Grup indirimleri
- ⚡ Erken rezervasyon indirimleri

#### Fiyat Hesaplama Örneği:
```
Kapadokya 3 Gün Turu (2 Kişi):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Otel (2 gece, DB)       : 4,000 TL
Araç (minivan, 3 gün)   : 3,500 TL
Rehber (2 gün)          : 2,000 TL
Balon turu (2 kişi)     : 8,000 TL
Yemekler                : 2,500 TL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOPLAM MALİYET          : 20,000 TL
Kar Marjı (%25)         : 5,000 TL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SATIŞ FİYATI            : 25,000 TL
Kişi Başı               : 12,500 TL
```

---

### 6. 📦 Paket Tur Şablonları
**Öncelik:** 🟡 Önemli

#### Popüler Paketler (Türkiye):
```
✈️ Kapadokya Turu (3-5 gün)
✈️ Antalya Turu (5-7 gün)
✈️ Ege Turu (7-10 gün)
✈️ Karadeniz Turu (5-7 gün)
✈️ İstanbul City Tour (1-3 gün)
✈️ Doğu Ekspresi (7 gün)
```

#### Şablon İçeriği:
```typescript
TourTemplate {
  name // "Kapadokya Turu 3 Gün"
  duration // 3 days
  dailyProgram[] {
    day: 1
    activities: ["Transfer", "Otel check-in", "Akşam yemeği"]
    meals: ["Dinner"]
    accommodation: "Cave Hotel"
  }
  inclusions[] // "2 gece konaklama", "Transferler", "Rehber"
  exclusions[] // "Uçak bileti", "Öğle yemeği"
  defaultPrice
}
```

---

### 7. 👥 Müşteri Yönetimi (CRM)
**Öncelik:** 🟡 Önemli

#### Özellikler:
- ✅ Müşteri veritabanı
- ✅ İletişim bilgileri
- ✅ Geçmiş rezervasyonlar
- ✅ Tercihler (oda tipi, yemek, aktivite)
- ✅ Özel notlar
- ⚡ Sadakat programı (puan sistemi)
- ⚡ Doğum günü/özel gün hatırlatıcıları
- ⚡ Email/SMS kampanyalar
- ⚡ Müşteri segmentasyonu (VIP, Regular, Budget)

#### Müşteri Kategorileri:
```
🌟 VIP: Yıllık 10+ rezervasyon
⭐ Regular: 3-10 rezervasyon
🔰 New: İlk rezervasyon
👨‍👩‍👧 Family: Aileler
👔 Corporate: Kurumsal
🌍 International: Yabancı turist
```

---

### 8. 💳 Finans & Ödeme Takibi
**Öncelik:** 🟡 Önemli

#### Özellikler:
- ✅ Fatura oluşturma
- ✅ Ödeme takibi (peşin, taksit)
- ✅ Alacak/Borç durumu
- ✅ Avans/Kapora sistemi
- ✅ Ödeme yöntemleri
  - Nakit
  - Kredi kartı
  - Banka transferi
  - Online ödeme (iyzico, PayTR)
- ⚡ Tedarikçi ödemeleri (otel, araç sahibi)
- ⚡ Komisyon hesaplama
- ⚡ Kar-zarar analizi

#### Ödeme Senaryoları:
```
Rezervasyon Aşamaları:
1. Teklif gönder
2. %30 kapora al (onay için)
3. %70 kalan bakiye (tur öncesi 7 gün)
4. Tur sonrası fatura kes
```

---

### 9. 📊 Raporlama & Analiz
**Öncelik:** 🟢 Yararlı

#### Raporlar:
- ✅ Günlük satış raporu
- ✅ Aylık gelir raporu
- ✅ Rezervasyon durumu (pending/confirmed/completed)
- ✅ Müşteri analizi (nereden geliyorlar)
- ✅ Popüler turlar
- ✅ Sezonluk analiz
- ⚡ Kar-zarar raporu
- ⚡ Araç/Rehber kullanım oranı
- ⚡ Excel/PDF export

---

### 10. 🔗 Entegrasyonlar
**Öncelik:** 🟢 İleri Seviye

#### Mevcut Entegrasyonlar:
- ⚡ Booking.com (otel rezervasyonları)
- ⚡ Expedia, Airbnb
- ⚡ WhatsApp Business API (müşteri iletişimi)
- ⚡ SMS Gateway (bildirimler)
- ⚡ Google Calendar (planlama)
- ⚡ Accounting software (Logo, Mikro, Paraşüt)
- ⚡ Payment gateways (iyzico, PayTR)

---

## 🎨 Ekstra Özellikler (Nice to Have)

### 📸 Fotoğraf Galerisi
- Tur fotoğrafları
- Otel görselleri
- Müşteri anıları

### 📱 Mobil Uygulama
- Mobil rezervasyon
- QR kod voucher
- Offline erişim

### 🗺️ Harita Entegrasyonu
- Google Maps
- Rota planlama
- Mesafe hesaplama

### 📋 Doküman Yönetimi
- Sözleşme şablonları
- Pasaport kopyaları
- Sigorta belgeleri

### 🤖 Otomasyon
- Otomatik email/SMS
- Hatırlatıcılar
- Follow-up mesajları

---

## 📋 BİZİM ÖNCEL İKLER

### Faz 1: Temel Kaynaklar (ŞİMDİ)
1. ✅ Otel Yönetimi
2. ✅ Araç Yönetimi
3. ✅ Rehber Yönetimi
4. ✅ Tedarikçi Yönetimi

### Faz 2: Rezervasyon (SONRA)
5. Rezervasyon Sistemi
6. Müşteri Yönetimi
7. Paket Tur Yönetimi

### Faz 3: Finans (DAHA SONRA)
8. Ödeme Takibi
9. Faturalama
10. Raporlama

---

## 🎯 İLK ADIM: KAYNAK YÖNETİMİ

### Başlayacağımız Modül:
**OTEL + ARAÇ + REHBER + TEDARİKÇİ**

### Neden Bu Sıra?
1. Rezervasyon yapmadan önce kaynaklarımız olmalı
2. Müsaitlik kontrolü için gerekli
3. Fiyat hesaplama için temel
4. Diğer modüllerin temeli

### Hedef:
- Otel ekle/düzenle/sil
- Araç ekle/düzenle/sil
- Rehber ekle/düzenle/sil
- Tedarikçi ekle/düzenle/sil
- Hepsini liste, arama, filtreleme ile göster

---

**Hazır mısın? Kaynak Yönetimi modülünü kurmaya başlayalım!** 🚀

**Sıra:**
1. Database schema oluştur
2. Backend API endpoints
3. Frontend sayfaları
4. CRUD işlemleri

**Devam edelim mi?**
