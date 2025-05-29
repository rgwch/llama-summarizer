import { fileURLToPath } from "url";
import path from "path";
import chalk from "chalk";
import { getLlama, LlamaChatSession, resolveModelFile } from "node-llama-cpp";
import fs from "fs/promises";
const tika = "http://localhost:9998/tika"; // Apache Tika server URL

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDirectory = path.join(__dirname, "..", "models");


const llama = await getLlama();

console.log(chalk.yellow("Resolving model file..."));
const modelPath = await resolveModelFile(
    "hf:mradermacher/DeepSeek-R1-Distill-Qwen-14B-GGUF:Q6_K",
    modelsDirectory
);

console.log(chalk.yellow("Loading model..."));
const model = await llama.loadModel({ modelPath });

console.log(chalk.yellow("Creating context..."));
const context = await model.createContext({
    contextSize: { max: 8096 } // omit this for a longer context size, but increased memory usage
});

const session = new LlamaChatSession({
    contextSequence: context.getSequence()
});
console.log();

const filename = process.argv[2];
let text = ""
if (filename) {
    const contents = await fs.readFile(filename);
    if (filename.endsWith(".pdf")) {
        console.log(chalk.yellow("Extracting text from PDF..."));
        const response = await fetch(tika, {
            method: "PUT",
            body: contents
        })
        if (response.status !== 200) {
            console.error(chalk.red("Error extracting text from PDF: " + response.statusText));
            process.exit(1);
        } else {
            text = await response.text();
        }
    } else {
        console.log(chalk.yellow("Reading text from file..."));
        text = contents.toString();
    }
} else {
    console.log(chalk.yellow("No file provided, using default text..."));
    text = "DeepSeek R1 is a state-of-the-art language model developed by DeepSeek. It is designed to understand and generate human-like text, making it suitable for various natural language processing tasks.";
}

const q1 = "Bitte fasse den folgenden Text zusammen: " + text;
console.log(chalk.yellow("User: ") + q1);

process.stdout.write(chalk.yellow("AI: "));
const a1 = await session.prompt(q1, {
    // uncomment for a simpler response streaming, without segment information
    // onTextChunk(chunk) {
    //     // stream the response to the console as it's being generated
    //     process.stdout.write(chunk);
    // }
    onResponseChunk(chunk) {
        // stream the response to the console as it's being generated
        // including segment information (like chain of thought)

        if (chunk.type === "segment" && chunk.segmentStartTime != null)
            process.stdout.write(chalk.bold(` [segment start: ${chunk.segmentType}] `));

        process.stdout.write(chunk.text);

        if (chunk.type === "segment" && chunk.segmentEndTime != null)
            process.stdout.write(chalk.bold(` [segment end: ${chunk.segmentType}] `));
    }
});
process.stdout.write("\n");
console.log(chalk.yellow("Consolidated AI answer: ") + a1);
console.log();


