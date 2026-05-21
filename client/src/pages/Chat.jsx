import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { socket } from '../services/socket';
import API from '../services/api';
import { FiSend, FiMessageSquare, FiUsers } from 'react-icons/fi';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // 1. Fetch chat history
    const fetchChatLogs = async () => {
      try {
        const { data } = await API.get('/chat');
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load chat history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatLogs();

    // 2. Setup socket listener
    socket.on('chat:message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Clean up listener
    return () => {
      socket.off('chat:message');
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    // Send through WebSocket
    socket.emit('send_chat_message', {
      userId: user._id,
      text: newMessage.trim(),
    });

    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100svh-8rem)] sm:h-[calc(100vh-8rem)] max-w-5xl mx-auto border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl">
            <FiMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Team Workspace Chat</h3>
            <p className="text-[10px] text-slate-400">Collaborate with your team members in real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-full">
          <FiUsers className="text-violet-400" />
          <span>General Channel</span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0 bg-slate-950/20">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {messages.length > 0 ? (
          messages.map((msg) => {
            const isSelf = msg.user?._id === user?._id;
            let roleBadge = 'bg-slate-850 text-slate-450 border border-slate-800';
            if (msg.user?.role === 'Admin') {
              roleBadge = 'bg-violet-600/10 text-violet-400 border border-violet-500/20';
            }

            return (
              <div key={msg._id} className={`flex gap-3 max-w-[85%] ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}>
                {/* User Avatar */}
                <div className={`h-8 w-8 rounded-xl shrink-0 font-bold text-xs uppercase flex items-center justify-center border select-none ${
                  isSelf 
                    ? 'bg-violet-600/20 border-violet-500/30 text-violet-400' 
                    : 'bg-slate-800 border-slate-700 text-slate-350'
                }`}>
                  {msg.user?.name?.[0] || 'U'}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${isSelf ? 'justify-end' : ''}`}>
                    <span className="font-semibold text-slate-300">{msg.user?.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${roleBadge}`}>
                      {msg.user?.role}
                    </span>
                    <span>•</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className={`p-3 text-sm rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    isSelf
                      ? 'bg-violet-600/80 text-white rounded-tr-none border border-violet-500/20 shadow-md shadow-violet-600/10'
                      : 'bg-slate-900/70 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
            <FiMessageSquare className="w-8 h-8 text-slate-600" />
            <p className="text-xs">No chat messages logged. Send a message to start collaboration!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/60 shrink-0 flex items-center gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all"
          placeholder="Type message here..."
          maxLength="1000"
          required
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:shadow-violet-600/10 transition-all cursor-pointer select-none"
        >
          <FiSend className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};

export default Chat;
