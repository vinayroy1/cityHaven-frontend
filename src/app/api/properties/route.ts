import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'properties api', data: [] });
}

export async function POST() {
  return NextResponse.json({ status: 'properties api', created: true });
}
