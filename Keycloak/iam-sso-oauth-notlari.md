
# 🔐 IAM, SSO ve OAuth Notları (ShopPlus Örneği)

## 1️⃣ Temel Kavramlar

### IAM (Identity and Access Management)
Doğru kullanıcının, doğru kaynağa, doğru yetkiyle erişmesini sağlayan sistemlerin bütünüdür.

---

### SSO (Single Sign-On)
Kullanıcının **tek bir kez giriş yaparak**, aynı IAM sistemine bağlı **birden fazla uygulamaya** tekrar giriş yapmadan erişebilmesidir.

---

### MFA (Multi-Factor Authentication)
Kullanıcının giriş yaparken **birden fazla doğrulama faktörü** kullanmasıdır.
- Şifre
- OTP / Authenticator
- Biyometrik doğrulama

---

## 2️⃣ Protokoller

### OAuth 2.0
- **Yetkilendirme (Authorization)** protokolüdür
- “Ne yapabilirim?” sorusuna cevap verir
- Access Token üretir

### OpenID Connect (OIDC)
- **Kimlik doğrulama (Authentication)**
- OAuth 2.0 üzerine kuruludur
- “Ben kimim?” sorusuna cevap verir

### SAML 2.0
- XML tabanlı
- Kurumsal SSO senaryolarında kullanılır
- Özellikle şirket–şirket entegrasyonlarında

---

## 3️⃣ LDAP / Active Directory

- Merkezi kullanıcı ve grup dizin servisidir
- Kullanıcılar, gruplar ve yetkiler burada tutulur
- Keycloak gibi IAM sistemleri LDAP/AD ile entegre çalışabilir

### Grup Nedir?
Birden fazla kullanıcıya **toplu yetki vermek** için kullanılan yapıdır.
Örn: IT, HR, Finance, Admin

---

## 4️⃣ Keycloak Yapısı (ShopPlus Örneği)

### 🌍 Realm
- shopplus-realm
- Tüm sistemin güvenlik sınırı

### Realm Roller (Kim Olduğun)
- customer
- seller
- support_agent
- platform_admin

### Client Roller (Uygulamada Ne Yapabildiğin)
Her uygulama (client) kendi rollerine sahiptir.

---

## 5️⃣ Client’lar (Uygulamalar)

- customer-web
- seller-panel
- admin-dashboard
- mobile-app

Her client:
- Kendi rollerini
- Kendi erişim kurallarını
belirler

---

## 6️⃣ Kullanıcı – Rol Senaryoları

### Ahmet (Müşteri)
- Realm: customer
- customer-web: regular_user
- mobile-app: mobile_user

### Ayşe (Müşteri + Satıcı)
- Realm: seller
- customer-web: premium_user
- seller-panel: store_owner

### Mehmet (Destek)
- Realm: support_agent
- admin-dashboard: ticket_manager

### Zeynep (Admin)
- Realm: platform_admin
- admin-dashboard: super_admin

---

## 7️⃣ Token Mantığı

### Kullanıcı Token Örneği
```json
{
  "sub": "user-id",
  "realm_roles": ["seller"],
  "client_roles": {
    "seller-panel": ["store_owner"],
    "customer-web": ["premium_user"]
  }
}
```

---

## 8️⃣ Client Credentials Flow (OAuth 2.0)

### Nedir?
- Kullanıcı **olmayan**
- Servis–servis iletişimi için kullanılan OAuth akışı

### Nerede Kullanılır?
- Backend → Backend
- Cron job
- Microservice çağrıları

### Nasıl Çalışır?
1. Client ID + Client Secret ile token istenir
2. Authorization Server token üretir
3. Token ile API çağrılır

### Önemli Nokta
- Kullanıcı olmadığı için **realm role yoktur**
- Yetkilendirme **client-level role** ile yapılır

---

## 9️⃣ Neden Client-Level Role Çok Önemli?

- Hangi servisin ne yapabildiği netleşir
- Güvenlik açıkları azalır
- Microservice mimarisi için idealdir

---

## 🔑 Altın Kurallar

- Realm Role = Kim olduğun
- Client Role = O uygulamada ne yapabildiğin
- OAuth = Yetki
- OIDC = Kimlik
- SSO = Tek giriş, çok uygulama
- MFA = Ek güvenlik katmanı

---

## 🏆 Sonuç
Bu mimari sayesinde:
- Herkes sadece yetkili olduğu yere erişir
- Roller net ve ölçeklenebilir olur
- Güvenli, modern ve sürdürülebilir bir IAM yapısı kurulur
