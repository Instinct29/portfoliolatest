declare module "pg" {
  export class Pool {
    constructor(opts: {
      connectionString: string;
      ssl?: { rejectUnauthorized: boolean };
    });
    query(sql: string, params?: unknown[]): Promise<{ rows: unknown[] }>;
    end(): Promise<void>;
  }
}
