let users = [];
let userInLobby = [];
let userInPassword = [];
let userInRandom = [];
let randomRooms = [];
let waitingForMatch = {};

const addUser = ({ id, mbtiType, mbtiImage }) => {
  const user = { id, mbtiType, mbtiImage };
  users.push(user);
  return { user };
};

const addToMatchQueue = (userInfo) => {
  const { mbtiType, id } = userInfo;
  if (!waitingForMatch[mbtiType]) {
    waitingForMatch[mbtiType] = [];
  }
  waitingForMatch[mbtiType].push(id);
};

const findMatch = (mbtiType, currentId) => {
  if (waitingForMatch[mbtiType]) {
    for (let i = 0; i < waitingForMatch[mbtiType]; i++) {
      if (waitingForMatch[mbtiType][i] !== currentId) {
        return waitingForMatch[mbtiType].splice(i, 1)[0];
      }
    }
  }
  return null;
};

// 選擇聊天模式
const userJoinRoom = (userInfo, roomInfo) => {
  const user = { userInfo, roomInfo };
  switch (roomInfo.mode) {
    case "lobby":
      userInLobby.push(user);
      break;
    case "password":
      userInPassword.push(user);
      break;
    case "random":
      userInRandom.push(user);
      break;
    default:
      return;
  }
};

// 使用者離開聊天室
const removeUserFromRoom = (userInfo, roomInfo) => {
  switch (roomInfo.mode) {
    case "lobby":
      userInLobby = userInLobby.filter(
        (user) => user.userInfo.id !== userInfo.id
      );
      break;
    case "password":
      userInPassword = userInPassword.filter(
        (user) => user.userInfo.id !== userInfo.id
      );
      break;
    case "random":
      userInRandom = userInRandom.filter(
        (user) => user.userInfo.id !== userInfo.id
      );
      break;
  }
};

// 隨機聊天
const getRandomRoomNum = () => {
  const availableRoom = randomRooms.find((room) => room.flag === 0);

  if (!availableRoom) {
    let newRoomNum;
    do {
      newRoomNum = Math.floor(Math.random() * 1000).toString();
    } while (randomRooms.some((room) => room.room === newRoomNum));

    randomRooms.push({ room: newRoomNum, flag: 0 });
    return newRoomNum;
  } else {
    availableRoom.flag = 1;
    return availableRoom.room;
  }
};

module.exports = {
  addUser,
  userJoinRoom,
  addToMatchQueue,
  findMatch,
  getRandomRoomNum,
  removeUserFromRoom,
};
