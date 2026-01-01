'use client'

import React, { useRef, useEffect } from 'react'

interface ParticlesProps {
  particleCount?: number
  particleColor?: string
  className?: string
  speed?: number
  minSize?: number
  maxSize?: number
}

export default function Particles({
  particleCount = 200,
  particleColor = 'rgba(150, 150, 150, 0.5)',
  className = '',
  speed = 0.5,
  minSize = 1,
  maxSize = 3,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: { x: number; y: number; vx: number; vy: number; size: number }[] = []
    let mouse = { x: -1000, y: -1000 }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * (maxSize - minSize) + minSize,
        })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = particleColor
      
      particles.forEach((p) => {
        // Basic movement
        p.x += p.vx
        p.y += p.vy

        // Mouse interaction
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const interactionRadius = 150

        if (distance < interactionRadius) {
          const forceDirectionX = dx / distance
          const forceDirectionY = dy / distance
          const force = (interactionRadius - distance) / interactionRadius
          
          // Push away from mouse
          const repulsionStrength = 8
          p.x += forceDirectionX * force * repulsionStrength
          p.y += forceDirectionY * force * repulsionStrength
        }

        // Wrap around screen
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handleMouseMove)
    
    resizeCanvas()
    draw()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [particleCount, particleColor, speed, minSize, maxSize])

  return <canvas ref={canvasRef} className={className} />
}
