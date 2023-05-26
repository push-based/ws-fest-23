# Reactive Forms - Simple Validation

You've noticed that our currently implemented form
will let users enter empty data and still save it to the list of
favorite movies. In this exercise we want to make use of validations
to keep our persistence layer clean from bad user data.

## Goal

At the end of this exercise we want to have a proper validation of the entered data.
On top of that we want to inform our users about the invalid state of their inputs.

## Setup Validation

We need to adjust our form setup made in `MyMovieListComponent`.

* The `title` control should be `required`
* The `comment` control should be `required` & `minLength(5)`

On top of that, add a condition to the `save` method that prevents the data being saved when the form is `invalid`.
Only if the form is `valid` store the data to the `favorites` array.

Start by adjusting the template to let the `ngModel` know which validators to use.

<details>
    <summary>Template Validators</summary>

```html
<!--my-movie-list.component.html-->

<input id="title" required name="title" type="text" [(ngModel)]="title">

<textarea rows="5" required minlength="5" name="comment" id="comment" [(ngModel)]="comment"></textarea>

```

</details>

Serve the application and try to enter invalid data. The form should still pass the invalid values to the
favorites array. 

## Prevent save() method if invalid

Give your `form` element a name, e.g. `#favoriteForm` in order to be able to access it in your template.
The native form has a method `checkValidity()` which returns if it's valid or not. We can use that directly
in the template to suppress the submit event to call `save()`.

<details>
  <summary>checkValidity() in template</summary>

```html
<!--my-movie-list.component.html-->

<form #favoriteForm
      (submit)="favoriteForm.checkValidity() && save()">
</form>
```

</details>

Well done! Serve the application and test if you are still able to store invalid data.

## Display validation state

Now we want to give our users some kind of visual feedback about the validation state
in our form.

The `template-driven forms` add css classes to their host-element & `form` based on their current state.
If you inspect the input elements in your `DOM` you will notice that angular
adds classes to each of the inputs and the form (`ng-valid`, `ng-untouched`, ...).

We can make use of that to style our input fields as well.

Your task is to apply custom styling to the inputs that indicates the error state.
Use the `.ng-invalid` class for `textarea` and `input` elements.

<details>
    <summary>Invalid Control Styles</summary>

```scss
/* my-movie-list.component.scss */

textarea.ng-invalid,
input.ng-invalid {
  border-color: darkred;
  background-color: rgba(139, 0, 0, 0.33);
}
```

</details>

Nice, serve the application and see how the controls react to different inputs.

You'll notice that the error state is displayed immediately when the form is still
in its initial state.

Displaying error states is not that trivial as you might think upfront.
You want to show the error state only under certain conditions.
Considering the fact that our initial values are actually invalid inputs, we do not want
to present an instantly invalid set of form fields to our user.

Let's also make use of the `.ng-touched` class in order to display the invalid state only
when the control was actually touched.

<details>
    <summary>Invalid Control Styles</summary>

```scss
/* my-movie-list.component.scss */

textarea.ng-touched.ng-invalid,
input.ng-touched.ng-invalid {
  border-color: darkred;
  background-color: rgba(139, 0, 0, 0.33);
}
```

</details>

Nice job, serve the application and see the result in action. The form controls should now 
display the invalid state only after being touched.

You'll now notice the error messages are shown only after the control is `touched`, but not if
you only hit `submit`.

As a final step for this part your task is to show the invalid state as well when the form gets
submitted (`.ng-submitted`).

> hint: the class is applied to the `form` element, not to the controls

<details>
    <summary>Invalid Control Styles w/ submitted</summary>

```scss
/* my-movie-list.component.scss */

textarea,
input {
  &.ng-invalid {
    &.ng-touched, .ng-submitted & {
      border-color: darkred;
      background-color: rgba(139, 0, 0, 0.33);
    }
  }
}
```

</details>

## Display error messages

Let's give our validation the final polish by introducing error messages connected to
the form controls and their validation state.

Your task is to present the user an error message for a field only in case it is `touched` or
its form was `submitted`.

<details>
  <summary>Error message template</summary>

```html
<span class="error">
  Please enter valid data
</span>
```
</details>

To determine the current state of the control in the template and control its visibility, 
create named template tags for both controls we want to observe (comment & title).

The tag needs to point to `ngModel` in order to have access to the controls properties, e.g.
`<input #titleControl="ngModel"`>

<details>
  <summary>Access controls in the template</summary>

```html
<!--my-movie-list.component.html-->

<textarea #commentCtrl="ngModel" rows="5" required minlength="5" name="comment" id="comment"
          [(ngModel)]="comment"></textarea>
```

</details>

Now we can use the properties `.invalid`, `.touched` and `.formDirective.submitted` to
determine the visibility of the error messages.

<details>
    <summary>Show Error Message based on controls status</summary>

```html
<!-- my-movie-list.component.html -->

<!-- add into input-group -->
<span class="error"
      *ngIf="titleCtrl.invalid && (titleCtrl.touched || titleCtrl.formDirective.submitted)">
    Please enter valid data
</span>
```
</details>

After implementing this for both controls, serve your application and see if all form interactions result in properly
displayed error states.

Congratulations, you've successfully implemented a fully validated form with angulars `template-driven forms`.

## Bonus: Show error message based on error producer

Now the task is to determine which validation failed and adjust the error message
displayed accordingly.

For the comment control, show a different error message for the `minlength` error than
the `required` one.

> hint: use `commmenCtrl.hasError('minlength')`


<details>
    <summary>Solution</summary>

```html
  <!-- my-movie-list.component.html -->
  
  <span class="error" *ngIf="commentCtrl.invalid && (commentCtrl.touched || commentCtrl.formDirective.submitted)">
    {{ commentCtrl.hasError('minlength') ? 'Enter at least 5 characters' : 'Please enter at least something' }}
  </span>
```
</details>




