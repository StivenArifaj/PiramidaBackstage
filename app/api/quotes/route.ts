import { NextResponse } from 'next/server'
export async function POST() { return NextResponse.json({ quote: null }, { status: 501 }) }
