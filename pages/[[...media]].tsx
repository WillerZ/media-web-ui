import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from 'next/head';
import Layout from "../components/layout";
import * as fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import { MediaDir } from '../lib/constants';

function linkTrails(path: string[]) {
    const elements = [<Link href="/"><a>Home</a></Link>];
    for (var index = 0; index < path.length; ++index) {
        elements.push(<Link href={['', ...path.slice(0, index + 1)].join('/')}><a>{path[index]}</a></Link>)
    }
    return elements;
}

const Media: NextPage = ({ path, subpaths }) => {
    const titleText = (Array.isArray(path) && path.length > 0) ? path.join(' > ') : 'Home';
    const TitleHtml = (Array.isArray(path) && path.length > 0) ? (
        <>
            {linkTrails(path)}
        </>
    ) : 'All';
    if (Array.isArray(subpaths)) {
        return (
            <Layout>
                <Head>
                    <title>{titleText}</title>
                </Head>
                <h1>{TitleHtml}</h1>
                <ul>
                    {subpaths.map(p => (<li key={p}><Link href={[...path, p].join('/')}><a>{p}</a></Link></li>))}
                </ul>
            </Layout>
        );
    } else {
        return (
            <Layout>
                <Head>
                    <title>{titleText}</title>
                </Head>
                <h1>{TitleHtml}</h1>
                <video controls autoPlay src={['', ...path].join('/')} />
            </Layout>
        );
    }
}

export default Media;

export const getStaticProps: GetStaticProps = async (context) => {
    const { params } = context;
    const { media } = params;
    console.log('Before', JSON.stringify(media));
    if (Array.isArray(media) && media.length > 0) {
        media[media.length - 1] = path.basename(media[media.length - 1], '.html');
    }
    console.log('After', JSON.stringify(media));
    const mediaPath = media ? path.join(MediaDir, media.join(path.sep)) : MediaDir;
    try {
        const contents = await fs.readdir(mediaPath, { withFileTypes: true });
        const subpaths = contents.map(dent => dent.isDirectory() ? dent.name : dent.name + '.html');
        return { props: { path: media ? media : [], subpaths } };
    } catch (e) {
        if (e.code !== 'ENOTDIR') {
            throw (e);
        }
        return { props: { path: media ? media : [] } };
    }
};

async function spiderPaths(spiderpath: string): [string] {
    const contents = await fs.readdir(spiderpath, { withFileTypes: true });
    const result = [];
    for (const dent of contents) {
        const fullPath = path.join(spiderpath, dent.name);
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
    console.log('Paths', JSON.stringify(paths));
    return {
        paths,
        fallback: false
    };
};