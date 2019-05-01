"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
module.exports = function (app) {
    app.get("/api/proxy", async (req, res) => {
        try {
            let url = req.query.url;
            let Cookie = req.query.cookie;
            let result = await node_fetch_1.default(url, { headers: { Cookie } });
            res.send(await result.text());
        }
        catch (err) {
            console.error(err);
            res.status(500).end();
        }
    });
};
