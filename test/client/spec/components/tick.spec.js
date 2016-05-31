import React from "react";
import { shallow } from "enzyme";
import Tick from "src/components/tick";

describe("components/tick", () => {
  describe("rendering", () => {
    const x1 = 1;
    const x2 = 5;
    const y1 = 3;
    const y2 = 7;
    const angle = "45";

    const wrapper = shallow(
      <Tick
        x1={x1}
        x2={x2}
        y1={y1}
        y2={y2}
        angle={angle}
      />
    );

    it("given cordinates will render a line element with `x1`, `x2`, `y1`, `y2` attributes", () => {
      expect(wrapper.html()).to.contain(
        `x1="${x1}" x2="${x2}" y1="${y1}" y2="${y2}"`
      );
    });

    it("will set the rotation of the rendered element given `angle` `x1` `x2` props", () => {
      expect(wrapper.html()).to.contain(`rotate(${angle}, ${x1}, ${y1})`);
    });
  });
});
