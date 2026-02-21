import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import StatsSection from '../components/landing/StatsSection';
import EventsCarousel from '../components/landing/EventsCarousel';
import Footer from '../components/landing/Footer';
import { Link } from 'react-router-dom';
import { Layers, Workflow, Sparkles, Settings2, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main>
        <Hero />
        <Features />

        <section className="py-20 px-6 md:px-12 bg-white dark:bg-slate-800" id="software">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-usm-blue dark:text-white mb-3">USM Red como software académico</h2>
              <p className="text-slate-600 dark:text-slate-400">Diseñado para centralizar publicaciones, eventos y gestión de contenidos en una experiencia clara.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <article className="rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-6">
                <Layers className="w-7 h-7 text-usm-blue-bright mb-4" />
                <h3 className="text-xl font-bold text-usm-blue dark:text-white mb-2">Contenido estructurado</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Publicaciones organizadas por escuela y tipo para lectura rápida.</p>
              </article>
              <article className="rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-6">
                <Workflow className="w-7 h-7 text-usm-blue-bright mb-4" />
                <h3 className="text-xl font-bold text-usm-blue dark:text-white mb-2">Flujo simple</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Ingreso, exploración y guardado de información en pocos pasos.</p>
              </article>
              <article className="rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-6">
                <Settings2 className="w-7 h-7 text-usm-blue-bright mb-4" />
                <h3 className="text-xl font-bold text-usm-blue dark:text-white mb-2">Panel de control</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Administración visual de publicaciones con acciones directas.</p>
              </article>
              <article className="rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-6">
                <Sparkles className="w-7 h-7 text-usm-blue-bright mb-4" />
                <h3 className="text-xl font-bold text-usm-blue dark:text-white mb-2">Interfaz moderna</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Diseño limpio, responsive y pensado para lectura académica.</p>
              </article>
              <article className="rounded-2xl bg-white dark:bg-slate-700 border-2 border-usm-yellow/30 dark:border-usm-yellow/20 p-6">
                <ShieldCheck className="w-7 h-7 text-usm-yellow mb-4" />
                <h3 className="text-xl font-bold text-usm-blue dark:text-white mb-2">Gestión de contenido</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Herramientas internas para mantener organizada la información académica.</p>
              </article>
            </div>
          </div>
        </section>

        <StatsSection />

        <section className="bg-slate-50 dark:bg-slate-900 py-20 text-center relative overflow-hidden" id="nosotros">
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <div className="w-10 h-0.5 bg-usm-yellow mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-bold text-usm-blue dark:text-white mb-6">Accede a la red académica USM</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 font-light">
              Inicia sesión o crea tu cuenta para comenzar a explorar contenido académico.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/login">
                <Button variant="secondary" className="text-lg px-10 py-4">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/registro">
                <Button variant="outline" className="text-lg px-10 py-4 border-usm-blue/30 text-usm-blue dark:text-white dark:border-white/30 hover:bg-usm-blue hover:text-white hover:border-usm-blue">
                  Crear Cuenta
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <EventsCarousel />
      </main>

      <Footer />
    </div>
  );
}
