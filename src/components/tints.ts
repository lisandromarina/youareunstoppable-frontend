const tints: Record<string, string> = {
  disciplined: '#FF8906',
  healthy: '#E8A05A',
  'financially-independent': '#D4A017',
  confident: '#FF6B2C',
  focused: '#C9843A',
  entrepreneur: '#F0B429',
  strong: '#E07A3D',
  consistent: '#FFB067',
  'mentally-resilient': '#C47B5A',
  productive: '#FF9F43',
}

export function identityTint(id: string) {
  return tints[id] ?? '#FF8906'
}
