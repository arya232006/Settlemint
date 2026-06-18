'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Chrome } from 'lucide-react'

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
      // alert('Logged in!') // Removed alert to be less intrusive
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

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    })
    if (error) alert(error.message)
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4 p-6 max-w-sm mx-auto mt-10 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white text-center mb-2">Welcome Back</h2>
      
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-white text-black p-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors w-full"
      >
        <Chrome className="w-5 h-5" />
        Sign in with Google
      </button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-700"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-black px-2 text-zinc-500">Or continue with</span>
        </div>
      </div>

      <form className="flex flex-col gap-4">
        <input
          className="border border-zinc-700 p-2.5 rounded-lg text-white bg-black/50 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border border-zinc-700 p-2.5 rounded-lg text-white bg-black/50 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-zinc-800 hover:bg-zinc-700 text-white p-2.5 rounded-lg flex-1 font-medium transition-colors border border-zinc-700"
          >
            {loading ? '...' : 'Login'}
          </button>
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="bg-zinc-800 hover:bg-zinc-700 text-white p-2.5 rounded-lg flex-1 font-medium transition-colors border border-zinc-700"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  )
}
