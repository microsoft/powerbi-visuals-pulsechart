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

    // powerbi.extensibility.utils.interactivity
    import appendClearCatcher = powerbi.extensibility.utils.interactivity.appendClearCatcher;
    import SelectableDataPoint = powerbi.extensibility.utils.interactivity.SelectableDataPoint;
    import IInteractiveBehavior = powerbi.extensibility.utils.interactivity.IInteractiveBehavior;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import ISelectionHandler = powerbi.extensibility.utils.interactivity.ISelectionHandler;

    export class PulseChartWebBehavior implements IPulseChartInteractiveBehavior {
        private selection: Selection<any>;
        private selectionHandler: ISelectionHandler;
        private interactivityService: IInteractivityService;
        private hasHighlights: boolean;
        private onSelectCallback: any;

        public bindEvents(options: PulseChartBehaviorOptions, selectionHandler: ISelectionHandler): void {
            let clearCatcher: Selection<any> = options.clearCatcher;
            let selection: Selection<any> = this.selection = options.selection;
            this.onSelectCallback = options.onSelectCallback;
            this.selectionHandler = selectionHandler;
            this.interactivityService = options.interactivityService;
            this.hasHighlights = options.hasHighlights;

            selection.call(pulseChartUtils.AddOnTouchClick, function (d: SelectableDataPoint) {
                selectionHandler.handleSelection(d, (d3.event as KeyboardEvent).ctrlKey);
            });

            clearCatcher.call(pulseChartUtils.AddOnTouchClick, function () {
                selectionHandler.handleClearSelection();
            });
        }

        public setSelection(d: SelectableDataPoint): void {
            this.selectionHandler.handleSelection(d, false);
        }

        public renderSelection(hasSelection: boolean): void {
            if (this.onSelectCallback) {
                this.onSelectCallback();
            }
        }
    }

}
