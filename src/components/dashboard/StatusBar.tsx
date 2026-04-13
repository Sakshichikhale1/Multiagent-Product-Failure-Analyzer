import { FailureScenario, FAILURE_SCENARIOS } from '@/lib/simulator';

interface StatusBarProps {
  scenario: FailureScenario;
  isRunning: boolean;
  onToggleRunning: () => void;
}

export default function StatusBar({ scenario, isRunning, onToggleRunning }: StatusBarProps) {
  const config = FAILURE_SCENARIOS[scenario];
  const isHealthy = scenario === 'none';

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h1 className="font-display text-lg font-bold tracking-tight">
          <span className="text-primary glow-green">Ops</span>
          <span className="text-foreground">Pulse</span>
        </h1>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isHealthy ? 'bg-primary animate-pulse-glow' : 'bg-critical animate-pulse-glow'
          }`} />
          <span className={`text-xs font-mono ${isHealthy ? 'text-primary' : 'text-critical'}`}>
            {isHealthy ? 'ALL SYSTEMS NOMINAL' : `INCIDENT: ${config.label.toUpperCase()}`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted-foreground font-mono">
          {new Date().toLocaleTimeString('en-US', { hour12: false })} UTC
        </span>
        <button
          onClick={onToggleRunning}
          className={`text-[10px] px-3 py-1 rounded font-mono uppercase border transition-colors ${
            isRunning
              ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
              : 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/20'
          }`}
        >
          {isRunning ? '● Live' : '■ Paused'}
        </button>
      </div>
    </header>
  );
}
