import { Box, Flex, GridItem, Link, Text } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useWallet } from "@cosmos-kit/react";
import { useRouter } from "next/router";
import { MdAccountBalanceWallet } from "react-icons/md";
import { SiDart } from "react-icons/si";

export default function NavSidebar() {
  const [pathName, setPathName] = React.useState("");
  const [isWalletPage, setIsWalletPage] = React.useState(false);

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

  const router = useRouter();

  React.useEffect(() => {
    if (router.pathname == "/") {
      setIsWalletPage(true);
    } else if (router.pathname == "/nft") {
      setIsWalletPage(false);
    }
    setPathName(router.pathname);
  }, [router]);
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        flexDirection="column"
        height="98%"
      >
        <Box>
          <NextLink href="/" passHref>
            <Link _hover={{ textDecoration: "none" }}>
              {" "}
              <Flex>
                <Box mr="2" fontSize="2xl">
                  <MdAccountBalanceWallet color="white" />
                </Box>
                <Text
                  textColor="white"
                  fontSize="xl"
                  fontWeight={isWalletPage ? "bold" : "light"}
                  mb="4"
                >
                  Wallet
                </Text>
              </Flex>
            </Link>
          </NextLink>

          <NextLink href="/nft" passHref>
            <Link _hover={{ textDecoration: "none" }}>
              <Flex>
                <Box mr="2" fontSize="2xl">
                  <SiDart color="white" />
                </Box>
                <Text
                  textColor="white"
                  fontSize="xl"
                  fontWeight={!isWalletPage ? "bold" : "light"}
                  mb="4"
                >
                  NFT Vault
                </Text>
              </Flex>
            </Link>
          </NextLink>
        </Box>
        <Box>
          <Text textColor="white" fontSize="xs" fontWeight="medium">
            2022 WBA Capstone Project
          </Text>
        </Box>
      </Box>
    </>
  );
}
