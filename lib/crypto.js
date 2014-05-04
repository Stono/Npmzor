'use strict';

var Crypto = function(fs, crypto) {
  fs = fs || require('fs');
  crypto = crypto || require('crypto');
  
  var sha1 = function(filename, callback) {
    var shasum = crypto.createHash('sha1');

    var s = fs.ReadStream(filename);
    s.on('data', function(d) {
      shasum.update(d);
    })
    .on('end', function() {
      var sum = shasum.digest('hex').toLowerCase().trim();
      callback(undefined, sum);
    })
    .on('error', function(err) {
      callback(err);
    });
  };

  return Object.freeze({
    sha1: sha1
  });

};

module.exports = new Crypto();
