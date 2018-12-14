import React, { PureComponent } from "react";
import Plot from "react-plotly.js";

export class Graph extends PureComponent {
  render() {
    return (
      <Plot
        data={[
          {
            x: [1, 2, 3],
            y: [2, 6, 3],
            type: "scatter",
            mode: "lines+points",
            marker: { color: "red" }
          },
          { type: "bar", x: [1, 2, 3], y: [2, 5, 3] }
        ]}
        layout={{
          width: 300,
          height: 300,
          title: "A Fancy Plot",
          margin: { l: 50, t: 0, r: 0, b: 30 },
          legend: {
            x: 0,
            y: 1
          }
        }}
      />
    );
  }
}
