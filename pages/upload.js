import React, { useState, useRef } from "react";
import {
  useContract,
  useNetwork,
  useNetworkMismatch,
  useAddress,
  useSDK,
  useCreateDirectListing,
  useCreateAuctionListing
} from "@thirdweb-dev/react";
import { ChainId, NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS, } from "../const/contractAddresses";
import {
  Image, Container,
  Flex, Stack, Button,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  ButtonGroup
} from '@chakra-ui/react';
import { useRouter } from "next/router";
import LoginModal from "../components/Login";
import Footer from "../components/Footer";
import css from "../styles/css.module.scss";

const activeChainId =  parseInt(`${process.env.NEXT_PUBLIC_CHAIN_ID}`);

const Upload = () => {
  const address = useAddress();
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const sdk = useSDK();
  const alert = useToast();
  const initRef = React.useRef();

  const [creatingListing, setCreatingListing] = useState(false);

  const { contract: nftCollection } = useContract(
    NFT_COLLECTION_ADDRESS,
    "nft-collection"
  );
  const { contract: marketplace } = useContract(
    MARKETPLACE_ADDRESS,
    "marketplace"
  );

  const { mutateAsync: makeDirectListing } =
    useCreateDirectListing(marketplace);
  const { mutateAsync: makeAuctionListing } =
    useCreateAuctionListing(marketplace);

  // Other hooks
  const router = useRouter();
  const [file, setFile] = useState();
  const fileInputRef = useRef(null);

  // This function gets called when the form is submitted.
  async function handleCreateListing(e) {
    setCreatingListing(true);
    try {
      // Prevent page from refreshing
      e.preventDefault();

      // De-construct data from form submission
      const { listingType, name, description, price } = e.target.elements;

      console.log({
        listingType: listingType.value,
        name: name.value,
        description: description.value,
        price: price.value,
      });

      // Ensure user is on the correct network
      if (networkMismatch) {
        switchNetwork?.(activeChainId);
        return;
      }

      // Upload image using storage SDK
      const img = await sdk.storage.upload(file);

      // Signature Mint NFT, get info (fetch generate mint signature)
      const req = await fetch("/api/generate-mint-signature", {
        method: "POST",
        body: JSON.stringify({
          address,
          name: e.target.elements.name.value,
          description: e.target.elements.description.value,
          image: img,
        }),
      });

      const signedPayload = (await req.json()).signedPayload;

      const nft = await nftCollection?.signature.mint(signedPayload);

      const mintedTokenId = nft.id.toNumber();

      // Store the result of either the direct listing creation or the auction listing creation
      let transactionResult = undefined;

      // Depending on the type of listing selected, call the appropriate function
      // For Direct Listings:
      if (listingType.value === "directListing") {
        transactionResult = await createDirectListing(
          NFT_COLLECTION_ADDRESS,
          mintedTokenId,
          price.value
        );
      }

      // For Auction Listings:
      if (listingType.value === "auctionListing") {
        transactionResult = await createAuctionListing(
          NFT_COLLECTION_ADDRESS,
          mintedTokenId,
          price.value
        );
      }

      if (transactionResult) {
        router.push(`/`);
      }
    } catch (error) {
      console.error(error);
      alert({
          title: 'Upload Gagal.',
          description: "Upload NFT gagal. Check the console for more details",
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
    } finally {
      setCreatingListing(false);
    }
  }

  async function createAuctionListing(contractAddress, tokenId, price) {
    try {
      makeAuctionListing(
        {
          assetContractAddress: contractAddress,
          buyoutPricePerToken: price,
          currencyContractAddress: NATIVE_TOKEN_ADDRESS,
          listingDurationInSeconds: 60 * 60 * 24 * 7,
          quantity: 1,
          reservePricePerToken: 0,
          startTimestamp: new Date(),
          tokenId: tokenId,
        },
        {
          onSuccess: (tx) => {
              alert({
                  title: 'Success.',
                  description: "NFT berhasil di upload.",
                  status: 'success',
                  duration: 7000,
                  isClosable: true,
                });
              router.push(`/`);
          },
        }
      );
    } catch (error) {
      alert({
          title: 'Error.',
          description: "NFT gagal di upload.",
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        window.location.reload();
    }
  }

  async function createDirectListing(contractAddress, tokenId, price) {
    try {
      makeDirectListing(
        {
          assetContractAddress: contractAddress,
          buyoutPricePerToken: price,
          currencyContractAddress: NATIVE_TOKEN_ADDRESS,
          listingDurationInSeconds: 60 * 60 * 24 * 7,
          quantity: 1,
          startTimestamp: new Date(0),
          tokenId: tokenId,
        },
        {
          onSuccess: (tx) => {
              alert({
                  title: 'Success.',
                  description: "NFT berhasil di upload.",
                  status: 'success',
                  duration: 7000,
                  isClosable: true,
                });
              router.push(`/`);
          },
        }
      );
    } catch (error) {
      alert({
          title: 'Error.',
          description: "NFT gagal di upload.",
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        window.location.reload();
    }
  }

  const uploadFile = () => {
    if (fileInputRef?.current) {
      fileInputRef.current.click();

      fileInputRef.current.onchange = () => {
        if (fileInputRef?.current?.files?.length) {
          const file = fileInputRef.current.files[0];
          setFile(file);
        }
      };
    }
  };

  return (
<>
    <form onSubmit={(e) => handleCreateListing(e)}>
      <div className={css.container}>
        <div className={css.collectionContainer}>
    <Stack className={css.boxBorder} minH={'50vh'} h={{ base: '-webkit-fill-available', md: 435 }} direction={{ base: 'column', md: 'row' }} p={{ base: 2, md: 10 }} maxW={940} m={{ base: '6px', md: 'auto' }} w={{base: 'auto', md: '100%'}}>
      <Flex flex={1}>
          {file ? (
            <Image
              src={URL.createObjectURL(file)} alt=''
              style={{
                maxWidth: '100%',
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                maxHeight: 420, cursor: "pointer", 
                borderRadius: 8, margin: 'auto', overflow: 'hidden' }}
              onClick={() => setFile(undefined)}
            />
          ) : (
            <div
              className={css.imageInput}
              onClick={uploadFile}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setFile(e.dataTransfer.files[0]);
              }}
            >
              Drag and drop an image here to upload it!
            </div>
          )}
      </Flex>
      <Flex p={4} flex={1} align={'center'} justify={'center'}>
        <Stack spacing={4} w={'full'} maxW={'md'}>
          <h1 className={css.ourCollection}>
            Upload your NFT
          </h1>
          <input
            type="file"
            accept="image/png, image/gif, image/jpeg"
            id="profile-picture-input"
            ref={fileInputRef}
            style={{ display: "none" }}
          />

          <input
            type="text"
            name="name"
            className={css.textInput}
            placeholder="Name"
          />

          <input
            type="text"
            name="description"
            className={css.textInput}
            placeholder="Description"
          />

          <input
            type="text"
            name="price"
            className={css.textInput}
            placeholder="Price (in TBNB)"
          />

          <div style={{display: 'flex', justifyContent: 'space-between', gap: '10px'}}>
<Button>
            <input
              type="radio"
              name="listingType"
              id="directListing"
              value="directListing"
              defaultChecked
            />
            <label htmlFor="directListing" className={css.listingTypeLabel} style={{padding: '10px'}}>
              Direct Listing
            </label>
</Button>
<Button>
            <input
              type="radio"
              name="listingType"
              id="auctionListing"
              value="auctionListing"
            />
            <label htmlFor="auctionListing" className={css.listingTypeLabel} style={{padding: '10px'}}>
              Auction Listing
            </label>
</Button>
          </div>
        {address ? (
<Popover isLazy closeOnBlur={false} placement='top-start' initialFocusRef={initRef}>
      {({ isOpen, onClose }) => (
        <>
  <PopoverTrigger>
    <Button bg={'blue'} color={'white'} _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
              bg: 'blue.800',
            }} isLoading={creatingListing} loadingText='Loading' spinnerPlacement='start'>{creatingListing ? "Wait... Loading... " : "Upload NFT"}</Button>
  </PopoverTrigger>
  <PopoverContent>
    <PopoverHeader fontWeight='semibold'>Confirmation</PopoverHeader>
    <PopoverArrow />
    <PopoverCloseButton />
    <PopoverBody>
      There will be at least 2 to 3 transactions for NFT uploads, do you agree?
    </PopoverBody>
          <PopoverFooter display='flex' justifyContent='flex-end'>
            <ButtonGroup size='sm'>
              <Button variant='outline'
                  onClick={onClose}>No way</Button>
              <Button type="submit" colorScheme='green' onClick={onClose}>Ok, Do it</Button>
            </ButtonGroup>
          </PopoverFooter>
  </PopoverContent>
        </>
      )}
</Popover>
          ) : (
          <h2>
            Connect your wallet
          </h2>
		)}
        </Stack>
      </Flex>
    </Stack>
        </div>
      </div>
    </form>
<LoginModal />
</>
  );
};

export default Upload;
