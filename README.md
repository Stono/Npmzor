NOTE: Still under development, in need of a nice 'Green Refactor'

Working:
  - Multiple NPM registry end points (configured in config/env/env.js)
  - Caching of both Index queries and TGZ packages
  - External proxy connections honor http_proxy, https_proxy and no_proxy env variables
  
To be done:
  - SHA checking of cached packages against the latest index (corruption and new version protection)
  - Exposing an API to allow hosting of internal modules
  - Logging to file (only console works at the moment)
  - Converting into /bin NPM module 
  - Publishing on registry.npmjs.org

# Npmzor 
[![Build Status](https://secure.travis-ci.org/Stono/Npmzor.png?branch=develop)](http://travis-ci.org/Stono/Npmzor) 
[![Coverage Status](https://coveralls.io/repos/Stono/Npmzor/badge.png)](https://coveralls.io/r/Stono/Npmzor)
[![Dependency Status](https://david-dm.org/Stono/Npmzor.svg)](https://david-dm.org/Stono/Npmzor)

NPMZor is a aggregating and caching NPM Registry server.
The purpose of this project is to:
  - Enable development teams to point to a single NPM registry, which will search multiple external registries for them.
  - Enable caching of recent external registry searches, to speed up npm installs, and also allow some functionality if the defined registries are flakey/down.
  - Allow internal servers which do not have outbound internet access to connect to an internal npm registry which will proxy requests out.
  - Enable the hosting of internal npm modules which form part of our CI environment.
  - Allow individual users to host their own local copy of NPMZor should they so choose, to enable an even faster local cache.
  
## Background
This project came about as the company I work for have a rather complicated proxy setup which makes development and CI environments a bit of a nightmare to manage.
We also had the requirement to host modules which have been built internally on our CI environment available to the developers and builds of other modules.

I wanted the development team, and CI environment to be able to point to a single point, and that single point would serve up internal modules, as well as traversing external registries if required via the relevant proxy and returning the result, and caching those results where possible.

## Getting Started
At the moment, edit clone this repo, npm install, edit /config/production/production.js to suit, and type:
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

Further to this, the branching strategy is gitflow (https://github.com/nvie/gitflow), so please ensure you do your work in feature branches first.

In summary:
  - Clone the repo
  - NPM install
  - Create a feature branch
  - Write some tests
  - Write some code
  - Run your tests 
  - Finish your feature branch
  - Submit a pull request to me

You can run tests with the following:
```
grunt (this will run the full suite)
grunt mochaTest:unit
grunt mochaTest:integration
grunt mochaTest:acceptance
```

## Release History
  - 0.1.2 - no_proxy env variable is honored
  - 0.1.1 - Basic NPM proxying and caching completed.
  - 0.1.0 - Intial Release

## License
Copyright (c) 2014 Karl Stoney  
Licensed under the MIT license.
