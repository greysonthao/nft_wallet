import React from "react";
import { Flex, Image, Text, Box } from "@chakra-ui/react";

export default function NftCard({ imageUrl, nftName, attributes }) {
  return (
    <>
      <Box width="215px" height="270px" bgColor="white" justifyContent="center">
        <Flex
          boxSize="sm"
          width="215px"
          height="215px"
          p="3"
          justifyContent="center"
        >
          <Image src={imageUrl} alt={nftName} />
          <Text textColor="white" fontWeight="light">
            {attributes}
          </Text>
        </Flex>
      </Box>
    </>
  );
}
