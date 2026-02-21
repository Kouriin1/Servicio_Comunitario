import { motion } from 'framer-motion';
import { MapPin, Building2, Star } from 'lucide-react';

const campuses = [
    {
        name: 'La Florencia',
        city: 'Caracas',
        description: 'Sede principal de la Universidad Santa María, centro de la vida académica y administrativa.',
        isPrincipal: true,
    },
    {
        name: 'El Paraíso',
        city: 'Caracas',
        description: 'Campus urbano con acceso a facultades de ciencias sociales y derecho.',
        isPrincipal: false,
    },
    {
        name: 'Sede Amazonas',
        city: 'Puerto Ayacucho',
        description: 'Extensión universitaria para la región sur del país.',
        isPrincipal: false,
    },
    {
        name: 'Sede Barinas',
        city: 'Barinas',
        description: 'Presencia académica en los llanos occidentales de Venezuela.',
        isPrincipal: false,
    },
    {
        name: 'Sede Anzoátegui',
        city: 'Barcelona',
        description: 'Campus regional para la zona nororiental del país.',
        isPrincipal: false,
    },
];

export default function CampusGrid() {
    return (
        <section className="relative py-16 sm:py-28 px-4 sm:px-6 md:px-12 bg-white dark:bg-slate-800 overflow-hidden" id="sedes">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-slate-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-slate-900/20" />

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-usm-blue dark:text-blue-300 text-xs font-bold uppercase tracking-widest mb-4 border border-blue-200 dark:border-blue-800">
                        Nuestras Sedes
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-usm-blue dark:text-white leading-tight mb-4">
                        Presencia en{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-usm-blue to-usm-blue-bright">
                            todo el país
                        </span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        Cinco campus estratégicos que llevan la excelencia educativa a cada rincón de Venezuela.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 auto-rows-[180px] sm:auto-rows-[200px]">
                    {campuses.map((campus, index) => (
                        <motion.div
                            key={campus.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08, duration: 0.5 }}
                            className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-usm-blue/10 ${campus.isPrincipal
                                    ? 'md:col-span-2 md:row-span-2 bg-gradient-to-br from-usm-blue to-usm-blue-bright'
                                    : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:border-usm-blue-bright/50'
                                }`}
                        >
                            {/* Grid pattern overlay */}
                            <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:32px_32px]" />

                            {/* Hover glow */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/20 to-transparent" />

                            <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
                                <div className="flex items-start justify-between">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${campus.isPrincipal
                                            ? 'bg-white/20 backdrop-blur-sm'
                                            : 'bg-blue-50 dark:bg-blue-900/30'
                                        }`}>
                                        <Building2 className={`w-6 h-6 ${campus.isPrincipal ? 'text-white' : 'text-usm-blue-bright'}`} />
                                    </div>
                                    {campus.isPrincipal && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-usm-yellow/90 text-usm-blue text-xs font-bold">
                                            <Star className="w-3 h-3" />
                                            Sede Principal
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h3 className={`text-xl md:text-2xl font-black mb-1 ${campus.isPrincipal ? 'text-white' : 'text-usm-blue dark:text-white'
                                        }`}>
                                        {campus.name}
                                    </h3>
                                    <div className={`flex items-center gap-1.5 text-sm mb-2 ${campus.isPrincipal ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                                        }`}>
                                        <MapPin className="w-3.5 h-3.5" />
                                        {campus.city}
                                    </div>
                                    {campus.isPrincipal && (
                                        <p className="text-blue-100 text-sm leading-relaxed hidden md:block">
                                            {campus.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Hover scale effect */}
                            <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 ring-usm-blue-bright/30 transition-all duration-300" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
