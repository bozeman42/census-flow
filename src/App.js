import React, { Component } from 'react';
import './App.css';
import axios from 'axios';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: 'Nothing to see here.'
    }
    this.getMessage = this.getMessage.bind(this);
  }

  getMessage = (message) => {
    this.setState({
      ...this.state,
      message: message
    })
  }

  componentDidMount() {
    axios.get('/api/hi')
    .then(response => {
      this.setState({
        ...this.state,
        data: response.data
      })
      window.someData = response.data;
    })
  }


  render() {
    return (
      <div>
        <p>{this.state.message}</p>
      </div>
    );
  }
}

export default App;
