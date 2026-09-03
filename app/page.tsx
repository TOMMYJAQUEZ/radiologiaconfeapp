import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-white font-sans selection:bg-brand-accent selection:text-brand-dark">
      {/* HEADER */}
      <header className="absolute top-0 w-full z-50 px-6 py-5 flex justify-between items-center bg-brand-dark/40 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="Radiología con Fe"
            width={280}
            height={90}
            className="h-16 md:h-20 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_22px_rgba(245,158,11,0.6)] group-hover:drop-shadow-[0_0_35px_rgba(245,158,11,0.95)]"
            priority
          />
        </Link>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">Iniciar sesión</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-brand-accent text-brand-dark hover:bg-brand-accent-light shadow-[0_0_15px_rgba(242,196,0,0.3)]">
              Crear cuenta
            </Button>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col relative w-full pt-28 pb-12">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero-radiology-pro.jpg" 
            alt="Especialista en Radiología con Tomografías y Resonancias" 
            fill 
            className="object-cover object-center opacity-80"
            priority
          />
          {/* Gradient left: dark para texto legible con estilo cinematográfico */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-brand-dark/20" />
          {/* Gradient bottom: fade to dark */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 flex flex-col justify-center flex-1 h-full min-h-[70vh]">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-sm font-bold tracking-widest mb-6 uppercase shadow-[0_0_20px_rgba(242,196,0,0.15)]">
              Plataforma Educativa de Excelencia
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
              Domina la <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-accent-light">Radiología</span> <br/>
              con confianza.
            </h1>
            <p className="text-brand-muted text-lg md:text-xl mb-10 max-w-xl leading-relaxed font-light">
              Entrena tus habilidades clínicas, evalúa tus conocimientos en tiempo real y obtén certificados avalados por especialistas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-brand-accent text-brand-dark hover:bg-brand-accent-light shadow-[0_0_30px_rgba(242,196,0,0.4)] transition-all hover:scale-105">
                  Comienza Gratis Hoy
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all">
                  Ver Evaluaciones
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Evaluación Inteligente</h3>
              <p className="text-brand-muted leading-relaxed">
                Recibe retroalimentación inmediata, analiza tus errores y refuerza tu aprendizaje con explicaciones detalladas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Historial y Métricas</h3>
              <p className="text-brand-muted leading-relaxed">
                Monitorea tu crecimiento, consulta tu tasa de aprobación y mide tu preparación para el campo laboral.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Certificación Digital</h3>
              <p className="text-brand-muted leading-relaxed">
                Obtén diplomas oficiales generados automáticamente y protegidos con código QR al aprobar tus cursos.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full border-t border-white/10 bg-brand-dark/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-6 py-8 px-6">
          <div className="flex items-center gap-5">
            <Image 
              src="/logo.png" 
              alt="Radiología con Fe Logo Oficial" 
              width={260} 
              height={80} 
              className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_22px_rgba(245,158,11,0.55)] transition-transform hover:scale-105" 
            />
            <span className="hidden sm:inline text-xs text-brand-muted border-l border-white/10 pl-4">
              Plataforma Educativa de Formación Radiológica
            </span>
          </div>
          <span className="text-brand-muted text-xs font-medium">© 2026 Radiología con Fe. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
