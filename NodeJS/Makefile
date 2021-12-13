all:		build

prepare:
	npm install

build:		prepare
	npx tsc --build

clean:
	rm -rf build

distclean:	clean
	rm -rf node_modules

.PHONY:		all prepare build clean distclean install uninstall
