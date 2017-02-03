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
    import getRandomNumber = powerbi.extensibility.utils.test.helpers.getRandomNumber;
    import CustomizeColumnFn = powerbi.extensibility.utils.test.dataViewBuilder.CustomizeColumnFn;
    import TestDataViewBuilder = powerbi.extensibility.utils.test.dataViewBuilder.TestDataViewBuilder;
    import helpers = powerbi.extensibility.utils.test.helpers;

    export function getRandomUniqueNumbers(count: number, min: number = 0, max: number = 1): number[] {
        let result: number[] = [];
        for (let i = 0; i < count; i++) {
            result.push(getRandomNumber(min, max, result));
        }

        return result;
    }

    export function getRandomUniqueDates(count: number, start: Date, end: Date): Date[] {
        return getRandomUniqueNumbers(count, start.getTime(), end.getTime()).map(x => new Date(x));
    }

    export function getRandomUniqueSortedDates(count: number, start: Date, end: Date): Date[] {
        return getRandomUniqueDates(count, start, end).sort((a, b) => a.getTime() - b.getTime());
    }

    export class LineDotChartData extends TestDataViewBuilder {
        public static ColumnDate: string = "Date";
        public static ColumnValue: string = "Value";

        public valuesDate: Date[] = getRandomUniqueSortedDates(
            50,
            new Date(2014, 9, 12, 3, 9, 50),
            new Date(2016, 3, 1, 2, 43, 3));
        public valuesValue = helpers.getRandomNumbers(this.valuesDate.length, 0, 5361);

        public getDataView(columnNames?: string[]): powerbi.DataView {
            return this.createCategoricalDataViewBuilder([
                {
                    source: {
                        displayName: LineDotChartData.ColumnDate,
                        type: ValueType.fromDescriptor({ dateTime: true }),
                        roles: { Date: true }
                    },
                    values: this.valuesDate
                }
            ], [
                    {
                        source: {
                            displayName: "Values",
                            type: ValueType.fromDescriptor({ integer: true }),
                            roles: { Values: true }
                        },
                        values: this.valuesValue
                    }
                ], columnNames).build();
        }
    }
}
