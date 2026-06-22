import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const diagramDir = join(__dirname, "../docs/content/assets/diagramas");
const files = readdirSync(diagramDir).filter((name) => name.endsWith(".mmd"));

for (const file of files) {
  const input = join(diagramDir, file);
  const output = join(diagramDir, file.replace(/\.mmd$/, ".png"));
  console.log(`Exportando ${file} → ${file.replace(/\.mmd$/, ".png")}`);
  execFileSync(
    "pnpm",
    ["exec", "mmdc", "-i", input, "-o", output, "-b", "white", "-w", "1600"],
    { stdio: "inherit" },
  );
}

console.log(`Concluído: ${files.length} diagrama(s).`);
