// client/src/components/Chat.js

import React, { useState } from 'react';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a personal trainer assistant.' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');

    try {
      // This is correctly inside the async function
      const response = await axios.post('http://localhost:5001/chat', {
        messages: updatedMessages,
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.reply,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error communicating with the server:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'Sorry, an error occurred. Please try again later.' },
      ]);
    }
  };

  return (
    <div>
      <div className="chat-window">
        {messages
          .filter((message) => message.role !== 'system')
          .map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <strong>{message.role === 'user' ? 'You' : 'AI'}:</strong> {message.content}
            </div>
          ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
