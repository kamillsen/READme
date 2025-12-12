# JS / Node.js / Next.js / Nuxt.js — Zihinde Oturan Not

## En temel fikir

**JavaScript (JS)** bir *dil*dir — sadece bir programlama dili, başka bir şey değil.

Bu dili çalıştırmak için bir **çalışma ortamı (runtime/host environment)** gerekir.

En yaygın iki ortam:

* **Tarayıcı (Browser)**: Kullanıcının bilgisayarında çalışır (Chrome/Firefox/Edge).
* **Node.js**: Tarayıcı dışında (sunucu/terminal) çalışır. ([MDN Web Docs][1])

---

## 1) JavaScript normalde nerede çalışıyordu?

### ✅ Tarayıcının içinde (kullanıcının bilgisayarı)

**Senaryo:**
```
Kullanıcı → Tarayıcıya "example.com" yazar
         → Tarayıcı sunucudan HTML/CSS/JS dosyalarını indirir
         → HTML sayfayı gösterir
         → JS kodunu çalıştırır (KULLANICININ BİLGİSAYARINDA)
```

Sen bir siteye girince, sayfadaki JS kodu **kullanıcının tarayıcısında** çalışır. 
Tarayıcılar JS'i çalıştırmak için bir **JavaScript engine** kullanır; modern engine'ler JIT (Just-In-Time compilation) de yapar. ([MDN Web Docs][2])

### Tarayıcı ortamı nasıl çalışıyor? (Detaylı ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                    TARAYICI (Chrome/Firefox)                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        1. JAVASCRIPT ENGINE (V8/SpiderMonkey)        │  │
│  │         ↓ Ne iş yapar?                               │  │
│  │         - JS kodunu okur, parse eder                 │  │
│  │         - Makine koduna çevirir                      │  │
│  │         - Çalıştırır                                 │  │
│  │         Örnek: console.log("Merhaba") → ekrana yazar│  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕ (JS kodundan erişilebilir)      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        2. WEB API'LER (Tarayıcının Sunduğu)          │  │
│  │                                                       │  │
│  │        ┌─────────────────────────────────────┐       │  │
│  │        │ DOM (Document Object Model)         │       │  │
│  │        │ - document.querySelector()          │       │  │
│  │        │ - document.getElementById()         │       │  │
│  │        │ - element.innerHTML = "..."         │       │  │
│  │        │ ↓ Ne işe yarar?                     │       │  │
│  │        │ HTML elementlerine erişim/değiştirme│       │  │
│  │        └─────────────────────────────────────┘       │  │
│  │                                                       │  │
│  │        ┌─────────────────────────────────────┐       │  │
│  │        │ fetch API                            │       │  │
│  │        │ - fetch('https://api.com/data')     │       │  │
│  │        │ ↓ Ne işe yarar?                     │       │  │
│  │        │ HTTP istekleri atmak                │       │  │
│  │        └─────────────────────────────────────┘       │  │
│  │                                                       │  │
│  │        ┌─────────────────────────────────────┐       │  │
│  │        │ setTimeout / setInterval            │       │  │
│  │        │ - setTimeout(() => {}, 1000)        │       │  │
│  │        │ ↓ Ne işe yarar?                     │       │  │
│  │        │ Zamanlanmış işlemler                │       │  │
│  │        └─────────────────────────────────────┘       │  │
│  │                                                       │  │
│  │        ┌─────────────────────────────────────┐       │  │
│  │        │ localStorage / sessionStorage       │       │  │
│  │        │ - localStorage.setItem('key', val)  │       │  │
│  │        │ ↓ Ne işe yarar?                     │       │  │
│  │        │ Tarayıcıda veri saklama             │       │  │
│  │        └─────────────────────────────────────┘       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ÖNEMLİ: Bu API'ler JavaScript dilinin parçası DEĞİL!       │
│          Tarayıcının sağladığı özel yetenekler.             │
└─────────────────────────────────────────────────────────────┘
```

**Kritik nokta:** 
> **DOM, JavaScript dilinin parçası değil.** Bu bir "Web API" ve tarayıcının sunduğu bir şey. ([MDN Web Docs][3])

**Neden önemli?** Node.js'de DOM yok çünkü Node.js tarayıcı değil!

---

## 2) Node.js neyi değiştirdi?

### Sorun neydi?

Eskiden JavaScript sadece tarayıcıda çalışabiliyordu. 
- Sunucu tarafında program yazmak için başka diller kullanılıyordu (Python, Java, PHP...)
- Aynı dili hem tarayıcıda hem sunucuda kullanamıyordun

### Node.js'in çözümü:

Node.js şunu yaptı:
> "Aynı JavaScript kodunu **tarayıcı olmadan** da çalıştırayım."

**Nasıl yaptı?**
- Chrome'un JavaScript motoru olan **V8'i aldı**
- Tarayıcıdan AYRI bir program haline getirdi
- Artık V8, tarayıcı olmadan da çalışabiliyor

### Node.js ortamı nasıl çalışıyor? (Detaylı ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│              NODE.JS (Tarayıcı Dışı Ortam)                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        1. JAVASCRIPT ENGINE (V8)                     │  │
│  │         ↓ Aynı motor, tarayıcı olmadan               │  │
│  │         - JS kodunu okur, parse eder                 │  │
│  │         - Makine koduna çevirir                      │  │
│  │         - Çalıştırır                                 │  │
│  │         Örnek: console.log("Merhaba") → terminal'da │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕ (JS kodundan erişilebilir)      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        2. NODE API'LERİ (Node.js'in Sunduğu)         │  │
│  │                                                       │  │
│  │        ┌─────────────────────────────────────┐       │  │
│  │        │ fs (File System)                    │       │  │
│  │        │ - fs.readFile('dosya.txt')          │       │  │
│  │        │ - fs.writeFile('dosya.txt', data)   │       │  │
│  │        │ ↓ Ne işe yarar?                     │       │  │
│  │        │ Dosya okuma/yazma (tarayıcıda YOK!) │       │  │
│  │        └─────────────────────────────────────┘       │  │
│  │                                                       │  │
│  │        ┌─────────────────────────────────────┐       │  │
│  │        │ http / https                        │       │  │
│  │        │ - http.createServer()               │       │  │
│  │        │ - server.listen(3000)               │       │  │
│  │        │ ↓ Ne işe yarar?                     │       │  │
│  │        │ Web sunucusu oluşturmak             │       │  │
│  │        └─────────────────────────────────────┘       │  │
│  │                                                       │  │
│  │        ┌─────────────────────────────────────┐       │  │
│  │        │ path                                │       │  │
│  │        │ - path.join('/kullanici', 'dosya')  │       │  │
│  │        │ ↓ Ne işe yarar?                     │       │  │
│  │        │ Dosya yolu işlemleri                │       │  │
│  │        └─────────────────────────────────────┘       │  │
│  │                                                       │  │
│  │        ┌─────────────────────────────────────┐       │  │
│  │        │ process                             │       │  │
│  │        │ - process.argv                      │       │  │
│  │        │ - process.env                       │       │  │
│  │        │ ↓ Ne işe yarar?                     │       │  │
│  │        │ Sistem bilgileri, environment vars │       │  │
│  │        └─────────────────────────────────────┘       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ÖNEMLİ: DOM YOK! localStorage YOK! window YOK!            │
│          Çünkü tarayıcı yok.                               │
└─────────────────────────────────────────────────────────────┘
```

**Karşılaştırma:**

| Özellik | Tarayıcıda | Node.js'de |
|---------|-----------|------------|
| `document.querySelector()` | ✅ Var | ❌ Yok (DOM yok) |
| `fetch()` | ✅ Var | ❌ Yok (ama `http`/`https` modülleri var) |
| `localStorage` | ✅ Var | ❌ Yok |
| `fs.readFile()` | ❌ Yok (güvenlik) | ✅ Var |
| `process.argv` | ❌ Yok | ✅ Var |
| `http.createServer()` | ❌ Yok | ✅ Var |

**Örnek:** Node'da dosya okuyabilirsin (`fs`). Bu, Node'un sağladığı bir yetenek. ([Node.js][5])

---

## 3) "Sunucu" ve "terminal" kafada nasıl canlanır?

### Terminal nedir?

**Terminal** = Senin komut yazdığın siyah/renkli pencere
- Windows: PowerShell, CMD, Git Bash
- macOS/Linux: Terminal
- VS Code içindeki terminal

**Ne işe yarar?**
- Komut yazarsın: `node app.js`, `npm install`, `npm run dev`
- Çıktıları görürsün
- Programları çalıştırırsın

```
┌─────────────────────────────────────┐
│   TERMINAL (Komut Satırı)           │
│                                     │
│   kSEN@bilgisayar:~/proje$         │
│   $ node app.js                     │  ← Sen buraya yazarsın
│                                     │
│   Sunucu 3000 portunda çalışıyor... │  ← Çıktı burada görünür
│   GET /api/users                    │
│   GET /api/posts                    │
│                                     │
└─────────────────────────────────────┘
```

### Sunucu nedir?

**Sunucu** = İstek bekleyip cevap veren program

**İki anlamı var:**

1. **Fiziksel Sunucu:** Bir bilgisayar (Amazon AWS, Google Cloud'taki bir makine)
2. **Program Olarak Sunucu:** İstek dinleyen, cevap veren yazılım

**Nasıl çalışır?**

```
┌─────────────────────────────────────────────────────────┐
│           SUNUCU PROGRAMI AKIŞI                         │
│                                                          │
│  1. Program başlar                                      │
│     ↓                                                   │
│  2. Bir port dinlemeye başlar (örn: 3000)              │
│     ↓                                                   │
│  3. "İstek bekliyorum..." diye bekler                  │
│     ↓                                                   │
│  4. Kullanıcı tarayıcıdan "http://localhost:3000" açar │
│     ↓                                                   │
│  5. Sunucu isteği alır                                  │
│     ↓                                                   │
│  6. İşlem yapar (veritabanı sorgusu, dosya okuma...)   │
│     ↓                                                   │
│  7. Cevap döner (HTML, JSON, vs.)                      │
│     ↓                                                   │
│  8. Tekrar istek bekler (3'e döner)                    │
└─────────────────────────────────────────────────────────┘
```

**Örnek kod (Node.js ile basit sunucu):**

```javascript
// server.js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Merhaba Dünya!</h1>');
});

server.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor...');
});
```

**Terminal'de çalıştırma:**
```bash
$ node server.js
Sunucu 3000 portunda çalışıyor...
```

**Tarayıcıda açma:**
```
http://localhost:3000  → "Merhaba Dünya!" görürsün
```

### Twist: Geliştirme sunucusu

**Geliştirirken sunucu çoğu zaman senin kendi bilgisayarındır!**

```
┌─────────────────────────────────────────────────────────┐
│              SENIN BİLGİSAYARIN                         │
│                                                          │
│  ┌──────────────┐         ┌──────────────────┐        │
│  │   TERMINAL   │         │     TARAYICI     │        │
│  │              │         │                  │        │
│  │ $ npm run dev│         │ Chrome/Firefox   │        │
│  │              │         │                  │        │
│  │ → Node/Next/ │         │ → localhost:3000 │        │
│  │   Nuxt başlar│◄────────┤                  │        │
│  │              │ İstekler│                  │        │
│  │ (Sunucu gibi │         │ ◄─────────────── │        │
│  │  çalışır)    │─────────┤    HTML/JS/CSS   │        │
│  └──────────────┘         └──────────────────┘        │
│                                                          │
│  Her ikisi de AYNI bilgisayarda!                        │
└─────────────────────────────────────────────────────────┘
```

**`npm run dev` dediğinde ne olur?**

1. Terminal'de Node.js başlar
2. Bir port dinler (genelde 3000 veya 3001)
3. Senin bilgisayarında bir "sunucu" gibi çalışır
4. Tarayıcından `localhost:3000` açarsın
5. Tarayıcı → kendi bilgisayarındaki sunucuya istek atar
6. Sunucu cevap verir
7. Sayfa görünür

---

## 4) Next.js nerede devreye giriyor?

### Next.js nedir?

Next.js, **React framework'ü** ve "full-stack web uygulamaları" için konumlanır. ([nextjs.org][6])

**Framework ne demek?**
- Hazır yapı, kurallar, araçlar verir
- Sen sadece mantığı yazarsın
- SSR, routing, API routes gibi şeyler hazır gelir

### Next.js mimarisi (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS PROJESİ                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. CLIENT-SIDE (Tarayıcı)                        │    │
│  │     - React bileşenleri                           │    │
│  │     - useState, useEffect gibi React hook'ları    │    │
│  │     - Tarayıcıda çalışan JS kodu                  │    │
│  │     - DOM manipülasyonu yapabilir                 │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↕                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  2. SERVER-SIDE (Node.js üzerinde)                │    │
│  │                                                     │    │
│  │     ┌─────────────────────────────────────┐        │    │
│  │     │ SSR (Server-Side Rendering)         │        │    │
│  │     │ - Sayfalar sunucuda HTML'e çevrilir │        │    │
│  │     │ - SEO için iyi                      │        │    │
│  │     │ - İlk yükleme hızlı                 │        │    │
│  │     │ Örnek: pages/index.js               │        │    │
│  │     └─────────────────────────────────────┘        │    │
│  │                                                     │    │
│  │     ┌─────────────────────────────────────┐        │    │
│  │     │ API Routes                          │        │    │
│  │     │ - pages/api/* → /api/* endpoint     │        │    │
│  │     │ - Backend gibi çalışır              │        │    │
│  │     │ - Veritabanı sorguları yapabilir    │        │    │
│  │     │ Örnek:                              │        │    │
│  │     │   pages/api/users.js                │        │    │
│  │     │   → GET /api/users çalışır          │        │    │
│  │     └─────────────────────────────────────┘        │    │
│  │                                                     │    │
│  │     ┌─────────────────────────────────────┐        │    │
│  │     │ Static Generation (SSG)             │        │    │
│  │     │ - Build zamanında HTML üretilir     │        │    │
│  │     │ - Çok hızlı                         │        │    │
│  │     │ - Blog yazıları için ideal          │        │    │
│  │     └─────────────────────────────────────┘        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ÖNEMLİ: Next.js Node.js üzerinde çalışır!                 │
│          Hem sunucu hem tarayıcı kodunu bir arada yazarsın │
└─────────────────────────────────────────────────────────────┘
```

### Next.js akış örneği

**Kullanıcı bir sayfa istediğinde:**

```
1. Kullanıcı → Tarayıcı: "example.com/products" yazar
                ↓
2. Tarayıcı → Next.js Sunucusu: GET /products isteği
                ↓
3. Next.js Sunucusu:
   - pages/products.js dosyasını bulur
   - getServerSideProps() çalışır (varsa)
   - Veritabanından ürünleri çeker
   - React bileşenini HTML'e render eder
                ↓
4. Next.js Sunucusu → Tarayıcı: HTML döner
                ↓
5. Tarayıcı: HTML'i gösterir
                ↓
6. Tarayıcı: JavaScript'i indirir ve çalıştırır
   - Artık sayfa "interactive" olur
   - useState, onClick gibi şeyler çalışır
```

**Next.js'in faydaları:**

* **SSR**: Sayfanın HTML'i her istekte sunucuda üretilebilir. ([nextjs.org][7])
* **API Routes**: `pages/api/*` → otomatik `/api/*` endpoint olur ve bu kod "server-side only" kalır. ([nextjs.org][8])
* **File-based Routing**: Dosya yapısı = route yapısı (pages/about.js → /about)
* **Optimizasyonlar**: Otomatik code splitting, image optimization...

Yani tek projede şunlar birlikte durabilir:
* React ile UI (client-side)
* Next ile server-side render + küçük backend endpointleri (server-side)

---

## 5) Nuxt.js nerede devreye giriyor?

### Nuxt.js nedir?

Nuxt, **Vue üstüne kurulu** bir framework.

**Next.js = React için ise, Nuxt.js = Vue için**

### Nuxt.js mimarisi (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                    NUXT.JS PROJESİ                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. CLIENT-SIDE (Tarayıcı)                        │    │
│  │     - Vue bileşenleri                             │    │
│  │     - reactive data, computed properties          │    │
│  │     - Tarayıcıda çalışan JS kodu                  │    │
│  │     - DOM manipülasyonu yapabilir                 │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↕                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  2. SERVER-SIDE (Node.js üzerinde)                │    │
│  │                                                     │    │
│  │     ┌─────────────────────────────────────┐        │    │
│  │     │ Universal Rendering (SSR)           │        │    │
│  │     │ - Vue kodunu sunucuda çalıştırır    │        │    │
│  │     │ - HTML üretir                       │        │    │
│  │     │ - SEO için iyi                      │        │    │
│  │     │ Örnek: pages/index.vue              │        │    │
│  │     └─────────────────────────────────────┘        │    │
│  │                                                     │    │
│  │     ┌─────────────────────────────────────┐        │    │
│  │     │ Server API Routes                   │        │    │
│  │     │ - server/api/* → /api/* endpoint    │        │    │
│  │     │ - Backend gibi çalışır              │        │    │
│  │     │ - Veritabanı sorguları yapabilir    │        │    │
│  │     │ Örnek:                              │        │    │
│  │     │   server/api/users.js               │        │    │
│  │     │   → GET /api/users çalışır          │        │    │
│  │     └─────────────────────────────────────┘        │    │
│  │                                                     │    │
│  │     ┌─────────────────────────────────────┐        │    │
│  │     │ Static Site Generation (SSG)        │        │    │
│  │     │ - Build zamanında HTML üretilir     │        │    │
│  │     │ - Çok hızlı                         │        │    │
│  │     │ - Nuxt generate komutu              │        │    │
│  │     └─────────────────────────────────────┘        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ÖNEMLİ: Nuxt.js da Node.js üzerinde çalışır!              │
│          Vue ekosisteminin Next.js'i gibi düşün            │
└─────────────────────────────────────────────────────────────┘
```

**Nuxt.js akış örneği:**

```
1. Kullanıcı → Tarayıcı: "example.com/blog" yazar
                ↓
2. Tarayıcı → Nuxt Sunucusu: GET /blog isteği
                ↓
3. Nuxt Sunucusu:
   - pages/blog.vue dosyasını bulur
   - asyncData() veya fetch() çalışır (varsa)
   - Veritabanından blog yazılarını çeker
   - Vue bileşenini HTML'e render eder
                ↓
4. Nuxt Sunucusu → Tarayıcı: HTML döner
                ↓
5. Tarayıcı: HTML'i gösterir
                ↓
6. Tarayıcı: JavaScript'i indirir ve çalıştırır (hydration)
   - Artık sayfa "interactive" olur
   - Vue reactivity çalışır
```

**Nuxt.js'in özellikleri:**

* **Built-in SSR**: Dokümanda "built-in SSR" gibi özellikleri "out of the box" verdiğini söyler. ([Nuxt][9])
* **Universal Rendering**: "Universal rendering" açıkken: Tarayıcı URL ister → Nuxt **Vue kodunu sunucu ortamında çalıştırır** → **render edilmiş HTML** döner. ([Nuxt][10])
* **File-based Routing**: Next.js gibi, dosya yapısı = route yapısı
* **Auto-imports**: Bileşenleri ve composables'ı otomatik import eder
* Vue ekosisteminde de Nuxt, "universal Vue app" için higher-level framework olarak önerilir. ([vuejs.org][11])

---

# Hepsinin ilişkisi (Detaylı ASCII)

## Hiyerarşi

```
┌─────────────────────────────────────────────────────────┐
│                  JAVASCRIPT (Dil)                        │
│                  Sadece programlama dili                 │
│                  Kendi başına çalışmaz!                  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Çalıştırmak için runtime gerekir
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
        ▼                                      ▼
┌──────────────────────┐          ┌──────────────────────┐
│  TARAYICI ORTAMI     │          │   NODE.JS ORTAMI     │
│  (Browser Runtime)   │          │  (Node.js Runtime)   │
│                      │          │                      │
│  ┌────────────────┐  │          │  ┌────────────────┐  │
│  │ JS Engine      │  │          │  │ JS Engine      │  │
│  │ (V8/SpiderMonk)│  │          │  │ (V8)           │  │
│  └────────────────┘  │          │  └────────────────┘  │
│           │           │          │           │           │
│           ▼           │          │           ▼           │
│  ┌────────────────┐  │          │  ┌────────────────┐  │
│  │ Web API'ler    │  │          │  │ Node API'ler   │  │
│  │ - DOM          │  │          │  │ - fs           │  │
│  │ - fetch        │  │          │  │ - http         │  │
│  │ - localStorage │  │          │  │ - path         │  │
│  │ - setTimeout   │  │          │  │ - process      │  │
│  └────────────────┘  │          │  └────────────────┘  │
│                      │          │                      │
│  ↓ Kullanıcının      │          │  ↓ Sunucu/Terminal  │
│    bilgisayarında    │          │    ortamında        │
└──────────────────────┘          └──────────────────────┘
                                              │
                                              │ Framework'ler
                                              │ Node.js üzerinde
                                              │ çalışır
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                     │
                    ▼                                                     ▼
        ┌────────────────────────┐                    ┌────────────────────────┐
        │      NEXT.JS           │                    │      NUXT.JS           │
        │  (React Framework)     │                    │  (Vue Framework)       │
        │                        │                    │                        │
        │  - SSR                 │                    │  - SSR                 │
        │  - API Routes          │                    │  - API Routes          │
        │  - File Routing        │                    │  - File Routing        │
        │  - React Components    │                    │  - Vue Components      │
        │                        │                    │                        │
        │  Hem client hem server │                    │  Hem client hem server │
        │  kodu bir arada        │                    │  kodu bir arada        │
        └────────────────────────┘                    └────────────────────────┘
```

## Karşılaştırma Tablosu

| Özellik | JavaScript | Node.js | Next.js | Nuxt.js |
|---------|-----------|---------|---------|---------|
| **Nedir?** | Programlama dili | Runtime (çalıştırma ortamı) | React framework'ü | Vue framework'ü |
| **Nerede çalışır?** | Runtime'a bağlı | Terminal/Sunucu | Terminal/Sunucu + Tarayıcı | Terminal/Sunucu + Tarayıcı |
| **DOM erişimi?** | Runtime'a bağlı | ❌ Yok | ❌ Server'da yok, ✅ Client'ta var | ❌ Server'da yok, ✅ Client'ta var |
| **Dosya okuma?** | Runtime'a bağlı | ✅ Var (fs) | ✅ Server'da var | ✅ Server'da var |
| **SSR?** | - | Manuel yapılır | ✅ Built-in | ✅ Built-in |
| **API Routes?** | - | Manuel yapılır | ✅ Built-in | ✅ Built-in |
| **UI Framework?** | - | - | React | Vue |

---

## Özet: Neyin ne olduğu

### JavaScript
- **Ne?** Bir programlama dili
- **Ne yapar?** Hiçbir şey (kendi başına çalışmaz)
- **Ne değildir?** Çalıştırma ortamı değil

### Node.js
- **Ne?** JavaScript'i tarayıcı dışında çalıştıran runtime
- **Ne yapar?** JS kodunu sunucu/terminal ortamında çalıştırır, dosya/ağ işlemleri yapar
- **Ne değildir?** Framework değil, tarayıcı değil

### Next.js
- **Ne?** React tabanlı full-stack framework
- **Ne yapar?** SSR, API routes, routing, optimizasyonlar sağlar
- **Ne değildir?** React değil (React'i kullanır), Vue framework'ü değil

### Nuxt.js
- **Ne?** Vue tabanlı full-stack framework
- **Ne yapar?** SSR, API routes, routing, optimizasyonlar sağlar
- **Ne değildir?** Vue değil (Vue'yu kullanır), React framework'ü değil

---

[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/JavaScript_technologies_overview "JavaScript technologies overview - MDN Web Docs"

[2]: https://developer.mozilla.org/en-US/docs/Glossary/Engine/JavaScript "JavaScript engine - Glossary - MDN Web Docs"

[3]: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model "Document Object Model (DOM) - Web APIs - MDN Web Docs"

[4]: https://nodejs.org/en/learn/getting-started/introduction-to-nodejs "Introduction to Node.js"

[5]: https://nodejs.org/api/fs.html "File system | Node.js v25.2.1 Documentation"

[6]: https://nextjs.org/docs "Next.js Docs | Next.js"

[7]: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering "Server-side Rendering (SSR)"

[8]: https://nextjs.org/docs/pages/building-your-application/routing/api-routes "API Routes"

[9]: https://nuxt.com/docs "Introduction · Get Started with Nuxt v4"

[10]: https://nuxt.com/docs/4.x/guide/concepts/rendering "Rendering Modes · Nuxt Concepts v4"

[11]: https://vuejs.org/guide/scaling-up/ssr.html "Server-Side Rendering (SSR)"