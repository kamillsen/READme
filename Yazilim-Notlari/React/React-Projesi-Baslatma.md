# React Projesi Başlatmanın 3 Yolu

## Önemli Not

Aşağıdaki 3 yolun ortak amacı aynı: **React ile bir proje klasörü kurmak** ve **lokalde (kendi PC'inde) çalıştırmak**. Farkları: "kurulum sihirbazı" ve "altyapı" (build/dev server) seçimi.

---

## npm ve npx Nedir? (Hızlı Açıklama)

### npm (Node Package Manager)

**npm** = Paket yöneticisi
- Node.js ile birlikte gelen araç
- Paketleri indirir, yükler, yönetir
- `package.json` dosyasına bağımlılıkları ekler
- Projene kalıcı olarak paket kurmak için kullanılır

**Örnek:**
```bash
npm install react        # React paketini projene kurar (kalıcı)
npm install             # package.json'daki tüm paketleri kurar
```

### npx (Node Package eXecute)

**npx** = Paket çalıştırıcı
- npm 5.2+ ile birlikte gelen araç
- Paketleri kurmadan çalıştırır
- Paketi indirir → çalıştırır → (gerektiğinde) silebilir
- Tek seferlik işler için uygundur

**Örnek:**
```bash
npx create-react-app my-app    # create-react-app'i kurmadan çalıştırır
npx cowsay "Merhaba"           # cowsay paketini çalıştırır, sonra silebilir
```

### Farklar (Görsel)

```
┌─────────────────────────────────────────────────────────┐
│                    npm                                   │
│  "Paket Yöneticisi"                                      │
│                                                          │
│  npm install react                                      │
│     ↓                                                    │
│  1. react paketini indirir                              │
│  2. node_modules/ klasörüne koyar                       │
│  3. package.json'a ekler                                │
│  4. KALICI olarak projende kalır                        │
│                                                          │
│  Kullanım: Projeye paket kurmak için                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    npx                                   │
│  "Paket Çalıştırıcı"                                     │
│                                                          │
│  npx create-react-app my-app                            │
│     ↓                                                    │
│  1. create-react-app paketini bulur                     │
│  2. Geçici olarak indirir (cache'lenebilir)             │
│  3. Çalıştırır                                          │
│  4. İş bitince silebilir (isteğe bağlı)                 │
│                                                          │
│  Kullanım: Paketi kurmadan çalıştırmak için             │
└─────────────────────────────────────────────────────────┘
```

### Karşılaştırma Tablosu

| Özellik | npm | npx |
|---------|-----|-----|
| **Amaç** | Paket kurmak/yönetmek | Paketi çalıştırmak |
| **Paket durumu** | Kalıcı kurulum | Geçici çalıştırma |
| **node_modules** | Evet, buraya kurar | Gerektiğinde geçici |
| **Kullanım** | `npm install paket` | `npx paket` |
| **Örnek** | `npm install react` | `npx create-react-app` |

### Pratik Örnekler

**npm ile:**
```bash
# React'i projene kurmak istiyorsun (kalıcı)
npm install react react-dom

# Artık react projende var, her zaman kullanabilirsin
# node_modules/react/ klasöründe
```

**npx ile:**
```bash
# create-react-app'i kullanmak istiyorsun (tek seferlik)
npx create-react-app my-app

# create-react-app'i projene kurmana gerek yok
# Sadece çalıştır, işini gör, bitsin
```

### Özet

- **npm** = Paketi projene kur (kalıcı)
- **npx** = Paketi kurmadan çalıştır (geçici)

**npx'in avantajı:** Projene gereksiz paket kurmadan bir aracı kullanabilirsin. Örneğin `create-react-app` sadece proje oluşturmak için, projeye kurmana gerek yok. `npx` ile çalıştırıp bitirebilirsin.

---

## Genel Akış (Hepsinde Aynı)

```txt
1) Proje iskeleti kur
   (create-react-app / create-vite / create-next-app)
   ↓
2) Paketleri indir
   (bazen otomatik gelir, bazen npm install dersin)
   ↓
3) Geliştirme sunucusunu aç
   (npm start / npm run dev)
   ↓
4) Tarayıcıdan aç
   http://localhost:3000 (çoğu zaman)
```

**Görsel Akış:**

```
┌─────────────────────────────────────────────────────────┐
│  1. PROJE İSKELETİ KURMA                                │
│     $ npx create-xxx-app my-app                         │
│     ↓                                                    │
│     [Klasör oluşturulur: my-app/]                       │
│     [Temel dosyalar: package.json, src/, public/...]    │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  2. PAKETLERİ İNDİRME (Gerekirse)                       │
│     $ npm install                                       │
│     ↓                                                    │
│     [node_modules/ klasörü oluşur]                      │
│     [Bağımlılıklar indirilir]                           │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  3. GELİŞTİRME SUNUCUSUNU BAŞLATMA                      │
│     $ npm start  veya  $ npm run dev                    │
│     ↓                                                    │
│     [Development server başlar]                         │
│     [http://localhost:3000 dinlemeye başlar]            │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  4. TARAYICIDA AÇMA                                     │
│     http://localhost:3000                               │
│     ↓                                                    │
│     [React uygulaman görünür!]                          │
└─────────────────────────────────────────────────────────┘
```

---

## 1) Create React App (CRA) ile

### Komutlar

```bash
npx create-react-app my-app
cd my-app
npm start
```

### Bu ne yapar?

**`npx create-react-app my-app`**
- "my-app" diye bir klasör açar ve içine **hazır React proje iskeleti** kurar (dosyalar + ayarlar + bağımlılık listesi). ([create-react-app.dev][1])
- Webpack, Babel gibi build araçları önceden yapılandırılmış olarak gelir
- `node_modules/` klasörü otomatik oluşturulur

**`cd my-app`**
- Terminalde o klasöre girersin

**`npm start`**
- Projenin **geliştirme sunucusunu** başlatır; tarayıcıdan genelde `http://localhost:3000` ile açarsın. ([tr.legacy.reactjs.org][2])
- Hot reload özelliği vardır (kod değiştirince otomatik yenilenir)

### CRA Proje Yapısı

```
my-app/
├── node_modules/        ← Bağımlılıklar (npm install ile oluşur)
├── public/              ← Statik dosyalar (index.html, favicon...)
│   └── index.html
├── src/                 ← React kodların burada
│   ├── App.js          ← Ana bileşen
│   ├── App.css
│   ├── index.js        ← Giriş noktası
│   └── index.css
├── package.json         ← Proje ayarları ve bağımlılıklar
└── README.md
```

### Ne zaman tercih edilir?

* Eskiden "en kolay başlangıç"tı
* Ama React ekibi CRA'yı yeni projeler için artık önermiyor; "yeni React app'leri framework ile başlatın" yaklaşımına geçti (CRA "sunsetting"). ([react.dev][3])
* **Artık önerilmiyor**, ama eski projelerde hala kullanılıyor

---

## 2) Vite ile (Daha Modern/Hızlı Başlangıç)

### Komutlar

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
```

### Bu ne yapar?

**`npm create vite@latest ... --template react`**
- Vite'ın "proje kurucu" aracıyla **React şablonlu** bir proje oluşturur. ([vitejs][4])
- Hızlı bir build tool ve dev server
- Modern ES modules kullanır

**`npm install`**
- Projenin ihtiyaç duyduğu paketleri indirir (node_modules). (Kurulan projede genelde ilk kez çalıştırmadan önce yapılır.)

**`npm run dev`**
- Vite'ın **dev server**'ını açar (hızlı başlatma + hızlı yenileme). Vite, "web için build tool + dev server" olarak tanımlanır. ([vitejs][5])
- CRA'dan çok daha hızlı başlar ve yenilenir

### Vite Proje Yapısı

```
my-app/
├── node_modules/        ← npm install ile oluşur
├── public/              ← Statik dosyalar
├── src/                 ← React kodların burada
│   ├── App.jsx         ← Ana bileşen (JSX uzantılı)
│   ├── main.jsx        ← Giriş noktası
│   └── App.css
├── index.html           ← Vite özel: index.html doğrudan root'ta
├── vite.config.js       ← Vite ayar dosyası
├── package.json
└── README.md
```

### Karşılaştırma: CRA vs Vite

| Özellik | Create React App | Vite |
|---------|------------------|------|
| **Başlatma hızı** | Yavaş (Webpack yavaş) | Çok hızlı (ES modules) |
| **Hot Reload** | Var ama yavaş | Çok hızlı |
| **Build hızı** | Orta | Çok hızlı |
| **Öğrenme eğrisi** | Düşük (her şey gizli) | Orta (daha şeffaf) |
| **Önerilme durumu** | ❌ Artık önerilmiyor | ✅ Modern standart |

**Kafada canlansın:**
- CRA = "Hazır apartman" (her şey biraz daha kapalı kutu, ağır)
- Vite = "Modern şantiye + hızlı vinç" (çok hızlı kurulur, modern yapı, şeffaf)

React dokümanı da "React app kurmak için önce Vite/Parcel/RSbuild gibi bir build tool kur" diye anlatıyor. ([react.dev][6])

### Vite'ın Ana Kullanım Amacı: SPA/CSR (Client-Side Rendering)

**Vite = "React projesini başlatmak/çalıştırmak için" (özellikle SPA/CSR)**

Vite ile React projesi kurduğunda:
- **SPA (Single Page Application)** olarak çalışır
- **CSR (Client-Side Rendering)** yapar (tüm render tarayıcıda olur)
- `npm run dev` dediğinde tarayıcıda açılır
- SEO için ideal değil (ilk yükleme sadece boş HTML, sonra JS yüklenir)

Vite'ın kendisi "frontend build tool" olarak konumlanır (dev server + build). ([vitejs][5])

**Vite şart değil ama...**
React geliştirmek için **Vite gibi bir build tool gerekir** (Vite/Parcel/RSbuild) — çünkü:
- Import'ları çözmek
- JSX/TypeScript'i derlemek
- Dev server çalıştırmak
- Production build almak

gibi işleri birinin halletmesi lazım. ([react.dev][6])

### Vite ile SSR (Server-Side Rendering) Desteği

**ÖNEMLİ: Vite'ın SSR desteği var!** Ancak Next.js'den farklı bir yaklaşımı var.

```
┌─────────────────────────────────────────────────────────┐
│  VITE SSR DESTEĞİ                                      │
│                                                          │
│  ✅ Built-in SSR desteği var                           │
│  ✅ Resmi dokümantasyonda anlatılmış                   │
│  ✅ React ile SSR yapabilirsin                         │
│                                                          │
│  AMA:                                                   │
│                                                          │
│  ⚠️ Next.js'den FARKLI:                                │
│     - Daha manuel kurulum gerekir                      │
│     - SSR için ekstra yapılandırma yapmalısın          │
│     - Routing, data fetching vs. kendin kurmalısın     │
│     - "Hazır çözüm" değil, "altyapı aracı"            │
│                                                          │
│  Vite SSR Dokümantasyonu: ([vitejs][9])                │
└─────────────────────────────────────────────────────────┘
```

**Vite SSR nasıl çalışır?**
- React kodunu Node.js ortamında çalıştırır
- HTML'e önceden render eder (server-side)
- Sonra istemcide "hydration" yapar (interactive hale getirir)
- SEO ve ilk yükleme için avantajlı

**Vite SSR için ne gerekir?**
1. SSR entry point oluşturmalısın (`server.js`)
2. Client entry point oluşturmalısın (`client.js`)
3. SSR server kurmalısın (Express gibi)
4. Routing'i kendin kurmalısın
5. Data fetching mantığını kendin yazmalısın

**Örnek Vite SSR yapısı:**
```
my-ssr-app/
├── src/
│   ├── main.jsx          ← Client entry
│   ├── entry-server.jsx  ← Server entry
│   ├── App.jsx
│   └── routes/
├── server.js             ← SSR server (Express)
└── vite.config.js
```

**Next.js'den farkı:**
- **Next.js**: SSR için her şey hazır (routing, data fetching, API routes...)
- **Vite**: SSR yapabilirsin ama altyapıyı kendin kurmalısın

([vitejs][9])

---

## 3) Next.js ile (React + Full-Stack)

### Komutlar

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

### Bu ne yapar?

**`npx create-next-app@latest my-app`**
- Next.js projesini kurar. Next dokümanı bunu "en hızlı başlangıç" diye verir. ([nextjs.org][7])
- React + routing + SSR + API routes hepsi hazır gelir
- Proje oluştururken size sorular sorar (TypeScript? ESLint? Tailwind CSS? vs.)

**`npm run dev`**
- Next'in dev server'ını açar; dokümanda `http://localhost:3000` ile ziyaret edersin. ([nextjs.org][7])
- Hem client-side hem server-side çalışır

### Next.js Proje Yapısı

```
my-app/
├── node_modules/
├── app/  (veya pages/)   ← Sayfalar burada (routing otomatik)
│   ├── layout.js        ← Ana layout
│   ├── page.js          ← Ana sayfa (/)
│   └── api/             ← API routes (/api/*)
├── public/               ← Statik dosyalar
├── next.config.js        ← Next.js ayarları
├── package.json
└── README.md
```

### Ne farkı var (React'a göre)?

**React + Vite/CRA (Varsayılan):**
- Genelde "frontend ağırlıklı SPA" için
- Sadece tarayıcıda çalışır (CSR - Client-Side Rendering)
- Routing için React Router eklemen gerekir
- Varsayılan olarak SSR yok (SEO için sorun olabilir)
- Vite ile SSR yapabilirsin ama manuel kurulum gerekir

**Next.js:**
- React'ın üstüne **routing + server-side özellikler + production build/start** gibi "ürünleştirme" paketini koyar
- File-based routing (dosya = route) — hazır gelir
- Built-in SSR (Server-Side Rendering) — hazır gelir
- API routes (backend endpointleri yazabilirsin) — hazır gelir
- SEO dostu — hazır gelir
- SSG (Static Site Generation) desteği — hazır gelir
- Next dokümanları `dev/build/start` scriptlerini açıkça anlatır. ([nextjs.org][8])

**Kafada Canlansın:**

```
┌─────────────────────────────────────────────────────────┐
│  VITE + REACT (Varsayılan SPA)                         │
│                                                          │
│  npm run dev                                            │
│     ↓                                                    │
│  [Tarayıcıya boş HTML + JS dosyaları gönderilir]       │
│     ↓                                                    │
│  [JS yüklenir, React render eder (CLIENT-SIDE)]        │
│     ↓                                                    │
│  [Sayfa görünür]                                        │
│                                                          │
│  ✅ Hızlı geliştirme                                    │
│  ⚠️ SEO için ideal değil (ilk yükleme boş HTML)        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  NEXT.JS (SSR/SSG)                                      │
│                                                          │
│  npm run dev                                            │
│     ↓                                                    │
│  [İstek gelir → Sunucuda React render edilir]          │
│     ↓                                                    │
│  [Tam HTML olarak döner (SERVER-SIDE)]                 │
│     ↓                                                    │
│  [Tarayıcıda görünür]                                   │
│     ↓                                                    │
│  [JS yüklenir, hydration yapılır (interactive)]        │
│                                                          │
│  ✅ SEO için mükemmel (ilk yüklemede HTML var)         │
│  ✅ İlk yükleme hızlı                                   │
└─────────────────────────────────────────────────────────┘
```

### Next.js Akış Örneği

```
┌─────────────────────────────────────────────────────────┐
│  NEXT.JS PROJESİ                                        │
│                                                          │
│  app/page.js  →  http://localhost:3000/                 │
│  app/about/page.js  →  http://localhost:3000/about      │
│  app/api/users/route.js  →  http://localhost:3000/api/users │
│                                                          │
│  File-based routing: Dosya yapısı = URL yapısı          │
└─────────────────────────────────────────────────────────┘
```

---

## Karşılaştırma Tablosu

| Özellik | Create React App | Vite + React | Next.js |
|---------|------------------|--------------|---------|
| **Kurulum komutu** | `npx create-react-app` | `npm create vite@latest` | `npx create-next-app@latest` |
| **Başlatma komutu** | `npm start` | `npm run dev` | `npm run dev` |
| **Başlatma hızı** | ⭐⭐ Yavaş | ⭐⭐⭐⭐⭐ Çok hızlı | ⭐⭐⭐⭐ Hızlı |
| **Hot Reload** | ⭐⭐⭐ Yavaş | ⭐⭐⭐⭐⭐ Çok hızlı | ⭐⭐⭐⭐ Hızlı |
| **Routing** | ❌ Yok (React Router ekle) | ❌ Yok (React Router ekle) | ✅ Built-in |
| **SSR** | ❌ Yok | ⚠️ Var (manuel kurulum) | ✅ Built-in (hazır) |
| **API Routes** | ❌ Yok | ❌ Yok | ✅ Built-in |
| **Varsayılan Rendering** | CSR (Client-Side) | CSR (Client-Side) | SSR/SSG (Server-Side) |
| **SEO** | ⚠️ SPA (zayıf) | ⚠️ SPA (zayıf, SSR ile iyileşir) | ✅ İyi |
| **Öğrenme eğrisi** | ⭐⭐ Düşük | ⭐⭐⭐ Orta | ⭐⭐⭐⭐ Yüksek |
| **Önerilme durumu** | ❌ Önerilmiyor | ✅ Öneriliyor | ✅ Öneriliyor |

---

## Hangi Yolu Seçmeli?

### Seçim Kılavuzu

```
┌─────────────────────────────────────────────────────────┐
│  NE YAPMAK İSTİYORSUN?                                  │
└─────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐    ┌─────────────────────┐
│ Sadece React  │    │ Full-Stack Uygulama │
│ öğreniyorum   │    │ (SSR, SEO, API)     │
│ Hafif proje   │    │                     │
└───────────────┘    └─────────────────────┘
        │                       │
        ▼                       ▼
┌───────────────┐    ┌─────────────────────┐
│  VITE + REACT │    │      NEXT.JS        │
│               │    │                     │
│ ✅ Hızlı      │    │ ✅ Routing          │
│ ✅ Modern     │    │ ✅ SSR              │
│ ✅ Öğrenmesi  │    │ ✅ API Routes       │
│   kolay       │    │ ✅ SEO              │
└───────────────┘    └─────────────────────┘
```

### Net Seçim Kuralı

**1. "Sadece React öğreneyim, hafif proje, SSR şart değil"** → **Vite + React**
  - Hızlı başlangıç için ideal
  - Modern build tool
  - React'ın temellerini öğrenmek için mükemmel
  - Dashboard, admin panel, iç araçlar gibi SPA'lar için mükemmel
  - SEO önemli değilse Vite yeterli

**2. "SEO, SSR, full-stack düşünürüm"** → **Next.js**
  - Production-ready uygulama için ideal
  - Hem frontend hem backend yazabilirsin
  - SEO önemliyse Next.js şart
  - E-ticaret, blog, haber sitesi gibi SEO kritik projeler için
  - SSR, SSG, routing, API routes hazır gelir

**3. "SSR istiyorum ama Next.js istemiyorum, kontrol bende olsun"** → **Vite + SSR (Manuel)**
  - Vite SSR desteği var ama manuel kurulum gerekir
  - Daha fazla kontrol istiyorsan Vite SSR kullanabilirsin
  - Routing, data fetching vs. kendin kurmalısın
  - Next.js'den daha esnek ama daha fazla iş yapmalısın

**4. "Eski proje, CRA kullanıyor"** → **CRA'da kal veya Vite'a geç**
  - Yeni proje için CRA önerilmiyor
  - Mevcut CRA projesi varsa çalışmaya devam edebilirsin
  - Yeni proje başlıyorsan Vite'a geç

### Vite vs Next.js: Detaylı Karar Verme

```
┌─────────────────────────────────────────────────────────┐
│  KARAR AĞACI                                            │
└─────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐    ┌─────────────────────┐
│ SEO ÖNEMLİ?   │    │  Sadece SPA?       │
│ SSR GEREKLİ?  │    │  Dashboard/Panel?   │
│               │    │                     │
└───────────────┘    └─────────────────────┘
        │                       │
        ▼                       ▼
┌───────────────┐    ┌─────────────────────┐
│   NEXT.JS     │    │  VITE + REACT       │
│               │    │                     │
│ ✅ Hazır SSR  │    │ ✅ Hızlı            │
│ ✅ Hazır      │    │ ✅ Basit            │
│   Routing     │    │ ✅ SPA için ideal   │
│ ✅ Hazır      │    │                     │
│   API Routes  │    │                     │
└───────────────┘    └─────────────────────┘
```

**Önemli Nokta:**
- **Vite = Build tool** (SPA/CSR için ideal, SSR yapabilirsin ama manuel)
- **Next.js = Framework** (SSR/SSG için hazır çözüm, paket halinde gelir)

---

## Özet

### Ortak Mantık (Hepsinde Aynı)

1. **Proje iskeleti kur** → Komut çalıştır (create-xxx-app)
2. **Paketleri indir** → `npm install` (bazen otomatik)
3. **Dev server başlat** → `npm start` veya `npm run dev`
4. **Tarayıcıda aç** → `http://localhost:3000`

### Farklar

- **CRA**: Artık önerilmiyor, yavaş
- **Vite**: Modern, hızlı, SPA/CSR için ideal; SSR yapabilirsin ama manuel
- **Next.js**: Full-stack, SSR/SSG hazır, SEO için ideal

### Kritik Anlayış

**Vite:**
- **Varsayılan**: SPA/CSR için build tool (en yaygın kullanım)
- **SSR**: Mümkün ama manuel kurulum gerekir
- **Kullanım**: React öğrenmek, dashboard/panel yapmak için ideal

**Next.js:**
- **Varsayılan**: SSR/SSG hazır gelir
- **Kullanım**: SEO kritik, full-stack uygulama için ideal

**Seçim Mantığı:**
- SEO önemli mi? → **Next.js**
- Sadece SPA yapacağım? → **Vite + React**
- SSR istiyorum ama Next istemiyorum? → **Vite SSR (manuel)**

---

## Kaynaklar

[1]: https://create-react-app.dev/docs/getting-started/ "Getting Started - Create React App"

[2]: https://tr.legacy.reactjs.org/docs/create-a-new-react-app.html "Yeni bir React Uygulaması Oluşturun"

[3]: https://react.dev/blog/2025/02/14/sunsetting-create-react-app "Sunsetting Create React App"

[4]: https://vite.dev/guide/ "Getting Started - Vite"

[5]: https://vite.dev/ "Vite | Next Generation Frontend Tooling"

[6]: https://react.dev/learn/build-a-react-app-from-scratch "Build a React app from Scratch"

[7]: https://nextjs.org/docs/app/getting-started/installation "Getting Started: Installation - Next.js"

[8]: https://nextjs.org/docs/pages/getting-started/deploying "Getting Started: Deploying - Next.js"

[9]: https://vite.dev/guide/ssr "Server-Side Rendering (SSR) - Vite"

