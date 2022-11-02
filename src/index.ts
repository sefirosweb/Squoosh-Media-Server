import express, { Express, Request, Response } from 'express';
import path from "path";

const app = express();
const port = 8080;

// Configure Express to use EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// app.get("/", (req, res) => {
//     res.render("index");
// });

app.get('/', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server');
    // tslint:disable-next-line:no-console
    console.log(req)
});

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});