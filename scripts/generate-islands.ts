// scripts/generate-islands.ts
// 用途：递归扫描 src/app/islands/ 目录，自动生成 islands 注册表
import { readdir, writeFile, stat } from 'fs/promises';
import { join, relative } from 'path';

const ISLANDS_DIR = './src/app/islands';
const OUTPUT = './src/islands.generated.ts';

// 递归扫描目录获取所有 .tsx 文件
async function scanDirectory(
  dir: string,
  baseDir: string = dir
): Promise<Array<{ filePath: string; relativePath: string }>> {
  const entries = await readdir(dir);
  const results = [];

  for (const entry of entries) {
    // 跳过下划线开头或测试文件
    if (entry.startsWith('_') || entry.includes('.test.')) {
      continue;
    }

    const fullPath = join(dir, entry);
    const fileStat = await stat(fullPath);

    if (fileStat.isDirectory()) {
      // 递归扫描子目录
      const subResults = await scanDirectory(fullPath, baseDir);
      results.push(...subResults);
    } else if (entry.endsWith('.tsx')) {
      // 计算相对于基目录的相对路径
      const relativePath = relative(baseDir, fullPath).replace(/\.tsx$/, '');
      results.push({ filePath: fullPath, relativePath });
    }
  }

  return results;
}

// 将路径转换为 kebab-case，用连字符连接目录名
function pathToKebabKey(relativePath: string): string {
  // 将相对路径中的目录分隔符和组件名中的大写字母都转换为连字符
  return relativePath
    .replace(/[\\/]/g, '-') // 目录分隔符转连字符
    .replace(/([A-Z])/g, '-$1') // 大写字母前加连字符
    .toLowerCase()
    .replace(/^-/, '') // 去除开头的连字符
    .replace(/-+/g, '-'); // 合并多个连字符
}

// 将相对路径转换为导入路径（相对于项目根目录）
function relativePathToImportPath(relativePath: string): string {
  // 将相对路径中的目录分隔符转为正斜杠，并添加 .tsx 扩展名
  return `./app/islands/${relativePath.replace(/\\/g, '/')}.tsx`;
}

// 将相对路径转换为唯一的组件变量名（PascalCase）
function relativePathToComponentName(relativePath: string): string {
  // 分割路径部分，将每部分转换为PascalCase
  const parts = relativePath.split(/[\\/]/);

  // 最后一部分是组件文件名，可能已经是PascalCase，但确保首字母大写
  const transformedParts = parts.map(part => {
    // 如果部分为空则跳过
    if (!part) return '';
    // 确保首字母大写，其余保持原样（因为组件名可能已经是PascalCase）
    return part.charAt(0).toUpperCase() + part.slice(1);
  });

  // 连接所有部分
  return transformedParts.filter(p => p !== '').join('');
}

async function generate() {
  try {
    // 递归扫描所有 .tsx 文件
    const components = await scanDirectory(ISLANDS_DIR);

    // 生成导入语句
    const imports = components
      .map(({ relativePath }) => {
        const componentName = relativePathToComponentName(relativePath); // 唯一组件变量名
        const importPath = relativePathToImportPath(relativePath);
        return `import ${componentName} from "${importPath}";`;
      })
      .join('\n');

    // 生成注册映射
    const registrations = components
      .map(({ relativePath }) => {
        const componentName = relativePathToComponentName(relativePath);
        const kebabKey = pathToKebabKey(relativePath);
        return `  "${kebabKey}": ${componentName},`;
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
