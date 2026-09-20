// Servicio de integración directa con el Webhook Local de n8n
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/cacique-master-webhook';

export async function triggerN8nAutomation(modulo, payload) {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        modulo: modulo, // 'RESERVA', 'PEDIDO_MENU', 'ALERTA_STOCK', 'REGISTRO_CLIENTE'
        fechaEnvio: new Date().toISOString(),
        ...payload
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      return { success: false, message: 'Servidor n8n no respondió con OK.' };
    }
  } catch (error) {
    console.warn('n8n Webhook Offline o no alcanzable:', error.message);
    return { success: false, message: 'No se pudo conectar con el servidor n8n local.' };
  }
}