export function HeapifyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="4" r="2.4" fill="#FF7A00" />
      <circle cx="6" cy="12" r="2.4" fill="#FF7A00" opacity="0.7" />
      <circle cx="18" cy="12" r="2.4" fill="#FF7A00" opacity="0.7" />
      <circle cx="3" cy="20" r="2" fill="#FF7A00" opacity="0.4" />
      <circle cx="9" cy="20" r="2" fill="#FF7A00" opacity="0.4" />
      <circle cx="15" cy="20" r="2" fill="#FF7A00" opacity="0.4" />
      <circle cx="21" cy="20" r="2" fill="#FF7A00" opacity="0.4" />
      <line x1="12" y1="4" x2="6" y2="12" stroke="#FF7A00" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="4" x2="18" y2="12" stroke="#FF7A00" strokeWidth="1" opacity="0.5" />
      <line x1="6" y1="12" x2="3" y2="20" stroke="#FF7A00" strokeWidth="1" opacity="0.3" />
      <line x1="6" y1="12" x2="9" y2="20" stroke="#FF7A00" strokeWidth="1" opacity="0.3" />
      <line x1="18" y1="12" x2="15" y2="20" stroke="#FF7A00" strokeWidth="1" opacity="0.3" />
      <line x1="18" y1="12" x2="21" y2="20" stroke="#FF7A00" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}
