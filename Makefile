
SRCS := $(shell find lib -print -name *.ts?)

all: build/main.js types

.PHONY: clean
clean:
	pnpm tsc -b --clean
	rm -rf dist build

.PHONY: distclean
distclean: clean
	rm -rf node_modules

.PHONY: test
test: node_modules
	pnpm tsc --noEmit
	pnpm vitest run
	$(MAKE) build/main.js

.PRECIOUS: pnpm-lock.yaml
node_modules: pnpm-lock.yaml package.json
	pnpm install

.PHONY: dev
dev: node_modules
	pnpm vite dev

.PHONY: types
types: node_modules
	pnpm tsc --emitDeclarationOnly --removeComments false

build/main.js: node_modules $(SRCS)
	NODE_ENV=production pnpm vite build
	npx bundlesize

.PHONY: pretty
pretty:
	pnpm eslint --fix .
	pnpm prettier --write .