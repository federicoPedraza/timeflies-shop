import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const response = await fetch('https://www.tiendanube.com/apps/authorize/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.TIENDANUBE_APP_ID,
      client_secret: process.env.TIENDANUBE_APP_SECRET,
      grant_type: 'authorization_code',
      code,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: 400 });
  }

  return NextResponse.json({
    access_token: data.access_token,
    user_id: data.user_id,
    message: 'Access token obtained successfully. Please add TIENDANUBE_ACCESS_TOKEN and TIENDANUBE_USER_ID to your .env file.',
    env_variables: {
      TIENDANUBE_ACCESS_TOKEN: data.access_token,
      TIENDANUBE_USER_ID: data.user_id,
    }
  });
}
