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
