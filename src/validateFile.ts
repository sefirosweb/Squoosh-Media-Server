import { Request, Response } from "express"
import { existsSync } from "fs"
import crypto from "crypto";
import compress from "./compress"
import { Codecs, EncodeOptions, validFiles } from "./types"
import path from "path";

export default async (req: Request, res: Response, mediaPath: string) => {
    if (!existsSync(mediaPath)) {
        res.redirect(301, '/')
        return
    }

    if (Object.keys(req.query).length === 0) {
        res.sendFile(mediaPath)
        return
    }

    const encoding: EncodeOptions = {
        path: req.path
    }

    if (typeof req.query.width === "string") {
        encoding.width = parseInt(req.query.width, 10);
    }
    if (typeof req.query.height === "string") {
        encoding.height = parseInt(req.query.height, 10);
    }
    if (typeof req.query.quality === "string") {
        encoding.quality = parseInt(req.query.quality, 10);
    }

    if (isCodec(req.query.encode)) {
        encoding.encode = req.query.encode;
    }


    const md5 = crypto.createHash('md5').update(JSON.stringify(encoding)).digest("hex")

    let found = false
    validFiles.every(validFile => {
        const cachePath = path.join(__dirname, '..', 'cache', md5 + validFile);
        if (existsSync(cachePath)) {
            res.sendFile(cachePath)
            found = true
            return false
        }
        return true
    })


    if (found) return


    try {
        const filePath = await compress(encoding, md5)
        res.sendFile(filePath)
    } catch {
        const fileError = path.join(__dirname, 'views', 'error-file.png');
        res.sendFile(fileError)
    }
}

function isCodec(req: any): req is Codecs {
    return typeof req === "string" && Object.values(Codecs).includes(req as Codecs)
}