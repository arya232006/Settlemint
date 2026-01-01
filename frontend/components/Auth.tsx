'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Logged in!')
    }
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Check your email for the login link!')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-sm mx-auto mt-10">
      <input
        className="border border-zinc-700 p-2 rounded text-white bg-transparent placeholder:text-zinc-500"
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border border-zinc-700 p-2 rounded text-white bg-transparent placeholder:text-zinc-500"
        type="password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded flex-1"
        >
          {loading ? 'Loading' : 'Login'}
        </button>
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="bg-green-500 text-white p-2 rounded flex-1"
        >
          Sign Up
        </button>
      </div>
    </div>
  )
}
