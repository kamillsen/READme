# gRPC Nedir? (.NET) — Kısa Not

## Tanım

**gRPC**, uygulamaların birbirlerinin fonksiyonlarını **uzaktan çağırmasını (RPC)** sağlayan, modern ve yüksek performanslı bir iletişim yaklaşımıdır. Servisler arası iletişimde genellikle **HTTP/2** üzerinde çalışır ve mesaj formatı olarak çoğunlukla **Protocol Buffers (protobuf)** kullanır (JSON yerine ikili/binary). Bu da daha hızlı iletişim ve daha küçük payload anlamına gelir.

---

## Çalışma Mekanizması (Nasıl çalışır?)

1. **Kontrat tanımı**: Servislerin hangi metotları sunduğu ve request/response mesajları bir **`.proto`** dosyasında tanımlanır.
2. **Kod üretimi**: `.proto` dosyasından her dil için (C#, Java, Go vb.) otomatik **client/server stub** kodları üretilir.
3. **Çağrı**: İstemci (ör. Basket Service), üretilen client ile metodu çağırır; sunucu (ör. Discount Service) bu çağrıyı karşılar.
4. **Taşıma**: HTTP/2 sayesinde tek bağlantı üzerinden verimli iletişim (multiplexing), düşük gecikme ve streaming mümkün olur.

### İletişim Tipleri

* **Unary**: 1 istek → 1 cevap (REST'e en yakın)
* **Server streaming**: 1 istek → çok cevap
* **Client streaming**: çok istek → 1 cevap
* **Bidirectional streaming**: çift yönlü sürekli akış

---

## gRPC Çalışma Akışı (ASCII Diagram)

### Temel Akış

```
┌─────────────────┐                    ┌─────────────────┐
│  Client Service │                    │  Server Service │
│  (Basket)       │                    │  (Discount)    │
└────────┬────────┘                    └────────┬────────┘
         │                                        │
         │  1. .proto dosyasından                │
         │     client stub üretilir              │
         │                                        │
         │  2. GetDiscount(request)              │
         │     ────────────────────────────────>│
         │     [HTTP/2 + Protobuf]               │
         │                                        │
         │                                        │  3. Server stub
         │                                        │     metodu işler
         │                                        │
         │  4. DiscountResponse                  │
         │     <────────────────────────────────  │
         │     [HTTP/2 + Protobuf]               │
         │                                        │
```

### .proto Dosyası ve Kod Üretimi

```
┌─────────────────────────────────────────────────────────┐
│                    discount.proto                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │ service DiscountService {                         │  │
│  │   rpc GetDiscount(GetDiscountRequest)             │  │
│  │       returns (DiscountResponse);                 │  │
│  │ }                                                  │  │
│  │                                                    │  │
│  │ message GetDiscountRequest {                      │  │
│  │   string productId = 1;                           │  │
│  │   int32 quantity = 2;                             │  │
│  │ }                                                  │  │
│  │                                                    │  │
│  │ message DiscountResponse {                        │  │
│  │   double discount = 1;                            │  │
│  │   string reason = 2;                              │  │
│  │ }                                                  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        │ Grpc.Tools
                        │ (build-time)
                        ▼
        ┌───────────────────────────────┐
        │   Otomatik Kod Üretimi        │
        ├───────────────────────────────┤
        │ • DiscountServiceClient.cs    │
        │ • DiscountServiceBase.cs      │
        │ • GetDiscountRequest.cs       │
        │ • DiscountResponse.cs         │
        └───────────────────────────────┘
```

### İletişim Tipleri Karşılaştırması

#### 1. Unary (Tek İstek - Tek Cevap)
```
Client                    Server
  │                         │
  │─── Request ────────────>│
  │                         │
  │                         │ (işlem)
  │                         │
  │<── Response ────────────│
  │                         │
```

#### 2. Server Streaming (Tek İstek - Çok Cevap)
```
Client                    Server
  │                         │
  │─── Request ────────────>│
  │                         │
  │<── Response 1 ──────────│
  │<── Response 2 ──────────│
  │<── Response 3 ──────────│
  │<── ... ─────────────────│
  │                         │
```

#### 3. Client Streaming (Çok İstek - Tek Cevap)
```
Client                    Server
  │                         │
  │─── Request 1 ───────────>│
  │─── Request 2 ───────────>│
  │─── Request 3 ───────────>│
  │─── ... ──────────────────>│
  │                         │
  │                         │ (işlem)
  │                         │
  │<── Response ────────────│
  │                         │
```

#### 4. Bidirectional Streaming (Çift Yönlü Akış)
```
Client                    Server
  │                         │
  │─── Request 1 ───────────>│
  │<── Response 1 ───────────│
  │─── Request 2 ───────────>│
  │<── Response 2 ───────────│
  │─── Request 3 ───────────>│
  │<── Response 3 ───────────│
  │      ...                 │
  │                         │
```

### Mikroservis Mimarisi Örneği

```
┌─────────────────────────────────────────────────────────────┐
│                    Mikroservis Ekosistemi                    │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Basket     │      │   Discount   │      │   Catalog    │
│   Service    │      │   Service    │      │   Service    │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │  gRPC               │  gRPC               │
       │  (HTTP/2)           │  (HTTP/2)           │
       │                     │                     │
       └─────────────────────┴─────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   API Gateway   │
                    │   (REST/gRPC)   │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │   Client Apps   │
                    │  (Web/Mobile)   │
                    └─────────────────┘

Not: İç servisler arası → gRPC (yüksek performans)
     Dış dünyaya açık  → REST (geniş uyumluluk)
```

### HTTP/2 vs HTTP/1.1 Karşılaştırması

```
HTTP/1.1 (REST):
┌─────────┐
│ Request │───┐
└─────────┘   │
              │ Her istek için
┌─────────┐   │ yeni bağlantı
│ Request │───┤ (overhead)
└─────────┘   │
              │
┌─────────┐   │
│ Request │───┘
└─────────┘

HTTP/2 (gRPC):
┌─────────┐
│ Request │───┐
└─────────┘   │
              │ Tek bağlantı
┌─────────┐   │ üzerinden
│ Request │───┤ multiplexing
└─────────┘   │ (verimli)
              │
┌─────────┐   │
│ Request │───┘
└─────────┘
```

---

## Mikroservislerde neden / ne zaman kullanılır?

### Neden kullanılır?

* Mikroservislerde servisler arası çağrılar çok sık olur; gRPC **performans + tip güvenliği + kontrat disiplinini** güçlendirir.
* `.proto` ile "herkesin aynı sözleşmeye uyması" sağlanır; istemci/sunucu uyumsuzlukları azalır.

### Ne zaman tercih edilir?

* **Servisten servise (internal) iletişim**: Basket → Discount gibi
* **Düşük gecikme / yüksek trafik** gerektiren çağrılar
* **Streaming** gereken senaryolar: canlı fiyat/kur güncelleme, telemetry, event akışları, chat benzeri kanallar
* Çoklu dil ekosistemi varsa (polyglot): aynı `.proto` ile tüm dillerde client üretmek kolaydır

### Ne zaman REST daha mantıklı olabilir?

* **Dış dünyaya açık Public API** (tarayıcı/insan tüketimi, kolay debug, yaygın tooling)
* Basit CRUD + cache/CDN avantajı gereken durumlar
* Organizasyon gRPC ekosistemine hazır değilse (operasyonel yük)

---

## .NET tarafında sık kullanılan paketler

> (ASP.NET Core modern stack için)

* **Server**: `Grpc.AspNetCore`
* **Client**: `Grpc.Net.Client`
* **Code generation / Protobuf**: `Grpc.Tools` (genelde build-time)
* **Protobuf runtime**: `Google.Protobuf`

Ek olarak (yaygın ihtiyaçlar):

* **Gateway / JSON transcoding** (REST gibi sunmak istersen): `Microsoft.AspNetCore.Grpc.JsonTranscoding`
* **Browser senaryoları** için: gRPC-Web desteği (projeye göre eklenir)

---

## Avantajlar

* **Yüksek performans**: protobuf + HTTP/2 ile küçük payload, düşük gecikme
* **Tip güvenliği ve kontrat**: `.proto` ile net, versionable sözleşme
* **Otomatik client üretimi**: el ile "DTO + endpoint" yazma azalır
* **Streaming desteği**: gerçek zamanlı akışlar çok daha doğal
* **Çoklu dil desteği**: aynı kontratla farklı dillerde sorunsuz entegrasyon

---

## Dezavantajlar / Dikkat Edilecekler

* **Debug/izleme REST kadar "görsel" değil**: JSON gibi kolay okunmaz (binary), tooling gerekir
* **Tarayıcı desteği**: klasik gRPC doğrudan browser'da zor; genelde **gRPC-Web** veya başka katman gerekir
* **Operasyonel karmaşıklık**: HTTP/2, TLS, load balancer/proxy uyumu, observability (tracing/metrics) ayarı gerekir
* **Kamuya açık API ekosistemi**: REST kadar yaygın "her yerde çalışır" beklentisi yok
* **Sürüm yönetimi disiplin ister**: `.proto` alan numaraları, backward compatibility kuralları takip edilmeli

---

## Özet karar rehberi

* **İç mikroservis çağrıları**, yüksek performans ve kontrat disiplini istiyorsan: **gRPC**
* **Dış müşterilere/partnerlere açık API**, geniş uyumluluk ve kolay tüketim istiyorsan: **REST**
* **Gerçek zamanlı akış** gerekiyorsa: gRPC streaming çoğu zaman çok iyi bir seçenek

---

## Örnek Kullanım Senaryosu

### Senaryo: E-ticaret Mikroservis Mimarisi

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ REST/HTTP
       ▼
┌─────────────────┐
│   API Gateway    │  ← Dış dünyaya REST
│  (REST → gRPC)   │
└────────┬─────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
    ▼         ▼          ▼          ▼
┌──────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Basket│ │Discount│ │Catalog │ │Payment │
│Service│ │Service │ │Service │ │Service │
└───┬──┘ └────┬───┘ └────┬───┘ └────┬───┘
    │         │          │          │
    └─────────┴──────────┴──────────┘
              │
         gRPC (HTTP/2)
    (İç servisler arası)
```

**Karar Matrisi:**
- **API Gateway → Client**: REST (geniş uyumluluk, kolay debug)
- **Basket → Discount**: gRPC (yüksek performans, tip güvenliği)
- **Basket → Catalog**: gRPC (sık çağrı, düşük gecikme)
- **Payment → External**: REST (dış sistem entegrasyonu)

---

## Protobuf vs JSON Karşılaştırması

```
JSON (REST):
{
  "productId": "12345",
  "quantity": 10,
  "price": 99.99
}
→ ~50 bytes (text format)

Protobuf (gRPC):
[0A 05 31 32 33 34 35 10 0A 1D 00 00 C8 42]
→ ~14 bytes (binary format)

Sonuç: Protobuf %70+ daha küçük payload
       → Daha hızlı transfer
       → Daha az bant genişliği
       → Daha düşük gecikme
```

