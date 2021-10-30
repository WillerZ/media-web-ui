import type { track } from '../lib/track';
import styles from './track.module.css';

type trackProps = {
    track: track
};

export default function track({track} : trackProps) {
    const result = [];
    if (track.year !== undefined) { result.push(<span key="year" className={styles.year}>{track.year}</span>); }
    if (track.disc !== undefined) { result.push(<span key="disc" className={styles.disc}>{track.disc}</span>); }
    if (track.track !== undefined) { result.push(<span key="track" className={styles.track}>{track.track}</span>); }
    result.push(<span key="name" className={styles.name}>{track.name}</span>);
    return (<>{result}</>);
}
