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

namespace powerbi.extensibility.visual.test {
    import PulseChartData = powerbi.extensibility.visual.test.PulseChartData;
    import PulseChartBuilder = powerbi.extensibility.visual.test.PulseChartBuilder;
    import VisualClass = powerbi.extensibility.visual.PulseChart1459209850231.PulseChart;
    import mocks = powerbi.extensibility.utils.test.mocks;

    // powerbi.extensibility.utils.test
    import helpers = powerbi.extensibility.utils.test.helpers;

    // powerbi.extensibility.utils.formatting
    const DefaultTimeout: number = 300;

    describe("PulseChartTests", () => {
        let visualBuilder: PulseChartBuilder,
            defaultDataViewBuilder: PulseChartData,
            dataView: DataView,
            dataViewForCategoricalColumn: DataView;

        beforeEach(() => {
            visualBuilder = new PulseChartBuilder(1000, 500);
            defaultDataViewBuilder = new PulseChartData();
            dataView = defaultDataViewBuilder.getDataView();
        });

        describe("DOM tests", () => {

            it("main element was created", () => {
                () => expect(visualBuilder.mainElement.get(0)).toBeDefined();
            });
            it("update", (done) => {
                visualBuilder.updateRenderTimeout(dataView, () => {
                    expect(visualBuilder.mainElement.children("g.y.axis").children("g.tick").get(0)).toBeDefined();
                    expect(visualBuilder.animationDot.get(0)).toBeDefined();
                    expect(visualBuilder.lineContainer.children("path.line").get(0)).toBeDefined();
                    expect(visualBuilder.tooltipContainer.get(0)).toBeDefined();
                    done();
                }, DefaultTimeout);
            });

            describe("popup", () => {
                beforeEach(() => {
                    dataView.metadata.objects = {
                        popup: {
                            show: true
                        }
                    };
                });

                it("click", (done) => {
                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.tooltipContainer.first().get(0)).toBeDefined();
                    const clickPoint: JQuery = visualBuilder.mainElement.find(visualBuilder.dotsContainerDot).first();
                    clickPoint.d3Click(5, 5);
                    setTimeout(() => {
                        expect(visualBuilder.tooltipContainerTooltip.first().get(0)).toBeDefined();
                        done();
                    }, DefaultTimeout);
                });

                it("time data should fit time box", (done) => {
                    let view: DataView = defaultDataViewBuilder.getDataViewWithNumbersInsteadDate();

                    visualBuilder.updateFlushAllD3Transitions(view);
                    expect(visualBuilder.tooltipContainer.first().get(0)).toBeDefined();
                    const clickPoint: JQuery = visualBuilder.mainElement.find(visualBuilder.dotsContainerDot).first();
                    clickPoint.d3Click(5, 5);

                    setTimeout(() => {
                        debugger;
                        const timeRectWidth: number = (<SVGPathElement>d3.select(".tooltipTimeRect")[0][0]).getClientRects()[0].width,
                            dataWidth: number = (<SVGPathElement>d3.select(".tooltipTime")[0][0]).getClientRects()[0].width;
                        expect(dataWidth).toBeLessThanOrEqual(timeRectWidth);
                        done();
                    }, DefaultTimeout);
                });
            });

            describe("xAxis", () => {
                it("duplicate values", (done) => {
                    visualBuilder.viewport.width = 2000;
                    visualBuilder.updateRenderTimeout(dataView, () => {
                        let tickTextValues: string[] = visualBuilder.xAxisNodeTick.children("text").toArray().map($).map(x => x.text());
                        for (let i = 0; i < tickTextValues.length - 1; i++) {
                            expect(tickTextValues[i]).not.toEqual(tickTextValues[i + 1]);
                        }

                        done();
                    }, DefaultTimeout);
                });
            });

            describe("playback", () => {
                it("autoplay position set", (done) => {
                    dataView.metadata.objects = {
                        playback: {
                            autoplay: true,
                            position: {
                                series: 0,
                                index: dataView.categorical.categories[0].values.length / 2
                            }
                        }
                    };
                    visualBuilder.updateRenderTimeout(dataView, () => {
                        let pathElem: JQuery = visualBuilder.lineContainer.children("path.line");
                        let chartWidth: number = visualBuilder.chart[0].getBoundingClientRect().width;
                        let pathWidth: number = pathElem[0].getBoundingClientRect().width;

                        expect(pathWidth).toBeGreaterThan(chartWidth / 10);
                        done();
                    }, 3000);
                });

                it("popup is hidden when pressing play during pause", (done) => {
                    let eventIndex: number = dataView.categorical.categories[1].values
                        .map((x, i) => <any>{ value: x, index: i }).filter(x => x.value)[0].index;
                    dataView.metadata.objects = {
                        playback: {
                            autoplay: true,
                            position: {
                                series: 0,
                                index: eventIndex - 1
                            }
                        }
                    };

                    visualBuilder.updateRenderTimeout(dataView, () => {
                        visualBuilder.animationNext.d3Click(5, 5);
                        helpers.renderTimeout(() => {
                            let popup: JQuery = visualBuilder.tooltipContainerTooltip.first();
                            expect(popup.get(0)).toBeDefined();
                            visualBuilder.animationPlay.d3Click(5, 5);
                            helpers.renderTimeout(() => {
                                let popup = visualBuilder.tooltipContainerTooltip.first();
                                expect(popup.get(0)).not.toBeDefined();
                                done();
                            }, DefaultTimeout);
                        }, DefaultTimeout);
                    }, DefaultTimeout);
                });

                it("popup is vissible when pressing next", (done) => {
                    let eventIndex: number = dataView.categorical.categories[1].values
                        .map((x, i) => <any>{ value: x, index: i }).filter(x => x.value)[1].index;
                    dataView.metadata.objects = {
                        playback: {
                            autoplay: true,
                            position: {
                                series: 0,
                                index: eventIndex
                            }
                        }
                    };

                    visualBuilder.updateRenderTimeout(dataView, () => {
                        visualBuilder.animationNext.d3Click(5, 5);
                        helpers.renderTimeout(() => {
                            let popup = visualBuilder.tooltipContainerTooltip.first();
                            expect(popup.get(0)).toBeDefined();
                            done();
                        }, DefaultTimeout);
                    }, DefaultTimeout);
                });

                it("popup is visible when pressing prev", (done) => {
                    let eventIndex: number = dataView.categorical.categories[1].values
                        .map((x, i) => <any>{ value: x, index: i }).filter(x => x.value)[2].index;
                    dataView.metadata.objects = {
                        playback: {
                            autoplay: true,
                            position: {
                                series: 0,
                                index: eventIndex
                            }
                        }
                    };

                    visualBuilder.updateRenderTimeout(dataView, () => {
                        visualBuilder.updateRenderTimeout(dataView, () => {
                            visualBuilder.animationNext.d3Click(5, 5);
                            helpers.renderTimeout(() => {
                                helpers.renderTimeout(() => {
                                    visualBuilder.animationNext.d3Click(5, 5);
                                    helpers.renderTimeout(() => {
                                        visualBuilder.animationPrev.d3Click(5, 5);
                                        helpers.renderTimeout(() => {
                                            let popup: JQuery = visualBuilder.tooltipContainerTooltip.first();
                                            expect(popup.get(0)).toBeDefined();
                                            done();
                                        }, DefaultTimeout);
                                    }, DefaultTimeout);
                                }, DefaultTimeout);
                            }, DefaultTimeout);
                        });

                    });
                });
            });

            describe("selection with single date", () => {
                let dataViewSingleDate: DataView;

                beforeEach(() => {
                    dataViewSingleDate = defaultDataViewBuilder.getDataViewWithSingleDate();
                });

                it("select click", (done) => {
                    visualBuilder.updateRenderTimeout(dataView, () => {
                        expect( () =>  {
                            // apply filtered date
                            visualBuilder.updateRenderTimeout(dataViewSingleDate, () => {
                                const clickPoint: JQuery = visualBuilder.mainElement.first();
                                clickPoint.click();
                                done();
                            }, DefaultTimeout);
                        }).not.toThrow();
                    }, DefaultTimeout);
                });
            });

            describe("dots rendering", () => {
                const transparency: number = 50,
                    opacity: number = 1 - (transparency / 100);

                beforeEach(() => {
                    dataView.metadata.objects = {
                        dots: {
                            transparency: transparency
                        }
                    };
                });

                it("should respond on transparancy change", (done) => {
                    visualBuilder.updateRenderTimeout(dataView, () => {
                        helpers.renderTimeout(() => {
                            expect(visualBuilder.dotsContainerDot.first().prop("style")["opacity"]).toBe(opacity.toString());
                            done();
                        });
                    });
                });
            });
        });

        describe("PulseChart.converter", () => {
            beforeEach(() => {
                dataViewForCategoricalColumn = defaultDataViewBuilder.getDataView(null, true);
            });

            it("date values provided as string should be converted to Date type", () => {
                let host: IVisualHost = mocks.createVisualHost();

                let convertedData: ChartData = VisualClass.converter(dataViewForCategoricalColumn, host, null, null);

                expect(convertedData.categories.every(d => d instanceof Date)).toBeTruthy();
            });
        });
    });
}
