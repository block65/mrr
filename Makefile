
SRCS := $(shell find lib -print -name *.ts?)

all: build/index.js lib/index.d.ts

.PHONY: clean
clean:
	yarn tsc -b --clean
	rm -rf dist build

.PHONY: distclean
distclean: clean
	rm -rf node_modules

.PHONY: test
test:
	NODE_OPTIONS=--experimental-vm-modules yarn jest

.PRECIOUS: yarn.lock
node_modules: yarn.lock package.json
	yarn install

.PHONY: dev
dev: node_modules webpack.config.js
	yarn webpack -o build --mode=development -w

lib/index.d.ts: node_modules
	yarn tsc --emitDeclarationOnly

build/index.js: node_modules $(SRCS) webpack.config.js babel.config.cjs
	yarn webpack -o build --mode=production
