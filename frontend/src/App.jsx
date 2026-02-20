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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
 
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                  Support Ticket System
                </h1>
                
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
            <span className="text-sm text-slate-500">Live Overview</span>
          </div>
          <Dashboard key={refreshKey} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                New Ticket
              </h2>
              <p className="text-sm text-slate-500">
                Create a new support request
              </p>
            </div>
            <TicketForm onTicketCreated={handleTicketCreated} />
          </section>

          <section className="lg:col-span-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Tickets
                </h2>
                <p className="text-sm text-slate-500">
                  Manage and track issues
                </p>
              </div>
            </div>
            <TicketList refreshKey={refreshKey} />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
