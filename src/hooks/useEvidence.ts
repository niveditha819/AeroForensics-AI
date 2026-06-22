import { supabase } from '@/db/supabase';

export async function exportEvidencePacket(caseData: Record<string, unknown>, filename: string) {
  const json = JSON.stringify(caseData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const { data, error } = await supabase.storage.from('evidence-exports').upload(`packets/${Date.now()}-${filename}`, blob);
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('evidence-exports').getPublicUrl(data.path);
  return urlData.publicUrl;
}

export function downloadLocalEvidence(data: Record<string, unknown>, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
