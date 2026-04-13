import { LogEntry } from '@/lib/simulator';
import { useRef, useEffect, useState } from 'react';

interface LogPanelProps {
  logs: LogEntry[];
}

const levelStyles: Record<string, string> = {
  INFO: 'text-primary',
  DEBUG: 'text-muted-foreground',
  WARN: 'text-warning glow-amber',
  ERROR: 'text-critical glow-red',
  FATAL: 'text-critical font-bold glow-red',
};

const levelBadge: Record<string, string> = {
  INFO: 'bg-primary/10 text-primary border-primary/20',
  DEBUG: 'bg-muted text-muted-foreground border-muted-foreground/20',
  WARN: 'bg-warning/10 text-warning border-warning/20',
  ERROR: 'bg-critical/10 text-critical border-critical/20',
  FATAL: 'bg-critical/20 text-critical border-critical/40',
};

export default function LogPanel({ logs }: LogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.level === filter);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  };

  const filters = ['ALL', 'FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG'];

  return (
    <div className="flex flex-col h-full border border-border rounded-md bg-card overflow-hidden glow-box-green">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-xs font-mono uppercase tracking-wider text-foreground">Live Logs</span>
          <span className="text-[10px] text-muted-foreground">({filtered.length})</span>
        </div>
        <div className="flex gap-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase transition-all ${
                filter === f
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-[11px] leading-relaxed scrollbar-thin"
      >
        {filtered.map(log => (
          <div
            key={log.id}
            className={`flex gap-2 py-0.5 animate-slide-up ${
              log.level === 'FATAL' ? 'bg-critical/5 px-1 rounded' : ''
            }`}
          >
            <span className="text-muted-foreground shrink-0 w-[72px]">
              {log.timestamp.toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <span className={`shrink-0 px-1.5 py-0 rounded border text-[10px] ${levelBadge[log.level]}`}>
              {log.level.padEnd(5)}
            </span>
            <span className="text-info shrink-0 w-[130px] truncate">[{log.service}]</span>
            <span className={levelStyles[log.level]}>{log.message}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-muted-foreground text-center py-8 opacity-50">No logs matching filter</div>
        )}
      </div>
    </div>
  );
}
