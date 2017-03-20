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

    export const pulseChartProps = {
        series: {
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'series', propertyName: 'fill' },
            width: <DataViewObjectPropertyIdentifier>{ objectName: 'series', propertyName: 'width' }
        },
        gaps: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'gaps', propertyName: 'show' },
            transparency: <DataViewObjectPropertyIdentifier>{ objectName: 'gaps', propertyName: 'transparency' }
        },
        general: {
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'fill' }
        },
        popup: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'popup', propertyName: 'show' },
            alwaysOnTop: <DataViewObjectPropertyIdentifier>{ objectName: 'popup', propertyName: 'alwaysOnTop' },
            width: <DataViewObjectPropertyIdentifier>{ objectName: 'popup', propertyName: 'width' },
            height: <DataViewObjectPropertyIdentifier>{ objectName: 'popup', propertyName: 'height' },
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'popup', propertyName: 'color' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'popup', propertyName: 'fontSize' },
            fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'popup', propertyName: 'fontColor' },
            showTime: <DataViewObjectPropertyIdentifier>{ objectName: 'popup', propertyName: 'showTime' },
            showTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'popup', propertyName: 'showTitle' },
            timeColor: <DataViewObjectPropertyIdentifier>{ objectName: 'popup', propertyName: 'timeColor' },
            timeFill: <DataViewObjectPropertyIdentifier>{ objectName: 'popup', propertyName: 'timeFill' },
        },
        dots: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'dots', propertyName: 'color' },
            minSize: <DataViewObjectPropertyIdentifier>{ objectName: 'dots', propertyName: 'minSize' },
            maxSize: <DataViewObjectPropertyIdentifier>{ objectName: 'dots', propertyName: 'maxSize' },
            size: <DataViewObjectPropertyIdentifier>{ objectName: 'dots', propertyName: 'size' },
            transparency: <DataViewObjectPropertyIdentifier>{ objectName: 'dots', propertyName: 'transparency' }
        },
        xAxis: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'show' },
            position: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'position' },
            fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'fontColor' },
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'color' },
            backgroundColor: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'backgroundColor' }
        },
        yAxis: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'show' },
            fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'fontColor' },
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'color' }
        },
        playback: {
            autoplay: <DataViewObjectPropertyIdentifier>{ objectName: 'playback', propertyName: 'autoplay' },
            playSpeed: <DataViewObjectPropertyIdentifier>{ objectName: 'playback', propertyName: 'playSpeed' },
            pauseDuration: <DataViewObjectPropertyIdentifier>{ objectName: 'playback', propertyName: 'pauseDuration' },
            autoplayPauseDuration: <DataViewObjectPropertyIdentifier>{ objectName: 'playback', propertyName: 'autoplayPauseDuration' },
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'playback', propertyName: 'color' },
            position: <DataViewObjectPropertyIdentifier>{ objectName: 'playback', propertyName: 'position' }
        },
        runnerCounter: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'runnerCounter', propertyName: 'show' },
            label: <DataViewObjectPropertyIdentifier>{ objectName: 'runnerCounter', propertyName: 'label' },
            position: <DataViewObjectPropertyIdentifier>{ objectName: 'runnerCounter', propertyName: 'position' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'runnerCounter', propertyName: 'fontSize' },
            fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'runnerCounter', propertyName: 'fontColor' },
        },
    };
}
