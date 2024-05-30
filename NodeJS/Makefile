help:
	@awk -F ':.*## ' '/^[^\t]+:.*## / { printf "\033[1m%-16s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

all:		build								## Build module (alias for build)

prepare:									## Install all dependencies
	npm install

build:		prepare								## Build module
	npx tsc --build

clean:										## Clean all build artifacts (but not dependencies)
	rm -rf build

distclean:	clean								## Like clean, but also remove all dependencies
	rm -rf node_modules

.PHONY:		all prepare build clean distclean
