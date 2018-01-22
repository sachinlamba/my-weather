// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
const http = require('http');
const host = 'api.worldweatheronline.com';
const wwoApiKey = '264ced12fe2d4384927125907181701';
exports.weatherWebhook = (req, res) => {
  // Get the city and date from the request
  let city = req.body.result.parameters['geo-city']; // city is a required param
  // Get the date for the weather forecast (if present)
  let date = '';
  if (req.body.result.parameters['date']) {
    date = req.body.result.parameters['date'];
    console.log('Date: ' + date);
  }
  // Call the weather API
  callWeatherApi(city, date).then((output) => {
    // Return the results of the weather API to Dialogflow
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ 'speech': output, 'displayText': output }));
  }).catch((error) => {
    // If there is an error let the user know
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
  });
};
function callWeatherApi (city, date) {
  return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
    let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
      '&q=' + encodeURIComponent(city) + '&key=' + wwoApiKey + '&date=' + date;
    console.log('API Request: ' + host + path);
    // Make the HTTP request to get the weather
    http.get({host: host, path: path}, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let response = JSON.parse(body);
        let forecast = response['data']['weather'][0];
        let location = response['data']['request'][0];
        let conditions = response['data']['current_condition'][0];
        let currentConditions = conditions['weatherDesc'][0]['value'];
        // Create response
        let output = `Current conditions in the ${location['type']}
        ${location['query']} are ${currentConditions} with a projected high of
        ${forecast['maxtempC']}°C or ${forecast['maxtempF']}°F and a low of
        ${forecast['mintempC']}°C or ${forecast['mintempF']}°F on
        ${forecast['date']}.`;
        // Resolve the promise with the output text
        console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}


/*
HYDPCM315959D:bin sachin.lamba$ ./gcloud beta functions deploy my_weather --stage-bucket bucket-by-lamba --trigger-http
Copying file:///var/folders/3g/psmztv4j60lcwgbty8syt_8cdyv6lz/T/tmpeBkk3v/fun.zip [Content-Type=application/zip]...
\ [1 files][ 31.5 KiB/ 31.5 KiB]
Operation completed over 1 objects/31.5 KiB.
Deploying function (may take a while - up to 2 minutes)...done.
availableMemoryMb: 256
entryPoint: my_weather
httpsTrigger:
  url: https://us-central1-my-weather-1565d.cloudfunctions.net/my_weather
labels:
  deployment-tool: cli-gcloud
name: projects/my-weather-1565d/locations/us-central1/functions/my_weather
serviceAccountEmail: my-weather-1565d@appspot.gserviceaccount.com
sourceArchiveUrl: gs://bucket-by-lamba/us-central1-projects/my-weather-1565d/locations/us-central1/functions/my_weather-zbovexntqkfy.zip
status: ACTIVE
timeout: 60s
updateTime: '2018-01-17T12:47:33Z'
versionId: '5'

*/

/*
HYDPCM315959D:bin sachin.lamba$ ./gcloud beta functions deploy weatherWebhook --stage-bucket bucket-by-lamba --trigger-http
Copying file:///var/folders/3g/psmztv4j60lcwgbty8syt_8cdyv6lz/T/tmpqx9Gis/fun.zip [Content-Type=application/zip]...
\ [1 files][ 33.0 KiB/ 33.0 KiB]
Operation completed over 1 objects/33.0 KiB.
Deploying function (may take a while - up to 2 minutes)...done.
availableMemoryMb: 256
entryPoint: weatherWebhook
httpsTrigger:
  url: https://us-central1-my-weather-1565d.cloudfunctions.net/weatherWebhook
labels:
  deployment-tool: cli-gcloud
name: projects/my-weather-1565d/locations/us-central1/functions/weatherWebhook
serviceAccountEmail: my-weather-1565d@appspot.gserviceaccount.com
sourceArchiveUrl: gs://bucket-by-lamba/us-central1-projects/my-weather-1565d/locations/us-central1/functions/weatherWebhook-rldkpgickmhy.zip
status: ACTIVE
timeout: 60s
updateTime: '2018-01-17T13:01:12Z'
versionId: '1'
*/
