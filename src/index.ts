import dotenv from "dotenv";
import express from "express";
import path from "path";
import fs from 'fs/promises';
import { existsSync } from 'fs';
import crypto from "crypto";

dotenv.config();
const port = process.env.SERVER_PORT ?? 8080;
const app = express();

// Configure Express to use EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// @ts-ignore
import { ImagePool } from '@squoosh/lib';

type EncodeOptions = {
    width?: number
}

const compress = (encodeOptions: EncodeOptions, md5: string): Promise<string> => {
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

app.get("/*", async (req, res) => {
    // res.render("index");
    const query = req.query
    console.log(query)

    const encoding = {
        width: parseInt(req.query.width as string ?? '1024')
    }

    const md5 = crypto.createHash('md5').update(JSON.stringify(encoding)).digest("hex")
    const cachePath = path.join(__dirname, '..', 'cache', md5 + '.jpg');
    if (existsSync(cachePath)) {
        res.sendFile(cachePath)
        return
    }

    const filePath = await compress(encoding, md5)
    res.sendFile(filePath)
});

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});