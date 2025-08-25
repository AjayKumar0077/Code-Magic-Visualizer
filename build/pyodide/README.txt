Place Pyodide distribution files here for self-hosting.

Required (minimum) for v0.24.1:
- pyodide.js
- pyodide_py.tar
- packages.json
- repodata.json
- (optionally) .whl files for allowed packages if you plan to use micropip

Directory should be served at /pyodide/ so that indexURL: '/pyodide/' works.