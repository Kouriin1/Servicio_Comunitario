import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Acceso() {
  return (
    <section id="acceso" className="relative bg-navy dark:bg-[#060E1A] overflow-hidden">
      <div className="absolute inset-0 noise opacity-[0.14] mix-blend-overlay" aria-hidden="true" />

      <div className="relative mx-auto max-w-[92rem] px-5 sm:px-8 lg:px-12 py-20 sm:py-28 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-16 items-end">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4 mb-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brass-light">
                04 — Acceso
              </span>
              <span className="h-px flex-1 max-w-32 bg-paper/20" aria-hidden="true" />
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display fr-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.04em] text-paper"
              style={{ '--fr-wght': 700 }}
            >
              Entra al archivo
              <br />
              <em className="font-light text-paper/70">de tu universidad</em>
            </motion.h2>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-base leading-relaxed text-paper/72 mb-9">
              El acceso está reservado a estudiantes y profesores de la
              Universidad Santa María. Si ya tienes cuenta, inicia sesión; si no,
              el registro toma un minuto.
            </p>

            <div className="border-t border-paper/20">
              <Link
                to="/login"
                className="group flex items-center justify-between gap-6 py-5 border-b border-paper/20 transition-colors duration-300 hover:border-brass-light"
              >
                <span className="font-display text-2xl text-paper">Iniciar sesión</span>
                <ArrowRight
                  className="w-5 h-5 text-brass-light transition-transform duration-300 group-hover:translate-x-1.5"
                  strokeWidth={1.5}
                />
              </Link>
              <Link
                to="/registro"
                className="group flex items-center justify-between gap-6 py-5 border-b border-paper/20 transition-colors duration-300 hover:border-brass-light"
              >
                <span className="font-display text-2xl text-paper">Crear cuenta</span>
                <ArrowRight
                  className="w-5 h-5 text-brass-light transition-transform duration-300 group-hover:translate-x-1.5"
                  strokeWidth={1.5}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
