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

import { BaseType, Selection } from "d3-selection";

import { interactivitySelectionService, interactivityBaseService } from "powerbi-visuals-utils-interactivityutils";
import SelectableDataPoint = interactivitySelectionService.SelectableDataPoint;
import IInteractiveBehavior = interactivityBaseService.IInteractiveBehavior;
import IInteractivityService = interactivityBaseService.IInteractivityService;
import ISelectionHandler = interactivityBaseService.ISelectionHandler;

import { BehaviorOptions, DataPoint } from "./models/models";

export class WebBehavior implements IInteractiveBehavior {
    private selection: Selection<BaseType, any, BaseType, any>;
    private selectionHandler: ISelectionHandler;
    private interactivityService: IInteractivityService<DataPoint>;
    private hasHighlights: boolean;
    private onSelectCallback: any;

    public bindEvents(options: BehaviorOptions, selectionHandler: ISelectionHandler): void {
        const clearCatcher: Selection<BaseType, any, BaseType, any> = options.clearCatcher;
        const selection: Selection<BaseType, any, BaseType, any> = this.selection = options.selection;
        this.onSelectCallback = options.onSelectCallback;
        this.selectionHandler = selectionHandler;
        this.interactivityService = options.interactivityService;
        this.hasHighlights = options.hasHighlights;

        selection.on("click touchstart", function(event: MouseEvent, d: SelectableDataPoint) {
            event.preventDefault();
            event.stopPropagation();
            selectionHandler.handleSelection(d, event.ctrlKey || event.metaKey || event.shiftKey);
        })

        clearCatcher.on("click touchstart", (event: MouseEvent) => {
            event.preventDefault();
            selectionHandler.handleClearSelection();
        })
    }

    public setSelection(d: SelectableDataPoint): void {
        this.selectionHandler.handleSelection(d, false);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public renderSelection(hasSelection: boolean): void {
        if (this.onSelectCallback) {
            this.onSelectCallback();
        }
    }
}
