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
import { Selection as d3Selection } from "d3-selection";

import { ChartDataLabelsSettings } from "./models/models";
import { PointLabelPosition } from "./enum/enums";

export const DimmedOpacity: number = 0.5;
export const DefaultOpacity: number = 1.0;

export function getFillOpacity(selected: boolean, highlight: boolean, hasSelection: boolean, hasPartialHighlights: boolean): number {
    if (!selected && !highlight && (hasSelection || hasPartialHighlights)) {
        return DimmedOpacity;
    }
    return DefaultOpacity;
}

export function addOnTouchClick(selection: d3Selection<SVGGElement, unknown, null, undefined>, callback: () => void): d3Selection<SVGGElement, unknown, null, undefined> {
    const preventDefaultCallback = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        event.stopPropagation();
        callback();
    };
    return selection
        .on("click", preventDefaultCallback)
        .on("touchstart", preventDefaultCallback);
}


export function getDefaultPulseChartLabelSettings(): ChartDataLabelsSettings {
    return {
        show: false,
        position: PointLabelPosition.Below,
        displayUnits: 0,
        precision: undefined,
        labelColor: "#777777",
        fontSize: 9,
        labelDensity: "50",
    };
}
