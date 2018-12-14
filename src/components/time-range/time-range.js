import React, { PureComponent } from "react";

export class TimeRange extends PureComponent {
  render() {
    return (
      <div class="slidecontainer">
        <input
          type="range"
          min="1"
          max="4"
          value="4"
          class="slider"
          id="myRange"
        />
      </div>
    );
  }
}
