import { defineBackend } from "@aws-amplify/backend";
import { storage } from "./storage/resource";

export default defineBackend({
  storage,
});
