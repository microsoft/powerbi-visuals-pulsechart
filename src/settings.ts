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


import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
import ValueFormatterOptions = valueFormatter.ValueFormatterOptions;

import { AnimationPosition } from "./models/models";
import { RunnerCounterPosition, XAxisPosition, XAxisDateFormat } from "./enum/enums";

export class PulseChartSettings extends DataViewObjectsParser {
    public popup: PopupSettings = new PopupSettings();
    public dots: DotsSettings = new DotsSettings();
    public gaps: GapsSettings = new GapsSettings();
    public series: SeriesSettings = new SeriesSettings();
    public xAxis: XAxisSettings = new XAxisSettings();
    public yAxis: YAxisSettings = new YAxisSettings;
    public playback: PlaybackSettings = new PlaybackSettings();
    public runnerCounter: RunnerCounterSettings = new RunnerCounterSettings();
}

export class PopupSettings {
    public show: boolean = true;
    public alwaysOnTop: boolean = false;
    public width: number = 100;
    public height: number = 80;
    public color: string = "#808181";
    public fontSize: number = 10;
    public fontColor: string = "#ffffff";
    public showTime: boolean = true;
    public showTitle: boolean = true;
    public timeColor: string = "#ffffff";
    public timeFill: string = "#010101";
    public stroke: string = undefined;
}

export class DotsSettings {
    public color: string = "#808181";
    public size: number = 5;
    public minSize: number = 5;
    public maxSize: number = 20;
    public transparency: number = 25;
}

export class GapsSettings {
    public show: boolean = false;
    public transparency: number = 1;
}

export class SeriesSettings {
    public fill: string = "#3779B7";
    public width: number = 2;
}

export class AxisSettings {
    public formatterOptions?: ValueFormatterOptions;
    public fontColor: string = "#777777";
    public color: string = "#777777";
    public show: boolean = true;
}

export class XAxisSettings extends AxisSettings {
    public backgroundColor: string = "#E1F2F7";
    public position: XAxisPosition = XAxisPosition.Center;
    public dateFormat?: XAxisDateFormat = XAxisDateFormat.TimeOnly;
}

export class YAxisSettings extends AxisSettings { }

export class PlaybackSettings {
    public autoplay: boolean = false;
    public repeat: boolean = false;
    public playSpeed: number = 5;
    public pauseDuration: number = 10;
    public autoplayPauseDuration: number = 0;
    public color: string = "#777777";
    public position: AnimationPosition = null;
}

export class RunnerCounterSettings {
    public show: boolean = true;
    public label: string = "";
    public position: RunnerCounterPosition = RunnerCounterPosition.TopRight;
    public fontSize: number = 13;
    public fontColor: string = "#777777";
}
