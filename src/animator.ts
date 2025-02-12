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
import isEqual from "lodash-es/isEqual";
import isNumber from "lodash-es/isNumber";
import { BaseType, Selection } from "d3-selection";

import VisualObjectInstancesToPersist = powerbiVisualsApi.VisualObjectInstancesToPersist;

import * as SVGUtil from "powerbi-visuals-utils-svgutils";
import manipulation = SVGUtil.manipulation;
import ClassAndSelector = SVGUtil.CssConstants.ClassAndSelector;
import createClassAndSelector = SVGUtil.CssConstants.createClassAndSelector;

import { valueFormatter, textMeasurementService } from "powerbi-visuals-utils-formattingutils";

import { AnimationPosition, DataPoint } from "./models/models";
import { AnimatorStates, RunnerCounterPosition } from "./enum/enums";
import { Visual } from "./visual";
import * as pulseChartUtils from "./utils";

export class Animator {
    private chart: Visual;
    private svg: Selection<BaseType, any, BaseType, any>;
    private animationPlay: Selection<BaseType, any, BaseType, any>;
    private animationPause: Selection<BaseType, any, BaseType, any>;
    private animationReset: Selection<BaseType, any, BaseType, any>;
    private animationToEnd: Selection<BaseType, any, BaseType, any>;
    private animationPrev: Selection<BaseType, any, BaseType, any>;
    private animationNext: Selection<BaseType, any, BaseType, any>;
    private runnerCounter: Selection<BaseType, any, BaseType, any>;
    private runnerCounterText: Selection<BaseType, any, BaseType, any>;
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
    private container: Selection<BaseType, any, BaseType, any>;
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
        return <RunnerCounterPosition>this.chart.data.settings.runnerCounter.position?.value?.value || RunnerCounterPosition.TopLeft;
    }

    private get maxTextWidthOfRunnerCounterValue(): number {
        const top: boolean = this.runnerCounterPosition === RunnerCounterPosition.TopLeft || this.runnerCounterPosition === RunnerCounterPosition.TopRight;
        return this.chart.viewport.width - (top ? this.runnerCounterTopLeftPosition : Animator.runnerCounterDefaultPosition);
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

    // eslint-disable-next-line max-lines-per-function
    constructor(chart: Visual, svg: Selection<BaseType, any, BaseType, any>) {
        this.chart = chart;
        this.svg = svg;
        this.setDefaultValues();
        const container: Selection<BaseType, any, BaseType, any> = this.container = this.svg
            .append("g")
            .classed(Animator.ControlsContainer.className, true)
            .style("display", "none");

        this.animationPlay = container
            .append("g")
            .classed(Animator.AnimationPlay.className, true);

        this.animationPlay
            .append("circle")
            .attr("cx", Animator.buttonCenter)
            .attr("cy", Animator.buttonCenter)
            .attr("r", Animator.buttonRadius)
            .attr("fill", "transparent");

        this.animationPlay
            .call(pulseChartUtils.addOnTouchClick, () => this.play());

        this.animationPlay
            .append("path")
            .attr("d", Animator.PlayButtonMarkup);

        this.animationPause = container
            .append("g")
            .classed(Animator.AnimationPause.className, true);

        this.animationPause
            .append("circle")
            .attr("cx", Animator.buttonCenter)
            .attr("cy", Animator.buttonCenter)
            .attr("r", Animator.buttonRadius)
            .attr("fill", "transparent");
        this.animationPause
            .call(pulseChartUtils.addOnTouchClick, () => this.stop());

        this.animationPause
            .append("path")
            .attr("d", Animator.PauseButtonMarkup);

        this.animationReset = container
            .append("g")
            .classed(Animator.AnimationReset.className, true);

        this.animationReset
            .append("circle")
            .attr("cx", Animator.buttonCenter)
            .attr("cy", Animator.buttonCenter)
            .attr("r", Animator.buttonRadius)
            .attr("fill", "transparent");
        this.animationReset
            .call(pulseChartUtils.addOnTouchClick, () => this.reset());

        this.animationReset
            .append("path")
            .attr("d", Animator.ResetButtonMarkup);

        // Prev
        this.animationPrev = container
            .append("g")
            .classed(Animator.AnimationPrev.className, true);

        this.animationPrev
            .append("circle")
            .attr("cx", Animator.buttonCenter)
            .attr("cy", Animator.buttonCenter)
            .attr("r", Animator.buttonRadius)
            .attr("fill", "transparent");
        this.animationPrev
            .call(pulseChartUtils.addOnTouchClick, () => this.prev());

        this.animationPrev
            .append("path")
            .attr("d", Animator.PrevButtonMarkup);

        // Next
        this.animationNext = container
            .append("g")
            .classed(Animator.AnimationNext.className, true);

        this.animationNext
            .append("circle")
            .attr("cx", Animator.buttonCenter)
            .attr("cy", Animator.buttonCenter)
            .attr("r", Animator.buttonRadius)
            .attr("fill", "transparent");
        this.animationNext
            .call(pulseChartUtils.addOnTouchClick, () => this.next());

        this.animationNext
            .append("path")
            .attr("d", Animator.NextButtonMarkup)
            .attr("rotate", Animator.buttonRotate);

        this.animationToEnd = container
            .append("g")
            .classed(Animator.AnimationToEnd.className, true);

        this.animationToEnd
            .append("circle")
            .attr("cx", Animator.buttonCenter)
            .attr("cy", Animator.buttonCenter)
            .attr("r", Animator.buttonRadius)
            .attr("fill", "transparent");

        this.animationToEnd
            .call(pulseChartUtils.addOnTouchClick, () => this.toEnd());

        this.animationToEnd
            .append("path")
            .attr("d", Animator.EndButtonMarkup);

        this.runnerCounter = container
            .append("g")
            .classed(Animator.RunnerCounter.className, true);

        this.runnerCounterText = this.runnerCounter.append("text");
        this.setControlsColor(Animator.DefaultControlsColor);
    }

    private setDefaultValues(): void {
        this.position = Animator.AnimationMinPosition;
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
            && !isEqual(this.autoPlayPosition, this.savedPosition)) {
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
        const shiftX = (): number => Animator.buttonShiftX * counter++;
        const color: string = this.color;

        this.animationPlay
            .attr("transform", manipulation.translate(shiftX(), 0))
            .attr("fill", color);

        this.animationPause
            .attr("transform", manipulation.translate(shiftX(), 0))
            .attr("fill", color);

        this.animationReset
            .attr("transform", manipulation.translate(shiftX(), 0))
            .attr("fill", color);

        this.animationPrev
            .attr("transform", manipulation.translate(shiftX(), 0))
            .attr("fill", color);

        this.animationNext
            .attr("transform", manipulation.translate(shiftX(), 0))
            .attr("fill", color);

        this.animationToEnd
            .attr("transform", manipulation.translate(shiftX(), 0))
            .attr("fill", color);

        this.runnerCounter
            .attr("fill", color)
            .attr("transform",
                manipulation.translate(this.runnerCounterPosition === RunnerCounterPosition.TopLeft
                    ? this.runnerCounterTopLeftPosition
                    : this.chart.viewport.width - Animator.runnerCounterShiftX,
                    this.chart.data.runnerCounterHeight / 2 + Animator.runnerCounterShiftY));
        this.runnerCounterText
            .style("text-anchor", this.runnerCounterPosition === RunnerCounterPosition.TopLeft ? "start" : "end");

        if (this.chart.data && this.chart.data.settings) {
            this.runnerCounterText.style(<any>Visual.CONVERT_TEXT_PROPERTIES_TO_STYLE(
                Visual.GET_RUNNER_COUNTER_TEXT_PROPERTIES(null, this.chart.data.settings.runnerCounter.fontSize.value)));
            this.runnerCounterText.style("fill", this.chart.data.settings.runnerCounter.fontColor.value.value);
        }

        this.drawCounterValue();
    }

    private static setControlVisiblity(element: Selection<BaseType, any, BaseType, any>, isVisible: boolean, isDisabled: boolean = false): void {
        element
            .style("opacity", isVisible ? Animator.DefaultOpacity : Animator.DimmedOpacity);
        if (isVisible) {
            element.attr("display", "inline");
        } else if (isDisabled) {
            element.attr("display", "none");
        }
    }

    private disableControls(): void {
        const showRunner: boolean = this.chart.data && this.chart.data.settings && this.chart.data.settings.runnerCounter.show.value;
        Animator.setControlVisiblity(this.animationReset, true);
        Animator.setControlVisiblity(this.animationToEnd, true);

        switch (this.animatorState) {
            case AnimatorStates.Play:
                Animator.setControlVisiblity(this.animationPlay, false);

                Animator.setControlVisiblity(this.animationPrev, true);
                Animator.setControlVisiblity(this.animationNext, true);

                Animator.setControlVisiblity(this.animationPause, true);
                Animator.setControlVisiblity(this.runnerCounter, showRunner, true);
                break;
            case AnimatorStates.Paused:
                Animator.setControlVisiblity(this.animationPlay, true);
                Animator.setControlVisiblity(this.animationPause, true);

                Animator.setControlVisiblity(this.animationPrev, true);
                Animator.setControlVisiblity(this.animationNext, true);

                Animator.setControlVisiblity(this.runnerCounter, showRunner, true);
                break;
            case AnimatorStates.Stopped:
                Animator.setControlVisiblity(this.animationPlay, true);

                Animator.setControlVisiblity(this.animationPrev, true);
                Animator.setControlVisiblity(this.animationNext, true);

                Animator.setControlVisiblity(this.runnerCounter, showRunner, true);

                Animator.setControlVisiblity(this.animationPause, false);
                break;
            case AnimatorStates.Ready:
                Animator.setControlVisiblity(this.animationPlay, true);

                Animator.setControlVisiblity(this.animationPrev, false);
                Animator.setControlVisiblity(this.animationNext, false);

                Animator.setControlVisiblity(this.animationPause, false);
                Animator.setControlVisiblity(this.runnerCounter, false, true);
                break;
            default:
                Animator.setControlVisiblity(this.animationPlay, true);

                Animator.setControlVisiblity(this.animationPrev, false);
                Animator.setControlVisiblity(this.animationNext, false);

                Animator.setControlVisiblity(this.animationPause, false);
                Animator.setControlVisiblity(this.runnerCounter, false, true);
                break;
        }
    }

    public show(): void {
        this.container.style("display", "inline");
    }

    public setRunnerCounterValue(index?: number): void {
        const dataPoint: DataPoint = this.chart.data
            && this.chart.data.series
            && this.chart.data.series[this.position.series]
            && this.chart.data.series[this.position.series].data
            && this.chart.data.series[this.position.series].data[isNumber(index) ? index : this.flooredPosition.index];

        let runnerCounterValue: string = (dataPoint && dataPoint.runnerCounterValue != null)
            ? dataPoint.runnerCounterValue
            : "";

        if (dataPoint && dataPoint.runnerCounterFormatString) {
            const runnerCounterformatter = valueFormatter.create({ format: dataPoint.runnerCounterFormatString });
            runnerCounterValue = runnerCounterformatter.format(runnerCounterValue);
        }

        this.runnerCounterValue = `${this.chart.data.settings.runnerCounter.label.value} ${runnerCounterValue}`;
        this.drawCounterValue();
    }

    private drawCounterValue(): void {
        const progressText: string = this.runnerCounterValue;
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
        this.chart.clearTooltips();
        this.chart.playAnimation(delay);
        this.disableControls();
    }

    public playNext(): void {
        this.pause();

        if (this.chart.isAnimationSeriesLast(this.position)) {
            this.setDefaultValues();
            this.chart.onClearSelection();
            if (this.chart.isRepeat) {
                this.playFromStart();
            }
        } else {
            this.position = {
                series: this.position.series + 1,
                index: Animator.AnimationMinPosition.index,
            };
            this.play();
        }
    }

    public playFromStart(): void {
        this.animatorState = AnimatorStates.Play;
        this.chart.renderChart();
        this.chart.playAnimation();
        this.disableControls();
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
