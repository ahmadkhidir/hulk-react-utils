import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { dts } from 'rollup-plugin-dts';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default [{
        input: 'src/index.ts',
        output: [{
                file: packageJson.main,
                format: 'cjs',
                sourcemap: true,
                exports: 'named',
            },
            {
                file: packageJson.module,
                format: 'esm',
                sourcemap: true,
            },
        ],
        plugins: [
            peerDepsExternal(),
            resolve({
                browser: true,
                preferBuiltins: false,
            }),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                exclude: ['**/*.test.*', '**/*.stories.*'],
                sourceMap: true,
                inlineSources: true,
            }),
        ],
        external: ['react', 'react-dom', 'next/navigation', 'react-dom/client'],
    },
    {
        input: 'src/index.ts',
        output: [{ file: packageJson.types, format: 'esm' }],
        plugins: [dts()],
        external: ['react', 'react-dom', 'next/navigation', 'react-dom/client'],
    },
];