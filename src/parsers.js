import { contains } from "ramda"

export const parseBasicRoom = data => ({
  createdAt: data.created_at,
  createdByUserId: data.created_by_id,
  id: data.id,
  isPrivate: data.private,
  name: data.name,
  updatedAt: data.updated_at,
  customData: data.custom_data,
  deletedAt: data.deleted_at,
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

export const parseBasicMessage = data => {
  const basicMessage = {
    id: data.id,
    senderId: data.user_id,
    roomId: data.room_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }

  if (data.parts) {
    // v3 message
    basicMessage.parts = data.parts.map(p => parseMessagePart(p))
  } else {
    // v2 message
    basicMessage.text = data.text
    if (data.attachment) {
      basicMessage.attachment = parseMessageAttachment(data.attachment)
    }
  }

  return basicMessage
}

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
  name: data.name,
})

const parseMessagePart = data => {
  if (data.content) {
    return {
      partType: "inline",
      payload: {
        type: data.type,
        content: data.content,
      },
    }
  } else if (data.url) {
    return {
      partType: "url",
      payload: {
        type: data.type,
        url: data.url,
      },
    }
  } else {
    // TODO attachment payload
    throw new TypeError("failed to parse message part")
  }
}
