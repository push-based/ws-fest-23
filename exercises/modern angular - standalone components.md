# Modern Angular - Standalone Components

This exercise focuses on the new `standalone` components API introduced with angular 14.

## Goal

In this exercise you will learn how to transition from an existing `NgModule` based application into a `standalone`
application. In the end we won't have an `AppModule` anymore as we will use the new `bootstrapApplication` API
to make our `AppComponent` standalone.

On top of that, we will search for opportunities to improve our `MovieModule` and make it easier
to consume its components by using the new `standalone` API.

## Standalone Application 

The following steps need to be done in order to complete this exercise:

1. mark `AppComponent` as standalone
2. use `bootstrapApplication` API
3. use providers with `importProvidersFrom` bridging function

### 1. Mark `AppComponent` as standalone

Let's start with the most obvious task, marking the `AppComponent` as `standalone` component.

Head to the `app.component.ts` file and mark it as `standalone`. Also import the needed dependencies
for the `AppComponent`s template.

<details>
  <summary>Standalone AppComponent</summary>

```ts
// app.component.ts

@Component({
  selector: 'app-root',
  template: `
    <app-shell>
      <router-outlet></router-outlet>
    </app-shell>
  `,
  standalone: true,
  imports: [RouterOutlet, AppShellModule],
})
export class AppComponent {}
```

</details>

### 2. use `bootstrapApplication` API

Now we need to switch to the new `bootstrapApplication` api in our `main.ts` in order to make
our setup work again.
Open the `main.ts` file and use the `bootstrapApplication` API instead of `platformBrowserDynamic` in
order to bootstrap the standalone `AppComponent`.

<details>
  <summary>bootstrapApplication</summary>

```ts
// main.ts

bootstrapApplication(AppComponent)
  .catch((err) => console.error(err));
```

</details>

### 3. `importProvidersFrom` bridging function

As a final step we need to configure the correct providers which were provided in the `AppModule`
before.
Inspect the current state of `AppModule` and move over the `providers` as well as use the
`importProvidersFrom` function for those modules that ship with providers:
* `HTTP_INTERCEPTORS`
* `BrowserModule`
* `AppRoutingModule`
* `HttpClientModule`

<details>
  <summary>set up providers</summary>

```ts
// main.ts

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule),
    importProvidersFrom(AppRoutingModule),
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

As a final step you can completely get rid of `AppModule`!

Great, you have successfully transformed the `AppComponent` into a standalone component and 
used the new `bootstrapApplication` API together with the newly introduced `importProvidersFrom` 
bridging function.

Serve the application, it should work exactly as before.

## Standalone MovieImagePipe

Let's take a look at the current implementation of the `MovieModule`.

```ts
// movie.module.ts

@NgModule({
  declarations: [MovieCardComponent, MovieListComponent, MovieImagePipe],
  imports: [CommonModule, TiltModule, StarRatingModule],
  exports: [MovieListComponent, MovieImagePipe],
})
export class MovieModule {}
```

It declares 3 components and exports 2 of them. The problem with this setup is, that any consumer
that is only interested in `MovieImagePipe` has to import the whole `MovieModule` which has its
own dependencies and declarations the consumer isn't interested in at all.

A clear improvement would be to separate the `MovieImagePipe` from the `MovieModule` in order
to allow more fine-grained control of our dependencies.

Your task is to transform the `MovieImagePipe` into a `standalone` pipe. For this
you obviously need to set the `standalone: true` flag in `movie-image.pipe.ts`. You 
also need to adjust the `MovieModule` a bit.
You can choose between importing and re-exporting the `MovieImagePipe` to have a non-breaking
change, or to only import it.
I suggest to import/re-export the `MovieImagePipe` as it's anyway used in the `MovieCardComponent`.

<details>
  <summary>standalone MovieImagePipe</summary>

```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'movieImage',
  standalone: true
})
export class MovieImagePipe implements PipeTransform {
  transform(value: string, width = 300): string {
    if (value) {
      return `https://image.tmdb.org/t/p/w${width}/${value}`;
    }
    return '/assets/images/no_poster_available.jpg';
  }
}

```

</details>


<details>
  <summary>Import / Re-export MovieImagePipe</summary>

```ts
@NgModule({
  declarations: [/**/],
  imports: [/**/ MovieImagePipe],
  exports: [/**/ MovieImagePipe],
})
export class MovieModule {}

```

</details>
