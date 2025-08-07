// src/types/global.d.ts
declare module "minimatch" {
  import minimatchPkg from "minimatch";
  const minimatch = minimatchPkg.default || minimatchPkg;
  export default minimatch;
}
