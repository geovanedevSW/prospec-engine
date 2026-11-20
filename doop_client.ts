import http from 'node:http';

export interface McpResponse {
  content?: Array<{ type: string; text?: string; data?: string; mimeType?: string }>;
  isError?: boolean;
  [key: string]: any;
}

export async function callMcp(toolName: string, args: Record<string, any> = {}): Promise<McpResponse> {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args
    }
  });

  return new Promise((resolve, reject) => {
    const req = http.request(
      'http://127.0.0.1:4400/mcp',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.error) reject(new Error(JSON.stringify(data.error)));
            else resolve(data.result);
          } catch {
            reject(new Error(`Invalid JSON: ${body}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// CLI Execution support
const [tool, ...rest] = process.argv.slice(2);
if (tool) {
  let args: Record<string, any> = {};
  if (rest.length) {
    const raw = rest.join(' ');
    try {
      args = JSON.parse(raw);
    } catch {
      // parse key=value
      for (const pair of rest) {
        const idx = pair.indexOf('=');
        if (idx !== -1) {
          const val = pair.slice(idx + 1);
          args[pair.slice(0, idx)] = /^\d+$/.test(val) ? Number(val) : val;
        }
      }
    }
  }
  callMcp(tool, args)
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
