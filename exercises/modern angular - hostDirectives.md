# Modern Angular - Directive Composition API

This exercise focuses on the new `Directive Composition API` introduced with angular v15.

## Goal

In this exercise you will learn how to apply directives directly to your components
without having to use the template by using the `Directive Composition API`. 
In the end we will have transformed the `TiltDirective` into a `standalone` directive and directly
apply it to the `MovieCard`.

For this exercise to be completed, the following steps have to be done:

1. mark `TiltDirective` as standalone & adjust imports
2. use `TiltDirective` as `hostDirective` in `MovieCardComponent`
3. adjust styles in `TiltDirective` & `MovieCardComponent`
4. use different approaches to control `TiltDirective` input bindings

### 1. standalone `TiltDirective`

As a first step, we need to transform `TiltDirective` into a `standalone` directive, otherwise
it is not possible to use it as a `hostDirective`.

<details>
  <summary>standalone TiltDirective</summary>

```ts
// tilt.directive.ts

@Directive({
  selector: '[tilt]',
  standalone: true,
})
export class TiltDirective {
   /* directive code */
}

```

</details>

The `TiltDirective` currently is being declared in the `TiltModule`. You can go ahead and completely
delete the `TiltModule` at this point in time.
Make sure to replace the import in `movie.module.ts`.

<details>
  <summary>Adjust TiltDirective import</summary>

```ts
// movie.module.ts

@NgModule({
  declarations: [MovieCardComponent, MovieListComponent],
  imports: [CommonModule, StarRatingModule, MovieImagePipe, TiltDirective],
  exports: [MovieListComponent, MovieImagePipe],
})
export class MovieModule {}
```
</details>


You can serve the application and see that it should still behave as before.

### 2. use `TiltDirective` as `hostDirective`

Now it's time to introduce you to the new `Directive Composition API`, which allows us to
apply directives directly to components.

Go to the `MovieCardComponent` and apply the `TiltDirective` as `hostDirective` in the
component decorator.

<details>
  <summary>hostDirective: TiltDirective</summary>

```ts
// movie-card.component.ts

@Component({
  selector: 'movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  hostDirectives: [TiltDirective],
})
export class MovieCardComponent {}

```
</details>

Don't forget to remove the `[tilt]` binding in the `movie-card.component.html` template.
As we've applied the directive now to the component itself, we don't want to bind it a second
time in the template.

<details>
  <summary>Remove `[tilt]` from template</summary>

```html
<!-- movie-card.component.html -->

<div class="movie-card"
     (click)="movieClicked()">
  <!-- rest of template, notice the removed binding on the .movie-card element -->
</div>
```

</details>


You can also now safely remove the `import` in the `MovieModule`, as the `hostDirective` configuration
will automatically import the `TiltDirective` without having it being specified in any module.

<details>
  <summary>Adjust TiltDirective import</summary>

```ts
// movie.module.ts

@NgModule({
  declarations: [MovieCardComponent, MovieListComponent],
  imports: [CommonModule, StarRatingModule, MovieImagePipe /* remove TiltDirective */],
  exports: [MovieListComponent, MovieImagePipe],
})
export class MovieModule {}
```
</details>

Serve the application, you should see how the `TiltDirective` is still working. The style changes
are not animated anymore, though. Let's move on to the next step and fix that as well!

### 3. adjust styles

As we've noticed before, the style changes applied from the `TiltDirective` are not animated anymore.
The responsible code for this right now lives in `movie-card.component.scss`, where you will find
a `.movie-card { transition: ... }` rule.

As we are not changing the styles of `.movie-card` anymore, we have to move this piece of code
to another place.

We have two options now:
1. use `:host {}` in `movie-card.component.scss` to make the transition apply to the `movie-card.component.ts`
2. use `@HostBinding('style.transition')` in `TiltDirective` to apply the changes from the directive itself.

As the transition is clearly something you want when using the `TiltDirective`, we are suggesting
to go with the 2nd approach.

Remove the style rule from `movie-card.component.scss` and instead introduce a `@HostBinding('style.transition')`
in the `TiltDirective` which sets those styles.

<details>
  <summary>TiltDirective `HostBinding`</summary>

```ts

@HostBinding('style.transition')
transition = 'transform .15s cubic-bezier(.4,0,.2,1) 0s';
```

</details>

There you go, if done properly, you should now see that the `TiltDirective` is working as expected
again.

### 4. control `TiltDirective` input bindings

Now it's time to have the `TiltDirective` still configurable when using it as a `hostDirective`.
We have different possibilities to choose from, let's walk through them one by one.

Use the `inject` method in order to grab the reference to `TiltDirective` inside of `MovieCardComponent`
and apply different input values. You can also apply different values for the newly introduced
`transition` binding to control this value without having it exposed as input.

<details>
  <summary>inject `TiltDirective`</summary>

```ts
// movie-card.component.ts

  private readonly tiltDirective = inject(TiltDirective);

  ngOnInit() {
    /* other ngOnInit code */
    this.tiltDirective.rotationDegree = 15;
  }
```
</details>

Feel free to play around with different values or changing different arguments.

Another way would be to forward the `@Input` bindings from the `MovieCardComponent` to the consumer
of it.
For this we have to slightly adjust the `hostDirective` configuration and set up the inputs we
actually want to forward.

As the `tilt` `@Input()` binding has already an alias, we cannot just forward it, we have to
rename it on the consumers end (`MovieCardComponent`).

Try to configure the `hostDirectives` setup so that it forwards the `tilt` input as `tiltDegree`.

<details>
  <summary>Forward Input bindings</summary>

```ts
// movie-card.component.ts

@Component({
  selector: 'movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  hostDirectives: [
    {
      directive: TiltDirective,
      inputs: ['tilt:tiltDegree'],
    },
  ],
})

```

</details>

Great, now we can apply the `tiltDegree` from the consumer of `MovieCardComponent`.
Go to `movie-list.component.html` and apply different values to see if the input forwarding
is working as expected.

<details>
  <summary>Use forwarded Inputs</summary>

```html
<!-- movie-list.component.html -->

<div class="movie-list">
  <movie-card
    [tiltDegree]="33"
    (selected)="navToDetail($event)"
    [movie]="movie"
    *ngFor="let movie of movies">

  </movie-card>
</div>

```

</details>
