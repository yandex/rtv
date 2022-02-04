import { useState } from 'react';

import AceEditor from 'react-ace';
import Popup from 'reactjs-popup';

import Button from 'components/Button/Button';
import { EditorMode } from 'components/Table/types';
import { ReactComponent as ChevronRightIcon } from 'icons/chevron-right.svg';
import { ReactComponent as CrossIcon } from 'icons/close.svg';

import styles from './CodeEditorModal.module.css';

import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';

interface Props {
  title: string;
  initialText: string;
  defaultText: string;
  mode: EditorMode;
  onSave: (text: string) => void;
}

const CodeEditorModal: React.FC<Props> = ({ title, initialText, defaultText, mode, onSave }) => {
  const [text, setText] = useState(initialText);
  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);
  const saveAndClose = () => {
    onSave(text);
    setOpen(false);
  };

  return (
    <>
      <Button className={styles.iconButton} variant="ghost" onClick={openModal}>
        <ChevronRightIcon className={styles.chevronIcon} />
      </Button>
      <Popup open={open} modal closeOnDocumentClick={false} className="codeEditorPopup" onClose={() => setOpen(false)}>
        <Button className={styles.closeButton} variant="ghost" onClick={() => setOpen(false)}>
          <CrossIcon width={24} height={24} />
        </Button>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.editorContainer}>
          <AceEditor
            className={styles.editor}
            theme="github"
            mode={mode}
            value={text}
            width="100%"
            defaultValue={initialText || defaultText}
            setOptions={{ printMargin: false, fontSize: 14, fontFamily: 'Menlo', useWorker: false }}
            onChange={setText}
            editorProps={{ $blockScrolling: true }}
          />
        </div>
        <div className={styles.buttonContainer}>
          <Button className={styles.button} variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button className={styles.button} onClick={saveAndClose}>
            Save
          </Button>
        </div>
      </Popup>
    </>
  );
};

export default CodeEditorModal;
