# Modern Angular - New Provider Functions

This exercise focuses on the new Provider Functions that were introduced with Angular v14.

## Goal

In this exercise you will learn how to transition from the traditional `NgModule` import based
provider to the new provider functions.

In the end we will have removed the `AppRoutingModule` as well as all of the `importProvidersFrom`
bridging function usages.

The following steps need to be done in order to complete this exercise:

1. remove `AppRoutingModule` and only export `Routes` configuration 
2. replace `importProvidersFrom` with proper `provideXy` usages
3. introduce functional `ReadAccessInterceptor`

## 1. Remove `AppRoutingModule`

As we only want to use the `Routes` configuration without having the need for a dedicated `RoutingModule`,
let's remove the `AppRoutingModule` and export only the configuration.

Also rename the file to `app.routes.ts`.

<details>
  <summary>App Routes</summary>

```ts
// app.routes.ts

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./movie/movie.routes').then((f) => f.movieRoutes),
  },
  {
    path: '**',
    loadChildren: () => {
      return import('./not-found-page/not-found-page.module').then(
        (m) => m.NotFoundPageModule
      );
    },
  },
];
```

</details>

Great, in order to make the application work again, head over to the `main.ts` file.
You should now replace the failing `importProvidersFrom(AppRoutingModule)` statement
with the newly introduced `provideRouter()` method.

<details>
  <summary>provideRouter</summary>

```ts
// main.ts
import { appRoutes } from './app/app.routes'

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule),
    provideRouter(appRoutes),
    importProvidersFrom(HttpClientModule),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ReadAccessInterceptor,
      multi: true,
    },
  ],
}).catch((err) => console.error(err));

```

</details>

Very cool, the application should again be in an executable state. Make sure it properly works as expected.

## 2. replace `importProvidersFrom` with `provideXy`

Now let's finish up the refactoring and properly replace the other `importProvidersFrom` usages
with their newer versions.

The following functions need to be applied:

* `BrowserModule` => `provideAnimations()`
* `HttpClientModule` => `provideHttpClient()`
  * `withInterceptors([])` (!)
  
As we are moving to `provideHttpClient()`, we also have to adjust how we provide the 
`HttpInterceptors`. But let's do it step by step.

<details>
  <summary>New Provider Functions</summary>

```ts
// main.ts

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    provideRouter(appRoutes),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ReadAccessInterceptor,
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
```

</details>

If you serve the application now, you will notice that the interceptor isn't working anymore.
We have to give the `provideHttpClient` the interceptors by calling the `withInterceptors` function
which configures the `Features` of the `HttpClient` accordingly.

## 3. introduce functional `ReadAccessInterceptor`

`withInterceptors` accepts an array of `HttpInterceptorFn`. The API is slightly different from
the `HttpInterceptor` interface. 
You can choose to directly implement the function inside of `main.ts` or keep it in a separate file.

Let's start by refactoring the `ReadAccessInterceptor` from a class based setup to a functional setup.

I suggest you start by exporting a `export const interceptReadAccess: HttpInterceptorFn` and
move over the logic from the `ReadAccessInterceptor` class.

<details>
  <summary>interceptReadAccess HttpInterceptorFn</summary>

```ts
// read-access.interceptor.ts

export const interceptReadAccess: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const key = environment.tmdbApiReadAccessKey;
  
  return next(
    request.clone({
      headers: new HttpHeaders().set('Authorization', `Bearer ${key}`),
    })
  );
}

```

</details>

You can now delete the `ReadAccessInterceptor` class entirely from the file.

Now we can properly use the newly exported `HttpInterceptorFn` in our bootstrap configuration.
Go the `main.ts` file and use the `withInterceptors` function as argument for the `provideHttpClient()`
function.

<details>
  <summary>withInterceptors</summary>

```ts
// main.ts

import { interceptReadAccess } from './app/read-access.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptors([interceptReadAccess])),
    provideRouter(appRoutes),
  ],
}).catch((err) => console.error(err));
```

</details>

Well done, serve the application and watch how the interceptor is kicking in again!
