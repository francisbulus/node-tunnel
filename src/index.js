import { config } from "dotenv";

config();

import server from "./server.js";

const PORT = process.env.PORT || 1337;
//"0.0.0.0"
server.listen(PORT);
