import { BigNumber, ContractReceipt, ethers } from "ethers";

import { ChainId, EVMChainId, toChainName, tryNativeToUint8Array, WSOL_DECIMALS } from "@certusone/wormhole-sdk";

import { getDecimals, InvalidArgumentError, isValidAddress } from "../utils";
import { IZebecEthBridgeClient } from "./definitions";
import { Messenger } from "./factory/Messenger";
import { Messenger__factory } from "./factory/Messenger__factory";

export class ZebecEthBridgeClient implements IZebecEthBridgeClient {
	// todo: fee is hard coded
	readonly ArbitaryFee = ethers.utils.parseEther("0.01");

	private _contractAddress: string;

	public get contractAddress() {
		return this._contractAddress;
	}

	private _chainId: EVMChainId;

	private _contract: Messenger;

	/**
	 * Constructs an client instance to interact with evm bridge contract
	 * @param contractAddress address of the bridge contract address
	 * @param signer evm signer
	 * @param sourceChain wormhole chain id of deployed evm contract
	 */
	constructor(contractAddress: string, signer: ethers.Signer, sourceChain: EVMChainId) {
		this._contractAddress = contractAddress;
		this._contract = Messenger__factory.connect(this._contractAddress, signer);
		this._chainId = sourceChain;
	}

	async registerEmitterAddress(chainId: ChainId, emitterAddress: string): Promise<ContractReceipt> {
		const BufferChainId = BigNumber.from(chainId);
		const emitterAddressBuf = Buffer.from(emitterAddress);

		return (await this._contract.registerApplicationContracts(BufferChainId, emitterAddressBuf)).wait();
	}

	async depositSol(amount: string, depositor: string): Promise<ethers.ContractReceipt> {
		this.checkEthAddress(depositor, this._chainId);
		this.checkAmount(parseFloat(amount));

		const depositorBuf = Buffer.from(depositor);
		const parsedAmount = ethers.utils.parseUnits(amount, WSOL_DECIMALS);

		return (await this._contract.process_deposit_sol(parsedAmount, depositorBuf, this.ArbitaryFee)).wait();
	}

	async depositToken(amount: string, depositor: string, tokenMint: string): Promise<ethers.ContractReceipt> {
		this.checkEthAddress(depositor, this._chainId);
		this.checkSolanaAddress(tokenMint);
		this.checkAmount(parseFloat(amount));

		const depositorBuf = Buffer.from(depositor);
		const tokenMintBuf = Buffer.from(tryNativeToUint8Array(tokenMint, "solana"));
		const decimals = await getDecimals(tokenMint);
		const parsedAmount = ethers.utils.parseUnits(amount, decimals);

		// await
		return (
			await this._contract.process_deposit_token(parsedAmount, depositorBuf, tokenMintBuf, this.ArbitaryFee, {
				gasLimit: "200000",
				value: this.ArbitaryFee,
			})
		).wait();
	}

	async withdrawSol(amount: string, sender: string): Promise<ContractReceipt> {
		this.checkAmount(parseFloat(amount));
		this.checkEthAddress(sender, this._chainId);

		const senderBuf = Buffer.from(sender);
		const parsedAmount = ethers.utils.parseUnits(amount, WSOL_DECIMALS);

		return (
			await this._contract.process_native_withdrawal(parsedAmount, senderBuf, this.ArbitaryFee, {
				value: this.ArbitaryFee,
			})
		).wait();
	}

	async withdrawToken(amount: string, sender: string, tokenMint: string): Promise<ContractReceipt> {
		this.checkEthAddress(sender, this._chainId);
		this.checkSolanaAddress(tokenMint);

		const decimals = await getDecimals(tokenMint);
		const parsedAmount = ethers.utils.parseUnits(amount, decimals);
		const senderBuf = Buffer.from(sender);
		const tokenMintBuf = Buffer.from(tryNativeToUint8Array(tokenMint, "solana"));

		return (
			await this._contract.process_token_withdrawal(parsedAmount, senderBuf, tokenMintBuf, this.ArbitaryFee, {
				value: this.ArbitaryFee,
			})
		).wait();
	}

	async startSolStream(
		startTime: string,
		endTime: string,
		amount: string,
		receiver: string,
		sender: string,
		canCancel: boolean,
		canUpdate: boolean,
	): Promise<ethers.ContractReceipt> {
		this.checkEthAddress(receiver, this._chainId);
		this.checkEthAddress(sender, this._chainId);
		this.checkAmount(parseFloat(amount));
		this.checkStartTimeAndEndTime(parseInt(startTime), parseInt(endTime));

		const receiverBuf = Buffer.from(receiver);
		const senderBuf = Buffer.from(sender);
		const parsedAmount = ethers.utils.parseUnits(amount, WSOL_DECIMALS);
		const parsedStartTime = BigNumber.from(startTime);
		const parsedEndTime = BigNumber.from(endTime);
		const cancel = BigNumber.from(+canCancel);
		const update = BigNumber.from(+canUpdate);

		return (
			await this._contract.process_native_stream(
				parsedStartTime,
				parsedEndTime,
				parsedAmount,
				receiverBuf,
				senderBuf,
				cancel,
				update,
				this.ArbitaryFee,
				{
					value: this.ArbitaryFee,
				},
			)
		).wait();
	}

	async startTokenStream(
		startTime: string,
		endTime: string,
		amount: string,
		receiver: string,
		sender: string,
		canCancel: boolean,
		canUpdate: boolean,
		tokenMint: string,
	): Promise<ethers.ContractReceipt> {
		// this.checkEthAddress(receiver, this._chainId);
		// this.checkEthAddress(sender, this._chainId);
		this.checkSolanaAddress(tokenMint);
		this.checkAmount(parseFloat(amount));
		this.checkStartTimeAndEndTime(parseInt(startTime), parseInt(endTime));

		const receiverBuf = Buffer.from(receiver);
		const senderBuf = Buffer.from(sender);
		const tokenMintBuf = Buffer.from(tryNativeToUint8Array(tokenMint, "solana"));
		const decimals = await getDecimals(tokenMint);
		const parsedAmount = ethers.utils.parseUnits(amount, decimals);
		const parsedStartTime = BigNumber.from(startTime);
		const parsedEndTime = BigNumber.from(endTime);
		const parsedCanCancel = BigNumber.from(+canCancel);
		const parsedCanUpdate = BigNumber.from(+canUpdate);

		return (
			await this._contract.process_token_stream(
				parsedStartTime,
				parsedEndTime,
				parsedAmount,
				receiverBuf,
				senderBuf,
				parsedCanCancel,
				parsedCanUpdate,
				tokenMintBuf,
				this.ArbitaryFee,
				{
					gasLimit: "200000",
					value: this.ArbitaryFee,
				},
			)
		).wait();
	}

	async updateSolStream(
		startTime: string,
		endTime: string,
		amount: string,
		receiver: string,
		sender: string,
		dataAccount: string,
	): Promise<ethers.ContractReceipt> {
		this.checkEthAddress(receiver, this._chainId);
		this.checkEthAddress(sender, this._chainId);
		this.checkSolanaAddress(dataAccount);
		this.checkAmount(parseFloat(amount));
		this.checkStartTimeAndEndTime(parseInt(startTime), parseInt(endTime));

		const receiverBuf = Buffer.from(receiver);
		const senderBuf = Buffer.from(sender);
		const dataAccountBuf = Buffer.from(tryNativeToUint8Array(dataAccount, "solana")); // dataAccount is required but it is not implemented in solana client side
		const parsedAmount = ethers.utils.parseUnits(amount);
		const parsedStartTime = BigNumber.from(startTime);
		const parsedEndTime = BigNumber.from(endTime);

		return (
			await this._contract.process_native_stream_update(
				parsedStartTime,
				parsedEndTime,
				parsedAmount,
				receiverBuf,
				senderBuf,
				// dataAccountBuf
				this.ArbitaryFee,
				{
					value: this.ArbitaryFee,
				},
			)
		).wait();
	}

	async updateTokenStream(
		startTime: string,
		endTime: string,
		amount: string,
		receiver: string,
		sender: string,
		tokenMint: string,
		dataAccount: string,
	): Promise<ethers.ContractReceipt> {
		this.checkEthAddress(receiver, this._chainId);
		this.checkEthAddress(sender, this._chainId);
		this.checkAmount(parseFloat(amount));
		this.checkSolanaAddress(tokenMint);
		this.checkSolanaAddress(dataAccount);
		this.checkStartTimeAndEndTime(parseInt(startTime), parseInt(endTime));

		const parsedStartTime = BigNumber.from(startTime);
		const parsedEndTime = BigNumber.from(endTime);
		const decimals = await getDecimals(tokenMint);
		const parsedAmount = ethers.utils.parseUnits(amount, decimals);
		const receiverBuf = Buffer.from(receiver);
		const senderBuf = Buffer.from(sender);
		const tokenMintBuf = Buffer.from(tryNativeToUint8Array(tokenMint, "solana"));
		const dataAccountBuf = Buffer.from(tryNativeToUint8Array(dataAccount, "solana"));

		return (
			await this._contract.process_token_stream_update(
				parsedStartTime,
				parsedEndTime,
				parsedAmount,
				receiverBuf,
				senderBuf,
				tokenMintBuf,
				dataAccountBuf,
				this.ArbitaryFee,
				{
					value: this.ArbitaryFee,
				},
			)
		).wait();
	}

	async withdrawFromSolStream(sender: string, withdrawer: string, dataAccount: string): Promise<ContractReceipt> {
		this.checkEthAddress(sender, this._chainId);
		this.checkEthAddress(withdrawer, this._chainId);
		this.checkSolanaAddress(dataAccount);

		const senderBuf = Buffer.from(sender);
		const withdrawerBuf = Buffer.from(withdrawer);
		const dataAccountBuf = Buffer.from(tryNativeToUint8Array(dataAccount, "solana"));

		return (await this._contract.process_native_withdraw_stream(withdrawerBuf, this.ArbitaryFee)).wait();
	}

	async withdrawFromTokenStream(
		sender: string,
		withdrawer: string,
		tokenMint: string,
		dataAccount: string,
	): Promise<ContractReceipt> {
		// this.checkEthAddress(sender, this._chainId);
		// this.checkEthAddress(withdrawer, this._chainId);
		this.checkSolanaAddress(dataAccount);
		this.checkSolanaAddress(tokenMint);

		const senderBuf = Buffer.from(sender);
		const withdrawerBuf = Buffer.from(withdrawer);
		const tokenMintBuf = Buffer.from(tryNativeToUint8Array(tokenMint, "solana"));
		const dataAccountBuf = Buffer.from(tryNativeToUint8Array(dataAccount, "solana"));

		return (
			await this._contract.process_token_withdraw_stream(
				withdrawerBuf,
				tokenMintBuf,
				senderBuf,
				dataAccountBuf,
				this.ArbitaryFee,
				{ gasLimit: "100000", value: this.ArbitaryFee },
			)
		).wait();
	}

	async cancelSolStream(sender: string, dataAccount: string): Promise<ContractReceipt> {
		this.checkEthAddress(sender, this._chainId);
		this.checkSolanaAddress(dataAccount);

		const senderBuf = Buffer.from(sender);
		const dataAccountBuf = Buffer.from(tryNativeToUint8Array(dataAccount, "solana"));

		return (await this._contract.process_cancel_native_stream(senderBuf, this.ArbitaryFee)).wait();
	}

	async cancelTokenStream(
		sender: string,
		receiver: string,
		tokenMint: string,
		dataAccount: string,
	): Promise<ContractReceipt> {
		this.checkEthAddress(sender, this._chainId);
		this.checkEthAddress(receiver, this._chainId);
		this.checkSolanaAddress(dataAccount);
		this.checkSolanaAddress(tokenMint);

		const senderBuf = Buffer.from(sender);
		const receiverBuf = Buffer.from(receiver);
		const dataAccountBuf = Buffer.from(tryNativeToUint8Array(dataAccount, "solana"));
		const tokenMintBuf = Buffer.from(tryNativeToUint8Array(tokenMint, "solana"));

		return (
			await this._contract.process_cancel_token_stream(
				senderBuf,
				tokenMintBuf,
				receiverBuf,
				dataAccountBuf,
				this.ArbitaryFee,
				{
					value: this.ArbitaryFee,
				},
			)
		).wait();
	}

	async pauseSolStream(sender: string, dataAccount: string): Promise<ContractReceipt> {
		this.checkEthAddress(sender, this._chainId);
		this.checkSolanaAddress(dataAccount);

		const senderBuf = Buffer.from(sender);
		const dataAccountBuf = Buffer.from(tryNativeToUint8Array(dataAccount, "solana"));

		return (
			await this._contract.process_pause_native_stream(senderBuf, this.ArbitaryFee, {
				value: this.ArbitaryFee,
			})
		).wait();
	}

	async pauseTokenStream(
		sender: string,
		receiver: string,
		tokenMint: string,
		dataAccount: string,
	): Promise<ContractReceipt> {
		this.checkEthAddress(sender, this._chainId);
		this.checkEthAddress(receiver, this._chainId);
		this.checkSolanaAddress(dataAccount);
		this.checkSolanaAddress(tokenMint);

		const senderBuf = Buffer.from(sender);
		const receiverBuf = Buffer.from(receiver);
		const dataAccountBuf = Buffer.from(tryNativeToUint8Array(dataAccount, "solana"));
		const tokenMintBuf = Buffer.from(tryNativeToUint8Array(tokenMint, "solana"));

		return (
			await this._contract.process_pause_token_stream(
				senderBuf,
				tokenMintBuf,
				receiverBuf,
				dataAccountBuf,
				this.ArbitaryFee,
				{
					value: this.ArbitaryFee,
				},
			)
		).wait();
	}

	async instantSolTransfer(amount: string, sender: string, withdrawer: string): Promise<ContractReceipt> {
		this.checkAmount(parseFloat(amount));
		this.checkEthAddress(sender, this._chainId);
		this.checkEthAddress(withdrawer, this._chainId);
		const parsedAmount = ethers.utils.parseUnits(amount, WSOL_DECIMALS);
		const senderBuf = Buffer.from(sender);
		const withdrawerBuf = Buffer.from(withdrawer);

		return (
			await this._contract.process_instant_native_transfer(parsedAmount, senderBuf, withdrawerBuf, this.ArbitaryFee, {
				value: this.ArbitaryFee,
			})
		).wait();
	}

	async instantTokenTransfer(
		amount: string,
		sender: string,
		withdrawer: string,
		tokenMint: string,
	): Promise<ContractReceipt> {
		this.checkAmount(parseFloat(amount));
		this.checkEthAddress(sender, this._chainId);
		this.checkEthAddress(withdrawer, this._chainId);
		this.checkSolanaAddress(tokenMint);

		const decimals = await getDecimals(tokenMint);
		const parsedAmount = ethers.utils.parseUnits(amount, decimals);
		const senderBuf = Buffer.from(sender);
		const withdrawerBuf = Buffer.from(withdrawer);
		const tokenMintBuf = Buffer.from(tryNativeToUint8Array(tokenMint, "solana"));

		return (
			await this._contract.process_instant_token_transfer(
				parsedAmount,
				senderBuf,
				withdrawerBuf,
				tokenMintBuf,
				this.ArbitaryFee,
				{
					value: this.ArbitaryFee,
				},
			)
		).wait();
	}

	/**
	 * Checks if given amount is valid
	 * @param amount
	 * @returns
	 */
	private checkAmount(amount: number) {
		if (amount <= 0) {
			throw new InvalidArgumentError(amount);
		}
		return;
	}

	/**
	 * Checks if given address is valid evm address
	 * @param address
	 * @param chainId
	 * @returns
	 */
	private checkEthAddress(address: string, chainId: EVMChainId) {
		if (!isValidAddress(address, toChainName(chainId))) {
			throw new InvalidArgumentError(address);
		}
		return;
	}

	/**
	 * Checks if given address is valid solana address
	 * @param address
	 * @returns
	 */
	private checkSolanaAddress(address: string) {
		if (!isValidAddress(address, "solana")) {
			throw new InvalidArgumentError(address);
		}
		return;
	}

	/**
	 * Checks if given start time and end time are valid
	 * @param startTime
	 * @param endTime
	 * @returns
	 */
	private checkStartTimeAndEndTime(startTime: number, endTime: number) {
		const now = Math.floor(Date.now() / 1000);
		if (startTime < now) {
			throw new InvalidArgumentError(startTime);
		}
		if (endTime <= startTime) {
			throw new InvalidArgumentError(endTime);
		}
		return;
	}
}
