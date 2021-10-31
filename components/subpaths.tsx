import Track from "../components/track";
import Link from 'next/link';
import { trackFromFileName } from '../lib/track';
import styles from './subpaths.module.css';

type subpathsProps = {
    path: string[];
    subpaths: string[];
};

export default function subpaths({ path, subpaths }: subpathsProps) {
    return (
        <div className={styles.list}>
            {subpaths.map(
                p => (
                    <Link key={p} href={[...path, p].map(encodeURIComponent).join('/')}>
                        <a>
                            <div className={styles.entry}>
                                <Track track={trackFromFileName(p)} />
                            </div>
                        </a>
                    </Link>
                )
            )}
        </div>
    );
}
