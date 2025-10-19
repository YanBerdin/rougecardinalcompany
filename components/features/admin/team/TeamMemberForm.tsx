"use client"
import { useState } from 'react'
import type { CreateTeamMemberInput, UpdateTeamMemberInput, TeamMemberDb } from '@/lib/schemas/team'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  member?: TeamMemberDb | null
  onSubmit: (data: CreateTeamMemberInput | UpdateTeamMemberInput) => Promise<void>
  onCancel?: () => void
}

export function TeamMemberForm({ member, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(member?.name ?? '')
  const [role, setRole] = useState(member?.role ?? '')
  const [description, setDescription] = useState(member?.description ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ name, role: role || null, description: description || null })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nom</label>
        <Input value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Rôle</label>
        <Input value={role ?? ''} onChange={e => setRole(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea value={description ?? ''} onChange={e => setDescription(e.target.value)} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Button>
        <Button variant="outline" type="button" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  )
}

export default TeamMemberForm
