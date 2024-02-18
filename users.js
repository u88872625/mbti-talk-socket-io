let users = [];
let userInMbtiMatch = [];
let userInRandom = [];
let randomRooms = [];
const userRoomMap = new Map();

const addUser = ({ id, mbtiType, mbtiImage }) => {
  const user = { id, mbtiType, mbtiImage, notifiedJoin: false };
  users.push(user);
  return { user };
};

// 選擇聊天模式
const userJoinRoom = (userInfo, roomInfo) => {
  userRoomMap.set(userInfo.id, roomInfo.room);
  const user = { userInfo, roomInfo };
  switch (roomInfo.mode) {
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
  userRoomMap.delete(userInfo.id);
  switch (roomInfo.mode) {
    case "mbtiMatch":
      userInMbtiMatch = userInMbtiMatch.filter(
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

// 確認使用者是否已在房間內
function checkIfUserIsInRoom(userId, roomId) {
  return userRoomMap.get(userId) === roomId;
}

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
  getRandomRoomNum,
  removeUserFromRoom,
  checkIfUserIsInRoom,
};
