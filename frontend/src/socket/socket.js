/**
 * src/socket/socket.js
 *
 * Creates and exports a single Socket.IO client instance shared across
 * the entire frontend.  Importing this file from multiple components will
 * always return the same socket object — no duplicate connections.
 *
 * autoConnect: false  → the socket only connects when socket.connect()
 * is called explicitly (we do this inside LectureRoom on mount).
 * This prevents a stray connection on every page of the app.
 */

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const socket = io(SOCKET_URL, {
  autoConnect: false,       // connect manually when entering the lecture room
  reconnection: true,       // reconnect automatically on page refresh
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"],
});

export default socket;
