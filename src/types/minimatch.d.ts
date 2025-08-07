// src/types/minimatch.d.ts
declare module "minimatch" {
  function minimatch(target: string, pattern: string): boolean;
  export = minimatch;
}
