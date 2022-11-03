import dotenv from "dotenv";
import express from "express";
import path from "path";
import fs from 'fs/promises';
import { readdirSync, existsSync, lstatSync } from 'fs';
import crypto from "crypto";

dotenv.config();
const port = process.env.SERVER_PORT ?? 8080;
const app_url = process.env.APP_URL ?? `http://localhost:${port}`;
const app = express();

// Configure Express to use EJS
app.set("views", path.join(__dirname, "views", "pages"));
app.set("view engine", "ejs");

// @ts-ignore
import { ImagePool } from '@squoosh/lib';

type EncodeOptions = {
    path: string
    width?: number
}

type Breadcrumb = {
    path: string,
    title: string,
    active: boolean
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

const validFiles = ['.jpg', '.png']

app.get("/*", async (req, res) => {
    // console.log(new Date)
    // console.log({
    //     path: req.path,
    //     query: req.query,
    // })
    const mediaPath = path.join(__dirname, '..', 'media', decodeURI(req.path));


    if (validFiles.includes(path.extname(req.path))) {
        if (!existsSync(mediaPath)) {
            res.redirect(301, '/')
            return
        }

        const encoding: EncodeOptions = {
            path: req.path,
            width: parseInt(req.query.width as string ?? '252')
        }

        const md5 = crypto.createHash('md5').update(JSON.stringify(encoding)).digest("hex")
        const cachePath = path.join(__dirname, '..', 'cache', md5 + '.jpg');
        if (existsSync(cachePath)) {
            res.sendFile(cachePath)
            return
        }

        const filePath = await compress(encoding, md5)
        res.sendFile(filePath)
        return
    }

    if (!existsSync(mediaPath) || !lstatSync(mediaPath).isDirectory()) {
        res.redirect(301, '/')
        return
    }

    const folders = readdirSync(mediaPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())

    const files = readdirSync(mediaPath, { withFileTypes: true })
        .filter(dirent => !dirent.isDirectory())
        .filter(dirent => validFiles.includes(path.extname(dirent.name)))

    const relativePath = req.path === '/' ? '' : req.path
    let breadcrumbAcumulate = ''
    const breadcrumb: Array<Breadcrumb> = relativePath
        .split("/")
        .filter(p => p !== '')
        .map((path) => {
            breadcrumbAcumulate += path + '/'
            return {
                title: path,
                path: breadcrumbAcumulate,
                active: false
            }
        })

    breadcrumb.unshift({
        title: 'home',
        path: '',
        active: false
    })

    if (breadcrumb.length !== 0) {
        breadcrumb[breadcrumb.length - 1].active = true
    }

    res.render("layout", {
        app_url,
        path: relativePath,
        folders,
        foldersArray: breadcrumb,
        files
    });
});

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at ${app_url}`);
});