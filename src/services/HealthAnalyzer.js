
const FirestoreDb = require('../db/firestoreDb');
const AQIMap = require('./AQIMap');

const Utils = {
  getLowestIndexForValue: function (searchArray, value) {
    for (let i = searchArray.length-1; i > 0; i--) {
      if (value >= searchArray[i]) {
        return i;
      }
    }
    return 0;
  }
}


class HealthAnalyzer {
    analyzeHourlyData ({ hourlyData, station }) {
      const averages = [];
      if (!hourlyData.length){
        throw new Error('No hourly data');
      }
      if (hourlyData[0]['PM2.5']) {
        const value = parseInt(hourlyData[0]['PM2.5']['value']);
        const closestIdx = Utils.getLowestIndexForValue(AQIMap['PM2_5'], value);
        const rawValue = AQIMap['RawValue'][closestIdx];
        averages.push(rawValue);
      }
      if (hourlyData[0]['PM10']) {
        const value = parseInt(hourlyData[0]['PM10']['value']);
        const closestIdx = Utils.getLowestIndexForValue(AQIMap['PM10'], value);
        const rawValue = AQIMap['RawValue'][closestIdx];
        averages.push(rawValue);
      }
      if (hourlyData[0]['CO']) {
        const value = parseInt(hourlyData[0]['CO']['value']);
        const closestIdx = Utils.getLowestIndexForValue(AQIMap['CO'], value);
        const rawValue = AQIMap['RawValue'][closestIdx];
        averages.push(rawValue);
      }
      if (hourlyData[0]['NO2']) {
        const value = parseInt(hourlyData[0]['NO2']['value']);
        const closestIdx = Utils.getLowestIndexForValue(AQIMap['NO2'], value);
        const rawValue = AQIMap['RawValue'][closestIdx];
        averages.push(rawValue);
      }
      const arrSum = averages.reduce((a,b) => a + b, 0);
      const averageAQI = parseFloat(arrSum / averages.length) || 0;
      const timestamp = new Date().getTime();
      return { hourlyData, station, averageAQI, timestamp }
    }
    analyzeWithLocation (userId, latitude, longitude) {
      const db = new FirestoreDb();
      return db.findNearestMonitoringStations(latitude, longitude, 1, 30)
      .then(stations => {
        console.log('station', stations)
        if (stations.length === 0) {
          throw new Error('No station detected within 2km');
        }
        return db.findLatestHourlyDataForMonitoringSite(stations[0].siteid).then(hourlyData => ({hourlyData, station: stations[0]}))
      })
      .then(({hourlyData, station}) => {
        const analysis = this.analyzeHourlyData({ hourlyData, station });
        return db.saveAnalysis({ userId, analysis });
        // return analysis;
      })
      .catch(err => {
        return { error: err.message }
      });
    }
}

module.exports = HealthAnalyzer;
