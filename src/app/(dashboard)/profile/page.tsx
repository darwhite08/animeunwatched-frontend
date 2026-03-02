"use client"

import ProfileForm from "@/components/profile/ProfileForm"

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">
          Profile Settings
        </h1>
        <p className="text-white/50 mt-2">
          Manage your Anime Unwatched profile details.
        </p>
      </div>

      <ProfileForm />
    </div>
  )
}