# Fonksiyon yazim stilleri (JavaScript)

**Imza (signature):** Bir fonksiyonun hangi parametreleri, hangi sirayla aldigidir.
- Ornek: `(x, y) => x + y` → imzasi "iki parametre: x, y"dir.
- Baska ornek: `(isim, yas)` alan bir fonksiyon → imzasi "iki parametre: isim, yas"dir.

Ayni fonksiyon uc farkli sekilde yazilabilir. Hepsi `(x, y)` alir; cagirildiginda davranis aynidir.

## 1. Function declaration (klasik fonksiyon)

```javascript
function topla(x, y) {
  return x + y;
}
```

## 2. Function expression

```javascript
const topla = function(x, y) {
  return x + y;
};
```

## 3. Arrow function (ok fonksiyonu)

```javascript
const topla = (x, y) => {
  return x + y;
};
```

Ucunde de `topla(2, 3)` gibi cagirilir; sonuc hep 5'tir.

---

## Fonksiyon donduren fonksiyon

Bir fonksiyon, cagrildiginda baska bir fonksiyon dondurebilir. Boylece once bir parametre verip "ayar" yaparsin, donen fonksiyonu ise daha sonra (veya hemen) cagirirsin.

```javascript
// En basit hali:
const topla = (a) => (b) => a + b;

// Acik yazilisi:
const topla = (a) => {
  return (b) => {
    return a + b;
  };
};

// Kullanimi:
topla(3);        // → (b) => 3 + b   (fonksiyon dondurur)
topla(3)(5);    // → 8               (donen fonksiyonu hemen cagirdik)
```

Iki adimda kullanmak da mumkun:

```javascript
const uceEkle = topla(3);   // iceride a = 3 "tutuldu"
uceEkle(5);                 // → 8
uceEkle(10);                // → 13
```

---

### Daha somut ornek: siparis fonksiyonu

Once musteri adi veriyorsun, donen fonksiyon ise "bu musteri icin ne siparis edildi?" sorusuna cevap veriyor. Dis parametre (`musteriAdi`) iceride "tutulur" (closure).

```javascript
const siparisAl = (musteriAdi) => {
  console.log("Siparis acildi: " + musteriAdi);
  return (urun) => {
    console.log(musteriAdi + " icin " + urun + " hazirlaniyor...");
    return musteriAdi + "'nin " + urun + "'si hazir.";
  };
};

// Iki adimda:
const ahmetinSiparisi = siparisAl("Ahmet");   // "Siparis acildi: Ahmet"
ahmetinSiparisi("cikolatali pasta");          // "Ahmet icin cikolatali pasta hazirlaniyor..." → "Ahmet'nin cikolatali pasta'si hazir."
ahmetinSiparisi("meyveli kek");               // ayni musteri, farkli urun

// Tek satirda (ayni mantik):
siparisAl("Mehmet")("meyveli pasta");
// "Siparis acildi: Mehmet"
// "Mehmet icin meyveli pasta hazirlaniyor..." → "Mehmet'nin meyveli pasta'si hazir."
```

Burada "once ayar (musteri), sonra islem (urun)" net: `siparisAl` bir kere musteriyle cagriliyor, donen fonksiyon her seferinde urunle cagriliyor. Express'te `auth("chat")` = once yetki adi, donen fonksiyon her istekte `(req, res, next)` ile cagrilir; ayni kalip.

