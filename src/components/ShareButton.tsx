'use client'

export default function ShareButton({ text, url }: { text: string, url: string }) {
  const handleShare = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(shareUrl, '_blank', 'width=550,height=420')
  }

  return (
    <button 
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white border border-zinc-700 rounded-full text-xs font-bold transition-colors shadow-sm active:scale-95"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3 h-3 fill-current"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.96H5.078z"></path></g></svg>
      ポスト
    </button>
  )
}
