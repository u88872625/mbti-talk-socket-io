let users = [];
let userInMbtiMatch = [];
let userInRandom = [];
let randomRooms = [];

const addUser = ({ id, mbtiType, mbtiImage }) => {
  const user = { id, mbtiType, mbtiImage, notifiedJoin: false };
  users.push(user);
  return { user };
};

// 選擇聊天模式
const userJoinRoom = (id, roomInfo) => {
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex !== -1) {
    const user = users[userIndex];

    user.roomInfo = roomInfo;
    switch (roomInfo.mode) {
      case "mbtiMatch":
        if (!userInMbtiMatch.includes(user)) {
          userInMbtiMatch.push(user);
        }
        break;
      case "random":
        if (!userInRandom.includes(user)) {
          userInRandom.push(user);
        }
        break;
      default:
        return;
    }

    if (!user.notifiedJoin) {
      io.to(roomInfo.room).emit("message", {
        user: "admin",
        text: `${user.mbtiType}已加入聊天室`,
      });

      users[userIndex].notifiedJoin = true;
    }
  }
};

// 使用者離開聊天室
const removeUserFromRoom = (userInfo, roomInfo) => {
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
};
