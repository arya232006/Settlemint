'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Auth from '@/components/Auth'
import Dashboard from '@/components/Dashboard'
import Particles from '@/components/Particles'
import { User } from '@supabase/supabase-js'
import { Zap, Shield, Scale, ChevronDown, ArrowRight, Github, Twitter } from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-green-500/30">
      <Particles
        particleCount={200}
        particleColor="#ffffff"
        minSize={0.6}
        maxSize={1.4}
        className="fixed inset-0 z-0 pointer-events-none"
      />
      
      <div className="relative z-10">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowLogin(false)}>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-sm" />
              </div>
              <span className="font-bold text-xl tracking-tight">Settlemint</span>
            </div>
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 hidden md:block">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm transition-colors border border-white/5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowLogin(true)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="bg-white text-black px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>

        {!user ? (
          <div className="flex flex-col">
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center p-4">
              {showLogin ? (
                <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
                  <button 
                    onClick={() => setShowLogin(false)}
                    className="mb-4 text-sm text-gray-400 hover:text-white flex items-center gap-2"
                  >
                    ← Back
                  </button>
                  <Auth />
                </div>
              ) : (
                <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-forwards">
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 tracking-tighter drop-shadow-sm">
                      Settlemint
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                      The next generation of expense sharing. <br/>
                      <span className="text-gray-500">Powered by Blockchain Settlement.</span>
                    </p>
                  </div>
                  
                  <div className="pt-8 flex flex-col items-center gap-12">
                    <button 
                      onClick={() => setShowLogin(true)}
                      className="group bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center gap-2"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="animate-bounce text-gray-500 mt-8">
                      <p className="text-xs uppercase tracking-widest mb-2 opacity-50">Scroll to explore</p>
                      <ChevronDown className="w-6 h-6 mx-auto opacity-50" />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Why Settlemint Section */}
            {!showLogin && (
              <>
              <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-20 bg-gradient-to-b from-transparent to-zinc-900/50">
                <h2 className="text-2xl md:text-4xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Why Settlemint?
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
                  {[
                    {
                      icon: <Zap className="w-6 h-6 text-yellow-200" />,
                      title: "Automatic Net-off",
                      desc: "Simplify debts across multiple groups instantly. Our algorithm finds the most efficient path to settle balances."
                    },
                    {
                      icon: <Scale className="w-6 h-6 text-blue-200" />,
                      title: "No Manual Settlements",
                      desc: "Forget about tracking who paid whom. Smart contracts handle the settlement logic automatically."
                    },
                    {
                      icon: <Shield className="w-6 h-6 text-green-200" />,
                      title: "Verifiable Ledger",
                      desc: "Every transaction is recorded on a transparent, immutable ledger. Trust, but verify."
                    }
                  ].map((feature, i) => (
                    <div 
                      key={i}
                      className="group p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]"
                    >
                      <div className="bg-white/5 w-12 h-12 flex items-center justify-center rounded-xl mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 border border-white/5">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* How it Works Section */}
              <section className="py-32 px-4 border-t border-white/5 bg-black/20 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-2xl md:text-4xl font-bold mb-20 text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                      Settlement in 3 Steps
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {[
                      {
                        step: "01",
                        title: "Create a Group",
                        desc: "Start a group for your trip, house, or project. Invite friends instantly."
                      },
                      {
                        step: "02",
                        title: "Add Expenses",
                        desc: "Log costs as they happen. We handle the math and currency conversion."
                      },
                      {
                        step: "03",
                        title: "Settle Up",
                        desc: "One click to net-off balances. Pay exactly what you owe, nothing more."
                      }
                    ].map((item, i) => (
                      <div key={i} className="relative flex flex-col items-center text-center group">
                        <div className="w-24 h-24 rounded-full bg-black border border-white/10 flex items-center justify-center mb-8 z-10 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_-10px_rgba(255,255,255,0.2)]">
                          <span className="text-2xl font-bold text-white">{item.step}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-white">{item.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <footer className="w-full border-t border-white/10 bg-black/40 backdrop-blur-md py-8">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">© 2024 Settlemint. Built for the future.</p>
                    <div className="flex gap-6">
                        <Github className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
                        <Twitter className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
                    </div>
                </div>
              </footer>
            </>
            )}
          </div>
        ) : (
          <div className="min-h-screen p-4 md:p-24 pt-24">
            <Dashboard user={user} />
          </div>
        )}
      </div>
    </main>
  )
}
