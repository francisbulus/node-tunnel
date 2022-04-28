import { config } from "dotenv";
config();
import server from "./server.js";
server.listen(process.env.PORT);
//# sourceMappingURL=index.js.map