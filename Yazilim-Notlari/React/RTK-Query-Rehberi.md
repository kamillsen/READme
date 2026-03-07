# RTK Query Rehberi — Öğrenci Notları

## İçindekiler

1. [RTK Query Nedir?](#1-rtk-query-nedir)
2. [createApi ile API Servisi Kurulumu](#2-createapi-ile-api-servisi-kurulumu)
3. [createSlice vs createApi — Temel Fark](#3-createslice-vs-createapi--temel-fark)
4. [createApi Ne Üretiyor?](#4-createapi-ne-üretiyor)
5. [baseQuery — Her İsteğin Geçtiği Kapı](#5-basequery--her-isteğin-geçtiği-kapı)
6. [Tag Sistemi — Cache Yönetiminin Kalbi](#6-tag-sistemi--cache-yönetiminin-kalbi)
7. [Endpoints — Query ve Mutation](#7-endpoints--query-ve-mutation)
8. [providesTags — Etiket Yapıştırma](#8-providestags--etiket-yapıştırma)
9. [invalidatesTags — Etiketleri Geçersiz Kılma](#9-invalidatestags--etiketleri-geçersiz-kılma)
10. [Store Kurulumu — Reducer ve Middleware](#10-store-kurulumu--reducer-ve-middleware)
11. [Cache Nerede? — State'in Kendisi Cache](#11-cache-nerede--statein-kendisi-cache)
12. [Tam Akış: useGetPatientsQuery() Çağrıldığında Ne Olur?](#12-tam-akış-usegetpatientsquery-çağrıldığında-ne-olur)
13. [hooks.ts ve providers.tsx — Yardımcı Dosyalar](#13-hooksts-ve-providerstsx--yardımcı-dosyalar)
14. [Proje Bağlantı Zinciri — Neresi Nereyi Buluyor?](#14-proje-bağlantı-zinciri--neresi-nereyi-buluyor)
15. [Dosyalar Arası İlişki — Büyük Resim](#15-dosyalar-arası-ilişki--büyük-resim)
16. [Pratik İpuçları](#16-pratik-ipuçları)
17. [Özet Tablolar](#17-özet-tablolar)

---

## 1. RTK Query Nedir?

RTK Query, Redux Toolkit'in içinde gelen bir **veri çekme ve cache yönetim aracı**. Sen sadece API adresini söylüyorsun, gerisini RTK Query hallediyor:

- API istekleri (GET, POST, PUT, DELETE)
- Cache yönetimi (aynı veriyi tekrar tekrar çekmemek)
- Otomatik yeniden çekme (veri değişince listeyi güncelleme)
- Loading / error durumları
- Token yönetimi (baseQuery ile)

---

## 2. createApi ile API Servisi Kurulumu

```typescript
export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  baseQuery,
  tagTypes: ["Appointments"],
  endpoints: (builder) => ({ ... })
})
```

Bu, RTK Query ile bir **API servisi** oluşturduğumuz yer. Bir fabrika kuruyoruz gibi düşün — bu fabrika, randevularla ilgili tüm API isteklerini yönetecek.

### 2.1 `reducerPath: "appointmentApi"` — Depo Adı

Redux store'unda bu API'ye ait tüm verilerin duracağı klasörün adı.

Redux store'u devasa bir kütüphane. `reducerPath` diyor ki: "Bu API'den gelen bütün cevapları, loading durumlarını, hataları **'appointmentApi'** isimli rafta sakla."

Redux DevTools'da:

```
Root State
├── appointmentApi    <-- İşte burası!
│   ├── queries
│   ├── mutations
│   └── provided
├── auth
└── theme
```

### 2.2 `baseQuery` — Ortak Ayarlar

Tüm API isteklerinin **ortak ayarlarını** içeren fonksiyon. Her istekte şu işlemleri otomatik yapar:
- Token'ı cookie'den alıp header'a ekler
- Token süresi dolduysa yenilemeyi dener
- Hata varsa yakalar

### 2.3 `tagTypes: ["Appointments"]` — Etiket Türleri

Bu API'de hangi tür etiketler kullanılacağını belirler. Uygulamada ilaçlar, reçeteler, hastalar da olabilir ama **bu API sadece randevularla ilgili**, o yüzden sadece `"Appointments"` var.

---

## 3. createSlice vs createApi — Temel Fark

Bu projede `createSlice` **kullanılmıyor**. Onun yerine `createApi` var.

```javascript
// createSlice → Sen state tanımlarsın, sen reducer yazarsın, sen dispatch edersin
const urunSlice = createSlice({
  name: 'urun',
  initialState: { liste: [] },
  reducers: {
    urunEkle: (state, action) => { state.liste.push(action.payload) }
  }
});
```

```typescript
// createApi → Sen sadece API adresini söylersin, gerisini RTK Query halleder
const patientApi = createApi({
  reducerPath: "patientApi",
  baseQuery,
  endpoints: (builder) => ({
    getPatients: builder.query({ query: () => "/patient/patients" })
  })
});
```

**Fark şu:** `createSlice`'da state'i, reducer'ı, action'ları **sen yazıyorsun**. `createApi`'da bunların **hepsini RTK Query otomatik üretiyor**.

---

## 4. createApi Ne Üretiyor?

`createApi` çağırdığında sana **3 şey** veriyor:

| `createApi`'nin ürettiği | Ne işe yarar | Nerede kullanılır |
|---|---|---|
| `patientApi.reducer` | Gelen veriyi state'e yazan fonksiyon (cache'e yazar) | `store.ts`'de reducer'a ekleniyor |
| `patientApi.reducerPath` | Bu reducer'ın store'daki anahtar ismi (`"patientApi"`) | `store.ts`'de reducer anahtarı olarak |
| `patientApi.middleware` | Cache, tag invalidation, polling işlerini yöneten ara katman | `store.ts`'de middleware'e ekleniyor |

Bunlara ek olarak her endpoint için **otomatik hook** üretir:

| Endpoint tanımı | Üretilen hook |
|---|---|
| `getPatients: builder.query(...)` | `useGetPatientsQuery()` |
| `createPatient: builder.mutation(...)` | `useCreatePatientMutation()` |

### createSlice ile karşılaştırma:

```javascript
// createSlice şunları üretiyordu:
urunSlice.reducer   // → store'a eklenecek reducer
urunSlice.actions   // → { urunEkle, urunSil, ... }

// createApi şunları üretiyor:
patientApi.reducer      // → store'a eklenecek reducer (cache verileri tutar)
patientApi.reducerPath  // → store'daki anahtar ismi ("patientApi")
patientApi.middleware   // → cache yönetim ara katmanı
// + otomatik hook'lar: useGetPatientsQuery, useCreatePatientMutation, ...
```

---

## 5. baseQuery — Her İsteğin Geçtiği Kapı

Tüm `createApi`'ler aynı `baseQuery`'yi kullanıyor:

```typescript
// patientApi.ts → baseQuery
// authApi.ts    → baseQuery
// labApi.ts     → baseQuery
// Hepsi aynı kapıdan geçiyor
```

`baseQuery` her API isteğinde otomatik olarak:

1. Cookie'den token'ı alır → header'a `Authorization: Bearer xxx` ekler
2. İsteği gönderir
3. 401 hatası gelirse → `/auth/refresh` çağırır → yeni token alır → cookie'ye yazar → orijinal isteği tekrar dener

```typescript
// base.ts:

// 1) Cookie'den token alınıyor:
function getAccessTokenFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )accessToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// 2) İstek hazırlanıyor:
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8080/api",
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = getAccessTokenFromCookie();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// 3) İstek gönderiliyor ve 401 kontrolü yapılıyor:
let result = await rawBaseQuery(args, api, extraOptions);
if (result.error && result.error.status === 401) {
  // Token yenileme mantığı...
}
return result;
```

---

## 6. Tag Sistemi — Cache Yönetiminin Kalbi

### Tag (Etiket) Nedir?

Tag'ler, RTK Query'nin **verileri etiketleyerek cache'te tuttuğu** ve **hangi verinin ne zaman güncelleneceğini bildiği** bir sistemdir.

Düşün ki bir kütüphanesin. Kitaplara etiket yapıştırıyorsun:
- `{ type: "Appointments", id: 5 }` → "5 nolu randevu"
- `{ type: "Appointments", id: "LIST" }` → "Tüm randevu listesi"

### İki Tür Etiket — Neden İkisi de Var?

#### A) ID'li Etiket `{ type: "Appointments", id: 5 }`
- **Tekil erişimler için** (`getAppointmentById`)
- Tek bir kayıt değişince **sadece o kaydı** günceller

#### B) LIST Etiketi `{ type: "Appointments", id: "LIST" }`
- **Liste erişimleri için** (`getAppointments`)
- Herhangi bir değişiklikte **tüm listeyi** günceller

#### Neden İkisi Birden?

```typescript
// getAppointments'da:
providesTags: [
  ...result.data.map(({ id }) => ({ type: "Appointments", id })), // Tekiller
  { type: "Appointments", id: "LIST" } // Liste
]

// Bu sayede:
// - getAppointmentById(5) → cache'den gelir (id:5 etiketi var)
// - getAppointments() → cache'den gelir (LIST etiketi var)
```

---

## 7. Endpoints — Query ve Mutation

```typescript
endpoints: (builder) => ({
  // ... sorgular ve mutasyonlar
})
```

`builder` bir **inşaat ustası**. Bize iki araç verir:

| Araç | Kullanım | HTTP Metodu |
|---|---|---|
| `builder.query` | Veri **çekmek** için | GET |
| `builder.mutation` | Veri **değiştirmek** için | POST, PUT, PATCH, DELETE |

---

## 8. providesTags — Etiket Yapıştırma (Query'lerde)

Bir sorgu çalıştığında, **gelen verilere etiket yapıştırır**. Böylece RTK Query "Hangi veriler cache'de?" bilir.

### Liste Sorgusu: `getAppointments`

```typescript
getAppointments: builder.query<
  AppointmentsListResponse,
  GetAppointmentasQuery | void
>({
  query: (params) => ({
    url: "/appointments/appointments",
    params: params ?? undefined,
  }),
  providesTags: (result) =>
    result?.data
      ? [
          ...result.data.map(({ id }) => ({ type: "Appointments", id })),
          { type: "Appointments", id: "LIST" }
        ]
      : [{ type: "Appointments", id: "LIST" }],
}),
```

#### `query` fonksiyonu nasıl çalışır?

Component'te şöyle kullanılır:

```typescript
const { data } = useGetAppointmentsQuery({ page: 1, status: "pending" })
```

`{ page: 1, status: "pending" }` objesi `params` olarak `query` fonksiyonuna gider. Fonksiyon şu adresi döndürür:

```
/appointments/appointments?page=1&status=pending
```

#### `providesTags` nasıl etiket yapıştırır?

API'dan 2 randevu geldi diyelim (id = 5 ve id = 12):

```typescript
[
  { type: "Appointments", id: 5 },     // 5 nolu randevu
  { type: "Appointments", id: 12 },    // 12 nolu randevu
  { type: "Appointments", id: "LIST" } // Tüm liste
]
```

### Tekil Kayıt Sorgusu: `getAppointmentById`

```typescript
getAppointmentById: builder.query({
  query: (id) => `/appointments/appointment/${id}`,
  providesTags: (_result, _error, id) => [
    { type: "Appointments", id }  // Sadece bu ID'ye etiket
  ]
})
```

---

## 9. invalidatesTags — Etiketleri Geçersiz Kılma (Mutation'larda)

Bir mutation çalıştığında, **hangi etiketlerin artık geçersiz olduğunu** (verinin bayatladığını) söyler.

### A) Kayıt Güncelleme (`updateAppointment`)

```typescript
updateAppointment: builder.mutation<
  AppointmentResponse,
  { id: number; body: UpdateAppointmentRequest }
>({
  query: ({ id, body }) => ({
    url: `/appointments/appointment/${id}`,
    method: "PATCH",
    body,
  }),
  invalidatesTags: (_result, _error, { id }) => [
    { type: "Appointments", id },
    { type: "Appointments", id: "LIST" },
  ],
}),
```

Bu mutation çalışınca:
1. `{ type: "Appointments", id: 5 }` etiketi silinir → 5 nolu randevunun detayı yeniden çekilir
2. `{ type: "Appointments", id: "LIST" }` etiketi silinir → Randevu listesi yeniden çekilir

**Sonuç:** Kullanıcı bir randevuyu güncellediği anda hem liste hem detay otomatik güncellenir.

### B) Yeni Kayıt Ekleme (`createAppointment`)

```typescript
createAppointment: builder.mutation({
  query: (body) => ({
    url: "/appointments/appointment/create",
    method: "POST",
    body
  }),
  invalidatesTags: [
    { type: "Appointments", id: "LIST" }  // Sadece liste değişti
    // Yeni kaydın ID'si henüz bilinmediği için tekil etiket eklenmez
  ]
})
```

### C) Kayıt Silme (`deleteAppointment`)

```typescript
deleteAppointment: builder.mutation({
  query: (id) => ({
    url: `/appointments/appointment/${id}`,
    method: "DELETE"
  }),
  invalidatesTags: (_result, _error, id) => [
    { type: "Appointments", id },          // Silinen kayıt geçersiz
    { type: "Appointments", id: "LIST" }   // Liste de değişti
  ]
})
```

### `_result` ve `_error` Parametreleri

Fonksiyonlara **API'dan dönen cevap** ve **hata** bilgisini taşır. `_` ile başlaması "Bu parametreyi kullanmıyorum" demektir.

```typescript
// KULLANILMAZ (sadece ID önemli)
providesTags: (_result, _error, id) => [{ type: "Appointments", id }]

// KULLANILIR (sonuca göre etiket değişir)
providesTags: (result, error) => {
  if (error) return [{ type: "Appointments", id: "ERROR" }]
  if (result?.data.length === 0) return [{ type: "Appointments", id: "EMPTY" }]
  return result.data.map(({ id }) => ({ type: "Appointments", id }))
}
```

---

## 10. Store Kurulumu — Reducer ve Middleware

### 10.1 Import'lar

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { appointmentApi } from "./api/appointmentApi";
import { patientApi } from "./api/patientApi";
import { labApi } from "./api/labApi";
// ... diğer API'ler
```

| Import | Nereden | Ne |
|---|---|---|
| `configureStore` | `@reduxjs/toolkit` | Store'u oluşturan fonksiyon |
| `setupListeners` | `@reduxjs/toolkit/query` | Sekme değişimi ve internet bağlantısı olaylarını dinler |
| `patientApi` | `./api/patientApi.ts` | `createApi` ile oluşturulmuş API objesi |

### 10.2 `reducer: {}` — Veriyi Nereye Yazacağım?

```typescript
export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [appointmentApi.reducerPath]: appointmentApi.reducer,
    [patientApi.reducerPath]: patientApi.reducer,
    [labApi.reducerPath]: labApi.reducer,
    [radiologyApi.reducerPath]: radiologyApi.reducer,
    [authorizationApi.reducerPath]: authorizationApi.reducer,
    [clinicalTemplateApi.reducerPath]: clinicalTemplateApi.reducer,
  },
```

`reducer: {}` senden şunu bekliyor:

| Sol taraf (anahtar) | Sağ taraf (değer) |
|---|---|
| Store'daki **raf ismi** (string) | O rafa bakacak **reducer fonksiyonu** |

#### Sol taraf: `[patientApi.reducerPath]`

```typescript
// patientApi.ts'de:
export const patientApi = createApi({
  reducerPath: "patientApi",   // ← bu string
});

// Yani:
patientApi.reducerPath = "patientApi"

// O zaman:
[patientApi.reducerPath]  =  ["patientApi"]  =  "patientApi"
```

Köşeli parantez `[]` JavaScript'te bir **değişkenin değerini** anahtar olarak kullanmak için:

```javascript
const anahtar = "isim";
{ [anahtar]: "Ali" }   // → { "isim": "Ali" }
```

**Neden direkt `"patientApi"` yazmak yerine `reducerPath` kullanılıyor?**
`reducerPath` kullanarak "tek kaynaktan beslenme" sağlanıyor. `patientApi.ts`'de `reducerPath`'i değiştirirsen, `store.ts`'de hiçbir şey değiştirmene gerek kalmaz.

#### Sağ taraf: `patientApi.reducer`

`createApi`'nin otomatik oluşturduğu reducer fonksiyonu. Sen yazmıyorsun, arka planda şöyle çalışıyor:

```typescript
function patientApiReducer(state, action) {
  if (action.type === "patientApi/executeQuery/pending") {
    // → isLoading = true yaz
  }
  if (action.type === "patientApi/executeQuery/fulfilled") {
    // → gelen veriyi cache'e yaz
  }
  if (action.type === "patientApi/executeQuery/rejected") {
    // → hata bilgisini yaz
  }
  // "patientApi/" ile başlamayan action → hiçbir şey yapma
}
```

#### Oluşan store yapısı:

```
{
  authApi:             { queries: {...}, mutations: {...} },
  patientApi:          { queries: {...}, mutations: {...} },
  appointmentApi:      { queries: {...}, mutations: {...} },
  labApi:              { queries: {...}, mutations: {...} },
  radiologyApi:        { queries: {...}, mutations: {...} },
  authorizationApi:    { queries: {...}, mutations: {...} },
  clinicalTemplateApi: { queries: {...}, mutations: {...} },
}
```

#### Reducer olmazsa ne olur?

Reducer'ı store'a eklemeyi unutursan:
- `useGetPatientsQuery()` çağırdığında veri gelir **ama hiçbir yere kaydedilmez**
- Cache çalışmaz
- Her render'da aynı veriyi **tekrar tekrar** API'den çeker

### 10.3 `middleware` — Veriyi Ne Zaman Yenileyeceğim?

```typescript
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      appointmentApi.middleware,
      patientApi.middleware,
      labApi.middleware,
      radiologyApi.middleware,
      authorizationApi.middleware,
      clinicalTemplateApi.middleware
    ),
});
```

#### Middleware ne demek?

Middleware = **aradaki adam**. Action gönderildiğinde, reducer'a ulaşmadan **önce** araya giren fonksiyon.

#### `getDefaultMiddleware()` ne?

Redux Toolkit'in varsayılan olarak eklediği middleware'ler:

| Varsayılan Middleware | Ne yapıyor |
|---|---|
| `serializableCheck` | State'e fonksiyon, Date gibi şeyler koyma uyarısı |
| `thunk` | Asenkron işlemleri destekler (async/await) |
| `immutableCheck` | State doğrudan değiştirilmiş mi kontrol eder (development'ta) |

#### `.concat(...)` ne yapıyor?

```typescript
getDefaultMiddleware().concat(authApi.middleware, patientApi.middleware, ...)

// Sonuç dizisi:
[
  serializableCheck,             // varsayılan
  thunk,                         // varsayılan
  immutableCheck,                // varsayılan
  authApi.middleware,            // sen ekledin
  appointmentApi.middleware,     // sen ekledin
  patientApi.middleware,         // sen ekledin
  labApi.middleware,             // sen ekledin
  radiologyApi.middleware,       // sen ekledin
  authorizationApi.middleware,   // sen ekledin
  clinicalTemplateApi.middleware,// sen ekledin
]
```

#### `patientApi.middleware` tek başına ne yapıyor?

| İş | Açıklama |
|---|---|
| Cache kontrolü | "Bu istek daha önce yapılmış mı? Cache'de var mı?" |
| Tag invalidation | "createPatient çağrıldı → Patients:LIST geçersiz → getPatients'ı tekrar çağır" |
| Aynı istek engelleme | "5 component aynı veriyi isterse 1 istek gider, 5'i de aynı cevabı alır" |
| Polling | "Her 30 saniyede bir bu query'yi tekrar çağır" |

#### Her action TÜM middleware'lerden geçer

```
ACTION: { type: "patientApi/executeQuery/fulfilled" }
    │
    ▼
authApi.middleware          → "patientApi/..." → benim değil → GEÇİR
appointmentApi.middleware   → "patientApi/..." → benim değil → GEÇİR
patientApi.middleware       → "patientApi/..." → BENİM! → cache yönet
labApi.middleware           → "patientApi/..." → benim değil → GEÇİR
    │
    ▼
REDUCER'a ulaştı
```

Her middleware **her action'ı görüyor** ama sadece **kendi action'ına** tepki veriyor.

#### Middleware olmazsa ne olur?

| Özellik | Middleware varken | Middleware yokken |
|---|---|---|
| API'ye istek atma | Çalışır | Çalışır |
| Veriyi store'a yazma | Çalışır | Çalışır |
| Cache'den veri verme | Çalışır | Çalışmaz — her seferinde yeni istek |
| Tag invalidation | Çalışır | Çalışmaz — eski veri ekranda kalır |

**Reducer** veriyi **yazmayı** bilir. **Middleware** o veriyi **ne zaman yenileyeceğine, ne zaman cache'den vereceğine** karar verir.

### 10.4 `setupListeners` ve Tip Tanımları

```typescript
setupListeners(store.dispatch);
```

Bu satır şunu aktif eder:
- Kullanıcı başka sekmeye gidip geri döndüğünde → verileri yenile
- İnternet bağlantısı kopup geri geldiğinde → verileri yenile

```typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

TypeScript tip tanımları. Çalışma zamanında etkisi yok, sadece TypeScript'e "store'un yapısı böyle" demek için.

---

## 11. Cache Nerede? — State'in Kendisi Cache

RTK Query'de **ayrı bir cache deposu yok**. Cache dediğimiz şey Redux state'inin kendisi.

Reducer state'e veri yazdığında, **cache'e yazmış oluyor**:

```
state.patientApi.queries = {
  'getPatients({"page":1})': {
    status: "fulfilled",
    data: [Ali, Veli],        ← İŞTE CACHE BU
  }
}
```

### Cache Kontrolü Nasıl Yapılıyor?

```
İLK ÇAĞRI: useGetPatientsQuery({ page: 1 })

  middleware: "getPatients({page:1})" var mı? → YOK
  middleware: API'ye istek at
  API cevap verdi → reducer state'e yazdı (= cache'e yazdı)

İKİNCİ ÇAĞRI: useGetPatientsQuery({ page: 1 })

  middleware: "getPatients({page:1})" var mı? → VAR!
  middleware: API'ye GİTME, state'teki veriyi ver
  BİTTİ. API'ye istek gitmedi.
```

### Cache Terimleri ve Gerçekte Olan Şey

| Duyduğun terim | Gerçekte olan şey |
|---|---|
| Cache'e yazmak | Reducer'ın `state.patientApi.queries[...]`'e veri yazması |
| Cache'den okumak | Middleware'in `state.patientApi.queries[...]`'e bakıp "var" demesi |
| Cache'i silmek | Middleware'in `invalidatesTags` ile o kaydı geçersiz kılması |

### Reducer ve Middleware'in Cache'teki Rolü

| | Middleware | Reducer |
|---|---|---|
| Cache'e **yazar** mı? | Hayır | Evet |
| Cache'den **okur** mu? | Evet (kontrol eder) | Hayır |
| Cache'i **geçersiz kılar** mı? | Evet (invalidatesTags) | Hayır |

**Reducer = depocu** (rafına koyar). **Middleware = depo müdürü** (ne zaman koyulacak, ne zaman atılacak karar verir).

---

## 12. Tam Akış: useGetPatientsQuery() Çağrıldığında Ne Olur?

```typescript
// Component'te:
const { data, isLoading, error } = useGetPatientsQuery({ page: 1, limit: 10 });
```

### Adım 1: Hook → Action dispatch eder

```typescript
// Hook arka planda:
store.dispatch({
  type: "patientApi/executeQuery/pending",
  meta: { arg: { page: 1, limit: 10 }, endpointName: "getPatients" }
})
```

Hook store'u nereden buluyor? `<Provider store={store}>` sayesinde.

### Adım 2: Action → Middleware zincirinden geçer

```
authApi.middleware         → benim değil → GEÇİR
appointmentApi.middleware  → benim değil → GEÇİR
patientApi.middleware      → BENİM! → cache var mı?
                           → YOK → API'ye istek at
```

### Adım 3: Endpoint'in query fonksiyonu çalışır

```typescript
// patientApi.ts:
getPatients: builder.query({
  query: (params) => ({
    url: "/patient/patients",
    ...(params && { params }),
  }),
})
// → { url: "/patient/patients", params: { page: 1, limit: 10 } }
// → Bu obje baseQuery'ye gönderiliyor
```

### Adım 4: baseQuery çalışır — İstek gönderilir

```typescript
// base.ts:
// 1) Token alınır: "eyJhbGciOi..."
// 2) İstek: GET /api/patient/patients?page=1&limit=10
// 3) Headers: { Authorization: "Bearer eyJhbGciOi..." }
```

### Adım 5: Backend cevap verir

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Ali", "surname": "Yılmaz" },
    { "id": 2, "name": "Veli", "surname": "Kaya" }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 2, "totalPages": 1 }
}
```

### Adım 6: Middleware "fulfilled" action dispatch eder

```typescript
store.dispatch({
  type: "patientApi/executeQuery/fulfilled",
  payload: { success: true, data: [...], pagination: {...} },
  meta: { arg: { page: 1, limit: 10 }, endpointName: "getPatients" }
})
```

### Adım 7: Middleware → providesTags çalıştırır

```typescript
// Oluşan etiketler:
[
  { type: "Patients", id: 1 },      // Ali'nin etiketi
  { type: "Patients", id: 2 },      // Veli'nin etiketi
  { type: "Patients", id: "LIST" }  // Listenin etiketi
]
```

### Adım 8: Reducer → State'e yazar

```typescript
// SONRA (state.patientApi):
{
  queries: {
    'getPatients({"page":1,"limit":10})': {
      status: "fulfilled",
      data: {
        success: true,
        data: [
          { id: 1, name: "Ali", surname: "Yılmaz" },
          { id: 2, name: "Veli", surname: "Kaya" }
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      }
    }
  }
}
```

### Adım 9: Component güncellenir

```typescript
data      → { success: true, data: [Ali, Veli], pagination: {...} }
isLoading → false
error     → undefined
```

### Aynı İstek İkinci Kez Çağrılırsa (Cache Akışı)

```
Hook → dispatch → Middleware:
  → "getPatients({page:1,limit:10})" var mı? → VAR!
  → Cache'den ver → API'ye GİTME
  → Component anında alıyor: data = [Ali, Veli], isLoading = false
  → API isteği ATILMADI. baseQuery ÇALIŞMADI. Reducer ÇALIŞMADI.
```

### Özet Akış Şeması

```
Component: useGetPatientsQuery({ page: 1, limit: 10 })
    ↓  hook dispatch() çağırıyor
Hook → dispatch("pending")
    ↓  Redux: önce middleware zinciri
Middleware → cache yok → endpoint'in query fonksiyonu → baseQuery
    ↓  HTTP isteği gönderiliyor
Backend → cevap döndürüyor
    ↓  baseQuery cevabı return ediyor
Middleware → dispatch("fulfilled")
    ↓  tekrar middleware → providesTags → etiketler kaydedildi
Reducer → state'e yaz (= cache'e yaz)
    ↓  React-Redux: state değişti
Component → { data: [Ali, Veli], isLoading: false, error: undefined }
```

---

## 13. hooks.ts ve providers.tsx — Yardımcı Dosyalar

### hooks.ts

```typescript
'use client';

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

`useDispatch` ve `useSelector`'a TypeScript tip güvenliği ekliyor:

```typescript
useSelector(state => state.patientApii)    // typo → hata VERMEZ
useAppSelector(state => state.patientApii) // typo → TypeScript HATA verir
```

**Not:** Bu projede `useAppDispatch` ve `useAppSelector` tanımlanmış ama pratikte neredeyse hiç kullanılmıyor. `createApi`'nin ürettiği hook'lar her şeyi hallediyor. İleride `createSlice` eklenirse kullanılmak üzere hazır.

### providers.tsx

```typescript
'use client';

import { Provider } from "react-redux";
import { store } from "./store";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
```

Bu component `app/layout.tsx`'de tüm uygulamayı sarıyor:

```tsx
<ReduxProvider>
  <SidebarProvider>
    {children}
  </SidebarProvider>
</ReduxProvider>
```

---

## 14. Proje Bağlantı Zinciri — Neresi Nereyi Buluyor?

Redux'ta .NET gibi otomatik tarama yok. Her bağlantıyı **sen elle kuruyorsun**:

```
Adım 1: patientApi.ts → createApi ile API tanımlandı
           ↓ export

Adım 2: store.ts → patientApi import edildi → reducer ve middleware eklendi
           ↓ export const store

Adım 3: providers.tsx → store import edildi → <Provider store={store}>
           ↓ export ReduxProvider

Adım 4: app/layout.tsx → ReduxProvider import edildi → tüm uygulama sarıldı
```

Gerçek kodda:

```typescript
// ADIM 1: store/api/patientApi.ts
export const patientApi = createApi({ ... });
export const { useGetPatientsQuery } = patientApi;

// ADIM 2: store/store.ts
import { patientApi } from "./api/patientApi";
export const store = configureStore({
  reducer: { [patientApi.reducerPath]: patientApi.reducer },
  middleware: (gDM) => gDM().concat(patientApi.middleware),
});

// ADIM 3: store/providers.tsx
import { store } from "./store";
export function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}

// ADIM 4: app/layout.tsx
import { ReduxProvider } from "@/store/providers";
export default function RootLayout({ children }) {
  return (
    <ReduxProvider>
      {children}
    </ReduxProvider>
  );
}
```

### Birini Unutursan Ne Olur?

| Unuttuğun şey | Sonuç |
|---|---|
| Reducer'ı store'a eklemeyi | Veri store'a yazılamaz → hook hata verir |
| Middleware'i store'a eklemeyi | Cache/tag çalışmaz → her seferinde yeni istek |
| Provider'ı layout'a eklemeyi | Component store'a erişemez → hook hata verir |
| Hook'u import etmeyi | Hook bulunamaz → derleme hatası |

---

## 15. Dosyalar Arası İlişki — Büyük Resim

```
store/api/base.ts
  └── baseQuery                    → Tüm createApi'lerin ortak ayarı

store/api/patientApi.ts
  └── createApi({ reducerPath, baseQuery, endpoints })
        ├── patientApi.reducer      → store.ts → reducer'a ekleniyor
        ├── patientApi.reducerPath  → store.ts → reducer anahtarı oluyor
        ├── patientApi.middleware   → store.ts → middleware'e ekleniyor
        └── useGetPatientsQuery()   → Component'lerde kullanılıyor

store/store.ts
  └── configureStore({ reducer, middleware })
        ├── export type RootState   → hooks.ts
        ├── export type AppDispatch → hooks.ts
        └── export const store      → providers.tsx

store/hooks.ts
  └── useAppDispatch, useAppSelector → Tipli hook'lar (opsiyonel kullanım)

store/providers.tsx
  └── <Provider store={store}>     → app/layout.tsx → tüm uygulamayı sarıyor

store/types/patient.ts
  └── PatientResponse, CreatePatientRequest → patientApi.ts → endpoint tiplerinde

app/layout.tsx
  └── <ReduxProvider> → tüm component'ler store'a erişebilir
```

---

## 16. Pratik İpuçları

### 1. Her Zaman LIST Etiketi Koy

```typescript
providesTags: (result) => [
  ...result.data.map(({ id }) => ({ type: "Appointments", id })),
  { type: "Appointments", id: "LIST" } // ŞART!
]
```

### 2. Gereksiz Yeniden Çekmeyi Önle

```typescript
// İYİ: Sadece değişen kaydı ve listeyi geçersiz kıl
invalidatesTags: (_result, _error, { id }) => [
  { type: "Appointments", id },
  { type: "Appointments", id: "LIST" }
]

// KÖTÜ: Sadece LIST → tekil sorgular güncellenmez!
invalidatesTags: [{ type: "Appointments", id: "LIST" }]
```

### 3. Reducer'ı Kim Tetikliyor?

Reducer'ı **kimse elle çağırmıyor**. Redux'un kendisi çağırıyor. `configureStore` yaptığın anda Redux bu kuralı kuruyor: **Her action dispatch edildiğinde, tüm reducer'lar otomatik çağrılır.**

```
ACTION: { type: "patientApi/executeQuery/fulfilled", payload: [Ali, Veli] }

Redux → authApi.reducer(state.authApi, action)       → "benim değil" → state'i AYNEN döndür
Redux → patientApi.reducer(state.patientApi, action) → "BENİM!" → state'i GÜNCELLE
Redux → labApi.reducer(state.labApi, action)         → "benim değil" → state'i AYNEN döndür
```

### 4. Reducer Component'e Veri Vermez

```
Reducer'ın görevi:   Gelen veriyi state'e YAZ (depoya koy)
Hook'un görevi:      State'ten OKU ve component'e ver (depodan al)
```

`useGetPatientsQuery()` aslında içinde gizli bir `useSelector` barındırıyor:

```typescript
data      = state.patientApi.queries["getPatients({page:1})"].data
isLoading = state.patientApi.queries["getPatients({page:1})"].status === "pending"
error     = state.patientApi.queries["getPatients({page:1})"].error
```

---

## 17. Özet Tablolar

### Tag Kullanım Tablosu

| Durum | `providesTags` | `invalidatesTags` |
|-------|----------------|-------------------|
| Liste çekme | Her kayda ID + LIST | - |
| Detay çekme | Sadece o ID | - |
| Kayıt ekleme | - | Sadece LIST |
| Kayıt güncelleme | - | O ID + LIST |
| Kayıt silme | - | O ID + LIST |

### Her Parçanın Görevi

| Parça | Görevi |
|---|---|
| `baseQuery` (base.ts) | API isteğini **gönderir** (token ekler, 401'de yeniler) |
| `middleware` (store.ts) | Cache'i **kontrol eder** (var mı, tag geçerli mi, ne zaman yenile) |
| `reducer` (store.ts) | Gelen veriyi state'e **yazar** |
| `hook` (component) | State'ten **okur** ve component'e verir |
| `Provider` (providers.tsx) | Store'u React ağacına **bağlar** |
| `types` (types/*.ts) | Giden/gelen verilerin tipini **tanımlar** |

### Hangi İşi Kim Yapıyor?

| İş | Kim yapıyor | Reducer mı? |
|---|---|---|
| API'ye istek atma (fetch) | Middleware + baseQuery | Hayır |
| Gelen veriyi state'e yazma | Reducer | Evet |
| Cache kontrolü (var mı yok mu) | Middleware | Hayır |
| Tag invalidation | Middleware | Hayır |

### Bilmen Gerekenler

- Tag'ler verilere yapışır, sorgulara değil
- Aynı etiket birden fazla sorguda olabilir
- Bir etiket geçersiz olunca, o etiketli TÜM sorgular yeniden çalışır
- LIST etiketi özel bir isimdir, dilediğin ismi kullanabilirsin (LIST, ALL, vs.)
- `_result` ve `_error` sadece ihtiyacın varsa kullan
- Tekil sorgular (`getById`) sadece kendi ID'lerini providesTags yapar
- Liste sorguları (`getAll`) hem tekil ID'leri hem de LIST etiketini providesTags yapar

---

### Son Söz

Tag sistemi sayesinde:
- **Veriler hep güncel** — mutation sonrası otomatik yeniden çekme
- **Gereksiz API isteği yok** — cache'den veri verme
- **Otomatik cache yönetimi** — sen sadece etiketleri tanımla
- **Daha hızlı uygulama** — tekrarlı istekler engelleniyor

**Unutma:**
- `providesTags` ile cache'e **koy** (etiket yapıştır)
- `invalidatesTags` ile cache'den **sil** (etiketleri geçersiz kıl)
- Gerisini RTK Query halleder!
