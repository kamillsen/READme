# 🧩 Encapsulation & Stack/Heap – Kısa Özet (C#)

## 1️⃣ Encapsulation (Kapsülleme) Nedir?

> Veriyi (`field`) saklayıp, onu yöneten kuralları (`method`/`property`) aynı sınıfta toplamak
> ve dışarıya **sadece kontrollü erişim** vermektir.

* **Veri saklanır** → `private`
* **Kontrollü kapı açılır** → `public` property / method

### Neden?

* Veriyi korumak (ör: bakiye negatif olmasın)
* Kuralları tek yerde toplamak
* İç yapıyı değiştirdiğinde dış kodu bozmamak
* "Bu değeri kim değiştirdi?"yi kolay takip etmek

---

## 2️⃣ Field vs Property (C# mantığı)

### Field (Alan) = Ham Veri

```csharp
private decimal _balance;   // field (ham veri, direkt değişken)
```

**Özellikler:**
- Direkt değişken
- Hafızada yer kaplar
- Genelde `private` (dışarıdan erişilemez)

---

### Property (Özellik) = Kontrollü Erişim

```csharp
public decimal Balance      // property (kontrollü erişim)
{
    get { return _balance; }        // Okuma metodu
    private set { _balance = value; } // Yazma metodu (sadece class içi)
}
```

**Özellikler:**
- Field'a erişim sağlar
- `get` ve `set` metotları içerir
- Metot değil, property (parantez yok)

---

### Property vs Metot Farkı

**Metot:**
```csharp
public decimal GetBalance()  // Metot - parantez var
{
    return _balance;
}

// Kullanım
var x = account.GetBalance();  // ✅ Parantez ile çağrılır
```

**Property:**
```csharp
public decimal Balance  // Property - parantez yok
{
    get { return _balance; }
}

// Kullanım
var x = account.Balance;  // ✅ Parantez YOK, direkt kullanılır
```

---

### Get Nasıl Çalışır?

```csharp
public decimal Balance
{
    get { return _balance; }  // Okuma metodu
}
```

**Kullanım:**
```csharp
var account = new BankAccount(1000);

// Balance'ı okumak istediğinde:
var x = account.Balance;  // get metodu otomatik çağrılır

// Ne oluyor?
// 1. account.Balance yazıldığında
// 2. C# otomatik olarak get metodunu çağırır
// 3. get { return _balance; } çalışır
// 4. _balance değeri döner
// 5. x = 1000 olur
```

**Görünüş:** `account.Balance` → Field gibi görünür  
**Gerçek:** Arka planda `get` metodu çalışır

---

### Set Nasıl Çalışır?

```csharp
public decimal Balance
{
    get { return _balance; }
    private set { _balance = value; }  // Yazma metodu
}
```

**Kullanım:**
```csharp
// Class içinde:
Balance = 500;  // set metodu otomatik çağrılır

// Ne oluyor?
// 1. Balance = 500 yazıldığında
// 2. C# otomatik olarak set metodunu çağırır
// 3. set { _balance = value; } çalışır
// 4. value = 500 (atadığın değer)
// 5. _balance = 500 olur
```

**Dışarıdan:**
```csharp
var account = new BankAccount(1000);
// account.Balance = 500;  // ❌ Hata! set private, sadece class içi
```

---

### Tam Örnek

```csharp
public class BankAccount
{
    private decimal _balance;  // Field (ham veri)

    public decimal Balance     // Property (kontrollü erişim)
    {
        get { return _balance; }        // Okuma
        private set { _balance = value; } // Yazma (sadece class içi)
    }

    public void Deposit(decimal amount)
    {
        Balance = Balance + amount;  // get + set çalışır
        // 1. Balance (get) → _balance değerini alır
        // 2. Balance = ... (set) → _balance'a yeni değer atar
    }
}

// Kullanım
var account = new BankAccount(1000);
var current = account.Balance;  // get çalışır → 1000
account.Deposit(100);           // set çalışır (class içinde)
var newBalance = account.Balance;  // get çalışır → 1100
```

---

### Özet

| Özellik | Field | Property |
|---------|-------|----------|
| **Ne?** | Direkt değişken | Field'a erişim sağlar |
| **Kullanım** | `_balance` | `Balance` (parantez yok) |
| **Get** | Direkt okuma | `get` metodu çalışır |
| **Set** | Direkt yazma | `set` metodu çalışır |
| **Erişim** | Genelde `private` | Genelde `public` |

**Önemli:**
- Property metot değil → `account.Balance` (parantez yok)
- Metot → `account.GetBalance()` (parantez var)
- `get` → Okuma için otomatik çağrılır
- `set` → Yazma için otomatik çağrılır

---

## 3️⃣ Encapsulation'lı BankAccount Örneği (C#)

```csharp
public class BankAccount
{
    private decimal _balance;

    public decimal Balance
    {
        get { return _balance; }
        private set { _balance = value; }
    }

    public BankAccount(decimal initialBalance)
    {
        if (initialBalance < 0)
            throw new ArgumentException("Negatif olamaz.");
        Balance = initialBalance;
    }

    public void Deposit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Pozitif olmalı.");
        Balance = Balance + amount;   // get + set
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Pozitif olmalı.");
        if (amount > Balance)
            throw new InvalidOperationException("Yetersiz bakiye.");
        Balance = Balance - amount;
    }
}
```

Kullanım:

```csharp
var acc = new BankAccount(1000);
acc.Deposit(100);             // ✅ _balance dolaylı güncellenir
// acc.Balance = -500;        // ❌ set private
Console.WriteLine(acc.Balance);
```

> Özet: `_balance` dışarıdan görünmez, değişim sadece `Deposit` / `Withdraw` gibi **kurallı metotlarla** olur.

---

## 4️⃣ Stack – Heap – Referans (Kısaca)

### Stack (Yığın)

**Ne tutar?**
* Değişkenler (int, string, bool, vb.)
* Referansların kendisi (adresler)

**Özellikler:**
* Küçük, hızlı alan
* Otomatik temizlenir (metot bitince)

### Heap (Yığın)

**Ne tutar?**
* `new` ile oluşturulan **gerçek nesneler**

**Özellikler:**
* Büyük alan
* Garbage Collector tarafından temizlenir

---

### 🎯 Kısa Örnek: Ev ve Adres Benzetmesi

**Gerçek Hayat:**
```
Adres Defteri (Stack):
"Ahmet'in Evi" → "İstanbul, Kadıköy, Moda Caddesi No: 5"

Gerçek Ev (Heap):
"İstanbul, Kadıköy, Moda Caddesi No: 5" → { 3 oda, 2 banyo, mutfak }
```

**Kod:**
```csharp
var acc = new BankAccount(1000);
```

```
STACK (Adres defteri):
acc → 0x00AF12  (adres tutuyor)

HEAP (Gerçek ev):
0x00AF12 → { _balance = 1000 }  (gerçek nesne)
```

**Açıklama:**
* `acc` değişkeni → Stack'te (adres kağıdı gibi)
* `new BankAccount(1000)` → Heap'te (gerçek nesne, ev gibi)
* `acc` → Heap'teki nesnenin adresini gösteriyor (adres kağıdındaki adres gibi)

**Kullanım:**
```csharp
acc.Deposit(100);  // acc'ye bak → adresi bul → Heap'teki nesneye git → işlemi yap
```

---

### Örnek 1: Basit Kullanım

```csharp
var acc = new BankAccount(1000);
```

**Ne oluyor?**

```text
STACK (Hafıza)
acc → 0x00AF12  (adres tutuyor)

HEAP (Hafıza)
0x00AF12 → { _balance = 1000 }  (gerçek nesne)
```

**Açıklama:**
* `acc` değişkeni → Stack'te (adres tutuyor)
* `new BankAccount(1000)` → Heap'te (gerçek nesne)
* `acc` → Heap'teki nesnenin adresini gösteriyor

---

### Örnek 2: Referans Kopyalama

```csharp
var a1 = new BankAccount(1000);
var a2 = a1;  // aynı nesneye referans
```

**Ne oluyor?**

```text
STACK
a1 → 0x00AF12
a2 → 0x00AF12  (aynı adres!)

HEAP
0x00AF12 → { _balance = 1000 }  (tek nesne)
```

**Sonuç:**
* `a1` ve `a2` aynı nesneye işaret ediyor
* `a1.Deposit(100);` → `a2.Balance` de değişir (aynı nesne)

---

### Örnek 3: Farklı Nesneler

```csharp
var a1 = new BankAccount(1000);
var a2 = new BankAccount(1000);  // farklı nesne
```

**Ne oluyor?**

```text
STACK
a1 → 0x00AF12
a2 → 0x00BF34  (farklı adres!)

HEAP
0x00AF12 → { _balance = 1000 }  (nesne 1)
0x00BF34 → { _balance = 1000 }  (nesne 2)
```

**Sonuç:**
* `a1` ve `a2` farklı nesnelere işaret ediyor
* `a1.Deposit(100);` → `a2.Balance` değişmez (farklı nesne)

---

### Örnek 4: Value Type (Stack'te)

```csharp
int x = 10;        // Stack'te (value type)
string name = "Ahmet";  // Stack'te referans, Heap'te "Ahmet"
```

**Ne oluyor?**

```text
STACK
x → 10  (değer direkt burada)
name → 0x00CD56  (adres)

HEAP
0x00CD56 → "Ahmet"  (string nesnesi)
```

**Açıklama:**
* `int` → Value type, Stack'te direkt değer
* `string` → Reference type, Stack'te adres, Heap'te nesne

---

### Örnek 5: Null Referans

```csharp
BankAccount acc = null;  // referans yok
```

**Ne oluyor?**

```text
STACK
acc → null  (hiçbir yere işaret etmiyor)

HEAP
(hiçbir şey yok)
```

**Sonuç:**
* `acc.Deposit(100);` → ❌ NullReferenceException (nesne yok)

---

### Karşılaştırma Tablosu

| Özellik | Stack | Heap |
|---------|-------|------|
| **Ne tutar?** | Değişkenler, adresler | Gerçek nesneler |
| **Hız** | Hızlı | Yavaş |
| **Boyut** | Küçük | Büyük |
| **Temizlik** | Otomatik (metot bitince) | Garbage Collector |
| **Örnek** | `int x = 10;` | `new BankAccount(1000);` |

---

### 🎯 Tek cümlelik özet

> Encapsulation: Veriyi sakla (`private field`), dışarıya kurallı kapı ver (`public property`/method).
> Stack: değişkenler ve adresler; Heap: `new` ile oluşan gerçek nesneler.

Böyle yeterli mi, yoksa daha da kısaltmamı ister misin "sadece ezberlik 10 satır" formatında?

