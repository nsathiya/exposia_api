const sgMail = require('@sendgrid/mail');
const AirNowClient = require('../clients/AirNowClient');
const DB = require('../db/firestoreDb');
const functions = require('firebase-functions');
// TODO please dont show this to anyone until this is in config
const sendgridAPIKey = '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'

const StationsIncludedInNotification = ['anaheim', 'elk grove', 'oakland', 'san ramon', 'south lake tahoe - s'];

class Job {
  getData () {
    const client = new AirNowClient();
    return client.getHourlyReportingData()
  }

  saveData (data) {
    const db = new DB();
    // const currentValues = data.filter(dataRow => dataRow.record_sequence === '0' && dataRow.data_type === 'O');
    return db.saveHourlyDataEntriesV3(data)
  }

  notify (data) {
    const text = ['Results'];
    data.forEach(row => {
      if (StationsIncludedInNotification.includes(row.sitename.toLowerCase())) {
        text.push(`Monitoring Site: ${row.sitename}, ${row.data}`)
      }
    })
    console.log('data to notify', text);
    const msg = {
      to: ['narensathiya92@gmail.com', 'nitish.nag@gmail.com'],
      from: 'hello@yourexposia.com',
      subject: 'Your Atmospheric Elements',
      text: text.join('. '),
      html: text.join(' <br> '),
    };
    sgMail.setApiKey(sendgridAPIKey);
    return sgMail.send(msg);
  }

  start () {
    return this.getData()
      .then(data => this.saveData(data))
      .then(data => this.notify(data))
      .catch(error => {
        console.error('Error in HourlyMonitoringSiteJob,', error);
      })
  }
}

module.exports = Job;
