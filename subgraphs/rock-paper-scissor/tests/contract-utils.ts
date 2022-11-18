import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  EnterRoom,
  RevealHand,
  RoomCreated,
  Winners
} from "../generated/Contract/Contract"

export function createEnterRoomEvent(
  room: Bytes,
  player: Address,
  is_open: boolean
): EnterRoom {
  let enterRoomEvent = changetype<EnterRoom>(newMockEvent())

  enterRoomEvent.parameters = new Array()

  enterRoomEvent.parameters.push(
    new ethereum.EventParam("room", ethereum.Value.fromFixedBytes(room))
  )
  enterRoomEvent.parameters.push(
    new ethereum.EventParam("player", ethereum.Value.fromAddress(player))
  )
  enterRoomEvent.parameters.push(
    new ethereum.EventParam("is_open", ethereum.Value.fromBoolean(is_open))
  )

  return enterRoomEvent
}

export function createRevealHandEvent(
  room: Bytes,
  player: Address,
  is_open: boolean
): RevealHand {
  let revealHandEvent = changetype<RevealHand>(newMockEvent())

  revealHandEvent.parameters = new Array()

  revealHandEvent.parameters.push(
    new ethereum.EventParam("room", ethereum.Value.fromFixedBytes(room))
  )
  revealHandEvent.parameters.push(
    new ethereum.EventParam("player", ethereum.Value.fromAddress(player))
  )
  revealHandEvent.parameters.push(
    new ethereum.EventParam("is_open", ethereum.Value.fromBoolean(is_open))
  )

  return revealHandEvent
}

export function createRoomCreatedEvent(
  room: Bytes,
  bet: BigInt,
  player1: Address,
  is_open: boolean,
  token: Address
): RoomCreated {
  let roomCreatedEvent = changetype<RoomCreated>(newMockEvent())

  roomCreatedEvent.parameters = new Array()

  roomCreatedEvent.parameters.push(
    new ethereum.EventParam("room", ethereum.Value.fromFixedBytes(room))
  )
  roomCreatedEvent.parameters.push(
    new ethereum.EventParam("bet", ethereum.Value.fromUnsignedBigInt(bet))
  )
  roomCreatedEvent.parameters.push(
    new ethereum.EventParam("player1", ethereum.Value.fromAddress(player1))
  )
  roomCreatedEvent.parameters.push(
    new ethereum.EventParam("is_open", ethereum.Value.fromBoolean(is_open))
  )
  roomCreatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )

  return roomCreatedEvent
}

export function createWinnersEvent(
  room: Bytes,
  winner: Address,
  token: Address,
  prize: BigInt
): Winners {
  let winnersEvent = changetype<Winners>(newMockEvent())

  winnersEvent.parameters = new Array()

  winnersEvent.parameters.push(
    new ethereum.EventParam("room", ethereum.Value.fromFixedBytes(room))
  )
  winnersEvent.parameters.push(
    new ethereum.EventParam("winner", ethereum.Value.fromAddress(winner))
  )
  winnersEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  winnersEvent.parameters.push(
    new ethereum.EventParam("prize", ethereum.Value.fromUnsignedBigInt(prize))
  )

  return winnersEvent
}
