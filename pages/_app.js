import * as React from 'react'
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import { ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';
import Script from 'next/script';
import Header from "../components/Navbar";
import "../styles/globals.css";

const activeChainId =  parseInt(`${process.env.NEXT_PUBLIC_CHAIN_ID}`);
const Title = 'NFT Marketplace';

function MyApp({ Component, pageProps }) {
  return (
    <ThirdwebProvider desiredChainId={activeChainId}>
    <ChakraProvider>
      <Head>
        <title>{Title}</title>
<link rel="apple-touch-icon" sizes="180x180" href="/icons/fav/apple-touch-icon.png"/>
<link rel="icon" type="image/png" sizes="32x32" href="/icons/fav/favicon-32x32.png"/>
<link rel="icon" type="image/png" sizes="16x16" href="/icons/fav/favicon-16x16.png"/>
<link rel="manifest" href="/manifest.json" />
<link rel="mask-icon" href="/icons/fav/safari-pinned-tab.svg" color="#5bbad5"/>
<link rel="shortcut icon" href="/icons/fav/favicon.ico"/>
<meta name="msapplication-TileColor" content="#00aba9"/>
<meta name="msapplication-config" content="/icons/fav/browserconfig.xml"/>
<meta name="theme-color" content="#262936"/>
      </Head>
      <Header />
      <Component {...pageProps} />
    </ChakraProvider>
    </ThirdwebProvider>
  );
}

export default MyApp;
