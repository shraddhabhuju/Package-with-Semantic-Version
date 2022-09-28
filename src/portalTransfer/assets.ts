import {
	ChainId,
	getForeignAssetEth,
	getForeignAssetSolana,
	getOriginalAssetEth,
	getOriginalAssetSol,
	isEVMChain,
	toChainName,
	tryUint8ArrayToNative,
	WormholeWrappedInfo,
} from "@certusone/wormhole-sdk";
import { Connection } from "@solana/web3.js";
import { ethers } from "ethers";

import { getTokenBridgeAddressForChain, isSolanaChain, NotSupportedError, SOLANA_HOST } from "../utils";

/**
 * Get address of asset for given token address in specified chain
 * @param signer evm signer
 * @param sourceTokenAddress token address of source chain
 * @param sourceChainId source chain id
 * @param targetChainId target chain id
 * @returns
 */
export async function getTargetAsset(
	signer: ethers.Signer | ethers.providers.Provider,
	sourceTokenAddress: string,
	sourceChainId: ChainId,
	targetChainId: ChainId,
): Promise<string> {
	const originalAsset = await getOriginalAsset(signer, sourceTokenAddress, sourceChainId);
	if (originalAsset.chainId === targetChainId) {
		return tryUint8ArrayToNative(originalAsset.assetAddress, originalAsset.chainId);
	}
	const foreignAsset = await getForeignAsset(originalAsset.assetAddress, originalAsset.chainId, targetChainId, signer);
	return foreignAsset;
}

/**
 * Get original asset info for given token address
 * @param signer evm signer
 * @param wrappedAddress token address
 * @param lookupChain chain id of given token address
 * @returns
 */
export async function getOriginalAsset(
	signer: ethers.Signer | ethers.providers.Provider,
	wrappedAddress: string,
	lookupChain: ChainId,
): Promise<WormholeWrappedInfo> {
	let originalAsset: WormholeWrappedInfo;
	const tokenBridgeAddress = getTokenBridgeAddressForChain(lookupChain);
	console.log("getOriginalAsset:tokenBridgeAddress:", tokenBridgeAddress);
	if (isEVMChain(lookupChain)) {
		originalAsset = await getOriginalAssetEth(tokenBridgeAddress, signer, wrappedAddress, lookupChain);
	} else if (isSolanaChain(lookupChain)) {
		originalAsset = await getOriginalAssetSol(
			new Connection(SOLANA_HOST, "confirmed"),
			tokenBridgeAddress,
			wrappedAddress,
		);
	} else {
		throw new NotSupportedError("This method currently doesn't support " + toChainName(lookupChain));
	}
	return originalAsset;
}

/**
 * Get foreign asset for given origin asset in specified target chain
 * @param originAsset wormhole's 32 byte array of original asset
 * @param originChain chain id of original asset
 * @param targetChain foreign chain id to find the asset
 * @param signer evm signer
 * @returns asset address
 */
export async function getForeignAsset(
	originAsset: Uint8Array,
	originChain: ChainId,
	targetChain: ChainId,
	signer: ethers.Signer | ethers.providers.Provider,
): Promise<string> {
	const tokenBridgeAddress = getTokenBridgeAddressForChain(targetChain);
	console.log("getForeignAsset:tokenBridgeAddress:", tokenBridgeAddress);

	let asset: string | null;

	if (isEVMChain(targetChain)) {
		asset = await getForeignAssetEth(tokenBridgeAddress, signer, originChain, originAsset);
	} else if (isSolanaChain(targetChain)) {
		asset = await getForeignAssetSolana(
			new Connection(SOLANA_HOST, "confirmed"),
			tokenBridgeAddress,
			originChain,
			originAsset,
		);
	} else {
		throw new NotSupportedError(`This method currently doesn't support ${toChainName(targetChain)} chain`);
	}

	if (asset === ethers.constants.AddressZero || !asset) {
		throw new Error("Given asset is not attested in " + toChainName(targetChain));
	}

	return asset;
}
