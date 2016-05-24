import React from 'react';
import d3Shape from "d3-shape";

export default class Needle extends React.Component {
  render() {
    const {reading} = this.props;
    return (
        <g transform={`rotate(${50})`}>
        <path
          d="M 0 5 C -1,5 -4,3 -6,0 L 0 -175 L 6 0 C 4,3 1,5 0,5"
          stroke="black"
          fill="red"
          strokeWidth="0.5"
        />
      </g>
    );
  }
}
