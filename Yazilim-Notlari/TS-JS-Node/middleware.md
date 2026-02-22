# Middleware Nedir?

Middleware (ara yazılım), Express.js'de bir HTTP isteği (`request`) sunucuya ulaştığında, cevap (`response`) geri gönderilmeden **önce araya giren** fonksiyonlardır. İstek ve cevap arasında bir köprü görevi görür; isteği inceler, değiştirir, zenginleştirir ya da tamamen reddedebilir.

Kısaca: **İstek geldi, cevap henüz gitmedi — tam bu arada çalışan her şey middleware'dir.**

---

## Neden Middleware'e İhtiyacımız Var?

Bir web uygulamasında her istekte tekrar tekrar yapman gereken işlemler vardır:

- Gelen isteğin loglanması (kim, ne zaman, hangi endpoint'e istek attı?)
- Kullanıcının giriş yapıp yapmadığının kontrol edilmesi (authentication)
- Gelen JSON verisinin okunabilir hale getirilmesi (body parsing)
- Güvenlik başlıklarının eklenmesi
- Hata yakalama

Bu işlemleri her route'a tek tek yazmak yerine, middleware ile **bir kez yaz, her yerde kullan** mantığıyla çalışırsın.

---

## Restoran Analojisi

Konuyu somutlaştırmak için bir restoran düşün:

| Restoran         | Express.js         |
| ---------------- | ------------------ |
| Müşteri          | İstek (request)    |
| Kapıdaki görevli | İlk middleware     |
| Garson           | İkinci middleware   |
| Aşçı             | Route handler       |
| Yemek            | Cevap (response)    |

Müşteri restorana gelir (istek). Kapıdaki görevli rezervasyonu kontrol eder (auth middleware). Garson siparişi alır ve mutfağa iletir (body parser middleware). Aşçı yemeği hazırlar (route handler). Yemek müşteriye servis edilir (response).

Her aşamada bir sorun çıkarsa (rezervasyon yok, menüde olmayan bir yemek istendi) süreç durdurulabilir ve müşteriye uygun bir cevap verilir.

---

## Middleware'in Temel Yapısı

Her middleware fonksiyonu **3 parametre** alır:

```javascript
function middlewareAdi(req, res, next) {
  // req  → Gelen istek bilgilerini taşır (URL, body, headers vs.)
  // res  → Cevap göndermek için kullanılır
  // next → Bir sonraki middleware'e veya route handler'a geçişi sağlar

  console.log('Bu middleware çalıştı!');

  next(); // Zincirin devam etmesi için MUTLAKA çağrılmalı
}
```

### `next()` Nedir ve Neden Önemlidir?

`next()`, Express'e "bu middleware işini bitirdi, sıradakine geç" demektir.

- **`next()` çağırmazsan** → İstek havada kalır, kullanıcı sonsuza kadar bekler (timeout olur).
- **`next()` çağırırsan** → Zincirdeki bir sonraki middleware veya route handler devreye girer.
- **`res.send()` / `res.json()` çağırırsan** → Cevap gönderilir, zincir biter. Artık `next()` çağırmana gerek yoktur.

```javascript
// HATALI - next() çağrılmadı, istek asılı kalır
app.use((req, res, next) => {
  console.log('Log atıldı');
  // next() yok! Kullanıcı sonsuza kadar bekler.
});

// DOGRU - next() ile zincir devam eder
app.use((req, res, next) => {
  console.log('Log atıldı');
  next(); // Sıradaki middleware'e geç
});
```

---

## Middleware Türleri

### 1. Application-Level Middleware (Uygulama Seviyesinde)

`app.use()` ile tanımlanır. **Tüm isteklerde** veya **belirli bir path'teki isteklerde** çalışır.

```javascript
// Her istekte çalışır — path belirtilmedi
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Sadece /api ile başlayan isteklerde çalışır
app.use('/api', (req, res, next) => {
  console.log('API isteği geldi');
  next();
});
```

**Ne zaman kullanılır?** Loglama, güvenlik başlıkları ekleme, her istekte yapılması gereken genel işlemler.

---

### 2. Route-Level Middleware (Route Seviyesinde)

Belirli bir route'a özel middleware'dir. Route tanımının içine eklenir.

```javascript
// Giriş kontrol middleware'i
const loginKontrol = (req, res, next) => {
  if (req.headers.authorization) {
    next(); // Token var, devam et
  } else {
    res.status(401).json({ hata: 'Giriş yapmalısın!' });
    // next() çağrılmadı → zincir burada biter, route handler'a ulaşılmaz
  }
};

// loginKontrol SADECE bu route'ta çalışır
app.get('/profil', loginKontrol, (req, res) => {
  res.json({ mesaj: 'Profil sayfana hoş geldin!' });
});

// Bu route'ta loginKontrol çalışmaz
app.get('/hakkinda', (req, res) => {
  res.send('Hakkında sayfası — giriş gerekmez');
});
```

**Ne zaman kullanılır?** Sadece belirli sayfalarda giriş kontrolü, yetki kontrolü (admin mi, normal kullanıcı mı?) gibi durumlar.

---

### 3. Built-in Middleware (Express'in Kendi Middleware'leri)

Express, sık kullanılan işlemler için hazır middleware'ler sunar:

```javascript
// Gelen JSON formatındaki body'yi parse eder
// Bu olmadan req.body undefined olur!
app.use(express.json());

// HTML form verilerini (x-www-form-urlencoded) parse eder
app.use(express.urlencoded({ extended: true }));

// "public" klasöründeki dosyaları (CSS, resim, JS) doğrudan sunar
app.use(express.static('public'));
```

**`express.json()` olmadan ne olur?**

```javascript
// express.json() KULLANILMADAN:
app.post('/kayit', (req, res) => {
  console.log(req.body); // undefined — veriyi okuyamazsın!
});

// express.json() KULLANILARAK:
app.use(express.json()); // Önce bunu ekle
app.post('/kayit', (req, res) => {
  console.log(req.body); // { isim: "Ali", yas: 25 } — veri okunabilir!
});
```

---

### 4. Third-Party Middleware (Dış Kütüphaneler)

Topluluk tarafından geliştirilen, npm ile yüklenen middleware'lerdir.

```javascript
const morgan = require('morgan');   // HTTP istek loglama
const cors = require('cors');       // Cross-Origin Resource Sharing
const helmet = require('helmet');   // Güvenlik başlıkları

app.use(morgan('dev'));   // Konsola renkli log yazar: GET /api 200 12ms
app.use(cors());          // Farklı domain'lerden gelen isteklere izin verir
app.use(helmet());        // XSS, clickjacking gibi saldırılara karşı header ekler
```

| Kütüphane | Ne İşe Yarar                                  |
| --------- | --------------------------------------------- |
| `morgan`  | HTTP isteklerini konsola loglar               |
| `cors`    | Farklı origin'lerden gelen isteklere izin verir |
| `helmet`  | Güvenlik amaçlı HTTP header'ları ekler         |
| `multer`  | Dosya yükleme (file upload) işlemlerini yönetir |

---

### 5. Error-Handling Middleware (Hata Yakalama)

Diğer middleware'lerden farklı olarak **4 parametre** alır. İlk parametre `err` (hata) nesnesidir.

```javascript
// Normal middleware'lerde bir hata fırlatıldığında buraya düşer
app.use((err, req, res, next) => {
  console.error('Hata oluştu:', err.message);
  res.status(500).json({ hata: 'Sunucu hatası, bir şeyler ters gitti.' });
});
```

**Hata middleware'ine nasıl düşülür?**

```javascript
app.get('/kullanici/:id', (req, res, next) => {
  try {
    // Veritabanından kullanıcıyı bul
    const kullanici = veritabaniniBul(req.params.id);
    if (!kullanici) {
      throw new Error('Kullanıcı bulunamadı');
    }
    res.json(kullanici);
  } catch (error) {
    next(error); // next'e hata nesnesi verilirse → hata middleware'ine atlar
  }
});

// Hata middleware'i — en sona yazılmalı
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ hata: err.message });
});
```

---

## Middleware Sıralaması (Çok Önemli!)

Express, middleware'leri **yukarıdan aşağıya, yazıldıkları sırayla** çalıştırır. Sıralama hatalıysa uygulama düzgün çalışmaz.

```javascript
// YANLIS SIRALAMA
app.use((req, res, next) => {
  console.log(req.body.isim); // HATA! body henüz parse edilmedi, undefined
  next();
});
app.use(express.json()); // JSON parser sonra geliyor — çok geç!

// DOGRU SIRALAMA
app.use(express.json());       // 1. Önce body'yi parse et
app.use((req, res, next) => {
  console.log(req.body.isim);  // 2. Artık body hazır, okunabilir
  next();
});
```

**Genel sıralama önerisi:**

```
1. Güvenlik middleware'leri (helmet, cors)
2. Body parser'lar (express.json, express.urlencoded)
3. Loglama (morgan)
4. Özel middleware'ler (auth kontrolü vs.)
5. Route tanımları
6. 404 handler (eşleşmeyen route'lar için)
7. Error handler (en son!)
```

---

## Middleware Zinciri Nasıl İşler? (Görselleştirme)

```
İstek (HTTP Request)
    │
    ▼
┌─────────────────────┐
│  1. Loglama          │  → İstek bilgisini konsola yaz
│     next()           │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  2. Body Parser      │  → JSON body'yi req.body'ye ata
│     next()           │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  3. Auth Kontrol     │  → Token geçerli mi?
│     next() / res     │    Geçerliyse → next()
└─────────┬───────────┘    Geçersizse → 401 cevabı gönder (zincir biter)
          ▼
┌─────────────────────┐
│  4. Route Handler    │  → Asıl iş burada yapılır
│     res.json()       │    Cevap gönderilir
└─────────────────────┘
```

---

## Tam Bir Uygulama Senaryosu

```javascript
const express = require('express');
const app = express();

// ============ MIDDLEWARE'LER ============

// 1. Loglama — Her istekte çalışır
app.use((req, res, next) => {
  const tarih = new Date().toLocaleString('tr-TR');
  console.log(`[${tarih}] ${req.method} ${req.url}`);
  next();
});

// 2. JSON body parser
app.use(express.json());

// 3. Auth kontrol — Sadece gerektiğinde kullanılacak
const authKontrol = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ hata: 'Token gönderilmedi!' });
  }

  if (token !== 'Bearer gizli-anahtar') {
    return res.status(403).json({ hata: 'Geçersiz token!' });
  }

  // Token geçerli — kullanıcı bilgisini req'e ekle
  req.user = { id: 1, isim: 'Ahmet', rol: 'admin' };
  next();
};

// 4. Admin yetkisi kontrol middleware'i
const adminKontrol = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ hata: 'Bu işlem için admin yetkisi gerekli!' });
  }
};

// ============ ROUTE'LAR ============

// Public — Herkes erişebilir
app.get('/', (req, res) => {
  res.json({ mesaj: 'Ana sayfa — herkese açık' });
});

// Protected — Sadece giriş yapmış kullanıcılar
app.get('/profil', authKontrol, (req, res) => {
  res.json({
    mesaj: 'Profil bilgilerin',
    kullanici: req.user  // authKontrol middleware'inden gelen veri
  });
});

// Admin Only — Hem giriş hem admin yetkisi gerekli
// Birden fazla middleware zincirleme kullanılabilir
app.delete('/kullanici/:id', authKontrol, adminKontrol, (req, res) => {
  res.json({ mesaj: `Kullanıcı ${req.params.id} silindi` });
});

// ============ HATA YÖNETİMİ ============

// 404 — Hiçbir route eşleşmezse
app.use((req, res) => {
  res.status(404).json({ hata: 'Sayfa bulunamadı' });
});

// 500 — Genel hata yakalayıcı
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err);
  res.status(500).json({ hata: 'Bir şeyler ters gitti!' });
});

// ============ SUNUCUYU BASLAT ============
app.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor');
});
```

---

## Birden Fazla Middleware'i Zincirleme Kullanma

Bir route'a birden fazla middleware ekleyebilirsin. Soldan sağa sırayla çalışırlar:

```javascript
app.get('/admin/panel', authKontrol, adminKontrol, (req, res) => {
  res.send('Admin paneli');
});

// Çalışma sırası:
// 1. authKontrol → Token kontrolü yap
// 2. adminKontrol → Admin mi kontrol et
// 3. Route handler → Admin panelini göster
```

Eğer `authKontrol` başarısız olursa, `adminKontrol` ve route handler **hiç çalışmaz**. Zincir kırılır.

---

## Özet Tablosu

| Kavram               | Açıklama                                                   |
| -------------------- | ---------------------------------------------------------- |
| `next()`             | Sıradaki middleware'e geç                                   |
| `next(err)`          | Hata middleware'ine atla (4 parametreli olan)                |
| `res.send() / json()`| Cevap gönder, zinciri sonlandır                            |
| `app.use()`          | Middleware'i tüm isteklere veya belirli path'e bağla        |
| Sıralama             | Middleware'ler yazıldıkları sırayla çalışır — sıra kritiktir |
| 3 parametre          | Normal middleware: `(req, res, next)`                       |
| 4 parametre          | Hata middleware'i: `(err, req, res, next)`                  |
