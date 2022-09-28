import { AnchorProvider, web3 } from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import base58 from "bs58";

import { SOLANA_HOST } from "../../utils";

/**
 * Note: Use only for development environment
 * @returns An instance of Anchor provider
 */
export function getDefaultProvider(connection: web3.Connection = new web3.Connection(SOLANA_HOST)) {
	const secret = process.env.SECRET_KEY;
	if (!secret || secret === "") {
		throw new Error("Secret key is missing");
	}
	const keypair = web3.Keypair.fromSecretKey(base58.decode(secret));

	return new AnchorProvider(connection, new NodeWallet(keypair), AnchorProvider.defaultOptions());
}
