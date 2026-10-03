/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Accessibility as AccessibilityIcon,
  Contrast,
  Eye,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Square,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { TALKBACK_RATES } from '../hooks/useTalkBack';
import { useTalkBack } from '../context/TalkBackContext';

const SPEED_LABELS = { 0.8: 'Lenta', 1: 'Normal', 1.2: 'Rápida' };

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

function TalkBackControls({ compact = false }) {
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

  const controlClass =
    'px-2.5 py-1.5 rounded-lg border border-(--cacique-border)/40 bg-(--cacique-card) text-(--cacique-text) hover:border-(--cacique-accent) transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className={compact ? 'flex flex-wrap items-center gap-1.5' : 'space-y-3'}>
      <button
        type="button"
        onClick={toggleTalkBack}
        aria-pressed={isEnabled}
        aria-label={isEnabled ? 'Desactivar lector de voz' : 'Activar lector de voz'}
        title={statusLabel}
        className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all cursor-pointer flex items-center gap-2 border ${
          isEnabled
            ? 'bg-(--cacique-accent) text-white border-(--cacique-accent)'
            : 'bg-(--cacique-card) text-(--cacique-text) border-(--cacique-border)/40'
        }`}
      >
        {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        <span>TalkBack</span>
      </button>

      {isEnabled && !compact && (
        <div className="flex flex-wrap items-center gap-1.5" data-testid="talkback-controls">
          <button
            type="button"
            onClick={pause}
            className={controlClass}
            disabled={isPaused}
            aria-label="Pausar lectura"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={resume} className={controlClass} aria-label="Reanudar lectura">
            <Play className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={stop} className={controlClass} aria-label="Detener lectura">
            <Square className="w-3.5 h-3.5" />
          </button>
          {TALKBACK_RATES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => changeRate(option)}
              aria-pressed={rate === option}
              aria-label={`Velocidad ${SPEED_LABELS[option]} ${option}x`}
              className={`${controlClass} ${rate === option ? 'border-(--cacique-accent) font-bold' : ''}`}
            >
              {option}x
            </button>
          ))}
          <button
            type="button"
            onClick={() => announce('Resumen de la comanda actual.')}
            className={controlClass}
            aria-label="Leer resumen de la comanda"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!isSupported && !compact && (
        <p className="text-xs text-(--cacique-text)/70">
          Este navegador no expone la Web Speech Synthesis API.
        </p>
      )}
    </div>
  );
}

export default function AccessibilityPanel() {
  const {
    isLightTheme,
    toggleTheme,
    colorBlindMode,
    setColorBlindMode,
    resetColorBlindMode,
    colorBlindModes,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    fontSizeLevel,
  } = useAccessibility();
  const { announce } = useTalkBack();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const handleColorBlindChange = useCallback(
    (modeId) => {
      setColorBlindMode(modeId);
      const mode = colorBlindModes.find((item) => item.id === modeId);
      if (mode) announce(`Filtro visual activado: ${mode.label}. ${mode.description}`);
    },
    [announce, colorBlindModes, setColorBlindMode],
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    const handleOutsideClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const controlClass =
    'w-full px-3 py-2 rounded-xl border border-(--cacique-border)/40 bg-(--cacique-card) text-(--cacique-text) text-xs font-bold uppercase tracking-wide hover:border-(--cacique-accent) transition-colors cursor-pointer flex items-center justify-center gap-2';

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

      <div ref={panelRef} className="fixed bottom-4 right-4 z-[60] w-full max-w-full sm:w-auto sm:min-w-[22rem]">
        {isOpen && (
          <section
            id="accessibility-panel"
            aria-label="Panel de accesibilidad"
            className="mb-3 w-full max-w-full overflow-x-auto min-w-0 rounded-2xl border border-(--cacique-border)/30 bg-(--cacique-card) p-4 shadow-2xl text-(--cacique-text)"
          >
            <header className="flex items-center gap-2 mb-3">
              <AccessibilityIcon className="w-5 h-5 text-(--cacique-accent)" />
              <h2 className="text-sm font-black uppercase tracking-wide">Accesibilidad</h2>
            </header>

            <div className="grid gap-4">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest opacity-70">
                  Lectura en voz alta
                </p>
                <TalkBackControls />
              </div>

              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest opacity-70">Tema</p>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-pressed={isLightTheme}
                  aria-label={isLightTheme ? 'Activar modo oscuro' : 'Activar modo claro'}
                  className={controlClass}
                >
                  {isLightTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <span>{isLightTheme ? 'Modo oscuro' : 'Modo claro'}</span>
                </button>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest opacity-70">
                  Filtros visuales
                </p>
                <label className="block space-y-1">
                  <span className="sr-only">Tipo de daltonismo</span>
                  <select
                    aria-label="Tipo de daltonismo"
                    value={colorBlindMode}
                    onChange={(event) => handleColorBlindChange(event.target.value)}
                    className="w-full min-w-0 rounded-xl border border-(--cacique-border)/40 bg-(--cacique-card) px-3 py-2 text-xs font-bold text-(--cacique-text)"
                  >
                    {colorBlindModes.map((mode) => (
                      <option key={mode.id} value={mode.id}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mt-2 text-[11px] leading-relaxed opacity-80">
                  {colorBlindModes.find((mode) => mode.id === colorBlindMode)?.description}
                </p>
                <button
                  type="button"
                  onClick={resetColorBlindMode}
                  className={`${controlClass} mt-2`}
                  aria-label="Restablecer filtro visual"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer filtro</span>
                </button>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest opacity-70">
                  Tamaño de letra
                </p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={decreaseFontSize} className={controlClass} disabled={fontSizeLevel <= -1} aria-label="Disminuir tamaño de letra">
                    A-
                  </button>
                  <button type="button" onClick={resetFontSize} className={controlClass} aria-label="Restablecer tamaño de letra">
                    Normal
                  </button>
                  <button type="button" onClick={increaseFontSize} className={controlClass} disabled={fontSizeLevel >= 2} aria-label="Aumentar tamaño de letra">
                    A+
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <TalkBackControls compact />
          <button
            type="button"
            onClick={() => setIsOpen((previous) => !previous)}
            aria-expanded={isOpen}
            aria-controls="accessibility-panel"
            aria-label="Abrir panel de accesibilidad"
            className="flex items-center gap-2 rounded-xl border border-(--cacique-border)/40 bg-(--cacique-card) px-3 py-2 text-xs font-black uppercase tracking-wide text-(--cacique-text) shadow-lg transition-colors hover:border-(--cacique-accent) cursor-pointer"
          >
            <Contrast className="w-4 h-4 text-(--cacique-accent)" />
            <span>Accesibilidad</span>
          </button>
        </div>
      </div>
    </>
  );
}

