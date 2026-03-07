# React Hook'ları - beyond-review-webapp

## React Built-in Hook'ları


| Hook            | Açıklama                                | Not |
| --------------- | --------------------------------------- | --- |
| `useState`      | State yönetimi                          | ✅  |
| `useEffect`     | Side effect yönetimi                    | ✅  |
| `useRef`        | DOM referansı / mutable değer           |     |
| `useCallback`   | Fonksiyon memoization                   | ✅  |
| `useMemo`       | Değer memoization                       | ✅  |
| `useOptimistic` | Optimistic UI güncellemeleri (React 19) |     |
| `useTransition` | Non-blocking state güncellemeleri       |     |


## Next.js Hook'ları


| Hook              | Açıklama                | Not |
| ----------------- | ----------------------- | --- |
| `useRouter`       | Sayfa yönlendirme       |     |
| `useParams`       | URL parametreleri       | ✅  |
| `usePathname`     | Aktif URL path          |     |
| `useSearchParams` | URL query parametreleri |     |


## Redux Hook'ları


| Hook             | Açıklama                        | Not |
| ---------------- | ------------------------------- | --- |
| `useDispatch`    | Redux dispatch                  |     |
| `useSelector`    | Redux state okuma               |     |
| `useAppDispatch` | Typed dispatch (custom wrapper) |     |
| `useAppSelector` | Typed selector (custom wrapper) |     |


## NextAuth Hook'ları


| Hook         | Açıklama       | Not |
| ------------ | -------------- | --- |
| `useSession` | Oturum bilgisi |     |


## React Hook Form


| Hook      | Açıklama      | Not |
| --------- | ------------- | --- |
| `useForm` | Form yönetimi |     |


## Projede Tanımlı Custom Hook'lar


| Hook                       | Açıklama                     | Not |
| -------------------------- | ---------------------------- | --- |
| `useExport`                | Eleman export/indirme işlemi |     |
| `useDebounce`              | Debounce değer yönetimi      |     |
| `useScrollDirection`       | Scroll yönü takibi           |     |
| `useResponseModeSelection` | Yanıt modu seçimi            |     |
| `useVoiceTone`             | Ses tonu seçimi              |     |


## Özet

- **7** React built-in hook
- **4** Next.js hook
- **4** Redux hook
- **1** NextAuth hook
- **1** React Hook Form hook
- **5** Custom hook

---

# Detaylı Hook Notları

---

## useState

**Mantık:** Fonksiyonel bileşenlerde state (durum) tutmamızı sağlar. State değiştiğinde bileşen yeniden render edilir.

**Kullanım Senaryosu:** Kullanıcı giriş formu, sayaç, toggle butonları

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(true);

  return (
    <div>
      <p>Sayı: {count}</p>
      <button onClick={() => setCount(count + 1)}>Arttır</button>
      <button onClick={() => setIsActive(!isActive)}>
        {isActive ? 'Aktif' : 'Pasif'}
      </button>
    </div>
  );
}
```

---

## useEffect

**Mantık:** Bileşen render edildikten sonra çalışan yan etkileri (side effects) yönetir. API çağrıları, event listener'lar, DOM manipülasyonları için kullanılır.

**Kullanım Senaryosu:** Veri çekme, localStorage senkronizasyonu, sayfa başlığı güncelleme

```jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Component mount olduğunda ve userId değiştiğinde çalışır
    async function fetchUser() {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
      setLoading(false);
    }

    fetchUser();

    // Cleanup fonksiyonu (opsiyonel)
    return () => {
      console.log('Temizlik yapılıyor...');
    };
  }, [userId]); // Sadece userId değişirse tekrar çalış

  if (loading) return <div>Yükleniyor...</div>;
  return <div>{user?.name}</div>;
}
```

---

## useCallback

**Mantık:** Fonksiyonları memorize eder. Bağımlılıklar değişmedikçe aynı fonksiyon referansını döndürür. `memo` ile birlikte gereksiz render'ları engeller.

**Kullanım Senaryosu:** Child component'lere geçirilen callback'ler, performans optimizasyonu

```jsx
import { useState, useCallback, memo } from 'react';

// memo: Prop'lar değişmezse tekrar render edilmez
const SearchButton = memo(({ onSearch }) => {
  console.log('SearchButton render edildi');
  return <button onClick={onSearch}>Ara</button>;
});

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // useCallback: Fonksiyonu hafızada tut, sadece query değişirse yeniden oluştur
  const handleSearch = useCallback(async () => {
    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    setResults(data);
  }, [query]); // query değişirse yeni fonksiyon oluşur

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {/* 
        handleSearch değişmediği sürece SearchButton render edilmez 
        AMA query her değiştiğinde handleSearch yeniden oluşur,
        bu yüzden SearchButton her seferinde render olur!
      */}
      <SearchButton onSearch={handleSearch} />
    </div>
  );
}
```

> **Özet:**
> - `useCallback` → Fonksiyonları memorize eder
> - `memo` → Component'leri memorize eder
> - İkisi birlikte gereksiz render'ları engeller
> - Bu örnekte `query` bağımlılığı yüzünden tam optimizasyon yok

---

## useMemo

**Mantık:** Hesaplama sonuçlarını memorize eder. Bağımlılıklar değişmedikçe aynı değeri döndürür. Pahalı hesaplamalar için kullanılır.

**Kullanım Senaryosu:** Filtreleme/sıralama işlemleri, karmaşık veri dönüşümleri

```jsx
import { useState, useMemo } from 'react';

function ProductList({ products, searchTerm, sortOrder }) {
  // Pahalı bir işlem - her render'da tekrar hesaplanmasını istemeyiz
  const filteredAndSortedProducts = useMemo(() => {
    console.log('Filtreleme ve sıralama yapılıyor...');
    
    // Filtrele
    let filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sırala
    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.price - b.price;
      }
      return b.price - a.price;
    });

    return filtered;
  }, [products, searchTerm, sortOrder]); 
  // Bu değerler değişirse yeniden hesapla

  return (
    <ul>
      {filteredAndSortedProducts.map(product => (
        <li key={product.id}>
          {product.name} - {product.price} TL
        </li>
      ))}
    </ul>
  );
}
```

---

## useParams

> **Ön Koşul:** `useParams()` hook'unu kullanabilmek için projenin **Next.js App Router** yapısında olması gerekir. Bu hook, App Router'ın dosya tabanlı yönlendirme (file-based routing) sistemine bağlıdır. `pages/` klasörü ile çalışan eski Page Router'da bu hook kullanılamaz.

**Mantık:** URL'deki **dinamik segmentleri** (parametreleri) okumak için kullanılan Next.js hook'udur. Dosya adındaki `[parametre]` ile URL'deki değeri eşleştirir ve bize **string** olarak sunar.

**Kullanım Senaryosu:** Detay sayfaları (`/urun/123`), profil sayfaları (`/profil/me`), iç içe rotalar (`/blog/kategori/teknoloji/yazi/5`)

### Dosya Yapısı & Parametre İlişkisi

| Dosya Yolu | URL Örneği | `useParams()` Çıktısı |
|------------|------------|----------------------|
| `[roleId]/page.tsx` | `/roller/123` | `{ roleId: "123" }` |
| `[id]/page.tsx` | `/kullanici/42` | `{ id: "42" }` |
| `[slug]/page.tsx` | `/urun/iphone-12` | `{ slug: "iphone-12" }` |
| `[userId]/posts/[postId]/page.tsx` | `/users/5/posts/10` | `{ userId: "5", postId: "10" }` |

### Parametre İsimleri Dosya Adıyla Eşleşmeli

```typescript
// Dosya: [roleId]/page.tsx
const params = useParams<{ roleId: string }>(); // ✅ Doğru
const params = useParams<{ id: string }>();     // ❌ Yanlış (undefined döner)
const params = useParams<{ x: string }>();      // ❌ Anlamsız
```

**Kural:** Parametre ismi, dosya adındaki köşeli parantez içindeki isimle **birebir aynı** olmalı!

### useParams Her Zaman STRING Döndürür

```typescript
const { roleId } = useParams(); 
// roleId = "123" (string, number değil!)

// Sayıya çevirmek için:
const id = Number(roleId);           // 123
const id = parseInt(roleId, 10);     // 123
```

### ID'siz Sayfalarda (Liste Sayfaları)

```typescript
// /yetkilendirme/roller/page.tsx
const params = useParams();
console.log(params); // {} (BOŞ NESNE!)
```

Liste sayfalarında genelde **kullanılmaz**, çünkü URL'de dinamik segment yoktur.

### Güvenlik Kontrolü

```typescript
const { roleId } = useParams<{ roleId: string }>();

if (!Number.isFinite(Number(roleId))) {
  return <div>Geçersiz ID</div>;
}

const { data } = useGetRoleByIdQuery(Number(roleId));
```

### Pratik Kullanım Akışı

```typescript
function RoleDetailPage() {
  // 1. Parametreyi al
  const { roleId } = useParams<{ roleId: string }>();
  
  // 2. Güvenlik kontrolü yap
  if (!roleId || isNaN(Number(roleId))) {
    return <div>Geçersiz rol</div>;
  }
  
  // 3. API'ye gönder (number'a çevirerek)
  const { data } = useGetRoleByIdQuery(Number(roleId));
  
  // 4. useEffect'te kullan (değişimi izle)
  useEffect(() => {
    // roleId değişince tetiklenir
  }, [roleId]);
  
  // 5. UI'da kullan
  return <div>Rol: {data?.name}</div>;
}
```

### Sık Yapılan Hatalar

```typescript
// HATA 1: Tip uyuşmazlığı ❌
const roleId: number = useParams().roleId; // string number'a atanamaz

// HATA 2: Kontrolsüz kullanım ❌
fetch(`/api/roles/${roleId}`); // roleId undefined olabilir!

// HATA 3: Yanlış isimlendirme ❌
const { id } = useParams(); // Dosya [roleId] ise id = undefined

// DOĞRU KULLANIM ✅
const { roleId } = useParams<{ roleId: string }>();
const numericId = Number(roleId);
if (numericId) {
  fetch(`/api/roles/${numericId}`);
}
```

### Ne Zaman Kullanılır?

- ✅ Detay sayfalarında (`/urun/123`, `/kullanici/abc`)
- ✅ Profil sayfalarında (`/profil/me`)
- ✅ İç içe rotalarda (`/blog/kategori/teknoloji/yazi/5`)
- ❌ Liste sayfalarında genelde kullanılmaz

> **Özet:** `useParams()` = URL'den bilgi almanın en kolay yolu. Dosya adındaki `[parametre]` ile URL'deki değeri eşleştirir ve bize string olarak sunar. **Next.js App Router** ile dosya tabanlı yönlendirme yapılması ön koşuldur.

