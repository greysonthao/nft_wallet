import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Box,
} from "@chakra-ui/react";
import React from "react";

export default function ScrollingModal({ isOpen, onOpen, onClose, nftName }) {
  /* const { isOpen, onOpen, onClose } = useDisclosure();*/

  const btnRef = React.useRef(null);

  return (
    <>
      {/*       <Button mt={3} ref={btnRef} onClick={onOpen}>
        Trigger modal
      </Button> */}
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
          <ModalHeader textColor="black">{nftName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody textColor="black">
            <Box fontSize="sm">
              {/* <pre>{JSON.stringify(metaDataData, null, 2)}</pre> */}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
