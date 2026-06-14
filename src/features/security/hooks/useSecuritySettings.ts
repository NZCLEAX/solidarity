import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import {
  DEFAULT_SECURITY_SETTINGS,
  type SecuritySettings,
} from '@/features/security/model/security-settings'

async function fetchSecuritySettings(): Promise<SecuritySettings> {
  const { data, error } = await supabase
    .from('security_settings')
    .select('*')
    .eq('id', true)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data as SecuritySettings | null) ?? DEFAULT_SECURITY_SETTINGS
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: ['security-settings'],
    queryFn: fetchSecuritySettings,
    staleTime: 60_000,
  })
}

