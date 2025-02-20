import powerbiVisualsApi from "powerbi-visuals-api";
import { Axis } from "d3-axis";
import { NumberValue, ScaleLinear, ScaleTime } from "d3-scale";
import { Line as d3Line } from "d3-shape";

import DataViewCategoricalColumn = powerbiVisualsApi.DataViewCategoricalColumn;
import DataViewMetadataColumn = powerbiVisualsApi.DataViewMetadataColumn;
import DataViewValueColumnGroup = powerbiVisualsApi.DataViewValueColumnGroup;

import { TooltipEnabledDataPoint } from "powerbi-visuals-utils-tooltiputils";

import { legendInterfaces, dataLabelInterfaces } from "powerbi-visuals-utils-chartutils";
import LabelEnabledDataPoint = dataLabelInterfaces.LabelEnabledDataPoint;
import LegendData = legendInterfaces.LegendData;

import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import ValueFormatterOptions = valueFormatter.ValueFormatterOptions;

import { Orientation, PointLabelPosition } from "../enum/enums";
import { PulseChartSettingsModel } from "../pulseChartSettingsModel";
import { SelectableDataPoint } from "../behavior";

// TYPES
export type GenericScale = TimeScale | LinearScale;

// INTERFACES
export type Line = d3Line<PointXY>
export type LinearScale = ScaleLinear<number, number, never>
export type TimeScale = ScaleTime<number, number, never>
export interface VisualDataLabelsSettings {
    show: boolean;
    showLabelPerSeries?: boolean;
    labelOrientation?: Orientation;
    isSeriesExpanded?: boolean;
    displayUnits?: number;
    showCategory?: boolean;
    position?: PointLabelPosition;
    precision?: number;
    labelColor: string;
    categoryLabelColor?: string;
    fontSize?: number;
}

export interface PointDataLabelsSettings extends VisualDataLabelsSettings {
    position: PointLabelPosition;
}

export interface ChartDataLabelsSettings extends PointDataLabelsSettings {
    labelDensity: string;
}

export interface TooltipData {
    value: string | Date;
    title: string;
    description: string;
    offsetX?: number;
}

export interface AnimationPosition {
    series: number;
    index: number;
}

export interface PointXY {
    x: number;
    y: number;
}

export interface PrimitiveDataPoint
    extends TooltipEnabledDataPoint, SelectableDataPoint, LabelEnabledDataPoint {

    categoryValue: number | Date;
    value: number;
    categoryIndex: number;
    seriesIndex: number;
    highlight?: boolean;
    key?: string;
    labelSettings: ChartDataLabelsSettings;
    pointColor?: string;
}

export interface DataPoint extends PrimitiveDataPoint, PointXY {
    groupIndex: number;
    popupInfo?: TooltipData;
    eventSize: number;
    runnerCounterValue: string;
    runnerCounterFormatString: string;
}

export interface AxisSettings {
    formatterOptions?: ValueFormatterOptions;
    fontColor: string;
    color: string;
    show: boolean;
}

export interface AxesLabels {
    x: string;
    y: string;
    y2?: string;
}

export interface Series {
    name?: string;
    displayName: string;
    lineIndex: number;
    labelSettings: ChartDataLabelsSettings;
    data: DataPoint[];
    color: string;
    width: number;
    xAxisProperties?: XAxisProperties;
    widthOfGap: number;
}

export interface ChartData {
    settings: PulseChartSettingsModel;
    columns: DataRoles<DataViewCategoricalColumn>;
    categoryMetadata: DataViewMetadataColumn;
    hasHighlights: boolean;

    dots: DataPoint[];
    series: Series[];
    isScalar?: boolean;
    dataLabelsSettings: PointDataLabelsSettings;
    axesLabels: AxesLabels;
    hasDynamicSeries?: boolean;
    defaultSeriesColor?: string;
    categoryData?: PrimitiveDataPoint[];

    categories: number[] | Date[];
    legendData?: LegendData;

    grouped: DataViewValueColumnGroup[];

    xScale?: TimeScale | LinearScale;
    commonYScale?: LinearScale;
    yScales?: LinearScale[];
    yAxis?: Axis<NumberValue>;

    widthOfXAxisLabel: number;
    widthOfTooltipValueLabel: number;
    heightOfTooltipDescriptionTextLine: number;
    runnerCounterHeight: number;
}

export interface XAxisProperties {
    values: (Date | number)[];
    scale: TimeScale;
    axis: Axis<Date | NumberValue>;
    rotate: boolean;
}

export interface DataRoles<T> {
    Timestamp?: T;
    Category?: T;
    Value?: T;
    EventTitle?: T;
    EventDescription?: T;
    EventSize?: T;
    RunnerCounter?: T;
}

export interface ElementDimensions {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface TooltipSettings {
    dataPointColor: string;
    marginTop: number;
    timeHeight: number;
}
