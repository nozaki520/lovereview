import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'LoveRevi - 時間が証明する、本当の価値'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1206 50%, #0a0a0a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🌿</div>
        <div style={{
          fontSize: 72,
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #f59e0b, #f97316)',
          backgroundClip: 'text',
          color: 'transparent',
          marginBottom: 24,
        }}>
          LoveRevi
        </div>
        <div style={{
          fontSize: 32,
          color: '#a1a1aa',
          textAlign: 'center',
        }}>
          時間が証明する、本当の価値
        </div>
        <div style={{
          fontSize: 24,
          color: '#52525b',
          marginTop: 16,
        }}>
          「まだ使ってる」が、最高のレビューである。
        </div>
      </div>
    ),
    { ...size }
  )
}