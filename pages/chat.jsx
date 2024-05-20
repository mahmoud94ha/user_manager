import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io();

const Chat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [senderId, setSenderId] = useState('clw5bqfhx000011k8at2qnap1'); // Replace with actual sender ID
    const [receiverId, setReceiverId] = useState('clwb8scct0000dd9f2i2k5jzk'); // Replace with actual receiver ID

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            socket.off('message');
        };
    }, []);

    const sendMessage = () => {
        const newMessage = {
            content: message,
            senderId,
            receiverId
        };
        socket.emit('sendMessage', newMessage);
        setMessage('');
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.senderId}</strong>: {msg.content}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Chat;