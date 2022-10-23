import { Flex, GridItem, Text, Link } from "@chakra-ui/react";
import React from "react";
import WalletModal from "./wallet-modal";
import NextLink from "next/link";

export default function HeaderComponent() {
  return (
    <GridItem p="2" bg="#0D1B2A" area={"header"}>
      <Flex justifyContent="space-between" alignItems="center" m={2}>
        <Text fontWeight="bold" fontSize="xl" as="i" textColor="white">
          <NextLink href="/" passHref>
            <Link _hover={{ textDecoration: "none" }}>Jagwire</Link>
          </NextLink>
        </Text>
        <WalletModal />
      </Flex>
    </GridItem>
  );
}
