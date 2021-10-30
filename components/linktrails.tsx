import Breadcrumb from "../components/breadcrumb";
import Track from "../components/track";
import { trackFromFileName } from '../lib/track';
import Link from 'next/link';

type linkTrailsProps = {
    path: string[]
};

export default function linkTrails({ path }: linkTrailsProps) {
    const elements = [<Link href="/" key="home"><a>Home</a></Link>];
    if (Array.isArray(path)) {
        for (var index = 0; index < path.length; ++index) {
            elements.push(
                <Breadcrumb key={index}>
                    <Link href={['', ...path.slice(0, index + 1)].join('/')}>
                        <a>
                            <Track track={trackFromFileName(path[index])} />
                        </a>
                    </Link>
                </Breadcrumb>
            );
        }
    }
    return <>{elements}</>;
}
