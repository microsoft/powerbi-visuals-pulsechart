module powerbi.extensibility.visual {
    export enum Orientation {
        Vertical,
        Horizontal
    }

    export enum PointLabelPosition {
        Above,
        Below,
    }

    export enum AnimatorStates {
        Ready,
        Play,
        Paused,
        Stopped,
    }

    export enum XAxisDateFormat {
        DateOnly = 60 * 1000 * 24,
        TimeOnly = 60 * 1000
    }
    export enum XAxisPosition {
        Center,
        Bottom
    }
    export enum RunnerCounterPosition {
        TopLeft,
        TopRight
    }
}
