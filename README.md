# Sistema de Gestión Culinaria & POS Enterprise — El Cacique
>
> **Plataforma Web Multisucursal de Operaciones, Comandas POS, Cocina KDS y Automatizaciones**
> **Propiedad Intelectual y Derechos Reservados © 2026 BVA**

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![n8n](https://img.shields.io/badge/n8n-Workflow_Automation-FF6D5A?style=for-the-badge&logo=n8n)
![Security](https://img.shields.io/badge/Security-AES--256%20%2B%20HMAC-emerald?style=for-the-badge)
![Owner](https://img.shields.io/badge/Owner-BVA-orange?style=for-the-badge)

---

## 📌 Visión General del Proyecto

Diseñado y desarrollado para **BVA**, el **Sistema Enterprise El Cacique** es una solución integral para la gestión automatizada y centralizada de la cadena de restaurantes **Chicharronera El Cacique**.

La plataforma conecta en tiempo real los requerimientos de la cocina central (KDS), el control de comandas y mesas en salón para meseros (POS), la dirección ejecutiva administrativa multisucursal y los flujos de comunicación masiva vía webhooks integrados con **n8n**.

---

## 📁 Estructura del Proyecto

Proyecto-Restaurante/
├── docs/
│   └── Anteproyecto Escrito -El Cacique.docx
├── n8n/
│   ├── .env.example
│   └── workflow-gourmetsync.json
├── public/
│   └── docs/
├── src/
│   ├── assets/
│   │   └── img/
│   │       ├── ChicharronH.jpg
│   │       ├── LogoN.svg
│   │       └── ...
│   ├── components/
│   │   ├── Footer.jsx
│   │   ├── InteractiveGlow.jsx
│   │   ├── Navbar.jsx
│   │   ├── ReservationModal.jsx
│   │   └── Toast.jsx
│   ├── context/
│   │   ├── AccessibilityContext.jsx
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAccessibility.jsx
│   │   └── useAutoLogout.jsx
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── KitchenDashboard.jsx
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── MenuJsx.jsx
│   │   ├── Unauthorized.jsx
│   │   └── WaiterDashboard.jsx
│   ├── routes/
│   │   ├── AppRouter.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── PublicRoute.jsx
│   ├── services/
│   │   ├── aiService.js
│   │   ├── api.js
│   │   ├── authSecurity.js
│   │   ├── cryptoService.js
│   │   ├── n8nService.js
│   │   └── weatherService.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── LICENSE
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── vite.config.js

---

## 📦 Lista Completa de Dependencias

### Dependencias de Producción (dependencies)

- **react** (^18.3.1): Librería principal para la construcción de interfaces de usuario compuestas por componentes.
- **react-dom** (^18.3.1): Renderizado de componentes React en el DOM del navegador.
- **react-router-dom** (^6.22.0): Enrutamiento SPA con soporte para guardianes de ruta públicos y privados.
- **lucide-react** (^0.344.0): Sistema unificado de iconografía vectorizada SVG responsiva para paneles operativos.
- **crypto-js** (^4.2.0): Cifrado criptográfico AES-256 de estado local y generación de firmas de integridad HMAC-SHA256.

### Dependencias de Desarrollo (devDependencies)

- **vite** (^5.1.0): Empaquetador y entorno de desarrollo ultra rápido con soporte HMR (Hot Module Replacement).
- **tailwindcss** (^3.4.1): Framework CSS orientado a clases de utilidad para el diseño con estética Glassmorphism.
- **postcss** (^8.4.35): Procesamiento y optimización de reglas CSS.
- **autoprefixer** (^10.4.18): Añadido automático de prefijos de proveedores CSS para compatibilidad entre navegadores.

---

## 🛡️ Arquitectura de Seguridad & Protección Anti-DevTools

1. **Cifrado AES-256 en Estado Local**: Toda la información guardada en `localStorage` (`gourmetsync_enc_user`) se mantiene estrictamente encriptada. Si un usuario intenta inspeccionar el almacenamiento desde las herramientas de desarrollo (*DevTools / Application*), solo observará cadenas alfanuméricas indescifrables.
2. **Firma de Integridad HMAC-SHA256**: Se genera una firma digital vinculada al rol, correo y sede del usuario. Si un usuario intenta modificar su rol a `administrador` desde la consola del navegador, la firma se invalida y el sistema fuerza el cierre de sesión inmediato.
3. **Purga de Credenciales en Memoria**: Las contraseñas ingresadas en el formulario de inicio de sesión son eliminadas inmediatamente del contexto de React tras validar el acceso.
4. **Normalización Ciega de URLs (`URLNormalizer`)**: Interceptor que limpia automáticamente slashes o puntos finales anómalos en la barra de direcciones (ej: `/kitchen.`), evitando fallos de enrutamiento o accesos indebidos.
5. **Bus de Eventos en Tiempo Real (`BroadcastChannel`)**: Sincronización instantánea de eventos entre pestañas y dispositivos (Cocina KDS -> POS Mesero) sin latencia de red.

---

## 🔑 Matriz de Credenciales de Acceso

| Rol Operativo | Sede Asignada | Correo Electrónico | Contraseña Oficial |
| :--- | :--- | :--- | :--- |
| **Administrador General** | Global (Escazú, Santa Ana, Cartago, Heredia) | <admin@elcacique.com> | AdminCacique2026! |
| **Mesero Salón** | Escazú | <mesero.escazu@elcacique.com> | MeseroCacique2026! |
| **Mesero Salón** | Santa Ana | <mesero.santaana@elcacique.com> | MeseroCacique2026! |
| **Mesero Salón** | Cartago | <mesero.cartago@elcacique.com> | MeseroCacique2026! |
| **Mesero Salón** | Heredia | <mesero.heredia@elcacique.com> | MeseroCacique2026! |
| **Cocina (KDS)** | Cartago | <cocina.cartago@elcacique.com> | CocinaCacique2026! |
| **Cocina (KDS)** | Escazú | <cocina.escazu@elcacique.com> | CocinaCacique2026! |

---

## 🚀 Guía de Instalación y Despliegue Local

### 1. Clonar el Repositorio e Instalar Dependencias

git clone <https://github.com/AngelDST13/Proyecto-Restaurante.git>
cd GourmetSync
npm install

### 2. Iniciar Servidor de Desarrollo Vite

npm run dev
(Acceder a <http://localhost:5173> en el navegador)

### 3. Configuración del Servidor de Automatización n8n

- Iniciar el servicio local de n8n en el puerto 5678 (`npx n8n start`).
- Importar el flujo de trabajo ubicado en `n8n/workflow-gourmetsync.json`.
- Confirmar que el webhook maestro esté activo en: `http://localhost:5678/webhook/cacique-master-webhook`.

---

## ⚖️ Propiedad Intelectual

Este proyecto forma parte del portafolio de soluciones de software desarrolladas por la empresa **BVA**. Queda prohibida la reproducción, copia, distribución o comercialización no autorizada de este producto sin consentimiento explícito.

**© 2026 BVA. Todos los derechos reservados.**
