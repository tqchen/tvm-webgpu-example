TVM WebGPU Example
==================

This is an example project for building a tvm webgpu-backed module and deploy it to the web.

You will need the latest version of TVM on the master.
Please install the TVM via source build(by setting the PYTHONPATH).
Checkout the steps under `tvm/web` to enable webgpu support.

Build the dependent files in the `tvm/web`
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
