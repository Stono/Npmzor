# Npmzor 
[![Build Status](https://secure.travis-ci.org/Stono/Npmzor.png?branch=develop)](http://travis-ci.org/Stono/Npmzor) 
[![Coverage Status](https://coveralls.io/repos/Stono/Npmzor/badge.png?branch=develop)](https://coveralls.io/r/Stono/Npmzor?branch=develop)
[![Dependency Status](https://david-dm.org/Stono/Npmzor.svg)](https://david-dm.org/Stono/Npmzor)

NPMZor is a aggregating and caching NPM Registry server.
The purpose of this project is to:
  - Enable development teams to point to a single NPM registry, which will search multiple external registries for them.
  - Enable caching of recent external registry searches, to speed up npm installs, and also allow some functionality if the defined registries are flakey/down.
  - Allow internal servers which do not have outbound internet access to connect to an internal npm registry which will proxy requests out.
  - Enable the hosting of internal npm modules which form part of our CI environment.
  - Allow individual users to host their own local copy of NPMZor should they so choose, to enable an even faster local cache.

## Important
NOTE: Still under development, in need of a nice 'Green Refactor'

Working:
  - Multiple NPM registry end points (configured in config/env/env.js)
  - Caching of both Index queries and TGZ packages
  - External proxy connections honor http_proxy, https_proxy and no_proxy env variables
  - Hosting of your own internal modules by /PUT'ing to server:port/package 
  - Ability to get the /latest details or /-/package-latest 

To be done:
  - SHA checking of cached packages against the latest index (corruption and new version protection)
  - Logging to file (only console works at the moment)
  - Converting into /bin NPM module
  - Publishing on registry.npmjs.org
  
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
If you want to host your own npm modules on the server, PUT them:
```
curl -X PUT -F module=@./simple-empty-app-0.0.1.tgz http://127.0.0.1:8080/simple-empty-app
``` 
Internal modules will always be favoured over external modules when a client requests a module or index.
NOTE: If you push the same version multiple times (npmjs.org) does not allow this, you will need to do 'npm cache clear' on the client before doing 'npm install'

## Extra Features
Npmzor does a couple of things registry.npmjs.org does not.
One of these is the ability to get the /latest information
To get the latest package version json:
```
http://yourserver:port/package/latest 
```
To download the latest package:
```
http://yourserver:port/package/-/package-latest
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
ENV=local grunt (this will run the full suite)
ENV=local grunt mochaTest:unit
ENV=local grunt mochaTest:integration
ENV=local grunt mochaTest:acceptance
```

## Release History
  - 0.4.2 Added a root url which returns the version
  - 0.4.1 Added the /* route which does the same as /latest
  - 0.4.0 Huge bug fix, ETag is now checked when pulling from cache vs remote registry
  - 0.3.3 Fixed a bug where internel registry items didn't have an _id
  - 0.3.2 Added the ability get the /latest of a package 
  - 0.3.1 Routing upgrades following use in my environment.
  - 0.3.0 Added the ability to host your own node modules
  - 0.2.0 Basic TGZ proxying and caching completed
  - 0.1.2 Use of environment proxies (http, https and no_proxy)
  - 0.1.1 Basic JSON proxying and caching completed
  - 0.1.0 Intial Dev Release

## License
Copyright (c) 2014 Karl Stoney  
Licensed under the MIT license.
