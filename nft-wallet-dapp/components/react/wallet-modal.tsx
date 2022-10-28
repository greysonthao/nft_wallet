/* eslint-disable @next/next/no-img-element */
import React, { MouseEventHandler, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Box,
  Flex,
  Image,
  Icon,
  Center,
  Grid,
  GridItem,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { WalletSection } from "../wallet";
import { useWallet } from "@cosmos-kit/react";
import {
  Astronaut,
  Error,
  ChainOption,
  ChooseChain,
  Connected,
  ConnectedShowAddress,
  ConnectedUserInfo,
  Connecting,
  ConnectStatusWarn,
  CopyAddressBtn,
  Disconnected,
  handleSelectChainDropdown,
  NotExist,
  Rejected,
  RejectedWarn,
  WalletConnectComponent,
} from "../../components";
import { FiAlertTriangle } from "react-icons/fi";
import { getWalletPrettyName } from "@cosmos-kit/config";
import { assets as chainAssets } from "chain-registry";

export default function WalletModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [addr, setAddr] = React.useState("");
  const [shortAddr, setShortAddr] = React.useState("");

  const walletManager = useWallet();

  const {
    connect,
    openView,
    setCurrentChain,
    walletStatus,
    username,
    address,
    message,
    currentChainName: chainName,
    currentWalletName,
    chains,
  } = walletManager;

  React.useEffect(() => {
    if (walletManager.address) {
      setAddr(walletManager.address);
      setShortAddr(
        walletManager.address.slice(0, 5) +
          "..." +
          walletManager.address.slice(37, 44)
      );
    }
  }, [walletManager.address, walletManager.walletStatus]);

  const chainOptions = useMemo(
    () =>
      chains.map((chainRecord) => {
        const assets = chainAssets.find(
          (_chain) => _chain.chain_name === chainRecord.name
        )?.assets;
        return {
          chainName: chainRecord.name,
          label: chainRecord.chain.pretty_name,
          value: chainRecord.name,
          icon: assets
            ? assets[0]?.logo_URIs?.svg || assets[0]?.logo_URIs?.png
            : undefined,
          disabled: false,
        };
      }),
    [chains]
  );

  // Events
  const onClickConnect: MouseEventHandler = async (e) => {
    e.preventDefault();
    await connect();
  };

  const onClickOpenView: MouseEventHandler = (e) => {
    e.preventDefault();
    openView();
  };

  const onChainChange: handleSelectChainDropdown = async (
    selectedValue: ChainOption | null
  ) => {
    setCurrentChain(selectedValue?.chainName);
    await connect();
  };

  // Components
  const connectWalletButton = (
    <WalletConnectComponent
      walletStatus={walletStatus}
      disconnect={
        <Disconnected buttonText="Connect Wallet" onClick={onClickConnect} />
      }
      connecting={<Connecting />}
      connected={<Connected buttonText={shortAddr} onClick={onClickOpenView} />}
      rejected={<Rejected buttonText="Reconnect" onClick={onClickConnect} />}
      error={<Error buttonText="Change Wallet" onClick={onClickOpenView} />}
      notExist={
        <NotExist buttonText="Install Wallet" onClick={onClickOpenView} />
      }
    />
  );

  const connectWalletWarn = (
    <ConnectStatusWarn
      walletStatus={walletStatus}
      rejected={
        <RejectedWarn
          icon={<Icon as={FiAlertTriangle} mt={1} />}
          wordOfWarning={`${getWalletPrettyName(
            currentWalletName
          )}: ${message}`}
        />
      }
      error={
        <RejectedWarn
          icon={<Icon as={FiAlertTriangle} mt={1} />}
          wordOfWarning={`${getWalletPrettyName(
            currentWalletName
          )}: ${message}`}
        />
      }
    />
  );
  const chooseChain = (
    <ChooseChain
      chainName={chainName}
      chainInfos={chainOptions}
      onChange={onChainChange}
    />
  );

  const userInfo = (
    <ConnectedUserInfo username={username} icon={<Astronaut />} />
  );
  const addressBtn = chainName && (
    <CopyAddressBtn
      walletStatus={walletStatus}
      connected={<ConnectedShowAddress address={address} isLoading={false} />}
    />
  );

  return (
    <>
      {walletManager.walletStatus == "Connected" ? (
        <Button onClick={onOpen} bg="white" textColor="#0D1B2A">
          <Flex alignItems="center">
            <Image
              src={walletManager.chains[40].assetList.assets[0].logo_URIs?.svg}
              alt={walletManager.chains[40].name}
              width="25px"
              mr="2"
            />
            {shortAddr}
          </Flex>
        </Button>
      ) : (
        <Button onClick={onOpen} bg="white" textColor="#0D1B2A">
          Connect Wallet
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="#E0E1DD">
          <ModalCloseButton color="black" />
          <ModalBody textColor="black">
            <WalletSection />
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* <Box w="full" maxW={{ base: 52, md: 64 }}>
        {connectWalletButton}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton color="black" />
          <ModalBody>
            <Center py={10}>
              <Grid
                w="full"
                maxW="sm"
                templateColumns="1fr"
                rowGap={4}
                alignItems="center"
                justifyContent="center"
              >
                <GridItem px={6} width="full" textColor="black">
                  {chooseChain}
                </GridItem>
                <GridItem textColor="black">{connectWalletWarn}</GridItem>
                <GridItem px={6}>
                  <Stack
                    justifyContent="center"
                    alignItems="center"
                    borderRadius="lg"
                    bgColor="black"
                    boxShadow={"0 0 2px #363636, 0 0 8px -2px #4f4f4f"}
                    spacing={4}
                    px={4}
                    py={{ base: 6, md: 12 }}
                  >
                    {userInfo}
                    {addressBtn}
                    <Box w="full" maxW={{ base: 52, md: 64 }}>
                      {connectWalletButton}
                    </Box>
                  </Stack>
                </GridItem>
              </Grid>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal> */}
    </>
  );
}
