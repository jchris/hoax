/*
 * hoax
 * https://github.com/jchris/hoax
 *
 * Copyright (c) 2013 Chris Anderson
 * Licensed under the Apache license.
 */
var pax = require("pax"),
  request = require("request"),
  jreq = request.defaults({json:true});

function makeHoaxCallback(cb) {
  return function(err, res, body){
    if (err) {
      cb(err, res, body);
    } else {
      if (res.statusCode >= 400) {
        cb(body || res.statusCode, res);
      } else {
        cb(null, body);
      }
    }
  };
}

function callPaxOrArgs(myPax, path) {
  // if path is array and last is query, couchify it
  if (myPax.uri) {
    return myPax.uri(path);
  } else {
    return myPax(path);
  }
}

function processArguments(myPax, urlOrOpts, cb) {
  if (urlOrOpts.uri || urlOrOpts.url) {
    // it's options
    urlOrOpts.uri = callPaxOrArgs(myPax, (urlOrOpts.uri || urlOrOpts.url));
    return [urlOrOpts, cb];
  } else if (typeof urlOrOpts === 'function') {
    return [myPax, urlOrOpts];
  } else {
    return [callPaxOrArgs(myPax, urlOrOpts), cb];
  }
}

function makeHoax(myPax, verb) {
  var newHoax = function(url, cb) {
    var args = processArguments(myPax, url, cb);
    if (args[1]) {
      if (verb) {
        return jreq[verb](args[0].toString(), makeHoaxCallback(args[1]));
      } else {
        return jreq(args[0].toString(), makeHoaxCallback(args[1]));
      }
    } else {
      return makeHoax(args[0], verb);
    }
  };
  if (!verb) {
    "get put post head del".split(" ").forEach(function(v){
      newHoax[v] = makeHoax(myPax, v);
    });
  }
  return newHoax;
}

var Hoax = module.exports = makeHoax(pax());

Hoax.makeHoax = makeHoax;
