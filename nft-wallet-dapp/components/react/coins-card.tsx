import React from "react";
import { Box, Flex, Heading, Text, Image } from "@chakra-ui/react";

export default function CoinsCard({ coinName, coinAmount, imageLink }) {
  return (
    <Box
      mt="8"
      p={5}
      shadow="dark-lg"
      borderWidth="1px"
      borderRadius="12"
      maxWidth="300px"
      bgColor="white"
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Flex>
          <Image src={imageLink} alt={coinName} width="25px" mr="2" />
          <Heading textColor="black" fontSize="xl">
            {coinName}
          </Heading>
        </Flex>
        <Text textColor="black">Send</Text>
      </Flex>
      <Text
        textColor="black"
        mt={2}
        pl="8"
        fontWeight="normal"
        justifyContent="center"
      >
        {coinAmount}
      </Text>
    </Box>
  );
}
