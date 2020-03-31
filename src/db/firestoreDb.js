const Firestore = require('@google-cloud/firestore');
const geofirex = require('geofirex');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

const firebase = require('firebase');

// const app = firebase.initializeApp({/*config*/})
// const db = geofirex.init(app);


const targetAreas = ['Fremont', 'Tahoe City area', 'San Jose', 'Mountain View'];

// console.log(functions.config().firebase)
let serviceAccount = require('./serviceAccountKey.json');
// console.log(serviceAccount)

// const admin = firebase.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

const app = firebase.initializeApp({
  apiKey: 'AIzaSyDuFsc1srxxlPcf1RCU0Ufg1NLTv8lltQQ',
  // authDomain: "<PROJECT_ID>.firebaseapp.com",
  // databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
  projectId: 'exposia',

  // messagingSenderId: "<SENDER_ID>",
})
// admin.initializeApp(functions.config().firebase);
// import * as geofirex from 'geofirex';
const geo = geofirex.init(app);
// const geo = geofirex.init(firebase);

const db = firebase.firestore();

// const PROJECTID = 'cloud-functions-firestore';
// const COLLECTION_NAME = 'cloud-functions-firestore';
// const firestore = new Firestore({
//   projectId: PROJECTID,
//   timestampsInSnapshots: true,
// });
var MS_PER_MINUTE = 60000;

class FirestoreDb {
  saveReportingAreaEntry(rows) {
    const currentTimeUTC = new Date().getTime();
    // console.log('currentTimeUTC', currentTimeUTC)
    const ref = db
      .collection('reportingArea')
      .doc(currentTimeUTC.toString())
      .collection('current')
    const promises = [];
    const results = [];
    for (let row of rows) {
      if (targetAreas.includes(row.reporting_area)) {
        console.log('area', row)
        results.push({
          reportingArea: row.reporting_area,
          [row.parameter_name]: `${row.aqi_catogery} ${row.aqi_value}`
        })
      }

      promises.push(
        db
        .collection('reportingArea')
        .doc(currentTimeUTC.toString())
        .collection('current')
        .doc(row.reporting_area.replace(/\//g, '-'))
        .collection('parameters')
        .doc(row.parameter_name)
        .set(row)
      );
    }
    return Promise.all(promises).then(() => results);
  }
  saveHourlyDataEntries(rows) {
    const currentTimeUTC = new Date().getTime();
    currentTimeUTC.setHours(currentTimeUTC.getHours() - 1);
    const promises = [];
    const results = [];
    for (let row of rows) {
      // console.log('area', row)
      if (!row.siteid) {
        continue;
      }
      results.push({
        sitename: row.sitename,
        data: `${row.parameter_name} ${row.value} ${row.reporting_units}`
      })

      promises.push(
        db
        .collection('hourlyData')
        .doc(currentTimeUTC.getTime().toString())
        .collection('current')
        .doc(row.sitename.replace(/\//g, '-'))
        .set({})
        .collection('parameters')
        .doc(row.parameter_name)
        .set(row)
      );
    }
    console.log(`Saving ${promises.length} rows`)
    return Promise.all(promises).then(() => results);
  }
  saveHourlyDataEntriesV2(rows) {
    const currentTimeUTC = new Date().getTime();
    currentTimeUTC.setHours(currentTimeUTC.getHours() - 1);
    const promises = [];
    const results = [];
    const doc = {};
    for (let row of rows) {
      // console.log('area', row)
      if (!row.siteid) {
        continue;
      }
      if (!doc[row.siteid]) {
        doc[row.siteid] = {}
      }
      doc[row.siteid][row.parameter_name] = row
      results.push({
        sitename: row.sitename,
        data: `${row.parameter_name} ${row.value} ${row.reporting_units}`
      })
    }
    for (let siteid in doc) {
      promises.push(
        db
        .collection('hourlyData')
        .doc(currentTimeUTC.getTime().toString())
        .collection('monitoringStations')
        .doc(siteid)
        .set(doc[siteid])
      );
    }
    console.log(`Encountered ${rows.length} rows`)
    console.log(`Saving ${promises.length} docs`)
    return Promise.all(promises).then(() => results);
  }
  saveHourlyDataEntriesV3(rows) {
    const promises = [];
    const results = [];
    const doc = {};
    for (let row of rows) {
      if (!row.siteid) {
        continue;
      }
      if (!doc[row.siteid]) {
        doc[row.siteid] = {}
      }
      doc[row.siteid][row.parameter_name] = row
      results.push({
        sitename: row.sitename,
        data: `${row.parameter_name} ${row.value} ${row.reporting_units}`
      })
    }
    let save = true;
    for (let siteid in doc) {
      const timestampUTC = (new Date().getTime()) - MS_PER_MINUTE;
      const time = (new Date(timestampUTC)).toString();
      const docToSave = {...doc[siteid], timestamp: timestampUTC};
      // console.log('docToSave', docToSave);
      promises.push(
        db
        .collection('monitoring_sites_hourly_data')
        .doc(siteid)
        .collection('date')
        .doc(time)
        .set(docToSave)
      );
    }
    console.log(`Encountered ${rows.length} rows`)
    console.log(`Saving ${promises.length} docs`)
    return Promise.all(promises).then(() => results);
  }
  saveMonitoringSite(site) {
    try {
      const monitoringSites = geo.collection('monitoring_sites');
      console.log('site', site);
      const point = geo.point(parseFloat(site.latitude), parseFloat(site.longitude));
      console.log('point', point)
      const monitoringSite = {
        'siteid': site.siteid,
        'parameter_name': site.parameter_name,
        'site_code': site.site_code,
        'sitename': site.sitename,
        'status': site.status,
        'agency_id': site.agency_id,
        'agency_name': site.agency_name,
        'epa_region': site.epa_region,
        'latitude': site.latitude,
        'longitude': site.longitude,
        'elevation': site.elevation,
        'gmt_offset': site.gmt_offset,
        'country_code': site.country_code,
        'msa_code': site.msa_code,
        'msa_name': site.msa_name,
        'state_code': site.state_code,
        'state_name': site.state_name,
        'county_code': site.county_code,
        'county_name': site.county_name,
        // 'position': point.data
        'position': { geohash: point.hash, geopoint: new firebase.firestore.GeoPoint(point.latitude, point.longitude) }
      }
      return monitoringSites.add(monitoringSite);
    } catch (e) {
      console.log('Error for save', e)
      throw new Error(e)
    }

  }
  findNearestMonitoringStations (latitude, longitude, count, radius) {
    const monitoringSites = geo.collection('monitoring_sites');
    const center = geo.point(parseFloat(latitude), parseFloat(longitude));
    const field = 'position';

    const query = monitoringSites.within(center, radius, field);
    return geofirex.get(query)
  }
  findLatestHourlyDataForMonitoringSite (siteid) {
    const query = db
      .collection('monitoring_sites_hourly_data')
      .doc(siteid)
      .collection('date')
      .orderBy('timestamp', 'desc')
      .limit(1)
    return query.get().then(snapshot => {
      if (snapshot.empty) {
        console.log('No matching documents.');
        return;
      }

      const result = [];
      snapshot.forEach(doc => result.push(doc.data()));
      return result;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
  saveAnalysis ({ userId, analysis }) {
    const date = (new Date(analysis.timestamp)).toString();
    return db
    .collection('user_reports')
    .doc(userId)
    .collection('time')
    .doc(date)
    .set(analysis)
    .then(() => analysis);
  }
  getAQIreportForUser ({ startTime, endTime, userId }) {
    console.log('querying', userId, startTime, endTime);
    const query = db
    .collection('user_reports')
    .doc(userId)
    .collection('time')
    .where('timestamp', '>', startTime)
    .where('timestamp', '<', endTime)
    return query.get().then(snapshot => {
      if (snapshot.empty) {
        console.log('No matching documents.');
        return [];
      }

      const result = [];
      snapshot.forEach(doc => result.push(doc.data()));
      return result;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
}

module.exports = FirestoreDb;
