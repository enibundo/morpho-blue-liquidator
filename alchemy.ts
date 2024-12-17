import { Alchemy, Network } from "alchemy-sdk";
import _ from "lodash";

const config = {
  apiKey: process.env.ALCHEMY_NODE_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

const blockNumberAsHex = (blockNumber: number) =>
  `0x${Number(blockNumber).toString(16)}`;

export const getLogsOfBlockByTransaction = async (blockHash: string) => {
  console.log(`-> [START] fetching block ${blockHash} logs`);

  const logsOfBlock = await alchemy.core.getLogs({
    blockHash,
  });

  console.log("<- [END] Fetched logs.");

  return _.groupBy(logsOfBlock, (l) => l.transactionHash);
};

export const getTransactionsByHash = async (blockNumber: number) => {
  const blockNumberHex = blockNumberAsHex(blockNumber);

  console.log(
    `-> [START] fetching block ${blockNumber} (${blockNumberHex}) transactions`
  );

  const blockWithTransactions =
    await alchemy.core.getBlockWithTransactions(blockNumberHex);

  console.log("<- [END] Fetched transactions.");

  return {
    blockHash: blockWithTransactions.hash,
    transactionsByHash: _.keyBy(
      blockWithTransactions.transactions,
      (transactionResponse) => transactionResponse.hash
    ),
  };
};
