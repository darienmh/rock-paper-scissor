import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, Address, BigInt } from "@graphprotocol/graph-ts"
import { EnterRoom } from "../generated/schema"
import { EnterRoom as EnterRoomEvent } from "../generated/Contract/Contract"
import { handleEnterRoom } from "../src/contract"
import { createEnterRoomEvent } from "./contract-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let room = Bytes.fromI32(1234567890)
    let player = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let is_open = false
    let newEnterRoomEvent = createEnterRoomEvent(room, player, is_open)
    handleEnterRoom(newEnterRoomEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("EnterRoom created and stored", () => {
    assert.entityCount("EnterRoom", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "EnterRoom",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "room",
      "1234567890"
    )
    assert.fieldEquals(
      "EnterRoom",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "player",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "EnterRoom",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "is_open",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
