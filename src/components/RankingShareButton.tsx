'use client'

import ShareButton from './ShareButton'

export default function RankingShareButton({ text, url }: { text: string, url: string }) {
  return (
    <div onClick={e => e.preventDefault()}>
      <ShareButton text={text} url={url} />
    </div>
  )
}