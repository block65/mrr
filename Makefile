
SRCS := $(shell find lib -print -name *.ts?)

all: build/main.js types

.PHONY: clean
clean:
	yarn tsc -b --clean
	rm -rf dist build

.PHONY: distclean
distclean: clean
	rm -rf node_modules

.PHONY: test
test: node_modules
	NODE_OPTIONS=--experimental-vm-modules yarn jest
	$(MAKE) build/index.js

.PRECIOUS: yarn.lock
node_modules: yarn.lock package.json
	yarn install

.PHONY: dev
dev: node_modules
	yarn vite dev

.PHONY: types
types: node_modules
	yarn tsc --emitDeclarationOnly --removeComments false

build/main.js: node_modules $(SRCS)
	NODE_ENV=production yarn vite build
	npx bundlesize
