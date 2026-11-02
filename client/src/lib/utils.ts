import { EvidenceType } from '@shared';
import { MessageSquare, Camera, Microscope, FileText } from 'lucide-react';

export type EvidenceTypeInfo = {
  label: string;
  colorClass: string;
  badgeClass: string;
  icon: any;
};

export const EVIDENCE_TYPE_MAP: Record<EvidenceType, EvidenceTypeInfo> = {
  messages: { label: 'Messages', colorClass: 'ev-messages', badgeClass: 'badge-emerald', icon: MessageSquare },
  cctv:     { label: 'CCTV',     colorClass: 'ev-cctv',     badgeClass: 'badge-cyan',    icon: Camera },
  forensics:{ label: 'Forensics',colorClass: 'ev-forensics',badgeClass: 'badge-gold',    icon: Microscope },
  document: { label: 'Document', colorClass: 'ev-document', badgeClass: 'badge-violet',  icon: FileText },
  audio_transcript: { label: 'Audio', colorClass: 'ev-document', badgeClass: 'badge-violet', icon: FileText },
  photograph:{ label: 'Photo',   colorClass: 'ev-cctv',     badgeClass: 'badge-cyan',    icon: Camera },
};

export function parseChatTranscript(content: string): Array<{ sender: string; text: string; time?: string }> {
  const lines = content.split('\n').filter(l => l.trim());
  return lines.map(line => {
    const match = line.match(/^\[([^\]]+)\]\s+([^:]+):\s*(.+)$/);
    if (match) return { time: match[1], sender: match[2], text: match[3] };
    const simple = line.match(/^([^:]+):\s*(.+)$/);
    if (simple) return { sender: simple[1], text: simple[2] };
    return { sender: '', text: line };
  });
}
