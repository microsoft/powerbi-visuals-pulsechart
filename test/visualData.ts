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

/// <reference path="_references.ts" />

module powerbi.extensibility.visual.test {

    // powerbi.extensibility.utils.type
    import ValueType = powerbi.extensibility.utils.type.ValueType;

    // powerbi.extensibility.utils.test
    import TestDataViewBuilder = powerbi.extensibility.utils.test.dataViewBuilder.TestDataViewBuilder;
    import helpers = powerbi.extensibility.utils.test.helpers;
    import testHelpers = powerbi.extensibility.visual.test.helpers;

    export class PulseChartData extends TestDataViewBuilder {
        public static ColumnTimestamp: string = "Timestamp";
        public static ColumnValue: string = "Value";
        public static ColumnEventTitle: string = "Event Title";
        public static ColumnEventDescription: string = "Event Description";
        public valuesTimestamp =  testHelpers.getRandomUniqueSortedDates(100, new Date(2014, 0, 1), new Date(2015, 5, 10));
        public valuesValue: number[] = helpers.getRandomNumbers(this.valuesTimestamp.length, 100, 1000);
        public valuesEvents: any[] = this.generateEvents(this.valuesValue.length, 5);
        public getDataView(columnNames?: string[]): powerbi.DataView {
            return this.createCategoricalDataViewBuilder([
                {
                    source: {
                        displayName: PulseChartData.ColumnTimestamp,
                        format: "G",
                        type: ValueType.fromDescriptor({ dateTime: true }),
                        roles: { Timestamp: true }
                    },
                    values: this.valuesTimestamp
                },
                {
                    source: {
                        displayName: PulseChartData.ColumnEventTitle,
                        type: ValueType.fromDescriptor({ text: true }),
                        roles: { EventTitle: true }
                    },
                    values: this.valuesEvents.map(x => x && x.title)
                },
                {
                    source: {
                        displayName: PulseChartData.ColumnEventDescription,
                        type: ValueType.fromDescriptor({ text: true }),
                        roles: { EventDescription: true }
                    },
                    values: this.valuesEvents.map(x => x && x.description)
                }
            ], [
                    {
                        source: {
                            displayName: PulseChartData.ColumnValue,
                            type: ValueType.fromDescriptor({ integer: true }),
                            roles: { Value: true }
                        },
                        values: this.valuesValue
                    }
                ], columnNames).build();
        }

        public getDataViewWithStringDate(columnNames?: string[]): powerbi.DataView {
            let defaultData: powerbi.DataView = this.getDataView();
            defaultData.categorical.categories[0].values = defaultData.categorical.categories[0].values.map((v: Date) => v.toISOString());
            return defaultData;
        }

        public getDataViewWithSingleDate(columnNames?: string[]): powerbi.DataView {
            return this.createCategoricalDataViewBuilder([
                {
                    source: {
                        displayName: PulseChartData.ColumnTimestamp,
                        format: "G",
                        type: ValueType.fromDescriptor({ dateTime: true }),
                        roles: { Timestamp: true }
                    },
                    values: [this.valuesTimestamp[0], this.valuesTimestamp[0]]
                },
                {
                    source: {
                        displayName: PulseChartData.ColumnEventTitle,
                        type: ValueType.fromDescriptor({ text: true }),
                        roles: { EventTitle: true }
                    },
                    values: [this.valuesEvents.map(x => x && x.title)[20]]
                },
                {
                    source: {
                        displayName: PulseChartData.ColumnEventDescription,
                        type: ValueType.fromDescriptor({ text: true }),
                        roles: { EventDescription: true }
                    },
                    values: [this.valuesEvents.map(x => x && x.description)[20]]
                }
            ], [
                {
                    source: {
                        displayName: PulseChartData.ColumnValue,
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
            let eventIndexes = d3.range(eventCount).map(x => startIndex + x * eventIndexesSpace);
            let events = d3.range(valuesCount).map(x =>
                eventIndexes.some(index => index === x)
                    ? {
                        title: testHelpers.getRandomWord(6, 12),
                        description: testHelpers.getRandomText(20, 4, 12)
                    }
                    : null);

            return events;
        }
    }
}
