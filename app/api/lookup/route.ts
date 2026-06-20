import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getEventByRef } from '@/lib/db/queries/events'

const lookupSchema = z.object({
  email: z.string().email(),
  reference_code: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = lookupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Provide a valid email and reference code.' }, { status: 400 })
    }

    const { email, reference_code } = parsed.data
    const event = await getEventByRef(reference_code)

    if (!event) {
      return NextResponse.json({ error: 'No booking found for that reference code.' }, { status: 404 })
    }

    // Verify the email matches — prevents anyone from looking up arbitrary bookings
    if (event.organizer_email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Email address does not match this booking.' }, { status: 403 })
    }

    return NextResponse.json({ reference_code: event.reference_code })
  } catch (err) {
    console.error('[POST /api/lookup]', err)
    return NextResponse.json({ error: 'Lookup failed. Please try again.' }, { status: 500 })
  }
}
