var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();

const HourlyReportingAreaJob = require('../jobs/HourlyReportingAreaJob');

describe('Testing ReportingAreaParser', function () {
  it('getAqByZipCode', function (done) {
    const job = new HourlyReportingAreaJob();
    job.start().then(() => {
      console.log('finished');
      done();
    })
    .catch(err => console.log('Error', err));
  });
});
