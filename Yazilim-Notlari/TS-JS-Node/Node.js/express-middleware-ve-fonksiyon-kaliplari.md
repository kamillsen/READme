# Express Middleware ve Fonksiyon Kalıpları

> Bu dosya, Express middleware pipeline'ının nasıl çalıştığını, `(req, res, next)` değerlerinin
> fonksiyonlara nasıl ulaştığını ve projede kullanılan fonksiyon kalıplarını anlatır.
>
> **Ön koşul:** [middleware.md](./middleware.md) dosyasını okumuş olmak faydalıdır.

---

## 1. İstek Pipeline'ı Nedir?

Bir HTTP isteği Express sunucusuna ulaştığında, cevap dönmeden önce **sıralı bir fonksiyon zincirinden** geçer. Bu zincire **middleware pipeline** denir.

```
İstek (HTTP Request)
    │
    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  auth        │────▶│  validate    │────▶│  handler     │────▶│  Yanıt       │
│  (JWT kontrol)│     │  (body kontrol)│     │  (asıl iş)   │     │  (response)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
     next()               next()            res.send()
```

Gerçek bir route tanımında bu pipeline şöyle görünür:

```javascript
reviewRoute.post("/chat", auth("chat"), validate(reviewValidation.chat), chat);
//                        ^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                        1. middleware   2. middleware                 3. handler
```

Express bu üç fonksiyonu sırayla çağırır. Her biri `(req, res, next)` alır.
Biri `next()` çağırırsa sıradakine geçilir, `res.send()` çağırırsa zincir biter.

**Bu notun amacı:** Pipeline'daki her adımın nasıl tanımlandığını, `(req, res, next)` değerlerinin
nereden gelip fonksiyonlara nasıl ulaştığını ve `auth`, `catchAsync` gibi kalıpların nasıl çalıştığını anlatmak.

---

## 2. JavaScript'te Arrow Function Syntax'i

Express middleware'leri anlamak için önce JavaScript'in `=>` syntax'ini bilmek gerekiyor.

### Tek `=>` : Bir Fonksiyon

```javascript
// En eski / klasik yazım — function declaration
function topla(a, b) {
  return a + b;
}

// Arrow function:
const topla = (a, b) => {
  return a + b;
};

// Kısa yazım (aynı şey — tek satırlık return varsa {} ve return atlanabilir):
const topla = (a, b) => a + b;

// Kullanım:
topla(3, 5);  // → 8
```

### Çift `=>` : Fonksiyon Döndüren Fonksiyon

```javascript
// Bu bir fonksiyon döndüren fonksiyon:
const carp = (a) => (b) => a * b;

// Aynı şeyin açık yazılmış hali:
const carp = (a) => {
  return (b) => {
    return a * b;
  };
};

// function keyword ile yazılmış hali (tamamen aynı şey):
function carp(a) {
  return function(b) {
    return a * b;
  };
}

// Kullanım — iki aşamalı:
const ikiIleCarp = carp(2);  // → (b) => 2 * b  (fonksiyon döndü!)
ikiIleCarp(5);               // → 10

// Veya tek satırda:
carp(2)(5);                  // → 10
```

---

## 3. async, Promise ve .catch() İlişkisi

Bu bölüm, ilerideki `catchAsync` kalıbını anlamak için **ön koşul**.
Daha detaylı anlatım için: [async-promise-await-derinlemesine.md](./async-promise-await-derinlemesine.md)

### `async` Ne Yapıyor?

`async`'in tek işi: return değerini **otomatik olarak Promise'e sarmak**.

```javascript
// Normal fonksiyon — ne return edersen onu döndürür:
const normal = () => "merhaba";
normal();    // → "merhaba"  (string)

const normal2 = () => {};
normal2();   // → undefined

// Async fonksiyon — ne return edersen Promise'e sarar:
const asenkron = async () => "merhaba";
asenkron();  // → Promise { "merhaba" }

const asenkron2 = async () => {};
asenkron2(); // → Promise { undefined }
```

### `.catch()` Neden Sadece Promise'de Çalışıyor?

`.catch()` bir method. Method'lar objelerin üzerinde yaşar. **Her objenin kendine ait method'ları var:**

```javascript
// String'in method'ları:
"merhaba".toUpperCase()   // ✓ var
"merhaba".catch()         // ✗ yok — string'de catch diye bir method yok

// Promise'in method'ları:
Promise.resolve(5).then()   // ✓ var
Promise.resolve(5).catch()  // ✓ var

// undefined'ın method'ları:
undefined.catch()          // ✗ yok — TypeError
undefined.herhangi()       // ✗ yok — TypeError
```

### İkisini Birleştir: async + .catch()

```javascript
// async fn → Promise döner → .catch() çalışır:
const fn = async () => { throw new Error("hata"); };
fn().catch(err => console.log(err));  // ✓ Promise'de .catch() var

// normal fn → undefined döner → .catch() patlar:
const fn = () => { throw new Error("hata"); };
fn().catch(err => console.log(err));  // ✗ undefined.catch() → TypeError
```

### Dikkat: try-catch İçin Promise Şart Değil

`.catch()` ile `try-catch` farklı mekanizmalar. `try-catch` JavaScript'in temel hata yakalama aracıdır, Promise'e ihtiyaç duymaz:

```javascript
// Promise yok, async yok — düz try-catch çalışır:
try {
  JSON.parse("geçersiz json{{{");
} catch (err) {
  console.log(err.message);  // ✓ "Unexpected token g..."
}
```

| Mekanizma | Ne yakalar | Promise lazım mı |
|---|---|---|
| `try-catch` | Senkron hataları (anında fırlayan) | Hayır |
| `.catch()` | Promise içindeki hataları (asenkron) | Evet |
| `try-catch` + `await` | İkisini de | Evet (`await` Promise bekler) |

`await` olunca `try-catch` asenkron hataları da yakalar çünkü `await` Promise'in sonucunu **bekleyip çözerek** senkron gibi davranmasını sağlar.

### `Promise.resolve` Ne Yapıyor?

`Promise.resolve()` bir değeri Promise'e çevirir:

```javascript
// Normal değer → Promise'e çevir:
Promise.resolve(5)          // → Promise { 5 }
Promise.resolve("merhaba")  // → Promise { "merhaba" }
Promise.resolve(undefined)  // → Promise { undefined }

// Zaten Promise ise → dokunma, olduğu gibi bırak:
Promise.resolve(fetch("/api"))  // → aynı Promise
```

`fn()` ne döndürürse döndürsün, `Promise.resolve` ile sarınca `.catch()` her zaman çalışır:

```javascript
// fn async mı değil mi bilmiyorsun. Garantiye al:
Promise.resolve(fn())       // ne geldiyse → artık kesin Promise
  .catch(err => next(err)); // .catch() her zaman çalışır ✓
```

| Durum | `fn()` ne döndürür | `.catch()` var mı |
|---|---|---|
| `async fn` | Promise | ✓ |
| normal `fn` | undefined | ✗ patlıyor |
| `Promise.resolve(fn())` | her zaman Promise | ✓ |

### Gerçek Kullanım Örneği

```javascript
// ============ ASYNC FONKSİYON ============

const kullaniciyiGetir = async (id) => {
  const kullanici = await db.find(id);
  if (!kullanici) throw new Error("Kullanıcı bulunamadı");
  return kullanici;
};

// async → her zaman Promise döner
kullaniciyiGetir("abc123");   // → Promise { { id: "abc123", isim: "Ali" } }

// Promise döndüğü için .catch() çalışır:

// ESKİ YÖNTEM — .then().catch() zinciri:
kullaniciyiGetir("abc123")
  .then(user => console.log(user.isim))
  .catch(err => console.log(err.message));

// YENİ YÖNTEM — async/await + try-catch (şu an herkes bunu kullanıyor):
try {
  const user = await kullaniciyiGetir("abc123");
  console.log(user.isim);
} catch (err) {
  console.log(err.message);
}
// İkisi tamamen aynı işi yapıyor. async/await, .then().catch()'in syntax sugar'ı.


// ============ NORMAL FONKSİYON ============

const kullaniciyiKontrolEt = (id) => {
  if (!id) throw new Error("ID boş olamaz");
  return "ID geçerli";
};

// normal → string veya undefined döner
kullaniciyiKontrolEt("abc123");   // → "ID geçerli"  (string)

// String döndüğü için .catch() patlar:
kullaniciyiKontrolEt("abc123")
  .catch(err => console.log(err));
// ✗ TypeError: "ID geçerli".catch is not a function


// ============ PROMISE.RESOLVE İLE GARANTİ ============

// async fonksiyonla:
Promise.resolve(kullaniciyiGetir("abc123"))
  .catch(err => console.log(err.message));
// ✓ zaten Promise döndü → Promise.resolve dokunmadı → .catch() çalıştı

// normal fonksiyonla:
Promise.resolve(kullaniciyiKontrolEt("abc123"))
  .catch(err => console.log(err.message));
// ✓ string döndü → Promise.resolve sardı → .catch() çalıştı
```

> **Not:** `.then().catch()` zinciri eski yöntemdir. Günlük kodda `async/await + try-catch` kullanılır.
> Ama `catchAsync` gibi yardımcı fonksiyonlarda `.catch()` doğrudan kullanılır çünkü
> orada `await` ile beklemek yerine Promise'i olduğu gibi zincirlemen gerekir.

---

## 4. (req, res, next) Nereden Geliyor?

### Sistem İsteği → Node.js → Express → Senin Fonksiyonun

```
Kullanıcı tarayıcıda tıkladı
    → HTTP isteği internetten geldi
    → Node.js'in http modülü bunu yakaladı
    → Express'e verdi
    → Express req/res objelerini oluşturdu
    → Middleware zincirine parametre olarak iletti
```

### Node.js'in http Modülü (en alt katman)

```javascript
// Node.js kabaca şunu yapar (basitleştirilmiş):
const server = http.createServer((request, response) => {
  // request = Node.js'in ham istek objesi
  // response = Node.js'in ham cevap objesi

  // Express bunları alıp zenginleştirir:
  const req = request;  // + req.body, req.params, req.query ekler
  const res = response; // + res.json(), res.status() ekler
  const next = /* sıradaki middleware'e geç fonksiyonu */;

  // Sonra middleware zincirine verir:
  ilkMiddleware(req, res, next);
});
```

### Express Middleware'e Nasıl Veriyor?

```javascript
// Express senin fonksiyonunu çağırırken:
seninMiddleware(req, res, next);
//              ^^^  ^^^  ^^^^
//              Express bunları parametre olarak VERİYOR
//              Senin fonksiyon parametre olarak ALIYOR
```

### (req, res, next) Parametre mi, Fonksiyon mu?

`(req, res, next)` bir fonksiyon değil; fonksiyonun aldığı **üç parametrenin adları**.

- **Middleware** = bir fonksiyon (Express'in çağırdığı şey)
- **(req, res, next)** = o fonksiyonun parametre listesi


| Parametre | Tipi      | Açıklama                                   |
| --------- | --------- | ------------------------------------------ |
| `req`     | Obje      | İstek bilgilerini taşır                    |
| `res`     | Obje      | Cevap göndermek için kullanılır            |
| `next`    | Fonksiyon | Sıradaki middleware'i çalıştıran fonksiyon |


---

## 5. Express (req, res, next)'i Nasıl Veriyor?

### Express'in Tek Kuralı

`.post()`, `.get()`, `.use()` içine fonksiyon koy → Express ona `(req, res, next)` verir:

```javascript
// Express'e fonksiyon kaydetme yolları:
app.use(fonksiyon);                                  // Global middleware
router.post("/chat", fonksiyon1, fonksiyon2, ...);   // Route middleware + handler
app.use("/api", fonksiyon);                          // Path bazlı middleware
app.use((err, req, res, next) => { ... });           // Error middleware (4 parametre)
```

Kaydetmediysen Express `(req, res, next)` vermez:

```javascript
// KAYITLI — Express (req, res, next) verir:
app.use(myMiddleware);                    // ✓
router.post("/chat", auth("chat"));       // ✓ (auth'un döndürdüğü fonksiyona)

// KAYITLI DEĞİL — Express (req, res, next) vermez:
const x = auth("chat");                  // ✗ sadece bir değişkene atadın
console.log(myMiddleware);               // ✗ sadece yazdırdın
```

### app.use() Tam Olarak Ne Bekliyor?

`app.use()` her zaman tek bir şey bekliyor: **bir fonksiyon**. İki yol var:

1. **Doğrudan** `(req, res, next)` alan bir fonksiyon vermek

```javascript
const basitMiddleware = (req, res, next) => { ... };
app.use(basitMiddleware);
```

2. **Böyle bir fonksiyon döndüren** bir ifadenin sonucunu vermek

```javascript
// auth("chat") çağrısı (req, res, next) => { ... } döndürüyor
app.use(auth("chat"));  // Express'e o dönen fonksiyon gidiyor
```

İkisinde de Express'in eline geçen şey `(req, res, next)` alan bir fonksiyon olur.

### Özet Kural

> `(req, res, next)`'e sadece, Express'e middleware/route olarak verdiğin fonksiyonların
> içinde erişirsin; çünkü Express **sadece o fonksiyonları** bu üç parametreyle çağırır.

- Express'e **vermediğin** bir fonksiyon (rastgele bir yardımcı fonksiyon) hiçbir zaman `(req, res, next)` almaz, çünkü Express onu hiç çağırmaz.
- Express'e **verdiğin** fonksiyon (use/get/post ile) her istekte `(req, res, next)` alır, çünkü Express onu böyle çağırır.

---

## 6. Express Fonksiyonun İçine Bakmıyor

Express senin fonksiyonunun ne aldığını **kontrol etmiyor**.
Sadece üç argüman gönderiyor:

```javascript
// Express'in yaptığı TEK şey:
fonksiyon(req, res, next);
// Bu kadar. Fonksiyonun ne yaptığını Express ilgilendirmiyor.
```

Bu yüzden şu örneklerin hepsi "çalışır":

```javascript
// Çalışır — (req, res, next) alıyor:
router.post("/chat", (req, res, next) => {
  res.send("merhaba");
});

// Çalışır — sadece (req, res) alıyor, next'i yok sayıyor:
router.post("/chat", (req, res) => {
  res.send("merhaba");
});

// Çalışır — hiç parametre almıyor:
router.post("/chat", () => {
  console.log("istek geldi");
  // ama yanıt dönmüyor, istek asılı kalır
});

// Çalışır — (a, b, c) alıyor:
router.post("/chat", (a, b, c) => {
  // a = req, b = res, c = next
  // İsimler farketmez, SIRA önemli
  b.send("merhaba");
});
```

Ama pratikte `(req, res, next)` almak **zorunlu gibi** çünkü:

- `req` olmadan → isteği okuyamazsın
- `res` olmadan → yanıt gönderemezsin
- `next` olmadan → sıradaki middleware'e geçemezsin

Kural Express'ten değil, **işin doğasından** geliyor.

### Express'in İç Mantığı (Basitleştirilmiş)

```javascript
// .post() çağrıldığında Express şunu yapıyor:
post(path, ...fonksiyonlar) {
  // fonksiyonlar = [auth'tan dönen, validate'ten dönen, chat]
  this.routes[path] = fonksiyonlar;  // Kaydet
}

// İstek geldiğinde:
handleRequest(req, res) {
  const fonksiyonlar = this.routes[req.path];  // Kayıtlı fonksiyonları bul

  // Sırayla çağır, her birine (req, res, next) ver:
  fonksiyonlar[0](req, res, next);  // → auth'tan dönen
  fonksiyonlar[1](req, res, next);  // → validate'ten dönen
  fonksiyonlar[2](req, res, next);  // → chat
}
```

---

## 7. Route Tanımında Ne Oluyor? — JavaScript vs Express

```javascript
reviewRoute.post("/chat", auth("chat"), validate(reviewValidation.chat), chat);
```

Bu satırı okuyan iki farklı aktör var: **JavaScript** ve **Express**.

### JavaScript'in İşi: Argümanları Hesapla

JavaScript bu satırı soldan sağa okuyup **önce** argümanları hesaplıyor:

```javascript
reviewRoute.post(
  "/chat",
  auth("chat"),                        // ← JavaScript: "auth bir fonksiyon, parantez var, ÇAĞIRAYIM"
  validate(reviewValidation.chat),     // ← JavaScript: "validate bir fonksiyon, parantez var, ÇAĞIRAYIM"
  chat                                 // ← JavaScript: "chat bir değişken, parantez yok, DOKUNMAYIM"
);

// JavaScript önce ARGÜMANLARI hesaplar, sonra .post()'a verir:
// 1. auth("chat")    → hesapla → async (req, res, next) => { ... }
// 2. validate(...)   → hesapla → (req, res, next) => { ... }
// 3. chat            → zaten bir değer → (req, res, next) => { ... }

// Sonra .post()'u çağırır:
reviewRoute.post("/chat", fonksiyon1, fonksiyon2, fonksiyon3);
//                        ^^^^^^^^^^  ^^^^^^^^^^  ^^^^^^^^^^
//                        Express BUNLARI görüyor. auth("chat") değil.
```

Express `.post()`'a ulaştığında `auth("chat")` **çoktan çalışmış ve bitmiş**.
Express sadece dönen fonksiyonu görüyor.

```
JavaScript'in işi: auth("chat") çağır → fonksiyon döndü
Express'in işi:    dönen fonksiyonu kaydet → istek gelince (req, res, next) ile çağır

İkisi FARKLI zamanlarda, FARKLI işleri yapıyor.
```

### Parantez Var / Yok Farkı

```javascript
auth("chat")                     // ← parantez VAR → fonksiyon ÇAĞRILDI → dönen şey kaydedildi
validate(reviewValidation.chat)  // ← parantez VAR → fonksiyon ÇAĞRILDI → dönen şey kaydedildi
chat                             // ← parantez YOK → fonksiyon ÇAĞRILMADI → kendisi kaydedildi
```

Neden `auth` ve `validate` parantezli, `chat` parantezsiz?

```javascript
auth("chat")    // → parametre LAZIM ("chat" yetkisi), o yüzden çağrılması gerekiyor
validate(...)   // → parametre LAZIM (Joi şeması), o yüzden çağrılması gerekiyor
chat            // → parametre LAZIM DEĞİL, zaten hazır bir fonksiyon
```

`auth` ve `validate` **fabrika** — parametre verip ürün (fonksiyon) alıyorsun.
`chat` **ürünün kendisi** — `catchAsync` dosya yüklenirken zaten üretmiş.

### Express Kaydettiğinde ve İstek Geldiğinde

```javascript
// PROGRAM BAŞLARKEN:
// Express üçünü de kaydediyor:
postRoutes["/chat"] = [
  async (req, res, next) => { ... passport kodu ... },   // auth'tan dönen
  (req, res, next) => { ... joi kodu ... },               // validate'ten dönen
  (req, res, next) => { ... controller kodu ... },        // chat (zaten hazır)
];
// Üçü de (req, res, next) imzalı. Express memnun. Rafa koydu.

// İSTEK GELİNCE:
// Express kaydettiği 3 fonksiyonu SIRAYLA çağırıyor:
middleware1(req, res, next);   // auth'tan dönen — JWT doğrulandı, req.user eklendi → next()
middleware2(req, res, next);   // validate'ten dönen — Body doğrulandı → next()
chat(req, res, next);          // ← Express BURADA çağırıyor, parantezleri Express veriyor
```

`chat`'i program başlarken JavaScript çağırmadı, istek gelince **Express çağırdı**.

---

## 8. auth Kalıbı — Fonksiyon Döndüren Fonksiyon

### auth'un Kodu

```javascript
const auth = (...requiredRights) => async (req, res, next) => {
  try {
    const result = await new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, res, resolve, reject, requiredRights)
      )(req, res, next);
    });

    if (res.headersSent || result === "responded") {
      return;
    }

    return next();
  } catch (err) {
    return next(err);
  }
};
```

Bu aslında şu demek:

```javascript
function auth(...requiredRights) {
  return async function(req, res, next) {
    // ... aynı kod
  };
}

// Çağrılışı: auth("chat")
// ...requiredRights yerine "chat" gelir → requiredRights = ["chat"]
// Geriye async (req, res, next) => { ... } döner
```

### ÇAĞRI 1 — auth("chat") Çağrıldığında (Tanımlama Anı)

```javascript
auth("chat")
// requiredRights = ["chat"]
// Bu çağrı şunu DÖNDÜRÜYOR:

async (req, res, next) => {
  try {
    const result = await new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, res, resolve, reject, ["chat"])  // ← "chat" buraya yerleşti
      )(req, res, next);
    });

    if (res.headersSent || result === "responded") {
      return;
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

// İŞTE BU FONKSİYON. Bu bellekte bekliyor.
// req yok, res yok, next yok — sadece parametrelerin İSİMLERİ var.
// Fonksiyon henüz ÇALIŞMADI. Sadece TANIMLANDI.
```

### Express Bunu Kaydediyor

```javascript
postRoutes["/chat"][0] = auth("chat") tarafından dönen fonksiyon;
// Rafa koydu. Bekliyor.
```

### ÇAĞRI 2 — İstek Geldi, Express Dönen Fonksiyonu Çağırıyor

```javascript
// Express'in elinde GERÇEK objeler var:
// req = { body: { user_id: "abc123", message: "Thank you..." }, headers: { authorization: "Bearer eyJhbG..." }, ... }
// res = { status: fn, send: fn, json: fn, headersSent: false, ... }
// next = validate middleware'e geçiren fonksiyon

// Express şunu yapıyor:
postRoutes["/chat"][0](req, res, next);
//                     ^^^  ^^^  ^^^^
//                     Bu üçü FONKSİYONUN İÇİNE GİRİYOR:

async (req, res, next) => {
//     ^^^  ^^^  ^^^^
//     ARTIK DOLU! Express'in verdiği gerçek objeler burada.

  try {
    const result = await new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, res, resolve, reject, ["chat"])
        //             ^^^  ^^^
        //             İsteğin req ve res objesi burada kullanılıyor
      )(req, res, next);
        //^^^  ^^^  ^^^^
        // Aynı objeler Passport'a da veriliyor
    });

    if (res.headersSent || result === "responded") {
      return;
    }

    return next();  // ← Express'in verdiği next çağrılıyor → validate'e geç
  } catch (err) {
    return next(err);
  }
}
```

---

## 9. catchAsync Kalıbı — chat'in Oluşumu

### catchAsync'in Kodu

```javascript
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
```

Bu tek satırda **iki tane `=>`** var. Her `=>` bir fonksiyon demek.

Aynı şeyin açık yazılmış hali:

```javascript
const catchAsync = (fn) => {
  // fn'i al
  // ve şu fonksiyonu DÖNDÜR:
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
```

İki yazım tamamen aynı şey. JavaScript'te `=> { return ... }` yerine kısaca `=> ...` yazabilirsin:

```javascript
// UZUN yazım:
const topla = (a) => {
  return a + 1;
};

// KISA yazım (aynı şey):
const topla = (a) => a + 1;

// UZUN yazım:
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

// KISA yazım (aynı şey):
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
```

### Promise.resolve Burada Neden Var?

> Bu kısmı anlamak için [Bölüm 3: async, Promise ve .catch() İlişkisi](#3-async-promise-ve-catch-ilişkisi)'ni okumuş olmalısın.

```javascript
Promise.resolve(fn(req, res, next)).catch((err) => next(err));
//              ^^^^^^^^^^^^^^^^^^
//              fn async ise zaten Promise döndürür → Promise.resolve dokunmaz
//              fn async DEĞİLSE Promise döndürmez → Promise.resolve sarıp Promise yapar
//
//              Bu sayede .catch() HER DURUMDA çalışabilir.
```

Pratikte controller'lar hep `async` olduğu için `fn` her zaman Promise döndürür.
Ama `Promise.resolve` bir **güvenlik ağı** — "ya async değilse?" ihtimaline karşı.

### chat Nasıl Oluşturuluyor?

```javascript
const chat = catchAsync(async (req, res) => {
  const { user_id, message, status } = req.body;
  const user = await User.findById(user_id);
  if (!user) throw new ApiError(404, "User not found");
  // ... 260 satır kod
  res.status(200).send({ success: true });
});
```

Adım adım:

```javascript
// 1. catchAsync çağrıldı
//    fn = async (req, res) => { ... 260 satır ... }
//    catchAsync fn'i HAFIZASINDA TUTUYOR (closure)

// 2. catchAsync ne döndürüyor? return'e bak:
return (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

// 3. chat = bu dönen fonksiyon:
const chat = (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
//               ^^
//               fn hala burada, closure ile hatırlıyor

// ÖNEMLİ: Bu noktada chat henüz ÇAĞRILMADI.
// Sadece catchAsync çağrıldı ve döneni chat'e atandı.
// chat = (req, res, next) imzalı hazır bir fonksiyon.
```

Neden `=` sağı böyle? Çünkü catchAsync'in `return` ettiği şey bu:

```javascript
const chat = catchAsync(...);
//    ^^^^   ^^^^^^^^^^^^^^^^^
//    chat = catchAsync'in döndürdüğü şey

// catchAsync ne döndürüyor?
return (req, res, next) => { Promise.resolve(fn(...)).catch(...) };

// O zaman:
const chat = (req, res, next) => { Promise.resolve(fn(...)).catch(...) };
//           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//           Bu kısım catchAsync'in return ettiği şey, biz yazmadık
//           catchAsync bizim yerimize üretti
```

### (req, res, next) Express'ten fn'e Nasıl Ulaşıyor?

```javascript
// 1. Express çağırıyor:
chat(req, res, next);

// 2. chat'in içi çalışıyor:
(req, res, next) => {
  Promise.resolve(fn(req, res, next))
  //                 ^^^  ^^^  ^^^^
  //                 Express'ten gelen değerler BURADAN fn'e gidiyor
};

// 3. fn çalışıyor:
async (req, res) => {
  //   ^^^  ^^^
  //   Express → chat → fn yoluyla geldi
  const { user_id } = req.body;  // artık req'i kullanabiliyor
};
```

Zincir:

```
Express → chat(req, res, next) → fn(req, res, next)
                                 ^^
                                 catchAsync'in parametre olarak aldığı fonksiyon
```

`fn` sadece `(req, res)` alıyor, `next`'i yok sayıyor. JavaScript'te fazla parametre vermek hata değil:

```javascript
const topla = (a, b) => a + b;    // 2 parametre bekliyor
topla(3, 5, 100, 200);            // 4 parametre verdik → sorun yok, a=3, b=5, geri kalanı yok sayılır

// Aynı şekilde:
const fn = async (req, res) => { ... };  // 2 parametre bekliyor
fn(req, res, next);                      // 3 parametre verdik → sorun yok, next yok sayılır
```

`next`'i senin fonksiyonun kullanmıyor — **catchAsync kullanıyor**:

```javascript
(req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch((err) => next(err));
    //              ^^^^^^^^^
    //              HATA OLURSA next'i catchAsync çağırıyor!
    //              Senin next(err) yazmana gerek yok.
};
```

### catchAsync Olmadan vs catchAsync İle

```javascript
// catchAsync OLMADAN (elle try-catch):
const chat = async (req, res, next) => {
  try {
    const user = await User.findById(user_id);
    if (!user) throw new ApiError(404, "User not found");
    res.status(200).send({ success: true });
  } catch (err) {
    next(err);  // Hatayı error middleware'e gönder
  }
};
// Her controller'da try-catch + next(err) yazmak zorundasın.

// catchAsync İLE (aynı şey, try-catch otomatik):
const chat = catchAsync(async (req, res) => {
  const user = await User.findById(user_id);
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).send({ success: true });
});
// try-catch yok. next(err) yok. Sadece throw et, catchAsync yakalasın.
```

---

## 10. Tüm Akışın Özeti

```
DOSYA YÜKLENIRKEN (1 KERE):
  catchAsync(fn) çağrıldı → chat = (req, res, next) => { ... }

ROUTE TANIMLANIRKEN (1 KERE):
  reviewRoute.post("/chat", auth("chat"), validate(...), chat);
  JavaScript soldan sağa hesaplıyor:
    auth("chat")   → parantez var → JavaScript ÇAĞIRDI → fonksiyon döndü
    validate(...)  → parantez var → JavaScript ÇAĞIRDI → fonksiyon döndü
    chat           → parantez yok → JavaScript ÇAĞIRMADI → olduğu gibi kaydedildi

  Express 3 fonksiyonu kaydetti:
    [auth'tan dönen, validate'ten dönen, chat]

İSTEK GELİNCE (HER İSTEKTE) — PİPELİNE ÇALIŞIYOR:
  Express kayıtlı fonksiyonları SIRAYLA çağırıyor:
    middleware1(req, res, next)  → auth'tan dönen → JWT doğrula → next()
    middleware2(req, res, next)  → validate'ten dönen → Joi doğrula → next()
    chat(req, res, next)        → Express çağırdı → fn(req, res, next) → controller çalıştı

  (req, res, next) değerleri Express'ten geliyor.
  Sen vermiyorsun. Express veriyor, istek geldiğinde.
```
