import _ from "lodash";
import { getLogsOfBlockByTransaction, getTransactionsByHash } from "./alchemy";
import { Log, TransactionResponse } from "alchemy-sdk";
import {
  MORPHO_CREATE_MARKET_EVENT,
  MORPHO_SUPPLY_COLLATERAL_EVENT,
  MORPHO_SUPPLY_EVENT,
  MORPHO_WITHDRAW_COLLATERAL_EVENT,
  MORPHO_WITHDRAW_EVENT,
} from "./constants";
import { decodeEventLog } from "viem";
import { MorphoAbi } from "./contracts";

export const parseBlock = async (blockNumber: number) => {
  console.log(`parsing block ${blockNumber}`);

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

  console.log(morphoEvents);
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
    MORPHO_WITHDRAW_EVENT,
  ];

  return morphoEventTopics.includes(log.topics[0]);
};
