/** Text content. */
export interface TextContent {
	type: 'text';
	text: string;
}

/** Image content: base64 bytes and their type. */
export interface ImageContent {
	type: 'image';
	data: string;
	mimeType: 'image/png';
}

/** A tool's result: its content, and whether it failed. */
export interface ToolResult {
	[key: string]: unknown;
	content: (TextContent | ImageContent)[];
	isError?: boolean;
}

/** A value as text content: pretty JSON, or a string as it is. */
export function text(value: unknown): TextContent;
/** A PNG as image content. */
export function image(png: Uint8Array): ImageContent;
/** A tool's result from its content. */
export function result(...content: (TextContent | ImageContent)[]): ToolResult;
/** What went wrong, as the caller should read it. */
export function explain(e: unknown): string;
/** A tool error: the message, flagged `isError`. */
export function failure(e: unknown): ToolResult;
