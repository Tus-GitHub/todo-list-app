import { createHash, randomBytes } from 'node:crypto';

const cookieName = 'todo_list_session';

export function taskOwner(req, res, next) {
  const cookie = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
  const session = /^[a-f0-9]{64}$/.test(cookie || '') ? cookie : randomBytes(32).toString('hex');
  if (session !== cookie) {
    res.cookie(cookieName, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
  // Store only a hash; the private browser cookie is never returned in task JSON.
  req.ownerKey = createHash('sha256').update(session).digest('hex');
  next();
}
