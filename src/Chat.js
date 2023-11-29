import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const Chat = () => {
  const [groupName, setGroupName] = useState('');
  const [userName, setUserName] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const hubConnection = useRef(null);

  useEffect(() => {
    // Create a new SignalR connection
    hubConnection.current = new signalR.HubConnectionBuilder()
      .withUrl('https://3008-2a09-bac1-7ac0-10-00-247-75.ngrok-free.app/chatHub') // Provide the URL where your hub is hosted
      .build();

    // Start the connection
    hubConnection.current
      .start()
      .then(() => console.log('Connection started!'))
      .catch((err) => console.error('Error while establishing connection:', err));

    // Set up event listeners for receiving messages
    hubConnection.current.on('ReceiveMessage', (user, message) => {
      // Handle received messages
      setMessages((prevMessages) => [...prevMessages, { user, message }]);
    });

    return () => {
      // Cleanup: close the connection when the component unmounts
      hubConnection.current.stop();
    };
  }, []);

  const joinGroup = () => {
    if (groupName) {
      // Call the JoinGroup method on the server
      hubConnection.current.invoke('JoinGroup', groupName);
      setMessages([]);
    }
  };

  const leaveGroup = () => {
    // Call the LeaveGroup method on the server
    if (groupName) {
      hubConnection.current.invoke('LeaveGroup', groupName);
      setMessages([]);
    }
  };

  const sendMessage = () => {
    // Call the SendMessageToGroup method on the server
    if (groupName && userMessage) {
      hubConnection.current.invoke('SendMessageToGroup', groupName, userName, userMessage);
      setUserMessage('');
    }
  };

  return (
    <div>
        <div>
        <label htmlFor="userName">User Name: </label>
        <input
          type="text"
          id="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="groupInput">Group Name: </label>
        <input
          type="text"
          id="groupInput"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button onClick={joinGroup}>Join Group</button>
        <button onClick={leaveGroup}>Leave Group</button>
      </div>

      <div>
        <label htmlFor="messageInput">Message: </label>
        <input
          type="text"
          id="messageInput"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>

      <div>
        <h3>Messages:</h3>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>{msg.user}:</strong> {msg.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Chat;
