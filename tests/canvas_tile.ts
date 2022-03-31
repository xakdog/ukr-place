import { CanvasTile } from "../target/types/canvas_tile";
import { Helpers } from "./helpers";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";


describe.skip("canvas_tile", () => {
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.CanvasTile as Program<CanvasTile>;
  const helpers = new Helpers(program);

  it("Should init CanvasTile", async () => {
    const point = { x: 0, y: 0 };

    const feePayer = Keypair.generate();
    await helpers.airdropSol(feePayer.publicKey, 0.5);

    await helpers.initCanvasTile(feePayer, point);
  });
});
