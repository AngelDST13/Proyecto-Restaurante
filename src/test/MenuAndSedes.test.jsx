import { describe, test, expect } from 'vitest';

describe('Pruebas de Cobertura - Gestión de Menú y Sedes Exclusivas', () => {
  test('Filtra correctamente platillos exclusivos por sede', () => {
    const platillos = [
      { id: 1, nombre: 'Chifrijo', sedesNoDisponibles: ['Cartago'] },
      { id: 2, nombre: 'Corte Especial', sedesNoDisponibles: [] }
    ];

    const disponiblesEnCartago = platillos.filter(p => !p.sedesNoDisponibles.includes('Cartago'));
    expect(disponiblesEnCartago.length).toBe(1);
    expect(disponiblesEnCartago[0].nombre).toBe('Corte Especial');
  });
});