import { Program, Provider, web3 } from "@project-serum/anchor";

import { SolanaProject as ZebecBridgeIdl } from "./solana_project";
import * as Idl from "./solana_project.json";

// const zebecBridgeIdl: ZebecBridgeIdl = JSON.parse(
// 	fs.readFileSync(path.resolve(__dirname, "solana_project.json"), "utf-8"),
// );

export class ZebecSolBridge__factory {
	static getProgram(programId: web3.PublicKey, provider?: Provider): Program<ZebecBridgeIdl> {
		return new Program<ZebecBridgeIdl>(Idl as ZebecBridgeIdl, programId, provider);
	}
}
