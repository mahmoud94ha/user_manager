import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { withAuth } from '@lib/authMiddleware';
import prisma from '@lib/prisma';

type NextApiResponseWithSocket = NextApiResponse & {
    socket: {
        server: {
            io: SocketIOServer;
        };
    };
};

const SocketHandler = async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
    if (!res.socket.server.io) {
        console.log('*First use, starting Socket.IO');
        const io = new SocketIOServer(res.socket.server as any);

        io.on('connection', async (socket) => {
            const user = await withAuth(req, res, true);
            console.log(`Socket ${socket.id} connected for user ${user.id}.`);

            socket.join(user.id);

            socket.on('send-message', async (obj) => {
                try {
                    const savedMessage = await prisma.message.create({
                        data: {
                            content: obj.content,
                            senderId: obj.senderId,
                            senderName: obj.senderName,
                            receiverName: obj.receiverName,
                            receiverId: obj.receiverId,
                        },
                    });

                    io.to(obj.senderId).to(obj.receiverId).emit('receive-message', savedMessage);

                } catch (error) {
                    console.error('Error saving message:', error);
                }
            });

            socket.on('disconnect', () => {
                console.log(`Socket ${socket.id} disconnected for user ${user.id}.`);
            });
        });

        res.socket.server.io = io;
        console.log('Setting up socket');
    } else {
        console.log('Socket.IO already set up');
    }
    res.end();
};

export default SocketHandler;

export const config = {
    api: {
        bodyParser: false,
    },
};
