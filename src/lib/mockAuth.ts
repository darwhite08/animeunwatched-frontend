export const mockLogin = (provider: "google" | "apple") => {
  const user = {
    name: "Priyanshu",
    provider,
    loggedIn: true,
  }

  localStorage.setItem("anime_user", JSON.stringify(user))
}

export const mockLogout = () => {
  localStorage.removeItem("anime_user")
}

export const getMockUser = () => {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem("anime_user")
  return data ? JSON.parse(data) : null
}