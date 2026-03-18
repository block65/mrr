
.PHONY: all
all: test

.PHONY: clean
clean:
	pnpm tsc -b --clean

.PHONY: distclean
distclean: clean
	rm -rf node_modules

.PHONY: test
test: node_modules
	pnpm tsc --noEmit
	pnpm vitest run --typecheck

.PRECIOUS: pnpm-lock.yaml
node_modules: pnpm-lock.yaml package.json
	pnpm install

.PHONY: dev
dev: node_modules
	pnpm vite dev --config examples/vite.config.ts examples

.PHONY: pretty
pretty:
	pnpm oxlint --fix .
	pnpm oxfmt --write .
