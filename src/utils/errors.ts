export const NOT_IMPLEMENTED = "Method not implemented.";
export const ARGUMENT_NULL_UNDEFINED = "Argument is null or undefined.";
export const INVALID_ARGUMENT = "Invalid argument.";
export const NOT_SUPPORTED = "Not supported";

export class NotImplementedError extends Error {
	constructor() {
		super(NOT_IMPLEMENTED);
	}
}

export class ArgumentNullOrUndefinedError extends Error {
	constructor() {
		super(ARGUMENT_NULL_UNDEFINED);
	}
}

export class InvalidArgumentError<T extends { toString(): string }> extends Error {
	value: T;
	expected: string | undefined;

	constructor(value: T, expected?: string) {
		let message = INVALID_ARGUMENT;
		if (expected) message = message.concat(` Expected: ${expected} Value: ${value.toString()} `);
		else message = message.concat(` Value: ${value.toString()}`);
		super(message);
		this.value = value;
		this.expected = expected;
	}
}

export class PayloadParseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Payload Parse Error";
	}
}

export class NotSupportedError extends Error {
	constructor(message?: string) {
		super(message ? message : NOT_SUPPORTED);
	}
}
