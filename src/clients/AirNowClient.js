const request = require('request-promise');
const queryString = require('query-string');
const ReportingAreaParser = require('../parsers/ReportingAreaParser');

const BASE_URL = 'http://www.airnowapi.org'
const API_KEY='B293413C-848D-4B09-B7F4-F6B482197659'

const AqByZipCodePath = 'aq/observation/zipCode/current';
const AqByLatLongPath = 'aq/observation/latLong/current';

const S3ReportingAreaURL = 'https://s3-us-west-1.amazonaws.com//files.airnowtech.org/airnow/today/reportingarea.dat'
const S3HourlyBaseURL =  'https://s3-us-west-1.amazonaws.com//files.airnowtech.org/airnow/today'

class AirNowClient {
  getAqByZipCode (zipCode, distance = 25) {
    const query = {
      format: 'application/json',
      zipCode,
      distance,
      API_KEY
    };
    const queryStringified = queryString.stringify(query);
    const url = `${BASE_URL}/${AqByZipCodePath}/?${queryStringified}`;
    return request(url)
      .then(response => {
        const data = JSON.parse(response);
        return data;
      })
      .catch(error => {
          throw new Error('AirNowClient failing ->', error);
      });
  }
  getAqByLatLong (lat, long, distance = 25) {
    const query = {
      format: 'application/json',
      latitude: lat,
      longitude: long,
      distance,
      API_KEY
    };
    const queryStringified = queryString.stringify(query);
    const url = `${BASE_URL}/${AqByLatLongPath}/?${queryStringified}`;
    return request(url)
      .then(response => {
        const data = JSON.parse(response);
        return data;
      })
      .catch(error => {
        console.log('error', error);
        throw new Error('AirNowClient failing ->', error);
      });
  }
  getReportingArea () {
    const parser = new ReportingAreaParser();
    return request(S3ReportingAreaURL)
      .then(response => {
        parser.setFile(response);
        parser.parse(response);
        return parser.getParsedFile();
      })
      .catch(error => {
        console.log('error', error);
        throw new Error('AirNowClient failing ->', error);
      });
  }
  getHourlyReportingData () {
    const parser = new ReportingAreaParser();
    const time = new Date();

    // set time 1 hour before
    time.setHours(time.getHours() - 1);

    const year = time.getUTCFullYear();
    const month = pad(time.getUTCMonth() + 1, 2);
    const day = pad(time.getUTCDate(), 2);
    const hour = pad(time.getUTCHours(), 2);

    const url = `${S3HourlyBaseURL}/HourlyData_${year}${month}${day}${hour}.dat`;
    console.log('hour reporting data url', url)
    return request(url)
      .then(response => {
        // console.log('response', response)
        parser.setFile(response);
        parser.parseHourlyData(response);
        return parser.getParsedFile();
      })
      .catch(error => {
        console.log('error', error);
        throw new Error(`AirNowClient failing -> ${error.message}`);
      });
  }
  getHourlyReportingDataFullFile () {
    const parser = new ReportingAreaParser();
    const time = new Date();

    // set time 1 hour before
    time.setHours(time.getHours() - 1);

    const year = time.getUTCFullYear();
    const month = pad(time.getUTCMonth() + 1, 2);
    const day = pad(time.getUTCDate(), 2);
    const hour = pad(time.getUTCHours(), 2);

    const url = `${S3HourlyBaseURL}/HourlyData_${year}${month}${day}${hour}.dat`;
    return request(url)
      .then(response => {
        // console.log('response', response)
        return response;
      })
      .catch(error => {
        console.log('error', error);
        throw new Error(`AirNowClient failing -> ${error.message}`);
      });
  }
}

const pad = (num, size) => {
  const padded = '0000' + num;
  const length = padded.length;
  const shortened = padded.substring(length-size);
  return shortened;
}

module.exports = AirNowClient
