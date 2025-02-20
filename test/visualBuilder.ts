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

import { VisualBuilderBase } from "powerbi-visuals-utils-testutils";
import { Visual as VisualClass } from "../src/visual";
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;

export class VisualBuilder extends VisualBuilderBase<VisualClass> {
    constructor(width: number, height: number) {
        super(width, height);
    }

    protected build(options: VisualConstructorOptions) {
        return new VisualClass(options);
    }

    public get visualInstance(): VisualClass {
        return this.visual;
    }

    public get settings(): VisualClass {
        return this.visual;
    }

    public get mainElement(): SVGElement {
        return this.element.querySelector(".pulseChart")!;
    }
    public get gaps(): NodeListOf<SVGElement> {
        return this.mainElement
            .querySelectorAll("g.gap");
    }

    public get animationDot(): SVGElement {
        return this.mainElement.querySelector("circle.animationDot")!;
    }

    public get chart(): SVGElement {
        return this.mainElement.querySelector("g.chart")!;
    }

    public get lineNode(): SVGElement {
        return this.chart.querySelector("g.lineNode")!;
    }

    public get lineContainer(): SVGElement {
        return this.lineNode.querySelector("g.lineContainer")!;
    }

    public get linePath(): SVGElement {
        return this.lineContainer.querySelector("path.line")!;
    }

    public get dotsContainer(): SVGElement {
        return this.lineNode.querySelector("g.dotsContainer")!;
    }

    public get dotsContainerDot(): NodeListOf<SVGElement> {
        return this.dotsContainer.querySelectorAll("circle.dot");
    }

    public get xAxisNode(): SVGElement {
        return this.lineNode.querySelector("g.xAxisNode")!;
    }

    public get xAxisNodeTick(): SVGElement {
        return this.xAxisNode.querySelector("g.tick")!;
    }

    public get xAxisNodeRect(): NodeListOf<SVGElement> {
        return this.xAxisNodeTick.querySelectorAll("rect");
    }

    public get yAxis(): SVGElement {
        return this.mainElement.querySelector("g.y.axis")!;
    }

    public get yAxisTicks(): NodeListOf<SVGElement> {
        return this.yAxis.querySelectorAll("g.tick");
    }

    public get tooltipContainer(): SVGElement {
        return this.lineNode.querySelector(".tooltipContainer")!;
    }

    public get tooltipContainerTooltip(): SVGElement | null{
        return this.tooltipContainer.querySelector("g.Tooltip");
    }

    public get animationPlay(): SVGElement {
        return this.mainElement.querySelector("g.animationPlay")!;
    }

    public get animationPrev(): SVGElement {
        return this.mainElement.querySelector("g.animationPrev")!;
    }

    public get animationNext(): SVGElement {
        return this.mainElement.querySelector("g.animationNext")!;
    }
}
