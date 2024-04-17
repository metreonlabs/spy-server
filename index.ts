import cors from "cors";
import Route from "./routes";
import express from "express";
import mongoose from "mongoose";
import DbConfig from "./configs/db.config";
import Index from "./events";
import { Controller } from "./controllers";

const app = express();

const corsOptions = {
    // origin: ""
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const route = new Route();
const index = new Index();

mongoose.connect(DbConfig.url)
    .then(() => {
        console.log("Connected to the database!");

        route.init(app);
        index.listen();

        // test bridge
        const controller = new Controller();
        controller.processMessages([{
            messageId: '0xdc9687b0e72f65543213f1d3bbacd0c860b040b0e516bdc9bd9e3b835febf7ff',
            status: 0,
            fromTrxHash: '0x87aaa337be102c874a4551182a67a86c3c0ec8e17a17a1fab237cf4848a3c77e',
            fee: '640000000000000',
            feeToken: '0x0000000000000000000000000000000000000000',
            sequenceNumber: 5,
            fromChainId: 463,
            toChainId: 56,
            sender: '0x5c3bA76382E26b9f3a2d22CB33cb44Ad4b144643',
            receiver: '0x8347533ec822aA34204776c9D3f910f96abDc939',
            tokens: [
                {
                    tokenId: '0x6Ad70B09ab3e4aB416F6D48D3F77Fbc2b07f0C0e',
                    amount: '5000000000000000000'
                }
            ],
            payload: '0x00000000000000000000000060e0a0ead051314e7510ae803334a97f13e6ff21',
            initializedTimestamp: 1706227685
        }]);
    })
    .catch((error: Error) => {
        console.log("Cannot connect to the database!", error);
        process.exit();
    });

app.get("/", (_, res) => {
    res.json({ message: "Metreon RPC Node V1" });
});

// set port, listen for requests
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`⚡ Server is on port ${PORT}.`);
});