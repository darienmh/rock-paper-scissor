import * as React from 'react'
import { Box, Button, Container, Heading, Stack, Text, useBreakpointValue } from '@chakra-ui/react'
import {ConnectButton} from "@rainbow-me/rainbowkit";
import styles from "../styles/Home.module.css";

export const Header = () => (
  <Box as="section" bg="bg-surface">
    <Container py={{ base: '16', md: '24' }}>
      <Stack spacing={{ base: '8', md: '10' }}>
        <Stack spacing={{ base: '4', md: '5' }} align="center">

          <Heading as='h1'  noOfLines={1} pb={3}>
            Rock - Paper - Scissor Web3 Game
          </Heading>

          <ConnectButton accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'full',
          }}/>


          <h1 className={styles.title}>

          </h1>

          <Text fontSize='xl'>
            Deployed at Polygon Mumbai, get funds on the official faucet <a href="https://faucet.polygon.technology/"
                                                                            rel="noreferrer" className={styles.a}>
            official faucet &rarr;
          </a>
          </Text>
        </Stack>
      </Stack>
    </Container>
  </Box>
)