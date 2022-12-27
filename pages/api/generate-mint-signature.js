import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { NFT_COLLECTION_ADDRESS } from "../../const/contractAddresses";

export default async function generateMintSignature(req, res) {
  // De-construct body from request
  let { address, name, description, image } = JSON.parse(req.body);
  const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, "goerli");

  const nftContract = await sdk.getContract(
    NFT_COLLECTION_ADDRESS,
    "nft-collection"
  );

  const signedPayload = await nftContract.signature.generate({
    metadata: {
      name: name,
      description: description,
      image: image,
    },
    to: address,
    mintStartTime: new Date(0),
  });

  // return 200 and signedpayload
  res.status(200).json({
    signedPayload: JSON.parse(JSON.stringify(signedPayload)),
  });
}
