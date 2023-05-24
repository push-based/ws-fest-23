# Memlab exercise

The goal of this exercise is to deepen your knowledge about the analysis of the memory consumption of javascript
applications. In this exercise you will get to know a brand new tool which helps you to understand and analyze the memory
heap of javascript applications - `memlab`.

For this exercise you will need to check out the [`memlab playground`](https://github.com/push-based/memlab-playground) repository.

If you like, you can go ahead and read the docs first, it will def. help you to understand this exercise even better.

* [official docs](https://facebook.github.io/memlab/docs/intro)
* [custom docs](https://github.com/push-based/memlab-playground/docs)

## Get to know with memlab

After checking out the memlab playground, inspect the already existing `scenario` in `./scenarios/stackblitz-list-toggle.js`.
It describes a scenario that should open a browser to `https://js-pgj8he.stackblitz.io`, click a `toggle-list` button and click the same button
again.

Run the scenario with the following command:

```bash
 memlab run --scenario ./scenarios/stackblitz-list-toggle.js --headful
```

> if you like, you can use the `--work-dir ./results` param in order to not store data deep in your filesystem, but keep in mind adding it to any other command as well

It will run the memlab process in headful mode which should actually display you a browser window performing
the described scenario.

After the process is finished, inspect the initial outcome.

You should see the application is piling up huge amounts of memory after each step.

![memlab-run-stackblitz-list](images/memlab/memlab-run-stackblitz-list.png)

It will also tell you immediately that it found two leaks.

![found-two-leaks-stackblitz](images/memlab/found-two-leaks-stackblitz.png)

<details>
  <summary>The Leaks</summary>

One is pointing to a `button` property in a `ListItem` class and another one
pointing to a `console.log` usage.

</details>

### Size Analysis

Let's try to dig deeper into the memory heap of our test application and perform a `size analysis`.

Your task is to search for suspiciously large `object`s as well as `shapes` stored in the heap.

<details>
  <summary>commands</summary>

```bash
memlab analyze object-size
```

```bash
memlab analyze shape
```

</details>


<details>
  <summary>outcome</summary>

**Large Objects**

The object size analysis tells you there is a `24MB` large `logs` object and multiple `8MB` large `someLargeObject` instances.

![img.png](images/memlab/analyze-object-stackblitz.png)

**Large Shapes**

The shape analysis tells you there is an `80MB` large `ListItem` shape storing multiple `8MB` large objects. They are probably related to the `someLargeObject` instances observed
before.
You can also observe the `24MB` large shape `{ logs, log }`.

![analyze-shape-stackblitz](images/memlab/analyze-shape-stackblitz.png)

</details>

Great, you now know about the largest pieces of data stored in your memory. Let's take it one step further.

### Growth Analysis

We are now aware of our largest pieces of data, but we also want to know which objects and shapes
are growing over time while performing the described scenario.

Your task is to search for suspiciously growing `object`s as well as `shapes` stored in the heaps.

<details>
  <summary>commands</summary>

```bash
memlab analyze unbound-object
```

```bash
memlab analyze unbound-shape
```

</details>


<details>
  <summary>outcome</summary>

**Unbound Objects**

The unbound-object analysis tells you that the `{ log, logs }` object grew from `224b` => `9MB` => `24MB` in size
while performing the scenario.

![analyze-unbound-object-stackblitz](images/memlab/analyze-unbound-object-stackblitz.png)

**Unbound Shapes**

The unbound shape analysis won't give you a result here

</details>

**Congratulations!!** You are now aware of the basics of `memlab` and gained knowledge about
how to deeper analyze the memory consumption of javascript applications.

## Find memory leaks in movies app

Now it's time to use the knowledge we've gained in the last couple of exercises
related to memory analysis and apply it to our `angular movies` application.

### Write memlab scenario

Create a new memlab scenario which should do the following:
* start: `http://localhost:4200/my-movies`
* action: navigate to `/list/popular` (or any other route you like)
  * optionally: scroll down the list
  * optionally: navigate to another list as well!
* revert: navigate back to `/my-movies`

> hint: you should not navigate with `page.goto`, but instead use the `page.click`
> api

create a new file `./scenarios/movie-list-toggle.js`.

> hint: the `page` parameter is of type [`Puppeteer.Page`](https://pptr.dev/api/puppeteer.page)

> hint: use the `verbose` & `headful` mode if something is not working as expected

```bash
memlab run --scenario ./scenarios/movie-list-toggle.js --headful --verbose
```

<details>
  <summary>Scenario Skeleton</summary>

```js
const url = () => '';

const action = async page => {
    
};

const back = async page => {
    
};

module.exports = {
    url, action, back
};

```

</details>

<details>
  <summary>Working Scenario</summary>

```js

const url = () => 'http://localhost:4200/my-movies';

const action = async page => {
    await page.click('a[href="/list/popular"]');
};

const back = async page => {
    await page.click('a[href="/my-movies"]');
};

module.exports = {
    url, action, back
};

```

</details>

Try to run the scenario with the following command:

```bash
memlab run --scenario ./scenarios/movie-list-toggle.js --headful
```

Great, you have successfully implemented your first memlab scenario :-).

### Detect Leaks and movies app

Try to use the commands we've learned before and analyze if there are memory leaks occurring
during your implemented scenario.

> hint: you probably want to run the scenario with more than 1 single repetition.

<details>
  <summary>Run with more repetitions</summary>

```js
// ./scenarios/movie-list-toggle.js

module.exports = {
    url, action, back, repeat: () => 3
};
```

</details>

If you spot a leak, try to identify it in the code and fix it. You can run the scenario again in order
to proof if you fixed the issue or not.

To let memlab give you again the information about the detected leaks, execute the
following command:

```bash
memlab find-leaks
```

> Hint: I know this task is hard and the outcome of memlab is hard to understand. You probably
> want to make use of other tools (e.g. edge detached elements, performance monitor)
> in order to find the root cause of the observed memory leak
> You will see a lot of angular internals messing up in the heap.

**Command overview**:

* `memlab run --scenario`
* `memlab find-leaks`
* `memlab analyze object`
* `memlab analyze shape`

**Can be Interesting to run**

* `memlab trace --node-id="nodeId"`

**Probably not needed here, unless you have a more complex scenario**

* `memlab analyze unbound-object`
* `memlab analyze unbound-shape`


**Some Hints**

<details>
  <summary>Scroll Event Listener</summary>

This pattern points to a not closed subscription to a scroll event listener:

![movie-list-scroll-leak](images/memlab/memlab-movie-list-scroll-leak.png)

> hint: `element-visibility.directive.ts`

</details>


<details>
  <summary>Resize Event Listener</summary>

This pattern points to a not closed subscription to a resize event listener:

![movie-list-resize-leak](images/memlab/memlab-movie-list-resize-leak.png)

> hint: `movie-list.component.ts`

</details>

<details>
  <summary>Shape Analysis</summary>

The shape analysis shows there are still movie objects kept in memory.
This is potentially a problem as we should be in a reverted state
without any movies being loaded

![memlab-movie-list-shape](images/memlab/memlab-movie-list-shape.png)

Tracing one of the example nodes listed after the shape will reveil it is
part of a `movies` array in `MovieListComponent`.

![movie-list-trace-shape](images/memlab/memlab-movie-list-trace-shape.png)

</details>

**Congratulations, this is awesome!** You have successfully managed to
implement your first memlab scenario and fixed memory leaks 
