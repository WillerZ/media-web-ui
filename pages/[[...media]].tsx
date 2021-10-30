import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from 'next/head';
import Breadcrumb from "../components/breadcrumb";
import * as fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import { MediaDir } from '../lib/constants';

function linkTrails(path: string[]) {
    const elements = [<Link href="/" key="home"><a>Home</a></Link>];
    for (var index = 0; index < path.length; ++index) {
        elements.push(<Breadcrumb key={index}><Link href={['', ...path.slice(0, index + 1)].join('/')}><a>{path[index]}</a></Link></Breadcrumb>)
    }
    return elements;
}

type MediaProps = {
    path: string[],
    subpaths?: string[]
};

const Media: NextPage<MediaProps> = ({ path, subpaths } : MediaProps) => {
    const titleText = (path.length > 0) ? path.join(' > ') : 'Home';
    const TitleHtml = (path.length > 0) ? (
        <>
            {linkTrails(path)}
        </>
    ) : 'All';
    if (Array.isArray(subpaths)) {
        return (
            <>
                <Head>
                    <title>{titleText}</title>
                </Head>
                <ul>
                    {subpaths.map(p => (<li key={p}><Link href={[...path, p].join('/')}><a>{p}</a></Link></li>))}
                </ul>
                <h1>{TitleHtml}</h1>
            </>
        );
    } else {
        return (
            <>
                <Head>
                    <title>{titleText}</title>
                </Head>
                <video controls autoPlay src={['', ...path].join('/')} />
                <h1>{TitleHtml}</h1>
            </>
        );
    }
}

export default Media;

type MediaParams = {
    media?: string[]
};

export const getStaticProps: GetStaticProps = async (context) => {
    const { params } = context;
    const { media } = params as MediaParams;
    if (Array.isArray(media) && media.length > 0) {
        media[media.length - 1] = path.basename(media[media.length - 1], '.html');
    }
    const mediaPath = media ? path.join(MediaDir, media.join(path.sep)) : MediaDir;
    try {
        const contents = await fs.readdir(mediaPath, { withFileTypes: true });
        const subpaths = contents.map(dent => dent.isDirectory() ? dent.name : dent.name + '.html');
        return { props: { path: media ? media : [], subpaths } };
    } catch (e) {
        const err = e as {code: string};
        if (err.code !== 'ENOTDIR') {
            throw (e);
        }
        return { props: { path: media ? media : [] } };
    }
};

async function spiderPaths(spiderpath: string): Promise<string[]> {
    const contents = await fs.readdir(spiderpath, { withFileTypes: true });
    const result = [];
    for (const dent of contents) {
        const fullPath = path.join(spiderpath, dent.name.replace('\!', '!'));
        if (dent.isDirectory()) {
            result.push(fullPath);
            result.push(...await spiderPaths(fullPath));
        } else {
            result.push(fullPath + '.html');
        }
    }
    return result;
};

export const getStaticPaths: GetStaticPaths = async () => {
    const allPaths = [...await spiderPaths(MediaDir)];
    const paths = [{ params: { media: [] } }, ...allPaths.map(fullPath => {
        return { params: { media: path.relative(MediaDir, fullPath).split(path.sep) } };
    })];
    return {
        paths,
        fallback: false
    };
};