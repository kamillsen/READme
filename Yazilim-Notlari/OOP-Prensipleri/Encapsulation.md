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

```csharp
private decimal _balance;   // field (ham veri)

public decimal Balance      // property (kontrollü erişim)
{
    get { return _balance; }        // okuma
    private set { _balance = value; } // yazma (sadece class içi)
}
```

* `Balance` **metot değil**, property → `account.Balance` yazarsın, `()` yok.
* `get` çağrılır: `var x = account.Balance;`
* `set` çağrılır: `Balance = 100;` → `value = 100`

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

* **Stack**

  * Küçük, hızlı alan.
  * Değişkenler ve **referansların kendisi** burada.

* **Heap**

  * `new` ile oluşturulan **gerçek nesneler** burada.

```csharp
var acc = new BankAccount(1000);
```

* `acc` → stack'te, bir **adres** tutar.
* `new BankAccount(1000)` → heap'teki gerçek nesne.

```text
STACK
acc → 0x00AF12

HEAP
0x00AF12 → { _balance = 1000 }
```

```csharp
var a1 = new BankAccount(1000);
var a2 = a1;            // aynı nesne, aynı adres
var a3 = new BankAccount(1000); // farklı nesne
```

---

### 🎯 Tek cümlelik özet

> Encapsulation: Veriyi sakla (`private field`), dışarıya kurallı kapı ver (`public property`/method).
> Stack: değişkenler ve adresler; Heap: `new` ile oluşan gerçek nesneler.

Böyle yeterli mi, yoksa daha da kısaltmamı ister misin "sadece ezberlik 10 satır" formatında?

