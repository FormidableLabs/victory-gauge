/*global window:false*/
import React from "react";
import { VictoryGauge } from "../src/index";
import Needle from "../src/components/needle";
export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: this.getData(),
      transitionData: this.getTransitionData(),
      time: new Date(),
      endAngle: -90,
      duration: 750,
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
        }
      },
      tickValues: []
    };
  }
  componentDidMount() {
    /* eslint-disable react/no-did-mount-set-state */
    this.setState({
      endAngle: 90
    });
    window.setInterval(() => {
      this.setState({time: new Date()});
    }, 1000);
    this.setStateInterval = window.setInterval(() => {
      this.setState({
        data: this.getData(),
        transitionData: this.getTransitionData()
      });
    }, 2000);
  }
  getTransitionData() {
    return Math.floor(Math.random() * 100);
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
            animate={{
              duration: this.state.duration,
              onEnd: () => {
                this.setState({tickValues: [0, 33, 50, 66, 100], duration: 1500});
              }
            }}
            style={{
              parent: this.state.style.parent,
              labels: {fontSize: 10, padding: 100}
            }}
            endAngle={this.state.endAngle}
            data={this.state.transitionData}
            tickValues={this.state.tickValues}
            tickFormat={(x) => `${x}%`}
            segments={[0, 33, 50, 66, 100]}
          />
          <VictoryGauge
            style={{
              parent: this.state.style.parent
            }}
            animate={{duration: this.state.duration}}
            endAngle={0}
            tickValues={[0, 100]}
            segments={[50]}
            tickFormat={["Empty", "Full"]}
            data={this.state.transitionData}
            startAngle={180}
            colorScale={"warm"}
          />
          <VictoryGauge
            style={{
              parent: this.state.style.parent
            }}
            domain={[10, 66]}
            data={30}
            tickCount={2}
            startAngle={-150}
            innerRadius={20}
            segments={[50]}
            tickFormat={["hover or click", "hover or click"]}
            events={{
              tickLabels: {
                onClick: (e, props) => {
                  let color = "red";
                  if (props.style.fill === "red") {
                    color = "black";
                  }
                  return {
                    tickLabels: {
                      style: Object.assign(
                        {},
                        props.style, {fill: color}
                      )
                    }
                  };
                },
                onMouseEnter: (e, props) => {
                  return {
                    tickLabels: {
                      style: Object.assign(
                        {},
                        props.style, {fill: "red", fontSize: 14}
                      )
                    }
                  };
                },
                onMouseLeave: (e, props) => {
                  return {
                    tickLabels: {
                      style: Object.assign(
                        {},
                        props.style, {fill: "black", fontSize: 10}
                      )
                    }
                  };
                }
              }
            }}
          />
          <VictoryGauge
            tickValues={[0, 1]}
            data={1}
            segments={[0.5]}
            tickFormat={["off", "on"]}
            colorScale={["#FF0000", "#00FF00"]}
            style={{
              parent: this.state.style.parent,
              needle: {
                fill: "black"
              }
            }}
            needleComponent={
              <Needle
                path={"M 0,5 L -1,5 L -1,-135 L 1,-135 L 1,5 L 0,5"}
              />
            }
            innerRadius={100}
            outerRadius={130}
            startAngle={-20}
            endAngle={20}
          />
          <VictoryGauge
            style={{
              parent: this.state.style.parent
            }}
            tickValues={[0, 5, 10, 15, 25, 75]}
            segments={[10, 50, 100]}
            data={73}
          />
          <VictoryGauge
            data={this.state.time}
            dataAccessor={(date) => {
              return date.getSeconds();
            }}
            style={{
              parent: this.state.style.parent
            }}
            startAngle={0}
            endAngle={360}
            domain={[0, 60]}
            tickCount={59}
          />
          <VictoryGauge
            animate={{
              duration: this.state.duration
            }}
            style={{
              parent: this.state.style.parent,
              labels: {fontSize: 10, padding: 100}
            }}
            innerRadius={20}
            outerRadius={100}
            startAngle={-90}
            endAngle={-270}
            data={this.state.transitionData}
            needleComponent={
              <Needle
                needleHeight={50}
              />
            }
            tickValues={[0, 33, 50, 66, 100]}
            tickFormat={(x) => `${x}%`}
            segments={[0, 33, 50, 66, 100]}
          />
          <VictoryGauge
            colorScale={"greyscale"}
            style={{
              parent: this.state.style.parent
            }}
            startAngle={-180}
            endAngle={0}
            tickValues={[0, 5, 10, 15, 75]}
            domain={[0, 150]}
            segments={[10, 50, 100]}
            data={75}
          />
          <VictoryGauge
            style={{
              parent: this.state.style.parent
            }}
            tickFormat={(t) => {
              return `${t}${String.fromCharCode(176)}C`;
            }}
            startAngle={-120}
            tickValues={[0, -4, -20, -9, -50]}
            endAngle={120}
            segments={[0]}
            data={-10}
          />
        </div>
      </div>
    );
  }
}
