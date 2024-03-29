/**
 * __dirname - Typescript doesn't support Node module global __filename and __dirname. This module
 * implements and exports them so that they can be used as if they were native Node implementations.
 */

import { dirname } from 'path';
import { fileURLToPath } from 'url';

interface Meta {
    url: string
}

export default function fileDirName(meta: Meta) {
    const __filename = fileURLToPath(meta.url);
    const __dirname = dirname(__filename);
    return { __dirname, __filename };
}
