import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="relative bg-slate-800 dark:bg-slate-900 text-slate-400">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-usm-yellow/30 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
                    {/* Brand */}
                    <div className="max-w-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src="/src/assets/usm_logo.png"
                                alt="USM Logo"
                                className="h-8 sm:h-9 brightness-0 invert opacity-70"
                            />
                            <span className="text-lg font-bold text-white tracking-tight">USM Red</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Plataforma académica para consultar tesis, artículos de investigación y eventos de la Universidad Santa María.
                        </p>
                    </div>

                    {/* Quick links */}
                    <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
                        <div>
                            <h4 className="text-white text-sm font-semibold mb-4">Plataforma</h4>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link to="/dashboard" className="hover:text-white transition-colors">Explorar</Link></li>
                                <li><a href="#facultades" className="hover:text-white transition-colors">Repositorio</a></li>
                                <li><a href="#investigación" className="hover:text-white transition-colors">Eventos</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white text-sm font-semibold mb-4">Acceso</h4>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link to="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link></li>
                                <li><Link to="/registro" className="hover:text-white transition-colors">Crear Cuenta</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="h-px bg-slate-800 mb-6" />
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} Universidad Santa María — USM Red</p>
                    <p>Proyecto académico · Servicio Comunitario</p>
                </div>
            </div>
        </footer>
    );
}
