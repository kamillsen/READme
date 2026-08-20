=> AuthorizationHandlerContext context bunun içinde neler var ? Ve buna içindekileri kim veriyor nerede - basit kod ile anlat ? 
context.User
Gelen kullanıcının claim/role bilgileri

context.Requirements
Kontrol edilmesi gereken requirement’lar

context.Resource
Varsa kontrol edilen nesne

bunlara kod üzerinden örnek verir misin basitçe ?

=> context.Succeed(requirement); -> bu fonksiyon arka plandaki kodu ne - ne yapar basit kod ile anlat.

=> builder.Services.AddSingleton<IAuthorizationHandler, FinanceDepartmentHandler>(); Neden Singleton peki ? Mantığı ne ?



!! AddAuthorization:
Policy adını ve içindeki requirement’ları kaydeder.

AddSingleton<IAuthorizationHandler, FinanceDepartmentHandler>:
Bu handler’ı authorization sisteminin kullanabileceği handler listesine ekler.

AuthorizationHandler<FinanceDepartmentRequirement>:
Bu handler’ın hangi requirement tipiyle ilgilendiğini söyler.

buna göre biz  handler ve Requirement veriyoruz. Sistem  sistem gelen requirement e göde handler listesinden AuthorizationHandler<FinanceDepartmentRequirement>: bunu alana bakıyor. Ve bu sayede doğru handler mı çalışıyor ?