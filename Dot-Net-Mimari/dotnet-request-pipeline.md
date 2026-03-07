# .NET Clean Architecture - Request Pipeline

## Express.js vs .NET Clean Architecture Karşılaştırması

Express'te her şey tek bir middleware zinciri olarak çalışır. .NET Clean Architecture'da ise **iki seviyeli** bir pipeline vardır.

---

## Express.js'de Yapı

```js
// Tek zincir: middleware → middleware → controller
router.post('/users',
  authenticate,          // JWT kontrol
  authorize('admin'),    // Yetki kontrol
  validate(userSchema),  // Validation
  userController.create  // İş mantığı
);
```

---

## .NET Clean Architecture'da İstek Akışı

```
İSTEK
  │
  ▼
┌──────────────────────────────────┐
│  1) ASP.NET Middleware Pipeline  │  ← Express middleware'e benzer
│     (Program.cs'de tanımlanır)   │
│                                  │
│  • CORS                          │
│  • Rate Limiting                 │
│  • JWT Authentication            │  ← Token geçerli mi?
│  • Authorization                 │  ← Role/Policy kontrolü
│  • Global Exception Handler      │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  2) Controller                   │  ← Express route handler gibi
│     (sadece MediatR'a yönlendir) │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  3) MediatR Pipeline Behaviors   │  ← Express'te yok, bu extra katman
│                                  │
│  • Validation Behavior           │  ← FluentValidation burada çalışır
│  • Caching Behavior              │
│  • Logging Behavior              │
│  • Transaction Behavior          │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  4) Handler (Use Case)           │  ← Asıl iş mantığı
└──────────────────────────────────┘
```

---

## Kod Örnekleri

### 1. Middleware Pipeline (Program.cs)

Express'teki `app.use()` karşılığı:

```csharp
// Program.cs
var app = builder.Build();

app.UseHttpsRedirection();                    // app.use(helmet())
app.UseCors("MyPolicy");                      // app.use(cors())
app.UseRateLimiter();                         // app.use(rateLimit())
app.UseAuthentication();                      // app.use(passport.authenticate())
app.UseAuthorization();                       // app.use(authorize())
app.UseMiddleware<ExceptionMiddleware>();      // app.use(errorHandler)

app.MapControllers();
```

---

### 2. Controller

Express route'a benzer ama çok ince. Controller'da iş mantığı yoktur, sadece MediatR'a yönlendirir:

```csharp
// Express'te:
// router.post('/users', validate(schema), controller.create)

// .NET'te:
[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Admin")]        // ← Express'teki authorize('admin')
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    [HttpPost]
    public async Task<IActionResult> Create(CreateUserCommand command)
    {
        // Controller'da iş mantığı YOK
        // Sadece MediatR'a gönder, o pipeline'dan geçirir
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
```

---

### 3. MediatR Pipeline Behavior (Validation)

Express'te karşılığı yoktur. Her request otomatik olarak tüm behavior'lardan geçer:

```csharp
// Validation Behavior — her request otomatik validate edilir
// Express'teki validate(schema) middleware gibi ama GLOBAL
public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // 1. Tüm validator'ları çalıştır
        var failures = _validators
            .Select(v => v.Validate(request))
            .SelectMany(result => result.Errors)
            .Where(f => f != null)
            .ToList();

        // 2. Hata varsa fırlat (handler'a ulaşmaz)
        if (failures.Any())
            throw new ValidationException(failures);

        // 3. Hata yoksa devam et (next middleware / handler)
        return await next();  // ← Express'teki next() ile aynı mantık!
    }
}
```

---

### 4. FluentValidation

Express'teki Joi/Yup schema karşılığı:

```csharp
// Express'te:   const schema = Joi.object({ email: Joi.string().email() })

// .NET'te:
public class CreateUserValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email zorunlu")
            .EmailAddress().WithMessage("Geçerli email girin");

        RuleFor(x => x.Password)
            .MinimumLength(6).WithMessage("En az 6 karakter");
    }
}
```

---

### 5. Handler (Use Case)

Asıl iş mantığı burada çalışır. Express controller body'sine benzer:

```csharp
public class CreateUserHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    public async Task<UserDto> Handle(
        CreateUserCommand request, CancellationToken ct)
    {
        // Buraya geldiğinde:
        // ✅ JWT doğrulanmış        (Middleware)
        // ✅ Yetki kontrol edilmiş  (Authorize attribute)
        // ✅ Validation geçmiş      (Pipeline Behavior)
        // ✅ Transaction başlamış   (Pipeline Behavior)

        // Sadece iş mantığına odaklan
        var user = new User(request.Email, request.Password);
        await _repository.AddAsync(user);
        return _mapper.Map<UserDto>(user);
    }
}
```

---

## Özet Karşılaştırma Tablosu

| Express.js | .NET Clean Architecture | Nerede? |
|---|---|---|
| `app.use(cors())` | `app.UseCors()` | Program.cs |
| `app.use(rateLimit())` | `app.UseRateLimiter()` | Program.cs |
| `passport.authenticate('jwt')` | `app.UseAuthentication()` | Program.cs |
| `authorize('admin')` | `[Authorize(Roles = "Admin")]` | Controller attribute |
| `validate(schema)` | `ValidationBehavior` | MediatR pipeline (otomatik) |
| Joi / Yup schema | `FluentValidation` | Validator class |
| `router.post(...)` handler body | `Handler` class | MediatR handler |

---

## En Büyük Fark

- **Express'te**: Her route'a middleware'leri elle ekliyorsun.
- **.NET'te**: MediatR Pipeline Behaviors **otomatik olarak tüm request'lere** uygulanır. Bir kez yaz, her yerde çalışsın.
