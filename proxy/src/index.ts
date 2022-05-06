import { config } from "dotenv";
config();
import server from "./server";
const PORT = process.env.PORT || 1337;
server.listen(PORT);
