# template-driven forms - My Movies List

In this exercise we want to deepen our knowledge about `template-driven forms`.

## Goal

At the end of this exercise we want to have a dedicated `MyMovieListComponent`
providing a form to enter movie data.
The form data will help us to maintain a user based list of favorite movies.

## Setup MyMovieListComponent

Create a new module standalone `MyMovieListComponent` component.

<details>
  <summary> Show Solution </summary>

```bash
# create component
ng g c movie/my-movie-list --standalone
```

</details>

In order to be able to access this component via the router, don't forget add the routing configuration in the `AppModule`.
We want to lazy load the `MyMovieListComponent` on the path `my-movies`.

<details>
  <summary> add router config </summary>

```ts
// app-routing.module.ts
{
    path: 'my-movies',
    loadComponent: () =>
        import('./movie/my-movie-list/my-movie-list.component').then(
            (file) => file.MyMovieListComponent
        ),
}
```

</details>

Now we can implement the `MyMovieListComponent` itself and create a form using angulars `template-driven forms`.

If you access your application at [/my-movies](http://localhost:4200/my-movies) you should already
see that the component shows up properly.

## Implement MyMovieListComponent

We want to have a component that saves favorite movies as `{title: string; comment: string}` from user input
captured by a `form`.

Start by defining the two properties `title: string` & `comment: string` as fields in your component.
You can also add a `favorites: {title: string; comment: string;}[]` field to store added movies.

<details>
  <summary>Define form fields on component level</summary>

```ts
// my-movie-list.component.ts

  title = '';
  comment = '';
  favorites: {title: string; comment: string;}[] = [];
```

</details>

We also need two methods for saving the form input and for resetting the form values to their initial values.

The `reset` method should reset the `title` and `comment` back to their default values.

The `save` method stores the current data as `{ title: string; comment: string }` and pushes it to
the `favorites` array. After pushing the new value, it calls the `reset` method.

<details>
  <summary>reset method</summary>

```ts
// my-movie-list.component.ts

reset(): void {
  this.title = '';
  this.comment = '';
}
```
</details>

Feel free to add a `console.log` to the `save` method to have an easier time debugging.

<details>
  <summary>add method</summary>

```ts
// my-movie-list.component.ts

save(): void {
  this.favorites.push({ title: this.title, comment: this.comment });
  console.log(this.favorites);
  this.reset();
}
```

</details>

Great, the component is now ready to go. What we are missing are the template and some styles.

You don't need to implement the styles on your own, go ahead and paste them into `my-movie-list.component.scss`.

<details>
    <summary>MyMovieListComponent styles</summary>

```scss

/* my-movie-list.component.scss */
:host {
  padding: 0 1rem;
  display: block;
}

form {
  width: 500px;
}

.input-group {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  flex-direction: column;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  button:first-child {
    margin-right: .5rem;
  }
}

.error {
  color: darkred;
  font-size: var(--text-sm);
}

textarea,
input {
  border: 1px solid black;
  padding: 4px;
  border-radius: 6px;
  outline: none;
  transition: border-color 100ms,
  background-color 100ms;
  &:focus {
    border-color: var(--palette-primary-main);
  }
}

```

</details>

Now let's implement the template and make use of angulars `template-driven forms`.

You want to have a surrounding `form` element as your wrapper for the actual form.
Add a binding to the `submit` method which should call your components `save` method.

<details>
  <summary>Form Wrapper</summary>

```html
<!-- my-movie-list.component.html -->
<form (submit)="save()">

</form>
```

</details>

Next, create two `div.input-group` elements for the `title` and the `comment` inputs.
The `comment` should be a `textarea` element.

<details>
    <summary>Title Input Template</summary>

```html
<!-- my-movie-list.component.html -->
<div class="input-group">
  <label for="title"></label>
  <input id="title" name="title">
</div>
```

</details>


<details>
    <summary>Comment Input Template</summary>

```html
<!-- my-movie-list.component.html -->
<div class="input-group">
  <label for="title"></label>
  <textarea rows="5" name="comment" id="comment"></textarea>
</div>
```
</details>

To finally connect the form inputs to your component, use the `[(ngModel)]` bananabox binding
and bind the corresponding component field to the respective input.

<details>
    <summary>Connect ngModel</summary>

```html
<!-- my-movie-list.component.html -->
<form (submit)="save()">
  <div class="input-group">
    <label for="title">Title</label>
    <input id="title" name="title" type="text" [(ngModel)]="title">
  </div>
  <div class="input-group">
    <label for="comment">Comment</label>
    <textarea rows="5" name="comment" id="comment" [(ngModel)]="comment"></textarea>
  </div>
</form>
```

</details>

As a last step we want to add `buttons` to trigger the submit event and the `reset` method.

Have at least one button, if you go for two, mark the one as `type="submit"` and the other as `type="reset"`.

<details>
  <summary>Button Templates</summary>

```html

<div class="button-group">
  <button class="btn" type="reset">Reset</button>
  <button class="btn primary-button" type="submit">Save</button>
</div>
```
</details>

Great job, you can serve the application now and test if your form works under the following route:
`http://localhost:4200/my-movies`. 


If you need help, here is the full solution for the template.

<details>
  <summary>Full Template</summary>

```html
<!-- my-movie-list.component.html -->

<form (submit)="save()">
  <div class="input-group">
    <label for="title">Title</label>
    <input id="title" name="title" type="text" [(ngModel)]="title">
  </div>
  <div class="input-group">
    <label for="comment">Comment</label>
    <textarea rows="5" name="comment" id="comment" [(ngModel)]="comment"></textarea>
  </div>
  <div class="button-group">
    <button class="btn" type="reset">Reset</button>
    <button class="btn primary-button" type="submit">Save</button>
  </div>
</form>

```
</details>


