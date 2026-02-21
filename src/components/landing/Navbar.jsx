import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Button from '../ui/Button';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Plataforma', href: '#facultades' },
  { label: 'Software', href: '#software' },
  { label: 'Eventos', href: '#investigación' },
  { label: 'Nosotros', href: '#nosotros' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  const navVariants = {
    top: { backgroundColor: "rgba(0, 40, 85, 0.42)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.12)" },
    scrolled: { backgroundColor: "rgba(0, 40, 85, 0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.12)" }
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="top"
      animate={scrolled ? "scrolled" : "top"}
      transition={{ duration: 0.3 }}
      className="fixed top-0 w-full z-50 py-3 sm:py-4 px-4 sm:px-6 md:px-12 flex justify-between items-center transition-colors"
    >
      <div className="flex items-center gap-3 z-50">
        <img
          src="/src/assets/usm_logo.png"
          alt="USM Logo"
          className="h-8 sm:h-12 transition-all duration-300 brightness-0 invert"
        />
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-8 items-center font-medium text-white/90">
        {navLinks.map((item) => (
          <a key={item.label} href={item.href} className="hover:text-blue-200 transition-colors text-sm uppercase tracking-wide">
            {item.label}
          </a>
        ))}
        <Link to="/login">
          <Button
            variant="outline"
            className="py-2.5 px-6 text-sm font-bold tracking-wider border-white/40 text-white hover:bg-white hover:text-usm-blue hover:border-white"
          >
            INGRESAR AL CAMPUS
          </Button>
        </Link>
      </div>

      {/* Mobile Toggle */}
      <button
        className="md:hidden z-50 p-2 rounded-lg text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-0 bg-usm-blue z-40 md:hidden flex flex-col justify-center items-center gap-8 text-white"
      >
        {navLinks.map((item) => (
          <a key={item.label} href={item.href} className="text-2xl font-bold hover:text-blue-200" onClick={() => setIsOpen(false)}>
            {item.label}
          </a>
        ))}
        <Link to="/login" onClick={() => setIsOpen(false)}>
          <Button className="mt-4 text-xl px-12 py-4">
            Ingresar
          </Button>
        </Link>
      </motion.div>
    </motion.nav>
  );
}
