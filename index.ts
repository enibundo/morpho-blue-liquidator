import dotenv from "dotenv";
import { readLiquidatorDatabase } from "./liquidatorDatabase";
import { parseBlock } from "./blockchain-parser";

dotenv.config();

const start = async () => {
  //   const db = await readLiquidatorDatabase();
  //   console.log(db);

  // create market
  // parseBlock(18925910);

  // supply collateral
  // parseBlock(18982988);

  // withdraw collateral
  parseBlock(18983166);
};

start();
