import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import InteractiveGlow from '../components/InteractiveGlow';
import Login from '../pages/Login';
import Menu from '../pages/Menu';
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { MemoryRouter } from 'react-router-dom';

/**
 * Cobertura de las superficies de usuario mas visitadas: resplandor
 * interactivo, acceso (Login) y catalogo de platillos (Menu).
 */

describe('InteractiveGlow', () => {
  it('renderiza un capa decorativa que no captura el puntero', () => {
    const { container } = render(<InteractiveGlow />);
    const layer = container.firstChild;

    expect(layer).toHaveClass('pointer-events-none');
    expect(layer).toHaveClass('fixed');
    expect(layer.getAttribute('style')).toContain('radial-gradient');
  });

  it('reposiciona el resplandor al mover el raton', () => {
    const { container } = render(<InteractiveGlow />);

    fireEvent.mouseMove(window, { clientX: 320, clientY: 180 });
    expect(container.firstChild.getAttribute('style')).toContain('320px 180px');
  });

  it('reposiciona el resplandor al mover el dedo', () => {
    const { container } = render(<InteractiveGlow />);

    fireEvent.touchMove(window, { touches: [{ clientX: 120, clientY: 240 }] });
    expect(container.firstChild.getAttribute('style')).toContain('120px 240px');
  });

  it('deja de escuchar al desmontar el componente', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<InteractiveGlow />);

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
    removeSpy.mockRestore();
  });
});

describe('Login', () => {
  const renderLogin = () =>
    render(
      <AuthProvider>
        <AccessibilityProvider>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </AccessibilityProvider>
      </AuthProvider>,
    );

  it('muestra la marca El Cacique y el titulo de acceso', () => {
    renderLogin();

    expect(screen.getByAltText('Isotipo El Cacique')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Acceso al Sistema' })).toBeInTheDocument();
    expect(screen.getByText(/Chicharronera El Cacique/)).toBeInTheDocument();
    expect(screen.getByText(/Pedidos para Mesa, Express o Recoger en Local/i)).toBeInTheDocument();
  });

  it('ofrece el acceso rapido de pruebas con icono SVG, sin emojis', () => {
    renderLogin();

    const quickAccess = screen.getByRole('button', { name: /Accesos Rápidos de Prueba/i });
    expect(quickAccess.querySelector('svg')).not.toBeNull();
    expect(quickAccess.textContent).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });

  it('abre y cierra el modal de accesos rapidos', () => {
    renderLogin();

    const trigger = screen.getByRole('button', { name: /Accesos Rápidos de Prueba/i });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // El modal se cierra desde su boton de cerrar.
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar accesos rápidos' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('expone los campos de correo y contrasena por placeholder', () => {
    renderLogin();

    expect(screen.getByPlaceholderText(/admin@elcacique.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/•+/)).toBeInTheDocument();
  });

  it('permite alternar la visibilidad de la contrasena', () => {
    renderLogin();

    const password = screen.getByPlaceholderText(/•+/);
    const toggle = screen.getByRole('button', { name: 'Mostrar contraseña' });

    expect(password).toHaveAttribute('type', 'password');
    fireEvent.click(toggle);
    expect(password).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('alterna entre inicio de sesion y registro', () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: /registro|crear cuenta/i }));
    expect(screen.getByPlaceholderText(/Angel Salazar/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión|ingresar/i }));
    expect(screen.queryByPlaceholderText(/Angel Salazar/i)).not.toBeInTheDocument();
  });

  it('selecciona la sede y autocompleta credenciales de prueba', () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: /Accesos Rápidos de Prueba/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Cambiar de sede actualiza la credencial mostrada.
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(1);
    fireEvent.click(tabs[1]);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getAllByRole('button', { name: 'Autocompletar' })[0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/•+/)).not.toHaveValue('');
  });
});

/** Agrega el primer platillo disponible al carrito. */
const addFirstAvailableItem = () => {
  const addButtons = screen.getAllByRole('button', { name: 'Agregar' });
  expect(addButtons.length).toBeGreaterThan(0);
  fireEvent.click(addButtons[0]);
};

describe('Menu', () => {
  const renderMenu = () =>
    render(
      <AuthProvider>
        <AccessibilityProvider>
          <MemoryRouter>
            <Menu />
          </MemoryRouter>
        </AccessibilityProvider>
      </AuthProvider>,
    );

  it('presenta el catalogo con buscador y categorias', () => {
    renderMenu();

    expect(screen.getByPlaceholderText(/Buscar por platillo/i)).toBeInTheDocument();
    const categories = screen.getAllByRole('button', { name: /./ });
    expect(categories.length).toBeGreaterThan(3);
  });

  it('filtra el catalogo al escribir en el buscador', () => {
    renderMenu();

    const search = screen.getByPlaceholderText(/Buscar por platillo/i);
    const before = screen.getAllByRole('button', { name: /Agregar/i }).length;

    fireEvent.change(search, { target: { value: 'chicharron' } });

    const after = screen.getAllByRole('button', { name: /Agregar|No disponible/i }).length;
    expect(after).toBeLessThanOrEqual(before);
  });

  it('despliega el carrito y permite cerrar', async () => {
    renderMenu();
    addFirstAvailableItem();

    const openCart = await screen.findByRole('button', { name: 'Ver pedido actual' });
    fireEvent.click(openCart);

    const closeButton = await screen.findByRole('button', { name: 'Cerrar' });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument());
  });

  it('deshabilita el boton agregar cuando el platillo no esta disponible', () => {
    renderMenu();

    const unavailable = screen.queryAllByRole('button', { name: 'No disponible' });
    for (const button of unavailable) {
      expect(button).toBeDisabled();
    }
  });

  it('ofrece el pedido por WhatsApp desde el carrito', async () => {
    renderMenu();
    addFirstAvailableItem();

    fireEvent.click(await screen.findByRole('button', { name: 'Ver pedido actual' }));

    expect(
      await screen.findByRole('button', { name: /Solicitar Pedido por WhatsApp/i }),
    ).toBeInTheDocument();
  });

  it('no contiene emojis en el contenido visible', () => {
    const { container } = renderMenu();
    const text = container.textContent ?? '';

    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });
});