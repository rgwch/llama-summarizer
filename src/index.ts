import { fileURLToPath } from "url";
import path from "path";
import chalk from "chalk";
import { getLlama, LlamaChatSession, resolveModelFile } from "node-llama-cpp";
import { extractTextFromFile } from "./extract"

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDirectory = path.join(__dirname, "..", "models");

const llama = await getLlama();

console.log(chalk.yellow("Resolving model file..."));
const modelPath = await resolveModelFile(
    "gemma3-27b-abliterated-dpo.i1-IQ3_XS.gguf",
    // "hf:mradermacher/DeepSeek-R1-Distill-Qwen-14B-GGUF:Q6_K",

    modelsDirectory
);

console.log(chalk.yellow("Loading model..."));
const model = await llama.loadModel({ modelPath });

console.log(chalk.yellow("Creating context..."));
const context = await model.createContext({
    contextSize: { max: 16384 } // omit this for a longer context size, but increased memory usage
});

const session = new LlamaChatSession({
    contextSequence: context.getSequence()
});
console.log();

const filename = process.argv[2];
if (filename) {
    const text = await extractTextFromFile(filename);
    const q1 = "Bitte fasse den folgenden Text zusammen: " + text;
    // console.log(chalk.yellow("User: ") + q1);

    // process.stdout.write(chalk.yellow("AI: "));
    const a1 = await session.prompt(q1, {
        // uncomment for a simpler response streaming, without segment information
        onTextChunk(chunk) {
            // stream the response to the console as it's being generated
            process.stdout.write(chunk);
        }
        /*
        onResponseChunk(chunk) {
            // stream the response to the console as it's being generated
            // including segment information (like chain of thought)

            if (chunk.type === "segment" && chunk.segmentStartTime != null)
                process.stdout.write(chalk.bold(` [segment start: ${chunk.segmentType}] `));

            process.stdout.write(chunk.text);

            if (chunk.type === "segment" && chunk.segmentEndTime != null)
                process.stdout.write(chalk.bold(` [segment end: ${chunk.segmentType}] `));
        }
            */
    });
    process.stdout.write("\n");
    // console.log(chalk.yellow("Consolidated AI answer: ") + a1);
    console.log();
} else {
    console.log(chalk.red("No file provided. Please provide a file path as an argument."));
    console.log(chalk.red("Usage: node index.js <path-to-file>"));
}

