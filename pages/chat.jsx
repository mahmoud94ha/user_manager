import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import axios from "axios";

let socket;

const Home = () => {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socketInitializer();
    fetchUsers();
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

  async function fetchUsers() {
    const res = await axios.post("/api/admin/getUser");
    const users = res.data;
    setUsers(users);
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
      <h1>Chat app</h1>
      {session ? (
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
              <h3>Select a user to chat with:</h3>
              <ul>
                {users.map((user) => (
                  <li key={user.id} onClick={() => {
                    setRecipientId(user.id);
                    setReceiverName(user.name);
                    setAllMessages([]);
                  }}>
                    {user.name} ({user.email})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <h2>Please sign in to use the chat</h2>
      )}
    </div>
  );
};

export default Home;
