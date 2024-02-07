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
  if (!waitingForMatch[userInfo.mbtiType]) {
    waitingForMatch[userInfo.mbtiType] = [];
  }
  waitingForMatch[userInfo.mbtiType].push({
    id: userInfo.id,
    preferredMatch: preferredMatch,
  });
  console.log(
    `User ${userInfo.id} (${userInfo.mbtiType}) added to match queue for ${preferredMatch}`
  );
};

const findMatch = (userInfo) => {
  let matchId = null;
  Object.keys(waitingForMatch).forEach((type) => {
    if (type === userInfo.preferredMatch) {
      const matches = waitingForMatch[type];
      for (let i = 0; i < matches.length; i++) {
        const potentialMatch = matches[i];

        if (
          potentialMatch.preferredMatch === userInfo.mbtiType &&
          potentialMatch.id !== userInfo.id
        ) {
          matchId = potentialMatch.id;

          waitingForMatch[type].splice(i, 1);
          break;
        }
      }
    }
  });

  if (matchId) {
    console.log(
      `Match found for ${userInfo.id} looking for ${userInfo.preferredMatch}`
    );
    return matchId;
  } else {
    console.log(
      `No match found for ${userInfo.id} looking for ${userInfo.preferredMatch}`
    );
    return null;
  }
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
