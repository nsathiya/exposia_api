## Table of contents
* [General info](#general-info)
* [Technologies](#technologies)
* [Set up security token](#set-up-security-token)
* [API Documentation](#api-documentation)

## General info
A backend to compute and track a user's air quality index based on time and location.

## Technologies
Project is created with :heart: and:
* node
* google cloud functions
* google firestore
* FE client with react/ react native
* typescript (in the future)
* swagger (in the future)
* postgreSQL/ neo 4j (in the future)

## Set up security token
TODO

## API Documentation

Below is the API documentation for Exposia API, and much is still work in progress. Soon a client will
be expected to have an account, which will provide a security token, which will be used for all the calls
for identification and rate-limiting.

The base URL is `https://us-central1-exposia.cloudfunctions.net`

### Create user
TODO

### Latest AQI report for user based on location
Store the latest aqi report for a user by giving location as an argument. Side-effect will
be the report will be persisted on our database, for later retrieval.
```
GET /reportLocation

@param req.query.latitude {number} latitude of location (ex. 37.5485)
@param req.query.longitude {number} longitude of location (ex. -121.98)
@param req.query.userId {number} id of user returned by createUser endpoint (ex. 1)
```

### Latest AQI report for location
TODO - combine with above api

### AQI report by location and time
TODO - combine with above api

### Get all AQI reports for user
Get all aqi data for user given a specific time period. No side-effect.
```
GET /getAqiReport

@param req.query.startTime {Timestamp} earliest time in UTC data should be retrieved for (ex. 1569997386244)
@param req.query.endTime {Timestamp} latest time in UTC data should be retrieved for (ex. 1569997436030)
@param req.query.userId {number} id of user we want reports for (ex. 1)
```
