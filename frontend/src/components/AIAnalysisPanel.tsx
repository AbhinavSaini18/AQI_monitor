import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface AIAnalysisPanelProps {
  aqi: number;
}

export default function AIAnalysisPanel({ aqi }: AIAnalysisPanelProps) {
  const insights = [
    {
      icon: TrendingUp,
      color: 'text-orange-400',
      title: 'Rising Trend Detected',
      body: 'AQI has increased 23% over the last 3 hours due to temperature inversion trapping pollutants near the surface.',
    },
    {
      icon: AlertTriangle,
      color: 'text-red-400',
      title: 'Stubble Burning Impact',
      body: 'Wind trajectory analysis shows smoke from northern farm fires contributing ~35% of current PM2.5 levels.',
    },
    {
      icon: Lightbulb,
      color: 'text-cyan-400',
      title: 'Recommendation',
      body: 'Peak pollution expected 5–7 PM. Sensitive groups should remain indoors. Conditions improve by tomorrow morning.',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-cyan-950/40 via-slate-800/40 to-slate-900/40 rounded-2xl border border-cyan-800/30 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">AI Analysis</h3>
          <p className="text-cyan-500/70 text-xs">Generated 2 min ago · AQI {aqi}</p>
        </div>
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 transition">
              <Icon className={`w-4 h-4 ${insight.color} shrink-0 mt-0.5`} />
              <div>
                <p className="text-white text-xs font-semibold mb-1">{insight.title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{insight.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
