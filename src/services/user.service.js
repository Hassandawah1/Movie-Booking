import api from "../api/axios"

export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.put("/users/me/password", { currentPassword, newPassword })
  return response.data
}

export const deleteAccount = async ({ currentPassword, confirmation }) => {
  const response = await api.delete("/users/me", {
    data: { currentPassword, confirmation }
  })
  return response.data
}
