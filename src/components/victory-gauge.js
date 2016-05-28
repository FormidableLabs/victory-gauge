import React, { PropTypes } from "react";
import d3Shape from "d3-shape";
import d3Scale from "d3-scale";
import {
  assign, defaults,
  last, uniq, min, max
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
  },
  ticks: {
    stroke: "black",
    strokeWidth: "1",
    y2: 6
  },
  tickLabels: {
    padding: 0
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
     * The tickValues prop explicitly specifies which tick values to draw on the gauge.
     * These values will subdivide the gauge and add value labels
     * @examples [1, 2, 3, 4]
     */
    tickValues: PropTypes.arrayOf(PropTypes.number),

    tickCount: PropTypes.number,

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
      segments: PropTypes.object,
      labels: PropTypes.object,
      ticks: PropTypes.object,
      needle: PropTypes.object
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
    segments: [],
    startAngle: -90,
    standalone: true,
    tickValues: [],
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
    const highestValue = max(allValues);
    let lowestValue = min(allValues);
    lowestValue = lowestValue === highestValue ? 0 : lowestValue;
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
      style, colors, pathFunction,
      tickValues, radius,
      segmentLocations
    } = calculatedProps;
    // TODO fix data events
    const dataEvents = this.getEvents(props.events.data, "data");
    // TODO fix label events
    const labelEvents = this.getEvents(props.events.labels, "labels");
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
      const tickProps = defaults({},
        props.tickComponent.props,
        {
          key: `tick-${index}`,
          tickHeight: tickStyles.y2,
          style: tickStyles,
          x: tickLocation[0],
          y: tickLocation[1],
          index,
          angle: (tick * (360 / (Math.PI * 2))).toString()
        }
      );
      const tickComponent = React.cloneElement(props.tickComponent, tickProps);
      const text = tickValues[index];
      if (text !== null && text !== undefined) {
        const labelLocation = d3Shape.arc()
          .startAngle(tick)
          .endAngle(tick)
          .outerRadius(radius + props.padding + tickStyles.y2)
          .innerRadius(radius)
          .centroid();

        const labelStyle = Helpers.evaluateStyle(
          assign({}, style.labels, defaultStyles.tickLabels),
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
            angle: this.getLabelAngle(tick)
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
    const segmentComponents = segmentLocations.map((segment, index) => {
      const fill = this.getColor(style, colors, index);
      const segmentStyle = defaults({}, {fill}, style.segments);
      const dataProps = defaults(
        {},
        this.getEventState(index, "data"),
        props.dataComponent.props,
        {
          key: `segment-${index}`,
          index,
          slice: segment,
          pathFunction,
          style: Helpers.evaluateStyle(segmentStyle, {x: segment.data}),
          datum: {x: segment.data}
        }
      );
      return React.cloneElement(props.dataComponent, assign(
        {}, dataProps, {events: Helpers.getPartialEvents(dataEvents, index, dataProps)}
      ));
    });
    return (
      <g>
        {segmentComponents}
        {tickComponents}
      </g>
    );
  }
  getNeedleRotation(calculatedProps) {
    const {domain, gaugeRange} = calculatedProps;
    const {minimum, maximum} = gaugeRange;
    const {data} = this.props;
    const degreesOfRotation = d3Scale
      .scaleLinear()
      .domain(domain)
      .range([minimum.degrees, maximum.degrees])(data);
    const absoluteMaxDegrees = Math.max(maximum.degrees, minimum.degrees);
    const absoluteMinDegrees = Math.min(maximum.degrees, minimum.degrees);
    return Math.max(absoluteMinDegrees, Math.min(degreesOfRotation, absoluteMaxDegrees));
  }
  renderNeedle(props, calculatedProps) {
    const{radius} = calculatedProps;
    return React.cloneElement(props.needleComponent, {
      needleHeight: calculatedProps.radius,
      style: defaults({}, props.style.needle, defaultStyles.needle),
      rotation: this.getNeedleRotation(calculatedProps),
      height: radius
    });
  }
  getCalculatedProps(props) {
    const style = Helpers.getStyles(props.style, defaultStyles, "auto", "100%");
    const colors = Array.isArray(props.colorScale) ?
      props.colorScale : Style.getColorScale(props.colorScale);
    const padding = Helpers.getPadding(props);
    const radius = this.getRadius(props, padding);
    const tickValues = props.tickFormat ? props.tickValues.map(props.tickFormat) : props.tickValues;
    const domain = this.getDomain(props, tickValues);
    const segmentValues = this.getChartDivisions(props.segments, domain);
    const layoutFunction = this.getSliceFunction(props);
    const segmentLocations = layoutFunction(segmentValues);
    const gaugeRange = this.getGaugeRange(domain, segmentLocations, props);
    const pathFunction = d3Shape.arc()
      .outerRadius(radius)
      .innerRadius(props.innerRadius);
    return {
      style, colors, padding, radius, domain, segmentValues, layoutFunction,
      tickValues, pathFunction, segmentLocations, gaugeRange
    };

  }

  render() {
    // If animating, return a `VictoryAnimation` element that will create
    // a new `VictoryGauge` with nearly identical props, except (1) tweened
    // and (2) `animate` set to null so we don't recurse forever.
    if (this.props.animate) {
      const animate = defaults(this.props.animate, {easing: "backInOut"});
      return (
        <VictoryAnimation {...animate} data={{data: this.props.data}}>
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
