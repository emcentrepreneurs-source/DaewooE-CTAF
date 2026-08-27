import React from 'react';
import { Disc3 } from 'lucide-react';

interface DrumPickerTriggerButtonProps {
  onClick: () => void;
  title?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const DrumPickerTriggerButton: React.FC<DrumPickerTriggerButtonProps> = ({
  onClick,
  title = 'Open Scroll Wheel / Drum Picker',
  className = '',
  size = 'sm'
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center p-1 rounded-md text-zinc-400 hover:text-indigo-300 hover:bg-indigo-950/60 border border-transparent hover:border-indigo-800/60 transition-all cursor-pointer group ${className}`}
    >
      <Disc3 className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} group-hover:rotate-45 transition-transform duration-200 text-indigo-400/80 group-hover:text-indigo-300`} />
    </button>
  );
};
