import { motion } from 'framer-motion';

const capacidades = [
  {
    n: '01',
    title: 'Contenido estructurado',
    description: 'Cada publicación queda asociada a su escuela, tipo y autor.',
  },
  {
    n: '02',
    title: 'Búsqueda y filtros',
    description: 'Exploración por facultad, categoría y fecha desde el mismo panel.',
  },
  {
    n: '03',
    title: 'Archivos adjuntos',
    description: 'Documentos, imágenes y video con visor integrado en la ficha.',
  },
  {
    n: '04',
    title: 'Panel de gestión',
    description: 'Alta, edición y curaduría del contenido institucional publicado.',
  },
  {
    n: '05',
    title: 'Acceso verificado',
    description: 'Cuentas de la comunidad universitaria con roles diferenciados.',
  },
];

export default function Capacidades() {
  return (
    <section id="capacidades" className="relative bg-navy dark:bg-[#060E1A] overflow-hidden">
      <div className="absolute inset-0 noise opacity-[0.14] mix-blend-overlay" aria-hidden="true" />

      <div className="relative mx-auto max-w-[92rem] px-5 sm:px-8 lg:px-12 py-20 sm:py-28 lg:py-32">
        {/* Encabezado desalineado a propósito: texto a la izquierda, nota al pie a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-16 items-end mb-16 sm:mb-20">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4 mb-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brass-light">
                02 — Capacidades
              </span>
              <span className="h-px flex-1 max-w-32 bg-paper/20" aria-hidden="true" />
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-[-0.03em] text-paper"
            >
              Un sistema pensado
              <br />
              <em className="font-light text-paper/70">para el trabajo académico</em>
            </motion.h2>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-[0.9375rem] leading-relaxed text-paper/72 lg:text-right">
              No es una red social genérica adaptada: la estructura, los permisos
              y las fichas están hechos alrededor de cómo se produce y se
              consulta el material universitario.
            </p>
          </div>
        </div>

        {/* Ficha técnica: celdas separadas por filetes, sin tarjetas ni sombras */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-paper/20">
          {capacidades.map((item, i) => (
            <motion.article
              key={item.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className={[
                'group relative py-8 pr-4 border-b border-paper/20',
                // filete vertical entre columnas, oculto al inicio de cada fila
                'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-paper/20 before:hidden sm:before:block',
                'sm:[&:nth-child(odd)]:before:hidden lg:[&:nth-child(odd)]:before:block lg:[&:nth-child(5n+1)]:before:hidden',
                'sm:pl-7 lg:pl-6 sm:[&:nth-child(odd)]:pl-0 lg:[&:nth-child(odd)]:pl-6 lg:[&:nth-child(5n+1)]:pl-0',
              ].join(' ')}
            >
              <span
                className="absolute top-0 left-0 h-px w-0 bg-brass-light transition-[width] duration-500 ease-out group-hover:w-full"
                aria-hidden="true"
              />
              <span className="font-mono text-[10px] text-brass-light">{item.n}</span>
              <h3 className="mt-5 font-display text-xl leading-snug tracking-[-0.015em] text-paper">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">{item.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
