import Head from "next/head";
import { Grid, GridItem, Text, Button, Box, Flex } from "@chakra-ui/react";
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

export default function Nft() {
  const [nftsInNftWallet, setNftsInNftWallet] =
    React.useState<Cw721DepositResponse | null>(null);
  const [cw721DepositsError, setCw721DepositsError] = React.useState<
    any | null
  >(null);
  const [nftTokenResponseError, setNftTokenResponseError] = React.useState<
    any | null
  >(null);
  const [nftInfoResponses, setNftInfoResponses] = React.useState<
    NftInfoResponse[] | null
  >(null);
  const [nftUris, setNftUris] = React.useState<any[] | null>(null);

  const nftWalletAddr =
    "juno13lapqjghrr7r0h0a4jmnjxf64vr63v6kzz4mpranhclzrwnhr9psczl9yk";

  const nftAddr =
    "juno12u32yr0cnxwq7zvmy4vg6lwpmsjf23aj64x2myc426a4e4e00t6q4wpcf0";

  const walletManager = useWallet();

  const { getCosmWasmClient, getStargateClient, isWalletConnected, address } =
    walletManager;

  /* React.useEffect(() => {
    if (!isWalletConnected) {
      setNftsInNftWallet(null);
      setCw721DepositsError(null);
      setNftTokenResponseError(null);
      setNftInfoResponses(null);
      setNftUris(null);
      return;
    }

    const queryNFTVault = async () => {
      const cwClient = await getCosmWasmClient();
      const queryClient = new NftWalletQueryClient(cwClient, nftWalletAddr);

      try {
        let res = await queryClient.cw721Deposits({
          address: address,
          contract: nftAddr,
        });

        setCw721DepositsError(null);
        setNftsInNftWallet(res);
      } catch (error) {
        setCw721DepositsError(error);
      }
    };

    let newNftInfoArray: NftInfoResponse[] = [];

    const queryNftInfo = async (tokenId: string) => {
      const cwClient = await getCosmWasmClient();
      const queryClient = new Cw721QueryClient(cwClient, nftAddr);

      try {
        let res = await queryClient.nftInfo({ tokenId: tokenId });

        setNftTokenResponseError(null);
        newNftInfoArray.push(res);
      } catch (error) {
        setNftTokenResponseError(error);
      }
    };

    if (isWalletConnected) {
      queryNFTVault();

      let newArray = { ...nftsInNftWallet };
      newArray.deposits?.forEach((dep) => {
        queryNftInfo(dep.token_id);
      });

      setNftInfoResponses(newNftInfoArray);

      let uriArray: string[] = [];
      newNftInfoArray.forEach((info) => {
        uriArray.push(
          "https://ipfs.io/ipfs/" + info.token_uri?.split("//").slice(1)
        );
      });
      setNftUris(uriArray);
    }
  }, [isWalletConnected]); */

  React.useEffect(() => {
    if (!isWalletConnected) {
      setCw721DepositsError(null);
      setNftsInNftWallet(null);
      setNftInfoResponses(null);
      setNftTokenResponseError(null);
      setNftUris(null);
      return;
    }

    const queryNFTVault = async () => {
      const cwClient = await getCosmWasmClient();
      const queryClient = new NftWalletQueryClient(cwClient, nftWalletAddr);

      try {
        let res = await queryClient.cw721Deposits({
          address: address,
          contract: nftAddr,
        });

        setCw721DepositsError(null);
        setNftsInNftWallet(res);
      } catch (error) {
        setCw721DepositsError(error);
      }
    };

    if (isWalletConnected) {
      queryNFTVault();
    }
  }, [address, getCosmWasmClient, isWalletConnected]);

  React.useEffect(() => {
    if (!isWalletConnected) {
      setNftInfoResponses(null);
      setNftTokenResponseError(null);
      return;
    }

    let newNftInfoArray: NftInfoResponse[] = [];

    const queryNftInfo = async (tokenId: string) => {
      const cwClient = await getCosmWasmClient();
      const queryClient = new Cw721QueryClient(cwClient, nftAddr);

      try {
        let res = await queryClient.nftInfo({ tokenId: tokenId });

        setNftTokenResponseError(null);
        newNftInfoArray.push(res);
      } catch (error) {
        setNftTokenResponseError(error);
      }
    };

    if (isWalletConnected) {
      let newArray = { ...nftsInNftWallet };
      console.log("newArray: ", newArray);

      newArray.deposits?.forEach((dep) => {
        queryNftInfo(dep.token_id);
      });
      setNftInfoResponses(newNftInfoArray);
      console.log("newNftInfoArray YEAH YEAH: ", newNftInfoArray);

      let thaoNation: any[] = [
        { number: 1, name: "Touger" },
        { number: 2, name: "Mykou" },
        { number: 3, name: "Jazozi" },
        { number: 4, name: "Cloem" },
      ];

      let uriArray = thaoNation.map((member) => {
        let combined =
          "https://ipfs.io/ipfs/" + member.name.split("o").splice(1);
        console.log("combined: ", combined);
        return combined;
      });

      /*       let uriArray = newNftInfoArray.map((info) => {
        let combined =
          "https://ipfs.io/ipfs/" + info.token_uri?.split("//").splice(1);
        return combined;
      }); */

      console.log("uriArray: ", uriArray);
      setNftUris(uriArray);
    }
  }, [nftsInNftWallet, getCosmWasmClient, isWalletConnected]);

  /* React.useEffect(() => {
    if (!isWalletConnected) {
      setNftUris(null);
      return;
    }

    if (nftInfoResponses) {
      let uriArray: string[] = [];
      nftInfoResponses.forEach((info) => {
        uriArray.push(
          "https://ipfs.io/ipfs/" + info.token_uri?.split("//").slice(1)
        );
      });
      setNftUris(uriArray);
    }
  }, [isWalletConnected, nftInfoResponses]); */

  const handleClick = () => {
    if (nftInfoResponses) {
      console.log("nftInfoResponses: ", nftInfoResponses);
    }
    if (nftUris) {
      console.log("nftUris: ", nftUris);
    }
  };

  const getTokenURIData = async (link: string) => {
    let response = await fetch(link);
    console.log(response.status); // 200
    console.log(response.statusText); // OK

    let data = await response.json();

    console.log("DATA: ", data);
  };

  const getTokenInfo = () => {
    if (nftInfoResponses) {
      let uriArray: string[] = [];
      nftInfoResponses.forEach((info) => {
        uriArray.push(
          "https://ipfs.io/ipfs/" + info.token_uri?.split("//").slice(1)
        );
      });
      console.log("nft URI Array: ", uriArray);
      /*  setNftUris(uriArray); */

      /*getTokenURIData(goodURL);*/
    }
  };

  const images = [
    {
      original:
        "https://ipfs.io/ipfs/bafybeidelzqbvonbzunfmpr7szhjmtzq6biupkd6hyenm3g4qb3n2lsgvy/images/1.png",
      thumbnail:
        "https://ipfs.io/ipfs/bafybeidelzqbvonbzunfmpr7szhjmtzq6biupkd6hyenm3g4qb3n2lsgvy/images/1.png",
      /* originalTitle: "PP #1",
      thumbnailTitle: "PP #1",
      thumbnailLabel: "PP #1", */
      description: "Playful Pony #1",
    },
    {
      original:
        "https://ipfs.io/ipfs/bafybeidelzqbvonbzunfmpr7szhjmtzq6biupkd6hyenm3g4qb3n2lsgvy/images/2.png",
      thumbnail:
        "https://ipfs.io/ipfs/bafybeidelzqbvonbzunfmpr7szhjmtzq6biupkd6hyenm3g4qb3n2lsgvy/images/2.png",
      /* originalTitle: "PP #2",
      thumbnailTitle: "PP #2",
      thumbnailLabel: "PP #2", */
      description: "Playful Pony #2",
    },
  ];

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

          {/*  <Flex justifyContent="center">
            <Box width="500px">
              <ImageGallery items={images} />
            </Box>
          </Flex>
 */}
          <Button width="200px" onClick={handleClick}>
            Get Console Log
          </Button>
          <br />
          <br />
          <Button width="200px" onClick={getTokenInfo}>
            Get Token Info
          </Button>
          <br />
          <br />
          <Box width="800px">
            {nftInfoResponses && (
              <Text textColor="white">{JSON.stringify(nftInfoResponses)}</Text>
            )}
            {nftUris && (
              <Text textColor="white">{JSON.stringify(nftUris)}</Text>
            )}
          </Box>
        </GridItem>

        <GridItem bg="#415A77" area={"footer"}></GridItem>
      </Grid>
    </>
  );
}
