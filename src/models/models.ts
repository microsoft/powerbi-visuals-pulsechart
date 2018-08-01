module powerbi.extensibility.visual {
    // d3
    import Axis = d3.svg.Axis;
    import Selection = d3.Selection;

    // powerbi.extensibility.utils.tooltip
    import TooltipEnabledDataPoint = utils.tooltip.TooltipEnabledDataPoint;

    // powerbi.extensibility.utils.interactivity
    import SelectableDataPoint = utils.interactivity.SelectableDataPoint;
    import IInteractiveBehavior = utils.interactivity.IInteractiveBehavior;
    import IInteractivityService = utils.interactivity.IInteractivityService;

    // powerbi.extensibility.utils.chart
    import LabelEnabledDataPoint = utils.chart.dataLabel.LabelEnabledDataPoint;
    import LegendData = utils.chart.legend.LegendData;

    // powerbi.extensibility.utils.formatting
    import ValueFormatterOptions = utils.formatting.ValueFormatterOptions;

    // TYPES
    export type GenericScale = TimeScale | LinearScale;

    // INTERFACES
    export interface Line extends d3.svg.Line<PointXY> { }
    export interface LinearScale extends d3.scale.Linear<any, any> { }
    export interface TimeScale extends d3.time.Scale<any, any> { }
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

    export interface ChartDataLabelsSettings extends PointDataLabelsSettings {
        labelDensity: string;
    }

    export interface TooltipData {
        value: string | Date;
        title: string;
        description: string;
        offsetX?: number;
    }

    export interface AnimationPosition {
        series: number;
        index: number;
    }

    export interface PointXY {
        x: number;
        y: number;
    }

    export interface PrimitiveDataPoint
        extends TooltipEnabledDataPoint, SelectableDataPoint, LabelEnabledDataPoint {

        categoryValue: any;
        value: number;
        categoryIndex: number;
        seriesIndex: number;
        highlight?: boolean;
        key?: string;
        labelSettings: ChartDataLabelsSettings;
        pointColor?: string;
    }

    export interface DataPoint extends PrimitiveDataPoint, PointXY {
        groupIndex: number;
        popupInfo?: TooltipData;
        eventSize: number;
        runnerCounterValue: any;
        runnerCounterFormatString: any;
    }

    export interface AxisSettings {
        formatterOptions?: ValueFormatterOptions;
        fontColor: string;
        color: string;
        show: boolean;
    }

    export interface AxesLabels {
        x: string;
        y: string;
        y2?: string;
    }

    export interface Series {
        name?: string;
        displayName: string;
        lineIndex: number;
        labelSettings: ChartDataLabelsSettings;
        data: DataPoint[];
        color: string;
        width: number;
        xAxisProperties?: XAxisProperties;
        widthOfGap: number;
    }

    export interface ChartData {
        settings: PulseChartSettings;
        columns: DataRoles<DataViewCategoricalColumn>;
        categoryMetadata: DataViewMetadataColumn;
        hasHighlights: boolean;

        dots: DataPoint[];
        series: Series[];
        isScalar?: boolean;
        dataLabelsSettings: PointDataLabelsSettings;
        axesLabels: AxesLabels;
        hasDynamicSeries?: boolean;
        defaultSeriesColor?: string;
        categoryData?: PrimitiveDataPoint[];

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

    export interface XAxisProperties {
        values: (Date | number)[];
        scale: TimeScale;
        axis: Axis;
        rotate: boolean;
    }

    export interface DataRoles<T> {
        Timestamp?: T;
        Category?: T;
        Value?: T;
        EventTitle?: T;
        EventDescription?: T;
        EventSize?: T;
        RunnerCounter?: T;
    }

    export interface ElementDimensions {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    export interface BehaviorOptions {
        selection: Selection<any>;
        clearCatcher: Selection<any>;
        interactivityService: IInteractivityService;
        hasHighlights: boolean;
        onSelectCallback(): void;
    }

    export interface IPulseChartInteractiveBehavior extends IInteractiveBehavior {
        setSelection(d: DataPoint): void;
    }

    export interface TooltipSettings {
        dataPointColor: string;
        marginTop: number;
        timeHeight: number;
    }
}
