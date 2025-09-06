import React, { useState, useRef} from 'react';
import axios from 'axios';
import MarkdownIt from 'markdown-it';
import './App.css';
import ChatHistory from './ChatHistory';
import ChatViewer from './ChatViewer';

const md = new MarkdownIt();

function Chat({ username, goToOtherPage, setViewMode })
  {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const cancelTokenRef = useRef(null);
  const [chatName, setChatName] = useState('');

  const saveChat = async () => {
    if (!chatName.trim()) {
      alert("Please enter a chat name before saving.");
      return;
    }
  
    try {
      await axios.post('http://localhost:5000/api/save-chat', {
        username,
        messages,
        chat_name: chatName.trim()
      });
      alert("Chat saved successfully! 📝");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save chat.");
    }
  };
   

  const sendMessage = async () => {
    if ((!input.trim() && !image) || isGenerating) return;

    const userMessage = {
      from: 'user',
      text: input,
      imageUrl: image ? URL.createObjectURL(image) : null
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setImage(null);
    setIsGenerating(true);

    const source = axios.CancelToken.source();
    cancelTokenRef.current = source;

    try {
      const formData = new FormData();
      formData.append('message', input);
      if (image) {
        formData.append('image', image);
      }

      const res = await axios.post('http://localhost:5000/api/chat', formData, {
        cancelToken: source.token,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const gptReply = res.data || '[No response]';
      setMessages(prev => [...prev, { from: 'gpt', text: gptReply }]);
    } catch (err) {
      if (axios.isCancel(err)) {
        setMessages(prev => [...prev, { from: 'gpt', text: '[⛔ Generation stopped]' }]);
      } else {
        console.error(err);
        setMessages(prev => [...prev, { from: 'gpt', text: 'Error from backend.' }]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stopGenerating = () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('User stopped generation');
      setIsGenerating(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <>
      <div className="row">
        <div className="box conversations">
          <div className="top">
            <h3 style={{ marginBottom: '10px' }}>Hi, {username} 👋</h3>
            <div style={{ marginBottom: '10px' }}> Chat Name📝
  <input
    type="text"
    id="chatName"
    value={chatName}
    onChange={(e) => setChatName(e.target.value)}
    placeholder="Enter chat name"
    style={{ padding: '5px', width: '200px', borderRadius: '5px' }}
  />
</div>

            <button className="new_convo" onClick={() => setMessages([])}>
              <i className="fa-regular fa-plus"></i>
              <span>New Conversation</span>
            </button>
            <button className="save-chat new_convo" onClick={saveChat}>
              💾 <span>Save Chat to DB</span>
            </button>
            <button className="link-button new_convo" onClick={() => setViewMode('history')}>
  <i className="fa-solid fa-clock-rotate-left"></i> <span>View Chat History</span>
</button>
          </div>
        </div>

        <div className="conversation disable-scrollbars">
          {isGenerating && (
            <div className="stop-generating-container">
              <button id="cancelButton" onClick={stopGenerating}>
                <span>Generating…</span>
                <span style={{ marginLeft: '10px' }}>Stop</span>
                <i className="fa-regular fa-stop"></i>
              </button>
            </div>
          )}

          <div className="box" id="messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.from}`}>
                <strong>{msg.from === 'user' ? 'You' : 'Raksha'}:</strong>
                <div dangerouslySetInnerHTML={{ __html: md.render(msg.text) }} />
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Uploaded"
                    className="chat-image"
                    style={{ maxWidth: '300px', marginTop: '10px', borderRadius: '8px' }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="user-input">
            <div className="box input-box">
              <textarea
                id="message-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question"
                rows="4"
                style={{ whiteSpace: 'pre-wrap' }}
              />
              <div className="file-upload">
                <div style={{ marginTop: '10px' }}>
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  {image && <p>📎 Selected: {image.name}</p>}
                </div>
              </div>
              <div id="send-button" onClick={sendMessage}>
                <i className="fa-regular fa-paper-plane-top"></i>
              </div>
            </div>
          </div>

          <div className="buttons">
            <form className="color-picker" action="">
              <fieldset>
                <legend className="visually-hidden">Pick a color scheme</legend>
                {['light', 'pink', 'blue', 'green', 'dark'].map(theme => (
                  <React.Fragment key={theme}>
                    <label htmlFor={theme} className="visually-hidden">{theme}</label>
                    <input type="radio" title={theme} name="theme" id={theme} defaultChecked={theme === 'light'} />
                  </React.Fragment>
                ))}
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

function RakshaApp({username}) {
  const [viewMode, setViewMode] = useState(null); // 'history' | 'viewer'
  const [selectedSession, setSelectedSession] = useState(null);

  return (
    <>
    {!viewMode && (
      <Chat
        username={username}
        goToOtherPage={() => console.log('Other page navigation')}
        setViewMode={setViewMode}
      />
    )}
    {viewMode === 'history' && (
      <ChatHistory
        viewChat={(id) => {
          setSelectedSession(id);
          setViewMode('viewer');
        }}
        goBack={() => setViewMode(null)}
      />
    )}
    {viewMode === 'viewer' && (
      <ChatViewer
        sessionId={selectedSession}
        goBack={() => setViewMode('history')}
      />
    )}
  </>
  );
}

export default RakshaApp;