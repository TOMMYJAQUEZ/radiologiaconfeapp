'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Compass, Target, Award, RefreshCw, CheckCircle2, XCircle,
  HelpCircle, Eye, EyeOff, Sparkles, Flame, Contrast,
  Layers, Magnet, Activity, Radio, Filter, ZoomIn, ZoomOut,
  RotateCcw, Sliders, Sun, ShieldAlert, FileText, Check
} from 'lucide-react'
import {
  ANATOMY_STUDIES,
  MODALITY_CATEGORIES,
  type AnatomyStudy,
  type AnatomicalStructure,
  type ModalityCategory
} from '@/lib/anatomyData'

export default function AnatomyLab() {
  const [selectedCategory, setSelectedCategory] = useState<ModalityCategory>('TODAS')
  const [selectedStudyId, setSelectedStudyId] = useState<string>(ANATOMY_STUDIES[0].id)
  const [activeMode, setActiveMode] = useState<'explore' | 'challenge'>('explore')
  const [viewSource, setViewSource] = useState<'real' | 'vector'>('real')
  const [selectedStructure, setSelectedStructure] = useState<AnatomicalStructure | null>(null)
  const [hoveredStructure, setHoveredStructure] = useState<AnatomicalStructure | null>(null)
  const [showLabels, setShowLabels] = useState(true)
  
  // Controles PACS / Negatoscopio
  const [invertedXray, setInvertedXray] = useState(false)
  const [brightness, setBrightness] = useState(100) // %
  const [contrast, setContrast] = useState(100) // %
  const [zoomLevel, setZoomLevel] = useState(1) // 1x, 1.25x, 1.5x, 2x
  const [boneSharpen, setBoneSharpen] = useState(false)

  // Desafío / Challenge State
  const [targetStructure, setTargetStructure] = useState<AnatomicalStructure | null>(null)
  const [challengeStatus, setChallengeStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [clickedCoords, setClickedCoords] = useState<{ x: number; y: number } | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [attemptsTotal, setAttemptsTotal] = useState(0)
  const [correctTotal, setCorrectTotal] = useState(0)
  const [feedbackMessage, setFeedbackMessage] = useState<string>('')
  const [imageError, setImageError] = useState(false)

  const viewerRef = useRef<HTMLDivElement>(null)

  // Filtrar estudios por categoría seleccionada
  const filteredStudies = ANATOMY_STUDIES.filter(
    s => selectedCategory === 'TODAS' || s.category === selectedCategory
  )

  // Estudio actual
  const currentStudy =
    ANATOMY_STUDIES.find(s => s.id === selectedStudyId) || filteredStudies[0] || ANATOMY_STUDIES[0]

  // Si cambiamos de categoría y el estudio actual no pertenece a ella, seleccionar el primero de la lista filtrada
  useEffect(() => {
    if (selectedCategory !== 'TODAS' && currentStudy.category !== selectedCategory) {
      if (filteredStudies.length > 0) {
        setSelectedStudyId(filteredStudies[0].id)
      }
    }
  }, [selectedCategory])

  // Inicializar o cambiar de estudio
  useEffect(() => {
    setSelectedStructure(null)
    setHoveredStructure(null)
    setChallengeStatus('idle')
    setClickedCoords(null)
    setImageError(false)
    resetPacsControls()
    if (activeMode === 'challenge') {
      startNewChallenge(currentStudy)
    }
  }, [selectedStudyId, activeMode])

  const resetPacsControls = () => {
    setInvertedXray(false)
    setBrightness(100)
    setContrast(100)
    setZoomLevel(1)
    setBoneSharpen(false)
  }

  const startNewChallenge = (study: AnatomyStudy) => {
    if (!study.structures || study.structures.length === 0) return
    const randomIndex = Math.floor(Math.random() * study.structures.length)
    const target = study.structures[randomIndex]
    setTargetStructure(target)
    setChallengeStatus('idle')
    setClickedCoords(null)
    setFeedbackMessage(`Localiza y haz clic en: ${target.name}`)
  }

  // Manejador de clics en la radiografía
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = ((e.clientX - rect.left) / rect.width) * 100
    const clickY = ((e.clientY - rect.top) / rect.height) * 100

    setClickedCoords({ x: clickX, y: clickY })

    if (activeMode === 'challenge' && targetStructure) {
      const distance = Math.sqrt(
        Math.pow(clickX - targetStructure.x, 2) + Math.pow(clickY - targetStructure.y, 2)
      )

      setAttemptsTotal(prev => prev + 1)

      // Margen de tolerancia anatómica
      if (distance <= 12) {
        setChallengeStatus('correct')
        setScore(prev => prev + 100 + streak * 25)
        setStreak(prev => prev + 1)
        setCorrectTotal(prev => prev + 1)
        setSelectedStructure(targetStructure)
        setFeedbackMessage(`¡Identificación exacta! Has localizado: ${targetStructure.name}`)
      } else {
        setChallengeStatus('wrong')
        setStreak(0)
        setSelectedStructure(targetStructure)
        setFeedbackMessage(
          `Ubicación incorrecta. ${targetStructure.name} se encuentra señalada con el indicador dorado pulsante.`
        )
      }
    }
  }

  // Clic directo en un pin
  const handlePinClick = (struct: AnatomicalStructure, e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeMode === 'explore') {
      setSelectedStructure(struct)
    } else if (activeMode === 'challenge' && targetStructure) {
      setClickedCoords({ x: struct.x, y: struct.y })
      setAttemptsTotal(prev => prev + 1)

      if (struct.id === targetStructure.id) {
        setChallengeStatus('correct')
        setScore(prev => prev + 100 + streak * 25)
        setStreak(prev => prev + 1)
        setCorrectTotal(prev => prev + 1)
        setSelectedStructure(struct)
        setFeedbackMessage(`¡Excelente! Has identificado correctamente: ${struct.name}`)
      } else {
        setChallengeStatus('wrong')
        setStreak(0)
        setSelectedStructure(targetStructure)
        setFeedbackMessage(
          `Esa estructura es ${struct.name}. La solicitada (${targetStructure.name}) está resaltada en dorado.`
        )
      }
    }
  }

  const getCategoryBadgeColor = (cat: ModalityCategory) => {
    switch (cat) {
      case 'RAYOS_X':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'CT':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'IRM':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'ULTRASONIDO':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      default:
        return 'bg-brand-accent/20 text-brand-accent border-brand-accent/30'
    }
  }

  // Generación de filtros CSS combinados para el visor radiológico PACS
  const getFilterStyle = () => {
    let filter = `brightness(${brightness}%) contrast(${contrast}%)`
    if (invertedXray) {
      filter += ' invert(100%)'
    }
    if (boneSharpen) {
      filter += ' contrast(135%) brightness(105%)'
    }
    return filter
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-brand-dark border border-brand-border p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-accent/20 text-brand-accent flex items-center gap-1.5">
              <Sparkles size={14} /> Laboratorio de Imagenología & Anatomía Diagnóstica
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Imágenes Clínicas Reales (PACS/DICOM)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Estación de Trabajo Radiológica & Simulador Anatómico
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            Estudia sobre estudios reales de <strong>Rayos X, Tomografía Computarizada (CT), Resonancia Magnética (IRM) y Ecografía (US)</strong>.
          </p>
        </div>

        {/* Mode Selector & View Source */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-[#14171c] p-1.5 rounded-xl border border-brand-border">
            <button
              onClick={() => setActiveMode('explore')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${activeMode === 'explore'
                ? 'bg-brand-accent text-brand-dark shadow-[0_0_15px_rgba(242,196,0,0.3)]'
                : 'text-brand-muted hover:text-white'
                }`}
            >
              <Compass size={15} /> Modo Explorador
            </button>
            <button
              onClick={() => setActiveMode('challenge')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${activeMode === 'challenge'
                ? 'bg-brand-accent text-brand-dark shadow-[0_0_15px_rgba(242,196,0,0.3)]'
                : 'text-brand-muted hover:text-white'
                }`}
            >
              <Target size={15} /> Modo Desafío
            </button>
          </div>
        </div>
      </div>

      {/* ─── FILTRO DE CATEGORÍAS / MODALIDADES ───────────────────────────── */}
      <div className="bg-brand-dark border border-brand-border rounded-2xl p-3 flex flex-wrap items-center gap-2 shadow-md">
        <span className="text-xs font-bold text-brand-muted px-2 flex items-center gap-1">
          <Filter size={14} /> Modalidades:
        </span>
        {MODALITY_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key
          const count =
            cat.key === 'TODAS'
              ? ANATOMY_STUDIES.length
              : ANATOMY_STUDIES.filter(s => s.category === cat.key).length

          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isSelected
                ? 'bg-brand-accent text-brand-dark shadow-[0_0_15px_rgba(242,196,0,0.3)] scale-105'
                : 'bg-[#16191e] border border-brand-border text-brand-muted hover:text-white hover:border-brand-muted'
                }`}
            >
              {cat.key === 'TODAS' && <Sparkles size={14} />}
              {cat.key === 'RAYOS_X' && <Radio size={14} />}
              {cat.key === 'CT' && <Layers size={14} />}
              {cat.key === 'IRM' && <Magnet size={14} />}
              {cat.key === 'ULTRASONIDO' && <Activity size={14} />}
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-brand-dark text-brand-accent' : 'bg-[#111214] text-brand-muted'
                }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── SELECTOR DE ESTUDIOS FILTRADOS ───────────────────────────────── */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {filteredStudies.map((study, idx) => {
          const isSelected = currentStudy.id === study.id
          return (
            <button
              key={study.id}
              onClick={() => setSelectedStudyId(study.id)}
              className={`px-4 py-3 rounded-xl border text-left shrink-0 transition-all flex items-center gap-3 ${isSelected
                ? 'bg-brand-accent/15 border-brand-accent text-white shadow-[0_0_15px_rgba(242,196,0,0.2)]'
                : 'bg-brand-dark border-brand-border text-brand-muted hover:text-white hover:border-brand-muted'
                }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-brand-accent text-brand-dark' : 'bg-[#1a1d21] text-brand-muted'
                }`}>
                {idx + 1}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">{study.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold border ${getCategoryBadgeColor(study.category)}`}>
                    {study.modality}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Main Workspace (Grid 12 cols: 8 cols Negatoscopio, 4 cols Panel de Información) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Visor Radiológico Negatoscopio (8 cols) */}
        <div className="lg:col-span-8 bg-[#0a0c10] border-2 border-brand-border rounded-3xl p-4 sm:p-6 flex flex-col shadow-2xl relative">
          
          {/* Barra de herramientas superior del Negatoscopio PACS */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-brand-border/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-bold text-white tracking-wide uppercase">{currentStudy.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeColor(currentStudy.category)}`}>
                {currentStudy.modality}
              </span>
            </div>

            {/* Alternador de Vista (Real PACS vs Esquema Vectorial) */}
            <div className="flex items-center gap-1 bg-[#14171c] p-1 rounded-lg border border-brand-border">
              <button
                onClick={() => setViewSource('real')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${viewSource === 'real' ? 'bg-brand-accent text-brand-dark' : 'text-brand-muted hover:text-white'}`}
              >
                Imagen Real
              </button>
              <button
                onClick={() => setViewSource('vector')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${viewSource === 'vector' ? 'bg-brand-accent text-brand-dark' : 'text-brand-muted hover:text-white'}`}
              >
                Esquema
              </button>
            </div>
          </div>

          {/* Barra de Controles PACS de Calidad Radiológica */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-[#111317] p-2.5 rounded-xl border border-brand-border/70 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Invertir escala de grises */}
              <button
                onClick={() => setInvertedXray(!invertedXray)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${invertedXray ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'bg-[#1a1d24] border-brand-border text-white hover:bg-brand-gray'
                  }`}
                title="Invertir Escala de Grises (Luz Blanca / Luz Negra)"
              >
                <Contrast size={14} />
                <span className="hidden sm:inline">Invertir LUT</span>
              </button>

              {/* Realce Óseo / Filtro de Nitidez */}
              <button
                onClick={() => setBoneSharpen(!boneSharpen)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${boneSharpen ? 'bg-brand-accent/20 border-brand-accent text-brand-accent' : 'bg-[#1a1d24] border-brand-border text-brand-muted hover:text-white'}`}
                title="Filtro de Realce de Bordes y Contraste Óseo"
              >
                <Sliders size={14} />
                <span className="hidden sm:inline">Realce Óseo</span>
              </button>

              {/* Brillo / Window Level */}
              <div className="flex items-center gap-1.5 bg-[#16191f] px-2.5 py-1 rounded-lg border border-brand-border">
                <Sun size={13} className="text-brand-muted" />
                <span className="text-[10px] text-brand-muted font-bold">W/L:</span>
                <input
                  type="range"
                  min="60"
                  max="160"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-16 sm:w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                />
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-[#16191f] p-0.5 rounded-lg border border-brand-border">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.25))}
                  className="p-1 text-brand-muted hover:text-white transition-colors"
                  title="Reducir Zoom"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-[11px] font-mono font-bold px-1 text-white">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}
                  className="p-1 text-brand-muted hover:text-white transition-colors"
                  title="Aumentar Zoom"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Alternar Pines */}
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${showLabels ? 'bg-brand-accent/20 border-brand-accent text-brand-accent' : 'bg-[#1a1d24] border-brand-border text-brand-muted'
                  }`}
                title="Mostrar/Ocultar Pines Anatómicos"
              >
                {showLabels ? <Eye size={14} /> : <EyeOff size={14} />}
                <span className="hidden sm:inline">Pines</span>
              </button>

              {/* Reset PACS */}
              <button
                onClick={resetPacsControls}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-brand-border bg-[#1a1d24] text-brand-muted hover:text-white transition-colors flex items-center gap-1 text-xs"
                title="Restablecer Parámetros PACS"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Banner de Instrucción del Modo Desafío */}
          {activeMode === 'challenge' && (
            <div className={`p-4 rounded-2xl mb-4 border transition-all flex items-center justify-between gap-4 ${challengeStatus === 'correct'
              ? 'bg-green-500/15 border-green-500/60 text-green-300'
              : challengeStatus === 'wrong'
                ? 'bg-red-500/15 border-red-500/60 text-red-300'
                : 'bg-brand-accent/15 border-brand-accent/40 text-brand-accent'
              }`}>
              <div className="flex items-center gap-3">
                {challengeStatus === 'correct' ? (
                  <CheckCircle2 size={24} className="text-green-400 shrink-0" />
                ) : challengeStatus === 'wrong' ? (
                  <XCircle size={24} className="text-red-400 shrink-0 animate-bounce" />
                ) : (
                  <Target size={24} className="text-brand-accent shrink-0 animate-pulse" />
                )}
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold opacity-80">Misión Anatómica ({currentStudy.modality})</p>
                  <p className="text-sm sm:text-base font-extrabold text-white">{feedbackMessage}</p>
                </div>
              </div>

              <button
                onClick={() => startNewChallenge(currentStudy)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
              >
                <RefreshCw size={14} /> Siguiente
              </button>
            </div>
          )}

          {/* ÁREA DE VISUALIZACIÓN RADIOLÓGICA (Canvas / Negatoscopio con Imagen Real) */}
          <div
            ref={viewerRef}
            onClick={handleBoardClick}
            className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-crosshair select-none border border-brand-border/80 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] transition-all bg-[#040608]`}
          >
            {/* Contenedor de la Imagen Médica Real con Zoom y Filtros PACS */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel})`,
                filter: getFilterStyle()
              }}
            >
              {viewSource === 'real' && currentStudy.imageUrl && !imageError ? (
                <img
                  src={currentStudy.imageUrl}
                  alt={currentStudy.title}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-contain pointer-events-none select-none transition-all duration-150"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <RadiologySvgGraphic studyType={currentStudy.svgGraphic} />
                </div>
              )}
            </div>

            {/* Cuadrícula médica de fondo (estilo visor radiológico PACS) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Marcadores / Pines Anatómicos de Alta Precisión */}
            {showLabels && currentStudy.structures.map((struct) => {
              const isSelected = selectedStructure?.id === struct.id
              const isTarget = activeMode === 'challenge' && targetStructure?.id === struct.id && challengeStatus === 'wrong'
              const isCorrectTarget = activeMode === 'challenge' && targetStructure?.id === struct.id && challengeStatus === 'correct'

              return (
                <div
                  key={struct.id}
                  style={{ left: `${struct.x}%`, top: `${struct.y}%` }}
                  onClick={(e) => handlePinClick(struct, e)}
                  onMouseEnter={() => setHoveredStructure(struct)}
                  onMouseLeave={() => setHoveredStructure(null)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                >
                  {/* Pin Animado */}
                  <div className="relative flex items-center justify-center">
                    {/* Anillo de pulso exterior */}
                    <span className={`absolute w-8 h-8 rounded-full animate-ping opacity-75 ${isCorrectTarget
                      ? 'bg-green-400'
                      : isTarget
                        ? 'bg-brand-accent'
                        : isSelected
                          ? 'bg-brand-accent'
                          : 'bg-brand-accent/40'
                      }`} />

                    {/* Botón central del pin */}
                    <button
                      className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${isCorrectTarget
                        ? 'bg-green-500 border-white text-white shadow-[0_0_20px_#22c55e]'
                        : isTarget
                          ? 'bg-brand-accent border-white text-brand-dark shadow-[0_0_20px_#f2c400]'
                          : isSelected
                            ? 'bg-brand-accent border-white text-brand-dark shadow-[0_0_15px_#f2c400]'
                            : 'bg-[#111214] border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-dark'
                        }`}
                    >
                      <span className="text-[10px] font-black">{struct.shortName.charAt(0)}</span>
                    </button>
                  </div>

                  {/* Tooltip flotante inteligente al hacer hover — solo en Modo Exploración */}
                  {activeMode === 'explore' && (
                  <div
                    className={`absolute hidden group-hover:block z-30 pointer-events-none ${
                      struct.y < 22 ? 'top-full mt-2' : 'bottom-full mb-2'
                    } ${
                      struct.x < 20
                        ? 'left-0 translate-x-0'
                        : struct.x > 80
                          ? 'right-0 left-auto translate-x-0'
                          : 'left-1/2 -translate-x-1/2'
                    }`}
                  >
                    <div className="bg-[#0b1329]/95 backdrop-blur-md border border-brand-accent text-white text-xs px-3.5 py-2 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] whitespace-nowrap font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-accent shrink-0 animate-pulse" />
                      <span>{struct.name}</span>
                    </div>
                  </div>
                  )}
                </div>
              )
            })}

            {/* Animación de Onda expansiva donde hizo clic el usuario */}
            {clickedCoords && challengeStatus === 'correct' && (
              <div
                style={{ left: `${clickedCoords.x}%`, top: `${clickedCoords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
              >
                <span className="absolute w-20 h-20 -left-10 -top-10 rounded-full bg-green-500/40 animate-ping" />
                <span className="w-6 h-6 rounded-full bg-green-400 border-2 border-white flex items-center justify-center text-black font-bold shadow-[0_0_25px_#22c55e]">
                  ✓
                </span>
              </div>
            )}

            {clickedCoords && challengeStatus === 'wrong' && (
              <div
                style={{ left: `${clickedCoords.x}%`, top: `${clickedCoords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-shake"
              >
                <span className="absolute w-16 h-16 -left-8 -top-8 rounded-full bg-red-500/40 animate-ping" />
                <span className="w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white font-bold shadow-[0_0_25px_#ef4444]">
                  ✕
                </span>
              </div>
            )}

            {/* Watermark DICOM en esquina superior */}
            <div className="absolute top-3 left-3 pointer-events-none bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] text-gray-300 font-mono border border-white/10 flex flex-col">
              <span className="text-brand-accent font-bold">IMAGEN CLÍNICA REAL</span>
              <span>FOV: 100% | LUT: {invertedXray ? 'INVERT' : 'STANDARD'}</span>
            </div>
          </div>

          {/* Pie de controles del Negatoscopio */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-brand-border/60 text-xs text-brand-muted">
            <div className="flex items-center gap-4">
              <span>Modalidad: <strong className="text-white">{currentStudy.modality}</strong></span>
              <span>Proyección: <strong className="text-white">{currentStudy.projection}</strong></span>
            </div>
            <div className="text-[11px] italic">
              💡 {activeMode === 'explore' ? 'Haz clic en cualquier pin para ver su análisis radiológico' : 'Haz clic sobre la estructura solicitada para sumar puntos'}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Panel de Diagnóstico e Información Anatómica (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card de Marcador y Estadísticas (Modo Desafío) */}
          {activeMode === 'challenge' && (
            <div className="bg-brand-dark border border-brand-border rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="text-brand-accent" size={18} />
                Puntaje del Desafío
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#16191e] border border-brand-border rounded-xl">
                  <p className="text-xs text-brand-muted">Puntaje Total</p>
                  <p className="text-2xl font-black text-brand-accent">{score} pts</p>
                </div>
                <div className="p-3 bg-[#16191e] border border-brand-border rounded-xl">
                  <p className="text-xs text-brand-muted flex items-center gap-1">
                    <Flame size={14} className="text-orange-400" /> Racha
                  </p>
                  <p className="text-2xl font-black text-orange-400">{streak} seguidos</p>
                </div>
              </div>

              <div className="p-3 bg-[#16191e] border border-brand-border rounded-xl flex items-center justify-between text-xs">
                <span className="text-brand-muted">Precisión Anatómica:</span>
                <span className="font-bold text-white">
                  {attemptsTotal > 0 ? Math.round((correctTotal / attemptsTotal) * 100) : 0}% ({correctTotal}/{attemptsTotal})
                </span>
              </div>
            </div>
          )}

          {/* Ficha de Información Anatómica de la Estructura Seleccionada */}
          <div className="bg-brand-dark border border-brand-border rounded-2xl p-6 space-y-5 shadow-xl">
            {selectedStructure ? (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-brand-border pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-accent/20 text-brand-accent">
                      {selectedStructure.radiologicalDensity}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeColor(currentStudy.category)}`}>
                      {currentStudy.modality}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {selectedStructure.name}
                  </h3>
                  <p className="text-xs text-brand-muted mt-0.5">Estudio: {currentStudy.title}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-brand-accent uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} /> Descripción Anatomo-Radiológica
                  </h4>
                  <p className="text-xs text-brand-white/90 leading-relaxed bg-[#16191e] p-3 rounded-xl border border-brand-border/60">
                    {selectedStructure.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={14} /> Relevancia y Correlación Clínica
                  </h4>
                  <p className="text-xs text-brand-white/90 leading-relaxed bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                    {selectedStructure.clinicalSignificance}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <HelpCircle size={44} className="mx-auto text-brand-muted opacity-30" />
                <h3 className="text-base font-bold text-white">Selecciona una estructura</h3>
                <p className="text-xs text-brand-muted max-w-xs mx-auto">
                  Toca cualquier pin pulsante sobre la imagen médica real para desplegar su análisis radiológico y relevancia diagnóstica.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES GRÁFICOS RADIOLÓGICOS VECTORIALES DE ALTA FIDELIDAD (Modo Comparativo)
// ─────────────────────────────────────────────────────────────────────────────

function RadiologySvgGraphic({ studyType }: { studyType: string }) {
  // 1. Rayos X Tórax
  if (studyType === 'chest') {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full max-h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <defs>
          <radialGradient id="lungGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0c121e" />
            <stop offset="100%" stopColor="#030508" />
          </radialGradient>
          <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        <path d="M 60,60 Q 30,150 70,260 Q 120,250 160,240 Q 130,120 120,60 Z" fill="url(#lungGrad)" stroke="#334155" strokeWidth="1.5" />
        <path d="M 340,60 Q 370,150 330,260 Q 280,250 240,240 Q 270,120 280,60 Z" fill="url(#lungGrad)" stroke="#334155" strokeWidth="1.5" />

        {[80, 110, 140, 170, 200, 230].map((y, i) => (
          <g key={i} stroke="url(#boneGrad)" strokeWidth="4" strokeLinecap="round" opacity="0.6">
            <path d={`M 190,${y - 20} Q 110,${y - 10} 70,${y + 10}`} fill="none" />
            <path d={`M 210,${y - 20} Q 290,${y - 10} 330,${y + 10}`} fill="none" />
          </g>
        ))}

        <rect x="194" y="20" width="12" height="70" rx="3" fill="#030508" stroke="#cbd5e1" strokeWidth="1" opacity="0.8" />
        <path d="M 190,55 Q 120,50 60,60" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" opacity="0.85" fill="none" />
        <path d="M 210,55 Q 280,50 340,60" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" opacity="0.85" fill="none" />
        <path d="M 185,95 Q 165,100 175,120" stroke="#f8fafc" strokeWidth="14" strokeLinecap="round" opacity="0.75" fill="none" />
        <path d="M 175,115 Q 195,120 205,150 Q 245,210 230,235 Q 180,245 155,210 Q 150,150 175,115 Z" fill="#e2e8f0" opacity="0.75" stroke="#cbd5e1" strokeWidth="1.5" />
        <path d="M 50,265 Q 130,220 200,245" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" opacity="0.85" fill="none" />
        <path d="M 200,245 Q 270,230 350,265" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" opacity="0.8" fill="none" />
      </svg>
    )
  }

  // 2. Rayos X Cráneo
  if (studyType === 'skull') {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full max-h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <path d="M 120,240 Q 70,180 80,110 Q 100,30 200,30 Q 300,30 320,110 Q 330,160 290,200 L 260,250 Q 200,260 170,240 Z" fill="#0a0f1d" stroke="#f8fafc" strokeWidth="4" opacity="0.85" />
        <path d="M 195,145 Q 205,160 215,145" stroke="#f8fafc" strokeWidth="3" fill="none" />
        <ellipse cx="270" cy="100" rx="15" ry="20" fill="#020408" stroke="#cbd5e1" strokeWidth="1.5" />
        <polygon points="250,160 280,165 270,195 240,185" fill="#020408" stroke="#cbd5e1" strokeWidth="1.5" />
        <path d="M 210,210 L 260,220 Q 240,260 190,250 L 170,210" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" opacity="0.8" fill="none" />
      </svg>
    )
  }

  // 3. Rayos X Columna Lumbar
  if (studyType === 'spine') {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full max-h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        {[50, 95, 140, 185, 230].map((y, idx) => (
          <g key={idx}>
            <rect x="180" y={y} width="55" height="32" rx="4" fill="#e2e8f0" stroke="#f8fafc" strokeWidth="2" opacity="0.8" />
            <path d={`M 180,${y + 16} L 110,${y + 24}`} stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
          </g>
        ))}
        <polygon points="180,270 235,270 220,298 190,298" fill="#e2e8f0" stroke="#f8fafc" strokeWidth="2" opacity="0.85" />
      </svg>
    )
  }

  // 4. Rayos X Pelvis
  if (studyType === 'pelvis') {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full max-h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <path d="M 80,80 Q 120,40 190,60 Q 160,130 140,150 Q 80,130 80,80 Z" fill="#0f172a" stroke="#f8fafc" strokeWidth="3" opacity="0.8" />
        <path d="M 320,80 Q 280,40 210,60 Q 240,130 260,150 Q 320,130 320,80 Z" fill="#0f172a" stroke="#f8fafc" strokeWidth="3" opacity="0.8" />
        <ellipse cx="160" cy="205" rx="18" ry="14" fill="#030508" stroke="#cbd5e1" strokeWidth="2" />
        <ellipse cx="240" cy="205" rx="18" ry="14" fill="#030508" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="200" y1="195" x2="200" y2="225" stroke="#38bdf8" strokeWidth="3" strokeDasharray="3,3" />
        <circle cx="128" cy="155" r="18" fill="#e2e8f0" stroke="#f8fafc" strokeWidth="2" opacity="0.85" />
        <circle cx="272" cy="155" r="18" fill="#e2e8f0" stroke="#f8fafc" strokeWidth="2" opacity="0.85" />
        <path d="M 120,170 L 95,200 L 90,280" stroke="#f8fafc" strokeWidth="16" strokeLinecap="round" opacity="0.8" fill="none" />
        <path d="M 280,170 L 305,200 L 310,280" stroke="#f8fafc" strokeWidth="16" strokeLinecap="round" opacity="0.8" fill="none" />
      </svg>
    )
  }

  // 5. Rayos X Mano
  if (studyType === 'hand') {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full max-h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <path d="M 170,280 L 175,230" stroke="#f8fafc" strokeWidth="16" strokeLinecap="round" opacity="0.85" />
        <path d="M 225,280 L 220,230" stroke="#f8fafc" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
        <ellipse cx="170" cy="205" rx="10" ry="8" fill="#f8fafc" opacity="0.85" />
        <ellipse cx="195" cy="210" rx="9" ry="8" fill="#f8fafc" opacity="0.85" />
        <ellipse cx="218" cy="208" rx="8" ry="7" fill="#f8fafc" opacity="0.85" />
        {[115, 165, 200, 235, 270].map((x, i) => (
          <g key={i} stroke="#f8fafc" strokeLinecap="round" opacity="0.8">
            <line x1={x} y1={i === 0 ? 190 : 180} x2={x + (i - 2) * 5} y2={i === 0 ? 140 : 120} strokeWidth="8" />
            <line x1={x + (i - 2) * 5} y1={i === 0 ? 135 : 115} x2={x + (i - 2) * 10} y2={i === 0 ? 95 : 70} strokeWidth="6" />
            <line x1={x + (i - 2) * 10} y1={i === 0 ? 90 : 65} x2={x + (i - 2) * 15} y2={i === 0 ? 60 : 30} strokeWidth="5" />
          </g>
        ))}
      </svg>
    )
  }

  // 6. TAC Cerebral Axial
  if (studyType === 'brain_ct') {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full max-h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <ellipse cx="200" cy="150" rx="110" ry="125" fill="#1e293b" stroke="#ffffff" strokeWidth="8" opacity="0.95" />
        <ellipse cx="200" cy="150" rx="102" ry="117" fill="#0f172a" />
        <line x1="200" y1="35" x2="200" y2="265" stroke="#475569" strokeWidth="2" strokeDasharray="4,2" />
        <path d="M 188,110 Q 170,140 185,170 Q 195,140 188,110 Z" fill="#020408" stroke="#334155" strokeWidth="1.5" />
        <path d="M 212,110 Q 230,140 215,170 Q 205,140 212,110 Z" fill="#020408" stroke="#334155" strokeWidth="1.5" />
      </svg>
    )
  }

  // 7. TAC Tórax Axial
  if (studyType === 'chest_ct') {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full max-h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <ellipse cx="200" cy="150" rx="140" ry="105" fill="#0f172a" stroke="#ffffff" strokeWidth="4" />
        <rect x="190" y="55" width="20" height="12" rx="3" fill="#ffffff" />
        <circle cx="200" cy="235" r="14" fill="#ffffff" />
        <path d="M 110,90 Q 180,90 170,210 Q 90,210 110,90 Z" fill="#020408" stroke="#334155" strokeWidth="1.5" />
        <path d="M 290,90 Q 220,90 230,210 Q 310,210 290,90 Z" fill="#020408" stroke="#334155" strokeWidth="1.5" />
        <circle cx="185" cy="120" r="12" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="180" cy="195" r="11" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />
      </svg>
    )
  }

  // 8. IRM Columna Lumbar Sagital T2
  if (studyType === 'spine_mri') {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full max-h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <rect x="60" y="20" width="280" height="260" rx="10" fill="#05070a" />
        <path d="M 170,30 Q 165,150 175,270" stroke="#f8fafc" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M 170,30 L 170,100 Q 170,130 172,160" stroke="#334155" strokeWidth="5" strokeLinecap="round" fill="none" />
        {[50, 95, 140, 185, 230].map((y, idx) => (
          <g key={idx}>
            <rect x="205" y={y} width="45" height="32" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {idx < 4 && <rect x="205" y={y + 32} width="45" height="8" rx="2" fill="#e2e8f0" opacity="0.85" />}
          </g>
        ))}
      </svg>
    )
  }

  // 9. IRM Cerebral Sagital T1
  if (studyType === 'brain_mri') {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full max-h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <path d="M 140,260 Q 90,200 95,110 Q 120,40 210,40 Q 290,40 305,120 Q 315,180 270,220 L 250,260 Z" fill="#0f172a" stroke="#475569" strokeWidth="2" />
        <path d="M 160,115 Q 200,90 240,115" stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M 205,140 Q 215,180 205,240" stroke="#334155" strokeWidth="16" strokeLinecap="round" fill="none" />
        <ellipse cx="150" cy="195" rx="30" ry="25" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
      </svg>
    )
  }

  // 10. Ultrasonido / Ecografía Abdominal
  if (studyType === 'ultrasound') {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full max-h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <path d="M 200,30 L 70,270 A 180,180 0 0,0 330,270 Z" fill="#05070a" stroke="#1e293b" strokeWidth="2" />
        <path d="M 100,100 Q 150,70 230,120" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.95" />
        <path d="M 120,110 Q 180,90 210,160 Q 140,170 120,110 Z" fill="#1e293b" opacity="0.7" />
        <ellipse cx="230" cy="195" rx="45" ry="30" fill="#0a0f1d" stroke="#ffffff" strokeWidth="2" opacity="0.85" />
        <ellipse cx="230" cy="195" rx="20" ry="12" fill="#ffffff" opacity="0.8" />
        <path d="M 180,150 Q 200,160 220,165" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3,3" fill="none" />
      </svg>
    )
  }

  return null
}
