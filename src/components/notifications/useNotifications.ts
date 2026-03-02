"use client"

import { useState } from "react"

export type Notification = {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Follower",
      description: "Someone followed your anime list.",
      time: "2m ago",
      read: false,
    },
    {
      id: "2",
      title: "Poll Update",
      description: "Attack on Titan is trending in polls.",
      time: "1h ago",
      read: false,
    },
    {
      id: "3",
      title: "Leaderboard Change",
      description: "One Piece moved to #1.",
      time: "3h ago",
      read: true,
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    )
  }

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
  }
}