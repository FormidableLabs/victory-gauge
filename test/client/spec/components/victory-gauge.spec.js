/**
 * Client tests
 */
/* eslint-disable max-statements,max-nested-callbacks,no-unused-expressions,max-len */

// import { range, omit } from "lodash";
import React from "react";
import d3Scale from "d3-scale";
import { shallow, mount } from "enzyme";
import {
  // Style,
  VictoryLabel,
  VictoryAnimation
  } from "victory-core";
import SvgTestHelper from "../../../svg-test-helper";
import VictoryGauge from "src/components/victory-gauge";
import Slice from "src/components/slice";
import Needle from "src/components/needle";
import Tick from "src/components/tick";

class StubComponent extends React.Component {
  render() {
    return (<div></div>);
  }
}
describe("components/victory-gauge", () => {

  describe("default component render", () => {
    it("should render an SVG with style attributes", () => {
      const wrapper = shallow(<VictoryGauge/>);
      const svg = wrapper.find("svg");
      expect(svg.prop("style").width).to.equal("100%");
      expect(svg.prop("style").height).to.equal("auto");
    });

    it("should render with default props", () => {
      const wrapperProps = mount(<VictoryGauge/>).props();
      expect(wrapperProps.data).to.equal(0);
      expect(wrapperProps.startAngle).to.equal(-90);
      expect(wrapperProps.endAngle).to.equal(90);
    });

    it("should render a single slice component", () => {
      const wrapper = shallow(<VictoryGauge/>);
      const slices = wrapper.find(Slice);
      expect(slices).to.have.length.of(1);
    });

    it("should render a single needle component", () => {
      const wrapper = shallow(<VictoryGauge/>);
      const slices = wrapper.find(Needle);
      expect(slices).to.have.length.of(1);
    });
  });

  describe("the animate prop", () => {
    it("should wrap VictoryGauge in VictoryAnimation when provided an object", () => {
      const withProp = shallow(<VictoryGauge animate={{}}/>);
      const withoutProp = shallow(<VictoryGauge/>);
      expect(withProp.find(VictoryAnimation))
        .to.have.length.of(1);
      expect(withoutProp.find(VictoryAnimation))
        .to.have.length.of(0);
    });

    it("should pass the animate props to the VictoryAnimation component", () => {
      const wrapper = shallow(<VictoryGauge animate={{duration: 1987, delay: 22}}/>);
      const animation = wrapper.find(VictoryAnimation);
      expect(animation.props()).to.be.an("object");
      expect(animation.props().duration).to.equal(1987);
      expect(animation.props().delay).to.equal(22);
    });
  });

  describe("the segments prop", () => {
    it("should render one segment of the Slice component by default", () => {
      const wrapper = shallow(<VictoryGauge/>);
      expect(wrapper.find(Slice)).to.have.length.of(1);
    });

    describe("its relation to `domain` and how many segments it renders", () => {
      it("should render one segment if one value is provided without `domain` prop", () => {
        const wrapper = shallow(<VictoryGauge segments={[15]}/>);
        expect(wrapper.find(Slice)).to.have.length.of(1);
      });

      it("should render multiple segments if more than one value is provided", () => {
        const twoValues = shallow(<VictoryGauge segments={[10, 15]}/>);
        const threeValues = shallow(<VictoryGauge segments={[10, 12, 15]}/>);
        expect(twoValues.find(Slice)).to.have.length.of(2);
        expect(threeValues.find(Slice)).to.have.length.of(3);
      });

      it("should render two segments if one value is provided within `domain`", () => {
        const wrapper = shallow(<VictoryGauge domain={[0, 100]} segments={[12]}/>);
        expect(wrapper.find(Slice)).to.have.length.of(2);
      });

      it("should render multiple segements within the bounds of `domain`", () => {
        const wrapper = shallow(<VictoryGauge domain={[1, 99]} segments={[5, 8, 12]}/>);
        expect(wrapper.find(Slice)).to.have.length.of(4);
      });
    });

    describe("mathmatical relation to subdividing the chart", () => {
      it("should create 2 equal sized segments when it divides domain evenly", () => {
        const wrapper = shallow(<VictoryGauge domain={[0, 100]} segments={[50]}/>);
        const slices = wrapper.find(Slice);
        expect(slices).to.have.length.of(2);
        const slice1 = slices.at(0);
        const slice2 = slices.at(1);
        const coord1 = SvgTestHelper.getSliceInnerDegrees(slice1);
        const coord2 = SvgTestHelper.getSliceInnerDegrees(slice2);
        expect(coord1).to.equal(coord2);
      });

      it("should have segments whose angles sum to the total angular span of the chart", () => {
        const wrapper = shallow(
          <VictoryGauge
            domain={[0, 100]}
            segments={[20, 50, 75]}
          />
        );
        const slices = wrapper.find(Slice);
        const sum = slices.reduce((acc, val) => {
          return acc + parseInt(SvgTestHelper.getSliceInnerDegrees(val));
        }, 0);
        expect(sum).to.equal(180);
      });
    });
  });

  describe("the data prop", () => {
    it("should rotate the needle prop to the proper linear scale in angles from the gauge's domain", () => {
      const scale = d3Scale.scaleLinear().range([-90, 90]).domain([0, 100]);
      const dataSet = [60, 80, 90];
      const results = dataSet.map((d) => {
        const wrapper = shallow(<VictoryGauge domain={[0, 100]} data={d}/>);
        return parseInt(wrapper.find(Needle).prop("rotation"));
      });
      const scales = dataSet.map((d) => {
        return parseInt(scale(d));
      });
      expect(results).to.deep.equal(scales);
    });

    it("should limit the rotation to the maximum and minimum angular span of the chart itself", () => {
      const maxRangeTest = (data, expectation) => {
        const scale = d3Scale.scaleLinear().range([-90, 90]).domain([0, 100]);
        const wrapper = shallow(<VictoryGauge domain={[0, 100]} data={data}/>);
        const result = parseInt(wrapper.find(Needle).prop("rotation"));
        expect(result).to.not.equal(scale(data));
        expect(result).to.equal(expectation);
      };
      maxRangeTest(-1000, -90);
      maxRangeTest(-1, -90);
      maxRangeTest(150, 90);
      maxRangeTest(101, 90);
    });
  });

  describe("the dataAccessor prop", () => {
    it("should be a function that returns the formatted data for proper rendering", () => {
      const wrapper = shallow(<VictoryGauge data={10} domain={[0, 10]} dataAccessor={() => {return 0;}}/>);
      const needle = wrapper.find(Needle);
      expect(parseInt(needle.prop("rotation"))).to.equal(-90);
    });
  });

  describe("the domain prop", () => {
    it("should establish the min and max values of the chart and proportion the segments accordingly", () => {
      const scale = d3Scale.scaleLinear().range([0, 180]).domain([0, 100]);
      const wrapper = shallow(
        <VictoryGauge
          domain={[0, 100]}
          segments={[25]}
        />
      );
      const slice1 = wrapper.find(Slice).at(0);
      const slice2 = wrapper.find(Slice).at(1);
      const angle1 = SvgTestHelper.getSliceInnerDegrees(slice1);
      const angle2 = SvgTestHelper.getSliceInnerDegrees(slice2);
      expect(angle1).to.equal(scale(25));
      expect(angle2).to.equal(scale(100) - angle1);
    });
  });

  describe("the start and endAngle props", () => {
    it("should set the angular span of the chart as a whole", () => {
      const end = 20;
      const start = -10;
      const wrapper = shallow(<VictoryGauge startAngle={start} endAngle={end} domain={[0, 20]}/>);
      const slices = wrapper.find(Slice);
      const sum = slices.reduce((acc, slice) => {
        return acc + parseInt(SvgTestHelper.getSliceInnerDegrees(slice));
      }, 0);
      expect(sum).to.equal(end - start);
    });
  });

  describe("the innerRadius prop", () => {
    it("should construct a chart with segments matching the innerRadius prop", () => {
      const wrapper = shallow(<VictoryGauge innerRadius={20} segments={[10, 20, 30]} domain={[0, 50]} data={20}/>);
      const slices = wrapper.find(Slice);
      slices.forEach((slice) => {
        expect(SvgTestHelper.getInnerRadiusOfCircularOrAnnularSlice(slice)).to.equal(20);
      });
    });
  });

  describe("the needleComponent prop", () => {
    it("should receive the necessary props from the parent component", () => {
      const wrapper = shallow(
        <VictoryGauge
          events={{
            needle: {
              onClick() {}
            }
          }}
          style={{
            needle: {
              fill: "black"
            }
          }}
          outerRadius={32}
          data={5}
          domain={[0, 10]}
        />);
      const needle = wrapper.find(Needle);
      expect(needle.prop("events")).to.be.an("object");
      expect(needle.prop("events")).to.have.property("onClick");
      expect(needle.prop("needleHeight")).to.be.a("number");
      expect(needle.prop("needleHeight")).to.equal(32);
      expect(needle.prop("rotation")).to.be.a("number");
      expect(needle.prop("rotation")).to.equal(0);
      expect(needle.prop("style")).to.be.an("object");
      expect(needle.prop("style")).to.have.property("fill");
      expect(needle.prop("style").fill).to.equal("black");
    });

    it("should be overridable with custom components", () => {
      const wrapper = shallow(<VictoryGauge needleComponent={<StubComponent/>}/>);
      const stub = wrapper.find(StubComponent);
      expect(stub).to.have.length(1);
    });
  });

  describe("the segmentComponent prop", () => {
    it("should receive the necessary props from the parent component", () => {
      const wrapper = shallow(
        <VictoryGauge
          style={{
            segments: {
              padding: 100
            }
          }}
          events={{
            segments: {
              onClick() {}
            }
          }}
          segments={[13, 14, 17, 20]}
          domain={[10, 23]}
        />);
      const slices = wrapper.find(Slice);

      slices.forEach((slice) => {
        expect(slice.prop("style").padding).to.equal(100);
        expect(slice.prop("events").onClick).to.exist;
      });
    });

    it("should be overridable with custom components", () => {
      const wrapper = shallow(<VictoryGauge segmentComponent={<StubComponent/>}/>);
      const stub = wrapper.find(StubComponent);
      expect(stub).to.have.length(1);
    });
  });

  describe("the tickComponent prop", () => {
    it("should receive the necessary props from the parent component", () => {
      const wrapper = shallow(
        <VictoryGauge
          style={{
            ticks: {
              fill: "green"
            }
          }}
          events={{
            ticks: {
              onClick() {}
            }
          }}
          tickValues={[13, 14, 17, 20]}
          domain={[10, 23]}
        />);
      const ticks = wrapper.find(Tick);

      ticks.forEach((tick) => {
        expect(tick.prop("style").fill).to.equal("green");
        expect(tick.prop("events").onClick).to.exist;
      });
    });

    it("should be overridable with custom components", () => {
      const wrapper = shallow(<VictoryGauge tickValues={[10, 12, 15]} domain={[0, 20]} tickComponent={<StubComponent/>}/>);
      const stub = wrapper.find(StubComponent);
      expect(stub).to.have.length(3);
    });
  });

  describe("the tickCount prop", () => {
    it("should render the number of ticks provided to it", () => {
      const wrapper = shallow(<VictoryGauge domain={[0, 100]} data={12} tickCount={20}/>);
      const ticks = wrapper.find(Tick);
      expect(ticks).to.have.length(20);
    });

    it("should space the ticks equally apart from each other", () => {
      const pythagoreanFunc = (coord1, coord2) => {
        const power1 = Math.pow(coord1[0] - coord2[0], 2);
        const power2 = Math.pow(coord1[1] - coord2[1], 2);
        return Math.sqrt(power1 + power2).toFixed(2);
      };

      const wrapper = shallow(<VictoryGauge domain={[0, 100]} data={5} tickCount={10}/>);

      const ticks = wrapper.find(Tick);
      let distance = 0;
      let i = 0;

      ticks.forEach((tick) => {
        let tick2;
        if (i === 0) {
          tick2 = ticks.at(i + 1);
        } else {
          tick2 = ticks.at(i - 1);
        }
        i++;
        const x1 = tick.prop("x1");
        const y1 = tick.prop("y1");
        const x2 = tick2.prop("x1");
        const y2 = tick2.prop("y1");
        const result = pythagoreanFunc([x1, y1], [x2, y2]);
        if (distance === 0) {
          distance = result;
        }
        expect(distance).to.equal(result);
      });
    });
  });

  describe("the tickLabelComponent prop", () => {
    it("should receive the necessary props from the parent component", () => {
      const tickLabels = ["test", "val", "one", "two"];
      const wrapper = shallow(
        <VictoryGauge
          style={{
            tickLabels: {
              fontSize: 64
            }
          }}
          events={{
            tickLabels: {
              onClick() {}
            }
          }}
          tickValues={[13, 14, 17, 20]}
          tickFormat={tickLabels}
          domain={[10, 23]}
        />);
      const labels = wrapper.find(VictoryLabel);
      let i = 0;
      labels.forEach((label) => {
        expect(label.prop("style").fontSize).to.equal(64);
        expect(label.prop("events")).to.exist;
        expect(label.prop("events")).to.have.property("onClick");
        expect(label.prop("text")).to.equal(tickLabels[i++]);
      });
    });

    it("should be overridable with custom components", () => {
      const wrapper = shallow(<VictoryGauge tickValues={[1, 2, 3]} tickFormat={["one", "two", "three"]} domain={[0, 20]} tickLabelComponent={<StubComponent/>}/>);
      const stub = wrapper.find(StubComponent);
      expect(stub).to.have.length(3);
    });
  });

  describe("tickFormat prop", () => {
    it("if it is a function it should format the tickValues so that they can be rendered properly", () => {
      const values = [1, 2, 3, 4, 5];
      const formatter = (x) => {return (x * 2).toString();};
      const wrapper = shallow(<VictoryGauge tickValues={values} domain={[0, 5]} tickFormat={formatter}/>);
      const labels = wrapper.find(VictoryLabel);
      let i = 0;
      labels.forEach((label) => {
        expect(label.prop("text")).to.equal(formatter(values[i++]));
      });
    });

    it("if it is an array, it should replace the tickValues as the label for that index position", () => {
      const format = ["one", "two", "three"];
      const wrapper = shallow(<VictoryGauge tickValues={[1, 2, 3]} domain={[0, 5]} tickFormat={format}/>);
      const labels = wrapper.find(VictoryLabel);
      let i = 0;
      labels.forEach((label) => {
        expect(label.prop("text")).to.equal(format[i++]);
      });
    });
  });

  describe("the tickValues prop", () => {
    it("should take a set of values and place them at the appropriately scaled positions of the array", () => {
      const start = -80;
      const end = 80;
      const wrapper = shallow(<VictoryGauge startAngle={start} endAngle={end} tickValues={[10, 30]} domain={[10, 30]}/>);
      const ticks = wrapper.find(Tick);
      const tick1 = ticks.at(0);
      const tick2 = ticks.at(1);
      const coord1 = {
        x: tick1.prop("x1"),
        y: tick1.prop("y1")
      };
      const coord2 = {
        x: tick2.prop("x1"),
        y: tick2.prop("y1")
      };
      expect(parseInt(SvgTestHelper.getAngleBetweenSVGCoordinates(coord1, coord2))).to.equal(end - start);
    });

    it("if the tickFormat prop is not present, the values of the tickValues will act as the tick label", () => {
      const values = [1, 2, 3];
      const wrapper = shallow(<VictoryGauge tickValues={values} domain={[0, 5]}/>);
      const labels = wrapper.find(VictoryLabel);
      let i = 0;
      labels.forEach((label) => {
        expect(label.prop("text")).to.equal(values[i++].toString());
      });
    });
  });
});
