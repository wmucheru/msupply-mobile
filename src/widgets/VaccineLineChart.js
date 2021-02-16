/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { Svg } from 'react-native-svg';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryScatter } from 'victory-native';
import PropTypes from 'prop-types';

import { useLayoutDimensions } from '../hooks/useLayoutDimensions';
import { WHITE, COLD_BREACH_BLUE, SUSSOL_ORANGE, APP_FONT_FAMILY, GREY } from '../globalStyles';
import { HazardPoint } from './HazardPoint';
import { FlexView } from './FlexView';
import { CHART_CONSTANTS } from '../utilities/modules/vaccines';
import { getTickFormatter } from '../utilities/formatters';
import { VACCINE_CONSTANTS } from '../utilities/modules/vaccines/constants';
import { WARMER_GREY } from '../globalStyles/colors';

export const VaccineLineChart = ({
  minLine,
  maxLine,
  minDomain,
  maxDomain,
  x,
  y,
  breaches,
  onPressBreach,
}) => {
  const [width, height, setDimensions] = useLayoutDimensions();

  const maxBoundary = React.useCallback(() => maxDomain, []);
  const minBoundary = React.useCallback(() => minDomain, []);

  const chartMinDomain = React.useMemo(() => ({ y: minDomain - CHART_CONSTANTS.DOMAIN_OFFSET }), [
    minDomain,
  ]);
  const chartMaxDomain = React.useMemo(() => ({ y: maxDomain + CHART_CONSTANTS.DOMAIN_OFFSET }), [
    maxDomain,
  ]);

  return (
    <FlexView onLayout={setDimensions}>
      <Svg>
        <VictoryChart
          width={width}
          height={height}
          minDomain={chartMinDomain}
          maxDomain={chartMaxDomain}
          padding={{ top: 0, bottom: 50, right: 10, left: 50 }}
        >
          <VictoryAxis
            offsetX={CHART_CONSTANTS.AXIS_OFFSET}
            dependentAxis
            style={chartStyles.axisY}
            tickFormat={tick => `${tick}\u2103`}
          />
          <VictoryAxis
            offsetY={CHART_CONSTANTS.AXIS_OFFSET}
            tickFormat={getTickFormatter()}
            style={chartStyles.axisX}
            tickCount={VACCINE_CONSTANTS.MAX_TICK_COUNTS}
          />

          <VictoryLine
            interpolation={CHART_CONSTANTS.INTERPOLATION}
            data={minLine}
            y={y}
            x={x}
            style={chartStyles.minLine}
          />
          <VictoryLine
            interpolation={CHART_CONSTANTS.INTERPOLATION}
            data={maxLine}
            y={y}
            x={x}
            style={chartStyles.maxLine}
          />
          <VictoryLine data={maxLine} y={maxBoundary} x={x} style={chartStyles.maxBoundaryLine} />
          <VictoryLine data={minLine} y={minBoundary} x={x} style={chartStyles.minBoundaryLine} />

          <VictoryScatter data={maxLine} y={y} x={x} style={chartStyles.maxScatterPlot} />
          <VictoryScatter data={minLine} y={y} x={x} style={chartStyles.minScatterPlot} />
          <VictoryScatter
            data={breaches.slice()}
            y={y}
            x={x}
            dataComponent={<HazardPoint dataSet={breaches.slice()} onPress={onPressBreach} />}
          />
        </VictoryChart>
      </Svg>
    </FlexView>
  );
};

VaccineLineChart.defaultProps = {
  x: 'timestamp',
  y: 'temperature',
  onPressBreach: null,
  breaches: null,
};

VaccineLineChart.propTypes = {
  x: PropTypes.string,
  y: PropTypes.string,
  minDomain: PropTypes.number.isRequired,
  maxDomain: PropTypes.number.isRequired,
  minLine: PropTypes.array.isRequired,
  maxLine: PropTypes.array.isRequired,
  onPressBreach: PropTypes.func,
  breaches: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

const chartStyles = {
  maxBoundaryLine: { data: { stroke: SUSSOL_ORANGE, opacity: 0.3 } },
  minBoundaryLine: { data: { stroke: COLD_BREACH_BLUE, opacity: 0.3 } },
  minScatterPlot: {
    data: {
      fill: WHITE,
      stroke: COLD_BREACH_BLUE,
      strokeWidth: CHART_CONSTANTS.STROKE_WIDTH,
      size: CHART_CONSTANTS.STROKE_SIZE,
    },
  },
  maxScatterPlot: {
    data: {
      fill: WHITE,
      stroke: SUSSOL_ORANGE,
      strokeWidth: CHART_CONSTANTS.STROKE_WIDTH,
      size: CHART_CONSTANTS.STROKE_SIZE,
    },
  },
  maxLine: { data: { stroke: SUSSOL_ORANGE } },
  minLine: { data: { stroke: COLD_BREACH_BLUE } },
  axisX: { tickLabels: { fontSize: 10, fontFamily: APP_FONT_FAMILY, fill: GREY } },
  axisY: {
    tickLabels: { fontSize: 10, fontFamily: APP_FONT_FAMILY, fill: GREY },
    grid: { stroke: WARMER_GREY, strokeWidth: 0.5 },
  },
};
