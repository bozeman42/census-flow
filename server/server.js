const express = require('express');
const axios = require('axios');
const app = express();
const populateDatabase = require


const PORT = 5000;

app.use(express.static(`build`));

app.use('/api/hi', (req, res) => {
  axios.get('https://api.census.gov/data/2015/acs/flows?get=FULL1_NAME,FULL2_NAME,MOVEDIN,MOVEDNET,MOVEDOUT,GEOID2&for=county:*&in=state:27')
    .then(response => {

      // let counties = {}
      // response.data.shift();
      // let inOut = 0;
      res.send(response.data);
      // response.data.forEach(county => {
      //   let destination = county[1];
      //   let destinationSplit = destination.split(' ');
      //   let destinationEnd = destinationSplit[destinationSplit.length - 1];
      //   console.log(destinationEnd);
      //   if (!(isNaN(parseInt(county[3])))) {

      //     inOut += parseInt(county[3]);
      //   }
      //   if (!(counties[county[0]])) {
      //     counties[county[0]] = {
      //       [destinationEnd]: {
      //         [county[1]]: {
      //           movedIn: county[2],
      //           movedNet: county[3],
      //           movedOut: county[4]
      //         }
      //       }
      //     }
      //   } else {
      //     counties[county[0]] = {
      //       ...counties[county[0]],
      //       [destinationEnd]: {
      //         ...counties[county[0]][destinationEnd],
      //         [county[1]]: {
      //           movedIn: county[2],
      //           movedNet: county[3],
      //           movedOut: county[4]
      //         }
      //       }
      //     }
      //   }
      // })
      // res.send(counties);
      // console.log(inOut);
    })
    .catch(error => {
      console.log('fail');
      res.sendStatus(500);
    })
})


app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));