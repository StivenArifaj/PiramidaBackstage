import { NextResponse } from 'next/server'
export async function GET() { return NextResponse.json({ event: null }) }
export async function PATCH() { return NextResponse.json({ event: null }, { status: 501 }) }
