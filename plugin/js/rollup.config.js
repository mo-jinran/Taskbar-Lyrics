import { defineConfig } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default defineConfig({
    treeshake: true,
    input: "./src/main.js",
    output: {
        file: "./build/plugin.js",
        format: "esm"
    },
    plugins: [
        resolve(),
        terser()
    ]
});