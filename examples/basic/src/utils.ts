import { minutesToMilliseconds, addSeconds } from "date-fns";
import type { ItemDefinition, Range, RowDefinition, Span } from "dnd-timeline";
import { nanoid } from "nanoid";

interface GenerateRowsOptions {
	disabled?: boolean;
}
const defaultDate = new Date('2021-01-01T00:00:00.000Z');

export const generateRows = (count: number, options?: GenerateRowsOptions) => {
	return Array(count)
		.fill(0)
		.map((): RowDefinition => {
			const disabled = options?.disabled;

			let id = `row-${nanoid(4)}`;
			if (disabled) id += " (disabled)";

			return {
				id,
				disabled,
			};
		});
};

const getRandomInRange = (min: number, max: number) => {
	return Math.random() * (max - min) + min;
};

const DEFAULT_MIN_LENGTH = minutesToMilliseconds(60);
const DEFAULT_MAX_LENGTH = minutesToMilliseconds(360);

export const generateRandomSpan = (
	range: Range,
	minLength: number = DEFAULT_MIN_LENGTH,
	maxLength: number = DEFAULT_MAX_LENGTH,
): Span => {
	const duration = getRandomInRange(minLength, maxLength);

	const start = getRandomInRange(range.start, range.end - duration);

	const end = start + duration;

	return {
		start: start,
		end: end,
	};
};

interface GenerateItemsOptions {
	disabled?: boolean;
	background?: boolean;
	minLength?: number;
	maxLength?: number;
}

const generateSpanWithSeconds = (start:number, end:number): Span => {
	return {
		start: addSeconds(defaultDate, start).getTime(),
		end: addSeconds(defaultDate, end).getTime()
	};
};

export const generateItems = (
	count: number,
	range: Range,
	rows: RowDefinition[],
	options?: GenerateItemsOptions,
) => {
	return Array(count)
		.fill(0)
		.map((): ItemDefinition => {
			const row = rows[Math.ceil(Math.random() * rows.length - 1)];
			const rowId = row.id;
			const disabled = row.disabled || options?.disabled;

			const span = generateSpanWithSeconds(10,30);
			const maxEndTime = addSeconds(defaultDate, 50).getTime();
			const minStartTime = addSeconds(defaultDate, 10).getTime();

			let id = `item-${nanoid(4)}`;
			if (disabled) id += " (disabled)";

			return {
				id,
				rowId,
				span,
				disabled,
				maxEndTime,
				minStartTime,
			};
		});
};
