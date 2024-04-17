import Web3 from "web3";
import Config from "../configs/chains.config";
import { Controller } from "../controllers";
import { CronJob } from 'cron';
import fs from 'fs';
import { Message } from "../models/message";
import { Status } from "../models/status";
import { Token } from "../models/token";

const controller = new Controller();
const Metreon = require('../abis/Metreon.json');

class Index {
    constructor() { }

    listen() {
        this.startListening(Config.AreonTestnet as 463);

        fs.writeFileSync(`events/config${Config.AreonTestnet}.index.json`,
            `{
                    "fromBlocks": {
                        "${Config.AreonTestnet}": null
                    }
                }`);
    }

    private startListening(chainId: 137 | 56 | 463) {
        const job = new CronJob('*/20 * * * * *', async function () {
            try {
                const data = fs.readFileSync(`events/config${chainId}.index.json`, "utf-8");
                const json = JSON.parse(data);

                const web3 = new Web3(Config.rpcs[chainId]);
                const metreon = new web3.eth.Contract(Metreon.abi, Config.metreonIds[chainId]);

                const latestBlock = await web3.eth.getBlockNumber();

                const fromBlock: number | null = json.fromBlocks[chainId];
                console.log(`Indexer: Running Job from ${fromBlock} to ${latestBlock}`);

                if (fromBlock == latestBlock) return;

                if (fromBlock) {
                    metreon.getPastEvents('Dispatch', { fromBlock, toBlock: 'latest' }, function (error: Error, events) {
                        if (error) {
                            console.log('Index: startListening ', error);
                            return;
                        }

                        const messages: Message[] = [];

                        for (let index = 0; index < events.length; index++) {
                            const event = events[index];

                            const tokens: Token[] = [];

                            for (let index = 0; index < event.returnValues.tokens.length; index++) {
                                const token = event.returnValues.tokens[index];
                                tokens.push({ tokenId: token.tokenId, amount: token.amount });
                            }

                            const message: Message = {
                                messageId: event.returnValues.messageId,
                                status: Status.INITIATED,
                                fromTrxHash: event.transactionHash,
                                fee: event.returnValues.fee,
                                feeToken: event.returnValues.feeToken,
                                sequenceNumber: event.returnValues.sequenceNumber,
                                fromChainId: chainId as 137 | 56 | 463,
                                toChainId: event.returnValues.toChainId as 137 | 56 | 463,
                                sender: event.returnValues.sender,
                                receiver: event.returnValues.receiver,
                                tokens: tokens,
                                payload: event.returnValues.payload
                            };

                            messages.push(message);

                            controller.processMessages(messages);
                        }
                    });
                }

                fs.writeFileSync(`events/config${chainId}.index.json`,
                    `{
                    "fromBlocks": {
                        "${chainId}": ${latestBlock}
                    }
                }`);

                console.log(`Indexer: Ending Job at ${latestBlock}`);
            } catch (error) {
                console.error(error);
                if (!job.running) {
                    job.start();
                }
            }
        });

        job.start();
    }
}

export default Index;