import { contains } from "ramda"

export const parseBasicRoom = data => ({
  createdAt: data.created_at,
  createdByUserId: data.created_by_id,
  id: data.id,
  isPrivate: data.private,
  name: data.name,
  updatedAt: data.updated_at,
  customData: data.custom_data,
})

export const parseBasicUser = data => ({
  avatarURL: data.avatar_url,
  createdAt: data.created_at,
  customData: data.custom_data,
  id: data.id,
  name: data.name,
  updatedAt: data.updated_at,
})

export const parsePresence = data => ({
  state: contains(data.state, ["online", "offline"]) ? data.state : "unknown",
})

export const parseBasicMessage = data => ({
  id: data.id,
  senderId: data.user_id,
  roomId: data.room_id,
  text: data.text,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  attachment: data.attachment && parseMessageAttachment(data.attachment),
})

export const parseBasicCursor = data => ({
  position: data.position,
  updatedAt: data.updated_at,
  userId: data.user_id,
  roomId: data.room_id,
  type: data.cursor_type,
})

const parseMessageAttachment = data => ({
  link: data.resource_link,
  type: data.type,
})
