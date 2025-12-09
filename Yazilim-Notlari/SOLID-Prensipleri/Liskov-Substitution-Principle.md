# 📌 LSP – Liskov Substitution Principle (Yerine Geçme Prensibi)

> **Bir sınıfın türevi (alt sınıfı) her zaman üst sınıfın/interface'in yerine sorunsuzca kullanılabilmelidir.**

> Yani `Dog`, bir `IAnimal` gibi davranabilmelidir.

---

## 1️⃣ LSP ne işe yarar?

Polimorfizmin **güvenli** çalışmasını sağlar.

Bir yerde `IAnimal` bekleniyorsa, `Dog` veya `Cat` verildiğinde kod bozulmamalıdır.

---

## 2️⃣ Mantığı (gerçek örnekle zihne oturtma)

"IAnimal konuşabilir (Speak)."

Bu bir **sözleşme**.

Dog ve Cat bu sözleşmeye uyarsa, yani:

* Dog → "Hav!" der
* Cat → "Miyav!" der

O zaman ikisi de **IAnimal'in yerine geçebilir**.

> Bir yerde "hayvan" (IAnimal) bekleyen koda köpek (Dog) verirsen işler bozulmamalı.

> İşte LSP tam olarak bunu ister.

---

## 3️⃣ LSP olmazsa ne olur?

Eğer alt sınıf sözleşmeyi bozarsa:

❌ Beklenen davranış çalışmaz

❌ Polimorfizm çöker

❌ Kod tahmin edilemez hale gelir

❌ "IAnimal bekliyor ama Cat verince patladı" hatası oluşur

Örneğin:

`Cat.Speak()` hata fırlatırsa → **LSP ihlali olur.**

---

## 4️⃣ Örnek Kod ile LSP İncelemesi

### ✔️ Interface (sözleşme)

```csharp
public interface IAnimal
{
    void Speak();
}
```

Bu şu demektir:

> "Her IAnimal konuşabilir."

### ✔️ Dog ve Cat bu sözleşmeyi doğru uyguluyor

```csharp
public class Dog : IAnimal
{
    public void Speak() => Console.WriteLine("Hav!");
}

public class Cat : IAnimal
{
    public void Speak() => Console.WriteLine("Miyav!");
}
```

İkisi de **beklenen davranışı sağlıyor** → LSP ✔

---

## 🧑‍🏫 5️⃣ IAnimal kullanan sınıf (LSP'nin çalıştığını gösteren kısım)

```csharp
public class AnimalTrainer
{
    private readonly IAnimal _animal;

    public AnimalTrainer(IAnimal animal)
    {
        _animal = animal;
    }

    public void MakeAnimalSpeak()
    {
        _animal.Speak();
    }
}
```

Trainer, sadece **IAnimal bildiği** için Dog veya Cat fark etmez.

### Kullanım:

```csharp
var dogTrainer = new AnimalTrainer(new Dog());
dogTrainer.MakeAnimalSpeak(); // Hav!

var catTrainer = new AnimalTrainer(new Cat());
catTrainer.MakeAnimalSpeak(); // Miyav!
```

Bu kullanımın **sorunsuz çalışmasının sebebi**:

👉 Dog ve Cat, IAnimal sözleşmesini bozmadıkları için LSP uygulanmıştır.

---

## ❌ LSP ihlaline örnek

Aşağıdaki gibi olsaydı:

```csharp
public class Cat : IAnimal
{
    public void Speak()
    {
        throw new NotImplementedException();
    }
}
```

Şu kod patlar:

```csharp
IAnimal a = new Cat();
a.Speak(); // BOOOM!
```

Bu durumda:

* Cat, IAnimal'ın beklenen davranışını bozar
* LSP ihlal edilir
* Polimorfizm çalışmaz

---

## 6️⃣ Kafaya Yazılacak Kurallar

* ❗ "Alt sınıf, üst sınıfın yerine geçebilmeli."

* ❗ Interface veya base class'ın garantilediği davranış **bozulmamalı**.

* ❗ Polimorfizm → LSP sayesinde güvenle çalışır.

* ❗ Sözleşmeyi bozan alt sınıf = LSP ihlali.

---

## 7️⃣ Tek cümlelik özet

> **LSP = Dog bir IAnimal gibi kullanılınca hiçbir sürpriz olmamalı. Alt sınıf, üst sınıfın sözünü tutmalıdır.**

---

Hazırsan şimdi **ISP – Interface Segregation Principle** için aynı formatta devam edebilirim.








