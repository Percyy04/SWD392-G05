import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  autoConnect: false, // nếu muốn connect thủ công
  auth: {
    token: localStorage.getItem("token") // nếu FE gửi token
  }
});
