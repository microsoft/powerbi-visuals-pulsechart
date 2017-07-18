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

module powerbi.extensibility.visual {
    // d3
    import Selection = d3.Selection;

    // powerbi.extensibility.utils.svg
    import SVGUtil = powerbi.extensibility.utils.svg;
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;

    // powerbi.extensibility.utils.formatting
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    export class PulseAnimator {
        private chart: PulseChart;
        private svg: Selection<any>;
        private animationPlay: Selection<any>;
        private animationPause: Selection<any>;
        private animationReset: Selection<any>;
        private animationToEnd: Selection<any>;
        private animationPrev: Selection<any>;
        private animationNext: Selection<any>;
        private runnerCounter: Selection<any>;
        private runnerCounterText: Selection<any>;
        private static AnimationPlay: ClassAndSelector = createClassAndSelector("animationPlay");
        private static AnimationPause: ClassAndSelector = createClassAndSelector("animationPause");
        private static AnimationReset: ClassAndSelector = createClassAndSelector("animationReset");
        private static AnimationToEnd: ClassAndSelector = createClassAndSelector("animationToEnd");
        private static AnimationPrev: ClassAndSelector = createClassAndSelector("animationPrev");
        private static AnimationNext: ClassAndSelector = createClassAndSelector("animationNext");
        private static ControlsContainer: ClassAndSelector = createClassAndSelector("ControlsContainer");
        private static RunnerCounter: ClassAndSelector = createClassAndSelector("runnerCounter");
        private static PlayButtonMarkup: string = "M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3 17v-10l9 5.146-9 4.854z";
        private static PauseButtonMarkup: string = "M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1 17h-3v-10h3v10zm5-10h-3v10h3v-10z";
        private static ResetButtonMarkup: string = "M22 12c0 5.514-4.486 10-10 10s-10-4.486-10-10 4.486-10 10-10 10 4.486 10 10zm-22 0c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm13 0l5-4v8l-5-4zm-5 0l5-4v8l-5-4zm-2 4h2v-8h-2v8z";
        private static NextButtonMarkup: string = "M7 16.5v-9l7.5 4.5-7.5 4.5zm5.5-8.5v1.634l3.943 2.366-3.943 2.366v1.634l6.5-4-6.5-4zm-.5-6c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z";
        private static PrevButtonMarkup: string = "M9.5 12l7.5-4.5v9l-7.5-4.5zm-4.5 0l6.5 4v-1.634l-3.943-2.366 3.943-2.366v-1.634l-6.5 4zm17 0c0 5.514-4.486 10-10 10s-10-4.486-10-10 4.486-10 10-10 10 4.486 10 10zm-22 0c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12z";
        private static EndButtonMarkup: string = "M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-6 16v-8l5 4-5 4zm5 0v-8l5 4-5 4zm7-8h-2v8h2v-8z";
        private animatorState: AnimatorStates;

        public static get AnimationMinPosition(): AnimationPosition {
            return { series: 0, index: 0 };
        }

        private static DimmedOpacity: number = 0.25;
        private static DefaultOpacity: number = 1;
        private static DefaultControlsColor: string = "#777";
        private container: Selection<any>;
        public animationPlayingIndex: number = 0;
        private color: string;
        private isAutoPlayed: boolean = false;

        private runnerCounterValue: string;
        private runnerCounterTopLeftPosition: number = 180;
        private static runnerCounterDefaultPosition: number = 0;

        private static buttonRadius: number = 10;
        private static buttonCenter: number = 12;
        private static buttonRotate: number = 180;
        private static buttonShiftX: number = 30;

        private static runnerCounterShiftX: number = 2;
        private static runnerCounterShiftY: number = 7;

        private get runnerCounterPosition(): RunnerCounterPosition {
            return this.chart.data.settings.runnerCounter.position;
        }

        private get maxTextWidthOfRunnerCounterValue(): number {
            const top: boolean = this.runnerCounterPosition === RunnerCounterPosition.TopLeft || this.runnerCounterPosition === RunnerCounterPosition.TopRight;
            return this.chart.viewport.width - (top ? this.runnerCounterTopLeftPosition : PulseAnimator.runnerCounterDefaultPosition);
        }

        public get isAnimated(): boolean {
            return (this.animatorState === AnimatorStates.Paused) ||
                (this.animatorState === AnimatorStates.Play) ||
                (this.animatorState === AnimatorStates.Stopped);
        }

        public get isPlaying(): boolean {
            return this.animatorState === AnimatorStates.Play;
        }

        public get isPaused(): boolean {
            return this.animatorState === AnimatorStates.Paused;
        }

        public get isStopped(): boolean {
            return this.animatorState === AnimatorStates.Stopped;
        }

        constructor(chart: PulseChart, svg: Selection<any>) {
            this.chart = chart;
            this.svg = svg;

            this.setDefaultValues();

            let container: Selection<any> = this.container = this.svg
                .append("g")
                .classed(PulseAnimator.ControlsContainer.className, true)
                .style("display", "none");

            this.animationPlay = container
                .append("g")
                .classed(PulseAnimator.AnimationPlay.className, true);

            this.animationPlay
                .append("circle")
                .attr("cx", PulseAnimator.buttonCenter)
                .attr("cy", PulseAnimator.buttonCenter)
                .attr("r", PulseAnimator.buttonRadius)
                .attr("fill", "transparent");

            this.animationPlay
                .call(pulseChartUtils.AddOnTouchClick, () => this.play());

            this.animationPlay
                .append("path")
                .attr("d", PulseAnimator.PlayButtonMarkup);

            this.animationPause = container
                .append("g")
                .classed(PulseAnimator.AnimationPause.className, true);

            this.animationPause
                .append("circle")
                .attr("cx", PulseAnimator.buttonCenter)
                .attr("cy", PulseAnimator.buttonCenter)
                .attr("r", PulseAnimator.buttonRadius)
                .attr("fill", "transparent");
            this.animationPause
                .call(pulseChartUtils.AddOnTouchClick, () => this.stop());

            this.animationPause
                .append("path")
                .attr("d", PulseAnimator.PauseButtonMarkup);

            this.animationReset = container
                .append("g")
                .classed(PulseAnimator.AnimationReset.className, true);

            this.animationReset
                .append("circle")
                .attr("cx", PulseAnimator.buttonCenter)
                .attr("cy", PulseAnimator.buttonCenter)
                .attr("r", PulseAnimator.buttonRadius)
                .attr("fill", "transparent");
            this.animationReset
                .call(pulseChartUtils.AddOnTouchClick, () => this.reset());

            this.animationReset
                .append("path")
                .attr("d", PulseAnimator.ResetButtonMarkup);

            /* Prev */
            this.animationPrev = container
                .append("g")
                .classed(PulseAnimator.AnimationPrev.className, true);

            this.animationPrev
                .append("circle")
                .attr("cx", PulseAnimator.buttonCenter)
                .attr("cy", PulseAnimator.buttonCenter)
                .attr("r", PulseAnimator.buttonRadius)
                .attr("fill", "transparent");
            this.animationPrev
                .call(pulseChartUtils.AddOnTouchClick, () => this.prev());

            this.animationPrev
                .append("path")
                .attr("d", PulseAnimator.PrevButtonMarkup);

            /* Next */
            this.animationNext = container
                .append("g")
                .classed(PulseAnimator.AnimationNext.className, true);

            this.animationNext
                .append("circle")
                .attr("cx", PulseAnimator.buttonCenter)
                .attr("cy", PulseAnimator.buttonCenter)
                .attr("r", PulseAnimator.buttonRadius)
                .attr("fill", "transparent");
            this.animationNext
                .call(pulseChartUtils.AddOnTouchClick, () => this.next());

            this.animationNext
                .append("path")
                .attr("d", PulseAnimator.NextButtonMarkup)
                .attr("rotate", PulseAnimator.buttonRotate);

            this.animationToEnd = container
                .append("g")
                .classed(PulseAnimator.AnimationToEnd.className, true);

            this.animationToEnd
                .append("circle")
                .attr("cx", PulseAnimator.buttonCenter)
                .attr("cy", PulseAnimator.buttonCenter)
                .attr("r", PulseAnimator.buttonRadius)
                .attr("fill", "transparent");

            this.animationToEnd
                .call(pulseChartUtils.AddOnTouchClick, () => this.toEnd());

            this.animationToEnd
                .append("path")
                .attr("d", PulseAnimator.EndButtonMarkup);

            this.runnerCounter = container
                .append("g")
                .classed(PulseAnimator.RunnerCounter.className, true);

            this.runnerCounterText = this.runnerCounter.append("text");
            this.setControlsColor(PulseAnimator.DefaultControlsColor);
        }

        private setDefaultValues(): void {
            this.position = PulseAnimator.AnimationMinPosition;
            this.animatorState = AnimatorStates.Ready;
            this.runnerCounterValue = "";
        }

        public render(): void {
            this.renderControls();
            this.disableControls();

            if (!this.chart.isAutoPlay) {
                this.isAutoPlayed = true;
                if (this.savedPosition) {
                    this.savedPosition = null;
                }
            }

            if (this.chart.isAutoPlay && this.isAutoPlayed
                && this.animatorState === AnimatorStates.Play
                && !this.positionSaved
                && !_.isEqual(this.autoPlayPosition, this.savedPosition)) {
                this.chart.stopAnimation();
                this.isAutoPlayed = false;
                this.positionSaved = true;
                this.animatorState = AnimatorStates.Ready;
            }

            if (this.animatorState === AnimatorStates.Play) {
                this.play();
            } else if (this.chart.isAutoPlay && !this.isAutoPlayed && (this.animatorState === AnimatorStates.Ready)) {
                this.autoPlayPosition = this.savedPosition;
                this.isAutoPlayed = true;
                if (this.savedPosition
                    && this.savedPosition.series < this.chart.data.series.length
                    && this.savedPosition.index < this.chart.data.series[this.savedPosition.series].data.length) {
                    this.position = this.savedPosition;
                }

                this.play(this.chart.autoplayPauseDuration);
            } else {
                this.chart.renderChart();
            }
        }

        public setControlsColor(color: string): void {
            this.color = color;
        }

        private renderControls(): void {
            this.show();
            let counter: number = 0;
            let shiftX = (): number => PulseAnimator.buttonShiftX * counter++;
            let color: string = this.color;

            this.animationPlay
                .attr("transform", SVGUtil.translate(shiftX(), 0))
                .attr("fill", color);

            this.animationPause
                .attr("transform", SVGUtil.translate(shiftX(), 0))
                .attr("fill", color);

            this.animationReset
                .attr("transform", SVGUtil.translate(shiftX(), 0))
                .attr("fill", color);

            this.animationPrev
                .attr("transform", SVGUtil.translate(shiftX(), 0))
                .attr("fill", color);

            this.animationNext
                .attr("transform", SVGUtil.translate(shiftX(), 0))
                .attr("fill", color);

            this.animationToEnd
                .attr("transform", SVGUtil.translate(shiftX(), 0))
                .attr("fill", color);

            this.runnerCounter
                .attr("fill", color)
                .attr("transform",
                SVGUtil.translate(this.runnerCounterPosition === RunnerCounterPosition.TopLeft
                    ? this.runnerCounterTopLeftPosition
                    : this.chart.viewport.width - PulseAnimator.runnerCounterShiftX,
                    this.chart.data.runnerCounterHeight / 2 + PulseAnimator.runnerCounterShiftY));
            this.runnerCounterText
                .style("text-anchor", this.runnerCounterPosition === RunnerCounterPosition.TopLeft ? "start" : "end");

            if (this.chart.data && this.chart.data.settings) {
                this.runnerCounterText.style(<any>PulseChart.ConvertTextPropertiesToStyle(
                    PulseChart.GetRunnerCounterTextProperties(null, this.chart.data.settings.runnerCounter.fontSize)));
                this.runnerCounterText.style("fill", this.chart.data.settings.runnerCounter.fontColor);
            }

            this.drawCounterValue();
        }

        private static setControlVisiblity(element: Selection<any>, isVisible: boolean, isDisabled: boolean = false): void {
            element
                .style("opacity", isVisible ? PulseAnimator.DefaultOpacity : PulseAnimator.DimmedOpacity);
            if (isVisible) {
                element.attr("display", "inline");
            } else if (isDisabled) {
                element.attr("display", "none");
            }
        }

        private disableControls(): void {
            let showRunner: boolean = this.chart.data && this.chart.data.settings && this.chart.data.settings.runnerCounter.show;
            PulseAnimator.setControlVisiblity(this.animationReset, true);
            PulseAnimator.setControlVisiblity(this.animationToEnd, true);

            switch (this.animatorState) {
                case AnimatorStates.Play:
                    PulseAnimator.setControlVisiblity(this.animationPlay, false);

                    PulseAnimator.setControlVisiblity(this.animationPrev, true);
                    PulseAnimator.setControlVisiblity(this.animationNext, true);

                    PulseAnimator.setControlVisiblity(this.animationPause, true);
                    PulseAnimator.setControlVisiblity(this.runnerCounter, showRunner, true);
                    break;
                case AnimatorStates.Paused:
                    PulseAnimator.setControlVisiblity(this.animationPlay, true);
                    PulseAnimator.setControlVisiblity(this.animationPause, true);

                    PulseAnimator.setControlVisiblity(this.animationPrev, true);
                    PulseAnimator.setControlVisiblity(this.animationNext, true);

                    PulseAnimator.setControlVisiblity(this.runnerCounter, showRunner, true);
                    break;
                case AnimatorStates.Stopped:
                    PulseAnimator.setControlVisiblity(this.animationPlay, true);

                    PulseAnimator.setControlVisiblity(this.animationPrev, true);
                    PulseAnimator.setControlVisiblity(this.animationNext, true);

                    PulseAnimator.setControlVisiblity(this.runnerCounter, showRunner, true);

                    PulseAnimator.setControlVisiblity(this.animationPause, false);
                    break;
                case AnimatorStates.Ready:
                    PulseAnimator.setControlVisiblity(this.animationPlay, true);

                    PulseAnimator.setControlVisiblity(this.animationPrev, false);
                    PulseAnimator.setControlVisiblity(this.animationNext, false);

                    PulseAnimator.setControlVisiblity(this.animationPause, false);
                    PulseAnimator.setControlVisiblity(this.runnerCounter, false, true);
                    break;
                default:
                    PulseAnimator.setControlVisiblity(this.animationPlay, true);

                    PulseAnimator.setControlVisiblity(this.animationPrev, false);
                    PulseAnimator.setControlVisiblity(this.animationNext, false);

                    PulseAnimator.setControlVisiblity(this.animationPause, false);
                    PulseAnimator.setControlVisiblity(this.runnerCounter, false, true);
                    break;
            }
        }

        public show(): void {
            this.container.style("display", "inline");
        }

        public setRunnerCounterValue(index?: number): void {
            let dataPoint: DataPoint = this.chart.data
                && this.chart.data.series
                && this.chart.data.series[this.position.series]
                && this.chart.data.series[this.position.series].data
                && this.chart.data.series[this.position.series].data[_.isNumber(index) ? index : this.flooredPosition.index];

            let runnerCounterValue: string = (dataPoint && dataPoint.runnerCounterValue != null)
                ? dataPoint.runnerCounterValue
                : "";

            if (dataPoint && dataPoint.runnerCounterFormatString) {
                let runnerCounterformatter = valueFormatter.create({ format: dataPoint.runnerCounterFormatString });
                runnerCounterValue = runnerCounterformatter.format(runnerCounterValue);
            }

            this.runnerCounterValue = `${this.chart.data.settings.runnerCounter.label} ${runnerCounterValue}`;
            this.drawCounterValue();
        }

        private drawCounterValue(): void {
            let progressText: string = this.runnerCounterValue;
            this.runnerCounterText.text(progressText);
            textMeasurementService.svgEllipsis(<any>this.runnerCounterText.node(), this.maxTextWidthOfRunnerCounterValue);
        }

        public play(delay: number = 0, renderDuringPlaying: boolean = false): void {
            if (this.animatorState === AnimatorStates.Play && !renderDuringPlaying) {
                return;
            }

            if (this.animatorState === AnimatorStates.Ready) {
                this.animationPlayingIndex++;
                this.chart.clearChart();
            }

            if (this.chart.isAnimationIndexLast(this.position)) {
                this.playNext();
                return;
            }

            if (this.animatorState === AnimatorStates.Paused) {
                this.chart.onClearSelection();
            }

            this.animatorState = AnimatorStates.Play;
            this.chart.renderChart();
            this.chart.playAnimation(delay);
            this.disableControls();
        }

        public playNext(): void {
            this.pause();

            if (this.chart.isAnimationSeriesLast(this.position)) {
                this.setDefaultValues();
                this.chart.onClearSelection();
            } else {
                this.position = {
                    series: this.position.series + 1,
                    index: PulseAnimator.AnimationMinPosition.index,
                };
                this.play();
            }
        }

        public pause(): void {
            if (this.animatorState === AnimatorStates.Play) {
                this.animatorState = AnimatorStates.Paused;
                this.chart.pauseAnimation();
            }

            this.disableControls();
        }

        public reset(): void {
            this.clearTimeouts();
            this.chart.stopAnimation();
            this.chart.onClearSelection();
            this.chart.clearChart();

            this.setDefaultValues();
            this.animatorState = AnimatorStates.Stopped;

            this.disableControls();
            this.savedPosition = null;
        }

        private next(): void {
            if (!this.isAnimated) {
                return;
            }

            this.stop();

            const newPosition: AnimationPosition = this.chart.findNextPoint(this.position);
            if (newPosition) {
                this.position = newPosition;
                this.chart.handleSelection(this.position);
            } else {
                this.toEnd();
            }
        }

        private prev(): void {
            if (!this.isAnimated) {
                return;
            }

            this.stop();
            const newPosition: AnimationPosition = this.chart.findPrevPoint(this.position);
            if (newPosition) {
                this.position = newPosition;
                this.chart.handleSelection(this.position);
            } else {
                this.reset();
            }
        }

        public toEnd(): void {
            this.savedPosition = null;
            this.chart.stopAnimation();
            this.chart.onClearSelection();
            this.chart.clearChart();
            this.setDefaultValues();
            this.disableControls();
            this.chart.renderChart();
        }

        public stop(): void {
            if (!this.isAnimated) {
                return;
            }

            this.drawCounterValue();
            this.savedPosition = this.position;
            this.chart.stopAnimation();
            this.animatorState = AnimatorStates.Stopped;

            this.disableControls();
        }

        private positionValue: AnimationPosition;

        public set position(position: AnimationPosition) {
            this.positionValue = position;
        }

        public get position(): AnimationPosition {
            return this.positionValue;
        }

        public get flooredPosition(): AnimationPosition {
            return this.position && { series: this.position.series, index: Math.floor(this.position.index) };
        }

        private positionSaved: boolean = false;
        private autoPlayPosition: AnimationPosition;

        public set savedPosition(position: AnimationPosition) {
            if (!this.chart.isAutoPlay) {
                position = null;
            }

            if (this.chart.data && this.chart.data.settings && this.chart.data.settings.playback) {
                this.positionSaved = true;
                if (this.chart.data && this.chart.data.settings && this.chart.data.settings.playback) {
                    this.chart.data.settings.playback.position = position;
                }

                this.chart.host.persistProperties(<VisualObjectInstancesToPersist>{
                    merge: [{
                        objectName: "playback",
                        selector: null,
                        properties: { position: position && JSON.stringify(position) || "" }
                    }]
                });
            }
        }

        public get savedPosition(): AnimationPosition {
            return this.chart.data
                && this.chart.data.settings
                && this.chart.data.settings.playback
                && this.chart.data.settings.playback.position;
        }

        public clear(): void {
            if (this.isAnimated) {
                this.chart.stopAnimation();
            }

            this.setDefaultValues();
            this.container.style("display", "none");
        }

        public clearTimeouts(): void {
            clearTimeout(this.chart.handleSelectionTimeout);
        }
    }
}
