import {
  EnterRoom as EnterRoomEvent,
  RevealHand as RevealHandEvent,
  RoomCreated as RoomCreatedEvent,
  Winners as WinnersEvent
} from "../generated/Contract/Contract"
import {
  EnterRoom,
  RevealHand, Room,
  RoomCreated,
  Winners
} from "../generated/schema"
import {Address} from "@graphprotocol/graph-ts";

export function handleEnterRoom(event: EnterRoomEvent): void {
  let entity = new EnterRoom(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.room = event.params.room
  entity.player = event.params.player
  entity.is_open = event.params.is_open

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRevealHand(event: RevealHandEvent): void {
  let entity = new RevealHand(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.room = event.params.room
  entity.player = event.params.player
  entity.is_open = event.params.is_open

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoomCreated(event: RoomCreatedEvent): void {
  let entity = new RoomCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.room = event.params.room
  entity.bet = event.params.bet
  entity.player1 = event.params.player1
  entity.is_open = event.params.is_open
  entity.token = event.params.token

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let room = new Room(
    event.params.room
  )

  room.room = event.params.room
  room.bet = event.params.bet
  room.player1 = event.params.player1
  room.player2 = Address.zero()
  room.is_open = event.params.is_open
  room.token = event.params.token

  room.blockNumber = event.block.number
  room.blockTimestamp = event.block.timestamp
  room.transactionHash = event.transaction.hash

  room.save()

}

export function handleWinners(event: WinnersEvent): void {
  let entity = new Winners(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.room = event.params.room
  entity.winner = event.params.winner
  entity.token = event.params.token
  entity.prize = event.params.prize

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
