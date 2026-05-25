import { User } from '../models/User'

type TempRecord = User & { id: string; createdAt: number }

const store = new Map<string, TempRecord>()

export function addTempUser(user: Partial<User>): TempRecord {
  const id = (globalThis as any).crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const record: TempRecord = {
    id,
    name: user.name,
    email: user.email || '',
    password: user.password,
    createdAt: Date.now(),
  }
  store.set(id, record)
  return record
}

export function getTempUser(id: string): TempRecord | null {
  return store.get(id) ?? null
}

export function listTempUsers(): TempRecord[] {
  return Array.from(store.values())
}

export function removeTempUser(id: string): boolean {
  return store.delete(id)
}
