---
title: My First NPM Module - Easily Convert Callbacks to Promises
slug: My-First-NPM-Module-Easily-Convert-Callbacks-to-Promises
date: 2015-03-05 18:38:45
categories: ["tech", "code", "open source", "javascript", "nodejs"]
---

[Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) are coming in ES6. Think of a `Promise` as an object that represents a value that will be given to you *eventually*. You call your function and it returns a Promise, and you execute the `.then` method on the Promise, supplying a function that handles the value passed in. To handle errors, you can supply a second function to handle it in  `.then` or you can use the `.catch` method specifically. Here's a quick example, using AngularJS's `$http` object:

```javascript
// simple example, call a REST API and 
// fetch a list of users
$http.get('https://api.myapp.net/users')
  .then(function (users) {
    // when the API returns, user list will
    // be available to the application
    $scope.users = users;
  })
  .catch(function (err) {
    console.error('ERROR: ', err);
  });
```

Now, where have you seen this concept before? That's right, the callback, that hated part of JavaScript. Personally I don't think callbacks are that hard to handle, but people new to JS get wigged out by it, and I think Promises are a way to ease that anxiety. This introduces a bit of a problem: Promises are a fairly new thing (to ES6 at least; there has been a spec for a few years and library implementations like [Kriskowal's Q](https://github.com/kriskowal/q) and [Bluebird](https://github.com/petkaantonov/bluebird)) and not every API supports them yet. Furthermore, some environments like node.js use the callback style for any non-blocking IO operations, since callbacks are the best performing and lowest level way to do so. You can convert all of your code to Promises, but you still have to deal with external modules, libraries, and environments where callbacks reign supreme. What you need is an easy way to convert between the two. Enter `Proposal`.

## Proposal

I wrote [Proposal](http://npmjs.com/package/proposal) a few days ago. It does one thing and one thing well: converts callback-taking functions (which I'll call `nodebacks` from here on out) to `Promises`. This is great when your code is Promise-based but you have to interact with a callback-based environment. Here's an example, where we take node's `fs.readFile`, convert it into a `Proposal` object, and then execute it to return a `Promise`:

```javascript
var fs = require('fs'),
  Proposal = require('proposal');

var readProposal = Proposal(fs.readFile);
var readPromise = readProposal('./data/users.json');

readPromise
  .then(function (file) {
    var users = JSON.parse(file);
    res.json(users);
  })
  .catch(function (err) {
    res.status(500).send('error reading JSON file');
  });
```
If you don't want an intermediate `Proposal` object and want to cut down on lines of code, you can just return a Promise directly by passing the nodeback's arguments into the `Proposal()` call. Example:
```javascript
var fs = require('fs'),
  Proposal = require('proposal');

var readPromise = Proposal(fs.readFile, './data/users.json');
readPromise.then(...).catch(...);
```
Having an intermediate `Proposal` object is useful if you're going to run the same function more than once with different arguments.

You can get Proposal into your apps right now with a simple `npm i proposal --save`. I hope you find it useful.

## Getting to the Code

Proposal is written to deal with Promises that meet the spec, and it was mostly designed around Promises as implemented in ES6. As a matter of fact, I'm using ES6 with [Babel](http://babeljs.io/) to transpile to ES5, but hopefully that won't be necessary in the (not-so) near future. I also use npm scripts to perform the compilation and testing before publishing to NPM, so the package as installed is only transpiled ES5 source code. To see the ES6 source, you can [go to Github](https://github.com/vinniegarcia/proposal), it's all there ready to go. As a matter of fact, I'll post the whole module here:

```javascript
import 'core-js/shim';

//convert the err,data callback to promise resolve/reject calls
const denode = (resolve, reject) => (err, data) => (err) ? reject(err) : resolve(data);

//take a node-style function that sends an (err, result)
//callback and turns it into a promise
const promiseMe = (f, ...args) => new Promise((resolve, reject) => f(...args, denode(resolve, reject)));

//waits for parameters before creating the Promise
const curryWrap = (f) => (...more) => promiseMe(f, ...more);

// if args given, return a promise for the operation.
// if not, return a new function that waits for more input.
const Proposal = (nodefn, ...args) => (args.length > 0) ? promiseMe(nodefn, ...args) : curryWrap(nodefn);

export default Proposal;
```
Yes, it's only six lines of actual code. ES6 is awesome in that regard! So far my ES6 projects have been more documentation than code, and I'm perfectly okay with that!

### Open Source

This is my first NPM module, and the first module I'm releasing as open source under an MIT license. I hope to release a lot more in the future. If you have any questions on how to use it, suggestions for improvement or new features, or just want to chat about Proposal, please [email me](mailto:vinnie@coev.co?subject=Proposal module) about it, or file a github issue and I'll do my best to help out and respond.
