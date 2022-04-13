import { config } from "dotenv";

config();

import server from "./server.js";

const PORT = process.env.PORT || 5000;

server.get("/", (req, res) => res.send("API up and running!"));

server.listen(PORT, () => {
  console.log(`\n=== Server listening on port ${PORT} ===\n`);
});
