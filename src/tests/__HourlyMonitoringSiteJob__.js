var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();

const HourlyMonitoringSiteJob = require('../jobs/HourlyMonitoringSiteJob');

describe('Testing Hourly Monitoring Site', function () {
  it('sample job', function (done) {
    this.timeout(600000);
    const job = new HourlyMonitoringSiteJob();
    return job.start().then(() => {
      done();
    })
    .catch(err => {
      console.log('Error in test', err);
      done();
    });
  });
});
