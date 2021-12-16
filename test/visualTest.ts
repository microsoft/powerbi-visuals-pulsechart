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
import { select as d3Select } from "d3-selection";
import 'd3-transition';

import DataView = powerbiVisualsApi.DataView;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;

import { createColorPalette, createVisualHost, renderTimeout, d3Click } from "powerbi-visuals-utils-testutils";

import { ColorHelper } from "powerbi-visuals-utils-colorutils";

import { VisualData } from "./visualData";
import { VisualBuilder } from "./visualBuilder";
import { areColorsEqual } from "./helpers";

import { ChartData } from "../src/models/models";
import { Visual as VisualClass } from "../src/visual";

const DefaultTimeout: number = 500;

describe("PulseChartTests", () => {
    let visualBuilder: VisualBuilder,
        defaultDataViewBuilder: VisualData,
        dataView: DataView,
        dataViewForCategoricalColumn: DataView;

    beforeEach(() => {
        visualBuilder = new VisualBuilder(1000, 500);
        defaultDataViewBuilder = new VisualData();
        dataView = defaultDataViewBuilder.getDataView();
    });

    describe("DOM tests", () => {

        it("main element was created", () => {
            expect(visualBuilder.mainElement).toBeDefined();
        });
        // it("update", (done) => {
        //     visualBuilder.updateRenderTimeout(dataView, () => {
        //         expect(visualBuilder.mainElement.querySelector("g.y.axis").querySelector("g.tick")).toBeDefined();
        //         expect(visualBuilder.animationDot).toBeDefined();
        //         expect(visualBuilder.lineContainer.querySelector("path.line")).toBeDefined();
        //         expect(visualBuilder.tooltipContainer).toBeDefined();
        //         done();
        //     }, DefaultTimeout);
        // });

        // describe("popup", () => {
        //     beforeEach(() => {
        //         dataView.metadata.objects = {
        //             popup: {
        //                 show: true
        //             }
        //         };
        //     });

        //     it("click", (done) => {
        //         visualBuilder.updateFlushAllD3Transitions(dataView);
        //         expect(visualBuilder.tooltipContainer.first().get(0)).toBeDefined();
        //         const clickPoint: SVGElement = visualBuilder.mainElement.find(visualBuilder.dotsContainerDot).first();
        //         d3Click(clickPoint, 5, 5);
        //         setTimeout(() => {
        //             expect(visualBuilder.tooltipContainerTooltip.first().get(0)).toBeDefined();
        //             done();
        //         }, DefaultTimeout);
        //     });

        //     it("time data should fit time box", (done) => {
        //         let view: DataView = defaultDataViewBuilder.getDataViewWithNumbersInsteadDate();
               
        //         visualBuilder.updateFlushAllD3Transitions(view);
        //         expect(visualBuilder.tooltipContainer.first().get(0)).toBeDefined();
        //         const clickPoint: JQuery = visualBuilder.mainElement.find(visualBuilder.dotsContainerDot).first();
        //         d3Click(clickPoint, 5, 5);

        //         setTimeout(() => {
        //             debugger;
        //             const timeRectWidth: number = (<HTMLElement>d3Select(".tooltipTimeRect").node()).getBoundingClientRect().width,
        //                 dataWidth: number = (<HTMLElement>d3Select(".tooltipTime").node()).getBoundingClientRect().width;

        //             expect(dataWidth).toBeLessThanOrEqual(timeRectWidth);
        //             done();
        //         }, DefaultTimeout);
        //     });
        // });

        // describe("xAxis", () => {
        //     it("duplicate values", (done) => {
        //         visualBuilder.viewport.width = 2000;
        //         visualBuilder.updateRenderTimeout(dataView, () => {
        //             let tickTextValues: string[] = visualBuilder.xAxisNodeTick.children("text").toArray().map($).map(x => x.text());
        //             for (let i = 0; i < tickTextValues.length - 1; i++) {
        //                 expect(tickTextValues[i]).not.toEqual(tickTextValues[i + 1]);
        //             }

        //             done();
        //         }, DefaultTimeout);
        //     });
        // });

        // describe("playback", () => {
        //     let originalTimeout;

        //     beforeEach(function () {
        //         originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        //         jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        //     });

        //     it("autoplay position set", (done) => {
        //         dataView.metadata.objects = {
        //             playback: {
        //                 autoplay: true,
        //                 position: {
        //                     series: 0,
        //                     index: dataView.categorical.categories[0].values.length / 2
        //                 }
        //             }
        //         };
        //         visualBuilder.updateRenderTimeout(dataView, () => {
        //             let pathElem: JQuery = visualBuilder.lineContainer.children("path.line");
        //             let chartWidth: number = visualBuilder.chart[0].getBoundingClientRect().width;
        //             let pathWidth: number = pathElem[0].getBoundingClientRect().width;

        //             expect(pathWidth).toBeGreaterThan(30);
        //             done();
        //         }, DefaultTimeout * 10);
        //     });

        //     it("repeat animation", (done) => {
        //         dataView.metadata.objects = {
        //             playback: {
        //                 repeat: true
        //             }
        //         };
        //         visualBuilder.updateRenderTimeout(dataView, () => {
        //             d3Click(visualBuilder.animationPlay, 5, 5);
        //             let animatedDot: JQuery = visualBuilder.dotsContainerDot;
        //             visualBuilder.updateRenderTimeout(dataView, () => {
        //                 d3Click(visualBuilder.animationPlay, 5, 5);
        //                 let currentAnimatedDot: JQuery = visualBuilder.dotsContainerDot;

        //                 expect(currentAnimatedDot).not.toEqual(animatedDot);
        //                 done();
        //             }, DefaultTimeout * 5);
        //         }, DefaultTimeout * 5);
        //     });

        //     it("popup is hidden when pressing play during pause", (done) => {
        //         let eventIndex: number = dataView.categorical.categories[1].values
        //             .map((x, i) => <any>{ value: x, index: i }).filter(x => x.value)[0].index;
        //         dataView.metadata.objects = {
        //             playback: {
        //                 autoplay: true,
        //                 position: {
        //                     series: 0,
        //                     index: eventIndex - 1
        //                 }
        //             }
        //         };

        //         visualBuilder.updateRenderTimeout(dataView, () => {
        //             d3Click(visualBuilder.animationNext, 5, 5);
        //             renderTimeout(() => {
        //                 let popup: JQuery = visualBuilder.tooltipContainerTooltip.first();
        //                 expect(popup.get(0)).toBeDefined();
        //                 d3Click(visualBuilder.animationPlay, 5, 5);
        //                 renderTimeout(() => {
        //                     let popup = visualBuilder.tooltipContainerTooltip.first();
        //                     expect(popup.get(0)).not.toBeDefined();
        //                     done();
        //                 }, DefaultTimeout);
        //             }, DefaultTimeout);
        //         }, DefaultTimeout);
        //     });

        //     it("popup is vissible when pressing next", (done) => {
        //         let eventIndex: number = dataView.categorical.categories[1].values
        //             .map((x, i) => <any>{ value: x, index: i }).filter(x => x.value)[1].index;
        //         dataView.metadata.objects = {
        //             playback: {
        //                 autoplay: true,
        //                 position: {
        //                     series: 0,
        //                     index: eventIndex
        //                 }
        //             }
        //         };

        //         visualBuilder.updateRenderTimeout(dataView, () => {
        //             d3Click(visualBuilder.animationNext, 5, 5);
        //             renderTimeout(() => {
        //                 let popup = visualBuilder.tooltipContainerTooltip.first();
        //                 expect(popup.get(0)).toBeDefined();
        //                 done();
        //             }, DefaultTimeout);
        //         }, DefaultTimeout);
        //     });

        //     it("popup is visible when pressing prev", (done) => {
        //         let eventIndex: number = dataView.categorical.categories[1].values
        //             .map((x, i) => <any>{ value: x, index: i }).filter(x => x.value)[2].index;
        //         dataView.metadata.objects = {
        //             playback: {
        //                 autoplay: true,
        //                 position: {
        //                     series: 0,
        //                     index: eventIndex
        //                 }
        //             }
        //         };

        //         visualBuilder.updateRenderTimeout(dataView, () => {
        //             visualBuilder.updateRenderTimeout(dataView, () => {
        //                 d3Click(visualBuilder.animationNext, 5, 5);
        //                 renderTimeout(() => {
        //                     renderTimeout(() => {
        //                         d3Click(visualBuilder.animationNext, 5, 5);
        //                         renderTimeout(() => {
        //                             d3Click(visualBuilder.animationPrev, 5, 5);
        //                             renderTimeout(() => {
        //                                 let popup: JQuery = visualBuilder.tooltipContainerTooltip.first();
        //                                 expect(popup.get(0)).toBeDefined();
        //                                 done();
        //                             }, DefaultTimeout);
        //                         }, DefaultTimeout);
        //                     }, DefaultTimeout);
        //                 }, DefaultTimeout);
        //             });

        //         });
        //     });

        //     afterEach(function () {
        //         jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        //     });
        // });

        // describe("selection with single date", () => {
        //     let dataViewSingleDate: DataView;

        //     beforeEach(() => {
        //         dataViewSingleDate = defaultDataViewBuilder.getDataViewWithSingleDate();
        //     });

        //     it("select click", (done) => {
        //         visualBuilder.updateRenderTimeout(dataView, () => {
        //             expect(() => {
        //                 // apply filtered date
        //                 visualBuilder.updateRenderTimeout(dataViewSingleDate, () => {
        //                     const clickPoint: JQuery = visualBuilder.mainElement.first();
        //                     clickPoint.click();
        //                     done();
        //                 }, DefaultTimeout);
        //             }).not.toThrow();
        //         }, DefaultTimeout);
        //     });
        // });

        // describe("dots rendering", () => {
        //     const transparency: number = 50,
        //         opacity: number = 1 - (transparency / 100);

        //     beforeEach(() => {
        //         dataView.metadata.objects = {
        //             dots: {
        //                 transparency: transparency
        //             }
        //         };
        //     });

        //     it("should respond on transparancy change", (done) => {
        //         visualBuilder.updateRenderTimeout(dataView, () => {
        //             renderTimeout(() => {
        //                 expect(visualBuilder.dotsContainerDot.first().prop("style")["opacity"]).toBe(opacity.toString());
        //                 done();
        //             });
        //         });
        //     });
        // });
    });

    // describe("PulseChart.converter", () => {
    //     let colorHelper: ColorHelper;

    //     beforeEach(() => {
    //         dataViewForCategoricalColumn = defaultDataViewBuilder.getDataView(null, true);

    //         colorHelper = new ColorHelper(createColorPalette());
    //     });

    //     it("date values provided as string should be converted to Date type", () => {
    //         let host: IVisualHost = createVisualHost();

    //         let convertedData: ChartData = VisualClass.CONVERTER(dataViewForCategoricalColumn, host, colorHelper, null);

    //         expect(convertedData.categories.every(d => d instanceof Date)).toBeTruthy();
    //     });

    //     it("values provided as string should be processed as zero values", () => {
    //         let host: IVisualHost = createVisualHost();
    //         dataViewForCategoricalColumn.categorical.values["0"].values[12] = "<scrutp> test test non number value";
    //         dataViewForCategoricalColumn.categorical.values["0"].values[18] = ">>> #$%^$^scrutp> test test non number value";
    //         let convertedData: ChartData = VisualClass.CONVERTER(dataViewForCategoricalColumn, host, colorHelper, null);
    //         expect(convertedData.series["0"].data.every(d => !isNaN(d.y))).toBeTruthy();
    //     });

    //     it("EventSize provided as string should be processed as zero values", () => {
    //         let host: IVisualHost = createVisualHost();
    //         let convertedData: ChartData = VisualClass.CONVERTER(dataViewForCategoricalColumn, host, colorHelper, null);
    //         expect(convertedData.series["0"].data.every(d => !isNaN(d.eventSize))).toBeTruthy();
    //     });

    // });

    // describe("Capabilities tests", () => {
    //     it("all items having displayName should have displayNameKey property", () => {
    //         jasmine.getJSONFixtures().fixturesPath = "base";

    //         let jsonData = getJSONFixture("capabilities.json");

    //         let objectsChecker: Function = (obj) => {
    //             for (let property in obj) {
    //                 let value: any = obj[property];

    //                 if (value.displayName) {
    //                     expect(value.displayNameKey).toBeDefined();
    //                 }

    //                 if (typeof value === "object") {
    //                     objectsChecker(value);
    //                 }
    //             }
    //         };

    //         objectsChecker(jsonData);
    //     });
    // });

    // describe("Popup", () => {
    //     it("should not be shown when data point empty", done => {
    //         let result = visualBuilder.visualInstance.isPopupShow(<any>{});
    //         expect(result).toBeFalsy();
    //         done();
    //     });

    //     it("should not be shown when selected false or undefined", done => {
    //         let result = visualBuilder.visualInstance.isPopupShow(<any>{ popupInfo: {}, selected: false });
    //         expect(result).toBeFalsy();

    //         result = visualBuilder.visualInstance.isPopupShow(<any>{ popupInfo: {} });
    //         expect(result).toBeFalsy();
    //         done();
    //     });

    //     it("should not be shown when animation is playing", done => {
    //         visualBuilder.visualInstance.animationIsPlaying = () => true;
    //         let result = visualBuilder.visualInstance.isPopupShow(<any>{ popupInfo: {}, selected: true });
    //         expect(result).toBeFalsy();
    //         done();
    //     });

    //     it("should be shown when all good", done => {
    //         let visual = visualBuilder.visualInstance;
    //         visual.data = <any>{
    //             settings: {
    //                 popup: {
    //                     show: true,
    //                     height: 100
    //                 }
    //             }
    //         };

    //         visualBuilder.visualInstance.animationIsPlaying = () => false;
    //         let result = visualBuilder.visualInstance.isPopupShow(<any>{ popupInfo: {}, selected: true });
    //         expect(result).toBeTruthy();
    //         done();
    //     });
    // });

    // describe("SetSelection", () => {
    //     let visualInst;

    //     beforeEach(() => {
    //         visualInst = visualBuilder.visualInstance;
    //         visualInst.behavior = jasmine.createSpyObj("behavior", ["setSelection"]);
    //     });

    //     it("should not be invoked with null argument", () => {
    //         visualInst.handleSelection(null);
    //         expect(visualInst.behavior.setSelection).not.toHaveBeenCalled();
    //     });

    //     it("should be invoked when data point has popupInfo", () => {
    //         spyOn(visualInst, "getDatapointFromPosition").and.returnValue({ popupInfo: {} });
    //         visualInst.handleSelection(<any>{});
    //         expect(visualInst.behavior.setSelection).toHaveBeenCalled();
    //     });

    //     it("should not be invoked when data point is null", () => {
    //         spyOn(visualInst, "getDatapointFromPosition").and.returnValue(null);
    //         visualInst.handleSelection(null);
    //         expect(visualInst.behavior.setSelection).not.toHaveBeenCalled();
    //     });

    //     it("should not be invoked when data point has not popupInfo", () => {
    //         spyOn(visualInst, "getDatapointFromPosition").and.returnValue({});
    //         visualInst.handleSelection(null);
    //         expect(visualInst.behavior.setSelection).not.toHaveBeenCalled();
    //     });
    // });

    // describe("Accessibility", () => {
    //     describe("High contrast mode", () => {
    //         const backgroundColor: string = "#000000";
    //         const foregroundColor: string = "#ffff00";

    //         beforeEach(() => {
    //             visualBuilder.visualHost.colorPalette.isHighContrast = true;

    //             visualBuilder.visualHost.colorPalette.background = { value: backgroundColor };
    //             visualBuilder.visualHost.colorPalette.foreground = { value: foregroundColor };
    //         });

    //         it("should use theme foreground color as stroke of line", (done) => {
    //             visualBuilder.updateRenderTimeout(dataView, () => {
    //                 expect(isColorAppliedToElements([visualBuilder.linePath], null, "stroke"));

    //                 done();
    //             });
    //         });

    //         it("should use theme background color as fill of rect of axis tick", (done) => {
    //             visualBuilder.updateRenderTimeout(dataView, () => {
    //                 const rects: JQuery<any>[] = visualBuilder.xAxisNodeRect.toArray().map($);

    //                 expect(isColorAppliedToElements(rects, foregroundColor, "fill"));

    //                 done();
    //             });
    //         });

    //         function isColorAppliedToElements(
    //             elements: JQuery[],
    //             color?: string,
    //             colorStyleName: string = "fill"
    //         ): boolean {
    //             return elements.some((element: JQuery) => {
    //                 const currentColor: string = element.css(colorStyleName);

    //                 if (!currentColor || !color) {
    //                     return currentColor === color;
    //                 }

    //                 return areColorsEqual(currentColor, color);
    //             });
    //         }
    //     });
    // });
});
