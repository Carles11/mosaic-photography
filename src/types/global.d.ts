// src/types/global.d.ts
// this file was just created to fix the minimatch import issue
// it is not used in the codebase, but it resolves the type error
// when importing minimatch from other dependencies
// This is a workaround for the issue with minimatch types in TypeScript
declare module "minimatch" {
  import minimatchPkg from "minimatch";
  const minimatch = minimatchPkg.default || minimatchPkg;
  export default minimatch;
}
