import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Chat from './Chat'
class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <Chat />
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
      소ㅓ영소영
        </p>

      </div>
    );
  }
}
/*
class Chat extends Component {
  render() {
    return  ( 
      <div className="yuntaek">HELLO</div>
    );
  }
}
*/
export default App;
