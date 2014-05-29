'use strict';

var initDefault = function(obj, def){
  return obj || def;
};

var Routes = function(config, registryManager, fsUtil, multiparty, regexRouter) {
  var log      = new require('./logger').Logger(config, 'Routing');
  
  fsUtil       = initDefault(fsUtil, new (require('./fsUtil')).FileUtil(config));
  multiparty   = initDefault(multiparty, require('multiparty'));
  regexRouter  = initDefault(regexRouter, new require('./regexRouter').RegexRouter(config));

  // Exclusions
  regexRouter.exclude(/^.*(\.ico)$/);
  regexRouter.exclude(/^.*(\.png)$/);

  var packageRegex = '([a-zA-Z0-9._-]+)';
  var versionRegex = '([a-zA-Z0-9.-]+)';

  // GET /package
  regexRouter.get('^' + packageRegex + '$',
  function getPackageIndex(req, res, name) {
    log.debug(name + ': Get Index');
    registryManager.getModuleIndex(name, function(err, json) {
      var statusCode = getStatusCode(err, json);
      if (statusCode === 404) {
        sendResponse(res, statusCode);
      } else {
        sendResponse(res, statusCode, json);
      }
    });
  });
  
  // PUT /package
  regexRouter.put('^' + packageRegex + '$',
  function putPackage(req, res, name) {      
    log.debug(name + ': New version received');
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
      registryManager.addInternalModule(files[Object.keys(files)[0]][0].path, function(err, name, version) {
        if (err) {
          sendResponse(res, 500, {response: 'Failed to process new package'});
        } else {
          sendResponse(res, 200, {response: name + ' version ' + version + ' recieved and indexed.'});
        }
      });
    });
  });
    
  // GET /package/0.1.0
  regexRouter.get('^' + packageRegex + '/' + versionRegex + '/?$',
  function getPackageVersion(req, res, name, version) {
    log.debug(name + ': Get Index for version ' + version);
    registryManager.getModuleIndex(name, function(err, json) {
      var statusCode = getStatusCode(err, json);
  
      if((statusCode === 200 && json.versions[version] === undefined) || statusCode === 404) {
        statusCode = 404;
        sendResponse(res, statusCode);
      } else {
        json = json.versions[version];
        sendResponse(res, statusCode, json);
      }
    });    
  });
  
  // GET /package/-/package-0.1.0.tgz
  regexRouter.get('^' + packageRegex + '/-/(\\1)-' + versionRegex + '.tgz$',
  function getPackage(req, res, index, name, version) {
    log.debug(name + ': Get Package (' + version +')');
    registryManager.getModule(index, name, version, function(err, pathToTemp) {
      var statusCode = getStatusCode(err, pathToTemp);
      if (statusCode === 404) {
        sendResponse(res, statusCode);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
        fsUtil.createReadStream(pathToTemp).pipe(res);
      }
    });
  });
  
  var requestHandler = function(req, res) {
    regexRouter.route(req, res, function(err) {
      if(err) {
        log.error('404: ' + req.url);
        res.writeHead(404);
        res.end('Invalid Request');
      }
    });
  };
  
  /*
   * Send a JSON response back to the client
   */
  function sendResponse(response, code, json) {
    response.writeHead(code, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(json));
  }

  function getStatusCode(err, json) {
    return (err !== undefined || json === null) ? 404 : 200;
  }
  
  return Object.freeze({
    requestHandler: requestHandler
  });

};

module.exports = {
  Routes: Routes
};
