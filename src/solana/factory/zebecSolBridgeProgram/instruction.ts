import * as anchor from "@project-serum/anchor";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { PublicKey, Transaction, AccountMeta, Keypair, TransactionInstruction } from "@solana/web3.js";
import { SolanaProject as ZebecBridgeIdl } from "./solana_project";
import { Zebec as ZebecIdl } from "../zebecProgram/zebec";
import { STREAM_TOKEN_SIZE } from "../../constants";

export class ZebecBridgeTransactions {
	readonly _bridgeProgram: Program<ZebecBridgeIdl>;
	readonly _zebecProgram: Program<ZebecIdl>;
	readonly _provider: AnchorProvider;

	constructor(bridgeProgram: Program<ZebecBridgeIdl>, zebecProgram: Program<ZebecIdl>, provider: AnchorProvider) {
		this._bridgeProgram = bridgeProgram;
		this._zebecProgram = zebecProgram;
		this._provider = provider;
	}

	async makeStoreMsg(
		processed_vaa_account: PublicKey,
		emitter_account: PublicKey,
		core_bridge_account: PublicKey,
		data_storage_account: PublicKey,
		count_account: PublicKey,
		current_count: number,
		sender_hash: Buffer,
	) {
		//Store message deposit
		const storeMsgTx = await this._bridgeProgram.methods
			.storeMsg(current_count, sender_hash)
			.accounts({
				payer: this._provider.wallet.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
				processedVaa: processed_vaa_account,
				emitterAcc: emitter_account,
				coreBridgeVaa: core_bridge_account,
				dataStorage: data_storage_account,
				txnCount: count_account,
			})
			.transaction();

		const { blockhash, lastValidBlockHeight } = await this._provider.connection.getLatestBlockhash();
		storeMsgTx.recentBlockhash = blockhash;
		storeMsgTx.lastValidBlockHeight = lastValidBlockHeight;
		storeMsgTx.feePayer = this._provider.wallet.publicKey;
		await this._provider.wallet.signTransaction(storeMsgTx);

		return {
			transaction: storeMsgTx,
			blockhash: blockhash,
			lastBlockHeight: lastValidBlockHeight,
		};
	}

	async makeCreateTransaction(
		transaction: Keypair,
		data_storage_account: PublicKey,
		accounts: AccountMeta[],
		data: Buffer,
		current_count: number,
		sender_hash: Buffer,
		transaction_hash: Buffer,
		data_account?: Keypair,
		pre_ixn_data_account?: TransactionInstruction,
	) {
		const txSize = 700;
		//Create Instructions
		const createTx = await this._bridgeProgram.methods
			.createTransaction(this._zebecProgram.programId, accounts, data, current_count, sender_hash, transaction_hash)
			.accounts({
				transaction: transaction.publicKey,
				zebecEoa: this._provider.wallet.publicKey,
				dataStorage: data_storage_account,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.preInstructions(
				pre_ixn_data_account
					? [await this._bridgeProgram.account.transaction.createInstruction(transaction, txSize), pre_ixn_data_account]
					: [await this._bridgeProgram.account.transaction.createInstruction(transaction, txSize)],
			)
			.transaction();

		const { blockhash, lastValidBlockHeight } = await this._provider.connection.getLatestBlockhash();
		createTx.recentBlockhash = blockhash;
		createTx.lastValidBlockHeight = lastValidBlockHeight;
		createTx.feePayer = this._provider.wallet.publicKey;
		createTx.partialSign(transaction);
		if (pre_ixn_data_account) {
			createTx.partialSign(data_account as Keypair);
		}
		await this._provider.wallet.signTransaction(createTx);

		return {
			transaction: createTx,
			blockhash: blockhash,
			lastBlockHeight: lastValidBlockHeight,
		};
	}

	async makeExecTransaction(
		transaction: Keypair,
		proxy_pda: PublicKey,
		accounts: AccountMeta[],
		sender_hash: Buffer,
		chain_id_hash: Buffer,
	) {
		const remaining_accounts = accounts
			.map((t: any) => {
				if (t.pubkey.equals(proxy_pda)) {
					return { ...t, isSigner: false };
				}
				return t;
			})
			.concat({
				pubkey: this._zebecProgram.programId,
				isWritable: false,
				isSigner: false,
			});

		//Execute Instructions
		const execTx = await this._bridgeProgram.methods
			.executeTransaction(chain_id_hash, sender_hash)
			.accounts({
				pdaSigner: proxy_pda,
				transaction: transaction.publicKey,
			})
			.remainingAccounts(remaining_accounts)
			.transaction();

		const { blockhash, lastValidBlockHeight } = await this._provider.connection.getLatestBlockhash();
		execTx.recentBlockhash = blockhash;
		execTx.lastValidBlockHeight = lastValidBlockHeight;
		execTx.feePayer = this._provider.wallet.publicKey;
		await this._provider.wallet.signTransaction(execTx);

		return {
			transaction: execTx,
			blockhash: blockhash,
			lastBlockHeight: lastValidBlockHeight,
		};
	}
}
