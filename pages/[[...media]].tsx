import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from 'next/head';
import LinkTrails from "../components/linktrails";
import Subpaths from "../components/subpaths";
import * as fs from 'fs/promises';
import path from 'path';
import { MediaDir, MediaExtensions, AudioExtensions } from '../lib/constants';
import assert from "assert";

type MediaProps = {
    path: string[],
    MediaElement?: 'video' | 'audio',
    mediaProps?: object,
    subpaths?: string[]
};

const Media: NextPage<MediaProps> = ({ path, subpaths, MediaElement, mediaProps }: MediaProps) => {
    const titleText = (path.length > 0) ? path.join(' > ') : 'Home';
    if (Array.isArray(subpaths)) {
        return (
            <>
                <Head>
                    <title>{titleText}</title>
                </Head>
                <Subpaths path={path} subpaths={subpaths} />
                <h1>
                    <LinkTrails path={path} />
                </h1>
            </>
        );
    } else {
        assert(MediaElement !== undefined);
        return (
            <>
                <Head>
                    <title>{titleText}</title>
                </Head>
                <MediaElement controls autoPlay src={['', ...path].join('/')} {...mediaProps} />
                <h1>
                    <LinkTrails path={path} />
                </h1>
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
        const contents = (await fs.readdir(mediaPath, { withFileTypes: true }))
            .filter(dent => dent.isDirectory() || MediaExtensions.includes(path.extname(dent.name)));
        const subpaths = contents.map(dent => dent.isDirectory() ? dent.name : dent.name + '.html');
        return { props: { path: media ? media : [], subpaths } };
    } catch (e) {
        const err = e as { code: string };
        if (err.code !== 'ENOTDIR') {
            throw (e);
        }
        assert(!!media);
        const MediaElement = AudioExtensions.includes(path.extname(media[media.length - 1])) ? 'audio' : 'video';
        return { props: { path: media, MediaElement } };
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