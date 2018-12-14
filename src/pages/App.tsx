import React, { Component } from "react";
import "./App.css";
import Viewer from "../components/viewer/viewer";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Viewer />
      </div>
    );
  }
}

export default App;
