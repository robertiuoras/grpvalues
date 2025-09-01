import NodeCache from "node-cache";
import { getGoogleClients } from "./googleClient";

const cache = new NodeCache({
  stdTTL: Number(process.env.CACHE_TTL_SECONDS || 600),
});

export async function fetchDocText(documentId: string) {
  const cacheKey = `doc_${documentId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached as string;

  try {
    const { docs } = await getGoogleClients();
    const res = await docs.documents.get({ documentId });
    const body = res.data.body?.content || [];
    let text = "";

    for (const el of body) {
      const p = el.paragraph;
      if (!p) continue;
      for (const elem of p.elements || []) {
        if (elem.textRun?.content) text += elem.textRun.content;
      }
      text += "\n";
    }

    cache.set(cacheKey, text);
    return text;
  } catch (error) {
    console.error("Error fetching Google Doc:", error);
    throw new Error(`Failed to fetch document: ${error}`);
  }
}

export async function fetchAllSheets(spreadsheetId: string) {
  const cacheKey = `sheets_${spreadsheetId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached as any;

  try {
    const { sheets } = await getGoogleClients();
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const result: Record<string, string[][]> = {};

    for (const info of meta.data.sheets || []) {
      const title = info.properties?.title || "Sheet";
      const range = title;
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      result[title] = res.data.values || [];
    }

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error fetching Google Sheets:", error);
    throw new Error(`Failed to fetch spreadsheet: ${error}`);
  }
}
