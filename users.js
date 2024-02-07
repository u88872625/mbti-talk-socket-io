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

const addToMatchQueue = (userInfo, preferredMatch) => {
  if (!waitingForMatch[preferredMatch]) {
    waitingForMatch[preferredMatch] = [];
  }

  const userRecord = {
    id: userInfo.id,
    mbtiType: userInfo.mbtiType,
    preferredMatch: preferredMatch, // 用户希望匹配的类型
  };
  waitingForMatch[preferredMatch].push(userRecord);
  console.log(
    `User ${userInfo.id} (${userInfo.mbtiType}) added to match queue for ${preferredMatch}`
  );
  // waitingForMatch[mbtiType].push(id);
  // console.log(`User ${id} added to match queue for ${mbtiType}`);
};

const findMatch = (userInfo) => {
  const { id, preferredMatch, mbtiType } = userInfo;
  if (waitingForMatch[mbtiType]) {
    for (let i = 0; i < waitingForMatch[mbtiType].length; i++) {
      const match = waitingForMatch[mbtiType][i];
      if (match.id !== id && match.preferredMatch === mbtiType) {
        waitingForMatch[mbtiType].splice(i, 1);
        return match.id;
      }
    }
  }
  console.log(waitingForMatch);
  console.log(`No match found for ${id} looking for ${preferredMatch}`);
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
