title: Intro
date: 2015-01-18 22:43:11
tags:
---
This is my first post on hexo. I like it so far.
<!--more-->
Here's a contrived code test:
```javascript

function assignUser(req, next) {
  return function (err, usr) {
    if (usr) {
      req.user = usr;
    }
    next(err);
  }
}

function loadUser(userId) {
  return function (req, res, next) {
    User.findById(userId, assignUser(req, next));
  }
}
```
How do I look?
