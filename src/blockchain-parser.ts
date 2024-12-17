import _ from "lodash";
import { getLogsOfBlockByTransaction, getTransactionsByHash } from "./blockchain-fetching";
import { Log, TransactionResponse } from "alchemy-sdk";
import {
  MORPHO_BORROW_EVENT,
  MORPHO_BORROW_RATE_UPDATE_EVENT,
  MORPHO_CREATE_MARKET_EVENT,
  MORPHO_REPAY_EVENT,
  MORPHO_SUPPLY_COLLATERAL_EVENT,
  MORPHO_SUPPLY_EVENT,
  MORPHO_WITHDRAW_COLLATERAL_EVENT,
  MORPHO_WITHDRAW_EVENT,
} from "./constants";
import { decodeEventLog } from "viem";
import { MorphoAbi } from "./contracts";
import { MorphoEvent } from "./MorphoEvent";

export const parseBlock = async (blockNumber: number) => {
  console.log(`Parsing block ${blockNumber}`);

  const transactions = await getTransactionsByHash(blockNumber);
  const logsOfBlockByTransaction = await getLogsOfBlockByTransaction(
    transactions.blockHash
  );

  const morphoEvents = _.flatten(
    _.map(logsOfBlockByTransaction, (logs) =>
      parseMorphoEvents(
        transactions.transactionsByHash[logs[0].transactionHash],
        logs
      )
    )
  );

  console.log(morphoEvents[0]);

  return morphoEvents as any as MorphoEvent[];
};

const parseMorphoEvents = (transaction: TransactionResponse, logs: Log[]) => {
  const events = _.map(logs, (log) => {
    if (isToMorphoTransaction(transaction) && isMorphoEventTopic(log)) {
      return decodeEventLog({
        abi: MorphoAbi,
        data: log.data as any,
        topics: log.topics as any,
      });
    }
  }).filter((x) => x !== undefined);

  return events;
};

const isToMorphoTransaction = (transaction: TransactionResponse) =>
  transaction.to === process.env.MORPHO_CONTRACT_ADDRESS;

const isMorphoEventTopic = (log: Log) => {
  const morphoEventTopics = [
    MORPHO_CREATE_MARKET_EVENT,
    MORPHO_SUPPLY_COLLATERAL_EVENT,
    MORPHO_WITHDRAW_COLLATERAL_EVENT,
    MORPHO_SUPPLY_EVENT,
    MORPHO_BORROW_EVENT,
    MORPHO_REPAY_EVENT,
    MORPHO_WITHDRAW_EVENT,
  ];

  return morphoEventTopics.includes(log.topics[0]);
};
