// Importamos nuestro componente principal (ajusta la ruta según tu carpeta)
import { useEffect } from 'react';
import { PosScreen } from './components/PosScreen';
import { syncTickets } from './database/sync';

const SYNC_INTERVAL_MS = 30_000;

function App() {
  // Reintento periódico en segundo plano por si el primer intento (tras el cobro) falló
  useEffect(() => {
    syncTickets();
    const interval = setInterval(syncTickets, SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    // Usamos una etiqueta semántica <main> y aseguramos que ocupe toda la pantalla
    <main className="min-h-screen bg-[#FAF8F5]">
      <PosScreen />
    </main>
  );
}

export default App;