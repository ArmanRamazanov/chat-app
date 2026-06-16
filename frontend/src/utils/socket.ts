import io from "socket.io-client";

export const socket = io("http://localhost:3000", {
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  autoConnect: false,
});

socket.on("connect", () => {
  console.log("You have successfully connected");
});
socket.on("connect_error", (err) => {
  console.log("The error is: ", err);
});
