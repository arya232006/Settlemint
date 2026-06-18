'use client'

import { useEffect, useState } from 'react'
import { fetchApi } from '@/lib/api'
import { User } from '@supabase/supabase-js'
import { ArrowLeft, Plus, Receipt, Users, Wallet, UserPlus, ArrowRightLeft } from 'lucide-react'

interface GroupMember {
  id: number
  name: string
  email: string
}

interface ExpenseSplit {
  user_id: number
  amount: number
  user: GroupMember
}

interface Expense {
  id: number
  amount: number
  paid_by: GroupMember
  splits: ExpenseSplit[]
}

interface Balance {
  from_user: GroupMember
  to_user: GroupMember
  amount: number
}

interface GroupDetails {
  id: number
  name: string
  members: GroupMember[]
  expenses: Expense[]
}

interface GroupDetailsProps {
  groupId: number
  currentUser: User
  onBack: () => void
}

export default function GroupDetails({ groupId, currentUser, onBack }: GroupDetailsProps) {
  const [group, setGroup] = useState<GroupDetails | null>(null)
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  
  // New Expense State
  const [amount, setAmount] = useState('')
  
  useEffect(() => {
    loadGroupDetails()
    loadBalances()
  }, [groupId])

  const loadGroupDetails = async () => {
    try {
      const data = await fetchApi(`/groups/${groupId}`)
      setGroup(data)
    } catch (error) {
      console.error('Failed to load group details:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBalances = async () => {
    try {
      const data = await fetchApi(`/groups/${groupId}/balances`)
      setBalances(data)
    } catch (error) {
      console.error('Failed to load balances:', error)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchApi(`/groups/${groupId}/members`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail })
      })
      setInviteEmail('')
      setShowInvite(false)
      loadGroupDetails()
    } catch (error) {
      alert('Failed to invite user. Make sure they are registered.')
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!group) return

    const totalAmount = parseFloat(amount)
    if (isNaN(totalAmount) || totalAmount <= 0) return

    // Simple equal split for now
    const splitAmount = totalAmount / group.members.length
    const splits = group.members.map(member => ({
      user_id: member.id,
      amount: splitAmount
    }))

    const payer = group.members.find(m => m.email === currentUser.email)
    if (!payer) {
      alert('Could not identify you in the group members list.')
      return
    }

    try {
      await fetchApi('/expenses/', {
        method: 'POST',
        body: JSON.stringify({
          group_id: group.id,
          paid_by_id: payer.id,
          amount: totalAmount,
          splits: splits
        })
      })
      setAmount('')
      setShowAddExpense(false)
      loadGroupDetails()
      loadBalances()
    } catch (error) {
      console.error('Failed to add expense:', error)
      alert('Failed to add expense')
    }
  }

  if (loading) return <div className="text-white">Loading group details...</div>
  if (!group) return <div className="text-white">Group not found</div>

  return (
    <div className="animate-in fade-in slide-in-from-right duration-500">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{group.name}</h1>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            <span>{group.members.length} members</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="bg-white/10 text-white px-4 py-2 rounded-full font-medium hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/10"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
          <button
            onClick={() => setShowAddExpense(!showAddExpense)}
            className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {showInvite && (
        <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <h3 className="text-lg font-bold text-white mb-4">Invite Member</h3>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 bg-black/50 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-white/30"
              required
            />
            <button
              type="submit"
              className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Send Invite
            </button>
          </form>
        </div>
      )}

      {showAddExpense && (
        <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <h3 className="text-lg font-bold text-white mb-4">Add New Expense</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-8 pr-4 text-white focus:outline-none focus:border-white/30"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expenses List */}
        <div className="lg:col-span-2 space-y-8">
          {/* Balances Section */}
          {balances.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                Balances
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {balances.map((balance, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-200">
                        {balance.from_user.name.charAt(0)}
                      </div>
                      <div className="text-sm text-gray-300">
                        <span className="font-bold text-white">{balance.from_user.name}</span> owes <span className="font-bold text-white">{balance.to_user.name}</span>
                      </div>
                    </div>
                    <span className="font-bold text-green-400">${balance.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Recent Expenses
            </h2>
            
            {group.expenses.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No expenses yet. Add one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {group.expenses.map((expense) => (
                  <div 
                    key={expense.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                        <Receipt className="w-5 h-5 text-blue-200" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Expense #{expense.id}</p>
                        <p className="text-sm text-gray-400">
                          Paid by <span className="text-white">{expense.paid_by.name}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">${expense.amount}</p>
                      <p className="text-xs text-gray-500">
                        Split between {expense.splits.length} people
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Members List */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members
          </h2>
          <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3">
            {group.members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-white text-sm font-medium truncate">{member.name}</p>
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
