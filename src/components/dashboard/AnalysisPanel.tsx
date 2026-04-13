import { AnalysisResult } from '@/lib/simulator';

interface AnalysisPanelProps {
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
}

const severityStyles = {
  CRITICAL: 'border-critical/50 glow-box-red',
  HIGH: 'border-warning/50 glow-box-amber',
  MEDIUM: 'border-info/30',
  LOW: 'border-primary/30',
};

const severityBadge = {
  CRITICAL: 'bg-critical/20 text-critical border-critical/40 glow-red',
  HIGH: 'bg-warning/20 text-warning border-warning/40 glow-amber',
  MEDIUM: 'bg-info/20 text-info border-info/40',
  LOW: 'bg-primary/20 text-primary border-primary/40',
};

export default function AnalysisPanel({ analysis, isAnalyzing }: AnalysisPanelProps) {
  if (isAnalyzing) {
    return (
      <div className="border border-border rounded-md bg-card p-6 glow-box-green">
        <div className="flex items-center gap-3">
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 border-2 border-primary/30 rounded-full" />
            <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <div className="text-sm font-mono text-primary glow-green">AI Analysis in Progress</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Sending metrics + logs to Claude for root cause analysis...
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-1">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full bg-primary/20"
              style={{ animation: `pulse-glow 1.5s ease-in-out ${i * 0.1}s infinite` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="border border-border/30 rounded-md bg-card p-6 text-center">
        <div className="text-muted-foreground text-sm font-mono">
          <span className="text-primary">▶</span> Inject a failure scenario to trigger AI analysis
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">
          Analysis auto-triggers when metrics cross failure thresholds
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-md bg-card overflow-hidden ${severityStyles[analysis.severity]} transition-all duration-500`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-wider text-foreground">AI Incident Analysis</span>
          <span className={`text-[10px] px-2 py-0.5 rounded border font-bold font-mono ${severityBadge[analysis.severity]}`}>
            {analysis.severity}
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">
          {analysis.model} • {analysis.analyzedAt.toLocaleTimeString()}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Root Cause */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Root Cause</div>
          <div className="text-sm font-mono text-foreground">{analysis.rootCause}</div>
        </div>

        {/* Evidence */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Evidence</div>
          <ul className="space-y-1">
            {analysis.evidence.map((e, i) => (
              <li key={i} className="text-xs font-mono text-card-foreground flex gap-2">
                <span className="text-warning shrink-0">▸</span>
                {e}
              </li>
            ))}
          </ul>
        </div>

        {/* Immediate Actions */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Immediate Actions</div>
          <ol className="space-y-1">
            {analysis.immediateActions.map((a, i) => (
              <li key={i} className="text-xs font-mono text-card-foreground flex gap-2">
                <span className="text-primary shrink-0">{i + 1}.</span>
                {a}
              </li>
            ))}
          </ol>
        </div>

        {/* Impact & Services */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Business Impact</div>
            <div className="text-xs font-mono text-critical">{analysis.estimatedImpact}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Affected Services</div>
            <div className="flex gap-1 flex-wrap">
              {analysis.affectedServices.map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 bg-muted rounded font-mono text-foreground">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Prevention */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Prevention</div>
          <ul className="space-y-1">
            {analysis.preventionSteps.map((p, i) => (
              <li key={i} className="text-xs font-mono text-muted-foreground flex gap-2">
                <span className="text-info shrink-0">◆</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
