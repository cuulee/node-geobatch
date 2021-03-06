/* eslint-disable no-unused-expressions, one-var, max-nested-callbacks */
import should from 'should';
import Geocoder from '../src/geocoder.js';
import sinon from 'sinon';
import {
  getGeocodeFunction,
  getGeocoderInterface,
  getGeocoderOptions
} from './lib/helpers';

class MockCache {
  constructor() {}
  get() {}
  add() {}
}

describe('Testing geocoder', function() { // eslint-disable-line max-statements
  it('should require either credentials or an api key', function() {
    should(() => {
      const geocoder = new Geocoder( // eslint-disable-line no-unused-vars
        {},
        getGeocoderInterface(),
        MockCache
      );
    }).throw('Must either provide credentials or API key');
  });

  it('should create a cache', function() {
    const mackCacheFileName = 'a file name',
      mockCacheConstructor = sinon.stub();

    class NewMockCache extends MockCache {
      constructor(fileName) {
        super();
        mockCacheConstructor(fileName);
      }
    }

    const geocoder = new Geocoder( // eslint-disable-line
      getGeocoderOptions({
        cacheFile: mackCacheFileName
      }),
      getGeocoderInterface(),
      NewMockCache
    );

    sinon.assert.calledWith(mockCacheConstructor, mackCacheFileName);
  });

  it('should accept a client ID and a private key', function() {
    const geocoder = new Geocoder(
      {clientId: 'dummy', privateKey: 'dummy'},
      getGeocoderInterface(),
      MockCache
    );

    should.exist(geocoder);
  });

  it('should accept an api key', function() {
    const geocoder = new Geocoder(
      {apiKey: 'dummy'},
      getGeocoderInterface(),
      MockCache
    );

    should.exist(geocoder);
  });

  it('should throw an error when there is only the client id', function() {
    should(() => {
      const geocoder = new Geocoder( // eslint-disable-line
        {clientId: 'dummy'},
        getGeocoderInterface(),
        MockCache
      );
    }).throw('Missing privateKey');
  });

  it('should throw an error when there is only the private key', function() {
    should(function() {
      const geocoder = new Geocoder(// eslint-disable-line
        {privateKey: 'dummy'},
        getGeocoderInterface(),
        MockCache
      );
    }).throw('Missing clientId');
  });

  it('should throw an error when there is a client id & api key', function() {
    should(() => {
      const geocoder = new Geocoder( // eslint-disable-line
        {
          clientId: 'dummy',
          apiKey: 'dummy'
        },
        getGeocoderInterface(),
        MockCache
      );
    }).throw('Can only specify credentials or API key');
  });

  it('should throw an error when there is a private key & api key', function() {
    should(() => {
      const geocoder = new Geocoder( // eslint-disable-line
        {
          privateKey: 'dummy',
          apiKey: 'dummy'
        },
        getGeocoderInterface(),
        MockCache
      );
    }).throw('Can only specify credentials or API key');
  });

  it('should accept a maximum requests per second option', function() {
    const geocoder = new Geocoder(
      getGeocoderOptions({queriesPerSecond: 10}),
      getGeocoderInterface(),
      MockCache
    );

    should.exist(geocoder);
  });

  it('should accept a maximum number of retries option', function() {
    const geocoder = new Geocoder(
      getGeocoderOptions({maxRetries: 3}),
      getGeocoderInterface(),
      MockCache
    );

    should.exist(geocoder);
  });

  it('should not accept less than 1 query per second', function() {
    should(() => {
      const geocoder = new Geocoder( // eslint-disable-line no-unused-vars
        getGeocoderOptions({queriesPerSecond: 0.5}),
        getGeocoderInterface(),
        MockCache
      );
    }).throw('Requests per second must be >= 1 and <= 50');
  });

  it('should not accept negative queries per second', function() {
    should(() => {
      const geocoder = new Geocoder( // eslint-disable-line no-unused-vars
        getGeocoderOptions({queriesPerSecond: -2}),
        getGeocoderInterface(),
        MockCache
      );
    }).throw('Requests per second must be >= 1 and <= 50');
  });

  it('should not accept more than 50 queries per second', function() {
    should(() => {
      const geocoder = new Geocoder( // eslint-disable-line no-unused-vars
        getGeocoderOptions({queriesPerSecond: 51}),
        getGeocoderInterface(),
        MockCache
      );
    }).throw('Requests per second must be >= 1 and <= 50');
  });

  it('should return a promise from the geocodeAddress function', () => {
    const geocodeFunction = getGeocodeFunction({error: 'error'});

    const geoCoderInterface = getGeocoderInterface(geocodeFunction),
      geocoder = new Geocoder(
        getGeocoderOptions(),
        geoCoderInterface,
        MockCache
      );

    geocoder.geocodeAddress('Hamburg').should.be.a.Promise;
  });

  it('should call geocode function on geocodeAddress with correct parameter',
    function(done) {
      const mockAddress = 'anAddress',
        geocodeFunction = getGeocodeFunction({results: ['some result']}),
        geoCoderInterface = getGeocoderInterface(geocodeFunction),
        geocoder = new Geocoder(
          getGeocoderOptions(),
          geoCoderInterface,
          MockCache
        );

      geocoder.geocodeAddress(mockAddress)
        .then(() => {
          sinon.assert.calledWith(geocodeFunction, {address: mockAddress});
        })
        .then(done, done);
    }
  );

  it('should throw authentication error when using invalid client id', function(done) { // eslint-disable-line max-len
    const mockAddress = 'Hamburg',
      geocodeFunction = getGeocodeFunction({
        error: {
          code: 403
        }
      }),
      geoCoderInterface = getGeocoderInterface(geocodeFunction),
      geocoder = new Geocoder(
        {
          clientId: 'dummy',
          privateKey: 'dummy'
        },
        geoCoderInterface,
        MockCache);

    geocoder.geocodeAddress(mockAddress)
      .catch(error => {
        should(error).be.an.Error;
        should(error.message).equal('Authentication error');
      })
      .then(done, done);
  });

  it('should throw authentication error when using invalid api key', function(done) { // eslint-disable-line max-len
    const mockAddress = 'Hamburg',
      geocodeFunction = getGeocodeFunction({
        error: {
          code: 403
        }
      }),
      geoCoderInterface = getGeocoderInterface(geocodeFunction),
      geocoder = new Geocoder(
        {
          apiKey: 'dummy'
        },
        geoCoderInterface,
        MockCache);

    geocoder.geocodeAddress(mockAddress)
      .catch(error => {
        should(error).be.an.Error;
        should(error.message).equal('Authentication error');
      })
      .then(done, done);
  });

  it('should throw connection error when appropriate', function(done) {
    const mockAddress = 'Hamburg',
      geocodeFunction = getGeocodeFunction({
        error: {
          code: 'ECONNREFUSED'
        }
      }),
      geoCoderInterface = getGeocoderInterface(geocodeFunction),
      geocoder = new Geocoder(
        getGeocoderOptions(),
        geoCoderInterface,
        MockCache);

    geocoder.geocodeAddress(mockAddress)
      .catch(error => {
        should(error).be.an.Error;
        should(error.message).equal('Could not connect to the Google Maps API');
      })
      .then(done, done);
  });

  it('should geocode an address', function(done) {
    const mockAddress = 'Hamburg',
      geoCoderResult = ['mockResult'],
      expectedResult = geoCoderResult,
      geocodeFunction = getGeocodeFunction({results: geoCoderResult}),
      geoCoderInterface = getGeocoderInterface(geocodeFunction),
      geocoder = new Geocoder(
        getGeocoderOptions(),
        geoCoderInterface,
        MockCache
      );

    geocoder.geocodeAddress(mockAddress)
      .then(result => {
        should(result).equal(expectedResult);
      })
      .then(done, done);
  });

  it('should cache a geocode', function(done) {
    const mockAddress = 'anAddress',
      geoCoderResult = ['mockResult'],
      geocodeFunction = getGeocodeFunction({results: geoCoderResult}),
      geoCoderInterface = getGeocoderInterface(geocodeFunction),
      addFunction = sinon.stub();

    class NewMockCache extends MockCache {
      add(key, value) {
        addFunction(key, value);
      }
    }

    const geocoder = new Geocoder(
        getGeocoderOptions(),
        geoCoderInterface,
        NewMockCache
      ),
      geocode = geocoder.geocodeAddress(mockAddress);

    geocode
      .then(function() {
        sinon.assert.calledWith(addFunction, mockAddress, geoCoderResult);
      })
      .then(done, done);
  });

  it('should use the cached version if it exists', function(done) {
    const mockAddress = 'anAddress',
      cachedResult = 'a result from the cache',
      geoCoderResult = ['mockResult'],
      geocodeFunction = getGeocodeFunction({results: geoCoderResult}),
      geoCoderInterface = getGeocoderInterface(geocodeFunction);

    class NewMockCache extends MockCache {
      get() {
        return cachedResult;
      }
    }

    const geocoder = new Geocoder(
        getGeocoderOptions(),
        geoCoderInterface,
        NewMockCache
      ),
      geocode = geocoder.geocodeAddress(mockAddress);

    geocode
      .then(result => {
        should(result).equal(cachedResult);
      })
      .then(done, done);
  });

  it('should return an error when no result is found', function(done) {
    const mockAddress = 'My dummy location that does not exist!',
      geocodeFunction = getGeocodeFunction({results: []}),
      geoCoderInterface = getGeocoderInterface(geocodeFunction),
      geocoder = new Geocoder(
        getGeocoderOptions(),
        geoCoderInterface,
        MockCache
      );

    geocoder.geocodeAddress(mockAddress).catch(error => {
      should(error).be.an.Error;
      should(error.message).equal('No results found');
      done();
    });
  });

  it('should return an error when over query limit', function(done) {
    const mockAddress = 'Hamburg',
      geocodeFunction = getGeocodeFunction({
        results: ['Hamburg'],
        status: 'OVER_QUERY_LIMIT'
      }),
      geoCoderInterface = getGeocoderInterface(geocodeFunction),
      geocoder = new Geocoder(
        getGeocoderOptions(),
        geoCoderInterface,
        MockCache);

    geocoder.geocodeAddress(mockAddress)
      .catch(error => {
        should(error).be.an.Error;
        should(error.message).equal('Over query limit');
      })
      .then(done, done);
  });

  it('should retry `maxRetries` times', function(done) {
    const mockAddress = 'Hamburg',
      geocodeFunction = getGeocodeFunction({
        results: ['Hamburg'],
        status: 'OVER_QUERY_LIMIT'
      }),
      geoCoderInterface = getGeocoderInterface(geocodeFunction),
      geocoder = new Geocoder(
        getGeocoderOptions({
          maxRetries: 2
        }),
        geoCoderInterface,
        MockCache);

    geocoder.geocodeAddress(mockAddress)
      .catch(() => {
        should(geocodeFunction.calledThrice).equal(true);
      })
      .then(done, done);
  });
});
