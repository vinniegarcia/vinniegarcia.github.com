title: Streamy Classes with Node and ES2015
date: 2015-06-20 10:32:20
tags: nodejs, streams, ES2015, classes, javascript
---
I really like [node streams](https://nodejs.org/api/stream.html). They're everywhere in node, and they can be really efficient because you're only dealing with small chunks of data at a time. You can use streams to read/write files, transform data, etc. The `request` and `response` objects in most nodejs web frameworks are readable and writable streams, respectively. You can do cool stuff like pipe the output of a CSV file to a database, or transforming that data to JSON and `pipe`'ing it to a web response stream.

The big hindrance to streams in my view has been the syntax. Here's an example of creating a Transform stream (a stream that is meant to change output of a readable stream for piping out to a writable stream). It's pretty simple, it just takes an object in and converts it to stringified JSON on the way out:

```javascript
var stream = require('stream'),
    util = require('util');

function StringifyStream(options) {
  if (!(this instanceof StringifyStream))
    return new StringifyStream(options);

  options = options || {};
  options.objectMode = true;

  stream.Transform.call(this,options);
}

util.inherits(StringifyStream,stream.Transform);

StringifyStream.prototype._transform = function(d,e,callback) {
  this.push(JSON.stringify(d));
  callback();
};
```

Now here's the same stream written as an ES2015 class.

```javascript
import {Transform} from 'stream';

class StringifyStream extends Transform {
  constructor(options={objectMode: true}) {
    super(options);
  }
  _transform(data, err, callback) {
    this.push(JSON.stringify(data));
    callback();
  }
}
```

It's the same thing with 40% less code (18 lines vs 10). As you can see, we don't have to worry about requiring `util` for inheritance, we don't have awkward syntax to call a parent class's constructor and pass `this` into it, and we have default parameters in the constructor in fewer lines than the default values above. The implementation of this stream is exactly the same as the first example, except you have to use `new` to call it. I don't consider that a big issue though; maybe you do.

Here's an example of usage that reads a CSV, stringifies the resulting objects, and pipes it out to standard output, all in 7 lines of code:

```javascript
import {createReadStream} from 'fs';
import {createStream} from 'csv-stream';
import StringifyStream from './stringifyStream';

createReadStream('./file.csv')
  .pipe(createStream())
  .pipe(new StringifyStream())
  .pipe(process.stdout);
```

The Stream API in node is a pretty easy interface to implement and is a good use case for classes. I'm actually not a big fan of complicated object inheritance hierarchies but I bend a little in the case of streams because the alternative isn't as clean to me. I tend to go for making simple functions first, and if necessary building up to objects or classes after that. Usually doing the simplest thing that can possibly work is a good guideline to have.

For more information on node streams, I suggest reading [Substack's Stream Handbook](https://github.com/substack/stream-handbook), which is a very thorough tutorial on nodejs streams. 

