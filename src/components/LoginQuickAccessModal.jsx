import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { TEST_ACCESS_CREDENTIALS } from '../services/authSecurity';

const BRANCHES = ['Escazú', 'Santa Ana', 'Cartago', 'Heredia'];

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1';

/**
 * Accesos Rapidos de Prueba del Login.
 *
 * Usa pares explicitos oscuro / `light:` (marfil, cafe artesanal y cafe
 * tostado). La clase `cacique-keep-colors` indica a index.css que este
 * componente gestiona su propia paleta y no debe remapearse.
 */
export default function LoginQuickAccessModal({ onAutofill }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState('Escazú');
  const branchCredentials = TEST_ACCESS_CREDENTIALS.filter(credential => credential.sede === activeBranch);
  const administratorCredential = TEST_ACCESS_CREDENTIALS.find(credential => credential.rol === 'Administrador');
  const clientCredential = TEST_ACCESS_CREDENTIALS.find(credential => credential.rol === 'Cliente Registrado');
  const close = () => setIsOpen(false);

  return (
    <div className="cacique-keep-colors flex justify-center">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[11px] font-bold text-zinc-400 transition-colors hover:border-amber-500/30 hover:text-amber-200 active:scale-95 light:border-[#4A3525]/20 light:text-[#4F3B2D] light:hover:border-[#7A3E0A]/40 light:hover:text-[#7A3E0A] ${focusRing}`}
      >
        <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
        Accesos Rápidos de Prueba
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/75 p-4" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="test-credentials-title"
            data-testid="quick-access-modal"
            className="w-full max-w-lg space-y-4 rounded-xl border border-amber-500/30 bg-zinc-900 p-4 text-left text-zinc-100 shadow-2xl light:border-[#4A3525]/20 light:bg-[#FFFFFF] light:text-[#2C1A0E] sm:p-5"
          >
            <header className="flex items-start justify-between gap-3">
              <div>
                <h2 id="test-credentials-title" className="font-bold text-white light:text-[#2C1A0E]">Accesos de prueba</h2>
                <p className="mt-1 text-xs text-zinc-400 light:text-[#4F3B2D]">Seleccione sede y rol para autocompletar.</p>
              </div>
              <button
                type="button"
                aria-label="Cerrar accesos rápidos"
                onClick={close}
                className={`rounded-md px-2 py-1 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white active:scale-95 light:text-[#4F3B2D] light:hover:bg-[#4A3525]/10 light:hover:text-[#2C1A0E] ${focusRing}`}
              >
                ×
              </button>
            </header>

            <div role="tablist" aria-label="Sedes" className="grid grid-cols-2 gap-1 rounded-lg bg-black/30 p-1 light:bg-[#F5EFE6] sm:grid-cols-4">
              {BRANCHES.map(branch => (
                <button
                  key={branch}
                  type="button"
                  role="tab"
                  aria-selected={activeBranch === branch}
                  onClick={() => setActiveBranch(branch)}
                  className={`min-h-9 rounded-md px-2 text-xs font-bold transition-colors active:scale-95 ${focusRing} ${activeBranch === branch
                    ? 'bg-[#D16014] text-white light:bg-[#7A3E0A]'
                    : 'text-zinc-400 hover:text-white light:text-[#4F3B2D] light:hover:bg-[#E8DFD8] light:hover:text-[#2C1A0E]'}`}
                >
                  {branch}
                </button>
              ))}
            </div>

            <div role="tabpanel" className="space-y-2">
              {/* El Cliente Registrado no se duplica: se muestra solo en su
                  tarjeta dedicada del portal de fidelización. */}
              {branchCredentials
                .filter(credential => credential.rol !== 'Cliente Registrado')
                .map(credential => <CredentialOption key={credential.email} credential={credential} onAutofill={onAutofill} onClose={close} />)}
            </div>

            {administratorCredential && <CredentialOption credential={administratorCredential} onAutofill={onAutofill} onClose={close} />}

            {clientCredential && (
              <div className="space-y-1 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-2 light:border-[#0F291E]/25 light:bg-[#E8F5E9]">
                <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300 light:text-[#0F291E]">Portal de fidelización</p>
                <CredentialOption credential={clientCredential} onAutofill={onAutofill} onClose={close} />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function CredentialOption({ credential, onAutofill, onClose }) {
  return (
    <article className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-3 light:border-[#4A3525]/20 light:bg-[#F5EFE6]/60">
      <div className="min-w-0">
        <p className="text-xs font-bold text-amber-300 light:text-[#7A3E0A]">{credential.rol}</p>
        <p className="break-all font-mono text-[10px] text-zinc-300 light:text-[#4F3B2D]">{credential.email}</p>
      </div>
      <button
        type="button"
        onClick={() => { onAutofill(credential); onClose(); }}
        className={`min-h-9 shrink-0 rounded-md border border-amber-500/30 px-3 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500/10 active:scale-95 active:bg-amber-500/20 light:border-[#7A3E0A]/40 light:text-[#7A3E0A] light:hover:bg-[#7A3E0A] light:hover:text-white light:active:bg-[#5C2E07] ${focusRing}`}
      >
        Autocompletar
      </button>
    </article>
  );
}
