import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import Spline from '@splinetool/react-spline';
import { ParticlesBackground } from '../src/components/ParticlesBackground';
import { HeroMockup } from '../src/components/HeroMockup';

const TypewriterText = () => {
  const texts = ["Flow Intelligence", "Emergency Routing", "Resource Allocation"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-white italic inline-block min-w-[300px] text-left">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5 }}
          className="inline-block"
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const yParallaxFast = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const yParallaxSlow = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.querySelectorAll('.spotlight-card').forEach((card: any) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="space-y-24 sm:space-y-40 pb-24 sm:pb-40 bg-[#020617] text-white overflow-hidden relative">
      <ParticlesBackground />
      <motion.div style={{ y: yParallaxSlow }} className="absolute inset-0 z-0 pointer-events-none">
        <div className="mesh-gradient"></div>
      </motion.div>

      {/* Hero Section - Optimized for Single-Line Headline and Visual Balance */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center px-4 sm:px-12 xl:px-24 pt-28 lg:pt-0">
        <div className="w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          <div className="space-y-6 sm:space-y-10 reveal z-20 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="badge-yellow">Operational Hub Active</span>
              <span className="badge-tag">v4.0 Grid Intelligence</span>
            </div>
            
            <div className="space-y-4 overflow-visible">
              {/* FIXED: MEDNEXUS in one line using clamp for precise responsive sizing */}
              <h1 className="text-impact text-[11vw] sm:text-[10vw] lg:text-[7vw] xl:text-[8.5vw] tracking-tighter leading-none whitespace-nowrap inline-block w-full">
                MED<span className="text-blue-500">NEXUS</span>
              </h1>
              <h2 className="text-impact text-lg sm:text-2xl md:text-3xl xl:text-4xl text-slate-400 tracking-tight leading-tight max-w-2xl mx-auto lg:mx-0">
                Precision Hospital <TypewriterText />
              </h2>
            </div>
            
            <p className="text-slate-400 text-sm sm:text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              The unified operating system for modern medical centers. Orchestrating emergency beds, blood banks, and patient queues through a decentralized AI grid.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 justify-center lg:justify-start">
              <Link 
                to="/auth" 
                className="px-8 sm:px-12 py-5 sm:py-6 bg-blue-600 text-white rounded-full font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-white hover:text-black transition-all duration-500 shadow-2xl shadow-blue-600/30 group active:scale-95"
              >
                Launch Dashboard 
                <span className="material-icons-round text-xl sm:text-2xl group-hover:translate-x-2 transition-transform">bolt</span>
              </Link>
              <button className="px-8 sm:px-12 py-5 sm:py-6 bg-transparent border-2 border-white/10 text-white rounded-full font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] hover:bg-white/5 transition-all active:scale-95">
                Explore Matrix
              </button>
            </div>
          </div>

          <div className="relative reveal delay-300 z-10 lg:translate-x-6 px-4 sm:px-0">
            {/* Visual Centerpiece - Interactive Dashboard Mockup */}
            <motion.div style={{ y: yParallaxFast }} className="relative reveal delay-300 z-10 hidden lg:block">
              <HeroMockup />
            </motion.div>
            <div className="relative reveal delay-300 z-10 lg:hidden block">
              <HeroMockup />
            </div>
            {/* Ambient Background Glows */}
            <div className="absolute -z-10 -top-10 -right-10 w-[20rem] sm:w-[40rem] h-[20rem] sm:h-[40rem] bg-blue-600/10 blur-[80px] sm:blur-[120px] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-4 sm:px-12 xl:px-24 w-full max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          {[
            { icon: 'confirmation_number', title: 'Get Token', desc: 'AI-powered remote queueing. Reduce onsite waiting times by up to 80% with digital turns.', color: 'text-blue-500' },
            { icon: 'analytics', title: 'Live Status', desc: 'Real-time telemetry for bed occupancy and surgical suite availability across nodes.', color: 'text-indigo-500' },
            { icon: 'emergency', title: 'Emergency Redir', desc: 'Instant critical path routing to nearest facilities with zero-latency handoff protocols.', color: 'text-red-500' }
          ].map((f, i) => (
            <Tilt key={i} className="h-full z-10" tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.15} glareColor="#ffffff" glarePosition="all" glareBorderRadius="3rem">
              <div className="h-full spotlight-card glass-premium rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 space-y-6 sm:space-y-10 reveal border border-white/10 bg-slate-900/50 backdrop-blur-xl" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 rounded-2xl sm:rounded-3xl flex items-center justify-center ${f.color} shadow-2xl border border-white/5`}>
                  <span className="material-icons-round text-3xl sm:text-4xl">{f.icon}</span>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-none">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            </Tilt>
          ))}
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-24 sm:py-40 bg-slate-900/40 border-y border-white/5 reveal w-full overflow-hidden relative">
        <div className="max-w-[1800px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
          <div className="text-center space-y-4 sm:space-y-6">
            <h4 className="text-impact text-7xl sm:text-9xl xl:text-[11rem] text-white">12k+</h4>
            <div className="badge-yellow">Tokens Daily</div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4 sm:mt-6">Processed Hub Nodes</p>
          </div>
          <div className="text-center space-y-4 sm:space-y-6">
            <h4 className="text-impact text-7xl sm:text-9xl xl:text-[11rem] text-blue-500">500+</h4>
            <div className="badge-yellow">Medical Centers</div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4 sm:mt-6">Integrated API Nodes</p>
          </div>
          <div className="text-center space-y-4 sm:space-y-6">
            <h4 className="text-impact text-7xl sm:text-9xl xl:text-[11rem] text-white">99.9%</h4>
            <div className="badge-yellow">Uptime Reliable</div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4 sm:mt-6">Infrastructure SLA</p>
          </div>
        </div>
      </section>

      {/* Connectivity */}
      <section className="px-4 sm:px-12 xl:px-24 w-full max-w-[1800px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        <div className="flex-1 w-full reveal order-2 lg:order-1">
          <div className="relative glass-premium rounded-[2.5rem] sm:rounded-[4rem] p-6 sm:p-10 border border-white/10 overflow-hidden shadow-3xl">
            <div className="w-full h-[300px] sm:h-[500px] relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-black/50">
              <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 sm:bottom-12 sm:left-12 flex items-center gap-4 sm:gap-6 bg-slate-900/90 backdrop-blur-3xl px-6 sm:px-10 py-3 sm:py-5 rounded-[1.5rem] sm:rounded-[2.2rem] border border-white/10 shadow-3xl">
              <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]"></span>
              <div>
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-white block leading-none">Live Network Pulse</span>
                <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 block">1,482 Active Nodes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-10 sm:space-y-16 reveal delay-200 order-1 lg:order-2 text-center lg:text-left">
          <div className="space-y-6">
            <h2 className="text-impact text-5xl sm:text-7xl md:text-8xl leading-[0.85] tracking-tighter uppercase">
              Unified Health <br/> <span className="text-blue-500">Connectivity</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Break the silos between departments. MedNexus creates a decentralized digital thread across pharmacies, labs, and inpatient wards to ensure seamless patient transitions across the entire city grid.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 text-left">
            <div className="space-y-4 group p-6 rounded-[2rem] hover:bg-white/5 transition-all">
              <div className="w-14 h-14 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-blue-600/20">
                <span className="material-icons-round text-3xl">hub</span>
              </div>
              <h5 className="font-black text-xl text-white uppercase tracking-tight">Mesh Network</h5>
              <p className="text-slate-500 text-sm leading-relaxed">Intelligent traffic shaping for emergency response nodes.</p>
            </div>
            <div className="space-y-4 group p-6 rounded-[2rem] hover:bg-white/5 transition-all">
              <div className="w-14 h-14 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 border border-indigo-600/20">
                <span className="material-icons-round text-3xl">sync_alt</span>
              </div>
              <h5 className="font-black text-xl text-white uppercase tracking-tight">Supply Sync</h5>
              <p className="text-slate-500 text-sm leading-relaxed">Real-time inventory orchestration for blood and meds.</p>
            </div>
          </div>
          
          <button className="flex items-center gap-6 text-blue-500 font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] hover:gap-12 transition-all group mx-auto lg:mx-0">
            Explore 2026 Grid Strategy <span className="material-icons-round text-xl sm:text-2xl group-hover:translate-x-2">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-32 sm:pt-60 pb-12 sm:pb-20 border-t border-white/5 px-6 lg:px-12 xl:px-24 bg-black/30 w-full">
        <div className="w-full max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between gap-16 md:gap-32">
          <div className="space-y-8 sm:space-y-12 max-w-md text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-600/20">
                <span className="material-icons-round text-3xl">health_and_safety</span>
              </div>
              <span className="text-impact text-4xl sm:text-5xl tracking-tighter">MedNexus</span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-loose uppercase tracking-[0.1em]">
              Defining the 2026 standard of medical logistics. Powered by decentralized intelligence, driven by metropolitan care protocols.
            </p>
            <div className="flex justify-center md:justify-start gap-6">
              <button className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-all border border-white/5">
                 <span className="material-icons-round text-xl">public</span>
              </button>
              <button className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 transition-all border border-white/5">
                 <span className="material-icons-round text-xl">security</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-40 text-center sm:text-left">
            <div className="space-y-6 sm:space-y-8">
              <h6 className="text-[10px] sm:text-[12px] font-black text-white uppercase tracking-[0.5em]">Platform</h6>
              <ul className="space-y-4 sm:space-y-5 text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">
                <li><a href="#" className="hover:text-blue-500 transition-colors">OS Dashboard</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Queue API</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div className="space-y-6 sm:space-y-8">
              <h6 className="text-[10px] sm:text-[12px] font-black text-white uppercase tracking-[0.5em]">Resources</h6>
              <ul className="space-y-4 sm:space-y-5 text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Grid Docs</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Hub Center</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Node Status</a></li>
              </ul>
            </div>
            <div className="space-y-6 sm:space-y-8 hidden sm:block">
              <h6 className="text-[12px] font-black text-white uppercase tracking-[0.5em]">Legal</h6>
              <ul className="space-y-5 text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="w-full max-w-[1800px] mx-auto mt-24 sm:mt-48 pt-10 sm:pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center">
          <p className="text-slate-600 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em]">© 2026 MedNexus Health Technologies Inc. All Rights Reserved.</p>
          <div className="flex items-center gap-4 px-6 py-3 bg-emerald-500/5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
            <span className="text-[8px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Global Status: Functional</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
