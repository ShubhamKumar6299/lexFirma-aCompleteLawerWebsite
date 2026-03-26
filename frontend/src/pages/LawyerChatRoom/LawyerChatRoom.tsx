import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaArrowLeft, FaPaperPlane, FaCircle } from 'react-icons/fa';
import '../ChatRoom/ChatRoom.css';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface ChatMsg {
  _id?: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'lawyer' | 'admin';
  content: string;
  createdAt: string | Date;
}

const LawyerChatRoom: React.FC = () => {
  const { roomId: encodedRoomId } = useParams<{ roomId: string }>();
  const roomId = decodeURIComponent(encodedRoomId || '');
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [otherName, setOtherName] = useState('Client');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history by roomId
  useEffect(() => {
    if (!roomId || !token) return;

    axios.get(`${BACKEND_URL}/api/chat/room/${encodeURIComponent(roomId)}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setMessages(res.data.messages);
      // Extract the other party's name from the first message that isn't ours
      const otherMsg = res.data.messages.find((m: ChatMsg) => m.senderId !== user?._id);
      if (otherMsg) setOtherName(otherMsg.senderName);
    }).catch(console.error);
  }, [roomId, token]);

  // Connect socket
  useEffect(() => {
    if (!roomId) return;

    const socket = io(BACKEND_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_room', roomId);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('receive_message', (msg: ChatMsg) => {
      setMessages(prev => {
        const isDuplicate = msg._id && prev.some(m => m._id === msg._id);
        if (isDuplicate) return prev;
        const optimisticIdx = prev.findIndex(
          m => !m._id && m.senderId === msg.senderId && m.content === msg.content
        );
        if (optimisticIdx !== -1) {
          const updated = [...prev];
          updated[optimisticIdx] = msg;
          return updated;
        }
        return [...prev, msg];
      });
      // Update other name if new message from other party
      if (msg.senderId !== userRef.current?._id) {
        setOtherName(msg.senderName);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const sendMessage = useCallback(() => {
    const currentUser = userRef.current;
    if (!input.trim() || !socketRef.current || !currentUser || !roomId) return;

    const msgData = {
      roomId,
      senderId: currentUser._id,
      senderName: currentUser.name,
      senderRole: currentUser.role as 'user' | 'lawyer' | 'admin',
      content: input.trim(),
    };

    const optimisticMsg: ChatMsg = { ...msgData, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, optimisticMsg]);
    socketRef.current.emit('send_message', msgData);
    setInput('');
  }, [input, roomId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (date: string | Date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const initials = otherName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="chatroom-page">
      <div className="chatroom-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft />
        </button>
        <div className="chatroom-lawyer-info">
          <div className="chatroom-avatar">{initials}</div>
          <div>
            <h3>{otherName}</h3>
            <span className={`chatroom-status ${connected ? 'online' : 'offline'}`}>
              <FaCircle />
              {connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      <div className="chatroom-messages">
        {messages.length === 0 && (
          <div className="chatroom-empty">
            <div className="chatroom-empty-icon">💬</div>
            <p>No messages yet in this conversation.</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?._id;
          return (
            <div key={msg._id || `opt-${i}`} className={`chat-msg-row ${isMe ? 'me' : 'them'}`}>
              {!isMe && <div className="chat-msg-avatar">{msg.senderName[0]}</div>}
              <div className="chat-msg-bubble-wrap">
                {!isMe && <span className="chat-msg-sender">{msg.senderName}</span>}
                <div className={`chat-msg-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                  {msg.content}
                </div>
                <span className="chat-msg-time">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatroom-input-bar">
        <textarea
          className="chatroom-input"
          placeholder="Type a message... (Enter to send)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button className="chatroom-send-btn" onClick={sendMessage} disabled={!input.trim() || !connected}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default LawyerChatRoom;
