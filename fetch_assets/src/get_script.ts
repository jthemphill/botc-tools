import axios from 'axios';

/** Format for a saved script in assets/static/scripts/<pk>.json. */
export interface ScriptData {
  pk: number,
  title: string;
  author: string;
  score: number,
  characters: string[];
}

const apiBase = "https://botc-scripts.azurewebsites.net/api";

type ContentRow = { id: string } | { id: "_meta", name: string, author: string }

export interface ScriptInstanceResp {
  pk: number,
  name: string,
  version: string, // unused
  author: string,
  score: number,
  content: ContentRow[],
}

type ScriptJsonResp = ContentRow[];

/** Try to find a id: "_meta" metadata element. Not all scripts have such an
 * element (eg, 19). */
function metaFromContents(content: ContentRow[]): { name: string, author: string } | null {
  for (const c of content) {
    if (c.id == "_meta" && "name" in c) {
      return c;
    }
  }
  return null;
}

function idsFromContents(content: ContentRow[]): string[] {
  return content.map(c => c.id).filter(id => id != "_meta");
}

async function getScriptResp(id: string): Promise<ScriptInstanceResp | ScriptJsonResp | null> {
  let resp = await axios.get(`${apiBase}/scripts/${id}/?format=json`).catch((err) => {
    if (err.response && err.response.status == 404) {
      return null;
    } else {
      console.error(err.message);
    }
  });
  if (resp == null) {
    // For some ids (eg, 2082) fetching the script itself doesn't work but
    // getting its JSON works (this appears to be because this is an older
    // version of a script and thus not the top-level script object which is
    // 2110 as of writing this content). In these cases we can still try to
    // infer the metadata from a {id: "_meta"} in the character list.
    let resp = await axios.get(`${apiBase}/scripts/${id}/json?format=json`);
    let data: ScriptJsonResp = resp.data;
    return data;
  }
  let data: ScriptInstanceResp = resp.data;
  return data;
}

export function parseScriptInstance(data: ScriptInstanceResp): ScriptData {
  // I haven't seen this required but maybe sometimes the root metadata is
  // missing.
  let meta = metaFromContents(data.content) || { name: "", author: "" };
  return {
    pk: data.pk,
    title: data.name || meta.name,
    author: data.author || meta.author,
    characters: idsFromContents(data.content),
    score: data.score,
  }
}

export async function getScript(id: string): Promise<ScriptData | null> {
  let data = await getScriptResp(id);
  if (data == null) {
    return null;
  }
  if (data instanceof Array) {
    let contents = data;
    // just a contents array
    let meta = metaFromContents(contents);
    if (meta == null) {
      return null;
    }
    return {
      pk: parseInt(id),
      title: meta.name,
      author: meta.author,
      characters: idsFromContents(contents),
      score: 0,
    };
  }
  return parseScriptInstance(data);
}
