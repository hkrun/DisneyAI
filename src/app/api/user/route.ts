import { NextRequest, NextResponse } from 'next/server';
import { findUserCreditsByUserId } from '@/actions/user';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credits = await findUserCreditsByUserId(token.userId as string);
    return NextResponse.json({ credits }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credits = await findUserCreditsByUserId(token.userId as string);
    return NextResponse.json({ credits }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}