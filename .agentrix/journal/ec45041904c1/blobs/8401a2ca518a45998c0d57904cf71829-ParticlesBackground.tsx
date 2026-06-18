'use client'

export default function ParticlesBackground() {
  console.log('ParticlesBackground rendered')

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'red',
        zIndex: -10,
      }}
    />
  )
}
