import path from "path";
import fs from 'fs/promises';
// @ts-ignore
import { ImagePool } from '@squoosh/lib';
import { Codecs, EncodeOptions } from "./types";


export default (encodeOptions: EncodeOptions, md5: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const imagePool = new ImagePool(1);
        const filePath = path.join(__dirname, '..', 'media', encodeOptions.path);
        const cachePath = path.join(__dirname, '..', 'cache', md5);
        try {
            const image = imagePool.ingestImage(filePath);
            const codec = encodeOptions.encode ?? Codecs.mozjpeg
            // tslint:disable-next-line:no-console
            console.log('Compresion start ', encodeOptions.path)
            await image.preprocess({
                resize: {
                    width: encodeOptions?.width ?? 1024,
                    height: encodeOptions?.height ?? null,
                },
            });

            const encode: any = {};

            if (codec === Codecs.avif) {
                encode.avif = {
                    cqLevel: 10,
                }
            }

            if (codec === Codecs.jxl) {
                encode.jxl = {}
            }

            if (codec === Codecs.webp) {
                encode.webp = {}
            }

            if (codec === Codecs.mozjpeg) {
                encode.mozjpeg = {
                    quality: encodeOptions.quality ?? 75,
                }
            }

            await image.encode(encode);

            const { extension, binary } = await image.encodedWith[codec];
            await fs.writeFile(`${cachePath}.${extension}`, binary);
            await imagePool.close();
            // tslint:disable-next-line:no-console
            console.log(`Compresion completed: ${encodeOptions.path}`)
            resolve(`${cachePath}.${extension}`)
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.error(e)
            reject(e)
        }
    })
}