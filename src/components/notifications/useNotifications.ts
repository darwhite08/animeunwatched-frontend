"use client";

import { useState } from "react";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'achievement', message: "Neural Link: 7-Day Streak Achieved", time: "2m ago", read: false, node: "NODE_01" },
    { id: 2, type: 'comment', message: "User 'Zoro' commented on your review", time: "15m ago", read: false, node: "NODE_04" },
    { id: 3, type: 'update', message: "Solo Leveling S2: New Trailer Synced", time: "1h ago", read: true, node: "NODE_02" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => setNotifications([]);

  return { notifications, unreadCount, markAllAsRead, clearAll };
};