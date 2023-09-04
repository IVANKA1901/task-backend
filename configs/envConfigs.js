import dotenv from "dotenv";
dotenv.config();

const envConfig = {
  DB_HOST: process.env.DB_HOST,
  JWT_SECRET: process.env.JWT_SECRET,
};

export default envConfig;
