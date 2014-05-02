Note:  Still under development, some features missing and needs a 'Green Refactor!'

# Npmzor [![Build Status](https://secure.travis-ci.org/Stono/Npmzor.png?branch=develop)](http://travis-ci.org/Stono/Npmzor)
NPMZor is a aggregating, caching proxy for NPM (Still under development).
This project came about as I work for Hewlett-Packard, and my development team sit behind some proxies.
We also have an internal NPM repository that we host our own NPM packages on.

NPMZor allows you to configure multiple NPM Repository end points, which it will traverse looking for the desired package, and return it to the client.  This enables your developers to have a single NPM repository set for all their needs.

NPMZor also supports caching of these requests, for periods defined within the configuration.

## Getting Started
At the moment, clone this repo and type:
```
ENV=production node app.js
```

## Contributing
This project has been developed using Test Driven Development, and also practices the Revealing Module Pattern for class definition (http://www.andrewrea.co.uk/posts/encapsulation_with_javascript).

I also use the excellent mocking library Deride (https://github.com/REAANDREW/deride).

Therefore if you wish to contribute, please fork the repo, follow these standards, and submit a pull request. 

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 Karl Stoney  
Licensed under the MIT license.
