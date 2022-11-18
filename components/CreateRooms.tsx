import {
  Box, Button,
  StackDivider,
  VStack
} from '@chakra-ui/react'
import * as React from 'react'
import {useQuery} from 'urql';
import {BigNumber, utils} from 'ethers';
import {truncateAddress} from "../utils/truncate";
import {ADDRESS_ZERO} from "../utils/constants";
import {OPEN_ROOMS} from "../utils/queries";
import {useAccount, useSigner} from 'wagmi'
import {ModalEnter} from "./ModalEnter";
import {getRockPaperScissorContract} from "../contracts-ts/contracts";
import {solidityKeccak256} from "ethers/lib/utils";
import {useLocalSalt} from "./useLocalSalt";

export const CreateRooms = () => {

  const [open_rooms] = useQuery({
    query: OPEN_ROOMS,
  });

  const {data: signer, isError, isLoading} = useSigner()
  const {address, isConnected} = useAccount()
  const salt = useLocalSalt()

  const {data, fetching, error} = open_rooms;

  if (fetching) return <pre>"Loading..."</pre>
  if (error) return <pre>{error.message}</pre>

  const createRoom = async () => {
    if(signer){
      const game = getRockPaperScissorContract(signer)
      const handEncrypt = solidityKeccak256(["string", "uint8", "address"], [salt, 2, address]);
      console.log(handEncrypt);
      await game.createRoom(ADDRESS_ZERO, BigNumber.from("1000000000000000"), handEncrypt, {from: address, value: BigNumber.from("1000000000000000")})
    }
  }

  return (
    <>
      <Button onClick={()=>createRoom()} >Create Room</Button>
    </>
  )
}