import { curry, contains } from 'ramda'

import { Room } from './room'

export const parseRoom = curry((userStore, data) => new Room({
  createdAt: data.created_at,
  createdByUserId: data.created_by_id,
  deletedAt: data.deletedAt,
  id: data.id,
  isPrivate: data.private,
  name: data.name,
  updatedAt: data.updated_at,
  userIds: data.member_user_ids,
  userStore
}))

export const parseUser = data => ({
  avatarURL: data.avatar_url,
  createdAt: data.created_at,
  customData: data.custom_data,
  id: data.id,
  name: data.name,
  updatedAt: data.updated_at
})

export const parsePresenceState = data => ({
  lastSeenAt: data.last_seen_at,
  state: contains(data.state, ['online', 'offline']) ? data.state : 'unknown',
  userId: data.user_id
})
