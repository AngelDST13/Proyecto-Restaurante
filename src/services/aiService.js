// Servicio FrontEnd de IA Culinaria (Recomendación & Maridaje Inteligente)
export const aiService = {
  getRecommendation: async (preferencia, presupuesto, menu) => {
    // Simulación de inferencia de IA en el cliente basada en reglas difusas
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtrados = menu.filter(m => m.precio <= presupuesto);
        if (filtrados.length === 0) {
          resolve({
            sugerencia: "Le sugerimos nuestro menú degustación o ajustar su presupuesto.",
            maridaje: "Agua de manantial con infusión de citrón."
          });
        } else {
          const recomendado = filtrados[0];
          resolve({
            sugerencia: `Le recomendamos el platillo firma: ${recomendado.nombre}`,
            maridaje: "Vega Sicilia Único 2012 o Cava de Autor seleccionada por el Sommelier."
          });
        }
      }, 600);
    });
  }
};