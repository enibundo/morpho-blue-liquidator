import { Alchemy, Network } from "alchemy-sdk";
import _ from "lodash";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { MorphoAbi } from "./contracts";

const config = {
  apiKey: process.env.ALCHEMY_NODE_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

const getChainFromConfig = () => {
  if (process.env.CHAIN_ID === "1") {
    return mainnet;
  }

  // todo: handle other chains
  return mainnet;
};

const publicClient = createPublicClient({
  chain: getChainFromConfig(),
  transport: http(),
});

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

export const readPositionOfWallet = async (
  wallet: `0x${string}`,
  marketId: `0x${string}`
) => {
  const position = (await publicClient.readContract({
    address: process.env.MORPHO_CONTRACT_ADDRESS as `0x${string}`,
    abi: MorphoAbi,
    functionName: "position",
    args: [marketId, wallet],
  })) as bigint[];

  const supplyShares = position[0];
  const borrowShares = position[1];
  const collateral = position[2];
  const result = { supplyShares, borrowShares, collateral };

  console.log(result);
  return result;
};
