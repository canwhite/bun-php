# Bun Islands MPA - Dockerfile
# 生产环境Dockerfile，默认构建和运行生产版本

FROM oven/bun:1.3.1

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json bun.lock ./

# 安装所有依赖（包括构建需要的devDependencies）
RUN bun install --frozen-lockfile

# 复制源代码
COPY . .

# 构建项目（生成dist目录和客户端代码）
RUN bun run build

# 创建非root用户运行
RUN addgroup --system --gid 1001 bunjs && \
    adduser --system --uid 1001 bunjs && \
    chown -R bunjs:bunjs /app

USER bunjs

# 暴露端口
EXPOSE 5000

# 生产环境启动命令
CMD ["bun", "run", "start"]