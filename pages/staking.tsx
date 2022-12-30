import {
  useNetwork,
  useNetworkMismatch,
  ThirdwebNftMedia,
  useAddress,
  useTokenBalance,
  useOwnedNFTs,
  useContract,
  useMetamask, useWalletConnect, useCoinbaseWallet,
} from "@thirdweb-dev/react";
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  createIcon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Menu,
  MenuItem,
  MenuDivider,
  useToast,
  Flex,
  Tag,
  Spinner,
  Avatar,
  Center,
  Image,
  SimpleGrid, Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react';
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import React, { useContext, useRef, useEffect, useState } from "react";
import { NFT_COLLECTION_ADDRESS, TOKEN_DROP_ADDRESS, MEMBERPASS_CONTRACT_ADDRESS, NFT_STAKING_ADDRESS } from "../const/contractAddresses";
import MintMember from "../components/memberPage";
import styles from "../styles/Theme.module.css";

const nftCollection = NFT_COLLECTION_ADDRESS;
const tokenContractAddress = TOKEN_DROP_ADDRESS;
const stakingContractAddress = NFT_STAKING_ADDRESS;

const Stake: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  // Wallet Connection Hooks
  const address = useAddress();
  const router = useRouter();

  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const color = useColorModeValue('gray.800', 'gray.300');
  const bgColor = useColorModeValue('white', 'gray.800');
  
  const connectWithMetamask = useMetamask();
  const connectWithWalletConnect = useWalletConnect();
  const connectWithCoinbaseWallet = useCoinbaseWallet();

  const Toast = useToast({
    position: 'top',
    title: 'Salah Jaringan',
    containerStyle: {
      maxWidth: '100%',
    },
  })
  
  const { contract: editionDrop } = useContract(
    MEMBERPASS_CONTRACT_ADDRESS,
    "edition-drop"
  );

  // Contract Hooks
  const { contract: nftCollection } = useContract(
    NFT_COLLECTION_ADDRESS,
    "nft-collection"
  );

  const { contract: tokenContract } = useContract(
    TOKEN_DROP_ADDRESS,
    "token"
  );

  const { contract } = useContract(stakingContractAddress);

  // Load Unstaked NFTs
  const { data: ownedNfts } = useOwnedNFTs(nftCollection, address);

  // Load Balance of Token
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);

  ///////////////////////////////////////////////////////////////////////////
  // Custom contract functions
  ///////////////////////////////////////////////////////////////////////////
  const [stakedNfts, setStakedNfts] = useState<any[]>([]);
  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();

  useEffect(() => {
    if (!contract) return;

    async function loadStakedNfts() {
      const stakedTokens = await contract?.call("getStakedTokens", address);

      // For each staked token, fetch it from the sdk
      const stakedNfts = await Promise.all(
        stakedTokens?.map(
          async (stakedToken: { staker: string; tokenId: BigNumber }) => {
            const nft = await nftCollection?.get(stakedToken.tokenId);
            return nft;
          }
        )
      );

      setStakedNfts(stakedNfts);
      console.log("setStakedNfts", stakedNfts);
    }

    if (address) {
      loadStakedNfts();
    }
  }, [address, contract, nftCollection]);

  useEffect(() => {
    if (!contract || !address) return;

    async function loadClaimableRewards() {
      const cr = await contract?.call("availableRewards", address);
      console.log("Loaded claimable rewards", cr);
      setClaimableRewards(cr);
    }

    loadClaimableRewards();
  }, [address, contract]);

  const {
    data: memberNfts,
    isLoading,
    isError,
  } = useOwnedNFTs(editionDrop, address);

  if (!address) {
    return (
<>
    <div className={styles.loading} style={{width: '100%'}}>
      {!address ? (
		  <div className={styles.loading} style={{marginTop: '-96px'}}>
      <h1 className={styles.h1} style={{fontFamily: 'Caveat'}}>& <br/>Stake Your NFTs</h1>

      <br className={`${styles.divider} ${styles.spacerTop}`} />
        <Stack flex={2} direction={{ md: 'row', base: 'column'}} spacing={{ base: 5, md: 5 }}>
            <Button onClick={onOpen}
              colorScheme={'green'}
              bg={'green.400'}
              rounded={'full'}
              px={6}
              _hover={{
                bg: 'green.500',
              }}>
              Connect Wallet
            </Button>
			<AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
		motionPreset='slideInBottom'
		isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent margin={'auto 10px'}>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Connect Wallet
            </AlertDialogHeader>

            <AlertDialogBody>
              <Menu>
                  <MenuDivider />
                  <MenuItem gap='5' onClick={() => {connectWithMetamask(), onClose()}} className={styles.hoverItem}>Metamask
				  <Tag size='sm' variant='solid' colorScheme='blue' borderRadius='full'>
					  Recomended
					</Tag>
					</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={() => {connectWithWalletConnect(), onClose()}} className={styles.hoverItem}>WalletConnect</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={() => {connectWithCoinbaseWallet(), onClose()}} className={styles.hoverItem}>CoinBase</MenuItem>
                  <MenuDivider />
              </Menu>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} colorScheme='red'>
                Cancel
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
            <Box style={{position: 'absolute', top: '-35px'}}>
              <Icon
                as={Arrow}
                color={color}
                w={71}
                position={'absolute'}
                right={-145}
                top={'40px'}
                transform={'rotate(-100deg)'}
              />
              <Text
                fontSize={'lg'}
                fontFamily={'Caveat'}
                position={'absolute'}
                right={'-105px'}
                top={'-8px'}
                transform={'rotate(10deg)'}>
                Sign Your Wallet
              </Text>
            </Box>
</Stack>
		  </div>
      ) : (
        <>
        </>
      )}
	</div>
</>
    );
  }

  // 1. Loading
  if (isLoading) {
    return 
		  <div className={styles.loading}>
		  <Spinner
			  thickness='4px'
			  speed='0.65s'
			  emptyColor='gray.200'
			  color='blue.500'
			  size='xl' />
          </div>;
  }
  
  // Something went wrong
  if (!memberNfts || isError) {
    return <div className={styles.loading}>Error...!</div>;
  }

  // 2. No NFTs - mint page
  if (memberNfts.length === 0 || networkMismatch) {
    return (
<>
        <MintMember />
</>
    );
  }
  
  // 3. Has NFT already - show button to take to staking
  ///////////////////////////////////////////////////////////////////////////
  // Write Functions
  ///////////////////////////////////////////////////////////////////////////
  async function stakeNft(id: string) {
    if (!address) return;

    const isApproved = await nftCollection?.isApproved(
      address,
      stakingContractAddress
    );
    // If not approved, request approval
    if (!isApproved) {
      await nftCollection?.setApprovalForAll(stakingContractAddress, true);
    }
    const stake = await contract?.call("stake", id);
  }

  async function withdraw(id: BigNumber) {
    const withdraw = await contract?.call("withdraw", id);
  }

  async function claimRewards() {
    const claim = await contract?.call("claimRewards");
  }

  if (isLoading) {
		  <div className={styles.loading}>
		  <Spinner
			  thickness='4px'
			  speed='0.65s'
			  emptyColor='gray.200'
			  color='blue.500'
			  size='xl' />
          </div>;
  }

  return (
    <div className={styles.StakeContainer}>

      {!address ? (
		  <div className={styles.loading} style={{marginTop: '-96px'}}>
      <h1 className={styles.h1} style={{fontFamily: 'Caveat'}}>& <br/>Stake Your NFTs</h1>

      <br className={`${styles.divider} ${styles.spacerTop}`} />
        <Stack flex={2} direction={{ md: 'row', base: 'column'}} spacing={{ base: 5, md: 5 }}>
            <Button onClick={onOpen}
              colorScheme={'green'}
              bg={'green.400'}
              rounded={'full'}
              px={6}
              _hover={{
                bg: 'green.500',
              }}>
              Connect Wallet
            </Button>
			<AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
		motionPreset='slideInBottom'
		isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Connect Wallet
            </AlertDialogHeader>

            <AlertDialogBody>
              <Menu>
                  <MenuDivider />
                  <MenuItem onClick={() => {connectWithMetamask(), onClose()}} className={styles.hoverItem}>Metamask</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={() => {connectWithWalletConnect(), onClose()}} className={styles.hoverItem}>WalletConnect</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={() => {connectWithCoinbaseWallet(), onClose()}} className={styles.hoverItem}>CoinBase</MenuItem>
                  <MenuDivider />
              </Menu>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} colorScheme='red'>
                Cancel
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
            <Box style={{position: 'absolute', top: '-35px'}}>
              <Icon
                as={Arrow}
                color={color}
                w={71}
                position={'absolute'}
                right={-145}
                top={'55px'}
                transform={'rotate(-100deg)'}
              />
              <Text
                fontSize={'lg'}
                fontFamily={'Caveat'}
                position={'absolute'}
                right={'-105px'}
                top={'10px'}
                transform={'rotate(10deg)'}>
                Sign Your Wallet
              </Text>
            </Box>
</Stack>
		  </div>
      ) : (
        <>
    <Container maxW={'5xl'} py={12}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
    <Center py={6}>
      <Box
        maxW={'100%'}
        w={'full'}
        bg={bgColor}
        boxShadow={'2xl'}
        rounded={'md'}
        overflow={'hidden'}>
        <Image
          h={'120px'}
          w={'full'}
          src={
            'https://images.unsplash.com/photo-1612865547334-09cb8cb455da?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
          }
          objectFit={'cover'}
        />
        <Flex justify={'center'} mt={-12}>
          <Avatar
            size={'xl'}
            src={
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ'
            }
            alt={'Author'}
            css={{
              border: '2px solid white',
            }}
          />
        </Flex>

        <Box p={6}>
          <Stack spacing={0} align={'center'} mb={5}>
            <Heading fontSize={'2xl'} fontWeight={500} fontFamily={'body'}>
              Your Token
            </Heading>
            <Text color={'gray.500'}>Staking Reward</Text>
          </Stack>

          <Stack direction={{ md: 'column', base: 'column'}} justify={'center'} spacing={6}>
            <Stack spacing={0} align={'center'}>
              <Text fontWeight={600}>
                <b>{tokenBalance?.displayValue}</b> {tokenBalance?.symbol}</Text>
              <Text fontSize={'sm'} color={'gray.500'}>
                Balance
              </Text>
            </Stack>
            <Stack spacing={0} align={'center'}>
              <Text fontWeight={600}>
                <b>
                  {!claimableRewards
                    ? "Loading..."
                    : ethers.utils.formatUnits(claimableRewards, 18)}
                </b>{" "}
                {tokenBalance?.symbol}</Text>
              <Text fontSize={'sm'} color={'gray.500'}>
                Claimable
              </Text>
            </Stack>
          </Stack>

          <Button
            onClick={() => claimRewards()}
            w={'full'}
            mt={8}
            bg={bgColor}
            color={'white'}
            rounded={'md'}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}>
            Claim Rewards
          </Button>
        </Box>
      </Box>
    </Center>
	
      <Box my={6}
        maxW={'100%'}
        w={'full'}
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow={'2xl'}
        rounded={'md'}
        overflow={'hidden'}>
<Tabs isFitted variant='enclosed'>
  <TabList mb='1em'>
    <Tab>Your Unstaked NFTs</Tab>
    <Tab>Your Staked NFTs</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>
            {ownedNfts?.map((nft) => (
              <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMedia}
                />
                <h3>{nft.metadata.name}</h3>
                <button
                  className={`${styles.mainButton} ${styles.spacerBottom}`}
                  onClick={() => stakeNft(nft.metadata.id)}
                >
                  Stake
                </button>
              </div>
            ))}
    </TabPanel>
    <TabPanel>
            {stakedNfts?.map((nft) => (
              <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMedia}
                />
                <h3>{nft.metadata.name}</h3>
                <button
                  className={`${styles.mainButton} ${styles.spacerBottom}`}
                  onClick={() => withdraw(nft.metadata.id)}
                >
                  Withdraw
                </button>
              </div>
            ))}
    </TabPanel>
  </TabPanels>
</Tabs>
        </Box>
      </SimpleGrid>
    </Container>
        </>
      )}
    </div>
  );
};

export default Stake;

const Arrow = createIcon({
  displayName: 'Arrow',
  viewBox: '0 0 72 24',
  path: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.600904 7.08166C0.764293 6.8879 1.01492 6.79004 1.26654 6.82177C2.83216 7.01918 5.20326 7.24581 7.54543 7.23964C9.92491 7.23338 12.1351 6.98464 13.4704 6.32142C13.84 6.13785 14.2885 6.28805 14.4722 6.65692C14.6559 7.02578 14.5052 7.47362 14.1356 7.6572C12.4625 8.48822 9.94063 8.72541 7.54852 8.7317C5.67514 8.73663 3.79547 8.5985 2.29921 8.44247C2.80955 9.59638 3.50943 10.6396 4.24665 11.7384C4.39435 11.9585 4.54354 12.1809 4.69301 12.4068C5.79543 14.0733 6.88128 15.8995 7.1179 18.2636C7.15893 18.6735 6.85928 19.0393 6.4486 19.0805C6.03792 19.1217 5.67174 18.8227 5.6307 18.4128C5.43271 16.4346 4.52957 14.868 3.4457 13.2296C3.3058 13.0181 3.16221 12.8046 3.01684 12.5885C2.05899 11.1646 1.02372 9.62564 0.457909 7.78069C0.383671 7.53862 0.437515 7.27541 0.600904 7.08166ZM5.52039 10.2248C5.77662 9.90161 6.24663 9.84687 6.57018 10.1025C16.4834 17.9344 29.9158 22.4064 42.0781 21.4773C54.1988 20.5514 65.0339 14.2748 69.9746 0.584299C70.1145 0.196597 70.5427 -0.0046455 70.931 0.134813C71.3193 0.274276 71.5206 0.70162 71.3807 1.08932C66.2105 15.4159 54.8056 22.0014 42.1913 22.965C29.6185 23.9254 15.8207 19.3142 5.64226 11.2727C5.31871 11.0171 5.26415 10.5479 5.52039 10.2248Z"
      fill="currentColor"
    />
  ),
});
