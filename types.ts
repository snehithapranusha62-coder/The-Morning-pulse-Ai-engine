import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, AlertCircle, RefreshCw, BarChart3, ChevronRight, Activity, Volume2, VolumeX, Brain, Search, Filter, X } from 'lucide-react';
import Layout from '../components/Layout';
import { EdTechReport, User } from '../types';
import { cn } from '../lib/utils';
import { generatePulseReport } from '../services/gemini';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [report, setReport] = useState<EdTechReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('All Sources');
  const navigate = useNavigate();

  const [isSpeaking, setIsSpeaking] = useState(false);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speak = (report: EdTechReport | null) => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (!report) return;

    const synth = window.speechSynthesis;
    const reportText = `
      Good morning. Here is your Morning Pulse Intelligence brief for today.
      
      Competitor Updates: ${report.competitor_updates.length} signals identified. 
      User Pain Points: ${report.user_pain_points.length} critical issues listed. 
      Emerging Tech Trends: ${report.emerging_tech_trends.length} upcoming transformations detected. 
      
      That concludes your daily pulse.
    `;

    const utterance = new SpeechSynthesisUtterance(reportText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a nice English voice
    const voices = synth.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Female'))) || 
                        voices.find(v => v.lang.startsWith('en')) || 
                        voices[0];
    
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    let interval: any;
    if (autoRefresh && !loading) {
      interval = setInterval(() => {
        handleGenerateReport();
      }, 45 * 60 * 1000); // 45 minutes refresh
    }
    return () => clearInterval(interval);
  }, [autoRefresh, loading]);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Synchronize fresh market signals from all sources
      const dataRes = await fetch('/api/edtech-data');
      if (!dataRes.ok) throw new Error('Failed to synchronize market signals');
      const marketData = await dataRes.json();
      
      if (!marketData.data || marketData.data.length === 0) {
        throw new Error('No fresh intelligence signals found in the last 24h.');
      }

      // 2. Perform AI Analysis on the client side (Per Gemini SDK Guidelines)
      const aiReport = await generatePulseReport(marketData.data);
      
      // 3. Persist the report to history
      await fetch('/api/save-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitor_updates: aiReport.competitor_updates,
          pain_points: aiReport.user_pain_points,
          trends: aiReport.emerging_tech_trends
        })
      });

      setReport(aiReport);
    } catch (err: any) {
      console.error(err);
      if (err.message === "QUOTA_EXCEEDED") {
        setError('AI Intelligence Hub is currently overloaded. Accessing latest secure archive for mission data.');
        
        // Fallback: Try to fetch the most recent report from history
        try {
          const historyRes = await fetch('/api/reports');
          if (historyRes.ok) {
            const history = await historyRes.json();
            if (history && history.length > 0) {
              const latest = history[0];
              const parsedReport: EdTechReport = {
                competitor_updates: JSON.parse(latest.competitor_updates),
                user_pain_points: JSON.parse(latest.pain_points),
                emerging_tech_trends: JSON.parse(latest.trends),
                timestamp: latest.report_date
              };
              setReport(parsedReport);
            }
          }
        } catch (fallbackErr) {
          console.error("Historical fallback failed:", fallbackErr);
        }
      } else {
        setError('AI Engine encountered an error while analyzing signals.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Logic to filter the report data based on user input
  const getFilteredItems = (items: any[]) => {
    if (!items) return [];
    return items.filter(item => {
      const matchesSearch = searchQuery === '' || 
        (item.title || item.issue || item.trend || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.insight || item.details || item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSource = selectedSource === 'All Sources' || item.source === selectedSource;
      
      return matchesSearch && matchesSource;
    });
  };

  const allSources = report ? Array.from(new Set([
    ...report.competitor_updates.map(i => i.source),
    ...report.user_pain_points.map(i => i.source),
    ...report.emerging_tech_trends.map(i => i.source)
  ].filter(Boolean))) as string[] : [];

  if (!user) return null;

  return (
    <Layout user={user}>
      <div className="flex flex-col h-full">
        {/* Header Strip */}
        <header className="h-16 border-b border-[#e2e8f0] bg-white flex items-center justify-between px-8 sticky top-0 z-40">
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none">
              Morning Pulse Engine <span className="font-normal text-slate-400">/ Intelligence Control</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {report && (
              <button
                onClick={() => speak(report)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all",
                  isSpeaking 
                    ? "bg-red-50 text-red-600 border border-red-200" 
                    : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                )}
              >
                {isSpeaking ? (
                  <><VolumeX size={14} /> Stop Briefing</>
                ) : (
                  <><Volume2 size={14} /> Listen to Report</>
                )}
              </button>
            )}
            <div className="flex items-center gap-6 border-r border-[#e2e8f0] pr-8">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                  )} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Mode</span>
                  <button 
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={cn(
                      "w-8 h-4 rounded-full relative transition-colors duration-200 focus:outline-none",
                      autoRefresh ? "bg-blue-600" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200",
                      autoRefresh ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-tighter">
                  Last Sync: {report ? 'Just now' : 'Idle'}
                </div>
                <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="bg-[#2563eb] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                  {loading ? 'Processing...' : "Generate Today's Report"}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Strip */}
        <div className="grid grid-cols-4 gap-4 px-8 py-6">
          <StatBox 
            label="Competitors" 
            value={report?.competitor_updates.length || "0"} 
            sub="IDENTIFIED" 
            status={report?.competitor_updates.length ? 'success' : 'idle'} 
          />
          <StatBox 
            label="User Pains" 
            value={report?.user_pain_points.length || "0"} 
            sub="CRITICAL" 
            status={report?.user_pain_points.length ? 'warning' : 'idle'}
          />
          <StatBox 
            label="Trends" 
            value={report?.emerging_tech_trends.length || "0"} 
            sub="UPCOMING" 
            status={report?.emerging_tech_trends.length ? 'success' : 'idle'}
          />
          <StatBox 
            label="Urgent" 
            value={report?.user_pain_points.filter(p => p.frequency === 'High').length || "0"} 
            sub="HIGH FREQUENCY" 
            status={report?.user_pain_points.filter(p => p.frequency === 'High').length ? 'danger' : 'idle'}
          />
        </div>

        {/* Filter Bar */}
        {report && (
          <div className="px-8 mb-6">
            <div className="bg-white border border-[#e2e8f0] p-3 rounded-xl shadow-sm flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text"
                  placeholder="Query intelligence signals (e.g. 'Classroom', 'Bot', 'District')..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 border-l pl-4 border-slate-100">
                <Filter className="text-slate-400 w-4 h-4" />
                <select 
                  className="bg-transparent border-none text-xs font-bold text-slate-500 py-2 focus:ring-0 cursor-pointer uppercase tracking-tight"
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                >
                  <option>All Sources</option>
                  {allSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              {(searchQuery || selectedSource !== 'All Sources') && (
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedSource('All Sources'); }}
                  className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 px-8 pb-12 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600 font-mono text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>TERMINAL ERROR: {error}</span>
            </div>
          )}

          {!report && !loading && (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-dashed border-slate-300">
              <Activity className="w-12 h-12 text-slate-200 mb-4" />
              <div className="text-slate-400 font-mono text-sm tracking-widest uppercase mb-4">Awaiting Signal Generation</div>
              <button 
                onClick={handleGenerateReport}
                className="text-blue-600 font-bold hover:underline text-sm"
              >
                INITIALIZE ENGINE SCAN
              </button>
            </div>
          )}

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-slate-200"
              >
                <div className="w-10 h-10 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-mono text-xs tracking-widest uppercase">GEMINI PRO 1.5 // ANALYZING CROSS-DISTRICT SIGNALS...</p>
              </motion.div>
            )}

            {report && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-6 mb-8"
              >
                <GridCard 
                  title="Competitor Updates" 
                  tag={`MATCHES: ${getFilteredItems(report.competitor_updates).length}`}
                  items={getFilteredItems(report.competitor_updates).map(item => ({
                    title: item.title,
                    desc: item.insight,
                    source: item.source,
                    sentiment: item.sentiment,
                    sub_detail: item.impact,
                    sub_label: "STRATEGIC IMPACT"
                  }))}
                />
                <GridCard 
                  title="User Pain Points" 
                  tag={`MATCHES: ${getFilteredItems(report.user_pain_points).length}`}
                  items={getFilteredItems(report.user_pain_points).map(item => ({
                    title: item.issue,
                    desc: item.details,
                    source: item.source,
                    sentiment: item.sentiment,
                    priority: item.frequency,
                    sub_label: "FREQUENCY"
                  }))}
                />
                <GridCard 
                  title="Emerging Tech Trends" 
                  tag={`MATCHES: ${getFilteredItems(report.emerging_tech_trends).length}`}
                  items={getFilteredItems(report.emerging_tech_trends).map(item => ({
                    title: item.trend,
                    desc: item.description,
                    source: item.source,
                    sentiment: item.sentiment,
                    opportunity: item.opportunity,
                    sub_label: "OPPORTUNITY"
                  }))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}

function StatBox({ label, value, sub, status }: any) {
  return (
    <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-sm">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-2">
        {value}
        {sub && (
          <span className={cn(
            "text-[9px] font-mono px-1.5 py-0.5 rounded",
            status === 'success' ? 'bg-emerald-50 text-emerald-600' : 
            status === 'warning' ? 'bg-amber-50 text-amber-600' :
            status === 'danger' ? 'bg-red-50 text-red-600' :
            'bg-slate-100 text-slate-500'
          )}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function GridCard({ title, tag, items }: { title: string, tag: string, items: any[] }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col shadow-sm">
      <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
        <span className="text-[9px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-500 uppercase">
          {tag}
        </span>
      </div>
      <div className="p-5 flex-1 space-y-6">
        {items.map((item, i) => (
          <div key={i} className="group">
            <h4 className="text-[13px] font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
              {item.title}
            </h4>
            {item.source && (
               <div className="text-[9px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                 <div className="flex items-center gap-1">
                   <RefreshCw size={8} /> SOURCE: {item.source}
                 </div>
                 {item.sentiment && (
                   <span className={cn(
                     "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                     item.sentiment === 'positive' ? "bg-emerald-100 text-emerald-700" :
                     item.sentiment === 'negative' ? "bg-red-100 text-red-700" :
                     "bg-slate-100 text-slate-700"
                   )}>
                     {item.sentiment}
                   </span>
                 )}
               </div>
            )}
            <p className="text-xs text-slate-500 leading-relaxed mb-2">
              {item.desc}
            </p>
            
            {item.sub_detail && (
              <div className="text-[10px] font-mono text-emerald-600 mt-2 flex items-start gap-2">
                <ChevronRight size={10} className="mt-0.5" /> 
                <div><span className="font-bold">{item.sub_label}:</span> {item.sub_detail}</div>
              </div>
            )}

            {item.opportunity && (
              <div className="text-[10px] font-mono bg-emerald-50 text-emerald-700 p-2 border-l-2 border-emerald-600 mt-2 flex items-start gap-2">
                <Activity size={10} className="mt-0.5 shrink-0" />
                 <div><span className="font-bold">{item.sub_label}:</span> {item.opportunity}</div>
              </div>
            )}

            {item.priority && (
              <div className={cn(
                "mt-2 text-[9px] font-mono inline-block px-1.5 py-0.5 rounded-sm uppercase font-bold",
                item.priority === 'High' ? 'bg-red-50 text-red-600' : 
                item.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 
                'bg-emerald-50 text-emerald-600'
              )}>
                {item.priority} Frequency
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

