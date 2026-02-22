# Async, Promise, Await — Derinlemesine Anlama Notu

> Bu not, async/await konusunu ogrenirken kafada olusan
> "ama neden?", "peki ya olmasaydi?" sorularini adim adim cevaplayarak
> derinlemesine anlama saglamak icin hazirlanmistir.
> Ornekler Beyond Review API projesinden alinmistir.

---

## 1. catchAsync Olmasaydi Ne Olurdu?

catchAsync'in yaptigi tek sey su:

```javascript
// src/utils/catchAsync.js
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
```

Async fonksiyonlardaki hatalari yakalar ve `next(err)` ile
Express error middleware'ine yonlendirir.

### Neden gerekli?

`chat` ve `incoming` fonksiyonlari async fonksiyonlar.
Iclerinde `await` ile cagrilan bircok islem var:

- `User.findById()` — DB baglanti hatasi verebilir
- `replyToGoogleBusinessReview()` — Google API hatasi verebilir
- `askGemini()` — Gemini API hatasi verebilir
- `throw new ApiError(...)` — bilincli firlatilan hatalar

Eger catchAsync olmasaydi ve bu fonksiyonlardan biri hata firlatirsa:

```
1. Hata next(err)'e ulasmaz → Express error middleware calismaz
2. Unhandled Promise Rejection olusur → Node.js process uyari verir veya crash eder
3. Istemciye yanit gitmez → Request asili kalir, sonunda timeout alir
4. ApiError firlatmak ise yaramaz → throw new ApiError(404, "User not found") sessizce yutulur
```

### catchAsync olmadan ayni davranisi elde etmek icin:

Her controller'i manuel try/catch ile sarmalamaniz gerekirdi:

```javascript
const chat = async (req, res, next) => {
  try {
    const user = await User.findById(user_id);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    // ... tum is mantigi
  } catch (err) {
    next(err); // Bu satiri unutursaniz → yukaridaki sorunlar
  }
};
```

catchAsync, her async controller'a try/catch + next(err) yazmak yerine
bunu otomatiklestiren bir utility. Olmasa her fonksiyonda manuel hata
yakalama yapmak gerekir, unuttugun yerde uygulama yanit vermez
ve potansiyel olarak crash eder.

---

## 2. await Ne Yapar?

> "Bu islem bitene kadar bu fonksiyonun devamini durdur,
> ama ana thread'i bloklamadan."

```javascript
const chat = async (req, res) => {
  console.log("1 - basladi");
  const user = await User.findById(user_id);  // DB'ye git, cevabi bekle
  console.log("2 - user bulundu");             // user gelince devam et
  const review = await Review.findById(id);    // tekrar bekle
  console.log("3 - review bulundu");           // review gelince devam et
};
```

**Çıktı (sırayla):**
```
1 - basladi
2 - user bulundu
3 - review bulundu
```

`await User.findById()` calisirken:
- Bu fonksiyonun ici duraklar → 2. satira gecmez
- Node.js event loop durmaz → Baska HTTP istekleri, baska callback'ler calismaya devam eder

### await olmasaydi:

```javascript
const user = User.findById(user_id); // Promise doner, beklemez
console.log(user); // Promise { <pending> } — henuz sonuc yok!
```

**Çıktı:**
```
Promise { <pending> }
```

Sonucu almadan devam ederdi, `user` bir Promise objesi olurdu, gercek veri degil.

### await aslinda ne yapiyor?

await, async fonksiyonu bir Promise'in `.then()` zincirine ceviriyor.
Su ikisi ayni sey:

```javascript
// await ile
async function getUser() {
  const user = await User.findById(id);
  console.log(user.name);
}

// await olmadan, ayni mantik
function getUser() {
  return User.findById(id).then((user) => {
    console.log(user.name);
  });
}
```

await sadece `.then()` yazmayi guzellestiren bir syntax.
Arkada yine Promise var, yine non-blocking.
Fonksiyonun geri kalanini `.then()` callback'ine koyuyor gibi dusunebilirsin.

**Kisaca:** `await` = "sen (fonksiyon) dur, bekle — ama sen (Node.js) durmadan
diger isleri yapmaya devam et."

---

## 3. await Sadece async Fonksiyonlarin Icinde mi Kullanilir?

Evet, **neredeyse sadece `async` fonksiyonlarin icinde** kullanilir.
Ama bir istisna var.

**Kural:** `await` ancak `async` fonksiyon icinde yazilabilir.

```javascript
// ✅ Calisir
async function getUser() {
  const user = await User.findById(id);
}

// ❌ SyntaxError verir
function getUser() {
  const user = await User.findById(id); // HATA
}
```

**Istisna — Top-level await:**

ES Modules (`.mjs` veya `"type": "module"`) kullaniyorsan,
dosyanin en ust seviyesinde `await` yazabilirsin:

```javascript
// config.mjs
const data = await fetch("https://api.example.com/config");
const config = await data.json();
export default config;
```

Top-level await kullanılan modülde: await satırında o modülün çalışması durur, Promise sonuçlanana kadar o dosyanın geri kalanı çalışmaz.

Ama bu projede (Beyond API) CommonJS (`require/module.exports`) kullaniliyor,
dolayisiyla top-level await **calismaz**.
Bu projede `await` kullanmak istedigin her yerde
fonksiyonun basina `async` koyman sart.

---

## 4. Top-level Ne Demek?

Top-level = **herhangi bir fonksiyonun icinde olmayan**,
dosyanin en ust seviyesindeki kod.

```javascript
// ---- top-level (fonksiyon disi) ----
const x = 5;
console.log("merhaba");
const data = await fetch("/api");  // ← top-level await

// ---- top-level DEGIL (fonksiyon ici) ----
async function getUser() {
  const user = await User.findById(id);  // ← fonksiyon icinde
}
```

Yani "top-level await" demek: bir fonksiyona sarmadan,
direkt dosyada `await` yazmak.

### Top-level await da bekler

`await` nerede olursa olsun ayni seyi yapar:
sonuc gelene kadar bir sonraki satira gecme.

```javascript
// config.mjs
console.log("1");
const data = await fetch("/api");   // burada durur, cevabi bekler
console.log("2");                    // fetch bitince calisir
```

Cikti her zaman `1` → (bekleme) → `2` sirasinda olur.

### Peki ne degisiyor? Kim bekliyor, o degisiyor:

| Durum | Bekleyen kim? |
|---|---|
| Fonksiyon icinde `await` | O fonksiyon bekler, Node.js diger isleri yapar |
| Top-level `await` | **O dosyanin tamami** bekler, bu dosyayi `import` eden moduller de bekler |

```javascript
// a.mjs
const data = await fetch("/api");  // bu dosya yuklenene kadar...
export default data;

// b.mjs
import data from "./a.mjs";       // ...bu dosya da bekler
console.log(data);
```

Top-level await daha "agir" bir bekleme — sadece bir fonksiyonu degil,
**tum modul zincirini** durdurabilir. O yuzden dikkatli kullanilmasi gerekiyor.

---

## 5. Promise Nedir?

Promise = "Soz veriyorum, sonucu sonra getirecegim" diyen bir objedir.

```javascript
const promise = User.findById(id);
console.log(promise); // Promise { <pending> }
```

Uc durumu var:

| Durum | Anlami |
|---|---|
| `pending` | Henuz sonuc yok, bekliyor |
| `fulfilled` | Basarili, sonuc geldi |
| `rejected` | Hata oldu |

### Promise dondugunu nerden biliyoruz?

Cunku Mongoose'un dokumantasyonu oyle diyor.
`User.findById()` bir DB sorgusu baslatir ve hemen bir Promise doner.
Sonuc DB'den gelince Promise "fulfilled" olur.

Kendin de bir Promise olusturabilirsin:

```javascript
const soz = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("veri geldi!");  // 2 saniye sonra sonuc ver
  }, 2000);
});

// Kullanim:
const sonuc = await soz; // 2 saniye bekler
console.log(sonuc);      // "veri geldi!"
```

### "Sonucu sonra getirecegim" tam olarak ne demek?

**await olmadan:**

```javascript
console.log("1");
const promise = User.findById(id);  // Promise doner, BEKLEMEZ
console.log("2");                    // hemen calisir
console.log(promise);                // Promise { <pending> }

// Sonuc sonradan gelir, yakalamak icin:
promise.then((user) => {
  console.log("3 - user geldi:", user.name);
});
```

Cikti: `1` → `2` → `Promise { <pending> }` → (DB cevap verince) → `3 - user geldi: Kenan`

Sonraki satira **hemen gecer**. Sonuc gelince `.then()` calisir.

**await ile:**

```javascript
console.log("1");
const user = await User.findById(id);  // BEKLER
console.log("2 - user geldi:", user.name);
```

Cikti: `1` → (bekleme) → `2 - user geldi: Kenan`

Sonuc gelene kadar **bir sonraki satira gecmez**.

---

## 6. Promise Fonksiyonu Async mi Yapar?

Evet, kabaca oyle. Bir fonksiyon **Promise donduruyorsa**,
o fonksiyon asenkron bir fonksiyondur.

```javascript
// Bu fonksiyon Promise dondurur → asenkron
function getUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => resolve("Kenan"), 2000);
  });
}

// Bu fonksiyon duz deger dondurur → senkron
function topla(a, b) {
  return a + b;
}
```

`async` keyword'u de aslinda fonksiyonu
**otomatik olarak Promise donduran** bir fonksiyona cevirir:

```javascript
async function merhaba() {
  return "selam";
}

// Yukaridaki aslinda su:
function merhaba() {
  return Promise.resolve("selam");
}
```

Yani `async` keyword = "bu fonksiyon her halukarda Promise dondursun" demek.

---

## 7. User.findById(id)'yi Async Yapan Ne?

**Fonksiyonun kendisi async.** Disaridaki `async function` ile alakasi yok.

```javascript
// Mongoose'un kendi ic kodu kabaca soyle:
findById(id) {
  return new Promise((resolve, reject) => {
    // MongoDB'ye sorgu gonder
    // cevap gelince → resolve(user)
    // hata olursa → reject(error)
  });
}
```

`findById` bir **Promise donduran fonksiyon**.
`await` ise o Promise'in sonucunu bekliyor.

Roller soyle:

| Ne | Gorevi |
|---|---|
| `User.findById(id)` | Promise **uretir** (ben sonucu sonra getirecegim) |
| `await` | O Promise'i **tuketir** (tamam, seni bekliyorum) |
| `async function` | Icinde `await` yazabilmeme **izin verir** |

`async function` sadece bir kabuk — `await` kullanabilmek icin gerekli.
Asil asenkron isi yapan `findById`'nin kendisi.

---

## 8. Dis Fonksiyona async Dememizin Sebebi Ne?

Iki sebep var:

### a) Icinde await kullanabilmek icin

```javascript
// ❌ async yoksa await yazamazsin — SyntaxError
const chat = (req, res) => {
  const user = await User.findById(id); // HATA
};

// ✅ async olunca await yazabilirsin
const chat = async (req, res) => {
  const user = await User.findById(id); // calisir
};
```

### b) Bu fonksiyonu cagiran kisi (Express) beklemek zorunda kalmasin

```javascript
// Express bu fonksiyonu cagirdiginda:
chat(req, res, next);
// chat Promise dondurur, Express bunu BEKLEMEZ
// Event loop serbest kalir, baska istekleri karsilar
// chat icinde await'ler kendi aralarinda sirayla calisir
```

Yani `async` disariya "beni bekleme, ben kendi icimde hallederim" diyor.
Icerideki await'ler ise **kendi aralarinda** sirali calisiyor
ama **dis dunyayi bloklamiyor**.

---

## 9. Promise Olmasa Tum Program Kitlenir mi?

Evet, mantik dogru. Promise olmasa yani fonksiyon async olmasa
o kisimda kalir ve bekler, tum programi kitler.
Bu sebeple Promise donduran fonksiyonlar var —
ya da `async` ile fonksiyonun Promise dondurmesini sagliyoruz ki
tum program kitlenmesin.
Ayrica fonksiyon icinde `await` kullanarak icerde onemli olaylarda
bekleme yapiyoruz (senkron calismasini saglama).

Kucuk bir ayrinti: JavaScript'te I/O islemleri (DB, network, dosya)
zaten dogasi geregi asenkron. Ama **agir hesaplama** senkron olursa
gercekten kitler:

```javascript
// ❌ Bu tum programi kitler — senkron, Promise yok
function agirHesaplama() {
  let toplam = 0;
  for (let i = 0; i < 10_000_000_000; i++) {
    toplam += i;
  }
  return toplam; // bitene kadar hicbir sey calismaz
}

// ✅ Bu kitlemez — Promise ile asenkron
async function kullaniciBul() {
  const user = await User.findById(id); // DB'ye gider, event loop serbest
  return user;
}
```

### Tum resim:

| Ne | Neden |
|---|---|
| Promise dondurmek | Programin geri kalani kitlenmesin |
| `async` keyword | Fonksiyonun otomatik Promise dondurmesini saglamak + icinde `await` yazabilmek |
| `await` keyword | Fonksiyon icinde sirali calismayi garanti etmek (sonucu bekle, sonra devam et) |

```
Disaridan bakinca → non-blocking (program kitlenmez)
Iceriden bakinca  → sirali (satir satir bekler)

Bu ikisini AYNI ANDA saglamak, async/await'in tum amaci.
```
