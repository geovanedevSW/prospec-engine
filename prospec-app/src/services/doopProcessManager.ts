import { spawn, exec, ChildProcess } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import { DOOP_DIR } from '../config.js';

export class DoopProcessManager {
  private static child: ChildProcess | null = null;
  private static logBuffer: string[] = [];
  private static maxLogLines = 200;
  private static startedAt: number | null = null;
  private static status: 'stopped' | 'starting' | 'running' | 'error' = 'stopped';
  private static lastError: string | null = null;

  static findBunDir(): string {
    const userProfile = process.env.USERPROFILE || '';
    const defaultBunDir = path.join(userProfile, '.bun', 'bin');
    if (fs.existsSync(path.join(defaultBunDir, 'bun.exe')) || fs.existsSync(path.join(defaultBunDir, 'bun'))) {
      return defaultBunDir;
    }
    return '';
  }

  static isPortListening(port: number, host = '127.0.0.1', timeoutMs = 600): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.request(
        {
          hostname: host,
          port,
          path: '/',
          method: 'GET',
          timeout: timeoutMs,
        },
        () => resolve(true)
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  }

  static async killPortProcesses(ports: number[]): Promise<void> {
    if (process.platform !== 'win32') return;
    for (const port of ports) {
      try {
        const stdout = await new Promise<string>((resolve) => {
          exec(`netstat -ano | findstr :${port}`, (err, out) => resolve(out || ''));
        });
        const lines = stdout.split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5 && (parts[1].endsWith(`:${port}`) || parts[1].includes(`:${port}`))) {
            const pid = parts[parts.length - 1];
            if (pid && /^\d+$/.test(pid) && pid !== '0' && pid !== String(process.pid)) {
              await new Promise((resolve) => exec(`taskkill /pid ${pid} /T /F`, () => resolve(true)));
            }
          }
        }
      } catch {
        // ignore errors during cleanup
      }
    }
  }

  static async start(): Promise<{ success: boolean; message: string; pid?: number }> {
    // Check if already running as managed process AND healthy
    if (this.child && !this.child.killed) {
      const uptime = this.startedAt ? (Date.now() - this.startedAt) / 1000 : 0;
      if (uptime < 18) {
        return {
          success: true,
          message: 'Doop em processo de inicialização...',
          pid: this.child.pid,
        };
      }
      const port4300 = await this.isPortListening(4300);
      const port4400 = await this.isPortListening(4400);
      if (port4300 && port4400) {
        return {
          success: true,
          message: 'Doop já está em execução sob gerenciamento da Central.',
          pid: this.child.pid,
        };
      }
      this.addLog(`[Central Aviso] Processo Doop (PID ${this.child.pid}, uptime=${Math.floor(uptime)}s) ativo mas portas caídas (4300=${port4300}, 4400=${port4400}). Reiniciando...`);
      await this.stop();
      await new Promise((r) => setTimeout(r, 800));
    }

    // Check if port 4300 and 4400 are already occupied and healthy
    const port4300 = await this.isPortListening(4300);
    const port4400 = await this.isPortListening(4400);
    if (port4300 && port4400) {
      this.status = 'running';
      this.addLog(`[Central] Detectado serviço Doop já ativo e saudável nas portas (4300 e 4400).`);
      return {
        success: true,
        message: 'Serviço Doop já ativo nas portas 4300/4400.',
      };
    }

    if (port4300 || port4400) {
      this.addLog(`[Central Aviso] Estado inconsistente detectado (4300=${port4300}, 4400=${port4400}). Liberando portas órfãs...`);
      await this.killPortProcesses([4300, 4400]);
      await new Promise((r) => setTimeout(r, 1000));
    }

    const bunDir = this.findBunDir();
    const doopDir = DOOP_DIR;

    if (!fs.existsSync(doopDir)) {
      this.status = 'error';
      this.lastError = `Diretório do Doop não encontrado em ${doopDir}`;
      this.addLog(`[Central Erro] ${this.lastError}`);
      return { success: false, message: this.lastError };
    }

    const currentPath = process.env.PATH || '';
    const newPath = bunDir ? `${bunDir};${currentPath}` : currentPath;

    this.status = 'starting';
    this.startedAt = Date.now();
    this.addLog(`[Central] Iniciando "bun run dev" em ${doopDir}...`);

    try {
      this.child = spawn('bun', ['run', 'dev'], {
        cwd: doopDir,
        shell: true,
        env: {
          ...process.env,
          PORT: '4400',
          VITE_PORT: '4300',
          PATH: newPath,
        },
      });

      if (this.child.stdout) {
        this.child.stdout.on('data', (data) => {
          const lines = data.toString().split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            this.addLog(`[doop] ${trimmed}`);
            if (trimmed.includes('doop server')) {
              this.status = 'running';
            }
          }
        });
      }

      if (this.child.stderr) {
        this.child.stderr.on('data', (data) => {
          const lines = data.toString().split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            this.addLog(`[doop] ${trimmed}`);
          }
        });
      }

      this.child.on('error', (err) => {
        this.status = 'error';
        this.lastError = err.message;
        this.addLog(`[Central Erro Doop] Falha no processo: ${err.message}`);
      });

      this.child.on('exit', (code, signal) => {
        this.addLog(`[Central] Processo Doop encerrado (code=${code}, signal=${signal})`);
        this.status = 'stopped';
        this.child = null;
        this.startedAt = null;
      });

      return {
        success: true,
        message: 'Comando "bun run dev" disparado com sucesso para o Doop.',
        pid: this.child.pid,
      };
    } catch (err: any) {
      this.status = 'error';
      this.lastError = err.message;
      this.addLog(`[Central Erro] Exceção ao iniciar Doop: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  static async stop(): Promise<{ success: boolean; message: string }> {
    if (!this.child || !this.child.pid) {
      await this.killPortProcesses([4300, 4400]);
      this.status = 'stopped';
      return { success: true, message: 'Nenhum processo Doop sob gerenciamento ativo. Portas liberadas.' };
    }

    const pid = this.child.pid;
    this.addLog(`[Central] Solicitando parada do processo Doop (PID ${pid})...`);

    return new Promise((resolve) => {
      // Windows taskkill kills entire process tree (/T /F)
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${pid} /T /F`, async () => {
          this.child = null;
          this.status = 'stopped';
          this.startedAt = null;
          await this.killPortProcesses([4300, 4400]);
          this.addLog(`[Central] Processo Doop (PID ${pid}) e filhos finalizados.`);
          resolve({ success: true, message: 'Processo Doop finalizado com sucesso.' });
        });
      } else {
        this.child?.kill('SIGTERM');
        this.child = null;
        this.status = 'stopped';
        this.startedAt = null;
        resolve({ success: true, message: 'Processo Doop finalizado.' });
      }
    });
  }

  static async restart(): Promise<{ success: boolean; message: string; pid?: number }> {
    await this.stop();
    await new Promise((r) => setTimeout(r, 1200));
    return this.start();
  }

  static getStatus() {
    return {
      status: this.status,
      running: this.status === 'running' || this.status === 'starting',
      pid: this.child?.pid || null,
      uptimeSeconds: this.startedAt ? Math.floor((Date.now() - this.startedAt) / 1000) : 0,
      port: 4400,
      clientPort: 4300,
      lastError: this.lastError,
    };
  }

  static getLogs(): string[] {
    return [...this.logBuffer];
  }

  private static addLog(line: string) {
    const time = new Date().toLocaleTimeString();
    this.logBuffer.push(`[${time}] ${line}`);
    if (this.logBuffer.length > this.maxLogLines) {
      this.logBuffer.shift();
    }
  }
}

