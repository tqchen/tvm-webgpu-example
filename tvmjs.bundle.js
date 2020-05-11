(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('perf_hooks'), require('ws')) :
	typeof define === 'function' && define.amd ? define(['exports', 'perf_hooks', 'ws'], factory) :
	(global = global || self, factory(global.tvmjs = {}, global.perf_hooks, global.ws));
}(this, (function (exports, perf_hooks, ws) { 'use strict';

	perf_hooks = perf_hooks && Object.prototype.hasOwnProperty.call(perf_hooks, 'default') ? perf_hooks['default'] : perf_hooks;
	ws = ws && Object.prototype.hasOwnProperty.call(ws, 'default') ? ws['default'] : ws;

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var support = createCommonjsModule(function (module, exports) {
	/*
	 * Licensed to the Apache Software Foundation (ASF) under one
	 * or more contributor license agreements.  See the NOTICE file
	 * distributed with this work for additional information
	 * regarding copyright ownership.  The ASF licenses this file
	 * to you under the Apache License, Version 2.0 (the
	 * "License"); you may not use this file except in compliance
	 * with the License.  You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing,
	 * software distributed under the License is distributed on an
	 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	 * KIND, either express or implied.  See the License for the
	 * specific language governing permissions and limitations
	 * under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	 * Convert string to Uint8array.
	 * @param str The string.
	 * @returns The corresponding Uint8Array.
	 */
	function StringToUint8Array(str) {
	    const arr = new Uint8Array(str.length + 1);
	    for (let i = 0; i < str.length; ++i) {
	        arr[i] = str.charCodeAt(i);
	    }
	    arr[str.length] = 0;
	    return arr;
	}
	exports.StringToUint8Array = StringToUint8Array;
	/**
	 * Convert Uint8array to string.
	 * @param array The array.
	 * @returns The corresponding string.
	 */
	function Uint8ArrayToString(arr) {
	    const ret = [];
	    for (const ch of arr) {
	        ret.push(String.fromCharCode(ch));
	    }
	    return ret.join("");
	}
	exports.Uint8ArrayToString = Uint8ArrayToString;
	/**
	 * Internal assert helper
	 * @param condition condition The condition to fail.
	 * @param msg msg The message.
	 */
	function assert(condition, msg) {
	    if (!condition) {
	        throw new Error("AssertError:" + (msg || ""));
	    }
	}
	exports.assert = assert;
	/**
	 * Get the path to the wasm library in nodejs.
	 * @return The wasm path.
	 */
	function wasmPath() {
	    return __dirname + "/wasm";
	}
	exports.wasmPath = wasmPath;

	});

	unwrapExports(support);
	var support_1 = support.StringToUint8Array;
	var support_2 = support.Uint8ArrayToString;
	var support_3 = support.assert;
	var support_4 = support.wasmPath;

	var memory = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	/**
	 * Wasm Memory wrapper to perform JS side raw memory access.
	 */
	class Memory {
	    constructor(memory) {
	        this.wasm32 = true;
	        this.memory = memory;
	        this.buffer = this.memory.buffer;
	        this.viewU8 = new Uint8Array(this.buffer);
	        this.viewU16 = new Uint16Array(this.buffer);
	        this.viewI32 = new Int32Array(this.buffer);
	        this.viewU32 = new Uint32Array(this.buffer);
	        this.viewF32 = new Float32Array(this.buffer);
	        this.viewF64 = new Float64Array(this.buffer);
	    }
	    loadU8(ptr) {
	        if (this.buffer != this.memory.buffer) {
	            this.updateViews();
	        }
	        return this.viewU8[ptr >> 0];
	    }
	    loadU16(ptr) {
	        if (this.buffer != this.memory.buffer) {
	            this.updateViews();
	        }
	        return this.viewU16[ptr >> 1];
	    }
	    loadU32(ptr) {
	        if (this.buffer != this.memory.buffer) {
	            this.updateViews();
	        }
	        return this.viewU32[ptr >> 2];
	    }
	    loadI32(ptr) {
	        if (this.buffer != this.memory.buffer) {
	            this.updateViews();
	        }
	        return this.viewI32[ptr >> 2];
	    }
	    loadI64(ptr) {
	        if (this.buffer != this.memory.buffer) {
	            this.updateViews();
	        }
	        const base = ptr >> 2;
	        // assumes little endian, for now truncate high.
	        return this.viewI32[base];
	    }
	    loadF32(ptr) {
	        if (this.buffer != this.memory.buffer) {
	            this.updateViews();
	        }
	        return this.viewF32[ptr >> 2];
	    }
	    loadF64(ptr) {
	        if (this.buffer != this.memory.buffer) {
	            this.updateViews();
	        }
	        return this.viewF64[ptr >> 3];
	    }
	    loadPointer(ptr) {
	        if (this.buffer != this.memory.buffer) {
	            this.updateViews();
	        }
	        if (this.wasm32) {
	            return this.loadU32(ptr);
	        }
	        else {
	            return this.loadI64(ptr);
	        }
	    }
	    loadUSize(ptr) {
	        if (this.buffer != this.memory.buffer) {
	            this.updateViews();
	        }
	        if (this.wasm32) {
	            return this.loadU32(ptr);
	        }
	        else {
	            return this.loadI64(ptr);
	        }
	    }
	    sizeofPtr() {
	        return this.wasm32 ? 4 /* I32 */ : 8 /* I64 */;
	    }
	    /**
	     * Load raw bytes from ptr.
	     * @param ptr The head address
	     * @param numBytes The number
	     */
	    loadRawBytes(ptr, numBytes) {
	        if (this.buffer != this.memory.buffer) {
	            this.updateViews();
	        }
	        const result = new Uint8Array(numBytes);
	        result.set(this.viewU8.slice(ptr, ptr + numBytes));
	        return result;
	    }
	    /**
	     * Load TVMByteArray from ptr.
	     *
	     * @param ptr The address of the header.
	     */
	    loadTVMBytes(ptr) {
	        const data = this.loadPointer(ptr);
	        const length = this.loadUSize(ptr + this.sizeofPtr());
	        return this.loadRawBytes(data, length);
	    }
	    /**
	     * Load null-terminated C-string from ptr.
	     * @param ptr The head address
	     */
	    loadCString(ptr) {
	        if (this.buffer != this.memory.buffer) {
	            this.updateViews();
	        }
	        // NOTE: the views are still valid for read.
	        const ret = [];
	        let ch = 1;
	        while (ch != 0) {
	            ch = this.viewU8[ptr];
	            if (ch != 0) {
	                ret.push(String.fromCharCode(ch));
	            }
	            ++ptr;
	        }
	        return ret.join("");
	    }
	    /**
	     * Store raw bytes to the ptr.
	     * @param ptr The head address.
	     * @param bytes The bytes content.
	     */
	    storeRawBytes(ptr, bytes) {
	        if (this.buffer != this.memory.buffer) {
	            this.updateViews();
	        }
	        this.viewU8.set(bytes, ptr);
	    }
	    /**
	     * Update memory view after the memory growth.
	     */
	    updateViews() {
	        this.buffer = this.memory.buffer;
	        this.viewU8 = new Uint8Array(this.buffer);
	        this.viewU16 = new Uint16Array(this.buffer);
	        this.viewI32 = new Int32Array(this.buffer);
	        this.viewU32 = new Uint32Array(this.buffer);
	        this.viewF32 = new Float32Array(this.buffer);
	        this.viewF64 = new Float64Array(this.buffer);
	    }
	}
	exports.Memory = Memory;
	/**
	 * Auxiliary call stack for the FFI calls.
	 *
	 * Lifecyle of a call stack.
	 * - Calls into allocXX to allocate space, mixed with storeXXX to store data.
	 * - Calls into ptrFromOffset, no further allocation(as ptrFromOffset can change),
	 *   can still call into storeXX
	 * - Calls into commitToWasmMemory once.
	 * - reset.
	 */
	class CachedCallStack {
	    constructor(memory, allocSpace, freeSpace) {
	        /** List of temporay arguments that can be disposed during reset. */
	        this.tempArgs = [];
	        this.stackTop = 0;
	        this.basePtr = 0;
	        this.addressToSetTargetValue = [];
	        const initCallStackSize = 128;
	        this.memory = memory;
	        this.cAllocSpace = allocSpace;
	        this.cFreeSpace = freeSpace;
	        this.buffer = new ArrayBuffer(initCallStackSize);
	        this.basePtr = this.cAllocSpace(initCallStackSize);
	        this.viewU8 = new Uint8Array(this.buffer);
	        this.viewI32 = new Int32Array(this.buffer);
	        this.viewU32 = new Uint32Array(this.buffer);
	        this.viewF64 = new Float64Array(this.buffer);
	        this.updateViews();
	    }
	    dispose() {
	        if (this.basePtr != 0) {
	            this.cFreeSpace(this.basePtr);
	            this.basePtr = 0;
	        }
	    }
	    /**
	     * Rest the call stack so that it can be reused again.
	     */
	    reset() {
	        this.stackTop = 0;
	        support.assert(this.addressToSetTargetValue.length == 0);
	        while (this.tempArgs.length != 0) {
	            this.tempArgs.pop().dispose();
	        }
	    }
	    /**
	     * Commit all the cached data to WasmMemory.
	     * This function can only be called once.
	     * No further store function should be called.
	     *
	     * @param nbytes Number of bytes to be stored.
	     */
	    commitToWasmMemory(nbytes = this.stackTop) {
	        // commit all pointer values.
	        while (this.addressToSetTargetValue.length != 0) {
	            const [targetOffset, valueOffset] = this.addressToSetTargetValue.pop();
	            this.storePtr(targetOffset, this.ptrFromOffset(valueOffset));
	        }
	        this.memory.storeRawBytes(this.basePtr, this.viewU8.slice(0, nbytes));
	    }
	    /**
	     * Allocate space by number of bytes
	     * @param nbytes Number of bytes.
	     * @note This function always allocate space that aligns to 64bit.
	     */
	    allocRawBytes(nbytes) {
	        // always aligns to 64bit
	        nbytes = ((nbytes + 7) >> 3) << 3;
	        if (this.stackTop + nbytes > this.buffer.byteLength) {
	            const newSize = Math.max(this.buffer.byteLength * 2, this.stackTop + nbytes);
	            const oldU8 = this.viewU8;
	            this.buffer = new ArrayBuffer(newSize);
	            this.updateViews();
	            this.viewU8.set(oldU8);
	            if (this.basePtr != 0) {
	                this.cFreeSpace(this.basePtr);
	            }
	            this.basePtr = this.cAllocSpace(newSize);
	        }
	        const retOffset = this.stackTop;
	        this.stackTop += nbytes;
	        return retOffset;
	    }
	    /**
	     * Allocate space for pointers.
	     * @param count Number of pointers.
	     * @returns The allocated pointer array.
	     */
	    allocPtrArray(count) {
	        return this.allocRawBytes(this.memory.sizeofPtr() * count);
	    }
	    /**
	     * Get the real pointer from offset values.
	     * Note that the returned value becomes obsolete if alloc is called on the stack.
	     * @param offset The allocated offset.
	     */
	    ptrFromOffset(offset) {
	        return this.basePtr + offset;
	    }
	    // Store APIs
	    storePtr(offset, value) {
	        if (this.memory.wasm32) {
	            this.storeU32(offset, value);
	        }
	        else {
	            this.storeI64(offset, value);
	        }
	    }
	    storeUSize(offset, value) {
	        if (this.memory.wasm32) {
	            this.storeU32(offset, value);
	        }
	        else {
	            this.storeI64(offset, value);
	        }
	    }
	    storeI32(offset, value) {
	        this.viewI32[offset >> 2] = value;
	    }
	    storeU32(offset, value) {
	        this.viewU32[offset >> 2] = value;
	    }
	    storeI64(offset, value) {
	        // For now, just store as 32bit
	        // NOTE: wasm always uses little endian.
	        const low = value & 0xffffffff;
	        const base = offset >> 2;
	        this.viewI32[base] = low;
	        this.viewI32[base + 1] = 0;
	    }
	    storeF64(offset, value) {
	        this.viewF64[offset >> 3] = value;
	    }
	    storeRawBytes(offset, bytes) {
	        this.viewU8.set(bytes, offset);
	    }
	    /**
	     * Allocate then set C-String pointer to the offset.
	     * This function will call into allocBytes to allocate necessary data.
	     * The address won't be set immediately(because the possible change of basePtr)
	     * and will be filled when we commit the data.
	     *
	     * @param offset The offset to set ot data pointer.
	     * @param data The string content.
	     */
	    allocThenSetArgString(offset, data) {
	        const strOffset = this.allocRawBytes(data.length + 1);
	        this.storeRawBytes(strOffset, support.StringToUint8Array(data));
	        this.addressToSetTargetValue.push([offset, strOffset]);
	    }
	    /**
	     * Allocate then set the argument location with a TVMByteArray.
	     * Allocate new temporary space for bytes.
	     *
	     * @param offset The offset to set ot data pointer.
	     * @param data The string content.
	     */
	    allocThenSetArgBytes(offset, data) {
	        // Note: size of size_t equals sizeof ptr.
	        const headerOffset = this.allocRawBytes(this.memory.sizeofPtr() * 2);
	        const dataOffset = this.allocRawBytes(data.length);
	        this.storeRawBytes(dataOffset, data);
	        this.storeUSize(headerOffset + this.memory.sizeofPtr(), data.length);
	        this.addressToSetTargetValue.push([offset, headerOffset]);
	        this.addressToSetTargetValue.push([headerOffset, dataOffset]);
	    }
	    /**
	     * Update internal cache views.
	     */
	    updateViews() {
	        this.viewU8 = new Uint8Array(this.buffer);
	        this.viewI32 = new Int32Array(this.buffer);
	        this.viewU32 = new Uint32Array(this.buffer);
	        this.viewF64 = new Float64Array(this.buffer);
	    }
	}
	exports.CachedCallStack = CachedCallStack;

	});

	unwrapExports(memory);
	var memory_1 = memory.Memory;
	var memory_2 = memory.CachedCallStack;

	var environment = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	/**
	 * Detect library provider from the importObject.
	 *
	 * @param importObject The import object.
	 */
	function detectLibraryProvider(importObject) {
	    if (importObject["wasmLibraryProvider"] &&
	        importObject["wasmLibraryProvider"]["start"] &&
	        importObject["wasmLibraryProvider"]["imports"] !== undefined) {
	        const item = importObject;
	        // create provider so that we capture imports in the provider.
	        return {
	            imports: item.wasmLibraryProvider.imports,
	            start: (inst) => {
	                item.wasmLibraryProvider.start(inst);
	            },
	        };
	    }
	    else if (importObject["imports"] && importObject["start"] !== undefined) {
	        return importObject;
	    }
	    else if (importObject["wasiImport"] && importObject["start"] !== undefined) {
	        // WASI
	        return {
	            imports: {
	                "wasi_snapshot_preview1": importObject["wasiImport"],
	            },
	            start: (inst) => {
	                importObject["start"](inst);
	            }
	        };
	    }
	    else {
	        return undefined;
	    }
	}
	/**
	 * Environment to impelement most of the JS library functions.
	 */
	class Environment {
	    constructor(importObject = {}, logger = console.log) {
	        /**
	         * Maintains a table of FTVMWasmPackedCFunc that the C part
	         * can call via TVMWasmPackedCFunc.
	         *
	         * We maintain a separate table so that we can have un-limited amount
	         * of functions that do not maps to the address space.
	         */
	        this.packedCFuncTable = [
	            undefined,
	        ];
	        /**
	         * Free table index that can be recycled.
	         */
	        this.packedCFuncTableFreeId = [];
	        this.logger = logger;
	        this.libProvider = detectLibraryProvider(importObject);
	        // get imports from the provider
	        if (this.libProvider !== undefined) {
	            this.imports = this.libProvider.imports;
	        }
	        else {
	            this.imports = importObject;
	        }
	        // update with more functions
	        this.imports.env = this.environment(this.imports.env);
	    }
	    /** Mark the start of the instance. */
	    start(inst) {
	        if (this.libProvider !== undefined) {
	            this.libProvider.start(inst);
	        }
	    }
	    environment(initEnv) {
	        // default env can be be overriden by libraries.
	        const defaultEnv = {
	            "__cxa_thread_atexit": () => { },
	            // eslint-disable-next-line @typescript-eslint/no-unused-vars
	            "emscripten_notify_memory_growth": (index) => { }
	        };
	        const wasmPackedCFunc = (args, typeCodes, nargs, ret, resourceHandle) => {
	            const cfunc = this.packedCFuncTable[resourceHandle];
	            support.assert(cfunc !== undefined);
	            return cfunc(args, typeCodes, nargs, ret, resourceHandle);
	        };
	        const wasmPackedCFuncFinalizer = (resourceHandle) => {
	            this.packedCFuncTable[resourceHandle] = undefined;
	            this.packedCFuncTableFreeId.push(resourceHandle);
	        };
	        const newEnv = {
	            TVMWasmPackedCFunc: wasmPackedCFunc,
	            TVMWasmPackedCFuncFinalizer: wasmPackedCFuncFinalizer,
	            "__console_log": (msg) => {
	                this.logger(msg);
	            }
	        };
	        return Object.assign(defaultEnv, initEnv, newEnv);
	    }
	}
	exports.Environment = Environment;

	});

	unwrapExports(environment);
	var environment_1 = environment.Environment;

	var webgpu = createCommonjsModule(function (module, exports) {
	var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	/*
	 * Licensed to the Apache Software Foundation (ASF) under one
	 * or more contributor license agreements.  See the NOTICE file
	 * distributed with this work for additional information
	 * regarding copyright ownership.  The ASF licenses this file
	 * to you under the Apache License, Version 2.0 (the
	 * "License"); you may not use this file except in compliance
	 * with the License.  You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing,
	 * software distributed under the License is distributed on an
	 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	 * KIND, either express or implied.  See the License for the
	 * specific language governing permissions and limitations
	 * under the License.
	 */

	/**
	 * DetectGPU device in the environment.
	 */
	function detectGPUDevice() {
	    return __awaiter(this, void 0, void 0, function* () {
	        if (typeof navigator !== "undefined" && navigator.gpu !== undefined) {
	            const adapter = yield navigator.gpu.requestAdapter();
	            return yield adapter.requestDevice();
	        }
	        else {
	            return undefined;
	        }
	    });
	}
	exports.detectGPUDevice = detectGPUDevice;
	/**
	 * WebGPU context
	 * Manages all the webgpu resources here.
	 */
	class WebGPUContext {
	    constructor(memory, device) {
	        //private readBuffer:;
	        this.bufferTable = [undefined];
	        this.bufferTableFreeId = [];
	        this.pendingRead = Promise.resolve();
	        this.numPendingReads = 0;
	        this.memory = memory;
	        this.device = device;
	    }
	    /**
	     * Wait for all pending GPU tasks to complete
	     */
	    sync() {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (typeof this.device.defaultQueue.createFence != "undefined") {
	                const fence = this.device.defaultQueue.createFence();
	                this.device.defaultQueue.signal(fence, 1);
	                if (this.numPendingReads != 0) {
	                    // eslint-disable-next-line @typescript-eslint/no-empty-function
	                    yield Promise.all([fence.onCompletion(1), this.pendingRead]);
	                }
	                else {
	                    yield fence.onCompletion(1);
	                }
	            }
	            else {
	                console.log("WARNING: createFence is not supported timing info for GPU compute can be inaccurate");
	                yield this.pendingRead;
	            }
	        });
	    }
	    /**
	     * Create a PackedFunc that runs the given shader
	     *
	     * @param info The function information in json.
	     * @param data The shader data(in SPIRV)
	     */
	    createShader(info, data) {
	        const finfo = JSON.parse(info);
	        const layoutEntries = [];
	        for (let i = 0; i < finfo.arg_types.length; ++i) {
	            const dtype = finfo.arg_types[i];
	            if (dtype == "handle") {
	                layoutEntries.push({
	                    binding: i,
	                    visibility: GPUShaderStage.COMPUTE,
	                    type: "storage-buffer"
	                });
	            }
	            else {
	                throw new Error("Cannot handle argument type " + dtype + " in WebGPU shader");
	            }
	        }
	        const bindGroupLayout = this.device.createBindGroupLayout({
	            entries: layoutEntries
	        });
	        const pipeline = this.device.createComputePipeline({
	            layout: this.device.createPipelineLayout({
	                bindGroupLayouts: [bindGroupLayout]
	            }),
	            computeStage: {
	                module: this.device.createShaderModule({
	                    code: new Uint32Array(data.buffer)
	                }),
	                entryPoint: "main"
	            }
	        });
	        const dispatchToDim = [];
	        for (let i = 0; i < finfo.thread_axis_tags.length; ++i) {
	            const tag = finfo.thread_axis_tags[i];
	            if (tag.startsWith("blockIdx.")) {
	                const target = tag.charCodeAt(tag.length - 1) - ("x".charCodeAt(0));
	                support.assert(target >= 0 && target < 3);
	                dispatchToDim.push(target);
	            }
	            else if (tag.startsWith("threadIdx.")) {
	                const target = tag.charCodeAt(tag.length - 1) - ("x".charCodeAt(0));
	                support.assert(target >= 0 && target < 3);
	                dispatchToDim.push(target + 3);
	            }
	            else {
	                throw new Error("Cannot handle thread_axis " + tag);
	            }
	        }
	        const submitShader = (...args) => {
	            const commandEncoder = this.device.createCommandEncoder();
	            const compute = commandEncoder.beginComputePass();
	            compute.setPipeline(pipeline);
	            const bindGroupEntries = [];
	            support.assert(args.length == layoutEntries.length + dispatchToDim.length);
	            for (let i = 0; i < layoutEntries.length; ++i) {
	                bindGroupEntries.push({
	                    binding: i,
	                    resource: {
	                        buffer: this.gpuBufferFromPtr(args[i])
	                    }
	                });
	            }
	            compute.setBindGroup(0, this.device.createBindGroup({
	                layout: bindGroupLayout,
	                entries: bindGroupEntries
	            }));
	            const wl = [1, 1, 1, 1, 1, 1];
	            for (let i = 0; i < dispatchToDim.length; ++i) {
	                wl[dispatchToDim[i]] = args[layoutEntries.length + i];
	            }
	            compute.dispatch(wl[0], wl[1], wl[2]);
	            compute.endPass();
	            const command = commandEncoder.finish();
	            this.device.defaultQueue.submit([command]);
	        };
	        return submitShader;
	    }
	    /**
	     * Get the device API according to its name
	     * @param The name of the API.
	     * @returns The corresponding device api.
	     */
	    getDeviceAPI(name) {
	        if (name == "deviceAllocDataSpace") {
	            return (nbytes) => {
	                return this.deviceAllocDataSpace(nbytes);
	            };
	        }
	        else if (name == "deviceFreeDataSpace") {
	            return (ptr) => {
	                return this.deviceFreeDataSpace(ptr);
	            };
	        }
	        else if (name == "deviceCopyToGPU") {
	            return (from, to, toOffset, nbytes) => {
	                this.deviceCopyToGPU(from, to, toOffset, nbytes);
	            };
	        }
	        else if (name == "deviceCopyFromGPU") {
	            return (from, fromOffset, to, nbytes) => {
	                this.deviceCopyFromGPU(from, fromOffset, to, nbytes);
	            };
	        }
	        else if (name == "deviceCopyWithinGPU") {
	            return (from, fromOffset, to, toOffset, nbytes) => {
	                this.deviceCopyWithinGPU(from, fromOffset, to, toOffset, nbytes);
	            };
	        }
	        else {
	            throw new Error("Unknown DeviceAPI function " + name);
	        }
	    }
	    // DeviceAPI
	    deviceAllocDataSpace(nbytes) {
	        const buffer = this.device.createBuffer({
	            size: nbytes,
	            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
	        });
	        return this.attachToBufferTable(buffer);
	    }
	    deviceFreeDataSpace(ptr) {
	        const idx = ptr;
	        const buffer = this.bufferTable[idx];
	        this.bufferTable[idx] = undefined;
	        support.assert(buffer !== undefined);
	        this.bufferTableFreeId.push(idx);
	        buffer.destroy();
	    }
	    deviceCopyToGPU(from, to, toOffset, nbytes) {
	        // Perhaps it would be more useful to use a staging buffer?
	        const [gpuTemp, cpuTemp] = this.device.createBufferMapped({
	            size: nbytes,
	            usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
	        });
	        const viewU8 = new Uint8Array(cpuTemp);
	        viewU8.set(this.memory.loadRawBytes(from, nbytes));
	        gpuTemp.unmap();
	        const copyEncoder = this.device.createCommandEncoder();
	        copyEncoder.copyBufferToBuffer(gpuTemp, 0, this.gpuBufferFromPtr(to), toOffset, nbytes);
	        const copyCommands = copyEncoder.finish();
	        this.device.defaultQueue.submit([copyCommands]);
	        gpuTemp.destroy();
	    }
	    deviceCopyFromGPU(from, fromOffset, to, nbytes) {
	        // Perhaps it would be more useful to resuse a staging buffer?
	        const gpuTemp = this.device.createBuffer({
	            size: nbytes,
	            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
	        });
	        const copyEncoder = this.device.createCommandEncoder();
	        copyEncoder.copyBufferToBuffer(this.gpuBufferFromPtr(from), fromOffset, gpuTemp, 0, nbytes);
	        const copyCommands = copyEncoder.finish();
	        this.device.defaultQueue.submit([copyCommands]);
	        this.numPendingReads += 1;
	        const readEvent = gpuTemp.mapReadAsync().then((data) => {
	            this.memory.storeRawBytes(to, new Uint8Array(data));
	            this.numPendingReads -= 1;
	            gpuTemp.destroy();
	        });
	        if (this.numPendingReads == 1) {
	            this.pendingRead = readEvent;
	        }
	        else {
	            this.pendingRead = Promise.all([
	                this.pendingRead,
	                readEvent,
	            ]).then(() => { });
	        }
	    }
	    deviceCopyWithinGPU(from, fromOffset, to, toOffset, nbytes) {
	        const copyEncoder = this.device.createCommandEncoder();
	        copyEncoder.copyBufferToBuffer(this.gpuBufferFromPtr(from), fromOffset, this.gpuBufferFromPtr(to), toOffset, nbytes);
	        const copyCommands = copyEncoder.finish();
	        this.device.defaultQueue.submit([copyCommands]);
	    }
	    gpuBufferFromPtr(ptr) {
	        const buffer = this.bufferTable[ptr];
	        support.assert(buffer !== undefined);
	        return buffer;
	    }
	    attachToBufferTable(buffer) {
	        if (this.bufferTableFreeId.length != 0) {
	            const idx = this.bufferTableFreeId.pop();
	            this.bufferTable[idx] = buffer;
	            return idx;
	        }
	        else {
	            const idx = this.bufferTable.length;
	            this.bufferTable.push(buffer);
	            return idx;
	        }
	    }
	}
	exports.WebGPUContext = WebGPUContext;

	});

	unwrapExports(webgpu);
	var webgpu_1 = webgpu.detectGPUDevice;
	var webgpu_2 = webgpu.WebGPUContext;

	var compact = createCommonjsModule(function (module, exports) {
	/*
	 * Licensed to the Apache Software Foundation (ASF) under one
	 * or more contributor license agreements.  See the NOTICE file
	 * distributed with this work for additional information
	 * regarding copyright ownership.  The ASF licenses this file
	 * to you under the Apache License, Version 2.0 (the
	 * "License"); you may not use this file except in compliance
	 * with the License.  You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing,
	 * software distributed under the License is distributed on an
	 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	 * KIND, either express or implied.  See the License for the
	 * specific language governing permissions and limitations
	 * under the License.
	 */
	/** NodeJS and Web compact layer */
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	 * Get performance masurement.
	 */
	function getPeformance() {
	    if (typeof performance == "undefined") {
	        // eslint-disable-next-line @typescript-eslint/no-var-requires
	        const performanceNode = perf_hooks;
	        return performanceNode.performance;
	    }
	    else {
	        return performance;
	    }
	}
	exports.getPeformance = getPeformance;
	/**
	 * Create a new websocket for a given URL
	 * @param url The url.
	 */
	function createWebSocket(url) {
	    if (typeof WebSocket == "undefined") {
	        // eslint-disable-next-line @typescript-eslint/no-var-requires
	        const WebSocket = ws;
	        return new WebSocket(url);
	    }
	    else {
	        return new WebSocket(url);
	    }
	}
	exports.createWebSocket = createWebSocket;

	});

	unwrapExports(compact);
	var compact_1 = compact.getPeformance;
	var compact_2 = compact.createWebSocket;

	var runtime = createCommonjsModule(function (module, exports) {
	/*
	 * Licensed to the Apache Software Foundation (ASF) under one
	 * or more contributor license agreements.  See the NOTICE file
	 * distributed with this work for additional information
	 * regarding copyright ownership.  The ASF licenses this file
	 * to you under the Apache License, Version 2.0 (the
	 * "License"); you may not use this file except in compliance
	 * with the License.  You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing,
	 * software distributed under the License is distributed on an
	 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	 * KIND, either express or implied.  See the License for the
	 * specific language governing permissions and limitations
	 * under the License.
	 */
	var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	Object.defineProperty(exports, "__esModule", { value: true });





	/**
	 * @internal
	 * FFI Library wrapper, maintains most runtime states.
	 */
	class FFILibrary {
	    constructor(wasmInstance, imports) {
	        this.recycledCallStacks = [];
	        this.wasmInstance = wasmInstance;
	        this.memory = new memory.Memory(this.detectWasmMemory(this.wasmInstance, imports));
	        support.assert(this.wasmInstance.exports !== undefined, "Expect the library module contains exports");
	        this.exports = this.wasmInstance.exports;
	        this.wasm32 = this.memory.wasm32;
	        this.validateInstance();
	    }
	    dispose() {
	        while (this.recycledCallStacks.length != 0) {
	            this.recycledCallStacks.pop().dispose();
	        }
	    }
	    sizeofPtr() {
	        return this.memory.sizeofPtr();
	    }
	    checkCall(code) {
	        if (code != 0) {
	            const msgPtr = this.exports
	                .TVMGetLastError();
	            throw new Error("TVMError: " + this.memory.loadCString(msgPtr));
	        }
	    }
	    getOrAllocCallStack() {
	        if (this.recycledCallStacks.length != 0) {
	            return this.recycledCallStacks.pop();
	        }
	        return new memory.CachedCallStack(this.memory, this.exports.TVMWasmAllocSpace, this.exports.TVMWasmFreeSpace);
	    }
	    recycleCallStack(callstack) {
	        callstack.reset();
	        this.recycledCallStacks.push(callstack);
	    }
	    validateInstance() {
	        this.checkExports(["TVMWasmAllocSpace", "TVMWasmFreeSpace", "TVMFuncFree"]);
	    }
	    checkExports(funcNames) {
	        const missList = [];
	        for (const name of funcNames) {
	            const f = this.exports[name];
	            if (!(f instanceof Function)) {
	                missList.push(name);
	            }
	        }
	        if (missList.length != 0) {
	            throw new Error("Cannot find " + missList + " in exports");
	        }
	    }
	    detectWasmMemory(instance, imports) {
	        if (instance.exports.memory instanceof WebAssembly.Memory) {
	            return instance.exports.memory;
	        }
	        if (imports.env && imports.env.memory instanceof WebAssembly.Memory) {
	            return imports.env.memory;
	        }
	        throw new Error("Cannt detect wasm memory from imports " +
	            imports +
	            " or exports" +
	            instance.exports);
	    }
	}
	/**
	 * A typed scalar constant used to represent a typed number
	 * argument to PackedFunc calls.
	 */
	class Scalar {
	    constructor(value, dtype) {
	        this.value = value;
	        this.dtype = dtype;
	    }
	}
	exports.Scalar = Scalar;
	/**
	 * Cell holds the PackedFunc object.
	 */
	class PackedFuncCell {
	    constructor(handle, lib) {
	        this.handle = handle;
	        this.lib = lib;
	    }
	    dispose() {
	        if (this.handle != 0) {
	            this.lib.checkCall(this.lib.exports.TVMFuncFree(this.handle));
	            this.handle = 0;
	        }
	    }
	}
	const DeviceEnumToStr = {
	    1: "cpu",
	    2: "gpu",
	    4: "opencl",
	    8: "metal",
	    15: "webgpu"
	};
	const DeviceStrToEnum = {
	    cpu: 1,
	    gpu: 2,
	    cuda: 2,
	    cl: 4,
	    opencl: 4,
	    vulkan: 7,
	    metal: 8,
	    webgpu: 15
	};
	/**
	 * Represent a runtime context where a NDArray can reside.
	 */
	class DLContext {
	    constructor(deviceType, deviceId, lib) {
	        const tp = typeof deviceType;
	        if (tp == "string") {
	            this.deviceType = DeviceStrToEnum[deviceType];
	            if (this.deviceType == undefined) {
	                throw new Error("Cannot recogonize deviceType " + deviceType);
	            }
	        }
	        else if (tp == "number") {
	            this.deviceType = deviceType;
	        }
	        else {
	            throw new Error("Cannot take type " + tp + " as deviceType");
	        }
	        this.deviceId = deviceId;
	        this.lib = lib;
	    }
	    /**
	     * Synchronize the context
	     */
	    sync() {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (this.deviceType == DeviceStrToEnum.webgpu) {
	                support.assert(this.lib.webGPUContext !== undefined);
	                yield this.lib.webGPUContext.sync();
	            }
	        });
	    }
	    toString() {
	        return (DeviceEnumToStr[this.deviceType] + "(" + this.deviceId.toString() + ")");
	    }
	}
	exports.DLContext = DLContext;
	const DLDataTypeCodeToStr = {
	    0: "int",
	    1: "uint",
	    2: "float",
	    4: "handle",
	};
	/**
	 * Runtime data type of NDArray.
	 */
	class DLDataType {
	    constructor(code, bits, lanes) {
	        this.code = code;
	        this.bits = bits;
	        this.lanes = lanes;
	    }
	    toString() {
	        const ret = DLDataTypeCodeToStr[this.code] + this.bits.toString();
	        if (this.lanes != 1) {
	            return ret + "x" + this.lanes.toString();
	        }
	        else {
	            return ret;
	        }
	    }
	    numStorageBytes() {
	        return (this.bits * this.lanes + 7) >> 3;
	    }
	}
	exports.DLDataType = DLDataType;
	/**
	 * n-dimnesional array.
	 */
	class NDArray {
	    constructor(handle, isView, lib) {
	        this.handle = handle;
	        this.isView = isView;
	        this.lib = lib;
	        if (this.isView) {
	            this.dltensor = handle;
	        }
	        else {
	            this.dltensor = this.getDLTensorFromArrayHandle(this.handle);
	        }
	        // constant offsets.
	        const arrayOffsetData = 0;
	        const arrayOffsetContext = arrayOffsetData + this.lib.sizeofPtr();
	        const arrayOffsetDevType = arrayOffsetContext;
	        const arrayOffsetDevId = arrayOffsetContext + 4 /* I32 */;
	        const arrayOffsetNdim = arrayOffsetContext + 8 /* DLContext */;
	        const arrayOffsetDtype = arrayOffsetNdim + 4 /* I32 */;
	        const arrayOffsetDtypeCode = arrayOffsetDtype;
	        const arrayOffsetDtypeBits = arrayOffsetDtype + 1 /* U8 */;
	        const arrayOffsetDtypeLanes = arrayOffsetDtypeBits + 1 /* U8 */;
	        const arrayOffsetShape = arrayOffsetDtype + 4 /* DLDataType */;
	        const arrayOffsetStrides = arrayOffsetShape + this.lib.sizeofPtr();
	        const arrayOffsetByteOffset = arrayOffsetStrides + this.lib.sizeofPtr();
	        // dataPtr
	        this.dataPtr = lib.memory.loadPointer(this.dltensor);
	        // ndim
	        this.ndim = lib.memory.loadI32(this.dltensor + arrayOffsetNdim);
	        // shape
	        const cshapePtr = lib.memory.loadPointer(this.dltensor + arrayOffsetShape);
	        this.shape = [];
	        for (let i = 0; i < this.ndim; ++i) {
	            this.shape.push(lib.memory.loadI64(cshapePtr + i * 8 /* I64 */));
	        }
	        // dtype
	        const code = lib.memory.loadU8(this.dltensor + arrayOffsetDtypeCode);
	        const bits = lib.memory.loadU8(this.dltensor + arrayOffsetDtypeBits);
	        const lanes = lib.memory.loadU16(this.dltensor + arrayOffsetDtypeLanes);
	        this.dlDataType = new DLDataType(code, bits, lanes);
	        this.dtype = this.dlDataType.toString();
	        // ctx
	        const deviceType = lib.memory.loadI32(this.dltensor + arrayOffsetDevType);
	        const deviceId = lib.memory.loadI32(this.dltensor + arrayOffsetDevId);
	        this.context = new DLContext(deviceType, deviceId, lib);
	        // byte_offset
	        this.byteOffset = lib.memory.loadI64(this.dltensor + arrayOffsetByteOffset);
	    }
	    dispose() {
	        if (this.handle != 0 && !this.isView) {
	            this.lib.checkCall(this.lib.exports.TVMArrayFree(this.handle));
	            this.handle = 0;
	        }
	    }
	    /**
	     * Copy data from another NDArray or javascript array.
	     * The number of elements must match.
	     *
	     * @param data The source data array.
	     * @returns this
	     */
	    copyFrom(data) {
	        if (data instanceof NDArray) {
	            this.lib.checkCall(this.lib.exports.TVMArrayCopyFromTo(data.handle, this.handle, 0));
	            return this;
	        }
	        else {
	            const size = this.shape.reduce((a, b) => {
	                return a * b;
	            }, 1);
	            if (data.length != size) {
	                throw new Error("data size and shape mismatch data.length" +
	                    data.length +
	                    " vs " +
	                    size);
	            }
	            let buffer;
	            if (this.dtype == "float32") {
	                buffer = Float32Array.from(data).buffer;
	            }
	            else if (this.dtype == "float64") {
	                buffer = Float64Array.from(data).buffer;
	            }
	            else if (this.dtype == "int32") {
	                buffer = Int32Array.from(data).buffer;
	            }
	            else if (this.dtype == "int8") {
	                buffer = Int8Array.from(data).buffer;
	            }
	            else if (this.dtype == "uint8") {
	                buffer = Uint8Array.from(data).buffer;
	            }
	            else {
	                throw new Error("Unsupported data type " + this.dtype);
	            }
	            return this.copyFromRawBytes(new Uint8Array(buffer));
	        }
	    }
	    /**
	     * Copy data from raw bytes.
	     * @param data Uint8Array of bytes.
	     * @returns this
	     */
	    copyFromRawBytes(data) {
	        const size = this.shape.reduce((a, b) => {
	            return a * b;
	        }, 1);
	        const nbytes = this.dlDataType.numStorageBytes() * size;
	        if (nbytes != data.length) {
	            throw new Error("Expect the data's length equals nbytes=" + nbytes);
	        }
	        const stack = this.lib.getOrAllocCallStack();
	        const tempOffset = stack.allocRawBytes(nbytes);
	        const tempPtr = stack.ptrFromOffset(tempOffset);
	        this.lib.memory.storeRawBytes(tempPtr, data);
	        this.lib.checkCall(this.lib.exports.TVMArrayCopyFromBytes(this.handle, tempPtr, nbytes));
	        this.lib.recycleCallStack(stack);
	        return this;
	    }
	    /**
	     * Return a copied Uint8Array of the raw bytes in the NDArray.
	     * @returns The result array.
	     */
	    toRawBytes() {
	        if (this.context.deviceType != DeviceStrToEnum.cpu) {
	            throw new Error("Can only synchronize copy for GPU array, use copyfrom instead.");
	        }
	        const size = this.shape.reduce((a, b) => {
	            return a * b;
	        }, 1);
	        const nbytes = this.dlDataType.numStorageBytes() * size;
	        const stack = this.lib.getOrAllocCallStack();
	        const tempOffset = stack.allocRawBytes(nbytes);
	        const tempPtr = stack.ptrFromOffset(tempOffset);
	        this.lib.checkCall(this.lib.exports.TVMArrayCopyToBytes(this.handle, tempPtr, nbytes));
	        const ret = this.lib.memory.loadRawBytes(tempPtr, nbytes);
	        this.lib.recycleCallStack(stack);
	        return ret;
	    }
	    /**
	     * Return a TypedArray copy of the NDArray, the specific type depends on
	     * the dtype of the NDArray.
	     * @returns The result array.
	     */
	    toArray() {
	        const stype = this.dtype;
	        if (stype == "float32") {
	            return new Float32Array(this.toRawBytes().buffer);
	        }
	        else if (stype == "float64") {
	            return new Float64Array(this.toRawBytes().buffer);
	        }
	        else if (stype == "int32") {
	            return new Int32Array(this.toRawBytes().buffer);
	        }
	        else if (stype == "int8") {
	            return new Int8Array(this.toRawBytes().buffer);
	        }
	        else if (stype == "uint8") {
	            return new Uint8Array(this.toRawBytes().buffer);
	        }
	        else {
	            throw new Error("Unsupported data type " + this.dtype);
	        }
	    }
	    getDLTensorFromArrayHandle(handle) {
	        // Note: this depends on the NDArray C ABI.
	        // keep this function in case of ABI change.
	        return handle;
	    }
	}
	exports.NDArray = NDArray;
	/**
	 * Runtime Module.
	 */
	class Module {
	    constructor(handle, lib, makePackedFunc) {
	        this.handle = handle;
	        this.lib = lib;
	        this.makePackedFunc = makePackedFunc;
	    }
	    dispose() {
	        if (this.handle != 0) {
	            this.lib.checkCall(this.lib.exports.TVMModFree(this.handle));
	            this.handle = 0;
	        }
	    }
	    /**
	     * Get a function in the module.
	     * @param name The name of the function.
	     * @returns The result function.
	     */
	    getFunction(name) {
	        const stack = this.lib.getOrAllocCallStack();
	        const nameOffset = stack.allocRawBytes(name.length + 1);
	        stack.storeRawBytes(nameOffset, support.StringToUint8Array(name));
	        const outOffset = stack.allocPtrArray(1);
	        const outPtr = stack.ptrFromOffset(outOffset);
	        stack.commitToWasmMemory(outOffset);
	        this.lib.checkCall(this.lib.exports.TVMModGetFunction(this.handle, stack.ptrFromOffset(nameOffset), 1, outPtr));
	        const handle = this.lib.memory.loadPointer(outPtr);
	        this.lib.recycleCallStack(stack);
	        if (handle == 0) {
	            throw Error("Cannot find function " + name);
	        }
	        const ret = this.makePackedFunc(handle);
	        return ret;
	    }
	    /**
	     * Import another module into the current runtime module.
	     * @param mod The module to be imported.
	     */
	    importModule(mod) {
	        this.lib.checkCall(this.lib.exports.TVMModImport(this.handle, mod.handle));
	    }
	}
	exports.Module = Module;
	/**
	 *  Graph runtime.
	 *
	 *  This is a thin wrapper of the underlying TVM module.
	 *  you can also directly call set_input, run, and get_output
	 *  of underlying module functions
	 */
	class GraphRuntime {
	    /**
	     * COnstructor
	     * @param module The underlying module.
	     */
	    constructor(module) {
	        this.module = module;
	        this.packedSetInput = module.getFunction("set_input");
	        this.packedRun = module.getFunction("run");
	        this.packedGetOutput = module.getFunction("get_output");
	        this.packedLoadParams = module.getFunction("load_params");
	    }
	    dispose() {
	        this.packedSetInput.dispose();
	        this.packedRun.dispose();
	        this.packedGetOutput.dispose();
	    }
	    /**
	     * Set input to the executor.
	     *
	     * @param key The input key.
	     * @param value The value to get set.
	     */
	    setInput(key, value) {
	        if (typeof key == "number") {
	            this.packedSetInput(new Scalar(key, "int32"), value);
	        }
	        else {
	            this.packedSetInput(key, value);
	        }
	    }
	    /**
	     * Execute the underlying graph.
	     */
	    run() {
	        this.packedRun();
	    }
	    /**
	     * Get index-th output.
	     * @param index The index number.
	     * @param out The optional output storage parameters.
	     * @returns The output array.
	     */
	    getOutput(index, out = undefined) {
	        if (out !== undefined) {
	            this.packedGetOutput(new Scalar(index, "int32"), out);
	            return out;
	        }
	        else {
	            return this.packedGetOutput(new Scalar(index, "int32"));
	        }
	    }
	    /**
	     * Load parameters from parameter binary.
	     * @param paramBinary The parameter binary.
	     */
	    loadParams(paramBinary) {
	        this.packedLoadParams(paramBinary);
	    }
	    /**
	     * Benchmark stable execution of the graph(without data copy).
	     * @params ctx The context to sync during each run.
	     * @number The number of times to compute the average.
	     * @repeat The number of times to repeat the run.
	     */
	    benchmarkRuns(ctx, number = 10, repeat = 4) {
	        return __awaiter(this, void 0, void 0, function* () {
	            // Skip first run as it can involve GPU warmup and module loading time.
	            const perf = compact.getPeformance();
	            const results = [];
	            this.run();
	            yield ctx.sync();
	            for (let k = 0; k < repeat; ++k) {
	                const tstart = perf.now();
	                for (let i = 0; i < number; ++i) {
	                    this.run();
	                }
	                yield ctx.sync();
	                const tend = perf.now();
	                results.push((tend - tstart) / number);
	            }
	            return results;
	        });
	    }
	}
	/**
	 * TVM runtime instance.
	 */
	class Instance {
	    /**
	     * Constructor
	     *
	     * importObject can also be a {@link LibraryProvider} object,
	     * a WASI object, or an object containing wasmLibraryProvider field.
	     *
	     * @param wasmModule The input module or instance.
	     * @param importObject The imports to initialize the wasmInstance if it is not provided.
	     * @param wasmInstance Additional wasm instance argument for deferred construction.
	     * @param env Directly specified environment module.
	     *
	     * @see Please use the async version {@link instantiate} when targeting browsers.
	     */
	    constructor(wasmModule, importObject = {}, wasmInstance, env) {
	        if (wasmInstance instanceof WebAssembly.Instance) {
	            support.assert(env instanceof environment.Environment, "env must be provided when passing in instance");
	        }
	        else {
	            support.assert(env === undefined);
	            env = new environment.Environment(importObject);
	            wasmInstance = new WebAssembly.Instance(wasmModule, env.imports);
	        }
	        env.start(wasmInstance);
	        this.env = env;
	        this.lib = new FFILibrary(wasmInstance, env.imports);
	        this.memory = this.lib.memory;
	        this.exports = this.lib.exports;
	        this.registerEnvGlobalPackedFuncs();
	    }
	    dispose() {
	        this.lib.dispose();
	    }
	    /**
	     * Get system-wide library module in the wasm.
	     * System lib is a global module that contains self register functions in startup.
	     * @returns The system library module.
	     */
	    systemLib() {
	        const getSysLib = this.getGlobalFunc("runtime.SystemLib");
	        const mod = getSysLib();
	        getSysLib.dispose();
	        return mod;
	    }
	    /**
	     * List all the global function names registered in the runtime.
	     * @returns The name list.
	     */
	    listGlobalFuncNames() {
	        const stack = this.lib.getOrAllocCallStack();
	        const outSizeOffset = stack.allocPtrArray(2);
	        const outSizePtr = stack.ptrFromOffset(outSizeOffset);
	        const outArrayPtr = stack.ptrFromOffset(outSizeOffset + this.lib.sizeofPtr());
	        this.lib.checkCall(this.exports.TVMFuncListGlobalNames(outSizePtr, outArrayPtr));
	        const size = this.memory.loadI32(outSizePtr);
	        const array = this.memory.loadPointer(outArrayPtr);
	        const names = [];
	        for (let i = 0; i < size; ++i) {
	            names.push(this.memory.loadCString(this.memory.loadPointer(array + this.lib.sizeofPtr() * i)));
	        }
	        this.lib.recycleCallStack(stack);
	        return names;
	    }
	    /**
	     * Register function to be global function in tvm runtime.
	     * @param name The name of the function.
	     * @param f function to be registered.
	     * @param override Whether overwrite function in existing registry.
	     */
	    registerFunc(name, func, override = false) {
	        const packedFunc = this.toPackedFunc(func);
	        const ioverride = override ? 1 : 0;
	        const stack = this.lib.getOrAllocCallStack();
	        const nameOffset = stack.allocRawBytes(name.length + 1);
	        stack.storeRawBytes(nameOffset, support.StringToUint8Array(name));
	        stack.commitToWasmMemory();
	        this.lib.checkCall(this.lib.exports.TVMFuncRegisterGlobal(stack.ptrFromOffset(nameOffset), packedFunc._tvmPackedCell.handle, ioverride));
	    }
	    /**
	     * Get global PackedFunc from the runtime.
	     * @param name The name of the function.
	     * @returns The result function.
	     */
	    getGlobalFunc(name) {
	        const stack = this.lib.getOrAllocCallStack();
	        const nameOffset = stack.allocRawBytes(name.length + 1);
	        stack.storeRawBytes(nameOffset, support.StringToUint8Array(name));
	        const outOffset = stack.allocPtrArray(1);
	        const outPtr = stack.ptrFromOffset(outOffset);
	        stack.commitToWasmMemory(outOffset);
	        this.lib.checkCall(this.exports.TVMFuncGetGlobal(stack.ptrFromOffset(nameOffset), outPtr));
	        const handle = this.memory.loadPointer(outPtr);
	        this.lib.recycleCallStack(stack);
	        if (handle == 0) {
	            throw Error("Cannot find global function " + name);
	        }
	        const ret = this.makePackedFunc(handle);
	        return ret;
	    }
	    /**
	     * Check if func is PackedFunc.
	     *
	     * @param func The input.
	     * @returns The check result.
	     */
	    isPackedFunc(func) {
	        // eslint-disable-next-line no-prototype-builtins
	        return typeof func == "function" && func.hasOwnProperty("_tvmPackedCell");
	    }
	    /**
	     * Convert func to PackedFunc
	     *
	     * @param func Input function.
	     * @returns The converted function.
	     */
	    toPackedFunc(func) {
	        if (this.isPackedFunc(func))
	            return func;
	        return this.createPackedFuncFromCFunc(this.wrapJSFuncAsPackedCFunc(func));
	    }
	    /**
	     * Convert dtype to {@link DLDataType}
	     *
	     * @param dtype The input dtype string or DLDataType.
	     * @returns The converted result.
	     */
	    toDLDataType(dtype) {
	        if (dtype instanceof DLDataType)
	            return dtype;
	        if (typeof dtype == "string") {
	            let pattern = dtype;
	            let code, bits = 32, lanes = 1;
	            if (pattern.substring(0, 5) == "float") {
	                pattern = pattern.substring(5, pattern.length);
	                code = 2 /* Float */;
	            }
	            else if (pattern.substring(0, 3) == "int") {
	                pattern = pattern.substring(3, pattern.length);
	                code = 0 /* Int */;
	            }
	            else if (pattern.substring(0, 4) == "uint") {
	                pattern = pattern.substring(4, pattern.length);
	                code = 1 /* UInt */;
	            }
	            else if (pattern.substring(0, 6) == "handle") {
	                pattern = pattern.substring(5, pattern.length);
	                code = 3 /* TVMOpaqueHandle */;
	                bits = 64;
	            }
	            else {
	                throw new Error("Unknown dtype " + dtype);
	            }
	            const arr = pattern.split("x");
	            if (arr.length >= 1) {
	                const parsed = parseInt(arr[0]);
	                if (parsed + "" == arr[0]) {
	                    bits = parsed;
	                }
	            }
	            if (arr.length >= 2) {
	                lanes = parseInt(arr[1]);
	            }
	            return new DLDataType(code, bits, lanes);
	        }
	        else {
	            throw new Error("Unknown dtype " + dtype);
	        }
	    }
	    /**
	     * Create a new {@link Scalar} that can be passed to a PackedFunc.
	     * @param value The number value.
	     * @param dtype The dtype string.
	     * @returns The created scalar.
	     */
	    scalar(value, dtype) {
	        return new Scalar(value, dtype);
	    }
	    /**
	     * Create a new {@link DLContext}
	     * @param deviceType The device type.
	     * @param deviceId The device index.
	     * @returns The created context.
	     */
	    context(deviceType, deviceId = 0) {
	        return new DLContext(deviceType, deviceId, this.lib);
	    }
	    /**
	     * Create a new cpu {@link DLContext}
	     * @param deviceId The device index.
	     */
	    cpu(deviceId = 0) {
	        return this.context("cpu", deviceId);
	    }
	    /**
	     * Create a new webgpu {@link DLContext}
	     * @param deviceId The device index.
	     */
	    webgpu(deviceId = 0) {
	        return this.context("webgpu", deviceId);
	    }
	    /**
	     * Create an empty {@link NDArray} with given shape and dtype.
	     *
	     * @param shape The shape of the array.
	     * @param dtype The data type of the array.
	     * @param ctx The context of the ndarray.
	     * @returns The created ndarray.
	     */
	    empty(shape, dtype = "float32", ctx = this.context("cpu", 0)) {
	        dtype = this.toDLDataType(dtype);
	        shape = typeof shape == "number" ? [shape] : shape;
	        const stack = this.lib.getOrAllocCallStack();
	        const shapeOffset = stack.allocRawBytes(shape.length * 8 /* I64 */);
	        for (let i = 0; i < shape.length; ++i) {
	            stack.storeI64(shapeOffset + i * 8 /* I64 */, shape[i]);
	        }
	        const outOffset = stack.allocPtrArray(1);
	        const outPtr = stack.ptrFromOffset(outOffset);
	        stack.commitToWasmMemory(outOffset);
	        this.lib.checkCall(this.exports.TVMArrayAlloc(stack.ptrFromOffset(shapeOffset), shape.length, dtype.code, dtype.bits, dtype.lanes, ctx.deviceType, ctx.deviceId, outPtr));
	        const ret = new NDArray(this.memory.loadPointer(outPtr), false, this.lib);
	        this.lib.recycleCallStack(stack);
	        return ret;
	    }
	    /**
	     * Create a new graph runtime.
	     *
	     * @param graphJson The graph runtime json file.
	     * @param lib The underlying library.
	     * @param ctx The execution context of the graph.
	     */
	    createGraphRuntime(graphJson, lib, ctx) {
	        const fcreate = this.getGlobalFunc("tvm.graph_runtime.create");
	        const module = fcreate(graphJson, lib, this.scalar(ctx.deviceType, "int32"), this.scalar(ctx.deviceId, "int32"));
	        return new GraphRuntime(module);
	    }
	    /**
	     * Register an asyncfunction to be global function in the server.
	     * @param name The name of the function.
	     * @param func function to be registered.
	     * @param override Whether overwrite function in existing registry.
	     *
	     * @note The async function will only be used for serving remote calls in the rpc.
	     */
	    registerAsyncServerFunc(name, func, override = false) {
	        const asyncVariant = (...args) => {
	            const fargs = args.slice(0, args.length - 1);
	            const callback = args[args.length - 1];
	            const promise = func(...fargs);
	            promise.then((rv) => {
	                callback(this.scalar(4 /* kReturn */, "int32"), rv);
	            });
	        };
	        this.registerFunc("__async." + name, asyncVariant, override);
	    }
	    /**
	     * Initialize webgpu in the runtime.
	     * @param device The given GPU device.
	     */
	    initWebGPU(device) {
	        const webGPUContext = new webgpu.WebGPUContext(this.memory, device);
	        this.registerFunc("wasm.WebGPUDeviceAPI", (name) => {
	            return webGPUContext.getDeviceAPI(name);
	        });
	        this.registerFunc("wasm.WebGPUCreateShader", (info, data) => {
	            return webGPUContext.createShader(info, data);
	        });
	        this.registerAsyncServerFunc("wasm.WebGPUWaitForTasks", () => __awaiter(this, void 0, void 0, function* () {
	            yield webGPUContext.sync();
	        }));
	        this.lib.webGPUContext = webGPUContext;
	    }
	    /** Register global packed functions needed by the backend to the env. */
	    registerEnvGlobalPackedFuncs() {
	        // Register the timer function to enable the time_evaluator.
	        const perf = compact.getPeformance();
	        // Helper function to time the finvoke
	        const timeExecution = (finvoke, ctx, nstep, repeat, minRepeatMs) => __awaiter(this, void 0, void 0, function* () {
	            finvoke(this.scalar(1, "int32"));
	            yield ctx.sync();
	            const result = [];
	            let setupNumber = nstep;
	            for (let i = 0; i < repeat; ++i) {
	                let durationMs = 0.0;
	                do {
	                    if (durationMs > 0.0) {
	                        setupNumber = Math.floor(Math.max(minRepeatMs / (durationMs / nstep) + 1, nstep * 1.618));
	                    }
	                    const tstart = perf.now();
	                    finvoke(this.scalar(setupNumber, "int32"));
	                    yield ctx.sync();
	                    const tend = perf.now();
	                    durationMs = tend - tstart;
	                } while (durationMs < minRepeatMs);
	                const speed = durationMs / setupNumber / 1000;
	                result.push(speed);
	            }
	            const ret = new Float64Array(result.length);
	            ret.set(result);
	            return new Uint8Array(ret.buffer);
	        });
	        const addOne = (x) => __awaiter(this, void 0, void 0, function* () {
	            yield new Promise(resolve => setTimeout(resolve, 100));
	            return x + 1;
	        });
	        this.registerAsyncServerFunc("wasm.TimeExecution", timeExecution);
	        this.registerAsyncServerFunc("testing.asyncAddOne", addOne);
	    }
	    createPackedFuncFromCFunc(func) {
	        let findex = this.env.packedCFuncTable.length;
	        if (this.env.packedCFuncTableFreeId.length != 0) {
	            findex = this.env.packedCFuncTableFreeId.pop();
	        }
	        else {
	            this.env.packedCFuncTable.push(undefined);
	        }
	        this.env.packedCFuncTable[findex] = func;
	        const stack = this.lib.getOrAllocCallStack();
	        const outOffset = stack.allocPtrArray(1);
	        const outPtr = stack.ptrFromOffset(outOffset);
	        this.lib.checkCall(this.exports
	            .TVMWasmFuncCreateFromCFunc(findex, outPtr));
	        const ret = this.makePackedFunc(this.memory.loadPointer(outPtr));
	        this.lib.recycleCallStack(stack);
	        return ret;
	    }
	    /**
	     * Set packed function arguments into the location indicated by argsValue and argsCode.
	     * Allocate new temporary space from the stack if necessary.
	     *
	     * @parma stack The call stack
	     * @param args  The input arguments.
	     * @param argsValue The offset of argsValue.
	     * @param argsCode The offset of argsCode.
	     */
	    setPackedArguments(stack, args, argsValue, argsCode) {
	        for (let i = 0; i < args.length; ++i) {
	            let val = args[i];
	            const tp = typeof val;
	            const valueOffset = argsValue + i * 8 /* TVMValue */;
	            const codeOffset = argsCode + i * 4 /* I32 */;
	            if (val instanceof NDArray) {
	                stack.storePtr(valueOffset, val.handle);
	                stack.storeI32(codeOffset, 13 /* TVMNDArrayHandle */);
	            }
	            else if (val instanceof Scalar) {
	                if (val.dtype.startsWith("int") || val.dtype.startsWith("uint")) {
	                    stack.storeI64(valueOffset, val.value);
	                    stack.storeI32(codeOffset, 0 /* Int */);
	                }
	                else if (val.dtype.startsWith("float")) {
	                    stack.storeF64(valueOffset, val.value);
	                    stack.storeI32(codeOffset, 2 /* Float */);
	                }
	                else {
	                    support.assert(val.dtype == "handle", "Expect handle");
	                    stack.storePtr(valueOffset, val.value);
	                    stack.storeI32(codeOffset, 3 /* TVMOpaqueHandle */);
	                }
	            }
	            else if (val instanceof DLContext) {
	                stack.storeI32(valueOffset, val.deviceType);
	                stack.storeI32(valueOffset + 4 /* I32 */, val.deviceType);
	                stack.storeI32(codeOffset, 6 /* TVMContext */);
	            }
	            else if (tp == "number") {
	                stack.storeF64(valueOffset, val);
	                stack.storeI32(codeOffset, 2 /* Float */);
	                // eslint-disable-next-line no-prototype-builtins
	            }
	            else if (tp == "function" && val.hasOwnProperty("_tvmPackedCell")) {
	                stack.storePtr(valueOffset, val._tvmPackedCell.handle);
	                stack.storeI32(codeOffset, 10 /* TVMPackedFuncHandle */);
	            }
	            else if (val === null || val == undefined) {
	                stack.storePtr(valueOffset, 0);
	                stack.storeI32(codeOffset, 4 /* Null */);
	            }
	            else if (tp == "string") {
	                stack.allocThenSetArgString(valueOffset, val);
	                stack.storeI32(codeOffset, 11 /* TVMStr */);
	            }
	            else if (val instanceof Uint8Array) {
	                stack.allocThenSetArgBytes(valueOffset, val);
	                stack.storeI32(codeOffset, 12 /* TVMBytes */);
	            }
	            else if (val instanceof Function) {
	                val = this.toPackedFunc(val);
	                stack.tempArgs.push(val);
	                stack.storePtr(valueOffset, val._tvmPackedCell.handle);
	                stack.storeI32(codeOffset, 10 /* TVMPackedFuncHandle */);
	            }
	            else if (val instanceof Module) {
	                stack.storePtr(valueOffset, val.handle);
	                stack.storeI32(codeOffset, 9 /* TVMModuleHandle */);
	            }
	            else {
	                throw new Error("Unsupported argument type " + tp);
	            }
	        }
	    }
	    wrapJSFuncAsPackedCFunc(func) {
	        const lib = this.lib;
	        return (argValues, argCodes, nargs, ret, 
	        // eslint-disable-next-line @typescript-eslint/no-unused-vars
	        _handle) => {
	            const jsArgs = [];
	            for (let i = 0; i < nargs; ++i) {
	                const valuePtr = argValues + i * 8 /* TVMValue */;
	                const codePtr = argCodes + i * 4 /* I32 */;
	                let tcode = lib.memory.loadI32(codePtr);
	                if (tcode == 8 /* TVMObjectHandle */ ||
	                    tcode == 14 /* TVMObjectRValueRefArg */ ||
	                    tcode == 10 /* TVMPackedFuncHandle */ ||
	                    tcode == 9 /* TVMModuleHandle */) {
	                    lib.checkCall(lib.exports.TVMCbArgToReturn(valuePtr, codePtr));
	                }
	                tcode = lib.memory.loadI32(codePtr);
	                jsArgs.push(this.retValueToJS(valuePtr, tcode, true));
	            }
	            const rv = func(...jsArgs);
	            if (rv !== undefined && rv !== null) {
	                const stack = lib.getOrAllocCallStack();
	                const valueOffset = stack.allocRawBytes(8 /* TVMValue */);
	                const codeOffset = stack.allocRawBytes(4 /* I32 */);
	                this.setPackedArguments(stack, [rv], valueOffset, codeOffset);
	                const valuePtr = stack.ptrFromOffset(valueOffset);
	                const codePtr = stack.ptrFromOffset(codeOffset);
	                stack.commitToWasmMemory();
	                lib.checkCall(lib.exports.TVMCFuncSetReturn(ret, valuePtr, codePtr, 1));
	                lib.recycleCallStack(stack);
	            }
	            return 0;
	        };
	    }
	    makePackedFunc(handle) {
	        const cell = new PackedFuncCell(handle, this.lib);
	        const packedFunc = (...args) => {
	            const stack = this.lib.getOrAllocCallStack();
	            const valueOffset = stack.allocRawBytes(8 /* TVMValue */ * args.length);
	            const tcodeOffset = stack.allocRawBytes(4 /* I32 */ * args.length);
	            this.setPackedArguments(stack, args, valueOffset, tcodeOffset);
	            const rvalueOffset = stack.allocRawBytes(8 /* TVMValue */);
	            const rcodeOffset = stack.allocRawBytes(4 /* I32 */);
	            const rvaluePtr = stack.ptrFromOffset(rvalueOffset);
	            const rcodePtr = stack.ptrFromOffset(rcodeOffset);
	            // commit to wasm memory, till rvalueOffset (the return value don't need to be committed)
	            stack.commitToWasmMemory(rvalueOffset);
	            this.lib.checkCall(this.exports.TVMFuncCall(handle, stack.ptrFromOffset(valueOffset), stack.ptrFromOffset(tcodeOffset), args.length, rvaluePtr, rcodePtr));
	            const ret = this.retValueToJS(rvaluePtr, this.memory.loadI32(rcodePtr), false);
	            this.lib.recycleCallStack(stack);
	            return ret;
	        };
	        // Attach attributes to the function type.
	        // This is because javascript do not allow us to overload call.
	        const ret = packedFunc;
	        ret.dispose = () => {
	            cell.dispose();
	        };
	        ret._tvmPackedCell = cell;
	        return ret;
	    }
	    retValueToJS(rvaluePtr, tcode, callbackArg) {
	        switch (tcode) {
	            case 0 /* Int */:
	            case 1 /* UInt */:
	                return this.memory.loadI64(rvaluePtr);
	            case 2 /* Float */:
	                return this.memory.loadF64(rvaluePtr);
	            case 3 /* TVMOpaqueHandle */: {
	                return this.memory.loadPointer(rvaluePtr);
	            }
	            case 13 /* TVMNDArrayHandle */: {
	                return new NDArray(this.memory.loadPointer(rvaluePtr), false, this.lib);
	            }
	            case 7 /* TVMDLTensorHandle */: {
	                support.assert(callbackArg);
	                return new NDArray(this.memory.loadPointer(rvaluePtr), true, this.lib);
	            }
	            case 10 /* TVMPackedFuncHandle */: {
	                return this.makePackedFunc(this.memory.loadPointer(rvaluePtr));
	            }
	            case 9 /* TVMModuleHandle */: {
	                return new Module(this.memory.loadPointer(rvaluePtr), this.lib, (ptr) => {
	                    return this.makePackedFunc(ptr);
	                });
	            }
	            case 4 /* Null */: return undefined;
	            case 6 /* TVMContext */: {
	                const deviceType = this.memory.loadI32(rvaluePtr);
	                const deviceId = this.memory.loadI32(rvaluePtr + 4 /* I32 */);
	                return this.context(deviceType, deviceId);
	            }
	            case 11 /* TVMStr */: {
	                const ret = this.memory.loadCString(this.memory.loadPointer(rvaluePtr));
	                return ret;
	            }
	            case 12 /* TVMBytes */: {
	                return this.memory.loadTVMBytes(this.memory.loadPointer(rvaluePtr));
	            }
	            default:
	                throw new Error("Unsupported return type code=" + tcode);
	        }
	    }
	}
	exports.Instance = Instance;
	/**
	 * Asynchrously instantiate a new {@link Instance}.
	 *
	 * importObject can also be a {@link LibraryProvider} object,
	 * a WASI object, or an object containing wasmLibraryProvider field.
	 * We can take benefit of syslib implementations from the Emscripten
	 * by passing its generated js Module as the imports.
	 *
	 * @param bufferSource The source to be compiled.
	 * @param importObject The import objects.
	 * @param logger The system logger.
	 */
	function instantiate(bufferSource, importObject = {}, logger = console.log) {
	    const env = new environment.Environment(importObject, logger);
	    return WebAssembly.instantiate(bufferSource, env.imports).then((result) => {
	        return new Instance(result.module, {}, result.instance, env);
	    });
	}
	exports.instantiate = instantiate;

	});

	unwrapExports(runtime);
	var runtime_1 = runtime.Scalar;
	var runtime_2 = runtime.DLContext;
	var runtime_3 = runtime.DLDataType;
	var runtime_4 = runtime.NDArray;
	var runtime_5 = runtime.Module;
	var runtime_6 = runtime.Instance;
	var runtime_7 = runtime.instantiate;

	var rpc_server = createCommonjsModule(function (module, exports) {
	/*
	 * Licensed to the Apache Software Foundation (ASF) under one
	 * or more contributor license agreements.  See the NOTICE file
	 * distributed with this work for additional information
	 * regarding copyright ownership.  The ASF licenses this file
	 * to you under the Apache License, Version 2.0 (the
	 * "License"); you may not use this file except in compliance
	 * with the License.  You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing,
	 * software distributed under the License is distributed on an
	 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	 * KIND, either express or implied.  See the License for the
	 * specific language governing permissions and limitations
	 * under the License.
	 */
	var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	Object.defineProperty(exports, "__esModule", { value: true });




	var RPCServerState;
	(function (RPCServerState) {
	    RPCServerState[RPCServerState["InitHeader"] = 0] = "InitHeader";
	    RPCServerState[RPCServerState["InitHeaderKey"] = 1] = "InitHeaderKey";
	    RPCServerState[RPCServerState["InitServer"] = 2] = "InitServer";
	    RPCServerState[RPCServerState["WaitForCallback"] = 3] = "WaitForCallback";
	    RPCServerState[RPCServerState["ReceivePacketHeader"] = 4] = "ReceivePacketHeader";
	    RPCServerState[RPCServerState["ReceivePacketBody"] = 5] = "ReceivePacketBody";
	})(RPCServerState || (RPCServerState = {}));
	/** RPC magic header */
	const RPC_MAGIC = 0xff271;
	/**
	 * An utility class to read from binary bytes.
	 */
	class ByteStreamReader {
	    constructor(bytes) {
	        this.offset = 0;
	        this.bytes = bytes;
	    }
	    readU32() {
	        const i = this.offset;
	        const b = this.bytes;
	        const val = b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24);
	        this.offset += 4;
	        return val;
	    }
	    readU64() {
	        const val = this.readU32();
	        this.offset += 4;
	        return val;
	    }
	    readByteArray() {
	        const len = this.readU64();
	        support.assert(this.offset + len <= this.bytes.byteLength);
	        const ret = new Uint8Array(len);
	        ret.set(this.bytes.slice(this.offset, this.offset + len));
	        this.offset += len;
	        return ret;
	    }
	}
	/**
	 * A websocket based RPC
	 */
	class RPCServer {
	    constructor(url, key, getImports, logger = console.log) {
	        this.state = RPCServerState.InitHeader;
	        this.pendingSend = Promise.resolve();
	        this.inst = undefined;
	        this.currPacketLength = 0;
	        this.remoteKeyLength = 0;
	        this.pendingBytes = 0;
	        this.buffredBytes = 0;
	        this.messageQueue = [];
	        this.url = url;
	        this.key = key;
	        this.name = "WebSocketRPCServer[" + this.key + "]: ";
	        this.getImports = getImports;
	        this.logger = logger;
	        this.checkLittleEndian();
	        this.socket = compact.createWebSocket(url);
	        this.socket.binaryType = "arraybuffer";
	        this.socket.addEventListener("open", (event) => {
	            return this.onOpen(event);
	        });
	        this.socket.addEventListener("message", (event) => {
	            return this.onMessage(event);
	        });
	        this.socket.addEventListener("close", (event) => {
	            return this.onClose(event);
	        });
	    }
	    // eslint-disable-next-line @typescript-eslint/no-unused-vars
	    onClose(_event) {
	        if (this.inst !== undefined) {
	            this.inst.dispose();
	        }
	        if (this.state == RPCServerState.ReceivePacketHeader) {
	            this.log("Closing the server in clean state");
	            this.log("Automatic reconnecting..");
	            new RPCServer(this.url, this.key, this.getImports, this.logger);
	        }
	        else {
	            this.log("Closing the server, final state=" + this.state);
	        }
	    }
	    // eslint-disable-next-line @typescript-eslint/no-unused-vars
	    onOpen(_event) {
	        // Send the headers
	        let bkey = support.StringToUint8Array("server:" + this.key);
	        bkey = bkey.slice(0, bkey.length - 1);
	        const intbuf = new Int32Array(1);
	        intbuf[0] = RPC_MAGIC;
	        this.socket.send(intbuf);
	        intbuf[0] = bkey.length;
	        this.socket.send(intbuf);
	        this.socket.send(bkey);
	        this.log("connected...");
	        // request bytes: magic + keylen
	        this.requestBytes(4 /* I32 */ + 4 /* I32 */);
	        this.state = RPCServerState.InitHeader;
	    }
	    /** Handler for raw message. */
	    onMessage(event) {
	        const buffer = event.data;
	        this.buffredBytes += buffer.byteLength;
	        this.messageQueue.push(new Uint8Array(buffer));
	        this.processEvents();
	    }
	    /** Process ready events. */
	    processEvents() {
	        while (this.buffredBytes >= this.pendingBytes && this.pendingBytes != 0) {
	            this.onDataReady();
	        }
	    }
	    /** State machine to handle each request */
	    onDataReady() {
	        switch (this.state) {
	            case RPCServerState.InitHeader: {
	                this.handleInitHeader();
	                break;
	            }
	            case RPCServerState.InitHeaderKey: {
	                this.handleInitHeaderKey();
	                break;
	            }
	            case RPCServerState.ReceivePacketHeader: {
	                this.currPacketHeader = this.readFromBuffer(8 /* I64 */);
	                const reader = new ByteStreamReader(this.currPacketHeader);
	                this.currPacketLength = reader.readU64();
	                support.assert(this.pendingBytes == 0);
	                this.requestBytes(this.currPacketLength);
	                this.state = RPCServerState.ReceivePacketBody;
	                break;
	            }
	            case RPCServerState.ReceivePacketBody: {
	                const body = this.readFromBuffer(this.currPacketLength);
	                support.assert(this.pendingBytes == 0);
	                support.assert(this.currPacketHeader !== undefined);
	                this.onPacketReady(this.currPacketHeader, body);
	                break;
	            }
	            case RPCServerState.WaitForCallback: {
	                support.assert(this.pendingBytes == 0);
	                break;
	            }
	            default: {
	                throw new Error("Cannot handle state " + this.state);
	            }
	        }
	    }
	    onPacketReady(header, body) {
	        if (this.inst === undefined) {
	            // initialize server.
	            const reader = new ByteStreamReader(body);
	            // eslint-disable-next-line @typescript-eslint/no-unused-vars
	            const code = reader.readU32();
	            // eslint-disable-next-line @typescript-eslint/no-unused-vars
	            const ver = support.Uint8ArrayToString(reader.readByteArray());
	            const nargs = reader.readU32();
	            const tcodes = [];
	            const args = [];
	            for (let i = 0; i < nargs; ++i) {
	                tcodes.push(reader.readU32());
	            }
	            for (let i = 0; i < nargs; ++i) {
	                const tcode = tcodes[i];
	                if (tcode == 11 /* TVMStr */) {
	                    const str = support.Uint8ArrayToString(reader.readByteArray());
	                    args.push(str);
	                }
	                else if (tcode == 12 /* TVMBytes */) {
	                    args.push(reader.readByteArray());
	                }
	                else {
	                    throw new Error("cannot support type code " + tcode);
	                }
	            }
	            this.onInitServer(args, header, body);
	        }
	        else {
	            support.assert(this.serverRecvData !== undefined);
	            this.serverRecvData(header, body);
	            this.requestBytes(8 /* I64 */);
	            this.state = RPCServerState.ReceivePacketHeader;
	        }
	    }
	    /** Event handler during server initialization. */
	    onInitServer(args, header, body) {
	        // start the server
	        support.assert(args[0] == "rpc.WasmSession");
	        support.assert(this.pendingBytes == 0);
	        const asyncInitServer = () => __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            support.assert(args[1] instanceof Uint8Array);
	            const inst = yield runtime.instantiate(args[1].buffer, this.getImports(), this.logger);
	            try {
	                const gpuDevice = yield webgpu.detectGPUDevice();
	                if (gpuDevice !== undefined) {
	                    const label = ((_a = gpuDevice.label) === null || _a === void 0 ? void 0 : _a.toString()) || "WebGPU";
	                    this.log("Initialize GPU device: " + label);
	                    inst.initWebGPU(gpuDevice);
	                }
	            }
	            catch (err) {
	                this.log("Cannnot initialize WebGPU, " + err.toString());
	            }
	            this.inst = inst;
	            const fcreate = this.inst.getGlobalFunc("rpc.CreateEventDrivenServer");
	            const messageHandler = fcreate((cbytes) => {
	                support.assert(this.inst !== undefined);
	                if (this.socket.readyState == 1) {
	                    // WebSocket will automatically close the socket
	                    // if we burst send data that exceeds its internal buffer
	                    // wait a bit before we send next one.
	                    const sendDataWithCongestionControl = () => __awaiter(this, void 0, void 0, function* () {
	                        const packetSize = 4 << 10;
	                        const maxBufferAmount = 4 * packetSize;
	                        const waitTimeMs = 20;
	                        for (let offset = 0; offset < cbytes.length; offset += packetSize) {
	                            const end = Math.min(offset + packetSize, cbytes.length);
	                            while (this.socket.bufferedAmount >= maxBufferAmount) {
	                                yield new Promise((r) => setTimeout(r, waitTimeMs));
	                            }
	                            this.socket.send(cbytes.slice(offset, end));
	                        }
	                    });
	                    // Chain up the pending send so that the async send is always in-order.
	                    this.pendingSend = this.pendingSend.then(sendDataWithCongestionControl);
	                    // Directly return since the data are "sent" from the caller's pov.
	                    return this.inst.scalar(cbytes.length, "int32");
	                }
	                else {
	                    return this.inst.scalar(0, "int32");
	                }
	            }, this.name, this.key);
	            fcreate.dispose();
	            const writeFlag = this.inst.scalar(3, "int32");
	            this.serverRecvData = (header, body) => {
	                if (messageHandler(header, writeFlag) == 0) {
	                    this.socket.close();
	                }
	                if (messageHandler(body, writeFlag) == 0) {
	                    this.socket.close();
	                }
	            };
	            // Forward the same init sequence to the wasm RPC.
	            // The RPC will look for "rpc.wasmSession"
	            // and we will redirect it to the correct local session.
	            // register the callback to redirect the session to local.
	            const flocal = this.inst.getGlobalFunc("wasm.LocalSession");
	            const localSession = flocal();
	            flocal.dispose();
	            support.assert(localSession instanceof runtime.Module);
	            // eslint-disable-next-line @typescript-eslint/no-unused-vars
	            this.inst.registerFunc("rpc.WasmSession", 
	            // eslint-disable-next-line @typescript-eslint/no-unused-vars
	            (_args) => {
	                return localSession;
	            });
	            messageHandler(header, writeFlag);
	            messageHandler(body, writeFlag);
	            localSession.dispose();
	            this.log("Finish initializing the Wasm Server..");
	            this.requestBytes(8 /* I64 */);
	            this.state = RPCServerState.ReceivePacketHeader;
	            // call process events in case there are bufferred data.
	            this.processEvents();
	        });
	        this.state = RPCServerState.WaitForCallback;
	        asyncInitServer();
	    }
	    log(msg) {
	        this.logger(this.name + msg);
	    }
	    handleInitHeader() {
	        const reader = new ByteStreamReader(this.readFromBuffer(4 /* I32 */ * 2));
	        const magic = reader.readU32();
	        if (magic == RPC_MAGIC + 1) {
	            throw new Error("key: " + this.key + " has already been used in proxy");
	        }
	        else if (magic == RPC_MAGIC + 2) {
	            throw new Error("RPCProxy do not have matching client key " + this.key);
	        }
	        support.assert(magic == RPC_MAGIC, this.url + " is not an RPC Proxy");
	        this.remoteKeyLength = reader.readU32();
	        support.assert(this.pendingBytes == 0);
	        this.requestBytes(this.remoteKeyLength);
	        this.state = RPCServerState.InitHeaderKey;
	    }
	    handleInitHeaderKey() {
	        // eslint-disable-next-line @typescript-eslint/no-unused-vars
	        const remoteKey = support.Uint8ArrayToString(this.readFromBuffer(this.remoteKeyLength));
	        support.assert(this.pendingBytes == 0);
	        this.requestBytes(8 /* I64 */);
	        this.state = RPCServerState.ReceivePacketHeader;
	    }
	    checkLittleEndian() {
	        const a = new ArrayBuffer(4);
	        const b = new Uint8Array(a);
	        const c = new Uint32Array(a);
	        b[0] = 0x11;
	        b[1] = 0x22;
	        b[2] = 0x33;
	        b[3] = 0x44;
	        support.assert(c[0] === 0x44332211, "RPCServer little endian to work");
	    }
	    requestBytes(nbytes) {
	        this.pendingBytes += nbytes;
	    }
	    readFromBuffer(nbytes) {
	        const ret = new Uint8Array(nbytes);
	        let ptr = 0;
	        while (ptr < nbytes) {
	            support.assert(this.messageQueue.length != 0);
	            const nleft = nbytes - ptr;
	            if (this.messageQueue[0].byteLength <= nleft) {
	                const buffer = this.messageQueue.shift();
	                ret.set(buffer, ptr);
	                ptr += buffer.byteLength;
	            }
	            else {
	                const buffer = this.messageQueue[0];
	                ret.set(buffer.slice(0, nleft), ptr);
	                this.messageQueue[0] = buffer.slice(nleft, buffer.byteLength);
	                ptr += nleft;
	            }
	        }
	        this.buffredBytes -= nbytes;
	        this.pendingBytes -= nbytes;
	        return ret;
	    }
	}
	exports.RPCServer = RPCServer;

	});

	unwrapExports(rpc_server);
	var rpc_server_1 = rpc_server.RPCServer;

	var dist = createCommonjsModule(function (module, exports) {
	/*
	 * Licensed to the Apache Software Foundation (ASF) under one
	 * or more contributor license agreements.  See the NOTICE file
	 * distributed with this work for additional information
	 * regarding copyright ownership.  The ASF licenses this file
	 * to you under the Apache License, Version 2.0 (the
	 * "License"); you may not use this file except in compliance
	 * with the License.  You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing,
	 * software distributed under the License is distributed on an
	 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	 * KIND, either express or implied.  See the License for the
	 * specific language governing permissions and limitations
	 * under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	exports.Scalar = runtime.Scalar;
	exports.DLContext = runtime.DLContext;
	exports.DLDataType = runtime.DLDataType;
	exports.Module = runtime.Module;
	exports.NDArray = runtime.NDArray;
	exports.Instance = runtime.Instance;
	exports.instantiate = runtime.instantiate;

	exports.RPCServer = rpc_server.RPCServer;

	exports.wasmPath = support.wasmPath;

	exports.detectGPUDevice = webgpu.detectGPUDevice;
	var support_2 = support;
	exports.assert = support_2.assert;

	});

	var index = unwrapExports(dist);
	var dist_1 = dist.Scalar;
	var dist_2 = dist.DLContext;
	var dist_3 = dist.DLDataType;
	var dist_4 = dist.Module;
	var dist_5 = dist.NDArray;
	var dist_6 = dist.Instance;
	var dist_7 = dist.instantiate;
	var dist_8 = dist.RPCServer;
	var dist_9 = dist.wasmPath;
	var dist_10 = dist.detectGPUDevice;
	var dist_11 = dist.assert;

	exports.DLContext = dist_2;
	exports.DLDataType = dist_3;
	exports.Instance = dist_6;
	exports.Module = dist_4;
	exports.NDArray = dist_5;
	exports.RPCServer = dist_8;
	exports.Scalar = dist_1;
	exports.assert = dist_11;
	exports.default = index;
	exports.detectGPUDevice = dist_10;
	exports.instantiate = dist_7;
	exports.wasmPath = dist_9;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
