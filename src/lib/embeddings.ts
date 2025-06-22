import { pipeline } from "@xenova/transformers";

let extractor: any = null;

export async function getEmbeddings(text: string): Promise<number[]> {
  try {
    if (!extractor) {
      extractor = await pipeline("feature-extraction", "Xenova/all-roberta-large-v1");
    }

    const output = await extractor(text.replace(/\n/g, " "), {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(output.data); 
  } catch (err) {
    console.error("Embedding error:", err);
    return [];
  }
}
