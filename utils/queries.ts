export const OPEN_ROOMS = `{
  rooms(
    first: 10
    orderBy: blockTimestamp
    orderDirection: desc
    where: {player2: "0x0000000000000000000000000000000000000000", is_open: true}
  ) {
    id
    room
    token
    bet
    player1
    player2
    blockTimestamp
  }
}`;

export const MY_ROOMS = (address: string) => {
  console.log({address})
  return `{
  rooms(
    first: 10
    orderBy: blockTimestamp
    orderDirection: desc
    where: {player1_contains: "${address}"}
  ) {
    id
    room
    token
    bet
    player1
    player2
    blockTimestamp
  }
}`
};