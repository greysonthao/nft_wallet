import {
  Secp256k1HdWallet,
  CosmWasmClient,
  SigningCosmWasmClient,
  GasPrice,
  coin,
  toBinary,
} from "cosmwasm";
import * as fs from "fs";
require("dotenv").config();

const rpcEndpoint = "https://rpc.uni.juno.deuslabs.fi";

const nft_contract_wasm = fs.readFileSync("../artifacts/nft.wasm");
const nft_wallet_wasm = fs.readFileSync("../artifacts/nft_wallet.wasm");

const sender_addr = process.env.SENDER;
const mnemonic = process.env.MNEMONIC;

const sender_addr_2 = process.env.SENDER_2;
const mnemonic_2 = process.env.MNEMONIC_2;

const nft_contract_addr =
  "juno1ge45r24h4a7730u969x8cqnd0087lan76keseznwjceutf3tp4hsx8nuch";
const nft_wallet_addr =
  "juno12antxk7g6ktkatsl6l0lz5f7xjch23r5h0zvjw8m6p4t5xuavnmsfm3jy8";

describe("CosmWasm Tests", () => {
  /* xit("Generate a wallet", async () => {
    const wallet = await Secp256k1HdWallet.generate(12, { prefix: "juno" });

    console.log("mnemonic: ", wallet.mnemonic);
    console.log("WALLET: ", await wallet.getAccounts());
  }).timeout(50000);

   xit("Get Testnet Tokens for opponent address", async () => {
    let wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic_2, {
      prefix: "juno",
    });

    try {
      let res = await axios.post("https://faucet.uni.juno.deuslabs.fi/credit", {
        denom: "ujunox",
        address: sender_addr_2,
      });
      console.log(res);
    } catch (e) {
      console.log(e);
    }
  }).timeout(50000);
   */

  xit("Generate a wallet", async () => {
    const wallet = await Secp256k1HdWallet.generate(12, { prefix: "juno" });

    console.log("mnemonic: ", wallet.mnemonic);
    console.log("WALLET: ", await wallet.getAccounts());
  }).timeout(50000);

  xit("Upload nft contract to Juno testnet", async () => {
    let gas = GasPrice.fromString("0.025ujunox");

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let res = await client.upload(sender_addr, nft_contract_wasm, "auto");

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Query for balance in wallet", async () => {
    const client = await CosmWasmClient.connect(rpcEndpoint);

    let res = await client.getBalance(sender_addr_2, "ujunox");

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Upload nft contract to Juno testnet", async () => {
    let gas = GasPrice.fromString("0.025ujunox");

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let res = await client.upload(sender_addr, nft_contract_wasm, "auto");

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Upload nft wallet contract to Juno testnet", async () => {
    let gas = GasPrice.fromString("0.025ujunox");

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let res = await client.upload(sender_addr, nft_wallet_wasm, "auto");

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Instantiate the nft contract", async () => {
    let gas = GasPrice.fromString("0.025ujunox");

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let res = await client.instantiate(
      sender_addr,
      865,
      { minter: sender_addr, name: "Killer Bees", symbol: "KB" },
      "cw721_contract_kb",
      "auto",
      { admin: sender_addr }
    );

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Instantiate the nft wallet contract", async () => {
    let gas = GasPrice.fromString("0.025ujunox");

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let res = await client.instantiate(
      sender_addr,
      866,
      { admin: sender_addr },
      "nft_wallet_contract",
      "auto"
    );

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Mint 1 NFT on nft contract for sender 1", async () => {
    let gas = GasPrice.fromString("0.025ujunox");

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let res = await client.execute(
      sender_addr,
      nft_contract_addr,
      {
        mint: {
          owner: sender_addr,
          token_id: "KB #1",
          token_uri:
            "ipfs://bafybeigdhq65nokojd6n556gv4vcwsyejqlz23n6jzkvvfr465iezywvai/galaxyHL37B8/1",
        },
      },
      "auto"
    );

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Mint 2nd NFT on nft contract for sender 1", async () => {
    let gas = GasPrice.fromString("0.025ujunox");

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let res = await client.execute(
      sender_addr,
      nft_contract_addr,
      {
        mint: {
          owner: sender_addr,
          token_id: "KB #2",
          token_uri:
            "ipfs://bafybeigdhq65nokojd6n556gv4vcwsyejqlz23n6jzkvvfr465iezywvai/galaxyHL37B8/2",
        },
      },
      "auto"
    );

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Mint 1 NFT on nft contract for sender 2", async () => {
    let gas = GasPrice.fromString("0.025ujunox");

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let res = await client.execute(
      sender_addr,
      nft_contract_addr,
      {
        mint: {
          owner: sender_addr_2,
          token_id: "KB #3",
          token_uri:
            "ipfs://bafybeigdhq65nokojd6n556gv4vcwsyejqlz23n6jzkvvfr465iezywvai/galaxyHL37B8/3",
        },
      },
      "auto"
    );

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Deposit NFT #1 to nft wallet", async () => {
    let gas = GasPrice.fromString("0.025ujunox");

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let ask = coin(2000000, "ujunox");

    let cw721_hook_msg = {
      deposit: {
        ask: ask,
      },
    };

    let msg = {
      send_nft: {
        contract: nft_wallet_addr,
        msg: toBinary(cw721_hook_msg),
        token_id: "KB #1",
      },
    };

    let res = await client.execute(sender_addr, nft_contract_addr, msg, "auto");

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Query for NFT #1 in NFT wallet contract", async () => {
    const client = await CosmWasmClient.connect(rpcEndpoint);

    let res = await client.queryContractSmart(nft_wallet_addr, {
      cw721_deposits: { address: sender_addr, contract: nft_contract_addr },
    });

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Add the sender addr 2 to the blacklist", async () => {
    let gas = GasPrice.fromString("0.025ujunox");

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let res = await client.execute(
      sender_addr,
      nft_wallet_addr,
      { add_to_blacklist: { address: sender_addr_2 } },
      "auto"
    );

    console.log("RES: ", res);
  }).timeout(5000);

  xit("Query for blacklist addresses", async () => {
    const client = await CosmWasmClient.connect(rpcEndpoint);

    let res = await client.queryContractSmart(nft_wallet_addr, {
      get_blacklist: {},
    });

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Submit offer from Sender Addr 2.", async () => {
    let gas = GasPrice.fromString("0.025ujunox");

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic_2, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let res = await client.execute(
      sender_addr_2,
      nft_wallet_addr,
      {
        submit_offer: {
          nft_owner: sender_addr,
          token_id: "KB #1",
          cw721_contract: nft_contract_addr,
        },
      },
      "auto",
      undefined,
      [coin(2000000, "ujunox")]
    );

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Remove sender addr 2 from the blacklist", async () => {
    let gas = GasPrice.fromString("0.025ujunox");

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let res = await client.execute(
      sender_addr,
      nft_wallet_addr,
      { remove_from_blacklist: { address: sender_addr_2 } },
      "auto"
    );

    console.log("RES: ", res);
  }).timeout(5000);

  xit("Query for offers", async () => {
    const client = await CosmWasmClient.connect(rpcEndpoint);

    let res = await client.queryContractSmart(nft_wallet_addr, {
      offers: { owner: sender_addr_2, cw721_contract: nft_contract_addr },
    });

    console.log("RES: ", res);
  }).timeout(50000);

  xit("Accept sender addr 2 offer", async () => {
    let gas = GasPrice.fromString("0.025ujunox");

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let res = await client.execute(
      sender_addr,
      nft_wallet_addr,
      {
        accept_offer: {
          bidder_address: sender_addr_2,
          cw721_contract: nft_contract_addr,
          token_id: "KB #1",
        },
      },
      "auto"
    );

    console.log("RES: ", res);
  }).timeout(5000);

  xit("Migrate the contract", async () => {
    let gas = GasPrice.fromString("0.025ujunox");
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });
    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice: gas }
    );

    let res = await client.migrate(
      sender_addr,
      contract_addr,
      3098,
      {},
      "auto"
    );

    console.log("MIGRATE RES: ", res);
  }).timeout(50000);
});
