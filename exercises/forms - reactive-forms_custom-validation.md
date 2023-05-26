# Reactive Forms - Custom Validation

With the current implementation of our form, it is still possible for users to enter the same
movie twice.

## Goal

At the end of this exercise we want to have a custom validator that checks if a user entered a movie that
already is stored as a favorite.

## Create custom validator

Create a new file `unique-favorite.validator.ts`. It should export a factory function that returns a `ValidatorFn`.

<details>
  <summary>uniqueFavoriteValidator skeleton</summary>

```ts
// unique-favorite.validator.ts

export const uniqueFavoriteValidator: () => ValidatorFn = () => {
  return (control) => {
    if (true) {
      return {
        uniqueFavorite: true
      }
    }
    return null;
  }
}

```

</details>

Now it's time to implement the business logic for the validator.
Inside of the factory function you can `inject` the `MovieService` in order to call its APIs.
The validator should check if the current `control.value` can be found as `id` of an existing favorite.
If this is true, it should return an error `{ uniqueFavorite: true }`, `null` otherwise.

As further improvement, consider to return `null` when the `control.value` is empty. We do not need to perform any
iteration when control doesn't have a value.

<details>
  <summary>uniqueFavoriteValidator solution</summary>

```ts
// unique-favorite.validator.ts

const uniqueFavoriteValidator: () => ValidatorFn = () => {
  const movieService = inject(MovieService);
  return (control) => {
    if (control.value) {
      const movieExists = movieService.getFavorites().some(movie => 
        movie.id === control.value
      );
      if (movieExists) {
        return {
          uniqueFavorite: true
        }
      }
    }
    return null;
  }
}

```

</details>

Great, the validator is ready to use in the `FormGroup`.
Configure the `title` field to use the `uniqueFavoriteValidtor()` as well as the `required` validator.

<details>
  <summary>Adjust FormGroup</summary>

```ts
// my-movie-list.component.ts

title = new FormControl('', {
  nonNullable: true,
  validators: [Validators.required, uniqueFavoriteValidator()],
});
```

</details>

Amazing, the validator should already work. You can serve the application and try it out!

## Adjust error feedback

Just as we did for the `commentCtrl`, we want to show different error messages for different error producers.
Use the `titleCtrl.hasError` function to determine which error message to show.

<details>
  <summary>Adjust error feedback</summary>

```html
<span class="error" *ngIf="title.invalid && (title.touched || ngForm.submitted)">
  {{ title.hasError('uniqueFavorite') ? 'Favorite already exists' : 'Enter a title' }}
</span>
```

</details>
