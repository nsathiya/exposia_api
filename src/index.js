'use strict';

const {Buffer} = require('safe-buffer');
const escapeHtml = require('escape-html');
const AirNowClient = require('./clients/AirNowClient');
const firestoreDb = require('./db/firestoreDb');
const HourlyReportingAreaJob = require('./jobs/HourlyReportingAreaJob');
const HourlyMonitoringSiteJob = require('./jobs/HourlyMonitoringSiteJob');
const HealthAnalyzer = require('./services/HealthAnalyzer');

exports.getAq = (req, res) => {
  if (!req.query.zipCode) {
    throw new Error('param valid "zipCode" required');
  }
  const zipCode = req.query.zipCode;
  const client = new AirNowClient();
  return client
    .getAqByZipCode(zipCode)
    .then(aq => {
      const response = {data: aq};
      return res.send(response);
    })
};

exports.getAqByLatLong = (req, res) => {
  if (!req.query.lat || !req.query.long) {
    throw new Error('param valid "lat" or "long" required');
  }
  const lat = req.query.lat;
  const long = req.query.long;
  const client = new AirNowClient();
  return client
    .getAqByLatLong(lat, long)
    .then(aq => {
      const response = {data: aq};
      return res.send(response);
    })
};

exports.runHourlyReportingAreaJob = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const job = new HourlyReportingAreaJob();
  return job.start().then(() => {
    console.log('finished');
    res.send('success!')
  })
}

exports.runHourlyMonitoringSiteJob = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const job = new HourlyMonitoringSiteJob();
  return job.start().then(() => {
    console.log('finished');
    res.send('success!')
  })
}

exports.reportLocation = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  console.log(req.query);
  if (!req.query.latitude || !req.query.longitude) {
    res.send({success: false, message: 'Latitude and longitude needed'})
  }
  if (!req.query.userId) {
    res.send({success: false, message: 'Valid userId needed'})
  }
  const userId  = req.query.userId;
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const analyzer = new HealthAnalyzer();
  return analyzer.analyzeWithLocation(userId, latitude, longitude)
  .then(data => {
    res.send({success: true, message: data});
  })
}

exports.getAqiReport = (req, res) => {
  if (!req.query.startTime || !req.query.endTime) {
    res.send({success: false, message: 'Valid startTime and endTime query params needed'});
  }
  if (!req.query.userId) {
    res.send({success: false, message: 'Valid userId needed'});
  }
  const db = new firestoreDb();
  const userId = req.query.userId;
  const startTime = parseInt(req.query.startTime);
  const endTime = parseInt(req.query.endTime);
  console.log('request recieved', userId, startTime, endTime);
  return db.getAQIreportForUser({ startTime, endTime, userId })
  .then(data => {
    res.send({success: true, message: data});
  });
}
