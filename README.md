# 🍽️ GourmetSync — Sistema Integrado de Gestión Operativa y Experiencia Gastronómica

Plataforma web integral desarrollada con **React** y **Tailwind CSS** enfocada en automatizar los flujos de atención al cliente (Frontend Externo) y la administración interna de restaurante (Backoffice/POS).

---

## 👥 Equipo de Desarrollo & Créditos

* **Angel Daniela Salazar T.** (Desarrolladora Principal — Prototipo Gastronómico & Backoffice)
* **Bryan Gómez** (Integración de Procesos Empresariales)
* **Víctor González** (Gestión Operativa y Control)

> **Nota de Propiedad:** Esta solución representa un desarrollo original ideado y diseñado como un proyecto empresarial propio para su comercialización en el sector gastronómico.

---

## 🛠️ Tecnologías e Instalaciones

### Tecnologías Base

* **React 18** (Vite)
* **React Router DOM v6** (Enrutamiento y Rutas Privadas por Rol)
* **Tailwind CSS v4** (Diseño Responsive Glassmorphism Lux)
* **JSON Server** (Backend REST Simulado en `db.json`)[cite: 2, 3, 4]
* **Recharts** (Visualización de Métricas y Gráficos Administrativos)
* **Lucide React** (Iconografía Semántica)
* **N8N** (Automatización de Flujos por Webhooks)

### 📦 Guía de Instalación de Dependencias

Para replicar el entorno de desarrollo desde cero en la terminal de VS Code:

```bash
# 1. Dependencias de producción
npm install react-router-dom axios recharts lucide-react

# 2. Dependencias de desarrollo e integración de Tailwind v4
npm install -D json-server tailwindcss postcss autoprefixer @tailwindcss/vite
