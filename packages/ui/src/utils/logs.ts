import { nanoid } from 'nanoid';

type LogLevel = 'error' | 'warning' | 'info';

export type LogMessage = string | object;

export type LogItem = {
  time: Date;
  message: LogMessage;
  options?: { level: LogLevel };
  id: string;
};

type LogListener = (logs: LogItem[]) => void;

let logs: LogItem[] = [];

const listeners = new Set<LogListener>();

const onLogsChange = () => {
  listeners.forEach((l) => l(logs));
};

export const addLogListener = (listener: LogListener) => {
  listeners.add(listener);
  listener(logs);
};

export const removeLogListener = (listener: LogListener) => {
  listeners.delete(listener);
};

export function log(msg: LogMessage) {
  appendLog(msg);
}

export function error(msg: LogMessage) {
  appendLog(msg, { level: 'error' });
}

export function clearLogs() {
  logs = [];
  onLogsChange();
}

function appendLog(msg: LogMessage, options?: { level: LogLevel }) {
  logs = [
    {
      time: new Date(),
      message: msg,
      options,
      id: nanoid(10),
    },
    ...logs,
  ];
  onLogsChange();
}
