const {solidityKeccak256, parseEther} = require("ethers/lib/utils");
const RockPaperScissor = artifacts.require("RockPaperScissor");
const DummyRC20 = artifacts.require("DummyRC20");
const {assert} = require("chai");
const {constants, expectRevert} = require("@openzeppelin/test-helpers");
const {ethers, BigNumber} = require("ethers");
const {v4: uuidv4} = require('uuid');
const getBalance = require('eth-balance');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("RockPaperScissor", async ([deployer, alice, bob, carol, dave]) => {
  let game;
  let token;
  const token0 = "0x0000000000000000000000000000000000000000";
  let result;
  const MINTED = parseEther("2000000");

  const Rock = 1;
  const Paper = 2;
  const Scissor = 3;
  const Loser = 0;
  const Winner = 1;
  const Draw = 2;

  beforeEach("Deploy contract and mint tokens ERC20", async () => {
    // Deploy to ERC20 token
    token = await DummyRC20.new("Dummy Token", "DTK", {from: deployer});

    // Deploy Game contract
    game = await RockPaperScissor.new({from: deployer});


    // Mint and approve all users
    for (let user of [alice, bob, carol]) {
      await token.mint(MINTED, {from: user});
      assert.equal(await token.balanceOf(user), MINTED.toString());

      await token.approve(game.address, constants.MAX_UINT256, {
        from: user,
      });
    }
  });

  it("Initials vars", async () => {
    assert.equal(await game.game(), game.address);
    assert.equal(await game.MIN_BET(), 10);
    assert.equal(await game.GAME_TIME(), 120);
  });

  it("function getResult(Hand _move1, Hand _move2)", async () => {
    assert.equal(await game.getResult(Rock, Rock), Draw);
    assert.equal(await game.getResult(Rock, Paper), Loser);
    assert.equal(await game.getResult(Rock, Scissor), Winner);
    assert.equal(await game.getResult(Paper, Rock), Winner);
    assert.equal(await game.getResult(Paper, Paper), Draw);
    assert.equal(await game.getResult(Paper, Scissor), Loser);
    assert.equal(await game.getResult(Scissor, Rock), Loser);
    assert.equal(await game.getResult(Scissor, Paper), Winner);
    assert.equal(await game.getResult(Scissor, Scissor), Draw);
  });

  it("function createHandEncrypt(string memory _salt, Hand _move, address player)", async () => {
    let salt = uuidv4();
    let handEncrypt = solidityKeccak256(["string", "uint8", "address"], [salt, Rock, alice]);
    assert.equal(await game.createHandEncrypt(salt, Rock, alice), handEncrypt);

    salt = uuidv4();
    handEncrypt = solidityKeccak256(["string", "uint8", "address"], [salt, Paper, bob]);
    assert.equal(await game.createHandEncrypt(salt, Paper, bob), handEncrypt);

    salt = uuidv4();
    handEncrypt = solidityKeccak256(["string", "uint8", "address"], [salt, Scissor, carol]);
    assert.equal(await game.createHandEncrypt(salt, Scissor, carol), handEncrypt);
  });

  it("function createRoom(address _token, uint256 _amount, bytes32 _handEncrypt) with ETH", async () => {
    const salt = uuidv4();
    const handEncrypt = solidityKeccak256(["string", "uint8", "address"], [salt, Rock, alice]);
    const amount = ethers.utils.parseEther("1");
    const balance = await getBalance(alice, 'development') | 0;

    await expectRevert(
      game.createRoom(token0, amount, handEncrypt, {from: alice}),
      "Wrong value sent"
    );

    await expectRevert(
      game.createRoom(token0, 1, handEncrypt, {from: alice, amount: 1}),
      "Send more"
    );

    const result = await game.createRoom(token0, amount, handEncrypt, {from: alice, value: amount.toString()});

    assert.equal(await getBalance(alice, 'development') | 0, balance - 1);
    assert.equal(result.logs[0].args[0].length, 66);
    assert.equal(result.logs[0].args[1].toString(), amount.toString());
    assert.equal(result.logs[0].args[2], alice);
    assert.equal(result.logs[0].args[3], true);
    assert.equal(result.logs[0].args[4], token0);
  });

  it("function createRoom(address _token, uint256 _amount, bytes32 _handEncrypt) with Token", async () => {
    const salt = uuidv4();
    const handEncrypt = solidityKeccak256(["string", "uint8", "address"], [salt, Rock, alice]);
    const amount = ethers.utils.parseEther("1");
    const balance = ethers.utils.formatEther((await token.balanceOf(alice)).toString());

    await expectRevert(
      game.createRoom(token0, 1, handEncrypt, {from: alice, amount: 1}),
      "Send more"
    );

    await expectRevert(
      game.createRoom(token.address, amount, handEncrypt, {from: dave}),
      "Insufficient balance"
    );

    await token.mint(MINTED, {from: dave});
    assert.equal(await token.balanceOf(dave), MINTED.toString());

    await expectRevert(
      game.createRoom(token.address, amount, handEncrypt, {from: dave}),
      "Fail allowance tokens"
    );

    await token.approve(game.address, constants.MAX_UINT256, {
      from: dave,
    });

    await game.createRoom(token.address, amount, handEncrypt, {from: dave});

    const result = await game.createRoom(token.address, amount, handEncrypt, {from: alice});
    const balanceAfter = ethers.utils.formatEther((await token.balanceOf(alice)).toString());
    assert.equal(balanceAfter, balance - 1);
    // console.log(result.logs)
    assert.equal(result.logs[0].args[0].length, 66);
    assert.equal(result.logs[0].args[1].toString(), amount.toString());
    assert.equal(result.logs[0].args[2], alice);
    assert.equal(result.logs[0].args[3], true);
    assert.equal(result.logs[0].args[4], token.address);
  });

  it("function enterGame(bytes32 _room, bytes32 _handEncrypt) with ETH", async () => {
    const salt = uuidv4();
    const handEncryptPlayer1 = solidityKeccak256(["string", "uint8", "address"], [salt, Rock, alice]);
    const amount = ethers.utils.parseEther("1");
    const resultRoom = await game.createRoom(token0, amount, handEncryptPlayer1, {from: alice, value: amount.toString()});

    const room = resultRoom.logs[0].args[0];
    const handEncryptPlayer2 = solidityKeccak256(["string", "uint8", "address"], [salt, Paper, bob]);

    await expectRevert(
      game.enterGame(room, handEncryptPlayer2, {from: bob, value: 12}),
      "Wrong value sent"
    );

    await expectRevert(
      game.enterGame(room, handEncryptPlayer2, {from: alice, value: amount.toString()}),
      "Already joined"
    );

    const result = await game.enterGame(room, handEncryptPlayer2, {from: bob, value: amount.toString()});
    assert.equal(result.logs[0].args[0], room);
    assert.equal(result.logs[0].args[1], bob);
    assert.equal(result.logs[0].args[2], false);
  });

  it("function enterGame(bytes32 _room, bytes32 _handEncrypt) with Token", async () => {
    const salt = uuidv4();
    const handEncryptPlayer1 = solidityKeccak256(["string", "uint8", "address"], [salt, Rock, alice]);
    const amount = ethers.utils.parseEther("1");
    const resultRoom = await game.createRoom(token.address, amount, handEncryptPlayer1, {from: alice});

    const room = resultRoom.logs[0].args[0];
    const handEncryptPlayer2 = solidityKeccak256(["string", "uint8", "address"], [salt, Paper, bob]);

    await expectRevert(
      game.enterGame(room, handEncryptPlayer2, {from: alice}),
      "Already joined"
    );

    const result = await game.enterGame(room, handEncryptPlayer2, {from: bob});
    assert.equal(result.logs[0].args[0], room);
    assert.equal(result.logs[0].args[1], bob);
    assert.equal(result.logs[0].args[2], false);
  });

  it("function reveal(bytes32 _room, string memory _salt, Hand _move) with ETH", async () => {
    const salt1 = uuidv4();
    const salt2 = uuidv4();
    const handEncryptPlayer1 = solidityKeccak256(["string", "uint8", "address"], [salt1, Rock, alice]);
    const handEncryptPlayer2 = solidityKeccak256(["string", "uint8", "address"], [salt2, Paper, bob]);
    const amount = ethers.utils.parseEther("1");

    const resultRoom = await game.createRoom(token0, amount, handEncryptPlayer1, {from: alice, value: amount.toString()});
    const room = resultRoom.logs[0].args[0];

    await game.enterGame(room, handEncryptPlayer2, {from: bob, value: amount.toString()});

    await expectRevert(
      game.enterGame(room, handEncryptPlayer2, {from: bob, value: amount.toString()}),
      "Room closed"
    );

    await expectRevert(
      game.reveal(room, salt1, Rock,{from: bob}),
      "Wrong turn"
    );

    const result1 = await game.reveal(room, salt1, Rock,{from: alice});
    assert.equal(result1.logs[0].args[0], room);
    assert.equal(result1.logs[0].args[1], alice);
    assert.equal(result1.logs[0].args[2], false);

    await expectRevert(
      game.reveal(room, salt1, Rock,{from: alice}),
      "Wrong turn"
    );

    await expectRevert(
      game.reveal(room, salt1, Scissor,{from: bob}),
      "Wrong hand move"
    );

    const result2 = await game.reveal(room, salt2, Paper,{from: bob});

    assert.equal(result2.logs[0].args[0], room);
    assert.equal(result2.logs[0].args[1], bob);
    assert.equal(result2.logs[0].args[2], true);

    assert.equal(result2.logs[1].args[0], room);
    assert.equal(result2.logs[1].args[1], bob); // Winner Paper
    assert.equal(result2.logs[1].args[2], token0);
    assert.equal(result2.logs[1].args[3].toString(), amount.mul(BigNumber.from(2)).toString());
  });

  it("function reveal(bytes32 _room, string memory _salt, Hand _move)", async () => {
    const salt1 = uuidv4();
    const salt2 = uuidv4();
    const handEncryptPlayer1 = solidityKeccak256(["string", "uint8", "address"], [salt1, Scissor, alice]);
    const handEncryptPlayer2 = solidityKeccak256(["string", "uint8", "address"], [salt2, Paper, bob]);
    const amount = ethers.utils.parseEther("1");

    const resultRoom = await game.createRoom(token.address, amount, handEncryptPlayer1, {from: alice});
    const room = resultRoom.logs[0].args[0];

    await game.enterGame(room, handEncryptPlayer2, {from: bob});

    await expectRevert(
      game.enterGame(room, handEncryptPlayer2, {from: bob}),
      "Room closed"
    );

    await expectRevert(
      game.reveal(room, salt1, Rock,{from: bob}),
      "Wrong turn"
    );

    await expectRevert(
      game.reveal(room, salt1, Rock,{from: alice}),
      "Wrong hand move"
    );

    const result1 = await game.reveal(room, salt1, Scissor,{from: alice});
    assert.equal(result1.logs[0].args[0], room);
    assert.equal(result1.logs[0].args[1], alice);
    assert.equal(result1.logs[0].args[2], false);

    await expectRevert(
      game.reveal(room, salt1, Rock,{from: alice}),
      "Wrong turn"
    );

    const result2 = await game.reveal(room, salt2, Paper,{from: bob});
    assert.equal(result2.logs[0].args[0], room);
    assert.equal(result2.logs[0].args[1], bob);
    assert.equal(result2.logs[0].args[2], true);

    assert.equal(result2.logs[1].args[0], room);
    assert.equal(result2.logs[1].args[1], alice); // Winner Paper
    assert.equal(result2.logs[1].args[2], token.address);
    assert.equal(result2.logs[1].args[3].toString(), amount.mul(BigNumber.from(2)).toString());
  });

});
