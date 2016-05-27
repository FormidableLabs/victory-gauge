import React, { PropTypes } from "react";
import d3Shape from "d3-shape";
import d3 from "d3";
import { assign, defaults, omit, sum, last, range } from "lodash";
import {
  PropTypes as CustomPropTypes,
  Helpers,
  Style,
  VictoryLabel,
  VictoryAnimation
} from "victory-core";
import Slice from "./slice";
import Needle from "./needle";
import Tick from "./tick";

const defaultStyles = {
  data: {
    padding: 5,
    stroke: "white",
    strokeWidth: 1
  },
  labels: {
    padding: 10,
    fill: "black",
    strokeWidth: 0,
    stroke: "transparent",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: 10,
    textAnchor: "middle"
  },
  needle: {
    stroke: "black",
    fill: "red",
    strokeWidth: "0.5"
  }
};

export default class VictoryGauge extends React.Component {
  static defaultTransitions = {
    onExit: {
      duration: 500,
      before: () => ({ y: 0, label: " " })
    },
    onEnter: {
      duration: 500,
      before: () => ({ y: 0, label: " " }),
      after: (datum) => ({ y: datum.y, label: datum.label })
    }
  };

  static propTypes = {
    //tickValues array of all values to be input as ticks
    tickValues: PropTypes.array,
    //tikFormat mapping function that returns formatted values of the tickValues
    tickFormat: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.homogeneousArray
    ]),
    //domain array of two values, min and max of the domain
    domain: CustomPropTypes.domain,
    //dataAccessor
    tickComponent: PropTypes.element,
    needleComponent: PropTypes.element,
    //tickLabelComponent
    //segmentComponent
    //segments
    segments: PropTypes.array,
    /**
     * The animate prop specifies props for victory-animation to use. If this prop is
     * not given, the gauge chart will not tween between changing data / style props.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * @examples {duration: 500, onEnd: () => alert("done!")}
     */
    animate: PropTypes.object,
    /**
     * The colorScale prop is an optional prop that defines the color scale the pie
     * will be created on. This prop should be given as an array of CSS colors, or as a string
     * corresponding to one of the built in color scales. VictoryPie will automatically assign
     * values from this color scale to the pie slices unless colors are explicitly provided in the
     * data object
     */
    colorScale: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.oneOf([
        "greyscale", "qualitative", "heatmap", "warm", "cool", "red", "green", "blue"
      ])
    ]),
    /**
     * The data prop specifies the data to be plotted,
     * where data X-value is the slice label (string or number),
     * and Y-value is the corresponding number value represented by the slice
     * Data should be in the form of an array of data points.
     * Each data point may be any format you wish (depending on the `x` and `y` accessor props),
     * but by default, an object with x and y properties is expected.
     * @examples [{x: 1, y: 2}, {x: 2, y: 3}], [[1, 2], [2, 3]],
     * [[{x: "a", y: 1}, {x: "b", y: 2}], [{x: "a", y: 2}, {x: "b", y: 3}]]
     */

    //TODO fix proptype violation when animation is on.
    data: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number
    ]),
    /**
     * The dataComponent prop takes an entire, HTML-complete data component which will be used to
     * create slices for each datum in the pie chart. The new element created from the passed
     * dataComponent will have the property datum set by the pie chart for the point it renders;
     * properties style and pathFunction calculated by VictoryPie; an index property set
     * corresponding to the location of the datum in the data provided to the pie; events bound to
     * the VictoryPie; and the d3 compatible slice object.
     * If a dataComponent is not provided, VictoryPie's Slice component will be used.
     */
    dataComponent: PropTypes.element,
    /**
     * The overall end angle of the pie in degrees. This prop is used in conjunction with
     * startAngle to create a pie that spans only a segment of a circle.
     */
    endAngle: PropTypes.number,
    /**
     * The events prop attaches arbitrary event handlers to data and label elements
     * Event handlers are called with their corresponding events, corresponding component props,
     * and their index in the data array, and event name. The return value of event handlers
     * will be stored by index and namespace on the state object of VictoryBar
     * i.e. `this.state[index].data = {style: {fill: "red"}...}`, and will be
     * applied by index to the appropriate child component. Event props on the
     * parent namespace are just spread directly on to the top level svg of VictoryPie
     * if one exists. If VictoryPie is set up to render g elements i.e. when it is
     * rendered within chart, or when `standalone={false}` parent events will not be applied.
     *
     * @examples {data: {
     *  onClick: () =>  return {data: {style: {fill: "green"}}, labels: {style: {fill: "black"}}}
     *}}
     */
    events: PropTypes.shape({
      parent: PropTypes.object,
      data: PropTypes.object,
      labels: PropTypes.object
    }),
    /**
     * The height props specifies the height of the chart container element in pixels
     */
    height: CustomPropTypes.nonNegative,
    /**
     * When creating a donut chart, this prop determines the number of pixels between
     * the center of the chart and the inner edge of a donut. When this prop is set to zero
     * a regular pie chart is rendered.
     */
    innerRadius: CustomPropTypes.nonNegative,
    /**
     * The labelComponent prop takes in an entire label component which will be used
     * to create labels for each slice in the pie chart. The new element created from
     * the passed labelComponent will be supplied with the following properties:
     * x, y, index, datum, verticalAnchor, textAnchor, angle, style, text, and events.
     * any of these props may be overridden by passing in props to the supplied component,
     * or modified or ignored within the custom component itself. If labelComponent is omitted,
     * a new VictoryLabel will be created with props described above.
     */
    labelComponent: PropTypes.element,
    /**
     * The labels prop defines labels that will appear in each slice on your pie chart.
     * This prop should be given as an array of values or as a function of data.
     * If given as an array, the number of elements in the array should be equal to
     * the length of the data array. Labels may also be added directly to the data object
     * like data={[{x: 1, y: 1, label: "first"}]}. If labels are not provided, they
     * will be created based on x values. If you don't want to render labels, pass
     * an empty array or a function that retuns undefined.
     * @examples: ["spring", "summer", "fall", "winter"], (datum) => datum.title
     */
    labels: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.array
    ]),
    /**
     * When creating a chart, this prop determines the number of pixels between
     * the center of the chart and the outer edge of the chart.
     */
    outerRadius: CustomPropTypes.nonNegative,
    /**
     * The padAngle prop determines the amount of separation between adjacent data slices
     * in number of degrees
     */
    padAngle: CustomPropTypes.nonNegative,
    /**
     * The padding props specifies the amount of padding in number of pixels between
     * the edge of the chart and any rendered child components. This prop can be given
     * as a number or as an object with padding specified for top, bottom, left
     * and right.
     */
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number
      })
    ]),
    /**
     * The standalone prop determines whether VictoryPie should render as a standalone
     * svg, or in a g tag to be included in an svg
     */
    standalone: PropTypes.bool,
    /**
     * The overall start angle of the pie in degrees. This prop is used in conjunction with
     * endAngle to create a pie that spans only a segment of a circle.
     */
    startAngle: PropTypes.number,
    /**
     * The style prop specifies styles for your pie. VictoryPie relies on Radium,
     * so valid Radium style objects should work for this prop. Height, width, and
     * padding should be specified via the height, width, and padding props.
     * @examples {data: {stroke: "black"}, label: {fontSize: 10}}
     */
    style: PropTypes.shape({
      parent: PropTypes.object,
      data: PropTypes.object,
      labels: PropTypes.object
    }),
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: CustomPropTypes.nonNegative,
    /**
     * The x prop specifies how to access the X value of each data point.
     * If given as a function, it will be run on each data point, and returned value will be used.
     * If given as an integer, it will be used as an array index for array-type data points.
     * If given as a string, it will be used as a property key for object-type data points.
     * If given as an array of strings, or a string containing dots or brackets,
     * it will be used as a nested object property path (for details see Lodash docs for _.get).
     * If `null` or `undefined`, the data value will be used as is (identity function/pass-through).
     * @examples 0, 'x', 'x.value.nested.1.thing', 'x[2].also.nested', null, d => Math.sin(d)
     */
    x: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    /**
     * The y prop specifies how to access the Y value of each data point.
     * If given as a function, it will be run on each data point, and returned value will be used.
     * If given as an integer, it will be used as an array index for array-type data points.
     * If given as a string, it will be used as a property key for object-type data points.
     * If given as an array of strings, or a string containing dots or brackets,
     * it will be used as a nested object property path (for details see Lodash docs for _.get).
     * If `null` or `undefined`, the data value will be used as is (identity function/pass-through).
     * @examples 0, 'y', 'y.value.nested.1.thing', 'y[2].also.nested', null, d => Math.sin(d)
     */
    y: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ])
  };

  static defaultProps = {
    data: 0,
    endAngle: 90,
    events: {},
    height: 400,
    innerRadius: 100,
    outerRadius: 170,
    padAngle: 0,
    padding: 30,
    colorScale: [
      "#75C776",
      "#39B6C5",
      "#78CCC4",
      "#62C3A4",
      "#64A8D1",
      "#8C95C8",
      "#3BAF74"
    ],
    startAngle: -90,
    standalone: true,
    tickValues: [0, 2, 4, 6, 8, 10],
    width: 400,
    x: "x",
    y: "y",
    dataComponent: <Slice/>,
    tickComponent: <Tick/>,
    labelComponent: <VictoryLabel/>,
    needleComponent: <Needle/>
  };

  constructor() {
    super();
    this.state = {};
    this.getEvents = Helpers.getEvents.bind(this);
    this.getEventState = Helpers.getEventState.bind(this);
  }

  getColor(style, colors, index) {
    if (style && style.data && style.data.fill) {
      return style.data.fill;
    }
    return colors[index % colors.length];
  }

  getRadius(props, padding) {
    const maxRadius = Math.min(
      props.width - padding.left - padding.right,
      props.height - padding.top - padding.bottom
    ) / 2;
    if (this.props.outerRadius < maxRadius) {
      padding.left += (maxRadius - this.props.outerRadius);
    }
    return Math.min(this.props.outerRadius, maxRadius);
  }

  getSliceFunction(props) {
    const degreesToRadians = (degrees) => {
      return degrees * (Math.PI / 180);
    };

    return d3Shape.pie()
      .sort(null)
      .startAngle(degreesToRadians(props.startAngle))
      .endAngle(degreesToRadians(props.endAngle))
      .padAngle(degreesToRadians(props.padAngle));
  }

  getGaugeRange(props, segmentLocations, segmentValues) {
    const radiansToDegrees = (r) => r * (180 / Math.PI);
    const {domain} = props;
    return {
      minimum: {
        value: domain && domain[0] || 0,
        degrees: radiansToDegrees(segmentLocations[0].startAngle)
      },
      maximum: {
        value: domain && domain[1] || sum(segmentValues),
        degrees: radiansToDegrees(last(segmentLocations).endAngle)
      }
    };
  }

  getDomain(props) {
    const {domain, segments} = props;
    const first = segments[0];
    const end = last(segments);
    if (domain && domain.length === 2) {
      const [min, max] = domain;
      return [
        (first > min ? min : first),
        (end < max ? max : end)
      ];
    }
    return [first, end];
  }

  getSegments(props, domain) {
    const {segments} = props;
    const [min, max] = domain;
    const lastValue = last(segments);
    if (segments && segments.length) {
      const bah = segments.map((value, i, arr) => {
        if (i === 0) {
          return value - min;
        }
        const previous = arr[i - 1] || 0;
        return value - previous;
      });
      if (max - lastValue > 0) {
        bah.push(max - lastValue);
      }
      return bah;
    }
    return props.segments && props.segments.length ? props.segments : [1];
  }

  renderData(props, calculatedProps) {
    const {
      style, colors, pathFunction,
      tickValues, radius, layoutFunction,
      segmentLocations
    } = calculatedProps;
    // TODO fix data events
    const dataEvents = this.getEvents(props.events.data, "data");
    // TODO fix label events
    const labelEvents = this.getEvents(props.events.labels, "labels");
    const tickArray = range(tickValues.length - 1).map(() => 1);
    const tickLocations = layoutFunction(tickArray);
    let ticks = tickLocations.reduce((locations, segment) => {
      locations[segment.startAngle] = segment.startAngle;
      locations[segment.endAngle] = segment.endAngle;
      return locations;
    }, {});
    ticks = Object.keys(ticks).sort((x, y) => parseFloat(x) - parseFloat(y));
    const tickComponents = ticks.map((tick, index) => {
      const tickLocation = d3Shape.arc()
          .startAngle(tick)
          .endAngle(tick)
          .outerRadius(radius)
          .innerRadius(radius)
          .centroid();
      const angle = tick * (360 / (Math.PI * 2));
      // console.log(angle);
      const tickProps = defaults({},
        props.tickComponent.props,
        {
          key: `tick-${index}`,
          // style:
          x: tickLocation[0],
          y: tickLocation[1],
          index,
          angle
        }
      );
      const tickComponent = React.cloneElement(props.tickComponent, assign({}, tickProps));
      const text = tickValues[index];
      if (text !== null && text !== undefined) {
        const labelLocation = d3Shape.arc()
          .startAngle(tick)
          .endAngle(tick)
          .outerRadius(radius + props.padding)
          .innerRadius(radius)
          .centroid();

        const labelStyle = Helpers.evaluateStyle(
          assign({padding: 0}, style.labels),
        );

        const labelProps = defaults(
          {},
          this.getEventState(index, "labels"),
          props.labelComponent.props,
          {
            key: `tick-label-${index}`,
            style: labelStyle,
            x: labelLocation[0],
            y: labelLocation[1],
            text: `${text}`,
            index,
            textAnchor: labelStyle.textAnchor || "start",
            verticalAnchor: labelStyle.verticalAnchor || "middle",
            angle: angle.toString()
          }
        );
        const tickLabel = React.cloneElement(props.labelComponent, assign({
          events: Helpers.getPartialEvents(labelEvents, index, labelProps)
        }, labelProps));
        return (
          <g key={`tick-group${index}`}>
            {tickComponent}
            {tickLabel}
          </g>
        );
      }
      return tickComponent;
    });
    const sliceComponents = segmentLocations.map((slice, index) => {
      const datum = {
        x: slice.data
      };
      const fill = this.getColor(style, colors, index);
      const dataStyles = omit(datum, ["x", "y", "label"]);
      const sliceStyle = defaults({}, {fill}, style.data, dataStyles);
      const dataProps = defaults(
        {},
        this.getEventState(index, "data"),
        props.dataComponent.props,
        {
          key: `slice-${index}`,
          index,
          slice,
          pathFunction,
          style: Helpers.evaluateStyle(sliceStyle, datum),
          datum
        }
      );
      return React.cloneElement(props.dataComponent, assign(
        {}, dataProps, {events: Helpers.getPartialEvents(dataEvents, index, dataProps)}
      ));
    });
    return (
      <g>
        {sliceComponents}
        {tickComponents}
      </g>
    );
  }
  getRotation(calculatedProps, gaugeRange) {
    const {domain} = calculatedProps;
    const {minimum, maximum} = gaugeRange;
    const {data} = this.props;
    const degreesOfRotation = d3
      .scale
      .linear()
      .domain(domain)
      .range([minimum.degrees, maximum.degrees])(data);
    return Math.max(minimum.degrees, Math.min(degreesOfRotation, maximum.degrees));
  }
  renderNeedle(props, calculatedProps) {
    const{radius, gaugeRange} = calculatedProps;
    return React.cloneElement(props.needleComponent,
      assign({}, {
        needleHeight: calculatedProps.radius,
        style: defaults({}, defaultStyles.needle),
        rotation: this.getRotation(calculatedProps, gaugeRange),
        height: radius
      })
    );
  }

  getCalculatedProps(props) {
    const style = Helpers.getStyles(props.style, defaultStyles, "auto", "100%");
    const colors = Array.isArray(props.colorScale) ?
      props.colorScale : Style.getColorScale(props.colorScale);
    const padding = Helpers.getPadding(props);
    const radius = this.getRadius(props, padding);
    const domain = this.getDomain(props);
    const segmentValues = this.getSegments(props, domain);
    const layoutFunction = this.getSliceFunction(props);
    const segmentLocations = layoutFunction(segmentValues).slice();
    const gaugeRange = this.getGaugeRange(props, segmentLocations, segmentValues);

    const tickValues = props.tickValues;
    const tickCount = props.tickCount ? props.tickCount : tickValues.length;
    const pathFunction = d3Shape.arc()
      .outerRadius(radius)
      .innerRadius(props.innerRadius);
    return {
      style, colors, padding, radius, domain, segmentValues, layoutFunction,
      tickCount, tickValues, pathFunction, segmentLocations, gaugeRange
    };

  }

  render() {
    // If animating, return a `VictoryAnimation` element that will create
    // a new `VictoryBar` with nearly identical props, except (1) tweened
    // and (2) `animate` set to null so we don't recurse forever.

    if (this.props.animate) {
      const whitelist = [
        "data", "style", "startAngle", "endAngle", "colorScale",
        "innerRadius", "outerRadius", "padAngle", "width", "height",
        "padding", "tickValues", "tickFormat", "domain"
      ];
      return (
        <VictoryAnimation animate={this.props.animate} animationWhitelist={whitelist}>
          <VictoryGauge {...this.props}/>
        </VictoryAnimation>
      );
    }

    const calculatedProps = this.getCalculatedProps(this.props);
    const { style, padding, radius } = calculatedProps;
    const xOffset = radius + padding.left;
    const yOffset = radius + padding.top;
    const group = (
      <g style={style.parent} transform={`translate(${xOffset}, ${yOffset})`}>
        {this.renderData(this.props, calculatedProps)}
        {this.renderNeedle(this.props, calculatedProps)}
      </g>
    );

    return this.props.standalone ?
      <svg
        style={style.parent}
        viewBox={`0 0 ${this.props.width} ${this.props.height}`}
        {...this.props.events.parent}
      >
        {group}
      </svg> :
      group;
  }
}
