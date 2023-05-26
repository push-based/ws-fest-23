# Reactive Forms - Custom Form Field

As a final step we want to interact with real data and implement a custom form field which handles
the movie search and selection of an entry for us.

## Goal

At the end of this exercise we know how to build custom form fields using the `ControlValueAccessor` interface.
Users of our application should be able to maintain their private lists of favorite movies
based on real data provided by the `TMBD Api`.

## Implement Custom Control

Generate a new `MovieSearchControlComponent` 

It should replace the current input for `title` and instead serve as an autocomplete control, giving users the ability
to search for a movie and select one from the result.

Provide the `MovieSearchControlComponent` by using the `useExisting` provider as an `NG_VALUE_ACCESSOR` and 
implement the `ControlValueAccessor` interface from `@angular/forms`.

<details>
  <summary>Component Skeleton</summary>

```bash
ng g c movie/movie-search-control --standalone
```

```ts
// movie-search-control.component.ts

@Component({
  selector: 'movie-search-control',
  templateUrl: './movie-search-control.component.html',
  styleUrls: ['./movie-search-control.component.scss'],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MovieSearchControlComponent,
      multi: true,
    },
  ],
})
export class MovieSearchControlComponent implements ControlValueAccessor {}
```

</details>

The `ControlValueAccessor` forces you to implement
* `writeValue` => receive a value from the outside (e.g. `control.setValue()`), can be typed with `MovieModel`
* `registerOnChange(fn: any)` => callback to call when the user changed the data of the form
* `registerOnTouched(fn: any)` => callback to call when the control was `touched`, usually this is `blur`
* `setDisabledState(isDisabled: boolean)` => we will skip this one

Implement all of those methods, start with implementing `registerOnChange(fn: any)` & `registerOnTouched(fn: any)`.

Your Component should have properties holding a reference to those callbacks:
* `onChange = (movie: MovieModel) => {};`
* `onTouched = () => {};`

In `registerOnChange`, assign the given callback to the local `onChange` method. Do the same for `registerOnTouched`.

<details>
  <summary>ControlValueAccessor implemented</summary>

```ts
// movie-search-control.component.ts

@Component({
  selector: 'movie-search-control',
  templateUrl: './movie-search-control.component.html',
  styleUrls: ['./movie-search-control.component.scss'],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MovieSearchControlComponent,
      multi: true,
    },
  ],
})
export class MovieSearchControlComponent implements ControlValueAccessor {

  onChange = (movie: MovieModel) => {};
  onTouched = () => {};

  constructor() {}

  writeValue(movie: MovieModel) {}

  registerOnChange(fn: any): void {
    this.onChange = fn; // assign the callback to your component
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {}
}
```

</details>

Now we can start implementing the business logic for our search.
For this, we want to keep a local field `movie$: Observable<MovieModel[]>` to bind the list of movies we want to display
our user as a selection.
Also create a `searchTerm$: Subject<string>` informing us about any changes made from the user to our search input.

Last pre-condition is the `MovieService`, you want to `inject` it into your components.

The logic is basically the same as for the `movie-search-list-page.component.ts`.
Use `switchMap()` in order to switch from the `searchTerm$` to the `movieService.searchMovie()` call to
set up your `movie$` Observable.

In case the searchTerm is empty, return `of(null)` to invalidate the list.

For future convenience, implement a `selectMovie(movie: MovieModel)` method that
for now just calls `this.onChange(movie);` and resets the `searchTerm$` to an empty string `''`.

<details>
  <summary>MovieSearchControlComponent Skeleton</summary>

```ts
// movie-search-control.component.ts

export class MovieSearchControlComponent implements ControlValueAccessor {
  
  private readonly movieService = inject(MovieService);
  
  readonly searchTerm$ = new Subject<string>();
  
  readonly movies$ = this.searchTerm$.pipe(
    switchMap((term) =>
      term ? this.movieService.searchMovies(term) : of(null)
    )
  );
  
  selectMovie(movie: MovieModel) {
    this.onChange(movie);
    this.searchTerm$.next('');
  }
    
}
```

</details>


Now it's time to build our template.

Let's start by adding the styles in order to have a more appealing visual experience.

<details>
  <summary>MovieSearchControl Styles</summary>

```scss

:host {
  display: block;
}

.results {
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: 350px;
  overflow: auto;
}

.movie-result {
  display: flex;
  align-items: center;
  padding: .5rem 1rem;
  cursor: pointer;
}

```

</details>

Move on to the actual template.

Insert an `input` serving as our searchInput. Bind the `(input)` event so that it execute the search by calling `searchTerm$.next()`.
On `(blur)` call the `onTouched()` method to set our control into a correct state.

For the results, use the `*ngIf=movies$ | async as movies` hack in order to have the movies variable accessible in the 
template.

Generate a `div.results` as a wrapper div for the results.
Iterate over the `movies` and create `button.movie-result` elements. You probably want to bind the buttons `(click)` event
to the `selectMovie()` method and provide the current movie as value.

As a body for the `button`, u can use this piece of template:

```html
<img [src]="movie.poster_path | movieImage" width="35" [alt]="movie.title">
<span>{{ movie.title }}</span>
```

<details>
  <summary>Complete Template</summary>

```html
<!-- movie-search-control.component.html -->
<input #searchInput (blur)="onTouched()"
       (input)="searchTerm$.next(searchInput.value)">
<div class="results" *ngIf="movies$ | async as movies">
  <button class="movie-result"
          (click)="selectMovie(movie)"
          *ngFor="let movie of movies">
    <img [src]="movie.poster_path | movieImage" width="35" [alt]="movie.title">
    <span>{{ movie.title }}</span>
  </button>
</div>
```
</details>


## Use Custom Component

Great, the custom control is in place. We want to start using it now and see what's left to implement.

Head to the `MyMovieListComponent` and slightly adjust the `FormGroup` setup.

You want to get rid of the `title` field in the add form & replace it with a `movie` field
instead and provide a `nullish` value instead of an empty string.

The field should re-use the existing Validators, but does not have to be `nonNullable: true`.


<details>
  <summary>FormGroup adjustments</summary>

```ts

// my-movie-list.component.ts

movie = new FormControl<MovieModel>(null, [Validators.required, uniqueFavoriteValidator()]);

form = new FormGroup({
  movie: this.movie,
  comment: new FormControl('', [
    Validators.required,
    Validators.minLength(5),
  ]),
});

```

</details>

Now that we are using the `movie` FormControl, which returns a `MovieModel` object instead of a string title, we need to adjust
the implementation of the `save` method as well.
Instead of setting the `id` to `title`, use the correct `movie.value.title` value.

<details>
  <summary>save method using the id</summary>

```ts
// my-movie-list.component.ts

save(): void {
  const favorite = {
    id: this.movie.value.id,
    title: this.movie.value.title,
    comment: this.comment.value,
  };
  this.favorites.push(this.createMovieGroup(favorite));
  this.movieService.addFavorite(favorite);
}
```

</details>

Also, adjust the `uniqueFavoriteValidator` validator, it should now compare `control.value.id` to the `id` of the results coming from `getFavorites()`.

<details>
  <summary>uniqueFavoriteValidator adjustments</summary>

```ts
// unique-favorite.validator.ts

export const uniqueFavoriteValidator: () => ValidatorFn = () => {
  const movieService = inject(MovieService);
  return (control: FormControl<MovieModel>) => {
    if (control.value) {
      const movieExists = movieService.getFavorites().some((movie) => {
        return movie.id === control.value.id;
      });
      if (movieExists) {
        return {
          uniqueFavorite: true,
        };
      }
    }
    return null;
  };
};

```

</details>

Great, we just need to use the new search control in our template and we are ready to test it out!

Replace the current `input [formControl]="title"` with the `movie-search-control` component.
Apply the `[formControl]="movie"` directive to the component and optionally, adjust the labels contents to
state search instead :).


<details>
  <summary>Template adjustments</summary>

```html
<!-- my-movie-list.component.html -->

<div class="input-group">
  <label for="title">Title</label>
  <movie-search-control id="title" [formControl]="movie"></movie-search-control>
  <span class="error" *ngIf="movie.invalid && (movie.touched || ngForm.submitted)">
      {{ movie.hasError('uniqueFavorite') ? 'Favorite already exists' : 'Enter a title' }}
    </span>
</div>
```

</details>

Serve the application, try out your new custom control! Because some features are still not implemented, try to add
a `console.log` wherever you find it helpful.

## React to value changes

The search input should display a proper value after a
value was selected and the `reset` functionality isn't working anymore.

Let's start by showing the correct display value after a value selection.
Read the `searchInput: ElementRef<HTMLInputElement>` as a `@ViewChild()` in order to interact with the native control.

Set the `searchInput.nativeElement.value` to `movie.title` from the selected movie in the `selectMovie` method.

<details>
  <summary>selectMovie</summary>

```ts
// movie-search-control.component.ts

 @ViewChild('searchInput')
  searchInput: ElementRef<HTMLInputElement>;

 selectMovie(movie: MovieModel) {
   this.onChange(movie);
   this.searchTerm$.next('');
   this.searchInput.nativeElement.value = movie.title;
 }
```

</details>

Run the application, the input show a proper value on user selection.

As a final step, let's make the `reset` method work again. For this we finally need to implement the `writeValue(movie: MovieModel)` 
method.

Inside `writeValue` we want to reset the current `searchTerm$` value and set the `searchInput.nativeElement.value` to
either the movies title or `''` in case a nullish value was provided.

<details>
  <summary>writeValue</summary>

```ts
// movie-search-control.component.ts


writeValue(movie: MovieModel): void {
    // searchInput won't be available for the first emission.
    // if u want to care about initial value of the form, please go ahead and implement some form of cache to set the
    // value right on the afterViewInit hook 
    if (this.searchInput) {
      this.searchInput.nativeElement.value = movie?.title || '';
      this.searchTerm$.next('');
    }
}
```
</details>

Well done & congratulations! You have implemented a fully functional custom form field for angulars `ReactiveForms`!!

Serve the application and see if everything is working as expected. The control
should now be in a usable state :)
