import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import del from "rollup-plugin-delete";

// Modified from: https://gist.github.com/rikkit/b636076740dfaa864ce9ee8ae389b81c#file-tsconfig-json

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: "dist/index.mjs",
                format: "es",
                sourcemap: true
            }
        ],
        plugins: [
            del({ targets: "dist/*", hook: "buildStart" }),
            typescript({ tsconfig: "./tsconfig.json" })
        ]
    },
    {
        input: "src/index.ts",
        output: [
            {
                file: "dist/index.cjs",
                format: "cjs",
                exports: "named",
                sourcemap: true
            }
        ],
        plugins: [typescript({ tsconfig: "./tsconfig.json" })]
    },
    {
        input: "src/browser.ts",
        output: [
            {
                file: "dist/index.global.js",
                name: "ScreenReaderBridge",
                format: "iife",
                exports: "default",
                sourcemap: true
            }
        ],
        plugins: [typescript({ tsconfig: "./tsconfig.json" })]
    },
    {
        input: "dist/types/index.d.ts",
        output: [
            {
                file: "dist/index.d.ts",
                format: "es",
                plugins: []
            }
        ],
        plugins: [dts(), del({ targets: "dist/types", hook: "buildEnd" })]
    }
];
