import React from "react";

export default class Needle extends React.Component {

  render() {
    const {rotation, height} = this.props;
    return (
      <g transform={`rotate(${rotation})`}>
        <path
          d={`M 0 5 C -1,5 -4,3 -6,0 L 0 -${height} L 6 0 C 4,3 1,5 0,5`}
          stroke="black"
          fill="red"
          strokeWidth="0.5"
        />
      </g>
    );
  }
}

Needle.propTypes = {
  rotation: React.PropTypes.number,
  height: React.PropTypes.number,
  style: React.PropTypes.object
};
