import Head from "next/head";
import {
  Grid,
  GridItem,
  Text,
  Button,
  Box,
  Flex,
  Image,
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
import ImageGallery from "react-image-gallery";

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

    const queryNftInfo = async (tokenId: string) => {
      const cwClient = await getCosmWasmClient();
      const queryClient = new Cw721QueryClient(cwClient, nftAddr);

      try {
        let res = await queryClient.nftInfo({ tokenId: tokenId });

        newNftInfoArray.push(res);

        let uriArray = newNftInfoArray.map((info) => {
          let combined =
            "https://ipfs.io/ipfs/" + info.token_uri?.split("//").splice(1);
          return combined;
        });

        setNftUris(uriArray);
        setAsyncError(null);
      } catch (error) {
        setAsyncError(error);
      }
    };

    if (isWalletConnected) {
      nftsInNftWallet?.deposits?.forEach((dep) => {
        queryNftInfo(dep.token_id);
      });
      setNftInfoResponses(newNftInfoArray);
    }
  }, [nftsInNftWallet, getCosmWasmClient, isWalletConnected]);

  React.useEffect(() => {
    let cw721MetadataArray: Cw721Data[] = [];

    const getTokenInfoData = async (url: string) => {
      try {
        let response = await fetch(url);
        let result = await response.json();
        cw721MetadataArray.push(result);
        setAsyncError(null);
      } catch (error) {
        setAsyncError(error);
      }
    };

    if (isWalletConnected && nftUris) {
      nftUris.forEach((uri) => {
        getTokenInfoData(uri);
      });
      console.log("cw721MetadataArray: ", cw721MetadataArray);
      setTokenURIData(cw721MetadataArray);
    }
  }, [isWalletConnected, nftUris]);

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

  /*   const images = [
    {
      original:
        "https://ipfs.io/ipfs/bafybeidelzqbvonbzunfmpr7szhjmtzq6biupkd6hyenm3g4qb3n2lsgvy/images/1.png",
      thumbnail:
        "https://ipfs.io/ipfs/bafybeidelzqbvonbzunfmpr7szhjmtzq6biupkd6hyenm3g4qb3n2lsgvy/images/1.png",
       originalTitle: "PP #1",
      thumbnailTitle: "PP #1",
      thumbnailLabel: "PP #1",
      description: "Playful Pony #1",
    },
    {
      original:
        "https://ipfs.io/ipfs/bafybeidelzqbvonbzunfmpr7szhjmtzq6biupkd6hyenm3g4qb3n2lsgvy/images/2.png",
      thumbnail:
        "https://ipfs.io/ipfs/bafybeidelzqbvonbzunfmpr7szhjmtzq6biupkd6hyenm3g4qb3n2lsgvy/images/2.png",
       originalTitle: "PP #2",
      thumbnailTitle: "PP #2",
      thumbnailLabel: "PP #2",
      description: "Playful Pony #2",
    },
  ]; */

  const nftImagesElement = tokenURIData?.map((uri) => {
    <Box key={uri.dna} boxSize="sm">
      <Image src={uri.image} alt={uri.name}></Image>
    </Box>;
  });

  return (
    <>
      <Head>
        <title>Jagwire Wallet: NFTs</title>
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

          <Flex justifyContent="center">
            <Box width="550px" bgColor="lightgray"></Box>
          </Flex>

          <Flex flexDir="column" mt="8" width="300px">
            <Button onClick={handleClick}>Console Log</Button>
          </Flex>
          <Flex flexDir="column" mt="8" width="600px">
            {isWalletConnected && (
              <Text textColor="white">{JSON.stringify(tokenURIData)}</Text>
            )}
          </Flex>
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
