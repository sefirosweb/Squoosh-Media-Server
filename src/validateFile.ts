import { Request, Response } from "express"
import { existsSync } from "fs"
import crypto from "crypto";
import compress from "./compress"
import { EncodeOptions } from "./types"
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


    const md5 = crypto.createHash('md5').update(JSON.stringify(encoding)).digest("hex")
    const cachePath = path.join(__dirname, '..', 'cache', md5 + '.jpg');
    if (existsSync(cachePath)) {
        res.sendFile(cachePath)
        return
    }

    const filePath = await compress(encoding, md5)
    res.sendFile(filePath)
}