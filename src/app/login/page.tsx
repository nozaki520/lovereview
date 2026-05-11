import { Hourglass } from 'lucide-react'
import AuthForm from './AuthForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string, tab?: string }>
}) {
  const resolvedSearchParams = await searchParams;
  const message = resolvedSearchParams.message;
  const tab = resolvedSearchParams.tab;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Glow effect behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
        
        <div className="relative bg-[#18181b]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 hover:rotate-12 transition-transform duration-300">
              <Hourglass className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">
              LoveRevi
            </h1>
            <p className="text-sm text-zinc-400 mt-2 font-medium">時間が証明する、本当の価値。</p>
          </div>

          <AuthForm message={message} tab={tab} />
        </div>
      </div>
    </div>
  )
}
