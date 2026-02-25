# Callback Nedir?

## Tek Cumlede

Callback = bir fonksiyonu baska bir fonksiyona veriyorsun, o is bitince senin fonksiyonunu geri cagiriyor.

Call = cagir, Back = geri. **Geri cagirma.**

---

## Gercek Hayat Benzetmesi

```
Doktora gittin. Sirani bekliyorsun.
Sekreter: "Numaran 47. Siran gelince seni CAGIRACAGIM."
Sen oturup bekliyorsun.
Siran geldiginde sekreter seni geri cagiriyor.

Callback = "Bitince haber ver"
```

---

## Neden Var?

JavaScript tek is yapabilir. Eger veritabanini beklerken dursa site donar.

```
CALLBACK OLMADAN:
  1. Veritabanina sor           (basla)
  2. .....bekliyorum.....       (site dondu, kimse bir sey yapamaz)
  3. .....hala bekliyorum....
  4. Cevap geldi!               (simdi devam edebilirim)

CALLBACK ILE:
  1. Veritabanina sor + "cevap gelince su fonksiyonu cagir" de
  2. Baska islere devam et      (site calismaya devam ediyor)
  3. ...baska isler...
  4. Cevap geldi! → Verdigin fonksiyon otomatik cagirildi
```

---

## En Basit Ornek

```javascript
setTimeout(function() {
  console.log("3 saniye gecti!");
}, 3000);

console.log("Ben hemen calistim");
```

Cikti:
```
Ben hemen calistim
3 saniye gecti!          ← 3 saniye sonra geldi
```

`function() { ... }` kisminin TAMAMI bir callback.
Sen cagirmadin onu. `setTimeout` 3 saniye saydiktan sonra senin yerine cagirdi.

---

## Kalip

Her yerde ayni kalip gecerli:

```
kutuphane.birSeyYap(veri, function BITINCE() { ... })
```

Bir kutuphanenin fonksiyonu parametre olarak fonksiyon istiyorsa:
**"Isim bitince bunu calistir"** demek.

---

## Parametreler: Hangisi Ne?

```javascript
User.findById("123", function(hata, kullanici) {
  console.log("Buldum:", kullanici.name);
});
```

`findById` iki sey aliyor:

```
1.  "123"                           ← bununla calis (kullanici ID'si, duz string)
2.  function(hata, kullanici) {     ← BITINCE bunu cagir (callback fonksiyonu)
      console.log("Buldum:", kullanici.name);
    }
```

`findById` veritabanina gidiyor, ariyor, buluyor.
Bulunca senin fonksiyonunu cagiriyor ve icine sonucu koyuyor:

```
hata      = null                   (sorun yoksa)
kullanici = { name: "Kaan", ... }  (buldugu veri)
```

---

## Peki Callback'in Icindeki Parametreler?

CORS ornegi:

```javascript
cors({
  origin: function(origin, callback) {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
})
```

Burada `origin` ve `callback` ikisi de parametre ama:

```
origin   = "https://beyondreview.ai"   ← duz string (kim istek atti)
callback = fonksiyon                   ← cevap vermek icin kullanacaksin
```

Ikisi de fonksiyon degil. Sadece `callback` fonksiyon, `origin` duz bir string.
Bunu kutuphane belirliyor. Birinci parametreye origin koyuyor, ikinciye cevap fonksiyonunu koyuyor.

Isimler onemli degil, sira onemli:
```javascript
function(origin, callback) { ... }
function(kimGeldi, cevapVer) { ... }
function(a, b) { ... }
// Uc satir da ayni sey
```

---

## Kutuphane Icinden Bakis

Bir kutuphane fonksiyonu callback istediginde arkada su oluyor:

```javascript
// jwt.sign'in icini dusun (basitlestirilmis):
function jwtSign(payload, secret, callback) {
  // 1. Sifreleme islemini yap (zaman alir)
  let token = sifrelemeYap(payload, secret);

  // 2. Islem bitince SENIN FONKSIYONUNU cagir
  callback(null, token);
}
```

Sen su sekilde kullaniyorsun:

```javascript
jwt.sign(
  { userId: 123 },
  "gizli-anahtar",
  function(error, token) {         // ← BUNU SEN YAZIYORSUN
    console.log("Token hazir!", token);
  }
);
```

Sen tarif veriyorsun, kutuphane isi bitince tarifi uyguluyor.

---

## Projeden Gercek Ornekler

### 1. Sunucu baslatma — `index.js:16`

```javascript
server = app.listen(config.port, () => {
  logger.info("Listening to port 8080");
});
```

```
app.listen → "Sunucuyu baslat"
() => { logger.info(...) } → "Baslatinca bu fonksiyonu cagir"
```

Garson mutfaga siparis veriyor. "Yemek hazir olunca haber ver."
Garson baska masalara gidiyor. Yemek hazir olunca mutfak garsonu geri cagiriyor.

---

### 2. Sifre hashleme — `user.model.js:459`

```javascript
userSchema.pre("save", async function(next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(Number(config.bcrypt.saltRounds));
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
```

```
.pre("save", ...) → "Veritabanina KAYDETMEDEN ONCE su fonksiyonu cagir"
next()            → "Isim bitti, kaydetmeye devam et"
```

Kargocu paketi teslim etmeden once seni ariyor: "Adres dogru mu?"
Sen "Evet" diyorsun (next) → kargocu teslime devam ediyor.

---

### 3. CORS kontrolu — `app.js:88`

```javascript
cors({
  origin: function(origin, callback) {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
})
```

```
origin           → kim istek atti (string)
callback         → cevap ver butonu (fonksiyon)
callback(null, true)       → "Hata yok, gecebilir"
callback(new Error(...))   → "Engelle"
```

Binanin kapisi var. Her biri geldiginde guvenlik sana soruyor: "Bu kisi girebilir mi?"
Sen "Evet" veya "Hayir" diyorsun.

---

### 4. JWT dogrulama — `passport.js:11`

```javascript
const jwtVerify = async (payload, done) => {
  const user = await User.findById(payload.sub);
  if (!user) {
    return done(null, false);     // kullanici yok
  }
  done(null, user);               // kullanici bulundu
};

const jwtStrategy = new Strategy(jwtOptions, jwtVerify);
```

```
payload → token'in icindeki veri (obje)
done    → cevap ver fonksiyonu (callback)
done(null, false) → "Kullanici yok, reddediyorum"
done(null, user)  → "Kullanici bulundu, gecebilir"
```

Otel resepsiyonuna kimligini veriyorsun.
Resepsiyoncu arka odadaki sana soruyor: "Bu kisi kayitli mi?"
Sen kontrol edip cevap veriyorsun.

---

### 5. Sunucu kapanisi — `index.js:51`

```javascript
server.close(() => {
  logger.info("Server closed");
  process.exit(1);
});
```

```
server.close()                    → "Yeni istek alma, mevcutlari bitir"
() => { process.exit(1) }        → "Hepsi bitince bu fonksiyonu cagir"
```

Dukkanin var. "Kapaniyor" tabelasini asiyorsun.
Ama icerde hala musteriler var.
"Son musteri cikinca haber ver" diyorsun.
Son musteri cikiyor → seni geri cagiriyorlar → isigi kapatiyorsun.

---

### 6. Hata yakalama — `index.js:65`

```javascript
process.on("uncaughtException", unexpectedErrorHandler);
```

```
process.on("uncaughtException", ...) → "Beklenmeyen hata olursa"
unexpectedErrorHandler               → "Bu fonksiyonu cagir"
```

Fabrikaya yangin alarmi kuruyorsun.
Yangin yok → fonksiyon hic calismaz.
Yangin cikar → alarm senin fonksiyonunu otomatik cagiriyor.

---

## Ozet Tablo

```
kutuphane.fonksiyon(veri, callback)
                            |
                    "Bitince bunu cagir"

app.listen(port,            sunucu_hazir_olunca_cagir)
userSchema.pre("save",      kaydetmeden_once_cagir)
cors({ origin:              istek_gelince_cagir })
server.close(               kapaninca_cagir)
process.on("hata",          hata_olunca_cagir)
User.findById(id,           bulunca_cagir)
jwt.sign(veri, key,         token_hazir_olunca_cagir)
setTimeout(                 sure_dolunca_cagir, 3000)
fs.readFile(dosya,          okunca_cagir)
button.addEventListener(    tiklaninca_cagir)
```

Hepsinde ayni mantik: **sen fonksiyonu veriyorsun, karsi taraf hazir olunca onu geri cagiriyor.**
