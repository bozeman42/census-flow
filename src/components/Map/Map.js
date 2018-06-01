import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import map from './Usa_counties_large.svg';

class Map extends Component {
  constructor(){
    super();
    this.getData = this.getData.bind(this);
  }

  getData() {
    let mapObject = document.getElementById('map-object');
    let mapSVG = mapObject.contentDocument;
    axios.get('/api/test')
    .then(response => {
      const { data } = response;
      console.log(data);
      let max = 0;
      let min = 0;
      for (let county in data) {
        max = Math.max(max,data[county]);
        min = Math.min(min,data[county]);
      }
      console.log(`Max: ${max}\nMin: ${min}`);
      let total = 0;
      for (let county in data) {
        total += data[county];
        let countyElement = mapSVG.getElementsByClassName(`c${county}`)[0];
        if (countyElement) {
          if (data[county] > 0) {
            let percentage = Math.round(100*(data[county]/max));
            countyElement.setAttribute('fill',`RGB(100%,${100-percentage}%,${100-percentage}%)`);
            // countyElement.setAttribute('fill',`red`);
          } else if (data[county] < 0) {
            let percentage = Math.round(100*(data[county]/min));
            countyElement.setAttribute('fill',`RGB(${100-percentage}%,${100-percentage}%,100%)`);
            // countyElement.setAttribute('fill',`blue`);
          } else if (data[county] === 0) {
            countyElement.setAttribute('fill',`white`);
          }
        } else {
          
        }
      }
      console.log('Net migration between MN and other states:',total);
    })
  }


  render() {
    return (
      <div>
        <object id="map-object" type="image/svg+xml" data={map}>
        </object>
        <button onClick={this.getData}>Get Data</button>
      </div>
    );
  }
}

export default Map;
