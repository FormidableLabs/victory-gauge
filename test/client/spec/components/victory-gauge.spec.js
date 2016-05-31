/**
 * Client tests
 */
/* eslint-disable max-statements,max-nested-callbacks,no-unused-expressions,max-len */


// import { range, omit } from "lodash";
import React from "react";
import { shallow
  // mount
} from "enzyme";
// import { Style, VictoryLabel } from "victory-core";
// import SvgTestHelper from "../../../svg-test-helper";
import VictoryGauge from "src/components/victory-gauge";
// import Slice from "src/components/slice";


describe("components/victory-gauge", () => {
  describe.only("default component render", () => {
    it("should render an SVG with style attributes", () => {
      const wrapper = shallow(<VictoryGauge/>);
      const svg = wrapper.find("svg");
      expect(svg.prop("style").width).to.equal("100%");
      expect(svg.prop("style").height).to.equal("auto");
    });
    it("should render with default `data` and `domain` props", () => {
    });
  });

  describe("the animate prop", () => {
    it("should run this", () => {
      expect(true).to.be.true;
    });
  });
  describe("the colorScale prop", () => {});
  describe("the data prop", () => {});
  describe("the dataAccessor prop", () => {});
  describe("the domain prop", () => {});
  describe("the endAngle prop", () => {});
  describe("the events prop", () => {});
  describe("the height prop", () => {});
  describe("the innerRadius prop", () => {});
  describe("the needleComponent prop", () => {});
  describe("the outerRadius prop", () => {});
  describe("the padAngle prop", () => {});
  describe("the padding prop", () => {});
  describe("the segmentComponent prop", () => {});
  describe("the segments prop", () => {});
  describe("the standalone prop", () => {});
  describe("the startAngle prop", () => {});
  describe("the style prop", () => {});
  describe("the tickComponent prop", () => {});
  describe("the tickCount prop", () => {});
  describe("tickFormat prop", () => {});
  describe("the tickLabelComponent prop", () => {});
  describe("the tickValues prop", () => {});
  describe("the width prop", () => {});
});
