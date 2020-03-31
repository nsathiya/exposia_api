var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();

const ReportingAreaParser = require('../parsers/ReportingAreaParser');
const fileToParse = './parsers/monitoring_site_locations.txt'
describe('Testing ReportingAreaParser', function () {
  it('getAqByZipCode', function (done) {
    const client = new ReportingAreaParser(fileToParse);
    client.parse();
    done();
  });
  it('monitoring stations', function (done) {
    const client = new ReportingAreaParser(fileToParse);
    client.parseMonitoringStations();
    console.log('File', client.getParsedFile());
    done();
  });
});
