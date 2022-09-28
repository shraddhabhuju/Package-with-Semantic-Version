import { web3 } from "@project-serum/anchor";
import { expect } from "chai";
import { describe, it } from "mocha";

import {
	BSC_BRIDGE_ADDRESS,
	BSC_NETWORK_CHAIN_ID,
	BSC_TOKEN_BRIDGE_ADDRESS,
	ETH_BRIDGE_ADDRESS,
	ETH_NETWORK_CHAIN_ID,
	ETH_TOKEN_BRIDGE_ADDRESS,
	getBridgeAddressForChain,
	getDefaultNativeCurrencyAddressEvm,
	getTokenBridgeAddressForChain,
	isSolanaChain,
	SOL_BRIDGE_ADDRESS,
	SOL_TOKEN_BRIDGE_ADDRESS,
	SOLANA_HOST,
	WBNB_ADDRESS,
	WETH_ADDRESS,
	WORMHOLE_RPC_HOSTS,
} from "../../src/utils/constants";

describe("Constants", () => {
	describe("WORMHOLE_RPC_HOSTS", () => {
		it("should give value for test env", () => {
			const expected = "https://wormhole-v2-testnet-api.certus.one";
			expect(WORMHOLE_RPC_HOSTS).to.be.an("array").that.includes(expected);
		});
	});

	describe("ETH_NETWORK_CHAIN_ID", () => {
		it("should give value for test env", () => {
			const expected = 5;
			expect(ETH_NETWORK_CHAIN_ID).to.equal(expected);
		});
	});

	describe("BSC_NETWORK_CHAIN_ID", () => {
		it("should give value for test env", () => {
			const expected = 97;
			expect(BSC_NETWORK_CHAIN_ID).to.equal(expected);
		});
	});

	describe("isSolanaChain()", () => {
		it("should give value for test env", () => {
			expect(isSolanaChain(1)).to.be.true;
			expect(isSolanaChain(2)).to.be.false;
			expect(isSolanaChain(4)).to.be.false;
		});
	});

	describe("SOLANA_HOST", () => {
		it("should give value for test env", () => {
			const expected = web3.clusterApiUrl("devnet");
			expect(SOLANA_HOST).to.equal(expected);
		});
	});

	describe("ETH_BRIDGE_ADDRESS", () => {
		it("should give value for test env", () => {
			const expected = "0x706abc4E45D419950511e474C7B9Ed348A4a716c";
			expect(ETH_BRIDGE_ADDRESS).to.equal(expected);
		});
	});

	describe("ETH_TOKEN_BRIDGE_ADDRESS", () => {
		it("should give value for test env", () => {
			const expected = "0xF890982f9310df57d00f659cf4fd87e65adEd8d7";
			expect(ETH_TOKEN_BRIDGE_ADDRESS).to.equal(expected);
		});
	});

	describe("BSC_BRIDGE_ADDRESS", () => {
		it("should give value for test env", () => {
			const expected = "0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D";
			expect(BSC_BRIDGE_ADDRESS).to.equal(expected);
		});
	});

	describe("BSC_TOKEN_BRIDGE_ADDRESS", () => {
		it("should give value for test env", () => {
			const expected = "0x9dcF9D205C9De35334D646BeE44b2D2859712A09";
			expect(BSC_TOKEN_BRIDGE_ADDRESS).to.equal(expected);
		});
	});

	describe("SOL_BRIDGE_ADDRESS", () => {
		it("should give value for test env", () => {
			const expected = "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5";
			expect(SOL_BRIDGE_ADDRESS).to.equal(expected);
		});
	});

	describe("SOL_TOKEN_BRIDGE_ADDRESS", () => {
		it("should give value for test env", () => {
			const expected = "DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe";
			expect(SOL_TOKEN_BRIDGE_ADDRESS).to.equal(expected);
		});
	});

	describe("getBridgeAddressForChain()", () => {
		it("should give value for given chain", () => {
			expect(getBridgeAddressForChain(1)).to.equal("3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5");
			expect(getBridgeAddressForChain(2)).to.equal("0x706abc4E45D419950511e474C7B9Ed348A4a716c");
			expect(getBridgeAddressForChain(4)).to.equal("0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D");
		});
	});

	describe("getTokenBridgeAddressForChain()", () => {
		it("should give value for given chain", () => {
			expect(getTokenBridgeAddressForChain(1)).to.equal("DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe");
			expect(getTokenBridgeAddressForChain(2)).to.equal("0xF890982f9310df57d00f659cf4fd87e65adEd8d7");
			expect(getTokenBridgeAddressForChain(4)).to.equal("0x9dcF9D205C9De35334D646BeE44b2D2859712A09");
		});
	});

	describe("WETH_ADDRESS", () => {
		it("should give value for test env", () => {
			const expected = "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6";
			expect(WETH_ADDRESS).to.equal(expected);
		});
	});

	describe("WBNB_ADDRESS", () => {
		it("should give value for test env", () => {
			const expected = "0xae13d989dac2f0debff460ac112a837c89baa7cd";
			expect(WBNB_ADDRESS).to.equal(expected);
		});
	});

	describe("getDefaultNativeCurrencyAddressEvm()", () => {
		it("should give value for test env", () => {
			expect(getDefaultNativeCurrencyAddressEvm(2)).to.equal("0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6");
			expect(getDefaultNativeCurrencyAddressEvm(4)).to.equal("0xae13d989dac2f0debff460ac112a837c89baa7cd");
		});
	});
});
