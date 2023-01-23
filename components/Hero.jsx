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
import { ChainName } from "../const/aLinks";
import NotifWran from "./Notif";
import { RiStore2Line, RiSignalWifiErrorLine } from "react-icons/ri";
import { FcGallery, FcShop } from "react-icons/fc";

export default function Hero() {

  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const router = useRouter();

  const Jaringan = ChainName();
  const FontBreak = useBreakpointValue({ base: '2xl', md: '3xl' });

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
{networkMismatch ? (
<>
        <Stack maxW={'2xl'} align={'center'} spacing={6}>
          <Text
            color={'white'}
            fontWeight={700}
            lineHeight={1.2}
            fontSize={FontBreak}>
            Website ini berinteraksi di jaringan {Jaringan},<br/> silahkan ganti jaringan dompet kamu.
          </Text>
          <Stack direction={'row'}>
            <Button leftIcon={<RiSignalWifiErrorLine />} variant={'outline'} bg={'whiteAlpha.300'} rounded={'full'} color={'white'} _hover={{ bg: 'whiteAlpha.500' }}px={6} onClick={() => switchNetwork(Number(process.env.NEXT_PUBLIC_CHAIN_ID))} colorScheme={'blue'} size={'md'}>
Ganti Jaringan
            </Button>
          </Stack>
        </Stack>
</>
) : (
<>
        <Stack maxW={'2xl'} align={'center'} spacing={6}>
          <Text
            color={'white'}
            fontWeight={700}
            lineHeight={1.2}
            fontSize={FontBreak}>
            Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
            eiusmod tempor
          </Text>
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
        </Stack>
<NotifWran />
</>
)}
      </VStack>
    </Flex>
  );
}
