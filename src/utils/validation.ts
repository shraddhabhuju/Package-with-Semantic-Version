import { ChainName, isEVMChain, toChainId } from "@certusone/wormhole-sdk";
import { PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";
import { isSolanaChain } from "./constants";

import { NotImplementedError } from "./errors";

export function isValidAddress(tokenAddress: string, sourceChain: ChainName) {
	if (isEVMChain(sourceChain)) {
		return ethers.utils.isAddress(tokenAddress);
	} else if (isSolanaChain(toChainId(sourceChain))) {
		try {
			const _ = new PublicKey(tokenAddress);
			return true;
		} catch (e) {
			return false;
		}
	} else {
		throw new NotImplementedError();
	}
}
