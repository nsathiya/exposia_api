var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();

const AirNowClient = require('../clients/AirNowClient');

describe('Test AirNowClient Functionalities', function () {
  it('getAqByZipCode', function (done) {
    const client = new AirNowClient();
    client
    .getAqByZipCode('94536')
    .then(aq => {
      expect(aq).to.not.equal(undefined);
      done();
    });
  });

  it('getAqByLatLong', function (done) {
    const client = new AirNowClient();
    client
    .getAqByLatLong('37.5485', '-121.9886')
    .then(aq => {
      expect(aq).to.not.equal(undefined);
      done();
    })
    .catch(error => {
      expect(error).to.equal(undefined);
      done();
    })
  });

  it('getReportingArea', function (done) {
    const client = new AirNowClient();
    client
    .getReportingArea()
    .then(reportingArea => {
      console.log('reportingArea', reportingArea)
      expect(reportingArea).to.not.equal(undefined);
      done();
    })
    .catch(error => {
      expect(error).to.equal(undefined);
      done();
    })
  });

  it('getHourlyReportingData', function (done) {
    const client = new AirNowClient();
    client
    .getHourlyReportingData()
    .then(hourlyReportingArea => {
      console.log('hourly reporting area', hourlyReportingArea)
      expect(hourlyReportingArea).to.not.equal(undefined);
      done();
    })
    .catch(error => {
      expect(error).to.equal(undefined);
      done();
    })
  });
});
