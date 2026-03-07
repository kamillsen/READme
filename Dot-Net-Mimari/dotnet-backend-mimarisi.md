# 🏗️ **.NET Backend Mimarisi - Teknoloji ve Tasarım Dokümanı**

## 📋 **İçindekiler**
1. [Mimari Yaklaşım](#mimari-yaklaşım)
2. [İstek Akış Şeması](#i̇stek-akış-şeması)
3. [Teknoloji Seçimleri ve Nedenleri](#teknoloji-seçimleri-ve-nedenleri)
4. [Esneklik ve Değişime Açıklık](#esneklik-ve-değişime-açıklık)
5. [Klasör Yapısı](#klasör-yapısı)
6. [Temel Bileşenler](#temel-bileşenler)

---

## 🎯 **Mimari Yaklaşım**

### **Clean Architecture (Hexagonal Architecture)**

```
                   ┌─────────────────┐
                   │   Presentation  │  (API, Controllers)
                   │     (API)       │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │   Application   │  (Use Cases, CQRS, MediatR)
                   │     (Core)      │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │     Domain      │  (Entities, Value Objects, Interfaces)
                   │    (Core)       │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │  Infrastructure │  (Data, Services, External)
                   │                 │
                   └─────────────────┘
```

**Neden Clean Architecture?**
- **Bağımsızlık**: Veritabanı, UI, framework'lerden bağımsız
- **Test Edilebilirlik**: Her katman ayrı test edilebilir
- **Esneklik**: Veritabanı değişse bile domain etkilenmez
- **Sorumluluk Ayrımı**: Her katmanın net bir görevi var

---

## 🔄 **İstek Akış Şeması**

```
┌─────────────┐
│   İSTEK     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│             PIPELINE (Middleware)                │
├─────────────────────────────────────────────────┤
│ 1. HTTPS Redirection                             │
│ 2. CORS                                           │
│ 3. Static Files                                   │
│ 4. Rate Limiting                                   │
│ 5. Request Logging                                 │
│ 6. Authentication (JWT)                            │
│ 7. Authorization                                   │
│ 8. Response Compression                            │
│ 9. Global Exception Handling                       │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│               ROUTING / CONTROLLER               │
├─────────────────────────────────────────────────┤
│                                                  │
│    ┌───────────────┐     ┌───────────────┐     │
│    │  Validation   │────▶│   MediatR     │     │
│    │  (FluentValidation) │   (CQRS)      │     │
│    └───────────────┘     └───────┬───────┘     │
│                                  │             │
└──────────────────────────────────┼──────────────┘
                                   │
                                   ▼
              ┌────────────────────────────────────┐
              │        MEDIATR PIPELINE             │
              ├────────────────────────────────────┤
              │ 1. Performance Behavior             │
              │    - İşlem süresini ölç             │
              │    - Yavaş işlemleri logla          │
              │                                      │
              │ 2. Logging Behavior                  │
              │    - Hangi işlem başladı             │
              │    - Kim başlattı                    │
              │    - Ne zaman bitti                  │
              │                                      │
              │ 3. Caching Behavior                   │
              │    - Query ise cache kontrolü        │
              │    - Cache'de varsa direkt dön       │
              │    - Yoksa handler'a devam et        │
              │                                      │
              │ 4. Validation Behavior                │
              │    - FluentValidation ile doğrulama  │
              │    - Hatalıysa ValidationException   │
              │                                      │
              │ 5. Authorization Behavior             │
              │    - Policy kontrolü                 │
              │    - Role kontrolü                   │
              │    - Yetki yoksa ForbiddenException  │
              │                                      │
              │ 6. Transaction Behavior               │
              │    - Command ise transaction başlat  │
              │    - Hata varsa rollback             │
              │    - Başarılıysa commit              │
              └──────────────────┬───────────────────┘
                                 │
                                 ▼
              ┌────────────────────────────────────┐
              │          HANDLER (Use Case)         │
              ├────────────────────────────────────┤
              │ - İş kuralları uygula               │
              │ - Repository'ler ile veri işlemleri │
              │ - Domain event fırlat               │
              │ - Servisleri çağır (email, sms vs)  │
              └──────────────────┬───────────────────┘
                                 │
                                 ▼
              ┌────────────────────────────────────┐
              │        REPOSITORY / SERVICE         │
              ├────────────────────────────────────┤
              │ - EntityFramework ile veritabanı    │
              │ - Redis cache işlemleri             │
              │ - External API çağrıları            │
              │ - File storage işlemleri            │
              └────────────────────────────────────┘
```

---

## 🛠️ **Teknoloji Seçimleri ve Nedenleri**

### **1. .NET 8 (LTS)**
| **Neden Kullanılır?** |
|----------------------|
| • Microsoft'un en uzun destekli (3 yıl) sürümü |
| • Performans iyileştirmeleri (Native AOT, minimal API'ler) |
| • Gelişmiş DI container (built-in) |
| • Native OpenAPI desteği |

### **2. PostgreSQL**
| **Neden Kullanılır?** |
|----------------------|
| • ACID uyumlu, güvenilir veritabanı |
| • JSONB desteği (NoSQL esnekliği) |
| • Yüksek performans ve ölçeklenebilirlik |
| • Full-text search desteği |
| • Ücretsiz ve açık kaynak |

### **3. Entity Framework Core**
| **Neden Kullanılır?** |
|----------------------|
| • LINQ desteği ile tip-güvenli sorgular |
| • Migration desteği (versiyon kontrolü) |
| • Lazy loading, eager loading seçenekleri |
| • Change tracking otomatik |
| • Performanslı (raw SQL'e yakın) |

### **4. MediatR**
| **Neden Kullanılır?** |
|----------------------|
| • CQRS pattern implementasyonu için ideal |
| • In-process messaging ile gevşek bağlılık |
| • Pipeline behaviors ile cross-cutting concerns |
| • Request/response pattern'i standartlaştırır |
| • Test edilebilirliği artırır |

### **5. FluentValidation**
| **Neden Kullanılır?** |
|----------------------|
| • DataAnnotations'dan daha esnek validasyon |
| • Conditional validation kuralları |
| • Custom validation kolaylığı |
| • Validation logic'i entity'den ayrı tutar |
| • Dependency injection desteği |

### **6. JWT (JSON Web Token)**
| **Neden Kullanılır?** |
|----------------------|
| • Stateless authentication (ölçeklenebilir) |
| • Token içinde kullanıcı bilgileri taşınabilir |
| • Cross-domain çalışabilir |
| • Mobile/SPA uygulamaları için ideal |
| • Expiration süresi ayarlanabilir |

### **7. Redis**
| **Neden Kullanılır?** |
|----------------------|
| • In-memory cache ile yüksek performans |
| • Distributed caching (multi-instance) |
| • Session storage |
| • Rate limiting için ideal |
| • Pub/Sub messaging desteği |

### **8. Serilog**
| **Neden Kullanılır?** |
|----------------------|
| • Structured logging (JSON format) |
| • Multiple sinks (file, db, elasticsearch) |
| • Kolay konfigürasyon |
| • Enrichment desteği (IP, user info ekleme) |
| • Performance logging |

### **9. Hangfire / Quartz.NET**
| **Neden Kullanılır?** |
|----------------------|
| • Background job yönetimi |
| • Cron job'lar (zamanlanmış görevler) |
| • Retry mekanizması |
| • Dashboard ile izleme |
| • Transactional job'lar |

### **10. Swagger / OpenAPI**
| **Neden Kullanılır?** |
|----------------------|
| • Otomatik API dökümantasyonu |
| • Try-it-out özelliği ile test imkanı |
| • Client SDK generation |
| • JWT token ekleme desteği |
| • API versioning desteği |

### **11. AutoMapper**
| **Neden Kullanılır?** |
|----------------------|
| • Entity-DTO dönüşümlerini otomatikleştirir |
| • Boilerplate kodu azaltır |
| • Mapping configuration tek noktada toplanır |
| • Performanslı (Expression tree caching) |
| • Complex mapping desteği |

### **12. xUnit / NUnit + Moq**
| **Neden Kullanılır?** |
|----------------------|
| • Unit test için endüstri standardı |
| • Integration test desteği |
| • Mocking ile bağımlılıkları izole etme |
| • Parallel test execution |
| • Code coverage araçları ile uyumlu |

---

## 🔧 **Esneklik ve Değişime Açıklık**

### **1. Interface Bağımlılığı (Dependency Inversion)**
```
❌ Kötü:            ✅ İyi:
UserService         IUserService (interface)
    ↓                   ↑
PostgreSQL          UserService (implementasyon)
                        ↓
                    PostgreSQL (kolayca değiştirilebilir)
```

### **2. Generic Repository Pattern**
```csharp
IRepository<T> → PostgreSQLRepository<T>
               → MongoDBRepository<T>
               → InMemoryRepository<T> (test için)
```

### **3. Strategy Pattern ile Servis Değişimi**
```csharp
IEmailService → SmtpEmailService
              → SendGridEmailService
              → AmazonSESService
```

### **4. Pipeline Behaviors ile Cross-Cutting Concerns**
- Yeni bir behavior eklemek = Yeni bir class yaz, pipeline'a ekle
- Mevcut kod değişmez (Open/Closed Principle)

### **5. Options Pattern ile Konfigürasyon**
```csharp
appsettings.json → IOptions<T> → Her ortamda farklı config
```

### **6. Environment Based Configuration**
```
Development → Local DB, debug logging
Staging     → Production-like, test logging
Production  → Optimized DB, error logging
```

### **7. Feature Toggle ile Özellik Yönetimi**
- Yeni feature'ları flag ile aç/kapa
- Riskli özellikleri kontrollü dağıt

---

## 📂 **Klasör Yapısı (Esnek ve Genişletilebilir)**

```
src/
├── 1-Presentation/
│   └── API/
│       ├── Controllers/
│       │   ├── v1/                    # API versioning
│       │   └── v2/
│       ├── Middlewares/                # Custom middleware'ler
│       ├── Filters/                     # Action filters
│       ├── Extensions/                   # DI extensions
│       └── Program.cs
│
├── 2-Core/
│   ├── Domain/                          # İş mantığı (en iç katman)
│   │   ├── Entities/                     # Veritabanı modelleri
│   │   ├── ValueObjects/                  # Email, Phone gibi değer tipleri
│   │   ├── Enums/                          # Sabitler
│   │   ├── Interfaces/                      # Repository interface'leri
│   │   └── Events/                           # Domain events
│   │
│   └── Application/                       # Use case'ler
│       ├── Common/
│       │   ├── Behaviors/                   # MediatR pipeline behaviors
│       │   ├── Exceptions/                   # Custom exceptions
│       │   └── Interfaces/                    # Servis interface'leri
│       │
│       ├── Features/                         # CQRS feature'ları
│       │   ├── Users/
│       │   │   ├── Commands/
│       │   │   ├── Queries/
│       │   │   ├── DTOs/
│       │   │   └── Validators/
│       │   └── Reports/
│       │
│       └── Mappings/                          # AutoMapper profilleri
│
└── 3-Infrastructure/
    ├── Persistence/                          # Veritabanı
    │   ├── Context/
    │   ├── Configurations/
    │   ├── Repositories/
    │   └── Migrations/
    │
    ├── Identity/                             # Kimlik yönetimi
    │   ├── JwtService.cs
    │   ├── PermissionService.cs
    │   └── CurrentUserService.cs
    │
    ├── Caching/                               # Redis cache
    │   └── RedisCacheService.cs
    │
    ├── Communication/                         # Harici servisler
    │   ├── Email/
    │   ├── Sms/
    │   └── Payment/
    │
    ├── BackgroundJobs/                         # Cron job'lar
    │   ├── HangfireService.cs
    │   └── Jobs/
    │
    └── Storage/                                # Dosya depolama
        ├── LocalStorage/
        └── CloudStorage/
```

---

## 🛡️ **Temel Bileşenler**

### **1. Global Error Handler**
- Tek noktadan tüm hataları yakala
- Development/Production'da farklı detay seviyesi
- Structured error response
- Otomatik loglama

### **2. Validation**
- Request validation (FluentValidation)
- Business rule validation (Domain)
- Validation pipeline ile otomatik kontrol

### **3. Authentication & Authorization**
- JWT based authentication
- Role-based authorization
- Permission-based authorization
- Policy-based authorization

### **4. Logging**
- Request/Response logging
- Error logging
- Performance logging
- Audit logging

### **5. Caching**
- Response caching
- Distributed caching (Redis)
- Cache invalidation strategies

### **6. Rate Limiting**
- DDoS koruması
- Kullanıcı/IP bazlı limit
- Endpoint spesifik limitler

### **7. Health Checks**
- Veritabanı sağlığı
- Redis sağlığı
- External service sağlığı
- /health endpoint

### **8. API Versioning**
- URL path versioning (/api/v1/users)
- Query string versioning
- Header versioning
- Media type versioning

### **9. Documentation**
- Swagger/OpenAPI
- XML comments
- API examples
- Authentication docs

### **10. Background Jobs**
- Email gönderimi
- Rapor oluşturma
- Veri temizliği
- Bildirim gönderme

---

## 📊 **Katmanlar Arası İletişim**

```
Katman          → Kime Bağlı?        → Nasıl?
─────────────────────────────────────────────────
Presentation    → Application        → MediatR (Command/Query)
Application     → Domain             → Interface'ler üzerinden
Application     → Infrastructure     → DI ile (interface)
Infrastructure  → → Domain'e bağlı, Application'a değil
```

---
****
## 🎯 **Özet: Neden Bu Mimari?**

| **Özellik** | **Nasıl Sağlanır?** |
|-------------|-------------------|
| **Esneklik** | Interface bağımlılığı, Strategy pattern |
| **Test Edilebilirlik** | DI, Interface'ler, MediatR |
| **Bakım Kolaylığı** | Clean Architecture, SRP |
| **Performans** | Redis cache, Async/Await |
| **Güvenlik** | JWT, Rate limiting, HTTPS |
| **Ölçeklenebilirlik** | Stateless auth, Redis |
| **İzlenebilirlik** | Serilog, Health checks |
| **Dökümantasyon** | Swagger/OpenAPI |

---

Bu mimari ile:
- **Yeni bir veritabanına geçiş** → Sadece Infrastructure katmanı değişir
- **Yeni bir email servisi** → Yeni bir class ekle, DI'da değiştir
- **Yeni bir business rule** → Domain/Application katmanına ekle
- **Yeni bir endpoint** → Controller + Command/Query + Handler ekle
- **Yeni bir background job** → Hangfire job'ı ekle

Her şey birbirinden bağımsız, test edilebilir ve değiştirilebilir.