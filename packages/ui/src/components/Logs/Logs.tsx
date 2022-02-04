import { useEffect, useState } from 'react';

import classNames from 'classnames';

import Button from 'components/Button/Button';
import { ReactComponent as CollapseIcon } from 'icons/collapse.svg';
import { ReactComponent as ExpandIcon } from 'icons/expand.svg';
import { ReactComponent as LogsIcon } from 'icons/logs.svg';
import { beautifyJson, formatTime } from 'utils/helpers';
import { addLogListener, removeLogListener, LogItem, clearLogs } from 'utils/logs';

import styles from './Logs.module.css';

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(true);

  useEffect(() => {
    addLogListener(setLogs);

    return () => {
      removeLogListener(setLogs);
    };
  }, []);

  return (
    <div className={styles.root}>
      <div className={isLogsOpen ? styles.headerExpanded : styles.headerCollapsed}>
        <Button className={styles.logsButton} variant="ghost" onClick={() => setIsLogsOpen(!isLogsOpen)}>
          <h3>Logs</h3>
          {isLogsOpen ? <CollapseIcon className={styles.icon} /> : <ExpandIcon className={styles.icon} />}
        </Button>
        {isLogsOpen ? (
          <Button variant="secondary" className={styles.clearLogsButton} onClick={clearLogs}>
            Clear logs
          </Button>
        ) : null}
      </div>
      <div className={isLogsOpen ? styles.contentExpanded : styles.contentCollapsed}>
        {!logs.length ? (
          <div className={styles.emptyLogsContainer}>
            <LogsIcon className={styles.logsIcon} />
            <h3>No logs yet</h3>
          </div>
        ) : (
          logs.map(({ time, message, id, options }) => (
            <div key={id} className={classNames(styles.logItem, options?.level === 'error' ? styles.error : undefined)}>
              <div className={styles.time}>{formatTime(time)}</div>
              {typeof message === 'string' ? (
                message
              ) : (
                <table>
                  <tbody className={styles.logItemContent}>
                    {Object.entries(message).map(([field, value]) => (
                      <tr className={styles.logItemRow} key={field}>
                        <td className={styles.logItemField}>{field}:</td>
                        <td className={styles.logItemValue}>
                          {typeof value === 'object' ? (
                            beautifyJson(value)
                          ) : field === 'debugUrl' ? (
                            <a href={value} target="_blank" rel="noopener noreferrer">
                              {value}
                            </a>
                          ) : (
                            String(value ?? '')
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Logs;
