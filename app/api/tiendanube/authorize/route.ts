import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.TIENDANUBE_APP_ID;
  if (!appId) {
    return NextResponse.json({ error: 'App ID not configured' }, { status: 500 });
  }
  const redirectUrl = `https://www.tiendanube.com/apps/${appId}/authorize`;
  return NextResponse.redirect(redirectUrl);
}
