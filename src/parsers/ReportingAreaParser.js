
const fs = require('fs');

const ParseFields = [
  'issue_date',
  'valid_date',
  'valid_time',
  'timezone',
  'record_sequence',
  'data_type',
  'primary',
  'reporting_area',
  'status_code',
  'latitude',
  'longitude',
  'parameter_name',
  'aqi_value',
  'aqi_catogery',
  'action_day',
  'discussion',
  'forecast_source'
];

const ParseFieldsHourlyReporting = [
  'valid_date',
  'valid_time',
  'siteid',
  'sitename',
  'gmt_offset',
  'parameter_name',
  'reporting_units',
  'value',
  'data_source'
];

const ParseMonitoringStations = [
  'siteid',
  'parameter_name',
  'site_code',
  'sitename',
  'status',
  'agency_id',
  'agency_name',
  'epa_region',
  'latitude',
  'longitude',
  'elevation',
  'gmt_offset',
  'country_code',
  'unknown1',
  'unknown2',
  'msa_code',
  'msa_name',
  'state_code',
  'state_name',
  'county_code',
  'county_name',
  'unknown3',
]

class ReportingAreaParser {
  constructor (filePath) {
    if (filePath) {
      this.setFileWithPath(filePath);
    }
  }
  setFileWithPath (filePath) {
    this.file = fs.readFileSync(filePath, 'utf-8');
  }
  setFile (file) {
    this.file = file;
  }
  parse () {
    const entries = this.file.split('\n');
    const result = [];
    for (let entry of entries) {
      const airCells = entry.split('|');
      let idx = 0;
      const entryParsed = {};
      for (let airCell of airCells) {
        const label = ParseFields[idx];
        entryParsed[label] = airCell;
        idx++;
      }
      result.push(entryParsed);
    }
    // console.log('this file', result);
    this.parsedFile = result;
  }
  // TODO unit test
  parseHourlyData () {
    const entries = this.file.split('\n');
    const result = [];
    for (let entry of entries) {
      const airCells = entry.split('|');
      let idx = 0;
      const entryParsed = {};
      for (let airCell of airCells) {
        const label = ParseFieldsHourlyReporting[idx];
        entryParsed[label] = airCell;
        idx++;
      }
      result.push(entryParsed);
    }
    // console.log('this file', result);
    this.parsedFile = result;
  }
  parseMonitoringStations () {
    const entries = this.file.split('\n');
    const result = [];
    for (let entry of entries) {
      const airCells = entry.split('|');
      let idx = 0;
      const entryParsed = {};
      airCells.pop();
      // console.log('aircells', airCells);
      for (let airCell of airCells) {
        const label = ParseMonitoringStations[idx];
        entryParsed[label] = airCell;
        idx++;
      }
      result.push(entryParsed);
    }
    // console.log('this file', result);
    this.parsedFile = result;
  }
  getParsedFile () {
    if (!this.parsedFile) {
      throw new Error('Parse file first');
    }
    return this.parsedFile;
  }
}

module.exports = ReportingAreaParser;
