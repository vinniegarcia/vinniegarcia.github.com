title: Promising to Callback
date: 2015-02-15 20:05:25
tags:
  - promises
  - callbacks
  - async
---
I've never been a big fan of [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) for async code. That's not a point against Promises as a concept *per se*; it's more an issue of environment. Very few environments/libraries/frameworks using JavaScript use Promises; most, like XMLHttpRequest in browsers and node, use callbacks, and in order to have consistent async code you kind of have to choose one way or the other. Either you use callbacks everywhere, or you wrap all your callbacks in Promises, or you can have an inconsistent mess, but the last one isn't really an option. What can you do about it?

##Enter Promisify
This is a quick ES6 module you can drop into your project in order to take a node-style function with an errback (a function with the signature `(err, data)` in its callback) and turn it into a Promise. Simply feed it the function you want to convert and the arguments you want to pass in, and it'll return you a Promise that you can `.then`, `.catch`, or `await` (if you're using ES7 features in 6to5 :)). See below:
```javascript
function denode(resolve, reject) {
  return (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    };
}

function promisify(errbackFn, ...args)  {
  //take a node-style function that sends
  //an (err, result) style callback
  //and turns it into a promise
  let prom = new Promise((resolve, reject) => {
    let argsWithErrback = args.concat(denode(resolve, reject));
    errbackFn.apply(null, argsWithErrback);
  });
  return prom;
}

export default promisify;
```
Save it as `promisify.js` in your project. Then you can use it like so:
```javascript
import fs from 'fs';
import promisify from './promisify';
//read a directory listing
let futureFileListing = promisify(fs.readDir, __dirname);
futureFileListing.then(function (files) {
  files.forEach((filename) => { console.log(filename) });
})
.catch(function (err) {
  console.error('Oops! No directory!');
});
```
With Promises in the ES6 spec, and with ES7 building on Promises with async functions/await, expect to see more APIs use them. They may not be as fast as raw callbacks, but over time they will make your code neater as these new features go more mainstream.
