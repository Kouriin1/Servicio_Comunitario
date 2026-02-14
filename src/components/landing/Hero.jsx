import { motion } from 'framer-motion';
import { useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import { ArrowDown, ShieldCheck, BookOpenText, CalendarCheck2 } from 'lucide-react';

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* 1. Fondo con imagen USM */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <img
          src="/src/assets/lugar_usm.png"
          alt="Campus USM"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:46px_46px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-usm-blue/90 via-usm-blue/65 to-black/55 z-20" />
      </motion.div>

      <motion.div 
        style={{ opacity }}
        className="relative z-30 w-full max-w-7xl px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12 mt-20"
      >
        <div className="flex-1 text-left">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-blue-100 border border-white/25 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
              La Nueva Era Digital
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 drop-shadow-2xl">
              USM RED <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-blue-300 animate-shine bg-[length:200%_auto]">
                CONECTA TU VIDA ACADÉMICA.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl leading-relaxed mb-10 border-l-4 border-blue-300/70 pl-6">
              Un espacio para descubrir publicaciones, organizar recursos y seguir la actividad universitaria en un solo lugar.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard">
                <Button className="text-lg px-10 py-5 rounded-full font-bold transition-all transform hover:-translate-y-1">
                  Explorar Plataforma
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => document.getElementById('software')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-10 py-5 rounded-full border-white/30 text-white hover:bg-white hover:text-black hover:border-white transition-all backdrop-blur-sm"
              >
                Conocer Más
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="hidden md:flex flex-col gap-6 w-80"
        >
          {[
            { icon: <BookOpenText className="w-7 h-7 text-blue-200" />, title: 'Publicaciones académicas', description: 'Visualización clara por categorías y facultades.' },
            { icon: <CalendarCheck2 className="w-7 h-7 text-blue-200" />, title: 'Eventos y avisos', description: 'Seguimiento de actividades universitarias.' },
            { icon: <ShieldCheck className="w-7 h-7 text-blue-200" />, title: 'Gestión administrativa', description: 'Panel para organizar contenido institucional.' },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-4 transform hover:scale-105 transition-transform duration-300"
            >
              <div className="p-3 bg-white/10 rounded-xl">{item.icon}</div>
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">{item.title}</h3>
                <p className="text-xs text-gray-300 font-medium uppercase tracking-wider">{item.description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold">Descubre Más</span>
        <ArrowDown className="text-blue-200 w-6 h-6" />
      </motion.div>
    </section>
  );
}
