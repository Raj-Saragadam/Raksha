import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ChatHistory.css';

function ChatHistory({ viewChat, goBack }) {
  const [chats, setChats] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');

  const fetchChats = async () => {
    const res = await axios.get('http://localhost:5000/api/chat-sessions');
    setChats(res.data);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleEdit = (id, currentName) => {
    setEditingId(id);
    setNewName(currentName);
  };

  const saveName = async (id) => {
    await axios.put(`http://localhost:5000/api/update-chat-name/${id}`, { newName });
    setEditingId(null);
    fetchChats();
  };

  const deleteChat = async (id) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      await axios.delete(`http://localhost:5000/api/delete-chat/${id}`);
      fetchChats();
    }
  };

  return (
    <div className="chat-history-container">
      <h2>📜 Chat History</h2>
      <button className="go-back" onClick={goBack}>⬅ Go Back</button>
      <table className="chat-history-table">
        <thead>
          <tr>
            <th>Chat Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {chats.map(session => (
            <tr key={session.id}>
              <td>
                {editingId === session.id ? (
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                ) : (
                  session.chat_name
                )}
              </td>
              <td>
                <button onClick={() => viewChat(session.id)}>👁 View</button>
                {editingId === session.id ? (
                  <button onClick={() => saveName(session.id)}>✅ Save</button>
                ) : (
                  <button onClick={() => handleEdit(session.id, session.chat_name)}>✏️ Edit</button>
                )}
                <button onClick={() => deleteChat(session.id)}>🗑 Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChatHistory;