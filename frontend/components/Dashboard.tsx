'use client'

import { useEffect, useState } from 'react'
import { fetchApi } from '@/lib/api'
import { User } from '@supabase/supabase-js'
import { Plus, Users, ArrowRight, Wallet } from 'lucide-react'
import GroupDetails from './GroupDetails'

interface Group {
  id: number
  name: string
}

export default function Dashboard({ user }: { user: User }) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [userName, setUserName] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      const data = await fetchApi('/groups/')
      setGroups(data)
      setNeedsRegistration(false)
    } catch (error: any) {
      if (error.message.includes('User not found')) {
        setNeedsRegistration(true)
      } else {
        console.error('Failed to load groups:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    try {
      await fetchApi('/users/', {
        method: 'POST',
        body: JSON.stringify({
          name: userName || user.email?.split('@')[0] || 'User',
          wallet_address: null
        })
      })
      loadGroups()
    } catch (error) {
      alert('Failed to register')
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchApi('/groups/', {
        method: 'POST',
        body: JSON.stringify({
          name: newGroupName,
          member_ids: [] 
        })
      })
      setNewGroupName('')
      loadGroups()
    } catch (error) {
      alert('Failed to create group')
    }
  }

  if (loading) return <div className="text-white text-center mt-20">Loading dashboard...</div>

  if (needsRegistration) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Complete Registration</h2>
        <p className="mb-6 text-gray-400">Please set your display name to continue.</p>
        <input
          type="text"
          placeholder="Display Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full p-3 bg-black/50 border border-white/10 rounded-lg mb-6 text-white focus:outline-none focus:border-white/30"
        />
        <button
          onClick={handleRegister}
          className="w-full bg-white text-black p-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
        >
          Complete Setup
        </button>
      </div>
    )
  }

  if (selectedGroupId) {
    return (
      <div className="max-w-6xl mx-auto">
        <GroupDetails 
          groupId={selectedGroupId} 
          currentUser={user} 
          onBack={() => setSelectedGroupId(null)} 
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user.email?.split('@')[0]}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create Group Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Group
          </h2>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <input
              type="text"
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full p-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30 placeholder:text-gray-600"
              required
            />
            <button
              type="submit"
              className="w-full bg-white text-black px-4 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
            >
              Create Group
            </button>
          </form>
        </div>

        {/* Group List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Groups
          </h2>
          
          {groups.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">You haven't joined any groups yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div 
                  key={group.id} 
                  onClick={() => setSelectedGroupId(group.id)}
                  className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                      <Users className="w-5 h-5 text-blue-200" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{group.name}</h3>
                  <p className="text-sm text-gray-500">View expenses & settle up</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

