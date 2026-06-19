import { NextResponse } from 'next/server'
export async function GET() { return NextResponse.json({ events: [] }) }
export async function POST() { return NextResponse.json({ event: null }, { status: 501 }) }
