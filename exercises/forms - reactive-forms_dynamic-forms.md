# Reactive Forms - Dynamic Forms

Until now, we just added single entries to a list of items and display them.
Let's add some dynamic to our form so that our users can edit
already stored movies as well instead of just listing them.

## Goal

At the end of this exercise we know how to build dynamic forms with the help of `FormArray`.

## Typed FormGroup with TypeScript Magic 🧙

Let's start by implementing some utility types that make our life easier when working with forms.
We will also clean up our code a little with this.

Now, the fun begins. We want to create a generic type that takes a type and an optional set of keys
to generate a typed `FormGroup<Type>` model.

The following code snipped showcases how the type should work.

```ts
type MovieForm = TypedForm<FavoriteMovieModel, 'title' | 'comment'>;
// results in: 
FormGroup<{
  title: FormControl<string>;
  comment: FormControl<string>;
}>

```

For each given key, the `TypedForm` type generates a `FormControl<T[key]>`.

Your task is to implement the `TypedForm` interface.

<details>
  <summary>TypedForm</summary>

```ts
type TypedForm<T, K extends keyof T = keyof T> = FormGroup<{
  [key in K]: FormControl<T[key]>;
}>;
```

</details>

Great! After you've done that, define a `MovieForm` type that we can use for our `FormArray` which we are going
to create in the next step.

<details>
  <summary>MovieForm</summary>

```ts
type TypedForm<T, K extends keyof T = keyof T> = FormGroup<{
  [key in K]: FormControl<T[key]>;
}>;

type MovieForm = TypedForm<FavoriteMovieModel>;
/*
  results in: 
  FormGroup<{
    title: FormControl<string>;
    comment: FormControl<string>;
  }>
*/

```

</details>

## Setup FormArray

Let's start by introducing refactoring our existing `favorites` property to a `favorites: FormArray` property which should serve as our viewModel to have dynamically
editable favorites.

The initial value of the `FormArray` should be derived from `MovieService#getFavorites()` in order to initially display
what we have stored in our persistence layer.

For each of the `movies` in the store, create a `FormGroup` and add it to the `favorites: FormArray`. You can do that in
onInit or at construct time by assigning it directly to the property itself.

Create a helper function `createMovieGroup(movie: MovieWithComment): MovieForm`

<details>
    <summary>FormArray & Helper utility</summary>

```ts
//my-movie-list.component.ts


// for easier access to the array
favorites = new FormArray(
    this.movieService
        .getFavorites()
        .map((favorite) => this.createMovieForm(favorite))
);

// convenience function for creating a formGroup for a movie
private createMovieGroup(movie: MovieWithComment): MovieForm {
  return new FormGroup({
    title: new FormControl(movie.title, {
      nonNullable: true,
      validators: Validators.required,
    }),
    comment: new FormControl(movie.comment, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),
  });
}
```

</details>

As the editable favorites are a new form in itself, also create a new `favoritesForm: FormGroup` field
which has the `favorites: FormArray` as control.

<details>
    <summary>FavoritesForm FormGroup</summary>

```ts

favoritesForm = new FormGroup({ favorites: this.favorites });

```
</details>

This should serve already as a basis to keep track of each movies changes via user inputs. Let's head over to the
template and apply some changes to display an actual form.

* Bind the `favoritesForm: FormGroup` to the `div.favorites-list` which than serves as form container for us
* Create an `ng-container formArrayName="favorites"` as a wrapper around the `div.favorite-item *ngFor` construct
* iterate over `let favorite of favorites.controls; let i = index`
* apply the `[formGroupName]="i"` do each `.favorite-item`
* instead of reading `movie.title`, change the value binding so that you read the value from `favorite.controls.title.value`
  * alternative: you can also create an `input readonly` and use the `formControlName="title"` directive
* create a `div.input-group` for the `textarea` for the comments, apply the `formControlName="comment"` directive to it

<details>
    <summary>Show Solution</summary>


```html
<!-- my-movie-list.component.html -->

<!-- FormGroup binding -->
<div class="favorites-list" [formGroup]="favoritesForm">
  <!-- FormArray binding -->
  <ng-container formArrayName="favorites">
    <!-- FormGroup binding -->
    <div class="favorite-item"
         [formGroupName]="i"
         *ngFor="let favorite of favorites.controls; let i = index">
      <span class="favorite-item__title">{{ favorite.controls.title.value }}</span>
      <!-- FormControl binding -->
      <div class="input-group">
        <textarea formControlName="comment"></textarea>
      </div>
      <button class="btn btn__icon"
              (click)="removeFavorite({title: favorite.controls.title.value, comment: favorite.controls.comment.value})">
        <svg-icon name="delete"></svg-icon>
      </button>
    </div>

  </ng-container>
</div>
```
</details>

Run the application and see if the dynamic form is working with the current set of data.
Since you cannot dynamically add new items to the FormArray, you need to refresh the page after saving a new entry.
It will still be stored in the localStorage.

## Dynamically add/remove Forms

Now we want our users to be able to dynamically add new forms on the fly and directly visualize them as `FormGroup`
inside the `FormArray`.

In order to add items to our `favorites: FormArray`, go to the previously implemented `save` method
and call the `push` method to add a new `FormGroup` with the entered data. Use the already existing `createMovieGroup()` 
function to create the new `FormGroup`.

<details>
    <summary>Push new FormGroup</summary>

```ts
// my-movie-list.component.ts


save(): void {
  const favorite = {
    title: this.title.value,
    comment: this.comment.value,
  };
  this.favorites.push(this.createMovieGroup(favorite));
  this.movieService.addFavorite(favorite);
}
```
</details>

Serve the application and try to add a Movie via the add form. You should notice that the value you entered will be
displayed instantly as an editable form.

Now implement the deletion as well.

If not already in-place, implement (or refactor) a method `removeFavorite(i: number)` which should call the `FormArray#removeAt` method
with the given index.
Before removing the `FormGroup` from the `FormArray`, we also want to store the removal in the `MovieService` via `MovieService#removeFavorite()`.

<details>
  <summary>removeFavorite implementation</summary>

```ts
// my-movie-list.component.ts

removeFavorite(i: number): void {
  this.movieService.removeFavorite(this.favorites.controls.at(i).getRawValue());
  this.favorites.removeAt(i);
}
```

</details>

In the template, add a `click` binding to the `button.btn btn__icon` and call the `removeFavorite` method.

You get the index from the context of the `*ngFor` directive.

<details>
    <summary>RemoveFavorite template binding</summary>

```html
<!-- my-movie-list.component.html -->

<div class="favorite-item"
     [formGroupName]="i"
     *ngFor="let favorite of favorites.controls; let i = index">
  
  <!-- controls -->
  
  <button class="btn btn__icon"
          (click)="removeFavorite(i)">
    <svg-icon name="delete"></svg-icon>
  </button>
</div>
```

</details>

Serve the application and try adding, removing & editing on the favorite list.

You should be able to observe the values are getting added and removed from the `localStorage` by observing the
values in your browsers dev tools.

## Add Error States to FormArray controls

The comment control in our dynamic `FormArray` is not showing any error messages right now if the input is invalid.

Let's try to use a similar technique as we did before to also show error messages in the `FormArray` forms.

If the `favorite.controls.comment` control is `invalid`, create a `span.error` that displays different
error messages based on the current error. We don't need to react to `touched` or `submitted` states in the `FormArray`.

<details>
    <summary>FormArray comment control error</summary>

```html

<div class="input-group">
  <textarea formControlName="comment" ></textarea>
  <span class="error"
    *ngIf="favorite.controls.comment.invalid">
      {{ favorite.controls.comment.hasError('minlength') ? 'Write at least 5 characters' : 'Enter a comment' }}
  </span>
</div>
```
</details>

Nice, serve the application and see if the error messages are properly displayed when editing or adding data.

## Store FormArray updates

We are able to store removals as well as creations in our store, but no updates yet.

Start by implement an `updateFavorite(movie: FavoriteMovieModel)` method in the `MovieService`.
It should take one `movie: FavoriteMovieModel` as an argument, update the favorite array internally and
store the result back into the localStorage.

> Hint: use the `update` function of `@rx-angular/cdk/transformations`

<details>
    <summary>updateFavorite</summary>

```ts
// movie.service.ts

updateFavorite(movie: FavoriteMovieModel) {
  const updated = update(this.getFavorites(), movie, 'title');
  localStorage.setItem('my-movies', JSON.stringify(updated));
}
```
</details>

Now that our update method is in place, we can move on to the `MyMovieListComponent` and connect the form updates
to it.

There are multiple ways how to implement this, but let's try it the `rxjs` way!

Our goal is to listen to changes of each available `FormGroup` individually and forward those changes to
the `updateFavorite` method.
Let's define the steps we have to consider when updating the `FormArray` values:

Basic Logic:

* subscribe to `.valueChanges` of each `FormGroup` in the `FormArray`
  * e.g. `merge(...this.favorites.controls.map(c => c.valueChanges))`
* filter for only valid inputs
  * e.g. `filter(() => c.valid)`
* forward the value to movieService
  * e.g. `.subscribe(updatedFavorite => this.movieService.updateFavorite(updatedFavorite))`

<details>
  <summary>Basic Implementation: Per FormGroup valueChanges</summary>

```ts

ngOnInit() {
  // subscribe to valueChanges of nested FormGroups
  merge(
    ...this.favorites.controls.map((favoriteGrp) =>
      favoriteGrp.valueChanges.pipe(
        // only emit valid changes
        filter(() => favoriteGrp.valid),
        // map to rawValue, as the normal value is `Partial<T>`
        map(() => favoriteGrp.getRawValue())
      )
    ).subscribe((updatedFavorite) => {
      this.movieService.updateFavorite(updatedFavorite);
    });
}

```

</details>

Some more thoughts:

You want to update your subscription whenever a field was added or removed, this is a good candidate for using the `switchMap`
operator.

In best case you listen to the `length` of the currently available `FormGroup`s inside the `FormArray`. Whenever it changes,
re-subscribe to the existing `FormControl`s again.

<details>
  <summary>Full Implementation: Per FormGroup valueChanges</summary>

```ts

ngOnInit() {
  this.favorites.valueChanges
    .pipe(
      // start with current value
      startWith(this.favorites.value),
      // abort when groups were added/removed
      distinctUntilKeyChanged('length'),
      switchMap(() => {
        // subscribe to valueChanges of nested FormGroups
        return merge(
          ...this.favorites.controls.map((favoriteGrp) =>
            favoriteGrp.valueChanges.pipe(
              // only emit valid changes
              filter(() => favoriteGrp.valid),
              // map to rawValue, as the normal value is `Partial<T>`
              map(() => favoriteGrp.getRawValue())
            )
          )
        );
      })
    )
    .subscribe((updatedFavorite) => {
      this.movieService.updateFavorite(updatedFavorite);
    });
}

```

</details>

Serve the application and update any movie you have listed. Open the dev tools and see how the data is written into your
local storage.

Well done, you have implemented a fully functional dynamic form with angulars `FormArray`!
