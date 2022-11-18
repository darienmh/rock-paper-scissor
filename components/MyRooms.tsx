import {Box, Button, StackDivider, VStack} from '@chakra-ui/react'
import * as React from 'react'
import {useQuery} from 'urql';
import {utils} from 'ethers';
import {truncateAddress} from "../utils/truncate";
import {ADDRESS_ZERO} from "../utils/constants";
import {MY_ROOMS} from "../utils/queries";


export const MyRooms = (props: any) => {

  const [open_rooms] = useQuery({
    query: MY_ROOMS(props.address),
  });

  const {data, fetching, error} = open_rooms;

  if (fetching) return <pre>"Loading..."</pre>
  if (error) return <pre>{error.message}</pre>


  return (
    <>
      {
        data && (
          <Box>

            <VStack
              divider={<StackDivider borderColor='gray.200' />}
              spacing={4}
              align='stretch'
            >
              {data.rooms.map((room: any) => (
                <Box key={room.id} p={2}>
                  <Box>
                    ID: {truncateAddress(room.room)} - Price: {utils.formatEther(room.bet)} {room.token == ADDRESS_ZERO ? 'MATIC' : 'Token'}
                    {" Player1:"} {truncateAddress(room.player1)}
                  </Box>
                </Box>
              ))}
            </VStack>
          </Box>
        )
      }
    </>
  )
}