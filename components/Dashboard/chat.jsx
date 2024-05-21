import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@material-ui/core";
import axios from "axios";
import { toast } from "react-toastify";
import styles from './Chat.module.css';

let socket;

const Chat = ({ userId, userName, online }) => {
    const { data: session } = useSession();
    const [message, setMessage] = useState("");
    const [recipientId, setRecipientId] = useState("");
    const [receiverName, setReceiverName] = useState("");
    const [allMessages, setAllMessages] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        setRecipientId(userId);
        setReceiverName(userName);
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

        socket.on("connect", () => {
            console.log("Connected to socket server");
            if (session?.user?.id) {
                socket.emit("join-room", session.user.id);
            }
        });

        socket.on("receive-message", (data) => {
            setAllMessages((prev) => [...prev, data]);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from socket server");
        });
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [allMessages]);

    async function fetchMessages() {
        if (!recipientId) return;
        const res = await axios.get(`/api/admin/getMessages?recipientId=${recipientId}`);
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
        <div className={styles.userChat}>
            {recipientId ? (
                <>
                    <h3>
                        Chatting with: {receiverName}{' '}
                        <FontAwesomeIcon icon={faCircle} style={{ color: online ? 'green' : 'red' }} />
                    </h3>
                    <div className={styles.messageContainer}>
                        {allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(({ senderName, content, createdAt }, index) => (
                            <div key={index} className={styles.message}>
                                <strong className={`${styles.username} ${senderName === session?.user?.name ? styles.green : ""}`}>
                                    {senderName}:
                                </strong> {content} <small>({new Date(createdAt).toLocaleString()})</small>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSubmit} className={styles.messageForm}>
                        <input
                            name="message"
                            placeholder="Enter your message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            autoComplete="off"
                            className={styles.input}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            className={styles.button}
                            onClick={handleSubmit}
                        >
                            Send
                        </Button>
                    </form>
                </>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

export default Chat;
