FROM node:20-bookworm

# Install required compilers and runtimes for the Coding Zone
RUN apt-get update && apt-get install -y \
    python3 \
    default-jdk \
    perl \
    bash \
    curl \
    xz-utils \
    unzip \
    golang \
    php-cli \
    ruby \
    && rm -rf /var/lib/apt/lists/*

# Install Zig for C and C++ support
RUN mkdir -p /opt/zig && \
    curl -sLO https://ziglang.org/download/0.13.0/zig-linux-x86_64-0.13.0.tar.xz && \
    tar -xf zig-linux-x86_64-0.13.0.tar.xz -C /opt/zig --strip-components=1 && \
    rm zig-linux-x86_64-0.13.0.tar.xz && \
    ln -s /opt/zig/zig /usr/local/bin/zig

# Install Kotlin Compiler
RUN curl -sLO https://github.com/JetBrains/kotlin/releases/download/v2.0.0/kotlin-compiler-2.0.0.zip && \
    unzip kotlin-compiler-2.0.0.zip -d /opt/ && \
    rm kotlin-compiler-2.0.0.zip && \
    ln -s /opt/kotlinc/bin/kotlinc /usr/local/bin/kotlinc && \
    ln -s /opt/kotlinc/bin/kotlin /usr/local/bin/kotlin

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Set environment variables (should be overridden by hosting provider)
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start server
CMD [ "node", "index.js" ]
