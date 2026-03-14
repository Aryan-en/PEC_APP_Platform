import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "firebase/app": path.resolve(__dirname, "./src/config/firebase.ts"),
      "firebase/auth": path.resolve(__dirname, "./src/config/firebase.ts"),
      "firebase/firestore": path.resolve(__dirname, "./src/config/firebase.ts"),
      "firebase/storage": path.resolve(__dirname, "./src/config/firebase.ts"),
    },
  },
}));
