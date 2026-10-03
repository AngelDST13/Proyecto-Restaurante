/* eslint-disable react-refresh/only-export-components -- COLOR_BLIND_FILTERS se comparte con las pruebas */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Accessibility as AccessibilityIcon,
  Contrast,
  Eye,
  Moon,
  Palette,
  Pause,
  Play,
  RotateCcw,
  Square,
  Sun,
  Type,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTalkBack } from '../context/TalkBackContext';
import { TALKBACK_RATES } from '../hooks/useTalkBack';

const SPEED_LABELS = { 0.8: 'Lenta', 1: 'Normal', 1.2: 'Rápida' };

/** Las cuatro pestañas del Dock de Accesibilidad. */
export const ACCESSIBILITY_TABS = [
  { id: 'voz', label: 'Voz', Icon: Volume2 },
  { id: 'tema', label: 'Tema', Icon: Palette },
  { id: 'vision', label: 'Visión', Icon: Eye },
  { id: 'texto', label: 'Texto', Icon: Type },
];

/**
 * Filtros SVG de daltonismo. Se definen de forma declarativa y se referencian
 * desde CSS con `filter: url(#id)`, evitando depender exclusivamente del color.
 */
export const COLOR_BLIND_FILTERS = [
  {
    id: 'cb-filter-protanopia',
    mode: 'protanopia',
    values: '0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0',
  },
  {
    id: 'cb-filter-deuteranopia',
    mode: 'deuteranopia',
    values: '0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0',
  },
  {
    id: 'cb-filter-tritanopia',
    mode: 'tritanopia',
    values: '0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0',
  },
  {
    id: 'cb-filter-acromatopsia',
    mode: 'acromatopsia',
    values: '0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0',
  },
  {
    id: 'cb-filter-alto-contraste',
    mode: 'alto-contraste',
    values: '1.6 0 0 0 -0.3  0 1.6 0 0 -0.3  0 0 1.6 0 -0.3  0 0 0 1 0',
  },
];

/** Panel "Lectura en Voz Alta": interruptor, transporte y velocidad. */
function TalkBackTab() {
  const {
    isEnabled,
    isSupported,
    isPaused,
    rate,
    statusLabel,
    toggleTalkBack,
    pause,
    resume,
    stop,
    changeRate,
    announce,
  } = useTalkBack();

  const toggleClass = `inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-wide transition-all cursor-pointer border ${
    isEnabled
      ? 'bg-(--cacique-accent) text-white border-(--cacique-accent)'
      : 'bg-(--cacique-card) text-(--cacique-on-card) border-(--cacique-border)/50 hover:border-(--cacique-accent)'
  }`;

  const controlClass =
    'inline-flex items-center justify-center gap-1.5 rounded-lg border border-(--cacique-border)/40 bg-(--cacique-surface) px-3 py-2 text-(--cacique-text) transition-colors cursor-pointer hover:border-(--cacique-accent) disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="space-y-4" data-testid="dock-tab-voz">
      <button type="button" onClick={toggleTalkBack} aria-pressed={isEnabled} className={toggleClass}>
        {isEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        <span>{isEnabled ? 'Desactivar TalkBack' : 'Activar TalkBack'}</span>
      </button>
      <p className="text-xs font-semibold text-(--cacique-muted)" role="status">
        {statusLabel}
      </p>

      {isEnabled && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={pause}
              disabled={isPaused}
              aria-label="Pausar lectura"
              className={controlClass}
            >
              <Pause className="h-4 w-4" />
              <span className="text-xs font-bold">Pausar</span>
            </button>
            <button
              type="button"
              onClick={resume}
              aria-label="Reanudar lectura"
              className={controlClass}
            >
              <Play className="h-4 w-4" />
              <span className="text-xs font-bold">Reanudar</span>
            </button>
            <button
              type="button"
              onClick={stop}
              aria-label="Detener lectura"
              className={controlClass}
            >
              <Square className="h-4 w-4" />
              <span className="text-xs font-bold">Detener</span>
            </button>
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-1 text-[11px] font-black uppercase tracking-widest text-(--cacique-muted)">
              Velocidad de lectura
            </legend>
            <div className="flex gap-2">
              {TALKBACK_RATES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => changeRate(option)}
                  aria-pressed={rate === option}
                  aria-label={`Velocidad ${SPEED_LABELS[option]} ${option}x`}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-black transition-colors cursor-pointer ${
                    rate === option
                      ? 'border-(--cacique-accent) bg-(--cacique-accent) text-white'
                      : 'border-(--cacique-border)/40 bg-(--cacique-surface) text-(--cacique-text) hover:border-(--cacique-accent)'
                  }`}
                >
                  {option}x
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={() => announce('Resumen de la comanda actual.')}
            className={`${controlClass} w-full`}
            aria-label="Leer resumen de la comanda"
          >
            <Contrast className="h-4 w-4" />
            <span className="text-xs font-bold">Leer resumen de la comanda</span>
          </button>
        </>
      )}

      {!isSupported && (
        <p className="text-xs text-(--cacique-muted)">
          Este navegador no expone la Web Speech Synthesis API.
        </p>
      )}
    </div>
  );
}

/** Panel "Tema y Paleta": Modo Oscuro / Modo Claro Gourmet. */
function ThemeTab() {
  const { isLightTheme, toggleTheme } = useAccessibility();

  return (
    <div className="space-y-3" data-testid="dock-tab-tema">
      <button
        type="button"
        onClick={toggleTheme}
        aria-pressed={isLightTheme}
        aria-label={isLightTheme ? 'Activar modo oscuro' : 'Activar modo claro'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-(--cacique-border)/50 bg-(--cacique-card) px-4 py-3 text-sm font-black uppercase tracking-wide text-(--cacique-on-card) transition-all cursor-pointer hover:border-(--cacique-accent)"
      >
        {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span>{isLightTheme ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}</span>
      </button>
      <p className="text-xs leading-relaxed text-(--cacique-muted)">
        El Modo Claro Gourmet conserva el tono artesanal: fondo crema marfil, tarjetas verde
        esmeralda profundo y acentos en dorado ámbar.
      </p>
    </div>
  );
}

/** Panel "Filtros de Visión": los 5 modos de daltonismo. */
function VisionTab() {
  const { colorBlindMode, setColorBlindMode, resetColorBlindMode, colorBlindModes } =
    useAccessibility();
  const { announce } = useTalkBack();

  const handleChange = useCallback(
    (modeId) => {
      setColorBlindMode(modeId);
      const mode = colorBlindModes.find((item) => item.id === modeId);
      if (mode) announce(`Filtro visual activado: ${mode.label}. ${mode.description}`);
    },
    [announce, colorBlindModes, setColorBlindMode],
  );

  const activeMode = colorBlindModes.find((mode) => mode.id === colorBlindMode);

  return (
    <div className="space-y-3" data-testid="dock-tab-vision">
      <label className="block space-y-1.5">
        <span className="text-[11px] font-black uppercase tracking-widest text-(--cacique-muted)">
          Tipo de daltonismo
        </span>
        <select
          aria-label="Tipo de daltonismo"
          value={colorBlindMode}
          onChange={(event) => handleChange(event.target.value)}
          className="cacique-select w-full rounded-xl border border-amber-500/30 bg-zinc-900 px-3 py-2.5 text-sm font-bold text-zinc-100"
        >
          {colorBlindModes.map((mode) => (
            <option key={mode.id} value={mode.id} className="bg-zinc-900 text-zinc-100">
              {mode.label}
            </option>
          ))}
        </select>
      </label>

      <p className="text-xs leading-relaxed text-(--cacique-muted)">{activeMode?.description}</p>

      <button
        type="button"
        onClick={resetColorBlindMode}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-(--cacique-border)/50 bg-(--cacique-card) px-4 py-2.5 text-xs font-black uppercase tracking-wide text-(--cacique-on-card) transition-colors cursor-pointer hover:border-(--cacique-accent)"
        aria-label="Restablecer filtro visual"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Restablecer filtro</span>
      </button>
    </div>
  );
}

/** Panel "Escalado de Texto": A-, restablecer, A+. */
function TextScaleTab() {
  const { fontSizeLevel, increaseFontSize, decreaseFontSize, resetFontSize } = useAccessibility();

  const buttonClass =
    'flex-1 rounded-xl border border-(--cacique-border)/50 bg-(--cacique-surface) px-3 py-3 text-sm font-black text-(--cacique-text) transition-colors cursor-pointer hover:border-(--cacique-accent) disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="space-y-3" data-testid="dock-tab-texto">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decreaseFontSize}
          disabled={fontSizeLevel <= -1}
          className={buttonClass}
          aria-label="Disminuir tamaño de letra"
        >
          A-
        </button>
        <button
          type="button"
          onClick={resetFontSize}
          className={buttonClass}
          aria-label="Restablecer tamaño de letra"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={increaseFontSize}
          disabled={fontSizeLevel >= 2}
          className={buttonClass}
          aria-label="Aumentar tamaño de letra"
        >
          A+
        </button>
      </div>
      <p className="text-xs text-(--cacique-muted)">
        Nivel actual: {fontSizeLevel === 0 ? 'Normal' : fontSizeLevel > 0 ? 'Grande' : 'Pequeño'}
      </p>
    </div>
  );
}

const TAB_COMPONENTS = {
  voz: TalkBackTab,
  tema: ThemeTab,
  vision: VisionTab,
  texto: TextScaleTab,
};

/**
 * Dock Flotante de Accesibilidad.
 *
 * Consolida en la esquina inferior derecha todos los controles de
 * accesibilidad en un unico panel con cuatro pestañas ordenadas.
 */
export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('voz');
  const dockRef = useRef(null);
  const ActiveTab = TAB_COMPONENTS[activeTab] ?? TalkBackTab;

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Definiciones SVG de los filtros de daltonismo */}
      <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {COLOR_BLIND_FILTERS.map((filter) => (
            <filter
              key={filter.id}
              id={filter.id}
              data-colorblind-filter={filter.mode}
              colorInterpolationFilters="linearRGB"
            >
              <feColorMatrix type="matrix" values={filter.values} />
            </filter>
          ))}
        </defs>
      </svg>

      <div
        ref={dockRef}
        className="fixed bottom-4 right-4 z-70 flex w-full max-w-full flex-col items-end gap-3"
      >
        {isOpen && (
          <section
            id="accessibility-panel"
            aria-label="Panel de accesibilidad"
            className="w-[min(22rem,calc(100vw-2rem))] overflow-x-auto rounded-2xl border border-(--cacique-border)/40 bg-(--cacique-surface) p-4 text-(--cacique-text) shadow-2xl"
          >
            <header className="mb-3 flex items-center gap-2 border-b border-(--cacique-border)/20 pb-3">
              <AccessibilityIcon
                className="h-5 w-5 shrink-0 text-(--cacique-accent)"
                aria-hidden="true"
              />
              <h2 className="text-sm font-black uppercase tracking-wide">Accesibilidad</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar panel de accesibilidad"
                className="ml-auto rounded-lg p-1.5 text-(--cacique-muted) transition-colors cursor-pointer hover:text-(--cacique-accent)"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            <div
              role="tablist"
              aria-label="Secciones de accesibilidad"
              className="mb-4 flex flex-wrap gap-1.5"
            >
              {ACCESSIBILITY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`dock-tab-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  aria-controls={`dock-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-black uppercase tracking-wide transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-(--cacique-accent) text-white'
                      : 'bg-(--cacique-card) text-(--cacique-on-card) hover:border-(--cacique-accent)'
                  }`}
                >
                  <tab.Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>

            <div
              role="tabpanel"
              id={`dock-panel-${activeTab}`}
              aria-labelledby={`dock-tab-${activeTab}`}
              tabIndex={-1}
            >
              <ActiveTab />
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          aria-controls="accessibility-panel"
          aria-label={isOpen ? 'Cerrar accesibilidad' : 'Abrir accesibilidad'}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-(--cacique-border)/40 bg-(--cacique-card) text-(--cacique-on-card) shadow-xl transition-all cursor-pointer hover:border-(--cacique-accent) hover:text-(--cacique-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--cacique-accent)"
        >
          <AccessibilityIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}