
import React, { useState, useEffect, useRef } from 'react';
import { Shield, Search, Bell, Settings, TriangleAlert, Ambulance, Siren, Radio } from 'lucide-react';
import { NotificationType } from '../types';

interface HeaderProps {
    setNotification: (message: string, type: NotificationType) => void;
}

const Header: React.FC<HeaderProps> = ({ setNotification }) => {
    const [isEmergencyMenuOpen, setIsEmergencyMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsEmergencyMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleActionClick = (message: string) => {
        setNotification(message, 'error');
        setIsEmergencyMenuOpen(false);
    };

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Crisis AI</h1>
          <p className="text-xs text-slate-500">Emergency Management Platform</p>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts, resources, teams..."
            className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          ALERT STATUS
        </button>
        <div className="relative">
          <button onClick={() => setNotification('Showing 7 new notifications.', 'info')} className="p-1">
            <Bell className="h-6 w-6 text-slate-500 hover:text-slate-800" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">7</span>
          </button>
        </div>
        <button onClick={() => setNotification('Settings panel opened.', 'info')} className="p-1">
           <Settings className="h-6 w-6 text-slate-500 hover:text-slate-800" />
        </button>
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsEmergencyMenuOpen(!isEmergencyMenuOpen)} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors">
              EMERGENCY
            </button>
            {isEmergencyMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-20 border">
                    <div className="p-2">
                        <p className="text-xs font-bold text-slate-500 uppercase px-2 py-1">One-Tap Action Presets</p>
                        <button onClick={() => handleActionClick('Evacuation Protocol Triggered!')} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md">
                            <TriangleAlert className="h-5 w-5 text-yellow-500" /> 🚨 Trigger Evacuation Protocol
                        </button>
                         <button onClick={() => handleActionClick('Medical Teams Dispatched!')} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md">
                            <Ambulance className="h-5 w-5 text-blue-500" /> 🚑 Dispatch Medical Teams
                        </button>
                         <button onClick={() => handleActionClick('Law Enforcement Notified!')} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md">
                            <Siren className="h-5 w-5 text-red-500" /> 🚓 Notify Law Enforcement
                        </button>
                         <button onClick={() => handleActionClick('Public Alert Broadcasted!')} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md">
                            <Radio className="h-5 w-5 text-green-500" /> 📢 Broadcast Public Alert
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
