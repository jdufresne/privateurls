node_modules: package.json
	npm install
	touch $@

.PHONY: run
run: node_modules
	$(shell npm bin)/web-ext run --verbose

.PHONY: lint
lint: node_modules
	$(shell npm bin)/web-ext lint
	$(shell npm bin)/eslint privateurls.js

DIST_FILES = \
	LICENSE \
	manifest.json \
	privateurls.js

privateurls.zip: $(DIST_FILES)
	zip $@ $(DIST_FILES)
