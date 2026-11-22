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

// 書き込み系エンドポイント用の二段構え認証（SMA フロント層の移行期間用）。
// 以下のどちらかを満たせば通す：
//  1. Authorization: Bearer <Google ID トークン>（Animel から）
//  2. X-Sma-Auth-Marker: basic（nginx の Basic 認証を通過した従来の管理ページから）
// 印ヘッダーは nginx が Basic 認証成功時にだけ付け、proxy_set_header で必ず上書きされる。
// API ポート（8000）は外部公開されていないため、外部のクライアントが印を偽造することはできない。
// SMA のフロント層を破棄したら、この二段構えは Bearer のみに一本化する。
exports.requireWriteAuth = (req, res, next) => {
  if (req.headers['x-sma-auth-marker'] === 'basic') {
    req.authMethod = 'basic';
    return next();
  }
  return exports.requireGoogleAuth(req, res, next);
};
