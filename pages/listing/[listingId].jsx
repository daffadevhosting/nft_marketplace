import {
  MediaRenderer,
  useContract,
  useNetwork,
  useNetworkMismatch,
  useListing,
  useContractRead
} from "@thirdweb-dev/react";
import {
  Container,
  Stack,
  Flex,
  Box,
  Heading,
  Text,
  Input,
  Button,
  Image,
  Icon,
  IconButton,
  createIcon,
  IconProps,
  useColorModeValue,
  Spinner,
  Portal,
  useToast,
} from '@chakra-ui/react';
import { ChainId, ListingType, NATIVE_TOKENS } from "@thirdweb-dev/sdk";
import { useRouter } from "next/router";
import React, { useContext, useState, useRef } from "react";
import { MARKETPLACE_ADDRESS, NFT_COLLECTION_ADDRESS } from "../../const/contractAddresses";
import { ChainName } from '../../const/aLinks';
import styles from "../../styles/Theme.module.css";

const activeChainId = parseInt(`${process.env.NEXT_PUBLIC_CHAIN_ID}`)
const contracAddress = NFT_COLLECTION_ADDRESS;
const contractType = 'ERC-721';
const networkName = ChainName();

export default function ListingPage() {

  const [copySuccess, setCopySuccess] = useState('');
  const TextRef = useRef(null);
  const alert = useToast();

  function copyToClipboard(e) {
    TextRef.current.select();
    document.execCommand('copy');
    // This is just personal preference.
    // I prefer to not show the whole text area selected.
    e.target.focus();
    setCopySuccess('Berhasil di salin');
  };
  
  const router = useRouter();
  const { listingId } = router.query;
  const ref = React.useRef()

  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  const { contract: marketplace } = useContract(
    MARKETPLACE_ADDRESS,
    "marketplace"
  );
  const { data: listing, isLoading: loadingListing } = useListing(
    marketplace,
    listingId
  );

  if (listing?.secondsUntilEnd === 0) {
  }

  const [bidAmount, setBidAmount] = useState("");

  if (loadingListing) {
    return <div className={styles.loading}>
		  <Spinner
			  thickness='4px'
			  speed='0.65s'
			  emptyColor='gray.200'
			  color='blue.500'
			  size='xl' />
		   </div>;
  }

  if (!listing) {
    return <div className={styles.loading}>Listing not found</div>;
  }

  async function createBidOrOffer() {
    try {
      // Ensure user is on the correct network
      if (networkMismatch) {
        switchNetwork && switchNetwork(Number(process.env.NEXT_PUBLIC_CHAIN_ID));
        return;
      }

      // If the listing type is a direct listing, then we can create an offer.
      if (listing?.type === ListingType.Direct) {
        await marketplace?.direct.makeOffer(
          listingId, // The listingId of the listing we want to make an offer for
          1, // Quantity = 1
          NATIVE_TOKENS[activeChainId].wrapped.address, // Wrapped Ether address on Goerli
          bidAmount // The offer amount the user entered
        );
      }

      // If the listing type is an auction listing, then we can create a bid.
      if (listing?.type === ListingType.Auction) {
        await marketplace?.auction.makeBid(listingId, bidAmount);
      }

      alert(
        `${
          listing?.type === ListingType.Auction ? "Bid" : "Offer"
        } created successfully!`
      );
    } catch (err) {
      console.error(err.message || "something went wrong");
      alert({
              title: 'GAGAL',
			  description: "Pembelian NFT, Gagal.",
			  status: 'error',
			  duration: 6000,
			  isClosable: true,
            });
    }
  }

  async function buyNft() {
    try {
      if (networkMismatch) {
        switchNetwork && switchNetwork(Number(process.env.NEXT_PUBLIC_CHAIN_ID));
        return;
      }

      await marketplace?.buyoutListing(listingId, 1);
      alert({
          title: 'Berhasil.',
          description: "Pembelian NFT Berhasil...",
          status: 'success',
          duration: 6000,
          isClosable: true,
        });
    } catch (err) {
      console.error(err.message);
      alert({
              title: 'GAGAL',
			  description: "Pembelian NFT, Gagal. Pastikan saldo token mencukupi",
			  status: 'error',
			  duration: 6000,
			  isClosable: true,
            });
    }
  }
  
  return (
    <Container maxW={'5xl'}>
      <Stack
        align={'center'}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 20, md: 20 }}
        direction={{ base: 'column', md: 'row' }}>
        <Flex
          flex={1}
          justify={'center'}
          align={'center'}
          position={'relative'}
          w={'full'}>
          <Box
            position={'relative'}
            height={'auto'}
            rounded={'2xl'}
            boxShadow={'2xl'}
            width={'full'}
            overflow={'hidden'}>
          <MediaRenderer
            src={listing.asset.image}
              fit={'cover'}
              align={'center'}
              w={'100%'}
              h={'100%'}
			  style={{objectFit: 'cover', objectPosition: 'center', margin: 'auto'}}
          />
          </Box>
        </Flex>
        <Stack flex={1} spacing={{ base: 5, md: 10 }} style={{marginBottom: '35px'}}>
          <Heading
            lineHeight={1.1}
            fontWeight={600}
            fontSize={{ base: '3xl', sm: '4xl', lg: '4xl' }}>
            <Text
              as={'span'}
              position={'relative'}
              textShadow={'2px 1px 6px #000000ad'}
              _after={{
                content: "''",
                width: 'full',
                height: '35%',
                position: 'absolute',
                bottom: 1,
                left: 0,
                bg: 'blue.200',
                zIndex: -1,
              }}>
             {listing.asset.name}
            </Text>
            <br />
            <Text as={'span'} color={'red.500'}>
            Owned by <b>{listing.sellerAddress?.slice(0, 7)}</b>
            </Text>
          </Heading>
    <Box bg='white.400' textAlign='left' padding='10px' mt={0} className={styles.portalW}>
          <Text color={'gray.500'} style={{fontSize: 15}}>
            <b>{listing.asset.description}</b>
          </Text>
            <br />
      <Portal containerRef={ref}>
      </Portal>
      <Box ref={ref} bg={'whiteAlpha.500'} padding='10px' borderRadius='8px' boxShadow='2px 2px 10px -2px #000000a8'>
	  Detail:
          <Text fontSize={'sm'} style={{marginTop: '20px'}}>
             <b> ID token: {listing.asset.id}</b>
			 <br/>
<b> Type: {contractType}</b>
<br/>
<b> Chain: {networkName}</b>
		</Text>
      {
       document.queryCommandSupported('copy') &&
	   <div>
        <Text>
		  <b>Contract:</b>{" "}
          <Button onClick={copyToClipboard} variant={'link'} colorScheme={'blue'} title={'Salin'}> {contracAddress.slice(0, 3).concat("...").concat(contracAddress.slice(-4))}</Button> 
		</Text>
          {copySuccess}
        </div>
      }
      <form style={{position: 'fixed', bottom: '-9999px'}}>
        <input
		  style={{height: '0px'}}
          ref={TextRef}
          value='0xd928c0977ae3dbc6561e4731d388e4335c24ed5a'
        />
      </form>
      </Box>
    </Box>
          <Text color={'gray.500'} style={{fontSize: 25, marginTop: 5}}>
            <b>{listing.buyoutCurrencyValuePerToken.displayValue}</b>{" "}
            {listing.buyoutCurrencyValuePerToken.symbol}
          </Text>
          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={{ base: 'column', sm: 'row', }}
			style={{margin: '6px auto'}}>
            <Button
			  width={'248px'}
              rounded={'full'}
              size={'md'}
              fontWeight={'normal'}
              px={6}
              colorScheme={'blue'}
              bg={'blue.400'}
              _hover={{ bg: 'blue.600' }}
              onClick={buyNft}
			  style={{fontWeight: 700, color: 'white'}}>
              Buy
            </Button>
            <div
              style={{
                display: "none",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Input
                type="text"
                name="bidAmount"
                className={styles.textInput}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Amount"
                style={{ marginTop: 0, marginLeft: 0, width: 128, height: 40 }}
              />
              <Button
                onClick={createBidOrOffer}
              >
                Make Offer
              </Button>
            </div>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
