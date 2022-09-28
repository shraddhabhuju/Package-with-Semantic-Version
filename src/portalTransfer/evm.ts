import {
	approveEth,
	CHAIN_ID_SOLANA,
	ChainId,
	TokenImplementation__factory,
	transferFromEth,
	transferFromEthNative,
	tryNativeToUint8Array,
} from "@certusone/wormhole-sdk";
import { web3 } from "@project-serum/anchor";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { ContractReceipt, ethers } from "ethers";

import {
	fee_keypair,
	getDefaultNativeCurrencyAddressEvm,
	getTokenBridgeAddressForChain,
	SOLANA_HOST,
} from "../utils/constants";

import { getTargetAsset } from "./assets";

/**
 * Transfer token across from evm chain
 * @param signer evm signer that extends ethers.Signer
 * @param sourceTokenAddress token address string of source chain
 * @param sourceChainId source chain id
 * @param amount amount to transfer
 * @param recipientChain recipient chain id
 * @param recipientAddress destination address in recipient chain
 * @param relayerFee relayer fee
 * @returns transaction reciept of transfer
 */
export async function transferEvm(
	signer: ethers.Signer,
	sourceTokenAddress: string,
	sourceChainId: ChainId,
	amount: string,
	recipientChain: ChainId,
	recipientAddress: string,
	relayerFee?: string,
	onApproved?: (reciept: ContractReceipt) => void,
): Promise<ContractReceipt> {
	if (!ethers.utils.isAddress(sourceTokenAddress)) {
		throw new Error("Invalid source token address");
	}

	let decimals: number;
	try {
		const token = TokenImplementation__factory.connect(sourceTokenAddress, signer);
		console.log("TokenImplementation:", token);

		decimals = await token.decimals();
	} catch (e) {
		console.error(e);
		throw e;
	}

	if (!decimals || decimals === 0) {
		throw new Error("Could not retrieve decimal value");
	}

	console.log("decimals:", decimals);

	const tokenBridgeAddress = getTokenBridgeAddressForChain(sourceChainId);
	console.log("transferEvm():tokenBridgeAddress", tokenBridgeAddress);

	const connection = new web3.Connection(SOLANA_HOST, "confirmed");

	let recipientAddr: Uint8Array;
	try {
		const targetTokenAddress = await getTargetAsset(signer, sourceTokenAddress, sourceChainId, recipientChain);
		console.log("targetTokenAddress:", targetTokenAddress);

		if (recipientChain === CHAIN_ID_SOLANA) {
			const recipientTokenAddress = await getAssociatedTokenAddress(
				new PublicKey(targetTokenAddress),
				new PublicKey(recipientAddress),
				true,
			);

			recipientAddr = tryNativeToUint8Array(recipientTokenAddress.toString(), "solana");
			//console.log("Recever Address ATA: ", recipientAddr);
			// todo: check if account exists or not and figure out if extra fee should be added in relayer fee or not
			const receipientTokenAccountInfo = await connection.getAccountInfo(recipientTokenAddress, "confirmed");
			if (!receipientTokenAccountInfo) {
				throw new Error("Recipient doesn't have associated token account for given token address in solana");
				// const txn = new Transaction();
				// txn.add(
				// 	createAssociatedTokenAccountInstruction(
				// 		fee_keypair.publicKey,
				// 		recipientTokenAddress,
				// 		new PublicKey(recipientAddress),
				// 		new PublicKey(targetTokenAddress),
				// 	),
				// );
				// const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
				// txn.recentBlockhash = blockhash;
				// txn.lastValidBlockHeight = lastValidBlockHeight;
				// txn.feePayer = fee_keypair.publicKey;
				// txn.partialSign(fee_keypair);
				// const signature = await connection.sendRawTransaction(txn.serialize());
				// await connection.confirmTransaction({
				// 	signature,
				// 	blockhash,
				// 	lastValidBlockHeight,
				// });
			}
		} else {
			// todo: for terra and algorand
			recipientAddr = tryNativeToUint8Array(recipientAddress, recipientChain);
		}
	} catch (e) {
		console.error(e);
		throw e;
	}

	const baseAmountParsed = ethers.utils.parseUnits(amount, decimals);

	const feeParsed = ethers.utils.parseUnits(relayerFee || "0", decimals);
	const transferAmountParsed = baseAmountParsed.add(feeParsed);

	const approveReceipt = await approveEth(tokenBridgeAddress, sourceTokenAddress, signer, transferAmountParsed);

	// for ux purpose
	if (onApproved) {
		onApproved(approveReceipt);
	}

	console.log("approve eth:", approveReceipt.transactionHash);

	const isNative = getDefaultNativeCurrencyAddressEvm(sourceChainId) === sourceTokenAddress;

	const overrides = {
		gasLimit: "1000000",
	};

	try {
		const result = isNative
			? transferFromEthNative(
					tokenBridgeAddress,
					signer,
					transferAmountParsed,
					recipientChain,
					recipientAddr,
					feeParsed,
					overrides,
			  )
			: transferFromEth(
					tokenBridgeAddress,
					signer,
					sourceTokenAddress,
					transferAmountParsed,
					recipientChain,
					recipientAddr,
					feeParsed,
					overrides,
			  );
		const transferReceipt = await result;

		return transferReceipt;
	} catch (e) {
		console.error(e);
		throw e;
	}
}
