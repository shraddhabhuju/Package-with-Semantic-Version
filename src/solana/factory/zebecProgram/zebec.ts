export type Zebec = {
	version: "0.1.0";
	name: "zebec";
	instructions: [
		{
			name: "createFeeAccount";
			accounts: [
				{
					name: "feeVault";
					isMut: true;
					isSigner: false;
				},
				{
					name: "feeVaultData";
					isMut: true;
					isSigner: false;
				},
				{
					name: "feeOwner";
					isMut: true;
					isSigner: true;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "rent";
					isMut: false;
					isSigner: false;
				},
			];
			args: [
				{
					name: "feePercentage";
					type: "u64";
				},
			];
		},
		{
			name: "withdrawFeesToken";
			accounts: [
				{
					name: "feeOwner";
					isMut: true;
					isSigner: true;
				},
				{
					name: "feeVaultData";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVault";
					isMut: true;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "tokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "associatedTokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "rent";
					isMut: false;
					isSigner: false;
				},
				{
					name: "mint";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeReceiverVaultTokenAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "feeOwnerTokenAccount";
					isMut: true;
					isSigner: false;
				},
			];
			args: [];
		},
		{
			name: "withdrawFeesSol";
			accounts: [
				{
					name: "feeOwner";
					isMut: true;
					isSigner: true;
				},
				{
					name: "feeVaultData";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVault";
					isMut: true;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "rent";
					isMut: false;
					isSigner: false;
				},
			];
			args: [];
		},
		{
			name: "depositSol";
			accounts: [
				{
					name: "zebecVault";
					isMut: true;
					isSigner: false;
				},
				{
					name: "sender";
					isMut: true;
					isSigner: true;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
			];
			args: [
				{
					name: "amount";
					type: "u64";
				},
			];
		},
		{
			name: "nativeStream";
			accounts: [
				{
					name: "dataAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "withdrawData";
					isMut: true;
					isSigner: false;
				},
				{
					name: "feeOwner";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVaultData";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVault";
					isMut: false;
					isSigner: false;
				},
				{
					name: "sender";
					isMut: true;
					isSigner: true;
				},
				{
					name: "receiver";
					isMut: false;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
			];
			args: [
				{
					name: "startTime";
					type: "u64";
				},
				{
					name: "endTime";
					type: "u64";
				},
				{
					name: "amount";
					type: "u64";
				},
				{
					name: "canCancel";
					type: "bool";
				},
				{
					name: "canUpdate";
					type: "bool";
				},
			];
		},
		{
			name: "nativeStreamUpdate";
			accounts: [
				{
					name: "dataAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "withdrawData";
					isMut: true;
					isSigner: false;
				},
				{
					name: "sender";
					isMut: true;
					isSigner: true;
				},
				{
					name: "receiver";
					isMut: false;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
			];
			args: [
				{
					name: "startTime";
					type: "u64";
				},
				{
					name: "endTime";
					type: "u64";
				},
				{
					name: "amount";
					type: "u64";
				},
			];
		},
		{
			name: "withdrawStream";
			accounts: [
				{
					name: "zebecVault";
					isMut: true;
					isSigner: false;
				},
				{
					name: "sender";
					isMut: true;
					isSigner: false;
				},
				{
					name: "receiver";
					isMut: true;
					isSigner: true;
				},
				{
					name: "dataAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "withdrawData";
					isMut: true;
					isSigner: false;
				},
				{
					name: "feeOwner";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVaultData";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVault";
					isMut: true;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
			];
			args: [];
		},
		{
			name: "pauseStream";
			accounts: [
				{
					name: "sender";
					isMut: false;
					isSigner: true;
				},
				{
					name: "receiver";
					isMut: false;
					isSigner: false;
				},
				{
					name: "dataAccount";
					isMut: true;
					isSigner: false;
				},
			];
			args: [];
		},
		{
			name: "cancelStream";
			accounts: [
				{
					name: "zebecVault";
					isMut: true;
					isSigner: false;
				},
				{
					name: "sender";
					isMut: true;
					isSigner: true;
				},
				{
					name: "receiver";
					isMut: true;
					isSigner: false;
				},
				{
					name: "dataAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "withdrawData";
					isMut: true;
					isSigner: false;
				},
				{
					name: "feeOwner";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVaultData";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVault";
					isMut: true;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
			];
			args: [];
		},
		{
			name: "instantNativeTransfer";
			accounts: [
				{
					name: "zebecVault";
					isMut: true;
					isSigner: false;
				},
				{
					name: "sender";
					isMut: true;
					isSigner: true;
				},
				{
					name: "receiver";
					isMut: true;
					isSigner: false;
				},
				{
					name: "withdrawData";
					isMut: true;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
			];
			args: [
				{
					name: "amount";
					type: "u64";
				},
			];
		},
		{
			name: "nativeWithdrawal";
			accounts: [
				{
					name: "zebecVault";
					isMut: true;
					isSigner: false;
				},
				{
					name: "sender";
					isMut: true;
					isSigner: true;
				},
				{
					name: "withdrawData";
					isMut: true;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
			];
			args: [
				{
					name: "amount";
					type: "u64";
				},
			];
		},
		{
			name: "sendSolDirectly";
			accounts: [
				{
					name: "sender";
					isMut: true;
					isSigner: true;
				},
				{
					name: "receiver";
					isMut: true;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
			];
			args: [
				{
					name: "amount";
					type: "u64";
				},
			];
		},
		{
			name: "depositToken";
			accounts: [
				{
					name: "zebecVault";
					isMut: true;
					isSigner: false;
				},
				{
					name: "sourceAccount";
					isMut: true;
					isSigner: true;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "tokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "associatedTokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "rent";
					isMut: false;
					isSigner: false;
				},
				{
					name: "mint";
					isMut: false;
					isSigner: false;
				},
				{
					name: "sourceAccountTokenAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "pdaAccountTokenAccount";
					isMut: true;
					isSigner: false;
				},
			];
			args: [
				{
					name: "amount";
					type: "u64";
				},
			];
		},
		{
			name: "tokenStream";
			accounts: [
				{
					name: "dataAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "withdrawData";
					isMut: true;
					isSigner: false;
				},
				{
					name: "feeOwner";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVaultData";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVault";
					isMut: false;
					isSigner: false;
				},
				{
					name: "sourceAccount";
					isMut: true;
					isSigner: true;
				},
				{
					name: "destAccount";
					isMut: false;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "tokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "mint";
					isMut: false;
					isSigner: false;
				},
				{
					name: "rent";
					isMut: false;
					isSigner: false;
				},
			];
			args: [
				{
					name: "startTime";
					type: "u64";
				},
				{
					name: "endTime";
					type: "u64";
				},
				{
					name: "amount";
					type: "u64";
				},
				{
					name: "canCancel";
					type: "bool";
				},
				{
					name: "canUpdate";
					type: "bool";
				},
			];
		},
		{
			name: "tokenStreamUpdate";
			accounts: [
				{
					name: "dataAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "withdrawData";
					isMut: true;
					isSigner: false;
				},
				{
					name: "sourceAccount";
					isMut: true;
					isSigner: true;
				},
				{
					name: "destAccount";
					isMut: false;
					isSigner: false;
				},
				{
					name: "mint";
					isMut: false;
					isSigner: false;
				},
			];
			args: [
				{
					name: "startTime";
					type: "u64";
				},
				{
					name: "endTime";
					type: "u64";
				},
				{
					name: "amount";
					type: "u64";
				},
			];
		},
		{
			name: "withdrawTokenStream";
			accounts: [
				{
					name: "zebecVault";
					isMut: false;
					isSigner: false;
				},
				{
					name: "destAccount";
					isMut: true;
					isSigner: true;
				},
				{
					name: "sourceAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "feeOwner";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVaultData";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVault";
					isMut: false;
					isSigner: false;
				},
				{
					name: "dataAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "withdrawData";
					isMut: true;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "tokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "associatedTokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "rent";
					isMut: false;
					isSigner: false;
				},
				{
					name: "mint";
					isMut: false;
					isSigner: false;
				},
				{
					name: "pdaAccountTokenAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "destTokenAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "feeReceiverTokenAccount";
					isMut: true;
					isSigner: false;
				},
			];
			args: [];
		},
		{
			name: "pauseResumeTokenStream";
			accounts: [
				{
					name: "sender";
					isMut: true;
					isSigner: true;
				},
				{
					name: "receiver";
					isMut: false;
					isSigner: false;
				},
				{
					name: "dataAccount";
					isMut: true;
					isSigner: false;
				},
			];
			args: [];
		},
		{
			name: "cancelTokenStream";
			accounts: [
				{
					name: "zebecVault";
					isMut: false;
					isSigner: false;
				},
				{
					name: "destAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "sourceAccount";
					isMut: true;
					isSigner: true;
				},
				{
					name: "feeOwner";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVaultData";
					isMut: false;
					isSigner: false;
				},
				{
					name: "feeVault";
					isMut: false;
					isSigner: false;
				},
				{
					name: "dataAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "withdrawData";
					isMut: true;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "tokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "associatedTokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "rent";
					isMut: false;
					isSigner: false;
				},
				{
					name: "mint";
					isMut: false;
					isSigner: false;
				},
				{
					name: "pdaAccountTokenAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "destTokenAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "feeReceiverTokenAccount";
					isMut: true;
					isSigner: false;
				},
			];
			args: [];
		},
		{
			name: "instantTokenTransfer";
			accounts: [
				{
					name: "zebecVault";
					isMut: false;
					isSigner: false;
				},
				{
					name: "destAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "sourceAccount";
					isMut: true;
					isSigner: true;
				},
				{
					name: "withdrawData";
					isMut: true;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "tokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "associatedTokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "rent";
					isMut: false;
					isSigner: false;
				},
				{
					name: "mint";
					isMut: false;
					isSigner: false;
				},
				{
					name: "pdaAccountTokenAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "destTokenAccount";
					isMut: true;
					isSigner: false;
				},
			];
			args: [
				{
					name: "amount";
					type: "u64";
				},
			];
		},
		{
			name: "tokenWithdrawal";
			accounts: [
				{
					name: "zebecVault";
					isMut: false;
					isSigner: false;
				},
				{
					name: "withdrawData";
					isMut: true;
					isSigner: false;
				},
				{
					name: "sourceAccount";
					isMut: true;
					isSigner: true;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "tokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "associatedTokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "rent";
					isMut: false;
					isSigner: false;
				},
				{
					name: "mint";
					isMut: false;
					isSigner: false;
				},
				{
					name: "sourceAccountTokenAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "pdaAccountTokenAccount";
					isMut: true;
					isSigner: false;
				},
			];
			args: [
				{
					name: "amount";
					type: "u64";
				},
			];
		},
		{
			name: "sendTokenDirectly";
			accounts: [
				{
					name: "sourceAccount";
					isMut: true;
					isSigner: true;
				},
				{
					name: "destAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "systemProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "tokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "associatedTokenProgram";
					isMut: false;
					isSigner: false;
				},
				{
					name: "rent";
					isMut: false;
					isSigner: false;
				},
				{
					name: "mint";
					isMut: false;
					isSigner: false;
				},
				{
					name: "sourceAccountTokenAccount";
					isMut: true;
					isSigner: false;
				},
				{
					name: "destTokenAccount";
					isMut: true;
					isSigner: false;
				},
			];
			args: [
				{
					name: "amount";
					type: "u64";
				},
			];
		},
	];
	accounts: [
		{
			name: "feeVaultData";
			type: {
				kind: "struct";
				fields: [
					{
						name: "feeVaultAddress";
						type: "publicKey";
					},
					{
						name: "feeOwner";
						type: "publicKey";
					},
					{
						name: "feePercentage";
						type: "u64";
					},
				];
			};
		},
		{
			name: "stream";
			type: {
				kind: "struct";
				fields: [
					{
						name: "startTime";
						type: "u64";
					},
					{
						name: "endTime";
						type: "u64";
					},
					{
						name: "amount";
						type: "u64";
					},
					{
						name: "paused";
						type: "u64";
					},
					{
						name: "withdrawLimit";
						type: "u64";
					},
					{
						name: "sender";
						type: "publicKey";
					},
					{
						name: "receiver";
						type: "publicKey";
					},
					{
						name: "withdrawn";
						type: "u64";
					},
					{
						name: "pausedAt";
						type: "u64";
					},
					{
						name: "feeOwner";
						type: "publicKey";
					},
					{
						name: "pausedAmt";
						type: "u64";
					},
					{
						name: "canCancel";
						type: "bool";
					},
					{
						name: "canUpdate";
						type: "bool";
					},
				];
			};
		},
		{
			name: "solWithdaw";
			type: {
				kind: "struct";
				fields: [
					{
						name: "amount";
						type: "u64";
					},
				];
			};
		},
		{
			name: "streamToken";
			type: {
				kind: "struct";
				fields: [
					{
						name: "startTime";
						type: "u64";
					},
					{
						name: "endTime";
						type: "u64";
					},
					{
						name: "paused";
						type: "u64";
					},
					{
						name: "withdrawLimit";
						type: "u64";
					},
					{
						name: "amount";
						type: "u64";
					},
					{
						name: "sender";
						type: "publicKey";
					},
					{
						name: "receiver";
						type: "publicKey";
					},
					{
						name: "tokenMint";
						type: "publicKey";
					},
					{
						name: "withdrawn";
						type: "u64";
					},
					{
						name: "pausedAt";
						type: "u64";
					},
					{
						name: "feeOwner";
						type: "publicKey";
					},
					{
						name: "pausedAmt";
						type: "u64";
					},
					{
						name: "canCancel";
						type: "bool";
					},
					{
						name: "canUpdate";
						type: "bool";
					},
				];
			};
		},
		{
			name: "tokenWithdraw";
			type: {
				kind: "struct";
				fields: [
					{
						name: "amount";
						type: "u64";
					},
				];
			};
		},
	];
	errors: [
		{
			code: 6000;
			name: "NotRentExempt";
			msg: "Lamport balance below rent-exempt threshold";
		},
		{
			code: 6001;
			name: "EscrowMismatch";
			msg: "Account not associated with this Escrow";
		},
		{
			code: 6002;
			name: "OwnerMismatch";
			msg: "Owner does not match";
		},
		{
			code: 6003;
			name: "InvalidInstruction";
			msg: "Invalid instruction";
		},
		{
			code: 6004;
			name: "TimeEnd";
			msg: "Time has already passed";
		},
		{
			code: 6005;
			name: "StartTimeOverFlow";
			msg: "Start time cannot be equal to end time";
		},
		{
			code: 6006;
			name: "AlreadyCancel";
			msg: "Stream already cancelled";
		},
		{
			code: 6007;
			name: "AlreadyWithdrawn";
			msg: "Paused stream, streamed amount already withdrawn";
		},
		{
			code: 6008;
			name: "Overflow";
			msg: "Operation overflowed";
		},
		{
			code: 6009;
			name: "PublicKeyMismatch";
			msg: "Public key mismatched";
		},
		{
			code: 6010;
			name: "AlreadyPaused";
			msg: "Transaction is already paused";
		},
		{
			code: 6011;
			name: "AlreadyResumed";
			msg: "Transaction is not paused";
		},
		{
			code: 6012;
			name: "StreamAlreadyCreated";
			msg: "Stream Already Created";
		},
		{
			code: 6013;
			name: "StreamNotStarted";
			msg: "Stream has not been started";
		},
		{
			code: 6014;
			name: "StreamAlreadyCompleted";
			msg: "Stream already completed";
		},
		{
			code: 6015;
			name: "StreamedAmt";
			msg: "Cannot withdraw streaming amount";
		},
		{
			code: 6016;
			name: "CancelNotAllowed";
			msg: "cannot cancel this transaction";
		},
		{
			code: 6017;
			name: "InsufficientFunds";
			msg: "An account's balance was too small to complete the instruction";
		},
		{
			code: 6018;
			name: "AlreadyWithdrawnStreamingAmount";
			msg: "Already Withdrawn streamed amount";
		},
		{
			code: 6019;
			name: "NumericalOverflow";
			msg: "NumericalOverflow";
		},
		{
			code: 6020;
			name: "PausedAmountExceeds";
			msg: "PausedAmountExceeds";
		},
		{
			code: 6021;
			name: "StreamAlreadyStarted";
			msg: "StreamAlreadyStarted";
		},
		{
			code: 6022;
			name: "UpdateNotAllowed";
			msg: "UpdateNotAllowed";
		},
		{
			code: 6023;
			name: "OutOfBound";
			msg: "OutOfBound";
		},
	];
	metadata: {
		address: "string";
	};
};

export const IDL: Zebec = {
	version: "0.1.0",
	name: "zebec",
	instructions: [
		{
			name: "createFeeAccount",
			accounts: [
				{
					name: "feeVault",
					isMut: true,
					isSigner: false,
				},
				{
					name: "feeVaultData",
					isMut: true,
					isSigner: false,
				},
				{
					name: "feeOwner",
					isMut: true,
					isSigner: true,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "rent",
					isMut: false,
					isSigner: false,
				},
			],
			args: [
				{
					name: "feePercentage",
					type: "u64",
				},
			],
		},
		{
			name: "withdrawFeesToken",
			accounts: [
				{
					name: "feeOwner",
					isMut: true,
					isSigner: true,
				},
				{
					name: "feeVaultData",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVault",
					isMut: true,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "tokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "associatedTokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "rent",
					isMut: false,
					isSigner: false,
				},
				{
					name: "mint",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeReceiverVaultTokenAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "feeOwnerTokenAccount",
					isMut: true,
					isSigner: false,
				},
			],
			args: [],
		},
		{
			name: "withdrawFeesSol",
			accounts: [
				{
					name: "feeOwner",
					isMut: true,
					isSigner: true,
				},
				{
					name: "feeVaultData",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVault",
					isMut: true,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "rent",
					isMut: false,
					isSigner: false,
				},
			],
			args: [],
		},
		{
			name: "depositSol",
			accounts: [
				{
					name: "zebecVault",
					isMut: true,
					isSigner: false,
				},
				{
					name: "sender",
					isMut: true,
					isSigner: true,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
			],
			args: [
				{
					name: "amount",
					type: "u64",
				},
			],
		},
		{
			name: "nativeStream",
			accounts: [
				{
					name: "dataAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "withdrawData",
					isMut: true,
					isSigner: false,
				},
				{
					name: "feeOwner",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVaultData",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVault",
					isMut: false,
					isSigner: false,
				},
				{
					name: "sender",
					isMut: true,
					isSigner: true,
				},
				{
					name: "receiver",
					isMut: false,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
			],
			args: [
				{
					name: "startTime",
					type: "u64",
				},
				{
					name: "endTime",
					type: "u64",
				},
				{
					name: "amount",
					type: "u64",
				},
				{
					name: "canCancel",
					type: "bool",
				},
				{
					name: "canUpdate",
					type: "bool",
				},
			],
		},
		{
			name: "nativeStreamUpdate",
			accounts: [
				{
					name: "dataAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "withdrawData",
					isMut: true,
					isSigner: false,
				},
				{
					name: "sender",
					isMut: true,
					isSigner: true,
				},
				{
					name: "receiver",
					isMut: false,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
			],
			args: [
				{
					name: "startTime",
					type: "u64",
				},
				{
					name: "endTime",
					type: "u64",
				},
				{
					name: "amount",
					type: "u64",
				},
			],
		},
		{
			name: "withdrawStream",
			accounts: [
				{
					name: "zebecVault",
					isMut: true,
					isSigner: false,
				},
				{
					name: "sender",
					isMut: true,
					isSigner: false,
				},
				{
					name: "receiver",
					isMut: true,
					isSigner: true,
				},
				{
					name: "dataAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "withdrawData",
					isMut: true,
					isSigner: false,
				},
				{
					name: "feeOwner",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVaultData",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVault",
					isMut: true,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
			],
			args: [],
		},
		{
			name: "pauseStream",
			accounts: [
				{
					name: "sender",
					isMut: false,
					isSigner: true,
				},
				{
					name: "receiver",
					isMut: false,
					isSigner: false,
				},
				{
					name: "dataAccount",
					isMut: true,
					isSigner: false,
				},
			],
			args: [],
		},
		{
			name: "cancelStream",
			accounts: [
				{
					name: "zebecVault",
					isMut: true,
					isSigner: false,
				},
				{
					name: "sender",
					isMut: true,
					isSigner: true,
				},
				{
					name: "receiver",
					isMut: true,
					isSigner: false,
				},
				{
					name: "dataAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "withdrawData",
					isMut: true,
					isSigner: false,
				},
				{
					name: "feeOwner",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVaultData",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVault",
					isMut: true,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
			],
			args: [],
		},
		{
			name: "instantNativeTransfer",
			accounts: [
				{
					name: "zebecVault",
					isMut: true,
					isSigner: false,
				},
				{
					name: "sender",
					isMut: true,
					isSigner: true,
				},
				{
					name: "receiver",
					isMut: true,
					isSigner: false,
				},
				{
					name: "withdrawData",
					isMut: true,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
			],
			args: [
				{
					name: "amount",
					type: "u64",
				},
			],
		},
		{
			name: "nativeWithdrawal",
			accounts: [
				{
					name: "zebecVault",
					isMut: true,
					isSigner: false,
				},
				{
					name: "sender",
					isMut: true,
					isSigner: true,
				},
				{
					name: "withdrawData",
					isMut: true,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
			],
			args: [
				{
					name: "amount",
					type: "u64",
				},
			],
		},
		{
			name: "sendSolDirectly",
			accounts: [
				{
					name: "sender",
					isMut: true,
					isSigner: true,
				},
				{
					name: "receiver",
					isMut: true,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
			],
			args: [
				{
					name: "amount",
					type: "u64",
				},
			],
		},
		{
			name: "depositToken",
			accounts: [
				{
					name: "zebecVault",
					isMut: true,
					isSigner: false,
				},
				{
					name: "sourceAccount",
					isMut: true,
					isSigner: true,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "tokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "associatedTokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "rent",
					isMut: false,
					isSigner: false,
				},
				{
					name: "mint",
					isMut: false,
					isSigner: false,
				},
				{
					name: "sourceAccountTokenAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "pdaAccountTokenAccount",
					isMut: true,
					isSigner: false,
				},
			],
			args: [
				{
					name: "amount",
					type: "u64",
				},
			],
		},
		{
			name: "tokenStream",
			accounts: [
				{
					name: "dataAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "withdrawData",
					isMut: true,
					isSigner: false,
				},
				{
					name: "feeOwner",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVaultData",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVault",
					isMut: false,
					isSigner: false,
				},
				{
					name: "sourceAccount",
					isMut: true,
					isSigner: true,
				},
				{
					name: "destAccount",
					isMut: false,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "tokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "mint",
					isMut: false,
					isSigner: false,
				},
				{
					name: "rent",
					isMut: false,
					isSigner: false,
				},
			],
			args: [
				{
					name: "startTime",
					type: "u64",
				},
				{
					name: "endTime",
					type: "u64",
				},
				{
					name: "amount",
					type: "u64",
				},
				{
					name: "canCancel",
					type: "bool",
				},
				{
					name: "canUpdate",
					type: "bool",
				},
			],
		},
		{
			name: "tokenStreamUpdate",
			accounts: [
				{
					name: "dataAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "withdrawData",
					isMut: true,
					isSigner: false,
				},
				{
					name: "sourceAccount",
					isMut: true,
					isSigner: true,
				},
				{
					name: "destAccount",
					isMut: false,
					isSigner: false,
				},
				{
					name: "mint",
					isMut: false,
					isSigner: false,
				},
			],
			args: [
				{
					name: "startTime",
					type: "u64",
				},
				{
					name: "endTime",
					type: "u64",
				},
				{
					name: "amount",
					type: "u64",
				},
			],
		},
		{
			name: "withdrawTokenStream",
			accounts: [
				{
					name: "zebecVault",
					isMut: false,
					isSigner: false,
				},
				{
					name: "destAccount",
					isMut: true,
					isSigner: true,
				},
				{
					name: "sourceAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "feeOwner",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVaultData",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVault",
					isMut: false,
					isSigner: false,
				},
				{
					name: "dataAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "withdrawData",
					isMut: true,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "tokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "associatedTokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "rent",
					isMut: false,
					isSigner: false,
				},
				{
					name: "mint",
					isMut: false,
					isSigner: false,
				},
				{
					name: "pdaAccountTokenAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "destTokenAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "feeReceiverTokenAccount",
					isMut: true,
					isSigner: false,
				},
			],
			args: [],
		},
		{
			name: "pauseResumeTokenStream",
			accounts: [
				{
					name: "sender",
					isMut: true,
					isSigner: true,
				},
				{
					name: "receiver",
					isMut: false,
					isSigner: false,
				},
				{
					name: "dataAccount",
					isMut: true,
					isSigner: false,
				},
			],
			args: [],
		},
		{
			name: "cancelTokenStream",
			accounts: [
				{
					name: "zebecVault",
					isMut: false,
					isSigner: false,
				},
				{
					name: "destAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "sourceAccount",
					isMut: true,
					isSigner: true,
				},
				{
					name: "feeOwner",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVaultData",
					isMut: false,
					isSigner: false,
				},
				{
					name: "feeVault",
					isMut: false,
					isSigner: false,
				},
				{
					name: "dataAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "withdrawData",
					isMut: true,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "tokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "associatedTokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "rent",
					isMut: false,
					isSigner: false,
				},
				{
					name: "mint",
					isMut: false,
					isSigner: false,
				},
				{
					name: "pdaAccountTokenAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "destTokenAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "feeReceiverTokenAccount",
					isMut: true,
					isSigner: false,
				},
			],
			args: [],
		},
		{
			name: "instantTokenTransfer",
			accounts: [
				{
					name: "zebecVault",
					isMut: false,
					isSigner: false,
				},
				{
					name: "destAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "sourceAccount",
					isMut: true,
					isSigner: true,
				},
				{
					name: "withdrawData",
					isMut: true,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "tokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "associatedTokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "rent",
					isMut: false,
					isSigner: false,
				},
				{
					name: "mint",
					isMut: false,
					isSigner: false,
				},
				{
					name: "pdaAccountTokenAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "destTokenAccount",
					isMut: true,
					isSigner: false,
				},
			],
			args: [
				{
					name: "amount",
					type: "u64",
				},
			],
		},
		{
			name: "tokenWithdrawal",
			accounts: [
				{
					name: "zebecVault",
					isMut: false,
					isSigner: false,
				},
				{
					name: "withdrawData",
					isMut: true,
					isSigner: false,
				},
				{
					name: "sourceAccount",
					isMut: true,
					isSigner: true,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "tokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "associatedTokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "rent",
					isMut: false,
					isSigner: false,
				},
				{
					name: "mint",
					isMut: false,
					isSigner: false,
				},
				{
					name: "sourceAccountTokenAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "pdaAccountTokenAccount",
					isMut: true,
					isSigner: false,
				},
			],
			args: [
				{
					name: "amount",
					type: "u64",
				},
			],
		},
		{
			name: "sendTokenDirectly",
			accounts: [
				{
					name: "sourceAccount",
					isMut: true,
					isSigner: true,
				},
				{
					name: "destAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "systemProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "tokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "associatedTokenProgram",
					isMut: false,
					isSigner: false,
				},
				{
					name: "rent",
					isMut: false,
					isSigner: false,
				},
				{
					name: "mint",
					isMut: false,
					isSigner: false,
				},
				{
					name: "sourceAccountTokenAccount",
					isMut: true,
					isSigner: false,
				},
				{
					name: "destTokenAccount",
					isMut: true,
					isSigner: false,
				},
			],
			args: [
				{
					name: "amount",
					type: "u64",
				},
			],
		},
	],
	accounts: [
		{
			name: "feeVaultData",
			type: {
				kind: "struct",
				fields: [
					{
						name: "feeVaultAddress",
						type: "publicKey",
					},
					{
						name: "feeOwner",
						type: "publicKey",
					},
					{
						name: "feePercentage",
						type: "u64",
					},
				],
			},
		},
		{
			name: "stream",
			type: {
				kind: "struct",
				fields: [
					{
						name: "startTime",
						type: "u64",
					},
					{
						name: "endTime",
						type: "u64",
					},
					{
						name: "amount",
						type: "u64",
					},
					{
						name: "paused",
						type: "u64",
					},
					{
						name: "withdrawLimit",
						type: "u64",
					},
					{
						name: "sender",
						type: "publicKey",
					},
					{
						name: "receiver",
						type: "publicKey",
					},
					{
						name: "withdrawn",
						type: "u64",
					},
					{
						name: "pausedAt",
						type: "u64",
					},
					{
						name: "feeOwner",
						type: "publicKey",
					},
					{
						name: "pausedAmt",
						type: "u64",
					},
					{
						name: "canCancel",
						type: "bool",
					},
					{
						name: "canUpdate",
						type: "bool",
					},
				],
			},
		},
		{
			name: "solWithdaw",
			type: {
				kind: "struct",
				fields: [
					{
						name: "amount",
						type: "u64",
					},
				],
			},
		},
		{
			name: "streamToken",
			type: {
				kind: "struct",
				fields: [
					{
						name: "startTime",
						type: "u64",
					},
					{
						name: "endTime",
						type: "u64",
					},
					{
						name: "paused",
						type: "u64",
					},
					{
						name: "withdrawLimit",
						type: "u64",
					},
					{
						name: "amount",
						type: "u64",
					},
					{
						name: "sender",
						type: "publicKey",
					},
					{
						name: "receiver",
						type: "publicKey",
					},
					{
						name: "tokenMint",
						type: "publicKey",
					},
					{
						name: "withdrawn",
						type: "u64",
					},
					{
						name: "pausedAt",
						type: "u64",
					},
					{
						name: "feeOwner",
						type: "publicKey",
					},
					{
						name: "pausedAmt",
						type: "u64",
					},
					{
						name: "canCancel",
						type: "bool",
					},
					{
						name: "canUpdate",
						type: "bool",
					},
				],
			},
		},
		{
			name: "tokenWithdraw",
			type: {
				kind: "struct",
				fields: [
					{
						name: "amount",
						type: "u64",
					},
				],
			},
		},
	],
	errors: [
		{
			code: 6000,
			name: "NotRentExempt",
			msg: "Lamport balance below rent-exempt threshold",
		},
		{
			code: 6001,
			name: "EscrowMismatch",
			msg: "Account not associated with this Escrow",
		},
		{
			code: 6002,
			name: "OwnerMismatch",
			msg: "Owner does not match",
		},
		{
			code: 6003,
			name: "InvalidInstruction",
			msg: "Invalid instruction",
		},
		{
			code: 6004,
			name: "TimeEnd",
			msg: "Time has already passed",
		},
		{
			code: 6005,
			name: "StartTimeOverFlow",
			msg: "Start time cannot be equal to end time",
		},
		{
			code: 6006,
			name: "AlreadyCancel",
			msg: "Stream already cancelled",
		},
		{
			code: 6007,
			name: "AlreadyWithdrawn",
			msg: "Paused stream, streamed amount already withdrawn",
		},
		{
			code: 6008,
			name: "Overflow",
			msg: "Operation overflowed",
		},
		{
			code: 6009,
			name: "PublicKeyMismatch",
			msg: "Public key mismatched",
		},
		{
			code: 6010,
			name: "AlreadyPaused",
			msg: "Transaction is already paused",
		},
		{
			code: 6011,
			name: "AlreadyResumed",
			msg: "Transaction is not paused",
		},
		{
			code: 6012,
			name: "StreamAlreadyCreated",
			msg: "Stream Already Created",
		},
		{
			code: 6013,
			name: "StreamNotStarted",
			msg: "Stream has not been started",
		},
		{
			code: 6014,
			name: "StreamAlreadyCompleted",
			msg: "Stream already completed",
		},
		{
			code: 6015,
			name: "StreamedAmt",
			msg: "Cannot withdraw streaming amount",
		},
		{
			code: 6016,
			name: "CancelNotAllowed",
			msg: "cannot cancel this transaction",
		},
		{
			code: 6017,
			name: "InsufficientFunds",
			msg: "An account's balance was too small to complete the instruction",
		},
		{
			code: 6018,
			name: "AlreadyWithdrawnStreamingAmount",
			msg: "Already Withdrawn streamed amount",
		},
		{
			code: 6019,
			name: "NumericalOverflow",
			msg: "NumericalOverflow",
		},
		{
			code: 6020,
			name: "PausedAmountExceeds",
			msg: "PausedAmountExceeds",
		},
		{
			code: 6021,
			name: "StreamAlreadyStarted",
			msg: "StreamAlreadyStarted",
		},
		{
			code: 6022,
			name: "UpdateNotAllowed",
			msg: "UpdateNotAllowed",
		},
		{
			code: 6023,
			name: "OutOfBound",
			msg: "OutOfBound",
		},
	],
	metadata: {
		address: "string",
	},
};
