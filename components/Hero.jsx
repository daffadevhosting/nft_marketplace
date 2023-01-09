import {
  Stack,
  Flex,
  Button,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  useNetwork,
  useNetworkMismatch,
} from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import React, { useContext, useRef } from "react";
import { RiStore2Line, RiSignalWifiErrorLine } from "react-icons/ri";
import { FcGallery, FcShop } from "react-icons/fc";

export default function Hero() {

  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const router = useRouter();


  function homeClick() {
    router.push("/listings");
  }
  function uploadClick() {
    router.push("/upload");
  }
  function stakeClick() {
    router.push("/staking");
  }

  return (
    <Flex
      w={'full'}
      h={'100vh'}
      backgroundImage={
        'url(https://images.hdqwalls.com/download/abstract-blockchain-2t-2880x1800.jpg)'
      }
      backgroundSize={'cover'}
      backgroundPosition={'center center'}>
      <VStack
        w={'full'}
        justify={'center'}
        px={useBreakpointValue({ base: 4, md: 8 })}
        bgGradient={'linear(to-r, blackAlpha.600, transparent)'}>
        <Stack maxW={'2xl'} align={'center'} spacing={6}>
          <Text
            color={'white'}
            fontWeight={700}
            lineHeight={1.2}
            fontSize={useBreakpointValue({ base: '3xl', md: '4xl' })}>
            Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
            eiusmod tempor
          </Text>
          <Stack direction={'row'}>
{networkMismatch ? (
<>
            <Button leftIcon={<RiSignalWifiErrorLine />} variant={'outline'} bg={'whiteAlpha.300'} rounded={'full'} color={'white'} _hover={{ bg: 'whiteAlpha.500' }}px={6} onClick={() => switchNetwork(Number(process.env.NEXT_PUBLIC_CHAIN_ID))} colorScheme={'blue'} size={'md'}>
Switch Network
            </Button>
</>
) : (
<>
        <Stack flex={2} direction={{ md: 'row', base: 'column'}} spacing={{ base: 5, md: 5 }}>
            <Button leftIcon={<FcShop />} variant={'outline'} onClick={homeClick}
              colorScheme={'green'}
              color={'white'}
              bg={'green.400'}
              rounded={'full'}
              px={6}
              _hover={{
                bg: 'green.500',
              }}>
              Marketplace
            </Button>
            <Button leftIcon={<FcGallery />} variant={'outline'} onClick={uploadClick}
              colorScheme={'green'}
              bg={'green.400'}
              color={'white'}
              rounded={'full'}
              px={6}
              _hover={{
                bg: 'green.500',
              }}>
              Create Listing
            </Button>
            <Button leftIcon={<FcGallery />} variant={'outline'} onClick={stakeClick}
              colorScheme={'blue'}
              bg={'blue.400'}
              color={'white'}
              rounded={'full'}
              px={6}
              _hover={{
                bg: 'blue.500',
              }}>
              Stake NFT
            </Button>
</Stack>
</>
)}
          </Stack>
        </Stack>
      </VStack>
    </Flex>
  );
}
