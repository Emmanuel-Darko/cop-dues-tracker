// composables/useOfficers.ts
export interface Officer {
  id: string
  full_name: string
  role: string
  email?: string
  phone?: string
  monthly_dues?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export const useOfficers = () => {
  const supabase = useSupabaseClient()

  const getOfficers = async () => {
    const { data, error } = await supabase
      .from('officers')
      .select('*')
      .order('full_name')

    return { data, error }
  }

  const addOfficer = async (officer: Partial<Officer>) => {
    const { data, error } = await supabase
      .from('officers')
      .insert([officer])
      .select()
      .single()

    return { data, error }
  }

  const updateOfficer = async (id: string, updates: Partial<Officer>) => {
    const { data, error } = await supabase
      .from('officers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }

  const deleteOfficer = async (id: string) => {
    const { error } = await supabase
      .from('officers')
      .delete()
      .eq('id', id)

    return { error }
  }

  return {
    getOfficers,
    addOfficer,
    updateOfficer,
    deleteOfficer,
  }
}
