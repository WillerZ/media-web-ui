import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from 'next/head';
import Link from 'next/link';
import LinkTrails from "../components/linktrails";
import Subpaths from "../components/subpaths";
import * as fs from 'fs/promises';
import path from 'path';
import { MediaDir, MediaExtensions, AudioExtensions, SkipFolders } from '../lib/constants';
import { trackStringCompare } from "../lib/track";
import assert from "assert";
import { useRouter } from "next/dist/client/router";

type MediaProps = {
    path: string[],
    MediaElement?: 'video' | 'audio',
    mediaProps?: object,
    subpaths?: string[],
    nextPage?: string
};

const Media: NextPage<MediaProps> = ({ path, subpaths, MediaElement, mediaProps, nextPage }: MediaProps) => {
    const router = useRouter();
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
        const onEnded = nextPage ? () => { console.log('Pushing', nextPage); router.push(nextPage); } : undefined;
        const nextLink = nextPage ? (
            <Link href={nextPage}>
                <a>
                    <span className="material-icons">
                        skip_next
                    </span>
                </a>
            </Link>
        ) : null;
        return (
            <>
                <Head>
                    <title>{titleText}</title>
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
                </Head>
                <MediaElement controls autoPlay onEnded={onEnded} src={['', ...path].map(encodeURIComponent).join('/')} {...mediaProps} />
                {nextLink}
                <h1>
                    <LinkTrails path={path} />
                </h1>
            </>
        );
    }
}

export default Media;

type MediaParams = {
    media: string[]
};

export const getStaticProps: GetStaticProps = async (context) => {
    const { params } = context;
    const { media } = params as MediaParams;
    if (Array.isArray(media) && media.length > 0) {
        media[media.length - 1] = media[media.length - 1].replace(/\.html$/, '');
    }
    const mediaPath = media ? path.join(MediaDir, media.join(path.sep)) : MediaDir;
    try {
        const contents = (await fs.readdir(mediaPath, { withFileTypes: true }))
            .filter(dent => !SkipFolders.includes(dent.name) && (dent.isDirectory() || MediaExtensions.includes(path.extname(dent.name))));
        const subpaths = contents.map(dent => dent.isDirectory() ? dent.name : dent.name + '.html').sort(trackStringCompare);
        return { props: { path: media ? media : [], subpaths } };
    } catch (e) {
        const err = e as { code: string };
        if (err.code !== 'ENOTDIR') {
            throw (e);
        }
        assert(!!media);
        const MediaElement = AudioExtensions.includes(path.extname(media[media.length - 1])) ? 'audio' : 'video';
        let nextPage;
        try {
            const contents = (await fs.readdir(path.dirname(mediaPath), { withFileTypes: true }))
                .filter(dent => !dent.isDirectory() && MediaExtensions.includes(path.extname(dent.name)))
                .map(dent => dent.name)
                .sort(trackStringCompare);
            const thisPageIndex = contents.indexOf(media[media.length - 1]);
            if (thisPageIndex >= 0 && thisPageIndex < contents.length - 1) {
                nextPage = ['', ...media.slice(0, media.length - 1), contents[thisPageIndex + 1] + '.html'].map(encodeURIComponent).join('/');
            }
        } catch (e2) {
            // Disregard, chaining is not critical
        }
        return { props: { path: media, MediaElement, nextPage: nextPage ? nextPage : null }, revalidate: 120 };
    }
};

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = [{ params: { media: [] } }];
    return {
        paths,
        fallback: 'blocking'
    };
};