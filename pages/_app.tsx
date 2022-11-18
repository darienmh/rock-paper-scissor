import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { createClient as createClientQl, Provider } from 'urql';
import { ChakraProvider } from '@chakra-ui/react'

const { chains, provider, webSocketProvider } = configureChains(
  [
    chain.polygonMumbai,
  ],
  [
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Rock Paper Scissor Game',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

const client = createClientQl({
  url: 'https://api.thegraph.com/subgraphs/name/darienmh/rock-paper-scissor',
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Provider value={client}>
          <ChakraProvider>
              <Component {...pageProps} />
          </ChakraProvider>
        </Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
