import {
  Button,
  Modal, ModalBody, ModalCloseButton,
  ModalContent, ModalFooter,
  ModalHeader,
  ModalOverlay, Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import * as React from 'react'
import {useAccount, useSigner} from 'wagmi'
import {getRockPaperScissorContract} from "../contracts-ts/contracts";
import {formatEther, solidityKeccak256} from "ethers/lib/utils";
import {Radio, RadioGroup} from '@chakra-ui/react'
import {useState} from "react";
import {useLocalSalt} from "./useLocalSalt";


export const ModalEnter = (props: any) => {

  const {isOpen, onOpen, onClose} = useDisclosure()
  const salt = useLocalSalt()
  const [hand, setHand] = useState(0)

  const {data: signer, isError, isLoading} = useSigner()
  const {address, isConnected} = useAccount()

  const enterRoom = async () => {
    if(hand > 0 && signer) {
      const game = getRockPaperScissorContract(signer)
      const handEncrypt = solidityKeccak256(["string", "uint8", "address"], [salt, hand, address]);
      console.log(handEncrypt);
      await game.enterGame(props.room, handEncrypt, {from: address, value: props.bet})
    }

  }

  return (
    <>
      <Button onClick={onOpen}>Enter</Button>
      <Modal isOpen={isOpen} onClose={onClose} size={"3xl"}>
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader>Enter Room</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <Text>ID Room: {props.room}</Text>
            <Text>Bet: {formatEther(props.bet.toString())} MATIC</Text>
            <Text>Player 1: {props.player1}</Text>
            <RadioGroup onChange={setHand} value={hand}>
              <Stack spacing={4} direction='row'>
                <Radio value={0} isDisabled>Pending</Radio>
                <Radio value={1} >Rock</Radio>
                <Radio value={2} >Paper</Radio>
                <Radio value={3} >Scissor</Radio>
              </Stack>
            </RadioGroup>
            <Text>My selection: {hand}</Text>
          </ModalBody>

          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme='blue' onClick={() => enterRoom()}>Enter</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}