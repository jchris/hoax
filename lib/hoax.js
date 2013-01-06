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

function callPaxOrArgs(myHoax, path) {
  // if path is array and last is query, couchify it
  if (myHoax.pax) {
    return myHoax.pax(path);
  } else {
    return myHoax(path);
  }
}

function processArguments(myHoax, urlOrOpts, data, cb) {
  var opts = {};
  if (urlOrOpts.uri || urlOrOpts.url) {
    // it's options
    opts.uri = myHoax.pax(urlOrOpts.uri || urlOrOpts.url);
    // return [urlOrOpts, cb, data];
  } else if (typeof urlOrOpts === 'function') {
    cb = urlOrOpts;
    data = null;
    opts.uri = myHoax.pax;
    // return [myPax, urlOrOpts];
  } else if (typeof data === 'function') {
    cb = data;
    data = null;
    opts.uri = myHoax.pax(urlOrOpts);
    // return [myPax, data];
  } else {
    // return [callPaxOrArgs(myPax, urlOrOpts), cb, data];
  }
  if (data) {
    opts.body = data;
  }
  return [opts, cb];
}

function makeHoax(myPax, verb) {
  var myHoax;
  if (myPax.pax) {
    myHoax = myPax;
  } else {
    myHoax = {pax : myPax};
  }
  var newHoax = function(url, data, cb) {
    var args = processArguments(myHoax, url, data, cb);
    if (args[1]) {
      if (verb) {
        return jreq[verb](args[0], makeHoaxCallback(args[1]));
      } else {
        return jreq(args[0], makeHoaxCallback(args[1]));
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
