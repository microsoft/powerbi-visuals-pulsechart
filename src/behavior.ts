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
import { DataPoint } from './models/models';
import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;
import ISelectionManager = powerbi.extensibility.ISelectionManager;

export interface BaseDataPoint {
    selected: boolean;
}

export interface SelectableDataPoint extends BaseDataPoint {
    identity: ISelectionId;
    specificIdentity?: ISelectionId;
}

export interface BehaviorOptions {
    dataPoints: DataPoint[];
    selection: Selection<BaseType, any, BaseType, any>;
    clearCatcher: Selection<BaseType, any, BaseType, any>;
    hasHighlights: boolean;
    onSelectCallback(): void;
}

export class Behavior {
    private selectionManager: ISelectionManager;
    private options: BehaviorOptions;

    constructor(selectionManager: ISelectionManager) {
        this.selectionManager = selectionManager;

        // When 'Clear selections' item in context menu is clicked, visual should update selection
        this.selectionManager.registerOnSelectCallback((selectionIds) => {
            for (const dataPoint of this.options.dataPoints) {
                dataPoint.selected = this.isDataPointSelected(dataPoint, <ISelectionId[]>selectionIds);
            }

            if (this.options.onSelectCallback) {
                this.options.onSelectCallback();
            }
        });
    }

    public bindEvents(options: BehaviorOptions): void {
        this.options = options;
        this.bindClick();
        this.bindContextMenu();
        this.bindKeyboardEvents();
    }

    private bindClick(): void {
        this.options.selection.on("click touchstart", (event: MouseEvent, d: SelectableDataPoint) => {
            event.preventDefault();
            event.stopPropagation();
            this.select(d, event.ctrlKey || event.metaKey || event.shiftKey);
            this.renderSelection();
        });

        this.options.clearCatcher.on("click touchstart", (event: MouseEvent) => {
            event.preventDefault();
            this.clearSelection();
        });
    }

    private bindContextMenu(): void {
        this.options.selection.on("contextmenu", (event: MouseEvent, dataPoint: SelectableDataPoint) => {
            event.preventDefault();
            event.stopPropagation();

            this.selectionManager.showContextMenu(dataPoint && dataPoint.identity ? dataPoint.identity : {}, {
                x: event.clientX,
                y: event.clientY,
            });
        });

        this.options.clearCatcher.on("contextmenu", (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();

            this.selectionManager.showContextMenu({}, {
                x: event.clientX,
                y: event.clientY,
            });
        });
    }

    private bindKeyboardEvents(): void {
        this.options.selection.on("keydown", (event: KeyboardEvent, dataPoint: SelectableDataPoint) => {
            if (event.code !== "Enter" && event.code !== "Space") {
                return;
            }

            this.select(dataPoint, event.ctrlKey || event.metaKey || event.shiftKey);
            this.syncSelectionState();
            this.renderSelection();
        });
    }

    public setSelection(dataPoint: SelectableDataPoint, multiSelect?: boolean): void {
        this.select(dataPoint, multiSelect)
        this.renderSelection();
    }

    public clearSelection(): void {
        this.selectionManager.clear();
        this.renderSelection();
    }

    // TODO: check if this method is needed. It looks like it just clears selection
    public applySelectionStateToData(dataPoints: SelectableDataPoint[], hasHighlights?: boolean): boolean {
        if (hasHighlights && this.hasSelection) {
            this.selectionManager.clear();
        }

        const selectedIds: ISelectionId[] = <ISelectionId[]>this.selectionManager.getSelectionIds();
        for (const dataPoint of dataPoints) {
            dataPoint.selected = this.isDataPointSelected(dataPoint, selectedIds);
        }

        return this.hasSelection;
    }

    public get hasSelection(): boolean {
        const selectionIds = this.selectionManager.getSelectionIds();
        return selectionIds.length > 0;
    }


    private select(dataPoint: SelectableDataPoint, multiSelect: boolean): void {
        const selectionIdsToSelect: ISelectionId[] = [dataPoint.identity];
        this.selectionManager.select(selectionIdsToSelect, multiSelect);
    }

    private renderSelection(): void {
        this.syncSelectionState();

        if (this.options.onSelectCallback) {
            this.options.onSelectCallback();
        }
    }

    private syncSelectionState(): void {
        const selectedIds: ISelectionId[] = <ISelectionId[]>this.selectionManager.getSelectionIds();
        for (const dataPoint of this.options.dataPoints) {
            dataPoint.selected = this.isDataPointSelected(dataPoint, selectedIds);
        }
    }

    private isDataPointSelected(dataPoint: SelectableDataPoint, selectedIds: ISelectionId[]): boolean {
        return selectedIds.some((value: ISelectionId) => value.includes(<ISelectionId>dataPoint.identity));
    }
}
