var hoax = require('../lib/hoax.js');

exports['awesome'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'no args': function(test) {
    test.expect(1);
    // tests here
    test.equal(hoax.awesome(), 'awesome', 'should be awesome.');
    test.done();
  }
};
