'use client'

const STAGE_ORDER = ['day1', 'week1', 'month1', 'month3', 'month6', 'year1', 'beyond']
const STAGE_LABELS: Record<string, string> = {
    'day1': '1日',
    'week1': '1週',
    'month1': '1ヶ月',
    'month3': '3ヶ月',
    'month6': '6ヶ月',
    'year1': '1年',
    'beyond': '長期',
}

type Review = {
    stage: string
    rating: number
}

export default function RatingGraph({ reviews }: { reviews: Review[] }) {
    const plotted = STAGE_ORDER
        .map(stage => {
            const r = reviews.find(r => r.stage === stage)
            return r ? { stage, rating: r.rating } : null
        })
        .filter(Boolean) as { stage: string; rating: number }[]

    if (plotted.length < 1) return null

    const width = 500
    const height = 160
    const paddingX = 52
    const paddingY = 20
    const innerWidth = width - paddingX * 2
    const innerHeight = height - paddingY * 2

    const xStep = innerWidth / (plotted.length - 1)
    const yScale = (rating: number) => paddingY + innerHeight - ((rating - 1) / 4) * innerHeight

    const points = plotted.map((p, i) => ({
        x: paddingX + i * xStep,
        y: yScale(p.rating),
        ...p,
    }))

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const showLine = points.length >= 2

    return (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-5 mb-8">
            <h3 className="text-sm font-bold text-zinc-400 mb-4">📈 評価の熟成グラフ</h3>
            <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: '280px' }}>
                    {/* 横グリッド線 */}
                    {[1, 2, 3, 4, 5].map(rating => (
                        <g key={rating}>
                            <line
                                x1={paddingX} y1={yScale(rating)}
                                x2={width - paddingX} y2={yScale(rating)}
                                stroke="rgba(255,255,255,0.05)" strokeWidth="1"
                            />
                            <text
                                x={paddingX - 6} y={yScale(rating)}
                                textAnchor="end" dominantBaseline="middle"
                                fill="rgba(255,255,255,0.3)" fontSize="10"
                            >
                                ★{rating}
                            </text>
                        </g>
                    ))}

                    {/* 折れ線 */}
                    {showLine && (
                        <path
                            d={pathD}
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* グラデーション定義 */}
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                    </defs>

                    {/* ポイント */}
                    {points.map((p, i) => (
                        <g key={i}>
                            <circle cx={p.x} cy={p.y} r="5" fill="#f59e0b" stroke="#0a0a0a" strokeWidth="2" />
                            <text
                                x={p.x} y={p.y - 12}
                                textAnchor="middle"
                                fill="#f59e0b" fontSize="10" fontWeight="bold"
                            >
                                ★{p.rating}
                            </text>
                            <text
                                x={p.x} y={height - 4}
                                textAnchor="middle"
                                fill="rgba(255,255,255,0.4)" fontSize="9"
                            >
                                {STAGE_LABELS[p.stage]}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    )
}