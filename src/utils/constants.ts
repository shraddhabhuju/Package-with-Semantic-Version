import { utils } from "ethers";

import {
	CHAIN_ID_ACALA,
	CHAIN_ID_AURORA,
	CHAIN_ID_AVAX,
	CHAIN_ID_BSC,
	CHAIN_ID_CELO,
	CHAIN_ID_ETH,
	CHAIN_ID_ETHEREUM_ROPSTEN,
	CHAIN_ID_FANTOM,
	CHAIN_ID_KARURA,
	CHAIN_ID_KLAYTN,
	CHAIN_ID_NEON,
	CHAIN_ID_OASIS,
	CHAIN_ID_POLYGON,
	CHAIN_ID_SOLANA,
	CHAIN_ID_TERRA,
	CHAIN_ID_TERRA2,
	ChainId,
	CONTRACTS,
} from "@certusone/wormhole-sdk";
import { web3 } from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";

const NODE_ENV = process.env.NODE_ENV || "production";

export const WORMHOLE_RPC_HOSTS =
	NODE_ENV === "production"
		? [
				"https://wormhole-v2-mainnet-api.certus.one",
				"https://wormhole.inotel.ro",
				"https://wormhole-v2-mainnet-api.mcf.rocks",
				"https://wormhole-v2-mainnet-api.chainlayer.network",
				"https://wormhole-v2-mainnet-api.staking.fund",
				"https://wormhole-v2-mainnet.01node.com",
		  ]
		: ["https://wormhole-v2-testnet-api.certus.one"];

export const ETH_NETWORK_CHAIN_ID = NODE_ENV === "production" ? 1 : 5;

export const ROPSTEN_ETH_NETWORK_CHAIN_ID = NODE_ENV === "production" ? 1 : 3;

export const BSC_NETWORK_CHAIN_ID = NODE_ENV === "production" ? 56 : 97;

export const POLYGON_NETWORK_CHAIN_ID = NODE_ENV === "production" ? 137 : 80001;

export const AVAX_NETWORK_CHAIN_ID = NODE_ENV === "production" ? 43114 : 43113;

export const OASIS_NETWORK_CHAIN_ID = NODE_ENV === "production" ? 42262 : 42261;

export const AURORA_NETWORK_CHAIN_ID = NODE_ENV === "production" ? 1313161554 : 1313161555;

export const FANTOM_NETWORK_CHAIN_ID = NODE_ENV === "production" ? 250 : 4002;

export const KARURA_NETWORK_CHAIN_ID = NODE_ENV === "production" ? 686 : 596;

export const ACALA_NETWORK_CHAIN_ID = NODE_ENV === "production" ? 787 : 597;

export const KLAYTN_NETWORK_CHAIN_ID = NODE_ENV === "production" ? 8217 : 1001;

export const CELO_NETWORK_CHAIN_ID = NODE_ENV === "production" ? 42220 : 44787;

export const NEON_NETWORK_CHAIN_ID = NODE_ENV === "production" ? 245022934 : 245022926;

export const getEvmChainId = (chainId: ChainId) =>
	chainId === CHAIN_ID_ETH
		? ETH_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_ETHEREUM_ROPSTEN
		? ROPSTEN_ETH_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_BSC
		? BSC_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_POLYGON
		? POLYGON_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_AVAX
		? AVAX_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_OASIS
		? OASIS_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_AURORA
		? AURORA_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_FANTOM
		? FANTOM_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_KARURA
		? KARURA_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_ACALA
		? ACALA_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_KLAYTN
		? KLAYTN_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_CELO
		? CELO_NETWORK_CHAIN_ID
		: chainId === CHAIN_ID_NEON
		? NEON_NETWORK_CHAIN_ID
		: undefined;

export const isSolanaChain = (chain: ChainId) => {
	return chain === CHAIN_ID_SOLANA;
};

export const SOLANA_HOST = process.env.SOLANA_API_URL
	? process.env.SOLANA_API_URL
	: NODE_ENV === "production"
	? web3.clusterApiUrl("mainnet-beta")
	: web3.clusterApiUrl("devnet");

export const ALGORAND_HOST =
	NODE_ENV === "production"
		? {
				algodToken: "",
				algodServer: "https://mainnet-api.algonode.cloud",
				algodPort: "",
		  }
		: {
				algodToken: "",
				algodServer: "https://testnet-api.algonode.cloud",
				algodPort: "",
		  };

export const KARURA_HOST =
	NODE_ENV === "production" ? "https://eth-rpc-karura.aca-api.network/" : "https://karura-dev.aca-dev.network/eth/http";

export const ACALA_HOST =
	NODE_ENV === "production" ? "https://eth-rpc-acala.aca-api.network/" : "https://acala-dev.aca-dev.network/eth/http";

export const ETH_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B"
		: "0x706abc4E45D419950511e474C7B9Ed348A4a716c",
);

export const ETH_TOKEN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x3ee18B2214AFF97000D974cf647E7C347E8fa585"
		: "0xF890982f9310df57d00f659cf4fd87e65adEd8d7",
);

export const BSC_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B"
		: "0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D",
);

export const BSC_TOKEN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7"
		: "0x9dcF9D205C9De35334D646BeE44b2D2859712A09",
);

export const POLYGON_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7"
		: "0x0CBE91CF822c73C2315FB05100C2F714765d5c20",
);

export const POLYGON_TOKEN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE"
		: "0x377D55a7928c046E18eEbb61977e714d2a76472a",
);

export const AVAX_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x54a8e5f9c4CbA08F9943965859F6c34eAF03E26c"
		: "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C",
);

export const AVAX_TOKEN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052"
		: "0x61E44E506Ca5659E6c0bba9b678586fA2d729756",
);

export const OASIS_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0xfE8cD454b4A1CA468B57D79c0cc77Ef5B6f64585"
		: "0xc1C338397ffA53a2Eb12A7038b4eeb34791F8aCb",
);

export const OASIS_TOKEN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x5848C791e09901b40A9Ef749f2a6735b418d7564"
		: "0x88d8004A9BdbfD9D28090A02010C19897a29605c",
);

export const AURORA_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0xa321448d90d4e5b0A732867c18eA198e75CAC48E"
		: "0xBd07292de7b505a4E803CEe286184f7Acf908F5e",
);

export const AURORA_TOKEN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x51b5123a7b0F9b2bA265f9c4C8de7D78D52f510F"
		: "0xD05eD3ad637b890D68a854d607eEAF11aF456fba",
);

export const FANTOM_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x126783A6Cb203a3E35344528B26ca3a0489a1485"
		: "0x1BB3B4119b7BA9dfad76B0545fb3F531383c3bB7",
);

export const FANTOM_TOKEN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x7C9Fc5741288cDFdD83CeB07f3ea7e22618D79D2"
		: "0x599CEa2204B4FaECd584Ab1F2b6aCA137a0afbE8",
);

export const KARURA_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0xa321448d90d4e5b0A732867c18eA198e75CAC48E"
		: "0xE4eacc10990ba3308DdCC72d985f2a27D20c7d03",
);

export const KARURA_TOKEN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0xae9d7fe007b3327AA64A32824Aaac52C42a6E624"
		: "0xd11De1f930eA1F7Dd0290Fe3a2e35b9C91AEFb37",
);

export const ACALA_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production" ? CONTRACTS.MAINNET.acala.core : "0x4377B49d559c0a9466477195C6AdC3D433e265c0",
);

export const ACALA_TOKEN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production" ? CONTRACTS.MAINNET.acala.token_bridge : "0xebA00cbe08992EdD08ed7793E07ad6063c807004",
);

export const KLAYTN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x0C21603c4f3a6387e241c0091A7EA39E43E90bb7"
		: "0x1830CC6eE66c84D2F177B94D544967c774E624cA",
);

export const KLAYTN_TOKEN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F"
		: "0xC7A13BE098720840dEa132D860fDfa030884b09A",
);

export const CELO_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0xa321448d90d4e5b0A732867c18eA198e75CAC48E"
		: "0x88505117CA88e7dd2eC6EA1E13f0948db2D50D56",
);

export const CELO_TOKEN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x796Dff6D74F3E27060B71255Fe517BFb23C93eed"
		: "0x05ca6037eC51F8b712eD2E6Fa72219FEaE74E153",
);

export const NEON_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production" ? "0x0000000000000000000000000000000000000000" : CONTRACTS.TESTNET.neon.core,
);

export const NEON_TOKEN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production" ? "0x0000000000000000000000000000000000000000" : CONTRACTS.TESTNET.neon.token_bridge,
);

export const SOL_BRIDGE_ADDRESS =
	NODE_ENV === "production"
		? "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth"
		: "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5";

export const SOL_TOKEN_BRIDGE_ADDRESS =
	NODE_ENV === "production"
		? "wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb"
		: "DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe";

export const ROPSTEN_ETH_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B"
		: "0x210c5F5e2AF958B4defFe715Dc621b7a3BA888c5",
);

export const ROPSTEN_ETH_TOKEN_BRIDGE_ADDRESS = utils.getAddress(
	NODE_ENV === "production"
		? "0x3ee18B2214AFF97000D974cf647E7C347E8fa585"
		: "0xF174F9A837536C449321df1Ca093Bb96948D5386",
);

export const TERRA_BRIDGE_ADDRESS =
	NODE_ENV === "production"
		? "terra1dq03ugtd40zu9hcgdzrsq6z2z4hwhc9tqk2uy5"
		: "terra1pd65m0q9tl3v8znnz5f5ltsfegyzah7g42cx5v";

export const TERRA_TOKEN_BRIDGE_ADDRESS =
	NODE_ENV === "production"
		? "terra10nmmwe8r3g99a9newtqa7a75xfgs2e8z87r2sf"
		: "terra1pseddrv0yfsn76u4zxrjmtf45kdlmalswdv39a";

export const TERRA2_BRIDGE_ADDRESS =
	NODE_ENV === "production" ? CONTRACTS.MAINNET.terra2.core : CONTRACTS.TESTNET.terra2.core;

export const TERRA2_TOKEN_BRIDGE_ADDRESS =
	NODE_ENV === "production" ? CONTRACTS.MAINNET.terra2.token_bridge : CONTRACTS.TESTNET.terra2.token_bridge;

export const ALGORAND_BRIDGE_ID = BigInt(NODE_ENV === "production" ? "0" : "86525623");

export const ALGORAND_TOKEN_BRIDGE_ID = BigInt(NODE_ENV === "production" ? "0" : "86525641");

export const getBridgeAddressForChain = (chainId: ChainId) =>
	chainId === CHAIN_ID_SOLANA
		? SOL_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_ETH
		? ETH_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_BSC
		? BSC_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_TERRA
		? TERRA_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_TERRA2
		? TERRA2_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_POLYGON
		? POLYGON_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_ETHEREUM_ROPSTEN
		? ROPSTEN_ETH_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_AVAX
		? AVAX_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_OASIS
		? OASIS_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_AURORA
		? AURORA_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_FANTOM
		? FANTOM_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_KARURA
		? KARURA_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_ACALA
		? ACALA_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_KLAYTN
		? KLAYTN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_CELO
		? CELO_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_NEON
		? NEON_BRIDGE_ADDRESS
		: "";

export const getTokenBridgeAddressForChain = (chainId: ChainId) =>
	chainId === CHAIN_ID_SOLANA
		? SOL_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_ETH
		? ETH_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_BSC
		? BSC_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_TERRA
		? TERRA_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_TERRA2
		? TERRA2_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_POLYGON
		? POLYGON_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_ETHEREUM_ROPSTEN
		? ROPSTEN_ETH_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_AVAX
		? AVAX_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_OASIS
		? OASIS_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_AURORA
		? AURORA_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_FANTOM
		? FANTOM_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_KARURA
		? KARURA_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_ACALA
		? ACALA_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_KLAYTN
		? KLAYTN_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_CELO
		? CELO_TOKEN_BRIDGE_ADDRESS
		: chainId === CHAIN_ID_NEON
		? NEON_TOKEN_BRIDGE_ADDRESS
		: "";

export const WETH_ADDRESS =
	NODE_ENV === "production"
		? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
		: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6";

export const WETH_DECIMALS = 18;

export const ROPSTEN_WETH_ADDRESS =
	NODE_ENV === "production"
		? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
		: "0xc778417e063141139fce010982780140aa0cd5ab";

export const ROPSTEN_WETH_DECIMALS = 18;

export const WBNB_ADDRESS =
	NODE_ENV === "production"
		? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
		: "0xae13d989dac2f0debff460ac112a837c89baa7cd";

export const WBNB_DECIMALS = 18;

export const WMATIC_ADDRESS =
	NODE_ENV === "production"
		? "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
		: "0x9c3c9283d3e44854697cd22d3faa240cfb032889";

export const WMATIC_DECIMALS = 18;

export const getDefaultNativeCurrencyAddressEvm = (chainId: ChainId) => {
	return chainId === CHAIN_ID_ETH
		? WETH_ADDRESS
		: chainId === CHAIN_ID_BSC
		? WBNB_ADDRESS
		: chainId === CHAIN_ID_POLYGON
		? WMATIC_ADDRESS
		: chainId === CHAIN_ID_ETHEREUM_ROPSTEN
		? ROPSTEN_WETH_ADDRESS
		: "";
};

export const MAX_VAA_UPLOAD_RETRIES_SOLANA = 10;

//export const ZEBEC_ADDRESS = "Gvg5iMmgu8zs4rn5zJ6YGGnzsu6WqZJawKUndbqneXia";
export const ZEBEC_ADDRESS = "2AYa9x2wYRcJJ46zhpK6MHwUf4cK3qpje9xwhiQBjnf9";

export const BSC_ZEBEC_BRIDGE_ADDRESS = "0xBE374c45102f46eCa45Ff833dc4978d06e026Bbb";
export const SOL_ZEBEC_BRIDGE_ADDRESS = "Byad3Qr9V7h8HzAFxQYyxkUJufZGibpeijWPNVpx3mLc";

export const fee_keypair = Keypair.fromSecretKey(
	Uint8Array.from([
		70, 161, 123, 58, 222, 232, 135, 249, 135, 209, 232, 186, 82, 14, 126, 24, 201, 4, 106, 238, 2, 108, 60, 250, 20,
		10, 74, 61, 164, 32, 207, 174, 201, 38, 17, 77, 100, 83, 107, 82, 4, 61, 50, 70, 169, 159, 27, 63, 211, 181, 221,
		36, 104, 77, 60, 231, 19, 143, 131, 120, 117, 191, 129, 251,
	]),
);
