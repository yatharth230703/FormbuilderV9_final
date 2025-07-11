import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { client as pgClient } from '../db';

/**
 * Generate a secure 64-character hex API key
 */

export async function apiKeyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
  
    const apiKey = authHeader.split(' ')[1];
  
    const userResult = await pgClient`
      SELECT * FROM users WHERE api_key = ${apiKey} LIMIT 1
    `;
  
    if (!userResult || userResult.length === 0) {
      return res.status(403).json({ error: 'Invalid API key' });
    }
  
    req.user = {
      id: userResult[0].id,
      uuid: userResult[0].uuid,
      email: userResult[0].email,
      username: userResult[0].username,
    };
  
    next();
}


function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Fetch existing API key or generate and store a new one for a user
 */
export async function getOrCreateApiKeyForUser(userUuid: string): Promise<string> {
  const existing = await pgClient`
    SELECT api_key FROM users WHERE uuid = ${userUuid} LIMIT 1
  `;

  if (existing?.[0]?.api_key) {
    return existing[0].api_key;
  }

  const newKey = generateApiKey();

  await pgClient`
    UPDATE users
    SET api_key = ${newKey}
    WHERE uuid = ${userUuid}
  `;

  return newKey;
}
