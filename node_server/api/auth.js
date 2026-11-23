"use strict";
// Google OAuth（ID トークン）による認証
// Animel（別オリジンの静的フロント）から書き込み系 API を使うための認証基盤。
// 検証はこのサーバー側で行い、許可した Google アカウントのトークンだけを通す。
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

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

// サーバー発行セッショントークン。
// Google ID トークンの有効期限（1時間）に縛られず管理画面へ入り続けるため、
// Google 認証が通ったクライアントへ有効期間30日のトークンを発行する。
// 形式: s1.<base64url(JSON {email, exp})>.<base64url(HMAC-SHA256)>
const sessionSecret = process.env.ANIME_SESSION_SECRET || '';
const SESSION_PREFIX = 's1.';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function signSessionPayload(payloadB64) {
  return crypto.createHmac('sha256', sessionSecret).update(payloadB64).digest('base64url');
}

// セッショントークンを発行する（Google 認証済みのメールアドレスに対してのみ呼ぶこと）
function mintSessionToken(email) {
  if (!sessionSecret) {
    throw new Error('session is not configured (ANIME_SESSION_SECRET is empty)');
  }
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payloadB64 = Buffer.from(JSON.stringify({ email: email, exp: expiresAt }), 'utf8').toString('base64url');
  return {
    token: SESSION_PREFIX + payloadB64 + '.' + signSessionPayload(payloadB64),
    expiresAt: expiresAt
  };
}

// セッショントークンを検証し、許可アカウントのものなら payload を返す。それ以外は null。
function verifySessionToken(token) {
  if (!sessionSecret || typeof token !== 'string' || !token.startsWith(SESSION_PREFIX)) {
    return null;
  }
  const rest = token.slice(SESSION_PREFIX.length);
  const dot = rest.lastIndexOf('.');
  if (dot < 0) {
    return null;
  }
  const payloadB64 = rest.slice(0, dot);
  const signature = Buffer.from(rest.slice(dot + 1));
  const expected = Buffer.from(signSessionPayload(payloadB64));
  if (signature.length !== expected.length || !crypto.timingSafeEqual(signature, expected)) {
    return null;
  }
  let payload = null;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  }
  catch (e) {
    return null;
  }
  if (!payload || payload.email !== allowedEmail || typeof payload.exp !== 'number' || payload.exp <= Date.now()) {
    return null;
  }
  return payload;
}

// Bearer トークンを検証する。Google ID トークンとセッショントークンの両方を受ける。
async function verifyBearerToken(token) {
  if (typeof token === 'string' && token.startsWith(SESSION_PREFIX)) {
    const payload = verifySessionToken(token);
    if (!payload) {
      throw new Error('invalid session token');
    }
    return { email: payload.email, session: true };
  }
  return verifyGoogleIdToken(token);
}

function extractBearerToken(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

// 認証必須エンドポイント用のミドルウェア（Google ID トークンのみ）。
// Authorization: Bearer <Google ID トークン> を検証し、通れば req.googleUser に payload を入れる。
exports.requireGoogleAuth = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new Error('missing bearer <redacted>');
    }
    req.googleUser = await verifyGoogleIdToken(token);
    next();
  }
  catch (e) {
    res.status(401).json({
      status: 'ng',
      body: 'unauthorized'
    });
  }
};

// Bearer 認証用のミドルウェア（Google ID トークン／セッショントークンのどちらでもよい）。
exports.requireBearerAuth = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new Error('missing bearer <redacted>');
    }
    req.googleUser = await verifyBearerToken(token);
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
exports.mintSessionToken = mintSessionToken;
exports.verifySessionToken = verifySessionToken;

// 書き込み系エンドポイント用の二段構え認証（SMA フロント層の移行期間用）。
// 以下のどちらかを満たせば通す：
//  1. Authorization: Bearer <Google ID トークン／セッショントークン>（Animel から）
//  2. X-Sma-Auth-Marker: basic（nginx の Basic 認証を通過した従来の管理ページから）
// 印ヘッダーは nginx が Basic 認証成功時にだけ付け、proxy_set_header で必ず上書きされる。
// API ポート（8000）は外部公開されていないため、外部のクライアントが印を偽造することはできない。
// SMA のフロント層を破棄したら、この二段構えは Bearer のみに一本化する。
exports.requireWriteAuth = (req, res, next) => {
  if (req.headers['x-sma-auth-marker'] === 'basic') {
    req.authMethod = 'basic';
    return next();
  }
  return exports.requireBearerAuth(req, res, next);
};
