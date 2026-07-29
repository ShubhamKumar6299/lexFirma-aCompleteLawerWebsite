import mongoose from 'mongoose';
import Lawyer from '../models/Lawyer';
import type { IUser } from '../models/User';

const ROOM_PREFIX = 'room_';

/**
 * A chat room has exactly two participants, identified by:
 *   - the client's `User._id`
 *   - the lawyer's `Lawyer._id` (the profile, not the underlying user)
 *
 * The id is sorted so both sides derive the same room without coordination.
 */
export const buildRoomId = (userId: string, lawyerId: string): string =>
  `${ROOM_PREFIX}${[userId, lawyerId].sort().join('_')}`;

/**
 * Splits a room id back into its two participant ids.
 * Returns null for anything malformed, so callers can reject untrusted input
 * before it reaches a query.
 */
export const parseRoomId = (roomId: string): [string, string] | null => {
  if (typeof roomId !== 'string' || !roomId.startsWith(ROOM_PREFIX)) return null;

  const parts = roomId.slice(ROOM_PREFIX.length).split('_');
  if (parts.length !== 2) return null;
  if (!parts.every((id) => mongoose.Types.ObjectId.isValid(id))) return null;

  return [parts[0], parts[1]];
};

/**
 * A requester may access a room only when they are one of its two participants:
 * either directly as the client, or via the lawyer profile they own.
 *
 * Checking the lawyer profile covers the case of a lawyer who is also someone
 * else's client — they appear under different ids in different rooms.
 */
export const canAccessRoom = async (user: IUser, roomId: string): Promise<boolean> => {
  const participants = parseRoomId(roomId);
  if (!participants) return false;

  if (participants.includes(String(user._id))) return true;

  const lawyerProfile = await Lawyer.findOne({ userId: user._id }).select('_id').lean();
  return !!lawyerProfile && participants.includes(String(lawyerProfile._id));
};
