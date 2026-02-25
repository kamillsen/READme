# Async, Promise, Await — Derinlemesine Anlama Notu

> Bu not, async/await konusunu öğrenirken kafada oluşan
> "ama neden?", "peki ya olmasaydı?" sorularını adım adım cevaplayarak
> derinlemesine anlama sağlamak için hazırlanmıştır.
> Örnekler Beyond Review API projesinden alınmıştır.
>
> **İlgili not:** Bu kavramların Express middleware'de nasıl kullanıldığını görmek için:
> [express-middleware-ve-fonksiyon-kaliplari.md](./express-middleware-ve-fonksiyon-kaliplari.md)

---

## 1. Promise Nedir?

Promise = "Sonucu **şu an** veremiyorum ama **söz veriyorum**, işlem bitince ya sonucu ya hatayı döndüreceğim" diyen bir **obje**.

Burada iki önemli kelime var: **söz** ve **obje**.

**Söz:** Sonuç ne zaman gelecek belli değil. Belki 10ms, belki 3 saniye. Ama Promise garanti veriyor — işlem bittiğinde seni bilgilendireceğim.

**Obje:** Promise bir JavaScript objesi olduğu için üzerinde **method'lar** taşıyor. Bu method'lar sayesinde "sonuç gelince ne yapayım?" ve "hata olursa ne yapayım?" diyebiliyorsun:

```javascript
// Promise objesinin method'ları:
promise.then(sonuc => ...)     // sonuç gelince çalışır
promise.catch(hata => ...)     // hata olursa çalışır
promise.finally(() => ...)     // her durumda çalışır (başarılı veya hatalı)
```

Bu üç method **sadece Promise objesinde** var. String'de, number'da, undefined'da yok:

```javascript
"merhaba".then(...)       // ✗ yok — string'de .then() yok
(5).catch(...)            // ✗ yok — number'da .catch() yok
undefined.finally(...)    // ✗ yok — undefined'da .finally() yok

Promise.resolve(5).then(...)     // ✓ var — Promise objesinde .then() var
Promise.resolve(5).catch(...)    // ✓ var — Promise objesinde .catch() var
Promise.resolve(5).finally(...)  // ✓ var — Promise objesinde .finally() var
```

### Promise'in Üç Durumu

```javascript
const promise = User.findById(id);
console.log(promise); // Promise { <pending> }
```

| Durum       | Anlamı                    |
| ----------- | ------------------------- |
| `pending`   | Henüz sonuç yok, bekliyor |
| `fulfilled` | Başarılı, sonuç geldi → `.then()` çalışır |
| `rejected`  | Hata oldu → `.catch()` çalışır |

### Promise döndüğünü nerden biliyoruz?

Çünkü Mongoose'un dokümantasyonu öyle diyor.
`User.findById()` bir DB sorgusu başlatır ve hemen bir Promise döner.
Sonuç DB'den gelince Promise "fulfilled" olur.

Kendin de bir Promise oluşturabilirsin:

```javascript
const soz = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("veri geldi!");  // 2 saniye sonra sonuç ver
  }, 2000);
});

// Kullanım:
const sonuc = await soz; // 2 saniye bekler
console.log(sonuc);      // "veri geldi!"
```

### "Sonucu şu an veremiyorum" tam olarak ne demek?

Promise diyor ki: "Ben bir DB sorgusu başlattım. Sonuç ne zaman gelecek bilmiyorum. Ama söz veriyorum — geldiğinde `.then()` ile sana vereceğim, hata olursa `.catch()` ile bildireceğim."

**await olmadan:**

```javascript
console.log("1");
const promise = User.findById(id);  // Promise döner, BEKLEMEZ
console.log("2");                    // hemen çalışır
console.log(promise);                // Promise { <pending> } — henüz sonuç yok

// Sonuç sonradan gelir, yakalamak için:
promise.then((user) => {
  console.log("3 - user geldi:", user.name);  // DB cevap verince çalışır
});
```

Çıktı: `1` → `2` → `Promise { <pending> }` → (DB cevap verince) → `3 - user geldi: Kenan`

Sonraki satıra **hemen geçer**. Promise "söz verdiği" sonucu getirdiğinde `.then()` çalışır.

**await ile:**

```javascript
console.log("1");
const user = await User.findById(id);  // BEKLER — Promise sonuç getirene kadar
console.log("2 - user geldi:", user.name);
```

Çıktı: `1` → (bekleme) → `2 - user geldi: Kenan`

Sonuç gelene kadar **bir sonraki satıra geçmez**.

---

## 2. await Ne Yapar?

> "Bu işlem bitene kadar bu fonksiyonun devamını durdur,
> ama ana thread'i bloklamadan."

```javascript
const chat = async (req, res) => {
  console.log("1 - başladı");
  const user = await User.findById(user_id);  // DB'ye git, cevabı bekle
  console.log("2 - user bulundu");             // user gelince devam et
  const review = await Review.findById(id);    // tekrar bekle
  console.log("3 - review bulundu");           // review gelince devam et
};
```

**Çıktı (sırayla):**

```
1 - başladı
2 - user bulundu
3 - review bulundu
```

`await User.findById()` çalışırken:

- Bu fonksiyonun içi duraklar → 2. satıra geçmez
- Node.js event loop durmaz → Başka HTTP istekleri, başka callback'ler çalışmaya devam eder

### await olmasaydı:

```javascript
const user = User.findById(user_id); // Promise döner, beklemez
console.log(user); // Promise { <pending> } — henüz sonuç yok!
```

**Çıktı:**

```
Promise { <pending> }
```

Sonucu almadan devam ederdi, `user` bir Promise objesi olurdu, gerçek veri değil.

### await aslında ne yapıyor?

await, async fonksiyonu bir Promise'in `.then()` zincirine çeviriyor.
Şu ikisi aynı şey:

```javascript
// await ile
async function getUser() {
  const user = await User.findById(id);
  console.log(user.name);
}

// await olmadan, aynı mantık
function getUser() {
  return User.findById(id).then((user) => {
    console.log(user.name);
  });
}
```

await sadece `.then()` yazmayı güzelleştiren bir syntax.
Arkada yine Promise var, yine non-blocking.
Fonksiyonun geri kalanını `.then()` callback'ine koyuyor gibi düşünebilirsin.

Birden fazla await olunca arka planda iç içe `.then()` zinciri oluşur:

```javascript
// Senin yazdığın (await ile):
async function chatFlow() {
  const user = await User.findById(id);
  const review = await Review.findById(user.reviewId);
  console.log(review.text);
}

// JavaScript'in arka planda çevirdiği (.then() zinciri):
function chatFlow() {
  return User.findById(id).then((user) => {
    return Review.findById(user.reviewId).then((review) => {
      console.log(review.text);
    });
  });
}
```

Her `await` satırı = "buradan sonrasını `.then()` callback'ine koy". `await` olmasaydı bu iç içe `.then()` zincirini elle yazmak zorunda kalırdın.

**Kısaca:** `await` = "sen (fonksiyon) dur, bekle — ama sen (Node.js) durmadan
diğer işleri yapmaya devam et."

---

## 3. async Ne Yapar?

`async`'in **iki işi** var:

### a) Return değerini otomatik olarak Promise'e sarar

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

Yani `async` keyword = "bu fonksiyon her halükarda Promise döndürsün" demek:

```javascript
async function merhaba() {
  return "selam";
}

// Yukarıdaki aslında şu:
function merhaba() {
  return Promise.resolve("selam");
}
```

### b) İçinde await yazabilmene izin verir

```javascript
// async yoksa await yazamazsın — SyntaxError:
const chat = (req, res) => {
  const user = await User.findById(id); // HATA
};

// async olunca await yazabilirsin:
const chat = async (req, res) => {
  const user = await User.findById(id); // çalışır
};
```

### Dış fonksiyona neden async diyoruz?

```javascript
// Express bu fonksiyonu çağırdığında:
chat(req, res, next);
// chat Promise döndürür, Express bunu BEKLEMEZ
// Event loop serbest kalır, başka istekleri karşılar
// chat içinde await'ler kendi aralarında sırayla çalışır
```

Yani `async` dışarıya "beni bekleme, ben kendi içimde hallederim" diyor.
İçerideki await'ler ise **kendi aralarında** sıralı çalışıyor
ama **dış dünyayı bloklamıyor**.

---

## 4. Hata Yakalama: try-catch vs .catch()

JavaScript'te hata yakalamanın **iki farklı mekanizması** var. Bunları karıştırmamak önemli.

### try-catch — Promise'e İhtiyaç Duymaz

`try-catch` JavaScript'in temel hata yakalama aracıdır. Promise ile ilgisi yok:

```javascript
// Promise yok, async yok — düz try-catch çalışır:
try {
  JSON.parse("geçersiz json{{{");
} catch (err) {
  console.log(err.message);  // ✓ "Unexpected token g..."
}

try {
  const x = 5;
  x.toUpperCase();  // number'da toUpperCase yok
} catch (err) {
  console.log(err.message);  // ✓ "x.toUpperCase is not a function"
}
```

### .catch() — Sadece Promise'de Var

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
```

Bu yüzden:

```javascript
// async fn → Promise döner → .catch() çalışır:
const fn = async () => { throw new Error("hata"); };
fn().catch(err => console.log(err));  // ✓ Promise'de .catch() var
// Konsol çıktısı:
// Error: hata
//     at fn (file.js:1:38)

// normal fn → undefined döner → .catch() patlar:
const fn = () => { throw new Error("hata"); };
fn().catch(err => console.log(err));  // ✗ undefined.catch() → TypeError
// Konsol çıktısı:
// TypeError: Cannot read properties of undefined (reading 'catch')
//     at file.js:2:6
// Senin "hata" mesajını hiç görmezsin. .catch()'e ulaşmadan önce başka bir hatayla patlıyor.
```

### try-catch + await — İkisini Birleştirir

`await` olunca `try-catch` asenkron hataları da yakalar.
Çünkü `await` Promise'in sonucunu **bekleyip çözerek** senkron gibi davranmasını sağlar:

```javascript
try {
  const user = await User.findById("abc123");  // ← await Promise'i bekliyor
  JSON.parse("{{");                             // ← senkron hata
} catch (err) {
  // İkisini de yakalar — hem DB hatası hem parse hatası
}
```

### Özet Tablo


| Mekanizma             | Ne yakalar                           | Promise lazım mı              |
| --------------------- | ------------------------------------ | ----------------------------- |
| `try-catch`           | Senkron hataları (anında fırlayan)   | Hayır                         |
| `.catch()`            | Promise içindeki hataları (asenkron) | Evet                          |
| `try-catch` + `await` | İkisini de                           | Evet (`await` Promise bekler) |


### .then().catch() vs async/await — Eski ve Yeni Yöntem

Bu ikisi **tamamen aynı işi** yapar:

```javascript
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
```

`async/await` zaten `.then().catch()`'in üzerine kurulmuş syntax sugar.

> **Not:** `.then().catch()` günlük kodda pek kullanılmaz. Ama `catchAsync` gibi
> yardımcı fonksiyonlarda `.catch()` doğrudan kullanılır çünkü orada `await` ile
> beklemek yerine Promise'i olduğu gibi zincirlemen gerekir.
> Detay için: [catchAsync kalıbı](./express-middleware-ve-fonksiyon-kaliplari.md#9-catchasync-kalıbı--chatin-oluşumu)

### Promise.resolve — Garanti Altına Alma

`Promise.resolve()` bir değeri Promise'e çevirir:

```javascript
Promise.resolve(5)          // → Promise { 5 }
Promise.resolve("merhaba")  // → Promise { "merhaba" }
Promise.resolve(undefined)  // → Promise { undefined }

// Zaten Promise ise → dokunma, olduğu gibi bırak:
Promise.resolve(fetch("/api"))  // → aynı Promise
```

Bir fonksiyonun async mı değil mi bilmiyorsan, `Promise.resolve` ile sarınca `.catch()` her zaman çalışır:

```javascript
Promise.resolve(fn())       // ne geldiyse → artık kesin Promise
  .catch(err => next(err)); // .catch() her zaman çalışır ✓
```


| Durum                   | `fn()` ne döndürür | `.catch()` var mı |
| ----------------------- | ------------------ | ----------------- |
| `async fn`              | Promise            | ✓                 |
| normal `fn`             | undefined          | ✗ patlıyor        |
| `Promise.resolve(fn())` | her zaman Promise  | ✓                 |


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
kullaniciyiGetir("abc123")
  .catch(err => console.log(err.message));  // ✓

// ============ NORMAL FONKSİYON ============

const kullaniciyiKontrolEt = (id) => {
  if (!id) throw new Error("ID boş olamaz");
  return "ID geçerli";
};

// normal → string döner
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

---

## 5. await Sadece async İçinde mi Kullanılır?

Evet, **neredeyse sadece `async` fonksiyonların içinde** kullanılır.
Ama bir istisna var.

**Kural:** `await` ancak `async` fonksiyon içinde yazılabilir.

```javascript
// ✅ Çalışır
async function getUser() {
  const user = await User.findById(id);
}

// ❌ SyntaxError verir
function getUser() {
  const user = await User.findById(id); // HATA
}
```

### İstisna — Top-level await

ES Modules (`.mjs` veya `"type": "module"`) kullanıyorsan,
dosyanın en üst seviyesinde `await` yazabilirsin:

```javascript
// config.mjs
const data = await fetch("https://api.example.com/config");
const config = await data.json();
export default config;
```

Top-level = **herhangi bir fonksiyonun içinde olmayan**, dosyanın en üst seviyesindeki kod:

```javascript
// ---- top-level (fonksiyon dışı) ----
const x = 5;
console.log("merhaba");
const data = await fetch("/api");  // ← top-level await

// ---- top-level DEĞİL (fonksiyon içi) ----
async function getUser() {
  const user = await User.findById(id);  // ← fonksiyon içinde
}
```

### Top-level await da bekler, ama kim bekliyor?

`await` nerede olursa olsun aynı şeyi yapar: sonuç gelene kadar bir sonraki satıra geçme.


| Durum                    | Bekleyen kim?                                                             |
| ------------------------ | ------------------------------------------------------------------------- |
| Fonksiyon içinde `await` | O fonksiyon bekler, Node.js diğer işleri yapar                            |
| Top-level `await`        | **O dosyanın tamamı** bekler, bu dosyayı `import` eden modüller de bekler |


```javascript
// a.mjs
const data = await fetch("/api");  // bu dosya yüklenene kadar...
export default data;

// b.mjs
import data from "./a.mjs";       // ...bu dosya da bekler
console.log(data);
```

Top-level await daha "ağır" bir bekleme — sadece bir fonksiyonu değil,
**tüm modül zincirini** durdurabilir. O yüzden dikkatli kullanılması gerekiyor.

> **Not:** Bu projede (Beyond API) CommonJS (`require/module.exports`) kullanılıyor,
> dolayısıyla top-level await **çalışmaz**.
> Bu projede `await` kullanmak istediğin her yerde fonksiyonun başına `async` koyman şart.

---

## 6. Bir Fonksiyonu Asenkron Yapan Ne?

**Fonksiyonun kendisi.** Dışarıdaki `async function` ile alakası yok.

```javascript
// Mongoose'un kendi iç kodu kabaca şöyle:
findById(id) {
  return new Promise((resolve, reject) => {
    // MongoDB'ye sorgu gönder
    // cevap gelince → resolve(user)
    // hata olursa → reject(error)
  });
}
```

`findById` bir **Promise döndüren fonksiyon**.
`await` ise o Promise'in sonucunu bekliyor.

Roller şöyle:


| Ne                  | Görevi                                            |
| ------------------- | ------------------------------------------------- |
| `User.findById(id)` | Promise **üretir** (ben sonucu sonra getireceğim) |
| `await`             | O Promise'i **tüketir** (tamam, seni bekliyorum)  |
| `async function`    | İçinde `await` yazabilmeme **izin verir**         |


`async function` sadece bir kabuk — `await` kullanabilmek için gerekli.
Asıl asenkron işi yapan `findById`'nin kendisi.

### Senkron vs Asenkron Fonksiyon — Nasıl Anlarız?

```javascript
// Bu fonksiyon Promise döndürür → asenkron
function getUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => resolve("Kenan"), 2000);
  });
}

// Bu fonksiyon düz değer döndürür → senkron
function topla(a, b) {
  return a + b;
}
```

---

## 7. Promise Olmasa Tüm Program Kitlenir mi?

Evet. Promise olmasa yani fonksiyon async olmasa o kısımda kalır ve bekler, tüm programı kitler.
Bu sebeple Promise döndüren fonksiyonlar var —
ya da `async` ile fonksiyonun Promise döndürmesini sağlıyoruz ki
tüm program kitlenmesin.

Küçük bir ayrıntı: JavaScript'te I/O işlemleri (DB, network, dosya)
zaten doğası gereği asenkron. Ama **ağır hesaplama** senkron olursa
gerçekten kitler:

```javascript
// ❌ Bu tüm programı kitler — senkron, Promise yok
function agirHesaplama() {
  let toplam = 0;
  for (let i = 0; i < 10_000_000_000; i++) {
    toplam += i;
  }
  return toplam; // bitene kadar hiçbir şey çalışmaz
}

// ✅ Bu kitlemez — Promise ile asenkron
async function kullaniciBul() {
  const user = await User.findById(id); // DB'ye gider, event loop serbest
  return user;
}
```

### Tüm resim:


| Ne                | Neden                                                                          |
| ----------------- | ------------------------------------------------------------------------------ |
| Promise döndürmek | Programın geri kalanı kitlenmesin                                              |
| `async` keyword   | Fonksiyonun otomatik Promise döndürmesini sağlamak + içinde `await` yazabilmek |
| `await` keyword   | Fonksiyon içinde sıralı çalışmayı garanti etmek (sonucu bekle, sonra devam et) |


```
Dışarıdan bakınca → non-blocking (program kitlenmez)
İçeriden bakınca  → sıralı (satır satır bekler)

Bu ikisini AYNI ANDA sağlamak, async/await'in tüm amacı.
```

