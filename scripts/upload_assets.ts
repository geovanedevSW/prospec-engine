import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { callMcp } from '../doop_client.js';

const dir = 'C:\\Users\\Win 10\\Documents\\Codex\\2026-11-05\\https-www-instagram-com-ds-odontologia-2\\outputs';
const canvasId = 'ILRtzl0v5F';

async function main(): Promise<void> {
  const files: string[] = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => !f.endsWith('.md')) : [];
  const map: Record<string, string> = { 'Logo Escrita.png': 'http://localhost:4300/a/gi4zunQ3v3.png' };

  for (const file of files) {
    if (map[file]) continue;
    const fullPath = path.join(dir, file);
    console.log('Requesting ticket for:', file);
    const res = await callMcp('upload_asset', {
      canvas_id: canvasId,
      agent_name: 'Antigravity',
      local_file: true
    });
    const parsed = JSON.parse(res.content?.[0]?.text || '{}');
    const uploadUrl = parsed.upload_url;
    console.log('Uploading to:', uploadUrl);
    const cmd = `curl.exe -sS -T "${fullPath}" "${uploadUrl}"`;
    const curlOut = execSync(cmd).toString();
    const curlParsed = JSON.parse(curlOut);
    map[file] = curlParsed.url;
    console.log('Uploaded:', file, '->', curlParsed.url);
  }

  fs.writeFileSync('ds_assets_map.json', JSON.stringify(map, null, 2));
  console.log('Done mapping all assets:', map);
}

main().catch(console.error);
