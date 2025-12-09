# ✅ Interface Segregation Principle (ISP) – Arayüz Ayrımı Prensibi

## 1️⃣ Kısa tanım + Ne işe yarar?

**Bir sınıf, kullanmadığı metotları içeren büyük bir interface'i implement etmek zorunda bırakılmamalıdır.**

Yani interface'ler **küçük, amaca özel** olmalıdır.

---

## 2️⃣ Mantığını açıkla (gerçek hayat benzetmesi)

Bir **kumanda** düşün.

* TV açma
* Ses artırma
* Kanal değiştirme

normaldir.

Ama kumandaya şunları da eklediğini düşün:

* Klima modu
* Araba çalıştırma
* Fırın ısıtma

Bu komik olur. Çünkü kumanda bu işlevlerin hiçbirini *kullanmaz*.

Kodda da aynısı geçerli:

Bir sınıf, **kullanmadığı metotları** implement ediyorsa → *yanlış tasarım*, karmaşa ve gereksiz bağımlılık.

ISP der ki:

> "Her iş için ayrı interface oluştur. Büyük interface yerine küçük, odaklı interface'ler kullan."

---

## 3️⃣ Neden var, olmasa ne olur?

ISP ihlal edilirse:

❌ Sınıflar gereksiz metotları implement etmek zorunda kalır

❌ Boş metotlar oluşur

❌ Kod okunamaz hale gelir

❌ Gereksiz bağımlılıklar artar

❌ Test etmek zorlaşır

ISP ile:

✔ Interface'ler küçük ve amaca yönelik olur

✔ Sınıflar sadece ihtiyaç duydukları metotları implement eder

✔ Kod daha temiz, genişletilebilir ve bakımı kolay olur

---

## 4️⃣ Kafaya yazılacak kurallar

* ❗ "Büyük interface yok, küçük ve odaklı interface var."

* ❗ Sınıfa *lazım olmayan* metotları zorla implement ettirme.

* ❗ Interface'leri sorumluluklara göre ayır.

* ❗ Bir sınıf sadece gerçekten kullandığı davranışı bilsin.

---

## 5️⃣ C# Örneği

### ❌ Yanlış: Büyük, şişmiş interface

```csharp
public interface IAnimal
{
    void Walk();
    void Fly();
    void Swim();
}
```

Penguen uçmaz → boş implementasyon yapmak zorunda kalır.

```csharp
public class Penguin : IAnimal
{
    public void Walk() { ... }

    public void Swim() { ... }

    public void Fly() 
    {
        // ISP ihlali: Penguen uçmaz!
        throw new NotSupportedException();
    }
}
```

Bu tasarım yanlıştır çünkü **sözleşme şişkin ve gereksiz yük bindiriyor.**

---

### ✔ Doğru: Interface'ler sorumluluğa göre ayrılır

```csharp
public interface IWalkable
{
    void Walk();
}

public interface ISwimmable
{
    void Swim();
}

public interface IFlyable
{
    void Fly();
}
```

Penguen için:

```csharp
public class Penguin : IWalkable, ISwimmable
{
    public void Walk() { ... }

    public void Swim() { ... }
}
```

Kartal için:

```csharp
public class Eagle : IWalkable, IFlyable
{
    public void Walk() { ... }

    public void Fly() { ... }
}
```

Hiçbir sınıf **kullanmadığı metodu** implement etmek zorunda değil → ISP ✔

---

## 6️⃣ Kısacık Özet

> **ISP: Bir sınıfı gereksiz metotlarla zorlamayacaksın. Büyük interface yerine küçük interface kullanacaksın.**

---

Hazırsan son prensip olan

# 🔜 **D — Dependency Inversion Principle (DIP)**

için aynı şekilde devam edebilirim.








