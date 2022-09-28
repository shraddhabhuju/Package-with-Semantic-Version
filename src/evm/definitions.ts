import { ChainId } from "@certusone/wormhole-sdk";
import { ContractReceipt } from "ethers";

export interface IZebecEthBridgeClient {
	/**
	 * zebec evm bridge contract address
	 */
	contractAddress: string;

	/**
	 * Register xchain emitter address
	 * @param chainId chain id of the emitter address
	 * @param emitterAddress emitter address
	 */
	registerEmitterAddress(chainId: ChainId, emitterAddress: string): Promise<ContractReceipt>;

	/**
	 *
	 * @param amount amount to deposit
	 * @param depositor address of depositor
	 * @returns
	 */
	depositSol(amount: string, depositor: string): Promise<ContractReceipt>;

	depositToken(amount: string, depositor: string, token_mint: string): Promise<ContractReceipt>;

	/**
	 *
	 * @param amount
	 * @param sender
	 */
	withdrawSol(amount: string, sender: string): Promise<ContractReceipt>;

	/**
	 *
	 * @param amount
	 * @param sender
	 * @param tokenMint
	 */
	withdrawToken(amount: string, sender: string, tokenMint: string): Promise<ContractReceipt>;

	/**
	 *
	 * @param startTime start time of stream
	 * @param endTime end time of stream
	 * @param amount amount to stream
	 * @param receiver
	 * @param sender
	 * @param canCancel
	 * @param canUpdate
	 */
	startSolStream(
		startTime: string,
		endTime: string,
		amount: string,
		receiver: string,
		sender: string,
		canCancel: boolean,
		canUpdate: boolean,
	): Promise<ContractReceipt>;

	/**
	 *
	 * @param startTime
	 * @param endTime
	 * @param amount
	 * @param receiver
	 * @param sender
	 * @param canCancel
	 * @param canUpdate
	 * @param tokenMint
	 */
	startTokenStream(
		startTime: string,
		endTime: string,
		amount: string,
		receiver: string,
		sender: string,
		canCancel: boolean,
		canUpdate: boolean,
		tokenMint: string,
	): Promise<ContractReceipt>;

	/**
	 *
	 * @param sender
	 * @param withdrawer
	 * @param dataAccount
	 */
	withdrawFromSolStream(sender: string, withdrawer: string, dataAccount: string): Promise<ContractReceipt>;

	/**
	 *
	 * @param sender
	 * @param withdrawer
	 * @param tokenMint
	 * @param dataAccount
	 */
	withdrawFromTokenStream(
		sender: string,
		withdrawer: string,
		tokenMint: string,
		dataAccount: string,
	): Promise<ContractReceipt>;

	/**
	 *
	 * @param sender
	 * @param dataAccount
	 */
	cancelSolStream(sender: string, dataAccount: string): Promise<ContractReceipt>;

	/**
	 *
	 * @param sender
	 * @param tokenMint
	 * @param dataAccount
	 */
	cancelTokenStream(sender: string, receiver: string, tokenMint: string, dataAccount: string): Promise<ContractReceipt>;

	/**
	 *
	 * @param sender
	 * @param dataAccount
	 */
	pauseSolStream(sender: string, dataAccount: string): Promise<ContractReceipt>;

	/**
	 *
	 * @param sender
	 * @param tokenMint
	 * @param dataAccount
	 */
	pauseTokenStream(sender: string, receiver: string, tokenMint: string, dataAccount: string): Promise<ContractReceipt>;

	/**
	 *
	 * @param amount
	 * @param sender
	 * @param withdrawer
	 */
	instantSolTransfer(amount: string, sender: string, withdrawer: string): Promise<ContractReceipt>;

	/**
	 *
	 * @param amount
	 * @param sender
	 * @param withdrawer
	 * @param tokenMint
	 */
	instantTokenTransfer(amount: string, sender: string, withdrawer: string, tokenMint: string): Promise<ContractReceipt>;
}
