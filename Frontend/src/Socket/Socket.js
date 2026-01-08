import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.SOCKET_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});
