import { config } from "dotenv";
config();
import server from "./server.js";
server.listen(process.env.PORT);
