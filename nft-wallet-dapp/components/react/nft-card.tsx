import React from "react";
import {
  Flex,
  Image,
  Text,
  Box,
  useDisclosure,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import ScrollingModal from "./scrolling-modal";

export default function NftCard({ metaData }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const btnRef = React.useRef(null);
  return (
    <Flex
      key={metaData.dna}
      mr="6"
      width="250px"
      flexDir="column"
      bgColor="white"
      p="3"
      borderRadius="4"
      border="1px"
    >
      <Image src={metaData.image} alt={metaData.name}></Image>
      <Flex alignItems="center" mt="3" justifyContent="space-between">
        <Text textColor="black" fontFamily="Helvetica" fontSize="sm">
          {metaData.name}
        </Text>
        {/* <ScrollingModal
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            nftName={metaData.name}
          /> */}

        <Button
          fontSize="sm"
          px="2"
          bgColor="#415A77"
          textColor="white"
          ref={btnRef}
          onClick={onOpen}
        >
          Attributes
        </Button>
        <Modal
          onClose={onClose}
          finalFocusRef={btnRef}
          isOpen={isOpen}
          scrollBehavior="inside"
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader textColor="black">{metaData.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody textColor="black">
              <Box fontSize="sm">
                <pre>{JSON.stringify(metaData, null, 2)}</pre>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button bgColor="#415A77" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>
    </Flex>
  );
}
