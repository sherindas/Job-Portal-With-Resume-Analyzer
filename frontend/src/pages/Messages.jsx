import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getConversations, getMessages, sendMessage, getMyApplications } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import {
  FiSend, FiMessageCircle, FiPaperclip,
  FiImage, FiFile, FiX, FiDownload
} from 'react-icons/fi';

function Avatar({ name, size = 9, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
  };
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  const sizeClass = `w-${size} h-${size}`;
  return (
    <div className={`${sizeClass} ${colors[color] || colors.blue} rounded-full flex items-center justify-center shrink-0 font-semibold text-sm select-none`}>
      {initials}
    </div>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeAppId, setActiveAppId] = useState(null);
  const [activeLabel, setActiveLabel] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(); // kept for fallback
  const messagesContainerRef = useRef();
  const fileInputRef = useRef();

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await getConversations();
      setConversations(data.conversations || []);
      return data.conversations || [];
    } catch { return []; }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchConversations().then(async (convs) => {
      const appId = location.state?.applicationId;
      if (!appId) return;

      // Try to find in existing conversations
      const match = convs.find(c => c.application._id === appId);
      if (match) {
        openConversation(match.application._id, getOtherNameFromConv(match));
        return;
      }

      // Not in conversations yet — fetch application info directly
      try {
        const { data } = await getMyApplications();
        const app = (data.applications || []).find(a => a._id === appId);
        if (app) {
          const label = user?.role === 'recruiter'
            ? (app.applicant?.name || 'Applicant')
            : `Recruiter — ${app.job?.title || 'Job'}`;
          openConversation(appId, label);
        } else {
          // Recruiter path — just open with appId
          openConversation(appId, 'Candidate');
        }
      } catch {
        openConversation(appId, 'Conversation');
      }
    });
  }, []); // eslint-disable-line

  const getOtherNameFromConv = (conv) => {
    if (user?.role === 'recruiter') return conv.application?.applicant?.name || 'Applicant';
    return `Recruiter — ${conv.application?.job?.title || ''}`;
  };

  const openConversation = async (appId, label = '') => {
    setActiveAppId(appId);
    setActiveLabel(label);
    try {
      const { data } = await getMessages(appId);
      setMessages(data.messages || []);
      setConversations(prev => prev.map(c =>
        c.application._id === appId ? { ...c, unread: 0 } : c
      ));
    } catch (err) {
      // 404 means no messages yet — that's fine, just show empty chat
      if (err.response?.status !== 404) toast.error('Failed to load messages');
      setMessages([]);
    }
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Socket.io — join/leave conversation room and listen for new messages
  useEffect(() => {
    if (!socket || !activeAppId) return;

    socket.emit('join_conversation', activeAppId);

    const handleNewMessage = (msg) => {
      setMessages(prev => {
        // Avoid duplicates (our own sent messages are already added optimistically)
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Update unread count in sidebar for the other party
      fetchConversations();
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.emit('leave_conversation', activeAppId);
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, activeAppId, fetchConversations]);

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => setFilePreview({ url: ev.target.result, type: 'image', name: f.name });
      reader.readAsDataURL(f);
    } else {
      setFilePreview({ type: 'file', name: f.name, size: (f.size / 1024).toFixed(1) + ' KB' });
    }
    e.target.value = '';
  };

  const clearFile = () => { setFile(null); setFilePreview(null); };

  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!text.trim() && !file) || !activeAppId) return;
    setSending(true);
    try {
      const fd = new FormData();
      if (text.trim()) fd.append('text', text.trim());
      if (file) fd.append('file', file);
      const { data } = await sendMessage(activeAppId, fd);
      setMessages(prev => [...prev, data.message]);
      setText('');
      clearFile();
      // Refresh conversations to update last message
      fetchConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isMine = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    return senderId === user?._id || senderId === user?.id;
  };

  const totalUnread = conversations.reduce((s, c) => s + (c.unread || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiMessageCircle className="text-blue-600" /> Messages
        </h1>
        {totalUnread > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalUnread}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ height: '620px' }}>
        {/* Sidebar */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
              </div>
            ) : conversations.length === 0 && !activeAppId ? (
              <div className="text-center py-10 text-gray-400 px-4">
                <FiMessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium text-gray-600">No conversations yet</p>
                <p className="text-xs mt-2 leading-relaxed">
                  {user?.role === 'jobseeker'
                    ? 'Apply for a job, then click "Message Recruiter" on the job page'
                    : 'Go to Dashboard → Applicants → click "Message" on a candidate'}
                </p>
              </div>
            ) : (
              <>
                {/* Active new conversation not yet in list */}
                {activeAppId && !conversations.find(c => c.application._id === activeAppId) && (
                  <div className="px-4 py-3 bg-blue-50 border-l-4 border-l-blue-500 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <Avatar name={activeLabel} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 truncate">{activeLabel}</p>
                        <p className="text-xs text-gray-400">New conversation</p>
                      </div>
                    </div>
                  </div>
                )}
                {conversations.map(conv => {
                  const isActive = activeAppId === conv.application._id;
                  const name = getOtherNameFromConv(conv);
                  return (
                    <button key={conv.application._id}
                      onClick={() => openConversation(conv.application._id, name)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start gap-3
                        ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                      <Avatar name={name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                          {conv.unread > 0 && (
                            <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-blue-600 truncate">{conv.application?.job?.title}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {conv.lastMessage?.fileUrl
                            ? '📎 ' + (conv.lastMessage.fileName || 'File')
                            : conv.lastMessage?.text}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {!activeAppId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center px-6">
                <FiMessageCircle size={52} className="mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-gray-600">Select a conversation</p>
                <p className="text-sm mt-2 leading-relaxed text-gray-400">
                  {user?.role === 'jobseeker'
                    ? 'Apply for a job → open the job page → click "Message Recruiter"'
                    : 'Dashboard → Applicants tab → click "Message" on any candidate'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                <Avatar name={activeLabel} size={10} color="blue" />
                <div>
                  <p className="font-semibold text-gray-900">{activeLabel}</p>
                  <p className="text-xs text-green-500 font-medium">● Online</p>
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/30 scroll-smooth">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    <FiMessageCircle size={36} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-medium">No messages yet</p>
                    <p className="text-xs mt-1">Send a message to start the conversation 👋</p>
                  </div>
                ) : messages.map(msg => {
                  const mine = isMine(msg);
                  return (
                    <div key={msg._id} className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                      {!mine && <Avatar name={msg.sender?.name} size={7} color="blue" />}
                      <div className={`max-w-xs lg:max-w-sm rounded-2xl overflow-hidden shadow-sm
                        ${mine ? 'rounded-br-sm bg-blue-600 text-white' : 'rounded-bl-sm bg-white border border-gray-200 text-gray-800'}`}>
                        {msg.fileType === 'image' && msg.fileUrl && (
                          <a href={`http://localhost:5000/${msg.fileUrl}`} target="_blank" rel="noreferrer">
                            <img src={`http://localhost:5000/${msg.fileUrl}`} alt={msg.fileName}
                              className="max-w-full max-h-48 object-cover" />
                          </a>
                        )}
                        {msg.fileType === 'file' && msg.fileUrl && (
                          <a href={`http://localhost:5000/${msg.fileUrl}`} target="_blank" rel="noreferrer"
                            className={`flex items-center gap-2 px-4 py-3 hover:opacity-80 transition-opacity ${mine ? 'text-white' : 'text-blue-600'}`}>
                            <FiFile size={18} className="shrink-0" />
                            <span className="text-sm truncate max-w-[160px]">{msg.fileName}</span>
                            <FiDownload size={14} className="shrink-0 ml-auto" />
                          </a>
                        )}
                        {msg.text && (
                          <p className="px-4 py-2.5 text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                        )}
                        <p className={`text-xs px-4 pb-2 ${mine ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {mine && <Avatar name={user?.name} size={7} color="purple" />}
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* File preview */}
              {filePreview && (
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
                  {filePreview.type === 'image' ? (
                    <img src={filePreview.url} alt="preview" className="h-14 w-14 object-cover rounded-lg" />
                  ) : (
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <FiFile size={16} className="text-blue-500" />
                      <span className="text-sm text-gray-700 truncate max-w-[180px]">{filePreview.name}</span>
                      <span className="text-xs text-gray-400">{filePreview.size}</span>
                    </div>
                  )}
                  <button onClick={clearFile} className="ml-auto text-gray-400 hover:text-red-500">
                    <FiX size={18} />
                  </button>
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white">
                <div className="flex items-end gap-2">
                  <div className="flex gap-1 pb-1">
                    <button type="button"
                      onClick={() => { fileInputRef.current.accept = 'image/*'; fileInputRef.current.click(); }}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Send image">
                      <FiImage size={18} />
                    </button>
                    <button type="button"
                      onClick={() => { fileInputRef.current.accept = '.pdf,.docx,.doc,.txt,.zip'; fileInputRef.current.click(); }}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Attach file">
                      <FiPaperclip size={18} />
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
                  <textarea
                    rows={1}
                    className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 overflow-y-auto"
                    placeholder="Type a message... (Enter to send)"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ minHeight: '42px' }}
                  />
                  <button onClick={handleSend} disabled={sending || (!text.trim() && !file)}
                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0">
                    <FiSend size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
