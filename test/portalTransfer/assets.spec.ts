import {
	CHAIN_ID_BSC,
	CHAIN_ID_ETH,
	CHAIN_ID_SOLANA,
	tryNativeToUint8Array,
	tryUint8ArrayToNative,
	WormholeWrappedInfo,
} from "@certusone/wormhole-sdk";
import { assert } from "chai";
import { ethers } from "ethers";
import { describe, it } from "mocha";

import { getForeignAsset, getOriginalAsset, getTargetAsset } from "../../src/portalTransfer";
import { CONFIG as config, getProvider } from "../shared";

describe("assets module test", () => {
	describe("test getOriginalAsset() for bsc token", () => {
		it("should return asset info", async () => {
			const provider = getProvider(config.bsc);
			const BSC_TOKEN = "0x14a8F6b7Df911c0067D973a16947df2d884f05db";
			const sourceChain = CHAIN_ID_BSC;
			let result: WormholeWrappedInfo | undefined;
			try {
				result = await getOriginalAsset(provider, BSC_TOKEN, sourceChain);
			} catch (e) {
				console.log(e);
			}
			assert(!!result);
			assert(result.chainId === CHAIN_ID_SOLANA);
			assert(result.isWrapped);
			assert(result.assetAddress instanceof Uint8Array);
			assert(
				tryUint8ArrayToNative(result.assetAddress, result.chainId) === "6XSp58Mz6LAi91XKenjQfj9D1MxPEGYtgBkggzYvE8jY",
			);
		});
	});

	describe("test getOriginalAsset() for eth token", () => {
		it("should return asset info", async () => {
			const provider = getProvider(config.ethereum);
			const sourceChain = CHAIN_ID_ETH;
			const ETH_TOKEN = "0xea0Fbe70025ac7Cab1F5f06976dA76Ac85C045d9";
			let result: WormholeWrappedInfo | undefined;

			try {
				result = await getOriginalAsset(provider, ETH_TOKEN, sourceChain);
			} catch (e) {
				console.log(e);
			}

			assert(!!result);
			assert(result.chainId === CHAIN_ID_SOLANA);
			assert(result.isWrapped);
			assert(result.assetAddress instanceof Uint8Array);
			assert(
				tryUint8ArrayToNative(result.assetAddress, result.chainId) === "6XSp58Mz6LAi91XKenjQfj9D1MxPEGYtgBkggzYvE8jY",
			);
		});
	});

	describe("test getForeignAsset() for solana token in eth chain", () => {
		it("should return foreign asset", async () => {
			const provider = getProvider(config.ethereum);
			const originChain = CHAIN_ID_SOLANA;
			const recipientChain = CHAIN_ID_ETH;
			const originAddress = tryNativeToUint8Array("6XSp58Mz6LAi91XKenjQfj9D1MxPEGYtgBkggzYvE8jY", originChain);
			const expected = "0xea0Fbe70025ac7Cab1F5f06976dA76Ac85C045d9";

			let result: string | undefined;
			try {
				result = await getForeignAsset(originAddress, originChain, recipientChain, provider);
			} catch (e) {
				console.log(e);
			}
			assert(!!result);
			assert(result === expected);
		});
	});

	describe("test getForeignAsset() for solana token in bsc chain", () => {
		it("should return foreign asset", async () => {
			const provider = getProvider(config.bsc);
			const originChain = CHAIN_ID_SOLANA;
			const recipientChain = CHAIN_ID_BSC;
			const originAddress = tryNativeToUint8Array("6XSp58Mz6LAi91XKenjQfj9D1MxPEGYtgBkggzYvE8jY", originChain);

			const expectedToken = "0x14a8F6b7Df911c0067D973a16947df2d884f05db";
			let result: string | undefined;
			try {
				result = await getForeignAsset(originAddress, originChain, recipientChain, provider);
			} catch (e) {
				console.log(e);
			}

			assert(!!result);
			assert(result === expectedToken);
		});
	});

	describe("test getTargetAsset() for eth token", () => {
		it("should return asset for given target chain", async () => {
			const provider = getProvider(config.ethereum);
			const ETH_TOKEN = "0xea0Fbe70025ac7Cab1F5f06976dA76Ac85C045d9";
			const sourceChain = CHAIN_ID_ETH;
			const recipientChain = CHAIN_ID_SOLANA;

			const expectedToken = "6XSp58Mz6LAi91XKenjQfj9D1MxPEGYtgBkggzYvE8jY";

			let result: string | undefined;
			try {
				result = await getTargetAsset(provider, ETH_TOKEN, sourceChain, recipientChain);
			} catch (e) {
				console.log(e);
			}
			assert(!!result);
			assert(result === expectedToken);
		});
	});

	describe("test getTargetAsset() for bsc token", () => {
		it("should return asset for given target chain", async () => {
			const provider = getProvider(config.bsc);
			const BSC_TOKEN = "0x14a8F6b7Df911c0067D973a16947df2d884f05db";
			const sourceChain = CHAIN_ID_BSC;
			const recipientChain = CHAIN_ID_SOLANA;

			const expected = "6XSp58Mz6LAi91XKenjQfj9D1MxPEGYtgBkggzYvE8jY";

			let result: string | undefined;
			try {
				result = await getTargetAsset(provider, BSC_TOKEN, sourceChain, recipientChain);
			} catch (e) {
				console.log(e);
			}
			assert(!!result);
			assert(result === expected);
		});
	});
});
