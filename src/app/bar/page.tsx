import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BarClient from './BarClient'

export default async function BarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('display_name')
    .eq('id', user.id)
    .single()

  return <BarClient displayName={profile?.display_name || 'お客さん'} />
}