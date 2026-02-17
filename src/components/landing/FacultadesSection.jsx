import { motion } from 'framer-motion';
import { Cpu, TrendingUp, Scale, Pill, Smile, ArrowRight } from 'lucide-react';

const facultades = [
    {
        name: 'Ingeniería y Arquitectura',
        shortName: 'Ingeniería',
        icon: Cpu,
        description: 'Formación en ciencias aplicadas, tecnología y diseño arquitectónico con enfoque innovador.',
        color: 'from-blue-500 to-cyan-400',
        shadowColor: 'shadow-blue-500/20',
    },
    {
        name: 'FACES',
        shortName: 'Ciencias Económicas y Sociales',
        icon: TrendingUp,
        description: 'Administración, Contaduría y Economía para el desarrollo empresarial del país.',
        color: 'from-emerald-500 to-teal-400',
        shadowColor: 'shadow-emerald-500/20',
    },
    {
        name: 'Derecho',
        shortName: 'Ciencias Jurídicas',
        icon: Scale,
        description: 'Formación jurídica sólida con compromiso ético y vocación de servicio.',
        color: 'from-amber-500 to-orange-400',
        shadowColor: 'shadow-amber-500/20',
    },
    {
        name: 'Farmacia',
        shortName: 'Ciencias Farmacéuticas',
        icon: Pill,
        description: 'Ciencias de la salud con enfoque en investigación y desarrollo farmacéutico.',
        color: 'from-rose-500 to-pink-400',
        shadowColor: 'shadow-rose-500/20',
    },
    {
        name: 'Odontología',
        shortName: 'Ciencias Odontológicas',
        icon: Smile,
        description: 'Salud bucal con práctica clínica avanzada y atención comunitaria.',
        color: 'from-violet-500 to-purple-400',
        shadowColor: 'shadow-violet-500/20',
    },
];

export default function FacultadesSection() {
    return (
        <section className="relative py-28 px-6 md:px-12 bg-slate-50 dark:bg-slate-900 overflow-hidden" id="facultades-section">
            {/* Background */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] [background-image:radial-gradient(circle,#002855_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-usm-blue dark:text-blue-300 text-xs font-bold uppercase tracking-widest mb-4 border border-blue-200 dark:border-blue-800">
                        Ecosistema Académico
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-usm-blue dark:text-white leading-tight mb-4">
                        Nuestras{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-usm-blue to-usm-blue-bright">
                            Facultades
                        </span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        Cinco pilares de conocimiento que forman a los profesionales del mañana.
                    </p>
                </motion.div>

                {/* Faculty cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facultades.map((fac, index) => {
                        const Icon = fac.icon;
                        return (
                            <motion.article
                                key={fac.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08, duration: 0.5 }}
                                className={`group relative rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl ${fac.shadowColor} transition-all duration-500 hover:-translate-y-1 ${index === 0 ? 'lg:col-span-2' : ''
                                    }`}
                            >
                                {/* Color accent bar */}
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${fac.color}`} />

                                <div className="p-7 md:p-8">
                                    <div className="flex items-start gap-5">
                                        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${fac.color} flex items-center justify-center shadow-lg ${fac.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl md:text-2xl font-black text-usm-blue dark:text-white mb-1 leading-tight">
                                                {fac.name}
                                            </h3>
                                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                                                {fac.shortName}
                                            </p>
                                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                                                {fac.description}
                                            </p>
                                            <button className="inline-flex items-center gap-2 text-sm font-bold text-usm-blue-bright hover:gap-3 transition-all duration-300 group/btn">
                                                Explorar Facultad
                                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
