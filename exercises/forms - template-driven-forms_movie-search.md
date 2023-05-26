# Template Driven Forms - Movie Search

In this exercise we want to repeat what we've learned so far and
get to know the first part of the `@angular/forms` package, Template Driven Forms.

## Goal

At the end of this exercise we want to have a dedicated `MovieSearchPageComponent`
showing a list of movies based on the users search criteria.
We want to leverage `Template Driven Forms` in order to sync the user input
with our component and dispatch the router.

## Implement searchMovies

Implement the method `searchMovies(query: string): Observable<MovieModel[]>` in the `MovieService`.
It should receive a query string and perform a `get request` to `${environment.tmdbBaseUrl}/3/search/movie/`.
You also need to send an `params` object to the endpoint in order to send the query.
`{ params: { query } }`.

In order to send back `MovieModel[]` you need to pluck/map the results property
from the http result. U can either use `pluck` or `map` rxjs OperatorFunctions.

Useful information:
* [pluck](https://rxjs.dev/api/operators/pluck)
* [map](https://rxjs.dev/api/operators/map)
* [api](https://developers.themoviedb.org/3/search/search-movies)

<details>
<summary> Show Solution </summary>

```ts
searchMovies(query: string): Observable<MovieModel[]> {
    return this.httpClient
      .get<{ results: MovieModel[] }>(
        `${environment.tmdbBaseUrl}/3/search/movie`,
        {
          params: { query },
        }
      )
      .pipe(map(({ results }) => results));
}
```
</details>

## Setup MovieSearchPageComponent

Create a new module `MovieSearchPageModule` & component `MovieSearchPageComponent`

The module should have a routing configuration for displaying
the `MovieSearchPageComponent` on `''` path.

```bash
# create component
ng g c movie/movie-search-page --standalone
```

Don't forget to add the routing configuration in the `AppModule`.
We want to lazy load the `MovieSearchPageComponent` on the path `search`.
Please add also a route param for the search query `:query`.

<details>
<summary> add router config </summary>

```ts
// app-routing.module.ts
{
    path: 'search/:query',
    loadComponent: () =>
      import('./movie/movie-search-page/movie-search-page.component').then(
        (file) => file.MovieSearchPageComponent
      ),
},
```

</details>

Now we can implement the `MovieSearchPageComponent` itself and display our movie results.

The `MovieSearchPageComponent` will be very similar to the `MovieListPageComponent`. 
It should have a `movie$: Observable<MovieModel[]>` property which can be bound
with the `async` pipe in the template.

You need to inject the `ActivatedRoute` into the component
in order to have access the `params` Observable which should give you the
currently active query to send to the data source.

You can choose if you want to have a single stream resembling the `Observable<MovieModel[]>`
or a nested `Subscription`.

If you go for the single stream solution, consider using the `switchMap` OperatorFunction.

<details>
    <summary>MovieListPageComponent</summary>

```ts
// movie-search-page.component.ts

@Component({})
export class MovieSearchPageComponent {
  
  private movieService = inject(MovieService);
  private activatedRoute = inject(ActivatedRoute);
  
  movies$: Observable<MovieModel[]> = this.activatedRoute.params.pipe(
    switchMap((params) => this.movieService.searchMovies(params.query))
  )
}
```

</details>

When implementing the template, take a look at `MovieListPageComponents` template.
It is basically the same.

<details>
  <summary>MovieListPageComponent Template</summary>

The template looks very much like the one from `movie-list-page.component.ts`

```html
<ng-container *ngIf="(movies$ | async) as movies; else: loader">

  <movie-list
    *ngIf="movies?.length > 0; else: elseTmpl"
    [movies]="movies">
  </movie-list>

  <ng-template #elseTmpl>
    <div>Sorry, nothing found bra!</div>
  </ng-template>


</ng-container>


<ng-template #loader>
  <div class="loader"></div>
</ng-template>

```
</details>

You can serve the application now and perform a search by entering the following url
`http://localhost:4200/search/bat`.

## Trigger Search

Now it's finally time to make use of `Template Driven Forms`.
What we want to achieve is that we trigger the router whenever the `ui-search-bar` component 
emits a changed value.

For this we want to implement an `NgModelBinding` in the `AppShellComponent`.

The `AppShellComponent` component should have a property to bind the searchTerm coming from
the search component.
Implement `getter/setter` pair for a property called `searchValue` in
`AppShellComponent`.

Inside the setter, you can call the `router.navigate` method in order to
trigger routing to the `search` route. Don't forget to also send the value when
routing.

<details>
    <summary>searchValue getter/setter</summary>

```ts
// app-shell.component.ts

  private _searchValue = '';
  set searchValue(value: string) {
    this._searchValue = value;
    this.router.navigate(['search', value]);
  }
  get searchValue(): string {
    return this._searchValue;
  }
```

</details>

Now the only piece left is to have the `NgModelBinding` inside of our template in
order to react to changes from the user.

Go to `AppShellComponent`s template and use the `[(ngModel)]` binding
to bind your searchValue property to the components changes.

<details>
    <summary>ngModel Binding</summary>

```html
<!-- app-shell.component.html -->

<ui-search-bar
        [(ngModel)]="searchValue"
></ui-search-bar>
```

You also need to import `ForModule` from '@angular/forms' into the `AppShellModule` 

```ts
// app-shell.module.ts
import { FormsModule } from '@angular/forms';

{
    imports: [
        /** other imports **/,
        FormsModule
    ]
}

```

</details>

Serve the application and see if inputs to the search control actually change
the route and you see a list of movies.

## Bonus: sync the control on refresh

You will notice that if you refresh the page on the search route,
the searched value is not in sync with the control anymore.

Find a way in `AppShellComponent` to set the searchValue to its
correct value on a page refresh.

> hint: try to read the current route params from the url/router
