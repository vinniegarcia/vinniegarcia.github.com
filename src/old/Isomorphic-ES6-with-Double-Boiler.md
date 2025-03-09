---
title: Isomorphic ES6 and React Apps with Double Boiler
slug: Isomorphic-ES6-with-Double-Boiler
date: 2015-02-07 17:36:57
categories: ["tech", "code", "javascript", "react"]
---
I have a fun (to me at least, many would disagree) job as a full stack JavaScript developer. It's a great time to be one, given how popular the web has gotten. Browsers are improving their JavaScript engines all the time and with Node.js, one can take the highly performant V8 engine from Chrome and run JavaScript code on the server. This can potentially speed up development by using the same language throughout your software stack. 

Unfortunately, the differences in JavaScript environments between your web server and your users' web browsers can lead to duplication of code to appease the environment's quirks. This diminishes the benefits of a unified stack. While some environment-specific code will always be required, the more code you can reuse between browser and server, the better the final product in terms of simplicity and robustness. A good design and system should help get you there and do its best to share code where possible, while allowing environment-specific tweaks when necessary.

The current buzzword for JavaScript apps that run on the client and server with the same code is "isomorphic". It's a great design goal and one I am moving towards in my work, so I decided to build a starter boilerplate project using isomorphic principles. This project will be used as a base for other projects so I can get up and running quickly. I call it [Double Boiler](https://github.com/vinniegarcia/double-boiler) because it's boilerplate for both the client and server environment.

Double Boiler includes most of what you need to get a basic web application running within minutes. Here's a sample of what's included:
- LESS to compile down to CSS with less boilerplate.
- ES6 (the next version of JavaScript) via [6to5](http://6to5.org/), so you can write in a future version of JavaScript and run it today.
- [Browserify](http://browserify.org/) to bundle your client-side JavaScript code and the many amazing libraries from [NPM](http://npmjs.org/).
- [React](https://facebook.github.io/react/) to write your views for both client and server.
- The [Express](http://expressjs.com/) web framework to create server-side web apps and APIs.
- [Grunt](http://gruntjs.com/) to build, run, and test your code as well as running other miscellaneous tasks.
- Watchers to automatically compile, test, and re-run your code as files change for a faster feedback loop and development workflow.

Double Boiler is currently [available on GitHub](https://github.com/vinniegarcia/double-boiler). It's currently in very early stages but it's working well for me and I'd love to get other people's feedback on it. This is my first open source project so all criticism is welcome, but pull requests would be even better of course.

In future posts I'll go into more detail on the inner workings of Double Boiler and explain my reasons behind my decisions. Thanks for reading!
