import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";

let socket;

const Chat = ({ userId, userName }) => {
    const { data: session } = useSession();
    const [message, setMessage] = useState("");
    const [recipientId, setRecipientId] = useState("");
    const [receiverName, setReceiverName] = useState("");
    const [allMessages, setAllMessages] = useState([]);

    useEffect(() => {
        setRecipientId(userId);
        setReceiverName(userName);
        console.log(userId, userName);
    }, [userId, userName]);

    useEffect(() => {
        socketInitializer();
        fetchMessages();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [recipientId]);

    async function socketInitializer() {
        await fetch("/api/socket");
        socket = io();

        socket.on("receive-message", (data) => {
            setAllMessages((prev) => [...prev, data]);
        });
    }

    async function fetchMessages() {
        if (!recipientId) return;
        const res = await axios.get(`/api/admin/getMessages?userId=${recipientId}`);
        const messages = res.data;
        setAllMessages(messages);
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!session?.user?.id) {
            console.error("User is not authenticated");
            return;
        }

        if (message.trim() === "" || !recipientId) {
            toast.error("Message cannot be empty");
            return;
        }

        const messageData = {
            content: message,
            senderId: session.user.id,
            senderName: session.user.name,
            receiverName: receiverName,
            receiverId: recipientId,
        };

        socket.emit("send-message", messageData);
        setMessage("");
    }

    return (
        <div className="userChat">
            <>
                <h2>Welcome, {session.user.name}</h2>
                {recipientId ? (
                    <>
                        <div>
                            <h3>Chatting with: {receiverName}</h3>
                            <div>
                                {allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(({ senderName, content, createdAt }, index) => (
                                    <div key={index}>
                                        {senderName}: {content} <small>({new Date(createdAt).toLocaleString()})</small>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSubmit}>
                                <input
                                    name="message"
                                    placeholder="Enter your message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    autoComplete="off"
                                />
                                <button type="submit">Send</button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div>
                        Loading...
                    </div>
                )}
            </>
        </div>
    );
};

export default Chat;
