import styles from './Avatar.module.css';

interface Props {
  username: string;
}

const Avatar: React.FC<Props> = ({ username }) => {
  const firstLetter = username[0].toUpperCase();
  return <div className={styles.avatar}>{firstLetter}</div>;
};

export default Avatar;
