var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();

const HealthAnalyzer = require('../services/HealthAnalyzer');

describe('Health Analyzer', function () {
  it('testing analyzeHourlyData - Exact matches for all params', function (done) {
    const healthAnalyzer = new HealthAnalyzer();
    const hourlyData = [{
      'PM2.5': {value: '8'},
      'PM10': {value: '3'},
      'CO': {value: '11'},
      'NO2': {value: '4'}
    }];
    const station = {};
    const result = healthAnalyzer.analyzeHourlyData({ hourlyData, station });
    console.log('result', result);
    expect(result.averageAQI).to.eq(2.5);
    done();
  });
  it('testing analyzeHourlyData - Non-Exact matches for all params', function (done) {
    const healthAnalyzer = new HealthAnalyzer();
    const hourlyData = [{
      'PM2.5': {value: '10'},
      'PM10': {value: '6'},
      'CO': {value: '25'},
      'NO2': {value: '12'}
    }];
    const station = {};
    const result = healthAnalyzer.analyzeHourlyData({ hourlyData, station });
    console.log('result', result);
    expect(result.averageAQI).to.eq(4.75);
    done();
  });
  it('testing analyzeHourlyData - Some params not present', function (done) {
    const healthAnalyzer = new HealthAnalyzer();
    const hourlyData = [{
      'PM2.5': {value: '10'},
      'PM10': {value: '6'}
    }];
    const station = {};
    const result = healthAnalyzer.analyzeHourlyData({ hourlyData, station });
    console.log('result', result);
    expect(result.averageAQI).to.eq(3.5);
    done();
  });
  it('testing analyzeHourlyData - No params present', function (done) {
    const healthAnalyzer = new HealthAnalyzer();
    const hourlyData = [{}];
    const station = {};
    const result = healthAnalyzer.analyzeHourlyData({ hourlyData, station });
    console.log('result', result);
    expect(result.averageAQI).to.eq(0);
    done();
  });
});
