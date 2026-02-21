import { motion } from 'framer-motion';
import { Target, Eye, CheckCircle, Sparkles } from 'lucide-react';

const values = [
    { label: 'Excelencia', icon: Sparkles },
    { label: 'Compromiso', icon: CheckCircle },
    { label: 'Responsabilidad Social', icon: CheckCircle },
    { label: 'Inclusión', icon: CheckCircle },
];

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
    }),
};

export default function MisionVision() {
    return (
        <section className="relative py-16 sm:py-28 px-4 sm:px-6 md:px-12 bg-slate-50 dark:bg-slate-900 overflow-hidden" id="identidad">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] [background-image:radial-gradient(circle,#002855_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-usm-blue dark:text-blue-300 text-xs font-bold uppercase tracking-widest mb-4 border border-blue-200 dark:border-blue-800">
                        Identidad Institucional
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-usm-blue dark:text-white leading-tight mb-4">
                        Nuestra{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-usm-blue to-usm-blue-bright">
                            Razón de Ser
                        </span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        Más de seis décadas formando profesionales integrales con visión de futuro.
                    </p>
                </motion.div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
                    {/* Misión */}
                    <motion.div
                        custom={0}
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="group relative rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-usm-blue to-usm-blue-bright rounded-l-2xl" />
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-usm-blue to-usm-blue-bright flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Target className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-usm-blue dark:text-white">Misión</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                            Formar profesionales integrales con competencias científicas, tecnológicas y humanísticas para el desarrollo nacional, bajo un proceso educativo innovador que incorpora las más avanzadas tecnologías de la información y comunicación.
                        </p>
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-usm-blue-bright/5 dark:bg-usm-blue-bright/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    </motion.div>

                    {/* Visión */}
                    <motion.div
                        custom={1}
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="group relative rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-usm-blue-bright to-blue-400 rounded-l-2xl" />
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-usm-blue-bright to-blue-400 flex items-center justify-center shadow-lg shadow-blue-400/20">
                                <Eye className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-usm-blue dark:text-white">Visión</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                            Ser la institución privada líder en educación superior en Venezuela, reconocida por su prestigio, excelencia académica y por la formación de egresados comprometidos con el progreso y la transformación del país.
                        </p>
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-400/5 dark:bg-blue-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    </motion.div>
                </div>

                {/* Values ribbon */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    {values.map((val, i) => {
                        const Icon = val.icon;
                        return (
                            <motion.div
                                key={val.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-usm-blue-bright/50 transition-all duration-300"
                            >
                                <Icon className="w-4 h-4 text-usm-blue-bright" />
                                <span className="text-sm font-semibold text-usm-blue dark:text-white">{val.label}</span>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
