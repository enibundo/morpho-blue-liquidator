import dotenv from "dotenv";
import { readLiquidatorDatabase } from "./liquidatorDatabase";

dotenv.config();

const start = async () => {
  const db = await readLiquidatorDatabase();
  console.log(db);
};

start();
