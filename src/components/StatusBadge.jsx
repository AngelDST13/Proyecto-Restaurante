/* eslint-disable react-refresh/only-export-components -- STATUS_CONFIG se comparte con las pruebas */
import { CheckCircle2, XCircle, Clock, CircleAlert } from 'lucide-react';

/**
 * Distintivo de estado que nunca depende solo del color.
 * Cada estado combina icono SVG de Lucide + texto, de modo que sea legible
 * bajo cualquier filtro de daltonismo y con lectores de pantalla.
 */

const STATUS_CONFIG = {
  disponible: {
    label: 'Disponible',
    Icon: CheckCircle2,
    className: 'border-emerald-600/40 bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
  },
  noDisponible: {
    label: 'No Disponible',
    Icon: XCircle,
    className: 'border-rose-600/40 bg-rose-950/40 text-rose-700 dark:text-rose-400',
  },
  pendiente: {
    label: 'Pendiente',
    Icon: Clock,
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  alerta: {
    label: 'Alerta',
    Icon: CircleAlert,
    className: 'border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-400',
  },
};

export default function StatusBadge({ status = 'disponible', label, className = '' }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.disponible;
  const { Icon } = config;
  const text = label ?? config.label;

  return (
    <span
      data-status={status}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${config.className} ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{text}</span>
      {text !== config.label && <span className="sr-only">{config.label}</span>}
    </span>
  );
}

export { STATUS_CONFIG };