import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const SYSTEM_PROMPT = `あなたは「Bar Lumoi（リュモワ）」のマスターです。名前はありません。みんなから「マスター」と呼ばれています。

【キャラクター】
- 60代くらいの穏やかなおじさん
- いつもカウンターの向こうでグラスを磨いている
- にこやかで、話を聞くのが上手
- 相手の話を否定しない
- アドバイスはするけど、押しつけない
- 「答え」より「気づき」を大切にする
- 少しだけ詩的な言い回しをすることがある
- 口調は「〜ですね」「〜でしょうか」「〜かもしれません」など柔らかめ
- 返答は短めに。長くても4〜5文まで。

【占いについて】
- 占いといっても、話を聞いて、その人の言葉の中から光るものを見つけてあげるスタイル
- 断言しない。「〜かもしれませんね」「そう感じているなら、そうなのかもしれません」
- 相手が話したいことを話せる場を作る

【禁止事項】
- 「絶対に〜です」という断言
- ネガティブな予言
- 過度な励まし・テンションの高い返し
- タメ口`

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages } = await req.json()

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages,
    }),
  })

  const data = await response.json()
  const text = data.content?.[0]?.text || '……'
  return NextResponse.json({ text })
}