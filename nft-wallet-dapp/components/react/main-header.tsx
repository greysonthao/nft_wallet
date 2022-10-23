import { GridItem, Text, Box } from "@chakra-ui/react";
import { useWallet } from "@cosmos-kit/react";
import React from "react";
import { useRouter } from "next/router";

export default function MainHeader() {
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
    <Box>
      <Text fontSize="4xl" fontWeight="bold" textColor="white">
        {isWalletPage ? "Wallet" : "NFT Vault"}
      </Text>
      {/*    <Text fontSize="sm" fontWeight="light" textColor="white">
        walletStatus: {JSON.stringify(walletStatus)}
      </Text>
      <Text fontSize="sm" fontWeight="light" textColor="white">
        username: {JSON.stringify(username)}
      </Text>
      <Text fontSize="sm" fontWeight="light" textColor="white">
        address: {JSON.stringify(address)}
      </Text>
      <Text fontSize="sm" fontWeight="light" textColor="white">
        message: {JSON.stringify(message)}
      </Text>
      <Text fontSize="sm" fontWeight="light" textColor="white">
        currentChainName: {JSON.stringify(chainName)}
      </Text>
      <Text fontSize="sm" fontWeight="light" textColor="white">
        currentWalletName: {JSON.stringify(currentWalletName)}
      </Text>
      <Text fontSize="sm" fontWeight="light" textColor="white">
        pathname: {JSON.stringify(pathName)}
      </Text>
      <Text textColor="white" fontSize="sm" fontWeight="light">
        {JSON.stringify(
          walletManager.chains[40].assetList.assets[0].logo_URIs?.svg
        )}
      </Text> */}
    </Box>
  );
}
