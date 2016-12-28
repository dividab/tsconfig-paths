import Promise = require('any-promise');
export interface LoadResult {
  path?: string;
  config: any;
}
export function resolve(cwd: string, filename?: string): Promise<string | void>;
export function resolveSync(cwd: string, filename?: string): string | void;
export function find(dir: string): Promise<string | void>;
export function findSync(dir: string): string | void;
export function load(cwd: string, filename?: string): Promise<LoadResult>;
export function loadSync(cwd: string, filename?: string): LoadResult;
export function readFile(filename: string): Promise<any>;
export function readFileSync(filename: string): any;
export function parse(contents: string, filename: string): any;
