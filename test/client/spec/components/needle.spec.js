import React from "react";
import { shallow } from "enzyme";
import Needle from "src/components/needle";

describe("components/needle", () => {
  describe("rendering", () => {
    it("renders a path with attribute `d` equal to the radius of the parent gauge chart", () => {
      const radius = 100;
      const expectedAttribute = `M 0 5 C -1,5 -4,3 -6,0 L 0 -${radius} L 6 0 C 4,3 1,5 0,5`;
      const wrapper = shallow(
        <Needle
          needleHeight={radius}
        />
      );
      expect(wrapper.html()).to.contain(expectedAttribute);
    });
    it("renders with a transform attribute set to the rotation of the needle element prop", () => {
      const rotation = 90;
      const wrapper = shallow(
        <Needle
          rotation={rotation}
        />
      );
      expect(wrapper.html()).to.contain(`transform="rotate(${rotation})"`);
    });
  });
});
