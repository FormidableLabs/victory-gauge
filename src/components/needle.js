import React from "react";

export default class Needle extends React.Component {
  static propTypes = {
    needleHeight: React.PropTypes.number,
    rotation: React.PropTypes.number,
    style: React.PropTypes.object
  };
  getNeedleHeight() {
    const {needleHeight} = this.props;
    return `M 0 5 C -1,5 -4,3 -6,0 L 0 -${needleHeight} L 6 0 C 4,3 1,5 0,5`;
  }
  render() {
    const {rotation, style} = this.props;
    return (
      <g transform={`rotate(${rotation})`}>
        <path
          style={style}
          d={this.getNeedleHeight()}
        />
      </g>
    );
  }
}

