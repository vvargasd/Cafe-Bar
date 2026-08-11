// Importamos nuestro componente principal (ajusta la ruta según tu carpeta)
import { PosScreen } from './components/PosScreen';

function App() {
  return (
    // Usamos una etiqueta semántica <main> y aseguramos que ocupe toda la pantalla
    <main className="min-h-screen bg-[#FAF8F5]">
      <PosScreen />
    </main>
  );
}

export default App;