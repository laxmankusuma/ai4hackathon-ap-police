
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MainHome } from '@/components/MainHome';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { DashboardHome } from '@/components/Dashboard/DashboardHome';
import { UploadAudio } from '@/components/Dashboard/UploadAudio';
import { LiveVoiceAgent } from '@/components/Dashboard/LiveVoiceAgent';
import { HeatmapDashboard } from '@/components/Dashboard/HeatmapDashboard';
import { TicketManager } from '@/components/Dashboard/TicketManager';
import { Settings } from '@/components/Dashboard/Settings';

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!showDashboard) {
    return <MainHome onEnterDashboard={() => setShowDashboard(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome />;
      case 'upload':
        return <UploadAudio />;
      case 'voice-agent':
        return <LiveVoiceAgent />;
      case 'heatmap':
        return <HeatmapDashboard sidebarOpen={sidebarOpen} />;
      case 'tickets':
        return <TicketManager />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
