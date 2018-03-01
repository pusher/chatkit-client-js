import { contains } from 'ramda'

import { extractQueryParams } from './utils'

export const parseBasicRoom = data => ({
  createdAt: data.created_at,
  createdByUserId: data.created_by_id,
  deletedAt: data.deletedAt,
  id: data.id,
  isPrivate: data.private,
  name: data.name,
  updatedAt: data.updated_at,
  userIds: data.member_user_ids
})

export const parseBasicUser = data => ({
  avatarURL: data.avatar_url,
  createdAt: data.created_at,
  customData: data.custom_data,
  id: data.id,
  name: data.name,
  updatedAt: data.updated_at
})

export const parsePresence = data => ({
  lastSeenAt: data.last_seen_at,
  state: contains(data.state, ['online', 'offline']) ? data.state : 'unknown',
  userId: data.user_id
})

export const parseBasicMessage = data => ({
  id: data.id,
  senderId: data.user_id,
  roomId: data.room_id,
  text: data.text,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  attachment: data.attachment && parseMessageAttachment(data.attachment)
})

export const parseFetchedAttachment = data => ({
  file: {
    name: data.file.name,
    bytes: data.file.bytes,
    lastModified: data.file.last_modified
  },
  link: data.resource_link,
  ttl: data.ttl
})

export const parseBasicCursor = data => ({
  position: data.position,
  updatedAt: data.updated_at,
  userId: data.user_id,
  roomId: data.room_id,
  type: data.cursor_type
})

const parseMessageAttachment = data => ({
  link: data.resource_link,
  type: data.type,
  fetchRequired: extractQueryParams(data.resource_link).chatkit_link === 'true'
})
