import { env } from 'cloudflare:workers';
import { handleChat } from '../../../lib/chat-api.mjs';

export const dynamic = 'force-dynamic';
export function GET(request: Request) { return handleChat(request, env); }
export function POST(request: Request) { return handleChat(request, env); }
