import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  Shield,
  MapPin,
  Mail,
  Calendar,
  BookOpen,
  Bookmark,
  Edit3,
  ExternalLink,
  Star,
  ChevronRight,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useContentContext } from "../context/ContentContext";

const FACULTY_COLORS = {
  Ingenieria: { bg: "bg-orange-100 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
  FACES: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-600 dark:text-green-300", border: "border-green-200 dark:border-green-800" },
  Derecho: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-600 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  Odontologia: { bg: "bg-purple-100 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  Farmacia: { bg: "bg-sky-100 dark:bg-sky-900/20", text: "text-sky-600 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800" },
};

const TYPE_COLORS = {
  Tesis: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Articulo: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Evento: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Resumen: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

function getTypeColor(type) {
  return TYPE_COLORS[type] || "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
}

function getFacultyStyle(faculty) {
  const key = faculty ? faculty.replace(/[íá]/g, (c) => ({ í: "i", á: "a" }[c])) : "";
  return FACULTY_COLORS[key] || { bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-300", border: "border-slate-200 dark:border-slate-600" };
}

function Avatar({ name, size = "lg" }) {
  const initials = name
    ? name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "U";
  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-violet-500 to-purple-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
  ];
  const idx = (name?.charCodeAt(0) ?? 0) % gradients.length;
  const sz = size === "lg" ? "w-24 h-24 text-3xl" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${gradients[idx]} text-white flex items-center justify-center font-bold shrink-0 ring-4 ring-white dark:ring-slate-800`}>
      {initials}
    </div>
  );
}

function SavedCard({ item }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:border-usm-blue/40 dark:hover:border-blue-500/40 hover:shadow-lg hover:shadow-usm-blue/5 transition-all cursor-pointer"
    >
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest mb-3 ${getTypeColor(item.type)}`}>
        {item.type}
      </span>
      <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug mb-2 line-clamp-2 group-hover:text-usm-blue transition-colors">
        {item.title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
        {item.excerpt}
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <BookOpen className="w-3 h-3" /> {item.faculty}
        </span>
        <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{item.author}</span>
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center">
        <Icon className="w-8 h-8" />
      </div>
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}

function InfoBlock({ label, value, link = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
      <span className="text-xs text-slate-400 font-medium shrink-0">{label}</span>
      {link ? (
        <a href={`mailto:${value}`} className="text-xs text-usm-blue dark:text-blue-400 hover:underline flex items-center gap-1 text-right">
          {value} <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      ) : (
        <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold text-right">{value}</span>
      )}
    </div>
  );
}

const TABS = [
  { key: "guardados", label: "Guardados", icon: Bookmark },
  { key: "sobre", label: "Sobre mi", icon: Star },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { allContent, savedIds } = useContentContext();
  const [activeTab, setActiveTab] = useState("guardados");

  const savedContent = allContent.filter((i) => savedIds.includes(i.id));
  const facultyStyle = getFacultyStyle(user?.faculty);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/80">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-slate-800 dark:text-white text-sm">Mi Perfil</span>
          </div>
          <button onClick={() => navigate("/configuracion")} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row gap-6 items-start">

        {/* LEFT sidebar - sticky */}
        <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-20">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

            {/* Cover + Avatar block */}
            <div className="relative">
              {/* Banner */}
              <div className="h-28 bg-gradient-to-br from-[#1a56db] via-blue-500 to-violet-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%)" }}
                />
              </div>
              {/* Avatar over banner */}
              <div className="absolute left-5 bottom-0 translate-y-1/2">
                <Avatar name={user?.name} size="lg" />
              </div>
              {/* Edit button top right */}
              <button className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/20">
                <Edit3 className="w-3.5 h-3.5" /> Editar
              </button>
            </div>

            {/* Space for avatar overflow */}
            <div className="h-14" />

            {/* Info */}
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{user?.name || "Usuario"}</h2>
                {user?.role === "admin" ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-usm-blue/10 text-usm-blue dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-[10px] font-bold">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-[10px] font-bold">
                    <GraduationCap className="w-3 h-3" /> Estudiante
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-5">@{user?.email?.split("@")[0] || "usuario"}</p>

              {/* Meta list */}
              <div className="space-y-2.5 mb-5">
                {user?.faculty && (
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${facultyStyle.bg} ${facultyStyle.text} ${facultyStyle.border}`}>
                    <BookOpen className="w-3.5 h-3.5" /> {user.faculty}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{user?.email || "usuario@usm.edu.ve"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" /> Caracas, Venezuela
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" /> Miembro desde Feb 2026
                </div>
              </div>

              {/* Saved count chip */}
              <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                  <Bookmark className="w-4.5 h-4.5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-amber-500 leading-none">{savedIds.length}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Contenidos guardados</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT - main content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-700 px-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-colors ${
                      active ? "text-usm-blue dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {active && (
                      <motion.div layoutId="tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-usm-blue rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">

                {/* GUARDADOS */}
                {activeTab === "guardados" && (
                  <motion.div key="g" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    {savedContent.length === 0 ? (
                      <EmptyState icon={Bookmark} text="Aun no has guardado contenido." />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {savedContent.map((item) => <SavedCard key={item.id} item={item} />)}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* SOBRE MI */}
                {activeTab === "sobre" && (
                  <motion.div key="s" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                  >
                    {/* Academica */}
                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5" /> Informacion Academica
                      </h4>
                      <InfoBlock label="Facultad" value={user?.faculty || "Ingenieria"} />
                      <InfoBlock label="Rol" value={user?.role === "admin" ? "Administrador" : "Estudiante de pregrado"} />
                      <InfoBlock label="Universidad" value="Univ. Santa Maria (USM)" />
                      <InfoBlock label="Ingreso" value="2022" />
                    </div>

                    {/* Contacto */}
                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" /> Contacto
                      </h4>
                      <InfoBlock label="Correo" value={user?.email || "usuario@usm.edu.ve"} link />
                      <InfoBlock label="Ubicacion" value="Caracas, Venezuela" />
                    </div>

                    {/* Intereses */}
                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" /> Intereses Academicos
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {["Desarrollo Web", "Inteligencia Artificial", "Bases de Datos", "UX/UI", "Ciencias de Datos"].map((tag) => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actividad */}
                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Star className="w-3.5 h-3.5" /> Actividad Reciente
                      </h4>
                      {[
                        { text: "Guardo el articulo de IA y salud mental", time: "Hace 3 dias" },
                        { text: "Exploro la seccion de Tesis de Ingenieria", time: "Hace 1 semana" },
                        { text: "Se unio a USM RED", time: "Feb 2026" },
                      ].map((a, i) => (
                        <div key={i} className="flex items-start gap-3 py-2.5 border-b border-slate-200/60 dark:border-slate-700/60 last:border-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-usm-blue mt-1.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{a.text}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{a.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
