// scripts/generate-islands.ts
// 用途：扫描 src/islands/ 目录，自动生成 islands 注册表
import { readdir, writeFile } from 'fs/promises';
import { basename } from 'path';

const ISLANDS_DIR = './src/islands';
const OUTPUT = './src/islands.generated.ts';

async function generate() {
  try {
    const files = await readdir(ISLANDS_DIR);

    // 只处理 .tsx 文件，排除下划线开头或测试文件
    const components = files.filter(
      f => f.endsWith('.tsx') && !f.startsWith('_') && !f.includes('.test.')
    );

    // 使用 PascalCase 作为 key（与文件名一致），使用时可转 kebab-case
    const imports = components
      .map(name => {
        const componentName = basename(name, '.tsx');
        return `import ${componentName} from "./islands/${componentName}";`;
      })
      .join('\n');

    const registrations = components
      .map(name => {
        const componentName = basename(name, '.tsx');
        // 提供 kebab-case 版本的名称供 data-island 使用
        const kebabName = componentName
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace(/^-/, '');

        return `  "${kebabName}": ${componentName},`;
      })
      .join('\n');

    const content = `// ==============================================
// AUTO-GENERATED - DO NOT EDIT MANUALLY!
// Generated at: ${new Date().toISOString()}
// ==============================================

${imports}

export const islands = {
${registrations}
} as const;

export type IslandName = keyof typeof islands;
`;

    await writeFile(OUTPUT, content, 'utf-8');
    console.log(`成功生成 ${components.length} 个 islands 注册`);
  } catch (err) {
    console.error('生成 islands 索引失败:', err);
    process.exit(1);
  }
}

generate();
