all:		build

prepare:
	npm install

build:		prepare build-es3-sdk
	npx tsc --build

build-es3-sdk:	prepare
	$(call downcompile-module,@onslip/onslip-360-web-api)

clean:
	rm -rf build

distclean:	clean
	rm -rf node_modules

.PHONY:		all prepare build clean distclean install uninstall

define downcompile-module
	mkdir -p $(dir build/$1)
	npx --quiet browserify --standalone $(notdir $1) node_modules/$1 | sed 's/define(\[\],f)/define("$(subst /,\/,$1)",\[\],f)/' > build/$1.umd.js
	npx --quiet tsc --allowJs --target es3 --lib es2018 build/$1.umd.js --outfile build/$1.es3.umd.js
endef
