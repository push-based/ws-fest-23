# Modern Angular - inject method

This exercise focuses on the new `inject` method that was introduced with angular v15.

## Goal

In this exercise you will learn how to transition from the traditional constructor based 
dependency injection to the new standalone `inject` approach.
You will see how much cleaner component code looks when using the new functional approach.

Our target for refactoring will be the `MovieListPageComponent`. There is only 
one small step to be done in order to fulfill this task:

* replace constructor based injection for `MovieService` & `ActivatedRoute`

## replace constructor based injection

Go to the `MovieListPageComponent` and use the new `inject` method to inject
the dependencies for `ActivatedRoute` and `MovieService`. Of course make sure
to remove the constructor completely.

<details>
  <summary>MovieListPageComponent inject</summary>

```ts
// movie-list-page.component.ts

private movieService = inject(MovieService);
private activatedRoute = inject(ActivatedRoute);

// delete the constructor!

```

</details>

Great, you can serve the application and watch the `MovieListPageComponent` being still
functional :).

