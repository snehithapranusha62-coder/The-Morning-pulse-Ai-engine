import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Brain, TrendingUp, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';

export default function Home() {
  const features = [
    {
      title: "Competitor Updates",
      desc: "Real-time tracking of dominant EdTech signals and product shifts.",
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />
    },
    {
      title: "User Pain Points",
      desc: "Automated extraction of educator frictions from global forums.",
      icon: <AlertCircle className="w-5 h-5 text-red-500" />
    },
    {
      title: "Emerging Trends",
      desc: "Probability-based forecasting of modular educational shifts.",
      icon: <Brain className="w-5 h-5 text-purple-500" />
    },
    {
      title: "AI Automation",
      desc: "Daily intelligence cycles powered by optimized Gemini LLMs.",
      icon: <RefreshCw className="w-5 h-5 text-emerald-500" />
    }
  ];

  return (
    <Layout>
      <div className="relative pt-20 pb-32 px-8 overflow-hidden">
        {/* Technical Grid background */}
        <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-24"
          >
            <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-6">
              AI Market Intelligence V1.0
            </div>
            <h1 className="text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Morning Pulse <span className="text-blue-600">Engine</span>
            </h1>
            <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              An advanced EdTech market intelligence system for school management. 
              Extracting real-time signals from Reddit, HN, and Global RSS feeds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="px-8 py-3 bg-[#2563eb] text-white rounded-lg font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                Initialize Network Access
                <ChevronRight size={18} />
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-3 bg-white text-slate-600 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all"
              >
                Operator Login
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group"
              >
                <div className="flex items-start gap-6">
                  <div className="bg-slate-50 p-3 rounded-lg group-hover:bg-blue-50 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">{feature.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
