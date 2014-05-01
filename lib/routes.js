'use strict';
var Routes = function(director) {

  function getPackageIndex(name) {
    this.res.writeHead(200, { 'Content-Type': 'text/plain' })
    this.res.end('You requested index ' + name + '\n');
  };

  function getPackage(index, name, version) {
    this.res.writeHead(200, { 'Content-Type': 'text/plain' })
    this.res.end('You requested package ' + name + ', version ' + version + ' from ' + index + '\n');
  };

  var router = new director.http.Router();
  router.get('/:name', getPackageIndex);
  router.get(/([\w-]+)\/-\/([\w-]+)-([\d]+(\.\d+){2}).*/, getPackage);

  var requestHandler = function(req, res) {
    router.dispatch(req, res, function(err) {
      if(err) {
        res.writeHead(500);
        res.end();
      }
    })
  };

  return Object.freeze({
    requestHandler: requestHandler
  });

};

module.exports = {
  Routes: Routes
};