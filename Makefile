
SRCS := $(shell find lib -print)

all: build/index.mjs

.PHONY: clean
clean:
	rm -rf build
	yarn tsc -b --clean

.PHONY: test
test:
	NODE_OPTIONS=--experimental-vm-modules yarn jest

.PRECIOUS: yarn.lock
node_modules: yarn.lock package.json
	yarn install

.PHONY: dev
dev: webpack.config.js
	yarn webpack -o build --mode=development -w

build/index.mjs: $(SRCS) webpack.config.js babel.config.cjs
	yarn webpack -o build --mode=production
