import React from "react";

export default class Tick extends React.Component {
  render() {
    const {angle, x, y} = this.props;

    return (
      <g>
        <line
          transform={`rotate(${angle}, ${x}, ${y})`}
          stroke="black"
          strokeWidth="1"
          x1={x}
          x2={x}
          y1={y}
          y2={y - 6}
        />
      </g>
    );
  }
}
