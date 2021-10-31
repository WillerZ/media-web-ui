import path from 'path';
import { MediaExtensions } from './constants';

export type track = {
    disc?: string;
    track?: string;
    year?: string;
    name: string;
};

export function trackFromFileName(pageName: string): track {
    const fileName = path.basename(pageName, '.html');
    const fileExtension = path.extname(fileName);
    const baseName = (fileExtension && MediaExtensions.includes(fileExtension)) ? path.basename(fileName, fileExtension) : fileName;
    {
        const matches = baseName.match(/^(\d)\.(\d\d) - (.*)/);
        if (matches) {
            return {
                disc: matches[1],
                track: matches[2],
                name: matches[3]
            };
        }
    }
    {
        const matches = baseName.match(/^(\d)(\d\d) - (.*)/);
        if (matches) {
            return {
                disc: matches[1],
                track: matches[2],
                name: matches[3]
            };
        }
    }
    {
        const matches = baseName.match(/^[SQ](\d\d) - (.*)/);
        if (matches) {
            return {
                track: matches[1],
                name: matches[2]
            };
        }
    }
    {
        const matches = baseName.match(/^(\d\d) - (.*)/);
        if (matches) {
            return {
                track: matches[1],
                name: matches[2]
            };
        }
    }
    {
        const matches = baseName.match(/^(\d) - (.*)/);
        if (matches) {
            return {
                track: matches[1],
                name: matches[2]
            };
        }
    }
    {
        const matches = baseName.match(/^(\d\d\d\d) - (.*)/);
        if (matches) {
            return {
                year: matches[1],
                name: matches[2]
            };
        }
    }
    {
        const matches = baseName.match(/^(\d\d\d\d)\.(.*)/);
        if (matches) {
            return {
                year: matches[1],
                name: matches[2]
            };
        }
    }
    return { name: baseName };
}

export function trackCompare(left: track, right: track) {
    if (left.year !== undefined && right.year !== undefined && left.year !== right.year) {
        return Number(left.year) - Number(right.year);
    }
    if (left.year === undefined && right.year !== undefined) {
        return -1;
    }
    if (left.year !== undefined && right.year === undefined) {
        return 1;
    }
    if (left.disc !== undefined && right.disc !== undefined && left.disc !== right.disc) {
        return Number(left.disc) - Number(right.disc);
    }
    if (left.disc === undefined && right.disc !== undefined) {
        return -1;
    }
    if (left.disc !== undefined && right.disc === undefined) {
        return 1;
    }
    if (left.track !== undefined && right.track !== undefined && left.track !== right.track) {
        return Number(left.track) - Number(right.track);
    }
    if (left.track === undefined && right.track !== undefined) {
        return -1;
    }
    if (left.track !== undefined && right.track === undefined) {
        return 1;
    }
    return left.name.localeCompare(right.name);
}

export function trackStringCompare(left: string, right: string) {
    return trackCompare(trackFromFileName(left), trackFromFileName(right));
}
