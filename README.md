TVM WebGPU Example
==================

This is an example project for building a tvm webgpu-backed module  and
deploy it to the web


First build the necessary packages in `tvm/web`
```bash
cd /path/to/tvm/web
make
npm run bundle
```

Then run the build script to build the model specific data.

```bash
cd /path/to/tvm-webgpu-examples
python3 build.py
```

You can now serve the content under `dist`
```bash
cd /path/to/tvm-webgpu-examples/dist
python3 http.server
```

You can also publish to github using the `publish_gh_pages` script.
