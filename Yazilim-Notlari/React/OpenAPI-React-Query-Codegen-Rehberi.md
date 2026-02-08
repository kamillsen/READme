# OpenAPI React Query Codegen + TanStack Query: Tam Rehber

## 📌 Temel Kavram: "El Aleti" vs "Fabrika"

### **TanStack Query (React Query v5)**
> **El aleti seti** - Data fetching için güçlü araçlar

### **OpenAPI React Query Codegen**
> **Fabrika** - Bu araçları otomatik üreten makine

---

## 🔄 İkili İlişki

```
OpenAPI Spec (Backend'den) 
      ↓
OpenAPI React Query Codegen (Fabrika)
      ↓
TanStack Query Hook'ları (Hazır El Aletleri)
      ↓
Senin React Uygulaman (Kullanım)
```

---

## 🎯 Gerçek Hayat Senaryosu: E-Ticaret Sitesi

### **Backend'den Gelen API Listesi:**
```json
{
  "endpoints": [
    "GET    /products",
    "GET    /products/{id}",
    "POST   /orders",
    "GET    /users/{id}",
    "PUT    /users/{id}",
    "DELETE /products/{id}"
  ]
}
```

---

## 🛠️ 1. YOL: Sadece TanStack Query (Manuel)

### **Problem: Her Şeyi Elle Yazmak Zorundasın**

```typescript
// 1. Ürünleri listeleme hook'unu elle yaz
const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('https://api.site.com/products');
      if (!response.ok) throw new Error('Hata!');
      return response.json();
    }
  });
};

// 2. Tek ürün getirme hook'unu elle yaz
const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const response = await fetch(`https://api.site.com/products/${id}`);
      return response.json();
    }
  });
};

// 3. Sipariş oluşturma hook'unu elle yaz
const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (orderData) => {
      const response = await fetch('https://api.site.com/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      return response.json();
    }
  });
};

// VE DAHA 20 TANE DAHA YAZACAKSIN...
```

### **Manuel Yolun Dezavantajları:**
- ✅ Çalışıyor
- ❌ Çok zaman alıyor
- ❌ Hata yapma riski yüksek
- ❌ API değişince tüm hook'ları güncellemen gerekiyor
- ❌ Tip güvenliği için ekstra çaba

---

## ⚡ 2. YOL: İkisini Birlikte Kullanmak (Otomatik)

### **Adım 1: Backend'den OpenAPI Spec Al**
```yaml
# openapi.yaml
paths:
  /products:
    get:
      summary: Ürünleri listele
  /products/{id}:
    get:
      summary: Tek ürün getir
  /orders:
    post:
      summary: Sipariş oluştur
```

### **Adım 2: Codegen'i Çalıştır**
```bash
# Terminalde tek komut:
npx openapi-react-query-codegen \
  --input openapi.yaml \
  --output ./src/api \
  --client axios
```

### **Adım 3: Otomatik Oluşan Kodları Kullan**

```typescript
// src/api/index.ts (OTOMATİK OLUŞTU - BEN YAZMADIM!)

// API Client otomatik oluştu
const apiClient = {
  getProducts: () => axios.get('/products'),
  getProductById: (id: number) => axios.get(`/products/${id}`),
  createOrder: (data: Order) => axios.post('/orders', data)
};

// TanStack Query hook'ları otomatik oluştu
export const useGetProducts = () => 
  useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.getProducts()
  });

export const useGetProductById = (id: number) => 
  useQuery({
    queryKey: ['products', id],
    queryFn: () => apiClient.getProductById(id)
  });

export const useCreateOrder = () => 
  useMutation({
    mutationFn: apiClient.createOrder
  });
```

### **Adım 4: Senin Kodun (Artık Hiçbir Şey Yazmana Gerek Yok!)**

```typescript
import React from 'react';
import {
  useGetProducts,
  useGetProductById,
  useCreateOrder
} from './api'; // OTOMATİK OLUŞAN HOOK'LAR

function ProductPage() {
  // 1. Tüm ürünleri getir (OTOMATİK HOOK)
  const { data: products, isLoading } = useGetProducts();
  
  // 2. Tek ürün getir (OTOMATİK HOOK)
  const { data: product } = useGetProductById(123);
  
  // 3. Sipariş oluştur (OTOMATİK HOOK)
  const { mutate: createOrder } = useCreateOrder();
  
  const handleOrder = () => {
    createOrder({ 
      productId: 123, 
      quantity: 2 
    });
  };
  
  if (isLoading) return <div>Yükleniyor...</div>;
  
  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={handleOrder}>
        Sipariş Ver
      </button>
    </div>
  );
}
```

---

## 📊 Karşılaştırma Tablosu

| Özellik | Sadece TanStack Query | TanStack Query + Codegen |
|---------|----------------------|--------------------------|
| **Kurulum Zamanı** | 50 endpoint = 5-10 saat | 50 endpoint = 5 dakika |
| **API Değişikliği** | Tüm hook'ları elle güncelle | Codegen'i tekrar çalıştır |
| **Tip Güvenliği** | Manuel Typescript yaz | Otomatik oluşur |
| **Hata Riski** | Yüksek (manuel yazım) | Düşük (otomatik) |
| **Bakım** | Zor ve zaman alıcı | Kolay ve hızlı |

---

## 🎬 En Büyük Avantaj: API Değişince

### **Eski Yöntem (Felaket):**
```typescript
// Backend: /products yerine /items kullanmaya başladı

// Şimdi PROJEDE TÜM BU KODLARI BUL:
const useProducts = () => useQuery({
  queryFn: () => fetch('/products') // ✗ ESKİ
  // 1. Burayı /items yap
});

const useProduct = (id) => useQuery({
  queryFn: () => fetch(`/products/${id}`) // ✗ ESKİ
  // 2. Bunu da değiştir
});

// 20 farklı dosyada, 50 farklı hook'ta...
// ↳ TÜMÜNÜ TEK TEK BUL VE DEĞİŞTİR!
```

### **Codegen ile (Kurtarıcı):**
```bash
# 1. Backend'den yeni OpenAPI spec al
# 2. Terminalde TEK KOMUT:
npx openapi-react-query-codegen --input openapi.json

# 3. BİTTİ! 
# Tüm hook'lar otomatik olarak güncellendi!
# /products → /items dönüşümü TAMAMLANDI!
```

---

## 🚀 Ne Zaman Hangi Yöntemi Seçmeli?

### **Sadece TanStack Query Kullan:**
- Küçük projeler (5-10 endpoint)
- Prototip / demo uygulamalar
- API'n çok basit ve stabilse
- Backend OpenAPI spec sağlamıyorsa

### **İkisini Birlikte Kullan:**
- Büyük kurumsal projeler
- 20+ endpoint varsa
- Backend sık değişiyorsa
- Takım çalışması yapıyorsan
- Tip güvenliği önemliyse

---

## 💡 Pratik Örnek: 1 Dakikada API Entegrasyonu

```bash
# Adım 1: Backend'den spec'i al
curl https://api.ornek.com/openapi.json > openapi.json

# Adım 2: Codegen'i çalıştır
npx openapi-react-query-codegen --input openapi.json

# Adım 3: Hemen kullanmaya başla!
```

```typescript
// HAZIR! Artık tüm API hook'ların hazır:
import { 
  useGetUsers,        // ✅
  useCreateUser,      // ✅
  useUpdateUser,      // ✅
  useDeleteUser,      // ✅
  useGetProducts,     // ✅
  useCreateOrder      // ✅
} from './generated-api';

// Hiçbir şey yazmadan direk kullan!
```

---

## 📝 Özet

### **TanStack Query = Motor**
- Data fetching, cache, state yönetimi
- Güçlü ama manuel kullanım gerektiriyor

### **OpenAPI Codegen = Otomatik Şanzıman**
- TanStack Query için hazır hook'lar üretiyor
- Backend spec'inden otomatik kod oluşturuyor

### **İkisi Birlikte = Mükemmel Kombinasyon**
- Geliştirme hızı ×10
- Hata riski ÷10
- Bakım kolaylığı ×100

---

## 🎯 Sonuç

**Kod yazmak yerine, kod yazdıran bir sistem kullanıyorsun.**  
Backend API'yi değiştir, codegen'i çalıştır, tüm frontend hook'ların otomatik güncellensin.  
**Zaman kaybetme, otomatikleştir!** 🚀
