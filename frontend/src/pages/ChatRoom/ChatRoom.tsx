import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { lawyerAPI } from '../../services/api';
import axios from 'axios';
import type { Lawyer } from '../../types';
import { FaArrowLeft, FaPaperPlane, FaCircle, FaVideo, FaEnvelope } from 'react-icons/fa';
import './ChatRoom.css';

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

const ChatRoom: React.FC = () => {
  const { lawyerId } = useParams<{ lawyerId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [roomId, setRoomId] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Keep stable refs for user data to avoid re-running socket effect
  const userRef = useRef(user);
  const tokenRef = useRef(token);
  userRef.current = user;
  tokenRef.current = token;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load lawyer info and chat history
  useEffect(() => {
    if (!lawyerId || !userRef.current) return;

    lawyerAPI.getById(lawyerId).then(res => setLawyer(res.data.lawyer)).catch(() => navigate('/lawyers'));

    // Fetch history
    axios.get(`${BACKEND_URL}/api/chat/${lawyerId}/history`, {
      headers: { Authorization: `Bearer ${tokenRef.current}` },
    }).then(res => {
      setRoomId(res.data.roomId);
      setMessages(res.data.messages);
    }).catch(console.error);
  }, [lawyerId, navigate]);

  // Connect socket when roomId is known — use stable deps only
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
      // Deduplicate: skip if we already have this message (from optimistic add)
      setMessages(prev => {
        // If we already optimistically added a message with same content/sender/time-range, skip
        const isDuplicate = msg._id && prev.some(m => m._id === msg._id);
        if (isDuplicate) return prev;

        // Replace the optimistic placeholder if it exists
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

    // Optimistically add the message to the UI immediately
    const optimisticMsg: ChatMsg = {
      ...msgData,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    socketRef.current.emit('send_message', msgData);
    setInput('');
  }, [input, roomId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: string | Date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const initials = lawyer?.userId?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'LA';

  return (
    <div className="chatroom-page">
      {/* Header */}
      <div className="chatroom-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <div className="chatroom-lawyer-info">
          <div className="chatroom-avatar">{initials}</div>
          <div>
            <h3>{lawyer?.userId?.name || 'Loading...'}</h3>
            <span className={`chatroom-status ${connected ? 'online' : 'offline'}`}>
              <FaCircle />
              {connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
        <div className="chatroom-header-actions">
          {lawyerId && (
            <>
              <button
                className="btn btn-ghost btn-sm"
                title="Schedule Meeting"
                onClick={() => navigate(`/meetings/schedule/${lawyerId}`)}
              >
                <FaVideo />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                title="Email Lawyer"
                onClick={() => navigate(`/contact/${lawyerId}`)}
              >
                <FaEnvelope />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chatroom-messages">
        {messages.length === 0 && (
          <div className="chatroom-empty">
            <div className="chatroom-empty-icon">💬</div>
            <p>Start your conversation with {lawyer?.userId?.name || 'the lawyer'}.</p>
            <p className="text-muted">All messages are private and encrypted.</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?._id;
          return (
            <div key={msg._id || `opt-${i}`} className={`chat-msg-row ${isMe ? 'me' : 'them'}`}>
              {!isMe && (
                <div className="chat-msg-avatar">{msg.senderName[0]}</div>
              )}
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

      {/* Input */}
      <div className="chatroom-input-bar">
        <textarea
          className="chatroom-input"
          placeholder="Type a message... (Enter to send)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="chatroom-send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || !connected}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;

