import dotenv from "dotenv";
import {
  readLiquidatorDatabase,
  updateLiquidatorDatabase,
} from "./liquidatorDatabase";
import { parseBlock } from "./blockchain-parser";
import { readPositionOfWallet } from "./blockchain-fetching";
import _ from "lodash";

dotenv.config();

const start = async () => {
  let db = await readLiquidatorDatabase();

  let currentBlock = 21422989;
  //db.lastIndexedBlock + 1;

  while (true) {
    const morphoEvents = await parseBlock(currentBlock);
    const updateResult = await updateLiquidatorDatabase(
      db,
      currentBlock,
      morphoEvents,
      ({ wallet, marketId }) => {
        return readPositionOfWallet(wallet, marketId);
      }
    );
    db = updateResult.currentDatabase;

    currentBlock++;
    await new Promise((resolve) => setTimeout(resolve, 15_000));
  }

  // console.log(db);
  //--
  //1. create market
  // parseBlock(18925910);
  //--
  //2. supply collateral
  //parseBlock(18982988);
  //--
  //3. withdraw collateral
  //parseBlock(18983166);
  //--
  //4. supply
  //parseBlock(21411746);
  //--
  //5. borrow
  //parseBlock(21409530);
  //--
  //6. repay
  //parseBlock(21360274);
  //--
  //7. withdraw
  //parseBlock(21422989);
};

// start();
