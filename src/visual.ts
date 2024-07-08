/* eslint-disable prefer-const */
/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import powerbiVisualsApi from "powerbi-visuals-api";

import { min as d3Min, max as d3Max, range as d3Range } from  "d3-array";
import { axisRight, axisBottom, Axis } from "d3-axis";
import { Selection as d3Selection, select as d3Select } from "d3-selection";
import { timeMinute, timeDay } from "d3-time";
import { scaleLinear, scaleTime } from "d3-scale";
import { line as d3Line, curveLinear } from "d3-shape";
import { easeLinear } from "d3-ease";
import { timerFlush } from "d3-timer";
import 'd3-transition';

import mapValues from "lodash-es/mapValues";
import isEmpty from "lodash-es/isEmpty";
import isString from "lodash-es/isString";
import flatten from "lodash-es/flatten";
import last from "lodash-es/last";
import isEqual from "lodash-es/isEqual";
import isNumber from "lodash-es/isNumber";
import assign from "lodash-es/assign";
import filter from "lodash-es/filter";

import "../style/pulseChart.less";

import DataView = powerbiVisualsApi.DataView;
import DataViewObject = powerbiVisualsApi.DataViewObject;
import IViewport = powerbiVisualsApi.IViewport;
import DataViewValueColumn = powerbiVisualsApi.DataViewValueColumn;
import DataViewCategoryColumn = powerbiVisualsApi.DataViewCategoryColumn;
import DataViewMetadataColumn = powerbiVisualsApi.DataViewMetadataColumn;
import DataViewValueColumnGroup = powerbiVisualsApi.DataViewValueColumnGroup;
import PrimitiveValue = powerbiVisualsApi.PrimitiveValue;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;
import IVisual = powerbiVisualsApi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;
import ISelectionManager = powerbiVisualsApi.extensibility.ISelectionManager;
import VisualTooltipDataItem = powerbiVisualsApi.extensibility.VisualTooltipDataItem;
import ILocalizationManager = powerbiVisualsApi.extensibility.ILocalizationManager;

type Selection<T> = d3Selection<any, T, any, any>;

import * as SVGUtil from "powerbi-visuals-utils-svgutils";
import IRect = SVGUtil.IRect;
import manipulation = SVGUtil.manipulation;
import { axisInterfaces } from "powerbi-visuals-utils-chartutils";
import IMargin = axisInterfaces.IMargin;
import ClassAndSelector = SVGUtil.CssConstants.ClassAndSelector;
import createClassAndSelector = SVGUtil.CssConstants.createClassAndSelector;

import { valueFormatter, textMeasurementService, interfaces } from "powerbi-visuals-utils-formattingutils";
import ValueFormatterOptions = valueFormatter.ValueFormatterOptions;
import TextProperties = interfaces.TextProperties;

import { ColorHelper } from "powerbi-visuals-utils-colorutils";
import { axis as AxisHelper } from "powerbi-visuals-utils-chartutils";

import {
    TooltipSettings,
    ChartData,
    TooltipData,
    LinearScale,
    Line,
    DataPoint,
    DataRoles,
    Series,
    GenericScale,
    XAxisProperties,
    AnimationPosition,
    TimeScale,
    PointXY,
    ElementDimensions,
} from "./models/models";
import { RunnerCounterPosition, XAxisDateFormat, XAxisPosition } from './enum/enums';
import * as Helpers from "./helpers";
import * as pulseChartUtils from "./utils";
import { Behavior, BehaviorOptions } from "./behavior";
import { Animator } from "./animator";
import { createTooltipServiceWrapper, ITooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";
import { PulseChartSettingsModel } from './pulseChartSettingsModel';
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";

export class Visual implements IVisual {
    public static RoleDisplayNames = <DataRoles<string>>{
        Timestamp: "Timestamp",
        Category: "Category",
        Value: "Value",
        EventTitle: "Event Title",
        EventDescription: "Event Description",
        EventSize: "Event Size",
        RunnerCounter: "Runner Counter",
    };
    private static DefaultMargin: IMargin = {
        top: 20,
        bottom: 20,
        right: 25,
        left: 25,
    };
    private static DefaultViewport: IViewport = {
        width: 50,
        height: 50
    };
    private static PlaybackButtonsHeight = 26;
    private static MaxWidthOfYAxis: number = 50;
    private static PopupTextPadding: number = 3;
    private static XAxisTickSpace: number = 15;
    private static XAxisTickHeight: number = 16;
    private static MinimumTicksToRotate: number = 3;
    private static AxisTickRotateAngle: number = -35;
    private static topShift: number = 20;
    private static MaxGapCount: number = 100;
    private static DefaultAnimationDuration: number = 250;
    private static ScalarTooltipLabelWidth: number = 60;
    private static DefaultXAxisLabelWidth: number = 70;
    private static DefaultTooltipLabelPadding: number = 5;
    private static DefaultTooltipLabelMargin: number = 10;

    private static DefaultTooltipSettings: TooltipSettings = {
        dataPointColor: "#808181",
        marginTop: 20,
        timeHeight: 15,
    };

    private static getPopupValueTextProperties(text?: string, fontSizeValue = 12): TextProperties {
        return {
            text: text || "",
            fontFamily: "sans-serif",
            fontSize: fontSizeValue + "px",
        };
    }

    private static getPopupTitleTextProperties(text?: string, fontSizeValue = 12): TextProperties {
        return {
            text: text || "",
            fontFamily: "sans-serif",
            fontWeight: "bold",
            fontSize: fontSizeValue + "px",
        };
    }

    private static getPopupDescriptionTextProperties(text?: string, fontSizeValue = 12): TextProperties {
        return {
            text: text || "",
            fontFamily: "sans-serif",
            fontSize: fontSizeValue + "px",
        };
    }

    public static GET_RUNNER_COUNTER_TEXT_PROPERTIES(text?: string, fontSizeValue = 12): TextProperties {
        return {
            text: text || "",
            fontFamily: "sans-serif",
            fontSize: fontSizeValue + "px",
        };
    }

    public static CONVERT_TEXT_PROPERTIES_TO_STYLE(textProperties: TextProperties): any {
        return {
            "font-family": textProperties.fontFamily,
            "font-weight": textProperties.fontWeight,
            "font-size": textProperties.fontSize
        };
    }

    public static APPLY_TEXT_FONT_STYLES(selection: Selection<any>, fontStyles: any) {
        for (const [key, value] of (<any>Object).entries(fontStyles)) {
            selection.style(key, value);
        }
    }

    private static getDateTimeFormatString(dateFormatType: XAxisDateFormat, dateFormat: string): string {
        switch (dateFormatType) {
            case XAxisDateFormat.DateOnly: return dateFormat;
            case XAxisDateFormat.TimeOnly: return "H:mm";
            default: return "";
        }
    }

    private static getFullWidthOfDateFormat(dateFormat: string, textProperties: TextProperties): number {
        textProperties.text = valueFormatter.create({ format: dateFormat }).format(new Date(2000, 10, 20, 20, 20, 20));
        return textMeasurementService.measureSvgTextWidth(textProperties);
    }

    private static Chart: ClassAndSelector = createClassAndSelector("chart");
    private static Line: ClassAndSelector = createClassAndSelector("line");
    private static LineContainer: ClassAndSelector = createClassAndSelector("lineContainer");
    private static LineNode: ClassAndSelector = createClassAndSelector("lineNode");
    private static XAxisNode: ClassAndSelector = createClassAndSelector("xAxisNode");
    private static Dot: ClassAndSelector = createClassAndSelector("dot");
    private static Dots: ClassAndSelector = createClassAndSelector("dots");
    private static DotsContainer: ClassAndSelector = createClassAndSelector("dotsContainer");
    private static Tooltip: ClassAndSelector = createClassAndSelector("Tooltip");
    private static TooltipRect: ClassAndSelector = createClassAndSelector("tooltipRect");
    private static TooltipTriangle: ClassAndSelector = createClassAndSelector("tooltipTriangle");
    private static Gaps: ClassAndSelector = createClassAndSelector("gaps");
    private static Gap: ClassAndSelector = createClassAndSelector("gap");
    private static GapNode: ClassAndSelector = createClassAndSelector("gapNode");
    private static TooltipLine: ClassAndSelector = createClassAndSelector("tooltipLine");
    private static TooltipTime: ClassAndSelector = createClassAndSelector("tooltipTime");
    private static TooltipTimeRect: ClassAndSelector = createClassAndSelector("tooltipTimeRect");
    private static TooltipTitle: ClassAndSelector = createClassAndSelector("tooltipTitle");
    private static TooltipDescription: ClassAndSelector = createClassAndSelector("tooltipDescription");
    private static TooltipContainer: ClassAndSelector = createClassAndSelector("tooltipContainer");
    private static AnimationDot: ClassAndSelector = createClassAndSelector("animationDot");
    private static Y: ClassAndSelector = createClassAndSelector("y");
    private static Axis: ClassAndSelector = createClassAndSelector("axis");
    private static getCategoricalColumnOfRole(dataView: DataView, roleName: string): DataViewValueColumn | DataViewCategoryColumn {
        const filterFunc = (cols: (DataViewValueColumn | DataViewCategoryColumn)[]): DataViewValueColumn | DataViewCategoryColumn =>
            cols.filter((x: DataViewValueColumn | DataViewCategoryColumn) => x.source && x.source.roles && x.source.roles[roleName])[0];
        return filterFunc(dataView.categorical.categories) || filterFunc(dataView.categorical.values);
    }

    // eslint-disable-next-line max-lines-per-function
    public CONVERTER(
        dataView: DataView,
        host: IVisualHost,
        settings: PulseChartSettingsModel,
    ): ChartData {
        if (!dataView
            || !dataView.categorical
            || !dataView.categorical.values
            || !dataView.categorical.values[0]
            || !dataView.categorical.values[0].values
            || !dataView.categorical.categories
        ) {
            return null;
        }

        const columns: DataRoles<DataViewCategoryColumn | DataViewValueColumn> = <any>mapValues(
            Visual.RoleDisplayNames,
            (x, i) => Visual.getCategoricalColumnOfRole(dataView, i)
        );

        const valuesColumn: DataViewValueColumn = <DataViewValueColumn>columns.Value;
        const timeStampColumn = <DataViewCategoryColumn>columns.Timestamp;

        if (!timeStampColumn) {
            return null;
        }

        const isScalar: boolean = !(timeStampColumn.source && timeStampColumn.source.type && timeStampColumn.source.type.dateTime);

        const categoryValues: any[] = timeStampColumn.values;

        if (!categoryValues || isEmpty(dataView.categorical.values) || !valuesColumn || isEmpty(valuesColumn.values)) {
            return null;
        }
        const minValuesValue = Math.min.apply(null, valuesColumn.values), maxValuesValue = Math.max.apply(null, valuesColumn.values);
        const minCategoryValue = Math.min.apply(null, categoryValues), maxCategoryValue = Math.max.apply(null, categoryValues);
        settings.xAxis.dateFormat =
            (maxCategoryValue - minCategoryValue < (24 * 60 * 60 * 1000)
                && new Date(maxCategoryValue).getDate() === new Date(minCategoryValue).getDate())
                ? XAxisDateFormat.TimeOnly
                : XAxisDateFormat.DateOnly;

        settings.xAxis.formatterOptions = {
            value: isScalar ? minCategoryValue : new Date(minCategoryValue),
            value2: isScalar ? maxCategoryValue : new Date(maxCategoryValue)
        };
        settings.yAxis.formatterOptions = {
            value: minValuesValue,
            value2: maxValuesValue,
            format: valueFormatter.getFormatString(valuesColumn.source, null)
        };

        if (isScalar) {
            settings.xAxis.formatterOptions.format = valueFormatter.getFormatString(timeStampColumn.source, null);
        } else {
            settings.xAxis.formatterOptions.format = Visual.getDateTimeFormatString(settings.xAxis.dateFormat, timeStampColumn.source.format);
        }

        const widthOfTooltipValueLabel = isScalar ? Visual.ScalarTooltipLabelWidth : Visual.getFullWidthOfDateFormat(timeStampColumn.source.format, Visual.getPopupValueTextProperties()) + Visual.DefaultTooltipLabelPadding;
        const heightOfTooltipDescriptionTextLine = textMeasurementService.measureSvgTextHeight(Visual.getPopupDescriptionTextProperties("lj", settings.popup.fontSize.value));
        const runnerCounterFormatString = columns.RunnerCounter && valueFormatter.getFormatString(columns.RunnerCounter.source, null);
        settings.popup.width.value = Math.max(widthOfTooltipValueLabel + 2 * Visual.DefaultTooltipLabelMargin, settings.popup.width.value);

        let minSize: number = settings.dots.minSize.value;
        let maxSize: number = settings.dots.maxSize.value;
        if (settings.dots) {
            minSize = settings.dots.minSize.value;
            maxSize = settings.dots.maxSize.value;
        }

        const eventSizeScale: LinearScale = <LinearScale>Visual.createScale(
            true,
            columns.EventSize ? [d3Min(<number[]>columns.EventSize.values), d3Max(<number[]>columns.EventSize.values)] : [0, 0],
            minSize,
            maxSize);

        let xAxisCardProperties: DataViewObject = Helpers.getCategoryAxisProperties(dataView.metadata);

        const hasDynamicSeries: boolean = !!(timeStampColumn.values && timeStampColumn.source);
        const hasHighlights: boolean = !!valuesColumn.highlights;

        const dataPointLabelSettings = pulseChartUtils.getDefaultPulseChartLabelSettings();
        const gapWidths = Visual.getGapWidths(categoryValues);
        const maxGapWidth = Math.max.apply(null, gapWidths);

        const firstValueMeasureIndex: number = 0, firstGroupIndex: number = 0, secondGroupIndex = 1;
        const grouped: DataViewValueColumnGroup[] = dataView.categorical.values && dataView.categorical.values.grouped();
        const y_group0Values = grouped[firstGroupIndex]
            && grouped[firstGroupIndex].values[firstValueMeasureIndex]
            && grouped[firstGroupIndex].values[firstValueMeasureIndex].values;
        const y_group1Values = grouped[secondGroupIndex]
            && grouped[secondGroupIndex].values[firstValueMeasureIndex]
            && grouped[secondGroupIndex].values[firstValueMeasureIndex].values;

        const series: Series[] = [];
        let dataPoints: DataPoint[] = [];

        for (let categoryIndex = 0, seriesCategoryIndex = 0, len = timeStampColumn.values.length; categoryIndex < len; categoryIndex++ , seriesCategoryIndex++) {
            let categoryValue: string | Date = categoryValues[categoryIndex];
            if (isString(categoryValue)) {
                const date: Date = new Date(categoryValue);

                if (!isNaN(date.getTime())) {
                    categoryValue = date;
                    categoryValues[categoryIndex] = date;
                }
            }

            const valueFormatterLocalized = valueFormatter.create({ cultureSelector: host.locale });
            const value = AxisHelper.normalizeNonFiniteNumber(timeStampColumn.values[categoryIndex]);
            const runnerCounterValue = columns.RunnerCounter && columns.RunnerCounter.values && valueFormatterLocalized.format(columns.RunnerCounter.values[categoryIndex]);
            const identity: ISelectionId = host.createSelectionIdBuilder()
                .withCategory(timeStampColumn, categoryIndex)
                .createSelectionId();

            const minGapWidth: number = Math.max((maxCategoryValue - minCategoryValue) / Visual.MaxGapCount, <number>settings.xAxis.dateFormat);
            const gapWidth: number = gapWidths[categoryIndex];
            const isGap: boolean = settings.gaps.show.value
                && gapWidth > 0
                && gapWidth > (minGapWidth + (100 - settings.gaps.transparency.value) * (maxGapWidth - minGapWidth) / 100);

            if (isGap && dataPoints.length > 0) {
                series.push({
                    displayName: <string>grouped[firstGroupIndex].name,
                    lineIndex: series.length,
                    color: settings.series.fill.value.value,
                    data: dataPoints,
                    labelSettings: dataPointLabelSettings,
                    width: settings.series.width.value,
                    widthOfGap: gapWidth
                });

                seriesCategoryIndex = 0;
                dataPoints = [];
            }

            // When Scalar, skip null categories and null values so we draw connected lines and never draw isolated dots.
            if (isScalar && (categoryValue === null || value === null)) {
                continue;
            }

            let popupInfo: TooltipData = null;
            const eventSize: PrimitiveValue = (columns.EventSize && columns.EventSize.values && columns.EventSize.values[categoryIndex]) || 0;

            if ((columns.EventTitle && columns.EventTitle.values && columns.EventTitle.values[categoryIndex]) ||
                (columns.EventDescription && columns.EventDescription.values && columns.EventDescription.values[categoryIndex])) {
                let formattedValue = categoryValue;

                if (!isScalar && categoryValue) {
                    formattedValue = valueFormatter.create({ format: timeStampColumn.source.format, cultureSelector: host.locale }).format(categoryValue);
                }

                popupInfo = {
                    value: formattedValue,
                    title: columns.EventTitle && columns.EventTitle.values && valueFormatterLocalized.format(columns.EventTitle.values[categoryIndex]),
                    description: columns.EventDescription && columns.EventDescription.values && valueFormatterLocalized.format(columns.EventDescription.values[categoryIndex]),
                };
            }
            let y_value = <number>(y_group0Values && y_group0Values[categoryIndex]) || <number>(y_group1Values && y_group1Values[categoryIndex]) || 0;
            if (isNaN(y_value)) {
                y_value = 0;
            }
            let eventSizeValue: number = columns.EventSize ? eventSizeScale(<number>eventSize) : 0;
            if (isNaN(eventSizeValue)) {
                eventSizeValue = 0;
            }
            const dataPoint: DataPoint = {
                categoryValue: categoryValue,
                value: value,
                categoryIndex: categoryIndex,
                seriesIndex: series.length,
                tooltipInfo: null,
                popupInfo: popupInfo,
                selected: false,
                identity: identity,
                key: JSON.stringify({ ser: identity.getKey(), catIdx: categoryIndex }),
                labelFill: dataPointLabelSettings.labelColor,
                labelSettings: dataPointLabelSettings,
                x: <any>categoryValue,
                y: y_value,
                pointColor: settings.series.fill.value.value,
                groupIndex: Visual.getGroupIndex(categoryIndex, grouped),
                eventSize: eventSizeValue,
                runnerCounterValue: runnerCounterValue,
                runnerCounterFormatString: runnerCounterFormatString,
                specificIdentity: undefined,
                highlight: hasHighlights && !!(valuesColumn.highlights[categoryIndex])
            };

            dataPoints.push(dataPoint);
        }

        this.behavior.applySelectionStateToData(dataPoints);

        if (dataPoints.length > 0) {
            series.push({
                displayName: <string>grouped[firstGroupIndex].name,
                lineIndex: series.length,
                color: settings.series.fill.value.value,
                data: dataPoints,
                labelSettings: dataPointLabelSettings,
                width: settings.series.width.value,
                widthOfGap: 0
            });
        }

        xAxisCardProperties = Helpers.getCategoryAxisProperties(dataView.metadata);
        const valueAxisProperties = Helpers.getValueAxisProperties(dataView.metadata);

        const values = dataView.categorical.categories;

        // Convert to DataViewMetadataColumn
        const valuesMetadataArray: powerbiVisualsApi.DataViewMetadataColumn[] = [];
        if (values) {
            for (let i = 0; i < values.length; i++) {
                if (values[i] && values[i].source && values[i].source.displayName) {
                    valuesMetadataArray.push({ displayName: values[i].source.displayName });
                }
            }
        }

        const axesLabels = Visual.createAxesLabels(xAxisCardProperties, valueAxisProperties, timeStampColumn.source, valuesMetadataArray);
        const dots: DataPoint[] = Visual.getDataPointsFromSeries(series);

        this.behavior.applySelectionStateToData(dots);

        return {
            columns: columns,
            dots: dots,
            series: series,
            isScalar: isScalar,
            dataLabelsSettings: dataPointLabelSettings,
            axesLabels: { x: axesLabels.xAxisLabel, y: axesLabels.yAxisLabel },
            hasDynamicSeries: hasDynamicSeries,
            categoryMetadata: timeStampColumn.source,
            categories: categoryValues,
            settings: settings,
            grouped: grouped,
            hasHighlights: !!valuesColumn.highlights,
            widthOfXAxisLabel: Visual.DefaultXAxisLabelWidth,
            widthOfTooltipValueLabel: widthOfTooltipValueLabel,
            heightOfTooltipDescriptionTextLine: heightOfTooltipDescriptionTextLine,
            runnerCounterHeight: textMeasurementService.measureSvgTextHeight(
                Visual.GET_RUNNER_COUNTER_TEXT_PROPERTIES("lj", settings.runnerCounter.fontSize.value))
        };
    }

    private static createAxesLabels(categoryAxisProperties: DataViewObject,
        valueAxisProperties: DataViewObject,
        category: DataViewMetadataColumn,
        values: DataViewMetadataColumn[]) {
        let xAxisLabel = null;
        let yAxisLabel = null;

        if (categoryAxisProperties) {

            // Take the value only if it"s there
            if (category && category.displayName) {
                xAxisLabel = category.displayName;
            }
        }

        if (valueAxisProperties) {
            let valuesNames: string[] = [];

            if (values) {
                // Take the name from the values, and make it unique because there are sometimes duplications
                valuesNames = values.map(v => v ? v.displayName : "").filter((value, index, self) => value !== "" && self.indexOf(value) === index);
                yAxisLabel = valueFormatter.formatListAnd(valuesNames);
            }
        }
        return { xAxisLabel, yAxisLabel };
    }

    private static getDataPointsFromSeries(series: Series[]): DataPoint[] {
        const dataPointsArray: DataPoint[][] = series.map((d: Series): DataPoint[] => {
            return d.data.filter((d: DataPoint) => !!d.popupInfo);
        });
        return <DataPoint[]>flatten(dataPointsArray);
    }

    private static createAxisY(
        commonYScale: LinearScale,
        height: number,
        formatterOptions: ValueFormatterOptions): Axis<any> {

        const formatter = valueFormatter.create(formatterOptions);
        const ticks: number = Math.max(2, Math.round(height / 40));
        return axisRight(commonYScale)
            .scale(commonYScale)
            .ticks(ticks)
            .tickSizeOuter(0)
            .tickFormat(formatter.format);
    }

    private static createAxisX(
        isScalar: boolean,
        series: Series[],
        originalScale: GenericScale,
        formatterOptions: ValueFormatterOptions,
        dateFormat: XAxisDateFormat,
        position: XAxisPosition,
        widthOfXAxisLabel: number,
        locale: string): XAxisProperties[] {

        const scales = Visual.getXAxisScales(series, isScalar, originalScale);
        const xAxisProperties = [];
        xAxisProperties.length = scales.length;

        for (let i: number = 0, rotate = false; i < xAxisProperties.length; i++) {
            const values = Visual.getXAxisValuesToDisplay(<any>scales[i], rotate, isScalar, dateFormat, widthOfXAxisLabel);

            if (!rotate
                && position === XAxisPosition.Bottom
                && values.length < Visual.MinimumTicksToRotate) {
                const rotatedValues = Visual.getXAxisValuesToDisplay(<any>scales[i], true, isScalar, dateFormat, widthOfXAxisLabel);
                if (rotatedValues.length > values.length) {
                    rotate = true;
                    i = -1;
                    continue;
                }
            }

            xAxisProperties[i] = <XAxisProperties>{ values: values, scale: scales[i], rotate: rotate };
        }

        formatterOptions.tickCount = xAxisProperties.length && xAxisProperties.map(x => x.values.length).reduce((a, b) => a + b) * 5;
        formatterOptions.value = originalScale.domain()[0];
        formatterOptions.value2 = originalScale.domain()[1];
        formatterOptions.cultureSelector = locale;

        xAxisProperties.forEach((properties: XAxisProperties) => {
            const values: (Date | number)[] = properties.values.filter((value: Date | number) => value !== null);

            const formatter = valueFormatter.create(formatterOptions);
            properties.axis = axisBottom(properties.scale)
                .scale(properties.scale)
                .tickValues(values)
                .tickSizeOuter(0)
                .tickFormat(formatter.format);
        });

        return xAxisProperties;
    }

    private static getXAxisScales(
        series: Series[],
        isScalar: boolean,
        originalScale: any): GenericScale[] {
        return series.map((seriesElement: Series) => {
            const dataPoints: DataPoint[] = seriesElement.data,
                minValue: number | Date = dataPoints[0].categoryValue,
                maxValue: number | Date = dataPoints[dataPoints.length - 1].categoryValue,
                minX: number = originalScale(dataPoints[0].categoryValue),
                maxX: number = originalScale(dataPoints[dataPoints.length - 1].categoryValue);
            return Visual.createScale(isScalar, [minValue, maxValue], minX, maxX);
        });
    }

    private static getXAxisValuesToDisplay(
        scale: TimeScale | LinearScale,
        rotate: boolean,
        isScalar: boolean,
        dateFormat: XAxisDateFormat,
        widthOfXAxisLabel: number): (Date | number)[] {
        const genScale = <any>scale;

        const tickWidth = rotate
            ? Visual.XAxisTickHeight * (rotate ? Math.abs(Math.sin(Visual.AxisTickRotateAngle * Math.PI / 180)) : 0)
            : widthOfXAxisLabel;
        const tickSpace = Visual.XAxisTickSpace;

        if (scale.range()[1] < tickWidth) {
            return [];
        }

        const minValue = scale.invert(scale.range()[0] + tickWidth / 2);
        const maxValue = scale.invert(scale.range()[1] - tickWidth / 2);
        const width = scale.range()[1] - scale.range()[0];

        let maxTicks: number = Math.floor((width + tickSpace) / (tickWidth + tickSpace));
        if (rotate) {
            maxTicks = Math.min(Visual.MinimumTicksToRotate, maxTicks);
        }

        let values = [];
        if (isScalar) {
            values = d3Range(<any>minValue, <any>maxValue, (<any>maxValue - <any>minValue) / (maxTicks * 100));
        } else {
            values = (dateFormat === XAxisDateFormat.TimeOnly ? timeMinute : timeDay)
                .range(<any>minValue, <any>maxValue);
        }

        if (!values.length || last(values) < maxValue) {
            values.push(maxValue);
        }

        if (!maxTicks) {
            return [];
        }

        maxTicks = Math.min(values.length, maxTicks);
        const step = (values.length - 1) / (maxTicks - 1);
        const valuesIndexses: number[] = [];

        for (let i = 0; i < values.length - 1; i = i + step) {
            valuesIndexses.push(i);
        }
        valuesIndexses.push(values.length - 1);
        values = valuesIndexses.map(x => values[Math.round(x)]);

        for (let i = 1; i < values.length; i++) {
            const prevXValue = genScale(values[i - 1]);
            const curXValue = genScale(values[i]);
            if (curXValue - prevXValue < tickWidth + tickSpace / 3) {
                values.splice(i--, 1);
            }
        }

        return values;
    }

    private static getGroupIndex(index: number, grouped: DataViewValueColumnGroup[]): number {
        for (let i: number = 0; i < grouped.length; i++) {
            if (grouped[i].values && grouped[i].values[0] &&
                grouped[i].values[0].values[index] !== undefined &&
                grouped[i].values[0].values[index] !== null) {
                return i;
            }
        }

        return 0;
    }

    private static getGapWidths(values: Date[] | number[]): number[] {
        const result: number[] = [];
        for (let i: number = 0, prevVal: number = 0, length: number = values.length; i < length; i++) {
            if (!prevVal || !values[i]) {
                result.push(0);
            } else {
                result.push(<number>values[i] - prevVal);
            }

            prevVal = <number>values[i];
        }

        return result;
    }

    private static createScale(isScalar: boolean, domain: (number | Date)[], minX: number, maxX: number): LinearScale | TimeScale {
        if (isScalar) {
            return scaleLinear().domain(<any>domain).range([minX, maxX]);
        }

        return scaleTime().domain(<any>domain).range([minX, maxX]);
    }

    public data: ChartData;
    public margin: IMargin;
    public viewport: IViewport;
    public size: IViewport;
    public handleSelectionTimeout: number;
    private behavior: Behavior;
    private svg: Selection<any>;
    private chart: Selection<any>;
    private dots: Selection<any>;
    private yAxis: Selection<any>;
    private gaps: Selection<any>;
    private animationDot: Selection<any>;
    private lineX: Line;
    private animationHandler: Animator;
    private rootSelection: Selection<any>;
    private animationSelection: Selection<any>;
    private selectionManager: ISelectionManager;

    public host: IVisualHost;

    private localizationManager: ILocalizationManager;
    private formattingSettingsService: FormattingSettingsService;
    private colorHelper: ColorHelper;
    private tooltipService: ITooltipServiceWrapper;

    private visualSettings: PulseChartSettingsModel;
    private skipDoubleSelectionForCurrentPosition: boolean;

    public get runnerCounterPlaybackButtonsHeight(): number {
        return Math.max(Visual.PlaybackButtonsHeight, this.data && (this.data.runnerCounterHeight / 2 + 17));
    }

    public get popupHeight(): number {
        return this.data
            && this.data.settings
            && this.data.settings.popup
            && this.data.settings.popup.show.value
            && this.data.settings.popup.height.value || 0;
    }

    constructor(options: VisualConstructorOptions) {
        this.margin = Visual.DefaultMargin;
        this.host = options.host;
        this.localizationManager = this.host.createLocalizationManager();
        this.formattingSettingsService = new FormattingSettingsService(this.localizationManager);

        this.tooltipService = createTooltipServiceWrapper(
            this.host.tooltipService,
            options.element
        );

        const svg: Selection<any> = this.svg = d3Select(options.element)
            .append("svg")
            .classed("pulseChart", true);

        this.selectionManager = options.host.createSelectionManager();
        this.behavior = new Behavior(this.selectionManager);

        this.gaps = svg.append("g").classed(Visual.Gaps.className, true);
        this.yAxis = svg.append("g").classed(Visual.Y.className, true).classed(Visual.Axis.className, true);
        this.chart = svg.append("g").classed(Visual.Chart.className, true);
        this.dots = svg.append("g").classed(Visual.Dots.className, true);
        this.animationDot = this.dots
            .append("circle")
            .classed(Visual.AnimationDot.className, true)
            .style("display", "none");

        this.animationHandler = new Animator(this, svg);

        this.colorHelper = new ColorHelper(this.host.colorPalette);
    }

    public update(options: VisualUpdateOptions): void {
        this.host.eventService.renderingStarted(options);
        try {
            if (!options || !options.dataViews || !options.dataViews[0]) {
                return;
            }

            this.viewport = options.viewport;

            const dataView: DataView = options.dataViews[0];

            this.visualSettings = this.formattingSettingsService.populateFormattingSettingsModel(PulseChartSettingsModel, dataView);
            this.visualSettings.setLocalizedOptions(this.localizationManager);

            this.updateSettings();
            this.setHighContrastModeColors(this.colorHelper);


            const pulseChartData: ChartData = this.CONVERTER(
                dataView,
                this.host,
                this.visualSettings,
            );


            this.updateData(pulseChartData);

            if (!this.validateData(this.data)) {
                this.clearAll(true);
                return;
            }

            const width = this.getChartWidth();
            this.calculateXAxisProperties(width);

            const height = this.getChartHeight(this.data.settings.xAxis.show.value
                && this.data.series.some((series: Series) => series.xAxisProperties.rotate));

            this.calculateYAxisProperties(height);

            if (this.data.xScale.ticks(undefined).length < 2) {
                this.clearAll(true);
                return;
            }

            this.size = { width, height };

            this.updateElements();

            this.render();
            this.host.eventService.renderingFinished(options);
        } catch (ex) {
            this.host.eventService.renderingFailed(options, ex);
            console.error(ex);
        }
    }

    private updateData(data: ChartData): void {
        if (!this.data) {
            this.data = data;
            return;
        }

        const oldDataObj = this.getDataArrayToCompare(this.data);
        const newDataObj = this.getDataArrayToCompare(data);
        if (!isEqual(oldDataObj, newDataObj)) {
            this.clearAll(false);
        }

        this.data = data;
    }

    private renderTooltip(selection: Selection<any>): void {
        if (!this.tooltipService) {
            return;
        }

        this.tooltipService.addTooltip(
            selection,
            (data: DataPoint) => this.getTooltipData(data),
            (data: DataPoint) => data.identity
        );
    }

    private getTooltipData(value: any): VisualTooltipDataItem[] {
        return [{
            displayName: value.popupInfo.title,
            value: value.popupInfo.value,
        }];
    }

    private getDataArrayToCompare(data: ChartData): any[] {
        if (!data || !data.series) {
            return null;
        }

        const dataPoints: DataPoint[] = <DataPoint[]>flatten(data.series.map(x => x.data));
        return flatten(dataPoints.map(x => {
            return x && flatten([
                [
                    x.categoryValue,
                    x.eventSize,
                    x.groupIndex,
                    x.runnerCounterValue,
                    x.y,
                    x.seriesIndex
                ],
                x.popupInfo && [x.popupInfo.description, x.popupInfo.title, x.popupInfo.value]
            ]);
        }));
    }

    private validateData(data: ChartData): boolean {
        if (!data) {
            return false;
        }

        if (data.categories.some(x => !(x instanceof Date || isNumber(x)))) {
            return false;
        }

        return true;
    }

    private getChartWidth(): number {
        let marginRight: number = this.margin.right;
        if (this.data.settings.yAxis && this.data.settings.yAxis.show.value) {
            marginRight += Visual.MaxWidthOfYAxis;
        }

        const width: number = this.viewport.width - this.margin.left - marginRight;
        return Math.max(width, Visual.DefaultViewport.width);
    }

    private getChartHeight(xAxisRotated: boolean): number {
        let marginBottom = 10 + (xAxisRotated
            ? this.data.widthOfXAxisLabel * Math.abs(Math.sin(Visual.AxisTickRotateAngle * Math.PI / 180))
            : 3);

        if (!this.data.settings.popup.alwaysOnTop.value && this.popupHeight) {
            marginBottom = Math.max(this.margin.bottom + this.popupHeight, marginBottom);
        }

        const height: number = this.viewport.height
            - this.margin.top
            - this.runnerCounterPlaybackButtonsHeight
            - marginBottom
            - this.popupHeight;

        return Math.max(height, Visual.DefaultViewport.height);
    }

    private updateElements(): void {
        const chartMarginTop = this.margin.top + this.runnerCounterPlaybackButtonsHeight + this.popupHeight;
        this.svg.attr("width", this.viewport.width)
            .attr("height", this.viewport.height);
        this.svg.style("display", undefined);
        this.gaps.attr("transform", manipulation.translate(this.margin.left, chartMarginTop + (this.size.height / 2)));
        this.chart.attr("transform", manipulation.translate(this.margin.left, chartMarginTop));
        this.yAxis.attr("transform", manipulation.translate(this.size.width + this.margin.left, chartMarginTop));
        this.dots.attr("transform", manipulation.translate(this.margin.left, chartMarginTop));
    }

    public calculateXAxisProperties(width: number) {
        this.data.xScale = Visual.createScale(
            this.data.isScalar,
            [this.data.categories[0], this.data.categories[this.data.categories.length - 1]],
            0,
            width);

        const xAxisProperties: XAxisProperties[] = Visual.createAxisX(
            this.data.isScalar,
            this.data.series,
            <LinearScale>this.data.xScale,
            assign({}, this.data.settings.xAxis.formatterOptions),
            this.data.settings.xAxis.dateFormat,
            <XAxisPosition>this.data.settings.xAxis.position.value.value,
            this.data.widthOfXAxisLabel,
            this.host.locale);

        this.data.series.forEach((series: Series, index: number) => {
            series.xAxisProperties = xAxisProperties[index];
        });
    }

    public calculateYAxisProperties(height: number): void {
        this.data.yScales = this.getYAxisScales(height);

        let domain: number[] = [];
        this.data.yScales.forEach((scale: LinearScale) => domain = domain.concat(scale.domain()));
        this.data.commonYScale = <LinearScale>Visual.createScale(
            true,
            [d3Max(domain), d3Min(domain)],
            0,
            height);

        this.data.yAxis = Visual.createAxisY(this.data.commonYScale, height, this.data.settings.yAxis.formatterOptions);
    }

    private getYAxisScales(height: number): LinearScale[] {
        const data: ChartData = this.data,
            stepOfHeight: number = height / data.grouped.length;

        return <LinearScale[]>data.grouped.map((group: DataViewValueColumnGroup, index: number) => {
            const values: number[] = group.values[0].values.map(x => <number>x || 0);

            let minValue: number = Number.MAX_VALUE,
                maxValue: number = -Number.MAX_VALUE;

            values.forEach((value: number) => {
                if (value < minValue) {
                    minValue = value;
                }

                if (value > maxValue) {
                    maxValue = value;
                }
            });
            if (maxValue === minValue) {
                const offset = maxValue === 0 ? 1 : Math.abs(maxValue / 2);
                maxValue += offset;
                minValue -= offset;
            }

            return Visual.createScale(true, [maxValue, minValue], stepOfHeight * index, stepOfHeight * (index + 1));
        });
    }

    public get autoplayPauseDuration(): number {
        return 1000 * this.data.settings.playback.autoplayPauseDuration.value;
    }

    public get isAutoPlay(): boolean {
        return this.data &&
            this.data.settings &&
            this.data.settings.playback &&
            this.data.settings.playback.autoplay.value;
    }

    public get isRepeat(): boolean {
        return this.data &&
            this.data.settings &&
            this.data.settings.playback &&
            this.data.settings.playback.repeat.value;
    }

    public render() {
        const data = this.data;

        const xScale: LinearScale = <LinearScale>data.xScale,
            yScales: LinearScale[] = <LinearScale[]>data.yScales;

        this.lineX = d3Line<DataPoint>()
            .x((d: DataPoint) => {
                return xScale(d.categoryValue);
            })
            .y((d: DataPoint) => {
                return yScales[d.groupIndex](d.y);
            });

        if (this.data &&
            this.data.settings &&
            this.data.settings.playback &&
            this.data.settings.playback.color) {
            this.animationHandler.setControlsColor(this.data.settings.playback.color.value.value);
        }
        this.animationHandler.render();
        this.animationHandler.setRunnerCounterValue();

        this.renderAxes(data);
        this.renderGaps(data);
    }

    private renderAxes(data: ChartData): void {
        this.renderXAxis(data);
        this.renderYAxis(data);
    }

    private renderXAxis(data: ChartData): void {
        let axisNodeSelection: Selection<any>,
            axisNodeUpdateSelection: Selection<any>,
            axisBoxUpdateSelection: Selection<any>,
            color: string = data.settings.xAxis.color.value.value,
            fontColor: string = data.settings.xAxis.fontColor.value.value;

        axisNodeSelection = this.chart
            .select(Visual.LineNode.selectorName)
            .selectAll(Visual.XAxisNode.selectorName);

        axisNodeSelection.selectAll("*").remove();
        axisNodeUpdateSelection = axisNodeSelection.data(data.series);

        const axisNodeUpdateSelectionMerged = axisNodeUpdateSelection
            .enter()
            .insert("g", `g.${Visual.LineContainer.className}`)
            .merge(axisNodeUpdateSelection);
        axisNodeUpdateSelectionMerged.classed(Visual.XAxisNode.className, true);

        axisNodeUpdateSelectionMerged
            .each(function (series: Series) {
                d3Select(this).call(series.xAxisProperties.axis);
            });
        axisBoxUpdateSelection = axisNodeUpdateSelectionMerged
            .selectAll(".tick")
            .selectAll(".axisBox")
            .data([[]]);

        const axisBoxUpdateSelectionMerged = axisBoxUpdateSelection
            .enter()
            .insert("rect", "text")
            .merge(axisBoxUpdateSelection);

        axisBoxUpdateSelectionMerged
            .style("display", this.data.settings.xAxis.position.value.value === XAxisPosition.Center ? "inherit" : "none")
            .style("fill", this.data.settings.xAxis.backgroundColor.value.value);
        const tickRectY = this.data.settings.xAxis.position.value.value === XAxisPosition.Center ? -11 : 0;
        axisBoxUpdateSelectionMerged.attr("x", -(this.data.widthOfXAxisLabel / 2))
            .attr("y", tickRectY + "px")
            .attr("width", this.data.widthOfXAxisLabel)
            .attr("height", Visual.XAxisTickHeight + "px");

        axisBoxUpdateSelectionMerged
            .exit()
            .remove();

        axisNodeUpdateSelectionMerged
            .style("stroke", this.data.settings.xAxis.position.value.value === XAxisPosition.Center ? color : "none")
            .style("display", this.data.settings.xAxis.show.value ? "inherit" : "none");

        axisNodeUpdateSelectionMerged.call(selection => {
            const rotate = selection.datum().xAxisProperties.rotate;
            const rotateCoeff = rotate ? Math.abs(Math.sin(Visual.AxisTickRotateAngle * Math.PI / 180)) : 0;
            const dy = tickRectY + 3;
            selection.selectAll("text")
                .attr("transform", function (): string {
                    const node = <SVGTextElement>this;
                    return `translate(0, ${(dy + 9 + node.getBoundingClientRect().width * rotateCoeff)}) rotate(${rotate ? Visual.AxisTickRotateAngle : 0})`;
                })
                .style("fill", fontColor)
                .style("stroke", "none")
                .attr("dy", -9);
        });

        axisNodeUpdateSelectionMerged.selectAll(".domain")
            .each(function () {
                const node = <Node>this;
                node.parentNode.insertBefore(node, node.parentNode.firstChild);
            })
            .style("stroke", color);

        let xAxisTop: number = this.size.height;
        switch (this.data.settings.xAxis.position.value.value) {
            case XAxisPosition.Center:
                xAxisTop = xAxisTop / 2;
                break;
            case XAxisPosition.Bottom:
                break;
        }

        axisNodeUpdateSelectionMerged.attr("transform", manipulation.translate(0, xAxisTop));
    }

    private renderYAxis(data: ChartData): void {
        let yAxis: Axis<any> = data.yAxis,
            isShow: boolean = false,
            color: string = data.settings.yAxis.color.value.value,
            fontColor: string = data.settings.yAxis.fontColor.value.value;

        if (this.data &&
            this.data.settings &&
            this.data.settings.yAxis &&
            this.data.settings.yAxis.show.value) {
            isShow = true;
        }

        if (this.data &&
            this.data.settings &&
            this.data.settings.yAxis &&
            this.data.settings.yAxis) {
            color = this.data.settings.yAxis.color.value.value;
            fontColor = this.data.settings.yAxis.fontColor.value.value;
        }

        this.yAxis
            .call(yAxis)
            .attr("display", isShow ? "inline" : "none");

        this.yAxis.selectAll(".domain, path, line").style("stroke", color);
        this.yAxis.selectAll("text").style("fill", fontColor);
        this.yAxis.selectAll("g.tick line")
            .attr("x1", -this.size.width);
    }

    public renderChart(): void {
        if (!this.data) {
            return;
        }
        const data: ChartData = this.data,
            series: Series[] = this.data.series;

        this.rootSelection = this.chart
            .selectAll(Visual.LineNode.selectorName)
            .data(series);

        this.rootSelection
            .exit()
            .remove();

        this.rootSelection = this.rootSelection
            .enter()
            .append("g")
            .merge(this.rootSelection);

        const lineNode: Selection<any> = this.rootSelection;

        lineNode.classed(Visual.LineNode.className, true);

        lineNode
            .append("g")
            .classed(Visual.LineContainer.className, true);
        lineNode
            .append("g")
            .classed(Visual.TooltipContainer.className, true);
        lineNode
            .append("g")
            .classed(Visual.DotsContainer.className, true);

        if (this.animationHandler.isAnimated) {
            this.showAnimationDot();
        } else {
            this.hideAnimationDot();
        }
        this.drawLines();
        this.drawDots(data);
        this.drawTooltips(data);
    }

    private drawLinesStatic(limit: number, isAnimated: boolean): void {
        const rootSelection: Selection<any> = this.rootSelection;

        const selection: Selection<any> = rootSelection
            .filter((d, index) => !isAnimated || index < limit)
            .select(Visual.LineContainer.selectorName)
            .selectAll(Visual.Line.selectorName).data(d => [d]);

        const selectionMerged = selection
            .enter()
            .append("path")
            .merge(selection);

        selectionMerged.classed(Visual.Line.className, true);

        selectionMerged
            .style("fill", "none")
            .style("stroke", (d: Series) => d.color)
            .style("stroke-width", (d: Series) => `${d.width}px`);

        selectionMerged.attr("d", d => this.lineX(d.data));
        selection
            .exit()
            .remove();
    }

    private drawLinesStaticBeforeAnimation(limit: number) {
        const node: ClassAndSelector = Visual.Line,
            nodeParent: ClassAndSelector = Visual.LineContainer,
            rootSelection: Selection<any> = this.rootSelection;

        this.animationSelection = rootSelection.filter((d, index) => {
            return index === limit;
        }).select(nodeParent.selectorName).selectAll(node.selectorName).data((d: Series) => [d]);

        const animationSelectionMerged = this.animationSelection
            .enter()
            .append("path")
            .merge(this.animationSelection);
        animationSelectionMerged.classed(node.className, true);

        animationSelectionMerged
            .style("fill", "none")
            .style("stroke", (d: Series) => d.color)
            .style("stroke-width", (d: Series) => `${d.width}px`);

        animationSelectionMerged
            .attr("d", (d: Series) => {
                const flooredStart = this.animationHandler.flooredPosition.index;

                if (flooredStart === 0) {
                    this.moveAnimationDot(d.data[0]);
                    return this.lineX([]);
                } else {
                    const dataReduced: DataPoint[] = d.data.slice(0, flooredStart + 1);
                    this.moveAnimationDot(dataReduced[dataReduced.length - 1]);
                    return this.lineX(dataReduced);
                }
            });

        this.animationSelection
            .exit()
            .remove();
    }

    private moveAnimationDot(d: DataPoint) {
        const xScale: LinearScale = <LinearScale>this.data.xScale,
            yScales: LinearScale[] = <LinearScale[]>this.data.yScales;

        this.animationDot
            .attr("cx", xScale(d.x))
            .attr("cy", yScales[d.groupIndex](d.y));
    }

    public playAnimation(delay: number = 0): void {
        const flooredStart: number = this.animationHandler.flooredPosition.index;
        this.onClearSelection();

        const currentPosition: AnimationPosition = this.animationHandler.flooredPosition;

        if (this.skipDoubleSelectionForCurrentPosition) {
            this.skipDoubleSelectionForCurrentPosition = false;

        } else if (this.checkTooltipForSelection(currentPosition)) {

            this.skipDoubleSelectionForCurrentPosition = true;
            this.handleSelection(currentPosition);
            this.continueAnimation(currentPosition);
            return;
        }

        this.showAnimationDot();
        this.animationSelection
            .transition()
            .delay(delay)
            .duration(this.animationDuration)
            .ease(easeLinear)
            .attrTween("d", (d: Series) => this.getInterpolation(d.data, flooredStart))
            .on("end", () => {
                const position: AnimationPosition = this.animationHandler.flooredPosition;
                this.handleSelection(position);
                this.continueAnimation(position);
            });
    }

    public pauseAnimation(): void {
        if (!this.animationSelection) {
            return;
        }

        this.hideAnimationDot();
        this.animationSelection.selectAll("path").transition();

        this.animationSelection
            .transition()
            .duration(0)
            .delay(0);
    }

    public stopAnimation() {
        this.pauseAnimation();
        timerFlush();
    }

    public findNextPoint(position: AnimationPosition): AnimationPosition {
        for (let i: number = position.series; i < this.data.series.length; i++) {
            const series: Series = this.data.series[i];

            for (let j: number = (i === position.series) ? Math.floor(position.index + 1) : 0; j < series.data.length; j++) {
                if (series.data[j] && series.data[j].popupInfo) {
                    return {
                        series: i,
                        index: j
                    };
                }
            }
        }

        return null;
    }

    public findPrevPoint(position: AnimationPosition): AnimationPosition {
        for (let i: number = position.series; i >= 0; i--) {
            const series: Series = this.data.series[i];

            for (let j: number = (i === position.series) ? Math.ceil(position.index - 1) : series.data.length; j >= 0; j--) {
                if (series.data[j] && series.data[j].popupInfo) {
                    return {
                        series: i,
                        index: j
                    };
                }
            }
        }

        return null;
    }

    public isAnimationSeriesAndIndexLast(position: AnimationPosition): boolean {
        return this.isAnimationSeriesLast(position) && this.isAnimationIndexLast(position);
    }

    public isAnimationSeriesLast(position: AnimationPosition): boolean {
        return (position.series >= (this.data.series.length - 1));
    }

    public isAnimationIndexLast(position: AnimationPosition): boolean {
        const index: number = position.index;
        const series: Series = this.data.series[position.series];
        return index >= (series.data.length - 1);
    }

    private drawLines(): void {
        const positionSeries: number = this.animationHandler.position.series,
            isAnimated: boolean = this.animationHandler.isAnimated;

        this.drawLinesStatic(positionSeries, isAnimated);

        if (isAnimated) {
            this.drawLinesStaticBeforeAnimation(positionSeries);
        }
    }

    private showAnimationDot(): void {
        if (!this.animationHandler.isPlaying) {
            return;
        }
        const size: number = this.data.settings.dots.size.value;

        this.animationDot
            .style("display", "inline")
            .style("fill", this.data.settings.dots.color.value.value)
            .attr("r", size);
    }

    private hideAnimationDot(): void {
        this.animationDot.style("display", "none");
    }

    private getInterpolation(data: DataPoint[], start: number): any {
        if (!this.data) {
            return;
        }

        const xScale: LinearScale = <LinearScale>this.data.xScale,
            yScales: LinearScale[] = <LinearScale[]>this.data.yScales;
        const stop: number = start + 1;

        this.showAnimationDot();

        const lineFunction: Line = d3Line<DataPoint>()
            .x((d: DataPoint) => d.x)
            .y((d: DataPoint) => d.y)
            .curve(curveLinear);

        const interpolatedLine = data.slice(0, start + 1).map((d: DataPoint): PointXY => {
            return {
                x: xScale(d.x),
                y: yScales[d.groupIndex](d.y)
            };
        });

        const x0: number = xScale(data[start].x);
        const x1: number = xScale(data[stop].x);

        const y0: number = yScales[data[start].groupIndex](data[start].y);
        const y1: number = yScales[data[stop].groupIndex](data[stop].y);

        const interpolateIndex: LinearScale = scaleLinear()
            .domain([0, 1])
            .range([start, stop]);

        const interpolateX: LinearScale = scaleLinear()
            .domain([0, 1])
            .range([x0, x1]);

        const interpolateY: LinearScale = scaleLinear()
            .domain([0, 1])
            .range([y0, y1]);

        this.animationHandler.setRunnerCounterValue(start);

        return (t: number) => {
            if (!this.animationHandler.isPlaying) {
                return lineFunction(<DataPoint[]>interpolatedLine);
            }

            const x: number = interpolateX(t);
            const y: number = interpolateY(t);

            this.animationDot
                .attr("cx", x)
                .attr("cy", y);

            interpolatedLine.push({ "x": x, "y": y });
            this.animationHandler.position.index = interpolateIndex(t);
            return lineFunction(<DataPoint[]>interpolatedLine);
        };
    }

    public onClearSelection(): void {
        this.behavior.clearSelection();
        this.chart.selectAll(Visual.Tooltip.selectorName).remove();
    }

    public getDatapointFromPosition(position: AnimationPosition): DataPoint {
        if (!this.data ||
            !this.data.series ||
            !this.data.series[position.series] ||
            !this.data.series[position.series].data ||
            !this.data.series[position.series].data[position.index]) {
            return null;
        }
        return this.data.series[position.series].data[position.index];
    }

    public handleSelection(position: AnimationPosition): boolean {
        if (!position) {
            return false;
        }

        const dataPoint: DataPoint = this.getDatapointFromPosition(position);
        if (dataPoint && dataPoint.popupInfo) {
            this.behavior.setSelection(dataPoint);
        }
    }

    private checkTooltipForSelection(position: AnimationPosition) {
        if (!position) {
            return false;
        } else if (!this.visualSettings || !this.visualSettings.gaps || !this.visualSettings.gaps.show.value) {
            return false;
        }

        const dataPoint: DataPoint = this.getDatapointFromPosition(position);
        return dataPoint && dataPoint.popupInfo;
    }

    private continueAnimation(position: AnimationPosition): void {
        if (!this.data) {
            return;
        }

        const dataPoint: DataPoint = this.getDatapointFromPosition(position);
        const animationPlayingIndex: number = this.animationHandler.animationPlayingIndex;
        const isLastDataPoint: boolean = this.animationHandler.isPlaying && this.isAnimationSeriesAndIndexLast(position);
        if ((!dataPoint || !dataPoint.popupInfo) && (this.animationHandler.isPlaying)) {
            if (isLastDataPoint && !this.isRepeat) {
                setTimeout(() => this.animationHandler.toEnd(), 0);
            } else {
                this.animationHandler.play(0, true);
            }
            return;
        }

        if (isLastDataPoint) {
            setTimeout(() => this.animationHandler.toEnd(), 0);
        } else {
            this.animationHandler.pause();
        }

        clearTimeout(this.handleSelectionTimeout);
        this.handleSelectionTimeout = <any>setTimeout(() => {
            if (this.animationHandler.animationPlayingIndex !== animationPlayingIndex) {
                return;
            }

            if (isLastDataPoint || this.animationHandler.isPaused) {
                this.onClearSelection();
            }

            if (!isLastDataPoint && this.animationHandler.isPaused) {
                this.animationHandler.play();
            }
        }, this.pauseDuration);
    }

    private get animationDuration(): number {
        return 1000 / this.data.settings.playback.playSpeed.value;
    }

    private get pauseDuration(): number {
        return 1000 * this.data.settings.playback.pauseDuration.value;
    }

    private get dotOpacity(): number {
        return 1 - (this.data.settings.dots.transparency.value / 100);
    }

    private drawDots(data: ChartData): void {
        if (!data || !data.xScale) {
            return;
        }

        const xScale: LinearScale = <LinearScale>data.xScale,
            yScales: LinearScale[] = <LinearScale[]>data.yScales,
            node: ClassAndSelector = Visual.Dot,
            nodeParent: ClassAndSelector = Visual.DotsContainer,
            rootSelection: Selection<any> = this.rootSelection,
            dotColor: string = this.data.settings.dots.color.value.value,
            dotSize: number = this.data.settings.dots.size.value,
            isAnimated: boolean = this.animationHandler.isAnimated,
            position: AnimationPosition = this.animationHandler.position,
            hasSelection: boolean = this.behavior.hasSelection,
            hasHighlights: boolean = this.data.hasHighlights;

        const selection: Selection<any> = rootSelection.filter((d, index) => !isAnimated || index <= position.series)
            .select(nodeParent.selectorName)
            .selectAll(node.selectorName)
            .data((d: Series, seriesIndex: number) => {
                return filter(d.data, (value: DataPoint, valueIndex: number): boolean => {
                    if (isAnimated && (seriesIndex === position.series) && (valueIndex > position.index)) {
                        return false;
                    }
                    return (!!value.popupInfo);
                });
            });

        const selectionMerged = selection
            .enter()
            .append("circle")
            .merge(selection);

        selectionMerged
            .classed(node.className, true)
            .attr("focusable", true)
            .attr("tabindex", 0);

        selectionMerged
            .attr("cx", (d: DataPoint) => xScale(d.categoryValue))
            .attr("cy", (d: DataPoint) => yScales[d.groupIndex](d.y))
            .attr("r", (d: DataPoint) => d.eventSize || dotSize)
            .style("fill", dotColor)
            .style("opacity", (d: DataPoint) => {
                const isSelected: boolean = pulseChartUtils.getFillOpacity(d.selected, d.highlight, !d.highlight && hasSelection, !d.selected && hasHighlights) === 1;
                return isSelected ? this.dotOpacity : this.dotOpacity / 2;
            })
            .style("cursor", "pointer");

        selection
            .exit()
            .remove();

        const behaviorOptions: BehaviorOptions = {
            dataPoints: this.data.dots,
            selection: selectionMerged,
            clearCatcher: this.svg,
            hasHighlights: this.data.hasHighlights,
            onSelectCallback: () => this.renderChart(),
        };
        this.behavior.bindEvents(behaviorOptions);

        this.renderTooltip(selectionMerged);
    }

    private renderGaps(data: ChartData): void {
        let gaps: IRect[],
            gapsSelection: Selection<any>,
            gapsSelectionMerged: Selection<any>,
            gapNodeSelection: Selection<any>,
            series: Series[] = data.series,
            isScalar: boolean = data.isScalar,
            xScale: LinearScale = <LinearScale>data.xScale;

        gaps = [{
            left: -4.5,
            top: -5,
            height: 10,
            width: 3
        }, {
            left: 1.5,
            top: -5,
            height: 10,
            width: 3
        }];

        gapsSelection = this.gaps.selectAll(Visual.Gap.selectorName)
            .data(series.slice(0, series.length - 1));

        gapsSelectionMerged = gapsSelection
            .enter()
            .append("g")
            .merge(gapsSelection);

        gapsSelectionMerged.classed(Visual.Gap.className, true);

        gapsSelectionMerged
            .attr("transform", (seriesElement: Series) => {
                let x: number,
                    middleOfGap: number = seriesElement.widthOfGap / 2,
                    categoryValue: number | Date = seriesElement.data[seriesElement.data.length - 1].categoryValue;

                if (isScalar) {
                    x = xScale(middleOfGap + <number>categoryValue);
                } else {
                    x = xScale(<any>(new Date(middleOfGap + ((<Date>categoryValue).getTime()))));
                }

                return SVGUtil.manipulation.translate(x, 0);
            });

        gapNodeSelection = gapsSelectionMerged
            .selectAll(Visual.GapNode.selectorName)
            .data(gaps);

        const gapNodeSelectionMerged = gapNodeSelection
            .enter()
            .append("rect")
            .merge(gapNodeSelection);

        gapNodeSelectionMerged
            .attr(
                "x", (gap: IRect) => gap.left
            )
            .attr(
                "y", (gap: IRect) => gap.top,
            )
            .attr(
                "height", (gap: IRect) => gap.height
            )
            .attr(
                "width", (gap: IRect) => gap.width
            )
            .classed(Visual.GapNode.className, true);

        gapNodeSelectionMerged.style("fill", data.settings.xAxis.color.value.value);


        gapsSelection
            .exit()
            .remove();

        gapNodeSelection
            .exit()
            .remove();
    }

    public isPopupShow(d: DataPoint): boolean {
        if (!this.popupHeight || !d || !d.popupInfo || (this.animationIsPlaying() && !d.selected)) {
            return false;
        }
        return d.selected;
    }

    public animationIsPlaying(): boolean {
        return this.animationHandler.isPlaying;
    }

    // eslint-disable-next-line max-lines-per-function
    private drawTooltips(data: ChartData): void {
        const xScale: LinearScale = <LinearScale>data.xScale,
            yScales: LinearScale[] = <LinearScale[]>data.yScales,
            node: ClassAndSelector = Visual.Tooltip,
            nodeParent: ClassAndSelector = Visual.TooltipContainer,
            width: number = this.data.settings.popup.width.value,
            height: number = this.data.settings.popup.height.value,
            marginTop: number = Visual.DefaultTooltipSettings.marginTop,
            showTimeDisplayProperty: string = this.data.settings.popup.showTime.value ? "inherit" : "none",
            showTitleDisplayProperty: string = this.data.settings.popup.showTitle.value ? "inherit" : "none";

        const rootSelection: Selection<any> = this.rootSelection;

        const line: Line = d3Line<PointXY>()
            .x((d: PointXY) => d.x)
            .y((d: PointXY) => {
                return d.y;
            });

        const tooltipShiftY = (y: number, groupIndex: number): number => {
            return this.isHigherMiddle(y, groupIndex) ? (-1 * marginTop + Visual.topShift) : this.size.height + marginTop;
        };

        const tooltipRoot: Selection<any> = rootSelection.select(nodeParent.selectorName).selectAll(node.selectorName)
            .data(d => {
                return filter(d.data, (value: DataPoint) => this.isPopupShow(value));
            });

        const tooltipRootMerged = tooltipRoot
            .enter()
            .append("g")
            .merge(tooltipRoot);
        tooltipRootMerged.classed(node.className, true);

        tooltipRootMerged
            .attr("transform", (d: DataPoint) => {
                const x: number = xScale(d.x) - width / 2;
                const y: number = tooltipShiftY(d.y, d.groupIndex);
                d.popupInfo.offsetX = Math.min(this.viewport.width - this.margin.right - width, Math.max(-this.margin.left, x)) - x;
                return manipulation.translate(x + d.popupInfo.offsetX, y);
            });

        const tooltipRect: Selection<any> = tooltipRootMerged.selectAll(Visual.TooltipRect.selectorName).data(d => [d]);   
        const tooltipRectMerged = tooltipRect
            .enter()
            .append("path")
            .merge(tooltipRect);
        tooltipRectMerged
            .classed(Visual.TooltipRect.className, true)
            .attr("display", (d: DataPoint) => d.popupInfo ? "inherit" : "none")
            .style("fill", this.data.settings.popup.color.value.value)
            .style("stroke", this.data.settings.popup.strokeColor.value.value)
            .attr("d", (d: DataPoint) => {
                const firstPoint: PointXY = {
                    "x": -2,
                    "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * marginTop) : 0,
                };

                const points: PointXY[] = [
                    firstPoint,
                    {
                        "x": -2,
                        "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * (marginTop + height)) : height,
                    },
                    {
                        "x": width - 2,
                        "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * (marginTop + height)) : height,
                    },
                    {
                        "x": width - 2,
                        "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * marginTop) : 0,
                    },
                    firstPoint,
                ];

                return line(points);
            });

        const tooltipTriangle: Selection<any> = tooltipRootMerged.selectAll(Visual.TooltipTriangle.selectorName).data(d => [d]);
        const tooltipTriangleMerged = tooltipTriangle
            .enter()
            .append("path")
            .merge(tooltipTriangle);
        tooltipTriangleMerged.classed(Visual.TooltipTriangle.className, true);
        tooltipTriangleMerged
            .style("fill", this.data.settings.popup.color.value.value)
            .style("stroke", this.data.settings.popup.strokeColor.value.value)
            .attr("d", (d: DataPoint) => {
                const path = [
                    {
                        "x": width / 2 - 5 - d.popupInfo.offsetX,
                        "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * marginTop) : 0,
                    },
                    {
                        "x": width / 2 - d.popupInfo.offsetX,
                        "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * (marginTop - 5)) : -5,
                    },
                    {
                        "x": width / 2 + 5 - d.popupInfo.offsetX,
                        "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * marginTop) : 0,
                    },
                ];
                return line(<DataPoint[]>path);
            })
            .style("stroke-width", "1px");

        const tooltipLine: Selection<any> = tooltipRootMerged.selectAll(Visual.TooltipLine.selectorName).data(d => [d]);
        const tooltipLineMerged = tooltipLine.enter().append("path").merge(tooltipLine);
        tooltipLineMerged.classed(Visual.TooltipLine.className, true);
        tooltipLineMerged
            .style("fill", this.data.settings.popup.color.value.value)
            .style("stroke", this.data.settings.popup.strokeColor.value.value || this.data.settings.popup.color.value.value)
            .style("stroke-width", "1px")
            .attr("d", (d: DataPoint) => {
                const path = [
                    {
                        "x": width / 2 - d.popupInfo.offsetX,
                        "y": this.isHigherMiddle(d.y, d.groupIndex) ?
                            yScales[d.groupIndex](d.y) + tooltipShiftY(d.y, d.groupIndex) - d.eventSize :
                            yScales[d.groupIndex](d.y) - tooltipShiftY(d.y, d.groupIndex) + d.eventSize,
                    },
                    {
                        "x": width / 2 - d.popupInfo.offsetX,
                        "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * marginTop) : 0, // end
                    }];
                return line(<DataPoint[]>path);
            });

        const timeRect: Selection<any> = tooltipRootMerged.selectAll(Visual.TooltipTimeRect.selectorName).data(d => [d]);
        const timeRectMerged = timeRect.enter().append("path").merge(timeRect);
        timeRectMerged.classed(Visual.TooltipTimeRect.className, true);
        timeRectMerged
            .style("fill", this.data.settings.popup.timeFill.value.value)
            .style("stroke", this.data.settings.popup.strokeColor.value.value)
            .style("display", showTimeDisplayProperty)
            .attr("d", (d: DataPoint) => {
                const path = [
                    {
                        "x": width - this.data.widthOfTooltipValueLabel - 2,
                        "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * (marginTop + height)) : 0,
                    },
                    {
                        "x": width - this.data.widthOfTooltipValueLabel - 2,
                        "y": this.isHigherMiddle(d.y, d.groupIndex)
                            ? (-1 * (marginTop + height - Visual.DefaultTooltipSettings.timeHeight))
                            : Visual.DefaultTooltipSettings.timeHeight,
                    },
                    {
                        "x": width - 2,
                        "y": this.isHigherMiddle(d.y, d.groupIndex)
                            ? (-1 * (marginTop + height - Visual.DefaultTooltipSettings.timeHeight))
                            : Visual.DefaultTooltipSettings.timeHeight,
                    },
                    {
                        "x": width - 2,
                        "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * (marginTop + height)) : 0,
                    }
                ];
                return line(<DataPoint[]>path);
            });

        const time: Selection<any> = tooltipRootMerged.selectAll(Visual.TooltipTime.selectorName).data(d => [d]);
        const timeMerged = time.enter().append("text").merge(time);
        timeMerged.classed(Visual.TooltipTime.className, true);
        const timeFontStyles = Visual.CONVERT_TEXT_PROPERTIES_TO_STYLE(Visual.getPopupValueTextProperties());
        Visual.APPLY_TEXT_FONT_STYLES(timeMerged, timeFontStyles);

        timeMerged
            .style("display", showTimeDisplayProperty)
            .style("fill", this.data.settings.popup.timeColor.value.value)
            .attr("x", () => width - this.data.widthOfTooltipValueLabel)
            .attr("y", (d: DataPoint) => this.isHigherMiddle(d.y, d.groupIndex)
                ? (-1 * (marginTop + height - Visual.DefaultTooltipSettings.timeHeight + 3))
                : Visual.DefaultTooltipSettings.timeHeight - 3)
            .text((d: DataPoint) => textMeasurementService.getTailoredTextOrDefault(Visual.getPopupValueTextProperties(d.popupInfo.value.toString()), this.data.widthOfTooltipValueLabel));

        const title: Selection<any> = tooltipRootMerged.selectAll(Visual.TooltipTitle.selectorName).data(d => [d]);
        const titleMerged = title.enter().append("text").merge(title);
        titleMerged
            .classed(Visual.TooltipTitle.className, true);

        const titleFontStyles = Visual.CONVERT_TEXT_PROPERTIES_TO_STYLE(Visual.getPopupTitleTextProperties());
        Visual.APPLY_TEXT_FONT_STYLES(titleMerged, titleFontStyles);

        titleMerged
            .style("display", showTitleDisplayProperty)
            .style("fill", this.data.settings.popup.fontColor.value.value)
            .attr("x", () => Visual.PopupTextPadding)
            .attr("y", (d: DataPoint) =>
                (this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * (marginTop + height - 12)) : 12) + Visual.PopupTextPadding)
            .text((d: DataPoint) => {
                if (!d.popupInfo) {
                    return "";
                }
                const maxWidth = width - Visual.PopupTextPadding * 2 -
                    (this.data.settings.popup.showTime ? (this.data.widthOfTooltipValueLabel - Visual.PopupTextPadding) : 0) - 10;
                return textMeasurementService.getTailoredTextOrDefault(Visual.getPopupTitleTextProperties(d.popupInfo.title), maxWidth);
            });

        const getDescriptionDimenstions = (d: DataPoint): ElementDimensions => {
            let shiftY: number = Visual.PopupTextPadding + this.data.settings.popup.fontSize.value;

            let descriptionYOffset: number = shiftY + Visual.DefaultTooltipSettings.timeHeight;
            if (d.popupInfo) {
                shiftY = ((showTitleDisplayProperty && d.popupInfo.title) || (showTimeDisplayProperty && d.popupInfo.value)) ? descriptionYOffset : shiftY;
            }

            return {
                y: this.isHigherMiddle(d.y, d.groupIndex)
                    ? (-1 * (marginTop + height - shiftY))
                    : shiftY,
                x: Visual.PopupTextPadding,
                width: width - Visual.PopupTextPadding * 2,
                height: height - shiftY,
            };
        };

        const description: Selection<any> = tooltipRootMerged.selectAll(Visual.TooltipDescription.selectorName).data(d => [d]);
        const descriptionMerged = description.enter().append("text").merge(description);
        descriptionMerged.classed(Visual.TooltipDescription.className, true);
        const descriptionFontStyles = Visual.CONVERT_TEXT_PROPERTIES_TO_STYLE(Visual.getPopupDescriptionTextProperties(null, this.data.settings.popup.fontSize.value));
        Visual.APPLY_TEXT_FONT_STYLES(descriptionMerged, descriptionFontStyles);

        descriptionMerged
            .style("fill", this.data.settings.popup.fontColor.value.value)
            .text((d: DataPoint) => d.popupInfo && d.popupInfo.description)
            .each(function () {
                const node = <SVGTextElement>this;
                const allowedWidth = width - 2 - Visual.PopupTextPadding * 2;
                const allowedHeight = height - Visual.DefaultTooltipSettings.timeHeight - Visual.PopupTextPadding * 2;
                textMeasurementService.wordBreak(node, allowedWidth, allowedHeight);
            })
            .attr("transform", (d: DataPoint) => {
                const descriptionDimenstions: ElementDimensions = getDescriptionDimenstions(d);
                return manipulation.translate(0, descriptionDimenstions.y);
            });
        descriptionMerged.selectAll("tspan").attr("x", Visual.PopupTextPadding);

        tooltipRect
            .exit()
            .remove();

        tooltipRoot
            .exit()
            .remove();
    }

    private isHigherMiddle(value: number, groupIndex: number): boolean {
        if (this.data.settings.popup.alwaysOnTop.value) {
            return true;
        }

        if (this.data.yScales.length > 1) {
            return groupIndex === 0;
        }

        let domain: number[] = this.data.commonYScale.domain(),
            minValue: number = d3Min(domain),
            middleValue = Math.abs((d3Max(domain) - minValue) / 2);

        middleValue = middleValue === 0
            ? middleValue
            : minValue + middleValue;

        return value >= middleValue;
    }

    private clearAll(hide: boolean): void {
        this.gaps.selectAll(Visual.Gap.selectorName).remove();

        if (this.animationHandler) {
            this.animationHandler.reset();
            this.animationHandler.clear();
        }

        if (hide) {
            this.svg.style("display", "none");
        }

        this.clearChart();
    }
    public clearChart(): void {
        this.onClearSelection();
        this.hideAnimationDot();
        this.chart.selectAll(Visual.Line.selectorName).remove();
        this.chart.selectAll(Visual.Dot.selectorName).remove();
    }

    private updateSettings(): void {
        // if (typeof this.visualSettings.popup.fontSize.value === "string") {
        //     this.visualSettings.popup.fontSize.value = parseInt(this.visualSettings.popup.fontSize.value);
        // }

        if (this.visualSettings.runnerCounter.position?.value?.value == null) {
            this.visualSettings.runnerCounter.position.value = this.visualSettings.runnerCounter.position.items.find(
                option => option.value.toString() === RunnerCounterPosition[RunnerCounterPosition.TopLeft]
            );
        }
    }

    private setHighContrastModeColors(colorHelper: ColorHelper): void {
        if (colorHelper.isHighContrast) {
            const foregroundColor: string = colorHelper.getThemeColor("foreground");
            const backgroundColor: string = colorHelper.getThemeColor("background");

            this.visualSettings.series.fill.value.value = foregroundColor;

            this.visualSettings.popup.color.value.value = backgroundColor;
            this.visualSettings.popup.fontColor.value.value = foregroundColor;
            this.visualSettings.popup.timeColor.value.value = foregroundColor;
            this.visualSettings.popup.timeFill.value.value = backgroundColor;
            this.visualSettings.popup.strokeColor.value.value = foregroundColor;

            this.visualSettings.dots.color.value.value = foregroundColor;

            this.visualSettings.xAxis.fontColor.value.value = foregroundColor;
            this.visualSettings.xAxis.color.value.value = foregroundColor;
            this.visualSettings.xAxis.backgroundColor.value.value = backgroundColor;

            this.visualSettings.yAxis.color.value.value = foregroundColor;
            this.visualSettings.yAxis.fontColor.value.value = foregroundColor;

            this.visualSettings.playback.color.value.value = foregroundColor;

            this.visualSettings.runnerCounter.fontColor.value.value = foregroundColor;
        }
    }

    public getFormattingModel(): powerbiVisualsApi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.visualSettings);
    }

    public destroy(): void {
        this.data = null;
        this.clearAll(true);
    }

    public clearTooltips(): void {
        this.chart
            .selectAll(Visual.Tooltip.className)
            .style("display", "none");
    }
}
