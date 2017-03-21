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
    import UpdateSelection = d3.selection.Update;

    // powerbi
    import DataView = powerbi.DataView;
    import IViewport = powerbi.IViewport;

    // powerbi.extensibility.utils.dataview
    import DataViewObject = utils.dataview.DataViewObject;
    import DataViewObjects = utils.dataview.DataViewObjects;

    // powerbi.extensibility.utils.svg
    import IRect = utils.svg.IRect;
    import SVGUtil = utils.svg;
    import IMargin = utils.svg.IMargin;
    import translate = utils.svg.translate;
    import ClassAndSelector = utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = utils.svg.CssConstants.createClassAndSelector;

    // powerbi.extensibility.utils.formatting
    import valueFormatter = utils.formatting.valueFormatter;
    import ValueFormatterOptions = utils.formatting.ValueFormatterOptions;
    import TextProperties = utils.formatting.TextProperties;
    import IValueFormatter = utils.formatting.IValueFormatter;
    import textMeasurementService = utils.formatting.textMeasurementService;

    // powerbi.extensibility.utils.interactivity
    import appendClearCatcher = utils.interactivity.appendClearCatcher;
    import SelectableDataPoint = utils.interactivity.SelectableDataPoint;
    import IInteractiveBehavior = utils.interactivity.IInteractiveBehavior;
    import IInteractivityService = utils.interactivity.IInteractivityService;
    import createInteractivityService = utils.interactivity.createInteractivityService;

    // powerbi.extensibility.utils.tooltip
    import TooltipEventArgs = utils.tooltip.TooltipEventArgs;
    import ITooltipServiceWrapper = utils.tooltip.ITooltipServiceWrapper;
    import TooltipEnabledDataPoint = utils.tooltip.TooltipEnabledDataPoint;
    import createTooltipServiceWrapper = utils.tooltip.createTooltipServiceWrapper;

    // powerbi.extensibility.utils.color
    import ColorHelper = utils.color.ColorHelper;

    // powerbi.extensibility.utils.chart
    import LegendModule = utils.chart.legend;
    import ILegend = utils.chart.legend.ILegend;
    import LegendData = utils.chart.legend.LegendData;
    import LegendDataModule = utils.chart.legend.data;
    import LegendIcon = utils.chart.legend.LegendIcon;
    import legendProps = utils.chart.legend.legendProps;
    import legendPosition = utils.chart.legend.position;
    import createLegend = utils.chart.legend.createLegend;
    import LegendPosition = utils.chart.legend.LegendPosition;
    import ILabelLayout = utils.chart.dataLabel.ILabelLayout;
    import DataLabelManager = utils.chart.dataLabel.DataLabelManager;
    import LabelEnabledDataPoint = utils.chart.dataLabel.LabelEnabledDataPoint;

    // utils.chart
    import AxisHelper = utils.chart.axis;
    import axisScale = utils.chart.axis.scale;
    import IAxisProperties = utils.chart.axis.IAxisProperties;

    // powerbi.visuals
    import ISelectionId = powerbi.visuals.ISelectionId;

    import Axis = d3.svg.Axis;

    export interface Line extends d3.svg.Line<PulseChartDataPoint> { }
    export interface LinearScale extends d3.scale.Linear<any, any> { }
    export interface TimeScale extends d3.time.Scale<any, any> { }

    type GenericScale = TimeScale | LinearScale;
    export interface TooltipSettings {
        dataPointColor: string;
        marginTop: number;
        timeHeight: number;
    }


    export const enum PointLabelPosition {
        Above,
        Below,
    }

    export const enum Orientation {
        Vertical,
        Horizontal
    }

    export interface VisualDataLabelsSettings {
        show: boolean;
        showLabelPerSeries?: boolean;
        labelOrientation?: Orientation;
        isSeriesExpanded?: boolean;
        displayUnits?: number;
        showCategory?: boolean;
        position?: any;
        precision?: number;
        labelColor: string;
        categoryLabelColor?: string;
        fontSize?: number;
        labelStyle?: any;
    }

    export interface PointDataLabelsSettings extends VisualDataLabelsSettings {
        position: PointLabelPosition;
    }

    export interface PulseChartChartDataLabelsSettings extends PointDataLabelsSettings {
        labelDensity: string;
    }

    export interface PulseChartSeries {
        name?: string;
        displayName: string;
        lineIndex: number;
        labelSettings: PulseChartChartDataLabelsSettings;
        data: PulseChartDataPoint[];
        color: string;
        width: number;
        xAxisProperties?: PulseChartXAxisProperties;
        widthOfGap: number;
    }

    export interface PulseChartTooltipData {
        value: string;
        title: string;
        description: string;
        offsetX?: number;
    }

    export interface PulseChartAnimationPosition {
        series: number;
        index: number;
    }

    export interface PulseChartPointXY {
        x: number;
        y: number;
    }

    export interface PulseChartPrimitiveDataPoint
        extends TooltipEnabledDataPoint, SelectableDataPoint, LabelEnabledDataPoint {

        categoryValue: any;
        value: number;
        categoryIndex: number;
        seriesIndex: number;
        highlight?: boolean;
        key?: string;
        labelSettings: PulseChartChartDataLabelsSettings;
        pointColor?: string;
    }

    export interface PulseChartDataPoint extends PulseChartPrimitiveDataPoint, PulseChartPointXY {
        groupIndex: number;
        popupInfo?: PulseChartTooltipData;
        eventSize: number;
        runnerCounterValue: any;
        runnerCounterFormatString: any;
    }

    export interface PulseChartLegend extends DataViewObject {
        show?: boolean;
        showTitle?: boolean;
        titleText?: string;
        position?: LegendPosition;
    }

    export interface PulseChartPopupSettings {
        show: boolean;
        alwaysOnTop: boolean;
        width: number;
        height: number;
        color: string;
        fontSize: number;
        fontColor: string;
        showTime: boolean;
        showTitle: boolean;
        timeColor: string;
        timeFill: string;
    }

    export interface PulseChartDotsSettings {
        color: string;
        size: number;
        minSize: number;
        maxSize: number;
        transparency: number;
    }

    export enum PulseChartXAxisDateFormat {
        // DateAndTime = <any>'Date and time',
        DateOnly = <any>'Date only',
        TimeOnly = <any>'Time only'
    }

    export enum XAxisPosition {
        Center = <any>'Center',
        Bottom = <any>'Bottom',
    }

    export enum RunnerCounterPosition {
        TopLeft = <any>'Top Left',
        TopRight = <any>'Top Right'
    }

    export interface PulseChartGapsSettings {
        show: boolean;
        visibleGapsPercentage: number;
        // showByDefault: boolean;
    }

    export interface PulseChartSeriesSetting {
        fill: string;
        width: number;
    }

    export interface PulseChartPlaybackSettings {
        pauseDuration: number;
        playSpeed: number;
        autoplay: boolean;
        autoplayPauseDuration: number;
        color: string;
        position: PulseChartAnimationPosition;
    }

    export interface PulseChartRunnerCounterSettings {
        show: boolean;
        label: string;
        position: RunnerCounterPosition;
        fontSize: number;
        fontColor: string;
    }

    export interface PulseChartAxisSettings {
        formatterOptions?: ValueFormatterOptions;
        fontColor: string;
        color: string;
        show: boolean;
    }

    export interface PulseChartXAxisSettings extends PulseChartAxisSettings {
        position: XAxisPosition;
        dateFormat?: PulseChartXAxisDateFormat;
        backgroundColor: string;
    }

    export interface PulseChartYAxisSettings extends PulseChartAxisSettings { }

    export interface PulseChartSettings {
        formatStringProperty: DataViewObjectPropertyIdentifier;
        displayName?: string;
        dots: PulseChartDotsSettings;
        fillColor?: string;
        precision: number;
        legend?: PulseChartLegend;
        colors?: IColorPalette;
        series: PulseChartSeriesSetting;
        popup: PulseChartPopupSettings;
        gaps: PulseChartGapsSettings;
        xAxis: PulseChartXAxisSettings;
        yAxis: PulseChartYAxisSettings;
        runnerCounter: PulseChartRunnerCounterSettings;
        playback: PulseChartPlaybackSettings;
    }

    export interface PulseChartAxesLabels {
        x: string;
        y: string;
        y2?: string;
    }

    export interface PulseChartData {
        settings: PulseChartSettings;
        columns: PulseChartDataRoles<DataViewCategoricalColumn>;
        categoryMetadata: DataViewMetadataColumn;
        hasHighlights: boolean;

        dots: PulseChartDataPoint[];
        series: PulseChartSeries[];
        isScalar?: boolean;
        dataLabelsSettings: PointDataLabelsSettings;
        axesLabels: PulseChartAxesLabels;
        hasDynamicSeries?: boolean;
        defaultSeriesColor?: string;
        categoryData?: PulseChartPrimitiveDataPoint[];

        categories: any[];
        legendData?: LegendData;

        grouped: DataViewValueColumnGroup[];

        xScale?: TimeScale | LinearScale;
        commonYScale?: LinearScale;
        yScales?: LinearScale[];
        yAxis?: Axis;

        widthOfXAxisLabel: number;
        widthOfTooltipValueLabel: number;
        heightOfTooltipDescriptionTextLine: number;
        runnerCounterHeight: number;
    }

    export interface PulseChartXAxisProperties {
        values: (Date | number)[];
        scale: TimeScale;
        axis: Axis;
        rotate: boolean;
    }

    export interface PulseChartDataRoles<T> {
        Timestamp?: T;
        Category?: T;
        Value?: T;
        EventTitle?: T;
        EventDescription?: T;
        EventSize?: T;
        RunnerCounter?: T;
    }

    export interface PulseChartElementDimensions {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    export interface PulseChartBehaviorOptions {
        selection: Selection<any>;
        clearCatcher: Selection<any>;
        interactivityService: IInteractivityService;
        hasHighlights: boolean;
        onSelectCallback(): void;
    }

    export interface IPulseChartInteractiveBehavior extends IInteractiveBehavior {
        setSelection(d: PulseChartDataPoint): void;
    }

    export enum PulseAnimatorStates {
        Ready,
        Play,
        Paused,
        Stopped,
    }

    export class PulseChart implements IVisual {
        public static RoleDisplayNames = <PulseChartDataRoles<string>>{
            Timestamp: "Timestamp",
            Category: "Category",
            Value: "Value",
            EventTitle: "Event Title",
            EventDescription: "Event Description",
            EventSize: "Event Size",
            RunnerCounter: "Runner Counter",
        };

        private static DefaultMargin: IMargin = {
            top: 20,
            bottom: 20,
            right: 25,
            left: 25,
        };

        private static DefaultViewport: IViewport = {
            width: 50,
            height: 50
        };

        private static PlaybackButtonsHeight = 26;
        private static PopupMinHeight: number = 20;
        private static PopupMinWidth: number = 20;
        private static PopupMaxHeight: number = 200;
        private static PopupMaxWidth: number = 2000;
        private static MaxWidthOfYAxis: number = 50;
        private static PopupTextPadding: number = 3;
        private static XAxisTickSpace: number = 15;
        private static XAxisTickHeight: number = 16;
        private static MinimumTicksToRotate: number = 3;
        private static AxisTickRotateAngle: number = -35;
        private static topShift: number = 20;

        private static GetPopupValueTextProperties(text?: string, fontSizeValue = 12): TextProperties {
            return {
                text: text || "",
                fontFamily: "sans-serif",
                fontSize: fontSizeValue + "px",
            };
        }

        private static GetPopupTitleTextProperties(text?: string, fontSizeValue = 12): TextProperties {
            return {
                text: text || "",
                fontFamily: "sans-serif",
                fontWeight: "bold",
                fontSize: fontSizeValue + "px",
            };
        }

        private static GetPopupDescriptionTextProperties(text?: string, fontSizeValue = 12): TextProperties {
            return {
                text: text || "",
                fontFamily: "sans-serif",
                fontSize: fontSizeValue + "px",
            };
        }

        public static GetRunnerCounterTextProperties(text?: string, fontSizeValue = 12): TextProperties {
            return {
                text: text || "",
                fontFamily: "sans-serif",
                fontSize: fontSizeValue + "px",
            };
        }

        public static ConvertTextPropertiesToStyle(textProperties: TextProperties): any {
            return {
                'font-family': textProperties.fontFamily,
                'font-weight': textProperties.fontWeight,
                'font-size': textProperties.fontSize
            };
        }

        private static GetDateTimeFormatString(dateFormatType: PulseChartXAxisDateFormat, dateFormat: string): string {
            switch (dateFormatType) {
                case PulseChartXAxisDateFormat.DateOnly: return dateFormat;
                case PulseChartXAxisDateFormat.TimeOnly: return "H:mm";
                default: return "";
            };
        }

        private static GetFullWidthOfDateFormat(dateFormat: string, textProperties: TextProperties): number {
            textProperties.text = valueFormatter.create({ format: dateFormat }).format(new Date(2000, 10, 20, 20, 20, 20));
            return textMeasurementService.measureSvgTextWidth(textProperties);
        }

        private static DefaultSettings: PulseChartSettings = {
            precision: 0,
            popup: {
                show: true,
                alwaysOnTop: false,
                width: 100,
                height: 80,
                color: "#808181",
                fontSize: 10,
                fontColor: 'white',
                showTime: true,
                showTitle: true,
                timeColor: 'white',
                timeFill: '#010101',
            },
            dots: {
                color: "#808181",
                size: 5,
                minSize: 5,
                maxSize: 20,
                transparency: 25,
            },
            gaps: {
                show: false,
                visibleGapsPercentage: 1
            },
            series: {
                fill: '#3779B7',
                width: 2,
            },
            xAxis: {
                color: "#777777",
                fontColor: "#777777",
                position: XAxisPosition.Center,
                show: true,
                dateFormat: PulseChartXAxisDateFormat.TimeOnly,
                backgroundColor: "#E1F2F7"
            },
            yAxis: {
                color: "#777777",
                fontColor: "#777777",
                show: true
            },
            playback: {
                autoplay: false,
                playSpeed: 5,
                pauseDuration: 10,
                autoplayPauseDuration: 0,
                color: "#777",
                position: null,
            },
            runnerCounter: {
                show: true,
                label: "",
                position: RunnerCounterPosition.TopRight,
                fontSize: 13,
                fontColor: "#777777"
            },
            formatStringProperty: null, // pulseChartProps["general"]["formatString"]
        };

        private static DefaultTooltipSettings: TooltipSettings = {
            dataPointColor: "#808181",
            marginTop: 20,
            timeHeight: 15,
        };

        private static MaxGapCount: number = 100;

        private static MinGapWidth = {
            'Date only': 60 * 1000 * 24,
            'Time only': 60 * 1000
        };

        private static DefaultAnimationDuration: number = 250;

        private static Chart: ClassAndSelector = createClassAndSelector('chart');
        private static Line: ClassAndSelector = createClassAndSelector('line');
        private static LineContainer: ClassAndSelector = createClassAndSelector('lineContainer');
        private static LineNode: ClassAndSelector = createClassAndSelector('lineNode');
        private static XAxisNode: ClassAndSelector = createClassAndSelector('xAxisNode');
        private static Dot: ClassAndSelector = createClassAndSelector('dot');
        private static DotsContainer: ClassAndSelector = createClassAndSelector('dotsContainer');
        private static Tooltip: ClassAndSelector = createClassAndSelector('Tooltip');
        private static TooltipRect: ClassAndSelector = createClassAndSelector('tooltipRect');
        private static TooltipTriangle: ClassAndSelector = createClassAndSelector('tooltipTriangle');
        private static Gaps: ClassAndSelector = createClassAndSelector("gaps");
        private static Gap: ClassAndSelector = createClassAndSelector("gap");
        private static GapNode: ClassAndSelector = createClassAndSelector("gapNode");
        private static TooltipLine: ClassAndSelector = createClassAndSelector('tooltipLine');
        private static TooltipTime: ClassAndSelector = createClassAndSelector('tooltipTime');
        private static TooltipTimeRect: ClassAndSelector = createClassAndSelector('tooltipTimeRect');
        private static TooltipTitle: ClassAndSelector = createClassAndSelector('tooltipTitle');
        private static TooltipDescription: ClassAndSelector = createClassAndSelector('tooltipDescription');
        private static TooltipContainer: ClassAndSelector = createClassAndSelector('tooltipContainer');
        private static AnimationDot: ClassAndSelector = createClassAndSelector('animationDot');

        private static getCategoricalColumnOfRole(dataView: DataView, roleName: string): DataViewCategoryColumn | DataViewValueColumn {
            let filterFunc = (cols: DataViewCategoricalColumn[]) => cols.filter((x) => x.source && x.source.roles && x.source.roles[roleName])[0];
            return filterFunc(dataView.categorical.categories) || filterFunc(dataView.categorical.values);
        }

        public static converter(dataView: DataView, host: IVisualHost, colors: IColorPalette, interactivityService: IInteractivityService): PulseChartData {
            if (!dataView
                || !dataView.categorical
                || !dataView.categorical.values
                || !dataView.categorical.values[0]
                || !dataView.categorical.values[0].values
                || !dataView.categorical.categories) {
                return null;
            }

            let columns: PulseChartDataRoles<DataViewCategoricalColumn> = <any>_.mapValues(PulseChart.RoleDisplayNames, (x, i) => PulseChart.getCategoricalColumnOfRole(dataView, i));
            let timeStampColumn = <DataViewCategoryColumn>columns.Timestamp;

            if (!timeStampColumn) {
                return null;
            }

            let isScalar: boolean = !(timeStampColumn.source && timeStampColumn.source.type && timeStampColumn.source.type.dateTime);
            let settings: PulseChartSettings = PulseChart.parseSettings(dataView, colors, columns);

            let categoryValues: any[] = timeStampColumn.values;

            if (!categoryValues || _.isEmpty(dataView.categorical.values) || !columns.Value || _.isEmpty(columns.Value.values)) {
                return null;
            }

            let minValuesValue = Math.min.apply(null, columns.Value.values), maxValuesValue = Math.max.apply(null, columns.Value.values);
            let minCategoryValue = Math.min.apply(null, categoryValues), maxCategoryValue = Math.max.apply(null, categoryValues);
            settings.xAxis.dateFormat =
                (maxCategoryValue - minCategoryValue < (24 * 60 * 60 * 1000)
                    && new Date(maxCategoryValue).getDate() === new Date(minCategoryValue).getDate())
                    ? PulseChartXAxisDateFormat.TimeOnly
                    : PulseChartXAxisDateFormat.DateOnly;

            settings.xAxis.formatterOptions = {
                value: isScalar ? minCategoryValue : new Date(minCategoryValue),
                value2: isScalar ? maxCategoryValue : new Date(maxCategoryValue)
            };
            settings.yAxis.formatterOptions = {
                value: minValuesValue,
                value2: maxValuesValue,
                format: valueFormatter.getFormatString(columns.Value.source, PulseChart.DefaultSettings.formatStringProperty)
            };

            if (isScalar) {
                settings.xAxis.formatterOptions.format = valueFormatter.getFormatString(timeStampColumn.source,
                    PulseChart.DefaultSettings.formatStringProperty);
            } else {
                settings.xAxis.formatterOptions.format = PulseChart.GetDateTimeFormatString(settings.xAxis.dateFormat, timeStampColumn.source.format);
            }

            let widthOfXAxisLabel = 70;
            let widthOfTooltipValueLabel = isScalar ? 60 : PulseChart.GetFullWidthOfDateFormat(timeStampColumn.source.format, PulseChart.GetPopupValueTextProperties()) + 5;
            let heightOfTooltipDescriptionTextLine = textMeasurementService.measureSvgTextHeight(PulseChart.GetPopupDescriptionTextProperties("lj", settings.popup.fontSize));
            let runnerCounterFormatString = columns.RunnerCounter && valueFormatter.getFormatString(columns.RunnerCounter.source, settings.formatStringProperty);
            settings.popup.width = Math.max(widthOfTooltipValueLabel + 20, settings.popup.width);

            let minSize: number = PulseChart.DefaultSettings.dots.minSize;
            let maxSize: number = PulseChart.DefaultSettings.dots.maxSize;
            if (settings.dots) {
                minSize = settings.dots.minSize;
                maxSize = settings.dots.maxSize;
            }

            let eventSizeScale: LinearScale = <LinearScale>PulseChart.createScale(
                true,
                columns.EventSize ? [d3.min(<number[]>columns.EventSize.values), d3.max(<number[]>columns.EventSize.values)] : [0, 0],
                minSize,
                maxSize);

            let xAxisCardProperties: DataViewObject = PulseChartAxisPropertiesHelper.getCategoryAxisProperties(dataView.metadata);

            let hasDynamicSeries: boolean = !!(timeStampColumn.values && timeStampColumn.source);

            let dataPointLabelSettings = PulseChartDataLabelUtils.getDefaultPulseChartLabelSettings();
            let gapWidths = PulseChart.getGapWidths(categoryValues);
            let maxGapWidth = Math.max.apply(null, gapWidths);

            let firstValueMeasureIndex: number = 0, firstGroupIndex: number = 0, secondGroupIndex = 1;
            let grouped: DataViewValueColumnGroup[] = dataView.categorical.values && dataView.categorical.values.grouped();
            let y_group0Values = grouped[firstGroupIndex]
                && grouped[firstGroupIndex].values[firstValueMeasureIndex]
                && grouped[firstGroupIndex].values[firstValueMeasureIndex].values;
            let y_group1Values = grouped[secondGroupIndex]
                && grouped[secondGroupIndex].values[firstValueMeasureIndex]
                && grouped[secondGroupIndex].values[firstValueMeasureIndex].values;

            let series: PulseChartSeries[] = [];
            let dataPoints: PulseChartDataPoint[] = [];

            for (let categoryIndex = 0, seriesCategoryIndex = 0, len = timeStampColumn.values.length; categoryIndex < len; categoryIndex++ , seriesCategoryIndex++) {
                let categoryValue = categoryValues[categoryIndex];
                let value = AxisHelper.normalizeNonFiniteNumber(timeStampColumn.values[categoryIndex]);
                let runnerCounterValue = columns.RunnerCounter && columns.RunnerCounter.values && columns.RunnerCounter.values[categoryIndex];
                let identity: ISelectionId = host.createSelectionIdBuilder()
                    .withCategory(timeStampColumn, categoryIndex)
                    .createSelectionId();

                let minGapWidth: number = Math.max((maxCategoryValue - minCategoryValue) / PulseChart.MaxGapCount, PulseChart.MinGapWidth[settings.xAxis.dateFormat]);
                let gapWidth: number = gapWidths[categoryIndex];
                let isGap: boolean = settings.gaps.show
                    && gapWidth > 0
                    && gapWidth > (minGapWidth + (100 - settings.gaps.visibleGapsPercentage) * (maxGapWidth - minGapWidth) / 100);

                if (isGap && dataPoints.length > 0) {
                    series.push({
                        displayName: <string>grouped[firstGroupIndex].name,
                        lineIndex: series.length,
                        color: settings.series.fill,
                        data: dataPoints,
                        labelSettings: dataPointLabelSettings,
                        width: settings.series.width,
                        widthOfGap: gapWidth
                    });

                    seriesCategoryIndex = 0;
                    dataPoints = [];
                }

                // When Scalar, skip null categories and null values so we draw connected lines and never draw isolated dots.
                if (isScalar && (categoryValue === null || value === null)) {
                    continue;
                }

                let popupInfo: PulseChartTooltipData = null;
                let eventSize: PrimitiveValue = (columns.EventSize && columns.EventSize.values && columns.EventSize.values[categoryIndex]) || 0;

                if ((columns.EventTitle && columns.EventTitle.values && columns.EventTitle.values[categoryIndex]) ||
                    (columns.EventDescription && columns.EventDescription.values && columns.EventDescription.values[categoryIndex])) {
                    let formattedValue = categoryValue;

                    if (!isScalar && categoryValue) {
                        formattedValue = valueFormatter.create({ format: timeStampColumn.source.format }).format(categoryValue);
                    }

                    popupInfo = {
                        value: formattedValue,
                        title: columns.EventTitle && columns.EventTitle.values && <string>columns.EventTitle.values[categoryIndex],
                        description: columns.EventDescription && columns.EventDescription.values && <string>columns.EventDescription.values[categoryIndex],
                    };
                }

                let dataPoint: PulseChartDataPoint = {
                    categoryValue: categoryValue,
                    value: value,
                    categoryIndex: categoryIndex,
                    seriesIndex: series.length,
                    tooltipInfo: null, // tooltipInfo,
                    popupInfo: popupInfo,
                    selected: false,
                    identity: identity,
                    key: JSON.stringify({ ser: identity.getKey(), catIdx: categoryIndex }),
                    labelFill: dataPointLabelSettings.labelColor,
                    labelSettings: dataPointLabelSettings,
                    x: categoryValue,
                    y: <number>(y_group0Values && y_group0Values[categoryIndex]) || <number>(y_group1Values && y_group1Values[categoryIndex]) || 0,
                    pointColor: settings.series.fill,
                    groupIndex: PulseChart.getGroupIndex(categoryIndex, grouped),
                    eventSize: columns.EventSize ? eventSizeScale(eventSize as number) : 0,
                    runnerCounterValue: runnerCounterValue,
                    runnerCounterFormatString: runnerCounterFormatString,
                    specificIdentity: undefined,
                };

                dataPoints.push(dataPoint);
            }

            if (interactivityService) {
                interactivityService.applySelectionStateToData(dataPoints);
            }

            if (dataPoints.length > 0) {
                series.push({
                    displayName: <string>grouped[firstGroupIndex].name,
                    lineIndex: series.length,
                    color: settings.series.fill,
                    data: dataPoints,
                    labelSettings: dataPointLabelSettings,
                    width: settings.series.width,
                    widthOfGap: 0
                });
            }

            xAxisCardProperties = PulseChartAxisPropertiesHelper.getCategoryAxisProperties(dataView.metadata);
            let valueAxisProperties = PulseChartAxisPropertiesHelper.getValueAxisProperties(dataView.metadata);

            let values = dataView.categorical.categories;

            // Convert to DataViewMetadataColumn
            let valuesMetadataArray: powerbi.DataViewMetadataColumn[] = [];
            if (values) {
                for (let i = 0; i < values.length; i++) {
                    if (values[i] && values[i].source && values[i].source.displayName) {
                        valuesMetadataArray.push({ displayName: values[i].source.displayName });
                    }
                }
            }

            let axesLabels = PulseChart.createAxesLabels(xAxisCardProperties, valueAxisProperties, timeStampColumn.source, valuesMetadataArray);
            let dots: PulseChartDataPoint[] = PulseChart.getDataPointsFromSeries(series);

            if (interactivityService) {
                interactivityService.applySelectionStateToData(dots);
            }
            return {
                columns: columns,
                dots: dots,
                series: series,
                isScalar: isScalar,
                dataLabelsSettings: dataPointLabelSettings,
                axesLabels: { x: axesLabels.xAxisLabel, y: axesLabels.yAxisLabel },
                hasDynamicSeries: hasDynamicSeries,
                categoryMetadata: timeStampColumn.source,
                categories: categoryValues,
                settings: settings,
                grouped: grouped,
                hasHighlights: !!(<any>columns.Value).highlights,
                widthOfXAxisLabel: widthOfXAxisLabel,
                widthOfTooltipValueLabel: widthOfTooltipValueLabel,
                heightOfTooltipDescriptionTextLine: heightOfTooltipDescriptionTextLine,
                runnerCounterHeight: textMeasurementService.measureSvgTextHeight(
                    PulseChart.GetRunnerCounterTextProperties("lj", settings.runnerCounter.fontSize))
            };
        }

        private static createAxesLabels(categoryAxisProperties: DataViewObject,
            valueAxisProperties: DataViewObject,
            category: DataViewMetadataColumn,
            values: DataViewMetadataColumn[]) {
            let xAxisLabel = null;
            let yAxisLabel = null;

            if (categoryAxisProperties) {

                // Take the value only if it's there
                if (category && category.displayName) {
                    xAxisLabel = category.displayName;
                }
            }

            if (valueAxisProperties) {
                let valuesNames: string[] = [];

                if (values) {
                    // Take the name from the values, and make it unique because there are sometimes duplications
                    valuesNames = values.map(v => v ? v.displayName : '').filter((value, index, self) => value !== '' && self.indexOf(value) === index);
                    yAxisLabel = valueFormatter.formatListAnd(valuesNames);
                }
            }
            return { xAxisLabel: xAxisLabel, yAxisLabel: yAxisLabel };
        }
        private static getDataPointsFromSeries(series: PulseChartSeries[]): PulseChartDataPoint[] {
            let dataPointsArray: PulseChartDataPoint[][] = series.map((d: PulseChartSeries): PulseChartDataPoint[] => {
                return d.data.filter((d: PulseChartDataPoint) => !!d.popupInfo);
            });
            return <PulseChartDataPoint[]>_.flatten(dataPointsArray);
        }

        private static createAxisY(
            commonYScale: LinearScale,
            height: number,
            formatterOptions: ValueFormatterOptions,
            show: boolean = true): Axis {

            let formatter = valueFormatter.create(formatterOptions);
            let ticks: number = Math.max(2, Math.round(height / 40));
            let yAxis: Axis = d3.svg.axis()
                .scale(commonYScale)
                .ticks(ticks)
                .outerTickSize(0)
                .tickFormat(formatter.format);
            return yAxis;
        }

        private static createAxisX(
            isScalar: boolean,
            series: PulseChartSeries[],
            originalScale: GenericScale,
            formatterOptions: ValueFormatterOptions,
            dateFormat: PulseChartXAxisDateFormat,
            position: XAxisPosition,
            widthOfXAxisLabel: number): PulseChartXAxisProperties[] {

            let scales = PulseChart.getXAxisScales(series, isScalar, originalScale);
            let xAxisProperties = new Array<PulseChartXAxisProperties>(scales.length);

            for (let i: number = 0, rotate = false; i < xAxisProperties.length; i++) {
                let values = PulseChart.getXAxisValuesToDisplay(<any>scales[i], rotate, isScalar, dateFormat, widthOfXAxisLabel);

                if (!rotate
                    && position === XAxisPosition.Bottom
                    && values.length < PulseChart.MinimumTicksToRotate) {
                    let rotatedValues = PulseChart.getXAxisValuesToDisplay(<any>scales[i], true, isScalar, dateFormat, widthOfXAxisLabel);
                    if (rotatedValues.length > values.length) {
                        rotate = true;
                        i = -1;
                        continue;
                    }
                }

                xAxisProperties[i] = <PulseChartXAxisProperties>{ values: values, scale: scales[i], rotate: rotate };
            }

            formatterOptions.tickCount = xAxisProperties.length && xAxisProperties.map(x => x.values.length).reduce((a, b) => a + b) * 5;
            formatterOptions.value = originalScale.domain()[0];
            formatterOptions.value2 = originalScale.domain()[1];

            xAxisProperties.forEach((properties: PulseChartXAxisProperties) => {
                let values: (Date | number)[] = properties.values.filter((value: Date | number) => value !== null);

                let formatter = valueFormatter.create(formatterOptions);
                properties.axis = d3.svg.axis()
                    .scale(properties.scale)
                    .tickValues(values)
                    .tickFormat(formatter.format)
                    .outerTickSize(0);
            });

            return xAxisProperties;
        }

        private static getXAxisScales(
            series: PulseChartSeries[],
            isScalar: boolean,
            originalScale: any): GenericScale[] {
            return series.map((seriesElement: PulseChartSeries) => {
                let dataPoints: PulseChartDataPoint[] = seriesElement.data,
                    minValue: number | Date = dataPoints[0].categoryValue,
                    maxValue: number | Date = dataPoints[dataPoints.length - 1].categoryValue,
                    minX: number = originalScale(dataPoints[0].categoryValue),
                    maxX: number = originalScale(dataPoints[dataPoints.length - 1].categoryValue);
                return PulseChart.createScale(isScalar, [minValue, maxValue], minX, maxX);
            });
        }

        private static getXAxisValuesToDisplay(
            scale: TimeScale | LinearScale,
            rotate: boolean,
            isScalar: boolean,
            dateFormat: PulseChartXAxisDateFormat,
            widthOfXAxisLabel: number): (Date | number)[] {
            let genScale = <any>scale;

            let tickWidth = rotate
                ? PulseChart.XAxisTickHeight * (rotate ? Math.abs(Math.sin(PulseChart.AxisTickRotateAngle * Math.PI / 180)) : 0)
                : widthOfXAxisLabel;
            let tickSpace = PulseChart.XAxisTickSpace;

            if (scale.range()[1] < tickWidth) {
                return [];
            }

            let minValue = scale.invert(scale.range()[0] + tickWidth / 2);
            let maxValue = scale.invert(scale.range()[1] - tickWidth / 2);
            let width = scale.range()[1] - scale.range()[0];

            let maxTicks: number = Math.floor((width + tickSpace) / (tickWidth + tickSpace));
            if (rotate) {
                maxTicks = Math.min(PulseChart.MinimumTicksToRotate, maxTicks);
            }

            let values = [];
            if (isScalar) {
                values = d3.range(<any>minValue, <any>maxValue, (<any>maxValue - <any>minValue) / (maxTicks * 100));
            } else {
                values = (dateFormat === PulseChartXAxisDateFormat.TimeOnly ? d3.time.minute : d3.time.day)
                    .range(<any>minValue, <any>maxValue);
            }

            if (!values.length || _.last(values) < maxValue) {
                values.push(maxValue);
            }

            if (!maxTicks) {
                return [];
            }

            maxTicks = Math.min(values.length, maxTicks);

            let valuesIndexses = d3.scale.ordinal().domain(<any>d3.range(maxTicks)).rangePoints([0, values.length - 1]).range(); // randeRoundPoints is not defined
            values = valuesIndexses.map(x => values[Math.round(x)]);

            for (let i = 1; i < values.length; i++) {
                let prevXValue = genScale(values[i - 1]);
                let curXValue = genScale(values[i]);
                if (curXValue - prevXValue < tickWidth + tickSpace / 3) {
                    values.splice(i--, 1);
                }
            }

            return values;
        }

        private static getGroupIndex(index: number, grouped: DataViewValueColumnGroup[]): number {
            for (let i: number = 0; i < grouped.length; i++) {
                if (grouped[i].values && grouped[i].values[0] &&
                    grouped[i].values[0].values[index] !== undefined &&
                    grouped[i].values[0].values[index] !== null) {
                    return i;
                }
            }

            return 0;
        }

        private static getGapWidths(values: Date[] | number[]): number[] {
            let result: number[] = [];
            for (let i: number = 0, prevVal: number = 0, length: number = values.length; i < length; i++) {
                if (!prevVal || !values[i]) {
                    result.push(0);
                } else {
                    result.push(<number>values[i] - prevVal);
                }

                prevVal = <number>values[i];
            }

            return result;
        }

        private static createScale(isScalar: boolean, domain: (number | Date)[], minX: number, maxX: number): LinearScale | TimeScale {
            let scale: LinearScale | TimeScale;

            if (isScalar) {
                scale = d3.scale.linear();
            } else {
                scale = d3.time.scale();
            }

            return scale
                .domain(domain as any)
                .range([minX, maxX]);
        }

        public data: PulseChartData;
        public margin: IMargin;
        public viewport: IViewport;
        public size: IViewport;
        public handleSelectionTimeout: number;

        private svg: Selection<any>;
        private chart: Selection<any>;
        private dots: Selection<any>;
        private yAxis: Selection<any>;
        private gaps: Selection<any>;

        private animationDot: Selection<any>;
        private lineX: Line;
        // private animator: IGenericAnimator;
        private animationHandler: PulseAnimator;
        private colors: IColorPalette;
        private rootSelection: UpdateSelection<any>;
        private animationSelection: UpdateSelection<any>;
        private lastSelectedPoint: ISelectionId;

        private interactivityService: IInteractivityService;
        private behavior: IPulseChartInteractiveBehavior;
        public host: IVisualHost;

        public get runnerCounterPlaybackButtonsHeight(): number {
            return Math.max(PulseChart.PlaybackButtonsHeight, this.data && (this.data.runnerCounterHeight / 2 + 17));
        }

        public get popupHeight(): number {
            return this.data
                && this.data.settings
                && this.data.settings.popup
                && this.data.settings.popup.show
                && this.data.settings.popup.height || 0;
        }

        constructor(options: VisualConstructorOptions) {
            this.init(options);
        }

        public init(options: VisualConstructorOptions): void {
            this.margin = PulseChart.DefaultMargin;
            // (<any>powerbi.formattingService).initialize();// Fixes the framework bug: "Cannot read property 'getFormatString' of undefined".
            let host = this.host = options.host;
            this.interactivityService = createInteractivityService(host);
            this.behavior = new PulseChartWebBehavior();

            let svg: Selection<any> = this.svg = d3.select(options.element)
                .append('svg')
                .classed('pulseChart', true);

            this.gaps = svg.append('g').classed(PulseChart.Gaps.class, true);
            this.yAxis = svg.append('g').attr('class', 'y axis');
            this.chart = svg.append('g').attr('class', PulseChart.Chart.class);
            this.dots = svg.append('g').attr('class', 'dots');
            this.animationDot = this.dots
                .append('circle')
                .classed(PulseChart.AnimationDot.class, true)
                .attr('display', 'none');

            this.animationHandler = new PulseAnimator(this, svg);

            this.colors = host.colorPalette;
        }

        public update(options: VisualUpdateOptions): void {
            if (!options || !options.dataViews || !options.dataViews[0]) {
                return;
            }

            this.viewport = $.extend({}, options.viewport);
            let dataView: DataView = options.dataViews[0];
            let pulseChartData: PulseChartData = PulseChart.converter(dataView, this.host, this.colors, this.interactivityService);

            this.updateData(pulseChartData);
            if (!this.validateData(this.data)) {
                this.clearAll(true);
                return;
            }

            let width = this.getChartWidth();
            this.calculateXAxisProperties(width);

            if (this.data.xScale.ticks(undefined).length < 2) {
                this.clearAll(true);
                return;
            }

            let height = this.getChartHeight(this.data.settings.xAxis.show
                && this.data.series.some((series: PulseChartSeries) => series.xAxisProperties.rotate));
            this.calculateYAxisProperties(height);

            this.size = { width: width, height: height };
            this.updateElements();

            this.render(true);
        }

        private updateData(data: PulseChartData): void {
            if (!this.data) {
                this.data = data;
                return;
            }

            let oldDataObj = this.getDataArrayToCompare(this.data);
            let newDataObj = this.getDataArrayToCompare(data);
            if (!_.isEqual(oldDataObj, newDataObj)) {
                this.clearAll(false);
            }

            this.data = data;
        }

        private getDataArrayToCompare(data: PulseChartData): any[] {
            if (!data || !data.series) {
                return null;
            }

            let dataPoints: PulseChartDataPoint[] = <PulseChartDataPoint[]>_.flatten(data.series.map(x => x.data));
            return _.flatten(dataPoints.map(x => {
                return x && _.flatten([
                    [
                        x.categoryValue,
                        x.eventSize,
                        x.groupIndex,
                        x.runnerCounterValue,
                        x.y,
                        x.seriesIndex
                    ],
                    x.popupInfo && [x.popupInfo.description, x.popupInfo.title, x.popupInfo.value]
                ]);
            }));
        }

        private validateData(data: PulseChartData): boolean {
            if (!data) {
                return false;
            }

            if (data.categories.some(x => !(x instanceof Date || $.isNumeric(x)))) {
                return false;
            }

            return true;
        }

        private getChartWidth(): number {
            let marginRight: number = this.margin.right;
            if (this.data.settings.yAxis && this.data.settings.yAxis.show) {
                marginRight += PulseChart.MaxWidthOfYAxis;
            }

            let width: number = this.viewport.width - this.margin.left - marginRight;
            return Math.max(width, PulseChart.DefaultViewport.width);
        }

        private getChartHeight(xAxisRotated: boolean): number {
            let marginBottom = 10 + (xAxisRotated
                ? this.data.widthOfXAxisLabel * Math.abs(Math.sin(PulseChart.AxisTickRotateAngle * Math.PI / 180))
                : 3);

            if (!this.data.settings.popup.alwaysOnTop && this.popupHeight) {
                marginBottom = Math.max(this.margin.bottom + this.popupHeight, marginBottom);
            }

            let height: number = this.viewport.height
                - this.margin.top
                - this.runnerCounterPlaybackButtonsHeight
                - marginBottom
                - this.popupHeight;

            return Math.max(height, PulseChart.DefaultViewport.height);
        }

        private updateElements(): void {
            let chartMarginTop = this.margin.top + this.runnerCounterPlaybackButtonsHeight + this.popupHeight;
            this.svg.attr({
                width: this.viewport.width,
                height: this.viewport.height,
            });
            this.svg.style('display', undefined);
            this.gaps.attr('transform', SVGUtil.translate(this.margin.left, chartMarginTop + (this.size.height / 2)));
            this.chart.attr('transform', SVGUtil.translate(this.margin.left, chartMarginTop));
            this.yAxis.attr('transform', SVGUtil.translate(this.size.width + this.margin.left, chartMarginTop));
            this.dots.attr('transform', SVGUtil.translate(this.margin.left, chartMarginTop));
        }

        public calculateXAxisProperties(width: number) {
            this.data.xScale = PulseChart.createScale(
                this.data.isScalar,
                [this.data.categories[0], this.data.categories[this.data.categories.length - 1]],
                0,
                width);

            let xAxisProperties: PulseChartXAxisProperties[] = PulseChart.createAxisX(
                this.data.isScalar,
                this.data.series,
                <LinearScale>this.data.xScale,
                $.extend({}, this.data.settings.xAxis.formatterOptions),
                this.data.settings.xAxis.dateFormat,
                this.data.settings.xAxis.position,
                this.data.widthOfXAxisLabel);

            this.data.series.forEach((series: PulseChartSeries, index: number) => {
                series.xAxisProperties = xAxisProperties[index];
            });
        }

        public calculateYAxisProperties(height: number): void {
            this.data.yScales = this.getYAxisScales(height);

            let domain: number[] = [];
            this.data.yScales.forEach((scale: LinearScale) => domain = domain.concat(scale.domain()));
            this.data.commonYScale = <LinearScale>PulseChart.createScale(
                true,
                [d3.max(domain), d3.min(domain)],
                0,
                height);

            this.data.yAxis = PulseChart.createAxisY(this.data.commonYScale, height, this.data.settings.yAxis.formatterOptions);
        }

        private getYAxisScales(height: number): LinearScale[] {
            let data: PulseChartData = this.data,
                stepOfHeight: number = height / data.grouped.length;

            return <LinearScale[]>data.grouped.map((group: DataViewValueColumnGroup, index: number) => {
                let values: number[] = group.values[0].values.map(x => <number>x || 0);

                let minValue: number = Number.MAX_VALUE,
                    maxValue: number = -Number.MAX_VALUE;

                values.forEach((value: number) => {
                    if (value < minValue) {
                        minValue = value;
                    }

                    if (value > maxValue) {
                        maxValue = value;
                    }
                });
                if (maxValue === minValue) {
                    let offset = maxValue === 0 ? 1 : Math.abs(maxValue / 2);
                    maxValue += offset;
                    minValue -= offset;
                }

                return PulseChart.createScale(true, [maxValue, minValue], stepOfHeight * index, stepOfHeight * (index + 1));
            });
        }

        public get autoplayPauseDuration(): number {
            return 1000 * ((this.data && this.data.settings && this.data.settings.playback)
                ? this.data.settings.playback.autoplayPauseDuration
                : PulseChart.DefaultSettings.playback.autoplayPauseDuration);
        }

        public get isAutoPlay(): boolean {
            return this.data &&
                this.data.settings &&
                this.data.settings.playback &&
                this.data.settings.playback.autoplay;
        }

        public render(suppressAnimations: boolean) {
            let duration: number = PulseChart.DefaultAnimationDuration; // AnimatorCommon.GetAnimationDuration(this.animator, suppressAnimations);
            let data = this.data;
            this.lastSelectedPoint = null;

            let xScale: LinearScale = <LinearScale>data.xScale,
                yScales: LinearScale[] = <LinearScale[]>data.yScales;

            this.lineX = d3.svg.line<PulseChartDataPoint>()
                .x((d: PulseChartDataPoint) => {
                    return xScale(d.categoryValue);
                })
                .y((d: PulseChartDataPoint) => {
                    return yScales[d.groupIndex](d.y);
                });

            if (this.data &&
                this.data.settings &&
                this.data.settings.playback &&
                this.data.settings.playback.color) {
                this.animationHandler.setControlsColor(this.data.settings.playback.color);
            }
            this.animationHandler.render();
            this.animationHandler.setRunnerCounterValue();

            this.renderAxes(data, duration);
            this.renderGaps(data, duration);
        }

        private renderAxes(data: PulseChartData, duration: number): void {
            this.renderXAxis(data, duration);
            this.renderYAxis(data, duration);
        }

        private renderXAxis(data: PulseChartData, duration: number): void {
            let axisNodeSelection: Selection<any>,
                axisNodeUpdateSelection: UpdateSelection<any>,
                // ticksSelection: Selection<any>,
                axisBoxUpdateSelection: UpdateSelection<any>,
                color: string = PulseChart.DefaultSettings.xAxis.color,
                fontColor: string = PulseChart.DefaultSettings.xAxis.fontColor;

            if (this.data && this.data.settings && this.data.settings.xAxis) {
                color = this.data.settings.xAxis.color;
                fontColor = this.data.settings.xAxis.fontColor;
            }

            axisNodeSelection = this.rootSelection.selectAll(PulseChart.XAxisNode.selector);
            axisNodeUpdateSelection = axisNodeSelection.data(data.series);

            axisNodeUpdateSelection
                .enter()
                .insert("g", "g." + PulseChart.LineContainer.class)
                .classed(PulseChart.XAxisNode.class, true);

            axisNodeUpdateSelection
                .call((selection: Selection<any>) => {
                    selection.each((selectionElement: Element, index: number) => {
                        d3.select(selectionElement[0])
                            .call(data.series[index].xAxisProperties.axis.orient('bottom'));
                    });
                });

            axisNodeUpdateSelection
                .exit()
                .remove();

            axisBoxUpdateSelection = axisNodeUpdateSelection
                .selectAll(".tick")
                .selectAll(".axisBox")
                .data([[]]);

            axisBoxUpdateSelection
                .enter()
                .insert("rect", "text")
                .classed("axisBox", true);

            axisBoxUpdateSelection
                .style('display', this.data.settings.xAxis.position === XAxisPosition.Center ? 'inherit' : 'none')
                .style('fill', this.data.settings.xAxis.backgroundColor);

            let tickRectY = this.data.settings.xAxis.position === XAxisPosition.Center ? -11 : 0;
            axisBoxUpdateSelection.attr({
                x: -(this.data.widthOfXAxisLabel / 2),
                y: tickRectY + "px",
                width: this.data.widthOfXAxisLabel,
                height: PulseChart.XAxisTickHeight + "px"
            });

            axisBoxUpdateSelection
                .exit()
                .remove();

            axisNodeUpdateSelection
                .style('stroke', this.data.settings.xAxis.position === XAxisPosition.Center ? color : "none")
                .style('display', this.data.settings.xAxis.show ? 'inherit' : 'none');

            axisNodeUpdateSelection.call(selection => {
                let rotate = selection.datum().xAxisProperties.rotate;
                let rotateCoeff = rotate ? Math.abs(Math.sin(PulseChart.AxisTickRotateAngle * Math.PI / 180)) : 0;
                let dy = tickRectY + 3;
                selection.selectAll("text")
                    .attr('transform', function (element: SVGTextElement) {
                        return `translate(0, ${(dy + 9 + ($(this).width() / 2) * rotateCoeff)}) rotate(${rotate ? PulseChart.AxisTickRotateAngle : 0})`;
                    })
                    .style('fill', fontColor)
                    .style('stroke', "none")
                    .attr('dy', -9);
            });

            axisNodeUpdateSelection.selectAll(".domain")
                .style('stroke', color);

            axisNodeUpdateSelection.selectAll(".domain")
            .each((element: Element) => {
                $(element).insertBefore($(element).parent().children().first());
            });

            let xAxisTop: number = this.size.height;
            switch (this.data.settings.xAxis.position) {
                case XAxisPosition.Center:
                    xAxisTop = xAxisTop / 2;
                    break;
                case XAxisPosition.Bottom:
                    break;
            }

            axisNodeUpdateSelection.attr('transform', SVGUtil.translate(0, xAxisTop));
        }

        private renderYAxis(data: PulseChartData, duration: number): void {
            let yAxis: Axis = data.yAxis,
                isShow: boolean = false,
                color: string = PulseChart.DefaultSettings.yAxis.color,
                fontColor: string = PulseChart.DefaultSettings.yAxis.fontColor;

            yAxis.orient('right');

            if (this.data &&
                this.data.settings &&
                this.data.settings.yAxis &&
                this.data.settings.yAxis.show) {
                isShow = true;
            }

            if (this.data &&
                this.data.settings &&
                this.data.settings.yAxis &&
                this.data.settings.yAxis) {
                color = this.data.settings.yAxis.color;
                fontColor = this.data.settings.yAxis.fontColor;
            }

            this.yAxis
                .call(yAxis)
                .attr('display', isShow ? 'inline' : 'none');

            this.yAxis.selectAll('.domain, path, line').style('stroke', color);
            this.yAxis.selectAll('text').style('fill', fontColor);
            this.yAxis.selectAll('g.tick line')
                .attr('x1', -this.size.width);
        }

        public renderChart(): void {
            if (!this.data) {
                return;
            }

            const data: PulseChartData = this.data,
                series: PulseChartSeries[] = this.data.series;

            this.rootSelection = this.chart
                .selectAll(PulseChart.LineNode.selector)
                .data(series);

            const lineNode: Selection<any> = this.rootSelection
                .enter()
                .append('g')
                .classed(PulseChart.LineNode.class, true);

            lineNode
                .append('g')
                .classed(PulseChart.LineContainer.class, true);

            lineNode
                .append('g')
                .classed(PulseChart.TooltipContainer.class, true);

            lineNode
                .append('g')
                .classed(PulseChart.DotsContainer.class, true);

            if (this.animationHandler.isAnimated) {
                this.showAnimationDot();
            } else {
                this.hideAnimationDot();
            }

            this.drawLines();
            this.drawDots(data);
            this.drawTooltips(data);

            this.rootSelection
                .exit()
                .remove();
        }

        private drawLinesStatic(limit: number, isAnimated: boolean): void {
            let node: ClassAndSelector = PulseChart.Line,
                nodeParent: ClassAndSelector = PulseChart.LineContainer,
                rootSelection: UpdateSelection<any> = this.rootSelection;

            let selection: UpdateSelection<any> = rootSelection
                .filter((d, index) => !isAnimated || index < limit)
                .select(nodeParent.selector)
                .selectAll(node.selector).data(d => [d]);

            selection
                .enter()
                .append('path')
                .classed(node.class, true);

            selection
                .style({
                    'fill': "none",
                    'stroke': (d: PulseChartSeries) => d.color,
                    'stroke-width': (d: PulseChartSeries) => `${d.width}px`
                });

            selection.attr('d', d => this.lineX(d.data));
            selection
                .exit()
                .remove();
        }

        private drawLinesStaticBeforeAnimation(limit: number) {
            let node: ClassAndSelector = PulseChart.Line,
                nodeParent: ClassAndSelector = PulseChart.LineContainer,
                rootSelection: UpdateSelection<any> = this.rootSelection;

            this.animationSelection = rootSelection.filter((d, index) => {
                return index === limit;
            }).select(nodeParent.selector).selectAll(node.selector).data((d: PulseChartSeries) => [d]);

            this.animationSelection
                .enter()
                .append('path')
                .classed(node.class, true);

            this.animationSelection
                .style({
                    'fill': "none",
                    'stroke': (d: PulseChartSeries) => d.color,
                    'stroke-width': (d: PulseChartSeries) => `${d.width}px`
                });

            this.animationSelection
                .attr('d', (d: PulseChartSeries) => {
                    let flooredStart = this.animationHandler.flooredPosition.index;

                    if (flooredStart === 0) {
                        this.moveAnimationDot(d.data[0]);
                        return this.lineX([]);
                    } else {
                        let dataReduced: PulseChartDataPoint[] = d.data.slice(0, flooredStart + 1);
                        this.moveAnimationDot(dataReduced[dataReduced.length - 1]);
                        return this.lineX(dataReduced);
                    }
                });

            this.animationSelection
                .exit()
                .remove();
        }

        private moveAnimationDot(d: PulseChartDataPoint) {
            let xScale: LinearScale = <LinearScale>this.data.xScale,
                yScales: LinearScale[] = <LinearScale[]>this.data.yScales;

            this.animationDot
                .attr("cx", xScale(d.x))
                .attr("cy", yScales[d.groupIndex](d.y));
        }

        public playAnimation(delay: number = 0): void {
            let flooredStart = this.animationHandler.flooredPosition.index;
            this.showAnimationDot();
            this.animationSelection
                .transition()
                .delay(delay)
                .duration(this.animationDuration)
                .ease("linear")
                .attrTween('d', (d: PulseChartSeries, index: number) => this.getInterpolation(d.data, flooredStart))
                .each("end", (series: PulseChartSeries) => {
                    let position: PulseChartAnimationPosition = this.animationHandler.flooredPosition;
                    this.handleSelection(position);
                    this.continueAnimation(position);
                });
        }

        public pauseAnimation(): void {
            if (!this.animationSelection) {
                return;
            }

            this.hideAnimationDot();
            this.animationSelection.selectAll("path").transition();

            this.animationSelection
                .transition()
                .duration(0)
                .delay(0);
        }

        public stopAnimation() {
            this.pauseAnimation();
            d3.timer.flush();
        }

        public findNextPoint(position: PulseChartAnimationPosition): PulseChartAnimationPosition {
            for (let i: number = position.series; i < this.data.series.length; i++) {
                let series: PulseChartSeries = this.data.series[i];

                for (let j: number = (i === position.series) ? Math.floor(position.index + 1) : 0; j < series.data.length; j++) {
                    if (series.data[j] && series.data[j].popupInfo) {
                        return {
                            series: i,
                            index: j
                        };
                    }
                }
            }

            return null;
        }

        public findPrevPoint(position: PulseChartAnimationPosition): PulseChartAnimationPosition {
            for (let i: number = position.series; i >= 0; i--) {
                let series: PulseChartSeries = this.data.series[i];

                for (let j: number = (i === position.series) ? Math.ceil(position.index - 1) : series.data.length; j >= 0; j--) {
                    if (series.data[j] && series.data[j].popupInfo) {
                        return {
                            series: i,
                            index: j
                        };
                    }
                }
            }

            return null;
        }

        public isAnimationSeriesAndIndexLast(position: PulseChartAnimationPosition): boolean {
            return this.isAnimationSeriesLast(position) && this.isAnimationIndexLast(position);
        }

        public isAnimationSeriesLast(position: PulseChartAnimationPosition): boolean {
            return (position.series >= (this.data.series.length - 1));
        }

        public isAnimationIndexLast(position: PulseChartAnimationPosition): boolean {
            let index: number = position.index;
            let series: PulseChartSeries = this.data.series[position.series];
            return index >= (series.data.length - 1);
        }

        private drawLines(): void {
            let positionSeries: number = this.animationHandler.position.series,
                isAnimated: boolean = this.animationHandler.isAnimated;

            this.drawLinesStatic(positionSeries, isAnimated);

            if (isAnimated) {
                this.drawLinesStaticBeforeAnimation(positionSeries);
            }
        }

        private showAnimationDot(): void {
            if (!this.animationHandler.isPlaying) {
                return;
            }
            let size: number = PulseChart.DefaultSettings.dots.size;

            if (this.data &&
                this.data.settings &&
                this.data.settings.dots &&
                this.data.settings.dots.size) {
                size = this.data.settings.dots.size;
            }

            this.animationDot
                .attr('display', 'inline')
                .attr("fill", this.data.settings.dots.color)
                .style("opacity", this.dotOpacity)
                .attr("r", size);
        }

        private hideAnimationDot(): void {
            this.animationDot.attr('display', 'none');
        }

        private getInterpolation(data: PulseChartDataPoint[], start: number): any {
            if (!this.data) {
                return;
            }

            let xScale: LinearScale = <LinearScale>this.data.xScale,
                yScales: LinearScale[] = <LinearScale[]>this.data.yScales;
            let stop: number = start + 1;

            this.showAnimationDot();

            let lineFunction: Line = d3.svg.line<PulseChartDataPoint>()
                .x((d: PulseChartDataPoint) => d.x)
                .y((d: PulseChartDataPoint) => d.y)
                .interpolate("linear");

            let interpolatedLine = data.slice(0, start + 1).map((d: PulseChartDataPoint): PulseChartPointXY => {
                return {
                    x: xScale(d.x),
                    y: yScales[d.groupIndex](d.y)
                };
            });

            let x0: number = xScale(data[start].x);
            let x1: number = xScale(data[stop].x);

            let y0: number = yScales[data[start].groupIndex](data[start].y);
            let y1: number = yScales[data[stop].groupIndex](data[stop].y);

            let interpolateIndex: LinearScale = d3.scale.linear()
                .domain([0, 1])
                .range([start, stop]);

            let interpolateX: LinearScale = d3.scale.linear()
                .domain([0, 1])
                .range([x0, x1]);

            let interpolateY: LinearScale = d3.scale.linear()
                .domain([0, 1])
                .range([y0, y1]);

            this.animationHandler.setRunnerCounterValue(start);

            return (t: number) => {
                if (!this.animationHandler.isPlaying) {
                    return lineFunction(interpolatedLine as PulseChartDataPoint[]);
                }

                let x: number = interpolateX(t);
                let y: number = interpolateY(t);

                this.animationDot
                    .attr("cx", x)
                    .attr("cy", y);

                interpolatedLine.push({ "x": x, "y": y });
                this.animationHandler.position.index = interpolateIndex(t);
                return lineFunction(interpolatedLine as PulseChartDataPoint[]);
            };
        }

        public onClearSelection(): void {
            if (this.interactivityService) {
                this.interactivityService.clearSelection();
            }
            this.chart.selectAll(PulseChart.Tooltip.selector).remove();
        }

        private getDatapointFromPosition(position: PulseChartAnimationPosition): PulseChartDataPoint {
            if (!this.data ||
                !this.data.series ||
                !this.data.series[position.series] ||
                !this.data.series[position.series].data ||
                !this.data.series[position.series].data[position.index]) {
                return null;
            }
            return this.data.series[position.series].data[position.index];
        }

        public handleSelection(position: PulseChartAnimationPosition): void {
            let dataPoint: PulseChartDataPoint = this.getDatapointFromPosition(position);
            if (dataPoint) {
                this.behavior.setSelection(dataPoint);
            }
        }

        private continueAnimation(position: PulseChartAnimationPosition): void {
            if (!this.data) {
                return;
            }

            let dataPoint: PulseChartDataPoint = this.getDatapointFromPosition(position);
            let animationPlayingIndex: number = this.animationHandler.animationPlayingIndex;
            let isLastDataPoint: boolean = this.animationHandler.isPlaying && this.isAnimationSeriesAndIndexLast(position);
            if ((!dataPoint || !dataPoint.popupInfo) && (this.animationHandler.isPlaying)) {
                if (isLastDataPoint) {
                    setTimeout(() => this.animationHandler.toEnd(), 0);
                } else {
                    this.animationHandler.play(0, true);
                }
                return;
            }

            if (isLastDataPoint) {
                setTimeout(() => this.animationHandler.toEnd(), 0);
            } else {
                this.animationHandler.pause();
            }

            clearTimeout(this.handleSelectionTimeout);
            this.handleSelectionTimeout = setTimeout(() => {
                if (this.animationHandler.animationPlayingIndex !== animationPlayingIndex) {
                    return;
                }

                if (isLastDataPoint || this.animationHandler.isPaused) {
                    this.onClearSelection();
                }

                if (!isLastDataPoint && this.animationHandler.isPaused) {
                    this.animationHandler.play();
                }
            }, this.pauseDuration);
        }

        private get animationDuration(): number {
            return 1000 / ((this.data && this.data.settings && this.data.settings.playback)
                ? this.data.settings.playback.playSpeed
                : PulseChart.DefaultSettings.playback.playSpeed);
        }

        private get pauseDuration(): number {
            return 1000 * ((this.data && this.data.settings && this.data.settings.playback)
                ? this.data.settings.playback.pauseDuration
                : PulseChart.DefaultSettings.playback.pauseDuration);
        }

        private get dotOpacity(): number {
            return 1 - ((this.data && this.data.settings && this.data.settings.dots)
                ? this.data.settings.dots.transparency
                : PulseChart.DefaultSettings.dots.transparency) / 100;
        }

        private drawDots(data: PulseChartData): void {
            if (!data || !data.xScale) {
                return;
            }

            let xScale: LinearScale = <LinearScale>data.xScale,
                yScales: LinearScale[] = <LinearScale[]>data.yScales,
                node: ClassAndSelector = PulseChart.Dot,
                nodeParent: ClassAndSelector = PulseChart.DotsContainer,
                rootSelection: UpdateSelection<any> = this.rootSelection,
                dotColor: string = this.data.settings.dots.color,
                dotSize: number = this.data.settings.dots.size,
                isAnimated: boolean = this.animationHandler.isAnimated,
                position: PulseChartAnimationPosition = this.animationHandler.position,
                hasSelection: boolean = this.interactivityService.hasSelection();

            let selection: UpdateSelection<any> = rootSelection.filter((d, index) => !isAnimated || index <= position.series)
                .select(nodeParent.selector)
                .selectAll(node.selector)
                .data((d: PulseChartSeries, seriesIndex: number) => {
                    return _.filter(d.data, (value: PulseChartDataPoint, valueIndex: number): boolean => {
                        if (isAnimated && (seriesIndex === position.series) && (valueIndex > position.index)) {
                            return false;
                        }
                        return (!!value.popupInfo);
                    });
                });

            selection
                .enter()
                .append("circle")
                .classed(node.class, true);

            selection
                .attr("cx", (d: PulseChartDataPoint) => xScale(d.categoryValue))
                .attr("cy", (d: PulseChartDataPoint) => yScales[d.groupIndex](d.y))
                .attr("r", (d: PulseChartDataPoint) => d.eventSize || dotSize)
                .style("fill", dotColor)
                .style("opacity", (d: PulseChartDataPoint) => {
                    return pulseChartUtils.getFillOpacity(d.selected, d.highlight, !d.highlight && hasSelection, !d.selected && false);
                })
                .style("cursor", "pointer");

            selection
                .exit()
                .remove();

            if (this.interactivityService) {
                let behaviorOptions: PulseChartBehaviorOptions = {
                    selection: selection,
                    clearCatcher: this.svg,
                    interactivityService: this.interactivityService,
                    hasHighlights: this.data.hasHighlights,
                    onSelectCallback: () => this.renderChart(),
                };
                this.interactivityService.bind(this.data.dots, this.behavior, behaviorOptions);
            }
        }

        private renderGaps(data: PulseChartData, duration: number): void {
            let gaps: IRect[],
                gapsSelection: UpdateSelection<any>,
                gapsEnterSelection: Selection<any>,
                gapNodeSelection: UpdateSelection<any>,
                series: PulseChartSeries[] = data.series,
                isScalar: boolean = data.isScalar,
                xScale: LinearScale = <LinearScale>data.xScale;

            gaps = [{
                left: -4.5,
                top: -5,
                height: 10,
                width: 3
            }, {
                    left: 1.5,
                    top: -5,
                    height: 10,
                    width: 3
                }];

            gapsSelection = this.gaps.selectAll(PulseChart.Gap.selector)
                .data(series.slice(0, series.length - 1));

            gapsEnterSelection = gapsSelection
                .enter()
                .append("g");

            gapsSelection
                .attr("transform", (seriesElement: PulseChartSeries, index: number) => {
                    let x: number,
                        middleOfGap: number = seriesElement.widthOfGap / 2,
                        categoryValue: number | Date = seriesElement.data[seriesElement.data.length - 1].categoryValue;

                    if (isScalar) {
                        x = xScale(middleOfGap + <number>categoryValue);
                    } else {
                        x = xScale(<any>(new Date(middleOfGap + ((<Date>categoryValue).getTime()))));
                    }

                    return SVGUtil.translate(x, 0);
                });

            gapNodeSelection = gapsSelection.selectAll(PulseChart.GapNode.selector)
                .data(gaps);

            gapNodeSelection
                .enter()
                .append("rect")
                .attr({
                    x: (gap: IRect) => gap.left,
                    y: (gap: IRect) => gap.top,
                    height: (gap: IRect) => gap.height,
                    width: (gap: IRect) => gap.width
                })
                .classed(PulseChart.GapNode.class, true);

            gapsEnterSelection.classed(PulseChart.Gap.class, true);

            gapsSelection
                .exit()
                .remove();

            gapNodeSelection
                .exit()
                .remove();
        }

        private isPopupShow(d: PulseChartDataPoint): boolean {
            if (!this.popupHeight || !d.popupInfo) {
                return false;
            }

            return d.selected;
        }

        private drawTooltips(data: PulseChartData): void {
            let xScale: LinearScale = <LinearScale>data.xScale,
                yScales: LinearScale[] = <LinearScale[]>data.yScales,
                node: ClassAndSelector = PulseChart.Tooltip,
                nodeParent: ClassAndSelector = PulseChart.TooltipContainer,
                width: number = this.data.settings.popup.width,
                height: number = this.data.settings.popup.height,
                marginTop: number = PulseChart.DefaultTooltipSettings.marginTop;

            let rootSelection: UpdateSelection<any> = this.rootSelection;

            let line: Line = d3.svg.line<PulseChartDataPoint>()
                .x((d: PulseChartDataPoint) => d.x)
                .y((d: PulseChartDataPoint) => d.y);

            let tooltipShiftY = (y: number, groupIndex: number): number => {
                return this.isHigherMiddle(y, groupIndex) ? (-1 * marginTop + PulseChart.topShift) : this.size.height + marginTop;
            };

            let tooltipRoot: UpdateSelection<any> = rootSelection.select(nodeParent.selector).selectAll(node.selector)
                .data(d => {
                    return _.filter(d.data, (value: PulseChartDataPoint) => this.isPopupShow(value));
                });

            tooltipRoot
                .enter()
                .append("g")
                .classed(node.class, true);

            tooltipRoot
                .attr("transform", (d: PulseChartDataPoint) => {
                    let x: number = xScale(d.x) - width / 2;
                    let y: number = tooltipShiftY(d.y, d.groupIndex);
                    d.popupInfo.offsetX = Math.min(this.viewport.width - this.margin.right - width, Math.max(-this.margin.left, x)) - x;
                    return SVGUtil.translate(x + d.popupInfo.offsetX, y);
                });

            let tooltipRect: UpdateSelection<any> = tooltipRoot.selectAll(PulseChart.TooltipRect.selector).data(d => [d]);
            tooltipRect.enter().append("path").classed(PulseChart.TooltipRect.class, true);
            tooltipRect
                .attr("display", (d: PulseChartDataPoint) => d.popupInfo ? "inherit" : "none")
                .style('fill', this.data.settings.popup.color)
                .attr('d', (d: PulseChartDataPoint) => {
                    let path = [
                        {
                            "x": -2,
                            "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * marginTop) : 0,
                        },
                        {
                            "x": -2,
                            "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * (marginTop + height)) : height,
                        },
                        {
                            "x": width - 2,
                            "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * (marginTop + height)) : height,
                        },
                        {
                            "x": width - 2,
                            "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * marginTop) : 0,
                        }
                    ];
                    return line(path as PulseChartDataPoint[]);
                });

            let tooltipTriangle: UpdateSelection<any> = tooltipRoot.selectAll(PulseChart.TooltipTriangle.selector).data(d => [d]);
            tooltipTriangle.enter().append("path").classed(PulseChart.TooltipTriangle.class, true);
            tooltipTriangle
                .style('fill', this.data.settings.popup.color)
                .attr('d', (d: PulseChartDataPoint) => {
                    let path = [
                        {
                            "x": width / 2 - 5 - d.popupInfo.offsetX,
                            "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * marginTop) : 0,
                        },
                        {
                            "x": width / 2 - d.popupInfo.offsetX,
                            "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * (marginTop - 5)) : -5,
                        },
                        {
                            "x": width / 2 + 5 - d.popupInfo.offsetX,
                            "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * marginTop) : 0,
                        },
                    ];
                    return line(path as PulseChartDataPoint[]);
                })
                .style('stroke-width', "1px");

            let tooltipLine: UpdateSelection<any> = tooltipRoot.selectAll(PulseChart.TooltipLine.selector).data(d => [d]);
            tooltipLine.enter().append("path").classed(PulseChart.TooltipLine.class, true);
            tooltipLine
                .style('fill', this.data.settings.popup.color)
                .style('stroke', this.data.settings.popup.color)
                .style('stroke-width', "1px")
                .attr('d', (d: PulseChartDataPoint) => {
                    let path = [
                        {
                            "x": width / 2 - d.popupInfo.offsetX,
                            "y": this.isHigherMiddle(d.y, d.groupIndex) ?
                                yScales[d.groupIndex](d.y) + tooltipShiftY(d.y, d.groupIndex) - d.eventSize :
                                yScales[d.groupIndex](d.y) - tooltipShiftY(d.y, d.groupIndex) + d.eventSize,
                        },
                        {
                            "x": width / 2 - d.popupInfo.offsetX,
                            "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * marginTop) : 0, // end
                        }];
                    return line(path as PulseChartDataPoint[]);
                });

            let isShowTime: string = this.data.settings.popup.showTime ? undefined : "none";
            let isShowTitle: string = this.data.settings.popup.showTitle ? undefined : "none";

            let timeRect: UpdateSelection<any> = tooltipRoot.selectAll(PulseChart.TooltipTimeRect.selector).data(d => [d]);
            // let timeDisplayStyle = { "display": isShowTime ? undefined : "none" };
            timeRect.enter().append("path").classed(PulseChart.TooltipTimeRect.class, true);
            timeRect
                .style("fill", this.data.settings.popup.timeFill)
                .style("display", isShowTime)
                .attr('d', (d: PulseChartDataPoint) => {
                    let path = [
                        {
                            "x": width - this.data.widthOfTooltipValueLabel - 2,
                            "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * (marginTop + height)) : 0,
                        },
                        {
                            "x": width - this.data.widthOfTooltipValueLabel - 2,
                            "y": this.isHigherMiddle(d.y, d.groupIndex)
                                ? (-1 * (marginTop + height - PulseChart.DefaultTooltipSettings.timeHeight))
                                : PulseChart.DefaultTooltipSettings.timeHeight,
                        },
                        {
                            "x": width - 2,
                            "y": this.isHigherMiddle(d.y, d.groupIndex)
                                ? (-1 * (marginTop + height - PulseChart.DefaultTooltipSettings.timeHeight))
                                : PulseChart.DefaultTooltipSettings.timeHeight,
                        },
                        {
                            "x": width - 2,
                            "y": this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * (marginTop + height)) : 0,
                        }
                    ];
                    return line(path as PulseChartDataPoint[]);
                });

            let time: UpdateSelection<any> = tooltipRoot.selectAll(PulseChart.TooltipTime.selector).data(d => [d]);
            time.enter().append("text").classed(PulseChart.TooltipTime.class, true);
            time
                .style(PulseChart.ConvertTextPropertiesToStyle(PulseChart.GetPopupValueTextProperties()), null)
                .style("display", isShowTime)
                .style("fill", this.data.settings.popup.timeColor)
                .attr("x", (d: PulseChartDataPoint) => width - this.data.widthOfTooltipValueLabel)
                .attr("y", (d: PulseChartDataPoint) => this.isHigherMiddle(d.y, d.groupIndex)
                    ? (-1 * (marginTop + height - PulseChart.DefaultTooltipSettings.timeHeight + 3))
                    : PulseChart.DefaultTooltipSettings.timeHeight - 3)
                .text((d: PulseChartDataPoint) => d.popupInfo.value);

            let titleDisplayStyle = { "display": isShowTitle ? undefined : "none" };
            let title: UpdateSelection<any> = tooltipRoot.selectAll(PulseChart.TooltipTitle.selector).data(d => [d]);
            title.enter().append("text").classed(PulseChart.TooltipTitle.class, true);
            title
                .style("display", isShowTitle)
                .style(PulseChart.ConvertTextPropertiesToStyle(PulseChart.GetPopupTitleTextProperties()), null)
                .style("fill", this.data.settings.popup.fontColor)
                .attr("x", (d: PulseChartDataPoint) => PulseChart.PopupTextPadding)
                .attr("y", (d: PulseChartDataPoint) =>
                    (this.isHigherMiddle(d.y, d.groupIndex) ? (-1 * (marginTop + height - 12)) : 12) + PulseChart.PopupTextPadding)
                .text((d: PulseChartDataPoint) => {
                    if (!d.popupInfo) {
                        return "";
                    }
                    let maxWidth = width - PulseChart.PopupTextPadding * 2 -
                        (isShowTime ? (this.data.widthOfTooltipValueLabel - PulseChart.PopupTextPadding) : 0) - 10;
                    return textMeasurementService.getTailoredTextOrDefault(PulseChart.GetPopupTitleTextProperties(d.popupInfo.title), maxWidth);
                });

            let getDescriptionDimenstions = (d: PulseChartDataPoint): PulseChartElementDimensions => {
                let shiftY: number = PulseChart.PopupTextPadding + this.data.settings.popup.fontSize;

                let descriptionYOffset: number = shiftY + PulseChart.DefaultTooltipSettings.timeHeight;
                if (d.popupInfo) {
                    shiftY = ((isShowTitle && d.popupInfo.title) || (isShowTime && d.popupInfo.value)) ? descriptionYOffset : shiftY;
                }

                return {
                    y: this.isHigherMiddle(d.y, d.groupIndex)
                        ? (-1 * (marginTop + height - shiftY))
                        : shiftY,
                    x: PulseChart.PopupTextPadding,
                    width: width - PulseChart.PopupTextPadding * 2,
                    height: height - shiftY,
                };
            };

            let description = tooltipRoot.selectAll(PulseChart.TooltipDescription.selector).data(d => [d]);
            description.enter().append("text").classed(PulseChart.TooltipDescription.class, true);
            description
                .style(PulseChart.ConvertTextPropertiesToStyle(PulseChart.GetPopupDescriptionTextProperties(null, this.data.settings.popup.fontSize)), null)
                .style("fill", this.data.settings.popup.fontColor)
                .text((d: PulseChartDataPoint) => d.popupInfo && d.popupInfo.description)
                // .call(d => d.forEach(x => x[0] &&
                //    textMeasurementService.wordBreak(x[0], width - 2 - PulseChart.PopupTextPadding * 2, height - PulseChart.DefaultTooltipSettings.timeHeight - PulseChart.PopupTextPadding * 2)))
                //    textMeasurementService.wordBreak(x[0], width - 2 - PulseChart.PopupTextPadding * 2, height - PulseChart.DefaultTooltipSettings.timeHeight - PulseChart.PopupTextPadding * 2)))
                .attr("y", function (d: PulseChartDataPoint) {
                    let descriptionDimenstions: PulseChartElementDimensions = getDescriptionDimenstions(d);
                    let el: SVGTextElement = <any>d3.select(this)[0][0];
                    textMeasurementService.wordBreak(el, descriptionDimenstions.width, descriptionDimenstions.height);
                    return 0;
                })
                .attr("transform", function (d: PulseChartDataPoint) {
                    let descriptionDimenstions: PulseChartElementDimensions = getDescriptionDimenstions(d);
                    return SVGUtil.translate(0, descriptionDimenstions.y);
                });
            description.selectAll("tspan").attr("x", PulseChart.PopupTextPadding);

            tooltipRoot
                .exit()
                .remove();
        }

        private isHigherMiddle(value: number, groupIndex: number): boolean {
            if (this.data.settings.popup.alwaysOnTop) {
                return true;
            }

            if (this.data.yScales.length > 1) {
                return groupIndex === 0;
            }

            let domain: number[] = this.data.commonYScale.domain(),
                minValue: number = d3.min(domain),
                middleValue = Math.abs((d3.max(domain) - minValue) / 2);

            middleValue = middleValue === 0
                ? middleValue
                : minValue + middleValue;

            return value >= middleValue;
        }

        private static getObjectsFromDataView(dataView: DataView): DataViewObjects {
            if (!dataView ||
                !dataView.metadata ||
                !dataView.metadata.columns ||
                !dataView.metadata.objects) {
                return null;
            }

            return dataView.metadata.objects;
        }

        private static parseSettings(dataView: DataView, colors: IColorPalette, columns: PulseChartDataRoles<DataViewCategoricalColumn>): PulseChartSettings {
            let settings: PulseChartSettings = <PulseChartSettings>{},
                objects: DataViewObjects = PulseChart.getObjectsFromDataView(dataView);

            settings.xAxis = this.getAxisXSettings(objects, colors);
            settings.yAxis = this.getAxisYSettings(objects, colors);
            settings.popup = this.getPopupSettings(objects, colors);
            settings.dots = this.getDotsSettings(objects, colors);

            settings.series = this.getSeriesSettings(objects, colors);
            settings.gaps = this.getGapsSettings(objects);
            settings.playback = this.getPlaybackSettings(objects, colors);
            settings.runnerCounter = this.getRunnerCounterSettings(objects, colors, columns);

            return settings;
        }

        private static getPopupSettings(objects: DataViewObjects, colors: IColorPalette): PulseChartPopupSettings {
            let show = DataViewObjects.getValue<boolean>(
                objects,
                pulseChartProps["popup"]["show"],
                PulseChart.DefaultSettings.popup.show);

            let alwaysOnTop: boolean = DataViewObjects.getValue<boolean>(
                objects,
                pulseChartProps["popup"]["alwaysOnTop"],
                PulseChart.DefaultSettings.popup.alwaysOnTop);

            let width = Math.max(PulseChart.PopupMinWidth,
                Math.min(PulseChart.PopupMaxWidth, DataViewObjects.getValue<number>(
                    objects,
                    pulseChartProps["popup"]["width"],
                    PulseChart.DefaultSettings.popup.width)));

            let height: number = Math.max(PulseChart.PopupMinHeight,
                Math.min(PulseChart.PopupMaxHeight, DataViewObjects.getValue<number>(
                    objects,
                    pulseChartProps["popup"]["height"],
                    PulseChart.DefaultSettings.popup.height)));

            let colorHelper = new ColorHelper(
                colors,
                pulseChartProps["popup"]["color"],
                PulseChart.DefaultSettings.popup.color);

            let color = colorHelper.getColorForMeasure(objects, "");

            let fontSize = parseInt(DataViewObjects.getValue<any>(
                objects,
                pulseChartProps["popup"]["fontSize"],
                PulseChart.DefaultSettings.popup.fontSize), 10);

            let fontColorHelper = new ColorHelper(
                colors,
                pulseChartProps["popup"]["fontColor"],
                PulseChart.DefaultSettings.popup.fontColor);

            let fontColor = fontColorHelper.getColorForMeasure(objects, "");

            let showTime = DataViewObjects.getValue<boolean>(
                objects,
                pulseChartProps["popup"]["showTime"],
                PulseChart.DefaultSettings.popup.showTime);

            let showTitle = DataViewObjects.getValue<boolean>(
                objects,
                pulseChartProps["popup"]["showTitle"],
                PulseChart.DefaultSettings.popup.showTitle);

            let timeColorHelper = new ColorHelper(
                colors,
                pulseChartProps["popup"]["timeColor"],
                PulseChart.DefaultSettings.popup.timeColor);

            let timeColor = timeColorHelper.getColorForMeasure(objects, "");

            let timeFillHelper = new ColorHelper(
                colors,
                pulseChartProps["popup"]["timeFill"],
                PulseChart.DefaultSettings.popup.timeFill);

            let timeFill = timeFillHelper.getColorForMeasure(objects, "");
            return {
                show: show,
                alwaysOnTop: alwaysOnTop,
                width: width,
                height: height,
                color: color,
                fontSize: fontSize,
                fontColor: fontColor,
                showTime: showTime,
                showTitle: showTitle,
                timeColor: timeColor,
                timeFill: timeFill,
            };
        }

        private static getDotsSettings(objects: DataViewObjects, colors: IColorPalette): PulseChartDotsSettings {
            let properties = pulseChartProps["dots"],
                defaultSettings: PulseChartDotsSettings = PulseChart.DefaultSettings.dots;

            let colorHelper = new ColorHelper(
                colors,
                properties["color"],
                defaultSettings.color);

            let color = colorHelper.getColorForMeasure(objects, "");

            let minSize: number = Math.max(0, Math.min(9999, DataViewObjects.getValue<number>(
                objects,
                properties["minSize"],
                defaultSettings.minSize)));

            let maxSize: number = Math.max(minSize, Math.min(9999, DataViewObjects.getValue<number>(
                objects,
                properties["maxSize"],
                defaultSettings.maxSize)));

            let size: number = Math.max(minSize, Math.min(maxSize, DataViewObjects.getValue<number>(
                objects,
                properties["size"],
                defaultSettings.size)));

            let transparency: number = Math.max(0, Math.min(100, DataViewObjects.getValue<number>(
                objects,
                properties["transparency"],
                defaultSettings.transparency)));

            return {
                color: color,
                size: size,
                minSize: minSize,
                maxSize: maxSize,
                transparency: transparency,
            };
        }

        private static getSeriesSettings(objects: DataViewObjects, colors: IColorPalette): PulseChartSeriesSetting {
            let width = Math.max(1, Math.min(100, DataViewObjects.getValue<number>(
                objects,
                pulseChartProps["series"]["width"],
                PulseChart.DefaultSettings.series.width)));

            let colorHelper = new ColorHelper(
                colors,
                pulseChartProps["series"]["fill"],
                PulseChart.DefaultSettings.series.fill);

            let fill = colorHelper.getColorForMeasure(objects, "");

            /*let showByDefault = DataViewObjects.getValue<boolean>(
                objects,
                pulseChartProps["series"]["showByDefault"],
                PulseChart.DefaultSettings.series.showByDefault);*/

            return {
                width,
                fill,
                // showByDefault
            };
        }

        private static getGapsSettings(objects: DataViewObjects): PulseChartGapsSettings {
            let show = DataViewObjects.getValue<boolean>(
                objects,
                pulseChartProps["gaps"]["show"],
                PulseChart.DefaultSettings.gaps.show);

            let visibleGapsPercentage = Math.max(1, Math.min(100, DataViewObjects.getValue<number>(
                objects,
                pulseChartProps["gaps"]["transparency"],
                PulseChart.DefaultSettings.gaps.visibleGapsPercentage)));
            return {
                show: show,
                visibleGapsPercentage: visibleGapsPercentage
            };
        }

        private static getAxisXSettings(objects: DataViewObjects, colors: IColorPalette): PulseChartXAxisSettings {
            let properties = pulseChartProps["xAxis"],
                defaultSettings: PulseChartXAxisSettings = PulseChart.DefaultSettings.xAxis;

            let color = new ColorHelper(colors,
                properties["color"],
                defaultSettings.color).getColorForMeasure(objects, "");

            let fontColor = new ColorHelper(colors,
                properties["fontColor"],
                defaultSettings.fontColor).getColorForMeasure(objects, "");

            let show = DataViewObjects.getValue<boolean>(
                objects,
                properties["show"],
                defaultSettings.show);

            let position = DataViewObjects.getValue<XAxisPosition>(
                objects,
                properties["position"],
                defaultSettings.position);

            let backgroundColor = new ColorHelper(colors,
                properties["backgroundColor"],
                defaultSettings.backgroundColor).getColorForMeasure(objects, "");

            return {
                show: show,
                position: position,
                color: color,
                fontColor: fontColor,
                backgroundColor: backgroundColor
            };
        }

        private static getAxisYSettings(objects: DataViewObjects, colors: IColorPalette): PulseChartYAxisSettings {
            let properties = pulseChartProps["yAxis"],
                defaultSettings: PulseChartYAxisSettings = PulseChart.DefaultSettings.yAxis;

            let colorHelper = new ColorHelper(
                colors,
                properties["color"],
                defaultSettings.color);

            let color = colorHelper.getColorForMeasure(objects, "");

            let fontColorHelper = new ColorHelper(
                colors,
                properties["fontColor"],
                defaultSettings.fontColor);

            let fontColor = fontColorHelper.getColorForMeasure(objects, "");

            let show = DataViewObjects.getValue<boolean>(
                objects,
                properties["show"],
                defaultSettings.show);

            return {
                color: color,
                fontColor: fontColor,
                show: show,
            };
        }

        private static getPlaybackSettings(objects: DataViewObjects, colors: IColorPalette): PulseChartPlaybackSettings {
            let playbackSettings: PulseChartPlaybackSettings = <PulseChartPlaybackSettings>{};
            let properties = pulseChartProps["playback"],
                defaultSettings: PulseChartPlaybackSettings = PulseChart.DefaultSettings.playback;

            playbackSettings.autoplay = DataViewObjects.getValue<boolean>(
                objects,
                properties["autoplay"],
                defaultSettings.autoplay);

            playbackSettings.playSpeed = Math.max(1, Math.min(99999, DataViewObjects.getValue<number>(
                objects,
                properties["playSpeed"],
                defaultSettings.playSpeed)));

            playbackSettings.pauseDuration = Math.max(0, Math.min(9999, DataViewObjects.getValue<number>(
                objects,
                properties["pauseDuration"],
                defaultSettings.pauseDuration)));

            playbackSettings.autoplayPauseDuration = Math.max(1, Math.min(9999, DataViewObjects.getValue<number>(
                objects,
                properties["autoplayPauseDuration"],
                defaultSettings.autoplayPauseDuration)));

            let colorHelper = new ColorHelper(
                colors,
                properties["color"],
                defaultSettings.color);

            playbackSettings.color = colorHelper.getColorForMeasure(objects, "");

            let position: string = DataViewObjects.getValue<string>(objects, properties["position"], "");
            if (position.length > 3) {
                try {
                    playbackSettings.position = JSON.parse(position);
                } catch (ex) {

                }
            }

            playbackSettings.position = playbackSettings.position || defaultSettings.position;

            return playbackSettings;
        }

        private static getRunnerCounterSettings(
            objects: DataViewObjects,
            colors: IColorPalette,
            columns: PulseChartDataRoles<DataViewCategoricalColumn>): PulseChartRunnerCounterSettings {

            let show: boolean = DataViewObjects.getValue<boolean>(
                objects,
                pulseChartProps["runnerCounter"]["show"],
                PulseChart.DefaultSettings.runnerCounter.show);

            let label: string = DataViewObjects.getValue<string>(
                objects,
                pulseChartProps["runnerCounter"]["label"],
                columns.RunnerCounter && columns.RunnerCounter.source && columns.RunnerCounter.source.displayName
                || PulseChart.DefaultSettings.runnerCounter.label);

            let position = DataViewObjects.getValue<RunnerCounterPosition>(
                objects,
                pulseChartProps["runnerCounter"]["position"],
                PulseChart.DefaultSettings.runnerCounter.position);

            let fontSize = parseInt(DataViewObjects.getValue<any>(
                objects,
                pulseChartProps["runnerCounter"]["fontSize"],
                PulseChart.DefaultSettings.runnerCounter.fontSize), 10);

            let fontColor = new ColorHelper(
                colors,
                pulseChartProps["runnerCounter"]["fontColor"],
                PulseChart.DefaultSettings.runnerCounter.fontColor)
                .getColorForMeasure(objects, "");

            return {
                show: show,
                label: label,
                position: position,
                fontSize: fontSize,
                fontColor: fontColor
            };
        }
        private clearAll(hide: boolean): void {
            this.gaps.selectAll(PulseChart.Gap.selector).remove();

            if (this.animationHandler) {
                this.animationHandler.reset();
                this.animationHandler.clear();
            }

            if (hide) {
                this.svg.style('display', "none");
            }

            this.clearChart();
        }
        public clearChart(): void {
            this.onClearSelection();
            this.hideAnimationDot();
            this.chart.selectAll(PulseChart.Line.selector).remove();
            this.chart.selectAll(PulseChart.Dot.selector).remove();
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            switch (options.objectName) {
                case "general": {
                    return this.readGeneralInstance();
                }
                case "popup": {
                    return this.readPopupInstance();
                }
                case "dots": {
                    return this.readDotsInstance();
                }
                case "xAxis": {
                    return this.xAxisInstance();
                }
                case "yAxis": {
                    return this.yAxisInstance();
                }
                case "series": {
                    return this.readSeriesInstance();
                }
                case "gaps": {
                    return this.readGapsInstance();
                }
                case "playback": {
                    return this.readPlaybackInstance();
                }
                case "runnerCounter": {
                    return this.readRunnerCounterInstance();
                }
                default: {
                    return [];
                }
            }
        }

        private getSettings(name: string): any {
            if (this.data && this.data.settings && this.data.settings[name]) {
                return this.data.settings[name];
            }
            return PulseChart.DefaultSettings[name];
        }

        private readGeneralInstance(): VisualObjectInstance[] {
            let instance: VisualObjectInstance = {
                objectName: "general",
                displayName: "general",
                selector: null,
                properties: {
                }
            };

            return [instance];
        }

        private readPopupInstance(): VisualObjectInstance[] {
            let settings: PulseChartPopupSettings = this.getSettings("popup");

            let instance: VisualObjectInstance = {
                objectName: "popup",
                displayName: "popup",
                selector: null,
                properties: {
                    show: settings.show,
                    alwaysOnTop: settings.alwaysOnTop,
                    width: settings.width,
                    height: settings.height,
                    color: settings.color,
                    fontColor: settings.fontColor,
                    fontSize: settings.fontSize,
                    showTime: settings.showTime,
                    showTitle: settings.showTitle,
                    timeColor: settings.timeColor,
                    timeFill: settings.timeFill,
                }
            };

            return [instance];
        }

        private readDotsInstance(): VisualObjectInstance[] {
            let settings: PulseChartDotsSettings = this.getSettings("dots");

            let instance: VisualObjectInstance = {
                objectName: "dots",
                displayName: "Dots",
                selector: null,
                properties: {
                    color: settings.color,
                    size: settings.size,
                    minSize: settings.minSize,
                    maxSize: settings.maxSize,
                    transparency: settings.transparency,
                }
            };

            return [instance];
        }

        private xAxisInstance(): VisualObjectInstance[] {
            let settings: PulseChartXAxisSettings = this.getSettings("xAxis");

            let instance: VisualObjectInstance = {
                objectName: "xAxis",
                displayName: "xAxis",
                selector: null,
                properties: {
                    show: settings.show,
                    position: settings.position,
                    color: settings.color,
                    fontColor: settings.fontColor,
                    backgroundColor: settings.backgroundColor
                }
            };

            return [instance];
        }

        private yAxisInstance(): VisualObjectInstance[] {
            let settings: PulseChartYAxisSettings = this.getSettings("yAxis");

            let instance: VisualObjectInstance = {
                objectName: "yAxis",
                displayName: "yAxis",
                selector: null,
                properties: {
                    color: settings.color,
                    fontColor: settings.fontColor,
                    show: settings.show
                }
            };

            return [instance];
        }

        private readSeriesInstance(): VisualObjectInstance[] {
            let settings: PulseChartSeriesSetting = this.getSettings("series");

            let instance: VisualObjectInstance = {
                objectName: "series",
                displayName: "series",
                selector: null,
                properties: {
                    fill: settings.fill,
                    width: settings.width,
                    // showByDefault: settings.showByDefault
                }
            };

            return [instance];
        }

        private readGapsInstance(): VisualObjectInstance[] {
            let settings: PulseChartGapsSettings = this.getSettings("gaps");

            let instance: VisualObjectInstance = {
                objectName: "gaps",
                selector: null,
                properties: {
                    show: settings.show,
                    transparency: settings.visibleGapsPercentage // visibleGapsPercentage
                }
            };

            return [instance];
        }

        private readPlaybackInstance(): VisualObjectInstance[] {
            let settings: PulseChartPlaybackSettings = this.getSettings("playback");

             let instance: VisualObjectInstance = {
                objectName: "playback",
                displayName: "playback",
                selector: null,
                properties: {
                    autoplay: settings.autoplay,
                    playSpeed: settings.playSpeed,
                    pauseDuration: settings.pauseDuration,
                    autoplayPauseDuration: settings.autoplayPauseDuration,
                    color: settings.color,
                }
            };

            return [instance];
        }

        private readRunnerCounterInstance(): VisualObjectInstance[] {
            let runnerCounterSettings: PulseChartRunnerCounterSettings = this.getSettings("runnerCounter");

            let instance: VisualObjectInstance = {
                objectName: "runnerCounter",
                selector: null,
                properties: {
                }
            };

            if (this.data &&
                this.data.columns &&
                this.data.columns.RunnerCounter) {
                instance.properties = {
                    show: runnerCounterSettings.show,
                    label: runnerCounterSettings.label,
                    position: runnerCounterSettings.position,
                    fontSize: runnerCounterSettings.fontSize,
                    fontColor: runnerCounterSettings.fontColor
                };

                return [instance];
            }

            return [];
        }

        public destroy(): void {
            this.data = null;
            this.clearAll(true);
        }

    }
}
