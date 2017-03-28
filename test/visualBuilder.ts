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

/// <reference path="_references.ts"/>

module powerbi.extensibility.visual.test {
    import VisualBuilderBase = powerbi.extensibility.utils.test.VisualBuilderBase;

    // PulseChart1459209850231
    import VisualClass = powerbi.extensibility.visual.PulseChart1459209850231.PulseChart;
    export class PulseChartBuilder extends VisualBuilderBase<VisualClass> {
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

        public get mainElement(): JQuery {
            return this.element.children(".pulseChart");
        }
        public get gaps(): JQuery {
            return this.mainElement
                .children("g.gaps")
                .children("g.gap");
        }

        public get animationDot(): JQuery {
            return this.mainElement
                .children("g.dots")
                .children("circle.animationDot");
        }

        public get chart(): JQuery {
            return this.mainElement.children("g.chart");
        }

        public get lineNode(): JQuery {
            return this.chart.children("g.lineNode");
        }

        public get lineContainer(): JQuery {
            return this.lineNode.children("g.lineContainer");
        }

        public get linePath() {
            return this.lineContainer.children("path.line");
        }

        public get dotsContainer(): JQuery {
            return this.lineNode.children("g.dotsContainer");
        }

        public get dotsContainerDot(): JQuery {
            return this.dotsContainer.children("circle.dot");
        }

        public get xAxisNode(): JQuery {
            return this.lineNode.children("g.xAxisNode");
        }

        public get xAxisNodeTick(): JQuery {
            return this.xAxisNode.children("g.tick");
        }

        public get yAxis(): JQuery {
            return this.mainElement.children("g.y.axis");
        }

        public get yAxisTicks(): JQuery {
            return this.yAxis.children("g.tick");
        }

        public get tooltipContainer(): JQuery {
            return this.lineNode.children(".tooltipContainer");
        }

        public get tooltipContainerTooltip(): JQuery {
            return this.tooltipContainer.children("g.Tooltip");
        }

        public get animationPlay(): JQuery {
            return this.mainElement
                .children("g")
                .children("g.animationPlay");
        }

        public get animationPrev(): JQuery {
            return this.mainElement
                .children("g")
                .children("g.animationPrev");
        }

        public get animationNext(): JQuery {
            return this.mainElement
                .children("g")
                .children("g.animationNext");
        }
    }
}
