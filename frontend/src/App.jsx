import { useState } from "react";
import Dashboard from "./components/Dashboard";
import TicketForm from "./components/TicketForm";
import TicketList from "./components/TicketList";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTicketCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white py-5 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">🎫 Support Ticket System</h1>
          <p className="text-indigo-200 text-sm mt-1">
            AI-powered ticket classification
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <Dashboard key={refreshKey} />
        <TicketForm onTicketCreated={handleTicketCreated} />
        <TicketList refreshKey={refreshKey} />
      </main>
    </div>
  );
}

export default App;
