"use strict";
// Google OAuth（ID トークン）による認証
// Animel（別オリジンの静的フロント）から書き込み系 API を使うための認証基盤。
// 検証はこのサーバー側で行い、許可した Google アカウントのトークンだけを通す。
const { OAuth2Client } = require('google-auth-library');

const clientId = process.env.ANIME_GOOGLE_CLIENT_ID || '';
const allowedEmail = process.env.ANIME_GOOGLE_ALLOWED_EMAIL || '';
const client = clientId ? new OAuth2Client(clientId) : null;

// ID トークンを検証し、許可アカウントなら payload を返す。それ以外は例外。
async function verifyGoogleIdToken(idToken) {
  if (!client) {
    throw new Error('Google OAuth is not configured (ANIME_GOOGLE_CLIENT_ID is empty)');
  }
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: clientId
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('invalid token payload');
  }
  if (payload.email_verified !== true) {
    throw new Error('email is not verified');
  }
  if (!allowedEmail || payload.email !== allowedEmail) {
    throw new Error('account is not allowed');
  }
  return payload;
}

// 認証必須エンドポイント用のミドルウェア。
// Authorization: Bearer <Google ID トークン> を検証し、通れば req.googleUser に payload を入れる。
exports.requireGoogleAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      throw new Error('missing bearer token');
    }
    req.googleUser = await verifyGoogleIdToken(match[1]);
    next();
  }
  catch (e) {
    res.status(401).json({
      status: 'ng',
      body: 'unauthorized'
    });
  }
};

exports.verifyGoogleIdToken = verifyGoogleIdToken;
