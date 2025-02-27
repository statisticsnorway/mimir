export function get(req: XP.Request) {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  let { query } = req.params
  const { ids } = req.params

  if (ids) query = ids

  if (!query?.match(hexColorRegex)) {
    return {
      body: {
        hits: [],
        count: 0,
        total: 0,
      },
    }
  }

  const color = {
    id: query,
    displayName: query,
    description: '←',
    icon: {
      data: generateColorPreview(query),
      type: 'image/svg+xml',
    },
  }

  return {
    body: {
      hits: [color],
      count: 1,
      total: 1,
    },
  }
}

function generateColorPreview(color: string) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <rect width="100%" height="100%" fill="${color}" stroke="#${lightenDarkenColor(color, -30)}" />
  </svg>
  `
}

function lightenDarkenColor(col: string, amt: number) {
  const num = parseInt(col.slice(1), 16)
  const r = (num >> 16) + amt
  const b = ((num >> 8) & 0x00ff) + amt
  const g = (num & 0x0000ff) + amt
  const newColor = g | (b << 8) | (r << 16)
  return newColor.toString(16)
}
