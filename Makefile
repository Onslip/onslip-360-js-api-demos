all:		build

prepare:
	$(MAKE) -C Web $@
	$(MAKE) -C NodeJS $@

build:
	$(MAKE) -C Web $@
	$(MAKE) -C NodeJS $@

clean:
	$(MAKE) -C Web $@
	$(MAKE) -C NodeJS $@

distclean:
	$(MAKE) -C Web $@
	$(MAKE) -C NodeJS $@

.PHONY:		all prepare build clean distclean install uninstall
