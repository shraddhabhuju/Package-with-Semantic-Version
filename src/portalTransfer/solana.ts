import {
	CHAIN_ID_SOLANA,
	ChainId,
	getEmitterAddressSolana,
	getForeignAssetEth,
	getOriginalAssetSol,
	getSignedVAAWithRetry,
	isEVMChain,
	parseSequenceFromLogSolana,
	toChainName,
	transferFromSolana,
	transferNativeSol,
	tryNativeToUint8Array,
	tryUint8ArrayToNative,
	WSOL_ADDRESS,
} from "@certusone/wormhole-sdk";
import { web3 } from "@project-serum/anchor";
import { getMint } from "@solana/spl-token";
import { ethers } from "ethers";

import {
	getTokenBridgeAddressForChain,
	SOL_BRIDGE_ADDRESS,
	SOL_TOKEN_BRIDGE_ADDRESS,
	SOLANA_HOST,
	WORMHOLE_RPC_HOSTS,
} from "../utils/constants";
import { NotImplementedError } from "../utils/errors";
import { sendAndConfirmTransaction } from "../utils/solana";

export async function transferSolana(
	payer: string,
	fromAddress: string,
	mintAddress: string,
	fromOwnerAddress: string,
	amount: string,
	targetChain: ChainId,
	signTransaction: (transaction: web3.Transaction) => Promise<web3.Transaction>,
	signer: ethers.Signer | ethers.providers.Provider,
	targetAddress: string,
	relayerFee?: string,
): Promise<Uint8Array | undefined> {
	try {
		if (targetChain === CHAIN_ID_SOLANA) {
			throw new Error("Cannot transfer to same chain using portal bridge!");
		}

		const connection = new web3.Connection(SOLANA_HOST, "confirmed");
		const originAssetInfo = await getOriginalAssetSol(connection, SOL_TOKEN_BRIDGE_ADDRESS, mintAddress);

		let targetTokenAddress: string;
		if (originAssetInfo.chainId === targetChain) {
			targetTokenAddress = tryUint8ArrayToNative(originAssetInfo.assetAddress, originAssetInfo.chainId);
		} else {
			let foreignAsset: string | null;
			if (isEVMChain(targetChain)) {
				foreignAsset = await getForeignAssetEth(
					getTokenBridgeAddressForChain(targetChain),
					signer,
					originAssetInfo.chainId,
					originAssetInfo.assetAddress,
				);
			} else {
				// todo: terra and algorand
				throw new NotImplementedError();
			}
			if (foreignAsset) {
				targetTokenAddress = foreignAsset;
			} else {
				throw new Error(`Token not attested for ${toChainName(targetChain)} chain`);
			}
		}

		let targetAddr: Uint8Array;
		try {
			// todo: for terra and algorand
			targetAddr = tryNativeToUint8Array(targetAddress, targetChain);
		} catch (e) {
			throw e;
		}

		const mint = await getMint(connection, new web3.PublicKey(mintAddress), "confirmed");

		const baseAmountParsed = ethers.utils.parseUnits(amount, mint.decimals);
		const feeParsed = ethers.utils.parseUnits(relayerFee || "0", mint.decimals);
		const transferAmountParsed = baseAmountParsed.add(feeParsed);

		const isNative = mintAddress === WSOL_ADDRESS;

		const transaction = isNative
			? await transferNativeSol(
					connection,
					SOL_BRIDGE_ADDRESS,
					SOL_TOKEN_BRIDGE_ADDRESS,
					payer,
					transferAmountParsed.toBigInt(),
					targetAddr,
					targetChain,
					feeParsed.toBigInt(),
			  )
			: await transferFromSolana(
					connection,
					SOL_BRIDGE_ADDRESS,
					SOL_TOKEN_BRIDGE_ADDRESS,
					payer,
					fromAddress,
					mintAddress,
					transferAmountParsed.toBigInt(),
					targetAddr,
					targetChain,
					originAssetInfo.assetAddress,
					originAssetInfo.chainId,
					fromOwnerAddress,
					feeParsed.toBigInt(),
			  );

		const txid = await sendAndConfirmTransaction(connection, signTransaction, transaction, 10);
		console.log("transfer txn confirmed");
		console.log("txnid:", txid);

		const info = await connection.getTransaction(txid);
		if (!info) {
			throw new Error("An error occurred while fetching the transaction info");
		}

		const sequence = parseSequenceFromLogSolana(info);
		const emitterAddress = await getEmitterAddressSolana(SOL_TOKEN_BRIDGE_ADDRESS);
		const { vaaBytes } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, CHAIN_ID_SOLANA, emitterAddress, sequence);
		console.log("vaaBytes", vaaBytes);

		return vaaBytes;
	} catch (e) {
		console.error(e);
	}
	return undefined;
}
