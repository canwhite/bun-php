import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildCSS() {
  try {
    console.log('Starting CSS build...');

    // 使用动态导入以避免顶层await问题
    const { default: tailwindcss } = await import('@tailwindcss/postcss');
    const { default: autoprefixer } = await import('autoprefixer');
    const { default: postcss } = await import('postcss');

    const inputPath = resolve(__dirname, '../src/styles.css');
    const outputPath = resolve(__dirname, '../public/styles.css');
    const configPath = resolve(__dirname, '../tailwind.config.js');

    console.log(`Input: ${inputPath}`);
    console.log(`Output: ${outputPath}`);
    console.log(`Config: ${configPath}`);

    const css = await fs.readFile(inputPath, 'utf-8');
    console.log(`Input CSS length: ${css.length} chars`);

    // 加载tailwind配置
    const tailwindConfig = await import(configPath);
    console.log('Tailwind config loaded:', Object.keys(tailwindConfig.default || {}));
    console.log('Plugins in config:', tailwindConfig.default?.plugins?.length || 0);
    if (tailwindConfig.default?.plugins) {
      console.log(
        'Plugin details:',
        tailwindConfig.default.plugins.map(p => p?.name || typeof p)
      );
    }

    const result = await postcss([tailwindcss(tailwindConfig.default), autoprefixer()]).process(
      css,
      {
        from: inputPath,
        to: outputPath,
      }
    );

    console.log(`Processed CSS length: ${result.css.length} chars`);
    console.log(`Warnings: ${result.warnings().length}`);

    await fs.writeFile(outputPath, result.css);

    if (result.map) {
      await fs.writeFile(`${outputPath}.map`, result.map.toString());
    }

    console.log(`CSS built successfully to ${outputPath}`);
  } catch (error) {
    console.error('Error building CSS:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

buildCSS();
