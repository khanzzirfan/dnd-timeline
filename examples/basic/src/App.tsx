import "./index.css";
import { endOfDay,addMinutes, addSeconds, startOfDay } from "date-fns";
import type { DragEndEvent, Range, ResizeEndEvent } from "dnd-timeline";
import { TimelineContext } from "dnd-timeline";
import React, { useCallback, useState } from "react";
import Timeline from "./Timeline";
import { generateItems, generateRows } from "./utils";

const defaultDate = new Date('2021-01-01T00:00:00.000Z');
const DEFAULT_RANGE = {
  start: addMinutes(defaultDate, 0).getTime(),
  end: addMinutes(defaultDate, 5).getTime()
};

function App() {
	const [range, setRange] = useState(DEFAULT_RANGE);

	const [rows] = useState(generateRows(5));
	const [items, setItems] = useState(generateItems(10, range, rows));

	const onResizeEnd = useCallback((event: ResizeEndEvent) => {
		const updatedSpan =
			event.active.data.current.getSpanFromResizeEvent?.(event);

		if (!updatedSpan) return;

		const activeItemId = event.active.id;

		setItems((prev) =>
			prev.map((item) => {
				if (item.id !== activeItemId) return item;

				return {
					...item,
					span: updatedSpan,
				};
			}),
		);
	}, []);

	const onDragEnd = useCallback((event: DragEndEvent) => {
		const activeRowId = event.over?.id as string;
		const updatedSpan = event.active.data.current.getSpanFromDragEvent?.(event);

		if (!updatedSpan || !activeRowId) return;

		const activeItemId = event.active.id;

		setItems((prev) =>
			prev.map((item) => {
				if (item.id !== activeItemId) return item;

				return {
					...item,
					rowId: activeRowId,
					span: updatedSpan,
				};
			}),
		);
	}, []);

	return (
		<>
		<h1>Basic</h1>
		<h1>Basic</h1>
		<h1>Basic</h1>
		<TimelineContext
			range={range}
			onDragEnd={onDragEnd}
			onResizeEnd={onResizeEnd}
			onRangeChanged={setRange}
		>
			<Timeline items={items} rows={rows} />
		</TimelineContext>
		</>
	);
}

export default App;
