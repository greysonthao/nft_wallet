/* eslint-disable @next/next/no-img-element */
import React from "react";
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
} from "@chakra-ui/react";
import { WalletSection } from "../wallet";
import { useWallet } from "@cosmos-kit/react";

export default function WalletModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [addr, setAddr] = React.useState("");
  const [shortAddr, setShortAddr] = React.useState("");

  const walletManager = useWallet();

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

  return (
    <>
      {/* <Button onClick={onOpen} bg="white" textColor="#0D1B2A">
        {walletManager.walletStatus == "Connected"
          ? shortAddr
          : "Connect Wallet"}
      </Button> */}
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
    </>
  );
}
