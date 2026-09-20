const API_URL = 'http://localhost:3001';
const N8N_WEBHOOK_MASTER = 'http://localhost:5678/webhook/cacique-master-webhook';

export const api = {
  loginUser: async (email, password) => {
    // Uso básico de la variable password para validación vacía
    if (!password) {
      throw new Error('La contraseña es requerida');
    }

    const res = await fetch(`${API_URL}/usuarios?email=${email}`);
    const data = await res.json();
    
    if (!data || data.length === 0) {
      throw new Error('Usuario no encontrado');
    }
    
    const user = data[0];

    // Disparar evento a n8n en segundo plano
    fetch(N8N_WEBHOOK_MASTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modulo: 'LOGIN_SUCCESS',
        evento: 'LOGIN_SUCCESS',
        usuario: user.email,
        rol: user.rol,
        timestamp: new Date().toISOString()
      })
    }).catch((err) => console.log('n8n webhook auth offline:', err.message));

    return user;
  },

  sendOrderToN8n: async (orderData) => {
    try {
      const res = await fetch(N8N_WEBHOOK_MASTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulo: 'PEDIDO_MENU', ...orderData })
      });
      return await res.json();
    } catch (error) {
      console.log('n8n webhook orders offline:', error.message);
      return { status: 'fallback_offline', message: 'Comanda procesada localmente' };
    }
  }
};