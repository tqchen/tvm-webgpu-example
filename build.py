"""Example script to create tvm wasm modules and deploy it."""

import argparse
import os
from tvm import relay
from tvm.contrib import util, emcc
from tvm import rpc
from tvm.contrib.download import download_testdata
import tvm
from tvm._ffi import libinfo
import shutil
import logging
import json

curr_dir = os.path.dirname(os.path.realpath(os.path.expanduser(__file__)))


def build_module(opts):
    network = opts.network
    build_dir = opts.out_dir

    dshape = (1, 3, 224, 224)
    from mxnet.gluon.model_zoo.vision import get_model
    block = get_model(network, pretrained=True)

    shape_dict = {"data": dshape}
    mod, params = relay.frontend.from_mxnet(block, shape_dict)
    func = mod["main"]
    func = relay.Function(func.params,
                          relay.nn.softmax(func.body), None,
                          func.type_params, func.attrs)

    target_device = "webgpu -modle=1080ti"
    target_host = "llvm -target=wasm32-unknown-unknown-wasm -system-lib"

    with relay.build_config(opt_level=3):
        graph, lib, params = relay.build(
            func, target=target_device, target_host=target_host, params=params)

    wasm_path = os.path.join(build_dir, f"{network}.wasm")
    lib.export_library(wasm_path, emcc.create_tvmjs_wasm)
    print(f"Exporting library to {build_dir}...")

    with open(os.path.join(build_dir, f"{network}.json"), "w") as f_graph_json:
        f_graph_json.write(graph)
    with open(os.path.join(build_dir, f"{network}.params"), "wb") as f_params:
        f_params.write(relay.save_param_dict(params))


def prepare_data(opts):
    """Build auxiliary data file."""
    # imagenet synset
    synset_url = ''.join(['https://gist.githubusercontent.com/zhreshold/',
                          '4d0b62f3d01426887599d4f7ede23ee5/raw/',
                          '596b27d23537e5a1b5751d2b0481ef172f58b539/',
                        'imagenet1000_clsid_to_human.txt'])
    synset_name = 'imagenet1000_clsid_to_human.txt'
    synset_path = download_testdata(synset_url, synset_name, module='data')
    with open(synset_path) as f:
        synset = eval(f.read())
    build_dir = opts.out_dir
    with open(os.path.join(build_dir, "imagenet1k_synset.json"), "w") as f_synset:
        f_synset.write(json.dumps(synset))
    # Test image
    image_url = "https://homes.cs.washington.edu/~moreau/media/vta/cat.jpg"
    image_fn = os.path.join(build_dir, "cat.png")
    download_testdata(image_url, image_fn)
    # copy runtime js files.
    shutil.copyfile(libinfo.find_lib_path("tvmjs.bundle.js")[0],
                    os.path.join(build_dir, "tvmjs.bundle.js"))
    shutil.copyfile(libinfo.find_lib_path("tvmjs_runtime.wasi.js")[0],
                    os.path.join(build_dir, "tvmjs_runtime.wasi.js"))
    shutil.copyfile(os.path.join(curr_dir, "index.html"),
                    os.path.join(build_dir, "index.html"))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-o", "--out-dir", default=os.path.join(curr_dir, "dist"))
    parser.add_argument("--network", default="mobilenet1.0")
    parser.add_argument('-p', '--prepare', action='store_true')

    opts = parser.parse_args()

    build_dir = os.path.abspath(opts.out_dir)
    if not os.path.isdir(build_dir):
        os.makedirs(build_dir)
        opts.out_dir = build_dir

    if opts.prepare:
        prepare_data(opts)
    else:
        prepare_data(opts)
        build_module(opts)
