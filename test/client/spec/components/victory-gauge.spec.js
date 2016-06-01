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
  // VictoryLabel
  VictoryAnimation
  } from "victory-core";
import SvgTestHelper from "../../../svg-test-helper";
import VictoryGauge from "src/components/victory-gauge";
import Slice from "src/components/slice";
import Needle from "src/components/needle";

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
      const dataSet = [50, 60, 80, 90];
      const wrappers = dataSet.map((d) => {
        return shallow(<VictoryGauge domain={[0, 100]} data={d}/>);
      });
      const results = wrappers.map((wrapper) => {
        return parseInt(wrapper.find(Needle).prop("rotation"));
      });
      const scales = dataSet.map((d) => {
        return parseInt(scale(d));
      });
      expect(results).to.deep.equal(scales);
    });
  });
  describe("the dataAccessor prop", () => {});
  describe("the domain prop", () => {});
  describe("the start and endAngle props", () => {});
  describe("the events prop", () => {});
  describe("the height prop", () => {});
  describe("the innerRadius prop", () => {});
  describe("the needleComponent prop", () => {});
  describe("the outerRadius prop", () => {});
  describe("the padding prop", () => {});
  describe("the segmentComponent prop", () => {});
  describe("the tickComponent prop", () => {});
  describe("the tickCount prop", () => {});
  describe("tickFormat prop", () => {});
  describe("the tickLabelComponent prop", () => {});
  describe("the tickValues prop", () => {});
});
