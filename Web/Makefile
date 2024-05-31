help:
	@awk -F ':.*## ' '/^[^\t]+:.*## / { printf "\033[1m%-16s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

all:		build								## Build module (alias for build)

prepare:									## Install all dependencies
	npm install

build:		prepare build-es5-sdk						## Build module
	npx tsc --build

build-es5-sdk:	prepare								## Downcompile SDK to ES5
	$(call downcompile-module,@onslip/onslip-360-web-api)

clean:										## Clean all build artifacts (but not dependencies)
	rm -rf build

distclean:	clean								## Like clean, but also remove all dependencies
	rm -rf node_modules

.PHONY:		help all prepare build build-es5-sdk clean distclean

define downcompile-module
	mkdir -p $(dir build/$1)
	npx --quiet browserify --standalone $(notdir $1) node_modules/$1 | sed 's/define(\[\],f)/define("$(subst /,\/,$1)",\[\],f)/' > build/$1.umd.js
	npx --quiet tsc --allowJs --target es5 --lib es2018 build/$1.umd.js --outfile build/$1.es5.umd.js
endef
