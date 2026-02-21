import { motion } from 'framer-motion';
import { useContent } from '../../hooks/useContent';
import Card from '../ui/Card';
import { Calendar as CalendarIcon, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRef } from 'react';
import Button from '../ui/Button';

export default function EventsCarousel() {
  const { events } = useContent();
  const containerRef = useRef(null);

  const scroll = (direction) => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth } = containerRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      containerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-8 bg-white dark:bg-slate-900 overflow-hidden" id="investigación">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-usm-blue dark:text-white mb-4">Próximos Actos</h2>
            <div className="w-20 h-1.5 bg-usm-blue-bright rounded-full" />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-3 rounded-full border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-usm-blue dark:text-white" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-full border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-usm-blue dark:text-white" />
            </button>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {events.map((event) => (
            <motion.div 
              key={event.id}
              className="min-w-[260px] sm:min-w-[300px] md:min-w-[400px] snap-start"
            >
              <Card className="h-full flex flex-col p-0 overflow-hidden group">
                <div className="h-48 bg-usm-blue relative overflow-hidden">
                  <div className="absolute top-4 left-4 bg-white/90 text-usm-blue font-bold px-3 py-1 rounded-md text-sm z-10">
                    {event.school}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-usm-blue-bright/40 to-usm-blue" />
                  <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:26px_26px]" />
                </div>
                <div className="p-6 flex-grow">
                  <div className="flex items-center gap-2 text-usm-blue-bright dark:text-blue-300 mb-3 font-semibold text-sm">
                    <CalendarIcon className="w-4 h-4" />
                    {event.date}
                  </div>
                  <h3 className="text-xl font-bold text-usm-blue dark:text-white mb-4 line-clamp-2">{event.title}</h3>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm mb-6">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                </div>
                <div className="p-6 pt-0 mt-auto">
                  <Button variant="ghost" className="w-full justify-between group/btn">
                    Ver Detalles
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
