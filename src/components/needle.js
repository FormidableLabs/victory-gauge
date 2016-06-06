import React from "react";

export default class Needle extends React.Component {
  static propTypes = {
    events: React.PropTypes.object,
    needleHeight: React.PropTypes.number,
    rotation: React.PropTypes.number,
    style: React.PropTypes.object,
    path: React.PropTypes.string
  };
  drawNeedle(height) {
    if (this.props.path) {
      return this.props.path;
    }
    return `M 0 5 C -1,5 -4,3 -6,0 L 0 -${height} L 6 0 C 4,3 1,5 0,5`;
  }
  render() {
    const {events, rotation, style, needleHeight} = this.props;
    return (
        <path
          {...events}
          transform={`rotate(${rotation})`}
          style={style}
          d={this.drawNeedle(needleHeight)}
        />
    );
  }
}

