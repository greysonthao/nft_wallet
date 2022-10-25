import Head from "next/head";
import {
  Grid,
  GridItem,
  Text,
  Button,
  Box,
  Flex,
  Image,
  CircularProgress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import React from "react";
import HeaderComponent from "../components/react/header";
import NavSidebar from "../components/react/nav-sidebar";
import MainHeader from "../components/react/main-header";
import { NftWalletQueryClient, NftWalletClient } from "../ts/NftWallet.client";
import { Cw721QueryClient, Cw721Client } from "../ts/Cw721.client";
import { Cw721DepositResponse } from "../ts/NftWallet.types";
import { useWallet } from "@cosmos-kit/react";
import { NftInfoResponse } from "../ts/Cw721.types";
import NftCard from "../components/react/nft-card";

export interface Attribute {
  trait_type: string;
  value: string;
}

export interface Cw721Data {
  name: string;
  description: string;
  image: string;
  dna: string;
  edition: number;
  date: number;
  attributes: Attribute[];
  compiler: string;
}

export default function Nft() {
  const [nftsInNftWallet, setNftsInNftWallet] =
    React.useState<Cw721DepositResponse | null>(null);
  /*  const [cw721DepositsError, setCw721DepositsError] = React.useState<
    any | null
  >(null); */
  /* const [nftTokenResponseError, setNftTokenResponseError] = React.useState<
    any | null
  >(null); */
  const [asyncError, setAsyncError] = React.useState<any | null>(null);
  const [nftInfoResponses, setNftInfoResponses] = React.useState<
    NftInfoResponse[] | null
  >(null);
  const [nftUris, setNftUris] = React.useState<any[] | null>(null);
  const [nftVaultAddr, setNftVaultAddr] = React.useState(
    "juno13lapqjghrr7r0h0a4jmnjxf64vr63v6kzz4mpranhclzrwnhr9psczl9yk"
  );
  const [nftAddr, setNftAddr] = React.useState(
    "juno12u32yr0cnxwq7zvmy4vg6lwpmsjf23aj64x2myc426a4e4e00t6q4wpcf0"
  );
  const [tokenURIData, setTokenURIData] = React.useState<Cw721Data[] | null>(
    null
  );

  const walletManager = useWallet();

  const { getCosmWasmClient, getStargateClient, isWalletConnected, address } =
    walletManager;

  React.useEffect(() => {
    if (!isWalletConnected) {
      setAsyncError(null);
      setNftsInNftWallet(null);
      setNftInfoResponses(null);
      setAsyncError(null);
      setNftUris(null);
      return;
    }

    const queryNFTVault = async () => {
      const cwClient = await getCosmWasmClient();
      const queryClient = new NftWalletQueryClient(cwClient, nftVaultAddr);

      try {
        let res = await queryClient.cw721Deposits({
          address: address,
          contract: nftAddr,
        });

        setAsyncError(null);
        setNftsInNftWallet(res);
      } catch (error) {
        setAsyncError(error);
      }
    };

    if (isWalletConnected) {
      queryNFTVault();
    }
  }, [address, getCosmWasmClient, isWalletConnected]);

  React.useEffect(() => {
    if (!isWalletConnected) {
      setNftInfoResponses(null);
      setAsyncError(null);
      setNftUris(null);
      setTokenURIData(null);
      return;
    }

    let newNftInfoArray: NftInfoResponse[] = [];

    let cw721MetadataArray: Cw721Data[] = [];

    //let uriArray: string[] = [];

    const getTokenInfoData = async (url: string) => {
      try {
        let response = await fetch(url);
        let result = await response.json();

        let newResult = {
          ...result,
          image: "https://ipfs.io/ipfs/" + result.image.split("//").splice(1),
        };
        cw721MetadataArray.push(newResult);
        setAsyncError(null);
      } catch (error) {
        setAsyncError(error);
      }
    };

    const queryNftInfo = async (tokenId: string) => {
      const cwClient = await getCosmWasmClient();
      const queryClient = new Cw721QueryClient(cwClient, nftAddr);

      try {
        let res = await queryClient.nftInfo({ tokenId: tokenId });

        newNftInfoArray.push(res);

        let combined = "";

        let uriArray = newNftInfoArray.map((info) => {
          combined =
            "https://ipfs.io/ipfs/" + info.token_uri?.split("//").splice(1);

          return combined;
        });

        getTokenInfoData(combined);
        setNftUris(uriArray);
        setAsyncError(null);
        console.log("newNftInfoArray: ", newNftInfoArray);
      } catch (error) {
        setAsyncError(error);
      }
    };

    if (isWalletConnected) {
      nftsInNftWallet?.deposits?.forEach((dep) => {
        queryNftInfo(dep.token_id);
      });
      setNftInfoResponses(newNftInfoArray);

      setTokenURIData(cw721MetadataArray);
    }
  }, [nftsInNftWallet, getCosmWasmClient, isWalletConnected]);

  const handleClick = () => {
    if (nftInfoResponses) {
      console.log("nftInfoResponses: ", nftInfoResponses);
    }
    if (nftUris) {
      console.log("nftUris: ", nftUris);
    }

    if (tokenURIData) {
      console.log("tokenURIData: ", tokenURIData);
    }
  };

  const createVault = () => {
    console.log("creating vault");
  };

  const nftImagesElement = tokenURIData?.map((uri) => {
    return (
      <NftCard
        key={uri.dna}
        nftName={uri.name}
        imageUrl={uri.image}
        attributes={uri.attributes}
      />
    );
  });

  const nftImage = tokenURIData?.map((thing) => {
    return (
      <Flex
        key={thing.dna}
        mr="6"
        width="250px"
        flexDir="column"
        bgColor="white"
        p="3"
        borderRadius="4"
        border="1px"
      >
        <Image src={thing.image} alt={thing.name}></Image>
        <Flex alignItems="center" mt="2" justifyContent="space-between">
          <Text textColor="black" fontFamily="Helvetica" fontSize="sm">
            {thing.name}
          </Text>
          <Button fontSize="sm" px="2" bgColor="#415A77" textColor="white">
            Attributes
          </Button>
        </Flex>
      </Flex>
    );
  });

  return (
    <>
      <Head>
        <title>Jagwire: NFT Vault</title>
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
          <Tabs variant="enclosed" bgColor="white" borderRadius="8" mt="8">
            <TabList>
              <Tab fontWeight="bold">NFTs</Tab>
              <Tab fontWeight="bold">Deposit</Tab>
              <Tab fontWeight="bold">Withdraw</Tab>
              <Tab fontWeight="bold">Bid</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Flex mt="2">
                  <Flex>{nftImage}</Flex>
                </Flex>
              </TabPanel>
              <TabPanel>
                <p>two!</p>
              </TabPanel>
              <TabPanel>
                <p>three!</p>
              </TabPanel>
              <TabPanel>
                <p>four!</p>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* <Flex mt="8">
            {tokenURIData && (
              <Box
                width="215px"
                height="270px"
                bgColor="white"
                justifyContent="center"
              >
                {nftImagesElement}
              </Box>
            )}
          </Flex> */}

          <Flex flexDir="column" mt="8" width="300px"></Flex>

          {/* <Flex flexDir="column" mt="8" width="600px">
            {!tokenURIData ? (
              <CircularProgress isIndeterminate color="green.300" />
            ) : (
              <Text textColor="white">{JSON.stringify(tokenURIData)}</Text>
            )}
          </Flex> */}
        </GridItem>

        <GridItem bg="#415A77" area={"footer"}></GridItem>
      </Grid>
    </>
  );
}

{
  /* <Text textColor="white" fontWeight="medium" mb="4">
              The NFT Vault is the best place to store your NFTs. You can
              deposit and withdraw your NFTs at anytime. Interested parties can
              bid on your NFTs right in the vault. You have complete control.
            </Text>
            <Button width="200px" onClick={createVault} mb="8">
              Create NFT Vault
            </Button> */
}
