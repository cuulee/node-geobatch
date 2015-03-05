/* eslint-disable no-unused-expressions, one-var */
require('traceur-runner');

const should = require('should'),
  fs = require('fs'),
  GeoBatch = require('../src/index.js');

describe('Testing index', function() {
  afterEach(function(done) {
    fs.exists('geocache.db', function(exists) {
      if (exists) {
        fs.unlinkSync('geocache.db');
      }

      done();
    });
  });

  it('should create a new instance when called without params', function() {
    const geoBatch = new GeoBatch();

    should.exist(geoBatch);
  });

  it('should accept a cachefile name', function(done) {
    const geoBatch = new GeoBatch({
      cacheFile: 'myPersonalGeocache.db'
    });

    should.exist(geoBatch);

    fs.exists('myPersonalGeocache.db', function(exists) {
      should(exists).be.true;
      fs.unlinkSync('myPersonalGeocache.db');
      done();
    });
  });

  it('should accept a clientId and a privateKey', function() {
    /* eslint-disable no-unused-vars */
    should(function() {
      const geoBatch = new GeoBatch({
        privateKey: 'dummy'
      });
    }).throw('Missing clientId');

    should(function() {
      const geoBatch = new GeoBatch({
        clientId: 'dummy'
      });
    }).throw('Missing privateKey');
    /* eslint-enable no-unused-vars */
  });

  it('should have a geocode function that returns a stream',
    function(done) {
      const geoBatch = new GeoBatch(),
        geocodeStream = geoBatch.geocode();

      should(geoBatch.geocode).be.a.Function;

      geocodeStream.on('data', function() {});
      geocodeStream.on('end', function() {
        done();
      });
    }
  );

  it('should geocode addresses',
    function(done) {
      const geoBatch = new GeoBatch(),
        geocodeStream = geoBatch.geocode(['Hamburg', 'Berlin']);

      let geocodeResponses = 0;

      geocodeStream.on('data', function(data) {
        should(data).be.an.Object;
        should(data).have.keys('address', 'location');
        geocodeResponses++;
      });
      geocodeStream.on('end', function() {
        should.equal(geocodeResponses, 2);
        done();
      });
    }
  );
});
