"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Send, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { logout } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadData = async () => {
    try {
      const [walletRes, historyRes] = await Promise.all([
        apiFetch('/wallet/balance'),
        apiFetch('/wallet/history'),
      ]);
      setWallet(walletRes);
      setHistory(historyRes);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await apiFetch('/wallet/transfer', {
        method: 'POST',
        body: JSON.stringify({ receiverEmail, amount: parseFloat(amount) }),
      });
      setMsg({ text: '✅ Transferencia enviada con éxito', type: 'success' });
      setReceiverEmail('');
      setAmount('');
      loadData();
    } catch (err: any) {
      setMsg({ text: `❌ ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando billetera...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 p-6">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-green-500">
            VERSA <span className="text-xs text-gray-500 font-normal">Billetera Digital</span>
          </h1>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20 transition"
        >
          <LogOut size={14} /> Cerrar Sesión
        </button>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-green-900/20 to-gray-900 border border-green-500/30 rounded-2xl p-6 shadow-xl">
          <p className="text-xs font-semibold text-gray-400 mb-2">💰 SALDO DISPONIBLE</p>
          <p className="text-4xl font-extrabold text-white mb-6">
            ${wallet ? Number(wallet.balanceUSD).toFixed(2) : '0.00'}
            <span className="text-sm font-normal text-gray-400 ml-1">USD</span>
          </p>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Dirección:</p>
            <p className="text-xs text-green-400 font-mono break-all">{wallet?.address || 'Cargando...'}</p>
          </div>
        </div>

        {/* Transfer Form */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Send size={20} className="text-green-500" /> Enviar Dinero
          </h2>

          {msg && (
            <div
              className={`text-xs p-4 rounded-lg mb-4 font-semibold ${
                msg.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleTransfer} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Email del destinatario</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Monto (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-green-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-black font-bold py-3 rounded-lg text-sm transition duration-200"
            >
              {loading ? '⏳ Procesando...' : '✓ Transferir Ahora'}
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History */}
      <div className="max-w-5xl mx-auto mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">📊 Historial de Transacciones</h2>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No hay transacciones registradas.</p>
            <p className="text-gray-600 text-xs mt-2">¡Realiza tu primera transferencia!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((tx: any) => (
              <div
                key={tx.id}
                className="flex justify-between items-center bg-gray-800/40 p-4 rounded-lg border border-gray-800 hover:border-green-500/30 transition"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    <span className="text-green-400">De:</span> {tx.sender.email} <span className="text-gray-600">➔</span> <span className="text-green-400">Para:</span> {tx.receiver.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(tx.createdAt).toLocaleString('es-ES')}</p>
                </div>
                <span className="text-lg font-bold text-green-400 whitespace-nowrap ml-4">${Number(tx.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
