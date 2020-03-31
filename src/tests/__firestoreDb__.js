var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();

const Db = require('../db/firestoreDb');
const ReportingAreaParser = require('../parsers/ReportingAreaParser');

const fileToParse = './parsers/monitoring_site_locations.txt';
const HourlyDataFile = './tests/HourlyData_2019100202.dat'
const DRY = true;

const neededParameters = ['PM2.5', 'PM10', 'NO2', 'CO'];

describe('Testing firestoreDb', function () {
  it('saving monitoring stations', function (done) {
    const parser = new ReportingAreaParser(fileToParse);
    parser.parseMonitoringStations();
    const parsedSites = parser.getParsedFile();
    console.log('Number of parsed sites ', parsedSites.length);

    parser.setFileWithPath(HourlyDataFile);
    parser.parseHourlyData();
    const parsedHourlyData = parser.getParsedFile();
    const siteidInHourlyData = {};
    for (let site of parsedHourlyData) {
      siteidInHourlyData[site.siteid] = true;
    }
    console.log('Number of sites in hourly data ', Object.keys(siteidInHourlyData).length);

    try {
      const map = {};
      const result = [];
      const db = new Db();
      for (let site of parsedSites) {
        if (site.status &&
            site.status.toLowerCase() === 'active' &&
            neededParameters.includes(site.parameter_name) &&
            siteidInHourlyData[site.siteid] &&
            !map[site.siteid]
          ) {
            map[site.siteid] = true;
            result.push(site);
            if (!DRY) {
              db.saveMonitoringSite(site);
            }
        }
      }
      console.log('Number of sites stored in db', result.length);
    } catch (e) {
      console.log('Error encountered', e);
      throw new Error(e);
    }

    // Need to comment this so test runs fully and saves in db. TODO move this to a script. this is not a test
    done();
  });
  it.only('get closest monitoring stations', function (done) {
    const db = new Db();
    const latitude = '37.5485';
    const longitude = '-121.98';
    db.findNearestMonitoringStations(latitude, longitude, 1, 30)
    .then(data => {
      console.log('data', data);
      console.log('data length', data.length);
      done();
    })
    .catch(err => {
      console.log('error', err);
      done();
    })
  })
  it('find hourly data for monitoring site', function (done) {
    const db = new Db();
    const siteId = '100010002'
    db.findLatestHourlyDataForMonitoringSite(siteId)
    .then(data => {
      console.log('data', data)
      done();
    })
    .catch(err => {
      console.log('error', err);
      done();
    })
  })
  it('find hourly data for user with start and end time', function (done) {
    const db = new Db();
    const userId = 'r70ZIxohXIbsLmoTCpvDuEehBP23'
    const startTime = 1569997386244;
    const endTime = 1569997436030;
    db.getAQIreportForUser({ userId, startTime, endTime })
    .then(data => {
      console.log('data', data)
      done();
    })
    .catch(err => {
      console.log('error', err);
      done();
    })
  })
});
