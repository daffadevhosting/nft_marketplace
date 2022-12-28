import {
  useAddress,
  useDisconnect,
  useMetamask, useWalletConnect, useCoinbaseWallet,
  useNetwork,
  useNetworkMismatch,
} from "@thirdweb-dev/react";
import { ReactNode } from 'react';
import {
  Box,
  Flex,
  Avatar,
  Link,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
  Center,
  useToast 
} from '@chakra-ui/react';
import Image from 'next/image';
import { useRouter } from "next/router";
import { useContext, useRef } from "react";
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { openseaUrl } from "../const/aLinks";
import { RiLoginCircleFill, RiWallet3Fill, RiShieldUserFill, RiSignalWifiErrorLine } from "react-icons/ri";

const Title = 'NFT marketplace';
const openseaLink = openseaUrl;
const Logo = "/icons/opensea.svg";

const NavLink = ({ children }, { children: ReactNode }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={'#'}>
    {children}
  </Link>
);


export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();
  const address = useAddress();
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  
  const color = useColorModeValue('gray.200', 'gray.700');
  
  const connectWithMetamask = useMetamask();
  const connectWithWalletConnect = useWalletConnect();
  const connectWithCoinbaseWallet = useCoinbaseWallet();
  const disconnectWallet = useDisconnect();

  function handleClick() {
    router.push("/upload");
  }
  function marketClick() {
    router.push("/listings");
  }
  function homeClick() {
    router.push("/");
  }
  function sellingClick() {
    router.push("/resell");
  }
  
  return (
    <>
      <Box bg={color} px={4} style={{position: 'fixed', width: '100%', zIndex: 99999, top: 0}}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Box onClick={homeClick} cursor={'pointer'}>{Title}</Box>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={5}>
              <Button>
  <Link href={openseaLink()} target="_blank" rel="noopener noreferrer" title="OpenSea" style={{height: 28,}}>
				<Image src={Logo} width={28} height={28} alt="logo" /></Link>
              </Button>
              <Button onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon size={32} /> : <SunIcon size={32} />}
              </Button>

              <Menu>
    <>
        {address ? (
		<>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <RiShieldUserFill
                    size={32}
                  />
                </MenuButton>
                <MenuList alignItems={'center'}>
                  <br />
                  <Center>
                    <RiWallet3Fill
                      size={60}
                    />
                  </Center>
                  <br />
                  <Center>
                    <p>{address.slice(0, 3).concat("").concat(address.slice(-4))}</p>
                  </Center>
                  <MenuDivider />
                  <Center>
					<Link href={"https://testnet.bnbchain.org/faucet-smart"} target="_blank" rel="noopener noreferrer" title="BNB faucet">tBNB Faucet</Link>
                  </Center>
                  <MenuDivider />
{networkMismatch ? (
<>
                  <MenuItem leftIcon={<RiSignalWifiErrorLine />} onClick={() => switchNetwork(Number(process.env.NEXT_PUBLIC_CHAIN_ID))} colorScheme={'blue'}>Switch Network</MenuItem>
</>
) : (
<>
                  <MenuItem onClick={marketClick}>Marketplace</MenuItem>
                  <MenuItem onClick={handleClick}>Create NFT</MenuItem>
                  <MenuItem onClick={sellingClick}>Resell NFT</MenuItem>
                  <MenuItem onClick={() => {disconnectWallet(), homeClick(), toast({
          title: 'Wallet Disconnected.',
          description: "You've disconnect your wallet.",
          status: 'success',
          duration: 6000,
          isClosable: true,
        })}
				  }>Logout</MenuItem>
</>
)}
                </MenuList>
	  </>
          ) : (
		  <>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <RiLoginCircleFill
                    size={32}
                  />
                </MenuButton>
                <MenuList alignItems={'center'}>
                  <br />
                  <Center>
                    <RiWallet3Fill
                      size={40}
                    />
                  </Center>
                  <br />
                  <Center>
                    <p>Connect Wallet</p>
                  </Center>
                  <br />
                  <MenuDivider />
                  <MenuItem onClick={connectWithMetamask}>Metamask</MenuItem>
                  <MenuItem onClick={connectWithWalletConnect}>WalletConnect</MenuItem>
                  <MenuItem onClick={connectWithCoinbaseWallet}>CoinBase</MenuItem>
                </MenuList>
		  </>
		)}
    </>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}