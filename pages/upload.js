import React, { useState } from "react";
import {
  useContract,
  useNetwork,
  useNetworkMismatch,
  useAddress,
  useSDK,
  useCreateDirectListing,
  useCreateAuctionListing,
} from "@thirdweb-dev/react";
import { ChainId, NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from "../const/contractAddresses";
import { useRouter } from "next/router";
import { useContext, useRef } from "react";
import { Button, useToast } from '@chakra-ui/react';
import Image from 'next/image';
import styles from "../styles/Theme.module.css";

const activeChainId = parseInt(`${process.env.NEXT_PUBLIC_CHAIN_ID}`)

const Create = () => {
  const address = useAddress();
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const sdk = useSDK();

  const alert = useToast()

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

      // If the transaction succeeds, take the user back to the homepage to view their listing!
      if (transactionResult) {
        router.push(`/listings`);
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
          assetContractAddress: contractAddress, // Contract Address of the NFT
          buyoutPricePerToken: price, // Maximum price, the auction will end immediately if a user pays this price.
          currencyContractAddress: NATIVE_TOKEN_ADDRESS, // NATIVE_TOKEN_ADDRESS is the crpyto curency that is native to the network. i.e. Goerli ETH.
          listingDurationInSeconds: 60 * 60 * 24 * 7, // When the auction will be closed and no longer accept bids (1 Week)
          quantity: 1, // How many of the NFTs are being listed (useful for ERC 1155 tokens)
          reservePricePerToken: 0, // Minimum price, users cannot bid below this amount
          startTimestamp: new Date(), // When the listing will start
          tokenId: tokenId, // Token ID of the NFT.
        },
        {
          onSuccess: (tx) => {
            return tx;
          },
        }
      );
    } catch (error) {
      console.error(error)
      alert({
          title: 'Error.',
          description: "NFT gagal di upload.",
          status: 'error',
          duration: 7000,
          isClosable: true,
        })
    }
  }

  async function createDirectListing(contractAddress, tokenId, price) {
    try {
      makeDirectListing(
        {
          assetContractAddress: contractAddress, // Contract Address of the NFT
          buyoutPricePerToken: price, // Maximum price, the auction will end immediately if a user pays this price.
          currencyContractAddress: NATIVE_TOKEN_ADDRESS, // NATIVE_TOKEN_ADDRESS is the crpyto curency that is native to the network. i.e. Goerli ETH.
          listingDurationInSeconds: 60 * 60 * 24 * 7, // When the auction will be closed and no longer accept bids (1 Week)
          quantity: 1, // How many of the NFTs are being listed (useful for ERC 1155 tokens)
          startTimestamp: new Date(0), // When the listing will start
          tokenId: tokenId, // Token ID of the NFT.
        },
        {
          onSuccess: (tx) => {
            return tx;
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  // Function to store file in state when user uploads it
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
    <form onSubmit={(e) => handleCreateListing(e)}>
      <div className={styles.container}>
        {/* Form Section */}
        <div className={styles.collectionContainer} style={{marginTop: 0}}>
          <h1 className={styles.ourCollection}>
            Upload your NFT to the marketplace:
          </h1>

		  <div className={styles.uploadSection}>
<div className={styles.upload}>
          {file ? (
            <Image width={350} height={350} alt='upload'
              src={URL.createObjectURL(file)}
              style={{ cursor: "pointer", height: 350, maxHeight: 350, width: 350, borderRadius: 8 }}
              onClick={() => setFile(undefined)}
            />
          ) : (
            <div
              className={styles.imageInput}
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
		  </div>
		  <div className={styles.inputDesc}>
          <input
            type="file"
            accept="image/png, image/gif, image/jpeg"
            id="profile-picture-input"
            ref={fileInputRef}
            style={{ display: "none" }}
          />

          {/* Sale Price For Listing Field */}
          <input
            type="text"
            name="name"
            className={styles.textInput}
            placeholder="Name"
            style={{ minWidth: "320px" }}
          />

          {/* Sale Price For Listing Field */}
          <input
            type="text"
            name="description"
            className={styles.textInput}
            placeholder="Description"
            style={{ minWidth: "320px" }}
          />

          {/* Sale Price For Listing Field */}
          <input
            type="text"
            name="price"
            className={styles.textInput}
            placeholder="Price (in BNB)"
            style={{ minWidth: "320px" }}
          />
          <div className={styles.listingTypeContainer}>
            <input
              type="radio"
              name="listingType"
              id="directListing"
              value="directListing"
              defaultChecked
              className={styles.listingType}
            />
            <label htmlFor="directListing" className={styles.listingTypeLabel}>
              Direct Listing
            </label>
            <input
              type="radio"
              name="listingType"
              id="auctionListing"
              value="auctionListing"
              className={styles.listingType}
            />
            <label htmlFor="auctionListing" className={styles.listingTypeLabel}>
              Auction Listing
            </label>
          </div>

        {address ? (
          <Button 
            type="submit"
            className={styles.mainButton}
            style={{ marginTop: 32, borderStyle: "none" }}
            disabled={creatingListing}
          >
{networkMismatch ? (
<>
Switch Network
</>
) : (
<>
            {creatingListing ? "Loading..." : "Mint + List NFT"}
			</>
)}
          </Button >
          ) : (
          <Button
            className={styles.mainButton}
            style={{ marginTop: 32, borderStyle: "none" }}
			disabled> Connect Wallet
          </Button >
		)}
		   </div>
		  </div>
        </div>
      </div>
    </form>
  );
};

export default Create;
