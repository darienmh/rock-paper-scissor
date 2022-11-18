import {
  Box,
  StackDivider,
  VStack
} from '@chakra-ui/react'
import * as React from 'react'
import {useQuery} from 'urql';
import {BigNumber, utils} from 'ethers';
import {truncateAddress} from "../utils/truncate";
import {ADDRESS_ZERO} from "../utils/constants";
import {OPEN_ROOMS} from "../utils/queries";
import {useAccount} from 'wagmi'
import {ModalEnter} from "./ModalEnter";

export const OpenRooms = () => {

  const [open_rooms] = useQuery({
    query: OPEN_ROOMS,
  });

  const { address, isConnected } = useAccount()

  const {data, fetching, error} = open_rooms;

  if (fetching) return <pre>"Loading..."</pre>
  if (error) return <pre>{error.message}</pre>

  return (
    <Box>
      <VStack
        divider={<StackDivider borderColor='gray.200' />}
        spacing={4}
        align='stretch'
      >
        {data.rooms.map((room: any) => (
          <Box key={"box-" +room.id} p={2}>
            <Box>
              ID: {truncateAddress(room.room)} - Price: {utils.formatEther(room.bet)} {room.token == ADDRESS_ZERO ? 'MATIC' : 'Token'}
              {" Player1:"} {truncateAddress(room.player1)}
              {
                isConnected && room.player1.toLowerCase() != address?.toLowerCase() && (
                  <ModalEnter key={"modal-" + room.id} room={room.room} player1={room.player1} bet={BigNumber.from(room.bet)} />
                )
              }
            </Box>
          </Box>
        ))}
      </VStack>
    </Box>
  )
}