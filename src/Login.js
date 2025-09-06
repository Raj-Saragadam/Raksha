import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Login.css';

function Login({ onLogin }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Camera access denied:", err);
        setError("Please allow camera access to login.");
      });
  }, []);

  const handleCaptureAndLogin = async () => {
    setLoading(true);
    setError('');

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('image', blob, 'login.jpg');

      try {
        const res = await axios.post('http://localhost:5000/api/login', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const data = res.data;
        if (data.found) {
          onLogin(data.username);
        } else {
          setError("Face not recognized. Try again.");
        }
      } catch (err) {
        console.error(err);
        setError("Error during login.");
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg');
  };

  return (
    <div className = "align">
    <div className="login-page">
      <h2>Login with Face Recognition</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <video ref={videoRef} autoPlay width="320" height="240" />
      <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />
      <br />
      <button onClick={handleCaptureAndLogin} disabled={loading}>
        {loading ? 'Verifying...' : 'Login with Face'}
      </button>
    </div>
    </div>
  );
}

export default Login;
