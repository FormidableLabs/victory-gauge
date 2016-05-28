import React from "react";

export default class Tick extends React.Component {
  static propTypes = {
    angle: React.PropTypes.string,
    style: React.PropTypes.object,
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    tickHeight: React.PropTypes.number
  };
  render() {
    const {style, angle, x, y, tickHeight} = this.props;
    return (
      <g>
        <line
          transform={`rotate(${angle}, ${x}, ${y})`}
          style={style}
          x1={x}
          x2={x}
          y1={y}
          y2={y - tickHeight}
        />
      </g>
    );
  }
}

