import { ChainId, tryUint8ArrayToNative, uint8ArrayToHex } from "@certusone/wormhole-sdk";
import { importCoreWasm } from "@certusone/wormhole-sdk/lib/cjs/solana/wasm";
import { web3 } from "@project-serum/anchor";
import { BigNumber } from "ethers";

import { PayloadParseError } from "./errors";

export async function parseVaaTyped(signedVAA: Uint8Array) {
	const { parse_vaa } = await importCoreWasm();
	const parsedVAA = parse_vaa(signedVAA);
	return {
		timestamp: parseInt(parsedVAA.timestamp),
		nonce: parseInt(parsedVAA.nonce),
		emitterChain: parseInt(parsedVAA.emitter_chain) as ChainId,
		emitterAddress: parsedVAA.emitter_address,
		sequence: parseInt(parsedVAA.sequence), // wormhole's 32 byte Hex Uint8Array
		consistencyLevel: parseInt(parsedVAA.consistency_level),
		payload: parsedVAA.payload,
	};
}

export type ParsedVaa<T> = {
	timestamp: number;
	nonce: number;
	emitterChain: ChainId;
	emitterAddress: Uint8Array;
	sequence: number;
	consistencyLevel: number;
	payload: T;
};

export const sizeof = (d: "u8" | "boolean" | "u16" | "u64" | "u8[32]" | "evmAdr"): number => {
	return d === "u8" || d === "boolean" ? 1 : d === "u16" ? 2 : d === "u64" ? 8 : d === "u8[32]" ? 32 : 42;
};

export enum ZebecPayloadId {
	SolStream = 1,
	TokenStream = 2,
	SolWithdrawStream = 3,
	TokenWithdrawStream = 4,
	DepositSol = 5,
	DepositToken = 6,
	PauseSolStream = 7,
	PauseTokenStream = 8,
	WithdrawSol = 9,
	WithdrawToken = 10,
	InstantSol = 11,
	InstantToken = 12,
	SolStreamUpdate = 13,
	TokenStreamUpdate = 14,
	CancelSolStream = 15,
	CancelTokenStream = 16,
}

export type SolStreamPayload = {
	id: ZebecPayloadId;
	startTime: bigint;
	endTime: bigint;
	amount: bigint;
	targetChain: ChainId;
	sender: string; // exptected 32 byte hex in all payload
	recipient: string;
	canCancel: bigint; // may change to boolean later
	canUpdate: bigint; // may change to boolean later
};

export const parseSolStreamPayload = (arr: Buffer): SolStreamPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		startTime: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		endTime: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		amount: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		sender: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		recipient: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		canCancel: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		canUpdate: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
	};
	return payload;
};

export function IsSolStreamPayload(payload: any): payload is SolStreamPayload {
	return (
		typeof (payload as SolStreamPayload).id == "number" &&
		payload.id === ZebecPayloadId.SolStream &&
		typeof (payload as SolStreamPayload).targetChain == "number" &&
		typeof (payload as SolStreamPayload).amount == "bigint" &&
		typeof (payload as SolStreamPayload).sender == "string" &&
		typeof (payload as SolStreamPayload).recipient == "string" &&
		typeof (payload as SolStreamPayload).startTime == "bigint" &&
		typeof (payload as SolStreamPayload).endTime == "bigint" &&
		typeof (payload as SolStreamPayload).canCancel == "bigint" &&
		typeof (payload as SolStreamPayload).canUpdate == "bigint"
	);
}

export type TokenStreamPayload = {
	id: ZebecPayloadId;
	startTime: bigint;
	endTime: bigint;
	amount: bigint;
	targetChain: ChainId;
	sender: string;
	recipient: string;
	canCancel: bigint;
	canUpdate: bigint;
	tokenMint: Uint8Array; // expected 32 byte
};

export const parseTokenStreamPayload = (arr: Buffer): TokenStreamPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		startTime: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		endTime: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		amount: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		sender: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		recipient: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		canCancel: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		canUpdate: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		tokenMint: Uint8Array.from(arr.subarray(i, (i += sizeof("u8[32]")))),
	};
	return payload;
};

export function IsTokenStreamPayload(payload: any): payload is TokenStreamPayload {
	return (
		typeof (payload as TokenStreamPayload).id == "number" &&
		payload.id === ZebecPayloadId.TokenStream &&
		typeof (payload as TokenStreamPayload).targetChain == "number" &&
		typeof (payload as TokenStreamPayload).amount == "bigint" &&
		typeof (payload as TokenStreamPayload).sender == "string" &&
		typeof (payload as TokenStreamPayload).recipient == "string" &&
		typeof (payload as TokenStreamPayload).startTime == "bigint" &&
		typeof (payload as TokenStreamPayload).endTime == "bigint" &&
		typeof (payload as TokenStreamPayload).canCancel == "bigint" &&
		typeof (payload as TokenStreamPayload).canUpdate == "bigint" &&
		(payload as TokenStreamPayload).tokenMint instanceof Uint8Array
	);
}

export type SolWithdrawStreamPayload = {
	id: ZebecPayloadId;
	targetChain: ChainId;
	withdrawer: string;
};

export const parseSolWithdrawStreamPayload = (arr: Buffer): SolWithdrawStreamPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		withdrawer: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
	};
	return payload;
};

export function IsSolWithdrawStreamPayload(payload: any): payload is SolWithdrawStreamPayload {
	return (
		typeof (payload as SolWithdrawStreamPayload).id == "number" &&
		payload.id === ZebecPayloadId.SolWithdrawStream &&
		typeof (payload as SolWithdrawStreamPayload).targetChain == "number" &&
		typeof (payload as SolWithdrawStreamPayload).withdrawer == "string"
	);
}

export type TokenWithdrawStreamPayload = {
	id: ZebecPayloadId;
	targetChain: ChainId;
	withdrawer: string;
	tokenMint: Uint8Array;
	sender: string;
	dataAccount: Uint8Array;
};

export const parseTokenWithdrawStreamPayload = (arr: Buffer): TokenWithdrawStreamPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		withdrawer: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		tokenMint: Uint8Array.from(arr.subarray(i, (i += sizeof("u8[32]")))),
		sender: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		dataAccount: Uint8Array.from(arr.subarray(i, (i += sizeof("u8[32]")))),
	};
	return payload;
};

export function IsTokenWithdrawStreamPayload(payload: any): payload is TokenWithdrawStreamPayload {
	return (
		typeof (payload as TokenWithdrawStreamPayload).id == "number" &&
		payload.id === ZebecPayloadId.TokenWithdrawStream &&
		typeof (payload as TokenWithdrawStreamPayload).targetChain == "number" &&
		typeof (payload as TokenWithdrawStreamPayload).withdrawer == "string" &&
		(payload as TokenWithdrawStreamPayload).tokenMint instanceof Uint8Array &&
		typeof (payload as TokenWithdrawStreamPayload).sender == "string" &&
		(payload as TokenWithdrawStreamPayload).dataAccount instanceof Uint8Array
	);
}

export type SolDepositPayload = {
	id: ZebecPayloadId;
	amount: bigint;
	targetChain: ChainId;
	sender: string;
};

export const parseSolDepositPayload = (arr: Buffer): SolDepositPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		amount: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		sender: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
	};
	return payload;
};

export function IsSolDepositPayload(payload: any): payload is SolDepositPayload {
	return (
		typeof (payload as SolDepositPayload).id == "number" &&
		payload.id === ZebecPayloadId.DepositSol &&
		typeof (payload as SolDepositPayload).amount == "bigint" &&
		typeof (payload as SolDepositPayload).targetChain == "number" &&
		typeof (payload as SolDepositPayload).sender == "string"
	);
}

export type TokenDepositPayload = {
	id: ZebecPayloadId;
	amount: bigint;
	targetChain: ChainId;
	sender: string;
	tokenMint: Uint8Array;
};

export const parseTokenDepositPayload = (arr: Buffer): TokenDepositPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		amount: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		sender: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		tokenMint: Uint8Array.from(arr.subarray(i, (i += sizeof("u8[32]")))),
	};
	return payload;
};

export function IsTokenDepositPayload(payload: any): payload is TokenDepositPayload {
	return (
		typeof (payload as TokenDepositPayload).id == "number" &&
		payload.id === ZebecPayloadId.DepositToken &&
		typeof (payload as TokenDepositPayload).targetChain == "number" &&
		typeof (payload as TokenDepositPayload).amount == "bigint" &&
		typeof (payload as TokenDepositPayload).sender == "string" &&
		(payload as TokenDepositPayload).tokenMint instanceof Uint8Array
	);
}

export type PauseSolStreamPayload = {
	id: ZebecPayloadId;
	targetChain: ChainId;
	sender: string;
};

export const parsePauseSolStreamPayload = (arr: Buffer): PauseSolStreamPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		sender: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
	};
	return payload;
};

export function IsPauseSolStreamPayload(payload: any): payload is PauseSolStreamPayload {
	return (
		typeof (payload as PauseSolStreamPayload).id == "number" &&
		payload.id === ZebecPayloadId.PauseSolStream &&
		typeof (payload as PauseSolStreamPayload).sender == "string" &&
		typeof (payload as PauseSolStreamPayload).targetChain == "number"
	);
}

export type PauseTokenStreamPayload = {
	id: ZebecPayloadId;
	targetChain: ChainId;
	sender: string;
	tokenMint: Uint8Array;
	recipient: string;
	dataAccount: Uint8Array;
};

export const parsePauseTokenStreamPayload = (arr: Buffer): PauseTokenStreamPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		sender: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		tokenMint: Uint8Array.from(arr.subarray(i, (i += sizeof("u8[32]")))),
		recipient: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		dataAccount: Uint8Array.from(arr.subarray(i, (i += sizeof("u8[32]")))),
	};
	console.log("tokenMint:", new web3.PublicKey(payload.tokenMint).toString());
	return payload;
};

export function IsPauseTokenStreamPayload(payload: any): payload is PauseTokenStreamPayload {
	return (
		typeof (payload as PauseTokenStreamPayload).id == "number" &&
		payload.id === ZebecPayloadId.PauseTokenStream &&
		typeof (payload as PauseTokenStreamPayload).sender == "string" &&
		typeof (payload as PauseTokenStreamPayload).targetChain == "number" &&
		(payload as PauseTokenStreamPayload).tokenMint instanceof Uint8Array &&
		typeof (payload as PauseTokenStreamPayload).recipient == "string" &&
		(payload as PauseTokenStreamPayload).dataAccount instanceof Uint8Array
	);
}

export type SolWithdrawPayload = {
	id: ZebecPayloadId;
	amount: bigint;
	targetChain: ChainId;
	withdrawer: string;
};

export function IsSolWithdrawPayload(payload: any): payload is SolWithdrawPayload {
	return (
		typeof (payload as SolWithdrawPayload).id == "number" &&
		payload.id === ZebecPayloadId.WithdrawSol &&
		typeof (payload as SolWithdrawPayload).id == "bigint" &&
		typeof (payload as SolWithdrawPayload).withdrawer == "string" &&
		typeof (payload as SolWithdrawPayload).targetChain == "number"
	);
}

export const parseSolWithdrawPayload = (arr: Buffer): SolWithdrawPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		amount: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		withdrawer: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
	};
	return payload;
};

export type TokenWithdrawPayload = {
	id: ZebecPayloadId;
	amount: bigint;
	targetChain: ChainId;
	withdrawer: string;
	tokenMint: Uint8Array;
};

export const parseTokenWithdrawPayload = (arr: Buffer): TokenWithdrawPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		amount: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		withdrawer: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		tokenMint: Uint8Array.from(arr.subarray(i, (i += sizeof("u8[32]")))),
	};
	console.log("id:", payload.id);
	console.log("amount:", payload.amount);
	console.log("targetChain:", payload.targetChain);
	console.log("withdrawer:", payload.withdrawer);
	console.log("tokenMint:", new web3.PublicKey(payload.tokenMint).toString());
	return payload;
};

export function IsTokenWithdrawPayload(payload: any): payload is TokenWithdrawPayload {
	return (
		typeof (payload as TokenWithdrawPayload).id == "number" &&
		payload.id === ZebecPayloadId.WithdrawToken &&
		typeof (payload as TokenWithdrawPayload).amount == "bigint" &&
		typeof (payload as TokenWithdrawPayload).withdrawer == "string" &&
		typeof (payload as TokenWithdrawPayload).targetChain == "number" &&
		(payload as TokenWithdrawPayload).tokenMint instanceof Uint8Array
	);
}

export type InstantSolPayload = {
	id: ZebecPayloadId;
	amount: bigint;
	targetChain: ChainId;
	sender: string;
	recipient: string;
};

export const parseInstantSolPayload = (arr: Buffer): InstantSolPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		amount: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		sender: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		recipient: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
	};
	return payload;
};

export function IsInstantSolPayload(payload: any): payload is InstantSolPayload {
	return (
		typeof (payload as InstantSolPayload).id == "number" &&
		payload.id === ZebecPayloadId.InstantSol &&
		typeof (payload as InstantSolPayload).sender == "string" &&
		typeof (payload as InstantSolPayload).recipient == "string" &&
		typeof (payload as InstantSolPayload).targetChain == "number" &&
		typeof (payload as InstantSolPayload).amount == "bigint"
	);
}

export type InstantTokenPayload = {
	id: ZebecPayloadId;
	amount: bigint;
	targetChain: ChainId;
	sender: string;
	recipient: string;
	tokenMint: Uint8Array;
};

export const parseInstantTokenPayload = (arr: Buffer): InstantTokenPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		amount: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		sender: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		recipient: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		tokenMint: Uint8Array.from(arr.subarray(i, (i += sizeof("u8[32]")))),
	};
	return payload;
};

export function IsInstantTokenPayload(payload: any): payload is InstantTokenPayload {
	return (
		typeof (payload as InstantTokenPayload).id == "number" &&
		payload.id === ZebecPayloadId.InstantToken &&
		typeof (payload as InstantTokenPayload).sender == "string" &&
		typeof (payload as InstantTokenPayload).recipient == "string" &&
		typeof (payload as InstantTokenPayload).targetChain == "number" &&
		typeof (payload as InstantTokenPayload).amount == "bigint" &&
		(payload as InstantTokenPayload).tokenMint instanceof Uint8Array
	);
}

export type SolStreamUpdatePayload = {
	id: ZebecPayloadId;
	startTime: bigint;
	endTime: bigint;
	amount: bigint;
	targetChain: ChainId;
	sender: string;
	recipient: string;
};

export const parseSolStreamUpdatePayload = (arr: Buffer): SolStreamUpdatePayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		startTime: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		endTime: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		amount: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		sender: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		recipient: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
	};
	return payload;
};

export function IsSolStreamUpdatePayload(payload: any): payload is SolStreamUpdatePayload {
	return (
		typeof (payload as SolStreamUpdatePayload).id == "number" &&
		payload.id === ZebecPayloadId.SolStreamUpdate &&
		typeof (payload as SolStreamUpdatePayload).targetChain == "number" &&
		typeof (payload as SolStreamUpdatePayload).amount == "bigint" &&
		typeof (payload as SolStreamUpdatePayload).startTime == "bigint" &&
		typeof (payload as SolStreamUpdatePayload).endTime == "bigint" &&
		typeof (payload as SolStreamUpdatePayload).sender == "string" &&
		typeof (payload as SolStreamUpdatePayload).recipient == "string"
	);
}

export type TokenStreamUpdatePayload = {
	id: ZebecPayloadId;
	startTime: bigint;
	endTime: bigint;
	amount: bigint;
	targetChain: ChainId;
	sender: string;
	recipient: string;
	tokenMint: Uint8Array;
	dataAccount: Uint8Array;
};

export const parseTokenStreamUpdatePayload = (arr: Buffer): TokenStreamUpdatePayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		startTime: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		endTime: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		amount: BigNumber.from(arr.subarray(i, (i += sizeof("u64")))).toBigInt(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		sender: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		recipient: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		tokenMint: Uint8Array.from(arr.subarray(i, (i += sizeof("u8[32]")))),
		dataAccount: Uint8Array.from(arr.subarray(i, (i += sizeof("u8[32]")))),
	};
	console.log("tokenMint:", new web3.PublicKey(payload.tokenMint).toString());
	return payload;
};

export function IsTokenStreamUpdatePayload(payload: any): payload is TokenStreamUpdatePayload {
	return (
		typeof (payload as TokenStreamUpdatePayload).id == "number" &&
		payload.id === ZebecPayloadId.TokenStreamUpdate &&
		typeof (payload as TokenStreamUpdatePayload).targetChain == "number" &&
		typeof (payload as TokenStreamUpdatePayload).amount == "bigint" &&
		typeof (payload as TokenStreamUpdatePayload).startTime == "bigint" &&
		typeof (payload as TokenStreamUpdatePayload).endTime == "bigint" &&
		typeof (payload as TokenStreamUpdatePayload).sender == "string" &&
		typeof (payload as TokenStreamUpdatePayload).recipient == "string" &&
		(payload as TokenStreamUpdatePayload).tokenMint instanceof Uint8Array &&
		(payload as TokenStreamUpdatePayload).dataAccount instanceof Uint8Array
	);
}

export type CancelSolStreamPayload = {
	id: ZebecPayloadId;
	targetChain: ChainId;
	sender: string;
};

export function IsCancelSolStreamPayload(payload: any): payload is CancelSolStreamPayload {
	return (
		typeof (payload as CancelSolStreamPayload).id == "number" &&
		payload.id === ZebecPayloadId.CancelSolStream &&
		typeof (payload as CancelSolStreamPayload).targetChain == "number" &&
		typeof (payload as CancelSolStreamPayload).sender == "string"
	);
}

export const parseCancelSolStreamPayload = (arr: Buffer): CancelSolStreamPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		sender: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
	};
	return payload;
};

export type CancelTokenStreamPayload = {
	id: ZebecPayloadId;
	targetChain: ChainId;
	sender: string;
	tokenMint: Uint8Array;
	recipient: string;
	dataAccount: Uint8Array;
};

export const parseCancelTokenStreamPayload = (arr: Buffer): CancelTokenStreamPayload => {
	console.log("payload buffer length:", arr.length);
	let i = 0;
	const payload = {
		id: BigNumber.from(arr.subarray(i, (i += sizeof("u8")))).toNumber(),
		targetChain: BigNumber.from(arr.subarray(i, (i += sizeof("u16")))).toNumber() as ChainId,
		sender: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		tokenMint: Uint8Array.from(arr.subarray(i, (i += sizeof("u8[32]")))),
		recipient: Buffer.from(arr.subarray(i, (i += sizeof("evmAdr")))).toString(),
		dataAccount: Uint8Array.from(arr.subarray(i, (i += sizeof("u8[32]")))),
	};
	return payload;
};

export function IsCancelTokenStreamPayload(payload: any): payload is CancelTokenStreamPayload {
	return (
		typeof (payload as CancelTokenStreamPayload).id == "number" &&
		payload.id === ZebecPayloadId.CancelTokenStream &&
		typeof (payload as CancelTokenStreamPayload).targetChain == "number" &&
		typeof (payload as CancelTokenStreamPayload).sender == "string" &&
		(payload as CancelTokenStreamPayload).tokenMint instanceof Uint8Array &&
		typeof (payload as CancelTokenStreamPayload).recipient == "string" &&
		(payload as CancelTokenStreamPayload).dataAccount instanceof Uint8Array
	);
}

export type ParsedZebecPayload =
	| SolStreamPayload
	| TokenStreamPayload
	| SolWithdrawStreamPayload
	| TokenWithdrawStreamPayload
	| SolDepositPayload
	| TokenDepositPayload
	| PauseSolStreamPayload
	| PauseTokenStreamPayload
	| SolWithdrawPayload
	| TokenWithdrawPayload
	| InstantSolPayload
	| InstantTokenPayload
	| SolStreamUpdatePayload
	| TokenStreamUpdatePayload
	| CancelSolStreamPayload
	| CancelTokenStreamPayload;

/** Parse the VAA and return the typed payload */
export function parseZebecPayload(payloadBuf: Buffer): ParsedZebecPayload {
	try {
		let parsedPayload: ParsedZebecPayload | undefined;
		const payloadId = payloadBuf[0] as ZebecPayloadId;
		console.log("payloadId:", payloadId);
		switch (payloadId) {
			case ZebecPayloadId.SolStream:
				parsedPayload = parseSolStreamPayload(payloadBuf);
				break;

			case ZebecPayloadId.TokenStream:
				parsedPayload = parseTokenStreamPayload(payloadBuf);
				break;

			case ZebecPayloadId.SolWithdrawStream:
				parsedPayload = parseSolWithdrawStreamPayload(payloadBuf);
				break;

			case ZebecPayloadId.TokenWithdrawStream:
				parsedPayload = parseTokenWithdrawStreamPayload(payloadBuf);
				break;

			case ZebecPayloadId.DepositSol:
				parsedPayload = parseSolDepositPayload(payloadBuf);
				break;

			case ZebecPayloadId.DepositToken:
				parsedPayload = parseTokenDepositPayload(payloadBuf);
				break;

			case ZebecPayloadId.PauseSolStream:
				parsedPayload = parsePauseSolStreamPayload(payloadBuf);
				break;

			case ZebecPayloadId.PauseTokenStream:
				parsedPayload = parsePauseTokenStreamPayload(payloadBuf);
				break;

			case ZebecPayloadId.WithdrawSol:
				parsedPayload = parseSolWithdrawPayload(payloadBuf);
				break;
			case ZebecPayloadId.WithdrawToken:
				parsedPayload = parseTokenWithdrawPayload(payloadBuf);
				break;
			case ZebecPayloadId.InstantSol:
				parsedPayload = parseInstantSolPayload(payloadBuf);
				break;
			case ZebecPayloadId.InstantToken:
				parsedPayload = parseInstantTokenPayload(payloadBuf);
				break;
			case ZebecPayloadId.InstantToken:
				parsedPayload = parseInstantTokenPayload(payloadBuf);
				break;
			case ZebecPayloadId.SolStreamUpdate:
				parsedPayload = parseSolStreamUpdatePayload(payloadBuf);
				break;
			case ZebecPayloadId.TokenStreamUpdate:
				parsedPayload = parseTokenStreamUpdatePayload(payloadBuf);
				break;
			case ZebecPayloadId.CancelSolStream:
				parsedPayload = parseCancelSolStreamPayload(payloadBuf);
				break;
			case ZebecPayloadId.CancelTokenStream:
				parsedPayload = parseCancelTokenStreamPayload(payloadBuf);
				break;
		}
		return parsedPayload;
	} catch (e) {
		throw new PayloadParseError(e instanceof Error ? e.message : "Unknown payload parse error");
	}
}
