
SRCS := $(shell find lib -print -name *.ts?)

all: build/index.js dist types

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

.PHONY: dist
dist: node_modules
	yarn tsc

.PHONY: types
types: node_modules
	yarn tsc --emitDeclarationOnly --removeComments false

build/index.js: node_modules $(SRCS) webpack.config.js babel.config.cjs
	yarn webpack -o build --mode=production
