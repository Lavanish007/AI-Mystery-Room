/// <reference types="vite/client" />

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
    style?: React.CSSProperties;
  }
  export type Icon = FC<IconProps>;
  export const ShieldCheck: Icon;
  export const Compass: Icon;
  export const Sparkles: Icon;
  export const BookOpen: Icon;
  export const Search: Icon;
  export const Clock: Icon;
  export const AlertCircle: Icon;
  export const CheckCircle: Icon;
  export const XCircle: Icon;
  export const FileText: Icon;
  export const MessageSquare: Icon;
  export const Camera: Icon;
  export const HelpCircle: Icon;
  export const Key: Icon;
  export const Lock: Icon;
  export const User: Icon;
  export const Users: Icon;
  export const ArrowRight: Icon;
  export const ArrowLeft: Icon;
  export const RefreshCw: Icon;
  export const Award: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const ChevronRight: Icon;
  export const ChevronDown: Icon;
  export const Fingerprint: Icon;
  export const Microscope: Icon;
  export const Video: Icon;
  export const FileSearch: Icon;
  export const Lightbulb: Icon;
  export const Skull: Icon;
  export const X: Icon;
  export const Check: Icon;
  export const Loader2: Icon;
  export const Play: Icon;
  export const RotateCcw: Icon;
  export const Star: Icon;
  export const Zap: Icon;
  export const Shield: Icon;
  export const Target: Icon;
  export const Map: Icon;
  export const Info: Icon;
  export const AlertTriangle: Icon;
  export const Send: Icon;
  export const ExternalLink: Icon;
  export const CalendarClock: Icon;
}
