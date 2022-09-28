import { setDefaultWasm } from "@certusone/wormhole-sdk";
import { assert } from "chai";
import { ContractReceipt } from "ethers";
import { describe, it } from "mocha";

import { transferEvm } from "../../src/portalTransfer";
import { CONFIG as config, getSigner } from "../shared";

setDefaultWasm("node");

describe("evm token token transfer", () => {
	it("should return vaa bytes", async () => {
		const signer = getSigner(config.bsc);
		const RELAYER_FEE = "1.5";
		const sourceChain = 4; // bsc
		const targetChain = 1; // solana
		const tokenAddress = "0x14a8F6b7Df911c0067D973a16947df2d884f05db"; // Wormhole Wrapped WSOL in bsc
		const amount = "10";
		const recipient = "7hDhgJ57PnKKopWuDZPF6jK482vkjRNLo4uNDNZUCoyw"; // address in solana for 0x517B2eFE5504BcF4D01599B175daa8631EBb1D6C
		let transferReceipt: ContractReceipt | undefined;
		try {
			transferReceipt = await transferEvm(
				signer,
				tokenAddress,
				sourceChain,
				amount,
				targetChain,
				recipient,
				RELAYER_FEE,
			);
		} catch (e) {
			console.log(e);
		}
		assert(!!transferReceipt);
	});
});
