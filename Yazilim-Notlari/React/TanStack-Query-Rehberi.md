# TanStack Query (React Query) Kapsamli Rehber

## 1) TanStack Query Nedir?

**TanStack Query** (eski adiyla *React Query*); React uygulamalarinda **sunucudan gelen veriyi yonetmek (server state)** icin kullanilan bir kutuphanedir.

Klasik `useEffect + useState` ile yapilan fetch islemlerinin yarattigi karmasikligi ortadan kaldirir ve asagidaki isleri **otomatik** ve **akilli** bir sekilde yapar:

- Fetch islemlerini yonetme
- Caching (onbellege alma)
- Loading / Error durum yonetimi
- Arka planda veri guncelleme (background refetch)
- Yeniden fetch etme (refetch)
- Ayni veriyi kullanan componentler arasinda paylasma (request deduplication)

> **Onemli:** TanStack Query **server state** icindir. Local UI durumlari (toggle, form state, modal acik/kapali vb.) icin `useState` / `useReducer` kullanilmaya devam edilir.

---

## 2) Neden Kullanilir?

### Problem: Klasik Yaklasim

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  if (loading) return <p>Yukleniyor...</p>;
  if (error) return <p>Hata: {error.message}</p>;

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
```

**Bu yaklasimin sorunlari:**
- Her component icin ayri ayri loading/error state yonetimi
- Cache yok: ayni veri icin tekrar tekrar fetch
- Race condition riski (cancelled flag ile elle yonetim)
- Birden fazla component ayni veriyi istediginde her biri ayri fetch yapar
- Arka planda veri tazeleme yok
- Kod tekrari cok fazla

### Cozum: TanStack Query

```jsx
function UserList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });

  if (isLoading) return <p>Yukleniyor...</p>;
  if (error) return <p>Hata: {error.message}</p>;

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
```

**TanStack Query ile kazanimlar:**
- Loading / Error / Success state otomatik
- Veri otomatik cache'lenir
- Ayni `queryKey` kullanan tum componentler tek fetch ile beslenir
- Arka planda otomatik veri tazeleme
- Race condition yonetimi dahili
- Retry mekanizmasi hazir

---

## 3) Kurulum ve Baslangic Yapilandirmasi

### Kurulum

```bash
npm install @tanstack/react-query
```

DevTools (opsiyonel ama siddetle onerilir):

```bash
npm install @tanstack/react-query-devtools
```

### QueryClient ve Provider

Uygulamanin en ust seviyesinde `QueryClientProvider` ile sarilmalidir:

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,       // 1 dakika taze sayilir
      retry: 2,                    // Hata durumunda 2 kez daha dener
      refetchOnWindowFocus: true,  // Sekme odaklaninca refetch
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**QueryClient** tum cache'i ve yapilandirmayi tutar. `defaultOptions` ile varsayilan davranislari global olarak ayarlayabilirsin.

---

## 4) useQuery: Sunucudan Veri Cekme

### Temel Kullanim

```jsx
import { useQuery } from '@tanstack/react-query';

function TodoList() {
  const {
    data,          // Basarili sonuc verisi
    isLoading,     // Ilk yuklemede true (cache yokken)
    isFetching,    // Herhangi bir fetch isleminde true (arka plan dahil)
    isError,       // Hata varsa true
    error,         // Hata nesnesi
    isSuccess,     // Basarili ise true
    status,        // 'pending' | 'error' | 'success'
    refetch,       // Manuel refetch fonksiyonu
  } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  if (isLoading) return <p>Yukleniyor...</p>;
  if (isError) return <p>Hata: {error.message}</p>;

  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

### queryKey: Cache Anahtari

`queryKey` React Query'nin cache sisteminin temelidir. Her farkli key, farkli bir cache girisini temsil eder:

```jsx
// Basit key
useQuery({ queryKey: ['todos'], queryFn: fetchAllTodos });

// Parametreli key
useQuery({ queryKey: ['todos', { status: 'done' }], queryFn: fetchDoneTodos });

// Hiyerarsik key
useQuery({ queryKey: ['users', userId, 'posts'], queryFn: () => fetchUserPosts(userId) });
```

**Kurallar:**
- Key degisirse cache biter ve yeni fetch baslar
- Key'ler serialized olarak karsilastirilir: `['todos', { a: 1, b: 2 }]` ile `['todos', { b: 2, a: 1 }]` **aynidir**
- Key her renderda degismemeli (inline fonksiyon veya her renderda yeni olusturulan nesne kullanma)

### queryFn: Veri Cekme Fonksiyonu

`queryFn` bir **Promise donduren** herhangi bir async fonksiyondur:

```jsx
// fetch ile
useQuery({
  queryKey: ['todos'],
  queryFn: async () => {
    const res = await fetch('/api/todos');
    if (!res.ok) throw new Error('Fetch hatasi');
    return res.json();
  },
});

// axios ile
useQuery({
  queryKey: ['todos'],
  queryFn: () => axios.get('/api/todos').then(res => res.data),
});
```

> **Onemli:** `queryFn` hata durumunda **throw** etmelidir. `fetch` API'si HTTP hatalarinda (404, 500 vb.) reject etmez, bu yuzden `res.ok` kontrolu yapilmalidir.

---

## 5) Onemli Opsiyonlar ve Davranislar

### staleTime (Tazelik Suresi)

Verinin **taze (fresh)** sayildigi sure. Bu sure boyunca arka planda refetch **yapilmaz**.

```jsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  staleTime: 1000 * 60 * 5, // 5 dakika taze sayilir
});
```

- **Varsayilan:** `0` (veri aninda stale olur)
- `Infinity` verirsen veri hic stale olmaz (manuel invalidate gerekir)

### gcTime (Garbage Collection Suresi, eski adi: cacheTime)

Kullanilmayan (inactive) verinin **cache'de tutulma suresi**. Component unmount olduktan sonra bu sure kadar cache'de kalir.

```jsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  gcTime: 1000 * 60 * 10, // 10 dakika cache'de tutulur
});
```

- **Varsayilan:** `1000 * 60 * 5` (5 dakika)
- Suresi dolunca veri cache'den silinir (garbage collected)

### staleTime vs gcTime Gorsel Karsilastirma

```
Veri fetch edildi
    |
    v
[FRESH] ----staleTime----> [STALE] (arka plan refetch yapilabilir)
    |                          |
    |                     Component unmount
    |                          |
    |                    [INACTIVE CACHE]
    |                          |
    |                    ----gcTime---->  [CACHE SILINDI]
    |
    |-- Component tekrar mount olursa:
    |     * Cache varsa: aninda goster + arka planda refetch
    |     * Cache yoksa: loading state + yeni fetch
```

### Refetch Davranislari

React Query varsayilan olarak su durumlarda arka planda refetch yapar:

| Davranis | Varsayilan | Aciklama |
|----------|-----------|----------|
| `refetchOnWindowFocus` | `true` | Sekme odaklaninca |
| `refetchOnMount` | `true` | Component mount olunca |
| `refetchOnReconnect` | `true` | Network tekrar baglaninca |
| `refetchInterval` | `false` | Belirli aralikla (polling) |

```jsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  refetchOnWindowFocus: false,    // Sekme odaklaninca refetch yapma
  refetchInterval: 1000 * 30,     // 30 saniyede bir refetch yap (polling)
});
```

### enabled: Kosullu Sorgular

Belirli bir kosul saglanmadan sorgunun calismasini engellemek icin:

```jsx
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId,  // userId varsa calis, yoksa bekleme
});
```

### select: Veri Donusumu

Sunucudan gelen veriyi component'e vermeden once donusturmek icin:

```jsx
const { data: todoTitles } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (data) => data.map(todo => todo.title),
});
// todoTitles: ['Alisveris yap', 'Kod yaz', ...]
```

**Avantaj:** `select` sadece data degistiginde calisir (memoized).

### placeholderData: Gecici Veri

Gercek veri yuklenene kadar gosterilecek gecici veri:

```jsx
import { keepPreviousData } from '@tanstack/react-query';

// Sabit placeholder
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  placeholderData: [],
});

// Onceki veriyi koru (sayfalama icin ideal)
useQuery({
  queryKey: ['todos', page],
  queryFn: () => fetchTodos(page),
  placeholderData: keepPreviousData,
});
```

### retry: Hata Durumunda Tekrar Deneme

```jsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  retry: 3,                // 3 kez daha dene (toplam 4 deneme)
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  // Exponential backoff: 1s, 2s, 4s, 8s... (max 30s)
});
```

- **Varsayilan:** `3` tekrar deneme
- `false` ile devre disi birakilabilir
- Fonksiyon olarak da verilebilir: `(failureCount, error) => ...`

---

## 6) useMutation: Veri Gonderme (POST / PUT / PATCH / DELETE)

`useMutation` sunucuya veri gonderme (yazma) islemleri icin kullanilir. `useQuery`'den farkli olarak otomatik calismas, tetiklenmesi gerekir.

### Temel Kullanim

```jsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function AddTodo() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newTodo) => {
      return fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
        headers: { 'Content-Type': 'application/json' },
      }).then(res => res.json());
    },
    onSuccess: () => {
      // Mutation basarili olunca todos cache'ini gecersiz kil
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => {
      console.error('Hata:', error.message);
    },
  });

  const handleSubmit = () => {
    mutation.mutate({ title: 'Yeni Todo', completed: false });
  };

  return (
    <div>
      <button
        onClick={handleSubmit}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Ekleniyor...' : 'Todo Ekle'}
      </button>
      {mutation.isError && <p>Hata: {mutation.error.message}</p>}
      {mutation.isSuccess && <p>Basariyla eklendi!</p>}
    </div>
  );
}
```

### Mutation Yasam Dongusu Callback'leri

```jsx
useMutation({
  mutationFn: updateTodo,
  onMutate: (variables) => {
    // Mutation baslamadan once calisir
    // Optimistic update icin kullanilir
    console.log('Basliyor:', variables);
  },
  onSuccess: (data, variables, context) => {
    // Mutation basarili olunca
    console.log('Basarili:', data);
  },
  onError: (error, variables, context) => {
    // Mutation hata verince
    console.log('Hata:', error);
  },
  onSettled: (data, error, variables, context) => {
    // Basarili veya hatali, her durumda calisir (finally gibi)
    console.log('Tamamlandi');
  },
});
```

### invalidateQueries: Cache Gecersiz Kilma

Mutation sonrasi ilgili query'leri gecersiz kilarak guncel verinin cekilmesini saglar:

```jsx
const queryClient = useQueryClient();

// Belirli bir key'i gecersiz kil
queryClient.invalidateQueries({ queryKey: ['todos'] });

// Tum 'todos' ile baslayan key'leri gecersiz kil
queryClient.invalidateQueries({ queryKey: ['todos'] });
// Bu su key'lerin hepsini gecersiz kilar:
//   ['todos']
//   ['todos', 1]
//   ['todos', { status: 'done' }]

// Tam eslesme icin
queryClient.invalidateQueries({ queryKey: ['todos'], exact: true });
// Sadece ['todos'] key'ini gecersiz kilar
```

---

## 7) Optimistic Updates (Iyimser Guncellemeler)

Mutation sonucunu beklemeden arayuzu aninda guncellemek icin kullanilir. Hata olursa eski haline geri doner.

```jsx
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // 1. Devam eden refetch'leri iptal et (cakisma olmasin)
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // 2. Mevcut cache'i yedekle (rollback icin)
    const previousTodos = queryClient.getQueryData(['todos']);

    // 3. Cache'i iyimser olarak guncelle
    queryClient.setQueryData(['todos'], (old) =>
      old.map(todo =>
        todo.id === newTodo.id ? { ...todo, ...newTodo } : todo
      )
    );

    // 4. Yedegi context olarak dondur
    return { previousTodos };
  },
  onError: (err, newTodo, context) => {
    // Hata olursa eski veriye geri don
    queryClient.setQueryData(['todos'], context.previousTodos);
  },
  onSettled: () => {
    // Her durumda sunucudan guncel veriyi al
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

**Gorsel Akis:**

```
Kullanici "Tamamla" butonuna tikladiginda:

[UI aninda guncellenir] ---> [Mutation sunucuya gider]
        |                              |
        |                     Basarili?  Hatali?
        |                       |            |
        |                  invalidate     rollback
        |                  (sunucudan     (eski cache'e
        |                   guncel al)     geri don)
```

---

## 8) useInfiniteQuery: Sonsuz Yukleme (Infinite Scroll / Load More)

Sayfalamali verileri parca parca yuklemek icin:

```jsx
import { useInfiniteQuery } from '@tanstack/react-query';

function InfinitePostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) =>
      fetch(`/api/posts?cursor=${pageParam}`).then(res => res.json()),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  if (isLoading) return <p>Yukleniyor...</p>;

  return (
    <div>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.items.map(post => (
            <div key={post.id}>{post.title}</div>
          ))}
        </div>
      ))}

      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? 'Yukleniyor...'
          : hasNextPage
            ? 'Daha Fazla Yukle'
            : 'Hepsi yuklendi'}
      </button>
    </div>
  );
}
```

**Onemli Noktalar:**
- `data.pages` bir dizi olarak tum sayfalari icerir
- `getNextPageParam` fonksiyonu sonraki sayfanin parametresini belirler; `undefined` donerse `hasNextPage` false olur
- `getPreviousPageParam` ile geri sayfalama da mumkundur

---

## 9) Paralel ve Bagimli Sorgular

### Paralel Sorgular

Birbirinden bagimsiz sorgular ayni component'te paralel olarak calisir:

```jsx
function Dashboard() {
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const postsQuery = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
  const statsQuery = useQuery({ queryKey: ['stats'], queryFn: fetchStats });

  // Uc sorgu da ayni anda paralel calisir
}
```

Dinamik sayida paralel sorgu icin `useQueries`:

```jsx
const results = useQueries({
  queries: userIds.map(id => ({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  })),
});
```

### Bagimli (Dependent) Sorgular

Bir sorgunun calisabilmesi icin onceki sorgunun tamamlanmasi gerektiginde:

```jsx
function UserPosts({ userId }) {
  // 1. Once kullaniciyi cek
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  // 2. Kullanici geldikten sonra postlarini cek
  const { data: posts } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: () => fetchPostsByUser(user.id),
    enabled: !!user?.id,  // user yoksa calisma
  });
}
```

---

## 10) Prefetching: Onceden Veri Yukleme

Kullanici bir sayfaya gitmeden once veriyi onceden cache'e yukleyerek UX iyilestirmesi yapilabilir.

### Hover'da Prefetch

```jsx
function TodoList() {
  const queryClient = useQueryClient();

  const prefetchTodo = (id) => {
    queryClient.prefetchQuery({
      queryKey: ['todo', id],
      queryFn: () => fetchTodo(id),
      staleTime: 1000 * 60 * 5, // 5 dakika onceden cache'le
    });
  };

  return (
    <ul>
      {todos.map(todo => (
        <li
          key={todo.id}
          onMouseEnter={() => prefetchTodo(todo.id)}
        >
          <Link to={`/todos/${todo.id}`}>{todo.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

### Router Seviyesinde Prefetch

```jsx
// React Router loader icinde
export const loader = (queryClient) => async ({ params }) => {
  await queryClient.ensureQueryData({
    queryKey: ['todo', params.id],
    queryFn: () => fetchTodo(params.id),
  });
  return null;
};
```

`ensureQueryData`: Cache'de veri varsa ve taze ise fetch yapmaz, yoksa fetch yapar.

---

## 11) Query Cancellation (Sorgu Iptali)

Component unmount olursa veya queryKey degisirse devam eden fetch iptali:

```jsx
useQuery({
  queryKey: ['todos'],
  queryFn: ({ signal }) => {
    return fetch('/api/todos', { signal }).then(res => res.json());
  },
});
```

`signal` parametresi `AbortSignal` nesnesidir. Fetch API ve Axios bu signal'i destekler. Component unmount olursa veya key degisirse TanStack Query otomatik olarak iptal eder.

```jsx
// Axios ile
useQuery({
  queryKey: ['todos'],
  queryFn: ({ signal }) => {
    return axios.get('/api/todos', { signal }).then(res => res.data);
  },
});
```

---

## 12) React Query DevTools

Cache durumunu goruntulemek, debug yapmak ve refetch gecmisini izlemek icin:

```jsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**DevTools ile gorebileceklerin:**
- Tum cache'deki query'ler ve durumlari (fresh, stale, inactive, fetching)
- Her query'nin verisi, zamanlama bilgileri
- Manuel refetch / invalidate / remove islemleri
- Production build'de otomatik olarak cikarilir

---

## 13) Sayfalama (Pagination)

### Klasik Sayfalama (Numbered Pages)

```jsx
function PaginatedPosts() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => fetchPosts(page),
    placeholderData: keepPreviousData, // Sayfa degisirken onceki veriyi goster
  });

  return (
    <div>
      {isLoading ? (
        <p>Yukleniyor...</p>
      ) : (
        data.items.map(post => <PostItem key={post.id} post={post} />)
      )}

      <div>
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          Onceki
        </button>
        <span>Sayfa {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={isPlaceholderData || !data?.hasMore}
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}
```

`keepPreviousData` ile sayfa gecislerinde onceki veriler gosterilir, yeni veri yuklenene kadar bos ekran olmaz.

---

## 14) Suspense Entegrasyonu

React Suspense ile birlikte kullanilabilir:

```jsx
import { useSuspenseQuery } from '@tanstack/react-query';

function TodoList() {
  // isLoading kontrolu gerekmez, Suspense halleder
  const { data } = useSuspenseQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  return (
    <ul>
      {data.map(todo => <li key={todo.id}>{todo.title}</li>)}
    </ul>
  );
}

// Ust component'te Suspense boundary
function App() {
  return (
    <Suspense fallback={<p>Yukleniyor...</p>}>
      <TodoList />
    </Suspense>
  );
}
```

**Avantajlari:**
- Component icinde loading kontrolu yapmana gerek kalmaz
- Birden fazla sorgu icin tek bir loading state (Suspense boundary)
- Error Boundary ile hata yonetimi de merkezilestirilebilir

---

## 15) Best Practices (En Iyi Kullanim Onerileri)

### 1. Custom Hook'lar Olustur

Fetch mantigi component'ten ayrilmalidir:

```jsx
// hooks/useTodos.js
export function useTodos(filters) {
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => fetchTodos(filters),
    staleTime: 1000 * 60 * 5,
  });
}

// hooks/useCreateTodo.js
export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

// Component'te kullanim
function TodoPage() {
  const { data: todos, isLoading } = useTodos({ status: 'active' });
  const { mutate: addTodo } = useCreateTodo();
  // ...
}
```

### 2. Query Key Factory Kullan

Buyuk projelerde key'lerin tutarliligini saglamak icin:

```jsx
// queryKeys.js
export const todoKeys = {
  all:     ['todos'],
  lists:   ()       => [...todoKeys.all, 'list'],
  list:    (filters) => [...todoKeys.lists(), filters],
  details: ()       => [...todoKeys.all, 'detail'],
  detail:  (id)     => [...todoKeys.details(), id],
};

// Kullanim
useQuery({ queryKey: todoKeys.list({ status: 'done' }), queryFn: ... });
useQuery({ queryKey: todoKeys.detail(5), queryFn: ... });

// Invalidation - tum todo list'leri gecersiz kil
queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
```

### 3. staleTime Ayarini Dusun

- Sik degisen veri (chat mesajlari, canli skor): `staleTime: 0` veya kisa polling
- Nadir degisen veri (kullanici profili, ayarlar): `staleTime: 1000 * 60 * 10` (10 dk)
- Neredeyse hic degismeyen veri (ulke listesi): `staleTime: Infinity`

### 4. Error Boundary Kullan

```jsx
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            <div>
              <p>Bir hata olustu!</p>
              <button onClick={() => resetErrorBoundary()}>
                Tekrar Dene
              </button>
            </div>
          )}
        >
          <TodoList />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

### 5. Global Hata ve Basari Yonetimi

```jsx
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (error.status === 401) {
        // Oturum suresi doldu, login sayfasina yonlendir
        window.location.href = '/login';
      }
      toast.error(`Hata: ${error.message}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(`Islem hatasi: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Islem basarili!');
    },
  }),
});
```

### 6. Gereksiz Refetch'ten Kacin

```jsx
// YANLIS: Her renderda yeni referans olusturur
useQuery({
  queryKey: ['todos', { filters }], // filters her renderda yeni nesne ise sorun
  queryFn: fetchTodos,
});

// DOGRU: Stabil referans kullan
const filters = useMemo(() => ({ status, priority }), [status, priority]);
useQuery({
  queryKey: ['todos', filters],
  queryFn: () => fetchTodos(filters),
});
```

---

## 16) TanStack Query Yetenekleri Ozet Tablosu

| Ozellik | Aciklama |
|---------|----------|
| **Caching** | Ayni queryKey icin veri otomatik cache'lenir |
| **Background Refetch** | Stale veri otomatik arka planda tazelenir |
| **Stale & Fresh Mantigi** | staleTime ile verinin tazeligi kontrol edilir |
| **Retry** | Hatali istekler otomatik tekrar denenir |
| **Mutations & Invalidation** | Yazma islemleri ve sonrasinda cache temizligi |
| **Optimistic Updates** | Sunucu yanitini beklemeden UI guncelleme |
| **Pagination** | Sayfalamali veri yonetimi |
| **Infinite Query** | Sonsuz scroll / load more destegi |
| **Prefetching** | Onceden veri yukleme |
| **Request Deduplication** | Ayni anda ayni istegi tek fetch ile yapma |
| **Query Cancellation** | AbortController ile istek iptali |
| **Suspense** | React Suspense entegrasyonu |
| **DevTools** | Cache durumu gorsellestirme |
| **SSR Destegi** | Server-side rendering uyumlulugu |
| **Offline Destegi** | Cevrimdisi mod destegiyle kuyruk sistemi |

---

## 17) Dikkat Edilmesi Gerekenler

| Durum | Aciklama |
|-------|----------|
| Client state icin kullanma | Toggle, form input, modal state gibi seyler icin `useState` kullan |
| queryKey her renderda degismemeli | Inline object/array yerine stabil referanslar kullan |
| queryFn icinde hata firlatmayi unutma | `fetch` API HTTP hatalarinda reject etmez, `res.ok` kontrol et |
| staleTime'i dusunmeden birakma | Varsayilan `0`dir, gereksiz refetch'lere yol acar |
| Mutation sonrasi invalidate unutma | Aksi halde cache eski veriyi gostermeye devam eder |
| DevTools'u kur | Gelistirme sirasinda cache davranisini anlamayi kolaylastirir |

---

## 18) Ornek Kullanim Senaryolari

### Senaryo 1: Kullanici Profil Sayfasi

Kullanici bilgisini cekme, duzenleme ve cache yonetimi:

```jsx
// hooks/useUser.js
export function useUser(userId) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
    staleTime: 1000 * 60 * 10, // Profil bilgisi 10 dk taze
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }) =>
      fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: (updatedUser) => {
      // Cache'i sunucudan donen veri ile guncelle (ekstra fetch yok)
      queryClient.setQueryData(['user', updatedUser.id], updatedUser);
    },
  });
}

// ProfilePage.jsx
function ProfilePage({ userId }) {
  const { data: user, isLoading } = useUser(userId);
  const { mutate: updateUser, isPending } = useUpdateUser();

  if (isLoading) return <p>Profil yukleniyor...</p>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button
        onClick={() => updateUser({ userId, data: { name: 'Yeni Isim' } })}
        disabled={isPending}
      >
        {isPending ? 'Kaydediliyor...' : 'Ismi Guncelle'}
      </button>
    </div>
  );
}
```

---

### Senaryo 2: E-Ticaret Urun Listesi + Filtreleme + Sayfalama

```jsx
// hooks/useProducts.js
const productKeys = {
  all: ['products'],
  list: (filters) => [...productKeys.all, 'list', filters],
  detail: (id) => [...productKeys.all, 'detail', id],
};

export function useProducts(filters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () =>
      fetch(`/api/products?${new URLSearchParams(filters)}`).then(r => r.json()),
    placeholderData: keepPreviousData, // Filtre degisirken onceki veri gozuksun
    staleTime: 1000 * 60 * 2,
  });
}

// ProductListPage.jsx
function ProductListPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('price_asc');

  const filters = useMemo(
    () => ({ page, category, sort }),
    [page, category, sort]
  );

  const { data, isLoading, isPlaceholderData } = useProducts(filters);
  const queryClient = useQueryClient();

  // Sonraki sayfayi onceden yukle
  useEffect(() => {
    if (data?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: productKeys.list({ ...filters, page: page + 1 }),
        queryFn: () =>
          fetch(`/api/products?${new URLSearchParams({ ...filters, page: page + 1 })}`).then(r => r.json()),
      });
    }
  }, [data, filters, page, queryClient]);

  return (
    <div>
      {/* Filtreler */}
      <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
        <option value="all">Tumu</option>
        <option value="electronics">Elektronik</option>
        <option value="clothing">Giyim</option>
      </select>

      <select value={sort} onChange={e => setSort(e.target.value)}>
        <option value="price_asc">Fiyat (Artan)</option>
        <option value="price_desc">Fiyat (Azalan)</option>
      </select>

      {/* Urun Listesi */}
      {isLoading ? (
        <p>Yukleniyor...</p>
      ) : (
        <div style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
          {data.items.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Sayfalama */}
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Onceki
      </button>
      <span>Sayfa {page} / {data?.totalPages}</span>
      <button
        onClick={() => setPage(p => p + 1)}
        disabled={isPlaceholderData || !data?.hasMore}
      >
        Sonraki
      </button>
    </div>
  );
}
```

---

### Senaryo 3: Canli Dashboard (Polling ile Otomatik Guncelleme)

```jsx
function LiveDashboard() {
  // Her 10 saniyede guncel istatistikleri cek
  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 1000 * 10, // 10 saniye polling
  });

  // Her 30 saniyede son siparisleri cek
  const { data: recentOrders } = useQuery({
    queryKey: ['dashboard', 'recent-orders'],
    queryFn: fetchRecentOrders,
    refetchInterval: 1000 * 30, // 30 saniye polling
  });

  // Sekme arka plandayken polling durdur (performans icin)
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 1000 * 15,
    refetchIntervalInBackground: false, // Sekme arka plandayken durur
  });

  return (
    <div>
      <StatsPanel stats={stats} />
      <OrderTable orders={recentOrders} />
      <NotificationList notifications={notifications} />
    </div>
  );
}
```

---

### Senaryo 4: Sonsuz Scroll ile Sosyal Medya Akisi

```jsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

function SocialFeed() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) =>
      fetch(`/api/feed?cursor=${pageParam}&limit=20`).then(r => r.json()),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 60,
  });

  // Kullanici sayfanin altina geldiginde otomatik yukle
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <p>Akis yukleniyor...</p>;

  return (
    <div>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}

      <div ref={ref}>
        {isFetchingNextPage && <p>Daha fazla yukleniyor...</p>}
        {!hasNextPage && <p>Tum gonderiler yuklendi.</p>}
      </div>
    </div>
  );
}
```

---

### Senaryo 5: Optimistic Update ile Todo Uygulamasi

```jsx
function TodoApp() {
  const queryClient = useQueryClient();
  const { data: todos } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }) =>
      fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      }).then(r => r.json()),

    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = queryClient.getQueryData(['todos']);

      queryClient.setQueryData(['todos'], (old) =>
        old.map(t => t.id === id ? { ...t, completed } : t)
      );

      return { previous };
    },

    onError: (err, vars, context) => {
      queryClient.setQueryData(['todos'], context.previous);
      toast.error('Guncelleme basarisiz, geri alindi.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      fetch(`/api/todos/${id}`, { method: 'DELETE' }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = queryClient.getQueryData(['todos']);

      queryClient.setQueryData(['todos'], (old) =>
        old.filter(t => t.id !== id)
      );

      return { previous };
    },

    onError: (err, id, context) => {
      queryClient.setQueryData(['todos'], context.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <ul>
      {todos?.map(todo => (
        <li key={todo.id} style={{ opacity: todo.completed ? 0.5 : 1 }}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() =>
              toggleMutation.mutate({ id: todo.id, completed: !todo.completed })
            }
          />
          <span>{todo.title}</span>
          <button onClick={() => deleteMutation.mutate(todo.id)}>Sil</button>
        </li>
      ))}
    </ul>
  );
}
```

---

## 19) Sonuc

TanStack Query, React'taki klasik `useEffect + useState` fetch karmasasini cozen **akilli, cache'li ve yuksek performansli** bir server-state yonetim aracidir.

**Ozet Karsilastirma:**

```
useEffect + useState           vs         TanStack Query
──────────────────                        ──────────────────
Manuel loading state                      Otomatik
Manuel error handling                     Otomatik
Cache yok                                 Akilli cache
Race condition riski                      Dahili yonetim
Tekrar fetch elle                         Otomatik refetch
Ayni veri icin N fetch                    Request deduplication
Kod tekrari                               Custom hook ile temiz
Retry elle                                Otomatik retry
```

Basit fetch'ten ileri duzey veri senkronizasyonuna kadar daha kisa kod, daha hizli UX ve pratik cache kontrolu saglar.

---

## Kaynaklar

- [TanStack Query Resmi Dokumantasyon](https://tanstack.com/query/latest/docs)
- [TanStack Query](https://tanstack.com/query)
- [Beginner's Guide to React Query - Zero To Mastery](https://zerotomastery.io/blog/react-query/)
- [TanStack Query React Queries Guide](https://tanstack.com/query/v5/docs/react/guides/queries)
- [TanStack Query Important Defaults](https://tanstack.com/query/v4/docs/react/guides/important-defaults)
- [TanStack Query: The Data Fetching Solution - Medium](https://medium.com/simform-engineering/tanstack-query-the-data-fetching-solution-youve-been-looking-for-60e6e14261e6)
