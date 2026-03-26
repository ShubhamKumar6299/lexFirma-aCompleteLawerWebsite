import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import { chatbotAPI } from '../../services/api';
import './ChatbotWidget.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: '👋 Hello! I\'m LexBot, your legal assistant. Ask me about lawyers, case types, or how to schedule a meeting!',
    sender: 'bot',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input.trim(), sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await chatbotAPI.sendMessage(input.trim());
      const botMsg: Message = { id: Date.now() + 1, text: res.data.reply, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const errMsg: Message = { id: Date.now() + 1, text: 'Sorry, I\'m having trouble connecting. Please try again!', sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chatbot-window animate-fadeInUp">
          <div className="chatbot-header">
            <div className="chatbot-bot-info">
              <div className="chatbot-avatar"><FaRobot /></div>
              <div>
                <h4>LexBot</h4>
                <span className="chatbot-status"><span className="online-dot" />Online</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}><FaTimes /></button>
          </div>

          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-icon">
                  {msg.sender === 'bot' ? <FaRobot /> : <FaUser />}
                </div>
                <div className="message-content">
                  <p>{msg.text}</p>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="message-icon"><FaRobot /></div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <textarea
              className="chatbot-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about lawyers, cases, meetings..."
              rows={1}
            />
            <button className="chatbot-send" onClick={sendMessage} disabled={!input.trim()}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}

      <button className={`chatbot-toggle ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)} aria-label="Open chat">
        {isOpen ? <FaTimes /> : <FaComments />}
        {!isOpen && <span className="chatbot-badge">1</span>}
      </button>
    </div>
  );
};

export default ChatbotWidget;
