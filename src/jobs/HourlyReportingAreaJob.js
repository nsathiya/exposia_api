const sgMail = require('@sendgrid/mail');
const AirNowClient = require('../clients/AirNowClient');
const DB = require('../db/firestoreDb');
const functions = require('firebase-functions');
// TODO move to env
const sendgridAPIKey = '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'

class Job {
  getData () {
    const client = new AirNowClient();
    return client.getReportingArea()
  }

  saveData (data) {
    const db = new DB();
    const currentValues = data.filter(dataRow => dataRow.record_sequence === '0' && dataRow.data_type === 'O');
    return db.saveReportingAreaEntry(currentValues)
  }

  notify (data) {
    const text = [];
    data.forEach(row => {
      if (row['PM2.5']) {
        text.push(`Reporting Area: ${row.reportingArea}, PM 2.5: ${row['PM2.5']}`)
      } else if (row['OZONE']) {
        text.push(`Reporting Area: ${row.reportingArea}, OZONE: ${row['OZONE']}`)
      }
    })

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
  }
}

module.exports = Job;
