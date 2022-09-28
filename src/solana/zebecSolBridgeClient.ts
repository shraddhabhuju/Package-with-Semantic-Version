import { serializeUint16, serializeUint32, serializeUint64, serializeUint8 } from "byteify";
import { keccak_256 } from "js-sha3";
import keccak256 from "keccak256";

import {
	ChainId,
	getEmitterAddressEth,
	getEmitterAddressTerra,
	importCoreWasm,
	isEVMChain,
	isTerraChain,
	setDefaultWasm,
	toChainId,
} from "@certusone/wormhole-sdk";
import * as anchor from "@project-serum/anchor";
import { AnchorProvider, Program, web3 } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import * as spl from "@solana/spl-token";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";

import { logTransaction } from "../utils";
import { fee_keypair, SOL_ZEBEC_BRIDGE_ADDRESS, ZEBEC_ADDRESS } from "../utils/constants";
import { NotSupportedError } from "../utils/errors";
import {
	CancelTokenStreamPayload,
	PauseTokenStreamPayload,
	TokenDepositPayload,
	TokenStreamPayload,
	TokenStreamUpdatePayload,
	TokenWithdrawPayload,
	TokenWithdrawStreamPayload,
} from "../utils/parser";
import { OPERATE, OPERATEDATA, PREFIX_TOKEN, STREAM_TOKEN_SIZE } from "./constants";
import {
	getDefaultProvider,
	Zebec__factory,
	ZebecBridgeIdl,
	ZebecBridgeTransactions,
	ZebecIdl,
	ZebecSolBridge__factory,
} from "./factory";

/**
 * Fee payer for test in devnet
 * Note: This also should be included in evm contract and proxy program as well as in sdk.
 *  */

type ZebecSolBridgeClientResponse = {
	status: "success" | "error";
	message: string;
	data?: {
		storeMsgTxId?: string;
		createTxId?: string;
		execTxId?: string;
		dataAccount?: string;
	};
};

export interface IZebecSolBridgeClient {
	initialize(admin: PublicKey): Promise<string>;
	registerEmitterAddress(emitterAddress: string, emitterChain: ChainId): Promise<string>;
	depositToken(vaa: Uint8Array, payload: TokenDepositPayload): Promise<ZebecSolBridgeClientResponse>;
	withdrawDeposit(vaa: Uint8Array, payload: TokenWithdrawPayload): Promise<ZebecSolBridgeClientResponse>;
	initializeStream(vaa: Uint8Array, payload: TokenStreamPayload): Promise<ZebecSolBridgeClientResponse>;
	withdrawStreamToken(vaa: Uint8Array, payload: TokenWithdrawStreamPayload): Promise<ZebecSolBridgeClientResponse>;
	updateStreamToken(vaa: Uint8Array, payload: TokenStreamUpdatePayload): Promise<ZebecSolBridgeClientResponse>;
	cancelStream(vaa: Uint8Array, payload: CancelTokenStreamPayload): Promise<ZebecSolBridgeClientResponse>;
	pauseStream(vaa: Uint8Array, payload: PauseTokenStreamPayload): Promise<ZebecSolBridgeClientResponse>;
}

export class ZebecSolBridgeClient implements IZebecSolBridgeClient {
	private readonly _bridgeProgram: Program<ZebecBridgeIdl>;
	private readonly _zebecProgram: Program<ZebecIdl>;
	private readonly _provider: AnchorProvider;
	private static readonly ZebecProgramId: PublicKey = new PublicKey(ZEBEC_ADDRESS);
	static readonly BridgeProgramId: PublicKey = new PublicKey(SOL_ZEBEC_BRIDGE_ADDRESS);
	private readonly _transactionsFactory: ZebecBridgeTransactions;

	constructor(provider: AnchorProvider) {
		this._provider = provider ? provider : getDefaultProvider();
		this._bridgeProgram = ZebecSolBridge__factory.getProgram(ZebecSolBridgeClient.BridgeProgramId, this._provider);
		this._zebecProgram = Zebec__factory.getProgram(ZebecSolBridgeClient.ZebecProgramId, this._provider);
		this._transactionsFactory = new ZebecBridgeTransactions(this._bridgeProgram, this._zebecProgram, this._provider);
	}

	static getXChainUserKey(address: string, chainId: ChainId): PublicKey {
		try {
			const sender_hash = this.getHashSender(address);
			const chainid_hash = this.getHashChainId(chainId);
			// for checking what is the difference in them.
			// console.log(
			// 	"chainid using keccak_256:",
			// 	chainid_hash,
			// 	"chain id directly:",
			// 	Buffer.from([chainId]),
			// 	"chain id using keccak256:",
			// 	keccak256(chainId),
			// );
			const [xChainUser] = findProgramAddressSync([sender_hash, chainid_hash], new PublicKey(SOL_ZEBEC_BRIDGE_ADDRESS));
			return xChainUser;
		} catch (e) {
			throw e;
		}
	}

	private static getHashSender(address: string) {
		if (!address || address === "") {
			throw new Error("Address is empty");
		}
		return Buffer.from(keccak_256(address), "hex");
	}

	private static getHashChainId(chain_id: ChainId) {
		console.log("chain_id string: ", chain_id.toString());
		return Buffer.from(keccak_256(chain_id.toString()), "hex");
	}

	static getEmitterAccountKey(chainId: ChainId): PublicKey {
		try {
			const [emitterAddress] = findProgramAddressSync(
				[Buffer.from("EmitterAddress"), serializeUint16(chainId)],
				this.BridgeProgramId,
			);
			return emitterAddress;
		} catch (e) {
			throw e;
		}
	}

	static async getProcessVaaKey(
		emitterChain: ChainId,
		emitterAddress: string,
		sequence: number,
	): Promise<web3.PublicKey> {
		try {
			let addressInWormholeHex: string = await this.parseEmitterAddressHex(emitterChain, emitterAddress);
			const [processVaaKey] = findProgramAddressSync(
				[Buffer.from(addressInWormholeHex, "hex"), serializeUint16(emitterChain), serializeUint64(sequence)],
				ZebecSolBridgeClient.BridgeProgramId,
			);
			return processVaaKey;
		} catch (e) {
			throw e;
		}
	}

	private static async parseEmitterAddressHex(emitterChain: ChainId, emitterAddress: string) {
		try {
			let addressInWormholeHex: string;
			if (isEVMChain(emitterChain)) {
				addressInWormholeHex = getEmitterAddressEth(emitterAddress);
			} else if (isTerraChain(emitterChain)) {
				addressInWormholeHex = await getEmitterAddressTerra(emitterAddress);
			} else {
				throw new NotSupportedError(`ChainId: ${emitterChain} is not supported.`);
			}
			return addressInWormholeHex;
		} catch (e) {
			throw e;
		}
	}

	static async getCoreBridgeVaaKey(
		timestamp: any,
		nonce: any,
		emitterChain: any,
		emitterAddress: any,
		sequence: any,
		consistencyLevel: any,
		payload: any,
	): Promise<anchor.web3.PublicKey> {
		let array: Uint8Array[] = [];
		try {
			//Create VAA Hash to use in core bridge key
			let buffer_array = [];
			buffer_array.push(serializeUint32(timestamp));
			buffer_array.push(serializeUint32(nonce));
			buffer_array.push(serializeUint16(emitterChain));
			buffer_array.push(Uint8Array.from(emitterAddress));
			buffer_array.push(serializeUint64(sequence));
			buffer_array.push(serializeUint8(consistencyLevel));
			buffer_array.push(Uint8Array.from(payload));
			const hash = keccak256(Buffer.concat(buffer_array));

			// console.log("SOL_BRIDGE_ADDRESS :", SOL_BRIDGE_ADDRESS);
			const [coreBridgeVaaKey] = findProgramAddressSync(
				[Buffer.from("PostedVAA"), hash],
				new PublicKey("3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5"),
			);
			return coreBridgeVaaKey;
		} catch (e) {
			throw e;
		}
	}

	static getConfigAccountKey(): PublicKey {
		const [configAddress] = findProgramAddressSync([Buffer.from("config")], this.BridgeProgramId);
		return configAddress;
	}

	/** Zebec accounts */
	private async withdrawData(
		prefix: string,
		sender: PublicKey,
		zebecProgramID: PublicKey,
		mint?: anchor.web3.PublicKey,
	): Promise<anchor.web3.PublicKey> {
		if (mint) {
			const [withdrawData] = await PublicKey.findProgramAddress(
				[anchor.utils.bytes.utf8.encode(prefix), sender.toBuffer(), mint.toBuffer()],
				zebecProgramID,
			);
			return withdrawData;
		} else {
			const [withdrawData] = await PublicKey.findProgramAddress(
				[anchor.utils.bytes.utf8.encode(prefix), sender.toBuffer()],
				zebecProgramID,
			);
			return withdrawData;
		}
	}

	private async feeVault(fee_receiver: PublicKey, zebecProgramID: PublicKey): Promise<anchor.web3.PublicKey> {
		const [fee_vault] = await PublicKey.findProgramAddress(
			[fee_receiver.toBuffer(), anchor.utils.bytes.utf8.encode(OPERATE)],
			zebecProgramID,
		);
		return fee_vault;
	}

	private async create_fee_account(
		fee_receiver: PublicKey,
		fee_vault: PublicKey,
		zebecProgramID: PublicKey,
	): Promise<anchor.web3.PublicKey> {
		const [fee_account, _] = await PublicKey.findProgramAddress(
			[fee_receiver.toBuffer(), anchor.utils.bytes.utf8.encode(OPERATEDATA), fee_vault.toBuffer()],
			zebecProgramID,
		);
		return fee_account;
	}
	/** end zebec accounts */

	private async getDataStoragePda(sender: Buffer, currentCount: anchor.BN): Promise<PublicKey> {
		const [dataStorage] = await PublicKey.findProgramAddress(
			[Buffer.from("data_store"), sender, currentCount.toArrayLike(Buffer)],
			ZebecSolBridgeClient.BridgeProgramId,
		);
		return dataStorage;
	}

	private async getTransactionCountPda(sender: Buffer) {
		const [count] = await PublicKey.findProgramAddress(
			[Buffer.from("txn_count"), sender],
			ZebecSolBridgeClient.BridgeProgramId,
		);

		return count;
	}

	private async getCurrentCount(count_account: PublicKey): Promise<number> {
		let currentCount: number;
		const countAccountInfo = await this._provider.connection.getAccountInfo(count_account);
		if (!countAccountInfo || !countAccountInfo.data) {
			console.log("currentCountInfo is null");
			currentCount = 1;
		} else {
			// console.log("Getting current count info");
			let count_info: any;
			count_info = this._bridgeProgram.coder.accounts.decode("Count", countAccountInfo.data);
			currentCount = count_info.count + 1;
			console.log("current couunt :", currentCount);
		}
		return currentCount;
	}

	private async sendAndConfirm(
		signedRawTxn: Transaction,
		blockhash: string,
		lastValidBlockHeight: number,
	): Promise<string> {
		//logTransaction(signedRawTxn);
		const signature = await this._provider.connection.sendRawTransaction(signedRawTxn.serialize());
		await this._provider.connection.confirmTransaction({
			signature: signature,
			blockhash: blockhash,
			lastValidBlockHeight: lastValidBlockHeight,
		});
		return signature;
	}

	async initialize(): Promise<string> {
		try {
			const config = ZebecSolBridgeClient.getConfigAccountKey();
			const systemProgram = web3.SystemProgram.programId;

			const txnId = await this._bridgeProgram.methods
				.initialize()
				.accounts({
					config,
					owner: this._provider.wallet.publicKey,
					systemProgram,
				})
				.rpc();
			return txnId;
		} catch (e) {
			throw e;
		}
	}
	async dataAccountInfo(dataAccount: string) {
		const data_account_info = await this._provider.connection.getAccountInfo(new PublicKey(dataAccount));
		return data_account_info;
	}

	async registerEmitterAddress(emitterAddress: string, emitterChain: ChainId): Promise<string> {
		try {
			const config = ZebecSolBridgeClient.getConfigAccountKey();
			const emitterAcc = ZebecSolBridgeClient.getEmitterAccountKey(emitterChain);
			const systemProgram = web3.SystemProgram.programId;
			const addressInWormholeHex = await ZebecSolBridgeClient.parseEmitterAddressHex(emitterChain, emitterAddress);
			// const emitter_address = tryUint8ArrayToNative(emitterAddress, emitterChain);
			// console.log("emitter_address before: ", emitterAcc.toBase58());

			console.log("Initiallizeng Address: %s to proxy contract", addressInWormholeHex);
			const txnId = await this._bridgeProgram.methods
				.registerChain(emitterChain, addressInWormholeHex)
				.accounts({
					owner: this._provider.wallet.publicKey,
					systemProgram,
					config,
					emitterAcc,
				})
				.rpc();
			return txnId;
		} catch (e) {
			throw e;
		}
	}

	async depositToken(vaa: Uint8Array, payload: TokenDepositPayload): Promise<ZebecSolBridgeClientResponse> {
		console.log("INTO DEPOSIT TOKEN");
		setDefaultWasm("node");
		console.log("parsing vaa");
		const { parse_vaa } = await importCoreWasm();
		const parsedVAA = parse_vaa(vaa);

		const proxy_pda = ZebecSolBridgeClient.getXChainUserKey(payload.sender, <ChainId>parsedVAA.emitter_chain);
		console.log("Proxy PDA: ", proxy_pda.toBase58());

		const sender_hash = ZebecSolBridgeClient.getHashSender(payload.sender);
		const chain_id_hash = ZebecSolBridgeClient.getHashChainId(<ChainId>parsedVAA.emitter_chain);

		const transaction_account = anchor.web3.Keypair.generate();

		const processed_vaa_account = await ZebecSolBridgeClient.getProcessVaaKey(
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
		);
		console.log("processed_vaa_account: ", processed_vaa_account.toBase58());

		const emitter_account = ZebecSolBridgeClient.getEmitterAccountKey(parsedVAA.emitter_chain);
		console.log("emitter_account: ", emitter_account.toBase58());

		const core_bridge_account = await ZebecSolBridgeClient.getCoreBridgeVaaKey(
			parsedVAA.timestamp,
			parsedVAA.nonce,
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
			parsedVAA.consistency_level,
			parsedVAA.payload,
		);
		console.log("core_bridge: ", core_bridge_account.toBase58());
		console.log("core_bridge info: ", await this._provider.connection.getAccountInfo(core_bridge_account));

		const count_account = await this.getTransactionCountPda(sender_hash);
		console.log("count account:", count_account.toBase58());

		const transferAmount = new anchor.BN(payload.amount.toString());
		const data = this._zebecProgram.coder.instruction.encode("depositToken", {
			amount: transferAmount,
		});

		const txSize = 1232;
		const currentCount = await this.getCurrentCount(count_account);

		const data_storage_account = await this.getDataStoragePda(sender_hash, new anchor.BN(currentCount));
		//TODO:: Calculate transaction Hash
		let transaction_hash = Buffer.from("HI");

		/** for zebec accounts */
		const [zebec_vault] = await anchor.web3.PublicKey.findProgramAddress(
			[proxy_pda.toBuffer()],
			this._zebecProgram.programId,
		);
		console.log("Zebec vault: ", zebec_vault);
		const mint = new PublicKey(payload.tokenMint);
		console.log("Token Mint: ", mint.toBase58());

		const proxy_token_account = await getAssociatedTokenAddress(mint, proxy_pda, true);
		console.log("proxy_token_account: ", proxy_token_account.toBase58());

		const zebec_vault_ata = await getAssociatedTokenAddress(mint, zebec_vault, true);
		console.log("zebec_vault_token_account: ", zebec_vault_ata.toBase58());
		/** for zebec accounts */

		const accounts = [
			{
				pubkey: zebec_vault,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: proxy_pda,
				isWritable: true,
				isSigner: true,
			},
			{
				pubkey: anchor.web3.SystemProgram.programId,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: spl.TOKEN_PROGRAM_ID,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: mint,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: proxy_token_account,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: zebec_vault_ata,
				isWritable: true,
				isSigner: false,
			},
		];

		let store_msg_sig, create_sig, exec_sig;
		try {
			let {
				transaction: tx_store,
				blockhash: bh_store,
				lastBlockHeight: lbh_store,
			} = await this._transactionsFactory.makeStoreMsg(
				processed_vaa_account,
				emitter_account,
				core_bridge_account,
				data_storage_account,
				count_account,
				currentCount,
				sender_hash,
			);
			store_msg_sig = await this.sendAndConfirm(tx_store, bh_store, lbh_store);
			console.log("Your transaction signature for txn1(store_msg) is: ", store_msg_sig);

			let {
				transaction: tx_create,
				blockhash: bh_create,
				lastBlockHeight: lbh_create,
			} = await this._transactionsFactory.makeCreateTransaction(
				transaction_account,
				data_storage_account,
				accounts,
				data,
				currentCount,
				sender_hash,
				transaction_hash,
			);
			create_sig = await this.sendAndConfirm(tx_create, bh_create, lbh_create);
			console.log("Your transaction signature for txn2(create_tx) is: ", create_sig);

			let {
				transaction: tx_exec,
				blockhash: bh_exec,
				lastBlockHeight: lbh_exec,
			} = await this._transactionsFactory.makeExecTransaction(
				transaction_account,
				proxy_pda,
				accounts,
				sender_hash,
				chain_id_hash,
			);
			exec_sig = await this.sendAndConfirm(tx_exec, bh_exec, lbh_exec);
			console.log("Your transaction signature for txn3(exec_tx) is: ", exec_sig);

			return {
				status: "success",
				message: "Deposit Token Success!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
				},
			};
		} catch (e) {
			console.log(e);
			return {
				status: "error",
				message: e instanceof Error ? e.message : "Unknown Error Occurred!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
				},
			};
		}
	}

	async withdrawDeposit(vaa: Uint8Array, payload: TokenWithdrawPayload): Promise<ZebecSolBridgeClientResponse> {
		console.log("INTO WITHDRAW DEPOSIT");

		setDefaultWasm("node");
		const { parse_vaa } = await importCoreWasm();
		console.log("parsing vaa");
		const parsedVAA = parse_vaa(vaa);

		console.log("emitter chain", parsedVAA.emitter_chain);

		const proxy_pda = ZebecSolBridgeClient.getXChainUserKey(payload.withdrawer, <ChainId>parsedVAA.emitter_chain);
		console.log("proxy_pda", proxy_pda.toBase58());

		const sender_hash = ZebecSolBridgeClient.getHashSender(payload.withdrawer);
		const chain_id_hash = ZebecSolBridgeClient.getHashChainId(<ChainId>parsedVAA.emitter_chain);

		const transaction_account = anchor.web3.Keypair.generate();

		const processed_vaa_account = await ZebecSolBridgeClient.getProcessVaaKey(
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
		);
		console.log("processed vaa key:", processed_vaa_account.toBase58());

		const emitter_account = ZebecSolBridgeClient.getEmitterAccountKey(parsedVAA.emitter_chain);
		console.log("emitter account:", emitter_account.toBase58());

		const core_bridge_account = await ZebecSolBridgeClient.getCoreBridgeVaaKey(
			parsedVAA.timestamp,
			parsedVAA.nonce,
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
			parsedVAA.consistency_level,
			parsedVAA.payload,
		);
		console.log("core_bridge_account", core_bridge_account.toBase58());

		const amount = new anchor.BN(payload.amount.toString());
		const data = this._zebecProgram.coder.instruction.encode("tokenWithdrawal", {
			amount: amount,
		});

		//TODO:: Calculate transaction Hash
		let transaction_hash = Buffer.from("HI");

		const count_account = await this.getTransactionCountPda(sender_hash);
		console.log("count account:", count_account.toBase58());

		const current_count = await this.getCurrentCount(count_account);
		console.log("current_count", current_count);

		const data_storage_account = await this.getDataStoragePda(sender_hash, new anchor.BN(current_count));

		/** for zebec */
		const token_mint = new PublicKey(payload.tokenMint);
		console.log("token mint:", token_mint.toBase58());

		const proxy_pda_ata = await getAssociatedTokenAddress(token_mint, proxy_pda, true);
		console.log("proxy pda ata:", proxy_pda_ata.toBase58());

		const [zebec_vault] = await anchor.web3.PublicKey.findProgramAddress(
			[proxy_pda.toBuffer()],
			this._zebecProgram.programId,
		);
		console.log("zebec_vault", zebec_vault.toBase58());

		const zebec_vault_ata = await getAssociatedTokenAddress(token_mint, zebec_vault, true);
		console.log("zebec vault ata", zebec_vault_ata);

		const withdraw_data = await this.withdrawData(PREFIX_TOKEN, proxy_pda, this._zebecProgram.programId, token_mint);
		console.log("withdraw_data", withdraw_data.toBase58());
		/** end for zebec */

		const accounts = [
			{
				pubkey: zebec_vault,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: withdraw_data,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: proxy_pda,
				isWritable: true,
				isSigner: true,
			},
			{
				pubkey: anchor.web3.SystemProgram.programId,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: spl.TOKEN_PROGRAM_ID,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: token_mint,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: proxy_pda_ata,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: zebec_vault_ata,
				isWritable: true,
				isSigner: false,
			},
		];

		let store_msg_sig, create_sig, exec_sig;
		try {
			let {
				transaction: tx_store,
				blockhash: bh_store,
				lastBlockHeight: lbh_store,
			} = await this._transactionsFactory.makeStoreMsg(
				processed_vaa_account,
				emitter_account,
				core_bridge_account,
				data_storage_account,
				count_account,
				current_count,
				sender_hash,
			);
			store_msg_sig = await this.sendAndConfirm(tx_store, bh_store, lbh_store);
			console.log("Your transaction signature for txn1(store_msg) is: ", store_msg_sig);

			let {
				transaction: tx_create,
				blockhash: bh_create,
				lastBlockHeight: lbh_create,
			} = await this._transactionsFactory.makeCreateTransaction(
				transaction_account,
				data_storage_account,
				accounts,
				data,
				current_count,
				sender_hash,
				transaction_hash,
			);
			create_sig = await this.sendAndConfirm(tx_create, bh_create, lbh_create);
			console.log("Your transaction signature for txn2(create_tx) is: ", create_sig);

			let {
				transaction: tx_exec,
				blockhash: bh_exec,
				lastBlockHeight: lbh_exec,
			} = await this._transactionsFactory.makeExecTransaction(
				transaction_account,
				proxy_pda,
				accounts,
				sender_hash,
				chain_id_hash,
			);
			exec_sig = await this.sendAndConfirm(tx_exec, bh_exec, lbh_exec);
			console.log("Your transaction signature for txn3(exec_tx) is: ", exec_sig);

			return {
				status: "success",
				message: "Withdraw Deposited Token Success!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
				},
			};
		} catch (e) {
			console.log(e);
			return {
				status: "error",
				message: e instanceof Error ? e.message : "Unknown Error Occurred!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
				},
			};
		}
	}

	async initializeStream(vaa: Uint8Array, payload: TokenStreamPayload): Promise<ZebecSolBridgeClientResponse> {
		console.log("INTO INITIALLIZE STREAM");

		setDefaultWasm("node");
		const { parse_vaa } = await importCoreWasm();
		console.log("parsing vaa");
		const parsedVAA = parse_vaa(vaa);

		const proxy_pda = ZebecSolBridgeClient.getXChainUserKey(payload.sender, <ChainId>parsedVAA.emitter_chain);
		console.log("proxy pda:", proxy_pda.toBase58());

		const sender_hash = ZebecSolBridgeClient.getHashSender(payload.sender);
		const chain_id_hash = ZebecSolBridgeClient.getHashChainId(<ChainId>parsedVAA.emitter_chain);

		const transaction_account = anchor.web3.Keypair.generate();

		const processed_vaa_account = await ZebecSolBridgeClient.getProcessVaaKey(
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
		);
		console.log("processed vaa account:", processed_vaa_account.toBase58());

		const emitter_account = ZebecSolBridgeClient.getEmitterAccountKey(parsedVAA.emitter_chain);
		console.log("emitter account:", emitter_account.toBase58());

		const core_bridge_account = await ZebecSolBridgeClient.getCoreBridgeVaaKey(
			parsedVAA.timestamp,
			parsedVAA.nonce,
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
			parsedVAA.consistency_level,
			parsedVAA.payload,
		);
		console.log("core bridge vaa account :", core_bridge_account.toString());

		const count_account = await this.getTransactionCountPda(sender_hash);
		console.log("count_account: ", count_account.toString());

		const startTime = new anchor.BN(payload.startTime.toString());
		const endTime = new anchor.BN(payload.endTime.toString());
		const amount = new anchor.BN(payload.amount.toString());
		const canCancel = payload.canCancel.toString() === "1";
		const canUpdate = payload.canUpdate.toString() === "1";

		const data = this._zebecProgram.coder.instruction.encode("tokenStream", {
			startTime: startTime,
			endTime: endTime,
			amount: amount,
			canCancel,
			canUpdate,
		});

		console.log("Buffer created!!");
		//TODO:: Calculate transaction Hash
		let transaction_hash = Buffer.from("HI");

		const current_count = await this.getCurrentCount(count_account);

		const data_storage_account = await this.getDataStoragePda(sender_hash, new anchor.BN(current_count));

		/** for zebec */
		const mint = new PublicKey(payload.tokenMint);
		console.log("token mint:", mint.toBase58());

		const withdrawDatatemp = await this.withdrawData(PREFIX_TOKEN, proxy_pda, this._zebecProgram.programId, mint);
		console.log("withdraw data:", withdrawDatatemp.toBase58());

		const fee_receiver = fee_keypair.publicKey;
		console.log("fee_receiver:", fee_receiver.toBase58());

		const dataAccount: anchor.web3.Keypair = anchor.web3.Keypair.generate();
		console.log("stream escrow account:", dataAccount.publicKey.toBase58());

		const feeVaultTemp = await this.feeVault(fee_receiver, this._zebecProgram.programId);
		console.log("feeVaultTemp:", feeVaultTemp.toBase58());

		const feeAccountTemp = await this.create_fee_account(fee_receiver, feeVaultTemp, this._zebecProgram.programId);
		console.log("feeAccountTemp:", feeAccountTemp.toBase58());

		const pdaReceiver = ZebecSolBridgeClient.getXChainUserKey(payload.recipient, <ChainId>parsedVAA.emitter_chain);
		console.log("pdaReceiver", pdaReceiver.toBase58());
		/** end for zebec */

		const accounts = [
			{
				pubkey: dataAccount.publicKey,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: withdrawDatatemp,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: fee_receiver,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: feeAccountTemp,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: feeVaultTemp,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: proxy_pda,
				isWritable: true,
				isSigner: true,
			},
			{
				pubkey: pdaReceiver,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: anchor.web3.SystemProgram.programId,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: spl.TOKEN_PROGRAM_ID,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: mint,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
				isWritable: false,
				isSigner: false,
			},
		];

		console.log("Setting Up Fee Vaults:: ");
		// await this._zebecProgram.rpc.createFeeAccount(new anchor.BN(25), {
		// 	accounts: {
		// 		feeVault: feeVaultTemp,
		// 		feeVaultData: feeAccountTemp,
		// 		feeOwner: fee_receiver.publicKey,
		// 		systemProgram: anchor.web3.SystemProgram.programId,
		// 		rent: anchor.web3.SYSVAR_RENT_PUBKEY,
		// 	},
		// 	signers: [fee_receiver],
		// });

		const pre_ixn_data_account = await this._zebecProgram.account.streamToken.createInstruction(
			dataAccount,
			STREAM_TOKEN_SIZE,
		);

		let store_msg_sig, create_sig, exec_sig;
		try {
			const {
				transaction: tx_store,
				blockhash: bh_store,
				lastBlockHeight: lbh_store,
			} = await this._transactionsFactory.makeStoreMsg(
				processed_vaa_account,
				emitter_account,
				core_bridge_account,
				data_storage_account,
				count_account,
				current_count,
				sender_hash,
			);
			store_msg_sig = await this.sendAndConfirm(tx_store, bh_store, lbh_store);
			console.log("Your transaction signature for txn1(store_msg) is: ", store_msg_sig);

			const {
				transaction: tx_create,
				blockhash: bh_create,
				lastBlockHeight: lbh_create,
			} = await this._transactionsFactory.makeCreateTransaction(
				transaction_account,
				data_storage_account,
				accounts,
				data,
				current_count,
				sender_hash,
				transaction_hash,
				dataAccount,
				pre_ixn_data_account,
			);
			create_sig = await this.sendAndConfirm(tx_create, bh_create, lbh_create);
			console.log("Your transaction signature for txn2(create_tx) is: ", create_sig);

			const {
				transaction: tx_exec,
				blockhash: bh_exec,
				lastBlockHeight: lbh_exec,
			} = await this._transactionsFactory.makeExecTransaction(
				transaction_account,
				proxy_pda,
				accounts,
				sender_hash,
				chain_id_hash,
			);
			exec_sig = await this.sendAndConfirm(tx_exec, bh_exec, lbh_exec);
			console.log("Your transaction signature for txn3(exec_tx) is: ", exec_sig);

			return {
				status: "success",
				message: "Stream started!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
					dataAccount: dataAccount.publicKey.toString(),
				},
			};
		} catch (e) {
			console.log(e);
			return {
				status: "error",
				message: e instanceof Error ? e.message : "Unknown Error Occurred!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
				},
			};
		}
	}

	async withdrawStreamToken(
		vaa: Uint8Array,
		payload: TokenWithdrawStreamPayload,
	): Promise<ZebecSolBridgeClientResponse> {
		console.log("INTO WITHDRAW STREAM!!");
		setDefaultWasm("node");
		const { parse_vaa } = await importCoreWasm();
		const parsedVAA = parse_vaa(vaa);

		const sender_pda = ZebecSolBridgeClient.getXChainUserKey(payload.sender, <ChainId>parsedVAA.emitter_chain);

		const sender_hash = ZebecSolBridgeClient.getHashSender(payload.sender);

		const receiver_pda = ZebecSolBridgeClient.getXChainUserKey(payload.withdrawer, <ChainId>parsedVAA.emitter_chain);
		console.log("pdaReceiver", receiver_pda.toBase58());

		const receiver_hash = ZebecSolBridgeClient.getHashSender(payload.withdrawer);

		const chain_id_hash = ZebecSolBridgeClient.getHashChainId(<ChainId>parsedVAA.emitter_chain);

		const transaction_account = anchor.web3.Keypair.generate();

		const processed_vaa_account = await ZebecSolBridgeClient.getProcessVaaKey(
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
		);
		const emitter_account = ZebecSolBridgeClient.getEmitterAccountKey(parsedVAA.emitter_chain);
		const core_bridge_account = await ZebecSolBridgeClient.getCoreBridgeVaaKey(
			parsedVAA.timestamp,
			parsedVAA.nonce,
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
			parsedVAA.consistency_level,
			parsedVAA.payload,
		);
		const count_account = await this.getTransactionCountPda(sender_hash);

		const data = this._zebecProgram.coder.instruction.encode("withdrawTokenStream", {});

		let transaction_hash = Buffer.from("HI");

		const current_count = await this.getCurrentCount(count_account);
		console.log("current count:", current_count);

		const data_storage_account = await this.getDataStoragePda(sender_hash, new anchor.BN(current_count));
		/** for zebec */
		const dataAccount = new PublicKey(payload.dataAccount);
		console.log("stream escrow account:", dataAccount.toBase58());

		const mint = new PublicKey(payload.tokenMint);
		console.log("token mint", mint.toBase58());

		const withdrawDatatemp = await this.withdrawData(PREFIX_TOKEN, sender_pda, this._zebecProgram.programId, mint);
		console.log("withdraw data temp:", withdrawDatatemp.toBase58());

		const fee_receiver = fee_keypair.publicKey;
		console.log("fee receiver:", fee_receiver.toBase58());

		const [zebec_vault] = await anchor.web3.PublicKey.findProgramAddress(
			[sender_pda.toBuffer()],
			this._zebecProgram.programId,
		);
		console.log("zebec vault:", zebec_vault.toBase58());

		const zebec_vault_ata = await getAssociatedTokenAddress(mint, zebec_vault, true);
		console.log("zebec vault ata:", zebec_vault_ata.toBase58());

		const fee_vault = await this.feeVault(fee_receiver, this._zebecProgram.programId);
		console.log("fee vault:", fee_vault.toBase58());

		const fee_vault_ata = await getAssociatedTokenAddress(mint, fee_vault, true);
		console.log("fee vault ata:", fee_vault_ata.toBase58());

		const feeAccountTemp = await this.create_fee_account(fee_receiver, fee_vault, this._zebecProgram.programId);
		console.log("fee account temp:", feeAccountTemp.toBase58());

		const receiver_ata = await getAssociatedTokenAddress(mint, receiver_pda, true);
		console.log("receiver_ata:", receiver_ata);
		/** end for zebec */

		const accounts = [
			{
				pubkey: zebec_vault,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: receiver_pda,
				isWritable: true,
				isSigner: true,
			},
			{
				pubkey: sender_pda,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: fee_receiver,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: feeAccountTemp,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: fee_vault,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: dataAccount,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: withdrawDatatemp,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: anchor.web3.SystemProgram.programId,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: spl.TOKEN_PROGRAM_ID,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: mint,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: zebec_vault_ata,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: receiver_ata,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: fee_vault_ata,
				isWritable: true,
				isSigner: false,
			},
		];

		let store_msg_sig, create_sig, exec_sig;
		try {
			const {
				transaction: tx_store,
				blockhash: bh_store,
				lastBlockHeight: lbh_store,
			} = await this._transactionsFactory.makeStoreMsg(
				processed_vaa_account,
				emitter_account,
				core_bridge_account,
				data_storage_account,
				count_account,
				current_count,
				sender_hash,
			);
			store_msg_sig = await this.sendAndConfirm(tx_store, bh_store, lbh_store);
			console.log("Your transaction signature for txn1 (store_msg) is: ", store_msg_sig);

			const {
				transaction: tx_create,
				blockhash: bh_create,
				lastBlockHeight: lbh_create,
			} = await this._transactionsFactory.makeCreateTransaction(
				transaction_account,
				data_storage_account,
				accounts,
				data,
				current_count,
				sender_hash,
				transaction_hash,
			);
			create_sig = await this.sendAndConfirm(tx_create, bh_create, lbh_create);
			console.log("Your transaction signature for txn2 (create_tx) is: ", create_sig);

			const {
				transaction: tx_exec,
				blockhash: bh_exec,
				lastBlockHeight: lbh_exec,
			} = await this._transactionsFactory.makeExecTransaction(
				transaction_account,
				receiver_pda,
				accounts,
				receiver_hash,
				chain_id_hash,
			);
			exec_sig = await this.sendAndConfirm(tx_exec, bh_exec, lbh_exec);
			console.log("Your transaction signature for txn3 (exec_tx) is: ", exec_sig);

			return {
				status: "success",
				message: "Withdraw Streamed Token Success!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
				},
			};
		} catch (e) {
			console.log(e);
			return {
				status: "error",
				message: e instanceof Error ? e.message : "Unknown Error Occurred!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
				},
			};
		}
	}

	async cancelStream(vaa: Uint8Array, payload: CancelTokenStreamPayload): Promise<ZebecSolBridgeClientResponse> {
		console.log("INTO CANCEL STREAM");
		const proxy_pda = ZebecSolBridgeClient.getXChainUserKey(payload.sender, toChainId("bsc"));
		const sender_hash = ZebecSolBridgeClient.getHashSender(payload.sender);
		const chain_id_hash = ZebecSolBridgeClient.getHashChainId(toChainId("bsc"));
		const mint = new PublicKey(payload.tokenMint);
		const withdrawDatatemp = await this.withdrawData(PREFIX_TOKEN, proxy_pda, this._zebecProgram.programId, mint);
		//TODO:: change this to zebec fee_address
		const fee_receiver = fee_keypair.publicKey;
		// how to pass this to frontend ?
		const dataAccount = new PublicKey(payload.dataAccount);
		console.log("stream escrow account:", dataAccount);
		const [zebec_vault] = await anchor.web3.PublicKey.findProgramAddress(
			[proxy_pda.toBuffer()],
			this._zebecProgram.programId,
		);
		const zebec_vault_ata = await getAssociatedTokenAddress(mint, zebec_vault, true);
		console.log("zebec_vault_ata: ", zebec_vault_ata);
		const fee_vault = await this.feeVault(fee_receiver, this._zebecProgram.programId);
		const fee_vault_ata = await getAssociatedTokenAddress(mint, fee_vault, true);
		const feeAccountTemp = await this.create_fee_account(fee_receiver, fee_vault, this._zebecProgram.programId);

		const receiver_pda = ZebecSolBridgeClient.getXChainUserKey(payload.recipient, toChainId("bsc"));
		const receiver_ata = await getAssociatedTokenAddress(mint, receiver_pda, true);
		const transaction_account = anchor.web3.Keypair.generate();

		setDefaultWasm("node");
		const { parse_vaa } = await importCoreWasm();
		console.log("parsing vaa");
		const parsedVAA = parse_vaa(vaa);
		const processed_vaa_account = await ZebecSolBridgeClient.getProcessVaaKey(
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
		);
		console.log("processed vaa account:", processed_vaa_account.toBase58());

		const emitter_account = ZebecSolBridgeClient.getEmitterAccountKey(parsedVAA.emitter_chain);
		console.log("emitter account:", emitter_account.toBase58());

		const core_bridge_account = await ZebecSolBridgeClient.getCoreBridgeVaaKey(
			parsedVAA.timestamp,
			parsedVAA.nonce,
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
			parsedVAA.consistency_level,
			parsedVAA.payload,
		);
		const count_account = await this.getTransactionCountPda(sender_hash);

		const data = this._zebecProgram.coder.instruction.encode("cancelTokenStream", {});
		//TODO:: Calculate transaction Hash
		let transaction_hash = Buffer.from("HI");
		const current_count = await this.getCurrentCount(count_account);
		const data_storage_account = await this.getDataStoragePda(sender_hash, new anchor.BN(current_count));
		const accounts = [
			{
				pubkey: zebec_vault,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: receiver_pda,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: proxy_pda,
				isWritable: true,
				isSigner: true,
			},
			{
				pubkey: fee_receiver,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: feeAccountTemp,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: fee_vault,
				isWritable: false,
				isSigner: false,
			},

			{
				pubkey: dataAccount,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: withdrawDatatemp,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: anchor.web3.SystemProgram.programId,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: spl.TOKEN_PROGRAM_ID,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: mint,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: zebec_vault_ata,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: receiver_ata,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: fee_vault_ata,
				isWritable: true,
				isSigner: false,
			},
		];

		let store_msg_sig, create_sig, exec_sig;
		try {
			const {
				transaction: tx_store,
				blockhash: bh_store,
				lastBlockHeight: lbh_store,
			} = await this._transactionsFactory.makeStoreMsg(
				processed_vaa_account,
				emitter_account,
				core_bridge_account,
				data_storage_account,
				count_account,
				current_count,
				sender_hash,
			);
			store_msg_sig = await this.sendAndConfirm(tx_store, bh_store, lbh_store);
			console.log("Your transaction signature for txn1(store_msg) is: ", store_msg_sig);

			const {
				transaction: tx_create,
				blockhash: bh_create,
				lastBlockHeight: lbh_create,
			} = await this._transactionsFactory.makeCreateTransaction(
				transaction_account,
				data_storage_account,
				accounts,
				data,
				current_count,
				sender_hash,
				transaction_hash,
			);
			create_sig = await this.sendAndConfirm(tx_create, bh_create, lbh_create);
			console.log("Your transaction signature for txn2(create_tx) is: ", create_sig);

			const {
				transaction: tx_exec,
				blockhash: bh_exec,
				lastBlockHeight: lbh_exec,
			} = await this._transactionsFactory.makeExecTransaction(
				transaction_account,
				proxy_pda,
				accounts,
				sender_hash,
				chain_id_hash,
			);
			exec_sig = await this.sendAndConfirm(tx_exec, bh_exec, lbh_exec);
			console.log("Your transaction signature for txn3(exec_tx) is: ", exec_sig);

			return {
				status: "success",
				message: "Stream Cancelled!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
				},
			};
		} catch (e) {
			console.log(e);
			return {
				status: "error",
				message: e instanceof Error ? e.message : "Unknown Error Occurred!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
				},
			};
		}
	}

	async pauseStream(vaa: Uint8Array, payload: PauseTokenStreamPayload): Promise<ZebecSolBridgeClientResponse> {
		console.log("INTO PAUSE STREAM");
		const proxy_pda = ZebecSolBridgeClient.getXChainUserKey(payload.sender, toChainId("bsc"));
		const sender_hash = ZebecSolBridgeClient.getHashSender(payload.sender);
		const chain_id_hash = ZebecSolBridgeClient.getHashChainId(toChainId("bsc"));
		const mint = new PublicKey(payload.tokenMint);
		const withdrawDatatemp = await this.withdrawData(PREFIX_TOKEN, proxy_pda, this._zebecProgram.programId, mint);
		// how to pass this to frontend ?
		const dataAccount = new PublicKey(payload.dataAccount);
		console.log("stream escrow account:", dataAccount.toString());

		const pdaReceiver = ZebecSolBridgeClient.getXChainUserKey(payload.recipient, toChainId("bsc"));
		const transaction_account = anchor.web3.Keypair.generate();

		setDefaultWasm("node");
		const { parse_vaa } = await importCoreWasm();
		const parsedVAA = parse_vaa(vaa);
		const processed_vaa_account = await ZebecSolBridgeClient.getProcessVaaKey(
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
		);
		console.log("processed vaa account:", processed_vaa_account.toBase58());

		const emitter_account = ZebecSolBridgeClient.getEmitterAccountKey(parsedVAA.emitter_chain);
		console.log("emitter account:", emitter_account.toBase58());

		const core_bridge_account = await ZebecSolBridgeClient.getCoreBridgeVaaKey(
			parsedVAA.timestamp,
			parsedVAA.nonce,
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
			parsedVAA.consistency_level,
			parsedVAA.payload,
		);
		console.log("core bridge account:", core_bridge_account.toBase58());

		const count_account = await this.getTransactionCountPda(sender_hash);
		console.log("count account:", count_account.toBase58());

		const data = this._zebecProgram.coder.instruction.encode("pauseResumeTokenStream", {});

		//TODO:: Calculate transaction Hash
		let transaction_hash = Buffer.from("HI");

		const current_count = await this.getCurrentCount(count_account);
		console.log("current count:", current_count);

		const data_storage_account = await this.getDataStoragePda(sender_hash, new anchor.BN(current_count));

		const accounts = [
			{
				pubkey: proxy_pda,
				isWritable: true,
				isSigner: true,
			},
			{
				pubkey: pdaReceiver,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: dataAccount,
				isWritable: true,
				isSigner: false,
			},
		];

		let store_msg_sig, create_sig, exec_sig;
		try {
			const {
				transaction: tx_store,
				blockhash: bh_store,
				lastBlockHeight: lbh_store,
			} = await this._transactionsFactory.makeStoreMsg(
				processed_vaa_account,
				emitter_account,
				core_bridge_account,
				data_storage_account,
				count_account,
				current_count,
				sender_hash,
			);
			store_msg_sig = await this.sendAndConfirm(tx_store, bh_store, lbh_store);
			console.log("Your transaction signature for txn1(store_msg) is: ", store_msg_sig);

			const {
				transaction: tx_create,
				blockhash: bh_create,
				lastBlockHeight: lbh_create,
			} = await this._transactionsFactory.makeCreateTransaction(
				transaction_account,
				data_storage_account,
				accounts,
				data,
				current_count,
				sender_hash,
				transaction_hash,
			);
			create_sig = await this.sendAndConfirm(tx_create, bh_create, lbh_create);
			console.log("Your transaction signature for txn2(create_tx) is: ", create_sig);

			const {
				transaction: tx_exec,
				blockhash: bh_exec,
				lastBlockHeight: lbh_exec,
			} = await this._transactionsFactory.makeExecTransaction(
				transaction_account,
				proxy_pda,
				accounts,
				sender_hash,
				chain_id_hash,
			);
			exec_sig = await this.sendAndConfirm(tx_exec, bh_exec, lbh_exec);
			console.log("Your transaction signature for txn3(exec_tx) is: ", exec_sig);

			return {
				status: "success",
				message: "Stream Paused!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
				},
			};
		} catch (e) {
			console.log(e);
			return {
				status: "error",
				message: e instanceof Error ? e.message : "Unknown Error Occurred!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
				},
			};
		}
	}

	async updateStreamToken(vaa: Uint8Array, payload: TokenStreamUpdatePayload): Promise<ZebecSolBridgeClientResponse> {
		console.log("INTO TOKEN STREAM UPDATE");
		setDefaultWasm("node");
		const { parse_vaa } = await importCoreWasm();
		const parsedVAA = parse_vaa(vaa);
		const proxy_pda = ZebecSolBridgeClient.getXChainUserKey(payload.sender, toChainId("bsc"));
		const sender_hash = ZebecSolBridgeClient.getHashSender(payload.sender);
		const chain_id_hash = ZebecSolBridgeClient.getHashChainId(toChainId("bsc"));
		const mint = new PublicKey(payload.tokenMint);
		const withdrawDatatemp = await this.withdrawData(PREFIX_TOKEN, proxy_pda, this._zebecProgram.programId, mint);
		// how to pass this to frontend ?
		const dataAccount = new PublicKey(payload.dataAccount);
		console.log("stream escrow account:", dataAccount.toString());

		//** for test only **//
		const data_account_info_ = await this._provider.connection.getAccountInfo(dataAccount);
		if (data_account_info_) {
			const data_account_decode = this._zebecProgram.coder.accounts.decode("StreamToken", data_account_info_.data);
			console.log("un_updated_amount: ", data_account_decode.amount.toString());
		} else {
			console.log("data_account is null");
		}

		const pdaReceiver = ZebecSolBridgeClient.getXChainUserKey(payload.recipient, toChainId("bsc"));
		const transaction_account = anchor.web3.Keypair.generate();

		const processed_vaa_account = await ZebecSolBridgeClient.getProcessVaaKey(
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
		);
		console.log("processed vaa account:", processed_vaa_account.toBase58());

		const emitter_account = ZebecSolBridgeClient.getEmitterAccountKey(parsedVAA.emitter_chain);
		console.log("emitter account:", emitter_account.toBase58());

		const core_bridge_account = await ZebecSolBridgeClient.getCoreBridgeVaaKey(
			parsedVAA.timestamp,
			parsedVAA.nonce,
			parsedVAA.emitter_chain,
			parsedVAA.emitter_address,
			parsedVAA.sequence,
			parsedVAA.consistency_level,
			parsedVAA.payload,
		);
		console.log("core bridge account:", core_bridge_account.toBase58());

		const count_account = await this.getTransactionCountPda(sender_hash);
		console.log("count account:", count_account.toBase58());

		const startTime = new anchor.BN(payload.startTime.toString());
		const endTime = new anchor.BN(payload.endTime.toString());
		const amount = new anchor.BN(payload.amount.toString());
		const data = this._zebecProgram.coder.instruction.encode("tokenStreamUpdate", {
			startTime,
			endTime,
			amount,
		});

		//TODO:: Calculate transaction Hash
		let transaction_hash = Buffer.from("HI");

		const current_count = await this.getCurrentCount(count_account);
		console.log("current count:", current_count);

		const data_storage_account = await this.getDataStoragePda(sender_hash, new anchor.BN(current_count));
		const accounts = [
			{
				pubkey: dataAccount,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: withdrawDatatemp,
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: proxy_pda,
				isWritable: true,
				isSigner: true,
			},
			{
				pubkey: pdaReceiver,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: mint,
				isWritable: false,
				isSigner: false,
			},
		];
		let store_msg_sig, create_sig, exec_sig;
		try {
			const {
				transaction: tx_store,
				blockhash: bh_store,
				lastBlockHeight: lbh_store,
			} = await this._transactionsFactory.makeStoreMsg(
				processed_vaa_account,
				emitter_account,
				core_bridge_account,
				data_storage_account,
				count_account,
				current_count,
				sender_hash,
			);
			store_msg_sig = await this.sendAndConfirm(tx_store, bh_store, lbh_store);
			console.log("Your transaction signature for txn1(store_msg) is: ", store_msg_sig);

			const {
				transaction: tx_create,
				blockhash: bh_create,
				lastBlockHeight: lbh_create,
			} = await this._transactionsFactory.makeCreateTransaction(
				transaction_account,
				data_storage_account,
				accounts,
				data,
				current_count,
				sender_hash,
				transaction_hash,
			);
			create_sig = await this.sendAndConfirm(tx_create, bh_create, lbh_create);
			console.log("Your transaction signature for txn2(create_tx) is: ", create_sig);

			const {
				transaction: tx_exec,
				blockhash: bh_exec,
				lastBlockHeight: lbh_exec,
			} = await this._transactionsFactory.makeExecTransaction(
				transaction_account,
				proxy_pda,
				accounts,
				sender_hash,
				chain_id_hash,
			);
			exec_sig = await this.sendAndConfirm(tx_exec, bh_exec, lbh_exec);
			console.log("Your transaction signature for txn3(exec_tx) is: ", exec_sig);

			//** for test only **//
			const data_account_info = await this._provider.connection.getAccountInfo(dataAccount);
			if (data_account_info) {
				const data_account_decode = this._zebecProgram.coder.accounts.decode("StreamToken", data_account_info.data);
				console.log("updated_amount: ", data_account_decode.amount.toString());
			} else {
				console.log("data_account is null");
			}

			return {
				status: "success",
				message: "Stream Updated!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
				},
			};
		} catch (e) {
			console.log(e);
			return {
				status: "error",
				message: e instanceof Error ? e.message : "Unknown Error Occurred!",
				data: {
					storeMsgTxId: store_msg_sig,
					createTxId: create_sig,
					execTxId: exec_sig,
				},
			};
		}
	}
}
