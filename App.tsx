
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import StatCards from './components/StatCards';
import NavTabs from './components/NavTabs';
import AlertsSection from './components/AlertsSection';
import NewAlertModal from './components/NewAlertModal';
import EditAlertModal from './components/EditAlertModal';
import LiveMap from './components/LiveMap';
import ProximityAnalysisSection from './components/ProximityAnalysisSection';
import AssessmentSection from './components/AssessmentSection';
import AlertDetailsModal from './components/AlertDetailsModal';
import Notification from './components/Notification';
import Chatbot from './components/Chatbot';
import { statCardData } from './constants';
import { Alert, Tab, AlertStatus, NotificationType, AlertSeverity } from './types';
import { getAlerts, createAlert as apiCreateAlert, updateAlert as apiUpdateAlert } from './services/apiService';
import { getChatbotResponse } from './services/geminiService';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Alerts');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [viewingAlert, setViewingAlert] = useState<Alert | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string, parts: { text: string }[] }[]>([
    {
      role: 'model',
      parts: [{ text: "Hello! I'm your Health & Disaster Expert. How can I assist you with crisis management, first aid, or emergency planning today?" }],
    },
  ]);

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const fetchedAlerts = await getAlerts();
        setAlerts(fetchedAlerts);
      } catch (error) {
        showNotification('Failed to load alerts. Please try again later.', 'error');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const handleNewAlert = async (alertData: Omit<Alert, 'id' | 'timestamp'>) => {
    try {
      const newAlert = await apiCreateAlert(alertData);
      setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
      showNotification(`New alert "${newAlert.title}" has been successfully created.`, 'success');
    } catch (error) {
      showNotification('Failed to create alert. Please try again.', 'error');
      console.error(error);
    }
  };
  
  const handleUpdateAlert = async (updatedAlert: Alert) => {
    try {
        const savedAlert = await apiUpdateAlert(updatedAlert);
        setAlerts(prevAlerts => prevAlerts.map(alert => alert.id === savedAlert.id ? savedAlert : alert));
        showNotification(`Alert "${savedAlert.title}" has been successfully updated.`, 'success');
    } catch (error) {
        showNotification('Failed to update alert. Please try again.', 'error');
        console.error(error);
    }
  };

  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({ message, type });
  };

  const handleSendMessage = async (message: string) => {
    const userMessage = { role: 'user', parts: [{ text: message }] };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const response = await getChatbotResponse(message, chatHistory);
      const modelMessage = { role: 'model', parts: [{ text: response }] };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        const modelErrorMessage = { role: 'model', parts: [{ text: `Error: ${errorMessage}` }] };
        setChatHistory(prev => [...prev, modelErrorMessage]);
        showNotification(errorMessage, 'error');
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status === AlertStatus.ACTIVE);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = (
            alert.title.toLowerCase().includes(searchLower) ||
            alert.description.toLowerCase().includes(searchLower) ||
            alert.type.toLowerCase().includes(searchLower) ||
            alert.location.toLowerCase().includes(searchLower)
        );
        const matchesSeverity = severityFilter === 'All' || alert.severity === severityFilter;
        const matchesStatus = statusFilter === 'All' || alert.status === statusFilter;

        return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [alerts, searchQuery, severityFilter, statusFilter]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <Header setNotification={showNotification} />
      <main className="p-4 sm:p-6 lg:p-8">
        <StatCards stats={statCardData} />
        <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {isLoading ? (
          <div className="mt-6 text-center">Loading alerts...</div>
        ) : (
          <>
            {activeTab === 'Alerts' && (
              <AlertsSection 
                alerts={filteredAlerts} 
                onNewAlertClick={() => setIsModalOpen(true)}
                onViewDetails={setViewingAlert}
                onEditAlert={setEditingAlert}
                setNotification={showNotification}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                severityFilter={severityFilter}
                setSeverityFilter={setSeverityFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            )}
            {activeTab === 'Live Map' && (
              <LiveMap alerts={activeAlerts} setNotification={showNotification} />
            )}
            {activeTab === 'Proximity Analysis' && (
              <ProximityAnalysisSection alerts={activeAlerts} setNotification={showNotification} />
            )}
            {activeTab === 'Assessment' && (
              <AssessmentSection alerts={alerts} setNotification={showNotification} />
            )}
            {activeTab === 'AI Risk Prediction' && (
                <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-4">{activeTab}</h2>
                    <p className="text-slate-600">This is a placeholder for the {activeTab} section. Functionality would be built out here.</p>
                </div>
            )}
          </>
        )}
      </main>
      {isModalOpen && <NewAlertModal onClose={() => setIsModalOpen(false)} onAddAlert={handleNewAlert} />}
      {editingAlert && <EditAlertModal alert={editingAlert} onClose={() => setEditingAlert(null)} onUpdateAlert={handleUpdateAlert} />}
      {viewingAlert && <AlertDetailsModal alert={viewingAlert} onClose={() => setViewingAlert(null)} />}
      {notification && 
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      }
      <Chatbot
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
        messages={chatHistory}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}