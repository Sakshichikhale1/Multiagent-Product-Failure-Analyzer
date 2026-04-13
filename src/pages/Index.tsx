import StatusBar from '@/components/dashboard/StatusBar';
import MetricsPanel from '@/components/dashboard/MetricsPanel';
import ChartsPanel from '@/components/dashboard/ChartsPanel';
import LogPanel from '@/components/dashboard/LogPanel';
import AnalysisPanel from '@/components/dashboard/AnalysisPanel';
import ScenarioControls from '@/components/dashboard/ScenarioControls';
import { useSimulator } from '@/hooks/useSimulator';

const Index = () => {
  const {
    activeScenario,
    logs,
    metricsHistory,
    currentMetrics,
    analysis,
    isAnalyzing,
    isRunning,
    setIsRunning,
    injectScenario,
    resolveScenario,
  } = useSimulator();

  return (
    <div className="min-h-screen flex flex-col bg-background grid-bg">
      {/* Scanline overlay */}
      <div className="fixed inset-0 scanline z-50 pointer-events-none" />

      <StatusBar
        scenario={activeScenario}
        isRunning={isRunning}
        onToggleRunning={() => setIsRunning(!isRunning)}
      />

      <main className="flex-1 p-3 space-y-3 overflow-auto">
        {/* Scenario Injection Controls */}
        <ScenarioControls
          activeScenario={activeScenario}
          onInject={injectScenario}
          onResolve={resolveScenario}
        />

        {/* Metric Cards */}
        <MetricsPanel metricsHistory={metricsHistory} currentMetrics={currentMetrics} />

        {/* Charts */}
        <ChartsPanel metricsHistory={metricsHistory} />

        {/* AI Analysis */}
        <AnalysisPanel analysis={analysis} isAnalyzing={isAnalyzing} />

        {/* Log Panel */}
        <div className="h-[350px]">
          <LogPanel logs={logs} />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-2 border-t border-border text-[10px] text-muted-foreground font-mono flex justify-between">
        <span>OpsPulse v1.0 — E-Commerce Log Intelligence</span>
        <span>Simulated environment • No real services affected</span>
      </footer>
    </div>
  );
};

export default Index;
