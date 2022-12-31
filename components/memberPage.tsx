import {
  Box,
  Center,
  useColorModeValue,
  Heading,
  Text,
  Stack,
  Image,
  useToast,
  Button
} from '@chakra-ui/react';
import {
  ThirdwebNftMedia,
  useAddress,
  useNetwork,
  useNetworkMismatch,
  useClaimNFT,
  useActiveClaimCondition,
  useContract,
  useNFT
} from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import React, { useState } from "react";
import { MEMBERPASS_CONTRACT_ADDRESS, INITIAL_TOKEN_PRICE } from "../const/contractAddresses";
import { ChainName } from "../const/aLinks";
import { RiSignalWifiErrorLine } from "react-icons/ri";
import styles from "../styles/Theme.module.css";

const IMAGE =
  '/botmember.png';
  const tokenId = 0;
  const price = INITIAL_TOKEN_PRICE
const network = ChainName();

export default function ProductSimple() {
  const { contract: editionDrop } = useContract(MEMBERPASS_CONTRACT_ADDRESS);
  const { mutate: claim, isLoading } = useClaimNFT(editionDrop);
  const address = useAddress();
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  
  const alert = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  const { data: nftMetadata } = useNFT(editionDrop, tokenId);

  const { data: activeClaimCondition } = useActiveClaimCondition(
    editionDrop,
    BigNumber.from(tokenId)
  );
  
  async function mint() {
    try {
      claim(
        {
            quantity: 1,
            to: address as string,
            tokenId: 0,
          },
        {
          onSuccess: (data) => {
            alert({
          title: 'Transaction Success.',
          description: "Your member claim, Success.",
          status: 'success',
          duration: 6000,
          isClosable: true,
        });
          },
          onError: (error) => {
            const e = error;
            alert({
              title: 'Gagal Claim Member...',
			  description: "Member claim, Gagal.",
			  status: 'error',
			  duration: 6000,
			  isClosable: true,
            });
          },
        }
      );
    } catch (error) {
            alert({
              title: 'Error Unknown',
			  status: 'error',
			  duration: 6000,
			  isClosable: true,
            });
        }
  }
  
  return (
    <Center py={12} className={styles.loading}>
{networkMismatch ? (
<>
            <Button leftIcon={<RiSignalWifiErrorLine />}
              colorScheme={'blue'}
              bg={'blue.400'}
              _hover={{ bg: 'blue.600' }}
			  className={`${styles.spacerBottom}`}
              onClick={() => switchNetwork(Number(process.env.NEXT_PUBLIC_CHAIN_ID))}>
Switch to {network}
            </Button>
</>
) : (
      <Box style={{width: 'max-content'}}
        role={'group'}
        p={6}
        maxW={'330px'}
        w={'full'}
        bg={bgColor}
        boxShadow={'2xl'}
        rounded={'lg'}
        pos={'relative'}
        zIndex={1}>
        <Box
          rounded={'lg'}
          mt={-12}
          pos={'relative'}
          height={'230px'}
          _after={{
            transition: 'all .3s ease',
            content: '""',
            w: 'full',
            h: 'full',
            pos: 'absolute',
            top: 5,
            left: 0,
            backgroundImage: `url(${IMAGE})`,
            filter: 'blur(15px)',
            zIndex: -1,
          }}
          _groupHover={{
            _after: {
              filter: 'blur(20px)',
            },
          }}>
          <Image
            rounded={'lg'}
            width={282}
            objectFit={'cover'}
            src={IMAGE}
          />
        </Box>
        <Stack pt={10} align={'center'}>
          <Text color={'gray.500'} fontSize={'sm'} textTransform={'uppercase'}>
            Member Only
          </Text>
          <Heading fontSize={'2xl'} fontFamily={'body'} fontWeight={500}>
            Claim Member Card
          </Heading>
          <Stack direction={'column'} align={'center'}>
            <Text fontWeight={800} fontSize={'xl'}>
              {price}
            </Text>
			<br/>
      <Button
              colorScheme={'blue'}
              bg={'blue.400'}
              _hover={{ bg: 'blue.600' }}
        className={` ${styles.spacerBottom}`}
        onClick={() =>
          mint()
        }

      >
    Claim {price}
      </Button>
          </Stack>
        </Stack>
      </Box>
)}
    </Center>
  );
}