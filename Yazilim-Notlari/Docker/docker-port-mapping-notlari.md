# Docker Port Mapping Notları

## 📌 Port Mapping Formatı
**`HOST_PORT:CONTAINER_PORT`**
- **HOST_PORT**: Bilgisayarınızın portu (dış dünya)
- **CONTAINER_PORT**: Konteynerin içindeki port

### Örnek: `4003:5432`
- **5432**: PostgreSQL konteynerinin iç portu
- **4003**: Bilgisayarınızda açılan port
- **Bağlantı**: `localhost:4003` → `konteyner:5432`

## ⚠️ Çakışma Kuralları

### ❌ ÇAKIŞMA OLUR (HATA)
```yaml
service1:
  ports: ["4003:5432"]

service2:
  ports: ["4003:5432"]
# Hata: Port 4003 is already allocated
```

### ✅ ÇAKIŞMA OLMAZ (GEÇERLİ)
```yaml
postgres1:
  ports: ["4001:5432"]

postgres2:
  ports: ["4002:5432"]
```

## 🔍 Çakışma Nerede Olur?
**Sadece HOST_PORT çakışabilir**
- CONTAINER_PORT aynı olabilir
- Konteynerler izoledir

## 🏠 Docker Network İçi İletişim
```yaml
app:
  environment:
    - DB_CONNECTION=postgresql:5432
```

## 📊 Örnek Port Yapılandırması
| Servis | Container İçi | Host |
|------|---------------|------|
| SQL Server | 1433 | 4001 |
| MongoDB | 27017 | 4002 |
| PostgreSQL | 5432 | 4003 |
| Redis | 6379 | 4004 |

## 🛠️ Faydalı Komutlar
```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

## 🎯 Özet
- Çakışma sadece HOST_PORT'ta olur
- İç portlar aynı olabilir
- Docker NAT kullanır
