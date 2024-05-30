MODULES		= Web NodeJS

help:
	@awk -F ':.*## ' '/^[^\t]+:.*## / { printf "\033[1m%-16s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

all:		build								## Build all modules (alias for build)

prepare::									## Install all dependencies

build::										## Build all modules

clean::										## Clean all build artifacts (but not dependencies)

distclean::									## Like clean, but also remove all dependencies

prepare build clean distclean::
	@for module in $(MODULES); do echo "► $${module} ► $@"; $(MAKE) -C $${module} $@; done

.PHONY:		help all prepare build clean distclean
