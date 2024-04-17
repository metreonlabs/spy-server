import { Status } from "./status";
import { Token } from "./token";

export interface Message {
    messageId: string;
    status: Status;
    fromTrxHash: string;
    toTrxHash?: string;
    fee: string;
    feeToken: string;
    sequenceNumber: number;
    fromChainId: 137 | 56 | 463;
    toChainId: 137 | 56 | 463;
    sender: string;
    receiver: string;
    tokens: Token[];
    payload: string;
    initializedTimestamp?: number;
    deliveredTimestamp?: number;
    failedTimestamp?: number;
    retriedTimestamp?: number;
}