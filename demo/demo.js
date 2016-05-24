/*global window:false*/
import { assign, random, range } from "lodash";
import React from "react";
import { VictoryGauge } from "../src/index";
import Slice from "../src/components/slice";

class BorderLabelSlice extends React.Component {
  static propTypes = {
    ...Slice.propTypes,
    index: React.PropTypes.number
  };

  render() {
    const {index} = this.props;

    return (
      <g key={`slice-and-label-${index}`}>
        {this.renderSlice(this.props)}
        {this.renderLabel(this.props)}
      </g>
    );
  }

  renderSlice(props) {
    return <Slice {...props} />;
  }

  renderLabel(props) {
    const {pathFunction, datum, slice, index} = props;

    const path = pathFunction({...slice, endAngle: slice.startAngle});

    const pathId = `textPath-path-${index}`;

    return (
      <g>
        <path id={pathId} d={path} />
        <text>
          <textPath xlinkHref={`#${pathId}`}>
            {datum.label || datum.xName || datum.x}
          </textPath>
        </text>
      </g>
    );
  }

}

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: this.getData(),
      transitionData: this.getTransitionData(),
      colorScale: [
        "#D85F49",
        "#F66D3B",
        "#D92E1D",
        "#D73C4C",
        "#FFAF59",
        "#E28300",
        "#F6A57F"
      ],
      sliceWidth: 60,
      style: {
        parent: {
          border: "1px solid #ccc",
          margin: "2%",
          maxWidth: "40%"
        },
        data: {
          strokeWidth: 2
        },
        labels: {
          fill: "white",
          padding: 10
        }
      }
    };
  }

  componentDidMount() {
    /* eslint-disable react/no-did-mount-set-state */
    this.setStateInterval = window.setInterval(() => {
      this.setState({
        data: this.getData(),
        transitionData: this.getTransitionData()
      });
    }, 2000);
  }

  getTransitionData() {
    const data = random(6, 10);
    return range(data).map((datum) => {
      return {
        x: datum,
        y: random(2, 10),
        label: `#${datum}`
      };
    });
  }

  getData() {
    const rand = () => Math.max(Math.floor(Math.random() * 10000), 1000);
    return [
      { x: "<5", y: rand(), label: "A", fill: "grey" },
      { x: "5-13", y: rand() },
      { x: "14-17", y: rand() },
      { x: "18-24", y: rand() },
      { x: "25-44", y: rand() },
      { x: "45-64", y: rand() },
      { x: "≥65", y: rand() }
    ];
  }

  componentWillUnmount() {
    window.clearInterval(this.setStateInterval);
  }

  render() {
    const containerStyle = {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center"
    };
    const randomized = this.getTransitionData();
    return (
      <div>
        <h1>VictoryGauge Demo</h1>

        <div style={containerStyle}>
          <VictoryGauge animate={{duration: 1000}}
            style={{
              parent: {border: "1px solid #ccc", margin: "2%", maxWidth: "40%"},
              labels: {fontSize: 10, padding: 100, fill: "white"}
            }}
            needle={5}
            data={this.state.transitionData}
          />
        </div>
      </div>
    );
  }
}
