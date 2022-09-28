import { Program, Provider, web3 } from "@project-serum/anchor";

import { Zebec as ZebecIdl } from "./zebec";
import * as Idl from "./zebec.json";

// const zebecIdl: ZebecIdl = JSON.parse(fs.readFileSync(path.resolve(__dirname, "zebec.json"), "utf-8"));

export class Zebec__factory {
	static getProgram(programId: web3.PublicKey, provider?: Provider): Program<ZebecIdl> {
		return new Program<ZebecIdl>(Idl as ZebecIdl, programId, provider);
	}
}
