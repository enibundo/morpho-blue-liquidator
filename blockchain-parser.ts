import _ from "lodash";
import { getLogsOfBlockByTransaction, getTransactionsByHash } from "./alchemy";

export const parseBlock = async (blockNumber: number) => {
  console.log(`parsing block ${blockNumber}`);
  const transactions = await getTransactionsByHash(blockNumber);
  const logsOfBlockByTransaction = await getLogsOfBlockByTransaction(
    transactions.blockHash
  );

  console.log("\n\n---");
  console.log(
    `fetched ${_.keys(transactions.transactionsByHash).length} transactions`
  );
  console.log(
    `fetched ${_.values(logsOfBlockByTransaction).length} logs in total`
  );
  
};
