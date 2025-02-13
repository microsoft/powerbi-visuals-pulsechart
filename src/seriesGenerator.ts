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

import { max as d3Max, min as d3Min } from "d3-array";
import isString from "lodash-es/isString";
import { axis as AxisHelper } from "powerbi-visuals-utils-chartutils";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import { Behavior } from "./behavior";
import { ChartDataLabelsSettings, DataPoint, DataRoles, LinearScale, Series, TimeScale, TooltipData } from "./models/models";
import { PulseChartSettingsModel } from "./pulseChartSettingsModel";
import { scaleLinear, scaleTime } from "d3-scale";

import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;
import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;
import PrimitiveValue = powerbiVisualsApi.PrimitiveValue;
import DataViewValueColumnGroup = powerbiVisualsApi.DataViewValueColumnGroup;

const MaxGapCount: number = 100;

export interface SeriesGenerationOptions {
    categoryValues: any[];
    grouped: powerbiVisualsApi.DataViewValueColumnGroup[];
    settings: PulseChartSettingsModel;
    columns: DataRoles<powerbiVisualsApi.DataViewValueColumn | powerbiVisualsApi.DataViewCategoryColumn>;
    timeStampColumn: powerbiVisualsApi.DataViewCategoryColumn;
    host: IVisualHost;
    maxCategoryValue: any;
    minCategoryValue: any;
    dataPointLabelSettings: ChartDataLabelsSettings;
    isScalar: boolean;
    runnerCounterFormatString: string;
    hasHighlights: boolean;
    valuesColumn: powerbiVisualsApi.DataViewValueColumn;
    behavior: Behavior;
}

// eslint-disable-next-line max-lines-per-function
export function generateSeries(options: SeriesGenerationOptions): Series[] {
    const {
    categoryValues,
    grouped,
    settings,
    columns,
    timeStampColumn,
    host,
    maxCategoryValue,
    minCategoryValue,
    dataPointLabelSettings,
    isScalar,
    runnerCounterFormatString,
    hasHighlights,
    valuesColumn,
    behavior
} = options;

    const gapWidths = getGapWidths(categoryValues);
    const maxGapWidth = Math.max(...gapWidths);
    const firstValueMeasureIndex: number = 0, firstGroupIndex: number = 0, secondGroupIndex = 1;
    const y_group0Values = grouped[firstGroupIndex]
        && grouped[firstGroupIndex].values[firstValueMeasureIndex]
        && grouped[firstGroupIndex].values[firstValueMeasureIndex].values;
    const y_group1Values = grouped[secondGroupIndex]
        && grouped[secondGroupIndex].values[firstValueMeasureIndex]
        && grouped[secondGroupIndex].values[firstValueMeasureIndex].values;


    const minSize: number = settings.dots.minSize.value;
    const maxSize: number = settings.dots.maxSize.value;

    const eventSizeScale: LinearScale = <LinearScale>createScale(
        true,
        columns.EventSize ? [d3Min(<number[]>columns.EventSize.values), d3Max(<number[]>columns.EventSize.values)] : [0, 0],
        minSize,
        maxSize);

    const series: Series[] = [];
    let dataPoints: DataPoint[] = [];
    for (let categoryIndex = 0, seriesCategoryIndex = 0, len = timeStampColumn.values.length; categoryIndex < len; categoryIndex++, seriesCategoryIndex++) {
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

        const minGapWidth: number = Math.max((maxCategoryValue - minCategoryValue) / MaxGapCount, <number>settings.xAxis.dateFormat);
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
            groupIndex: getGroupIndex(categoryIndex, grouped),
            eventSize: eventSizeValue,
            runnerCounterValue: runnerCounterValue,
            runnerCounterFormatString: runnerCounterFormatString,
            specificIdentity: undefined,
            highlight: hasHighlights && !!(valuesColumn.highlights[categoryIndex])
        };

        dataPoints.push(dataPoint);
    }

    behavior.applySelectionStateToData(dataPoints);

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

    return series;
}


function getGapWidths(values: Date[] | number[]): number[] {
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

function getGroupIndex(index: number, grouped: DataViewValueColumnGroup[]): number {
    for (let i: number = 0; i < grouped.length; i++) {
        if (grouped[i].values && grouped[i].values[0] &&
            grouped[i].values[0].values[index] !== undefined &&
            grouped[i].values[0].values[index] !== null) {
            return i;
        }
    }

    return 0;
}

export function createScale(isScalar: boolean, domain: (number | Date)[], minX: number, maxX: number): LinearScale | TimeScale {
    if (isScalar) {
        return scaleLinear().domain(<any>domain).range([minX, maxX]);
    }

    return scaleTime().domain(<any>domain).range([minX, maxX]);
}