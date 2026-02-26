# Redux & Redux Toolkit Detaylı Notlar

## 1. Redux Nedir?

Redux, JavaScript uygulamaları için **merkezi state yönetim kütüphanesidir**. Tüm uygulama verilerini **tek bir merkezde (store)** toplar ve yönetir.

### Peki Bu "Veriler" Nelerdir ve Nereden Gelir?

Redux'ın yönettiği veriler iki kaynaktan gelir:

| Veri Kaynağı | Örnekler |
|-------------|----------|
| **Kullanıcı Etkileşimleri** | Form girişleri, buton tıklamaları, sepet ekleme/çıkarma |
| **API Cevapları** | Veritabanından gelen ürün listesi, kullanıcı profili, bildirimler |

### Redux'ın Yönettiği Veri Türleri:

- **Kullanıcı verileri**: İsim, email, yetkiler, giriş durumu
- **Uygulama verileri**: Sepet içeriği, favoriler, bildirimler
- **API verileri**: Ürün listesi, sipariş geçmişi, mesajlar
- **UI durumları**: Açık/kapalı menüler, seçili sekmeler, tema tercihi

---

## 2. Redux Mimarisi

```
Component → Dispatch → Action → Reducer → Store → Component (güncellenmiş state)
```

### Temel Kavramlar ve Görevleri

| Kavram | Görevi | Benzetme |
|--------|--------|----------|
| **Store** | Tüm state'lerin merkezi deposu | Apartmanın su deposu |
| **Action** | Ne yapılacağını tanımlayan nesne | "Su ver" komutu |
| **Reducer** | Action'a göre state'i güncelleyen fonksiyon | Suyun borulardan dağıtılması |
| **Dispatch** | Action'ı store'a gönderme işlemi | Musluğu açma hareketi |
| **useSelector** | Store'dan veri okuma | Depodan su alma |
| **useDispatch** | Action gönderme | Musluğu çevirme |

---

## 3. Redux Toolkit ile Çoklu Slice Kullanımı

### 3.1. Kullanıcı Slice'ı (store/kullaniciSlice.js)

```javascript
import { createSlice } from '@reduxjs/toolkit';

const kullaniciSlice = createSlice({
  // name: Bu slice'ın ismi - action'lar otomatik olarak "kullanici/" ile başlar
  // Örnek: "kullanici/girisYap" şeklinde action oluşur
  name: 'kullanici',
  
  // Başlangıç state'i - birden fazla değer içerebilir
  initialState: {
    isim: 'Misafir',
    email: '',
    yas: 25,
    girisYapmisMi: false,
    yetkiler: ['okuma']
  },
  
  reducers: {
    // Her reducer fonksiyonu bir action'dır
    girisYap: (state, action) => {  // action => gönderilen veri
      // action.payload = { isim: 'Ali', email: 'ali@mail.com' }
      state.isim = action.payload.isim;
      state.email = action.payload.email;
      state.girisYapmisMi = true;
    },
    cikisYap: (state) => {
      state.isim = 'Misafir';
      state.email = '';
      state.girisYapmisMi = false;
      state.yetkiler = ['okuma'];
    },
    yasGuncelle: (state, action) => {
      state.yas = action.payload; // Direkt sayı değeri
    }
  }
});

// Action'ları dışa aktar
export const { girisYap, cikisYap, yasGuncelle } = kullaniciSlice.actions;

// Reducer'ı dışa aktar (store'a eklemek için)
export default kullaniciSlice.reducer;
```

### 3.2. Ürün Slice'ı (store/urunSlice.js)

```javascript
import { createSlice } from '@reduxjs/toolkit';

const urunSlice = createSlice({
  // Bu slice'ın ismi "urun" - action'lar "urun/" ile başlar
  name: 'urun',
  
  // Ürünlerle ilgili tüm state'ler
  initialState: {
    liste: [
      { id: 1, isim: 'Laptop', fiyat: 15000, stok: 5 },
      { id: 2, isim: 'Mouse', fiyat: 500, stok: 20 }
    ],
    seciliKategori: 'elektronik',
    yukleniyor: false,
    hataMesaji: null,
    aramaKelimesi: ''
  },
  
  reducers: {
    urunEkle: (state, action) => {
      // action.payload = { id: 3, isim: 'Klavye', fiyat: 800, stok: 10 }
      state.liste.push(action.payload);
    },
    urunSil: (state, action) => {
      // action.payload = ürün id'si (direkt sayı)
      state.liste = state.liste.filter(urun => urun.id !== action.payload);
    },
    stokGuncelle: (state, action) => {
      // action.payload = { id: 1, yeniStok: 3 } (nesne)
      const urun = state.liste.find(u => u.id === action.payload.id);
      if (urun) {
        urun.stok = action.payload.yeniStok;
      }
    },
    kategoriSec: (state, action) => {
      state.seciliKategori = action.payload;
    },
    aramaYap: (state, action) => {
      state.aramaKelimesi = action.payload;
    },
    yukleniyorDurumu: (state, action) => {
      state.yukleniyor = action.payload;
    }
  }
});

export const { 
  urunEkle, urunSil, stokGuncelle, 
  kategoriSec, aramaYap, yukleniyorDurumu 
} = urunSlice.actions;

export default urunSlice.reducer;
```

### 3.3. action.payload Yapısı: Direkt Değer mi, Nesne mi?

Yukarıdaki `urunSlice` reducer'larında `action.payload`'ın yapısının farklı olduğuna dikkat edin:

| Reducer | action.payload Yapısı | Dispatch Kullanımı |
|---------|----------------------|-------------------|
| `urunSil` | Direkt değer (sayı) | `dispatch(urunSil(3))` |
| `stokGuncelle` | Nesne `{ id, yeniStok }` | `dispatch(stokGuncelle({ id: 1, yeniStok: 3 }))` |
| `urunEkle` | Nesne `{ id, isim, fiyat, stok }` | `dispatch(urunEkle({ id: 3, isim: 'Klavye', ... }))` |

**Neden farklı?**

- `urunSil` yalnızca tek bir bilgiye ihtiyaç duyar (ürün ID'si), bu yüzden direkt sayı olarak gönderilir ve `action.payload` ile erişilir.
- `stokGuncelle` ise birden fazla bilgiye ihtiyaç duyar (hangi ürün + yeni stok değeri), bu yüzden nesne olarak gönderilir ve `action.payload.id`, `action.payload.yeniStok` ile erişilir.

```javascript
// urunSil - Direkt değer
dispatch(urunSil(3));
// reducer içinde: action.payload → 3

// stokGuncelle - Nesne
dispatch(stokGuncelle({ id: 1, yeniStok: 3 }));
// reducer içinde: action.payload → { id: 1, yeniStok: 3 }
// action.payload.id → 1
// action.payload.yeniStok → 3

// urunEkle - Nesne
dispatch(urunEkle({ id: 3, isim: 'Klavye', fiyat: 800, stok: 10 }));
// reducer içinde: action.payload → { id: 3, isim: 'Klavye', fiyat: 800, stok: 10 }
```

**Tutarlılık İçin Alternatif Yaklaşımlar:**

```javascript
reducers: {
  // Seçenek 1: Hepsi nesne olarak (daha tutarlı)
  urunSil: (state, action) => {
    // action.payload = { id: 3 }
    state.liste = state.liste.filter(urun => urun.id !== action.payload.id);
  },
  
  // Seçenek 2: Destructuring ile daha okunabilir
  stokGuncelle: (state, action) => {
    const { urunId, yeniStok } = action.payload;
    const urun = state.liste.find(u => u.id === urunId);
    if (urun) urun.stok = yeniStok;
  }
}
```

Her iki yaklaşım da çalışır. Önemli olan, ekipteki herkesin aynı convention'ı takip etmesidir.

### 3.4. Store Yapılandırması (store/index.js)

```javascript
import { configureStore } from '@reduxjs/toolkit';
import kullaniciReducer from './kullaniciSlice';
import urunReducer from './urunSlice';

// Store'u yapılandır
export const store = configureStore({
  reducer: {
    // "kullanici" ve "urun" isimleri çok önemli!
    // Bu isimler useSelector'da kullanılacak
    kullanici: kullaniciReducer,  // state.kullanici ile erişilir
    urun: urunReducer             // state.urun ile erişilir
  }
});

// Oluşan store yapısı:
/*
{
  kullanici: {
    isim: 'Misafir',
    email: '',
    yas: 25,
    girisYapmisMi: false,
    yetkiler: ['okuma']
  },
  urun: {
    liste: [...],
    seciliKategori: 'elektronik',
    yukleniyor: false,
    hataMesaji: null,
    aramaKelimesi: ''
  }
}
*/
```

---

## 4. useDispatch ve useSelector Detaylı Açıklama

### 4.1. useDispatch - Action Gönderme Aracı

```javascript
import { useDispatch } from 'react-redux';
import { girisYap, cikisYap } from '../store/kullaniciSlice';
import { urunEkle, kategoriSec } from '../store/urunSlice';

function KullaniciIslemleri() {
  // useDispatch hook'u bize dispatch fonksiyonunu verir
  const dispatch = useDispatch();
  
  const handleGiris = () => {
    // dispatch ile action gönderilir
    dispatch(girisYap({ 
      isim: 'Ali', 
      email: 'ali@mail.com' 
    }));
    // store güncellenir: kullanici.isim = 'Ali', kullanici.email = 'ali@mail.com'
  };
  
  const handleCikis = () => {
    dispatch(cikisYap());
    // store güncellenir: kullanici.isim = 'Misafir', kullanici.email = ''
  };
  
  return (
    <div>
      <button onClick={handleGiris}>Giriş Yap</button>
      <button onClick={handleCikis}>Çıkış Yap</button>
    </div>
  );
}
```

### 4.2. useSelector - Store'dan Veri Okuma Aracı

```javascript
import { useSelector } from 'react-redux';

function ProfilKarti() {
  // useSelector: store'dan istediğimiz veriyi seçip alırız
  
  // Tek bir değer okuma
  const isim = useSelector(state => state.kullanici.isim);
  
  // Birden fazla değer okuma
  const { email, yas, girisYapmisMi } = useSelector(
    state => state.kullanici
  );
  
  // Farklı slice'lardan veri okuma
  const urunSayisi = useSelector(state => state.urun.liste.length);
  const seciliKategori = useSelector(state => state.urun.seciliKategori);
  
  // Koşullu okuma
  const adminMi = useSelector(state => 
    state.kullanici.yetkiler.includes('admin')
  );
  
  return (
    <div>
      <h2>{isim}</h2>
      <p>Email: {email}</p>
      <p>Yaş: {yas}</p>
      <p>Giriş: {girisYapmisMi ? 'Evet' : 'Hayır'}</p>
      <p>Ürün Sayısı: {urunSayisi}</p>
      <p>Kategori: {seciliKategori}</p>
      {adminMi && <button>Admin Paneli</button>}
    </div>
  );
}
```

---

## 5. İsimlendirmelerin Önemi

### 5.1. Slice'daki `name` Alanı Ne İşe Yarar?

`name` değeri Redux Toolkit'te birkaç kritik işlevi yerine getirir:

**a) Action Types'ların Otomatik Oluşturulması**

`name` değeri, tüm action'ların ön ekini (prefix) oluşturur:

```javascript
const kullaniciSlice = createSlice({
  name: 'kullanici',  // Tüm action'lar "kullanici/" ile başlar
  ...
});

console.log(girisYap.type);    // "kullanici/girisYap"
console.log(cikisYap.type);    // "kullanici/cikisYap"
console.log(yasGuncelle.type); // "kullanici/yasGuncelle"

// Redux DevTools'da göreceğiniz action isimleri:
// { type: "kullanici/girisYap", payload: {...} }
// { type: "kullanici/cikisYap" }
```

**b) State'in Hangi Slice'a Ait Olduğunu Belirleme**

Store'u oluştururken hangi state'in hangi reducer'a ait olduğunu belirtir:

```javascript
const store = configureStore({
  reducer: {
    urun: urunReducer,        // "urun" anahtarı altında tutulur
    sepet: sepetReducer,       // "sepet" anahtarı altında tutulur
    kullanici: kullaniciReducer // "kullanici" anahtarı altında tutulur
  }
});

// Oluşan state yapısı:
// {
//   urun: { liste: [...], seciliKategori: '...', ... },
//   sepet: { ... },
//   kullanici: { isim: '...', email: '...', ... }
// }
```

**c) Selector'larda Kullanım**

```javascript
const urunState = useSelector(state => state.urun);           // "urun" slice'ının tamamı
const urunListesi = useSelector(state => state.urun.liste);   // "urun" slice'ından liste
```

**d) Debug ve DevTools'da Gruplandırma**

Birden fazla slice'ta aynı isimde reducer olsa bile `name` sayesinde ayırt edilir:

```javascript
// Redux DevTools'da action'ları izlerken:
// "urun/listele"      → Hangi slice'dan geldiği belli
// "kullanici/listele" → Farklı bir slice, aynı action ismi
// "sepet/urunEkle"    → Sepet slice'ından gelen action
```

### 5.2. Store'daki İsimler Ne İşe Yarar?

```javascript
export const store = configureStore({
  reducer: {
    kullanici: kullaniciReducer,  // Bu isim useSelector'da kullanılır
    urun: urunReducer              // Bu isim useSelector'da kullanılır
  }
});

// Bu isimler useSelector'da state'in anahtarları olur:
const kullaniciState = useSelector(state => state.kullanici); // Doğru
const urunState = useSelector(state => state.urun);           // Doğru

// Yanlış isim kullanımı:
const yanlis = useSelector(state => state.user); // undefined (kullanici olmalıydı)
```

---

## 6. Gerçek Kullanım Örneği

### components/UrunYonetimi.jsx

```javascript
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { urunEkle, urunSil, kategoriSec } from '../store/urunSlice';
import { yasGuncelle } from '../store/kullaniciSlice';

function UrunYonetimi() {
  const dispatch = useDispatch();
  
  // useSelector ile verileri oku
  const urunler = useSelector(state => state.urun.liste);
  const kategori = useSelector(state => state.urun.seciliKategori);
  const kullaniciAdi = useSelector(state => state.kullanici.isim);
  const kullaniciYas = useSelector(state => state.kullanici.yas);
  
  const handleYeniUrun = () => {
    // dispatch ile action gönder
    dispatch(urunEkle({
      id: 3,
      isim: 'Klavye',
      fiyat: 800,
      stok: 10
    }));
  };
  
  const handleKategoriDegistir = (yeniKategori) => {
    dispatch(kategoriSec(yeniKategori));
  };
  
  const handleYasGuncelle = () => {
    dispatch(yasGuncelle(30));
  };
  
  return (
    <div>
      <h2>{kullaniciAdi}'nin Ürünleri</h2>
      <p>Yaş: {kullaniciYas}</p>
      <button onClick={handleYasGuncelle}>Yaşı Güncelle</button>
      
      <h3>Kategori: {kategori}</h3>
      <button onClick={() => handleKategoriDegistir('bilgisayar')}>
        Bilgisayar
      </button>
      <button onClick={() => handleKategoriDegistir('elektronik')}>
        Elektronik
      </button>
      
      <h3>Ürün Listesi ({urunler.length} ürün)</h3>
      {urunler.map(urun => (
        <div key={urun.id}>
          <span>{urun.isim} - {urun.fiyat} TL</span>
          <button onClick={() => dispatch(urunSil(urun.id))}>Sil</button>
        </div>
      ))}
      
      <button onClick={handleYeniUrun}>Yeni Ürün Ekle</button>
    </div>
  );
}
```

---

## 7. Özet Tablosu

| Kavram | Görevi | Kullanım Şekli | Örnek |
|--------|--------|----------------|-------|
| **createSlice** | State + Reducer + Action oluşturur | `createSlice({ name, initialState, reducers })` | `const userSlice = createSlice(...)` |
| **name** | Slice'ın ismi, action'lara önek olur | `name: 'kullanici'` | Action: `"kullanici/girisYap"` |
| **initialState** | Başlangıç değerleri | Çoklu state tanımı | `{ isim: '', yas: 0, liste: [] }` |
| **reducers** | State'i güncelleyen fonksiyonlar | `artir: (state) => { }` | State.değer değiştirilir |
| **actions** | Otomatik oluşan action'lar | `slice.actions` | `girisYap, cikisYap` |
| **reducer** | Store'a eklenecek ana fonksiyon | `slice.reducer` | Store'a eklenir |
| **configureStore** | Store'u oluşturur | `configureStore({ reducer })` | Tüm reducer'lar birleşir |
| **useSelector** | Store'dan veri okur | `useSelector(state => state.anahtar)` | `state.kullanici.isim` |
| **useDispatch** | Action gönderir | `const dispatch = useDispatch()` | `dispatch(girisYap())` |
| **state.anahtar** | Store'daki slice ismi | `state.kullanici` | `kullanici` reducer isminden gelir |

---

## 8. Önemli Noktalar

- **Slice name**: Action'ları gruplar, DevTools'da hangi slice'dan geldiğini gösterir ve takibi kolaylaştırır
- **Store anahtarları**: useSelector'da kullanılacak isimlerdir, yanlış yazarsanız `undefined` döner
- **useSelector**: Sadece ihtiyacın olan veriyi seç, gereksiz render önle
- **useDispatch**: Her component'te kullanılabilir, store'a action gönderir
- **Birden çok state**: initialState içinde dilediğin kadar state tanımlayabilirsin
- **Çoklu slice**: Farklı özellikler için ayrı slice'lar oluştur, store'da birleştir
- **action.payload**: Tek değer gönderilecekse direkt değer, birden fazla bilgi gönderilecekse nesne olarak dispatch edilir
