import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, FileCheck2 } from 'lucide-react';

export default function Features() {
  return (
    <section className="py-24 px-6 md:px-12 bg-slate-50 dark:bg-slate-900 relative overflow-hidden" id="facultades">
      <div className="max-w-7xl mx-auto">
        <div className="text-left md:text-center mb-20 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-usm-blue dark:text-blue-300 text-xs font-bold uppercase tracking-widest mb-4 border border-blue-200 dark:border-blue-800"
          >
            Acerca de la Plataforma
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-usm-blue dark:text-white leading-tight mb-6"
          >
            Un espacio académico<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-usm-blue to-usm-blue-bright">
              claro, útil y conectado.
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Diseñado para consultar tesis, revisar eventos y compartir contenido académico de forma simple.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <BookOpen className="w-8 h-8 text-usm-blue-bright" />,
              title: 'Repositorio de Tesis',
              description: 'Consulta trabajos de grado con filtros por facultad, tipo y fecha.'
            },
            {
              icon: <Calendar className="w-8 h-8 text-usm-blue-bright" />,
              title: 'Eventos Oficiales',
              description: 'Visualiza actos y actividades académicas con su información clave.'
            },
            {
              icon: <Users className="w-8 h-8 text-usm-blue-bright" />,
              title: 'Comunidad Académica',
              description: 'Espacio para interacción entre estudiantes y profesores.'
            },
            {
              icon: <FileCheck2 className="w-8 h-8 text-usm-blue-bright" />,
              title: 'Publicaciones Organizadas',
              description: 'Contenido presentado en tarjetas legibles y consistente para explorar.'
            }
          ].map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl p-7 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-usm-blue dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
