FROM node:20-bookworm

# Install required compilers and runtimes for the Coding Zone
RUN apt-get update && apt-get install -y \
    python3 \
    default-jdk \
    perl \
    bash \
    curl \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Zig for C and C++ support
RUN mkdir -p /opt/zig && \
    curl -sLO https://ziglang.org/download/0.13.0/zig-linux-x86_64-0.13.0.tar.xz && \
    tar -xf zig-linux-x86_64-0.13.0.tar.xz -C /opt/zig --strip-components=1 && \
    rm zig-linux-x86_64-0.13.0.tar.xz && \
    ln -s /opt/zig/zig /usr/local/bin/zig

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
