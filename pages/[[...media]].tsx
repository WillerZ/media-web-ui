import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from 'next/head';
import Layout from "../components/layout";
import * as fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';

const MediaDir = '/home/willerz/Videos';

const Media: NextPage = ({ path, subpaths }) => {
    const title = (Array.isArray(path) && path.length > 0) ? path.join(' > ') : 'All';
    if (Array.isArray(subpaths)) {
        return (
            <Layout>
                <Head>
                    <title>{title}</title>
                </Head>
                <h1>{title}</h1>
                <ul>
                    {subpaths.map(p => (<li key={p}><Link href={[...path, p].join('/')}><a>{p}</a></Link></li>))}
                </ul>
            </Layout>
        );
    } else {
        return (
            <Layout>
                <Head>
                    <title>{title}</title>
                </Head>
                <h1>{title}</h1>
                <video src={[...path].join('/')} />
            </Layout>
        );
    }
}

export default Media;

export const getStaticProps: GetStaticProps = async (context) => {
    const { params } = context;
    const { media } = params;
    const mediaPath = media ? path.join(MediaDir, media.join(path.sep)) : MediaDir;
    try {
        const contents = await fs.readdir(mediaPath, { withFileTypes: true });
        const subpaths = contents.map(dent => dent.name);
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
        result.push(fullPath);
        if (dent.isDirectory()) {
            result.push(...await spiderPaths(fullPath));
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