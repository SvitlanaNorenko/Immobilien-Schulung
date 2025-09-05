//to show the backend side in a good view

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = fs.readFileSync(
  path.join(__dirname, "immobilien-schulung.yaml"),
  "utf8"
);
const openapiDoc = YAML.parse(file);

export default openapiDoc;
