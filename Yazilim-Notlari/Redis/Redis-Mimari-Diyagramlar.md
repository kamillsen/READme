# Redis Mimari Diyagramları

Redis'in bir projedeki konumu, görevi ve farklı senaryolardaki kullanımı.

---

## 1️⃣ Temel Cache Senaryosu (Cache-Aside Pattern)

Redis'in en yaygın kullanımı: uygulama ile veritabanı arasında cache katmanı.

```mermaid
graph TB
    subgraph ClientLayer[Client Layer]
        A[Web Browser / Mobile App / API Client]
    end
    
    subgraph ApplicationLayer[Application Layer]
        B[ASP.NET Core API - Business Logic]
    end
    
    subgraph CacheLayer[Cache Layer]
        C[Redis Cache - In-Memory Store - 1ms latency]
    end
    
    subgraph PersistenceLayer[Persistence Layer]
        D[SQL Server / PostgreSQL - Main Database]
    end
    
    A -->|HTTP-Request| B
    B -->|Check-Cache| C
    C -.->|3a. Cache Hit Return Data| B
    C -->|3b. Cache Miss| B
    B -->|Query-Database| D
    D -->|Return-Data| B
    B -->|Store-in-Cache| C
    B -->|HTTP-Response| A
    
    style C fill:#dc382d,color:#fff
    style D fill:#336791,color:#fff
    style B fill:#512bd4,color:#fff
```

**Akış:**
1. Client → API'ye istek gönderir
2. API → Önce Redis'te cache kontrolü yapar
3a. **Cache Hit:** Redis'te veri varsa → direkt döner (çok hızlı!)
3b. **Cache Miss:** Redis'te veri yoksa → veritabanına gider
4. Veritabanından veri çekilir
5. Veri hem API'ye döner hem de Redis'e yazılır (gelecek istekler için)
6. API → Client'a yanıt gönderir

---

## 2️⃣ Detaylı Cache Akış Diyagramı

Cache miss ve cache hit senaryolarının detaylı gösterimi.

```mermaid
sequenceDiagram
    participant Client
    participant API as ASP.NET Core API
    participant Redis
    participant DB as SQL Server/PostgreSQL
    
    Note over Client,DB: Senaryo 1: Cache Miss (İlk İstek)
    
    Client->>API: GET /products/123
    API->>Redis: GET product:123
    Redis-->>API: null (cache miss)
    API->>DB: SELECT * FROM Products WHERE Id=123
    DB-->>API: Product Data
    API->>Redis: SET product:123 (TTL: 5min)
    API-->>Client: 200 OK + Product Data
    
    Note over Client,DB: Senaryo 2: Cache Hit (Sonraki İstekler)
    
    Client->>API: GET /products/123
    API->>Redis: GET product:123
    Redis-->>API: Product Data ✅
    API-->>Client: 200 OK + Product Data
    Note over API,DB: Veritabanına gitmeden direkt Redis'ten döndü!
```

---

## 3️⃣ Session Store Senaryosu

Çoklu server ortamında merkezi session yönetimi.

```mermaid
graph TB
    subgraph LoadBalancer[Load Balancer]
        LB[Load Balancer - Nginx/HAProxy]
    end
    
    subgraph ApplicationServers[Application Servers]
        API1[API Server 1 - Instance A]
        API2[API Server 2 - Instance B]
        API3[API Server 3 - Instance C]
    end
    
    subgraph SharedState[Shared State]
        Redis[Redis - Session Store - Shared Cache]
    end
    
    subgraph DatabaseCluster[Database Cluster]
        DB[(SQL Server - Primary DB)]
    end
    
    Client[User] -->|Request| LB
    LB -->|Route| API1
    LB -->|Route| API2
    LB -->|Route| API3
    
    API1 -->|Read-Write-Session| Redis
    API2 -->|Read-Write-Session| Redis
    API3 -->|Read-Write-Session| Redis
    
    API1 -->|Query-Data| DB
    API2 -->|Query-Data| DB
    API3 -->|Query-Data| DB
    
    style Redis fill:#dc382d,color:#fff
    style DB fill:#336791,color:#fff
```

**Fayda:** Kullanıcı hangi server'a istek gönderirse göndersin, session bilgisi Redis'te merkezi olarak tutulduğu için aynı kullanıcı oturumuna erişir.

---

## 4️⃣ Microservices Architecture

Mikroservisler arası veri paylaşımı ve event-driven communication.

```mermaid
graph TB
    subgraph APIGateway[API Gateway]
        Gateway[API Gateway]
    end
    
    subgraph Microservices[Microservices]
        MS1[User Service]
        MS2[Product Service]
        MS3[Order Service]
        MS4[Payment Service]
    end
    
    subgraph SharedServices[Shared Services]
        Redis[Redis - Shared Cache - Pub/Sub - Session Store]
    end
    
    subgraph Databases[Databases]
        DB1[(User DB)]
        DB2[(Product DB)]
        DB3[(Order DB)]
    end
    
    Client[Client] --> Gateway
    Gateway --> MS1
    Gateway --> MS2
    Gateway --> MS3
    Gateway --> MS4
    
    MS1 --> Redis
    MS2 --> Redis
    MS3 --> Redis
    MS4 --> Redis
    
    MS1 --> DB1
    MS2 --> DB2
    MS3 --> DB3
    
    MS1 -.->|Publish-Event| Redis
    Redis -.->|Subscribe| MS2
    Redis -.->|Subscribe| MS3
    Redis -.->|Subscribe| MS4
    
    style Redis fill:#dc382d,color:#fff
```

**Redis'in Rolleri:**
- **Shared Cache:** Tüm servislerin erişebileceği ortak cache
- **Pub/Sub:** Servisler arası event mesajlaşması
- **Session Store:** Merkezi oturum yönetimi

---

## 5️⃣ Redis vs Database Karşılaştırmalı Akış

Performans farkını gösteren karşılaştırma.

```mermaid
graph LR
    subgraph RedisOlmadan[Redis Olmadan]
        A1[Request] --> A2[API]
        A2 --> A3[Database Query - 10-50ms]
        A3 --> A4[Response - 50ms]
    end
    
    subgraph RedisIle[Redis ile]
        B1[Request] --> B2[API]
        B2 --> B3{Redis'te var mı?}
        B3 -->|Evet| B4[Redis Read - 1ms]
        B3 -->|Hayır| B5[Database Query - 10-50ms]
        B5 --> B6[Redis Write]
        B4 --> B7[Response - 1ms]
        B6 --> B7
    end
    
    style A3 fill:#ff6b6b
    style B4 fill:#51cf66
    style B7 fill:#51cf66
```

**Performans Karşılaştırması:**
- **Redis olmadan:** Her istek → DB → ~10-50ms
- **Redis ile (cache hit):** İstek → Redis → ~1ms (**10-50x daha hızlı!**)
- **Redis ile (cache miss):** İlk istek DB'ye gider, sonrakiler Redis'ten gelir

---

## 6️⃣ Redis Veri Yapıları Kullanım Senaryoları

```mermaid
graph TB
    Redis[⚡ Redis]
    
    Redis --> String[📝 String<br/>- Cache<br/>- Tokens<br/>- Counters]
    Redis --> Hash[🗂️ Hash<br/>- User Profiles<br/>- Product Details]
    Redis --> List[📋 List<br/>- Queues<br/>- Activity Logs]
    Redis --> Set[🔢 Set<br/>- Tags<br/>- Online Users]
    Redis --> SortedSet[🏆 Sorted Set<br/>- Leaderboards<br/>- Rankings]
    Redis --> Streams[📡 Streams<br/>- Event Logging<br/>- Pub/Sub]
    
    style Redis fill:#dc382d,color:#fff
    style String fill:#ffd43b
    style Hash fill:#4dabf7
    style List fill:#69db7c
    style Set fill:#ff8787
    style SortedSet fill:#da77f2
    style Streams fill:#ffa94d
```

**Kullanım Örnekleri:**
- **String:** `"user:1:name" → "Kamil"`, `"session:abc123" → JSON`
- **Hash:** `"user:1" → {name: "Kamil", age: "23", email: "..."}`
- **List:** `"queue:orders" → [order1, order2, order3]`
- **Set:** `"online:users" → {user1, user2, user3}`
- **Sorted Set:** `"leaderboard" → {(kamil, 100), (ahmet, 80)}`
- **Streams:** Event sourcing, audit log

---

## 7️⃣ Tam Stack Architecture Örneği

Gerçek bir production ortamı örneği.

```mermaid
graph TB
    subgraph ClientLayer2[Client Layer]
        Web[Web App]
        Mobile[Mobile App]
        Admin[Admin Panel]
    end
    
    subgraph EdgeLayer[Edge Layer]
        CDN[CDN - Static Assets]
        LB[Load Balancer]
    end
    
    subgraph ApplicationLayer2[Application Layer]
        API[ASP.NET Core API - Multiple Instances]
    end
    
    subgraph CachingState[Caching and State]
        RedisCache[Redis Cache - Data Cache - Session Store]
        RedisPubSub[Redis Pub/Sub - Events - Notifications]
    end
    
    subgraph MessageQueue[Message Queue]
        Queue[Message Queue - Background Jobs]
    end
    
    subgraph DataLayer[Data Layer]
        PrimaryDB[(SQL Server - Primary DB)]
        ReadReplica[(Read Replica - Read-Only)]
    end
    
    subgraph BackgroundServices[Background Services]
        Worker[Worker Service - Background Jobs]
    end
    
    Web --> CDN
    Mobile --> LB
    Admin --> LB
    CDN --> LB
    LB --> API
    
    API --> RedisCache
    API --> RedisPubSub
    API --> PrimaryDB
    API --> ReadReplica
    API --> Queue
    
    RedisPubSub --> Worker
    Queue --> Worker
    Worker --> PrimaryDB
    Worker --> RedisCache
    
    style RedisCache fill:#dc382d,color:#fff
    style RedisPubSub fill:#dc382d,color:#fff
    style PrimaryDB fill:#336791,color:#fff
```

**Redis'in Bu Mimarideki Rolleri:**
1. **Data Cache:** Sık kullanılan verileri cache'ler
2. **Session Store:** Kullanıcı oturumlarını merkezi tutar
3. **Pub/Sub:** Gerçek zamanlı event/mesajlaşma
4. **Rate Limiting:** API rate limit sayaçları
5. **Distributed Lock:** Kritik işlemler için lock mekanizması

---

## 8️⃣ Redis Kullanım Senaryoları Özet

```mermaid
mindmap
  root((Redis))
    Cache
      Product Cache
      User Profile Cache
      Database Query Cache
    Session Store
      Distributed Sessions
      Shopping Cart
      User Preferences
    Real-time Features
      Leaderboards
      Live Counters
      Online Users
    Messaging
      Pub/Sub
      Event Streaming
      Notifications
    Performance
      Rate Limiting
      API Throttling
      Request Deduplication
    Data Structures
      Queues
      Sets & Tags
      Sorted Sets
```

---

## 📊 Özet: Redis'in Projedeki Yeri

| Özellik | Değer |
|---------|-------|
| **Konumu** | Application Layer ile Database Layer arasında |
| **Türü** | In-Memory Data Structure Store |
| **Latency** | ~1ms (sub-millisecond) |
| **Ana Kullanım** | Cache, Session, Pub/Sub, Real-time Data |
| **Veri Kalıcılığı** | İsteğe bağlı (genelde geçici) |
| **Scalability** | Horizontal scaling (cluster mode) |
| **HA (High Availability)** | Redis Sentinel, Redis Cluster |

**Redis = Veritabanının yanında çalışan, hız için RAM kullanan, akıllı bir yardımcı servis.**

