import { expect } from 'chai';
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { UkrPlace } from "../target/types/ukr_place";

const { SystemProgram } = anchor.web3;

const PRICE_PER_PIXEL = 25_000_000;
const LAMPORTS_PER_SOL = 1_000_000_000;
const DONATE_PUBLIC_KEY = new PublicKey("66pJhhESDjdeBBDdkKmxYYd7q6GUggYPWjxpMKNX39KV");

describe("ukr_place", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.UkrPlace as Program<UkrPlace>;
  const jsonRpc = program.provider.connection;

  const solToLamports = (amount: number) => Math.floor(amount * LAMPORTS_PER_SOL);

  const airdropSol = async (key: PublicKey, sol: number) => {
    const lamports = solToLamports(sol);
    const sig = await jsonRpc.requestAirdrop(key, lamports);
    await jsonRpc.confirmTransaction(sig);
  };

  // it("Is initialized!", async () => {
  //   // Add your test here.
  //   const tx = await program.rpc.initialize({});
  //   console.log("Your transaction signature", tx);
  // });

  it("Should buy 144 pixels and transfer money to https://donate.thedigital.gov.ua/", async () => {
    const pixels = 144;
    const price = pixels * PRICE_PER_PIXEL;
    const myMoney = anchor.web3.Keypair.generate();
    const myPixels = anchor.web3.Keypair.generate();

    await airdropSol(DONATE_PUBLIC_KEY, 3);
    await airdropSol(myMoney.publicKey, 3.7);

    const accountBefore = await jsonRpc.getAccountInfo(DONATE_PUBLIC_KEY);

    await program.rpc.initialize({
      accounts: {
        user: myMoney.publicKey,
        pixelWallet: myPixels.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [myMoney, myPixels],
    });

    const sig = await program.rpc.buyPixels(pixels, {
      accounts: {
        user: myMoney.publicKey,
        charity: DONATE_PUBLIC_KEY,
        pixelWallet: myPixels.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [myMoney],
    });

    await jsonRpc.confirmTransaction(sig);
    const accountAfter = await jsonRpc.getAccountInfo(DONATE_PUBLIC_KEY);

    expect(accountAfter.lamports).equal(accountBefore.lamports + price);

    const pixWalletData = await program.account.pixelWallet.fetch(myPixels.publicKey);
    const availablePixels = pixWalletData.availablePixels.toNumber();

    expect(availablePixels).to.be.equal(pixels);
  });
});
