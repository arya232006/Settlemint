'use client'

import { useEffect, useState } from 'react'
import { fetchApi } from '@/lib/api'
import { User } from '@supabase/supabase-js'

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
          member_ids: [] // Backend should probably add creator automatically, but let's check
        })
      })
      setNewGroupName('')
      loadGroups()
    } catch (error) {
      alert('Failed to create group')
    }
  }

  if (loading) return <div>Loading dashboard...</div>

  if (needsRegistration) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 border rounded bg-white dark:bg-zinc-900">
        <h2 className="text-xl font-bold mb-4">Complete Registration</h2>
        <p className="mb-4 text-gray-600">Please set your display name to continue.</p>
        <input
          type="text"
          placeholder="Display Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full p-2 border rounded mb-4 text-black"
        />
        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Complete Setup
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-8">Your Groups</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Group */}
        <div className="p-6 border rounded bg-white dark:bg-zinc-900 h-fit">
          <h2 className="text-xl font-bold mb-4">Create New Group</h2>
          <form onSubmit={handleCreateGroup} className="flex gap-2">
            <input
              type="text"
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="flex-1 p-2 border rounded text-black"
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create
            </button>
          </form>
        </div>

        {/* Group List */}
        <div className="space-y-4">
          {groups.length === 0 ? (
            <p className="text-gray-500">No groups yet.</p>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="p-4 border rounded bg-white dark:bg-zinc-900 flex justify-between items-center">
                <span className="font-medium">{group.name}</span>
                <button className="text-blue-500 hover:underline">View Details</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
