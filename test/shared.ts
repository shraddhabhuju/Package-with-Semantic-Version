import { CHAIN_ID_BSC, CHAIN_ID_ETH, CHAIN_ID_SOLANA, ChainId } from "@certusone/wormhole-sdk";
import dotenv from "dotenv";
import { ethers } from "ethers";

import {
	BSC_BRIDGE_ADDRESS,
	BSC_TOKEN_BRIDGE_ADDRESS,
	ETH_BRIDGE_ADDRESS,
	ETH_TOKEN_BRIDGE_ADDRESS,
	SOL_BRIDGE_ADDRESS,
	SOL_TOKEN_BRIDGE_ADDRESS,
	SOLANA_HOST,
} from "../src/utils/constants";

dotenv.config();

const environment = process.env.NODE_ENV || "production";
console.log(process.env.NODE_ENV);
console.log(environment);

type Secrets = {
	evmSecretKey: string;
	solanaSecretKey: string;
};

const getSecrets = (): Secrets => {
	const evmSecretKey = process.env.EVM_SECRET_KEY || "";
	const solanaSecretKey = process.env.SOLANA_SECRET_KEY || "";

	if (!evmSecretKey || evmSecretKey === "") {
		throw new Error("env var 'EVM_SECRET_KEY' is missing");
	}

	if (!solanaSecretKey || solanaSecretKey === "") {
		throw new Error("env var 'SOLANA_SECRET_KEY' is missing");
	}

	return {
		evmSecretKey,
		solanaSecretKey,
	};
};

const BSC_NODE_URL =
	environment === "production" ? "https://bsc-dataseed.binance.org/" : "https://data-seed-prebsc-1-s1.binance.org:8545";

const ETH_NODE_URL =
	environment === "production"
		? "https://eth-mainnet.g.alchemy.com/v2/PTdhMPg8JtYgYNExnjeQAJW9zTW1mAkj"
		: "https://eth-goerli.g.alchemy.com/v2/15oSZ5y2nHYUqSrbZv93rSYh4LVj7bG3";

type ChainConfig = {
	chainId: ChainId;
	nodeUrl: string;
	tokenBridgeAddress: string;
	bridgeAddress: string;
	secretKey: string;
};

type TestChains = "solana" | "ethereum" | "bsc";

export const CONFIG: { [chainName in TestChains]: ChainConfig } = {
	solana: {
		chainId: CHAIN_ID_SOLANA,
		nodeUrl: SOLANA_HOST,
		tokenBridgeAddress: SOL_TOKEN_BRIDGE_ADDRESS,
		bridgeAddress: SOL_BRIDGE_ADDRESS,
		secretKey: getSecrets().solanaSecretKey,
	},
	ethereum: {
		chainId: CHAIN_ID_ETH,
		nodeUrl: ETH_NODE_URL,
		tokenBridgeAddress: ETH_TOKEN_BRIDGE_ADDRESS,
		bridgeAddress: ETH_BRIDGE_ADDRESS,
		secretKey: getSecrets().evmSecretKey,
	},
	bsc: {
		chainId: CHAIN_ID_BSC,
		nodeUrl: BSC_NODE_URL,
		tokenBridgeAddress: BSC_TOKEN_BRIDGE_ADDRESS,
		bridgeAddress: BSC_BRIDGE_ADDRESS,
		secretKey: getSecrets().evmSecretKey,
	},
};

export function getSigner(chainConfig: ChainConfig) {
	const provider = new ethers.providers.JsonRpcProvider(chainConfig.nodeUrl);
	const signer = new ethers.Wallet(chainConfig.secretKey, provider);
	return signer;
}
export function getProvider(chainConfig: ChainConfig) {
	const provider = new ethers.providers.JsonRpcProvider(chainConfig.nodeUrl);
	return provider;
}
