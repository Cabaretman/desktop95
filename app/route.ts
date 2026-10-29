import desktopHTML from '../public/index.html?raw';

export function GET() {
  return new Response(desktopHTML, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' } });
}
