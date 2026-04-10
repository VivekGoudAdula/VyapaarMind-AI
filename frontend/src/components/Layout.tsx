import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MayaIntervention from './MayaIntervention';

export default function Layout() {
  return (
    <div className="flex h-screen bg-[#020617] font-sans text-white">
      <MayaIntervention />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
