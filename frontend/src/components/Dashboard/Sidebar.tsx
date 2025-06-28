
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Upload,
  Mic,
  MapPin,
  Ticket,
  Settings,
  Menu,
  X
} from 'lucide-react';

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'upload', name: 'Upload & Process Audio', icon: Upload },
  { id: 'voice-agent', name: 'Live Voice Agent Demo', icon: Mic },
  { id: 'heatmap', name: 'Heatmap Dashboard', icon: MapPin },
  { id: 'tickets', name: 'Ticket Manager', icon: Ticket },
  { id: 'settings', name: 'Settings', icon: Settings },
];

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  return (
    <>
      <div className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            {isOpen && (
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 dark:text-white">Dial 112 Emergency</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full",
                    isOpen ? "justify-start" : "justify-center px-2"
                  )}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {isOpen && <span className="ml-2">{item.name}</span>}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};
