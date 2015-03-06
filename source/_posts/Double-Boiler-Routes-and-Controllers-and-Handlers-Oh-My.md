title: "Double Boiler: Routes and Controllers and Handlers, Oh My!"
date: 2015-02-08 17:41:33
tags:
  - nodejs
  - MVC
  - web app design
  - express
categories:
  - Code
  - Software Design
---
Sometimes MVC is too controlling.
<!--more-->
Over the past decade or so, the default pattern to follow when building a web application has been [MVC](http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller), or the Model-View-Controller pattern. This pattern encourages breaking your code up into smaller, reusable components with strictly defined responsibilities. Your Model performs business logic like performing calculations in a spreadsheet or reading/writing files for data. Views present to the user in an interface that allows them to view or modify that data. Finally, the Controller is the glue between models and views, handling user input events from views and calling business logic available from models to populate those views with data. It's a simple concept that works, to a point.

One thing to keep in mind when using MVC: it's not an architecture that was created with web applications in mind. MVC was originally designed for desktop application software, with the idiosynchrocies of that platform in mind. When mapping those concepts to the web, the most obvious thing to do was to keep the models for business logic and to use HTML (or XML, then increasingly JSON) for the views. That leaves the controller, which became the part of your codebase where you glued everything together in huge functions and mapped them to URL endpoints. If you're not careful, you can end up with something like the following for a controller route:
```javascript
//a checkout controller route for a "simple" shopping cart.
router.post('/checkout', function (req, res, next) {
  Order.validate(req.body, function (err, validPayload) {
    if (err) {
      //validation failed, redirect back to form
      return res.redirect('/checkout?invalid=true');
    }
    Order.create(validPayload, function (err, order) {
      if (err) {
        //failed order submission
        return res.redirect('/checkout?error=true');
      }
      //order succeeded, send confirmation email to customer
      CustomerOrderEmail.send(order, function (err, result) {
        if (err) {
          //sending email failed. um....
          return next(err);
        }
        //send internal email to business
        MerchantOrderEmail.send(order, function (err, response) {
          if (err) {
             //this is getting old isn't it?
            return next(err);
          }
          //FINALLY we get to the good stuff!
          res.render('happyOrderComplete', {
            order: order,
            email: result
          });
        });
      });
    });
  }); 
});
```
That's a whole lot of concerns getting tangled up in a seemingly simple function! And yes, while you can clean up the callback pyramid of doom by hoisting functions or Promises or whatever async handling you prefer, this is still a lot going on. 

##Before and After
Most frameworks have had some way to deal with this complexity, with varying degrees of effectiveness. Struts, one of the first Java MVC web frameworks, had ActionFilters. Ruby on Rails has `before_filter` and `after_filter` to run common actions before or after a route is called, like loading user information from a database before each request. These filters help somewhat, but they still have limits. Now instead of cramming everything into one function, you have three functions to split the load. Why does it have to be that way?
##From the Middle Out
What if we just created lots of small functions that each did one small thing, and composed them together? Well, this is where _handlers_ come in. The beauty of [Express](http://expressjs.com/), and specifically its concept of [middleware](http://expressjs.com/guide/using-middleware.html), is that a route/URL doesn't map to a function, but rather to a *chain* of functions called _handlers_. Each handler function has three parameters: 

- _req_, the object representing the current request; 
- _res_, the object representing the current response being constructed; and
- _next_, a callback that when invoked cedes control to the next handler in the middleware chain.

Now, that description sure looks a lot like that big function we saw earlier, doesn't it? They have the same parameters! So we know that we can do better, and that Express allows for multiple handlers per route. Let's do a little refactoring:
```javascript
function validateOrder(req, res, next) {
  Order.validate(req.body, function (err, validPayload) {
    if (err) {
      //validation failed, redirect back to form
      return res.redirect('/checkout?invalid=true');
    }
    req.payload = validPayload;
    next();
  });
}

function submitOrder(req, res, next) {
  Order.create(validPayload, function (err, order) {
    if (err) {
      //failed order submission
      return res.redirect('/checkout?error=true');
    }
    req.order = order;
    next();
  });
}

function sendCustomerEmail(req, res, next) {
  CustomerOrderEmail.send(order, function (err, result) {
    if (err) {
      return next(err);
    }
    req.email = result;
    next();
  });
}

function sendBusinessEmail(req, res, next) {
  MerchantOrderEmail.send(order, function (err, response) {
    if (err) {
      return next(err);
    }
    req.merchantEmail = response;
    next();
  });
}

function showConfirmationPage(req, res) {
  res.render('happyConfirmationPage', {
    order: req.order,
    email: req.email
  });
}

//it's getting simpler
router.post('/checkout',
  validateOrder,
  submitOrder,
  sendCustomerEmail,
  sendBusinessEmail,
  showConfirmationPage);
```
This may not look like we've done much initially, but let's take a closer look:

- We've broken up the callback pyramid, making the code much easier to read top-down. This will be a big aid in six months when you haven't looked at it in a while.
- Each step of the checkout process has been isolated into its own handler. These handlers can be organized separately (for example, the `sendCustomerEmail` and `sendBusinessEmail` handlers can be put into a common module) and you can organize the code by functionality rather than by URL.
- On a low level, smaller functions are optimized by V8, so for node.js specifically you can get a free performance boost just by breaking up larger (100+ line) functions.
- On a high level, it becomes much easier to maintain features over time with the multiple handler model. For example, let's say we decide to stop sending emails directly from the webapp and want to send it to a message queue for later processing (a smart and scalable choice!). Then we can just remove the email handlers and add a message queue handler:
```javascript
//assume we still have the other functions above

function sendOrderToQueue(req, res, next) {
  MessageQueue.insert(req.order, function (err, msg) {
    if (err) {
      return next(err);
    }
    req.messageId = msg.id;
    next();
  });
}

//a checkout controller route for a "simple" shopping cart.
router.post('/checkout',
  validateOrder,
  submitOrder,
  sendOrderToQueue,
  showConfirmationPage);
```
##Where to handle it
Earlier in the article I alluded to organizing handlers by functionality and not by URL. If you look at the [Double Boiler](https://github.com/vinniegarcia/double-boiler) source, you'll see a separate `routes` directory:
```
➜  src git:(develop) ✗ tree
.
├── app
│   └── products
│       ├── product.model.js
│       └── product.resource.js
├── app.js
├── config
├── index.js
├── public
│   └── js
│       ├── app
│       │   ├── index.js
│       └── views
│           ├── app.jsx
│           └── helloMessage.jsx
├── routes
│   ├── index.js
│   └── products
│       └── index.js
└── startup
```
In my `routes` directory, each subfolder matches part of the URL path (created by [enrouten]()). For example, here's the `routes/products/index.js` module, which defines some JSON API endpoints for products:
```javascript
'use strict';

import ProductResource from '../../app/products/product.resource';
import Authorize from '../../app/shared/authorization';

export default function (router) {

  router.get('/', Authorize.isLoggedIn, ProductResource.list);
  router.post('/', Authorize.isLoggedIn, ProductResource.create);

  router.get('/:id', Authorize.isLoggedIn,  ProductResource.find);
  router.put('/:id', Authorize.isLoggedIn, ProductResource.update);
  router.delete('/:id', Authorize.isLoggedIn, ProductResource.destroy);

}
```
Pretty barebones huh? It's just a mapping of routes to a list of handlers. The handlers are broken up by responsibility, so all the login handlers are in the `Authorize` module and all of the product handlers are in the `ProductResource` module. I find that having clean routes like this also helps developers new to the application get their way around much quicker. They can hop in, open a route file, and be on their way to the meat of the application in no time.

##Conclusion
I hope I've shown you that you don't need to cram everything into a single function in your Express apps. The Node community's ideal (and the UNIX philosophy upon which it's based) of tiny functions and modules that do one thing well does have its benefits in terms of simplicity and productivity. Use it to your advantage.
