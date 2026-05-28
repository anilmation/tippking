import { getCountryName, getFlagUrl } from '@/lib/countries'

type Props = {
  code: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  align?: 'left' | 'right'
}

export function TeamName({ code, name, size = 'md', align = 'left' }: Props) {
  const displayName = getCountryName(code) || name || code
  const flagUrl = getFlagUrl(code)
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14
  const flagW = size === 'sm' ? 16 : size === 'lg' ? 24 : 20
  const flagH = size === 'sm' ? 12 : size === 'lg' ? 18 : 15

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      flexDirection: align === 'right' ? 'row-reverse' : 'row',
    }}>
      <img
        src={flagUrl}
        alt={displayName}
        width={flagW}
        height={flagH}
        style={{ borderRadius: 2, objectFit: 'cover', flexShrink: 0 }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <span style={{ fontWeight: 500, fontSize, color: 'var(--pitch-text)' }}>{displayName}</span>
    </span>
  )
}
