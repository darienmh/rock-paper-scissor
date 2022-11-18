// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RockPaperScissor is ReentrancyGuard {

    enum Hand {
        Pending,
        Rock,
        Paper,
        Scissors
    }

    enum Result {
        Loser,
        Winner,
        Draw
    }

    struct Turn {
        Hand move;
        bytes32 handEncrypt;
    }

    struct Room {
        uint256 last_time;
        uint256 bet;
        address player1;
        address player2;
        address winner;
        bool is_open;
        address token;
    }

    mapping(bytes32 => Room) __rooms;
    mapping(bytes32 => address) __turns;
    mapping(bytes32 => mapping(address => Turn)) __moves;
    mapping(Hand => mapping(Hand => Result)) __results;

    address public game;
    uint256 constant public MIN_BET = 10;
    uint256 constant public GAME_TIME = 120; // seconds

    event RoomCreated(bytes32 room, uint256 bet, address player1, bool is_open, address token);
    event EnterRoom(bytes32 room, address player, bool is_open);
    event RevealHand(bytes32 room, address player, bool is_open);
    event Winners(bytes32 room, address winner, address token, uint256 prize);

    constructor() {
        game = address(this);
        __results[Hand.Rock][Hand.Scissors] = Result.Winner;
        __results[Hand.Paper][Hand.Rock] = Result.Winner;
        __results[Hand.Scissors][Hand.Paper] = Result.Winner;
        __results[Hand.Rock][Hand.Rock] = Result.Draw;
        __results[Hand.Scissors][Hand.Scissors] = Result.Draw;
        __results[Hand.Paper][Hand.Paper] = Result.Draw;
    }

    function getResult(Hand _move1, Hand _move2) public view returns (Result player1) {
        return __results[_move1][_move2];
    }

    function createHandEncrypt(string memory _salt, Hand _move, address player) public pure returns (bytes32 handEncrypt) {
        return keccak256(abi.encodePacked(_salt, _move, player));
    }

    function createRoom(address _token, uint256 _amount, bytes32 _handEncrypt) public payable nonReentrant {
        bytes32 roomHash = keccak256(abi.encodePacked(block.number, _amount, msg.sender));
        require(__rooms[roomHash].player1 == address(0), "Already created room");
        require(_amount >= MIN_BET, "Send more");

        _pay(msg.sender, payable(game), _token, _amount);

        __rooms[roomHash] = Room(block.timestamp, _amount, msg.sender, address(0), address(0), true, _token);
        __turns[roomHash] = msg.sender;
        __moves[roomHash][msg.sender].handEncrypt = _handEncrypt;

        emit RoomCreated(roomHash, _amount, msg.sender, true, _token);
    }

    function enterGame(bytes32 _room, bytes32 _handEncrypt) public payable nonReentrant isOpen(_room) checkPlayer(_room) {
        if (__rooms[_room].player2 == address(0)) {
            require(__rooms[_room].player1 != msg.sender, "Already joined");
            __rooms[_room].player2 = msg.sender;
        }
        _switchTurn(_room);
        _pay(msg.sender, payable(game), __rooms[_room].token, __rooms[_room].bet);

        __rooms[_room].last_time = block.timestamp;
        __moves[_room][msg.sender].handEncrypt = _handEncrypt;

        emit EnterRoom(_room, msg.sender, __rooms[_room].is_open);
    }

    function reveal(bytes32 _room, string memory _salt, Hand _move) public nonReentrant isClosed(_room) checkPlayer(_room) {
        bytes32 handEncrypt = keccak256(abi.encodePacked(_salt, _move, msg.sender));
        require(__moves[_room][msg.sender].handEncrypt == handEncrypt, "Wrong hand move");
        address winner = address(0);

        __moves[_room][msg.sender].move = _move;

        _switchTurn(_room);
        __rooms[_room].last_time = block.timestamp;

        if (__rooms[_room].player2 == msg.sender) {
            _selectWinner(_room);
            winner = __rooms[_room].winner;
            _reset(_room);
            if (winner != address(0)) {
                _pay(game, payable(winner), __rooms[_room].token, __rooms[_room].bet * 2);
            }
        }
        emit RevealHand(_room, msg.sender, __rooms[_room].is_open);
        if (winner != address(0)) emit Winners(_room, winner, __rooms[_room].token, __rooms[_room].bet * 2);
    }

    function _pay(address _from, address _to, address _token, uint256 _amount) private {
        if (_token == address(0)) {
            if (_from != game) require(_amount == msg.value, "Wrong value sent");
            (bool status,) = payable(_to).call{value : _amount}("");
            require(status, "Send failed");
        } else {
            if (_from == game) {
                IERC20(_token).transfer(_to, _amount);
            } else {
                require(IERC20(_token).balanceOf(_from) >= _amount, "Insufficient balance");
                require(IERC20(_token).allowance(_from, _to) >= _amount, "Fail allowance tokens");
                require(IERC20(_token).transferFrom(_from, _to, _amount), "Fail transfer tokens");
            }

        }
    }

    function _reset(bytes32 _room) private {
        delete __rooms[_room].winner;
        delete __rooms[_room].last_time;
    }

    function _selectWinner(bytes32 _room) private {
        if (__results[__moves[_room][__rooms[_room].player1].move][__moves[_room][__rooms[_room].player2].move] == Result.Winner) {
            __rooms[_room].winner = __rooms[_room].player1;
        } else if (__results[__moves[_room][__rooms[_room].player1].move][__moves[_room][__rooms[_room].player2].move] == Result.Loser) {
            __rooms[_room].winner = __rooms[_room].player2;
        }
    }

    function _switchTurn(bytes32 _room) private {
        if (__rooms[_room].player1 == msg.sender) {
            __turns[_room] = __rooms[_room].player2;
        } else {
            __turns[_room] = __rooms[_room].player1;
            __rooms[_room].is_open = !__rooms[_room].is_open;
        }
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // TODO: manage the game time and allow to recover the coins if the other player does not play

    modifier isOpen(bytes32 _room){
        require(__rooms[_room].is_open, "Room closed");
        _;
    }

    modifier isClosed(bytes32 _room){
        require(!__rooms[_room].is_open, "Room open");
        _;
    }

    modifier checkPlayer(bytes32 _room){
        require(__rooms[_room].player1 == msg.sender || __rooms[_room].player2 == msg.sender || __rooms[_room].player2 == address(0), "Wrong player");
        require(__turns[_room] == msg.sender || __rooms[_room].player2 == address(0), "Wrong turn");
        _;
    }

    receive() external payable {}

    fallback() external payable {}
}