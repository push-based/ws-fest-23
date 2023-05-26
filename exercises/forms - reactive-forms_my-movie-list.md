# Reactive Forms - My Movies

In this exercise we want to deepen our knowledge about `@angular/forms`
and make use of the `ReactiveFormsModule`.

## Goal

At the end of this exercise we want to have the `MyMovieListComponent` using the `ReactiveForms` instead of
the `template-driven forms`.
On form submission we want to send the data to a mocked service to simulate a dedicated data storage.

## Refactor to FormGroup

Start with implementing a `FormGroup` with two `FormControls` for `title` and `comment`.
Don't forget to also configure the right `Validators` for your `FormControl`s.

* title: `required`
* comment: `required` & `minLength(5)`

Also configure the fields to be `nonNullable`, as this will improve our typesafety!

> **Tip:** make two separate class fields for each `FormControl`, thank me later :)
> e.g. `title = new FormControl()`
> `form = new FormGroup({ title: this.title })`

<details>
  <summary>FormGroup Setup</summary>

```ts
title = new FormControl('', {
  nonNullable: true,
  validators: Validators.required,
});
comment = new FormControl('', {
  nonNullable: true,
  validators: [Validators.required, Validators.minLength(5)],
});

form = new FormGroup({
  title: this.title,
  comment: this.comment,
});
```

</details>

Also, from now on use the `FavoriteMovieModel` type for the `favorites: FavoriteMovieModel[]` array.
It will help you to be typesafe for future refactorings!

Now go ahead and refactor the `save` and `reset` methods to use the new `FormGroup` instead of the class fields from before.

The `save` method should now store the `.value` properties of the fields or `form.getRawValue()` of the whole `FormGroup`.
As the `FavoriteMovieModel` requires an `id` property to be set, use the value of `title` for now. We'll
replace it later one.

You can drop the `reset` method as the `form.reset()` method won't reset the `submitted` state. As we want this
behavior, we will implement this in the template within the next step.

<details>
  <summary>Refactor save & reset</summary>

```ts
save(): void {
  const favorite = {
      id: this.title.value,
      ...this.form.getRawValue()
  };
  this.favorites.push(favorite);
  console.log(this.favorites);
}

// delete reset method
```

</details>

Great! Now it's time to also refactor the template!

When implementing the template, consider the following things:

Replace the `submit` binding with `ngSubmit` and the custom `#form` with `#ngForm="ngForm"`.
`ngForm` will give us access to the `submitted` state and will let us reset its entire state by 
calling `ngForm.resetForm()`. Use that in the submit hook to reset the entire form after successfully
submitting data.

Bind the `formGroup` and the `ngSubmit` method:  
`form [formGroup]="form" (ngSubmit)="ngForm.valid && save(); ngForm.valid && ngForm.resetForm();"`

<details>
    <summary>FormGroup Template</summary>

```html
<!-- my-movie-list.component.html -->
<form #ngForm="ngForm" 
      [formGroup]="form"
      (ngSubmit)="ngForm.valid && save(); ngForm.valid && ngForm.resetForm();">

</form>
```

</details>

For the inputs, replace the `[(ngModel)]` binding by either using `[formControl]="title"`
This will bind the `FormControl` to their input.
We don't need to access the `FormControlDirective` in the template anymore, instead the replace the usage of
`titleCtrl`, `commentCtrl` with `title` & `comment` directly. You can also remove the `#titleCtrl` and `#commentCtrl` bindings
entirely.

Also replace the former `titleCtrl.formDirective...` with `ngForm.submitted`.

Have an input for the `title` control, use `formControl` directive:  
`input [formControl]="title"`

<details>
    <summary>Title Input Template</summary>

```html
<!-- my-movie-list.component.html -->
<div class="input-group">
  <label for="title">Title</label>
  <input id="title" [formControl]="title" name="title" type="text">
  <span class="error" *ngIf="title.invalid && (title.touched || ngForm.submitted)">
      Enter a title
    </span>
</div>
```

</details>

Have a textarea for the `comment` control, use `formControl` directive:  
`textarea [formControl]="comment"`

<details>
    <summary>Comment Input Template</summary>

```html
<!-- my-movie-list.component.html -->
<div class="input-group">
  <label for="comment">Comment</label>
  <textarea rows="5" name="comment" id="comment"
            [formControl]="comment"></textarea>
  <span class="error" *ngIf="comment.invalid && (comment.touched || ngForm.submitted)">
      {{ commentCtrl.hasError('minlength') ? 'Write at least 5 characters' : 'Enter a comment' }}
  </span>
</div>
```

</details>

<details>
    <summary>Full Template</summary>

```html
<!-- my-movie-list.component.html -->
<form [formGroup]="form"
      #ngForm="ngForm"
      (ngSubmit)="ngForm.valid && save(); ngForm.valid && ngForm.resetForm();">
  <div class="input-group">
    <label for="title">Title</label>
    <input id="title" [formControl]="title" name="title" type="text">
    <span class="error" *ngIf="title.invalid && (title.touched || ngForm.submitted)">
      Please enter valid data
    </span>
  </div>
  <div class="input-group">
    <label for="comment">Comment</label>
    <textarea rows="5" name="comment" id="comment"
              [formControl]="comment"></textarea>
    <span class="error" *ngIf="comment.invalid && (comment.touched || ngForm.submitted)">
      {{ commentCtrl.hasError('minlength') ? 'Enter at least 5 characters' : 'Please enter at least something' }}
    </span>
  </div>
  <div class="button-group">
    <button class="btn" type="reset">Reset</button>
    <button class="btn primary-button" type="submit">Save</button>
  </div>
</form>


```

</details>

You can serve the application now and test if your form still works as before under the following route:
`http://localhost:4200/my-movies`.


## Implement Service Methods

Now it's time to do some stuff with the data we are now able to capture via our implemented form.
Let's start with implementing the needed methods in the `MovieService`.

Since we don't have an actual endpoint, we will use the `localStorage` in order to have at least
some layer of persistence.

Before we begin, please note we need to adjust `MovieModel` in some way in order to store the `comment` property.
You can decide on your own how to handle it, the solution proposes the most simple approach by adding the needed 
properties on the fly.

Your task is to implement the methods following methods in `MovieService`:

* `getFavorites(): FavoriteMovieModel[]` 
* `addFavorite(movie: FavoriteMovieModel)`

The `getFavorites()` method should simply return a `JSON.parsed` value from `localStorage.getItem('my-movies')` or an empty
array in case of no value exists.

The `addFavorite` method should take care of adding the given `Movie` and store the
updated array via `localStorage.setItem('my-movies')`.

For the sake of simplicity, please use the helper function `insert` from `@rx-angular/cdk/transformations`.
For comparison, for now we relate on the `title` property.

```ts
insert(this.getFavorites(), movie)
```

<details>
    <summary>MovieService</summary>
    
```ts
// movie.service.ts

getFavorites(): FavoriteMovieModel[] {
    return JSON.parse(localStorage.getItem('my-movies')) || [];
}

addFavorite(movie: FavoriteMovieModel) {
    const favorites = insert(this.getFavorites(), movie);
    localStorage.setItem('my-movies', JSON.stringify(favorites));
}
```
</details>

## Fetch Favorite Movies from Service

Heading back to the `MyMovieListComponent` we can now use the `MovieService`s data in order to display a list of movies.

First, add some styles so that your favorite list has some nice visual appearance:

<details>
    <summary>MyMovieListComponent Styles</summary>

```scss
/* my-movie-list.component.scss */

.favorite-item {
  padding: 1rem 0.5rem;
  display: flex;
  font-size: var(--text-lg);
  align-items: center;

  textarea.ng-invalid {
    border-color: darkred;
    background-color: rgba(139, 0, 0, 0.33);
  }

  .btn {
    overflow: hidden;
  }

  &__title {
    width: 125px;
  }
}

```

</details>

Now let's implement the component part.
Create a local variable `favorites` and assign it to `MovieService#getFavorites()`.
On form submission (`save()`), instead of `console.log` the value, send it to the `addFavorite()` method and re-assign
the `favorites` property to the latest value of `MovieService#getFavorites()`.

<details>
    <summary>MyMovieListComponent</summary>

```ts
// my-movie-list.component.ts

favorites = this.movieService.getFavorites();

save(): void {
  const favorite = {
    id: this.title.value,
    ...this.form.getRawValue()
  };
  this.favorites.push(favorite);
  this.movieService.addFavorite(favorite);
}

```

</details>

Now create the template to display the list of favorite movies.

Create a `div.favorites-list`. Keep it as a sibling of the `form` element.
Inside, use an `*ngFor` to create a `div.favorite-item` by iterating over `favorites`.

<details>
    <summary>Template</summary>

```html
<!-- my-movie-list.component.html -->
<form [formGroup]="form"
      #ngForm="ngForm"
      (ngSubmit)="ngForm.valid && save(); ngForm.resetForm()">
  
  <!-- The rest of the form -->
</form>

<h2>Favorite Movies</h2>
<div class="favorites-list">
  <div class="favorite-item" *ngFor="let movie of favorites">
    <span class="favorite-item__title">{{ movie.title }}</span>
    <span class="favorite-item__comment">{{ movie.comment }}</span>
  </div>
</div>
```

</details>


That's it, you have successfully created your first `ReactiveForm` with data persistence.
Serve the application and test the functionality.

## Bonus: Implement deletion

add a `delete` button to the template per `favorites` entry and find a way to delete a movie from the list again.
You can use the `remove()` utility function from `@rx-angular/cdk/transformations` to handle the removal logic for you.

```ts
remove(favorites, { id: 'movie-to-delete' }, 'id');
```

<details>
    <summary>Template suggestion</summary>

```html
<button class="btn btn__icon" (click)="removeFavorite(favorite)">
  <svg-icon name="delete"></svg-icon>
</button>
```
</details>


<details>
  <summary>Full Template</summary>

```html

<form [formGroup]="form"
      #ngForm="ngForm"
      (ngSubmit)="ngForm.valid && save(); ngForm.resetForm()">
  <div class="input-group">
    <label for="title">Title</label>
    <input id="title" [formControl]="title" name="title" type="text">
    <span class="error" *ngIf="title.invalid && (title.touched || ngForm.submitted)">
      Enter a title
    </span>
  </div>
  <div class="input-group">
    <label for="comment">Comment</label>
    <textarea rows="5" name="comment" id="comment"
              [formControl]="comment"></textarea>
    <span class="error" *ngIf="comment.invalid && (comment.touched || ngForm.submitted)">
      {{ commentCtrl.hasError('minlength') ? 'Write at least 5 characters' : 'Enter a comment' }}
    </span>
  </div>
  <div class="button-group">
    <button class="btn" type="reset">Reset</button>
    <button class="btn primary-button" type="submit">Save</button>
  </div>
</form>

<h2>Favorite Movies</h2>
<div class="favorites-list">
  <div class="favorite-item" *ngFor="let movie of favorites">
    <span class="favorite-item__title">{{ movie.title }}</span>
    <span class="favorite-item__comment">{{ movie.comment }}</span>
    <button class="btn btn__icon" (click)="removeFavorite(movie)">
      <svg-icon name="delete"></svg-icon>
    </button>
  </div>
</div>

```


</details>
