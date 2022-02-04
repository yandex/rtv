import React, { useLayoutEffect, useRef } from 'react';

import AceEditor from 'react-ace';
import Popup from 'reactjs-popup';

import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/theme-github';

import Button from 'components/Button/Button';
import { ReactComponent as CrossIcon } from 'icons/close.svg';
import { ReactComponent as HelpIcon } from 'icons/question.svg';

import styles from './Params.module.css';

interface Props {
  params: string;
  defaultParams: string;
  onParamsChange: (params: string) => void;
}

const Params: React.FC<Props> = ({ params, defaultParams, onParamsChange }) => {
  const editorRef = useRef<AceEditor>();
  const rootRef = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      editorRef.current?.editor.resize();
    });

    const rootElement = rootRef.current;
    rootElement && resizeObserver.observe(rootElement);
    return () => rootElement && resizeObserver.unobserve(rootElement);
  });

  return (
    <div ref={rootRef as React.LegacyRef<HTMLDivElement>} className={styles.root}>
      <div className={styles.header}>
        <h3>Application launch params</h3>
        {defaultParams && (
          <Popup
            className="paramsPopup"
            trigger={
              <Button variant="ghost" className={styles.helpButton}>
                <HelpIcon width={16} height={16} />
              </Button>
            }
            position="right top"
            arrow={false}
          >
            {(close: () => void) => (
              <>
                <div className={styles.popupHeader}>
                  <h2 className={styles.popupTitle}>Params example in JSON5 format</h2>
                  <Button className={styles.closeButton} variant="ghost" onClick={close}>
                    <CrossIcon />
                  </Button>
                </div>
                <pre className={styles.codeSnippet}>{defaultParams}</pre>
              </>
            )}
          </Popup>
        )}
        <Button className={styles.reset} variant="secondary" onClick={() => onParamsChange(defaultParams)}>
          Reset params
        </Button>
      </div>
      <AceEditor
        ref={editorRef as React.Ref<AceEditor>}
        className={styles.editor}
        theme="github"
        mode="json5"
        value={params}
        onChange={(value) => onParamsChange(value)}
        setOptions={{
          printMargin: false,
          fontSize: 14,
          fontFamily: 'Menlo',
          useWorker: false,
        }}
        editorProps={{ $blockScrolling: true }}
        width="100%"
      />
    </div>
  );
};

export default Params;
