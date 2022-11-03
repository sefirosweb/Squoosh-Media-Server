import path from "path";
import fs from 'fs/promises';
// @ts-ignore
import { ImagePool } from '@squoosh/lib';
import { EncodeOptions } from "./types";


export default (encodeOptions: EncodeOptions, md5: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const imagePool = new ImagePool(1);
        const filePath = path.join(__dirname, '..', 'media', 'photo.jpg');
        const cachePath = path.join(__dirname, '..', 'cache', md5);
        try {
            const image = imagePool.ingestImage(filePath);

            await image.preprocess({
                resize: {
                    enabled: true,
                    width: encodeOptions?.width ?? 1024,
                },
            });

            await image.encode({
                mozjpeg: {
                    quality: 75,
                },
                avif: {
                    cqLevel: 10,
                },
                jxl: {},
            });

            const { extension, binary } = await image.encodedWith.mozjpeg;
            await fs.writeFile(`${cachePath}.${extension}`, binary);
            await imagePool.close();
            resolve(`${cachePath}.${extension}`)
        } catch {
            reject()
        }
    })
}