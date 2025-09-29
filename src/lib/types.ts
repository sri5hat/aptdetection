export type AlertStatus = 'New' | 'Investigating' | 'Resolved';

export type MitreTactic =
  | 'Exfiltration'
  | 'Initial Access'
  | 'Lateral Movement'
  | 'Persistence'
  | 'Discovery'
  | 'Collection'
  | 'Command and Control';

export type AlertType =
  | 'DataExfiltration'
  | 'FileStaging'
  | 'NetworkAnomaly'
  | 'ProcessAnomaly'
  | 'LateralMovement'
  | 'Beaconing'
  | 'FileAccess';

export interface Alert {
  id: string;
  time: string;
  host: string;
  alertType: AlertType;
  score: number;
  mitreTactic: MitreTactic;
  srcIp: string;
  dstIp: string;
  evidence: string;
  status: AlertStatus;
  // For AI explainability
  ruleBasedScore: number;
  anomalyDetectionScore: number;
  supervisedClassifierScore: number;
  topRuleHits: string[];
  topFeatures: string[];
}
