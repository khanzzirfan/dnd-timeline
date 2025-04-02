import type { Active, Data } from "@dnd-kit/core";
import type { MutableRefObject } from "react";

import type {
	GetSpanFromDragEvent,
	GetSpanFromResizeEvent,
	ResizeEndEvent,
	ResizeMoveEvent,
	ResizeStartEvent,
	Span,
} from ".";

export type DragDirection = "start" | "end";

export interface ItemDefinition {
	id: string;
	rowId: string;
	disabled?: boolean;
	span: Span;
	maxEndTime?: number;
	minStartTime?: number;
}

export interface UseItemProps
	extends Pick<
		ItemDefinition,
		"id" | "span" | "disabled" | "maxEndTime" | "minStartTime"
	> {
	data?: object;
	onResizeEnd?: (event: ResizeEndEvent) => void;
	onResizeMove?: (event: ResizeMoveEvent) => void;
	onResizeStart?: (event: ResizeStartEvent) => void;
}

interface ItemDataBase extends Data {
	span: Span;
}

export interface DragItemData extends ItemDataBase {
	getSpanFromDragEvent?: GetSpanFromDragEvent;
}

export interface ResizeItemData extends ItemDataBase {
	getSpanFromResizeEvent?: GetSpanFromResizeEvent;
}

export interface ItemData extends DragItemData, ResizeItemData {}

export interface DragActiveItem extends Active {
	data: MutableRefObject<DragItemData>;
}

export interface ResizeActiveItem extends Omit<Active, "rect"> {
	data: MutableRefObject<ResizeItemData>;
}
