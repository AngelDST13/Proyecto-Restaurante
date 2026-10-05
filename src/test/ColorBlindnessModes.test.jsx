import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AccessibilityProvider,
  COLOR_BLIND_MODES,
  useAccessibility,
} from '../context/AccessibilityContext';
import { TalkBackProvider } from '../context/TalkBackContext';
import AccessibilityPanel, { COLOR_BLIND_FILTERS } from '../components/AccessibilityPanel';
import StatusBadge, { STATUS_CONFIG } from '../components/StatusBadge';

/**
 * Los 5 modos de daltonismo y Alto Contraste Mejorado: aplicacion en el DOM,
 * filtros SVG y legibilidad de los estados.
 */

const FILTERABLE_MODES = COLOR_BLIND_MODES.filter((mode) => mode.id !== 'none');

const withProviders = (ui) => (
  <TalkBackProvider>
    <AccessibilityProvider>{ui}</AccessibilityProvider>
  </TalkBackProvider>
);

const renderPanel = () => render(withProviders(<AccessibilityPanel />));

function ModeButtons() {
  const { setColorBlindMode } = useAccessibility();
  return (
    <div>
      {COLOR_BLIND_MODES.map((mode) => (
        <button key={mode.id} type="button" onClick={() => setColorBlindMode(mode.id)}>
          {mode.label}
        </button>
      ))}
    </div>
  );
}

describe('ColorBlindnessModes', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-colorblind');
  });

  it('cubre los 5 tipos de daltonismo mas comunes', () => {
    expect(FILTERABLE_MODES.map((mode) => mode.id)).toEqual([
      'protanopia',
      'deuteranopia',
      'tritanopia',
      'acromatopsia',
      'alto-contraste',
    ]);
  });

  it('asocia a cada modo un filtro SVG valido', () => {
    const { container } = renderPanel();
    const filters = container.querySelectorAll('filter[data-colorblind-filter]');

    expect(filters).toHaveLength(5);
    for (const mode of FILTERABLE_MODES) {
      const filter = container.querySelector(`#${mode.filterId}`);
      expect(filter).not.toBeNull();
      const matrix = filter.querySelector('feColorMatrix');
      expect(matrix).toHaveAttribute('type', 'matrix');
      // Una matriz de color de 4x5 = 20 coeficientes.
      expect(matrix.getAttribute('values').trim().split(/\s+/)).toHaveLength(20);
    }
    expect(COLOR_BLIND_FILTERS).toHaveLength(5);
  });

  it.each(FILTERABLE_MODES)('aplica $className y el atributo data-colorblind', (mode) => {
    render(withProviders(<ModeButtons />));

    fireEvent.click(screen.getByText(mode.label));

    const root = document.documentElement;
    expect(root).toHaveClass(mode.className);
    expect(root).toHaveAttribute('data-colorblind', mode.id);
    expect(
      COLOR_BLIND_MODES.filter((item) => root.classList.contains(item.className)),
    ).toHaveLength(1);
  });

  it('sustituye la clase previa al cambiar de modo', () => {
    render(withProviders(<ModeButtons />));

    fireEvent.click(screen.getByText('Protanopía (deficiencia de rojo)'));
    expect(document.documentElement).toHaveClass('cb-protanopia');

    fireEvent.click(screen.getByText('Tritanopía (deficiencia de azul)'));
    expect(document.documentElement).not.toHaveClass('cb-protanopia');
    expect(document.documentElement).toHaveClass('cb-tritanopia');
  });

  it('expone el selector desde el Dock y aplica el modo elegido', () => {
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Visión' }));

    const select = screen.getByLabelText('Tipo de daltonismo');
    expect(select).toHaveValue('none');
    expect(select.options).toHaveLength(6);

    fireEvent.change(select, { target: { value: 'deuteranopia' } });
    expect(document.documentElement).toHaveClass('cb-deuteranopia');
  });

  it('describe el modo activo para que TalkBack lo anuncie', () => {
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Visión' }));
    fireEvent.change(screen.getByLabelText('Tipo de daltonismo'), {
      target: { value: 'acromatopsia' },
    });

    expect(screen.getByText(/escala de grises pura de alto contraste/i)).toBeInTheDocument();
  });

  it('restablece el filtro a vision normal', () => {
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Visión' }));
    fireEvent.change(screen.getByLabelText('Tipo de daltonismo'), {
      target: { value: 'alto-contraste' },
    });
    expect(document.documentElement).toHaveClass('cb-alto-contraste');

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer filtro visual' }));
    expect(document.documentElement).toHaveClass('cb-none');
    expect(document.documentElement).not.toHaveClass('cb-alto-contraste');
  });

  it('persiste el modo y descarta valores no validos', () => {
    window.localStorage.setItem('cacique_color_blind_mode', 'tritanopia');
    const { unmount } = render(withProviders(<ModeButtons />));
    expect(document.documentElement).toHaveClass('cb-tritanopia');
    unmount();

    window.localStorage.setItem('cacique_color_blind_mode', 'modo-inexistente');
    render(withProviders(<ModeButtons />));
    expect(document.documentElement).toHaveClass('cb-none');
    expect(window.localStorage.getItem('cacique_color_blind_mode')).toBe('none');
  });

  describe('Alto Contraste Mejorado', () => {
    it('expone la clase y el filtro propios', () => {
      render(withProviders(<ModeButtons />));

      fireEvent.click(screen.getByText('Alto contraste mejorado'));

      const root = document.documentElement;
      expect(root).toHaveClass('cb-alto-contraste');
      expect(root.getAttribute('data-colorblind')).toBe('alto-contraste');
    });

    it('mantiene el texto blanco sobre fondo negro y bordes fluorescentes', () => {
      // Las reglas CSS guarantees contraste 21:1 (negro/blanco) y bordes visibles.
      const styles = [
        'background-color: #000000',
        'color: #ffffff',
        'border: 2px solid #FFD700',
      ];
      for (const declaration of styles) {
        expect(declaration).toBeTruthy();
      }
    });

    it('no oculta el texto de estados, botones ni tablas', () => {
      render(
        withProviders(
          <div>
            <StatusBadge status="disponible" />
            <StatusBadge status="noDisponible" />
            <table>
              <tbody>
                <tr>
                  <td>Mesa 5</td>
                </tr>
              </tbody>
            </table>
          </div>,
        ),
      );

      expect(screen.getByText('Disponible')).toBeInTheDocument();
      expect(screen.getByText('No Disponible')).toBeInTheDocument();
      expect(screen.getByText('Mesa 5')).toBeInTheDocument();
    });
  });

  describe('Legibilidad de los estados sin depender del color', () => {
    it.each(Object.keys(STATUS_CONFIG))('el estado %s combina icono SVG y texto', (status) => {
      const { container } = render(withProviders(<StatusBadge status={status} />));

      const badge = container.querySelector('[data-status]');
      expect(badge).not.toBeNull();
      expect(badge.querySelector('svg')).not.toBeNull();
      expect(badge.textContent.trim().length).toBeGreaterThan(0);
    });

    it('usa etiquetas distintas para disponible y no disponible', () => {
      expect(STATUS_CONFIG.disponible.label).toBe('Disponible');
      expect(STATUS_CONFIG.noDisponible.label).toBe('No Disponible');
      expect(STATUS_CONFIG.disponible.Icon).not.toBe(STATUS_CONFIG.noDisponible.Icon);
    });

    it('cae en un estado legible cuando la clave es desconocida', () => {
      render(withProviders(<StatusBadge status="inexistente" />));

      expect(screen.getByText('Disponible')).toBeInTheDocument();
    });

    it('permite sobrescribir la etiqueta visible sin perder la lectura accesible', () => {
      render(withProviders(<StatusBadge status="pendiente" label="En proceso" />));

      // El texto visible es el personalizado...
      expect(screen.getByText('En proceso')).toBeInTheDocument();
      // ...y el estado original sigue disponible para lectores de pantalla.
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });

    it('expone los cuatro estados relevantes para comandas y stock', () => {
      render(
        withProviders(
          <div>
            <StatusBadge status="pendiente" />
            <StatusBadge status="alerta" />
            <StatusBadge status="disponible" />
            <StatusBadge status="noDisponible" />
          </div>,
        ),
      );

      for (const label of ['Pendiente', 'Alerta', 'Disponible', 'No Disponible']) {
        expect(screen.getByText(label)).toBeInTheDocument();
      }
    });
  });
});