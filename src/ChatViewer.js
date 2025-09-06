import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

function ChatViewer({ sessionId, goBack }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/chat-session/${sessionId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("Error loading chat", err));
  }, [sessionId]);

  return (
    <div className="chat-viewer">
      <h2>💬 Chat Conversation</h2>
      {messages.map((msg, i) => (
        <div key={i} style={{ marginBottom: '10px' }}>
          <strong>{msg.sender}:</strong>
          <div dangerouslySetInnerHTML={{ __html: md.render(msg.message) }} />
          <small style={{ color: 'gray' }}>
            {new Date(msg.timestamp).toLocaleString()}
          </small>
        </div>
      ))}
      <button onClick={goBack}>⬅ Back to History</button>
    </div>
  );
}

export default ChatViewer;
