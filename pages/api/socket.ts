import { Server } from 'socket.io';
import prisma from '@lib/prisma';

export default function handler(req, res) {
    if (res.socket.server.io) {
        res.end();
        return;
    }

    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', socket => {
        socket.on('sendMessage', async (message) => {
            const savedMessage = await prisma.message.create({
                data: {
                    content: message.content,
                    senderId: message.senderId,
                    receiverId: message.receiverId
                }
            });
            io.emit('message', savedMessage);
        });
    });

    res.end();
}

export const config = {
    api: {
        bodyParser: false
    }
};
