import type { Socket } from 'socket.io';
import User, { IUser } from '../models/User';
import { verifyAccessToken } from '../utils/jwt';

/** A socket that has cleared the handshake and carries its resolved user. */
export interface AuthedSocket extends Socket {
  data: Socket['data'] & { user: IUser };
}

/**
 * Socket.io handshake guard — the websocket equivalent of `protect`.
 *
 * Rejects the connection outright when no valid token is presented, so an
 * unauthenticated client never reaches a room or an event handler.
 */
export const socketAuth = async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  const token = socket.handshake.auth?.token;

  if (!token || typeof token !== 'string') {
    next(new Error('Not authorized, no token'));
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      next(new Error('User not found'));
      return;
    }

    socket.data.user = user;
    next();
  } catch {
    next(new Error('Token invalid or expired'));
  }
};
