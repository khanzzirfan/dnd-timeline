import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, PointerEventHandler } from "react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import type {
	DragDirection,
	ItemData,
	ResizeEndEvent,
	ResizeMoveEvent,
	ResizeStartEvent,
	UseItemProps,
} from "../types";

import useTimelineContext from "./useTimelineContext";

const getDragDirection = (
	mouseX: number,
	clientRect: DOMRect,
	direction: CanvasDirection,
	resizeHandleWidth: number,
): DragDirection | null => {
	const startSide = direction === "rtl" ? "right" : "left";
	const endSide = direction === "rtl" ? "left" : "right";

	if (Math.abs(mouseX - clientRect[startSide]) <= resizeHandleWidth / 2) {
		return "start";
	}

	if (Math.abs(mouseX - clientRect[endSide]) <= resizeHandleWidth / 2) {
		return "end";
	}

	return null;
};

export default function useItem(props: UseItemProps) {
	const dataRef = useRef<ItemData>({} as ItemData);
	const dragStartX = useRef<number>();
	const [dragDirection, setDragDirection] = useState<DragDirection | null>();

	const maxEndTime = props.maxEndTime || 0;
	const minStartTime = props.minStartTime || 0;

	const {
		range,
		overlayed,
		onResizeEnd,
		onResizeMove,
		onResizeStart,
		direction,
		resizeHandleWidth,
		valueToPixels,
		getSpanFromDragEvent,
		getSpanFromResizeEvent,
	} = useTimelineContext();

	const propsOnResizeEnd = props.onResizeEnd;
	const propsOnResizeStart = props.onResizeStart;
	const propsOnResizeMove = props.onResizeMove;

	const onResizeEndCallback = useCallback(
		(event: ResizeEndEvent) => {
			onResizeEnd(event);
			propsOnResizeEnd?.(event);
		},
		[onResizeEnd, propsOnResizeEnd],
	);

	const onResizeStartCallback = useCallback(
		(event: ResizeStartEvent) => {
			onResizeStart?.(event);
			propsOnResizeStart?.(event);
		},
		[onResizeStart, propsOnResizeStart],
	);

	const onResizeMoveCallback = useCallback(
		(event: ResizeMoveEvent) => {
			onResizeMove?.(event);
			propsOnResizeMove?.(event);
		},
		[onResizeMove, propsOnResizeMove],
	);

	dataRef.current = {
		getSpanFromDragEvent,
		getSpanFromResizeEvent,
		span: props.span,
		...(props.data || {}),
	};

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: props.id,
		data: dataRef.current,
		disabled: props.disabled,
	});

	const deltaXStart = valueToPixels(props.span.start - range.start);
	const minDeltaXStart = valueToPixels(minStartTime - range.start);
	const deltaXEnd = valueToPixels(range.end - props.span.end);
	const width = valueToPixels(props.span.end - props.span.start);
	const maxWidthInPixel = valueToPixels(maxEndTime - minStartTime);
	const minLeft = valueToPixels(minStartTime - range.start);

	const sideStart = direction === "rtl" ? "right" : "left";
	const sideEnd = direction === "rtl" ? "left" : "right";

	const cursor = props.disabled ? "inherit" : isDragging ? "grabbing" : "grab";

	const nodeRef = useRef<HTMLElement | null>(null);

	useLayoutEffect(() => {
		if (!dragDirection) return;

		const pointermoveHandler = (event: PointerEvent) => {
			if (!dragStartX.current || !nodeRef.current) return;

			const dragDeltaX =
				(event.clientX - dragStartX.current) * (direction === "rtl" ? -1 : 1);

			if (dragDirection === "start") {
				const newSideDelta = deltaXStart + dragDeltaX;
				const newWidth = width + deltaXStart - newSideDelta;
				if (minStartTime && minLeft >= newSideDelta) {
					const currentMinLeft = Math.max(minLeft, newSideDelta);
					nodeRef.current.style[sideStart] = `${currentMinLeft}px`;
				} else {
					nodeRef.current.style[sideStart] = `${newSideDelta}px`;
					nodeRef.current.style.width = `${newWidth}px`;
				}

				if (maxEndTime) {
					const currentMaxWidth = Math.min(maxWidthInPixel, newWidth);
					nodeRef.current.style.width = `${currentMaxWidth}px`;
					nodeRef.current.style.maxWidth = `${maxWidthInPixel}px`;
				}
			} else {
				const otherSideDelta = deltaXStart + width + dragDeltaX;
				const newWidth = otherSideDelta - deltaXStart;
				nodeRef.current.style.width = `${newWidth}px`;
				if (maxEndTime) {
					const currentMaxWidth = Math.min(maxWidthInPixel, newWidth);
					nodeRef.current.style.width = `${currentMaxWidth}px`;
					nodeRef.current.style.maxWidth = `${maxWidthInPixel}px`;
				}
			}

			onResizeMoveCallback({
				activatorEvent: event,
				delta: {
					x: dragDeltaX,
				},
				direction: dragDirection,
				active: {
					id: props.id,
					data: dataRef,
				},
			});
		};

		window.addEventListener("pointermove", pointermoveHandler);
		return () => window.removeEventListener("pointermove", pointermoveHandler);
	}, [
		sideStart,
		width,
		deltaXStart,
		props.id,
		dragDirection,
		direction,
		onResizeMoveCallback,
		maxWidthInPixel,
		maxEndTime,
		minStartTime,
		minDeltaXStart,
	]);

	useLayoutEffect(() => {
		if (!dragDirection) return;

		const pointerupHandler = (event: PointerEvent) => {
			if (!dragStartX.current || !nodeRef.current) return;
			try {
				let dragDeltaX = 0;
				if (dragDirection === "start") {
					const currentSideDelta = Number.parseInt(
						nodeRef.current.style[sideStart],
					);
					dragDeltaX = currentSideDelta - deltaXStart;
				} else {
					const currentWidth = Number.parseInt(nodeRef.current.style.width);
					dragDeltaX = currentWidth - width;
				}

				onResizeEndCallback({
					activatorEvent: event,
					delta: {
						x: dragDeltaX,
					},
					direction: dragDirection,
					active: {
						id: props.id,
						data: dataRef,
					},
				});

				setDragDirection(null);
				if (nodeRef.current && nodeRef.current.style) {
					nodeRef.current.style.width = `${width}px`;
					nodeRef.current.style[sideStart] = `${deltaXStart}px`;
				}
			} catch (error) {
				console.log("Error in pointerupHandler:", error);
			}
		};

		window.addEventListener("pointerup", pointerupHandler);
		return () => window.removeEventListener("pointerup", pointerupHandler);
	}, [
		sideStart,
		width,
		deltaXStart,
		props.id,
		dragDirection,
		onResizeEndCallback,
	]);

	const onPointerMove = useCallback<PointerEventHandler>(
		(event) => {
			if (!nodeRef.current || props.disabled) return;

			const newDragDirection = getDragDirection(
				event.clientX,
				nodeRef.current.getBoundingClientRect(),
				direction,
				resizeHandleWidth,
			);

			nodeRef.current.style.cursor = newDragDirection ? "col-resize" : cursor;
		},
		[props.disabled, direction, cursor, resizeHandleWidth],
	);

	const onPointerDown = useCallback<PointerEventHandler>(
		(event) => {
			if (!nodeRef.current || props.disabled) return;

			const newDragDirection = getDragDirection(
				event.clientX,
				nodeRef.current.getBoundingClientRect(),
				direction,
				resizeHandleWidth,
			);

			if (newDragDirection) {
				setDragDirection(newDragDirection);
				dragStartX.current = event.clientX;

				onResizeStartCallback({
					// @ts-ignore
					activatorEvent: event,
					active: {
						id: props.id,
						data: dataRef,
					},
					direction: newDragDirection,
				});
			} else {
				listeners?.onPointerDown?.(event);
			}
		},
		[
			props.id,
			props.disabled,
			direction,
			resizeHandleWidth,
			onResizeStartCallback,
			listeners,
		],
	);

	const paddingStart = direction === "rtl" ? "paddingRight" : "paddingLeft";
	const paddingEnd = direction === "rtl" ? "paddingLeft" : "paddingRight";

	const styleTransform = CSS.Transform.toString(transform);

	const itemStyle: CSSProperties = useMemo(
		() => ({
			position: "absolute",
			top: 0,
			width,
			[sideStart]: deltaXStart,
			[sideEnd]: deltaXEnd,
			cursor,
			height: "100%",
			touchAction: "none",
			transition,
			...(isDragging && overlayed ? {} : { transform: styleTransform }),
		}),
		[
			width,
			sideStart,
			deltaXStart,
			sideEnd,
			deltaXEnd,
			cursor,
			transition,
			isDragging,
			overlayed,
			styleTransform,
		],
	);

	const itemContentStyle: CSSProperties = useMemo(
		() => ({
			height: "100%",
			display: "flex",
			overflow: "hidden",
			alignItems: "stretch",
			[paddingStart]: Math.max(0, -deltaXStart),
			[paddingEnd]: Math.max(0, -deltaXEnd),
		}),
		[paddingStart, paddingEnd, deltaXStart, deltaXEnd],
	);

	const setRef = useCallback(
		(node: HTMLElement | null) => {
			nodeRef.current = node;
			setNodeRef(node);
		},
		[setNodeRef],
	);

	return {
		itemStyle,
		itemContentStyle,
		attributes,
		listeners: {
			...listeners,
			onPointerDown,
			onPointerMove,
		},
		setNodeRef: setRef,
		isDragging,
	};
}
