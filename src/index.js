/**
 * Copyright 2018, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {Buffer} = require('safe-buffer');

// [START functions_helloworld_http]
const escapeHtml = require('escape-html');

const AirNowClient = require('./clients/AirNowClient');
const firestoreDb = require('./db/firestoreDb');
const HourlyReportingAreaJob = require('./jobs/HourlyReportingAreaJob');
const HourlyMonitoringSiteJob = require('./jobs/HourlyMonitoringSiteJob');
const HealthAnalyzer = require('./services/HealthAnalyzer');
// [END functions_helloworld_http]

// [START functions_helloworld_get]
/**
 * HTTP Cloud Function.
 * This function is exported by index.js, and is executed when
 * you make an HTTP request to the deployed function's endpoint.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.helloGET = (req, res) => {
  res.send('Hello World!');
};
// [END functions_helloworld_get]

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

// [START functions_helloworld_http]
/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.helloHttp = (req, res) => {
  res.send(`Hello ${escapeHtml(req.query.name || req.body.name || 'World')}!`);
};
// [END functions_helloworld_http]

// [START functions_helloworld_background]
/**
 * Background Cloud Function.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.helloBackground = (event, callback) => {
  callback(null, `Hello ${event.data.name || 'World'}!`);
};
// [END functions_helloworld_background]

// [START functions_helloworld_pubsub]
/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.helloPubSub = (event, callback) => {
  const pubsubMessage = event.data;
  const name = pubsubMessage.data
    ? Buffer.from(pubsubMessage.data, 'base64').toString()
    : 'World';

  console.log(`Hello, ${name}!`);

  callback();
};
// [END functions_helloworld_pubsub]

// [START functions_helloworld_storage]
/**
 * Background Cloud Function to be triggered by Cloud Storage.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.helloGCS = (event, callback) => {
  const file = event.data;

  if (file.resourceState === 'not_exists') {
    console.log(`File ${file.name} deleted.`);
  } else if (file.metageneration === '1') {
    // metageneration attribute is updated on metadata changes.
    // value is 1 if file was newly created or overwritten
    console.log(`File ${file.name} uploaded.`);
  } else {
    console.log(`File ${file.name} metadata updated.`);
  }

  callback();
};
// [END functions_helloworld_storage]

// [START functions_helloworld_storage_generic]
/**
 * Generic background Cloud Function to be triggered by Cloud Storage.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.helloGCSGeneric = (event, callback) => {
  const file = event.data;

  console.log(`  Event: ${event.eventId}`);
  console.log(`  Event Type: ${event.eventType}`);
  console.log(`  Bucket: ${file.bucket}`);
  console.log(`  File: ${file.name}`);
  console.log(`  Metageneration: ${file.metageneration}`);
  console.log(`  Created: ${file.timeCreated}`);
  console.log(`  Updated: ${file.updated}`);

  callback();
};
// [END functions_helloworld_storage_generic]

/**
 * Background Cloud Function that throws an error.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */

exports.helloError = (event, callback) => {
  // [START functions_helloworld_error]
  // These WILL be reported to Stackdriver Error Reporting
  console.error(new Error('I failed you'));
  console.error('I failed you', new Error('I failed you too'));
  throw new Error('I failed you'); // Will cause a cold start if not caught

  // [END functions_helloworld_error]
};

/**
 * Background Cloud Function that throws a value.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
/* eslint-disable no-throw-literal */

exports.helloError2 = (event, callback) => {
  // [START functions_helloworld_error]
  // These will NOT be reported to Stackdriver Error Reporting
  console.info(new Error('I failed you')); // Logging an Error object at the info level
  console.error('I failed you'); // Logging something other than an Error object
  throw 1; // Throwing something other than an Error object
  // [END functions_helloworld_error]
};
/* eslint-enable no-throw-literal */

/**
 * Background Cloud Function that returns an error.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
/* eslint-disable */
exports.helloError3 = (event, callback) => {
  // This will NOT be reported to Stackdriver Error Reporting
  // [START functions_helloworld_error]
  callback('I failed you');
  // [END functions_helloworld_error]
};
/* eslint-enable */

/**
 * HTTP Cloud Function that returns an error.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.helloError4 = (req, res) => {
  // This will NOT be reported to Stackdriver Error Reporting
  // [START functions_helloworld_error]
  res.status(500).send('I failed you');
  // [END functions_helloworld_error]
};

// [START functions_helloworld_template]
const path = require('path');
const pug = require('pug');

// Renders the index.pug
exports.helloTemplate = (req, res) => {
  // Render the index.pug file
  const html = pug.renderFile(path.join(__dirname, 'index.pug'));

  res.send(html).end();
};
// [END functions_helloworld_template]
