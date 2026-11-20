import fs from 'node:fs';
import path from 'node:path';
import { callMcp } from '../doop_client.js';

const CANVAS_ID = 'ILRtzl0v5F';
const outDir = 'screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

interface FrameInfo {
  id: string;
  name: string;
  [key: string]: any;
}

async function main(): Promise<void> {
  console.log('📸 Capturando screenshots de verificação visual de todos os frames...');
  const canvasRes = await callMcp('get_canvas', { canvas_id: CANVAS_ID });
  const canvasData = JSON.parse(canvasRes.content?.[0]?.text || '{}');

  for (const f of (canvasData.frames as FrameInfo[] || [])) {
    console.log(`Renderizando screenshot de: ${f.name} (id: ${f.id})...`);
    try {
      const res = await callMcp('get_frame_screenshot', {
        frame_id: f.id,
        scale: 1,
        agent_name: 'Antigravity'
      });

      const imgContent = res.content?.find((c: any) => c.type === 'image');
      if (imgContent && imgContent.data) {
        const safeName = f.name.replace(/[^a-zA-Z0-9_-]/g, '_');
        const filePath = path.join(outDir, `${safeName}.png`);
        fs.writeFileSync(filePath, Buffer.from(imgContent.data, 'base64'));
        console.log(`  -> Salvo: ${filePath}`);
      } else {
        console.log(`  -> Sem dados de imagem em get_frame_screenshot.`);
      }
    } catch (e: any) {
      console.error(`  -> Erro ao capturar ${f.name}:`, e.message);
    }
  }

  console.log('✅ Screenshots capturados com sucesso!');
}

main().catch(console.error);
