'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { deleteAccount } from './actions'

export default function DeleteAccountButton() {
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        setLoading(true)
        try {
            await deleteAccount()
        } catch (e: unknown) {
            // Next.jsのredirectはエラーとして投げられるので無視する
            if (e instanceof Error && e.message === 'NEXT_REDIRECT') return
            alert('退会処理に失敗しました。もう一度お試しください。')
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="w-full py-3 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/10 transition-all"
            >
                退会する
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <h2 className="text-lg font-bold">本当に退会しますか？</h2>
                        </div>

                        <p className="text-zinc-400 text-sm mb-2">
                            退会すると以下の処理が行われます：
                        </p>
                        <ul className="text-zinc-400 text-sm mb-6 space-y-1 list-disc list-inside">
                            <li>アカウント情報が削除されます</li>
                            <li>投稿したレビューは「退会済みユーザー」として残ります</li>
                            <li>この操作は取り消せません</li>
                        </ul>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                                className="flex-1 py-3 border border-white/10 text-zinc-300 font-bold rounded-xl hover:bg-white/5 transition-all"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                            >
                                {loading ? '処理中...' : '退会する'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}