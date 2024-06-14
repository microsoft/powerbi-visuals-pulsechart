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
import { range as d3Range } from "d3-array";

import { valueType as vt, pixelConverter as PixelConverter } from "powerbi-visuals-utils-typeutils";
import ValueType = vt.ValueType;

import { getRandomNumber, getRandomNumbers, testDataViewBuilder } from "powerbi-visuals-utils-testutils";
import TestDataViewBuilder = testDataViewBuilder.TestDataViewBuilder;
import { getRandomUniqueSortedDates, getRandomWord, getRandomText } from "./helpers";

export class VisualData extends TestDataViewBuilder {
    public static ColumnTimestamp: string = "Timestamp";
    public static ColumnValue: string = "Value";
    public static ColumnEventTitle: string = "Event Title";
    public static ColumnEventDescription: string = "Event Description";
    public static ColumnEventSize: string = "Event Size";
    public valuesTimestamp = getRandomUniqueSortedDates(100, new Date(2014, 0, 1), new Date(2015, 5, 10));
    public valuesValue: number[] = getRandomNumbers(this.valuesTimestamp.length, 100, 1000);
    public valuesEvents: any[] = this.generateEvents(this.valuesValue.length, 5);
    public getDataView(columnNames?: string[], isDateAsString?: boolean): powerbiVisualsApi.DataView {
        let dateValues: string[] | Date[] = this.valuesTimestamp;
        if (!columnNames) {
            columnNames = [];
        }

        if (isDateAsString) {
            dateValues = dateValues.map((v: Date) => v.toISOString());
        }

        return this.createCategoricalDataViewBuilder([
            {
                source: {
                    displayName: VisualData.ColumnTimestamp,
                    format: "G",
                    type: ValueType.fromDescriptor({ dateTime: true }),
                    roles: { Timestamp: true }
                },
                values: dateValues
            },
            {
                source: {
                    displayName: VisualData.ColumnEventTitle,
                    type: ValueType.fromDescriptor({ text: true }),
                    roles: { EventTitle: true }
                },
                values: this.valuesEvents.map(x => x && x.title)
            },
            {
                source: {
                    displayName: VisualData.ColumnEventDescription,
                    type: ValueType.fromDescriptor({ text: true }),
                    roles: { EventDescription: true }
                },
                values: this.valuesEvents.map(x => x && x.description)
            },
            {
                source: {
                    displayName: VisualData.ColumnEventSize,
                    type: ValueType.fromDescriptor({ integer: true }),
                    roles: { EventSize: true }
                },
                values: this.valuesEvents.map(x => x && x.EventSize)
            }
        ], [
                {
                    source: {
                        displayName: VisualData.ColumnValue,
                        type: ValueType.fromDescriptor({ integer: true }),
                        roles: { Value: true }
                    },
                    values: this.valuesValue
                }
            ], columnNames).build();
    }

    public getDataViewWithNumbersInsteadDate(columnNames?: string[], isDateAsString?: boolean): powerbiVisualsApi.DataView {
        if (!columnNames) {
            columnNames = [];
        }

        return this.createCategoricalDataViewBuilder([
            {
                source: {
                    displayName: VisualData.ColumnTimestamp,
                    format: "G",
                    type: ValueType.fromDescriptor({ dateTime: true }),
                    roles: { Timestamp: true }
                },
                values: this.valuesValue
            },
            {
                source: {
                    displayName: VisualData.ColumnEventTitle,
                    type: ValueType.fromDescriptor({ text: true }),
                    roles: { EventTitle: true }
                },
                values: this.valuesEvents.map(x => x && x.title)
            },
            {
                source: {
                    displayName: VisualData.ColumnEventDescription,
                    type: ValueType.fromDescriptor({ text: true }),
                    roles: { EventDescription: true }
                },
                values: this.valuesEvents.map(x => x && x.description)
            }
        ], [
                {
                    source: {
                        displayName: VisualData.ColumnValue,
                        type: ValueType.fromDescriptor({ integer: true }),
                        roles: { Value: true }
                    },
                    values: this.valuesValue
                }
            ], columnNames).build();
    }

    public getDataViewWithSingleDate(columnNames?: string[]): powerbiVisualsApi.DataView {
        if (!columnNames) {
            columnNames = [];
        }

        return this.createCategoricalDataViewBuilder([
            {
                source: {
                    displayName: VisualData.ColumnTimestamp,
                    format: "G",
                    type: ValueType.fromDescriptor({ dateTime: true }),
                    roles: { Timestamp: true }
                },
                values: [this.valuesTimestamp[0], this.valuesTimestamp[0]]
            },
            {
                source: {
                    displayName: VisualData.ColumnEventTitle,
                    type: ValueType.fromDescriptor({ text: true }),
                    roles: { EventTitle: true }
                },
                values: [this.valuesEvents.map(x => x && x.title)[20]]
            },
            {
                source: {
                    displayName: VisualData.ColumnEventDescription,
                    type: ValueType.fromDescriptor({ text: true }),
                    roles: { EventDescription: true }
                },
                values: [this.valuesEvents.map(x => x && x.description)[20]]
            }
        ], [
                {
                    source: {
                        displayName: VisualData.ColumnValue,
                        type: ValueType.fromDescriptor({ integer: true }),
                        roles: { Value: true }
                    },
                    values: [this.valuesValue[0]]
                }
            ], columnNames).build();
    }

    private generateEvents(valuesCount: number, eventCount: number): any[] {
        let startIndex = valuesCount / eventCount;
        let eventIndexesSpace = (valuesCount - startIndex) / eventCount;
        let eventIndexes = d3Range(eventCount).map(x => startIndex + x * eventIndexesSpace);
        return d3Range(valuesCount).map(x =>
            eventIndexes.some(index => index === x)
                ? {
                    title: getRandomWord(6, 12),
                    description: getRandomText(20, 4, 12)
                }
                : null);
    }
}
