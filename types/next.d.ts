import { Server as HTTPServer } from 'http';
import { Socket } from 'net';
import { Server as IOServer } from 'socket.io';

interface SocketWithServer extends Socket {
  server: HTTPServer & {
    io?: IOServer;
  };
}

declare module 'http' {
  interface IncomingMessage {
    socket: SocketWithServer;
  }
}
