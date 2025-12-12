# Mülakat Hazırlık Notları

> **Not:** Bu doküman, CV'deki teknolojilere ve yazılan notlara göre hazırlanmış bir çalışma planıdır. Her kategori altında "neleri çalışmalısın" başlıkları bulunmaktadır.

---

## 📋 İçindekiler

1. [Genel Yazılım & OOP](#1-genel-yazılım--oop-dil-bağımsız)
2. [Web Temelleri & Network](#2-web-temelleri--network)
3. [Veritabanı, SQL Modelleme & ORM](#3-veritabanı-sql-modelleme--orm)
4. [C# / .NET Backend](#4-c--net-backend)
5. [Python / FastAPI & Real-Time](#5-python--fastapi--real-time)
6. [JavaScript Ekosistemi & Node.js](#6-javascript-ekosistemi--nodejs)
7. [Frontend – React](#7-frontend--react)
8. [Frontend – Vue 3 / Nuxt 3–4](#8-frontend--vue-3--nuxt-34)
9. [Frontend – Angular](#9-frontend--angular)
10. [Mimari & Sistem Tasarımı](#10-mimari--sistem-tasarımı)
11. [Messaging, Cache & Gerçek Zamanlı İletişim](#11-messaging-cache--gerçek-zamanlı-iletişim)
12. [DevOps & Araçlar](#12-devops--araçlar)
13. [Full-Stack Olarak Genel Sorabilecekleri](#13-full-stack-olarak-genel-sorabilecekleri)

---

## 1. GENEL YAZILIM & OOP (Dil Bağımsız)

### Neleri Çalışmalısın?

- ✅ **OOP Prensipleri** TAMAM
  - Encapsulation (Kapsülleme)
  - Inheritance (Kalıtım)
  - Polymorphism (Çok Biçimlilik)
  - Abstraction (Soyutlama)
  - Abstract Class kavramı
  - Interface vs Abstract Class farkı

- ✅ **SOLID Prensipleri** TAMAM 
  - Single Responsibility Principle
  - Open/Closed Principle
  - Liskov Substitution Principle
  - Interface Segregation Principle
  - Dependency Inversion Principle

- ✅ **Tasarım Desenleri** TAMAM
  - Repository Pattern
  - Unit of Work Pattern
  - Singleton Pattern
  - Factory Pattern

- ✅ **Clean Code & Refactoring**
  - Kod okunabilirliği
  - Refactoring teknikleri
  - Code smell'ler

- ✅ **Exception Handling (Genel Prensipler)**
  - Try/catch blokları mantığı
  - Exception türleri ve hiyerarşisi
  - Custom exception'lar oluşturma
  - Exception handling best practices
  - Hata yakalama stratejileri

- ✅ **Asenkron Programlama Mantığı**
  - Thread kavramı
  - Async/await kullanımı (genel prensip)
  - Deadlock riskleri ve önleme

---

## 2. WEB TEMELLERİ & NETWORK

### Neleri Çalışmalısın?

- ✅ **HTTP Protokolü Temel Kavramlar**
  - **Methodlar:**
    - GET
    - POST
    - PUT
    - PATCH
    - DELETE
  - **Status Code'lar:**
    - 200 (OK)
    - 201 (Created)
    - 400 (Bad Request)
    - 401 (Unauthorized)
    - 403 (Forbidden)
    - 404 (Not Found)
    - 500 (Internal Server Error)

- ✅ **HTTP vs HTTPS**
  - TLS/SSL genel mantığı
  - Certificate yönetimi
  - Security best practices

- ✅ **DNS Nedir, Nasıl Çalışır**
  - Domain → IP çözümleme
  - DNS record types
  - DNS caching

- ✅ **CORS (Cross-Origin Resource Sharing)**
  - Same-Origin Policy
  - Preflight request fikri
  - CORS headers

- ✅ **Cookie, Session, localStorage Farkları**
  - Storage mechanisms
  - Security considerations
  - Use cases

- ✅ **Temel Güvenlik Konuları**
  - **XSS (Cross-Site Scripting)**
  - **CSRF (Cross-Site Request Forgery)**
  - **SQL Injection** (özellikle backend & DB tarafı)

---

## 3. VERİTABANI, SQL MODELLEME & ORM

### Neleri Çalışmalısın?

- ✅ **SQL Temel Sorgular** TAMAM
  - SELECT
  - INSERT
  - UPDATE
  - DELETE

- ✅ **JOIN Türleri** TAMAM
  - INNER JOIN
  - LEFT JOIN
  - RIGHT JOIN
  - FULL OUTER JOIN

- ✅ **Normalizasyon & Denormalizasyon** TAMAM
  - 1NF (First Normal Form)
  - 2NF (Second Normal Form)
  - 3NF (Third Normal Form)
  - Denormalizasyon senaryoları

- ✅ **Index Mantığı**
  - Clustered index
  - Non-clustered index
  - Index kullanım stratejileri

- ✅ **Transaction ve ACID Prensipleri**
  - Atomicity
  - Consistency
  - Isolation
  - Durability


- ✅ **SQL Model Tasarımı**
  - Tablolar
  - İlişkiler (Relationships)
  - Foreign key
  - Cascade davranışı

- ✅ **ORM Nedir, Ne İşe Yarar**
  - EF Core
  - SQLAlchemy
  - ORM avantaj/dezavantajları

- ✅ **EF Core Özelinde**
  - Change tracking
  - Lazy loading
  - Eager loading
  - Migrations

---

## 4. C# / .NET BACKEND

### Neleri Çalışmalısın?

- ✅ **C# Dili Temelleri**
  - Value vs Reference Type
  - Class vs Struct farkı
  - Class türleri:
    - Sealed class
    - Static class
    - Partial class
    - Nested class
    - Record class (C# 9+)
  - Generics
  - Delegates
  - Events

- ✅ **.NET Core / .NET 8 Mimarisı**
  - Program.cs yapısı
  - Middleware pipeline
  - DI Container (ServiceCollection)

- ✅ **Dependency Injection (DI)**
  - DI Container kullanımı (ServiceCollection)
  - Constructor injection
  - Service lifetime yönetimi (Scoped, Singleton, Transient)
  - Service registration ve resolution

- ✅ **ASP.NET Core Web API Temelleri**
  - Controller ve Action mantığı
  - Routing
  - Attribute routing
  - Model binding
  

- ✅ **REST API Tasarımı** TAMAM
  - Resource kavramı
  - Endpoint tasarımı
  - HTTP Status Code mantığı

- ✅ **API Testing & Documentation**
  - Postman kullanımı
  - API test etme (GET, POST, PUT, DELETE)
  - Swagger/OpenAPI okuma
  - "Bir API'yi nasıl test edersin?" sorusuna cevap

- ✅ **Entity Framework Core**
  - Change tracking
  - Migrations
  - DbContext yönetimi
  - Query optimization

- ✅ **LINQ ile Veri Sorgulama**
  - Query syntax
  - Method syntax
  - IQueryable vs IEnumerable

- ✅ **Asenkron Programlama (.NET)**
  - Task ve Task<T> kullanımı
  - Async/await .NET implementasyonu
  - ConfigureAwait kullanımı
  - Async void vs async Task
  - IAsyncEnumerable

- ✅ **Repository Pattern & Unit of Work**
  - Repository implementasyonu
  - Unit of Work pattern
  - Generic repository

- ✅ **Model Binding & DTO Kullanımı**
  - Request/Response modelleri
  - AutoMapper kullanımı
  - DTO pattern

- ✅ **Validation**
  - FluentValidation
  - Data Annotations
  - Custom validators

- ✅ **Authentication & Authorization**
  - JWT (JSON Web Token)
  - Claims-based authentication
  - Role-based authorization

- ✅ **Configuration & appsettings**
  - appsettings.json yapısı
  - Environment bazlı konfigürasyon
  - Options pattern

- ✅ **Logging**
  - ILogger interface
  - Serilog entegrasyonu
  - Log seviyeleri
  - Logging best practices

- ✅ **Error Handling & Logging**
  - Try-catch kullanımı
  - Global error handling middleware
  - "Production'da bir hata olursa nasıl yakalarsın?" sorusuna cevap
  - Error monitoring (Sentry kullanımı)
  - Exception logging stratejileri

---

## 5. PYTHON / FASTAPI & REAL-TIME

### Neleri Çalışmalısın?

- ✅ **Python Temel Söz Dizimi**
  - Syntax ve yapı taşları
  - Veri tipleri
  - Fonksiyonlar ve modüller

- ✅ **FastAPI ile REST API Geliştirme**
  - FastAPI framework
  - Route tanımlama
  - Dependency injection

- ✅ **API Testing & Documentation**
  - Postman kullanımı
  - API test etme
  - FastAPI automatic docs (Swagger/OpenAPI)
  - "Bir API'yi nasıl test edersin?" sorusuna cevap

- ✅ **Pydantic Modeller**
  - Request/response şema mantığı
  - Validation
  - Serialization

- ✅ **Async FastAPI**
  - `async def` kullanımı
  - `await` keyword
  - Async DB driver

- ✅ **PostgreSQL + SQLAlchemy**
  - ORM tarafı
  - Model tanımlama
  - Session yönetimi

- ✅ **Alembic ile Migration Yönetimi**
  - Migration oluşturma
  - Migration uygulama
  - Version control

- ✅ **WebSocket ile Gerçek Zamanlı İletişim**
  - FastAPI WebSocket endpoints
  - Real-time data streaming
  - Connection management

- ✅ **JWT ile Kimlik Doğrulama**
  - Login mekanizması
  - Refresh token mantığı
  - Token validation

- ✅ **Testler**
  - pytest framework
  - pytest-asyncio ile async test
  - Test coverage

- ✅ **Sentry ile Hata İzleme**
  - Error tracking
  - Performance monitoring
  - Alert yönetimi

- ✅ **Error Handling & Logging**
  - Try-except kullanımı
  - Global exception handlers
  - "Production'da bir hata olursa nasıl yakalarsın?" sorusuna cevap
  - Logging best practices (Python logging module)
  - Error monitoring (Sentry entegrasyonu)

---

## 6. JAVASCRIPT EKOSİSTEMİ & NODE.JS

### Neleri Çalışmalısın?

- ✅ **JavaScript Temel Kavramlar**
  - Scope (Global, Function, Block)
  - Closure
  - `this` keyword
  - Event loop
  - Callback, Promise, Async/Await

- ✅ **TypeScript**
  - Type system
  - Interface vs Type
  - Generics
  - Utility types
  - Type inference

- ✅ **Promise / Async-Await**
  - Promise chain
  - Async/await syntax
  - Error handling
  - Promise.all(), Promise.race()

- ✅ **DOM ve Virtual DOM Mantığı**
  - DOM manipulation
  - Virtual DOM kavramı
  - Diffing algoritması

- ✅ **Fetch / Axios ile API Tüketme**
  - HTTP istekleri
  - Request/Response handling
  - Error handling

- ✅ **Component Tabanlı Mimari**
  - React/Vue/Angular ortak mantığı
  - Component lifecycle
  - Props ve state

- ✅ **JavaScript Ekosistemi İlişkileri**
  - **JavaScript** → Temel programlama dili (hem browser'da hem Node.js'te çalışır)
  - **Node.js** → JavaScript'i sunucu tarafında çalıştıran runtime (backend için)
  - **Next.js** → React framework'ü (SSR, SSG, routing, API routes dahil)
  - **Nuxt.js** → Vue framework'ü (SSR, SSG, routing, server routes dahil)
  - İlişki: JavaScript → Node.js (backend), JavaScript → React/Vue (frontend), React → Next.js, Vue → Nuxt.js
  - Full-stack JavaScript: Aynı dili hem frontend hem backend'de kullanma

- ✅ **Node.js Backend Geliştirme**
  - Node.js runtime ve V8 engine
  - NPM (Node Package Manager) kullanımı
  - CommonJS vs ES Modules
  - File system işlemleri (`fs` module)
  - HTTP server oluşturma (native `http` veya Express.js)
  - Express.js framework temelleri
  - Middleware kavramı
  - RESTful API oluşturma
  - Environment variables (`.env` dosyası)
  - Error handling ve async hata yakalama
  - Package.json ve dependency yönetimi

---

## 7. FRONTEND – REACT

### Neleri Çalışmalısın?

- ✅ **React Component Yapısı**
  - Function component (modern yaklaşım): `function MyComponent() { return <div>...</div> }`
  - JSX syntax: HTML benzeri ama JavaScript içinde, `{}` ile JS ifadeleri yazılır
  - Component composition: Küçük bileşenleri birleştirerek büyük UI'ler oluşturma
  - `children` kullanımı (örn: `<Card><Content /></Card>`)

- ✅ **React Hooks**
  - `useState` - State yönetimi
  - `useEffect` - Side effects (API istekleri, event dinleme)
  - `useContext` - Global veri paylaşımı (theme, auth, language)
  - `useMemo` - Hesaplanan değeri cache'leme (performans optimizasyonu)
  - `useCallback` - Fonksiyonu yeniden tanımlamayı engelleme (performans optimizasyonu)
  - Custom hooks - Tekrarlayan mantığı modüler hale getirme (`useForm`, `useAuth` gibi)

- ✅ **Props ve State Yönetimi**
  - Props → Üstten alta veri aktarma (parent → child)
  - State → Component içi veri durumu
  - Unidirectional data flow → Veriler yukarıdan aşağı akar, değişiklikler callback ile yukarı iletilir
  - Props drilling → Fazla derin prop geçişinden kaçınmak için Context kullanılır
  - State lifting → State'i yukarı taşıma, shared state pattern

- ✅ **Form Yönetimi & Validasyon**
  - Controlled component: Input'un değeri state'ten gelir (`value={state}` + `onChange`)
  - Uncontrolled component: DOM üzerinden `ref` ile değer okunur
  - Form validasyon yöntemleri:
    - Manuel validasyon (`if (!email.includes('@'))`)
    - Kütüphane ile: React Hook Form, Formik, Zod, Yup gibi

- ✅ **Routing – React Router**
  - React Router v6 kullanımı: `<BrowserRouter>`, `<Routes>`, `<Route path="/about" element={<About />} />`
  - Dinamik route parametreleri: `/users/:id` → `useParams()` ile `id` okunur
  - Link ile sayfa geçişi: `<Link to="/about">About</Link>`
  - Protected routes (gizli sayfalar): Kullanıcı login değilse `<Navigate to="/login" />` ile yönlendirme
  - Navigation guards

- ✅ **API Entegrasyonu**
  - `useEffect` + `fetch` veya `axios` ile veri çekme
  - Loading / error state yönetimi
  - State'e veri kaydetme ve UI'a yansıtma
  - Örnek: Kullanıcı listesini çekip listeleme

- ✅ **Performans Optimizasyonu**
  - Memoization: `useMemo` ile hesaplanan değeri cache'leme, `useCallback` ile fonksiyon yeniden tanımlamayı engelleme
  - Virtual DOM ve re-render yönetimi: Gereksiz re-render'ı engellemek için `React.memo`, `key` kullanımı
  - Lazy loading & code splitting: `React.lazy()` + `Suspense` ile sayfaları parça parça yükleme

- ✅ **Global State Management**
  - Context API: `createContext()` → `Provider` ile değer paylaş, `useContext()` ile kullan
  - `useReducer`: Karmaşık state yapılarında `dispatch` & `reducer` mantığı (Redux benzeri)
  - Context + Reducer kombinasyonu: Global yönetim ihtiyacına çözüm (`AppContext` + `AppReducer`)
  - Alternatif state yönetimi kütüphaneleri: Zustand, Recoil

- ✅ **Next.js (React Framework)**
  - Next.js nedir: React tabanlı full-stack framework
  - SSR (Server-Side Rendering) ve SSG (Static Site Generation)
  - Pages Router vs App Router (Next.js 13+)
  - File-based routing: `pages/` klasörü yapısı
  - API Routes: `/pages/api` veya `/app/api` altında backend endpoint'leri yazma
  - `getServerSideProps`, `getStaticProps`, `getStaticPaths` (Pages Router)
  - `useRouter` hook ile routing
  - Image optimization (`next/image`)
  - Automatic code splitting
  - Built-in CSS support (CSS Modules, styled-jsx)
  - Middleware ile request interception
  - Environment variables ve config
  - Deployment (Vercel, Docker vb.)

- ✅ **İleri Seviye Konular (Araştırılması Gerekenler)**
  - React Hook Form / Formik (gelişmiş form yönetimi)
  - Zod / Yup (schema tabanlı validasyon)
  - React Query / SWR (data fetching ve caching optimizasyonları)
  - Testing (Jest, React Testing Library) - UI testleri ve component güvenilirliği

---

## 8. FRONTEND – VUE 3 / NUXT 3–4

### Neleri Çalışmalısın?

- ✅ **Vue 3 Temel Kavramlar**
  - Single File Component (SFC) yapısı: `template`, `script`, `style`
  - Component yapısı
  - Parent-child ilişkisi mantığı
  - Props ile üstten alta veri geçirme
  - Emits ile alttan üste event gönderme
  - Lifecycle hooks (`onMounted`, `onUpdated`, `onUnmounted` vb.)
  - Ne zaman API çağrısı yapmalı, neyi nerede başlatmalı?

- ✅ **Composition API**
  - `setup()` fonksiyonunun mantığı
  - `ref()` ve `reactive()` ile reaktif state tutma
  - `computed()` ile türetilmiş değerler
  - `watch()` / `watchEffect()` ile değişiklikleri izleme
  - Composable yapılar (tekrarlayan mantığı ayrı dosyalara bölmek)
  - Örnek composable'lar: `useAuth()`, `useForm()`
  - Büyük komponentleri parçalayıp daha okunabilir hale getirme

- ✅ **Options API vs Composition API**
  - Options API: `data`, `methods`, `computed`, `watch` blokları
  - Küçük / orta projelerde hızlı ve anlaşılır yapı
  - Composition API: Mantığı "özellik bazlı" gruplama (auth, filtreler, pagination vb.)
  - Büyük projelerde okunabilirlik ve tekrar kullanılabilirlik
  - Farklar ve kullanım senaryoları
  - Migration stratejisi: Vue 2 → Vue 3 veya Options → Composition geçişi
  - Önce yeni yazılanlarda Composition kullanmak, zamanla eski bileşenleri parça parça dönüştürmek

- ✅ **Vue Router (Yönlendirme)**
  - Route tanımlama (path → component eşlemesi)
  - Dinamik route'lar: `/users/:id`
  - Nested (iç içe) route'lar
  - Lazy-loaded route'lar (code splitting için)
  - Guard'lar: Global guard (`beforeEach`), Route bazlı guard (`beforeEnter`)
  - Auth kontrolü, yetkisiz kullanıcıyı login sayfasına atma

- ✅ **Pinia ile Global State Management**
  - Store mantığı: `defineStore()` ile store tanımlama
  - `state` → global reaktif veri
  - `getters` → hesaplanmış global değerler
  - `actions` → async işlemler, API çağrıları
  - Kullanım senaryoları: Auth bilgisi (kullanıcı, token), filtreler, sepet, tema ayarları vb.
  - DevTools entegrasyonu: State değişimlerini izleme, hangi action çağrılmış görme

- ✅ **Nuxt.js (Vue Framework)**
  - Nuxt.js nedir: Vue tabanlı full-stack framework
  - Project yapısı: `pages/` → otomatik routing, `layouts/` → ortak layout'lar (admin, public, auth vb.), `middleware/` → route bazlı kontrol
  - Pages yapısı ve file-based routing
  - Layouts: Ortak layout yapıları (`default.vue`, `admin.vue` vb.)
  - Middleware mantığı (auth kontrolü, yetkilendirme)
  - Server-side rendering (SSR) ve Static Site Generation (SSG)
  - Server-side rendering ve SEO
  - Meta tag / title / description ayarlama (`useHead`, `useSeoMeta`)
  - SEO için SSR'in neden önemli olduğu
  - Server Routes: `/server/api` altında backend endpoint'leri yazma
  - Auto-imports: Composables, utilities otomatik import
  - Nuxt Modules ve plugin sistemi

- ✅ **Nuxt'ta Veri Yönetimi & API Entegrasyonu**
  - Data fetch stratejileri: `useFetch`, `useAsyncData` ile server-side data fetch
  - Sadece client'ta çalışan istekler (browser-only şeyler)
  - API katmanı: `/server/api` altında endpoint yazma (Nuxt server routes)
  - Frontend tarafında bu endpoint'leri tüketme
  - Caching & reuse: Aynı veriyi tekrar tekrar çekmemek için cache stratejisi
  - Pinia + Nuxt kombinasyonu (global state + SSR)

- ✅ **Form Validasyonu**
  - Temel validasyon mantığı: Required / min-max / pattern gibi kontroller
  - Submit öncesi senaryo ve hata mesajları
  - Şema bazlı validasyon (Zod vb.): `z.object({ ... })` ile şema oluşturma
  - Zod entegrasyonu
  - Form datasını şemaya göre validate etme
  - `safeParse` ile hata yakalama ve hata mesajı gösterme
  - Error handling: Field bazlı hata göstermek (input altında), global error mesajları

- ✅ **UI Component Kütüphaneleri**
  - Ücretsiz ve açık kaynak Vue UI kütüphaneleri (Vuetify, Quasar, PrimeVue, Element Plus vb.)
  - Grid/DataTable component: Sayfalama, sıralama, filtreleme, büyük veri kümelerinde performanslı listeleme
  - Component entegrasyonu ve özelleştirme
  - Genel UI mantığı: Form bileşenleri, modallar, tablar, grafikler
  - Kendi reusable component'lerini yazma

- ✅ **Büyük Data Setlerinde Performans**
  - Server-side pagination: API'dan sayfa sayfa veri çekme, page, pageSize, sort, filter parametreleriyle çalışma
  - Filtering & sorting: Sunucu tarafında filtre/sort
  - Input'a `debounce` ekleyerek gereksiz istekleri azaltma
  - Virtual scrolling: Sadece ekranda görünen item'ların render edilmesi, uzun listelerde FPS ve UX'i koruma

- ✅ **Tailwind CSS ile Component Tasarımı**
  - Utility-first yaklaşımı: `flex`, `grid`, `p-4`, `mt-2`, `text-sm` gibi sınıflarla stil verme
  - Responsive design: `sm:`, `md:`, `lg:` prefix'leriyle breakpoint bazlı tasarım
  - Custom components: Sık kullanılan kombinasyonlardan kendi UI component'lerini oluşturma
  - Design system mantığı: buton, kart, input, modal gibi ortak parçalar

---

## 9. FRONTEND – ANGULAR

### Neleri Çalışmalısın?

- ✅ **Angular Temel Mimari**
  - Module yapısı
  - Component
  - Service
  - Dependency Injection

- ✅ **Data Binding Türleri**
  - One-way binding (`{{ }}`, `[property]`)
  - Two-way binding (`[(ngModel)]`)
  - Event binding (`(event)`)

- ✅ **Dependency Injection (Angular)**
  - Injectable decorator
  - Provider kavramı
  - Service injection

- ✅ **HttpClient ile API Tüketimi**
  - HTTP methods
  - Observable handling
  - Error handling

- ✅ **Routing ve Guards**
  - Router module
  - Route guards (CanActivate, CanDeactivate)
  - Lazy loading

- ✅ **RxJS Temelleri**
  - Observable vs Promise
  - Operators (map, filter, switchMap)
  - Subscription management

---

## 10. MİMARİ & SİSTEM TASARIMI

### Neleri Çalışmalısın?

- ✅ **Uygulama Mimari Desenleri**
  - **Layered / N-Katmanlı Mimari**
    - UI (Presentation) Katmanı
    - Business (Service) Katmanı
    - Data Access Katmanı
    - Katmanlar arası iletişim
  - **Clean Architecture**
    - Dependency rule
    - Use cases
    - Entities ve value objects
  - **Onion Architecture**
    - Domain core
    - Application layer
    - Infrastructure layer
  - **Hexagonal Architecture (Ports & Adapters)**
    - Ports kavramı
    - Adapters (primary/secondary)

- ✅ **Monolith vs Microservice Mimarisı**
  - Monolith avantaj/dezavantajları
  - Microservice avantaj/dezavantajları
  - Kullanım senaryoları

- ✅ **Microservice Avantaj/Dezavantajları**
  - Scalability
  - Complexity
  - Deployment
  - Team structure

- ✅ **API Gateway Mantığı**
  - Request routing
  - Authentication/Authorization
  - Rate limiting
  - Load balancing

- ✅ **Service-to-Service İletişim Yöntemleri**
  - HTTP/REST
  - Message queue
  - gRPC
  - Event-driven communication

- ✅ **Caching Stratejileri**
  - In-memory cache
  - Distributed cache
  - Cache invalidation
  - Cache patterns

- ✅ **Scaling**
  - Horizontal scaling
  - Vertical scaling
  - Auto-scaling strategies

- ✅ **Logging & Tracing**
  - Distributed tracing
  - Correlation IDs
  - Log aggregation

- ✅ **Fault Tolerance / Resiliency**
  - Retry patterns
  - Circuit breaker
  - Timeout handling
  - Fallback mechanisms

---

## 11. MESSAGING, CACHE & GERÇEK ZAMANLI İLETİŞİM

### Neleri Çalışmalısın?

- ✅ **RabbitMQ** TAMAM
  - Queue kavramı
  - Exchange types
  - Routing key mantığı
  - Producer / Consumer kavramları

- ✅ **Redis** TAMAM
  - In-memory cache olarak kullanım
  - Key-value store mantığı
  - Session management
  - Token storage
  - Rate limiting

- ✅ **WebSocket**
  - HTTP vs WebSocket farkı
  - Real-time chat senaryoları
  - Notification sistemleri
  - Connection management

- ✅ **Event-Driven Architecture Temel Fikri**
  - Event sourcing
  - CQRS pattern
  - Message brokers

---

## 12. DEVOPS & ARAÇLAR

### Neleri Çalışmalısın?

- ✅ **Git**
  - Commit, branch, merge, rebase
  - Git flow / Feature branch yaklaşımı
  - Conflict resolution

- ✅ **GitHub / GitLab Akışı**
  - Pull Request (PR) mantığı
  - Code review süreci
  - Issue yönetimi

- ✅ **CI/CD**
  - Continuous Integration fikri
  - Test, build, deploy pipeline zinciri
  - Basit bir pipeline'da neler olur:
    - Test → Build → Docker Image → Deploy

- ✅ **Docker** TAMAM
  - Image, container, Dockerfile mantığı
  - Docker Compose ile çoklu servis ayağa kaldırma
  - Container vs Virtual Machine farkı

- ✅ **Temel Monitoring & Logging**
  - Sentry
  - Log aggregation fikri
  - Application performance monitoring

- ✅ **İş Süreçleri & Agile/Scrum**
  - Agile/Scrum temel kavramlar
  - Sprint planning, daily standup
  - Jira/Trello kullanımı
  - "Bir task'ı nasıl alırsın ve tamamlarsın?" sorusuna cevap
  - Story points ve estimation
  - Retrospective mantığı

---

## 13. "FULL-STACK" OLARAK GENEL SORABİLECEKLERİ

### Neleri Çalışmalısın?

- ✅ **"Son yaptığın projeyi uçtan uca anlat"**
  - Filo Yönetimi
  - Gerçek Zamanlı Mesajlaşma
  - Doktor Randevu
  - Diğer projeler

- ✅ **"Bu projede frontend–backend–database akışı nasıl?"**
  - Request flow
  - Data transformation
  - Error handling

- ✅ **"Auth sürecini komple anlat"**
  - Login'den token doğrulamaya
  - Token refresh mekanizması
  - Role-based access control

- ✅ **"Performans problemi yaşasan nerede ne yaparsın?"**
  - Frontend optimizasyon
  - Backend optimizasyon
  - Database query optimization
  - Caching strategies

- ✅ **"Takımda nasıl çalışıyorsun?"**
  - Branch stratejisi
  - Code review süreci
  - Issue yönetimi
  - Agile/Scrum metodolojisi
  - Sprint içinde task yönetimi

---

## 🎯 Çalışma Stratejisi

### İlk Turda Öncelik Verilecek Kategoriler:

1. **Kategori 1:** Genel Yazılım & OOP
2. **Kategori 2:** Web Temelleri & Network
3. **Kategori 3:** Veritabanı, SQL & ORM
4. **Kategori 4:** C# / .NET Backend
5. **Kategori 10:** Mimari & Sistem Tasarımı
6. **Kategori 12:** DevOps & Araçlar

> **Not:** Bu kategoriler temel kavramlar + backend + mimari + devops konularını kapsar.

### Sonraki Aşama:

- Frontend kategorilerini (6, 7, 8, 9) derinleştir
- Python / FastAPI konularını pekiştir
- Messaging, Cache & Gerçek Zamanlı İletişim üzerinde çalış
- Full-stack senaryoları üzerinde çalış

---

## 📝 Sonraki Adımlar

İstersen bir sonraki adımda şunu yapabiliriz:

> **"Mesela Kategori 4 – C#/.NET Backend için sana tam mülakat soru listesi yazayım, sen de cevaplamaya çalış, ben de cevaplarını düzelteyim."**

Doğrudan hangi kategoriden başlamak istediğini söyle, oradan yardırırız.

---

**Son Güncelleme:** 2024

