NOTE: Still under development, in need of a nice 'Green Refactor'

Working:
  - Multiple NPM registry end points (configured in config/env/env.js)
  - Caching of both Index queries and TGZ packages

To be done:
  - SHA checking of cached packages against the latest index (corruption and new version protection)
  - Configuration of proxy by NPM endpoint rather than globally
  - Logging to file (only console works at the moment)
  - Converting into /bin NPM module 
  - Publishing on registry.npmjs.org

# Npmzor [![Build Status](https://secure.travis-ci.org/Stono/Npmzor.png?branch=develop)](http://travis-ci.org/Stono/Npmzor) [![Dependency Status](https://david-dm.org/Stono/Npmzor.svg)](https://david-dm.org/Stono/Npmzor)
NPMZor is a aggregating, caching proxy for NPM.
The purpose of this project is to:
  - Enable development teams to point to a single NPM registry, which will search multiple registries for them.
  - Enable caching of recent registry searches, to speed up npm installs, and also allow some functionality if the defined registries are flakey/down.
  - Allow multiple internal servers which do not have outbound internet access to connect to an internal npm registry which will proxy requests out.
  - Allow individual users to host their own local copy of NPMZor should they so choose, to enable an even faster local cache.

## Background
This project came about as I work for Hewlett-Packard, and the development team sit behind some proxies which make things a bit of a nightmare when we're mixing and matching internal and external servers.
We use registry.npmjs.org, but also have an internal NPM registry that we host our own NPM packages on.

NPMZor allows you to configure multiple NPM Registry end points, which it will traverse looking for the desired package, and return it to the client.  This enables your developers to have a single NPM registry set for all their needs.

NPMZor also supports caching of these requests, for periods defined within the configuration.

## Getting Started
At the moment, edit clone this repo, edit /config/production/production.js to suit, and type:
```
ENV=production node app.js
```
You'll then need to point your NPM config to the new server with:
```
npm config set registry http://yourserver:port/
```

## Contributing
This project has been developed using Test Driven Development, and also practices the Revealing Module Pattern for class definition (http://www.andrewrea.co.uk/posts/encapsulation_with_javascript).

I also use the excellent mocking library Deride (https://github.com/REAANDREW/deride).

Therefore if you wish to contribute, please fork the repo, follow these standards, and submit a pull request. 

You can run tests with the following:
```
grunt
grunt mochaTest:unit
grunt mochaTest:integration
grunt mochaTest:acceptance
```

## Release History
  - 0.1.1 - Basic NPM proxying and caching completed.
  - 0.1.0 - Intial Release

## License
Copyright (c) 2014 Karl Stoney  
Licensed under the MIT license.
