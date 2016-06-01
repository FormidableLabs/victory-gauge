import React, { PropTypes } from "react";
import d3Shape from "d3-shape";
import d3Scale from "d3-scale";
import {
  assign, defaults, isFunction, last,
  max, min, pick, uniq
} from "lodash";
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
  tickLabels: {
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
  },
  ticks: {
    stroke: "black",
    strokeWidth: "1",
    y2: 6
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
     * corresponding to one of the built in color scales. VictoryGauge will automatically assign
     * values from this color scale to the gauge segments unless colors are explicitly provided
     * in the data object
     */
    colorScale: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.oneOf([
        "greyscale", "qualitative", "heatmap", "warm", "cool", "red", "green", "blue"
      ])
    ]),
    /**
     * The data prop specifies the data to be plotted, and will be represented by a
     * number. The needleComponent will point to the value on the chart, segments and tickValues
     * are not required, but at least a domain must be provided along with the data prop.
     * If data is an object, a dataAccessor must be provided as well to act as a getter
     * on the data object.
     * @examples
     *   data={22},
     *
     *   dataAccessor={(obj) => obj.data}
     *   data={{data: 14, label: "not your data"}}
     */
    data: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number
    ]),
    /**
     * The dataAccessor prop is a function that takes in the data prop and formats it so that
     * the data can be appropriately rendered by the
     * @examples (x) => parseInt(x, 10), (x) => Math.floor(x.value)
     */
    dataAccessor: PropTypes.func,
    /**
     * The domain prop describes the range of values your axis will include. This prop should be
     * given as a array of the minimum and maximum expected values for the gauge.
     * If this value is not given it will be calculated based on the segments or tickValues.
     * @examples [-1, 1]
     */
    domain: CustomPropTypes.domain,
    /**
     * The overall end angle of the gauge in degrees. This prop is used in conjunction with
     * startAngle to create a gauge that spans a segment of a circle. Default value is 90,
     * which along with startAngle's default will render a half circle gauge.
     */
    endAngle: PropTypes.number,
    /**
     * The events prop attaches arbitrary event handlers to data and label elements
     * Event handlers are called with their corresponding events, corresponding component props,
     * and their index in the data array, and event name. The return value of event handlers
     * will be stored by index and namespace on the state object of VictoryGauge
     * i.e. `this.state[index].data = {style: {fill: "red"}...}`, and will be
     * applied by index to the appropriate child component. Event props on the
     * parent namespace are just spread directly on to the top level svg of VictoryGauge
     * if one exists. If VictoryGauge is set up to render g elements i.e. when it is
     * rendered within chart parent events will not be applied.
     *
     * @examples {data: {
     *  onClick: () => return {data: {style: {fill: "green"}}, tickLabels: {style: {fill: "black"}}}
     *}}
     */
    events: PropTypes.shape({
      tickLabels: PropTypes.object,
      needle: PropTypes.object,
      parent: PropTypes.object,
      segments: PropTypes.object,
      ticks: PropTypes.object
    }),
    /**
     * The height props specifies the height of the chart container element in pixels
     */
    height: CustomPropTypes.nonNegative,
    /**
     * When creating a gauge, this prop determines the number of pixels between
     * the center of the chart and the inner edge of the gauge.
     */
    innerRadius: CustomPropTypes.nonNegative,
    /**
     * The needleComponent prop takes in an entire component which will be used
     * to create a gauge needle. The new element created from the passed needleComponent
     * will be supplied with the following properties: rotation, needlePath, style and events.
     * Any of these props may be overridden by passing in props to the supplied component,
     * or modified or ignored within the custom component itself. If a needleComponent
     * is not supplied, VictoryAxis will render its default Needle component.
     */
    needleComponent: PropTypes.element,
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
     * The segmentComponent prop takes an entire, HTML-complete data component which will be used to
     * create segments for each value in the segments prop. The new element created from the passed
     * segmentComponent will have the property datum set by the gauge for the point it renders;
     * properties style and pathFunction calculated by VictoryGauge; an index property set
     * corresponding to the location of the datum in the data provided to the pie; events bound to
     * the VictoryPie; and the d3 compatible segment object.
     * If a segmentComponent is not provided, VictoryPie's Slice component will be used.
     */
    segmentComponent: PropTypes.element,
    /**
     * the segments prop is an array of values by which the gauge chart will be divided. The
     * segments will act as markers to divide the gauge into color-coded areas where one
     * value ends and another begins. The domain of the gauge will be determined by both the
     * maximum and minimum values of the tickValues and segments. If a segments array of one
     * value or duplicate values is provided without a domain, the lower bound of the domain will
     * default to 0. The segment values can be provided in any order and the gauge will be
     * segmented in order from least to greatest.
     * @examples [1, 20, 50, 60, 90, 100], [32, 11, 19, 5]
     */
    segments: PropTypes.array,
    /**
     * The standalone prop determines whether VictoryPie should render as a standalone
     * svg, or in a g tag to be included in an svg
     */
    standalone: PropTypes.bool,
    /**
     * The overall start angle of the gauge in degrees. This prop is used in conjunction with
     * endAngle to create a gauge that spans only any segment of a circle, the default value
     * is -90.
     */
    startAngle: PropTypes.number,
    /**
     * The style prop specifies styles for your pie. VictoryPie relies on Radium,
     * so valid Radium style objects should work for this prop. Height, width, and
     * padding should be specified via the height, width, and padding props.
     * @examples {needle: {stroke: "black"}, tickLabels: {fontSize: 10}}
     */
    style: PropTypes.shape({
      parent: PropTypes.object,
      segments: PropTypes.object,
      tickLabels: PropTypes.object,
      ticks: PropTypes.object,
      needle: PropTypes.object
    }),
    /**
     * The tickComponent prop takes in an entire component which will be used
     * to create tick lines. The new element created from the passed tickComponent
     * will be supplied with the following properties: x1, y1, x2, y2, angle, style and events.
     * Any of these props may be overridden by passing in props to the supplied component,
     * or modified or ignored within the custom component itself. If a tickComponent
     * is not supplied, VictoryAxis will render its default Tick component.
     */
    tickComponent: PropTypes.element,
    /**
     * The tickCount prop specifies approximately how many ticks should be drawn along the
     * outerRadius of the gauge if tickValues are not explicitly provided. The placement
     * of the ticks is determined by mathmatical subdivision of the gauge so that ticks are
     * evenly spaced throughout.
     */
    tickCount: PropTypes.number,
    /**
     * The tickFormat prop specifies how tick values should be expressed visually.
     * tickFormat can be given as a function to be applied to every tickValue, or as
     * an array of display values for each tickValue.
     * @examples d3.time.format("%Y"), (x) => x.toPrecision(2), ["first", "second", "third"]
     */
    tickFormat: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.homogeneousArray
    ]),
    /**
     * The tickLabelComponent prop takes in an entire label component which will be used
     * to create labels for each tick on the gauge. The new element created from
     * the passed tickLabelComponent will be supplied with the following properties:
     * x, y, index, datum, verticalAnchor, textAnchor, angle, style, text, and events.
     * any of these props may be overridden by passing in props to the supplied component,
     * or modified or ignored within the custom component itself. If labelComponent is omitted,
     * a new VictoryLabel will be created with props described above.
     */
    tickLabelComponent: PropTypes.element,
    /**
     * The tickValues prop explicitly specifies which tick values to draw on the gauge.
     * These values will subdivide the gauge and add value labels. The domain of the chart
     * will be determined by the largest and smallest values of tickValues and segments
     * if domain is not provided.
     * @examples [1, 2, 3, 4]
     */
    tickValues: PropTypes.arrayOf(PropTypes.number),
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: CustomPropTypes.nonNegative
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
    segments: [],
    style: {},
    startAngle: -90,
    standalone: true,
    tickValues: [],
    width: 400,
    x: "x",
    y: "y",
    segmentComponent: <Slice/>,
    tickComponent: <Tick/>,
    tickLabelComponent: <VictoryLabel/>,
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

  getGaugeRange(domain, segmentLocations, props) {
    const radiansToDegrees = (r) => r * (180 / Math.PI);
    let {startAngle, endAngle} = props;
    if (segmentLocations.length) {
      startAngle = radiansToDegrees(segmentLocations[0].startAngle);
      endAngle = radiansToDegrees(last(segmentLocations).endAngle);
    }
    return {
      minimum: {
        value: domain[0],
        degrees: startAngle
      },
      maximum: {
        value: domain[1],
        degrees: endAngle
      }
    };
  }

  getLabelAngle(label) {
    let angle = label * (360 / (Math.PI * 2));
    if (angle > 80 && angle < 110 || angle < -80 && angle > -110) {
      angle = 0;
    }
    if (angle > 90) {
      angle += 180;
    }else if (angle < -90) {
      angle -= 180;
    }
    return angle.toString();
  }

  getDomain(props, tickValues) {
    const {domain, segments} = props;
    const allValues = tickValues
      .concat(segments)
      .concat(domain);
    let highestValue = max(allValues);
    let lowestValue = min(allValues);
    if (lowestValue === highestValue) {
      if (lowestValue === Math.abs(lowestValue)) {
        lowestValue = 0;
      } else {
        highestValue = 0;
      }
    }
    return [
      lowestValue,
      highestValue
    ];
  }

  getChartDivisions(values, domain, isTicks) {
    const [minimum, maximum] = domain;
    values.sort((x, y) => x - y);
    const lastValue = last(values);
    if (values && values.length) {
      const adjustedSegments = values.map((value, i, arr) => {
        if (i === 0) {
          return value - minimum;
        }
        const previous = arr[i - 1] || 0;
        return value - previous;
      });
      if (maximum - lastValue > 0) {
        adjustedSegments.push(maximum - lastValue);
      }
      return adjustedSegments;
    }
    return isTicks ? [] : [domain[1]];
  }

  getTickArray(props, calculatedProps) {
    const {tickValues, domain} = calculatedProps;
    const {tickCount} = props;
    if (tickValues && tickValues.length) {
      return tickValues;
    } else if (tickCount) {
      const chartRange = domain[1] - domain[0];
      const tickSubDivisions = chartRange / (tickCount + 1);
      const iteratee = Array(tickCount);
      return Array(...iteratee).map((tick, i) => {
        const value = i * tickSubDivisions;
        return tickSubDivisions + value;
      });
    }
    return [];
  }

  getTickLocations(calculatedProps, tickArray) {
    const {domain, layoutFunction} = calculatedProps;
    const scaledTicks = this.getChartDivisions(tickArray, domain, true);
    const tickLocations = layoutFunction(scaledTicks);
    const ticks = tickLocations.map((segment) => {
      return parseFloat(segment.endAngle);
    });
    const dedupedLocations = uniq(ticks);
    if (dedupedLocations.length > tickArray.length) {
      dedupedLocations.pop();
    }
    return dedupedLocations;
  }

  renderData(props, calculatedProps) {
    const {
      colors, pathFunction, radius,
      segmentLocations, style,
      tickFormat, tickValues
    } = calculatedProps;
    const segmentEvents = this.getEvents(props.events.segments, "segments");
    const labelEvents = this.getEvents(props.events.tickLabels, "tickLabels");
    const tickEvents = this.getEvents(props.events.ticks, "ticks");
    const ticks = this.getTickLocations(calculatedProps, this.getTickArray(props, calculatedProps));
    const tickComponents = ticks.map((tick, index) => {
      const tickLocation = d3Shape.arc()
          .startAngle(tick)
          .endAngle(tick)
          .outerRadius(radius)
          .innerRadius(radius)
          .centroid();
      const tickStyles = assign({},
        defaultStyles.ticks,
        props.style.ticks
      );
      const tickProps = defaults(
        {},
        this.getEventState(index, "ticks"),
        props.tickComponent.props,
        {
          key: `tick-${index}`,
          style: tickStyles,
          x1: tickLocation[0],
          x2: tickLocation[0],
          y1: tickLocation[1],
          y2: tickLocation[1] - tickStyles.y2,
          angle: (tick * (360 / (Math.PI * 2))).toString()
        }
      );
      const tickComponent = React.cloneElement(props.tickComponent, assign(
        {}, tickProps, {events: Helpers.getPartialEvents(tickEvents, index, tickProps)}
      ));
      const text = Array.isArray(tickFormat) ? tickFormat[index] : tickValues[index];
      if (text !== null && text !== undefined) {
        const labelLocation = d3Shape.arc()
          .startAngle(tick)
          .endAngle(tick)
          .outerRadius(radius + props.padding + tickStyles.y2)
          .innerRadius(radius)
          .centroid();
        const labelStyle = Helpers.evaluateStyle(
          assign({}, style.tickLabels, defaultStyles.tickLabels, this.props.style.tickLabels),
        );

        const labelProps = defaults(
          {},
          this.getEventState(index, "tickLabels"),
          props.tickLabelComponent.props,
          {
            key: `tick-label-${index}`,
            style: labelStyle,
            x: labelLocation[0],
            y: labelLocation[1],
            text: `${text}`,
            index,
            textAnchor: labelStyle.textAnchor || "start",
            verticalAnchor: labelStyle.verticalAnchor || "middle",
            angle: this.getLabelAngle(tick)
          }
        );
        const tickLabel = React.cloneElement(props.tickLabelComponent, assign({
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
    const segmentComponents = segmentLocations.map((segment, index) => {
      const fill = this.getColor(style, colors, index);
      const segmentStyle = defaults({}, {fill}, style.segments);
      const segmentProps = defaults(
        {},
        this.getEventState(index, "segments"),
        props.segmentComponent.props,
        {
          key: `segment-${index}`,
          index,
          slice: segment,
          pathFunction,
          style: Helpers.evaluateStyle(segmentStyle, {x: segment.data}),
          datum: {x: segment.data}
        }
      );
      return React.cloneElement(props.segmentComponent, assign(
        {}, segmentProps, {events: Helpers.getPartialEvents(segmentEvents, index, segmentProps)}
      ));
    });
    return (
      <g>
        {segmentComponents}
        {tickComponents}
      </g>
    );
  }
  getNeedleRotation(props, calculatedProps) {
    const {domain, gaugeRange} = calculatedProps;
    const {minimum, maximum} = gaugeRange;
    const data = isFunction(props.dataAccessor) ? props.dataAccessor(props.data) : props.data;
    const degreesOfRotation = d3Scale
      .scaleLinear()
      .domain(domain)
      .range([minimum.degrees, maximum.degrees])(data);
    const absoluteMaxDegrees = Math.max(maximum.degrees, minimum.degrees);
    const absoluteMinDegrees = Math.min(maximum.degrees, minimum.degrees);
    return Math.max(absoluteMinDegrees, Math.min(degreesOfRotation, absoluteMaxDegrees));
  }
  renderNeedle(props, calculatedProps) {
    const {needleComponent, style} = props;
    const {radius} = calculatedProps;
    const needleEvents = this.getEvents(props.events.needle, "needle");
    const needleProps = defaults(
      {},
      this.getEventState(0, "needle"),
      needleComponent.props,
      {
        needleHeight: radius,
        style: defaults({}, style.needle, defaultStyles.needle),
        rotation: this.getNeedleRotation(props, calculatedProps)
      }
    );
    return React.cloneElement(needleComponent, assign(
      {}, needleProps, {events: Helpers.getPartialEvents(needleEvents, 0, needleProps)})
    );
  }
  getCalculatedProps(props) {
    const style = Helpers.getStyles(props.style, defaultStyles, "auto", "100%");
    const colors = Array.isArray(props.colorScale) ?
      props.colorScale : Style.getColorScale(props.colorScale);
    const padding = Helpers.getPadding(props);
    const radius = this.getRadius(props, padding);
    const tickValues = props.tickValues && props.tickValues.length ? props.tickValues : [];
    const tickFormat =
      isFunction(props.tickFormat) ?
      props.tickValues.map(props.tickFormat) :
      props.tickFormat;
    const domain = this.getDomain(props, props.tickValues);
    const segmentValues = this.getChartDivisions(props.segments, domain);
    const layoutFunction = this.getSliceFunction(props);
    const segmentLocations = layoutFunction(segmentValues);
    const gaugeRange = this.getGaugeRange(domain, segmentLocations, props);
    const pathFunction = d3Shape.arc()
      .outerRadius(radius)
      .innerRadius(props.innerRadius);
    return {
      style, colors, padding, radius, domain, segmentValues, layoutFunction,
      tickFormat, tickValues, pathFunction, segmentLocations, gaugeRange
    };

  }

  render() {
    // If animating, return a `VictoryAnimation` element that will create
    // a new `VictoryGauge` with nearly identical props, except (1) tweened
    // and (2) `animate` set to null so we don't recurse forever.
    if (this.props.animate) {
      const animate = defaults(this.props.animate, {easing: "backInOut"});
      const data = pick(this.props, ["data", "startAngle", "endAngle", "style", "innerRadius"]);
      return (
        <VictoryAnimation {...animate} data={data}>
          {(props) => <VictoryGauge {...this.props} {...props} animate={null}/>}
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
