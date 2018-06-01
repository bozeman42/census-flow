const axios = require('axios');
const {
  Pool,
  Client
} = require('pg');

const API_KEY = process.env.API_KEY

const pool = new Pool();
// const pool = new Pool({
//   host: 'localhost',
//   max: 50,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// });

const BASE_URL = `https://api.census.gov/data/2015/acs/flows`;
const QUERY_VARIABLES = `GEOID1,STATE1,STATE1_NAME,COUNTY1_NAME,GEOID2,STATE2,STATE2_NAME,COUNTY2_NAME,MOVEDIN`;


function populateDatabase() {
  let promiseArray = [];
  for (let i = 0; i < 76; i++) {
    promiseArray.push(axios.get(`${BASE_URL}?get=${QUERY_VARIABLES}&for=county:*&in=state:${i}&key=${API_KEY}`));
  }
  
  promiseArray.forEach(promise => {
    promise.then(result => {
        if (result.status === 204) {
          console.log('No entries for,\n', result.config.url);
        } else if (result.status === 200) {
          let data = result.data;
  
          // remove first item from data, which is the field key from the API
          data.shift();
  
          // create dataObject
          // dataObject = {
          //   stateCode,
          //   stateName,
          //   counties: {
          //     [GEOID1]: {
          //       countyName,
          //       movementFrom: [
          //         {
          //           countyFrom,
          //           countyName,
          //           stateFrom,
          //           stateName,
          //           quantity
          //         }
          //       ]
          //     }
          //   }
          // }
  
          let dataObject = {
            stateCode: standardizeState(data[0][1]),
            stateName: data[0][2],
            counties: {}
          };
          dataObject.stateCode = standardizeState(data[0][1]);
          dataObject
          data.forEach(item => {
  
            // 'item' properties
            // 0: GEOID1
            // 1: STATE1
            // 2: STATE1_NAME
            // 3: COUNTY1_NAME
            // 4: GEOID2 (null if origin is a continent/region, not a county)
            // 5: STATE2
            // 6: STATE2_NAME
            // 7: COUNTY2_NAME (null if origin is a continent/region, not a county)
            // 8: MOVEDIN (number of poeple moved from GEOID2/STATE2 to GEOID1/STATE1)
  
            // if the county does not exist, create a property for the county
            if (!dataObject.counties[item[0]]) {
              dataObject.counties[item[0]] = {
                countyName: item[3],
                movementFrom: []
              };
            }
            dataObject.counties[item[0]].movementFrom.push({
              countyFrom: item[4] ? item[4].substring(0,5) : item[5],
              countyName: item[4] ? item[7] : item[6],
              stateFrom: item[5],
              stateName: item[6],
              quantity: item[8]
            })
          });
          pool.connect((connectError, client, done) => {
            console.time(dataObject.stateName);;
            if (connectError) {
              throw connectError;
            } else {
              let state = {
                code: dataObject.stateCode,
                name: dataObject.stateName
              }
              // client.query('BEGIN ISOLATION LEVEL SERIALIZABLE;');
              client.query('INSERT INTO "states" ("state_id","name") VALUES ($1,$2) ON CONFLICT DO NOTHING;', [
                state.code,
                state.name
              ],err => {
                if (err) {
                  throw err;
                }
              })
              for (county in dataObject.counties) {
                client.query('INSERT INTO "counties" ("geoid","state_id","name") VALUES ($1,$2,$3) ON CONFLICT DO NOTHING;', [
                  county,
                  state.code,
                  dataObject.counties[county].countyName
                ], err => {
                  if (err) {
                    throw err;
                  }
                });
                dataObject.counties[county].movementFrom.forEach(from => {
                  client.query('INSERT INTO "states" ("state_id", "name") VALUES ($1,$2) ON CONFLICT DO NOTHING;',
                    [
                      from.stateFrom,
                      from.stateName
                    ],
                    err => {if (err) {throw err}}
                  );
                  if (from.countyFrom.length > 5) {
                    console.log('geoid:',from.countyFrom)
                    console.log('from:',from.stateFrom,from.stateName);
                    console.log('state:',state.name,state.code);
                  }
                  client.query('INSERT INTO "counties" ("geoid","state_id","name") VALUES ($1,$2,$3) ON CONFLICT DO NOTHING;', [
                    from.countyFrom,
                    from.stateFrom,
                    from.countyName
                  ], err => {
                    if (err) { 
                      console.log(dataObject.stateName,county);
                      console.log(from);
                      throw err;
                    }
                  });
                  client.query('INSERT INTO "movement" ("from","to","quantity") VALUES ($2,$1,$3) ON CONFLICT DO NOTHING', [
                    county,
                    from.countyFrom,
                    from.quantity
                  ], err => { if (err) {throw err}});
                })
              }
              client.query('COMMIT;', (queryError, result) => {
                done();
                if (queryError) {
                  throw new Error('Query Error');
                } else {
                  console.log(state.name, 'done');
                  console.timeEnd(dataObject.stateName);
                }
              })
            }
          })
        } else {
          console.log('Non-200 status code. ', result.status);
        }
      })
      .catch(error => {
        console.log("ERROR", error);
      })
  })
}

function standardizeState(input) {
  return padWithLeadingZeroes(input, 3);
}

function padWithLeadingZeroes(str, length) {
  if (typeof str !== 'string') {
    str = str.toString();
  }
  let result = str;
  while (result.length < length) {
    result = '0' + result;
  }
  return result;
}

module.exports = populateDatabase;