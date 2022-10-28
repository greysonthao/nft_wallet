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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  useToast,
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
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { coin, GasPrice } from "@cosmjs/stargate";
import { toBinary } from "@cosmjs/cosmwasm-stargate";

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
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [nftAddressInput, setNftAddressInput] = React.useState(
    "NFT Contract Address"
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const handleNftAddressInputChange = (e) => setNftAddressInput(e.target.value);

  const isErrorNftAddrInput = nftAddressInput === "";

  const [tokenIdInput, setTokenIdInput] = React.useState("Token ID");

  const handleTokenIdInputChange = (e) => setTokenIdInput(e.target.value);

  const isErrorTokenIdInput = tokenIdInput === "";

  const [askingPriceInput, setAskingPrice] = React.useState(1);

  const handleAskingPriceInputChange = (e) => setAskingPrice(e.target.value);

  const [tx, setTx] = React.useState<any>(null);

  const isErrorAskingPriceInput = !askingPriceInput;

  const btnRef = React.useRef(null);

  const walletManager = useWallet();

  const toast = useToast();

  const { getCosmWasmClient, getStargateClient, isWalletConnected, address } =
    walletManager;

  React.useEffect(() => {
    if (!isWalletConnected) {
      setAsyncError(null);
      setNftsInNftWallet(null);
      setNftInfoResponses(null);
      setAsyncError(null);
      setNftUris(null);
      setIsLoading(false);
      return;
    }

    const queryNFTVault = async () => {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [address, getCosmWasmClient, isWalletConnected]);

  React.useEffect(() => {
    if (!isWalletConnected) {
      setNftInfoResponses(null);
      setAsyncError(null);
      setNftUris(null);
      setTokenURIData(null);
      setIsLoading(false);
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
        setTokenURIData(cw721MetadataArray);
        setAsyncError(null);
      } catch (error) {
        setAsyncError(error);
      }
    };

    const queryNftInfo = async (tokenId: string) => {
      setIsLoading(true);
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
        //setTokenURIData(cw721MetadataArray);
        setAsyncError(null);
      } catch (error) {
        setAsyncError(error);
      }
    };

    const runFunctions = async () => {
      nftsInNftWallet?.deposits?.forEach((dep) => {
        queryNftInfo(dep.token_id);
      });
      setNftInfoResponses(newNftInfoArray);
      setIsLoading(false);

      /*       setTokenURIData(cw721MetadataArray);
       */ console.log("cw721MetadataArray: ", cw721MetadataArray);
    };

    if (isWalletConnected) {
      runFunctions();
    }
  }, [nftsInNftWallet, getCosmWasmClient, isWalletConnected, nftAddr]);

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

  const handleNftDeposit = async () => {
    if (!isWalletConnected) {
      console.log("WALLET IS NOT CONNECTED");
      return;
    }

    setTx(null);
    onOpen();
    setIsLoading(true);

    //let gas = GasPrice.fromString("0.025ujunox");

    try {
      const cwClient = await getCosmWasmClient();

      console.log("cwClient: ", cwClient);

      const signingClient = new Cw721Client(cwClient, address, nftAddressInput);

      console.log("signingClient: ", signingClient);

      let ask = coin(askingPriceInput * 1000000, "ujunox");

      let cw721_hook_msg = {
        deposit: {
          ask: ask,
        },
      };

      /*    let msg = {
        send_nft: {
          contract: nftAddressInput,
          msg: toBinary(cw721_hook_msg),
          token_id: tokenIdInput,
        },
      }; */

      let tx = await signingClient.sendNft(
        {
          contract: nftVaultAddr,
          msg: toBinary(cw721_hook_msg),
          tokenId: tokenIdInput,
        },
        "auto"
      );

      toast({
        title: `Transaction successful.`,
        position: "top",
        status: "success",
        isClosable: true,
      });

      console.log("transaction events: ", tx.logs[0].events);

      setTx(tx);
      onClose();
      setIsLoading(false);
      setAsyncError(null);
      setNftAddressInput("Nft Contract Address");
      setTokenIdInput("Token ID");
      setAskingPrice(1);
    } catch (error) {
      toast({
        title: `Transaction failed.`,
        position: "top",
        status: "error",
        isClosable: true,
      });
      console.log("ERROR: ", error);
      setIsLoading(false);
      setAsyncError(error);
    }
  };

  const handleNftWithdraw = async () => {
    if (!isWalletConnected) {
      console.log("WALLET IS NOT CONNECTED");
      return;
    }
    setTx(null);
    onOpen();
    setIsLoading(true);

    //let gas = GasPrice.fromString("0.025ujunox");

    try {
      const cwClient = await getCosmWasmClient();
      console.log("cwClient: ", cwClient);

      const signingClient = new NftWalletClient(
        cwClient,
        address,
        nftVaultAddr
      );

      let tx = await signingClient.withdrawNft(
        {
          contract: nftAddressInput,
          tokenId: tokenIdInput,
        },
        "auto"
      );

      toast({
        title: `Transaction successful.`,
        position: "top",
        status: "success",
        isClosable: true,
      });

      setTx(tx);
      onClose();
      setIsLoading(false);
      setAsyncError(null);
      setNftAddressInput("Nft Contract Address");
      setTokenIdInput("Token ID");
      setAskingPrice(1);
    } catch (error) {
      toast({
        title: `Transaction failed.`,
        position: "top",
        status: "error",
        isClosable: true,
      });
      console.log("ERROR: ", error);
      setIsLoading(false);
      setAsyncError(error);
    }
  };

  const nftImagesElement = tokenURIData?.map((metaData) => {
    return <NftCard key={metaData.dna} metaData={metaData} />;
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
          <Tabs variant="enclosed" bgColor="#0D1B2A" borderRadius="8" mt="8">
            <TabList>
              <Tab fontWeight="bold" textColor="white">
                NFTs
              </Tab>
              <Tab fontWeight="bold" textColor="white">
                Deposit
              </Tab>
              <Tab fontWeight="bold" textColor="white">
                Withdraw
              </Tab>
              <Tab fontWeight="bold" textColor="white">
                Bid
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Flex mt="2">
                  {isLoading && (
                    <Flex justifyContent="center">
                      <CircularProgress fontSize="5xl" />
                    </Flex>
                  )}
                  {!nftsInNftWallet && isWalletConnected && (
                    <Text textColor="white" my="4" animation="ease-in">
                      There are no NFTs in the Vault.
                    </Text>
                  )}
                  {!isWalletConnected && (
                    <Text textColor="white" my="4">
                      Please connect your wallet.
                    </Text>
                  )}
                  {tokenURIData && isWalletConnected && (
                    <Flex>{nftImagesElement}</Flex>
                  )}
                </Flex>
              </TabPanel>
              <TabPanel>
                <Flex my="2" textColor="white">
                  <Text fontSize="l">Deposit Your NFTs into the Vault</Text>
                </Flex>
                <Box textColor="white" px="16">
                  <FormControl isInvalid={isErrorNftAddrInput} mt="8">
                    {/* <FormLabel>NFT Contract Address</FormLabel> */}
                    <Input
                      type="text"
                      value={nftAddressInput}
                      onChange={handleNftAddressInputChange}
                      bgColor="white"
                      textColor="black"
                    />
                    {!isErrorNftAddrInput ? (
                      <FormHelperText textColor="white">
                        Enter the contract address for the NFT
                      </FormHelperText>
                    ) : (
                      <FormErrorMessage>
                        NFT contract address is required.
                      </FormErrorMessage>
                    )}
                  </FormControl>
                  <FormControl isInvalid={isErrorTokenIdInput} mt="6">
                    {/* <FormLabel>Token Id</FormLabel> */}
                    <Input
                      type="text"
                      value={tokenIdInput}
                      onChange={handleTokenIdInputChange}
                      bgColor="white"
                      textColor="black"
                    />
                    {!isErrorTokenIdInput ? (
                      <FormHelperText textColor="white">
                        Enter the Token Id for the NFT
                      </FormHelperText>
                    ) : (
                      <FormErrorMessage>Token Id is required.</FormErrorMessage>
                    )}
                  </FormControl>
                  <FormControl isInvalid={isErrorAskingPriceInput} mt="6">
                    {/* <FormLabel>Asking Price</FormLabel> */}
                    <Input
                      type="number"
                      value={askingPriceInput}
                      onChange={handleAskingPriceInputChange}
                      bgColor="white"
                      textColor="black"
                    />
                    {!isErrorAskingPriceInput ? (
                      <FormHelperText textColor="white">
                        Enter your Asking Price in JUNO for the NFT
                      </FormHelperText>
                    ) : (
                      <FormErrorMessage>
                        Asking Price is required.
                      </FormErrorMessage>
                    )}
                  </FormControl>
                  <Flex justifyContent="center">
                    <Button
                      my="14"
                      rightIcon={<ArrowForwardIcon />}
                      colorScheme="gray"
                      variant="outline"
                      _hover={{ bgColor: "white", textColor: "black" }}
                      onClick={handleNftDeposit}
                    >
                      Deposit
                    </Button>
                  </Flex>
                </Box>
              </TabPanel>
              <TabPanel>
                <Flex my="2" textColor="white">
                  <Text fontSize="l">Withdraw Your NFTs from the Vault</Text>
                </Flex>
                <Box textColor="white" px="16">
                  <FormControl isInvalid={isErrorNftAddrInput} mt="8">
                    {/* <FormLabel>NFT Contract Address</FormLabel> */}
                    <Input
                      type="text"
                      value={nftAddressInput}
                      onChange={handleNftAddressInputChange}
                      bgColor="white"
                      textColor="black"
                    />
                    {!isErrorNftAddrInput ? (
                      <FormHelperText textColor="white">
                        Enter the contract address for the NFT
                      </FormHelperText>
                    ) : (
                      <FormErrorMessage>
                        NFT contract address is required.
                      </FormErrorMessage>
                    )}
                  </FormControl>
                  <FormControl isInvalid={isErrorTokenIdInput} mt="6">
                    {/* <FormLabel>Token Id</FormLabel> */}
                    <Input
                      type="text"
                      value={tokenIdInput}
                      onChange={handleTokenIdInputChange}
                      bgColor="white"
                      textColor="black"
                    />
                    {!isErrorTokenIdInput ? (
                      <FormHelperText textColor="white">
                        Enter the Token Id for the NFT
                      </FormHelperText>
                    ) : (
                      <FormErrorMessage>Token Id is required.</FormErrorMessage>
                    )}
                  </FormControl>
                  <Flex justifyContent="center">
                    <Button
                      my="14"
                      rightIcon={<ArrowForwardIcon />}
                      colorScheme="gray"
                      variant="outline"
                      _hover={{ bgColor: "white", textColor: "black" }}
                      onClick={handleNftWithdraw}
                    >
                      Withdraw
                    </Button>
                  </Flex>
                </Box>
              </TabPanel>
              <TabPanel>
                <p>four!</p>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Flex flexDir="column" mt="8" width="300px">
            {/* ADD STUFF HERE */}
          </Flex>

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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            {isLoading && (
              <Flex justifyContent="center" py="4">
                <CircularProgress
                  isIndeterminate
                  color="#415A77"
                  size="150px"
                />
              </Flex>
            )}
            {/*    {tx && (
              <Box textColor="black" fontSize="x-small" py="4">
                <pre>{JSON.stringify(tx, null, 2)}</pre>
              </Box>
            )}
            {asyncError && (
              <Box textColor="red" fontSize="x-small" py="4">
                <pre>{JSON.stringify(asyncError, null, 2)}</pre>
              </Box>
            )} */}
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
