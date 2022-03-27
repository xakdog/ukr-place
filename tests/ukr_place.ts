import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { UkrPlace } from "../target/types/ukr_place";

describe("ukr_place", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.UkrPlace as Program<UkrPlace>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
