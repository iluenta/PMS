import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { channelId, personId } = await req.json()
    if (!channelId || !personId) return NextResponse.json({ ok: false }, { status: 400 })
    const { error } = await supabase
      .from('distribution_channels')
      .update({ person_id: personId })
      .eq('id', channelId)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 })
  }
}


