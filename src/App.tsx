import { Planner } from './components/Planner';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Month View Task Plannerer</h1>
        </header>
        <Planner />
      </div>
    </div>
  );
}
