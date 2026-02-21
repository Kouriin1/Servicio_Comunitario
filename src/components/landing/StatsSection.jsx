import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const stats = [
    { value: 1200, label: 'Tesis publicadas', prefix: '+' },
    { value: 350, label: 'Artículos de investigación', prefix: '+' },
    { value: 80, label: 'Eventos registrados', prefix: '+' },
    { value: 2, label: 'Escuelas integradas', prefix: '' },
];

function AnimatedCounter({ value, prefix, isInView }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        let start = 0;
        const duration = 2000;
        const increment = value / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [isInView, value]);

    const formatNumber = (num) => num >= 1000 ? num.toLocaleString('es-VE') : num.toString();

    return (
        <span className="tabular-nums">
            {prefix}{formatNumber(count)}
        </span>
    );
}

export default function StatsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="relative py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-white dark:bg-slate-800 overflow-hidden">
            {/* Subtle background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-800" />

            <div className="relative max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <div className="w-10 h-0.5 bg-usm-yellow mx-auto mb-6" />
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-medium uppercase tracking-widest">
                        La plataforma en números
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 md:gap-12">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="text-center"
                        >
                            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-usm-blue dark:text-white mb-3 leading-none">
                                <AnimatedCounter value={stat.value} prefix={stat.prefix} isInView={isInView} />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
