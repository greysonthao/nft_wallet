import Head from "next/head";
import { Button, Flex, Grid, GridItem, Text, Box } from "@chakra-ui/react";
import HeaderComponent from "../components/react/header";
import React from "react";
import NavSidebar from "../components/react/nav-sidebar";
import MainHeader from "../components/react/main-header";
import CoinsCard from "../components/react/coins-card";
import { useWallet } from "@cosmos-kit/react";
import { cosmos } from "interchain";
import { coin, Coin } from "@cosmjs/stargate";
import { Progress } from "@chakra-ui/react";

interface TokenInfo {
  denom: string;
  amount: number;
  converted_denom: string;
  converted_amount: number;
  logo_url: string;
}

export default function Home() {
  const walletManager = useWallet();
  const { getCosmWasmClient, getStargateClient, address, isWalletConnected } =
    walletManager;

  const [addr, setAddr] = React.useState<string | null>(null);
  const [allBalance, setAllBalance] = React.useState<Coin[] | null>(null);
  const [walletBalance, setWalletBalance] = React.useState<TokenInfo[] | null>(
    null
  );

  React.useEffect(() => {
    const queryAllBalances = async () => {
      const sgClient = await getStargateClient();
      if (!sgClient || !address) {
        console.error("stargateClient undefined or address undefined.");
        return;
      }

      const res = await sgClient.getAllBalances(address);

      setAllBalance(res);
    };

    if (walletManager.isWalletConnected && walletManager.address) {
      setAddr(walletManager.address);
      queryAllBalances();
    }
  }, [
    address,
    getStargateClient,
    walletManager.address,
    walletManager.isWalletConnected,
    walletManager.walletStatus,
  ]);

  React.useEffect(() => {
    if (walletManager.isWalletConnected == false || !allBalance) {
      setWalletBalance(null);
      return;
    }
    //QUERY ALL DENOMS
    let allBalArray = [...allBalance];
    let newTokensArray: TokenInfo[] = [];
    let newDenom: string;
    let newAmount: number;

    //QUERY LOGO IMAGE URL
    const queryLogoUrl = (denom: string) => {
      let res = walletManager.chains.find((chain) =>
        chain.assetList?.assets.find((asset) => {
          return asset.display == denom;
        })
      );

      let assetInfo = res?.assetList.assets.find((asset) => {
        return asset.display == denom;
      });

      let logoUrl = assetInfo?.logo_URIs?.svg;

      return logoUrl;
    };

    //TAKE OFF FIRST AND LAST CHARACTER FROM DENOM
    const convertDenom = (token: Coin) => {
      let removedFirstCharacter = token.denom.substring(1);
      newDenom = removedFirstCharacter.substring(
        0,
        removedFirstCharacter.length - 1
      );

      return newDenom;
    };

    //CONVERT AMOUNT TO READABLE amount
    const convertAmount = (token: Coin) => {
      newAmount = parseInt(token.amount) / 1000000;
      return newAmount;
    };

    newTokensArray = allBalArray.map((coin) => {
      let newDenom = convertDenom(coin);
      let newAmount = convertAmount(coin);
      let logoUrlLink = queryLogoUrl(newDenom);

      let newToken = {
        amount: parseInt(coin.amount),
        denom: coin.denom,
        converted_denom: newDenom,
        converted_amount: newAmount,
        logo_url: logoUrlLink,
      };

      return newToken;
    });

    console.log("NEW TOKENS ARRAY: ", newTokensArray);

    setWalletBalance(newTokensArray);

    //BUILD TOKENINFO THEN PUSH TO ARRAY
  }, [allBalance, walletManager.chains, walletManager.isWalletConnected]);

  let coinCardsElement = walletBalance?.map((token) => {
    return (
      <CoinsCard
        key={token.denom}
        imageLink={token.logo_url}
        coinName={token.converted_denom.toUpperCase()}
        coinAmount={token.converted_amount}
      />
    );
  });

  return (
    <>
      <Head>
        <title>Jagwire Wallet: Home</title>
        <meta name="description" content="The cosmic NFT super wallet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Grid
        templateAreas={`"header header"
                  "nav main"
                  "nav footer"`}
        gridTemplateRows={"70px 1fr 30px"}
        gridTemplateColumns={"220px 1fr"}
        h="100vh"
        gap="0"
        color="black"
        fontWeight="bold"
      >
        <HeaderComponent />
        <GridItem bg="#1B263B" area={"nav"} px="8" pt="12">
          <NavSidebar />
        </GridItem>

        <GridItem bg="#415A77" area={"main"} px="14" pt="10">
          <MainHeader />
          <Flex>
            {!isWalletConnected && (
              <Box my="8">
                <Text textColor="white" fontWeight="medium">
                  To view your coins/tokens, please connect your wallet.
                </Text>
              </Box>
            )}
          </Flex>
          <Flex flexDirection="column">
            {walletBalance && coinCardsElement}
          </Flex>
        </GridItem>
        <GridItem bg="#415A77" area={"footer"}></GridItem>
      </Grid>
    </>
  );
}
