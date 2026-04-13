import { FailureScenario, FAILURE_SCENARIOS } from '@/lib/simulator';

interface ScenarioControlsProps {
  activeScenario: FailureScenario;
  onInject: (scenario: FailureScenario) => void;
  onResolve: () => void;
}

export default function ScenarioControls({ activeScenario, onInject, onResolve }: ScenarioControlsProps) {
  const scenarios = Object.entries(FAILURE_SCENARIOS).filter(([k]) => k !== 'none') as [FailureScenario, typeof FAILURE_SCENARIOS[FailureScenario]][];

  return (
    <div className="border border-border rounded-md bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <span className="text-xs font-mono uppercase tracking-wider text-foreground">Failure Injection</span>
        {activeScenario !== 'none' && (
          <button
            onClick={onResolve}
            className="text-[10px] px-3 py-1 rounded font-mono uppercase bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
          >
            ✓ Resolve All
          </button>
        )}
      </div>
      <div className="p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
        {scenarios.map(([key, config]) => {
          const isActive = activeScenario === key;
          return (
            <button
              key={key}
              onClick={() => isActive ? onResolve() : onInject(key)}
              className={`flex flex-col items-start p-2 rounded text-left transition-all duration-300 border ${
                isActive
                  ? 'bg-critical/10 border-critical/40 glow-box-red'
                  : 'bg-muted/20 border-border/50 hover:border-primary/30 hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-sm">{config.icon}</span>
                <span className={`text-[10px] font-mono font-semibold truncate ${
                  isActive ? 'text-critical' : 'text-foreground'
                }`}>
                  {config.label}
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                {config.description}
              </span>
              {isActive && (
                <span className="text-[9px] text-critical font-mono mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-critical animate-pulse-glow" />
                  ACTIVE
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
