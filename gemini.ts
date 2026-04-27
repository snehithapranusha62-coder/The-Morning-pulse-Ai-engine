import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { User } from '../types';
import { cn } from '../lib/utils';

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchReports();
  }, [navigate]);

  useEffect(() => {
    console.log("Filtering reports for:", filter);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const filtered = reports.filter(report => {
      const reportDate = new Date(report.report_date || report.date);
      if (filter === 'today') return reportDate >= today;
      if (filter === 'week') return reportDate >= lastWeek;
      return true;
    });
    setFilteredReports(filtered);
  }, [filter, reports]);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      console.log("Fetched raw reports:", data);
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateFull = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(/,/, "");
  };

  if (!user) return null;

  return (
    <Layout user={user}>
      <div className="flex flex-col h-full">
        <header className="h-16 border-b border-[#e2e8f0] bg-white flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
              <button onClick={() => selectedReport ? setSelectedReport(null) : navigate('/dashboard')} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <ArrowLeft size={20} />
              </button>
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                Intelligence Archive <span className="font-normal text-slate-400">/ Historical Analysis</span>
              </h1>
          </div>
          
          {!selectedReport && (
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
               {(['all', 'today', 'week'] as const).map((f) => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={cn(
                     "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all",
                     filter === f ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                   )}
                 >
                   {f === 'today' ? "Today" : f === 'week' ? "Last 7 Days" : "All Time"}
                 </button>
               ))}
            </div>
          )}
        </header>

        <div className="flex-1 px-8 py-8 overflow-y-auto">
          {selectedReport ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl">
                <div className="mb-8">
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Report Generated On</div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">{formatDateFull(selectedReport.report_date || selectedReport.date)}</h2>
                </div>

                <div className="space-y-12">
                    <HistorySection 
                        title="Competitor Updates" 
                        items={JSON.parse(selectedReport.competitor_updates)} 
                    />
                    <HistorySection 
                        title="User Pain Points" 
                        items={JSON.parse(selectedReport.pain_points)} 
                    />
                    <HistorySection 
                        title="Emerging Trends" 
                        items={JSON.parse(selectedReport.trends)} 
                    />
                </div>
            </motion.div>
          ) : (
            <div className="max-w-3xl">
                <div className="grid gap-4">
                    {loading ? (
                        <div className="text-center py-20 font-mono text-xs text-slate-400 uppercase tracking-widest">Accessing secure archives...</div>
                    ) : filteredReports.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                           {reports.length === 0 ? "No previous reports available." : "No reports found for this period."}
                        </div>
                    ) : (
                        filteredReports.map((report) => (
                            <button
                                key={report.id}
                                onClick={() => {
                                  console.log("Selected Report Data:", report);
                                  setSelectedReport(report);
                                }}
                                className="bg-white border border-[#e2e8f0] p-6 rounded-xl hover:border-blue-300 hover:shadow-md transition-all text-left flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{formatDateFull(report.report_date || report.date)}</div>
                                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mt-1">Intelligence Packet ID: {report.id.toString().padStart(4, '0')}</div>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </button>
                        ))
                    )}
                </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function HistorySection({ title, items }: { title: string, items: any[] }) {
    return (
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 border-b border-[#e2e8f0]">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
            </div>
            <div className="p-6 space-y-6">
                {items.map((item, i) => (
                    <div key={i} className="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
                        <h4 className="text-[15px] font-bold text-slate-900 mb-1">{item.title || item.issue || item.trend}</h4>
                        
                        <div className="flex items-center justify-between mb-2">
                             {item.source && (
                                 <div className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">
                                     Origin: {item.source}
                                 </div>
                             )}
                             {item.sentiment && (
                                 <span className={cn(
                                     "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                     item.sentiment === 'positive' ? "bg-emerald-500/10 text-emerald-600" :
                                     item.sentiment === 'negative' ? "bg-red-500/10 text-red-600" :
                                     "bg-slate-200 text-slate-500"
                                 )}>
                                     {item.sentiment}
                                 </span>
                             )}
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed">
                            {item.insight || item.details || item.description || item.content || item.desc}
                        </p>
                        
                        {(item.impact || item.opportunity) && (
                            <div className="mt-4 bg-emerald-50 p-3 rounded text-xs text-emerald-800 font-mono border-l-2 border-emerald-600">
                                <span className="font-bold">{item.impact ? 'STRATEGIC IMPACT' : 'OPPORTUNITY'}:</span> {item.impact || item.opportunity}
                            </div>
                        )}

                        {item.frequency && (
                             <div className="mt-2 inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-tighter border border-slate-200 text-slate-400">
                             FREQUENCY: {item.frequency}
                         </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
