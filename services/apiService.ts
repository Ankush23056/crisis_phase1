
import { Alert } from '../types';
import { initialAlerts } from '../constants';

const ALERTS_STORAGE_KEY = 'crisis_ai_alerts';

// Helper function to get alerts from localStorage
const getAlertsFromStorage = (): Alert[] => {
    const alertsJson = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (alertsJson) {
        // Parse and convert timestamp strings back to Date objects
        return JSON.parse(alertsJson).map((alert: any) => ({
            ...alert,
            timestamp: new Date(alert.timestamp)
        }));
    }
    // If no alerts in storage, seed with initial data
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(initialAlerts));
    return initialAlerts;
};

// Helper function to save alerts to localStorage
const saveAlertsToStorage = (alerts: Alert[]) => {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
};

export const getAlerts = async (): Promise<Alert[]> => {
    // We wrap this in a promise to mimic an API call and avoid blocking the main thread.
    const alerts = getAlertsFromStorage();
    return Promise.resolve(alerts);
};

export const createAlert = async (alertData: Omit<Alert, 'id' | 'timestamp'>): Promise<Alert> => {
    const currentAlerts = getAlertsFromStorage();
    
    const newAlert: Alert = {
        ...alertData,
        id: `alert-${Date.now()}`,
        timestamp: new Date(),
    };

    const updatedAlerts = [newAlert, ...currentAlerts];
    saveAlertsToStorage(updatedAlerts);

    return Promise.resolve(newAlert);
};

export const updateAlert = async (updatedAlert: Alert): Promise<Alert> => {
    const currentAlerts = getAlertsFromStorage();
    
    const alertIndex = currentAlerts.findIndex(alert => alert.id === updatedAlert.id);

    if (alertIndex === -1) {
        throw new Error("Alert not found");
    }

    currentAlerts[alertIndex] = updatedAlert;
    saveAlertsToStorage(currentAlerts);

    return Promise.resolve(updatedAlert);
};
