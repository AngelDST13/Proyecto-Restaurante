import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AccessibilityProvider,
  COLOR_BLIND_MODES,
  useAccessibility,
} from '../context/AccessibilityContext';
import AccessibilityPanel, { COLOR_BLIND_FILTERS } from '../components/AccessibilityPanel';
import { TalkBackProvider } from '../context/TalkBackContext';
import StatusBadge, { STATUS_CONFIG } from '../components/StatusBadge';

/**
 * Pruebas de los 5 filtros de contraste para los tipos de daltonismo mas
 * comunes, verificando la aplicacion de clases y atributos en el DOM.
 */

const FILTERABLE_MODES = COLOR_BLIND_MODES.filter((mode) => mode.id !== 'none');

function ColorBlindControls() {
  const { colorBlindMode, setColorBlindMode, resetColorBlindMode, activeColorBlindClass } =
    useAccessibility();
  return (
    <div>
      <span data-testid="mode">{colorBlindMode}</span>
      <span data-testid="class">{activeColorBlindClass}</span>
      {COLOR_BLIND_MODES.map((mode) => (
        <button key={mode.id} type="button" onClick={() => setColorBlindMode(mode.id)}>
          {mode.label}
        </button>
      ))}
      <button type="button" onClick={resetColorBlindMode}>Restablecer filtro</button>
    </div>
  );
}

const renderWithProviders = (ui) =>
  render(
    <TalkBackProvider>
      <AccessibilityProvider>{ui}</AccessibilityProvider>
    </TalkBackProvider>,
  );

/** Renderiza el Panel de Accesibilidad con ambos proveedores. */
const renderPanel = () =>
  render(
    <TalkBackProvider>
      <AccessibilityProvider>
        <AccessibilityPanel />
      </AccessibilityProvider>
    </TalkBackProvider>,
  );

describe('ColorBlindnessFilters', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-colorblind');
  });

  it('cataloga los 5 tipos de daltonismo con su clase y filtro SVG', () => {
    expect(FILTERABLE_MODES).toHaveLength(5);
    expect(FILTERABLE_MODES.map((mode) => mode.id)).toEqual([
      'protanopia',
      'deuteranopia',
      'tritanopia',
      'acromatopsia',
      'alto-contraste',
    ]);

    for (const mode of FILTERABLE_MODES) {
      expect(mode.className).toBe(`cb-${mode.id}`);
      expect(mode.filterId).toBe(`cb-filter-${mode.id}`);
      expect(mode.description.length).toBeGreaterThan(10);
    }
  });

  it('define un filtro SVG feColorMatrix por cada modo', () => {
    const { container } = renderPanel();
    const filters = container.querySelectorAll('filter[data-colorblind-filter]');

    expect(filters).toHaveLength(5);
    for (const filter of filters) {
      expect(filter.id).toBe(`cb-filter-${filter.dataset.colorblindFilter}`);
      expect(filter.querySelector('feColorMatrix')).toHaveAttribute('type', 'matrix');
    }
    expect(COLOR_BLIND_FILTERS.map((filter) => filter.id)).toEqual(
      FILTERABLE_MODES.map((mode) => mode.filterId),
    );
  });

  it.each(FILTERABLE_MODES)('aplica la clase $className en el elemento raiz', (mode) => {
    renderWithProviders(<ColorBlindControls />);

    expect(document.documentElement).toHaveClass('cb-none');
    expect(document.documentElement).toHaveAttribute('data-colorblind', 'none');

    fireEvent.click(screen.getByRole('button', { name: mode.label }));

    expect(document.documentElement).toHaveClass(mode.className);
    expect(document.documentElement).toHaveAttribute('data-colorblind', mode.id);
    expect(screen.getByTestId('mode')).toHaveTextContent(mode.id);
    expect(screen.getByTestId('class')).toHaveTextContent(mode.className);
    // Solo una clase de daltonismo puede estar activa a la vez.
    expect(
      COLOR_BLIND_MODES.filter((item) => document.documentElement.classList.contains(item.className)),
    ).toHaveLength(1);
  });

  it('remueve la clase anterior al cambiar de filtro', () => {
    renderWithProviders(<ColorBlindControls />);

    fireEvent.click(screen.getByRole('button', { name: 'Protanopía (deficiencia de rojo)' }));
    expect(document.documentElement).toHaveClass('cb-protanopia');

    fireEvent.click(screen.getByRole('button', { name: 'Tritanopía (deficiencia de azul)' }));
    expect(document.documentElement).not.toHaveClass('cb-protanopia');
    expect(document.documentElement).toHaveClass('cb-tritanopia');
  });

  it('ignora un modo de daltonismo no soportado', () => {
    renderWithProviders(<ColorBlindControls />);
    fireEvent.click(screen.getByRole('button', { name: 'Acromatopsia (monocromatismo)' }));
    expect(document.documentElement).toHaveClass('cb-acromatopsia');
  });

  it('restablece el filtro a vision normal', () => {
    renderWithProviders(<ColorBlindControls />);

    fireEvent.click(screen.getByRole('button', { name: 'Alto contraste mejorado' }));
    expect(document.documentElement).toHaveClass('cb-alto-contraste');

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer filtro' }));
    expect(document.documentElement).toHaveClass('cb-none');
    expect(document.documentElement).not.toHaveClass('cb-alto-contraste');
    expect(document.documentElement).toHaveAttribute('data-colorblind', 'none');
  });

  it('persiste el filtro y descarta valores almacenados no validos', () => {
    window.localStorage.setItem('cacique_color_blind_mode', 'protanopia');
    const { unmount } = renderWithProviders(<ColorBlindControls />);
    expect(document.documentElement).toHaveClass('cb-protanopia');
    unmount();

    window.localStorage.setItem('cacique_color_blind_mode', 'modo-inexistente');
    renderWithProviders(<ColorBlindControls />);
    expect(document.documentElement).toHaveClass('cb-none');
    expect(window.localStorage.getItem('cacique_color_blind_mode')).toBe('none');
  });

  it('expone el selector de daltonismo en el panel de accesibilidad', () => {
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));

    // La sección de filtros vive en la pestaña "Visión".
    fireEvent.click(screen.getByRole('tab', { name: 'Visión' }));

    const select = screen.getByLabelText('Tipo de daltonismo');
    expect(select).toHaveValue('none');
    expect(select.options).toHaveLength(6);

    fireEvent.change(select, { target: { value: 'deuteranopia' } });
    expect(document.documentElement).toHaveClass('cb-deuteranopia');
    expect(screen.getByText(/tonos oliva y azul acero/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer filtro visual' }));
    expect(document.documentElement).toHaveClass('cb-none');
  });

  it('acompania los estados con iconos SVG y texto, no solo color', () => {
    render(
      <TalkBackProvider>
        <AccessibilityProvider>
          <MemoryRouter>
            <div>
              <StatusBadge status="disponible" />
              <StatusBadge status="noDisponible" />
              <StatusBadge status="pendiente" />
              <StatusBadge status="alerta" />
              <StatusBadge status="desconocido" label="Estado especial" />
            </div>
          </MemoryRouter>
        </AccessibilityProvider>
      </TalkBackProvider>,
    );

    expect(screen.getByText('Estado especial')).toBeInTheDocument();
    expect(screen.getByText('No Disponible')).toBeInTheDocument();

    // Cada estado incluye un icono Lucide (svg) ademas del texto.
    for (const badge of document.querySelectorAll('[data-status]')) {
      expect(badge.querySelector('svg')).not.toBeNull();
    }
    expect(STATUS_CONFIG.disponible.label).toBe('Disponible');
    expect(STATUS_CONFIG.noDisponible.label).toBe('No Disponible');
  });
});
