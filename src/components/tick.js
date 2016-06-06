import React from "react";

export default class Tick extends React.Component {
  static propTypes = {
    angle: React.PropTypes.string,
    events: React.PropTypes.object,
    style: React.PropTypes.object,
    x1: React.PropTypes.number,
    x2: React.PropTypes.number,
    y1: React.PropTypes.number,
    y2: React.PropTypes.number
  };
  render() {
    const {style, angle, events, x1, x2, y1, y2} = this.props;
    return (
        <g {...events}>
          <line
            transform={`rotate(${angle}, ${x1}, ${y1})`}
            style={style}
            x1={x1}
            x2={x2}
            y1={y1}
            y2={y2}
          />
        </g>
    );
  }
}

