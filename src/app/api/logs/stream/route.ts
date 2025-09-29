import { type Alert } from '@/lib/types';
import { logEmitter } from '@/lib/log-emitter';

const hosts = ['WIN-CLIENT-02', 'WEB-SERVER-03', 'LINUX-VM-07', 'DEV-STATION-11', 'DB-SERVER-01'];
const users = ['jdoe', 'admin', 'svc_account', 'guest', 'dsmith'];
const processes = ['powershell.exe', 'cmd.exe', 'svchost.exe', 'WINWORD.EXE', 'curl.exe', 'sshd'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Data Exfiltration Scenario ---
let scenarioStep = 0;
const scenarioHost = 'WIN-CLIENT-02';
const scenarioUser = 'dsmith';
const exfilDomain = 'transfer.sh';
const exfilIp = '185.199.108.153'; // Example IP, not live
const sensitiveFile = 'C:\\Users\\dsmith\\Documents\\project_europa_brief.docx';
const stagingFile = `C:\\Users\\dsmith\\AppData\\Local\\Temp\\archive.zip`;

const scenario = [
  // 1. Discovery: User accesses a sensitive file
  () => {
    emitLog(`[file] user=${scenarioUser} host=${scenarioHost} action=read path=${sensitiveFile}`, 'INFO');
  },
  // 2. Staging: PowerShell is used to compress the file
  () => {
    emitLog(`[process] user=${scenarioUser} host=${scenarioHost} process=powershell.exe ppid=explorer.exe cmdline="powershell Compress-Archive -Path ${sensitiveFile} -DestinationPath ${stagingFile}"`, 'WARNING');
    emitAlert({
      alertType: 'FileStaging',
      host: scenarioHost,
      score: 0.78,
      mitreTactic: 'Collection',
      evidence: `powershell.exe used to create archive ${stagingFile}`,
      topRuleHits: ['Suspicious Compression Activity'],
      topFeatures: ['process:powershell.exe', 'cmdline:Compress-Archive', `file_path:${stagingFile}`],
    });
  },
  // 3. Exfiltration: Compressed file is uploaded to a known file sharing site
  () => {
    emitLog(`[net] src=${scenarioHost} dst=${exfilIp}:443 protocol=tcp bytes_sent=12582912`, 'CRITICAL');
    emitAlert({
      alertType: 'DataExfiltration',
      host: scenarioHost,
      score: 0.95,
      mitreTactic: 'Exfiltration',
      evidence: `Large upload (12.5MB) to ${exfilDomain} (${exfilIp})`,
      topRuleHits: ['Exfiltration to File Sharing Site', 'Anomalous Data Transfer Size'],
      topFeatures: [`dst_ip:${exfilIp}`, 'bytes_sent>10MB', `domain:${exfilDomain}`],
    });
  },
];

// --- Generic Log Filler ---
function createRandomLog(): string {
    const timestamp = new Date().toISOString();
    const host = getRandomElement(hosts.filter(h => h !== scenarioHost));
    const severity = 'INFO';
    const message = `[dns] query for google.com from ${host}`;
    return `${timestamp} [${severity}] ${message}`;
}


function emitLog(log: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') {
    const timestamp = new Date().toISOString();
    const formattedLog = `${timestamp} [${severity}] ${log}`;
    logEmitter.emit('log', formattedLog);
}

function emitAlert(partialAlert: Partial<Alert>) {
    const alert: Alert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        time: new Date().toISOString(),
        host: 'unknown',
        alertType: 'NetworkAnomaly',
        score: 0.5,
        mitreTactic: 'Discovery',
        srcIp: `10.0.1.${Math.floor(Math.random() * 254) + 1}`,
        dstIp: `203.0.113.${Math.floor(Math.random() * 254) + 1}`,
        evidence: 'N/A',
        status: 'New',
        ruleBasedScore: Math.random(),
        anomalyDetectionScore: Math.random(),
        supervisedClassifierScore: Math.random(),
        topRuleHits: [],
        topFeatures: [],
        ...partialAlert,
    };
    logEmitter.emit('alert', alert);
}


let logInterval: NodeJS.Timeout | null = null;
function startLogStream() {
    if (logInterval) return;

    let logCounter = 0;
    logInterval = setInterval(() => {
        // Every 15 logs, run a scenario step
        if (logCounter % 15 === 0 && scenarioStep < scenario.length) {
            scenario[scenarioStep]();
            scenarioStep++;
        } else {
            // Reset scenario after a delay
            if (scenarioStep === scenario.length && logCounter % 25 === 0) {
                 scenarioStep = 0;
                 emitLog(`[system] Scenario reset. Waiting for next execution.`, 'INFO');
            } else {
                logEmitter.emit('log', createRandomLog());
            }
        }
        logCounter++;

    }, 1500); // Send a new log every 1.5 seconds
}

function stopLogStream() {
    if (logInterval) {
        clearInterval(logInterval);
        logInterval = null;
    }
}


export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const handler = (log: string) => {
        const data = `data: ${log}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      };

      logEmitter.on('log', handler);
      
      // Start the central log generation if it's not already running
      if (logEmitter.listenerCount('log') === 1) {
          startLogStream();
      }

      // Clean up the interval when the client closes the connection
      controller.signal.addEventListener('abort', () => {
        logEmitter.off('log', handler);
        // If no clients are listening, stop the log generation
        if (logEmitter.listenerCount('log') === 0) {
            stopLogStream();
        }
        controller.close();
      });
    },
     cancel() {
        // This is called if the client aborts the connection.
        if (logEmitter.listenerCount('log') === 0) {
            stopLogStream();
        }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// This is required to enable streaming responses on Vercel
export const dynamic = 'force-dynamic';
