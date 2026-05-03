import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, UserCircle, CheckCircle2, Upload } from 'lucide-react'
import { updateProfile } from './actions'

export default async function ProfileSettingsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string, error?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <div>Unauthorized</div>

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <Link href="/home" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-8 inline-flex font-medium">
        <ArrowLeft className="w-4 h-4" />
        ホームへ戻る
      </Link>
      
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="text-white w-8 h-8" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">プロフィール設定</h1>
            <p className="text-zinc-400 text-sm font-medium">表示名やアイコン画像を変更します</p>
          </div>
        </div>

        <form action={updateProfile} className="space-y-6">
          {resolvedSearchParams.message && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {resolvedSearchParams.message}
            </div>
          )}
          {resolvedSearchParams.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl flex items-center gap-2">
              {resolvedSearchParams.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="display_name" className="text-sm font-bold text-zinc-300">ユーザー名（表示名）</label>
            <input 
              id="display_name" name="display_name" type="text" required 
              defaultValue={profile?.display_name || ''}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white font-medium placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-300">アイコン画像</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 border border-white/10 border-dashed rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-400">端末から画像を選択</span>
                  <input type="file" name="avatar_file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-1">※画像ファイル（JPG, PNG等）を選んでください。選択しない場合は今の画像のままになります。</p>
            <input type="hidden" name="current_avatar_url" value={profile?.avatar_url || ''} />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-bold text-zinc-300">自己紹介（任意）</label>
            <textarea 
              id="bio" name="bio" rows={4}
              defaultValue={profile?.bio || ''}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white resize-none font-medium placeholder:text-zinc-600"
              placeholder="好きなモノや趣味など..."
            ></textarea>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-[0.98]"
          >
            変更を保存する
          </button>
        </form>
      </div>
    </div>
  )
}
