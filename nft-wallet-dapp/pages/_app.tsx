import "../styles/globals.css";
import type { AppProps } from "next/app";
import { WalletProvider } from "@cosmos-kit/react";
import { ChakraProvider } from "@chakra-ui/react";
import { defaultTheme } from "../config";
import { wallets } from "@cosmos-kit/keplr";
import { SignerOptions } from "@cosmos-kit/core";
import { chains, assets } from "chain-registry";
import { Chain } from "@chain-registry/types";
import { GasPrice } from "@cosmjs/stargate";

function CreateCosmosApp({ Component, pageProps }: AppProps) {
  const signerOptions: SignerOptions = {
    // stargate: (_chain: Chain) => {
    //   return getSigningCosmosClientOptions();
    // }

    cosmwasm: (chain: Chain) => {
      switch (chain.chain_name) {
        case "osmosis":
        case "osmosistestnet":
          return {
            gasPrice: GasPrice.fromString("0.025uosmo"),
          };
        case "juno":
          return {
            gasPrice: GasPrice.fromString("0.025ujuno"),
          };
        case "junotestnet":
          return {
            gasPrice: GasPrice.fromString("0.025ujunox"),
          };
        case "stargaze":
          return {
            gasPrice: GasPrice.fromString("0.025ustars"),
          };
      }
    },
  };

  return (
    <ChakraProvider theme={defaultTheme}>
      <WalletProvider
        chains={chains}
        assetLists={assets}
        wallets={wallets}
        signerOptions={signerOptions}
      >
        <Component {...pageProps} />
      </WalletProvider>
    </ChakraProvider>
  );
}

export default CreateCosmosApp;
