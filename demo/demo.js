/*global window:false*/
import React from "react";
import { VictoryGauge } from "../src/index";
import Needle from "../src/components/needle";
export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: this.getData(),
      transitionData: this.getTransitionData(10, 99),
      endAngle: -90,
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
    this.setState({
      endAngle: 90
    });
    this.setStateInterval = window.setInterval(() => {
      this.setState({
        data: this.getData(),
        transitionData: this.getTransitionData(10, 99)
      });
    }, 2000);
  }
  getTransitionData(min, max) {
    return Math.floor(Math.random() * max) + min;
  }
  getData() {
    const rand = () => Math.floor(Math.random() * 100);
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
    return (
      <div>
        <h1>VictoryGauge Demo</h1>

        <div style={containerStyle}>
          <VictoryGauge
            style={{
              parent: {border: "1px solid #ccc", margin: "2%", maxWidth: "40%"},
              labels: {fontSize: 10, padding: 100, fill: "black"}
            }}
            events={{
              needle: {
                onMouseOver: () => {
                }
              }
            }}
            needleComponent={<Needle needleHeight={250}/>}
            endAngle={this.state.endAngle}
            data={33}
            tickValues={[0, 33, 66, 100]}
            domain={[0, 100]}
            segments={[33, 50, 66, 90, 100]}
          />
        </div>
      </div>
    );
  }
}
