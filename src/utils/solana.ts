import nacl from "tweetnacl";

import { getMint } from "@solana/spl-token";
import { Connection, PublicKey, SendTransactionError, Transaction } from "@solana/web3.js";

import { SOLANA_HOST } from "./constants";

export function parseSolPubKey(address: string) {
	return new PublicKey(address);
}

export function logTransaction(transaction: Transaction) {
	console.log("blockHash", transaction.recentBlockhash);
	console.log("feePayer", transaction.feePayer?.toString());
	console.log(
		"instructions",
		transaction.instructions
			.map((ixn) => {
				return {
					// data: ixn.data.toJSON(),
					// programId: ixn.programId.toString(),
					keys: ixn.keys
						// .filter((key) => key.isSigner)
						.map((key) => {
							return {
								pubkey: key.pubkey.toString(),
								isSigner: key.isSigner,
								isWritable: key.isWritable,
							};
						}),
				};
			})
			.toString(),
	);
	console.log(
		"signatures",
		transaction.signatures.map((pair) => {
			return {
				publicKey: pair.publicKey.toString(),
				signature: pair.signature?.toString(),
				verified: pair.signature
					? nacl.sign.detached.verify(transaction.serializeMessage(), pair.signature, pair.publicKey.toBytes())
					: null,
			};
		}),
	);
}

/**
 * Gets decimal value of given mint
 * @param mintAddress mint address of solana token
 * @returns
 */
export async function getDecimals(mintAddress: string): Promise<number> {
	const connection = new Connection(SOLANA_HOST, "confirmed");
	const mint = await getMint(connection, new PublicKey(mintAddress), "confirmed");
	return mint.decimals;
}

export async function sendAndConfirmTransaction(
	connection: Connection,
	signTransaction: (transaction: Transaction) => Promise<Transaction>,
	transaction: Transaction,
	maxRetries = 0,
): Promise<string> {
	let currentRetries = 0;
	let success = false;
	let transactionReceipt = "";
	while (!success && !(currentRetries > maxRetries)) {
		let signed: Transaction;
		try {
			signed = await signTransaction(transaction);
			console.log("signed", signed);
		} catch (e) {
			//Eject here because this is most likely an intentional rejection from the user, or a genuine unrecoverable failure.
			return Promise.reject("Failed to sign transaction.");
		}
		try {
			logTransaction(signed);
			const txid = await connection.sendRawTransaction(signed.serialize());
			await connection.confirmTransaction(txid);
			transactionReceipt = txid;
			success = true;
		} catch (e) {
			console.log("error occured");
			console.log(e instanceof SendTransactionError ? e.logs : e);
			currentRetries++;
		}
	}

	if (currentRetries > maxRetries) {
		return Promise.reject("Reached the maximum number of retries.");
	} else {
		return Promise.resolve(transactionReceipt);
	}
}
