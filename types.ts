
export enum AlertSeverity {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    CRITICAL = 'Critical',
}

export enum AlertStatus {
    ACTIVE = 'Active',
    MONITORING = 'Monitoring',
    RESOLVED = 'Resolved',
    UPDATING = 'Updating',
}

export interface Alert {
    id: string;
    title: string;
    type: string;
    description: string;
    location: string;
    affected: number;
    lat: number;
    lng: number;
    timestamp: Date;
    severity: AlertSeverity;
    status: AlertStatus;
}

export type Tab = 'Alerts' | 'Live Map' | 'Proximity Analysis' | 'Assessment' | 'AI Risk Prediction';

export type NotificationType = 'info' | 'success' | 'error';