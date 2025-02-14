import powerbiVisualsConfigs from "eslint-plugin-powerbi-visuals";
import tseslint from 'typescript-eslint';

export default [
    ...tseslint.configs.recommended,
    powerbiVisualsConfigs.configs.recommended,
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "coverage/**",
            "test/**",
            ".tmp/**",
            "karma.conf.ts",
            "test.webpack.config.js"
        ],
    },
];