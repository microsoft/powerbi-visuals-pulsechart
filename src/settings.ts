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
    // powerbi.extensibility.utils.dataview
    import DataViewObjectsParser = utils.dataview.DataViewObjectsParser;
    import ValueFormatterOptions = utils.formatting.ValueFormatterOptions;

    export class PulseChartSettings extends DataViewObjectsParser {
        popup: PopupSettings = new PopupSettings();
        dots: DotsSettings = new DotsSettings();
        gaps: GapsSettings = new GapsSettings();
        series: SeriesSettings = new SeriesSettings();
        xAxis: XAxisSettings = new XAxisSettings();
        yAxis: YAxisSettings = new YAxisSettings;
        playback: PlaybackSettings = new PlaybackSettings();
        runnerCounter: RunnerCounterSettings = new RunnerCounterSettings();
    }

    export class PopupSettings {
        show: boolean = true;
        alwaysOnTop: boolean = false;
        width: number = 100;
        height: number = 80;
        color: string = "#808181";
        fontSize: number = 10;
        fontColor: string = "#ffffff";
        showTime: boolean = true;
        showTitle: boolean = true;
        timeColor: string = "#ffffff";
        timeFill: string = "#010101";
    }

    export class DotsSettings {
        color: string = "#808181";
        size: number = 5;
        minSize: number = 5;
        maxSize: number = 20;
        transparency: number = 25;
    }

    export class GapsSettings {
        show: boolean = false;
        transparency: number = 1;
    }

    export class SeriesSettings {
        fill: string = "#3779B7";
        width: number = 2;
    }

    export class AxisSettings {
        formatterOptions?: ValueFormatterOptions;
        fontColor: string = "#777777";
        color: string = "#777777";
        show: boolean = true;
    }

    export class XAxisSettings extends AxisSettings {
        backgroundColor: string = "#E1F2F7";
        position: XAxisPosition = XAxisPosition.Center;
        dateFormat?: XAxisDateFormat = XAxisDateFormat.TimeOnly;
    }

    export class YAxisSettings extends AxisSettings { }

    export class PlaybackSettings {
        autoplay: boolean = false;
        repeat: boolean = false;
        playSpeed: number = 5;
        pauseDuration: number = 10;
        autoplayPauseDuration: number = 0;
        color: string = "#777777";
        position: AnimationPosition = null;
    }

    export class RunnerCounterSettings {
        show: boolean = true;
        label: string = "";
        position: RunnerCounterPosition = RunnerCounterPosition.TopRight;
        fontSize: number = 13;
        fontColor: string = "#777777";
    }
}
