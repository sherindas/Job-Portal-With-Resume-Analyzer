import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAllRead, markOneRead, deleteNotification } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { FiBell, FiX, FiCheck } from 'react-icons/fi';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Keep a light fallback poll (every 60s) in case socket misses something
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Socket.io — instant notification push
  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 30));
      setUnread(prev => prev + 1);
    };
    socket.on('new_notification', handleNewNotification);
    return () => socket.off('new_notification', handleNewNotification);
  }, [socket]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const handleClick = async (n) => {
    if (!n.read) {
      await markOneRead(n._id);
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x));
      setUnread(prev => Math.max(0, prev - 1));
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    setUnread(prev => {
      const n = notifications.find(x => x._id === id);
      return n && !n.read ? Math.max(0, prev - 1) : prev;
    });
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
        <FiBell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {unread > 0 && (
              <button onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                <FiCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FiBell size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : notifications.map(n => (
              <div key={n._id} onClick={() => handleClick(n)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                <button onClick={(e) => handleDelete(e, n._id)}
                  className="text-gray-300 hover:text-red-400 shrink-0 mt-0.5">
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
