# JWT, Kimlik & Yetki Yönetimi — Kapsamlı Rehber

> Bu rehber; JWT'nin ne olduğunu, backend-frontend arasındaki token akışını,
> token'ların nerede ve neden saklandığını, güvenlik mekanizmalarını
> ve production-level best practice'leri kapsar.

---

## 1. JWT Nedir?

**JWT (JSON Web Token)** = İki taraf arasında güvenli bilgi taşıyan bir token formatı.

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.xxxxxxxxxxxxxx
│       HEADER       │       PAYLOAD        │   SIGNATURE    │
```

**3 parçadan oluşur** (nokta ile ayrılır):

| Parça         | İçerik                        | Örnek                                              |
|---------------|-------------------------------|----------------------------------------------------|
| **Header**    | Algoritma ve token tipi       | `{"alg": "HS256", "typ": "JWT"}`                   |
| **Payload**   | Kullanıcı bilgileri (claims)  | `{"sub": "user123", "role": "admin", "exp": 1720000}` |
| **Signature** | Doğrulama imzası              | Header + Payload + Secret Key ile üretilir          |

> **Kritik nokta:** Payload **şifrelenmez**, sadece Base64 ile encode edilir.
> Yani herkes okuyabilir. Ama **kimse değiştiremez** çünkü Signature bozulur.

### Payload İçindeki Claims:

```json
{
  "sub": "user-123",              // Kullanıcı ID
  "email": "kamil@example.com",   // Email
  "role": ["Admin", "Editor"],    // Roller
  "permissions": ["post:write",   // Granüler yetkiler
                  "user:read"],
  "iat": 1720000000,              // Oluşturulma zamanı
  "exp": 1720000900,              // Son kullanma (15 dk sonra)
  "iss": "kimlik-yetki-api",     // Token'ı üreten
  "aud": "kimlik-yetki-client"   // Token'ın hedef kitlesi
}
```

---

## 2. Session vs JWT

```
ESKI YÖNTEM (Session — Stateful):
┌────────┐                    ┌────────┐
│ Tarayıcı│ ── Cookie(SessionID) ──▶│ Sunucu │
│        │                    │  RAM'de │
│        │                    │ session │
│        │                    │  tutar  │
└────────┘                    └────────┘

→ Sunucu her kullanıcı için hafızada veri tutar
→ Ölçeklenmesi zor olabilir (ama Redis ile çözülebilir)
```

```
YENİ YÖNTEM (JWT — Stateless):
┌────────┐                    ┌────────┐
│ Tarayıcı│ ── JWT Token ─────▶│ Sunucu │
│ token'ı │                    │ sadece │
│ kendi   │                    │ imzayı │
│ saklar  │                    │ doğrular│
└────────┘                    └────────┘

→ Sunucu token saklamak zorunda değil
→ Sadece imza doğrular
→ Kolayca ölçeklenir
```

> ⚠️ **Önemli nüans:** JWT kullanmak = otomatik stateless DEĞİL.
> Refresh token DB'de tutuluyorsa → sistem **kısmen stateful** (hybrid) olur.
> Bu normaldir ve best practice'tir.

---

## 3. Access Token & Refresh Token — Nedir, Neden İkisi Var?

```
┌─────────────────────────────────────────────────────────┐
│                    TOKEN ÇİFTİ                          │
│                                                         │
│  ┌─────────────────┐     ┌──────────────────────┐       │
│  │  ACCESS TOKEN   │     │   REFRESH TOKEN      │       │
│  │                 │     │                      │       │
│  │  Ömür: 15-30 dk│     │  Ömür: 7-30 gün     │       │
│  │  İçerik: User  │     │  İçerik: Sadece     │       │
│  │  bilgileri,    │     │  token ID (opaque)   │       │
│  │  roller, yetkiler│   │  veya JWT formatında │       │
│  │                 │     │                      │       │
│  │  Nerede:       │     │  Nerede:             │       │
│  │  Memory (RAM)  │     │  HttpOnly Cookie     │       │
│  │                 │     │  + Backend DB        │       │
│  └─────────────────┘     └──────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

**Neden ikisi var?**

- Access Token kısa ömürlüdür → çalınsa bile az zarar verir
- Refresh Token uzun ömürlüdür → kullanıcı sürekli login olmak zorunda kalmaz
- Refresh Token ile yeni Access Token alınır
- Rotation ile her refresh'te RT de yenilenir → ikisi birlikte döner

> **Refresh token yapısı** iki türlü olabilir:
> 1. **Opaque token** (sadece ID, DB'de lookup) → daha güvenli, önerilen
> 2. **JWT formatında** (payload içerir) → daha az güvenli

---

## 4. Token Nerede Saklanır ve NEDEN?

Bu kısım JWT güvenliğinin en kritik noktası.
Yanlış yaparsan tüm sistem çöker.

### 🧠 Önce "Neresi" Sorusunu Çözelim

Kafaları karıştıran 4 yer var. Her birinin ne olduğunu, fiziksel olarak nerede
durduğunu ve kimin kontrol ettiğini bilelim:

---

### 📌 A) Memory (RAM) — Tarayıcının RAM'i

```
Bu NE?
→ React state, Vue store, veya düz bir JS değişkeni

let accessToken = "eyJhbGciOiJIUzI1NiIs...";
```

| Özellik                  | Detay                                    |
|--------------------------|------------------------------------------|
| Fiziksel konum           | Tarayıcının RAM'inde (geçici hafıza)     |
| Kim kontrol eder         | Frontend (JS kodun)                      |
| Sayfa yenilenince        | ❌ SİLİNİR                               |
| Tarayıcı kapatılınca     | ❌ SİLİNİR                               |
| JS erişebilir mi         | ✅ Evet (senin değişkenin zaten)         |
| XSS riski                | ⚠️ Düşük (direkt erişim zor)            |
| Kalıcı mı                | ❌ Hayır                                  |

> **Neden access token burada?**
> → Kısa ömürlü zaten (15 dk), kalıcı saklamaya gerek yok
> → Sayfa yenilenince kaybolur → refresh token ile tekrar alınır
> → XSS'e karşı en dayanıklı yöntem

---

### 📌 B) localStorage — Tarayıcının Kalıcı Depolaması

```
localStorage.setItem("token", "eyJ...");
localStorage.getItem("token"); // → "eyJ..."
```

| Özellik                  | Detay                                    |
|--------------------------|------------------------------------------|
| Fiziksel konum           | Tarayıcının diskinde (kalıcı)            |
| Kim kontrol eder         | Frontend (JS kodun)                      |
| Sayfa yenilenince        | ✅ KALIR                                  |
| Tarayıcı kapatılınca     | ✅ KALIR                                  |
| JS erişebilir mi         | ✅ Evet — `localStorage.getItem("token")` |
| XSS riski                | 🔴 ÇOK YÜKSEK                            |

> **⛔ ASLA TOKEN SAKLAMA**
> XSS saldırısında `localStorage.getItem("token")` ile token çalınır.
> En yaygın JWT güvenlik hatası budur.

---

### 📌 C) HttpOnly Cookie — Tarayıcının Güvenli Kutusu

```
Backend gönderir:
Set-Cookie: refreshToken=BBB123; HttpOnly; Secure; SameSite=Strict

Tarayıcı saklar ve sonraki isteklere otomatik ekler:
Cookie: refreshToken=BBB123
```

| Özellik                  | Detay                                    |
|--------------------------|------------------------------------------|
| Fiziksel konum           | Tarayıcının cookie storage'ında          |
| Kim kontrol eder         | Backend oluşturur, browser saklar        |
| Sayfa yenilenince        | ✅ KALIR                                  |
| Tarayıcı kapatılınca     | Expires'a bağlı                          |
| JS erişebilir mi         | ❌ HAYIR (`document.cookie` ile bile görünmez) |
| XSS riski                | ✅ GÜVENLİ (JS erişemez)                 |
| Otomatik gönderilir mi   | ✅ EVET (browser her istekte ekler)      |

> **Neden refresh token burada?**
> → Uzun ömürlü (7-30 gün), güvenli saklanması şart
> → JS asla erişemez → XSS'e karşı güvenli
> → Browser otomatik gönderir → frontend'in bilmesine gerek yok

#### Cookie Parametreleri Ne İşe Yarıyor?

```
Set-Cookie: refreshToken=BBB123;
  HttpOnly;        → JS erişemez (XSS koruması)
  Secure;          → Sadece HTTPS üzerinden gönderilir
  SameSite=Strict; → Başka sitelerden gelen isteklerde gönderilmez (CSRF koruması)
  Path=/;          → Hangi endpoint'lerde geçerli
  Expires=...      → Ne zaman silinecek
```

#### ❓ "HttpOnly cookie'ye erişemiyorsak, ben tarayıcımdan bile alamaz mıyım?"

**❌ Hayır.**

```javascript
document.cookie  // → refreshToken GÖRÜNMEZ
```

**Gönderilmesi ≠ okunabilmesi.**

Benzetme:
```
Cookie = kapalı zarf
Browser = kurye

Kurye zarfı taşır ✔️ → ama içini açamaz ❌
Sen (JS) zarfın içini göremezsin ❌ → ama gönderildiğini bilirsin ✔️
```

---

### 📌 D) Database (DB) — Backend Tarafı

```
PostgreSQL, MongoDB, MySQL, veya Redis
→ Backend sunucusunda çalışır
→ Tamamen backend kontrolünde
```

| Özellik                  | Detay                                    |
|--------------------------|------------------------------------------|
| Fiziksel konum           | Backend sunucusu                         |
| Kim kontrol eder         | Backend                                  |
| Frontend erişir mi       | ❌ HAYIR (sadece API üzerinden)          |

> **Neden refresh token DB'de de tutuluyor?**
> → Logout yapınca iptal edebilmek için
> → Çalınırsa revoke (geçersiz kılma) edebilmek için
> → Rotation kontrolü için

---

### 📌 E) Redis — Backend'in Hızlı Hafızası

```
Redis = sunucu tarafında çalışan RAM tabanlı veritabanı
```

| Özellik                  | Detay                                    |
|--------------------------|------------------------------------------|
| Fiziksel konum           | Backend sunucusu (RAM)                   |
| Hızı                     | ⚡ DB'den çok daha hızlı                |
| Kalıcı mı                | Geçici (TTL ile otomatik silinir)        |

JWT sisteminde Redis kullanım alanları:
1. **Refresh token saklamak** (DB yerine, daha hızlı)
2. **Token blacklist** (logout sonrası token'ı geçersiz kılma)
3. **Rate limiting** (brute force engelleme)

> ⚠️ "Tarayıcı RAM'i" ile "sunucu RAM'i (Redis)" tamamen farklı şeylerdir:
> - Tarayıcı RAM = frontend, kullanıcının bilgisayarında
> - Redis = backend, sunucuda

---

### 🧩 ÖZET TABLO — Her Şey Bir Arada

| Veri           | Nerede Saklanır       | Kim Kontrol Eder | Neden Orada              |
|----------------|-----------------------|-------------------|--------------------------|
| Access Token   | Tarayıcı RAM (memory) | Frontend          | XSS'e dayanıklı, kısa ömürlü |
| Refresh Token  | HttpOnly Cookie       | Browser + Backend | JS erişemez, güvenli     |
| Refresh Token  | DB / Redis            | Backend           | Revoke, logout, kontrol  |

---

## 5. ❓ "Access Token Neden Cookie'de Saklanmıyor?"

İlk bakışta mantıklı geliyor: "Madem cookie güvenli → her şeyi oraya koyalım"

**Ama 2 büyük problem var:**

### 🔴 Problem 1: CSRF Saldırısı

**CSRF = Cross-Site Request Forgery**
= Başka bir site, senin login olduğun siteye SENİN ADINA istek attırır.

Cookie'lerin en büyük özelliği:
**Browser, o domain'e giden HER istekte cookie'yi otomatik ekler — sen istemesen bile.**

#### 💣 CSRF Senaryo (Adım Adım):

**1) Sen bankaya login oldun:**
```
bank.com → Set-Cookie: accessToken=AAA
Artık tarayıcıda: Cookie → accessToken=AAA
```

**2) Sonra kötü bir siteye girdin (evil.com):**

**3) O sitede şu HTML var:**
```html
<form action="https://bank.com/api/transfer" method="POST">
  <input name="toAccount" value="hacker123">
  <input name="amount" value="10000">
</form>

<script>
  document.forms[0].submit();   // ← form otomatik gönderilir
</script>
```

**`method="POST"` ne yapıyor?**
→ "Bu form gönderildiğinde bank.com'a POST isteği at" demek.

**4) Browser ne yapıyor?**
```
POST /api/transfer HTTP/1.1
Host: bank.com
Cookie: accessToken=AAA    ← BROWSER OTOMATİK EKLEDİ!

toAccount=hacker123&amount=10000
```

**5) Backend ne görüyor?**
```
"Cookie'de geçerli access token var → bu kullanıcı login → işlemi yap"
💥 PARA GİTTİ
```

> **Kritik nokta:**
> Sen bu isteği atmadın.
> evil.com bu isteği attırdı.
> Ama browser cookie'yi otomatik ekledi.
> Backend farkı anlayamadı.

#### ✅ Header İle Neden Bu Sorun Yok?

```
Authorization: Bearer AAA
```

Bu header'ı:
- ❌ Browser otomatik eklemez
- ❌ evil.com ekleyemez (token'ı bilmiyor, memory'den okuyamaz)
- ✅ Sadece SENİN frontend kodun bilinçli olarak ekler

```javascript
// evil.com bunu yapamaz çünkü AAA'yı bilmiyor:
fetch("https://bank.com/api/transfer", {
  headers: { Authorization: "Bearer AAA" }  // AAA'yı nereden bilecek?
})
```

#### ⚖️ Net Karşılaştırma:

| Özellik                 | Cookie          | Header (Bearer)  |
|-------------------------|-----------------|------------------|
| Otomatik gönderilir     | ✅ Evet         | ❌ Hayır         |
| CSRF riski              | 🔴 Yüksek      | ✅ Yok           |
| Bilinçli eklenir        | ❌ Hayır        | ✅ Evet          |

### 🔴 Problem 2: Kontrol

- **Cookie:** Browser kendi gönderir → kontrol sende değil
- **Header:** Frontend bilinçli ekler → kontrol sende

> **Sonuç:**
> Access Token → Header'da (memory'den) → CSRF riski yok
> Refresh Token → Cookie'de → ama sadece /refresh endpoint'inde kullanılır

---

## 6. ❓ "Cookie Otomatik Gidiyorsa, Biri Refresh Çağırıp Token Çalamaz mı?"

Bu çok kritik bir soru. Cevap:

**⚠️ Evet, /refresh'e istek attırılabilir (CSRF ile)
❌ Ama access token çalınamaz (doğru sistemde)**

#### Senaryo:

```
evil.com → POST /refresh attırır
Browser  → Cookie: refreshToken=BBB otomatik ekler
Backend  → Yeni access token üretir: { "accessToken": "NEW_AAA" }
```

**Ama bu response'u evil.com okuyabilir mi?**

**❌ HAYIR.**

#### Neden Okuyamaz?

**Same-Origin Policy (SOP)** = Tarayıcı güvenlik kuralı:

> "Bir site, BAŞKA domain'den gelen response'u OKUYAMAZ"

```
evil.com → bank.com'a istek attırabilir ✔️
evil.com → bank.com'dan gelen cevabı okuyamaz ❌
```

#### Saldırganın Elinde Ne Var?

| İşlem                    | Yapabilir mi? |
|--------------------------|---------------|
| Refresh request attırmak | ✅ Evet       |
| Cookie göndermek          | ✅ Evet (otomatik) |
| Response'u okumak         | ❌ Hayır (SOP) |
| Access token'ı almak     | ❌ Hayır       |
| Kullanıcı adına işlem    | ❌ Hayır       |

#### Ek Koruma: SameSite Cookie

```
Set-Cookie: refreshToken=BBB; SameSite=Strict
```

Bu durumda evil.com'dan gelen isteklerde cookie hiç gönderilmez bile.

> **Özet:** Cookie otomatik gider ama cevap okunamaz.
> SameSite ile cookie'nin gönderilmesi de engellenir.

---

## 7. `credentials: "include"` Ne Demek?

Frontend'de fetch kullanırken:

```javascript
// ❌ Varsayılan — cookie GÖNDERİLMEZ (farklı domain/port ise)
fetch("https://api.com/refresh")

// ✅ Doğru — cookie gönderilir
fetch("https://api.com/refresh", {
  method: "POST",
  credentials: "include"   // ← "Bu isteğe cookie'leri de ekle"
})
```

**Ne zaman gerekli?**

Özellikle frontend ve backend farklı port/domain'de ise:
```
Frontend → localhost:3000
Backend  → localhost:5000
```

> `credentials: "include"` olmazsa → cookie gitmez → refresh çalışmaz

---

## 8. Tam Kimlik Doğrulama Akışı

### ADIM 1: LOGIN

```
  Kullanıcı              Frontend (Next.js)            Backend (.NET)
  ─────────              ──────────────────            ──────────────
  email + şifre  ───▶  POST /api/auth/login  ────▶   1. Email/şifre doğrula
                        credentials: "include"         2. Access Token üret
                                                       3. Refresh Token üret
                                                       4. Refresh Token → DB'ye kaydet
                        ◀──────────────────────────    5. Response:
                                                          Body: { accessToken: "AAA" }
                                                          Set-Cookie: refreshToken=BBB
                                                            (HttpOnly, Secure, SameSite)

                        6. accessToken → memory (JS değişkeni)
                           refreshToken → browser otomatik sakladı (cookie)
```

**Bu noktada nerede ne var?**

| Veri           | Nerede              |
|----------------|---------------------|
| Access Token   | Frontend RAM        |
| Refresh Token  | Browser Cookie      |
| Refresh Token  | Backend DB          |

---

### ADIM 2: NORMAL API İSTEĞİ

```
  Frontend                                          Backend
  ────────                                          ───────
  GET /api/profile
  Authorization: Bearer AAA        ──────────▶    1. Access token'ı al
  Cookie: refreshToken=BBB (otomatik)              2. İmzayı doğrula
                                                    3. Süresini kontrol et
                                                    4. Payload'dan user bilgisi çıkar
                                                    5. Yetki kontrolü yap
                                   ◀──────────    6. { name: "Kamil", ... }
```

> ⚠️ **Önemli:** Backend bu istekte **sadece access token'a bakar**.
> Cookie'deki refresh token **gider ama kullanılmaz** (görmezden gelinir).

| Veri           | Gidiyor mu? | Kullanılıyor mu? |
|----------------|-------------|------------------|
| Access Token   | ✅          | ✅               |
| Refresh Token  | ✅ (otomatik) | ❌ (ignore edilir) |

---

### ADIM 3: TOKEN YENİLEME (Access Token Süresi Dolduğunda)

> ❌ Tarayıcı /refresh isteğini OTOMATİK ATMAZ
> ✅ Bu isteği SEN (frontend kodun) yazarsın

```
  Frontend                                          Backend
  ────────                                          ───────
  GET /api/profile → 401 Unauthorized 💥

  "Access token expired" → Frontend bunu yakalar (interceptor)

  Otomatik olarak (SENİN KODUN):
  POST /api/auth/refresh
  credentials: "include"
  Cookie: refreshToken=BBB (browser ekler)  ────▶  1. Cookie'den refresh token al
                                                    2. DB'de var mı kontrol et
                                                    3. Geçerli mi kontrol et
                                                    4. YENİ access token üret
                                                    5. Rotation: eski RT'yi DB'den sil
                                                    6. YENİ refresh token üret → DB'ye kaydet
                                                    7. Yeni RT'yi Set-Cookie ile gönder
                                    ◀──────────    8. { accessToken: "NEW_AAA" }
                                                      + Set-Cookie: refreshToken=NEW_BBB

  Yeni AT'yi memory'ye kaydet
  Yeni RT → browser otomatik sakladı (cookie güncellendi)
  Başarısız olan isteği YENİ token ile tekrarla ──▶ 200 OK ✓
```

---

### ADIM 4: LOGOUT

```
  Frontend                                          Backend
  ────────                                          ───────
  POST /api/auth/logout             ──────────▶    1. Refresh token'ı DB'den sil
  credentials: "include"                            2. Cookie'yi temizle (Set-Cookie: "")
                                    ◀──────────
  Access token'ı memory'den sil (değişkeni null yap)
  Login sayfasına yönlendir
```

---

## 9. Refresh Token Rotation (Best Practice — Zorunlu Gibi Düşün)

> ⚠️ Bu "opsiyonel" değil — production sistemlerde **şiddetle önerilir**.

### Nasıl Çalışır?

Her refresh isteğinde:
1. Eski refresh token **iptal edilir**
2. **Yeni** refresh token verilir

```
NORMAL AKIŞ:

  Client              Backend
    │                    │
    │── RT-1 ──────────▶│  RT-1 geçerli ✓ → sil
    │◀── AT + RT-2 ─────│  RT-2'yi kaydet
    │                    │
    │── RT-2 ──────────▶│  RT-2 geçerli ✓ → sil
    │◀── AT + RT-3 ─────│  RT-3'ü kaydet
```

### Çalınma Senaryosu (Neden Rotation Şart):

```
  Saldırgan RT-2'yi çaldı!

  Client              Backend              Saldırgan
    │                    │                      │
    │── RT-3 ──────────▶│  RT-3 geçerli ✓      │
    │◀── AT + RT-4 ─────│  RT-3 silindi         │
    │                    │                      │
    │                    │◀────── RT-2 ─────────│ ← Çalınan eski token!
    │                    │                      │
    │                    │  RT-2 zaten kullanıldı│
    │                    │  ⚠️ ALARM!            │
    │                    │  Tüm token ailesini   │
    │                    │  iptal et!            │
    │                    │                      │
    │                    │──── 401 ────────────▶│ ← Saldırgan engellendi
    │◀── 401 ───────────│                      │ ← Client da yeniden login
```

> **Mantık:** Eğer "zaten kullanılmış" bir refresh token tekrar geliyorsa
> → biri çalmış demektir → O kullanıcının TÜM token'larını iptal et.

---

## 10. ❓ "Access Token Geçerli Ama Refresh Token Geçersiz — Ne Olur?"

Bu gerçek bir senaryo:

| Durum                          | Sonuç                           |
|--------------------------------|---------------------------------|
| AT geçerli + RT geçerli       | ✅ Her şey çalışır              |
| AT geçerli + RT geçersiz      | ⚠️ Şu an çalışır, ama...       |
| AT expired + RT geçerli       | ✅ Refresh ile yenilenir        |
| AT expired + RT geçersiz      | ❌ Logout — login sayfasına git |

**Senaryo akışı:**

```
1. Access token geçerli → API istekleri çalışır ✔️
   (Backend refresh token'a bakmaz bile)

2. 15-30 dk sonra access token expire olur

3. Frontend /refresh çağırır

4. Backend: refresh token geçersiz → 401

5. Frontend: refresh başarısız → kullanıcıyı logout et
```

> **Mantık:**
> Access token = "şu an giriş yapmış mı?"
> Refresh token = "giriş yapmaya DEVAM edebilir mi?"

---

## 11. Token Yaşam Döngüsü — "Refresh Token Evet/Hayır Diyor"

> **Ana fikir:**
> Normal süreçte AT ve RT birlikte yenilenir, sistem devam eder.
> Refresh token güvenlik ve logout'u kontrol eder.
> Refresh token "hayır" derse → sistem durur.

> **Önemli nüans — Yenilenme tetikleyicisi farklıdır:**
> - Access Token → kendi süresi dolunca yenilenir (expire olması SEBEBİDİR)
> - Refresh Token → kendi süresi dolduğu için DEĞİL, access token yenilenirken YANINDA yenilenir (rotation)
> - Yani RT "sürem doldu, yenile beni" demez. AT expire olduğunda refresh endpoint çağrılır, RT de güvenlik gereği o anda yenilenir.

### NORMAL SÜREÇ — Her Şey Yolunda

```
LOGIN
═════

  email + şifre ──▶ Backend doğruladı ──▶ İkisini birlikte üret:
                                            AT-1 → frontend memory
                                            RT-1 → cookie + DB

API İSTEKLERİ (15 dk boyunca)
══════════════════════════════

  İstek 1: Bearer AT-1 ──▶ imza doğru, süre var ──▶ 200 OK ✅
  İstek 2: Bearer AT-1 ──▶ imza doğru, süre var ──▶ 200 OK ✅
  İstek 3: Bearer AT-1 ──▶ imza doğru, süre var ──▶ 200 OK ✅
  ...

  RT-1 bu sırada ne yapıyor? → HİÇBİR ŞEY. Cookie'de oturuyor. Bekliyor.

AT-1 EXPIRED — YENİLENME ZAMANI
════════════════════════════════

  İstek: Bearer AT-1 ──▶ 401 (süre dolmuş)

  Frontend: "refresh yapayım"
  POST /refresh → Cookie: RT-1

  Backend:
    RT-1 DB'de var mı?     → ✅ EVET
    RT-1 süresi geçmiş mi? → ✅ HAYIR

    → Refresh token "EVET, devam edebilirsin" dedi ✅

    İKİSİNİ BİRLİKTE YENİLE:
      AT-1 → AT-2 (yeni access token)
      RT-1 → RT-2 (rotation — yeni refresh token)

  Sonuç: Kullanıcı hiçbir şey farketmedi. Sistem devam ediyor.

AT-2 EXPIRED — YİNE YENİLENME
══════════════════════════════

  Aynı döngü tekrarlanır:
    RT-2 → "evet" ✅ → AT-3 + RT-3
    RT-3 → "evet" ✅ → AT-4 + RT-4
    RT-4 → "evet" ✅ → AT-5 + RT-5
    ...

  → Bu döngü SONSUZA KADAR devam edebilir
  → Kullanıcı aylar boyunca logout olmayabilir
  → Çünkü her seferinde refresh token "evet" diyor
```

### SİSTEMİN DURDUĞU ANLAR — Refresh Token "HAYIR" Diyor

**DURUM 1: Logout**

```
Kullanıcı "çıkış yap" butonuna bastı

POST /logout → Cookie: RT-6

Backend: RT-6'yı DB'DEN SİL
         Cookie'yi temizle

Sonra kullanıcı geri geldi:

POST /refresh → Cookie: (cookie silindi)

Backend: Cookie yok → 401

→ Refresh token "HAYIR" dedi ❌
→ LOGOUT
```

**DURUM 2: Refresh Token Expired (7 gün girmedi)**

```
Kullanıcı 7 gün boyunca siteye girmedi
AT çoktan expired (15 dk'da gitti zaten)
RT de expired (7 gün doldu)

Kullanıcı siteye girdi:

POST /refresh → Cookie: RT-6

Backend:
  RT-6 DB'de var mı?     → ✅ EVET
  RT-6 süresi geçmiş mi? → ❌ EVET, 7 GÜN DOLMUŞ

  → Refresh token "HAYIR, sürem bitti" dedi ❌
  → 401 Unauthorized

→ LOGOUT → Login sayfasına git
```

**DURUM 3: Token Çalınmış (Rotation Tespiti)**

```
Saldırgan eski RT-3'ü çalmıştı
Ama kullanıcı çoktan RT-6'ya geçti (rotation)

Saldırgan deniyor:
POST /refresh → Cookie: RT-3

Backend:
  RT-3 DB'de var mı? → ❌ HAYIR (rotation ile silinmişti)

  → Refresh token "HAYIR, bu token geçersiz" dedi ❌
  → ALARM: Eski token tekrar geldi = çalınma şüphesi
  → Kullanıcının TÜM token'larını sil

→ Saldırgan engellendi
→ Kullanıcı da güvenlik için logout edildi
```

**DURUM 4: Admin Zorla Çıkardı**

```
Admin panelinden "bu kullanıcının oturumunu kapat" dedi
Backend: RT-6'yı DB'den sil

Kullanıcı bir sonraki refresh'te:

POST /refresh → Cookie: RT-6

Backend:
  RT-6 DB'de var mı? → ❌ HAYIR (admin sildi)

  → Refresh token "HAYIR" dedi ❌
  → LOGOUT
```

### TEK TABLODA ÖZET

| DURUM | REFRESH TOKEN NE DİYOR? | SONUÇ |
|---|---|---|
| AT expired, RT geçerli | ✅ "Evet, devam et" | Yenilen |
| AT expired, RT geçerli | ✅ "Evet, devam et" | Yenilen |
| ... (bu sonsuza kadar gider) | | |
| Logout (DB'den silindi) | ❌ "Hayır" | LOGOUT |
| RT expired (7 gün doldu) | ❌ "Hayır" | LOGOUT |
| Eski token geldi (çalınma) | ❌ "Hayır" + ALARM | LOGOUT |
| Admin sildi | ❌ "Hayır" | LOGOUT |

> **Bir cümlede:**
> Access token = "şu an çalışan motor"
> Refresh token = "motoru yenileme izni"
>
> Motor bozulunca (expire) → izin varsa yenile, devam et
> İzin yoksa (expire / logout / çalınma) → araç durur
>
> Refresh token'ın tek görevi: "Devam edebilir misin?" sorusuna evet ya da hayır demek.

---

## 12. Tarayıcıda Token'ları Ne Siler?

### Access Token (Memory / RAM)

Çok kolay ölür — çünkü sadece bir JS değişkeni:

```javascript
let accessToken = "AT-1";   // ← bu kadar, başka bir yerde yok
```

| Durum | Silinir mi? | Neden |
|---|---|---|
| Sayfa yenileme (F5) | ✅ SİLİNİR | RAM temizlenir, JS değişkeni sıfırlanır |
| Tarayıcı kapatma | ✅ SİLİNİR | RAM tamamen gider |
| Sekme kapatma | ✅ SİLİNİR | O sekmenin RAM'i gider |
| Başka sayfaya gitme | Duruma bağlı | SPA ise kalır, sayfa değişirse silinir |
| Inspect → Console | ❌ SİLİNMEZ | Inspect açmak RAM'i etkilemez |
| Inspect → Application | ❌ SİLİNMEZ | Memory burada görünmez bile |
| Bilgisayar uyku modu | ❌ SİLİNMEZ | RAM korunur |
| Bilgisayar kapanma | ✅ SİLİNİR | RAM gider |

> **Özet:** RAM'e dokunan her şey siler. Ama silinse bile refresh token ile geri gelir.

### Refresh Token (HttpOnly Cookie)

Daha dayanıklı — çünkü tarayıcının disk'inde saklanır:

| Durum | Silinir mi? | Neden |
|---|---|---|
| Sayfa yenileme (F5) | ❌ KALIR | Cookie disk'te, RAM'de değil |
| Sekme kapatma | ❌ KALIR | Cookie sekmeye bağlı değil |
| Tarayıcı kapatma (Expires varsa) | ❌ KALIR | Disk'te kalır, Expires tarihine kadar yaşar |
| Tarayıcı kapatma (Session cookie ise) | ✅ SİLİNİR | Session cookie = tarayıcı kapanınca ölür |
| Inspect → Application → Cookie → sağ tık → Delete | ✅ SİLİNİR | Elle sildin |
| Inspect → Application → Clear site data | ✅ SİLİNİR | Her şeyi temizler |
| Tarayıcı ayarları → "Çerezleri temizle" | ✅ SİLİNİR | Tüm cookie'ler gider |
| Gizli sekme (incognito) kapatma | ✅ SİLİNİR | Gizli sekme hiçbir şey saklamaz |
| Bilgisayar kapanma | ❌ KALIR | Cookie disk'te |

> **Best practice:** Cookie'ye `Expires` her zaman koyulur (7-30 gün), bu yüzden
> tarayıcı kapatılsa bile cookie kalır.

### Tarayıcı Kapatma — Expires Detayı

```
Cookie'nin Expires değeri VARSA:
  Set-Cookie: refreshToken=RT-1; Expires=2026-04-15

  Tarayıcı kapatıldı → ❌ SİLİNMEZ (disk'te kalır)
  15 Nisan'a kadar yaşar

Cookie'nin Expires değeri YOKSA (Session Cookie):
  Set-Cookie: refreshToken=RT-1

  Tarayıcı kapatıldı → ✅ SİLİNİR

  AMA: Modern tarayıcılar "oturumu geri yükle" özelliği ile
       bazen session cookie'leri de geri getirir
```

### Inspect'te Elle Silme Senaryoları

**Cookie Silme:**

```
F12 → Application → Cookies → sağ tık → Delete

Cookie silindi → refresh çalışmaz → AT expire olunca → LOGOUT
```

**Clear Site Data:**

```
F12 → Application → sol menüde "Clear site data" butonu

  Cookie      ✅ silindi
  localStorage ✅ silindi
  sessionStorage ✅ silindi
  Cache        ✅ silindi

  → Her şey gitti → LOGOUT
```

**Console'dan Silme Denemesi:**

```javascript
// HttpOnly cookie'yi JS ile silemezsin:
document.cookie = "refreshToken=; expires=past"  // ❌ İŞE YARAMAZ

// Çünkü HttpOnly → JS dokunamaz (silme dahil)
```

### Her Senaryo Sonrası Ne Olur? — Özet Tablo

| DURUM | AT | RT | SONUÇ |
|---|---|---|---|
| F5 (sayfa yenileme) | ❌ gitti | ✅ duruyor | refresh → yeni AT, kullanıcı farketmez |
| Sekme kapatıp açma | ❌ gitti | ✅ duruyor | refresh → yeni AT, kullanıcı farketmez |
| Tarayıcı kapatıp açma (Expires varsa) | ❌ gitti | ✅ duruyor (disk'te) | refresh → yeni AT, kullanıcı farketmez |
| Tarayıcı kapatıp açma (Session cookie ise) | ❌ gitti | ❌ gitti | LOGOUT |
| Inspect → cookie sil | ✅ duruyor | ❌ gitti | AT expire olunca refresh yok → LOGOUT |
| Clear site data | ❌ gitti | ❌ gitti | LOGOUT |
| Çerezleri temizle (tarayıcı ayarları) | ✅ duruyor | ❌ gitti | AT expire olunca → LOGOUT |
| Gizli sekme kapatma | ❌ gitti | ❌ gitti | LOGOUT |
| 15 dk hiçbir şey yapma | ❌ expired | ✅ duruyor | refresh → yeni AT |
| 7 gün hiç girmeme | ❌ expired | ❌ expired | LOGOUT |

> **Mantık tek cümle:**
> AT gittiyse + RT duruyorsa → sorun yok, refresh ile geri gelir
> RT gittiyse → ne olursa olsun LOGOUT
> Refresh token ayakta olduğu sürece sistem devam eder. Düştüğü an sistem durur.

---

## 13. Next.js + .NET — Gerçek Kod Örneği

### Backend (.NET) — Login

```csharp
[HttpPost("login")]
public IActionResult Login(LoginRequest request)
{
    // 1. Kullanıcı doğrula
    var user = _authService.ValidateUser(request);
    if (user == null) return Unauthorized();

    // 2. Access token üret (kısa ömürlü)
    var accessToken = _jwtService.GenerateAccessToken(user);

    // 3. Refresh token üret
    var refreshToken = _jwtService.GenerateRefreshToken();

    // 4. DB'ye kaydet
    _db.RefreshTokens.Add(new RefreshToken {
        Token = refreshToken,
        UserId = user.Id,
        ExpiryDate = DateTime.UtcNow.AddDays(7)
    });
    _db.SaveChanges();

    // 5. Refresh token'ı HttpOnly cookie olarak gönder
    Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
    {
        HttpOnly = true,       // JS erişemez
        Secure = true,         // Sadece HTTPS
        SameSite = SameSiteMode.Strict,  // CSRF koruması
        Expires = DateTime.UtcNow.AddDays(7)
    });

    // 6. Access token'ı body'de gönder
    return Ok(new { accessToken = accessToken });
}
```

### Backend (.NET) — Refresh

```csharp
[HttpPost("refresh")]
public IActionResult Refresh()
{
    // 1. Cookie'den refresh token al
    var refreshToken = Request.Cookies["refreshToken"];
    if (refreshToken == null) return Unauthorized();

    // 2. DB'de kontrol et
    var tokenInDb = _db.RefreshTokens
        .Include(x => x.User)
        .FirstOrDefault(x => x.Token == refreshToken
                          && x.ExpiryDate > DateTime.UtcNow);

    if (tokenInDb == null) return Unauthorized();

    // 3. Rotation: eski token'ı sil
    _db.RefreshTokens.Remove(tokenInDb);

    // 4. Yeni refresh token üret
    var newRefreshToken = _jwtService.GenerateRefreshToken();
    _db.RefreshTokens.Add(new RefreshToken {
        Token = newRefreshToken,
        UserId = tokenInDb.UserId,
        ExpiryDate = DateTime.UtcNow.AddDays(7)
    });
    _db.SaveChanges();

    // 5. Yeni cookie gönder
    Response.Cookies.Append("refreshToken", newRefreshToken, new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = DateTime.UtcNow.AddDays(7)
    });

    // 6. Yeni access token üret
    var newAccessToken = _jwtService.GenerateAccessToken(tokenInDb.User);
    return Ok(new { accessToken = newAccessToken });
}
```

### Frontend (Next.js) — Auth Service

```typescript
// ============================================
// ACCESS TOKEN STORE (Memory / RAM)
// ============================================
let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string) => { accessToken = token; },
  clear: () => { accessToken = null; }
};

// ============================================
// LOGIN
// ============================================
export async function login(email: string, password: string) {
  const res = await fetch("https://api.com/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include"  // ← cookie'leri kabul et
  });

  if (!res.ok) throw new Error("Login failed");

  const data = await res.json();
  tokenStore.set(data.accessToken);  // ← RAM'e kaydet
  // refreshToken → browser cookie'ye otomatik kaydetti (Set-Cookie)
}

// ============================================
// REFRESH TOKEN
// ============================================
export async function refreshAccessToken(): Promise<boolean> {
  const res = await fetch("https://api.com/auth/refresh", {
    method: "POST",
    credentials: "include"  // ← cookie (refreshToken) otomatik gider
  });

  if (!res.ok) return false;

  const data = await res.json();
  tokenStore.set(data.accessToken);  // ← yeni AT RAM'e
  // Yeni RT → backend Set-Cookie ile gönderdi, browser otomatik güncelledi (rotation)
  return true;
}

// ============================================
// YETKİLİ API İSTEĞİ (interceptor mantığı)
// ============================================
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // 1. Access token'ı header'a ekle
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${tokenStore.get()}`
    },
    credentials: "include"
  });

  // 2. Token expired → refresh dene
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // 3. Yeni token ile tekrar dene
      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${tokenStore.get()}`
        },
        credentials: "include"
      });
    } else {
      // 4. Refresh de başarısız → logout
      tokenStore.clear();
      window.location.href = "/login";
    }
  }

  return res.json();
}

// ============================================
// UYGULAMA BAŞLANGIÇI (sayfa yenilendiğinde)
// ============================================
export async function initAuth() {
  // Sayfa yenilenince RAM boşalır
  // Refresh token cookie'de hâlâ var → yeni access token al
  const success = await refreshAccessToken();
  if (!success) {
    window.location.href = "/login";
  }
}

// ============================================
// LOGOUT
// ============================================
export async function logout() {
  await fetch("https://api.com/auth/logout", {
    method: "POST",
    credentials: "include"
  });
  tokenStore.clear();
  window.location.href = "/login";
}
```

---

## 14. Eşzamanlı İstekler — Refresh Lock

```
  Aynı anda 5 API isteği → hepsi 401 aldı

  ❌ YANLIŞ: 5 kere /refresh endpoint'ine istek at
  ✅ DOĞRU:  Sadece 1 refresh isteği yap, diğer 4'ü beklet
             Yeni token gelince hepsini tekrarla
```

```typescript
let refreshPromise: Promise<boolean> | null = null;

async function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
```

---

## 15. Yetkilendirme Modelleri

```
ROLE-BASED (RBAC)                    PERMISSION-BASED (Claims)
═══════════════════                  ═══════════════════════════

  Admin ──── Tüm yetkiler            user:read    ── Kullanıcı okuma
  Editor ─── post:write, read        user:write   ── Kullanıcı yazma
  User ───── post:read               post:write   ── Yazı yazma

  ✅ Basit uygulamalar için           ✅ Karmaşık uygulamalar için
  ❌ Esnek değil                      ✅ Granüler kontrol
```

**Best Practice:** İkisini birlikte kullan.
Role ile genel grupla, Permission ile ince ayar yap.

### Backend'de Yetki Kontrolü (.NET):

```
Her istek geldiğinde:

  JWT Middleware           → Token doğrula, Claims'leri HttpContext.User'a ata
       ↓
  Authorization Middleware → [Authorize(Roles = "Admin")]
                             [Authorize(Policy = "CanEditPosts")]
       ↓
  Controller               → var userId = User.FindFirst("sub").Value;
```

---

## 16. Güvenlik Best Practices — Kontrol Listesi

### TOKEN

- ✅ Access Token ömrü: **15-30 dakika** (asla uzun tutma)
- ✅ Refresh Token ömrü: **7-30 gün**
- ✅ Güçlü imzalama: **RS256** (asimetrik) veya **HS256** (simetrik)
- ✅ Secret key **en az 256-bit**
- ✅ Token'a hassas veri koyma (şifre, kredi kartı vs.)

### SAKLAMA

- ✅ Access Token → **Memory** (JS değişkeni)
- ✅ Refresh Token → **HttpOnly + Secure + SameSite Cookie**
- ✅ Cookie'ye **Expires** her zaman koy (7-30 gün) → tarayıcı kapatılsa bile cookie kalır
- ❌ localStorage veya sessionStorage'a token **KOYMA**

### REFRESH TOKEN

- ✅ **Rotation: Her kullanımda yeni refresh token üret** (opsiyonel değil, şiddetle önerilen)
- ✅ Eski refresh token'ı hemen geçersiz kıl
- ✅ Refresh token'ları **DB/Redis'te tut** (revoke edebilmek için)
- ✅ **Aile tespiti:** Çalınmış eski token kullanılırsa → tüm token'ları iptal et

### GENEL

- ✅ **HTTPS zorunlu** (Secure flag)
- ✅ **CORS ayarlarını sıkı tut**
- ✅ **SameSite=Strict** cookie'lerde
- ✅ **Rate limiting** (brute force koruması)
- ✅ **CSRF koruması** (özellikle refresh endpoint için)
- ✅ Logout'ta refresh token'ı DB'den sil

---

## 17. Büyük Resim — Her Şey Bir Arada

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                       │
│   KULLANICI          FRONTEND (Next.js)          BACKEND (.NET)       │
│                                                                       │
│   ┌──────┐           ┌──────────────────┐       ┌──────────────────┐ │
│   │Login │──email───▶│                  │─POST─▶│ Auth Controller  │ │
│   │Formu │  şifre    │  Auth Service    │ /login│                  │ │
│   └──────┘           │                  │◀──────│ • Şifre doğrula  │ │
│                      │  • AT → memory   │ AT    │ • AT üret        │ │
│                      │  • RT → cookie   │ +RT   │ • RT üret        │ │
│                      │    (otomatik)    │(cookie)│ • RT → DB        │ │
│                      └────────┬─────────┘       └────────┬─────────┘ │
│                               │                          │            │
│   ┌──────┐           ┌───────▼──────────┐       ┌───────▼──────────┐ │
│   │Sayfa │◀──data────│                  │─GET──▶│ JWT Middleware   │ │
│   │      │           │  fetchWithAuth   │+Bearer│ → imza doğrula   │ │
│   │      │           │  (interceptor)   │ AT    │ → expire kontrol │ │
│   └──────┘           │                  │◀──────│ → authorize      │ │
│                      │  401 → refresh   │ 200   │ → controller     │ │
│                      │  → retry         │       └──────────────────┘ │
│                      │                  │                             │
│                      │  Refresh sırasında:                           │
│                      │  • AT yenilenir (body)                        │
│                      │  • RT yenilenir (Set-Cookie, rotation)        │
│                      └──────────────────┘                             │
│                                                                       │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │                    GÜVENLIK KATMANLARI                        │    │
│   │  • SOP: evil.com response okuyamaz                           │    │
│   │  • HttpOnly: JS cookie'ye erişemez                           │    │
│   │  • SameSite: başka siteden cookie gönderilmez                │    │
│   │  • Bearer header: browser otomatik eklemez → CSRF yok        │    │
│   │  • Rotation: eski token tekrar gelirse → alarm               │    │
│   └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## SON ÖZET — Akılda Tutulması Gerekenler

1. **JWT = Stateless kimlik kartı.** Sunucu session tutmaz, token bilgi taşır (ama refresh token DB'de → hybrid stateful)
2. **İki token kullan:** Kısa ömürlü Access Token + uzun ömürlü Refresh Token
3. **Access Token → memory, Refresh Token → HttpOnly cookie.** localStorage'a ASLA token koyma
4. **Cookie otomatik gönderilir ama okunamaz** (HttpOnly). Gönderilmesi ≠ okunabilmesi
5. **Access token cookie'de olmaz** çünkü CSRF riski var. Header ile gönderilir → sadece frontend bilinçli ekler
6. **Tarayıcı /refresh'i otomatik çağırmaz** — senin interceptor kodun 401 yakalayıp çağırır
7. **credentials: "include"** = "Bu isteğe cookie'leri de ekle" demek (farklı domain/port için zorunlu)
8. **Refresh Token Rotation uygula** — her refresh'te AT ve RT birlikte yenilenir, çalınma durumunda tüm token ailesini iptal et
9. **Same-Origin Policy** sayesinde evil.com response okuyamaz → refresh token exploit edilemez
10. **Redis** = backend'in hızlı hafızası (tarayıcı RAM'i değil), token blacklist ve cache için kullanılır
11. **AT (RAM) kolay ölür:** F5, sekme/tarayıcı kapatma → silinir. Ama RT varsa refresh ile geri gelir
12. **RT (Cookie) dayanıklıdır:** Expires varsa tarayıcı kapatmaya bile dayanır. Cookie'ye Expires her zaman koy
13. **RT ayaktaysa sistem devam eder.** RT düştüyse (expire / logout / çalınma / admin sildi) → ne olursa olsun LOGOUT
14. **Yenilenme tetikleyicisi farklıdır:** AT kendi süresi dolunca yenilenir. RT kendi başına "yenile beni" demez — AT yenilenirken rotation ile yanında yenilenir
