import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export default function Card({ className, children, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={twMerge(
        'bg-white/90 dark:bg-slate-800/80 rounded-3xl shadow-soft p-6 border border-white/60 dark:border-slate-700/50 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
