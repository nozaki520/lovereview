'use server'

import { createClient } from '@/utils/supabase/server'

export async function searchItemsForSuggest(query: string) {
  if (!query || query.length < 2) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('items')
    .select('id, name, genre, image_url')
    .ilike('name', `%${query}%`)
    .limit(3)
  return data || []
}
