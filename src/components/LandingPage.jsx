import React from 'react';
import { 
  Shield, ArrowRight, Zap, Globe, Lock, Users, 
  ChevronRight, Play, CheckCircle
} from 'lucide-react';

export default function LandingPage({ onEnterPortal }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-body selection:bg-accent-1/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-1/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-2/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-8 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center shadow-lg shadow-accent-1/20 group-hover:scale-110 transition-transform">
            <Shield className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-black text-xl leading-tight uppercase tracking-tighter">Ops Hub</h1>
            <p className="text-[8px] text-accent-1 uppercase tracking-[0.4em] font-black">Smart Campus</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-10">
          {['Intelligence', 'Security', 'Infrastructure', 'Analytics'].map(item => (
            <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-colors">{item}</a>
          ))}
        </div>

        <button 
          onClick={onEnterPortal}
          className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-500 shadow-xl"
        >
          Secure Portal
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-[1400px] mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent-1/10 border border-accent-1/20 text-accent-1">
              <Zap className="w-4 h-4 fill-accent-1" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Next-Gen Campus Intelligence</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-heading font-black leading-[0.9] tracking-tighter uppercase">
              The Brain of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-1 via-white to-accent-2 animate-gradient">Smart Campus</span>
            </h1>

            <p className="text-gray-400 font-black text-lg md:text-xl leading-relaxed max-w-[500px] uppercase tracking-tight">
              A unified command center for institutional operations, real-time security monitoring, and automated communication protocols.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onEnterPortal}
                className="group flex items-center justify-center gap-4 bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-accent-1 hover:text-white transition-all duration-500 shadow-2xl shadow-accent-1/20"
              >
                Access Command Center
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
              
              <button className="flex items-center justify-center gap-4 bg-white/5 border border-white/10 px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all">
                <Play className="w-4 h-4 fill-white" />
                Watch Protocol
              </button>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-2xl font-black tracking-tighter">24/7</p>
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Active Monitoring</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black tracking-tighter">1.2ms</p>
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Response Latency</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black tracking-tighter">99.9%</p>
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Uptime Protocol</p>
              </div>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="absolute inset-0 bg-accent-1/20 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="glass-card !bg-white/5 !border-white/10 !p-2 rounded-[40px] shadow-2xl overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070" 
                alt="Infrastructure" 
                className="w-full h-auto rounded-[32px] opacity-80 group-hover:opacity-100 transition-opacity duration-700 grayscale group-hover:grayscale-0"
              />
              
              {/* Floating Stat Card */}
              <div className="absolute bottom-10 -left-10 glass-card !p-6 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="text-green-500 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">System Status</p>
                    <p className="text-sm font-black text-white uppercase">All Systems Nominal</p>
                  </div>
                </div>
              </div>

              {/* Floating Stat Card 2 */}
              <div className="absolute top-10 -right-10 glass-card !p-6 animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent-1/20 flex items-center justify-center">
                    <Globe className="text-accent-1 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Global Sync</p>
                    <p className="text-sm font-black text-white uppercase">Nodes Active: 482</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-32 px-6 max-w-[1400px] mx-auto">
        <div className="text-center space-y-4 mb-20">
          <span className="text-[10px] font-black text-accent-1 uppercase tracking-[0.4em]">Core Capabilities</span>
          <h2 className="text-5xl font-heading font-black uppercase tracking-tighter">Engineered for Excellence</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Unified Identity',
              desc: 'Seamless institutional SSO integration with secure role-based permissions.',
              icon: Lock,
              color: 'text-blue-500'
            },
            {
              title: 'Instant Broadcast',
              desc: 'Deploy critical notifications across the entire campus ecosystem in milliseconds.',
              icon: Zap,
              color: 'text-yellow-500'
            },
            {
              title: 'Live Intelligence',
              desc: 'Real-time telemetry and interaction logs for complete operational awareness.',
              icon: Globe,
              color: 'text-purple-500'
            }
          ].map((feature, idx) => (
            <div key={idx} className="glass-card group hover:!bg-white/10 transition-all duration-500">
              <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${feature.color}`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">{feature.title}</h3>
              <p className="text-gray-400 font-black text-sm leading-relaxed uppercase tracking-tight">
                {feature.desc}
              </p>
              <div className="mt-8 flex items-center gap-2 text-accent-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-black uppercase tracking-widest">Learn Protocol</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Institutional Banner */}
      <section className="relative z-10 py-32 border-y border-white/5 bg-white/5 overflow-hidden">
        <div className="absolute inset-0 opacity-10 animate-pulse">
            <div className="flex gap-20 whitespace-nowrap py-10">
                {[...Array(10)].map((_, i) => (
                    <span key={i} className="text-8xl font-black uppercase tracking-tighter text-transparent border-white border">Secure Campus</span>
                ))}
            </div>
        </div>
        
        <div className="relative max-w-[800px] mx-auto text-center space-y-10 px-6">
          <h2 className="text-4xl md:text-6xl font-heading font-black uppercase tracking-tighter leading-tight"> Ready to Modernize Your Operations? </h2>
          <button 
            onClick={onEnterPortal}
            className="bg-accent-1 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-accent-1/40 hover:-translate-y-2 hover:bg-white hover:text-black transition-all duration-500"
          >
            Enter Operational Portal
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 px-6 max-w-[1400px] mx-auto border-t border-white/5">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-1 flex items-center justify-center">
                <Shield className="text-white w-4 h-4" />
              </div>
              <h1 className="font-heading font-black text-lg uppercase tracking-tighter">Ops Hub</h1>
            </div>
            <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest leading-loose">
              Setting the standard for smart campus infrastructure and institutional management.
            </p>
          </div>
          
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Protocols</h4>
            <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <a href="#" className="hover:text-accent-1 transition-colors">Broadcast</a>
              <a href="#" className="hover:text-accent-1 transition-colors">Security</a>
              <a href="#" className="hover:text-accent-1 transition-colors">Monitoring</a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Infrastructure</h4>
            <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <a href="#" className="hover:text-accent-1 transition-colors">Nodes</a>
              <a href="#" className="hover:text-accent-1 transition-colors">Latency</a>
              <a href="#" className="hover:text-accent-1 transition-colors">System Health</a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Connect</h4>
            <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <a href="#" className="hover:text-accent-1 transition-colors">Portal Access</a>
              <a href="#" className="hover:text-accent-1 transition-colors">Staff Support</a>
              <a href="#" className="hover:text-accent-1 transition-colors">Documentation</a>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em]">© 2026 SMART CAMPUS OPERATIONS HUB. ALL PROTOCOLS RESERVED.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-[8px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-[8px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
