// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (/^\[\d+\ x\ (.*)\]/.test(type)) return true; // [15 x ?] blocks. Like structs
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = size;
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Types.types[field].alignSize;
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      alignSize = type.packed ? 1 : Math.min(alignSize, Runtime.QUANTUM_SIZE);
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func, sig) {
    //assert(sig); // TODO: support asm
    var table = FUNCTION_TABLE; // TODO: support asm
    var ret = table.length;
    table.push(func);
    table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE; // TODO: support asm
    table[index] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+3)>>2)<<2); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+3)>>2)<<2); if (STATICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 4))*(quantum ? quantum : 4); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? (((low)>>>(0))+(((high)>>>(0))*4294967296)) : (((low)>>>(0))+(((high)|(0))*4294967296))); return ret; },
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};
var ABORT = false;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/4294967296), 4294967295)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': (HEAPF64[(tempDoublePtr)>>3]=value,HEAP32[((ptr)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[(((ptr)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]); break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return (HEAP32[((tempDoublePtr)>>2)]=HEAP32[((ptr)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((ptr)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_NONE = 3; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    HEAPU8.set(new Uint8Array(slab), ret);
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STACK_ROOT, STACKTOP, STACK_MAX;
var STATICTOP;
function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
STACK_ROOT = STACKTOP = Runtime.alignMemory(1);
STACK_MAX = TOTAL_STACK; // we lose a little stack here, but TOTAL_STACK is nice and round so use that as the max
var tempDoublePtr = Runtime.alignMemory(allocate(12, 'i8', ALLOC_STACK), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
STATICTOP = STACK_MAX;
assert(STATICTOP < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var nullString = allocate(intArrayFromString('(null)'), 'i8', ALLOC_STACK);
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math.imul) Math.imul = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 6000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, TOTAL_STACK);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
assert(STATICTOP == STACK_MAX); assert(STACK_MAX == TOTAL_STACK);
STATICTOP += 22076;
assert(STATICTOP < TOTAL_MEMORY);
__ATINIT__ = __ATINIT__.concat([
]);
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
var __ZTISt9exception;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,188,79,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,200,79,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,1,0,0,250,2,0,0,120,4,0,0,16,0,0,0,190,6,0,0,196,0,0,0,234,2,0,0,184,8,0,0,80,8,0,0,94,6,0,0,192,8,0,0,166,1,0,0,154,3,0,0,130,1,0,0,212,4,0,0,140,4,0,0,2,4,0,0,238,2,0,0,232,6,0,0,70,1,0,0,140,6,0,0,186,0,0,0,152,3,0,0,180,6,0,0,114,6,0,0,36,0,0,0,44,1,0,0,240,6,0,0,246,4,0,0,90,8,0,0,138,3,0,0,72,0,0,0,234,3,0,0,134,2,0,0,254,2,0,0,68,6,0,0,26,4,0,0,48,7,0,0,28,5,0,0,238,0,0,0,240,7,0,0,52,5,0,0,206,6,0,0,162,6,0,0,86,5,0,0,88,2,0,0,12,0,0,0,0,5,0,0,160,0,0,0,252,1,0,0,116,6,0,0,214,6,0,0,74,7,0,0,206,4,0,0,168,0,0,0,84,1,0,0,104,4,0,0,226,1,0,0,146,1,0,0,202,3,0,0,120,0,0,0,236,0,0,0,50,3,0,0,92,3,0,0,32,7,0,0,74,2,0,0,126,1,0,0,56,1,0,0,148,4,0,0,26,2,0,0,126,0,0,0,20,7,0,0,170,7,0,0,42,2,0,0,198,2,0,0,252,3,0,0,62,4,0,0,194,4,0,0,130,4,0,0,214,0,0,0,128,4,0,0,40,4,0,0,44,2,0,0,138,7,0,0,44,0,0,0,220,1,0,0,132,3,0,0,80,2,0,0,172,3,0,0,236,6,0,0,200,3,0,0,224,2,0,0,126,7,0,0,24,4,0,0,114,5,0,0,34,8,0,0,240,8,0,0,26,8,0,0,68,7,0,0,42,8,0,0,242,2,0,0,206,2,0,0,36,1,0,0,88,6,0,0,94,0,0,0,76,8,0,0,124,0,0,0,32,6,0,0,154,4,0,0,228,2,0,0,26,0,0,0,178,0,0,0,16,8,0,0,36,4,0,0,130,5,0,0,200,5,0,0,162,5,0,0,170,0,0,0,94,5,0,0,254,1,0,0,234,6,0,0,220,6,0,0,204,2,0,0,230,6,0,0,230,5,0,0,188,3,0,0,250,7,0,0,188,7,0,0,178,5,0,0,42,7,0,0,78,4,0,0,92,6,0,0,152,0,0,0,108,2,0,0,190,4,0,0,118,4,0,0,162,8,0,0,18,6,0,0,122,0,0,0,44,6,0,0,96,2,0,0,204,8,0,0,106,0,0,0,158,6,0,0,116,2,0,0,180,0,0,0,118,3,0,0,202,2,0,0,174,0,0,0,240,5,0,0,2,1,0,0,172,7,0,0,182,1,0,0,128,0,0,0,38,4,0,0,74,6,0,0,222,0,0,0,60,1,0,0,176,3,0,0,84,5,0,0,180,8,0,0,222,7,0,0,208,0,0,0,42,1,0,0,196,3,0,0,158,3,0,0,136,1,0,0,30,6,0,0,130,0,0,0,176,6,0,0,214,4,0,0,176,4,0,0,76,1,0,0,82,7,0,0,142,0,0,0,22,0,0,0,106,3,0,0,62,5,0,0,204,1,0,0,2,8,0,0,44,3,0,0,226,6,0,0,200,1,0,0,54,0,0,0,234,8,0,0,202,7,0,0,32,0,0,0,34,1,0,0,52,0,0,0,198,3,0,0,38,1,0,0,248,4,0,0,24,7,0,0,70,5,0,0,142,5,0,0,206,5,0,0,110,2,0,0,188,4,0,0,174,5,0,0,122,5,0,0,36,6,0,0,42,5,0,0,8,3,0,0,148,0,0,0,116,5,0,0,100,6,0,0,170,8,0,0,6,6,0,0,16,4,0,0,116,4,0,0,216,7,0,0,16,7,0,0,150,0,0,0,80,5,0,0,238,1,0,0,248,5,0,0,114,1,0,0,30,3,0,0,10,4,0,0,220,2,0,0,8,0,0,0,96,5,0,0,252,7,0,0,154,7,0,0,208,2,0,0,222,3,0,0,220,7,0,0,62,6,0,0,194,6,0,0,156,1,0,0,138,0,0,0,102,1,0,0,200,0,0,0,4,7,0,0,142,1,0,0,158,2,0,0,164,3,0,0,248,7,0,0,118,7,0,0,158,8,0,0,132,5,0,0,100,5,0,0,144,2,0,0,124,4,0,0,194,1,0,0,122,8,0,0,214,5,0,0,124,1,0,0,186,7,0,0,164,1,0,0,86,7,0,0,110,3,0,0,18,8,0,0,140,3,0,0,130,2,0,0,28,2,0,0,118,1,0,0,138,4,0,0,156,8,0,0,48,6,0,0,80,6,0,0,164,2,0,0,48,3,0,0,52,4,0,0,52,7,0,0,172,5,0,0,188,1,0,0,86,0,0,0,222,2,0,0,68,8,0,0,168,6,0,0,70,7,0,0,122,6,0,0,208,1,0,0,242,1,0,0,228,8,0,0,76,2,0,0,24,3,0,0,146,8,0,0,184,4,0,0,140,5,0,0,58,1,0,0,138,8,0,0,2,7,0,0,108,7,0,0,128,2,0,0,106,8,0,0,28,1,0,0,46,0,0,0,220,0,0,0,118,2,0,0,102,2,0,0,244,4,0,0,122,2,0,0,70,3,0,0,170,3,0,0,222,5,0,0,234,0,0,0,108,0,0,0,62,2,0,0,78,0,0,0,82,0,0,0,50,5,0,0,150,5,0,0,200,8,0,0,112,3,0,0,206,0,0,0,12,1,0,0,168,1,0,0,38,6,0,0,114,0,0,0,186,2,0,0,42,0,0,0,158,1,0,0,228,4,0,0,36,7,0,0,204,4,0,0,100,1,0,0,92,4,0,0,232,7,0,0,136,4,0,0,166,6,0,0,138,5,0,0,160,1,0,0,120,5,0,0,150,6,0,0,154,6,0,0,16,5,0,0,32,2,0,0,66,5,0,0,196,2,0,0,70,0,0,0,136,5,0,0,108,4,0,0,246,2,0,0,10,8,0,0,34,5,0,0,8,2,0,0,18,0,0,0,42,4,0,0,180,5,0,0,242,3,0,0,212,8,0,0,68,5,0,0,164,0,0,0,228,7,0,0,88,4,0,0,178,1,0,0,34,4,0,0,10,7,0,0,40,0,0,0,110,5,0,0,170,5,0,0,224,6,0,0,84,6,0,0,132,2,0,0,104,5,0,0,74,3,0,0,54,2,0,0,42,6,0,0,216,1,0,0,254,7,0,0,210,3,0,0,110,6,0,0,170,1,0,0,184,2,0,0,142,3,0,0,0,7,0,0,100,4,0,0,144,7,0,0,144,3,0,0,30,4,0,0,12,6,0,0,118,6,0,0,28,6,0,0,244,6,0,0,144,0,0,0,112,4,0,0,238,3,0,0,150,8,0,0,12,7,0,0,204,6,0,0,194,2,0,0,182,6,0,0,46,3,0,0,240,4,0,0,104,8,0,0,76,3,0,0,96,4,0,0,60,0,0,0,152,2,0,0,218,5,0,0,108,8,0,0,22,2,0,0,164,6,0,0,136,6,0,0,172,2,0,0,132,1,0,0,126,6,0,0,166,2,0,0,196,5,0,0,22,3,0,0,104,2,0,0,244,2,0,0,46,1,0,0,254,3,0,0,122,7,0,0,166,0,0,0,62,7,0,0,154,2,0,0,114,4,0,0,232,1,0,0,210,2,0,0,146,3,0,0,14,0,0,0,236,5,0,0,58,6,0,0,188,2,0,0,246,0,0,0,194,3,0,0,84,3,0,0,178,4,0,0,180,7,0,0,178,7,0,0,10,1,0,0,4,4,0,0,40,7,0,0,4,3,0,0,20,2,0,0,152,5,0,0,156,3,0,0,76,6,0,0,174,1,0,0,104,3,0,0,146,2,0,0,208,7,0,0,24,1,0,0,148,3,0,0,100,0,0,0,48,8,0,0,206,8,0,0,68,0,0,0,170,4,0,0,18,4,0,0,36,5,0,0,248,6,0,0,70,4,0,0,62,1,0,0,120,2,0,0,218,4,0,0,226,3,0,0,254,5,0,0,122,3,0,0,196,4,0,0,182,5,0,0,140,1,0,0,12,5,0,0,86,2,0,0,82,1,0,0,220,4,0,0,14,2,0,0,138,1,0,0,58,2,0,0,238,4,0,0,214,3,0,0,78,5,0,0,188,5,0,0,230,2,0,0,246,1,0,0,154,8,0,0,144,8,0,0,56,7,0,0,58,4,0,0,50,8,0,0,216,0,0,0,228,0,0,0,212,1,0,0,192,4,0,0,52,8,0,0,244,1,0,0,114,7,0,0,214,7,0,0,106,2,0,0,72,8,0,0,50,2,0,0,236,2,0,0,14,8,0,0,70,8,0,0,26,5,0,0,98,1,0,0,0,6,0,0,174,3,0,0,212,6,0,0,82,6,0,0,60,5,0,0,222,1,0,0,168,7,0,0,66,3,0,0,26,7,0,0,28,7,0,0,78,2,0,0,174,6,0,0,54,7,0,0,42,3,0,0,74,8,0,0,108,1,0,0,246,5,0,0,194,7,0,0,64,6,0,0,50,4,0,0,90,7,0,0,8,6,0,0,48,0,0,0,76,7,0,0,216,2,0,0,102,4,0,0,192,7,0,0,30,1,0,0,56,4,0,0,156,6,0,0,118,0,0,0,210,1,0,0,26,1,0,0,22,8,0,0,72,5,0,0,8,7,0,0,108,6,0,0,232,2,0,0,216,3,0,0,84,2,0,0,162,4,0,0,202,6,0,0,96,8,0,0,244,7,0,0,244,0,0,0,60,8,0,0,38,2,0,0,6,2,0,0,88,7,0,0,40,3,0,0,190,7,0,0,86,6,0,0,130,3,0,0,38,7,0,0,162,2,0,0,74,1,0,0,186,6,0,0,120,1,0,0,54,1,0,0,88,3,0,0,210,0,0,0,88,5,0,0,6,3,0,0,176,0,0,0,138,2,0,0,46,4,0,0,106,5,0,0,34,0,0,0,10,6,0,0,196,7,0,0,34,2,0,0,218,0,0,0,4,0,0,0,160,8,0,0,24,5,0,0,22,4,0,0,174,4,0,0,160,7,0,0,158,5,0,0,98,5,0,0,12,2,0,0,18,5,0,0,102,3,0,0,108,3,0,0,10,2,0,0,246,3,0,0,2,5,0,0,92,8,0,0,116,3,0,0,64,8,0,0,254,0,0,0,22,1,0,0,18,7,0,0,220,3,0,0,32,1,0,0,144,4,0,0,96,1,0,0,32,4,0,0,226,0,0,0,212,7,0,0,148,8,0,0,8,4,0,0,144,1,0,0,208,8,0,0,126,5,0,0,148,7,0,0,242,0,0,0,54,6,0,0,182,4,0,0,120,3,0,0,66,1,0,0,130,8,0,0,20,4,0,0,120,8,0,0,230,8,0,0,104,7,0,0,134,0,0,0,68,3,0,0,198,5,0,0,128,3,0,0,92,5,0,0,212,3,0,0,160,6,0,0,112,7,0,0,38,0,0,0,24,8,0,0,146,7,0,0,74,0,0,0,40,5,0,0,56,2,0,0,132,0,0,0,202,5,0,0,62,0,0,0,190,2,0,0,146,4,0,0,28,4,0,0,6,1,0,0,126,8,0,0,16,1,0,0,72,6,0,0,82,3,0,0,20,3,0,0,222,8,0,0,208,3,0,0,32,8,0,0,30,8,0,0,50,1,0,0,182,8,0,0,114,2,0,0,206,7,0,0,52,6,0,0,90,2,0,0,184,3,0,0,20,0,0,0,10,3,0,0,234,7,0,0,224,1,0,0,176,8,0,0,150,7,0,0,210,8,0,0,176,5,0,0,46,8,0,0,198,7,0,0,202,4,0,0,46,7,0,0,210,5,0,0,88,1,0,0,34,3,0,0,228,1,0,0,46,2,0,0,26,3,0,0,172,0,0,0,234,1,0,0,94,4,0,0,94,7,0,0,208,5,0,0,98,4,0,0,230,0,0,0,150,1,0,0,246,7,0,0,196,8,0,0,74,4,0,0,84,0,0,0,30,2,0,0,144,5,0,0,64,4,0,0,124,5,0,0,166,5,0,0,202,1,0,0,168,3,0,0,20,1,0,0,244,5,0,0,202,8,0,0,140,0,0,0,56,5,0,0,60,4,0,0,198,4,0,0,244,3,0,0,212,5,0,0,8,1,0,0,142,7,0,0,110,7,0,0,214,2,0,0,92,7,0,0,224,8,0,0,102,0,0,0,16,6,0,0,56,8,0,0,76,5,0,0,198,1,0,0,196,1,0,0,36,2,0,0,108,5,0,0,158,7,0,0,172,1,0,0,162,7,0,0,0,8,0,0,236,3,0,0,46,5,0,0,184,5,0,0,248,2,0,0,48,1,0,0,112,1,0,0,184,0,0,0,182,0,0,0,224,5,0,0,172,4,0,0,154,5,0,0,38,3,0,0,72,4,0,0,58,0,0,0,216,4,0,0,46,6,0,0,178,3,0,0,62,3,0,0,24,0,0,0,138,6,0,0,48,4,0,0,226,7,0,0,72,2,0,0,86,4,0,0,192,2,0,0,60,3,0,0,198,6,0,0,16,2,0,0,156,4,0,0,170,2,0,0,92,1,0,0,0,4,0,0,112,0,0,0,34,6,0,0,126,4,0,0,136,7,0,0,14,5,0,0,186,3,0,0,134,6,0,0,186,5,0,0,190,8,0,0,166,7,0,0,128,5,0,0,100,7,0,0,14,7,0,0,104,0,0,0,154,0,0,0,132,7,0,0,118,8,0,0,94,1,0,0,224,0,0,0,182,2,0,0,228,3,0,0,96,0,0,0,116,0,0,0,60,2,0,0,158,4,0,0,18,2,0,0,82,4,0,0,142,8,0,0,112,6,0,0,10,0,0,0,222,4,0,0,100,2,0,0,54,3,0,0,44,5,0,0,128,7,0,0,8,8,0,0,230,1,0,0,4,8,0,0,228,6,0,0,136,8,0,0,44,8,0,0,68,2,0,0,44,7,0,0,14,1,0,0,72,1,0,0,142,6,0,0,190,3,0,0,166,4,0,0,90,4,0,0,232,4,0,0,218,2,0,0,252,4,0,0,82,5,0,0,16,3,0,0,40,1,0,0,162,0,0,0,126,2,0,0,26,6,0,0,132,4,0,0,152,4,0,0,50,0,0,0,100,8,0,0,38,8,0,0,122,1,0,0,56,6,0,0,66,0,0,0,172,8,0,0,124,3,0,0,66,7,0,0,178,2,0,0,64,2,0,0,250,0,0,0,22,5,0,0,48,5,0,0,134,4,0,0,18,1,0,0,64,5,0,0,160,5,0,0,58,5,0,0,242,5,0,0,254,4,0,0,178,8,0,0,192,6,0,0,240,2,0,0,180,3,0,0,8,5,0,0,234,5,0,0,112,8,0,0,204,5,0,0,224,3,0,0,112,5,0,0,208,6,0,0,226,4,0,0,230,4,0,0,194,8,0,0,192,5,0,0,248,1,0,0,68,1,0,0,136,3,0,0,4,1,0,0,0,1,0,0,104,6,0,0,238,8,0,0,88,8,0,0,80,7,0,0,220,8,0,0,216,5,0,0,198,0,0,0,210,4,0,0,190,1,0,0,120,7,0,0,98,3,0,0,78,6,0,0,252,5,0,0,236,7,0,0,114,3,0,0,214,8,0,0,78,8,0,0,66,6,0,0,216,6,0,0,70,6,0,0,102,5,0,0,162,3,0,0,146,5,0,0,32,5,0,0,190,0,0,0,204,0,0,0,14,6,0,0,172,6,0,0,152,8,0,0,44,4,0,0,156,0,0,0,106,6,0,0,206,1,0,0,92,2,0,0,238,7,0,0,220,5,0,0,12,3,0,0,192,1,0,0,150,3,0,0,52,3,0,0,68,4,0,0,124,7,0,0,86,8,0,0,128,1,0,0,12,8,0,0,62,8,0,0,230,7,0,0,54,5,0,0,28,0,0,0,180,1,0,0,92,0,0,0,84,7,0,0,6,5,0,0,110,8,0,0,96,7,0,0,132,6,0,0,130,7,0,0,114,8,0,0,254,6,0,0,156,7,0,0,240,1,0,0,188,8,0,0,150,2,0,0,184,7,0,0,116,8,0,0,250,6,0,0,184,1,0,0,90,3,0,0,140,7,0,0,148,6,0,0,24,2,0,0,248,0,0,0,28,8,0,0,130,6,0,0,154,1,0,0,60,6,0,0,238,5,0,0,104,1,0,0,242,4,0,0,6,4,0,0,74,5,0,0,118,5,0,0,178,6,0,0,80,1,0,0,18,3,0,0,4,2,0,0,188,6,0,0,60,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,73,80,0,204,74,80,0,0,0,0,0,0,0,0,0,109,95,102,105,120,116,117,114,101,67,111,117,110,116,32,62,32,48,0,0,32,32,106,100,46,109,97,120,77,111,116,111,114,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,101,110,97,98,108,101,76,105,109,105,116,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,100,46,106,111,105,110,116,50,32,61,32,106,111,105,110,116,115,91,37,100,93,59,10,0,0,32,32,106,100,46,109,97,120,70,111,114,99,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,98,50,86,101,99,50,32,103,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,109,97,115,107,66,105,116,115,32,61,32,117,105,110,116,49,54,40,37,100,41,59,10,0,0,0,48,32,60,61,32,105,66,32,38,38,32,105,66,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,102,105,120,116,117,114,101,45,62,109,95,98,111,100,121,32,61,61,32,116,104,105,115,0,32,32,106,100,46,109,111,116,111,114,83,112,101,101,100,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,103,114,111,117,110,100,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,106,100,46,106,111,105,110,116,49,32,61,32,106,111,105,110,116,115,91,37,100,93,59,10,0,0,118,101,114,116,101,120,67,111,117,110,116,32,60,61,32,56,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,99,97,116,101,103,111,114,121,66,105,116,115,32,61,32,117,105,110,116,49,54,40,37,100,41,59,10,0,0,0,105,65,32,33,61,32,40,45,49,41,0,0,109,95,119,111,114,108,100,45,62,73,115,76,111,99,107,101,100,40,41,32,61,61,32,102,97,108,115,101,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,66,111,100,121,46,99,112,112,0,0,32,32,106,100,46,101,110,97,98,108,101,77,111,116,111,114,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,100,46,103,114,111,117,110,100,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,46,99,112,112,0,0,97,108,112,104,97,48,32,60,32,49,46,48,102,0,0,0,32,32,32,32,102,100,46,105,115,83,101,110,115,111,114,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,99,104,105,108,100,50,32,33,61,32,40,45,49,41,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,108,105,110,101,97,114,68,97,109,112,105,110,103,41,32,38,38,32,98,100,45,62,108,105,110,101,97,114,68,97,109,112,105,110,103,32,62,61,32,48,46,48,102,0,0,0,99,111,117,110,116,32,62,61,32,51,0,0,32,32,106,100,46,108,111,99,97,108,65,120,105,115,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,32,32,106,100,46,114,101,102,101,114,101,110,99,101,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,109,97,120,76,101,110,103,116,104,32,61,32,37,46,49,53,108,101,102,59,10,0,0,77,111,117,115,101,32,106,111,105,110,116,32,100,117,109,112,105,110,103,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,46,10,0,0,32,32,106,100,46,108,101,110,103,116,104,32,61,32,37,46,49,53,108,101,102,59,10,0,99,104,105,108,100,49,32,33,61,32,40,45,49,41,0,0,116,121,112,101,65,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,32,124,124,32,116,121,112,101,66,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,0,0,32,32,32,32,102,100,46,100,101,110,115,105,116,121,32,61,32,37,46,49,53,108,101,102,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,105,115,116,97,110,99,101,46,99,112,112,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,46,99,112,112,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,117,108,97,114,68,97,109,112,105,110,103,41,32,38,38,32,98,100,45,62,97,110,103,117,108,97,114,68,97,109,112,105,110,103,32,62,61,32,48,46,48,102,0,112,32,61,61,32,101,110,116,114,121,45,62,100,97,116,97,0,0,0,0,97,114,101,97,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,0,99,104,105,108,100,73,110,100,101,120,32,60,32,109,95,99,111,117,110,116,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,48,32,60,32,99,111,117,110,116,32,38,38,32,99,111,117,110,116,32,60,32,51,0,0,100,32,43,32,104,32,42,32,107,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,112,99,45,62,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,83,104,97,112,101,115,47,98,50,80,111,108,121,103,111,110,83,104,97,112,101,46,99,112,112,0,0,109,95,110,111,100,101,115,91,112,114,111,120,121,73,100,93,46,73,115,76,101,97,102,40,41,0,0,0,115,116,97,99,107,67,111,117,110,116,32,60,32,115,116,97,99,107,83,105,122,101,0,0,32,32,32,32,102,100,46,114,101,115,116,105,116,117,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,99,97,99,104,101,45,62,99,111,117,110,116,32,60,61,32,51,0,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,117,108,97,114,86,101,108,111,99,105,116,121,41,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,62,32,48,0,0,0,0,98,108,111,99,107,67,111,117,110,116,32,42,32,98,108,111,99,107,83,105,122,101,32,60,61,32,98,50,95,99,104,117,110,107,83,105,122,101,0,0,109,95,118,101,114,116,101,120,67,111,117,110,116,32,62,61,32,51,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,109,95,99,111,117,110,116,32,45,32,49,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,100,97,109,112,105,110,103,82,97,116,105,111,41,32,38,38,32,100,101,102,45,62,100,97,109,112,105,110,103,82,97,116,105,111,32,62,61,32,48,46,48,102,0,0,0,32,32,98,50,71,101,97,114,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,97,46,120,32,62,61,32,48,46,48,102,32,38,38,32,97,46,121,32,62,61,32,48,46,48,102,0,0,48,32,60,61,32,116,121,112,101,65,32,38,38,32,116,121,112,101,66,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,83,104,97,112,101,115,47,98,50,67,104,97,105,110,83,104,97,112,101,46,99,112,112,0,0,0,0,98,45,62,73,115,65,99,116,105,118,101,40,41,32,61,61,32,116,114,117,101,0,0,0,32,32,98,50,87,104,101,101,108,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,32,32,32,32,102,100,46,102,114,105,99,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,98,50,87,101,108,100,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,109,95,99,111,117,110,116,0,0,0,32,32,98,50,82,111,112,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,108,101,41,0,0,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,60,32,98,50,95,109,97,120,83,116,97,99,107,69,110,116,114,105,101,115,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,46,99,112,112,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,98,50,95,98,108,111,99,107,83,105,122,101,115,0,48,46,48,102,32,60,61,32,108,111,119,101,114,32,38,38,32,108,111,119,101,114,32,60,61,32,105,110,112,117,116,46,109,97,120,70,114,97,99,116,105,111,110,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,80,117,108,108,101,121,74,111,105,110,116,46,99,112,112,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,84,105,109,101,79,102,73,109,112,97,99,116,46,99,112,112,0,99,111,117,110,116,32,62,61,32,50,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,32,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,32,106,100,59,10,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,46,99,112,112,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,102,114,101,113,117,101,110,99,121,72,122,41,32,38,38,32,100,101,102,45,62,102,114,101,113,117,101,110,99,121,72,122,32,62,61,32,48,46,48,102,0,47,47,32,68,117,109,112,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,102,111,114,32,116,104,105,115,32,106,111,105,110,116,32,116,121,112,101,46,10,0,0,98,50,73,115,86,97,108,105,100,40,114,97,116,105,111,41,0,0,0,0,32,32,32,32,98,111,100,105,101,115,91,37,100,93,45,62,67,114,101,97,116,101,70,105,120,116,117,114,101,40,38,102,100,41,59,10,0,0,0,0,32,32,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,77,111,117,115,101,74,111,105,110,116,46,99,112,112,0,112,111,105,110,116,67,111,117,110,116,32,61,61,32,49,32,124,124,32,112,111,105,110,116,67,111,117,110,116,32,61,61,32,50,0,0,115,95,105,110,105,116,105,97,108,105,122,101,100,32,61,61,32,116,114,117,101,0,0,0,32,32,32,32,102,100,46,115,104,97,112,101,32,61,32,38,115,104,97,112,101,59,10,0,109,95,106,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,0,0,48,32,60,32,109,95,110,111,100,101,67,111,117,110,116,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,74,111,105,110,116,46,99,112,112,0,0,32,32,32,32,98,50,70,105,120,116,117,114,101,68,101,102,32,102,100,59,10,0,0,0,10,0,0,0,32,32,125,10,0,0,0,0,110,111,100,101,45,62,73,115,76,101,97,102,40,41,32,61,61,32,102,97,108,115,101,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,71,101,97,114,74,111,105,110,116,46,99,112,112,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,78,101,120,116,86,101,114,116,101,120,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,32,32,123,10,0,0,0,0,109,95,110,111,100,101,67,111,117,110,116,32,43,32,102,114,101,101,67,111,117,110,116,32,61,61,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,105,115,116,97,110,99,101,46,104,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,80,114,101,118,86,101,114,116,101,120,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,46,99,112,112,0,0,71,101,116,72,101,105,103,104,116,40,41,32,61,61,32,67,111,109,112,117,116,101,72,101,105,103,104,116,40,41,0,0,48,32,60,61,32,102,114,101,101,73,110,100,101,120,32,38,38,32,102,114,101,101,73,110,100,101,120,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,0,109,95,98,111,100,121,67,111,117,110,116,32,60,32,109,95,98,111,100,121,67,97,112,97,99,105,116,121,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,110,101,120,116,86,101,114,116,101,120,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,98,111,100,105,101,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,66,111,100,121,40,38,98,100,41,59,10,0,0,0,32,32,98,50,68,105,115,116,97,110,99,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,98,100,45,62,108,105,110,101,97,114,86,101,108,111,99,105,116,121,46,73,115,86,97,108,105,100,40,41,0,0,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,61,61,32,48,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,109,95,99,111,110,116,97,99,116,67,111,117,110,116,32,60,32,109,95,99,111,110,116,97,99,116,67,97,112,97,99,105,116,121,0,0,32,32,32,32,115,104,97,112,101,46,109,95,112,114,101,118,86,101,114,116,101,120,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,98,100,46,103,114,97,118,105,116,121,83,99,97,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,97,97,98,98,46,117,112,112,101,114,66,111,117,110,100,32,61,61,32,110,111,100,101,45,62,97,97,98,98,46,117,112,112,101,114,66,111,117,110,100,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,109,95,106,111,105,110,116,67,111,117,110,116,32,60,32,109,95,106,111,105,110,116,67,97,112,97,99,105,116,121,0,0,32,32,32,32,115,104,97,112,101,46,67,114,101,97,116,101,67,104,97,105,110,40,118,115,44,32,37,100,41,59,10,0,32,32,98,100,46,97,99,116,105,118,101,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,48,32,60,32,115,105,122,101,0,0,0,0,97,97,98,98,46,108,111,119,101,114,66,111,117,110,100,32,61,61,32,110,111,100,101,45,62,97,97,98,98,46,108,111,119,101,114,66,111,117,110,100,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,101,100,103,101,46,76,101,110,103,116,104,83,113,117,97,114,101,100,40,41,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,32,42,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,73,115,108,97,110,100,46,104,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,32,32,32,32,98,50,67,104,97,105,110,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,0,0,32,32,98,100,46,98,117,108,108,101,116,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,110,111,100,101,45,62,104,101,105,103,104,116,32,61,61,32,104,101,105,103,104,116,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,77,97,116,104,46,104,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,32,32,32,32,115,104,97,112,101,46,83,101,116,40,118,115,44,32,37,100,41,59,10,0,32,32,98,100,46,102,105,120,101,100,82,111,116,97,116,105,111,110,32,61,32,98,111,111,108,40,37,100,41,59,10,0,109,95,110,111,100,101,115,91,99,104,105,108,100,50,93,46,112,97,114,101,110,116,32,61,61,32,105,110,100,101,120,0,32,32,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,100,101,102,45,62,114,97,116,105,111,32,33,61,32,48,46,48,102,0,0,32,32,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,109,97,120,70,111,114,99,101,41,32,38,38,32,100,101,102,45,62,109,97,120,70,111,114,99,101,32,62,61,32,48,46,48,102,0,0,0,100,101,102,45,62,98,111,100,121,65,32,33,61,32,100,101,102,45,62,98,111,100,121,66,0,0,0,0,32,32,32,32,118,115,91,37,100,93,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,98,100,46,97,119,97,107,101,32,61,32,98,111,111,108,40,37,100,41,59,10,0,109,95,116,121,112,101,66,32,61,61,32,101,95,114,101,118,111,108,117,116,101,74,111,105,110,116,32,124,124,32,109,95,116,121,112,101,66,32,61,61,32,101,95,112,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,46,99,112,112,0,0,0,0,109,95,110,111,100,101,115,91,99,104,105,108,100,49,93,46,112,97,114,101,110,116,32,61,61,32,105,110,100,101,120,0,98,50,73,115,86,97,108,105,100,40,116,111,114,113,117,101,41,32,38,38,32,116,111,114,113,117,101,32,62,61,32,48,46,48,102,0,109,95,102,105,120,116,117,114,101,66,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,112,111,108,121,103,111,110,0,109,95,102,105,120,116,117,114,101,66,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,105,114,99,108,101,0,0,109,97,110,105,102,111,108,100,45,62,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,0,0,48,32,60,61,32,116,121,112,101,50,32,38,38,32,116,121,112,101,50,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,32,32,32,32,98,50,86,101,99,50,32,118,115,91,37,100,93,59,10,0,32,32,98,100,46,97,108,108,111,119,83,108,101,101,112,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,48,32,60,61,32,99,104,105,108,100,50,32,38,38,32,99,104,105,108,100,50,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,100,46,97,110,103,117,108,97,114,68,97,109,112,105,110,103,32,61,32,37,46,49,53,108,101,102,59,10,0,109,95,98,111,100,121,67,111,117,110,116,32,62,32,48,0,116,111,105,73,110,100,101,120,66,32,60,32,109,95,98,111,100,121,67,111,117,110,116,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,111,110,116,97,99,116,46,99,112,112,0,0,48,32,60,61,32,110,111,100,101,73,100,32,38,38,32,110,111,100,101,73,100,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,32,32,32,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,48,32,60,61,32,112,114,111,120,121,73,100,32,38,38,32,112,114,111,120,121,73,100,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,48,32,60,61,32,99,104,105,108,100,49,32,38,38,32,99,104,105,108,100,49,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,100,46,108,105,110,101,97,114,68,97,109,112,105,110,103,32,61,32,37,46,49,53,108,101,102,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,114,46,76,101,110,103,116,104,83,113,117,97,114,101,100,40,41,32,62,32,48,46,48,102,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,86,101,114,116,101,120,51,32,61,32,98,111,111,108,40,37,100,41,59,10,0,110,111,100,101,45,62,104,101,105,103,104,116,32,61,61,32,48,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,67,111,108,108,105,100,101,80,111,108,121,103,111,110,46,99,112,112,0,0,0,32,32,98,100,46,97,110,103,117,108,97,114,86,101,108,111,99,105,116,121,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,121,110,97,109,105,99,84,114,101,101,46,104,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,86,101,114,116,101,120,48,32,61,32,98,111,111,108,40,37,100,41,59,10,0,99,104,105,108,100,50,32,61,61,32,40,45,49,41,0,0,32,32,98,100,46,108,105,110,101,97,114,86,101,108,111,99,105,116,121,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,98,111,100,105,101,115,32,61,32,78,85,76,76,59,10,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,51,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,32,32,98,100,46,97,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,98,100,45,62,112,111,115,105,116,105,111,110,46,73,115,86].concat([97,108,105,100,40,41,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,87,111,114,108,100,46,99,112,112,0,109,95,105,110,100,101,120,32,61,61,32,48,0,0,0,0,109,95,110,111,100,101,115,91,105,110,100,101,120,93,46,112,97,114,101,110,116,32,61,61,32,40,45,49,41,0,0,0,106,111,105,110,116,115,32,61,32,78,85,76,76,59,10,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,50,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,73,115,108,97,110,100,46,99,112,112,0,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,99,104,97,105,110,45,62,109,95,99,111,117,110,116,0,0,0,0,32,32,98,100,46,112,111,115,105,116,105,111,110,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,98,50,70,114,101,101,40,98,111,100,105,101,115,41,59,10,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,49,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,106,32,60,32,98,50,95,98,108,111,99,107,83,105,122,101,115,0,0,0,109,95,110,111,100,101,115,91,66,45,62,112,97,114,101,110,116,93,46,99,104,105,108,100,50,32,61,61,32,105,65,0,32,32,98,100,46,116,121,112,101,32,61,32,98,50,66,111,100,121,84,121,112,101,40,37,100,41,59,10,0,0,0,0,32,32,106,100,46,109,97,120,77,111,116,111,114,70,111,114,99,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,51,32,60,61,32,99,111,117,110,116,32,38,38,32,99,111,117,110,116,32,60,61,32,56,0,0,0,0,98,50,70,114,101,101,40,106,111,105,110,116,115,41,59,10,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,48,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,48,32,60,61,32,105,69,32,38,38,32,105,69,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,50,66,111,100,121,68,101,102,32,98,100,59,10,0,0,0,0,109,95,118,101,114,116,105,99,101,115,32,61,61,32,95,95,110,117,108,108,32,38,38,32,109,95,99,111,117,110,116,32,61,61,32,48,0,0,0,0,48,32,60,61,32,105,68,32,38,38,32,105,68,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,125,10,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,32,32,32,32,98,50,69,100,103,101,83,104,97,112,101,32,115,104,97,112,101,59,10,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,121,110,97,109,105,99,84,114,101,101,46,99,112,112,0,0,108,111,119,101,114,32,60,61,32,117,112,112,101,114,0,0,116,97,114,103,101,116,32,62,32,116,111,108,101,114,97,110,99,101,0,0,114,97,116,105,111,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,32,32,106,100,46,114,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,100,101,102,45,62,116,97,114,103,101,116,46,73,115,86,97,108,105,100,40,41,0,0,0,109,95,110,111,100,101,115,91,67,45,62,112,97,114,101,110,116,93,46,99,104,105,108,100,50,32,61,61,32,105,65,0,123,10,0,0,102,97,108,115,101,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,112,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,109,95,116,121,112,101,65,32,61,61,32,101,95,114,101,118,111,108,117,116,101,74,111,105,110,116,32,124,124,32,109,95,116,121,112,101,65,32,61,61,32,101,95,112,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,0,48,32,60,61,32,101,100,103,101,49,32,38,38,32,101,100,103,101,49,32,60,32,112,111,108,121,49,45,62,109,95,118,101,114,116,101,120,67,111,117,110,116,0,0,98,50,73,115,86,97,108,105,100,40,102,111,114,99,101,41,32,38,38,32,102,111,114,99,101,32,62,61,32,48,46,48,102,0,0,0,109,95,73,32,62,32,48,46,48,102,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,112,111,108,121,103,111,110,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,101,100,103,101,0,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,32,32,106,100,46,108,101,110,103,116,104,66,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,117,112,112,101,114,84,114,97,110,115,108,97,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,98,50,74,111,105,110,116,42,42,32,106,111,105,110,116,115,32,61,32,40,98,50,74,111,105,110,116,42,42,41,98,50,65,108,108,111,99,40,37,100,32,42,32,115,105,122,101,111,102,40,98,50,74,111,105,110,116,42,41,41,59,10,0,0,48,32,60,61,32,116,121,112,101,49,32,38,38,32,116,121,112,101,49,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,105,114,99,108,101,0,0,32,32,32,32,115,104,97,112,101,46,109,95,114,97,100,105,117,115,32,61,32,37,46,49,53,108,101,102,59,10,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,104,97,105,110,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,70,105,120,116,117,114,101,46,99,112,112,0,0,0,48,32,60,61,32,105,71,32,38,38,32,105,71,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,109,95,116,121,112,101,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,0,0,0,0,73,115,76,111,99,107,101,100,40,41,32,61,61,32,102,97,108,115,101,0,116,111,105,73,110,100,101,120,65,32,60,32,109,95,98,111,100,121,67,111,117,110,116,0,109,95,110,111,100,101,67,111,117,110,116,32,61,61,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,32,32,106,100,46,100,97,109,112,105,110,103,82,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,32,32,106,100,46,117,112,112,101,114,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,108,101,110,103,116,104,65,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,108,111,119,101,114,84,114,97,110,115,108,97,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,109,95,112,114,111,120,121,67,111,117,110,116,32,61,61,32,48,0,0,0,98,50,66,111,100,121,42,42,32,98,111,100,105,101,115,32,61,32,40,98,50,66,111,100,121,42,42,41,98,50,65,108,108,111,99,40,37,100,32,42,32,115,105,122,101,111,102,40,98,50,66,111,100,121,42,41,41,59,10,0,32,32,32,32,98,50,67,105,114,99,108,101,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,0,48,32,60,61,32,105,70,32,38,38,32,105,70,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,102,111,117,110,100,0,0,0,32,32,106,100,46,102,114,101,113,117,101,110,99,121,72,122,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,108,111,119,101,114,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,109,97,120,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,109,95,119,111,114,108,100,45,62,83,101,116,71,114,97,118,105,116,121,40,103,41,59,10,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,103,114,111,117,112,73,110,100,101,120,32,61,32,105,110,116,49,54,40,37,100,41,59,10,0,0,48,32,60,61,32,105,67,32,38,38,32,105,67,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,100,101,110,32,62,32,48,46,48,102,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,67,111,108,108,105,100,101,69,100,103,101,46,99,112,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,77,101,116,114,105,99,40,41,32,99,111,110,115,116,0,0,0,0,118,111,105,100,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,87,105,116,110,101,115,115,80,111,105,110,116,115,40,98,50,86,101,99,50,32,42,44,32,98,50,86,101,99,50,32,42,41,32,99,111,110,115,116,0,0,98,50,86,101,99,50,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,67,108,111,115,101,115,116,80,111,105,110,116,40,41,32,99,111,110,115,116,0,0,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,69,118,97,108,117,97,116,101,40,105,110,116,51,50,44,32,105,110,116,51,50,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,70,105,110,100,77,105,110,83,101,112,97,114,97,116,105,111,110,40,105,110,116,51,50,32,42,44,32,105,110,116,51,50,32,42,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,0,0,0,99,111,110,115,116,32,98,50,86,101,99,50,32,38,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,58,58,71,101,116,86,101,114,116,101,120,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,118,105,114,116,117,97,108,32,98,111,111,108,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,82,97,121,67,97,115,116,40,98,50,82,97,121,67,97,115,116,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,67,111,109,112,117,116,101,77,97,115,115,40,98,50,77,97,115,115,68,97,116,97,32,42,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,40,41,32,99,111,110,115,116,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,82,97,121,67,97,115,116,40,84,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,41,32,99,111,110,115,116,32,91,84,32,61,32,98,50,87,111,114,108,100,82,97,121,67,97,115,116,87,114,97,112,112,101,114,93,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,83,116,114,117,99,116,117,114,101,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,77,101,116,114,105,99,115,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,77,97,120,66,97,108,97,110,99,101,40,41,32,99,111,110,115,116,0,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,67,111,109,112,117,116,101,72,101,105,103,104,116,40,105,110,116,51,50,41,32,99,111,110,115,116,0,118,111,105,100,32,42,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,85,115,101,114,68,97,116,97,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,99,111,110,115,116,32,98,50,65,65,66,66,32,38,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,70,97,116,65,65,66,66,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,118,105,114,116,117,97,108,32,98,111,111,108,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,82,97,121,67,97,115,116,40,98,50,82,97,121,67,97,115,116,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,71,101,116,67,104,105,108,100,69,100,103,101,40,98,50,69,100,103,101,83,104,97,112,101,32,42,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,111,109,112,117,116,101,65,65,66,66,40,98,50,65,65,66,66,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,0,118,111,105,100,32,98,50,83,105,109,112,108,101,120,58,58,82,101,97,100,67,97,99,104,101,40,99,111,110,115,116,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,118,111,105,100,32,98,50,70,105,120,116,117,114,101,58,58,68,101,115,116,114,111,121,40,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,118,111,105,100,32,98,50,70,105,120,116,117,114,101,58,58,67,114,101,97,116,101,80,114,111,120,105,101,115,40,98,50,66,114,111,97,100,80,104,97,115,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,115,116,97,116,105,99,32,118,111,105,100,32,98,50,67,111,110,116,97,99,116,58,58,68,101,115,116,114,111,121,40,98,50,67,111,110,116,97,99,116,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,115,116,97,116,105,99,32,98,50,67,111,110,116,97,99,116,32,42,98,50,67,111,110,116,97,99,116,58,58,67,114,101,97,116,101,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,83,111,108,118,101,84,79,73,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,44,32,105,110,116,51,50,44,32,105,110,116,51,50,41,0,0,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,67,111,110,116,97,99,116,32,42,41,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,74,111,105,110,116,32,42,41,0,0,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,66,111,100,121,32,42,41,0,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,114,97,119,83,104,97,112,101,40,98,50,70,105,120,116,117,114,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,67,111,108,111,114,32,38,41,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,83,111,108,118,101,84,79,73,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,41,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,83,111,108,118,101,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,41,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,101,115,116,114,111,121,74,111,105,110,116,40,98,50,74,111,105,110,116,32,42,41,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,101,115,116,114,111,121,66,111,100,121,40,98,50,66,111,100,121,32,42,41,0,98,50,74,111,105,110,116,32,42,98,50,87,111,114,108,100,58,58,67,114,101,97,116,101,74,111,105,110,116,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,41,0,0,0,98,50,66,111,100,121,32,42,98,50,87,111,114,108,100,58,58,67,114,101,97,116,101,66,111,100,121,40,99,111,110,115,116,32,98,50,66,111,100,121,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,83,119,101,101,112,58,58,65,100,118,97,110,99,101,40,102,108,111,97,116,51,50,41,0,0,98,50,74,111,105,110,116,58,58,98,50,74,111,105,110,116,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,115,116,97,116,105,99,32,118,111,105,100,32,98,50,74,111,105,110,116,58,58,68,101,115,116,114,111,121,40,98,50,74,111,105,110,116,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,115,116,97,116,105,99,32,98,50,74,111,105,110,116,32,42,98,50,74,111,105,110,116,58,58,67,114,101,97,116,101,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,98,50,66,111,100,121,58,58,98,50,66,111,100,121,40,99,111,110,115,116,32,98,50,66,111,100,121,68,101,102,32,42,44,32,98,50,87,111,114,108,100,32,42,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,65,99,116,105,118,101,40,98,111,111,108,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,84,121,112,101,40,98,50,66,111,100,121,84,121,112,101,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,68,101,115,116,114,111,121,70,105,120,116,117,114,101,40,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,82,101,115,101,116,77,97,115,115,68,97,116,97,40,41,0,0,0,0,98,50,70,105,120,116,117,114,101,32,42,98,50,66,111,100,121,58,58,67,114,101,97,116,101,70,105,120,116,117,114,101,40,99,111,110,115,116,32,98,50,70,105,120,116,117,114,101,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,84,114,97,110,115,102,111,114,109,40,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,102,108,111,97,116,51,50,41,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,77,97,115,115,68,97,116,97,40,99,111,110,115,116,32,98,50,77,97,115,115,68,97,116,97,32,42,41,0,0,0,0,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,118,111,105,100,32,98,50,80,111,115,105,116,105,111,110,83,111,108,118,101,114,77,97,110,105,102,111,108,100,58,58,73,110,105,116,105,97,108,105,122,101,40,98,50,67,111,110,116,97,99,116,80,111,115,105,116,105,111,110,67,111,110,115,116,114,97,105,110,116,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,0,0,0,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,41,0,0,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,41,0,0,0,0,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,73,110,105,116,105,97,108,105,122,101,40,99,111,110,115,116,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,83,119,101,101,112,32,38,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,83,119,101,101,112,32,38,44,32,102,108,111,97,116,51,50,41,0,0,0,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,126,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,40,41,0,0,0,118,111,105,100,32,42,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,65,108,108,111,99,97,116,101,40,105,110,116,51,50,41,0,118,111,105,100,32,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,70,114,101,101,40,118,111,105,100,32,42,41,0,118,111,105,100,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,58,58,73,110,105,116,105,97,108,105,122,101,40,98,50,66,111,100,121,32,42,44,32,98,50,66,111,100,121,32,42,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,102,108,111,97,116,51,50,41,0,0,118,111,105,100,32,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,58,58,83,101,116,76,105,109,105,116,115,40,102,108,111,97,116,51,50,44,32,102,108,111,97,116,51,50,41,0,0,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,40,41,0,0,0,0,118,111,105,100,32,42,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,65,108,108,111,99,97,116,101,40,105,110,116,51,50,41,0,118,111,105,100,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,70,114,101,101,40,118,111,105,100,32,42,44,32,105,110,116,51,50,41,0,0,118,111,105,100,32,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,58,58,83,101,116,76,105,109,105,116,115,40,102,108,111,97,116,51,50,44,32,102,108,111,97,116,51,50,41,0,0,0,118,111,105,100,32,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,58,58,83,101,116,77,97,120,84,111,114,113,117,101,40,102,108,111,97,116,51,50,41,0,118,111,105,100,32,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,58,58,83,101,116,77,97,120,70,111,114,99,101,40,102,108,111,97,116,51,50,41,0,0,118,111,105,100,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,58,58,83,101,116,40,99,111,110,115,116,32,98,50,83,104,97,112,101,32,42,44,32,105,110,116,51,50,41,0,0,0,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,40,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,73,110,105,116,105,97,108,105,122,101,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,41,0,0,0,118,111,105,100,32,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,83,111,108,118,101,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,41,0,0,0,0,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,118,111,105,100,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,83,101,116,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,98,50,80,117,108,108,101,121,74,111,105,110,116,58,58,98,50,80,117,108,108,101,121,74,111,105,110,116,40,99,111,110,115,116,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,32,42,41,0,0,98,111,111,108,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,77,111,118,101,80,114,111,120,121,40,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,65,65,66,66,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,41,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,70,114,101,101,78,111,100,101,40,105,110,116,51,50,41,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,66,97,108,97,110,99,101,40,105,110,116,51,50,41,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,68,101,115,116,114,111,121,80,114,111,120,121,40,105,110,116,51,50,41,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,65,108,108,111,99,97,116,101,78,111,100,101,40,41,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,73,110,115,101,114,116,76,101,97,102,40,105,110,116,51,50,41,0,0,0,98,50,77,111,117,115,101,74,111,105,110,116,58,58,98,50,77,111,117,115,101,74,111,105,110,116,40,99,111,110,115,116,32,98,50,77,111,117,115,101,74,111,105,110,116,68,101,102,32,42,41,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,77,111,117,115,101,74,111,105,110,116,58,58,73,110,105,116,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,99,111,110,115,116,32,98,50,83,111,108,118,101,114,68,97,116,97,32,38,41,0,0,0,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,114,101,97,116,101,67,104,97,105,110,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,114,101,97,116,101,76,111,111,112,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,0,98,50,71,101,97,114,74,111,105,110,116,58,58,98,50,71,101,97,114,74,111,105,110,116,40,99,111,110,115,116,32,98,50,71,101,97,114,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,118,111,105,100,32,98,50,71,101,97,114,74,111,105,110,116,58,58,83,101,116,82,97,116,105,111,40,102,108,111,97,116,51,50,41,0,118,111,105,100,32,98,50,70,105,110,100,73,110,99,105,100,101,110,116,69,100,103,101,40,98,50,67,108,105,112,86,101,114,116,101,120,32,42,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,0,102,108,111,97,116,51,50,32,98,50,69,100,103,101,83,101,112,97,114,97,116,105,111,110,40,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,98,50,86,101,99,50,32,67,111,109,112,117,116,101,67,101,110,116,114,111,105,100,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,118,111,105,100,32,98,50,67,111,108,108,105,100,101,69,100,103,101,65,110,100,67,105,114,99,108,101,40,98,50,77,97,110,105,102,111,108,100,32,42,44,32,99,111,110,115,116,32,98,50,69,100,103,101,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,67,105,114,99,108,101,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,118,111,105,100,32,98,50,84,105,109,101,79,102,73,109,112,97,99,116,40,98,50,84,79,73,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,84,79,73,73,110,112,117,116,32,42,41,0,0,118,111,105,100,32,98,50,68,105,115,116,97,110,99,101,40,98,50,68,105,115,116,97,110,99,101,79,117,116,112,117,116,32,42,44,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,73,110,112,117,116,32,42,41,0,0,0,0,0,0,176,79,80,0,194,0,0,0,232,5,0,0,90,5,0,0,0,0,0,0,0,0,0,0,224,79,80,0,250,5,0,0,98,0,0,0,36,3,0,0,0,0,0,0,0,0,0,0,240,79,80,0,250,5,0,0,250,5,0,0,250,5,0,0,250,5,0,0,128,6,0,0,248,3,0,0,56,0,0,0,250,5,0,0,250,5,0,0,250,5,0,0,0,0,0,0,0,0,0,0,248,79,80,0,180,2,0,0,168,5,0,0,94,2,0,0,152,6,0,0,204,7,0,0,156,2,0,0,238,6,0,0,98,2,0,0,0,0,0,0,0,0,0,0,0,80,80,0,72,3,0,0,188,0,0,0,152,1,0,0,0,0,0,0,0,0,0,0,12,80,80,0,180,4,0,0,58,7,0,0,204,3,0,0,0,0,0,0,0,0,0,0,24,80,80,0,230,3,0,0,80,3,0,0,226,2,0,0,0,0,0,0,0,0,0,0,36,80,80,0,48,2,0,0,10,5,0,0,194,5,0,0,0,0,0,0,0,0,0,0,48,80,80,0,90,6,0,0,58,8,0,0,106,4,0,0,0,0,0,0,0,0,0,0,60,80,80,0,232,8,0,0,136,0,0,0,164,7,0,0,112,2,0,0,0,0,0,0,0,0,0,0,68,80,80,0,200,7,0,0,106,1,0,0,168,2,0,0,0,0,0,0,0,0,0,0,76,80,80,0,2,3,0,0,124,2,0,0,78,7,0,0,30,5,0,0,12,4,0,0,224,7,0,0,0,0,0,0,0,0,0,0,84,80,80,0,232,0,0,0,182,3,0,0,24,6,0,0,228,5,0,0,192,0,0,0,40,2,0,0,176,2,0,0,30,0,0,0,164,4,0,0,166,3,0,0,0,0,0,0,0,0,0,0,96,80,80,0,106,7,0,0,116,7,0,0,78,1,0,0,0,0,0,0,0,0,0,0,108,80,80,0,184,6,0,0,142,4,0,0,174,2,0,0,168,4,0,0,158,0,0,0,80,0,0,0,198,8,0,0,196,6,0,0,176,7,0,0,98,7,0,0,0,0,0,0,0,0,0,0,120,80,80,0,214,1,0,0,110,4,0,0,242,7,0,0,0,0,0,0,0,0,0,0,128,80,80,0,144,6,0,0,160,3,0,0,102,6,0,0,94,8,0,0,110,1,0,0,102,7,0,0,142,2,0,0,236,1,0,0,170,6,0,0,146,6,0,0,0,0,0,0,0,0,0,0,140,80,80,0,166,8,0,0,210,6,0,0,82,8,0,0,168,8,0,0,182,7,0,0,140,8,0,0,90,0,0,0,240,0,0,0,128,8,0,0,124,8,0,0,0,0,0,0,0,0,0,0,152,80,80,0,148,1,0,0,134,5,0,0,252,6,0,0,0,0,0,0,0,0,0,0,160,80,80,0,64,7,0,0,236,4,0,0,156,5,0,0,0,0,0,0,0,0,0,0,172,80,80,0,0,3,0,0,66,4,0,0,160,4,0,0,84,4,0,0,174,7,0,0,64,0,0,0,200,6,0,0,72,7,0,0,0,0,0,0,0,0,0,0,184,80,80,0,56,3,0,0,82,2,0,0,132,8,0,0,96,6,0,0,90,1,0,0,86,1,0,0,20,6,0,0,212,0,0,0,100,3,0,0,66,2,0,0,0,0,0,0,0,0,0,0,196,80,80,0,52,2,0,0,162,1,0,0,32,3,0,0,40,8,0,0,4,6,0,0,218,7,0,0,146,0,0,0,186,1,0,0,0,0,0,0,0,0,0,0,208,80,80,0,186,8,0,0,148,2,0,0,136,2,0,0,120,6,0,0,20,8,0,0,2,0,0,0,96,3,0,0,94,3,0,0,34,7,0,0,98,6,0,0,0,0,0,0,0,0,0,0,220,80,80,0,218,1,0,0,2,6,0,0,86,3,0,0,14,3,0,0,22,7,0,0,98,8,0,0,236,8,0,0,186,4,0,0,218,6,0,0,54,4,0,0,0,0,0,0,0,0,0,0,232,80,80,0,134,1,0,0,22,6,0,0,50,7,0,0,250,3,0,0,102,8,0,0,134,3,0,0,0,2,0,0,6,0,0,0,0,0,0,0,0,0,0,0,244,80,80,0,192,3,0,0,54,8,0,0,66,8,0,0,14,4,0,0,152,7,0,0,250,1,0,0,140,2,0,0,28,3,0,0,164,5,0,0,174,8,0,0,0,0,0,0,0,0,0,0,0,81,80,0,212,2,0,0,252,0,0,0,76,4,0,0,150,4,0,0,122,4,0,0,242,6,0,0,20,5,0,0,176,1,0,0,200,2,0,0,190,5,0,0,0,0,0,0,0,0,0,0,12,81,80,0,58,3,0,0,200,4,0,0,76,0,0,0,126,3,0,0,232,3,0,0,210,7,0,0,110,0,0,0,40,6,0,0,234,4,0,0,84,8,0,0,0,0,0,0,0,0,0,0,24,81,80,0,202,0,0,0,88,0,0,0,50,6,0,0,36,8,0,0,6,8,0,0,164,8,0,0,52,1,0,0,218,8,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,57,98,50,67,111,110,116,97,99,116,0,0,55,98,50,83,104,97,112,101,0,0,0,0,55,98,50,74,111,105,110,116,0,0,0,0,54,98,50,68,114,97,119,0,50,53,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,50,52,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,50,51,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,0,50,51,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,50,50,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,50,49,98,50,68,101,115,116,114,117,99,116,105,111,110,76,105,115,116,101,110,101,114,0,49,55,98,50,82,97,121,67,97,115,116,67,97,108,108,98,97,99,107,0,49,55,98,50,67,111,110,116,97,99,116,76,105,115,116,101,110,101,114,0,49,54,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,49,54,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,49,53,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,0,0,0,49,53,98,50,81,117,101,114,121,67,97,108,108,98,97,99,107,0,0,0,49,53,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,0,0,0,49,53,98,50,68,105,115,116,97,110,99,101,74,111,105,110,116,0,0,0,49,53,98,50,67,111,110,116,97,99,116,70,105,108,116,101,114,0,0,0,49,53,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,49,52,98,50,80,111,108,121,103,111,110,83,104,97,112,101,0,0,0,0,49,51,98,50,80,117,108,108,101,121,74,111,105,110,116,0,49,51,98,50,67,105,114,99,108,101,83,104,97,112,101,0,49,50,98,50,87,104,101,101,108,74,111,105,110,116,0,0,49,50,98,50,77,111,117,115,101,74,111,105,110,116,0,0,49,50,98,50,67,104,97,105,110,83,104,97,112,101,0,0,49,49,98,50,87,101,108,100,74,111,105,110,116,0,0,0,49,49,98,50,82,111,112,101,74,111,105,110,116,0,0,0,49,49,98,50,71,101,97,114,74,111,105,110,116,0,0,0,49,49,98,50,69,100,103,101,83,104,97,112,101,0,0,0,0,0,0,0,220,76,80,0,0,0,0,0,236,76,80,0,0,0,0,0,0,0,0,0,252,76,80,0,200,79,80,0,0,0,0,0,36,77,80,0,212,79,80,0,0,0,0,0,72,77,80,0,168,79,80,0,0,0,0,0,108,77,80,0,0,0,0,0,120,77,80,0,0,0,0,0,132,77,80,0,0,0,0,0,144,77,80,0])
.concat([0,0,0,0,152,77,80,0,224,79,80,0,0,0,0,0,180,77,80,0,224,79,80,0,0,0,0,0,208,77,80,0,224,79,80,0,0,0,0,0,236,77,80,0,224,79,80,0,0,0,0,0,8,78,80,0,224,79,80,0,0,0,0,0,36,78,80,0,0,0,0,0,60,78,80,0,0,0,0,0,80,78,80,0,0,0,0,0,100,78,80,0,240,79,80,0,0,0,0,0,120,78,80,0,224,79,80,0,0,0,0,0,140,78,80,0,240,79,80,0,0,0,0,0,160,78,80,0,0,0,0,0,180,78,80,0,240,79,80,0,0,0,0,0,200,78,80,0,240,79,80,0,0,0,0,0,220,78,80,0,0,0,0,0,240,78,80,0,224,79,80,0,0,0,0,0,4,79,80,0,232,79,80,0,0,0,0,0,24,79,80,0,240,79,80,0,0,0,0,0,40,79,80,0,232,79,80,0,0,0,0,0,56,79,80,0,240,79,80,0,0,0,0,0,72,79,80,0,240,79,80,0,0,0,0,0,88,79,80,0,232,79,80,0,0,0,0,0,104,79,80,0,240,79,80,0,0,0,0,0,120,79,80,0,240,79,80,0,0,0,0,0,136,79,80,0,240,79,80,0,0,0,0,0,152,79,80,0,232,79,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,32,0,0,0,64,0,0,0,96,0,0,0,128,0,0,0,160,0,0,0,192,0,0,0,224,0,0,0,0,1,0,0,64,1,0,0,128,1,0,0,192,1,0,0,0,2,0,0,128,2,0,0,0,0,0,0,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0])
, "i8", ALLOC_NONE, TOTAL_STACK)
function runPostSets() {
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(8))>>2)]=(1782);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(12))>>2)]=(1104);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(16))>>2)]=(514);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(20))>>2)]=(1798);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(24))>>2)]=(1506);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(28))>>2)]=(1758);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(32))>>2)]=(764);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(36))>>2)]=(846);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(8))>>2)]=(1782);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(12))>>2)]=(2182);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(16))>>2)]=(514);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(20))>>2)]=(1798);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(24))>>2)]=(1506);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(28))>>2)]=(1926);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(32))>>2)]=(832);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(36))>>2)]=(1284);
HEAP32[((5263272)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5263280)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263288)>>2)]=__ZTISt9exception;
HEAP32[((5263292)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263304)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263316)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263328)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5263336)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5263344)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5263352)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5263360)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263372)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263384)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263396)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263408)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263420)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5263428)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5263436)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5263444)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263456)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263468)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263480)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5263488)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263500)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263512)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5263520)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263532)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263544)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263556)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263568)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263580)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263592)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263604)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263616)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263628)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5263640)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
}
if (!awaitingMemoryInitializer) runPostSets();
  function ___gxx_personality_v0() {
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      function ExitStatus() {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
        Module.print('Exit Status: ' + status);
      };
      ExitStatus.prototype = new Error();
      ExitStatus.prototype.constructor = ExitStatus;
      exitRuntime();
      ABORT = true;
      throw new ExitStatus();
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  var _sqrtf=Math.sqrt;
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
    }var _llvm_memset_p0i8_i32=_memset;
  var _sinf=Math.sin;
  var _cosf=Math.cos;
  var _floorf=Math.floor;
  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }
  var ERRNO_CODES={E2BIG:7,EACCES:13,EADDRINUSE:98,EADDRNOTAVAIL:99,EAFNOSUPPORT:97,EAGAIN:11,EALREADY:114,EBADF:9,EBADMSG:74,EBUSY:16,ECANCELED:125,ECHILD:10,ECONNABORTED:103,ECONNREFUSED:111,ECONNRESET:104,EDEADLK:35,EDESTADDRREQ:89,EDOM:33,EDQUOT:122,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:113,EIDRM:43,EILSEQ:84,EINPROGRESS:115,EINTR:4,EINVAL:22,EIO:5,EISCONN:106,EISDIR:21,ELOOP:40,EMFILE:24,EMLINK:31,EMSGSIZE:90,EMULTIHOP:72,ENAMETOOLONG:36,ENETDOWN:100,ENETRESET:102,ENETUNREACH:101,ENFILE:23,ENOBUFS:105,ENODATA:61,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:37,ENOLINK:67,ENOMEM:12,ENOMSG:42,ENOPROTOOPT:92,ENOSPC:28,ENOSR:63,ENOSTR:60,ENOSYS:38,ENOTCONN:107,ENOTDIR:20,ENOTEMPTY:39,ENOTRECOVERABLE:131,ENOTSOCK:88,ENOTSUP:95,ENOTTY:25,ENXIO:6,EOVERFLOW:75,EOWNERDEAD:130,EPERM:1,EPIPE:32,EPROTO:71,EPROTONOSUPPORT:93,EPROTOTYPE:91,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:116,ETIME:62,ETIMEDOUT:110,ETXTBSY:26,EWOULDBLOCK:11,EXDEV:18};
  function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      if (!___setErrNo.ret) ___setErrNo.ret = allocate([0], 'i32', ALLOC_STATIC);
      HEAP32[((___setErrNo.ret)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STACK);
  var _stdout=allocate(1, "i32*", ALLOC_STACK);
  var _stderr=allocate(1, "i32*", ALLOC_STACK);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STACK);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function(chunkSize, length) {
            this.length = length;
            this.chunkSize = chunkSize;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % chunkSize;
            var chunkNum = Math.floor(idx / chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var chunkSize = 1024*1024; // Chunk size in bytes
          if (!hasByteServing) chunkSize = datalength;
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
          var lazyArray = new LazyUint8Array(chunkSize, datalength);
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * lazyArray.chunkSize;
            var end = (chunkNum+1) * lazyArray.chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        assert(Math.max(_stdin, _stdout, _stderr) < 128); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_STATIC) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]|0 != 0) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],HEAPF64[(tempDoublePtr)>>3]);
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = flagAlternative ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*') || nullString;
              var argLength = _strlen(arg);
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              for (var i = 0; i < argLength; i++) {
                ret.push(HEAPU8[((arg++)|0)]);
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }var _vprintf=_printf;
  function _llvm_va_end() {}
  var _atan2f=Math.atan2;
  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[(variable)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[(variable)]=1;
        return 1;
      }
      return 0;
    }
  function ___cxa_guard_release() {}
  function __ZNSt9exceptionD2Ev(){}
  var _llvm_memset_p0i8_i64=_memset;
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function ___errno_location() {
      return ___setErrNo.ret;
    }var ___errno=___errno_location;
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We need to make sure no one else allocates unfreeable memory!
      // We must control this entirely. So we don't even need to do
      // unfreeable allocations - the HEAP is ours, from STATICTOP up.
      // TODO: We could in theory slice off the top of the HEAP when
      //       sbrk gets a negative increment in |bytes|...
      var self = _sbrk;
      if (!self.called) {
        STATICTOP = alignMemoryPage(STATICTOP); // make sure we start out aligned
        self.called = true;
        _sbrk.DYNAMIC_START = STATICTOP;
      }
      var ret = STATICTOP;
      if (bytes != 0) Runtime.staticAlloc(bytes);
      return ret;  // Previous break location.
    }
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return tempRet0 = typeArray[i],thrown;
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return tempRet0 = throwntype,thrown;
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (Browser.initted) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            setTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'];
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        this.lockPointer = lockPointer;
        this.resizeCanvas = resizeCanvas;
        if (typeof this.lockPointer === 'undefined') this.lockPointer = true;
        if (typeof this.resizeCanvas === 'undefined') this.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!this.fullScreenHandlersInstalled) {
          this.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen(); 
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      }};
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___setErrNo(0);
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
var FUNCTION_TABLE = [0,0,__ZN12b2WheelJointD1Ev,0,_emscripten_bind_b2Filter__b2Filter_p0,0,__ZNK12b2ChainShape11ComputeMassEP10b2MassDataf,0,_emscripten_bind_b2WheelJoint__GetSpringFrequencyHz_p0,0,_emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1
,0,_emscripten_bind_b2Fixture__SetRestitution_p1,0,_emscripten_bind_b2PolygonShape____destroy___p0,0,_emscripten_bind_b2ContactManager__b2ContactManager_p0,0,_emscripten_bind_b2RevoluteJoint__EnableLimit_p1,0,_emscripten_bind_b2DistanceProxy__get_m_vertices_p0
,0,_emscripten_bind_b2PrismaticJoint__EnableLimit_p1,0,_emscripten_bind_b2WheelJointDef__Initialize_p4,0,_emscripten_bind_b2BroadPhase__GetUserData_p1,0,_emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1,0,__ZN16b2PrismaticJoint23InitVelocityConstraintsERK12b2SolverData
,0,_emscripten_bind_b2PrismaticJoint__GetMotorForce_p1,0,_emscripten_bind_b2Filter__set_maskBits_p1,0,_emscripten_bind_b2DistanceJoint__GetNext_p0,0,_emscripten_bind_b2Vec2__b2Vec2_p2,0,_emscripten_bind_b2RevoluteJoint__GetMaxMotorTorque_p0
,0,_emscripten_bind_b2WeldJoint__GetFrequency_p0,0,_emscripten_bind_b2MouseJoint__GetType_p0,0,_emscripten_bind_b2RayCastCallback__b2RayCastCallback_p0,0,_emscripten_bind_b2Body__GetLinearDamping_p0,0,_emscripten_bind_b2JointDef__get_type_p0
,0,_emscripten_bind_b2PrismaticJoint__GetType_p0,0,_emscripten_bind_b2PrismaticJoint____destroy___p0,0,__ZN7b2JointD0Ev,0,_emscripten_bind_b2WheelJointDef__set_frequencyHz_p1,0,_emscripten_bind_b2BlockAllocator____destroy___p0
,0,_emscripten_bind_b2Vec2__op_add_p1,0,__ZNK14b2PolygonShape7RayCastEP15b2RayCastOutputRK14b2RayCastInputRK11b2Transformi,0,_emscripten_bind_b2Transform__Set_p2,0,_emscripten_bind_b2EdgeShape__RayCast_p4,0,_emscripten_bind_b2RevoluteJoint__GetLocalAnchorA_p0
,0,_emscripten_bind_b2DistanceJoint__GetDampingRatio_p0,0,_emscripten_bind_b2Vec2__get_y_p0,0,__ZNK11b2GearJoint16GetReactionForceEf,0,_emscripten_bind_b2DynamicTree__Validate_p0,0,__ZN15b2RevoluteJointD1Ev
,0,_emscripten_bind_b2DynamicTree__DestroyProxy_p1,0,_emscripten_bind_b2Manifold__set_type_p1,0,_emscripten_bind_b2Joint__IsActive_p0,0,__ZN11b2EdgeShapeD0Ev,0,__ZN15b2DistanceJointD0Ev
,0,_emscripten_bind_b2GearJointDef____destroy___p0,0,_emscripten_bind_b2PulleyJoint__GetNext_p0,0,_emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0,0,__ZN9b2ContactD1Ev,0,_emscripten_bind_b2EdgeShape__get_m_radius_p0
,0,_emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0,0,_emscripten_bind_b2RevoluteJointDef__set_bodyA_p1,0,_emscripten_bind_b2World__GetJointCount_p0,0,_emscripten_bind_b2DynamicTree__CreateProxy_p2,0,__ZN11b2GearJointD0Ev
,0,_emscripten_bind_b2WheelJointDef__set_collideConnected_p1,0,_emscripten_bind_b2WeldJoint__GetLocalAnchorA_p0,0,_emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0,0,_emscripten_bind_b2Body__GetGravityScale_p0,0,_emscripten_bind_b2Fixture__Dump_p1
,0,_emscripten_bind_b2World__GetBodyList_p0,0,_emscripten_bind_b2PulleyJoint__IsActive_p0,0,_emscripten_bind_b2MouseJoint__SetUserData_p1,0,_emscripten_bind_b2World__GetContactList_p0,0,_emscripten_bind_b2PrismaticJoint__GetNext_p0
,0,_emscripten_bind_b2Vec2__Skew_p0,0,_emscripten_bind_b2BodyDef__get_linearVelocity_p0,0,__ZN21b2DestructionListenerD0Ev,0,_emscripten_bind_b2WheelJoint__GetReactionForce_p1,0,_emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1
,0,_emscripten_bind_b2PrismaticJoint__SetMaxMotorForce_p1,0,_emscripten_bind_b2ChainShape__b2ChainShape_p0,0,__ZNK13b2CircleShape11ComputeAABBEP6b2AABBRK11b2Transformi,0,_emscripten_bind_b2CircleShape__RayCast_p4,0,_emscripten_bind_b2WheelJoint__GetBodyA_p0
,0,_emscripten_bind_b2World__SetGravity_p1,0,_emscripten_bind_b2RevoluteJointDef__set_bodyB_p1,0,_emscripten_bind_b2MouseJointDef__get_dampingRatio_p0,0,__ZN15b2RevoluteJoint4DumpEv,0,_emscripten_bind_b2Fixture__GetNext_p0
,0,_emscripten_bind_b2JointDef__set_bodyB_p1,0,_emscripten_bind_b2RevoluteJoint__GetJointSpeed_p0,0,_emscripten_bind_b2RopeJoint__GetLocalAnchorB_p0,0,_emscripten_bind_b2Fixture__GetAABB_p1,0,_emscripten_bind_b2BroadPhase__TouchProxy_p1
,0,_emscripten_bind_b2FixtureDef__set_isSensor_p1,0,_emscripten_bind_b2World__GetAllowSleeping_p0,0,_emscripten_bind_b2DestructionListener____destroy___p0,0,_emscripten_bind_b2BroadPhase____destroy___p0,0,_emscripten_bind_b2World__GetWarmStarting_p0
,0,_emscripten_bind_b2Rot__b2Rot_p1,0,_emscripten_bind_b2Rot__b2Rot_p0,0,_emscripten_bind_b2DistanceJoint__GetUserData_p0,0,__ZN25b2PolygonAndCircleContactD1Ev,0,_emscripten_bind_b2MouseJointDef__get_frequencyHz_p0
,0,__ZN16b2PrismaticJoint4DumpEv,0,__ZNSt9bad_allocD2Ev,0,_emscripten_bind_b2ContactManager__set_m_allocator_p1,0,_emscripten_bind_b2WeldJointDef__get_referenceAngle_p0,0,_emscripten_bind_b2WheelJoint__SetMaxMotorTorque_p1
,0,__ZN11b2EdgeShapeD1Ev,0,_emscripten_bind_b2MouseJointDef__get_target_p0,0,_emscripten_bind_b2WeldJoint__SetUserData_p1,0,_emscripten_bind_b2PrismaticJoint__GetBodyA_p0,0,_emscripten_bind_b2StackAllocator__b2StackAllocator_p0
,0,__ZN13b2PulleyJoint23InitVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2MouseJoint__GetDampingRatio_p0,0,_emscripten_bind_b2Body__IsSleepingAllowed_p0,0,_emscripten_bind_b2Filter__get_maskBits_p0,0,_emscripten_bind_b2RayCastCallback____destroy___p0
,0,_emscripten_bind_b2World__Dump_p0,0,_emscripten_bind_b2RevoluteJointDef____destroy___p0,0,_emscripten_bind_b2BodyDef__get_bullet_p0,0,_emscripten_bind_b2Body__SetAngularDamping_p1,0,_emscripten_bind_b2Manifold____destroy___p0
,0,__ZNK16b2PrismaticJoint10GetAnchorAEv,0,_emscripten_bind_b2DynamicTree__RebuildBottomUp_p0,0,_emscripten_bind_b2Fixture__GetFilterData_p0,0,_emscripten_bind_b2DistanceJoint__SetLength_p1,0,__ZN15b2DistanceJoint23InitVelocityConstraintsERK12b2SolverData
,0,_emscripten_bind_b2BodyDef__get_position_p0,0,_emscripten_bind_b2FrictionJoint__GetUserData_p0,0,_emscripten_bind_b2PolygonShape__get_m_radius_p0,0,_emscripten_bind_b2ContactEdge__set_next_p1,0,_emscripten_bind_b2Transform__b2Transform_p2
,0,__ZNK11b2RopeJoint10GetAnchorBEv,0,_emscripten_bind_b2FrictionJointDef__get_maxTorque_p0,0,_emscripten_bind_b2WeldJointDef__set_localAnchorB_p1,0,_emscripten_bind_b2World__GetProxyCount_p0,0,_emscripten_bind_b2WeldJointDef__get_bodyB_p1
,0,_emscripten_bind_b2Vec2__op_mul_p1,0,_emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1,0,_emscripten_bind_b2PolygonShape__set_m_centroid_p1,0,_emscripten_bind_b2WeldJoint__GetAnchorB_p0,0,_emscripten_bind_b2PulleyJointDef__get_collideConnected_p1
,0,_emscripten_bind_b2Vec3____destroy___p0,0,_emscripten_bind_b2Color__set_r_p1,0,_emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0,0,_emscripten_bind_b2BodyDef__get_linearDamping_p0,0,_emscripten_bind_b2EdgeShape__ComputeMass_p2
,0,_emscripten_bind_b2Body__GetInertia_p0,0,_emscripten_bind_b2RayCastCallback__ReportFixture_p4,0,_emscripten_bind_b2Body__Dump_p0,0,_emscripten_bind_b2BodyDef__get_allowSleep_p0,0,_emscripten_bind_b2PrismaticJoint__GetJointTranslation_p0
,0,_emscripten_bind_b2PulleyJoint__GetAnchorB_p0,0,_emscripten_bind_b2PrismaticJoint__GetReactionTorque_p1,0,_emscripten_bind_b2JointDef__set_bodyA_p1,0,_emscripten_bind_b2PrismaticJoint__GetBodyB_p0,0,_emscripten_bind_b2DistanceJoint__GetLocalAnchorA_p0
,0,_emscripten_bind_b2RopeJoint__GetLocalAnchorA_p0,0,_emscripten_bind_b2Rot__set_c_p1,0,_emscripten_bind_b2Vec3__op_mul_p1,0,__ZNK11b2EdgeShape11ComputeAABBEP6b2AABBRK11b2Transformi,0,_emscripten_bind_b2StackAllocator__GetMaxAllocation_p0
,0,_emscripten_bind_b2MouseJoint__SetFrequency_p1,0,_emscripten_bind_b2GearJoint__GetAnchorB_p0,0,_emscripten_bind_b2World__SetAutoClearForces_p1,0,_emscripten_bind_b2Contact__SetEnabled_p1,0,_emscripten_bind_b2ContactManager__get_m_contactFilter_p0
,0,_emscripten_bind_b2BodyDef__get_angularDamping_p0,0,_emscripten_bind_b2WeldJointDef__set_localAnchorA_p1,0,_emscripten_bind_b2DistanceJoint__GetBodyB_p0,0,_emscripten_bind_b2PulleyJointDef__set_lengthB_p1,0,_emscripten_bind_b2FrictionJoint__GetNext_p0
,0,_emscripten_bind_b2PrismaticJoint__GetLocalAnchorB_p0,0,__ZN16b2PolygonContactD0Ev,0,_emscripten_bind_b2RopeJointDef__get_localAnchorB_p0,0,_emscripten_bind_b2Contact__GetChildIndexB_p0,0,_emscripten_bind_b2Fixture__TestPoint_p1
,0,__ZN13b2PulleyJointD1Ev,0,_emscripten_bind_b2FixtureDef__get_shape_p0,0,__ZN13b2PulleyJoint4DumpEv,0,_emscripten_bind_b2WheelJointDef__get_bodyB_p1,0,_emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0
,0,_emscripten_bind_b2BodyDef__set_linearVelocity_p1,0,_emscripten_bind_b2Body__GetMass_p0,0,_emscripten_bind_b2WeldJoint____destroy___p0,0,_emscripten_bind_b2WheelJoint__GetSpringDampingRatio_p0,0,_emscripten_bind_b2RopeJointDef__set_localAnchorB_p1
,0,__ZN17b2RayCastCallbackD0Ev,0,_emscripten_bind_b2Body__IsFixedRotation_p0,0,__ZN15b2FrictionJoint4DumpEv,0,_emscripten_bind_b2Rot__SetIdentity_p0,0,_emscripten_bind_b2WheelJoint__SetSpringDampingRatio_p1
,0,__ZN22b2EdgeAndCircleContact7DestroyEP9b2ContactP16b2BlockAllocator,0,_emscripten_bind_b2Joint__GetBodyA_p0,0,_emscripten_bind_b2FrictionJoint__IsActive_p0,0,_emscripten_bind_b2JointDef__get_userData_p0,0,_emscripten_bind_b2Draw__DrawPolygon_p3
,0,_emscripten_bind_b2MouseJoint__GetBodyB_p0,0,_emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0,0,_emscripten_bind_b2ContactManager__get_m_broadPhase_p0,0,_emscripten_bind_b2RopeJoint__GetReactionTorque_p1,0,__ZN12b2ChainShapeD2Ev
,0,_emscripten_bind_b2PrismaticJoint__GetLowerLimit_p0,0,_emscripten_bind_b2Contact__GetManifold_p0,0,_emscripten_bind_b2Contact__SetFriction_p1,0,_emscripten_bind_b2WheelJoint__GetJointSpeed_p0,0,_emscripten_bind_b2BodyDef__set_allowSleep_p1
,0,_emscripten_bind_b2Fixture__RayCast_p3,0,__ZN15b2ContactFilterD1Ev,0,_emscripten_bind_b2Manifold__get_localPoint_p0,0,__ZN25b2PolygonAndCircleContactD0Ev,0,_emscripten_bind_b2RopeJointDef__set_localAnchorA_p1
,0,_emscripten_bind_b2WheelJoint__SetUserData_p1,0,_emscripten_bind_b2WeldJoint__b2WeldJoint_p1,0,_emscripten_bind_b2WeldJoint__IsActive_p0,0,__ZN13b2CircleShapeD0Ev,0,_emscripten_bind_b2Draw__DrawSolidPolygon_p3
,0,_emscripten_bind_b2ContactManager____destroy___p0,0,_emscripten_bind_b2WeldJoint__GetAnchorA_p0,0,_emscripten_bind_b2ContactListener__PreSolve_p2,0,_emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0,0,_emscripten_bind_b2PolygonShape__get_m_vertexCount_p0
,0,__ZN11b2RopeJoint23InitVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2RevoluteJoint__GetReferenceAngle_p0,0,_emscripten_bind_b2DistanceJointDef__Initialize_p4,0,_emscripten_bind_b2World__IsLocked_p0,0,_emscripten_bind_b2ContactEdge__get_prev_p0
,0,__ZNK13b2CircleShape11ComputeMassEP10b2MassDataf,0,_emscripten_bind_b2Joint__GetReactionForce_p1,0,_emscripten_bind_b2WeldJointDef__get_collideConnected_p1,0,_emscripten_bind_b2DistanceJointDef__set_bodyB_p1,0,_emscripten_bind_b2Draw__AppendFlags_p1
,0,_emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0,0,_emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1,0,_emscripten_bind_b2PrismaticJoint__EnableMotor_p1,0,_emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1,0,_emscripten_bind_b2PrismaticJoint__GetReactionForce_p1
,0,_emscripten_bind_b2DistanceJointDef__get_bodyA_p1,0,_emscripten_bind_b2GearJoint__Dump_p0,0,_emscripten_bind_b2Body__DestroyFixture_p1,0,_emscripten_bind_b2Body__SetActive_p1,0,__ZN15b2QueryCallbackD1Ev
,0,_emscripten_bind_b2ContactListener____destroy___p0,0,__ZNK12b2MouseJoint10GetAnchorAEv,0,_emscripten_bind_b2MouseJoint__SetDampingRatio_p1,0,_emscripten_bind_b2Body__ApplyTorque_p1,0,_emscripten_bind_b2DistanceProxy__GetVertexCount_p0
,0,_emscripten_bind_b2Fixture____destroy___p0,0,_emscripten_bind_b2FixtureDef__set_density_p1,0,_emscripten_bind_b2PulleyJointDef__set_bodyA_p1,0,_emscripten_bind_b2RopeJoint__b2RopeJoint_p1,0,_emscripten_bind_b2FixtureDef__get_filter_p0
,0,__ZN15b2FrictionJoint23InitVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2WheelJoint__GetUserData_p0,0,_emscripten_bind_b2GearJointDef__set_collideConnected_p1,0,_emscripten_bind_b2GearJoint____destroy___p0,0,_emscripten_bind_b2Body__GetAngularVelocity_p0
,0,_emscripten_bind_b2Shape__RayCast_p4,0,_emscripten_bind_b2AABB__get_lowerBound_p0,0,__ZN11b2WeldJointD1Ev,0,_emscripten_bind_b2Fixture__GetFriction_p0,0,_emscripten_bind_b2BroadPhase__MoveProxy_p3
,0,__ZNK12b2ChainShape11ComputeAABBEP6b2AABBRK11b2Transformi,0,__ZNK10__cxxabiv116__shim_type_info5noop1Ev,0,_emscripten_bind_b2RopeJointDef__set_collideConnected_p1,0,_emscripten_bind_b2FrictionJoint__GetBodyB_p0,0,_emscripten_bind_b2RevoluteJoint__IsLimitEnabled_p0
,0,_emscripten_bind_b2FrictionJointDef__set_maxForce_p1,0,_emscripten_bind_b2FrictionJointDef____destroy___p0,0,_emscripten_bind_b2Contact__SetRestitution_p1,0,_emscripten_bind_b2WheelJointDef__get_enableMotor_p0,0,_emscripten_bind_b2RevoluteJointDef__get_bodyB_p1
,0,_emscripten_bind_b2PolygonShape__GetChildCount_p0,0,_emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0,0,_emscripten_bind_b2ContactEdge__set_other_p1,0,_emscripten_bind_b2MouseJoint__SetMaxForce_p1,0,_emscripten_bind_b2Joint__GetNext_p0
,0,_emscripten_bind_b2Manifold__get_pointCount_p0,0,_emscripten_bind_b2RevoluteJoint__GetAnchorA_p0,0,_emscripten_bind_b2Filter__set_groupIndex_p1,0,_emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1,0,_emscripten_bind_b2FrictionJoint__SetMaxForce_p1
,0,__ZN16b2PrismaticJointD1Ev,0,_emscripten_bind_b2MouseJoint__b2MouseJoint_p1,0,_emscripten_bind_b2MouseJoint__Dump_p0,0,_emscripten_bind_b2FixtureDef__set_restitution_p1,0,__ZN23b2ChainAndCircleContact8EvaluateEP10b2ManifoldRK11b2TransformS4_
,0,_emscripten_bind_b2Body__GetJointList_p0,0,__ZN13b2CircleShapeD1Ev,0,_emscripten_bind_b2Timer____destroy___p0,0,_emscripten_bind_b2Vec2__IsValid_p0,0,_emscripten_bind_b2Contact__ResetRestitution_p0
,0,_emscripten_bind_b2RevoluteJointDef__get_collideConnected_p1,0,_emscripten_bind_b2DynamicTree__MoveProxy_p3,0,_emscripten_bind_b2Transform__b2Transform_p0,0,__ZN13b2PulleyJoint24SolvePositionConstraintsERK12b2SolverData,0,_emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0
,0,__ZN15b2CircleContact7DestroyEP9b2ContactP16b2BlockAllocator,0,_emscripten_bind_b2WheelJointDef____destroy___p0,0,_emscripten_bind_b2MouseJoint__GetBodyA_p0,0,_emscripten_bind_b2GearJoint__GetType_p0,0,_emscripten_bind_b2Body__SetMassData_p1
,0,_emscripten_bind_b2MouseJoint__IsActive_p0,0,__ZNK13b2PulleyJoint10GetAnchorBEv,0,_emscripten_bind_b2FrictionJoint__GetAnchorA_p0,0,_emscripten_bind_b2Contact__GetChildIndexA_p0,0,_emscripten_bind_b2Fixture__GetShape_p0
,0,_emscripten_bind_b2DistanceProxy__set_m_radius_p1,0,_emscripten_bind_b2DistanceJointDef__get_bodyB_p1,0,__ZN6b2Draw11DrawPolygonEPK6b2Vec2iRK7b2Color,0,_emscripten_bind_b2World__DestroyJoint_p1,0,__ZN6b2Draw13DrawTransformERK11b2Transform
,0,_emscripten_bind_b2PulleyJointDef__set_ratio_p1,0,_emscripten_bind_b2DynamicTree__b2DynamicTree_p0,0,_emscripten_bind_b2RopeJoint__GetType_p0,0,_emscripten_bind_b2Body__GetLocalPoint_p1,0,_emscripten_bind_b2World__GetBodyCount_p0
,0,_emscripten_bind_b2CircleShape__GetType_p0,0,__ZN21b2DestructionListener10SayGoodbyeEP9b2Fixture,0,_emscripten_bind_b2DistanceProxy__get_m_radius_p0,0,_emscripten_bind_b2World__ClearForces_p0,0,_emscripten_bind_b2DynamicTree____destroy___p0
,0,_emscripten_bind_b2Contact__GetWorldManifold_p1,0,_emscripten_bind_b2DynamicTree__GetUserData_p1,0,__ZN17b2ContactListenerD0Ev,0,_emscripten_bind_b2JointDef____destroy___p0,0,_emscripten_bind_b2GearJoint__IsActive_p0
,0,_emscripten_bind_b2Draw__GetFlags_p0,0,_emscripten_bind_b2RevoluteJoint__GetAnchorB_p0,0,_emscripten_bind_b2DistanceJoint____destroy___p0,0,__ZNK12b2WheelJoint16GetReactionForceEf,0,_emscripten_bind_b2DestructionListener__SayGoodbye_p1
,0,__ZN11b2WeldJointD0Ev,0,__ZN15b2FrictionJointD0Ev,0,_emscripten_bind_b2WheelJoint__IsActive_p0,0,_emscripten_bind_b2EdgeShape____destroy___p0,0,__ZNK12b2WheelJoint10GetAnchorBEv
,0,_emscripten_bind_b2GearJointDef__get_ratio_p0,0,_emscripten_bind_b2BlockAllocator__Clear_p0,0,_emscripten_bind_b2RopeJoint__GetAnchorB_p0,0,__ZN6b2Draw15DrawSolidCircleERK6b2Vec2fS2_RK7b2Color,0,_emscripten_bind_b2WheelJoint__EnableMotor_p1
,0,__ZN24b2ChainAndPolygonContact7DestroyEP9b2ContactP16b2BlockAllocator,0,_emscripten_bind_b2FrictionJoint__GetBodyA_p0,0,_emscripten_bind_b2Joint__GetType_p0,0,_emscripten_bind_b2RopeJoint__GetBodyA_p0,0,__ZN17b2RayCastCallback13ReportFixtureEP9b2FixtureRK6b2Vec2S4_f
,0,_emscripten_bind_b2WheelJointDef__get_bodyA_p1,0,_emscripten_bind_b2RopeJoint__GetAnchorA_p0,0,__ZNK15b2RevoluteJoint16GetReactionForceEf,0,__ZN16b2PrismaticJointD0Ev,0,_emscripten_bind_b2Transform__get_q_p0
,0,__ZN6b2DrawD1Ev,0,_emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0,0,_emscripten_bind_b2ContactListener__PostSolve_p2,0,_emscripten_bind_b2WeldJoint__GetLocalAnchorB_p0,0,_emscripten_bind_b2PolygonShape__set_m_radius_p1
,0,_emscripten_bind_b2Vec2__SetZero_p0,0,_emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0,0,_emscripten_bind_b2ChainShape__CreateLoop_p2,0,_emscripten_bind_b2RevoluteJoint__GetNext_p0,0,_emscripten_bind_b2MouseJoint__GetNext_p0
,0,__ZN11b2RopeJoint24SolveVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2World__DestroyBody_p1,0,_emscripten_bind_b2World__SetSubStepping_p1,0,_emscripten_bind_b2PulleyJoint__SetUserData_p1,0,_emscripten_bind_b2WheelJoint__GetMotorSpeed_p0
,0,_emscripten_bind_b2RopeJoint__GetLimitState_p0,0,__ZNK11b2RopeJoint10GetAnchorAEv,0,_emscripten_bind_b2PrismaticJointDef____destroy___p0,0,_emscripten_bind_b2Body__GetWorld_p0,0,_emscripten_bind_b2PulleyJointDef__set_collideConnected_p1
,0,_emscripten_bind_b2WheelJoint__GetNext_p0,0,_emscripten_bind_b2GearJoint__GetJoint1_p0,0,_emscripten_bind_b2PulleyJoint__GetType_p0,0,__ZN23b2EdgeAndPolygonContactD0Ev,0,_emscripten_bind_b2BroadPhase__GetFatAABB_p1
,0,_emscripten_bind_b2Shape__GetType_p0,0,_emscripten_bind_b2FrictionJoint__SetMaxTorque_p1,0,_emscripten_bind_b2ContactManager__set_m_contactCount_p1,0,_emscripten_bind_b2Body__GetLinearVelocity_p0,0,_emscripten_bind_b2ContactManager__get_m_allocator_p0
,0,_emscripten_bind_b2AABB____destroy___p0,0,_emscripten_bind_b2PulleyJoint__GetCollideConnected_p0,0,_emscripten_bind_b2RopeJoint__GetBodyB_p0,0,_emscripten_bind_b2RevoluteJoint__GetJointAngle_p0,0,_emscripten_bind_b2Rot__GetXAxis_p0
,0,_emscripten_bind_b2ContactManager__get_m_contactCount_p0,0,__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,_emscripten_bind_b2DistanceJoint__Dump_p0,0,__ZN14b2PolygonShapeD1Ev,0,__ZN17b2ContactListenerD1Ev
,0,_emscripten_bind_b2PolygonShape__GetVertexCount_p0,0,_emscripten_bind_b2StackAllocator__Free_p1,0,_emscripten_bind_b2CircleShape__GetSupportVertex_p1,0,_emscripten_bind_b2DistanceProxy__GetSupportVertex_p1,0,_emscripten_bind_b2DistanceJointDef__set_bodyA_p1
,0,__ZNK12b2MouseJoint17GetReactionTorqueEf,0,_emscripten_bind_b2JointDef__set_userData_p1,0,_emscripten_bind_b2RopeJointDef__get_collideConnected_p1,0,_emscripten_bind_b2Vec3__get_z_p0,0,_emscripten_bind_b2RopeJoint__GetUserData_p0
,0,_emscripten_bind_b2GearJoint__GetUserData_p0,0,_emscripten_bind_b2FixtureDef__get_restitution_p0,0,__ZN11b2WeldJoint23InitVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2WheelJoint__GetAnchorB_p0,0,__ZNK13b2CircleShape5CloneEP16b2BlockAllocator
,0,_emscripten_bind_b2FixtureDef__b2FixtureDef_p0,0,__ZN9b2ContactD0Ev,0,_emscripten_bind_b2WheelJointDef__get_motorSpeed_p0,0,_emscripten_bind_b2FrictionJoint__b2FrictionJoint_p1,0,_emscripten_bind_b2Body__GetAngularDamping_p0
,0,_emscripten_bind_b2PrismaticJoint__GetCollideConnected_p0,0,_emscripten_bind_b2ChainShape__SetNextVertex_p1,0,_emscripten_bind_b2Joint__SetUserData_p1,0,_emscripten_bind_b2Fixture__IsSensor_p0,0,_emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0
,0,_emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1,0,__ZNK13b2PulleyJoint10GetAnchorAEv,0,__ZNK11b2GearJoint10GetAnchorAEv,0,_emscripten_bind_b2WheelJointDef__get_localAnchorB_p0,0,_emscripten_bind_b2WheelJointDef__set_bodyB_p1
,0,__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,_emscripten_bind_b2Body__SetType_p1,0,_emscripten_bind_b2BodyDef__get_active_p0,0,_emscripten_bind_b2DynamicTree__GetMaxBalance_p0,0,__ZN25b2PolygonAndCircleContact8EvaluateEP10b2ManifoldRK11b2TransformS4_
,0,_emscripten_bind_b2Timer__Reset_p0,0,_emscripten_bind_b2QueryCallback____destroy___p0,0,__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZN23b2EdgeAndPolygonContactD1Ev,0,_emscripten_bind_b2Vec3__Set_p3
,0,_emscripten_bind_b2PolygonShape__GetVertex_p1,0,__ZNK12b2MouseJoint16GetReactionForceEf,0,_emscripten_bind_b2StackAllocator____destroy___p0,0,_emscripten_bind_b2ContactEdge__get_other_p0,0,_emscripten_bind_b2Fixture__GetType_p0
,0,__ZN12b2WheelJoint23InitVelocityConstraintsERK12b2SolverData,0,__ZN12b2WheelJointD0Ev,0,_emscripten_bind_b2WeldJointDef__set_collideConnected_p1,0,__ZN13b2PulleyJoint24SolveVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0
,0,_emscripten_bind_b2PolygonShape__get_m_centroid_p0,0,_emscripten_bind_b2PrismaticJoint__IsMotorEnabled_p0,0,_emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0,0,_emscripten_bind_b2Draw__SetFlags_p1,0,_emscripten_bind_b2WeldJoint__GetUserData_p0
,0,_emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0,0,_emscripten_bind_b2FrictionJointDef__set_collideConnected_p1,0,_emscripten_bind_b2World__SetAllowSleeping_p1,0,_emscripten_bind_b2BodyDef__set_gravityScale_p1,0,_emscripten_bind_b2Contact__IsTouching_p0
,0,_emscripten_bind_b2Transform__set_q_p1,0,__ZNK11b2GearJoint17GetReactionTorqueEf,0,_emscripten_bind_b2BodyDef__get_fixedRotation_p0,0,_emscripten_bind_b2FrictionJoint__GetAnchorB_p0,0,_emscripten_bind_b2MouseJoint__GetReactionTorque_p1
,0,__ZNK12b2ChainShape7RayCastEP15b2RayCastOutputRK14b2RayCastInputRK11b2Transformi,0,_emscripten_bind_b2WeldJointDef__get_bodyA_p1,0,_emscripten_bind_b2DistanceJoint__GetLength_p0,0,_emscripten_bind_b2Draw__b2Draw_p0,0,_emscripten_bind_b2ChainShape____destroy___p0
,0,_emscripten_bind_b2ChainShape__get_m_radius_p0,0,_emscripten_bind_b2RopeJoint__IsActive_p0,0,_emscripten_bind_b2EdgeShape__set_m_radius_p1,0,_emscripten_bind_b2DistanceJointDef__get_length_p0,0,_emscripten_bind_b2DistanceJoint__SetUserData_p1
,0,_emscripten_bind_b2ContactManager__set_m_contactListener_p1,0,_emscripten_bind_b2PolygonShape__GetType_p0,0,_emscripten_bind_b2PrismaticJoint__GetLocalAxisA_p0,0,__ZNK15b2FrictionJoint10GetAnchorBEv,0,_emscripten_bind_b2MouseJointDef__get_maxForce_p0
,0,_emscripten_bind_b2WheelJoint____destroy___p0,0,__ZN16b2PrismaticJoint24SolvePositionConstraintsERK12b2SolverData,0,_emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0,0,_emscripten_bind_b2DynamicTree__GetHeight_p0,0,_emscripten_bind_b2PulleyJoint__GetBodyA_p0
,0,_emscripten_bind_b2Body__GetMassData_p1,0,_emscripten_bind_b2World__GetGravity_p0,0,_emscripten_bind_b2WheelJointDef__set_bodyA_p1,0,_emscripten_bind_b2AABB__b2AABB_p0,0,__ZNK16b2PrismaticJoint10GetAnchorBEv
,0,_emscripten_bind_b2DistanceProxy____destroy___p0,0,_emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1,0,_emscripten_bind_b2World__GetProfile_p0,0,_emscripten_bind_b2PulleyJointDef__get_bodyA_p1,0,__ZNK11b2WeldJoint10GetAnchorAEv
,0,_emscripten_bind_b2PolygonShape__Clone_p1,0,_emscripten_bind_b2PrismaticJoint__GetUserData_p0,0,_emscripten_bind_b2PrismaticJoint__IsLimitEnabled_p0,0,_emscripten_bind_b2PulleyJoint__GetAnchorA_p0,0,_emscripten_bind_b2Fixture__Refilter_p0
,0,__ZN24b2ChainAndPolygonContactD0Ev,0,__ZN23b2ChainAndCircleContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator,0,_emscripten_bind_b2Vec3__SetZero_p0,0,_emscripten_bind_b2ContactListener__EndContact_p1,0,_emscripten_bind_b2Vec2__Normalize_p0
,0,_emscripten_bind_b2Shape__ComputeMass_p2,0,_emscripten_bind_b2FrictionJoint__GetMaxForce_p0,0,__ZN25b2PolygonAndCircleContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator,0,_emscripten_bind_b2BodyDef__get_type_p0,0,_emscripten_bind_b2WheelJoint__GetMotorTorque_p1
,0,_emscripten_bind_b2AABB__GetCenter_p0,0,_emscripten_bind_b2Contact__ResetFriction_p0,0,_emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1,0,__ZN23b2EdgeAndPolygonContact8EvaluateEP10b2ManifoldRK11b2TransformS4_,0,__ZN11b2GearJoint4DumpEv
,0,_emscripten_bind_b2DistanceJoint__GetCollideConnected_p0,0,_emscripten_bind_b2Rot__Set_p1,0,_emscripten_bind_b2ChainShape__RayCast_p4,0,__ZN23b2EdgeAndPolygonContact7DestroyEP9b2ContactP16b2BlockAllocator,0,_emscripten_bind_b2RevoluteJoint__GetReactionForce_p1
,0,_emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0,0,_emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0,0,__ZN7b2JointD1Ev,0,__ZNK12b2ChainShape13GetChildCountEv,0,_emscripten_bind_b2MouseJoint__GetMaxForce_p0
,0,_emscripten_bind_b2RopeJoint__Dump_p0,0,_emscripten_bind_b2WheelJointDef__set_enableMotor_p1,0,_emscripten_bind_b2ContactManager__get_m_contactList_p0,0,_emscripten_bind_b2PolygonShape__ComputeAABB_p3,0,_emscripten_bind_b2RopeJointDef__set_bodyB_p1
,0,_emscripten_bind_b2BodyDef__set_fixedRotation_p1,0,_emscripten_bind_b2WheelJoint__GetAnchorA_p0,0,__ZN17b2ContactListener8PreSolveEP9b2ContactPK10b2Manifold,0,__ZNK11b2WeldJoint17GetReactionTorqueEf,0,_emscripten_bind_b2CircleShape__b2CircleShape_p0
,0,_emscripten_bind_b2EdgeShape__GetChildCount_p0,0,_emscripten_bind_b2BodyDef__set_active_p1,0,_emscripten_bind_b2FrictionJointDef__get_bodyA_p1,0,_emscripten_bind_b2PulleyJoint__GetReactionTorque_p1,0,_emscripten_bind_b2DistanceJoint__b2DistanceJoint_p1
,0,_emscripten_bind_b2Vec2____destroy___p0,0,_emscripten_bind_b2ChainShape__get_m_vertices_p0,0,_emscripten_bind_b2BodyDef__b2BodyDef_p0,0,_emscripten_bind_b2RevoluteJoint__Dump_p0,0,_emscripten_bind_b2BroadPhase__b2BroadPhase_p0
,0,_emscripten_bind_b2World__SetDebugDraw_p1,0,_emscripten_bind_b2MouseJoint____destroy___p0,0,_emscripten_bind_b2RevoluteJoint__IsMotorEnabled_p0,0,_emscripten_bind_b2MouseJointDef__set_frequencyHz_p1,0,_emscripten_bind_b2DestructionListener__b2DestructionListener_p0
,0,_emscripten_bind_b2WheelJointDef__get_frequencyHz_p0,0,_emscripten_bind_b2Body__GetContactList_p0,0,_emscripten_bind_b2Joint__GetCollideConnected_p0,0,__ZN12b2MouseJoint24SolvePositionConstraintsERK12b2SolverData,0,_emscripten_bind_b2Body__SetBullet_p1
,0,_emscripten_bind_b2Body__GetAngle_p0,0,_emscripten_bind_b2PrismaticJointDef__set_bodyA_p1,0,_emscripten_bind_b2MouseJoint__GetTarget_p0,0,_emscripten_bind_b2Manifold__set_pointCount_p1,0,__ZN14b2PolygonShapeD0Ev
,0,_emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0,0,_emscripten_bind_b2Contact__GetNext_p0,0,_emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1,0,_emscripten_bind_b2Manifold__set_localNormal_p1,0,__ZNK11b2RopeJoint16GetReactionForceEf
,0,_emscripten_bind_b2World__DrawDebugData_p0,0,__ZN10__cxxabiv120__si_class_type_infoD0Ev,0,_emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1,0,__ZNK14b2PolygonShape13GetChildCountEv,0,_emscripten_bind_b2WheelJointDef__get_localAnchorA_p0
,0,_emscripten_bind_b2RevoluteJoint____destroy___p0,0,_emscripten_bind_b2PulleyJointDef__get_lengthB_p0,0,_emscripten_bind_b2WeldJoint__GetReferenceAngle_p0,0,_emscripten_bind_b2FixtureDef__get_friction_p0,0,_emscripten_bind_b2QueryCallback__b2QueryCallback_p0
,0,_emscripten_bind_b2FixtureDef__set_filter_p1,0,_emscripten_bind_b2ChainShape__CreateChain_p2,0,_emscripten_bind_b2Body__GetLocalVector_p1,0,_emscripten_bind_b2Fixture__SetUserData_p1,0,__ZN22b2EdgeAndCircleContactD0Ev
,0,_emscripten_bind_b2RevoluteJoint__GetLocalAnchorB_p0,0,__ZN15b2QueryCallbackD0Ev,0,_emscripten_bind_b2ChainShape__ComputeAABB_p3,0,_emscripten_bind_b2RopeJoint__GetReactionForce_p1,0,_emscripten_bind_b2CircleShape__GetSupport_p1
,0,_emscripten_bind_b2World__GetContinuousPhysics_p0,0,_emscripten_bind_b2ContactManager__set_m_contactFilter_p1,0,__ZN11b2RopeJoint4DumpEv,0,_emscripten_bind_b2Draw____destroy___p0,0,_emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1
,0,_emscripten_bind_b2MouseJoint__GetCollideConnected_p0,0,_emscripten_bind_b2MouseJoint__GetReactionForce_p1,0,_emscripten_bind_b2JointDef__set_type_p1,0,_emscripten_bind_b2Color__Set_p3,0,_emscripten_bind_b2WeldJoint__GetType_p0
,0,_emscripten_bind_b2Joint__GetBodyB_p0,0,_emscripten_bind_b2ContactManager__set_m_broadPhase_p1,0,__ZNK15b2RevoluteJoint10GetAnchorBEv,0,_emscripten_bind_b2BodyDef__set_position_p1,0,_emscripten_bind_b2Vec2__Length_p0
,0,_emscripten_bind_b2MouseJoint__GetUserData_p0,0,__ZNK11b2RopeJoint17GetReactionTorqueEf,0,_emscripten_bind_b2JointDef__get_collideConnected_p0,0,_emscripten_bind_b2BroadPhase__GetTreeQuality_p0,0,_emscripten_bind_b2WheelJointDef__get_dampingRatio_p0
,0,_emscripten_bind_b2RevoluteJointDef__get_bodyA_p1,0,__ZNK14b2PolygonShape5CloneEP16b2BlockAllocator,0,_emscripten_bind_b2FrictionJoint__GetReactionTorque_p1,0,__ZN16b2PrismaticJoint24SolveVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2PulleyJointDef__get_bodyB_p1
,0,__ZNK15b2RevoluteJoint17GetReactionTorqueEf,0,_emscripten_bind_b2EdgeShape__ComputeAABB_p3,0,_emscripten_bind_b2WheelJointDef__set_localAnchorA_p1,0,_emscripten_bind_b2FrictionJointDef__get_bodyB_p1,0,_emscripten_bind_b2PrismaticJoint__SetMotorSpeed_p1
,0,_emscripten_bind_b2PolygonShape__RayCast_p4,0,__ZN24b2ChainAndPolygonContact8EvaluateEP10b2ManifoldRK11b2TransformS4_,0,_emscripten_bind_b2BodyDef__set_type_p1,0,_emscripten_bind_b2GearJoint__GetCollideConnected_p0,0,__ZN12b2MouseJoint23InitVelocityConstraintsERK12b2SolverData
,0,_emscripten_bind_b2CircleShape__ComputeMass_p2,0,_emscripten_bind_b2World__GetAutoClearForces_p0,0,_emscripten_bind_b2Body__SetGravityScale_p1,0,_emscripten_bind_b2MouseJoint__GetFrequency_p0,0,_emscripten_bind_b2Contact__IsEnabled_p0
,0,_emscripten_bind_b2PrismaticJointDef__set_bodyB_p1,0,__ZNK11b2GearJoint10GetAnchorBEv,0,_emscripten_bind_b2FixtureDef__set_userData_p1,0,_emscripten_bind_b2WeldJoint__GetCollideConnected_p0,0,_emscripten_bind_b2Fixture__SetSensor_p1
,0,__ZN22b2EdgeAndCircleContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator,0,_emscripten_bind_b2WeldJointDef__get_localAnchorB_p0,0,_emscripten_bind_b2ContactManager__Destroy_p1,0,_emscripten_bind_b2PrismaticJoint__GetLocalAnchorA_p0,0,_emscripten_bind_b2WheelJointDef__set_motorSpeed_p1
,0,_emscripten_bind_b2Contact__GetRestitution_p0,0,_emscripten_bind_b2Contact__Evaluate_p3,0,_emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1,0,__ZN23b2ChainAndCircleContact7DestroyEP9b2ContactP16b2BlockAllocator,0,_emscripten_bind_b2AABB__Combine_p1
,0,_emscripten_bind_b2WeldJoint__GetReactionForce_p1,0,_emscripten_bind_b2AABB__Combine_p2,0,_emscripten_bind_b2PulleyJointDef__get_lengthA_p0,0,__ZN11b2GearJoint24SolveVelocityConstraintsERK12b2SolverData,0,__ZN15b2CircleContactD1Ev
,0,_emscripten_bind_b2Shape__get_m_radius_p0,0,_emscripten_bind_b2ChainShape__set_m_count_p1,0,_emscripten_bind_b2RopeJointDef__set_bodyA_p1,0,_emscripten_bind_b2DynamicTree__GetFatAABB_p1,0,_emscripten_bind_b2DistanceJoint__GetFrequency_p0
,0,_emscripten_bind_b2PrismaticJoint__SetLimits_p2,0,__ZN15b2CircleContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator,0,_emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0,0,_emscripten_bind_b2Color__get_g_p0,0,_emscripten_bind_b2Fixture__GetBody_p0
,0,_emscripten_bind_b2FrictionJointDef__get_collideConnected_p1,0,__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,_emscripten_bind_b2GearJointDef__get_bodyB_p1,0,_emscripten_bind_b2AABB__set_upperBound_p1,0,__ZN23b2ChainAndCircleContactD1Ev
,0,_emscripten_bind_b2Contact__GetFixtureA_p0,0,_emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1,0,_emscripten_bind_b2RevoluteJoint__GetLowerLimit_p0,0,_emscripten_bind_b2FrictionJointDef__get_maxForce_p0,0,__ZN11b2RopeJointD0Ev
,0,_emscripten_bind_b2Transform__SetIdentity_p0,0,_emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1,0,_emscripten_bind_b2Body__SetTransform_p2,0,_emscripten_bind_b2DistanceJoint__GetReactionTorque_p1,0,__ZN17b2ContactListener10EndContactEP9b2Contact
,0,_emscripten_bind_b2MouseJointDef__set_maxForce_p1,0,_emscripten_bind_b2RevoluteJoint__GetMotorTorque_p1,0,_emscripten_bind_b2EdgeShape__TestPoint_p2,0,__ZN16b2PolygonContact7DestroyEP9b2ContactP16b2BlockAllocator,0,_emscripten_bind_b2Vec2__set_y_p1
,0,_emscripten_bind_b2CircleShape__Clone_p1,0,_emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1,0,_emscripten_bind_b2Rot__GetAngle_p0,0,_emscripten_bind_b2Color____destroy___p0,0,_emscripten_bind_b2WeldJoint__GetBodyA_p0
,0,_emscripten_bind_b2Fixture__GetRestitution_p0,0,_emscripten_bind_b2DistanceJointDef__set_length_p1,0,_emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0,0,_emscripten_bind_b2Color__b2Color_p3,0,_emscripten_bind_b2Body__ApplyForceToCenter_p1
,0,_emscripten_bind_b2PrismaticJoint__SetUserData_p1,0,_emscripten_bind_b2Color__get_r_p0,0,_emscripten_bind_b2RevoluteJoint__b2RevoluteJoint_p1,0,_emscripten_bind_b2RevoluteJoint__GetCollideConnected_p0,0,_emscripten_bind_b2PrismaticJoint__IsActive_p0
,0,_emscripten_bind_b2Body__SetFixedRotation_p1,0,_emscripten_bind_b2RopeJointDef____destroy___p0,0,_emscripten_bind_b2PrismaticJointDef__get_bodyB_p1,0,_emscripten_bind_b2Shape__set_m_radius_p1,0,_emscripten_bind_b2WheelJoint__GetBodyB_p0
,0,_emscripten_bind_b2JointDef__get_bodyA_p0,0,_emscripten_bind_b2World__GetContactCount_p0,0,_emscripten_bind_b2Fixture__b2Fixture_p0,0,_emscripten_bind_b2StackAllocator__Allocate_p1,0,__ZNKSt9bad_alloc4whatEv
,0,_emscripten_bind_b2BodyDef__set_awake_p1,0,_emscripten_bind_b2BroadPhase__CreateProxy_p2,0,_emscripten_bind_b2WheelJoint__GetLocalAnchorA_p0,0,_emscripten_bind_b2FrictionJointDef__set_bodyB_p1,0,_emscripten_bind_b2WheelJoint__SetSpringFrequencyHz_p1
,0,_emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0,0,_emscripten_bind_b2Timer__b2Timer_p0,0,_emscripten_bind_b2Filter____destroy___p0,0,_emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1,0,_emscripten_bind_b2RevoluteJoint__GetType_p0
,0,_emscripten_bind_b2AABB__get_upperBound_p0,0,_emscripten_bind_b2PulleyJoint__Dump_p0,0,_emscripten_bind_b2CircleShape__ComputeAABB_p3,0,_emscripten_bind_b2RopeJointDef__get_localAnchorA_p0,0,_emscripten_bind_b2RevoluteJoint__GetBodyA_p0
,0,_emscripten_bind_b2CircleShape__get_m_radius_p0,0,_emscripten_bind_b2Manifold__get_localNormal_p0,0,_emscripten_bind_b2BodyDef__set_angularVelocity_p1,0,_emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0,0,_emscripten_bind_b2BroadPhase__GetProxyCount_p0
,0,_emscripten_bind_b2WheelJoint__GetReactionTorque_p1,0,__ZN15b2ContactFilterD0Ev,0,_emscripten_bind_b2RevoluteJoint__SetMotorSpeed_p1,0,_emscripten_bind_b2WeldJoint__GetReactionTorque_p1,0,_emscripten_bind_b2GearJoint__SetUserData_p1
,0,_emscripten_bind_b2PrismaticJoint__GetAnchorB_p0,0,_emscripten_bind_b2Manifold__get_type_p0,0,_emscripten_bind_b2MouseJointDef__set_target_p1,0,__Z14b2PairLessThanRK6b2PairS1_,0,_emscripten_bind_b2WeldJoint__GetBodyB_p0
,0,_emscripten_bind_b2PolygonShape__TestPoint_p2,0,_emscripten_bind_b2WheelJointDef__set_localAnchorB_p1,0,__ZN15b2CircleContactD0Ev,0,_emscripten_bind_b2FrictionJointDef__set_bodyA_p1,0,_emscripten_bind_b2Color__b2Color_p0
,0,_emscripten_bind_b2BroadPhase__TestOverlap_p2,0,__ZN11b2WeldJoint24SolveVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1,0,__ZN6b2DrawD0Ev,0,_emscripten_bind_b2RevoluteJoint__GetReactionTorque_p1
,0,_emscripten_bind_b2Joint__GetAnchorB_p0,0,_emscripten_bind_b2CircleShape__set_m_radius_p1,0,_emscripten_bind_b2DistanceProxy__set_m_count_p1,0,_emscripten_bind_b2World__GetContactManager_p0,0,_emscripten_bind_b2RevoluteJoint__SetUserData_p1
,0,_emscripten_bind_b2Contact__GetFixtureB_p0,0,_emscripten_bind_b2Rot__GetYAxis_p0,0,_emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1,0,_emscripten_bind_b2Shape__Clone_p1,0,__ZN11b2RopeJoint24SolvePositionConstraintsERK12b2SolverData
,0,_emscripten_bind_b2AABB__set_lowerBound_p1,0,__ZN23b2ChainAndCircleContactD0Ev,0,_emscripten_bind_b2RopeJoint__GetCollideConnected_p0,0,_emscripten_bind_b2BodyDef__set_linearDamping_p1,0,_emscripten_bind_b2BroadPhase__GetTreeBalance_p0
,0,_emscripten_bind_b2Vec2__LengthSquared_p0,0,_emscripten_bind_b2AABB__GetExtents_p0,0,_emscripten_bind_b2CircleShape____destroy___p0,0,_emscripten_bind_b2FixtureDef__get_userData_p0,0,_emscripten_bind_b2FixtureDef__get_density_p0
,0,_emscripten_bind_b2PrismaticJointDef__Initialize_p4,0,_emscripten_bind_b2Draw__ClearFlags_p1,0,_emscripten_bind_b2WeldJointDef__get_localAnchorA_p0,0,_emscripten_bind_b2BlockAllocator__Free_p2,0,_emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1
,0,_emscripten_bind_b2DynamicTree__GetAreaRatio_p0,0,_emscripten_bind_b2Rot__get_c_p0,0,__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv,0,__ZNK16b2PrismaticJoint17GetReactionTorqueEf,0,_emscripten_bind_b2World__GetTreeHeight_p0
,0,__ZNSt9bad_allocD0Ev,0,_emscripten_bind_b2AABB__IsValid_p0,0,_emscripten_bind_b2PolygonShape__Set_p2,0,_emscripten_bind_b2RopeJointDef__get_bodyB_p1,0,_emscripten_bind_b2World__CreateJoint_p1
,0,_emscripten_bind_b2Color__set_b_p1,0,_emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0,0,_emscripten_bind_b2Body__GetLocalCenter_p0,0,_emscripten_bind_b2WheelJoint__GetLocalAxisA_p0,0,___cxa_pure_virtual
,0,_emscripten_bind_b2WeldJointDef__Initialize_p3,0,_emscripten_bind_b2Contact__GetFriction_p0,0,_emscripten_bind_b2Body__SetAngularVelocity_p1,0,__ZNK12b2MouseJoint10GetAnchorBEv,0,__ZNK13b2CircleShape9TestPointERK11b2TransformRK6b2Vec2
,0,_emscripten_bind_b2CircleShape__TestPoint_p2,0,_emscripten_bind_b2Body__SetAwake_p1,0,_emscripten_bind_b2Filter__set_categoryBits_p1,0,_emscripten_bind_b2ChainShape__ComputeMass_p2,0,_emscripten_bind_b2MouseJointDef__get_collideConnected_p1
,0,_emscripten_bind_b2PrismaticJointDef__get_collideConnected_p1,0,_emscripten_bind_b2World__CreateBody_p1,0,__ZN13b2PulleyJointD0Ev,0,__ZN12b2ChainShapeD0Ev,0,__ZNK16b2PrismaticJoint16GetReactionForceEf
,0,_emscripten_bind_b2JointDef__get_bodyB_p0,0,_emscripten_bind_b2ChainShape__get_m_count_p0,0,_emscripten_bind_b2PrismaticJoint__GetAnchorA_p0,0,_emscripten_bind_b2PulleyJoint__GetRatio_p0,0,_emscripten_bind_b2WheelJointDef__set_localAxisA_p1
,0,_emscripten_bind_b2CircleShape__GetVertex_p1,0,_emscripten_bind_b2WeldJoint__GetNext_p0,0,__ZN11b2GearJoint23InitVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2Timer__GetMilliseconds_p0,0,_emscripten_bind_b2World__SetDestructionListener_p1
,0,_emscripten_bind_b2WheelJointDef__get_localAxisA_p0,0,_emscripten_bind_b2Joint__GetAnchorA_p0,0,__ZNK11b2EdgeShape5CloneEP16b2BlockAllocator,0,_emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0,0,_emscripten_bind_b2BodyDef____destroy___p0
,0,_emscripten_bind_b2Transform____destroy___p0,0,_emscripten_bind_b2PolygonShape__ComputeMass_p2,0,_emscripten_bind_b2RopeJointDef__get_bodyA_p1,0,_emscripten_bind_b2WheelJoint__b2WheelJoint_p1,0,_emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1
,0,_emscripten_bind_b2MouseJointDef__set_dampingRatio_p1,0,_emscripten_bind_b2DistanceJoint__GetType_p0,0,_emscripten_bind_b2MouseJointDef__set_bodyB_p1,0,_emscripten_bind_b2Vec3__set_z_p1,0,_emscripten_bind_b2World____destroy___p0
,0,_emscripten_bind_b2PolygonShape__b2PolygonShape_p0,0,_emscripten_bind_b2WeldJointDef__set_frequencyHz_p1,0,_emscripten_bind_b2Joint__GetUserData_p0,0,_emscripten_bind_b2Body__ResetMassData_p0,0,_emscripten_bind_b2RevoluteJoint__IsActive_p0
,0,_emscripten_bind_b2FrictionJoint__SetUserData_p1,0,_emscripten_bind_b2PulleyJoint__GetReactionForce_p1,0,__ZN22b2EdgeAndCircleContact8EvaluateEP10b2ManifoldRK11b2TransformS4_,0,_emscripten_bind_b2World__SetContinuousPhysics_p1,0,_emscripten_bind_b2ContactManager__FindNewContacts_p0
,0,__ZNK13b2PulleyJoint17GetReactionTorqueEf,0,__ZN12b2WheelJoint24SolvePositionConstraintsERK12b2SolverData,0,_emscripten_bind_b2CircleShape__GetVertexCount_p0,0,__ZNK15b2FrictionJoint16GetReactionForceEf,0,_emscripten_bind_b2WeldJointDef__get_frequencyHz_p0
,0,_emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1,0,_emscripten_bind_b2Body__GetPosition_p0,0,_emscripten_bind_b2ContactListener__BeginContact_p1,0,_emscripten_bind_b2RevoluteJointDef__set_collideConnected_p1,0,_emscripten_bind_b2DistanceJoint__GetAnchorA_p0
,0,_emscripten_bind_b2Fixture__GetUserData_p0,0,_emscripten_bind_b2ChainShape__Clone_p1,0,__ZNK12b2WheelJoint17GetReactionTorqueEf,0,_emscripten_bind_b2GearJoint__GetReactionTorque_p1,0,__ZN23b2EdgeAndPolygonContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator
,0,_emscripten_bind_b2RopeJoint__GetMaxLength_p0,0,__ZN7b2Joint4DumpEv,0,_emscripten_bind_b2ContactEdge__get_contact_p0,0,_emscripten_bind_b2GearJointDef__set_bodyB_p1,0,_emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0
,0,_emscripten_bind_b2RopeJoint____destroy___p0,0,_emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0,0,_emscripten_bind_b2DistanceJoint__SetFrequency_p1,0,_emscripten_bind_b2PulleyJointDef__set_lengthA_p1,0,__ZNK15b2FrictionJoint10GetAnchorAEv
,0,__ZN15b2FrictionJoint24SolvePositionConstraintsERK12b2SolverData,0,_emscripten_bind_b2ContactEdge__get_next_p0,0,_emscripten_bind_b2RevoluteJoint__GetBodyB_p0,0,__ZN6b2Draw16DrawSolidPolygonEPK6b2Vec2iRK7b2Color,0,_emscripten_bind_b2RevoluteJoint__GetUserData_p0
,0,_emscripten_bind_b2Body__GetType_p0,0,_emscripten_bind_b2World__Step_p3,0,_emscripten_bind_b2Vec2__set_x_p1,0,_emscripten_bind_b2Fixture__SetFriction_p1,0,_emscripten_bind_b2RopeJoint__GetNext_p0
,0,_emscripten_bind_b2WeldJoint__SetDampingRatio_p1,0,_emscripten_bind_b2GearJoint__GetAnchorA_p0,0,__ZN15b2FrictionJoint24SolveVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2MouseJointDef____destroy___p0,0,_emscripten_bind_b2Body__GetTransform_p0
,0,_emscripten_bind_b2PrismaticJoint__b2PrismaticJoint_p1,0,_emscripten_bind_b2RopeJointDef__get_maxLength_p0,0,_emscripten_bind_b2DistanceJoint__GetAnchorB_p0,0,_emscripten_bind_b2ChainShape__set_m_vertices_p1,0,__ZNK15b2RevoluteJoint10GetAnchorAEv
,0,_emscripten_bind_b2FrictionJoint__GetMaxTorque_p0,0,_emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0,0,_emscripten_bind_b2ContactManager__AddPair_p2,0,_emscripten_bind_b2Color__set_g_p1,0,_emscripten_bind_b2WheelJoint__IsMotorEnabled_p0
,0,__ZN15b2RevoluteJoint23InitVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2WheelJointDef__get_collideConnected_p1,0,__ZNK14b2PolygonShape11ComputeAABBEP6b2AABBRK11b2Transformi,0,_emscripten_bind_b2FrictionJoint__Dump_p0,0,_emscripten_bind_b2ChainShape__SetPrevVertex_p1
,0,_emscripten_bind_b2Fixture__SetFilterData_p1,0,_emscripten_bind_b2AABB__GetPerimeter_p0,0,__ZNK15b2DistanceJoint10GetAnchorBEv,0,_emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1,0,_emscripten_bind_b2Fixture__SetDensity_p1
,0,_emscripten_bind_b2MouseJointDef__set_bodyA_p1,0,__ZN12b2MouseJoint24SolveVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2World__QueryAABB_p2,0,__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,_emscripten_bind_b2RevoluteJoint__GetUpperLimit_p0
,0,_emscripten_bind_b2PrismaticJoint__GetJointSpeed_p0,0,_emscripten_bind_b2PulleyJointDef__Initialize_p7,0,_emscripten_bind_b2World__GetTreeQuality_p0,0,_emscripten_bind_b2DistanceJoint__GetBodyA_p0,0,_emscripten_bind_b2BroadPhase__DestroyProxy_p1
,0,_emscripten_bind_b2PulleyJoint____destroy___p0,0,__ZN6b2Draw11DrawSegmentERK6b2Vec2S2_RK7b2Color,0,_emscripten_bind_b2DistanceJoint__GetLocalAnchorB_p0,0,__ZN11b2RopeJointD1Ev,0,_emscripten_bind_b2ChainShape__GetChildEdge_p2
,0,__ZN10__cxxabiv116__shim_type_infoD2Ev,0,_emscripten_bind_b2EdgeShape__b2EdgeShape_p0,0,_emscripten_bind_b2ContactEdge__set_contact_p1,0,__ZN15b2ContactFilter13ShouldCollideEP9b2FixtureS1_,0,_emscripten_bind_b2GearJointDef__get_collideConnected_p1
,0,_emscripten_bind_b2ChainShape__GetType_p0,0,_emscripten_bind_b2GearJoint__GetBodyA_p0,0,_emscripten_bind_b2WheelJoint__GetCollideConnected_p0,0,__ZNK10__cxxabiv116__shim_type_info5noop2Ev,0,_emscripten_bind_b2Body__ApplyAngularImpulse_p1
,0,_emscripten_bind_b2RevoluteJoint__SetLimits_p2,0,_emscripten_bind_b2ChainShape__TestPoint_p2,0,_emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0,0,_emscripten_bind_b2CircleShape__get_m_p_p0,0,_emscripten_bind_b2BodyDef__get_awake_p0
,0,_emscripten_bind_b2MouseJoint__GetAnchorB_p0,0,__ZN12b2MouseJoint4DumpEv,0,_emscripten_bind_b2PrismaticJoint__GetUpperLimit_p0,0,_emscripten_bind_b2Body__CreateFixture_p1,0,_emscripten_bind_b2Body__CreateFixture_p2
,0,__ZN25b2PolygonAndCircleContact7DestroyEP9b2ContactP16b2BlockAllocator,0,_emscripten_bind_b2Fixture__GetDensity_p0,0,__ZN12b2WheelJoint24SolveVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2WeldJoint__GetDampingRatio_p0,0,_emscripten_bind_b2FrictionJoint__GetReactionForce_p1
,0,_emscripten_bind_b2PolygonShape__set_m_vertexCount_p1,0,_emscripten_bind_b2World__SetContactListener_p1,0,_emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0,0,_emscripten_bind_b2FixtureDef__set_shape_p1,0,_emscripten_bind_b2DistanceJoint__SetDampingRatio_p1
,0,__ZNK12b2ChainShape5CloneEP16b2BlockAllocator,0,_emscripten_bind_b2Joint__Dump_p0,0,_emscripten_bind_b2Body__GetWorldCenter_p0,0,_emscripten_bind_b2Shape__TestPoint_p2,0,__ZN24b2ChainAndPolygonContactD1Ev
,0,_emscripten_bind_b2RopeJointDef__set_maxLength_p1,0,_emscripten_bind_b2RopeJoint__SetUserData_p1,0,__ZN15b2CircleContact8EvaluateEP10b2ManifoldRK11b2TransformS4_,0,_emscripten_bind_b2Transform__get_p_p0,0,_emscripten_bind_b2PulleyJoint__GetLengthA_p0
,0,_emscripten_bind_b2GearJoint__GetJoint2_p0,0,__ZNK14b2PolygonShape11ComputeMassEP10b2MassDataf,0,_emscripten_bind_b2Fixture__GetMassData_p1,0,_emscripten_bind_b2Body__IsBullet_p0,0,__ZN17b2ContactListener12BeginContactEP9b2Contact
,0,_emscripten_bind_b2WeldJointDef____destroy___p0,0,_emscripten_bind_b2PrismaticJoint__GetMotorSpeed_p0,0,_emscripten_bind_b2GearJointDef__get_bodyA_p1,0,_emscripten_bind_b2Draw__DrawCircle_p3,0,_emscripten_bind_b2FrictionJoint__GetLocalAnchorA_p0
,0,_emscripten_bind_b2Body__GetWorldPoint_p1,0,_emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1,0,_emscripten_bind_b2FixtureDef__set_friction_p1,0,_emscripten_bind_b2GearJointDef__set_bodyA_p1,0,__ZN15b2RevoluteJoint24SolvePositionConstraintsERK12b2SolverData
,0,_emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1,0,__ZN15b2FrictionJointD1Ev,0,_emscripten_bind_b2BodyDef__get_angularVelocity_p0,0,__ZN16b2PolygonContact8EvaluateEP10b2ManifoldRK11b2TransformS4_,0,_emscripten_bind_b2GearJoint__GetNext_p0
,0,_emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0,0,_emscripten_bind_b2Vec2__b2Vec2_p0,0,_emscripten_bind_b2Body__GetFixtureList_p0,0,__ZN16b2PolygonContactD1Ev,0,_emscripten_bind_b2WheelJoint__GetJointTranslation_p0
,0,_emscripten_bind_b2WeldJointDef__get_dampingRatio_p0,0,_emscripten_bind_b2RopeJoint__SetMaxLength_p1,0,_emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0,0,_emscripten_bind_b2PulleyJoint__GetGroundAnchorB_p0,0,_emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0
,0,_emscripten_bind_b2GearJointDef__set_joint2_p1,0,_emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0,0,__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,_emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0,0,_emscripten_bind_b2MouseJoint__SetTarget_p1
,0,_emscripten_bind_b2ContactEdge__set_prev_p1,0,_emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0,0,_emscripten_bind_b2ChainShape__set_m_radius_p1,0,_emscripten_bind_b2Vec2__get_x_p0,0,_emscripten_bind_b2BodyDef__set_userData_p1
,0,_emscripten_bind_b2DistanceProxy__GetSupport_p1,0,__ZN11b2WeldJoint4DumpEv,0,_emscripten_bind_b2WheelJoint__GetLocalAnchorB_p0,0,_emscripten_bind_b2GearJointDef__get_joint2_p0,0,_emscripten_bind_b2PrismaticJointDef__set_collideConnected_p1
,0,_emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1,0,_emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1,0,__ZN21b2DestructionListener10SayGoodbyeEP7b2Joint,0,_emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1,0,_emscripten_bind_b2Body__IsAwake_p0
,0,_emscripten_bind_b2MouseJoint__GetAnchorA_p0,0,_emscripten_bind_b2World__RayCast_p3,0,__ZNK14b2PolygonShape9TestPointERK11b2TransformRK6b2Vec2,0,__ZN15b2RevoluteJoint24SolveVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2PolygonShape__SetAsBox_p4
,0,_emscripten_bind_b2PolygonShape__SetAsBox_p2,0,__ZN15b2DistanceJoint4DumpEv,0,_emscripten_bind_b2GearJointDef__set_joint1_p1,0,_emscripten_bind_b2Draw__DrawSolidCircle_p4,0,_emscripten_bind_b2World__GetSubStepping_p0
,0,_emscripten_bind_b2FrictionJoint__GetLocalAnchorB_p0,0,_emscripten_bind_b2Body__SetLinearDamping_p1,0,_emscripten_bind_b2Body__GetWorldVector_p1,0,_emscripten_bind_b2Filter__get_groupIndex_p0,0,_emscripten_bind_b2FixtureDef__get_isSensor_p0
,0,__ZN17b2RayCastCallbackD1Ev,0,_emscripten_bind_b2PrismaticJoint__Dump_p0,0,__ZN6b2Draw10DrawCircleERK6b2Vec2fRK7b2Color,0,_emscripten_bind_b2DistanceProxy__Set_p2,0,_emscripten_bind_b2EdgeShape__Set_p2
,0,__ZN11b2GearJointD1Ev,0,_emscripten_bind_b2BodyDef__get_userData_p0,0,_emscripten_bind_b2Body__ApplyForce_p2,0,_emscripten_bind_b2CircleShape__set_m_p_p1,0,__ZNK13b2CircleShape7RayCastEP15b2RayCastOutputRK14b2RayCastInputRK11b2Transformi
,0,_emscripten_bind_b2WheelJoint__GetMaxMotorTorque_p0,0,_emscripten_bind_b2World__SetContactFilter_p1,0,__ZN17b2ContactListener9PostSolveEP9b2ContactPK16b2ContactImpulse,0,_emscripten_bind_b2WheelJointDef__set_dampingRatio_p1,0,_emscripten_bind_b2RevoluteJoint__EnableMotor_p1
,0,_emscripten_bind_b2DistanceJointDef__set_collideConnected_p1,0,_emscripten_bind_b2WeldJoint__Dump_p0,0,_emscripten_bind_b2DistanceProxy__get_m_count_p0,0,_emscripten_bind_b2WeldJointDef__set_dampingRatio_p1,0,_emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1
,0,_emscripten_bind_b2DistanceJoint__IsActive_p0,0,__ZN15b2QueryCallback13ReportFixtureEP9b2Fixture,0,_emscripten_bind_b2FrictionJoint__GetCollideConnected_p0,0,_emscripten_bind_b2Manifold__b2Manifold_p0,0,_emscripten_bind_b2WheelJoint__Dump_p0
,0,_emscripten_bind_b2World__GetTreeBalance_p0,0,_emscripten_bind_b2WheelJoint__SetMotorSpeed_p1,0,_emscripten_bind_b2ContactListener__b2ContactListener_p0,0,_emscripten_bind_b2Rot____destroy___p0,0,_emscripten_bind_b2PrismaticJoint__GetMaxMotorForce_p0
,0,_emscripten_bind_b2PulleyJointDef__set_bodyB_p1,0,__ZNK11b2EdgeShape9TestPointERK11b2TransformRK6b2Vec2,0,_emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0,0,_emscripten_bind_b2RevoluteJoint__GetMotorSpeed_p0,0,_emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0
,0,_emscripten_bind_b2Body__GetNext_p0,0,_emscripten_bind_b2BroadPhase__GetTreeHeight_p0,0,_emscripten_bind_b2Draw__DrawSegment_p3,0,__ZN12b2WheelJoint4DumpEv,0,_emscripten_bind_b2Body__IsActive_p0
,0,_emscripten_bind_b2Vec2__Set_p2,0,_emscripten_bind_b2PulleyJoint__GetUserData_p0,0,_emscripten_bind_b2ContactEdge__b2ContactEdge_p0,0,_emscripten_bind_b2Vec3__b2Vec3_p3,0,_emscripten_bind_b2Vec3__b2Vec3_p0
,0,_emscripten_bind_b2PulleyJoint__GetGroundAnchorA_p0,0,__ZNK11b2EdgeShape13GetChildCountEv,0,_emscripten_bind_b2JointDef__b2JointDef_p0,0,__ZNK13b2CircleShape13GetChildCountEv,0,_emscripten_bind_b2PulleyJoint__GetBodyB_p0
,0,_emscripten_bind_b2PulleyJointDef____destroy___p0,0,_emscripten_bind_b2FixtureDef____destroy___p0,0,_emscripten_bind_b2EdgeShape__Clone_p1,0,_emscripten_bind_b2Body__GetUserData_p0,0,_emscripten_bind_b2Body__SetUserData_p1
,0,__ZNK11b2WeldJoint10GetAnchorBEv,0,_emscripten_bind_b2PrismaticJointDef__get_bodyA_p1,0,__ZN22b2EdgeAndCircleContactD1Ev,0,_emscripten_bind_b2FrictionJoint__GetType_p0,0,_emscripten_bind_b2DistanceJointDef____destroy___p0
,0,_emscripten_bind_b2FrictionJointDef__Initialize_p3,0,__ZNK11b2WeldJoint16GetReactionForceEf,0,_emscripten_bind_b2GearJoint__b2GearJoint_p1,0,_emscripten_bind_b2Body__SetSleepingAllowed_p1,0,_emscripten_bind_b2Body__SetLinearVelocity_p1
,0,_emscripten_bind_b2Body__ApplyLinearImpulse_p2,0,_emscripten_bind_b2PulleyJoint__b2PulleyJoint_p1,0,_emscripten_bind_b2MouseJointDef__get_bodyB_p1,0,_emscripten_bind_b2ContactManager__set_m_contactList_p1,0,__ZNK15b2DistanceJoint16GetReactionForceEf
,0,__ZN11b2GearJoint24SolvePositionConstraintsERK12b2SolverData,0,_emscripten_bind_b2DistanceJointDef__get_collideConnected_p1,0,_emscripten_bind_b2WeldJointDef__set_bodyB_p1,0,_emscripten_bind_b2DistanceJoint__GetReactionForce_p1,0,_emscripten_bind_b2FrictionJointDef__set_maxTorque_p1
,0,__ZNK15b2FrictionJoint17GetReactionTorqueEf,0,_emscripten_bind_b2FrictionJoint____destroy___p0,0,__ZN12b2MouseJointD1Ev,0,_emscripten_bind_b2JointDef__set_collideConnected_p1,0,__ZNK12b2ChainShape9TestPointERK11b2TransformRK6b2Vec2
,0,_emscripten_bind_b2QueryCallback__ReportFixture_p1,0,_emscripten_bind_b2GearJoint__GetRatio_p0,0,_emscripten_bind_b2BlockAllocator__Allocate_p1,0,_emscripten_bind_b2GearJointDef__get_joint1_p0,0,_emscripten_bind_b2AABB__Contains_p1
,0,_emscripten_bind_b2GearJointDef__set_ratio_p1,0,_emscripten_bind_b2ContactEdge____destroy___p0,0,_emscripten_bind_b2RevoluteJointDef__Initialize_p3,0,_emscripten_bind_b2BodyDef__set_angle_p1,0,_emscripten_bind_b2Draw__DrawTransform_p1
,0,__ZN15b2DistanceJoint24SolvePositionConstraintsERK12b2SolverData,0,_emscripten_bind_b2Vec2__op_sub_p0,0,__ZN15b2DistanceJoint24SolveVelocityConstraintsERK12b2SolverData,0,_emscripten_bind_b2BodyDef__set_bullet_p1,0,__ZNK13b2PulleyJoint16GetReactionForceEf
,0,__ZN10__cxxabiv117__class_type_infoD0Ev,0,_emscripten_bind_b2PulleyJointDef__get_ratio_p0,0,_emscripten_bind_b2GearJoint__GetReactionForce_p1,0,__ZN15b2DistanceJointD1Ev,0,_emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1
,0,_emscripten_bind_b2Shape__GetChildCount_p0,0,_emscripten_bind_b2GearJoint__GetBodyB_p0,0,_emscripten_bind_b2BodyDef__set_angularDamping_p1,0,_emscripten_bind_b2ChainShape__GetChildCount_p0,0,_emscripten_bind_b2MouseJointDef__set_collideConnected_p1
,0,_emscripten_bind_b2Shape__ComputeAABB_p3,0,_emscripten_bind_b2Joint__GetReactionTorque_p1,0,_emscripten_bind_b2WheelJoint__GetType_p0,0,_emscripten_bind_b2Filter__get_categoryBits_p0,0,_emscripten_bind_b2World__GetJointList_p0
,0,__ZNK11b2EdgeShape7RayCastEP15b2RayCastOutputRK14b2RayCastInputRK11b2Transformi,0,__ZNK15b2DistanceJoint10GetAnchorAEv,0,__ZNK15b2DistanceJoint17GetReactionTorqueEf,0,_emscripten_bind_b2CircleShape__GetChildCount_p0,0,_emscripten_bind_b2Transform__set_p_p1
,0,__ZN11b2WeldJoint24SolvePositionConstraintsERK12b2SolverData,0,_emscripten_bind_b2DistanceProxy__GetVertex_p1,0,_emscripten_bind_b2Color__get_b_p0,0,_emscripten_bind_b2World__SetWarmStarting_p1,0,_emscripten_bind_b2Vec3__op_sub_p0
,0,_emscripten_bind_b2ContactManager__Collide_p0,0,__ZNK12b2WheelJoint10GetAnchorAEv,0,_emscripten_bind_b2GearJointDef__b2GearJointDef_p0,0,_emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0,0,_emscripten_bind_b2ContactManager__get_m_contactListener_p0
,0,_emscripten_bind_b2AABB__RayCast_p2,0,_emscripten_bind_b2Manifold__set_localPoint_p1,0,__ZN15b2RevoluteJointD0Ev,0,_emscripten_bind_b2WeldJoint__SetFrequency_p1,0,_emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1
,0,_emscripten_bind_b2World__b2World_p1,0,_emscripten_bind_b2EdgeShape__GetType_p0,0,_emscripten_bind_b2BodyDef__get_gravityScale_p0,0,_emscripten_bind_b2DistanceProxy__set_m_vertices_p1,0,_emscripten_bind_b2RevoluteJoint__SetMaxMotorTorque_p1
,0,_emscripten_bind_b2MouseJointDef__get_bodyA_p1,0,__ZN16b2PolygonContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator,0,__ZNK11b2EdgeShape11ComputeMassEP10b2MassDataf,0,_emscripten_bind_b2WeldJointDef__set_referenceAngle_p1,0,_emscripten_bind_b2Vec3__op_add_p1
,0,_emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0,0,__ZN24b2ChainAndPolygonContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator,0,_emscripten_bind_b2GearJoint__SetRatio_p1,0,_emscripten_bind_b2BodyDef__get_angle_p0,0,__ZN21b2DestructionListenerD1Ev,0,_emscripten_bind_b2PrismaticJoint__GetReferenceAngle_p0,0,__ZN12b2MouseJointD0Ev,0,_emscripten_bind_b2WeldJointDef__set_bodyA_p1,0,_emscripten_bind_b2PulleyJoint__GetLengthB_p0,0];
// EMSCRIPTEN_START_FUNCS
function __ZN12b2BroadPhaseC2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=r1>>2;HEAP32[r2]=-1;r3=(r1+12|0)>>2;HEAP32[r3]=16;HEAP32[r2+2]=0;r4=_malloc(576);r5=(r1+4|0)>>2;HEAP32[r5]=r4;_memset(r4,0,HEAP32[r3]*36&-1);r4=HEAP32[r3]-1|0;L1:do{if((r4|0)>0){r6=0;while(1){r7=r6+1|0;HEAP32[HEAP32[r5]+(r6*36&-1)+20>>2]=r7;HEAP32[HEAP32[r5]+(r6*36&-1)+32>>2]=-1;r8=HEAP32[r3]-1|0;if((r7|0)<(r8|0)){r6=r7}else{r9=r8;break L1}}}else{r9=r4}}while(0);HEAP32[HEAP32[r5]+(r9*36&-1)+20>>2]=-1;HEAP32[HEAP32[r5]+((HEAP32[r3]-1)*36&-1)+32>>2]=-1;r3=(r1+16|0)>>2;HEAP32[r3]=0;HEAP32[r3+1]=0;HEAP32[r3+2]=0;HEAP32[r3+3]=0;HEAP32[r2+12]=16;HEAP32[r2+13]=0;HEAP32[r2+11]=_malloc(192);HEAP32[r2+9]=16;HEAP32[r2+10]=0;HEAP32[r2+8]=_malloc(64);return}function __ZN12b2BroadPhase11CreateProxyERK6b2AABBPv(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r4=r1|0;r5=__ZN13b2DynamicTree12AllocateNodeEv(r4);r6=(r1+4|0)>>2;r7=HEAPF32[r2+4>>2]-.10000000149011612;r8=HEAP32[r6]+(r5*36&-1)|0;r9=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r2>>2]-.10000000149011612,HEAP32[tempDoublePtr>>2]);r10=(HEAPF32[tempDoublePtr>>2]=r7,HEAP32[tempDoublePtr>>2])|0;HEAP32[r8>>2]=0|r9;HEAP32[r8+4>>2]=r10;r10=HEAPF32[r2+12>>2]+.10000000149011612;r8=HEAP32[r6]+(r5*36&-1)+8|0;r9=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r2+8>>2]+.10000000149011612,HEAP32[tempDoublePtr>>2]);r2=(HEAPF32[tempDoublePtr>>2]=r10,HEAP32[tempDoublePtr>>2])|0;HEAP32[r8>>2]=0|r9;HEAP32[r8+4>>2]=r2;HEAP32[HEAP32[r6]+(r5*36&-1)+16>>2]=r3;HEAP32[HEAP32[r6]+(r5*36&-1)+32>>2]=0;__ZN13b2DynamicTree10InsertLeafEi(r4,r5);r4=r1+28|0;HEAP32[r4>>2]=HEAP32[r4>>2]+1|0;r4=(r1+40|0)>>2;r6=HEAP32[r4];r3=r1+36|0;r2=(r1+32|0)>>2;if((r6|0)!=(HEAP32[r3>>2]|0)){r11=r6;r12=HEAP32[r2];r13=(r11<<2)+r12|0;HEAP32[r13>>2]=r5;r14=HEAP32[r4];r15=r14+1|0;HEAP32[r4]=r15;return r5}r1=HEAP32[r2];HEAP32[r3>>2]=r6<<1;r3=_malloc(r6<<3);HEAP32[r2]=r3;r6=r1;_memcpy(r3,r6,HEAP32[r4]<<2);_free(r6);r11=HEAP32[r4];r12=HEAP32[r2];r13=(r11<<2)+r12|0;HEAP32[r13>>2]=r5;r14=HEAP32[r4];r15=r14+1|0;HEAP32[r4]=r15;return r5}function __Z25b2CollidePolygonAndCircleP10b2ManifoldPK14b2PolygonShapeRK11b2TransformPK13b2CircleShapeS6_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r6=r2>>2;r7=r1>>2;r8=0;r9=(r1+60|0)>>2;HEAP32[r9]=0;r10=r4+12|0;r11=HEAPF32[r5+12>>2];r12=HEAPF32[r10>>2];r13=HEAPF32[r5+8>>2];r14=HEAPF32[r4+16>>2];r15=HEAPF32[r5>>2]+(r11*r12-r13*r14)-HEAPF32[r3>>2];r16=r12*r13+r11*r14+HEAPF32[r5+4>>2]-HEAPF32[r3+4>>2];r5=HEAPF32[r3+12>>2];r14=HEAPF32[r3+8>>2];r3=r15*r5+r16*r14;r11=r5*r16+r15*-r14;r14=HEAPF32[r6+2]+HEAPF32[r4+8>>2];r4=HEAP32[r6+37];do{if((r4|0)>0){r15=0;r16=-3.4028234663852886e+38;r5=0;while(1){r13=(r3-HEAPF32[((r15<<3)+20>>2)+r6])*HEAPF32[((r15<<3)+84>>2)+r6]+(r11-HEAPF32[((r15<<3)+24>>2)+r6])*HEAPF32[((r15<<3)+88>>2)+r6];if(r13>r14){r8=28;break}r12=r13>r16;r17=r12?r13:r16;r18=r12?r15:r5;r12=r15+1|0;if((r12|0)<(r4|0)){r15=r12;r16=r17;r5=r18}else{r8=12;break}}if(r8==12){r19=r17<1.1920928955078125e-7;r20=r18;break}else if(r8==28){return}}else{r19=1;r20=0}}while(0);r8=r20+1|0;r18=(r20<<3)+r2+20|0;r17=HEAP32[r18>>2];r5=HEAP32[r18+4>>2];r18=(HEAP32[tempDoublePtr>>2]=r17,HEAPF32[tempDoublePtr>>2]);r16=r5;r15=(HEAP32[tempDoublePtr>>2]=r16,HEAPF32[tempDoublePtr>>2]);r12=(((r8|0)<(r4|0)?r8:0)<<3)+r2+20|0;r8=HEAP32[r12>>2];r4=HEAP32[r12+4>>2];r12=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r13=r4;r21=(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);if(r19){HEAP32[r9]=1;HEAP32[r7+14]=1;r19=(r20<<3)+r2+84|0;r22=r1+40|0;r23=HEAP32[r19+4>>2];HEAP32[r22>>2]=HEAP32[r19>>2];HEAP32[r22+4>>2]=r23;r23=r1+48|0;r22=(HEAPF32[tempDoublePtr>>2]=(r18+r12)*.5,HEAP32[tempDoublePtr>>2]);r19=(HEAPF32[tempDoublePtr>>2]=(r15+r21)*.5,HEAP32[tempDoublePtr>>2])|0;HEAP32[r23>>2]=0|r22;HEAP32[r23+4>>2]=r19;r19=r10;r23=r1;r22=HEAP32[r19+4>>2];HEAP32[r23>>2]=HEAP32[r19>>2];HEAP32[r23+4>>2]=r22;HEAP32[r7+4]=0;return}r22=r3-r18;r23=r11-r15;r19=r3-r12;r24=r11-r21;if(r22*(r12-r18)+r23*(r21-r15)<=0){if(r22*r22+r23*r23>r14*r14){return}HEAP32[r9]=1;HEAP32[r7+14]=1;r25=r1+40|0;r26=r25;r27=(HEAPF32[tempDoublePtr>>2]=r22,HEAP32[tempDoublePtr>>2]);r28=(HEAPF32[tempDoublePtr>>2]=r23,HEAP32[tempDoublePtr>>2])|0;HEAP32[r26>>2]=0|r27;HEAP32[r26+4>>2]=r28;r28=Math.sqrt(r22*r22+r23*r23);if(r28>=1.1920928955078125e-7){r26=1/r28;HEAPF32[r25>>2]=r22*r26;HEAPF32[r7+11]=r23*r26}r26=r1+48|0;HEAP32[r26>>2]=0|r17&-1;HEAP32[r26+4>>2]=r16|r5&0;r5=r10;r16=r1;r26=HEAP32[r5+4>>2];HEAP32[r16>>2]=HEAP32[r5>>2];HEAP32[r16+4>>2]=r26;HEAP32[r7+4]=0;return}if(r19*(r18-r12)+r24*(r15-r21)>0){r26=(r18+r12)*.5;r12=(r15+r21)*.5;r21=(r20<<3)+r2+84|0;if((r3-r26)*HEAPF32[r21>>2]+(r11-r12)*HEAPF32[((r20<<3)+88>>2)+r6]>r14){return}HEAP32[r9]=1;HEAP32[r7+14]=1;r6=r21;r21=r1+40|0;r20=HEAP32[r6+4>>2];HEAP32[r21>>2]=HEAP32[r6>>2];HEAP32[r21+4>>2]=r20;r20=r1+48|0;r21=(HEAPF32[tempDoublePtr>>2]=r26,HEAP32[tempDoublePtr>>2]);r26=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2])|0;HEAP32[r20>>2]=0|r21;HEAP32[r20+4>>2]=r26;r26=r10;r20=r1;r21=HEAP32[r26+4>>2];HEAP32[r20>>2]=HEAP32[r26>>2];HEAP32[r20+4>>2]=r21;HEAP32[r7+4]=0;return}if(r19*r19+r24*r24>r14*r14){return}HEAP32[r9]=1;HEAP32[r7+14]=1;r9=r1+40|0;r14=r9;r21=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2]);r20=(HEAPF32[tempDoublePtr>>2]=r24,HEAP32[tempDoublePtr>>2])|0;HEAP32[r14>>2]=0|r21;HEAP32[r14+4>>2]=r20;r20=Math.sqrt(r19*r19+r24*r24);if(r20>=1.1920928955078125e-7){r14=1/r20;HEAPF32[r9>>2]=r19*r14;HEAPF32[r7+11]=r24*r14}r14=r1+48|0;HEAP32[r14>>2]=0|r8&-1;HEAP32[r14+4>>2]=r13|r4&0;r4=r10;r10=r1;r1=HEAP32[r4+4>>2];HEAP32[r10>>2]=HEAP32[r4>>2];HEAP32[r10+4>>2]=r1;HEAP32[r7+4]=0;return}function __Z22b2CollideEdgeAndCircleP10b2ManifoldPK11b2EdgeShapeRK11b2TransformPK13b2CircleShapeS6_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r6=r1>>2;r7=(r1+60|0)>>2;HEAP32[r7]=0;r8=r4+12|0;r9=HEAPF32[r5+12>>2];r10=HEAPF32[r8>>2];r11=HEAPF32[r5+8>>2];r12=HEAPF32[r4+16>>2];r13=HEAPF32[r5>>2]+(r9*r10-r11*r12)-HEAPF32[r3>>2];r14=r10*r11+r9*r12+HEAPF32[r5+4>>2]-HEAPF32[r3+4>>2];r5=HEAPF32[r3+12>>2];r12=HEAPF32[r3+8>>2];r3=r13*r5+r14*r12;r9=r5*r14+r13*-r12;r12=r2+12|0;r13=HEAP32[r12>>2];r14=HEAP32[r12+4>>2];r12=(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r5=r14;r11=(HEAP32[tempDoublePtr>>2]=r5,HEAPF32[tempDoublePtr>>2]);r10=r2+20|0;r15=HEAP32[r10>>2];r16=HEAP32[r10+4>>2];r10=(HEAP32[tempDoublePtr>>2]=r15,HEAPF32[tempDoublePtr>>2]);r17=r16;r18=(HEAP32[tempDoublePtr>>2]=r17,HEAPF32[tempDoublePtr>>2]);r19=r10-r12;r20=r18-r11;r21=r19*(r10-r3)+r20*(r18-r9);r22=r3-r12;r23=r9-r11;r24=r22*r19+r23*r20;r25=HEAPF32[r2+8>>2]+HEAPF32[r4+8>>2];if(r24<=0){if(r22*r22+r23*r23>r25*r25){return}do{if((HEAP8[r2+44|0]&1)<<24>>24!=0){r4=r2+28|0;r26=HEAP32[r4+4>>2];if((r12-r3)*(r12-(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAPF32[tempDoublePtr>>2]))+(r11-r9)*(r11-(HEAP32[tempDoublePtr>>2]=r26,HEAPF32[tempDoublePtr>>2]))<=0){break}return}}while(0);HEAP32[r7]=1;HEAP32[r6+14]=0;HEAPF32[r6+10]=0;HEAPF32[r6+11]=0;r26=r1+48|0;HEAP32[r26>>2]=0|r13&-1;HEAP32[r26+4>>2]=r5|r14&0;r26=r1+16|0;HEAP32[r26>>2]=0;r4=r26;HEAP8[r26]=0;HEAP8[r4+1|0]=0;HEAP8[r4+2|0]=0;HEAP8[r4+3|0]=0;r4=r8;r26=r1;r27=HEAP32[r4+4>>2];HEAP32[r26>>2]=HEAP32[r4>>2];HEAP32[r26+4>>2]=r27;return}if(r21<=0){r27=r3-r10;r26=r9-r18;if(r27*r27+r26*r26>r25*r25){return}do{if((HEAP8[r2+45|0]&1)<<24>>24!=0){r4=r2+36|0;r28=HEAP32[r4+4>>2];if(r27*((HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAPF32[tempDoublePtr>>2])-r10)+r26*((HEAP32[tempDoublePtr>>2]=r28,HEAPF32[tempDoublePtr>>2])-r18)<=0){break}return}}while(0);HEAP32[r7]=1;HEAP32[r6+14]=0;HEAPF32[r6+10]=0;HEAPF32[r6+11]=0;r26=r1+48|0;HEAP32[r26>>2]=0|r15&-1;HEAP32[r26+4>>2]=r17|r16&0;r16=r1+16|0;HEAP32[r16>>2]=0;r17=r16;HEAP8[r16]=1;HEAP8[r17+1|0]=0;HEAP8[r17+2|0]=0;HEAP8[r17+3|0]=0;r17=r8;r16=r1;r26=HEAP32[r17+4>>2];HEAP32[r16>>2]=HEAP32[r17>>2];HEAP32[r16+4>>2]=r26;return}r26=r19*r19+r20*r20;if(r26<=0){___assert_func(5255336,127,5261148,5255324)}r16=1/r26;r26=r3-(r12*r21+r10*r24)*r16;r10=r9-(r11*r21+r18*r24)*r16;if(r26*r26+r10*r10>r25*r25){return}r25=-r20;if(r19*r23+r22*r25<0){r29=r20;r30=-r19}else{r29=r25;r30=r19}r19=Math.sqrt(r30*r30+r29*r29);if(r19<1.1920928955078125e-7){r31=r29;r32=r30}else{r25=1/r19;r31=r29*r25;r32=r30*r25}HEAP32[r7]=1;HEAP32[r6+14]=1;r6=r1+40|0;r7=(HEAPF32[tempDoublePtr>>2]=r31,HEAP32[tempDoublePtr>>2]);r31=(HEAPF32[tempDoublePtr>>2]=r32,HEAP32[tempDoublePtr>>2])|0;HEAP32[r6>>2]=0|r7;HEAP32[r6+4>>2]=r31;r31=r1+48|0;HEAP32[r31>>2]=0|r13&-1;HEAP32[r31+4>>2]=r5|r14&0;r14=r1+16|0;HEAP32[r14>>2]=0;r5=r14;HEAP8[r14]=0;HEAP8[r5+1|0]=0;HEAP8[r5+2|0]=1;HEAP8[r5+3|0]=0;r5=r8;r8=r1;r1=HEAP32[r5+4>>2];HEAP32[r8>>2]=HEAP32[r5>>2];HEAP32[r8+4>>2]=r1;return}function __ZN12b2EPCollider7CollideEP10b2ManifoldPK11b2EdgeShapeRK11b2TransformPK14b2PolygonShapeS7_(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89;r7=r5>>2;r8=r1>>2;r9=0;r10=STACKTOP;STACKTOP=STACKTOP+84|0;r11=r10,r12=r11>>2;r13=r10+12;r14=r10+36,r15=r14>>2;r16=r10+60,r17=r16>>2;r18=r1+132|0;r19=HEAPF32[r4+12>>2];r20=HEAPF32[r6+8>>2];r21=HEAPF32[r4+8>>2];r22=HEAPF32[r6+12>>2];r23=r19*r20-r21*r22;r24=r20*r21+r19*r22;r22=(HEAPF32[tempDoublePtr>>2]=r23,HEAP32[tempDoublePtr>>2]);r20=(HEAPF32[tempDoublePtr>>2]=r24,HEAP32[tempDoublePtr>>2])|0;r25=HEAPF32[r6>>2]-HEAPF32[r4>>2];r26=HEAPF32[r6+4>>2]-HEAPF32[r4+4>>2];r4=r19*r25+r21*r26;r6=r25*-r21+r19*r26;r26=(HEAPF32[tempDoublePtr>>2]=r4,HEAP32[tempDoublePtr>>2]);r19=(HEAPF32[tempDoublePtr>>2]=r6,HEAP32[tempDoublePtr>>2])|0;r21=r18;HEAP32[r21>>2]=0|r26;HEAP32[r21+4>>2]=r19;r19=r1+140|0;HEAP32[r19>>2]=0|r22;HEAP32[r19+4>>2]=r20;r20=(r1+144|0)>>2;r19=HEAPF32[r7+3];r22=(r1+140|0)>>2;r21=HEAPF32[r7+4];r26=(r18|0)>>2;r18=r4+(r24*r19-r23*r21);r4=(r1+136|0)>>2;r25=r19*r23+r24*r21+r6;r6=r1+148|0;r21=(HEAPF32[tempDoublePtr>>2]=r18,HEAP32[tempDoublePtr>>2]);r24=(HEAPF32[tempDoublePtr>>2]=r25,HEAP32[tempDoublePtr>>2])|0;HEAP32[r6>>2]=0|r21;HEAP32[r6+4>>2]=r24;r24=r3+28|0;r6=r1+156|0;r21=HEAP32[r24>>2];r23=HEAP32[r24+4>>2];HEAP32[r6>>2]=r21;HEAP32[r6+4>>2]=r23;r6=r3+12|0;r24=(r1+164|0)>>2;r19=HEAP32[r6>>2];r27=HEAP32[r6+4>>2];HEAP32[r24]=r19;HEAP32[r24+1]=r27;r6=r3+20|0;r28=(r1+172|0)>>2;r29=HEAP32[r6>>2];r30=HEAP32[r6+4>>2];HEAP32[r28]=r29;HEAP32[r28+1]=r30;r6=r3+36|0;r31=r1+180|0;r32=HEAP32[r6>>2];r33=HEAP32[r6+4>>2];HEAP32[r31>>2]=r32;HEAP32[r31+4>>2]=r33;r31=HEAP8[r3+44|0]&1;r6=r31<<24>>24!=0;r34=HEAP8[r3+45|0];r3=(r34&1)<<24>>24!=0;r35=(HEAP32[tempDoublePtr>>2]=r29,HEAPF32[tempDoublePtr>>2]);r29=(HEAP32[tempDoublePtr>>2]=r19,HEAPF32[tempDoublePtr>>2]);r19=r35-r29;r36=(HEAP32[tempDoublePtr>>2]=r30,HEAPF32[tempDoublePtr>>2]);r30=r1+168|0;r37=(HEAP32[tempDoublePtr>>2]=r27,HEAPF32[tempDoublePtr>>2]);r27=r36-r37;r38=Math.sqrt(r19*r19+r27*r27);r39=(HEAP32[tempDoublePtr>>2]=r21,HEAPF32[tempDoublePtr>>2]);r21=(HEAP32[tempDoublePtr>>2]=r23,HEAPF32[tempDoublePtr>>2]);r23=(HEAP32[tempDoublePtr>>2]=r32,HEAPF32[tempDoublePtr>>2]);r32=(HEAP32[tempDoublePtr>>2]=r33,HEAPF32[tempDoublePtr>>2]);if(r38<1.1920928955078125e-7){r40=r19;r41=r27}else{r33=1/r38;r40=r19*r33;r41=r27*r33}r33=r1+196|0;r27=-r40;r19=(r33|0)>>2;HEAPF32[r19]=r41;r38=(r1+200|0)>>2;HEAPF32[r38]=r27;r42=(r18-r29)*r41+(r25-r37)*r27;if(r6){r27=r29-r39;r29=r37-r21;r37=Math.sqrt(r27*r27+r29*r29);if(r37<1.1920928955078125e-7){r43=r27;r44=r29}else{r45=1/r37;r43=r27*r45;r44=r29*r45}r45=-r43;HEAPF32[r8+47]=r44;HEAPF32[r8+48]=r45;r46=(r18-r39)*r44+(r25-r21)*r45;r47=r41*r43-r40*r44>=0}else{r46=0;r47=0}L93:do{if(r3){r44=r23-r35;r43=r32-r36;r45=Math.sqrt(r44*r44+r43*r43);if(r45<1.1920928955078125e-7){r48=r44;r49=r43}else{r21=1/r45;r48=r44*r21;r49=r43*r21}r21=-r48;r43=(r1+204|0)>>2;HEAPF32[r43]=r49;r44=(r1+208|0)>>2;HEAPF32[r44]=r21;r45=r40*r49-r41*r48>0;r39=(r18-r35)*r49+(r25-r36)*r21;if((r31&r34)<<24>>24==0){r50=r45;r51=r39;r9=100;break}if(r47&r45){do{if(r46<0&r42<0){r21=r39>=0;HEAP8[r1+248|0]=r21&1;r29=r1+212|0;if(r21){r52=r29;break}r21=r29;r29=0|(HEAPF32[tempDoublePtr>>2]=-r41,HEAP32[tempDoublePtr>>2]);r27=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2])|0;HEAP32[r21>>2]=r29;HEAP32[r21+4>>2]=r27;r21=r1+228|0;HEAP32[r21>>2]=r29;HEAP32[r21+4>>2]=r27;r21=r1+236|0;HEAP32[r21>>2]=r29;HEAP32[r21+4>>2]=r27;break L93}else{HEAP8[r1+248|0]=1;r52=r1+212|0}}while(0);r27=r33;r21=r52;r29=HEAP32[r27+4>>2];HEAP32[r21>>2]=HEAP32[r27>>2];HEAP32[r21+4>>2]=r29;r29=r1+188|0;r21=r1+228|0;r27=HEAP32[r29+4>>2];HEAP32[r21>>2]=HEAP32[r29>>2];HEAP32[r21+4>>2]=r27;r27=r1+204|0;r21=r1+236|0;r29=HEAP32[r27+4>>2];HEAP32[r21>>2]=HEAP32[r27>>2];HEAP32[r21+4>>2]=r29;break}if(r47){do{if(r46<0){if(r42<0){HEAP8[r1+248|0]=0;r53=r1+212|0}else{r29=r39>=0;HEAP8[r1+248|0]=r29&1;r21=r1+212|0;if(r29){r54=r21;break}else{r53=r21}}r21=r53;r29=(HEAPF32[tempDoublePtr>>2]=-r41,HEAP32[tempDoublePtr>>2]);r27=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2])|0;HEAP32[r21>>2]=0|r29;HEAP32[r21+4>>2]=r27;r27=-HEAPF32[r44];r21=r1+228|0;r29=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r43],HEAP32[tempDoublePtr>>2]);r37=(HEAPF32[tempDoublePtr>>2]=r27,HEAP32[tempDoublePtr>>2])|0;HEAP32[r21>>2]=0|r29;HEAP32[r21+4>>2]=r37;r37=-HEAPF32[r38];r21=r1+236|0;r29=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r19],HEAP32[tempDoublePtr>>2]);r27=(HEAPF32[tempDoublePtr>>2]=r37,HEAP32[tempDoublePtr>>2])|0;HEAP32[r21>>2]=0|r29;HEAP32[r21+4>>2]=r27;break L93}else{HEAP8[r1+248|0]=1;r54=r1+212|0}}while(0);r27=r33>>2;r21=r54;r29=HEAP32[r27+1];HEAP32[r21>>2]=HEAP32[r27];HEAP32[r21+4>>2]=r29;r29=r1+188|0;r21=r1+228|0;r37=HEAP32[r29+4>>2];HEAP32[r21>>2]=HEAP32[r29>>2];HEAP32[r21+4>>2]=r37;r37=r1+236|0;r21=HEAP32[r27+1];HEAP32[r37>>2]=HEAP32[r27];HEAP32[r37+4>>2]=r21;break}if(!r45){do{if(r46<0|r42<0){HEAP8[r1+248|0]=0;r55=r1+212|0}else{r21=r39>=0;HEAP8[r1+248|0]=r21&1;r37=r1+212|0;if(!r21){r55=r37;break}r21=r33;r27=r37;r37=HEAP32[r21>>2];r29=HEAP32[r21+4>>2];HEAP32[r27>>2]=r37;HEAP32[r27+4>>2]=r29;r27=r1+228|0;HEAP32[r27>>2]=r37;HEAP32[r27+4>>2]=r29;r27=r1+236|0;HEAP32[r27>>2]=r37;HEAP32[r27+4>>2]=r29;break L93}}while(0);r45=r55;r29=(HEAPF32[tempDoublePtr>>2]=-r41,HEAP32[tempDoublePtr>>2]);r27=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2])|0;HEAP32[r45>>2]=0|r29;HEAP32[r45+4>>2]=r27;r27=-HEAPF32[r44];r45=r1+228|0;r29=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r43],HEAP32[tempDoublePtr>>2]);r37=(HEAPF32[tempDoublePtr>>2]=r27,HEAP32[tempDoublePtr>>2])|0;HEAP32[r45>>2]=0|r29;HEAP32[r45+4>>2]=r37;r37=-HEAPF32[r8+48];r45=r1+236|0;r29=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r8+47],HEAP32[tempDoublePtr>>2]);r27=(HEAPF32[tempDoublePtr>>2]=r37,HEAP32[tempDoublePtr>>2])|0;HEAP32[r45>>2]=0|r29;HEAP32[r45+4>>2]=r27;break}do{if(r39<0){if(r46<0){HEAP8[r1+248|0]=0;r56=r1+212|0}else{r27=r42>=0;HEAP8[r1+248|0]=r27&1;r45=r1+212|0;if(r27){r57=r45;break}else{r56=r45}}r45=r56;r27=(HEAPF32[tempDoublePtr>>2]=-r41,HEAP32[tempDoublePtr>>2]);r29=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2])|0;HEAP32[r45>>2]=0|r27;HEAP32[r45+4>>2]=r29;r29=-HEAPF32[r38];r45=r1+228|0;r27=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r19],HEAP32[tempDoublePtr>>2]);r37=(HEAPF32[tempDoublePtr>>2]=r29,HEAP32[tempDoublePtr>>2])|0;HEAP32[r45>>2]=0|r27;HEAP32[r45+4>>2]=r37;r37=-HEAPF32[r8+48];r45=r1+236|0;r27=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r8+47],HEAP32[tempDoublePtr>>2]);r29=(HEAPF32[tempDoublePtr>>2]=r37,HEAP32[tempDoublePtr>>2])|0;HEAP32[r45>>2]=0|r27;HEAP32[r45+4>>2]=r29;break L93}else{HEAP8[r1+248|0]=1;r57=r1+212|0}}while(0);r39=r33>>2;r43=r57;r44=HEAP32[r39+1];HEAP32[r43>>2]=HEAP32[r39];HEAP32[r43+4>>2]=r44;r44=r1+228|0;r43=HEAP32[r39+1];HEAP32[r44>>2]=HEAP32[r39];HEAP32[r44+4>>2]=r43;r43=r1+204|0;r44=r1+236|0;r39=HEAP32[r43+4>>2];HEAP32[r44>>2]=HEAP32[r43>>2];HEAP32[r44+4>>2]=r39;break}else{r50=0;r51=0;r9=100}}while(0);L134:do{if(r9==100){if(r6){r57=r46>=0;if(r47){do{if(r57){HEAP8[r1+248|0]=1;r58=r1+212|0}else{r56=r42>=0;HEAP8[r1+248|0]=r56&1;r55=r1+212|0;if(r56){r58=r55;break}r56=r55;r55=(HEAPF32[tempDoublePtr>>2]=-r41,HEAP32[tempDoublePtr>>2]);r54=0;r53=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2]);HEAP32[r56>>2]=r54|r55;HEAP32[r56+4>>2]=r53|0;r56=r33;r55=r1+228|0;r52=HEAP32[r56>>2];r34=HEAP32[r56+4>>2];HEAP32[r55>>2]=r52;HEAP32[r55+4>>2]=r34;r34=r1+236|0;HEAP32[r34>>2]=r54|(HEAPF32[tempDoublePtr>>2]=-(HEAP32[tempDoublePtr>>2]=r52,HEAPF32[tempDoublePtr>>2]),HEAP32[tempDoublePtr>>2]);HEAP32[r34+4>>2]=r53|0;break L134}}while(0);r53=r33;r34=r58;r52=HEAP32[r53+4>>2];HEAP32[r34>>2]=HEAP32[r53>>2];HEAP32[r34+4>>2]=r52;r52=r1+188|0;r34=r1+228|0;r53=HEAP32[r52+4>>2];HEAP32[r34>>2]=HEAP32[r52>>2];HEAP32[r34+4>>2]=r53;r53=-HEAPF32[r38];r34=r1+236|0;r52=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r19],HEAP32[tempDoublePtr>>2]);r54=(HEAPF32[tempDoublePtr>>2]=r53,HEAP32[tempDoublePtr>>2])|0;HEAP32[r34>>2]=0|r52;HEAP32[r34+4>>2]=r54;break}else{do{if(r57){r54=r42>=0;HEAP8[r1+248|0]=r54&1;r34=r1+212|0;if(!r54){r59=r34;break}r54=r33;r52=r34;r34=HEAP32[r54>>2];r53=HEAP32[r54+4>>2];HEAP32[r52>>2]=r34;HEAP32[r52+4>>2]=r53;r52=r1+228|0;HEAP32[r52>>2]=r34;HEAP32[r52+4>>2]=r53;r53=r1+236|0;r52=(HEAPF32[tempDoublePtr>>2]=-(HEAP32[tempDoublePtr>>2]=r34,HEAPF32[tempDoublePtr>>2]),HEAP32[tempDoublePtr>>2]);r34=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2])|0;HEAP32[r53>>2]=0|r52;HEAP32[r53+4>>2]=r34;break L134}else{HEAP8[r1+248|0]=0;r59=r1+212|0}}while(0);r57=r59;r34=(HEAPF32[tempDoublePtr>>2]=-r41,HEAP32[tempDoublePtr>>2]);r53=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2])|0;HEAP32[r57>>2]=0|r34;HEAP32[r57+4>>2]=r53;r53=r33;r57=r1+228|0;r34=HEAP32[r53+4>>2];HEAP32[r57>>2]=HEAP32[r53>>2];HEAP32[r57+4>>2]=r34;r34=-HEAPF32[r8+48];r57=r1+236|0;r53=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r8+47],HEAP32[tempDoublePtr>>2]);r52=(HEAPF32[tempDoublePtr>>2]=r34,HEAP32[tempDoublePtr>>2])|0;HEAP32[r57>>2]=0|r53;HEAP32[r57+4>>2]=r52;break}}r52=r42>=0;if(!r3){HEAP8[r1+248|0]=r52&1;r57=r1+212|0;if(r52){r53=r33;r34=r57;r54=HEAP32[r53>>2];r55=HEAP32[r53+4>>2];HEAP32[r34>>2]=r54;HEAP32[r34+4>>2]=r55;r55=r1+228|0;r34=0|(HEAPF32[tempDoublePtr>>2]=-(HEAP32[tempDoublePtr>>2]=r54,HEAPF32[tempDoublePtr>>2]),HEAP32[tempDoublePtr>>2]);r54=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2])|0;HEAP32[r55>>2]=r34;HEAP32[r55+4>>2]=r54;r55=r1+236|0;HEAP32[r55>>2]=r34;HEAP32[r55+4>>2]=r54;break}else{r54=r57;r57=(HEAPF32[tempDoublePtr>>2]=-r41,HEAP32[tempDoublePtr>>2]);r55=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2])|0;HEAP32[r54>>2]=0|r57;HEAP32[r54+4>>2]=r55;r55=r33;r54=r1+228|0;r57=HEAP32[r55>>2];r34=HEAP32[r55+4>>2];HEAP32[r54>>2]=r57;HEAP32[r54+4>>2]=r34;r54=r1+236|0;HEAP32[r54>>2]=r57;HEAP32[r54+4>>2]=r34;break}}if(r50){do{if(r52){HEAP8[r1+248|0]=1;r60=r1+212|0}else{r34=r51>=0;HEAP8[r1+248|0]=r34&1;r54=r1+212|0;if(r34){r60=r54;break}r34=r54;r54=0|(HEAPF32[tempDoublePtr>>2]=-r41,HEAP32[tempDoublePtr>>2]);r57=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2])|0;HEAP32[r34>>2]=r54;HEAP32[r34+4>>2]=r57;r34=r1+228|0;HEAP32[r34>>2]=r54;HEAP32[r34+4>>2]=r57;r57=r33;r34=r1+236|0;r54=HEAP32[r57+4>>2];HEAP32[r34>>2]=HEAP32[r57>>2];HEAP32[r34+4>>2]=r54;break L134}}while(0);r54=r33;r34=r60;r57=HEAP32[r54+4>>2];HEAP32[r34>>2]=HEAP32[r54>>2];HEAP32[r34+4>>2]=r57;r57=-HEAPF32[r38];r34=r1+228|0;r54=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r19],HEAP32[tempDoublePtr>>2]);r55=(HEAPF32[tempDoublePtr>>2]=r57,HEAP32[tempDoublePtr>>2])|0;HEAP32[r34>>2]=0|r54;HEAP32[r34+4>>2]=r55;r55=r1+204|0;r34=r1+236|0;r54=HEAP32[r55+4>>2];HEAP32[r34>>2]=HEAP32[r55>>2];HEAP32[r34+4>>2]=r54;break}else{do{if(r52){r54=r51>=0;HEAP8[r1+248|0]=r54&1;r34=r1+212|0;if(!r54){r61=r34;break}r54=r33;r55=r34;r34=HEAP32[r54>>2];r57=HEAP32[r54+4>>2];HEAP32[r55>>2]=r34;HEAP32[r55+4>>2]=r57;r55=r1+228|0;r54=(HEAPF32[tempDoublePtr>>2]=-(HEAP32[tempDoublePtr>>2]=r34,HEAPF32[tempDoublePtr>>2]),HEAP32[tempDoublePtr>>2]);r53=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2])|0;HEAP32[r55>>2]=0|r54;HEAP32[r55+4>>2]=r53;r53=r1+236|0;HEAP32[r53>>2]=r34;HEAP32[r53+4>>2]=r57;break L134}else{HEAP8[r1+248|0]=0;r61=r1+212|0}}while(0);r52=r61;r57=(HEAPF32[tempDoublePtr>>2]=-r41,HEAP32[tempDoublePtr>>2]);r53=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2])|0;HEAP32[r52>>2]=0|r57;HEAP32[r52+4>>2]=r53;r53=-HEAPF32[r8+52];r52=r1+228|0;r57=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r8+51],HEAP32[tempDoublePtr>>2]);r34=(HEAPF32[tempDoublePtr>>2]=r53,HEAP32[tempDoublePtr>>2])|0;HEAP32[r52>>2]=0|r57;HEAP32[r52+4>>2]=r34;r34=r33;r52=r1+236|0;r57=HEAP32[r34+4>>2];HEAP32[r52>>2]=HEAP32[r34>>2];HEAP32[r52+4>>2]=r57;break}}}while(0);r40=(r5+148|0)>>2;r41=(r1+128|0)>>2;HEAP32[r41]=HEAP32[r40];L172:do{if((HEAP32[r40]|0)>0){r61=0;while(1){r51=HEAPF32[r20];r60=HEAPF32[((r61<<3)+20>>2)+r7];r50=HEAPF32[r22];r3=HEAPF32[((r61<<3)+24>>2)+r7];r42=r60*r50+r51*r3+HEAPF32[r4];r59=(r61<<3)+r1|0;r58=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r26]+(r51*r60-r50*r3),HEAP32[tempDoublePtr>>2]);r3=(HEAPF32[tempDoublePtr>>2]=r42,HEAP32[tempDoublePtr>>2])|0;HEAP32[r59>>2]=0|r58;HEAP32[r59+4>>2]=r3;r3=HEAPF32[r20];r59=HEAPF32[((r61<<3)+84>>2)+r7];r58=HEAPF32[r22];r42=HEAPF32[((r61<<3)+88>>2)+r7];r50=(r61<<3)+r1+64|0;r60=(HEAPF32[tempDoublePtr>>2]=r3*r59-r58*r42,HEAP32[tempDoublePtr>>2]);r51=(HEAPF32[tempDoublePtr>>2]=r59*r58+r3*r42,HEAP32[tempDoublePtr>>2])|0;HEAP32[r50>>2]=0|r60;HEAP32[r50+4>>2]=r51;r51=r61+1|0;if((r51|0)<(HEAP32[r40]|0)){r61=r51}else{break L172}}}}while(0);r40=(r1+244|0)>>2;HEAPF32[r40]=.019999999552965164;r7=r2+60|0;HEAP32[r7>>2]=0;r61=r1+248|0;r51=HEAP32[r41];L176:do{if((r51|0)>0){r50=HEAPF32[r8+41];r60=HEAPF32[r30>>2];r42=HEAPF32[r8+53];r3=HEAPF32[r8+54];r58=0;r59=3.4028234663852886e+38;while(1){r47=r42*(HEAPF32[(r58<<3>>2)+r8]-r50)+r3*(HEAPF32[((r58<<3)+4>>2)+r8]-r60);r46=r47<r59?r47:r59;r47=r58+1|0;if((r47|0)==(r51|0)){r62=r46;break L176}else{r58=r47;r59=r46}}}else{r62=3.4028234663852886e+38}}while(0);if(r62>HEAPF32[r40]){STACKTOP=r10;return}__ZN12b2EPCollider24ComputePolygonSeparationEv(r11,r1);r11=HEAP32[r12];do{if((r11|0)==0){r9=136}else{r51=HEAPF32[r12+2];if(r51>HEAPF32[r40]){STACKTOP=r10;return}if(r51<=r62*.9800000190734863+.0010000000474974513){r9=136;break}r51=HEAP32[r12+1];r30=r2+56|0;if((r11|0)==1){r63=r30;r9=138;break}HEAP32[r30>>2]=2;r30=r13;r59=HEAP32[r24];r58=HEAP32[r24+1];HEAP32[r30>>2]=r59;HEAP32[r30+4>>2]=r58;r30=r13+8|0;r60=r30;HEAP8[r30]=0;r30=r51&255;HEAP8[r60+1|0]=r30;HEAP8[r60+2|0]=0;HEAP8[r60+3|0]=1;r60=r13+12|0;r3=HEAP32[r28];r50=HEAP32[r28+1];HEAP32[r60>>2]=r3;HEAP32[r60+4>>2]=r50;r60=r13+20|0;r42=r60;HEAP8[r60]=0;HEAP8[r42+1|0]=r30;HEAP8[r42+2|0]=0;HEAP8[r42+3|0]=1;r42=r51+1|0;r60=(r42|0)<(HEAP32[r41]|0)?r42:0;r42=(r51<<3)+r1|0;r46=HEAP32[r42>>2];r47=HEAP32[r42+4>>2];r42=(r60<<3)+r1|0;r6=HEAP32[r42>>2];r57=HEAP32[r42+4>>2];r42=(r51<<3)+r1+64|0;r52=HEAP32[r42>>2];r34=HEAP32[r42+4>>2];r42=(HEAP32[tempDoublePtr>>2]=r59,HEAPF32[tempDoublePtr>>2]);r59=(HEAP32[tempDoublePtr>>2]=r58,HEAPF32[tempDoublePtr>>2]);r64=r51;r65=r60&255;r66=r52;r67=r34;r68=r6;r69=r57;r70=r46;r71=r47;r72=(HEAP32[tempDoublePtr>>2]=r3,HEAPF32[tempDoublePtr>>2]);r73=r42;r74=(HEAP32[tempDoublePtr>>2]=r50,HEAPF32[tempDoublePtr>>2]);r75=r59;r76=r30;r77=0;break}}while(0);do{if(r9==136){r63=r2+56|0;r9=138;break}}while(0);do{if(r9==138){HEAP32[r63>>2]=1;r11=HEAP32[r41];L195:do{if((r11|0)>1){r12=HEAPF32[r8+54];r62=HEAPF32[r8+53];r30=0;r59=r62*HEAPF32[r8+16]+r12*HEAPF32[r8+17];r50=1;while(1){r42=r62*HEAPF32[((r50<<3)+64>>2)+r8]+r12*HEAPF32[((r50<<3)+68>>2)+r8];r3=r42<r59;r47=r3?r50:r30;r46=r50+1|0;if((r46|0)<(r11|0)){r30=r47;r59=r3?r42:r59;r50=r46}else{r78=r47;break L195}}}else{r78=0}}while(0);r50=r78+1|0;r59=(r50|0)<(r11|0)?r50:0;r50=(r78<<3)+r1|0;r30=r13;r12=HEAP32[r50>>2];r62=HEAP32[r50+4>>2];HEAP32[r30>>2]=r12;HEAP32[r30+4>>2]=r62;r30=r13+8|0;r50=r30;HEAP8[r30]=0;r30=r78&255;HEAP8[r50+1|0]=r30;HEAP8[r50+2|0]=1;HEAP8[r50+3|0]=0;r50=(r59<<3)+r1|0;r47=r13+12|0;r46=HEAP32[r50>>2];r42=HEAP32[r50+4>>2];HEAP32[r47>>2]=r46;HEAP32[r47+4>>2]=r42;r47=r13+20|0;r50=r47;HEAP8[r47]=0;HEAP8[r50+1|0]=r59&255;HEAP8[r50+2|0]=1;HEAP8[r50+3|0]=0;r50=(HEAP8[r61]&1)<<24>>24==0;r59=(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=(HEAP32[tempDoublePtr>>2]=r62,HEAPF32[tempDoublePtr>>2]);r62=(HEAP32[tempDoublePtr>>2]=r46,HEAPF32[tempDoublePtr>>2]);r46=(HEAP32[tempDoublePtr>>2]=r42,HEAPF32[tempDoublePtr>>2]);if(r50){r50=HEAP32[r28];r42=HEAP32[r28+1];r47=HEAP32[r24];r3=HEAP32[r24+1];r57=-HEAPF32[r38];r64=1;r65=0;r66=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r19],HEAP32[tempDoublePtr>>2]);r67=(HEAPF32[tempDoublePtr>>2]=r57,HEAP32[tempDoublePtr>>2]);r68=r47;r69=r3;r70=r50;r71=r42;r72=r62;r73=r59;r74=r46;r75=r12;r76=r30;r77=1;break}else{r42=r33;r64=0;r65=1;r66=HEAP32[r42>>2];r67=HEAP32[r42+4>>2];r68=HEAP32[r28];r69=HEAP32[r28+1];r70=HEAP32[r24];r71=HEAP32[r24+1];r72=r62;r73=r59;r74=r46;r75=r12;r76=r30;r77=1;break}}}while(0);r24=(HEAP32[tempDoublePtr>>2]=r66,HEAPF32[tempDoublePtr>>2]);r28=(HEAP32[tempDoublePtr>>2]=r67,HEAPF32[tempDoublePtr>>2]);r33=(HEAP32[tempDoublePtr>>2]=r69,HEAPF32[tempDoublePtr>>2]);r69=(HEAP32[tempDoublePtr>>2]=r70,HEAPF32[tempDoublePtr>>2]);r19=(HEAP32[tempDoublePtr>>2]=r71,HEAPF32[tempDoublePtr>>2]);r38=-r24;r61=r69*r28+r19*r38;r1=-r28;r78=(HEAP32[tempDoublePtr>>2]=r68,HEAPF32[tempDoublePtr>>2])*r1+r33*r24;r33=r28*r73+r75*r38-r61;r68=r28*r72+r74*r38-r61;if(r33>0){r79=0}else{r61=r14>>2;r38=r13>>2;HEAP32[r61]=HEAP32[r38];HEAP32[r61+1]=HEAP32[r38+1];HEAP32[r61+2]=HEAP32[r38+2];r79=1}if(r68>0){r80=r79}else{r38=(r14+(r79*12&-1)|0)>>2;r61=(r13+12|0)>>2;HEAP32[r38]=HEAP32[r61];HEAP32[r38+1]=HEAP32[r61+1];HEAP32[r38+2]=HEAP32[r61+2];r80=r79+1|0}if(r33*r68<0){r79=r33/(r33-r68);r68=r14+(r80*12&-1)|0;r33=(HEAPF32[tempDoublePtr>>2]=r73+r79*(r72-r73),HEAP32[tempDoublePtr>>2]);r73=(HEAPF32[tempDoublePtr>>2]=r75+r79*(r74-r75),HEAP32[tempDoublePtr>>2])|0;HEAP32[r68>>2]=0|r33;HEAP32[r68+4>>2]=r73;r73=r14+(r80*12&-1)+8|0;r68=r73;HEAP8[r73]=r64&255;HEAP8[r68+1|0]=r76;HEAP8[r68+2|0]=0;HEAP8[r68+3|0]=1;r81=r80+1|0}else{r81=r80}if((r81|0)<2){STACKTOP=r10;return}r81=HEAPF32[r15];r80=HEAPF32[r15+1];r68=r81*r1+r24*r80-r78;r76=r14+12|0;r73=HEAPF32[r76>>2];r33=HEAPF32[r15+4];r15=r73*r1+r24*r33-r78;if(r68>0){r82=0}else{r78=r16>>2;r1=r14>>2;HEAP32[r78]=HEAP32[r1];HEAP32[r78+1]=HEAP32[r1+1];HEAP32[r78+2]=HEAP32[r1+2];r82=1}if(r15>0){r83=r82}else{r1=(r16+(r82*12&-1)|0)>>2;r78=r76>>2;HEAP32[r1]=HEAP32[r78];HEAP32[r1+1]=HEAP32[r78+1];HEAP32[r1+2]=HEAP32[r78+2];r83=r82+1|0}if(r68*r15<0){r82=r68/(r68-r15);r15=r16+(r83*12&-1)|0;r68=(HEAPF32[tempDoublePtr>>2]=r81+r82*(r73-r81),HEAP32[tempDoublePtr>>2]);r81=(HEAPF32[tempDoublePtr>>2]=r80+r82*(r33-r80),HEAP32[tempDoublePtr>>2])|0;HEAP32[r15>>2]=0|r68;HEAP32[r15+4>>2]=r81;r81=r16+(r83*12&-1)+8|0;r15=r81;HEAP8[r81]=r65;HEAP8[r15+1|0]=HEAP8[r14+9|0];HEAP8[r15+2|0]=0;HEAP8[r15+3|0]=1;r84=r83+1|0}else{r84=r83}if((r84|0)<2){STACKTOP=r10;return}r84=r2+40|0;do{if(r77){r83=r84;HEAP32[r83>>2]=0|r66;HEAP32[r83+4>>2]=r67|0;r83=r2+48|0;HEAP32[r83>>2]=0|r70;HEAP32[r83+4>>2]=r71|0;r83=HEAPF32[r17];r15=HEAPF32[r17+1];r14=HEAPF32[r40];if(r24*(r83-r69)+r28*(r15-r19)>r14){r85=0;r86=r14}else{r14=r83-HEAPF32[r26];r83=r15-HEAPF32[r4];r15=HEAPF32[r20];r65=HEAPF32[r22];r81=r2;r68=(HEAPF32[tempDoublePtr>>2]=r14*r15+r83*r65,HEAP32[tempDoublePtr>>2]);r80=(HEAPF32[tempDoublePtr>>2]=r15*r83+r14*-r65,HEAP32[tempDoublePtr>>2])|0;HEAP32[r81>>2]=0|r68;HEAP32[r81+4>>2]=r80;HEAP32[r2+16>>2]=HEAP32[r17+2];r85=1;r86=HEAPF32[r40]}r80=HEAPF32[r17+3];r81=HEAPF32[r17+4];if(r24*(r80-r69)+r28*(r81-r19)>r86){r87=r85;break}r68=r80-HEAPF32[r26];r80=r81-HEAPF32[r4];r81=HEAPF32[r20];r65=HEAPF32[r22];r14=r2+(r85*20&-1)|0;r83=(HEAPF32[tempDoublePtr>>2]=r68*r81+r80*r65,HEAP32[tempDoublePtr>>2]);r15=(HEAPF32[tempDoublePtr>>2]=r81*r80+r68*-r65,HEAP32[tempDoublePtr>>2])|0;HEAP32[r14>>2]=0|r83;HEAP32[r14+4>>2]=r15;HEAP32[r2+(r85*20&-1)+16>>2]=HEAP32[r17+5];r87=r85+1|0}else{r15=(r64<<3)+r5+84|0;r14=r84;r83=HEAP32[r15+4>>2];HEAP32[r14>>2]=HEAP32[r15>>2];HEAP32[r14+4>>2]=r83;r83=(r64<<3)+r5+20|0;r14=r2+48|0;r15=HEAP32[r83+4>>2];HEAP32[r14>>2]=HEAP32[r83>>2];HEAP32[r14+4>>2]=r15;r15=HEAPF32[r40];if(r24*(HEAPF32[r17]-r69)+r28*(HEAPF32[r17+1]-r19)>r15){r88=0;r89=r15}else{r15=r16;r14=r2;r83=HEAP32[r15+4>>2];HEAP32[r14>>2]=HEAP32[r15>>2];HEAP32[r14+4>>2]=r83;r83=r16+8|0;r14=r83;r15=r2+16|0;r65=r15;HEAP8[r65+2|0]=HEAP8[r14+3|0];HEAP8[r65+3|0]=HEAP8[r14+2|0];HEAP8[r15]=HEAP8[r14+1|0];HEAP8[r65+1|0]=HEAP8[r83];r88=1;r89=HEAPF32[r40]}r83=r16+12|0;if(r24*(HEAPF32[r83>>2]-r69)+r28*(HEAPF32[r17+4]-r19)>r89){r87=r88;break}r65=r83;r83=r2+(r88*20&-1)|0;r14=HEAP32[r65+4>>2];HEAP32[r83>>2]=HEAP32[r65>>2];HEAP32[r83+4>>2]=r14;r14=r16+20|0;r83=r14;r65=r2+(r88*20&-1)+16|0;r15=r65;HEAP8[r15+2|0]=HEAP8[r83+3|0];HEAP8[r15+3|0]=HEAP8[r83+2|0];HEAP8[r65]=HEAP8[r83+1|0];HEAP8[r15+1|0]=HEAP8[r14];r87=r88+1|0}}while(0);HEAP32[r7>>2]=r87;STACKTOP=r10;return}function __ZN12b2EPCollider24ComputePolygonSeparationEv(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r3=r2>>2;r4=0;r5=(r1|0)>>2;HEAP32[r5]=0;r6=(r1+4|0)>>2;HEAP32[r6]=-1;r7=(r1+8|0)>>2;HEAPF32[r7]=-3.4028234663852886e+38;r1=HEAPF32[r3+54];r8=HEAPF32[r3+53];r9=HEAP32[r3+32];if((r9|0)<=0){return}r10=HEAPF32[r3+41];r11=HEAPF32[r3+42];r12=HEAPF32[r3+43];r13=HEAPF32[r3+44];r14=HEAPF32[r3+61];r15=r2+228|0;r16=r2+232|0;r17=r2+236|0;r18=r2+240|0;r2=0;r19=-3.4028234663852886e+38;while(1){r20=HEAPF32[((r2<<3)+64>>2)+r3];r21=-r20;r22=-HEAPF32[((r2<<3)+68>>2)+r3];r23=HEAPF32[(r2<<3>>2)+r3];r24=HEAPF32[((r2<<3)+4>>2)+r3];r25=(r23-r10)*r21+(r24-r11)*r22;r26=(r23-r12)*r21+(r24-r13)*r22;r27=r25<r26?r25:r26;if(r27>r14){break}do{if(r1*r20+r8*r22<0){if((r21-HEAPF32[r15>>2])*r8+(r22-HEAPF32[r16>>2])*r1>=-.03490658849477768&r27>r19){r4=182;break}else{r28=r19;break}}else{if((r21-HEAPF32[r17>>2])*r8+(r22-HEAPF32[r18>>2])*r1>=-.03490658849477768&r27>r19){r4=182;break}else{r28=r19;break}}}while(0);if(r4==182){r4=0;HEAP32[r5]=2;HEAP32[r6]=r2;HEAPF32[r7]=r27;r28=r27}r22=r2+1|0;if((r22|0)<(r9|0)){r2=r22;r19=r28}else{r4=186;break}}if(r4==186){return}HEAP32[r5]=2;HEAP32[r6]=r2;HEAPF32[r7]=r27;return}function __ZL19b2FindMaxSeparationPiPK14b2PolygonShapeRK11b2TransformS2_S5_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r6=r2>>2;r7=HEAP32[r6+37];r8=HEAPF32[r5+12>>2];r9=HEAPF32[r4+12>>2];r10=HEAPF32[r5+8>>2];r11=HEAPF32[r4+16>>2];r12=HEAPF32[r3+12>>2];r13=HEAPF32[r6+3];r14=HEAPF32[r3+8>>2];r15=HEAPF32[r6+4];r16=HEAPF32[r5>>2]+(r8*r9-r10*r11)-(HEAPF32[r3>>2]+(r12*r13-r14*r15));r17=r9*r10+r8*r11+HEAPF32[r5+4>>2]-(r13*r14+r12*r15+HEAPF32[r3+4>>2]);r15=r12*r16+r14*r17;r13=r12*r17+r16*-r14;L259:do{if((r7|0)>0){r14=0;r16=-3.4028234663852886e+38;r17=0;while(1){r12=r15*HEAPF32[((r14<<3)+84>>2)+r6]+r13*HEAPF32[((r14<<3)+88>>2)+r6];r11=r12>r16;r8=r11?r14:r17;r10=r14+1|0;if((r10|0)==(r7|0)){r18=r8;break L259}else{r14=r10;r16=r11?r12:r16;r17=r8}}}else{r18=0}}while(0);r6=__ZL16b2EdgeSeparationPK14b2PolygonShapeRK11b2TransformiS1_S4_(r2,r3,r18,r4,r5);r13=((r18|0)>0?r18:r7)-1|0;r15=__ZL16b2EdgeSeparationPK14b2PolygonShapeRK11b2TransformiS1_S4_(r2,r3,r13,r4,r5);r17=r18+1|0;r16=(r17|0)<(r7|0)?r17:0;r17=__ZL16b2EdgeSeparationPK14b2PolygonShapeRK11b2TransformiS1_S4_(r2,r3,r16,r4,r5);if(r15>r6&r15>r17){r14=r15;r15=r13;while(1){r13=((r15|0)>0?r15:r7)-1|0;r8=__ZL16b2EdgeSeparationPK14b2PolygonShapeRK11b2TransformiS1_S4_(r2,r3,r13,r4,r5);if(r8>r14){r14=r8;r15=r13}else{r19=r14;r20=r15;break}}HEAP32[r1>>2]=r20;return r19}if(r17>r6){r21=r17;r22=r16}else{r19=r6;r20=r18;HEAP32[r1>>2]=r20;return r19}while(1){r18=r22+1|0;r6=(r18|0)<(r7|0)?r18:0;r18=__ZL16b2EdgeSeparationPK14b2PolygonShapeRK11b2TransformiS1_S4_(r2,r3,r6,r4,r5);if(r18>r21){r21=r18;r22=r6}else{r19=r21;r20=r22;break}}HEAP32[r1>>2]=r20;return r19}function __Z17b2CollidePolygonsP10b2ManifoldPK14b2PolygonShapeRK11b2TransformS3_S6_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49;r6=r5>>2;r7=r3>>2;r8=STACKTOP;STACKTOP=STACKTOP+80|0;r9=r8;r10=r8+4;r11=r8+8;r12=r8+32,r13=r12>>2;r14=r8+56,r15=r14>>2;r16=r1+60|0;HEAP32[r16>>2]=0;r17=HEAPF32[r2+8>>2]+HEAPF32[r4+8>>2];HEAP32[r9>>2]=0;r18=__ZL19b2FindMaxSeparationPiPK14b2PolygonShapeRK11b2TransformS2_S5_(r9,r2,r3,r4,r5);if(r18>r17){STACKTOP=r8;return}HEAP32[r10>>2]=0;r19=__ZL19b2FindMaxSeparationPiPK14b2PolygonShapeRK11b2TransformS2_S5_(r10,r4,r5,r2,r3);if(r19>r17){STACKTOP=r8;return}if(r19>r18*.9800000190734863+.0010000000474974513){r18=HEAPF32[r6];r19=HEAPF32[r6+1];r3=HEAPF32[r6+2];r5=HEAPF32[r6+3];r20=HEAPF32[r7];r21=HEAPF32[r7+1];r22=HEAPF32[r7+2];r23=HEAPF32[r7+3];r24=HEAP32[r10>>2];HEAP32[r1+56>>2]=2;r25=r4,r26=r25>>2;r10=r2,r27=r10>>2;r28=r24;r29=1;r30=r20;r31=r21;r32=r22;r33=r23;r34=r18;r35=r19;r36=r3;r37=r5}else{r5=HEAPF32[r7];r3=HEAPF32[r7+1];r19=HEAPF32[r7+2];r18=HEAPF32[r7+3];r7=HEAPF32[r6];r23=HEAPF32[r6+1];r22=HEAPF32[r6+2];r21=HEAPF32[r6+3];r6=HEAP32[r9>>2];HEAP32[r1+56>>2]=1;r25=r2,r26=r25>>2;r10=r4,r27=r10>>2;r28=r6;r29=0;r30=r7;r31=r23;r32=r22;r33=r21;r34=r5;r35=r3;r36=r19;r37=r18}r18=HEAP32[r27+37];if((r28|0)<=-1){___assert_func(5252788,151,5260836,5254152)}r19=HEAP32[r26+37];if((r19|0)<=(r28|0)){___assert_func(5252788,151,5260836,5254152)}r3=HEAPF32[((r28<<3)+84>>2)+r26];r5=HEAPF32[((r28<<3)+88>>2)+r26];r26=r37*r3-r36*r5;r21=r36*r3+r37*r5;r5=r33*r26+r32*r21;r3=-r32;r22=r33*r21+r26*r3;L290:do{if((r18|0)>0){r26=0;r21=3.4028234663852886e+38;r23=0;while(1){r7=r5*HEAPF32[((r26<<3)+84>>2)+r27]+r22*HEAPF32[((r26<<3)+88>>2)+r27];r6=r7<r21;r10=r6?r26:r23;r4=r26+1|0;if((r4|0)==(r18|0)){r38=r10;break L290}else{r26=r4;r21=r6?r7:r21;r23=r10}}}else{r38=0}}while(0);r22=r38+1|0;r5=(r22|0)<(r18|0)?r22:0;r22=HEAPF32[((r38<<3)+20>>2)+r27];r18=HEAPF32[((r38<<3)+24>>2)+r27];r23=r30+(r33*r22-r32*r18);r21=r31+r32*r22+r33*r18;r18=r11;r22=(HEAPF32[tempDoublePtr>>2]=r23,HEAP32[tempDoublePtr>>2]);r26=(HEAPF32[tempDoublePtr>>2]=r21,HEAP32[tempDoublePtr>>2])|0;HEAP32[r18>>2]=0|r22;HEAP32[r18+4>>2]=r26;r26=r28&255;r18=r11+8|0;r22=r18;HEAP8[r18]=r26;r18=r38&255;HEAP8[r22+1|0]=r18;HEAP8[r22+2|0]=1;HEAP8[r22+3|0]=0;r22=r11+12|0;r38=HEAPF32[((r5<<3)+20>>2)+r27];r10=HEAPF32[((r5<<3)+24>>2)+r27];r27=r30+(r33*r38-r32*r10);r7=r31+r32*r38+r33*r10;r10=r22;r38=(HEAPF32[tempDoublePtr>>2]=r27,HEAP32[tempDoublePtr>>2]);r6=(HEAPF32[tempDoublePtr>>2]=r7,HEAP32[tempDoublePtr>>2])|0;HEAP32[r10>>2]=0|r38;HEAP32[r10+4>>2]=r6;r6=r11+20|0;r10=r6;HEAP8[r6]=r26;HEAP8[r10+1|0]=r5&255;HEAP8[r10+2|0]=1;HEAP8[r10+3|0]=0;r10=r28+1|0;r5=(r10|0)<(r19|0)?r10:0;r10=(r28<<3)+r25+20|0;r28=HEAP32[r10+4>>2];r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAPF32[tempDoublePtr>>2]);r10=(HEAP32[tempDoublePtr>>2]=r28,HEAPF32[tempDoublePtr>>2]);r28=(r5<<3)+r25+20|0;r25=HEAP32[r28+4>>2];r6=(HEAP32[tempDoublePtr>>2]=HEAP32[r28>>2],HEAPF32[tempDoublePtr>>2]);r28=(HEAP32[tempDoublePtr>>2]=r25,HEAPF32[tempDoublePtr>>2]);r25=r6-r19;r38=r28-r10;r4=Math.sqrt(r25*r25+r38*r38);if(r4<1.1920928955078125e-7){r39=r25;r40=r38}else{r2=1/r4;r39=r25*r2;r40=r38*r2}r2=r37*r39-r36*r40;r38=r37*r40+r36*r39;r25=r2*-1;r4=r34+(r37*r19-r36*r10);r9=r35+r36*r19+r37*r10;r20=r4*r38+r9*r25;r24=r17-(r4*r2+r9*r38);r9=r17+(r34+(r37*r6-r36*r28))*r2+(r35+r36*r6+r37*r28)*r38;r37=-r2;r36=-r38;r35=r23*r37+r21*r36-r24;r34=r27*r37+r7*r36-r24;if(r35>0){r41=0}else{r24=r12>>2;r36=r11>>2;HEAP32[r24]=HEAP32[r36];HEAP32[r24+1]=HEAP32[r36+1];HEAP32[r24+2]=HEAP32[r36+2];r41=1}if(r34>0){r42=r41}else{r36=(r12+(r41*12&-1)|0)>>2;r24=r22>>2;HEAP32[r36]=HEAP32[r24];HEAP32[r36+1]=HEAP32[r24+1];HEAP32[r36+2]=HEAP32[r24+2];r42=r41+1|0}if(r35*r34<0){r41=r35/(r35-r34);r34=r12+(r42*12&-1)|0;r35=(HEAPF32[tempDoublePtr>>2]=r23+r41*(r27-r23),HEAP32[tempDoublePtr>>2]);r23=(HEAPF32[tempDoublePtr>>2]=r21+r41*(r7-r21),HEAP32[tempDoublePtr>>2])|0;HEAP32[r34>>2]=0|r35;HEAP32[r34+4>>2]=r23;r23=r12+(r42*12&-1)+8|0;r34=r23;HEAP8[r23]=r26;HEAP8[r34+1|0]=r18;HEAP8[r34+2|0]=0;HEAP8[r34+3|0]=1;r43=r42+1|0}else{r43=r42}if((r43|0)<2){STACKTOP=r8;return}r43=HEAPF32[r13];r42=HEAPF32[r13+1];r34=r2*r43+r38*r42-r9;r18=r12+12|0;r26=HEAPF32[r18>>2];r23=HEAPF32[r13+4];r13=r2*r26+r38*r23-r9;if(r34>0){r44=0}else{r9=r14>>2;r2=r12>>2;HEAP32[r9]=HEAP32[r2];HEAP32[r9+1]=HEAP32[r2+1];HEAP32[r9+2]=HEAP32[r2+2];r44=1}if(r13>0){r45=r44}else{r2=(r14+(r44*12&-1)|0)>>2;r9=r18>>2;HEAP32[r2]=HEAP32[r9];HEAP32[r2+1]=HEAP32[r9+1];HEAP32[r2+2]=HEAP32[r9+2];r45=r44+1|0}if(r34*r13<0){r44=r34/(r34-r13);r13=r14+(r45*12&-1)|0;r34=(HEAPF32[tempDoublePtr>>2]=r43+r44*(r26-r43),HEAP32[tempDoublePtr>>2]);r43=(HEAPF32[tempDoublePtr>>2]=r42+r44*(r23-r42),HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r34;HEAP32[r13+4>>2]=r43;r43=r14+(r45*12&-1)+8|0;r14=r43;HEAP8[r43]=r5&255;HEAP8[r14+1|0]=HEAP8[r12+9|0];HEAP8[r14+2|0]=0;HEAP8[r14+3|0]=1;r46=r45+1|0}else{r46=r45}if((r46|0)<2){STACKTOP=r8;return}r46=r1+40|0;r45=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2]);r40=(HEAPF32[tempDoublePtr>>2]=r39*-1,HEAP32[tempDoublePtr>>2])|0;HEAP32[r46>>2]=0|r45;HEAP32[r46+4>>2]=r40;r40=r1+48|0;r46=(HEAPF32[tempDoublePtr>>2]=(r19+r6)*.5,HEAP32[tempDoublePtr>>2]);r6=(HEAPF32[tempDoublePtr>>2]=(r10+r28)*.5,HEAP32[tempDoublePtr>>2])|0;HEAP32[r40>>2]=0|r46;HEAP32[r40+4>>2]=r6;r6=HEAPF32[r15];r40=HEAPF32[r15+1];r46=r38*r6+r25*r40-r20>r17;do{if(r29<<24>>24==0){if(r46){r47=0}else{r28=r6-r30;r10=r40-r31;r19=r1;r45=(HEAPF32[tempDoublePtr>>2]=r33*r28+r32*r10,HEAP32[tempDoublePtr>>2]);r39=(HEAPF32[tempDoublePtr>>2]=r28*r3+r33*r10,HEAP32[tempDoublePtr>>2])|0;HEAP32[r19>>2]=0|r45;HEAP32[r19+4>>2]=r39;HEAP32[r1+16>>2]=HEAP32[r15+2];r47=1}r39=HEAPF32[r15+3];r19=HEAPF32[r15+4];if(r38*r39+r25*r19-r20>r17){r48=r47;break}r45=r39-r30;r39=r19-r31;r19=r1+(r47*20&-1)|0;r10=(HEAPF32[tempDoublePtr>>2]=r33*r45+r32*r39,HEAP32[tempDoublePtr>>2]);r28=(HEAPF32[tempDoublePtr>>2]=r45*r3+r33*r39,HEAP32[tempDoublePtr>>2])|0;HEAP32[r19>>2]=0|r10;HEAP32[r19+4>>2]=r28;HEAP32[r1+(r47*20&-1)+16>>2]=HEAP32[r15+5];r48=r47+1|0}else{if(r46){r49=0}else{r28=r6-r30;r19=r40-r31;r10=r1;r39=(HEAPF32[tempDoublePtr>>2]=r33*r28+r32*r19,HEAP32[tempDoublePtr>>2]);r45=(HEAPF32[tempDoublePtr>>2]=r28*r3+r33*r19,HEAP32[tempDoublePtr>>2])|0;HEAP32[r10>>2]=0|r39;HEAP32[r10+4>>2]=r45;r45=r1+16|0;r10=HEAP32[r15+2];HEAP32[r45>>2]=r10;r39=r45;HEAP8[r45]=r10>>>8&255;HEAP8[r39+1|0]=r10&255;HEAP8[r39+2|0]=r10>>>24&255;HEAP8[r39+3|0]=r10>>>16&255;r49=1}r10=HEAPF32[r15+3];r39=HEAPF32[r15+4];if(r38*r10+r25*r39-r20>r17){r48=r49;break}r45=r10-r30;r10=r39-r31;r39=r1+(r49*20&-1)|0;r19=(HEAPF32[tempDoublePtr>>2]=r33*r45+r32*r10,HEAP32[tempDoublePtr>>2]);r28=(HEAPF32[tempDoublePtr>>2]=r45*r3+r33*r10,HEAP32[tempDoublePtr>>2])|0;HEAP32[r39>>2]=0|r19;HEAP32[r39+4>>2]=r28;r28=r1+(r49*20&-1)+16|0;r39=HEAP32[r15+5];HEAP32[r28>>2]=r39;r19=r28;HEAP8[r28]=r39>>>8&255;HEAP8[r19+1|0]=r39&255;HEAP8[r19+2|0]=r39>>>24&255;HEAP8[r19+3|0]=r39>>>16&255;r48=r49+1|0}}while(0);HEAP32[r16>>2]=r48;STACKTOP=r8;return}function __ZL16b2EdgeSeparationPK14b2PolygonShapeRK11b2TransformiS1_S4_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r6=r4>>2;r4=r1>>2;r1=HEAP32[r6+37];if((r3|0)<=-1){___assert_func(5252788,32,5260976,5254152)}if((HEAP32[r4+37]|0)<=(r3|0)){___assert_func(5252788,32,5260976,5254152)}r7=HEAPF32[r2+12>>2];r8=HEAPF32[((r3<<3)+84>>2)+r4];r9=HEAPF32[r2+8>>2];r10=HEAPF32[((r3<<3)+88>>2)+r4];r11=r7*r8-r9*r10;r12=r8*r9+r7*r10;r10=HEAPF32[r5+12>>2];r8=HEAPF32[r5+8>>2];r13=r10*r11+r8*r12;r14=r10*r12+r11*-r8;L341:do{if((r1|0)>0){r15=0;r16=3.4028234663852886e+38;r17=0;while(1){r18=r13*HEAPF32[((r15<<3)+20>>2)+r6]+r14*HEAPF32[((r15<<3)+24>>2)+r6];r19=r18<r16;r20=r19?r15:r17;r21=r15+1|0;if((r21|0)==(r1|0)){r22=r20;break L341}else{r15=r21;r16=r19?r18:r16;r17=r20}}}else{r22=0}}while(0);r1=HEAPF32[((r3<<3)+20>>2)+r4];r14=HEAPF32[((r3<<3)+24>>2)+r4];r4=HEAPF32[((r22<<3)+20>>2)+r6];r3=HEAPF32[((r22<<3)+24>>2)+r6];return r11*(HEAPF32[r5>>2]+(r10*r4-r8*r3)-(HEAPF32[r2>>2]+(r7*r1-r9*r14)))+r12*(r4*r8+r10*r3+HEAPF32[r5+4>>2]-(r1*r9+r7*r14+HEAPF32[r2+4>>2]))}function __ZNK6b2AABB7RayCastEP15b2RayCastOutputRK14b2RayCastInput(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;r6=r3;r7=HEAP32[r6+4>>2];r8=HEAPF32[r3+8>>2];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAPF32[tempDoublePtr>>2]);r6=r8-r9;r8=HEAPF32[r3+12>>2]-HEAPF32[r3+4>>2];r10=(HEAP32[tempDoublePtr>>2]=r7,HEAPF32[tempDoublePtr>>2]);if(r6>0){r11=r6}else{r11=-r6}if(r8>0){r12=r8}else{r12=-r8}r7=(r1|0)>>2;r13=(r1+8|0)>>2;r1=(r5|0)>>2;r14=r5+4|0;do{if(r11<1.1920928955078125e-7){if(r9<HEAPF32[r7]){r15=0;STACKTOP=r4;return r15}if(HEAPF32[r13]<r9){r15=0}else{r16=3.4028234663852886e+38;r17=-3.4028234663852886e+38;break}STACKTOP=r4;return r15}else{r18=1/r6;r19=r18*(HEAPF32[r7]-r9);r20=r18*(HEAPF32[r13]-r9);r18=r19>r20;r21=r18?r20:r19;r22=r18?r19:r20;if(r21>-3.4028234663852886e+38){HEAPF32[r14>>2]=0;HEAPF32[r1]=r18?1:-1;r23=r21}else{r23=-3.4028234663852886e+38}r21=r22>3.4028234663852886e+38?3.4028234663852886e+38:r22;if(r23>r21){r15=0}else{r16=r21;r17=r23;break}STACKTOP=r4;return r15}}while(0);do{if(r12<1.1920928955078125e-7){if(r10<HEAPF32[r7+1]){r15=0;STACKTOP=r4;return r15}if(HEAPF32[r13+1]<r10){r15=0}else{r24=r17;break}STACKTOP=r4;return r15}else{r23=1/r8;r14=r23*(HEAPF32[r7+1]-r10);r9=r23*(HEAPF32[r13+1]-r10);r23=r14>r9;r6=r23?r9:r14;r11=r23?r14:r9;if(r6>r17){HEAPF32[r1]=0;HEAPF32[r1+1]=r23?1:-1;r25=r6}else{r25=r17}if(r25>(r16<r11?r16:r11)){r15=0}else{r24=r25;break}STACKTOP=r4;return r15}}while(0);if(r24<0){r15=0;STACKTOP=r4;return r15}if(HEAPF32[r3+16>>2]<r24){r15=0;STACKTOP=r4;return r15}HEAPF32[r2+8>>2]=r24;r24=r5;r5=r2;r2=HEAP32[r24+4>>2];HEAP32[r5>>2]=HEAP32[r24>>2];HEAP32[r5+4>>2]=r2;r15=1;STACKTOP=r4;return r15}function __ZN15b2WorldManifold10InitializeEPK10b2ManifoldRK11b2TransformfS5_f(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r7=r5>>2;r8=r3>>2;r9=r2>>2;r10=(r2+60|0)>>2;if((HEAP32[r10]|0)==0){return}r2=HEAP32[r9+14];if((r2|0)==0){r11=r1|0;HEAPF32[r11>>2]=1;r12=r1+4|0;HEAPF32[r12>>2]=0;r13=HEAPF32[r8+3];r14=HEAPF32[r9+12];r15=HEAPF32[r8+2];r16=HEAPF32[r9+13];r17=HEAPF32[r8]+(r13*r14-r15*r16);r18=r14*r15+r13*r16+HEAPF32[r8+1];r16=HEAPF32[r7+3];r13=HEAPF32[r9];r15=HEAPF32[r7+2];r14=HEAPF32[r9+1];r19=HEAPF32[r7]+(r16*r13-r15*r14);r20=r13*r15+r16*r14+HEAPF32[r7+1];r14=r17-r19;r16=r18-r20;do{if(r14*r14+r16*r16>1.4210854715202004e-14){r15=r19-r17;r13=r20-r18;r21=r1;r22=(HEAPF32[tempDoublePtr>>2]=r15,HEAP32[tempDoublePtr>>2]);r23=(HEAPF32[tempDoublePtr>>2]=r13,HEAP32[tempDoublePtr>>2])|0;HEAP32[r21>>2]=0|r22;HEAP32[r21+4>>2]=r23;r23=Math.sqrt(r15*r15+r13*r13);if(r23<1.1920928955078125e-7){r24=r15;r25=r13;break}r21=1/r23;r23=r15*r21;HEAPF32[r11>>2]=r23;r15=r13*r21;HEAPF32[r12>>2]=r15;r24=r23;r25=r15}else{r24=1;r25=0}}while(0);r12=r1+8|0;r11=(HEAPF32[tempDoublePtr>>2]=(r17+r24*r4+(r19-r24*r6))*.5,HEAP32[tempDoublePtr>>2]);r24=(HEAPF32[tempDoublePtr>>2]=(r18+r25*r4+(r20-r25*r6))*.5,HEAP32[tempDoublePtr>>2])|0;HEAP32[r12>>2]=0|r11;HEAP32[r12+4>>2]=r24;return}else if((r2|0)==1){r24=r3+12|0;r12=HEAPF32[r24>>2];r11=HEAPF32[r9+10];r25=r3+8|0;r20=HEAPF32[r25>>2];r18=HEAPF32[r9+11];r19=r12*r11-r20*r18;r17=r11*r20+r12*r18;r18=r1;r12=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2]);r20=(HEAPF32[tempDoublePtr>>2]=r17,HEAP32[tempDoublePtr>>2])|0;HEAP32[r18>>2]=0|r12;HEAP32[r18+4>>2]=r20;r20=HEAPF32[r24>>2];r24=HEAPF32[r9+12];r18=HEAPF32[r25>>2];r25=HEAPF32[r9+13];r12=HEAPF32[r8]+(r20*r24-r18*r25);r11=r24*r18+r20*r25+HEAPF32[r8+1];if((HEAP32[r10]|0)<=0){return}r8=r5+12|0;r25=r5+8|0;r20=r5|0;r18=r5+4|0;r24=r1|0;r16=r1+4|0;r14=0;r15=r19;r19=r17;while(1){r17=HEAPF32[r8>>2];r23=HEAPF32[((r14*20&-1)>>2)+r9];r21=HEAPF32[r25>>2];r13=HEAPF32[((r14*20&-1)+4>>2)+r9];r22=HEAPF32[r20>>2]+(r17*r23-r21*r13);r26=r23*r21+r17*r13+HEAPF32[r18>>2];r13=r4-(r15*(r22-r12)+(r26-r11)*r19);r17=(r14<<3)+r1+8|0;r21=(HEAPF32[tempDoublePtr>>2]=(r22-r15*r6+r22+r15*r13)*.5,HEAP32[tempDoublePtr>>2]);r22=(HEAPF32[tempDoublePtr>>2]=(r26-r19*r6+r26+r19*r13)*.5,HEAP32[tempDoublePtr>>2])|0;HEAP32[r17>>2]=0|r21;HEAP32[r17+4>>2]=r22;r22=r14+1|0;if((r22|0)>=(HEAP32[r10]|0)){break}r14=r22;r15=HEAPF32[r24>>2];r19=HEAPF32[r16>>2]}return}else if((r2|0)==2){r2=r5+12|0;r16=HEAPF32[r2>>2];r19=HEAPF32[r9+10];r24=r5+8|0;r5=HEAPF32[r24>>2];r15=HEAPF32[r9+11];r14=r16*r19-r5*r15;r11=r19*r5+r16*r15;r15=r1>>2;r16=(HEAPF32[tempDoublePtr>>2]=r14,HEAP32[tempDoublePtr>>2]);r5=(HEAPF32[tempDoublePtr>>2]=r11,HEAP32[tempDoublePtr>>2])|0;HEAP32[r15]=0|r16;HEAP32[r15+1]=r5;r5=HEAPF32[r2>>2];r2=HEAPF32[r9+12];r16=HEAPF32[r24>>2];r24=HEAPF32[r9+13];r19=HEAPF32[r7]+(r5*r2-r16*r24);r12=r2*r16+r5*r24+HEAPF32[r7+1];L403:do{if((HEAP32[r10]|0)>0){r7=r3+12|0;r24=r3+8|0;r5=r3|0;r16=r3+4|0;r2=r1|0;r18=r1+4|0;r20=0;r25=r14;r8=r11;while(1){r22=HEAPF32[r7>>2];r17=HEAPF32[((r20*20&-1)>>2)+r9];r21=HEAPF32[r24>>2];r13=HEAPF32[((r20*20&-1)+4>>2)+r9];r26=HEAPF32[r5>>2]+(r22*r17-r21*r13);r23=r17*r21+r22*r13+HEAPF32[r16>>2];r13=r6-(r25*(r26-r19)+(r23-r12)*r8);r22=(r20<<3)+r1+8|0;r21=(HEAPF32[tempDoublePtr>>2]=(r26-r25*r4+r26+r25*r13)*.5,HEAP32[tempDoublePtr>>2]);r26=(HEAPF32[tempDoublePtr>>2]=(r23-r8*r4+r23+r8*r13)*.5,HEAP32[tempDoublePtr>>2])|0;HEAP32[r22>>2]=0|r21;HEAP32[r22+4>>2]=r26;r26=r20+1|0;r22=HEAPF32[r2>>2];r21=HEAPF32[r18>>2];if((r26|0)<(HEAP32[r10]|0)){r20=r26;r25=r22;r8=r21}else{r27=r22;r28=r21;break L403}}}else{r27=r14;r28=r11}}while(0);r11=(HEAPF32[tempDoublePtr>>2]=-r27,HEAP32[tempDoublePtr>>2]);r27=(HEAPF32[tempDoublePtr>>2]=-r28,HEAP32[tempDoublePtr>>2])|0;HEAP32[r15]=0|r11;HEAP32[r15+1]=r27;return}else{return}}function __ZN9b2Simplex6Solve3Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=r1>>2;r3=r1+16|0;r4=HEAP32[r3+4>>2];r5=(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAPF32[tempDoublePtr>>2]);r3=(HEAP32[tempDoublePtr>>2]=r4,HEAPF32[tempDoublePtr>>2]);r4=r1+36|0;r6=r1+52|0;r7=HEAP32[r6+4>>2];r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAPF32[tempDoublePtr>>2]);r6=(HEAP32[tempDoublePtr>>2]=r7,HEAPF32[tempDoublePtr>>2]);r7=r1+72|0;r9=r1+88|0;r10=HEAP32[r9+4>>2];r11=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAPF32[tempDoublePtr>>2]);r9=(HEAP32[tempDoublePtr>>2]=r10,HEAPF32[tempDoublePtr>>2]);r10=r8-r5;r12=r6-r3;r13=r5*r10+r3*r12;r14=r8*r10+r6*r12;r15=r11-r5;r16=r9-r3;r17=r5*r15+r3*r16;r18=r11*r15+r9*r16;r19=r11-r8;r20=r9-r6;r21=r8*r19+r6*r20;r22=r11*r19+r9*r20;r20=r10*r16-r12*r15;r15=(r8*r9-r6*r11)*r20;r12=(r3*r11-r5*r9)*r20;r9=(r5*r6-r3*r8)*r20;if(!(r13<-0|r17<-0)){HEAPF32[r2+6]=1;HEAP32[r2+27]=1;return}if(!(r13>=-0|r14<=0|r9>0)){r20=1/(r14-r13);HEAPF32[r2+6]=r14*r20;HEAPF32[r2+15]=r20*-r13;HEAP32[r2+27]=2;return}if(!(r17>=-0|r18<=0|r12>0)){r13=1/(r18-r17);HEAPF32[r2+6]=r18*r13;HEAPF32[r2+24]=r13*-r17;HEAP32[r2+27]=2;_memcpy(r4,r7,36);return}if(!(r14>0|r21<-0)){HEAPF32[r2+15]=1;HEAP32[r2+27]=1;_memcpy(r1,r4,36);return}if(!(r18>0|r22>0)){HEAPF32[r2+24]=1;HEAP32[r2+27]=1;_memcpy(r1,r7,36);return}if(r21>=-0|r22<=0|r15>0){r18=1/(r9+r15+r12);HEAPF32[r2+6]=r15*r18;HEAPF32[r2+15]=r12*r18;HEAPF32[r2+24]=r9*r18;HEAP32[r2+27]=3;return}else{r18=1/(r22-r21);HEAPF32[r2+15]=r22*r18;HEAPF32[r2+24]=r18*-r21;HEAP32[r2+27]=2;_memcpy(r1,r7,36);return}}function __ZN15b2DistanceProxy3SetEPK7b2Shapei(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=r2>>2;r5=r1>>2;r6=HEAP32[r4+1];if((r6|0)==0){HEAP32[r5+4]=r2+12|0;HEAP32[r5+5]=1;HEAPF32[r5+6]=HEAPF32[r4+2];return}else if((r6|0)==3){if((r3|0)<=-1){___assert_func(5248104,53,5259868,5253320)}r7=r2+16|0;if((HEAP32[r7>>2]|0)<=(r3|0)){___assert_func(5248104,53,5259868,5253320)}r8=r2+12|0;r9=(r3<<3)+HEAP32[r8>>2]|0;r10=r1;r11=HEAP32[r9+4>>2];HEAP32[r10>>2]=HEAP32[r9>>2];HEAP32[r10+4>>2]=r11;r11=r3+1|0;r3=r1+8|0;r10=HEAP32[r8>>2];if((r11|0)<(HEAP32[r7>>2]|0)){r7=(r11<<3)+r10|0;r11=r3;r8=HEAP32[r7+4>>2];HEAP32[r11>>2]=HEAP32[r7>>2];HEAP32[r11+4>>2]=r8}else{r8=r10;r10=r3;r3=HEAP32[r8+4>>2];HEAP32[r10>>2]=HEAP32[r8>>2];HEAP32[r10+4>>2]=r3}HEAP32[r5+4]=r1|0;HEAP32[r5+5]=2;HEAPF32[r5+6]=HEAPF32[r4+2];return}else if((r6|0)==2){HEAP32[r5+4]=r2+20|0;HEAP32[r5+5]=HEAP32[r4+37];HEAPF32[r5+6]=HEAPF32[r4+2];return}else if((r6|0)==1){HEAP32[r5+4]=r2+12|0;HEAP32[r5+5]=2;HEAPF32[r5+6]=HEAPF32[r4+2];return}else{___assert_func(5248104,81,5259868,5254044)}}function __Z10b2DistanceP16b2DistanceOutputP14b2SimplexCachePK15b2DistanceInput(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+168|0;r6=r5,r7=r6>>2;r8=r5+16,r9=r8>>2;r10=r5+32;r11=r5+144;r12=r5+156;HEAP32[1311762]=HEAP32[1311762]+1|0;r13=r6>>2;r14=(r3+56|0)>>2;HEAP32[r13]=HEAP32[r14];HEAP32[r13+1]=HEAP32[r14+1];HEAP32[r13+2]=HEAP32[r14+2];HEAP32[r13+3]=HEAP32[r14+3];r14=r8>>2;r13=(r3+72|0)>>2;HEAP32[r14]=HEAP32[r13];HEAP32[r14+1]=HEAP32[r13+1];HEAP32[r14+2]=HEAP32[r13+2];HEAP32[r14+3]=HEAP32[r13+3];__ZN9b2Simplex9ReadCacheEPK14b2SimplexCachePK15b2DistanceProxyRK11b2TransformS5_S8_(r10,r2,r3|0,r6,r3+28|0,r8);r8=r10|0,r6=r8>>2;r13=(r10+108|0)>>2;r14=HEAP32[r13];if((r14|0)==1|(r14|0)==2|(r14|0)==3){r15=(r10+16|0)>>2;r16=(r10+20|0)>>2;r17=HEAPF32[r7+3];r18=HEAPF32[r7+2];r19=r3+16|0;r20=r3+20|0;r21=HEAPF32[r7];r22=HEAPF32[r7+1];r7=HEAPF32[r9+3];r23=HEAPF32[r9+2];r24=-r23;r25=r3+44|0;r26=r3+48|0;r27=HEAPF32[r9];r28=HEAPF32[r9+1];r9=(r10+52|0)>>2;r29=(r10+56|0)>>2;r30=r10+16|0;r31=r10+52|0;r32=r10+24|0;r33=r10+60|0;r34=r10;r35=r10+36|0;r36=0;r37=r14;L461:while(1){r38=(r37|0)>0;L463:do{if(r38){r39=0;while(1){HEAP32[r11+(r39<<2)>>2]=HEAP32[((r39*36&-1)+28>>2)+r6];HEAP32[r12+(r39<<2)>>2]=HEAP32[((r39*36&-1)+32>>2)+r6];r40=r39+1|0;if((r40|0)==(r37|0)){break L463}else{r39=r40}}}}while(0);do{if((r37|0)==2){r39=HEAP32[r30+4>>2];r40=(HEAP32[tempDoublePtr>>2]=HEAP32[r30>>2],HEAPF32[tempDoublePtr>>2]);r41=(HEAP32[tempDoublePtr>>2]=r39,HEAPF32[tempDoublePtr>>2]);r39=HEAP32[r31+4>>2];r42=(HEAP32[tempDoublePtr>>2]=HEAP32[r31>>2],HEAPF32[tempDoublePtr>>2]);r43=(HEAP32[tempDoublePtr>>2]=r39,HEAPF32[tempDoublePtr>>2]);r39=r42-r40;r44=r43-r41;r45=r40*r39+r41*r44;if(r45>=-0){HEAPF32[r32>>2]=1;HEAP32[r13]=1;r4=356;break}r41=r42*r39+r43*r44;if(r41>0){r44=1/(r41-r45);HEAPF32[r32>>2]=r41*r44;HEAPF32[r33>>2]=r44*-r45;HEAP32[r13]=2;r4=357;break}else{HEAPF32[r33>>2]=1;HEAP32[r13]=1;_memcpy(r34,r35,36);r4=356;break}}else if((r37|0)==3){__ZN9b2Simplex6Solve3Ev(r10);r45=HEAP32[r13];if((r45|0)==0){r4=354;break L461}else if((r45|0)==1){r4=356;break}else if((r45|0)==2){r4=357;break}else if((r45|0)==3){r46=r36;r4=381;break L461}else{r4=355;break L461}}else if((r37|0)==1){r4=356}else{r4=352;break L461}}while(0);do{if(r4==356){r4=0;r47=-HEAPF32[r15];r48=-HEAPF32[r16];r49=1}else if(r4==357){r4=0;r45=HEAPF32[r15];r44=HEAPF32[r9]-r45;r41=HEAPF32[r16];r43=HEAPF32[r29]-r41;if(r44*-r41-r43*-r45>0){r47=r43*-1;r48=r44;r49=2;break}else{r47=r43;r48=r44*-1;r49=2;break}}}while(0);if(r48*r48+r47*r47<1.4210854715202004e-14){r46=r36;r4=381;break}r44=r8+(r49*36&-1)|0;r43=-r48;r45=r17*-r47+r18*r43;r41=r17*r43+r47*r18;r43=HEAP32[r19>>2]>>2;r39=HEAP32[r20>>2];if((r39|0)>1){r42=r41*HEAPF32[r43+1]+r45*HEAPF32[r43];r40=1;r50=0;while(1){r51=r45*HEAPF32[(r40<<3>>2)+r43]+r41*HEAPF32[((r40<<3)+4>>2)+r43];r52=r51>r42;r53=r52?r40:r50;r54=r40+1|0;if((r54|0)==(r39|0)){break}else{r42=r52?r51:r42;r40=r54;r50=r53}}r50=r8+(r49*36&-1)+28|0;HEAP32[r50>>2]=r53;if((r53|0)>-1){r55=r53;r56=r50}else{r4=395;break}}else{r50=r8+(r49*36&-1)+28|0;HEAP32[r50>>2]=0;r55=0;r56=r50}if((r39|0)<=(r55|0)){r4=396;break}r50=HEAPF32[(r55<<3>>2)+r43];r40=HEAPF32[((r55<<3)+4>>2)+r43];r42=r21+(r17*r50-r18*r40);r41=r44;r45=(HEAPF32[tempDoublePtr>>2]=r42,HEAP32[tempDoublePtr>>2]);r54=(HEAPF32[tempDoublePtr>>2]=r50*r18+r17*r40+r22,HEAP32[tempDoublePtr>>2])|0;HEAP32[r41>>2]=0|r45;HEAP32[r41+4>>2]=r54;r54=r47*r7+r48*r23;r41=r48*r7+r47*r24;r45=HEAP32[r25>>2]>>2;r40=HEAP32[r26>>2];if((r40|0)>1){r50=r41*HEAPF32[r45+1]+r54*HEAPF32[r45];r51=1;r52=0;while(1){r57=r54*HEAPF32[(r51<<3>>2)+r45]+r41*HEAPF32[((r51<<3)+4>>2)+r45];r58=r57>r50;r59=r58?r51:r52;r60=r51+1|0;if((r60|0)==(r40|0)){break}else{r50=r58?r57:r50;r51=r60;r52=r59}}r52=r8+(r49*36&-1)+32|0;HEAP32[r52>>2]=r59;if((r59|0)>-1){r61=r59;r62=r52}else{r4=397;break}}else{r52=r8+(r49*36&-1)+32|0;HEAP32[r52>>2]=0;r61=0;r62=r52}if((r40|0)<=(r61|0)){r4=398;break}r52=HEAPF32[(r61<<3>>2)+r45];r51=HEAPF32[((r61<<3)+4>>2)+r45];r50=r27+(r7*r52-r23*r51);r41=r8+(r49*36&-1)+8|0;r54=(HEAPF32[tempDoublePtr>>2]=r50,HEAP32[tempDoublePtr>>2]);r44=(HEAPF32[tempDoublePtr>>2]=r52*r23+r7*r51+r28,HEAP32[tempDoublePtr>>2])|0;HEAP32[r41>>2]=0|r54;HEAP32[r41+4>>2]=r44;r44=HEAPF32[((r49*36&-1)+12>>2)+r6]-HEAPF32[((r49*36&-1)+4>>2)+r6];r41=r8+(r49*36&-1)+16|0;r54=(HEAPF32[tempDoublePtr>>2]=r50-r42,HEAP32[tempDoublePtr>>2]);r50=(HEAPF32[tempDoublePtr>>2]=r44,HEAP32[tempDoublePtr>>2])|0;HEAP32[r41>>2]=0|r54;HEAP32[r41+4>>2]=r50;r50=r36+1|0;HEAP32[1311761]=HEAP32[1311761]+1|0;L500:do{if(r38){r41=HEAP32[r56>>2];r54=0;while(1){if((r41|0)==(HEAP32[r11+(r54<<2)>>2]|0)){if((HEAP32[r62>>2]|0)==(HEAP32[r12+(r54<<2)>>2]|0)){r46=r50;r4=381;break L461}}r44=r54+1|0;if((r44|0)<(r37|0)){r54=r44}else{break L500}}}}while(0);r38=HEAP32[r13]+1|0;HEAP32[r13]=r38;if((r50|0)<20){r36=r50;r37=r38}else{r46=r50;r4=381;break}}if(r4==352){___assert_func(5248104,498,5261332,5254044)}else if(r4==354){___assert_func(5248104,194,5255956,5254044)}else if(r4==355){___assert_func(5248104,207,5255956,5254044)}else if(r4==381){r37=HEAP32[1311760];HEAP32[1311760]=(r37|0)>(r46|0)?r37:r46;r37=r1+8|0;__ZNK9b2Simplex16GetWitnessPointsEP6b2Vec2S1_(r10,r1|0,r37);r36=(r1|0)>>2;r12=(r37|0)>>2;r62=HEAPF32[r36]-HEAPF32[r12];r11=(r1+4|0)>>2;r56=(r1+12|0)>>2;r49=HEAPF32[r11]-HEAPF32[r56];r8=(r1+16|0)>>2;HEAPF32[r8]=Math.sqrt(r62*r62+r49*r49);HEAP32[r1+20>>2]=r46;r46=HEAP32[r13];if((r46|0)==0){___assert_func(5248104,246,5255856,5254044)}else if((r46|0)==2){r13=HEAPF32[r15]-HEAPF32[r9];r49=HEAPF32[r16]-HEAPF32[r29];r63=Math.sqrt(r13*r13+r49*r49)}else if((r46|0)==3){r49=HEAPF32[r15];r15=HEAPF32[r16];r63=(HEAPF32[r9]-r49)*(HEAPF32[r10+92>>2]-r15)-(HEAPF32[r29]-r15)*(HEAPF32[r10+88>>2]-r49)}else if((r46|0)==1){r63=0}else{___assert_func(5248104,259,5255856,5254044)}HEAPF32[r2>>2]=r63;HEAP16[r2+4>>1]=r46&65535;r63=0;while(1){HEAP8[r2+(r63+6)|0]=HEAP32[((r63*36&-1)+28>>2)+r6]&255;HEAP8[r2+(r63+9)|0]=HEAP32[((r63*36&-1)+32>>2)+r6]&255;r49=r63+1|0;if((r49|0)<(r46|0)){r63=r49}else{break}}if((HEAP8[r3+88|0]&1)<<24>>24==0){STACKTOP=r5;return}r63=HEAPF32[r3+24>>2];r46=HEAPF32[r3+52>>2];r3=HEAPF32[r8];r6=r63+r46;if(!(r3>r6&r3>1.1920928955078125e-7)){r2=(HEAPF32[r11]+HEAPF32[r56])*.5;r49=r1;r1=0|(HEAPF32[tempDoublePtr>>2]=(HEAPF32[r36]+HEAPF32[r12])*.5,HEAP32[tempDoublePtr>>2]);r10=(HEAPF32[tempDoublePtr>>2]=r2,HEAP32[tempDoublePtr>>2])|0;HEAP32[r49>>2]=r1;HEAP32[r49+4>>2]=r10;r49=r37;HEAP32[r49>>2]=r1;HEAP32[r49+4>>2]=r10;HEAPF32[r8]=0;STACKTOP=r5;return}HEAPF32[r8]=r3-r6;r6=HEAPF32[r12];r3=HEAPF32[r36];r8=r6-r3;r10=HEAPF32[r56];r49=HEAPF32[r11];r1=r10-r49;r37=Math.sqrt(r8*r8+r1*r1);if(r37<1.1920928955078125e-7){r64=r8;r65=r1}else{r2=1/r37;r64=r8*r2;r65=r1*r2}HEAPF32[r36]=r63*r64+r3;HEAPF32[r11]=r63*r65+r49;HEAPF32[r12]=r6-r46*r64;HEAPF32[r56]=r10-r46*r65;STACKTOP=r5;return}else if(r4==395){___assert_func(5250220,103,5256152,5249104)}else if(r4==396){___assert_func(5250220,103,5256152,5249104)}else if(r4==397){___assert_func(5250220,103,5256152,5249104)}else if(r4==398){___assert_func(5250220,103,5256152,5249104)}}else if((r14|0)==0){___assert_func(5248104,194,5255956,5254044)}else{___assert_func(5248104,207,5255956,5254044)}}function __ZN9b2Simplex9ReadCacheEPK14b2SimplexCachePK15b2DistanceProxyRK11b2TransformS5_S8_(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r7=r1>>2;r8=0;r9=HEAP16[r2+4>>1];if((r9&65535)>=4){___assert_func(5248104,102,5257084,5248580)}r10=r9&65535;r11=(r1+108|0)>>2;HEAP32[r11]=r10;r12=r1|0,r13=r12>>2;L542:do{if(r9<<16>>16==0){r14=r10}else{r15=r3+20|0;r16=r3+16|0;r17=r5+20|0;r18=r5+16|0;r19=r4+12|0;r20=r4+8|0;r21=r4|0;r22=r4+4|0;r23=r6+12|0;r24=r6+8|0;r25=r6|0;r26=r6+4|0;r27=0;while(1){r28=HEAPU8[r2+(r27+6)|0];HEAP32[((r27*36&-1)+28>>2)+r13]=r28;r29=HEAPU8[r2+(r27+9)|0];HEAP32[((r27*36&-1)+32>>2)+r13]=r29;if((HEAP32[r15>>2]|0)<=(r28|0)){r8=407;break}r30=(r28<<3)+HEAP32[r16>>2]|0;r28=HEAP32[r30+4>>2];r31=(HEAP32[tempDoublePtr>>2]=HEAP32[r30>>2],HEAPF32[tempDoublePtr>>2]);r30=(HEAP32[tempDoublePtr>>2]=r28,HEAPF32[tempDoublePtr>>2]);if((HEAP32[r17>>2]|0)<=(r29|0)){r8=409;break}r28=(r29<<3)+HEAP32[r18>>2]|0;r29=HEAP32[r28+4>>2];r32=(HEAP32[tempDoublePtr>>2]=HEAP32[r28>>2],HEAPF32[tempDoublePtr>>2]);r28=(HEAP32[tempDoublePtr>>2]=r29,HEAPF32[tempDoublePtr>>2]);r29=HEAPF32[r19>>2];r33=HEAPF32[r20>>2];r34=HEAPF32[r21>>2]+(r31*r29-r30*r33);r35=r30*r29+r31*r33+HEAPF32[r22>>2];r33=r12+(r27*36&-1)|0;r31=(HEAPF32[tempDoublePtr>>2]=r34,HEAP32[tempDoublePtr>>2]);r29=(HEAPF32[tempDoublePtr>>2]=r35,HEAP32[tempDoublePtr>>2])|0;HEAP32[r33>>2]=0|r31;HEAP32[r33+4>>2]=r29;r29=HEAPF32[r23>>2];r33=HEAPF32[r24>>2];r31=HEAPF32[r25>>2]+(r32*r29-r28*r33);r35=r28*r29+r32*r33+HEAPF32[r26>>2];r33=r12+(r27*36&-1)+8|0;r32=(HEAPF32[tempDoublePtr>>2]=r31,HEAP32[tempDoublePtr>>2]);r29=(HEAPF32[tempDoublePtr>>2]=r35,HEAP32[tempDoublePtr>>2])|0;HEAP32[r33>>2]=0|r32;HEAP32[r33+4>>2]=r29;r29=HEAPF32[((r27*36&-1)+12>>2)+r13]-HEAPF32[((r27*36&-1)+4>>2)+r13];r33=r12+(r27*36&-1)+16|0;r32=(HEAPF32[tempDoublePtr>>2]=r31-r34,HEAP32[tempDoublePtr>>2]);r34=(HEAPF32[tempDoublePtr>>2]=r29,HEAP32[tempDoublePtr>>2])|0;HEAP32[r33>>2]=0|r32;HEAP32[r33+4>>2]=r34;HEAPF32[((r27*36&-1)+24>>2)+r13]=0;r34=r27+1|0;r33=HEAP32[r11];if((r34|0)<(r33|0)){r27=r34}else{r14=r33;break L542}}if(r8==407){___assert_func(5250220,103,5256152,5249104)}else if(r8==409){___assert_func(5250220,103,5256152,5249104)}}}while(0);do{if((r14|0)>1){r13=HEAPF32[r2>>2];if((r14|0)==2){r12=HEAPF32[r7+4]-HEAPF32[r7+13];r10=HEAPF32[r7+5]-HEAPF32[r7+14];r36=Math.sqrt(r12*r12+r10*r10)}else if((r14|0)==3){r10=HEAPF32[r7+4];r12=HEAPF32[r7+5];r36=(HEAPF32[r7+13]-r10)*(HEAPF32[r7+23]-r12)-(HEAPF32[r7+14]-r12)*(HEAPF32[r7+22]-r10)}else{___assert_func(5248104,259,5255856,5254044)}if(r36>=r13*.5){if(!(r13*2<r36|r36<1.1920928955078125e-7)){r8=419;break}}HEAP32[r11]=0;break}else{r8=419}}while(0);do{if(r8==419){if((r14|0)==0){break}return}}while(0);HEAP32[r7+7]=0;HEAP32[r7+8]=0;if((HEAP32[r3+20>>2]|0)<=0){___assert_func(5250220,103,5256152,5249104)}r7=HEAP32[r3+16>>2];r3=HEAP32[r7+4>>2];r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAPF32[tempDoublePtr>>2]);r7=(HEAP32[tempDoublePtr>>2]=r3,HEAPF32[tempDoublePtr>>2]);if((HEAP32[r5+20>>2]|0)<=0){___assert_func(5250220,103,5256152,5249104)}r3=HEAP32[r5+16>>2];r5=HEAP32[r3+4>>2];r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAPF32[tempDoublePtr>>2]);r3=(HEAP32[tempDoublePtr>>2]=r5,HEAPF32[tempDoublePtr>>2]);r5=HEAPF32[r4+12>>2];r36=HEAPF32[r4+8>>2];r2=HEAPF32[r4>>2]+(r14*r5-r7*r36);r13=r7*r5+r14*r36+HEAPF32[r4+4>>2];r4=r1;r36=(HEAPF32[tempDoublePtr>>2]=r2,HEAP32[tempDoublePtr>>2]);r14=(HEAPF32[tempDoublePtr>>2]=r13,HEAP32[tempDoublePtr>>2])|0;HEAP32[r4>>2]=0|r36;HEAP32[r4+4>>2]=r14;r14=HEAPF32[r6+12>>2];r4=HEAPF32[r6+8>>2];r36=HEAPF32[r6>>2]+(r8*r14-r3*r4);r5=r3*r14+r8*r4+HEAPF32[r6+4>>2];r6=r1+8|0;r4=(HEAPF32[tempDoublePtr>>2]=r36,HEAP32[tempDoublePtr>>2]);r8=(HEAPF32[tempDoublePtr>>2]=r5,HEAP32[tempDoublePtr>>2])|0;HEAP32[r6>>2]=0|r4;HEAP32[r6+4>>2]=r8;r8=r1+16|0;r1=(HEAPF32[tempDoublePtr>>2]=r36-r2,HEAP32[tempDoublePtr>>2]);r2=(HEAPF32[tempDoublePtr>>2]=r5-r13,HEAP32[tempDoublePtr>>2])|0;HEAP32[r8>>2]=0|r1;HEAP32[r8+4>>2]=r2;HEAP32[r11]=1;return}function __ZNK9b2Simplex16GetWitnessPointsEP6b2Vec2S1_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12;r4=r1>>2;r5=HEAP32[r4+27];if((r5|0)==2){r6=r1+24|0;r7=HEAPF32[r6>>2];r8=r1+60|0;r9=HEAPF32[r8>>2];r10=r7*HEAPF32[r4+1]+r9*HEAPF32[r4+10];r11=r2;r12=(HEAPF32[tempDoublePtr>>2]=r7*HEAPF32[r4]+r9*HEAPF32[r4+9],HEAP32[tempDoublePtr>>2]);r9=(HEAPF32[tempDoublePtr>>2]=r10,HEAP32[tempDoublePtr>>2])|0;HEAP32[r11>>2]=0|r12;HEAP32[r11+4>>2]=r9;r9=HEAPF32[r6>>2];r6=HEAPF32[r8>>2];r8=r9*HEAPF32[r4+3]+r6*HEAPF32[r4+12];r11=r3;r12=(HEAPF32[tempDoublePtr>>2]=r9*HEAPF32[r4+2]+r6*HEAPF32[r4+11],HEAP32[tempDoublePtr>>2]);r6=(HEAPF32[tempDoublePtr>>2]=r8,HEAP32[tempDoublePtr>>2])|0;HEAP32[r11>>2]=0|r12;HEAP32[r11+4>>2]=r6;return}else if((r5|0)==1){r6=r1;r11=r2;r12=HEAP32[r6+4>>2];HEAP32[r11>>2]=HEAP32[r6>>2];HEAP32[r11+4>>2]=r12;r12=r1+8|0;r1=r3;r11=HEAP32[r12+4>>2];HEAP32[r1>>2]=HEAP32[r12>>2];HEAP32[r1+4>>2]=r11;return}else if((r5|0)==0){___assert_func(5248104,217,5255896,5254044)}else if((r5|0)==3){r5=HEAPF32[r4+6];r11=HEAPF32[r4+15];r1=HEAPF32[r4+24];r12=r5*HEAPF32[r4+1]+r11*HEAPF32[r4+10]+r1*HEAPF32[r4+19];r6=r2;r2=0|(HEAPF32[tempDoublePtr>>2]=r5*HEAPF32[r4]+r11*HEAPF32[r4+9]+r1*HEAPF32[r4+18],HEAP32[tempDoublePtr>>2]);r4=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2])|0;HEAP32[r6>>2]=r2;HEAP32[r6+4>>2]=r4;r6=r3;HEAP32[r6>>2]=r2;HEAP32[r6+4>>2]=r4;return}else{___assert_func(5248104,236,5255896,5254044)}}function __ZN13b2DynamicTree12AllocateNodeEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r2=(r1+16|0)>>2;r3=HEAP32[r2];if((r3|0)==-1){r4=r1+8|0,r5=r4>>2;r6=HEAP32[r5];r7=(r1+12|0)>>2;if((r6|0)!=(HEAP32[r7]|0)){___assert_func(5253852,61,5260432,5254832)}r8=r1+4|0,r9=r8>>2;r10=HEAP32[r9];HEAP32[r7]=r6<<1;r11=_malloc(r6*72&-1);HEAP32[r9]=r11;r6=r10;_memcpy(r11,r6,HEAP32[r5]*36&-1);_free(r6);r6=HEAP32[r5];r11=HEAP32[r7]-1|0;L590:do{if((r6|0)<(r11|0)){r10=r6;while(1){r12=r10+1|0;HEAP32[HEAP32[r9]+(r10*36&-1)+20>>2]=r12;HEAP32[HEAP32[r9]+(r10*36&-1)+32>>2]=-1;r13=HEAP32[r7]-1|0;if((r12|0)<(r13|0)){r10=r12}else{r14=r13;break L590}}}else{r14=r11}}while(0);HEAP32[HEAP32[r9]+(r14*36&-1)+20>>2]=-1;HEAP32[HEAP32[r9]+((HEAP32[r7]-1)*36&-1)+32>>2]=-1;r7=HEAP32[r5];HEAP32[r2]=r7;r15=r7;r7=r8,r16=r7>>2;r17=r4}else{r15=r3;r7=r1+4|0,r16=r7>>2;r17=r1+8|0}r1=HEAP32[r16]+(r15*36&-1)+20|0;HEAP32[r2]=HEAP32[r1>>2];HEAP32[r1>>2]=-1;HEAP32[HEAP32[r16]+(r15*36&-1)+24>>2]=-1;HEAP32[HEAP32[r16]+(r15*36&-1)+28>>2]=-1;HEAP32[HEAP32[r16]+(r15*36&-1)+32>>2]=0;HEAP32[HEAP32[r16]+(r15*36&-1)+16>>2]=0;HEAP32[r17>>2]=HEAP32[r17>>2]+1|0;return r15}function __ZN13b2DynamicTree10InsertLeafEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r3=0;r4=r1+24|0;HEAP32[r4>>2]=HEAP32[r4>>2]+1|0;r4=(r1|0)>>2;r5=HEAP32[r4];if((r5|0)==-1){HEAP32[r4]=r2;HEAP32[HEAP32[r1+4>>2]+(r2*36&-1)+20>>2]=-1;return}r6=(r1+4|0)>>2;r7=HEAP32[r6]>>2;r8=HEAPF32[((r2*36&-1)>>2)+r7];r9=HEAPF32[((r2*36&-1)+4>>2)+r7];r10=HEAPF32[((r2*36&-1)+8>>2)+r7];r11=HEAPF32[((r2*36&-1)+12>>2)+r7];r12=HEAP32[((r5*36&-1)+24>>2)+r7];L600:do{if((r12|0)==-1){r13=r5}else{r14=r5;r15=r12;while(1){r16=HEAP32[((r14*36&-1)+28>>2)+r7];r17=HEAPF32[((r14*36&-1)+8>>2)+r7];r18=HEAPF32[((r14*36&-1)>>2)+r7];r19=HEAPF32[((r14*36&-1)+12>>2)+r7];r20=HEAPF32[((r14*36&-1)+4>>2)+r7];r21=((r17>r10?r17:r10)-(r18<r8?r18:r8)+((r19>r11?r19:r11)-(r20<r9?r20:r9)))*2;r22=r21*2;r23=(r21-(r17-r18+(r19-r20))*2)*2;r20=HEAPF32[((r15*36&-1)>>2)+r7];r19=r8<r20?r8:r20;r18=HEAPF32[((r15*36&-1)+4>>2)+r7];r17=r9<r18?r9:r18;r21=HEAPF32[((r15*36&-1)+8>>2)+r7];r24=r10>r21?r10:r21;r25=HEAPF32[((r15*36&-1)+12>>2)+r7];r26=r11>r25?r11:r25;if((HEAP32[((r15*36&-1)+24>>2)+r7]|0)==-1){r27=(r24-r19+(r26-r17))*2}else{r27=(r24-r19+(r26-r17))*2-(r21-r20+(r25-r18))*2}r18=r23+r27;r25=HEAPF32[((r16*36&-1)>>2)+r7];r20=r8<r25?r8:r25;r21=HEAPF32[((r16*36&-1)+4>>2)+r7];r17=r9<r21?r9:r21;r26=HEAPF32[((r16*36&-1)+8>>2)+r7];r19=r10>r26?r10:r26;r24=HEAPF32[((r16*36&-1)+12>>2)+r7];r28=r11>r24?r11:r24;if((HEAP32[((r16*36&-1)+24>>2)+r7]|0)==-1){r29=(r19-r20+(r28-r17))*2}else{r29=(r19-r20+(r28-r17))*2-(r26-r25+(r24-r21))*2}r21=r23+r29;if(r22<r18&r22<r21){r13=r14;break L600}r22=r18<r21?r15:r16;r16=HEAP32[((r22*36&-1)+24>>2)+r7];if((r16|0)==-1){r13=r22;break L600}else{r14=r22;r15=r16}}}}while(0);r29=HEAP32[((r13*36&-1)+20>>2)+r7];r7=__ZN13b2DynamicTree12AllocateNodeEv(r1);HEAP32[HEAP32[r6]+(r7*36&-1)+20>>2]=r29;HEAP32[HEAP32[r6]+(r7*36&-1)+16>>2]=0;r27=HEAP32[r6],r12=r27>>2;r5=HEAPF32[((r13*36&-1)>>2)+r12];r15=HEAPF32[((r13*36&-1)+4>>2)+r12];r14=r27+(r7*36&-1)|0;r16=(HEAPF32[tempDoublePtr>>2]=r8<r5?r8:r5,HEAP32[tempDoublePtr>>2]);r5=(HEAPF32[tempDoublePtr>>2]=r9<r15?r9:r15,HEAP32[tempDoublePtr>>2])|0;HEAP32[r14>>2]=0|r16;HEAP32[r14+4>>2]=r5;r5=HEAPF32[((r13*36&-1)+8>>2)+r12];r14=HEAPF32[((r13*36&-1)+12>>2)+r12];r12=r27+(r7*36&-1)+8|0;r27=(HEAPF32[tempDoublePtr>>2]=r10>r5?r10:r5,HEAP32[tempDoublePtr>>2]);r5=(HEAPF32[tempDoublePtr>>2]=r11>r14?r11:r14,HEAP32[tempDoublePtr>>2])|0;HEAP32[r12>>2]=0|r27;HEAP32[r12+4>>2]=r5;r5=HEAP32[r6];HEAP32[r5+(r7*36&-1)+32>>2]=HEAP32[r5+(r13*36&-1)+32>>2]+1|0;r5=HEAP32[r6];if((r29|0)==-1){HEAP32[r5+(r7*36&-1)+24>>2]=r13;HEAP32[HEAP32[r6]+(r7*36&-1)+28>>2]=r2;HEAP32[HEAP32[r6]+(r13*36&-1)+20>>2]=r7;HEAP32[HEAP32[r6]+(r2*36&-1)+20>>2]=r7;HEAP32[r4]=r7}else{r4=r5+(r29*36&-1)+24|0;if((HEAP32[r4>>2]|0)==(r13|0)){HEAP32[r4>>2]=r7}else{HEAP32[r5+(r29*36&-1)+28>>2]=r7}HEAP32[HEAP32[r6]+(r7*36&-1)+24>>2]=r13;HEAP32[HEAP32[r6]+(r7*36&-1)+28>>2]=r2;HEAP32[HEAP32[r6]+(r13*36&-1)+20>>2]=r7;HEAP32[HEAP32[r6]+(r2*36&-1)+20>>2]=r7}r7=HEAP32[HEAP32[r6]+(r2*36&-1)+20>>2];if((r7|0)==-1){return}else{r30=r7}while(1){r7=__ZN13b2DynamicTree7BalanceEi(r1,r30);r2=HEAP32[r6]>>2;r13=HEAP32[((r7*36&-1)+24>>2)+r2];r29=HEAP32[((r7*36&-1)+28>>2)+r2];if((r13|0)==-1){r3=465;break}if((r29|0)==-1){r3=467;break}r5=HEAP32[((r13*36&-1)+32>>2)+r2];r4=HEAP32[((r29*36&-1)+32>>2)+r2];HEAP32[((r7*36&-1)+32>>2)+r2]=((r5|0)>(r4|0)?r5:r4)+1|0;r4=HEAP32[r6],r5=r4>>2;r2=HEAPF32[((r13*36&-1)>>2)+r5];r12=HEAPF32[((r29*36&-1)>>2)+r5];r27=HEAPF32[((r13*36&-1)+4>>2)+r5];r14=HEAPF32[((r29*36&-1)+4>>2)+r5];r11=r4+(r7*36&-1)|0;r10=(HEAPF32[tempDoublePtr>>2]=r2<r12?r2:r12,HEAP32[tempDoublePtr>>2]);r12=(HEAPF32[tempDoublePtr>>2]=r27<r14?r27:r14,HEAP32[tempDoublePtr>>2])|0;HEAP32[r11>>2]=0|r10;HEAP32[r11+4>>2]=r12;r12=HEAPF32[((r13*36&-1)+8>>2)+r5];r11=HEAPF32[((r29*36&-1)+8>>2)+r5];r10=HEAPF32[((r13*36&-1)+12>>2)+r5];r13=HEAPF32[((r29*36&-1)+12>>2)+r5];r5=r4+(r7*36&-1)+8|0;r4=(HEAPF32[tempDoublePtr>>2]=r12>r11?r12:r11,HEAP32[tempDoublePtr>>2]);r11=(HEAPF32[tempDoublePtr>>2]=r10>r13?r10:r13,HEAP32[tempDoublePtr>>2])|0;HEAP32[r5>>2]=0|r4;HEAP32[r5+4>>2]=r11;r11=HEAP32[HEAP32[r6]+(r7*36&-1)+20>>2];if((r11|0)==-1){r3=472;break}else{r30=r11}}if(r3==465){___assert_func(5253852,307,5260468,5248008)}else if(r3==467){___assert_func(5253852,308,5260468,5247756)}else if(r3==472){return}}function __ZN13b2DynamicTree12DestroyProxyEi(r1,r2){var r3,r4,r5;if((r2|0)<=-1){___assert_func(5253852,126,5260392,5252452)}r3=r1+12|0;if((HEAP32[r3>>2]|0)<=(r2|0)){___assert_func(5253852,126,5260392,5252452)}r4=(r1+4|0)>>2;if((HEAP32[HEAP32[r4]+(r2*36&-1)+24>>2]|0)!=-1){___assert_func(5253852,127,5260392,5248496)}__ZN13b2DynamicTree10RemoveLeafEi(r1,r2);if((HEAP32[r3>>2]|0)<=(r2|0)){___assert_func(5253852,97,5260320,5252324)}r3=(r1+8|0)>>2;if((HEAP32[r3]|0)>0){r5=r1+16|0;HEAP32[HEAP32[r4]+(r2*36&-1)+20>>2]=HEAP32[r5>>2];HEAP32[HEAP32[r4]+(r2*36&-1)+32>>2]=-1;HEAP32[r5>>2]=r2;HEAP32[r3]=HEAP32[r3]-1|0;return}else{___assert_func(5253852,98,5260320,5249952)}}function __ZN13b2DynamicTree10RemoveLeafEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r3=(r1|0)>>2;if((HEAP32[r3]|0)==(r2|0)){HEAP32[r3]=-1;return}r4=(r1+4|0)>>2;r5=HEAP32[r4],r6=r5>>2;r7=HEAP32[((r2*36&-1)+20>>2)+r6];r8=HEAP32[((r7*36&-1)+20>>2)+r6];r9=HEAP32[((r7*36&-1)+24>>2)+r6];if((r9|0)==(r2|0)){r10=HEAP32[((r7*36&-1)+28>>2)+r6]}else{r10=r9}if((r8|0)==-1){HEAP32[r3]=r10;HEAP32[((r10*36&-1)+20>>2)+r6]=-1;if((r7|0)<=-1){___assert_func(5253852,97,5260320,5252324)}if((HEAP32[r1+12>>2]|0)<=(r7|0)){___assert_func(5253852,97,5260320,5252324)}r3=(r1+8|0)>>2;if((HEAP32[r3]|0)<=0){___assert_func(5253852,98,5260320,5249952)}r9=r1+16|0;HEAP32[HEAP32[r4]+(r7*36&-1)+20>>2]=HEAP32[r9>>2];HEAP32[HEAP32[r4]+(r7*36&-1)+32>>2]=-1;HEAP32[r9>>2]=r7;HEAP32[r3]=HEAP32[r3]-1|0;return}r3=r5+(r8*36&-1)+24|0;if((HEAP32[r3>>2]|0)==(r7|0)){HEAP32[r3>>2]=r10}else{HEAP32[((r8*36&-1)+28>>2)+r6]=r10}HEAP32[HEAP32[r4]+(r10*36&-1)+20>>2]=r8;if((r7|0)<=-1){___assert_func(5253852,97,5260320,5252324)}if((HEAP32[r1+12>>2]|0)<=(r7|0)){___assert_func(5253852,97,5260320,5252324)}r10=(r1+8|0)>>2;if((HEAP32[r10]|0)<=0){___assert_func(5253852,98,5260320,5249952)}r6=r1+16|0;HEAP32[HEAP32[r4]+(r7*36&-1)+20>>2]=HEAP32[r6>>2];HEAP32[HEAP32[r4]+(r7*36&-1)+32>>2]=-1;HEAP32[r6>>2]=r7;HEAP32[r10]=HEAP32[r10]-1|0;r10=r8;while(1){r8=__ZN13b2DynamicTree7BalanceEi(r1,r10);r7=HEAP32[r4],r6=r7>>2;r3=HEAP32[((r8*36&-1)+24>>2)+r6];r5=HEAP32[((r8*36&-1)+28>>2)+r6];r9=HEAPF32[((r3*36&-1)>>2)+r6];r2=HEAPF32[((r5*36&-1)>>2)+r6];r11=HEAPF32[((r3*36&-1)+4>>2)+r6];r12=HEAPF32[((r5*36&-1)+4>>2)+r6];r13=r7+(r8*36&-1)|0;r14=(HEAPF32[tempDoublePtr>>2]=r9<r2?r9:r2,HEAP32[tempDoublePtr>>2]);r2=(HEAPF32[tempDoublePtr>>2]=r11<r12?r11:r12,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r14;HEAP32[r13+4>>2]=r2;r2=HEAPF32[((r3*36&-1)+8>>2)+r6];r13=HEAPF32[((r5*36&-1)+8>>2)+r6];r14=HEAPF32[((r3*36&-1)+12>>2)+r6];r12=HEAPF32[((r5*36&-1)+12>>2)+r6];r6=r7+(r8*36&-1)+8|0;r7=(HEAPF32[tempDoublePtr>>2]=r2>r13?r2:r13,HEAP32[tempDoublePtr>>2]);r13=(HEAPF32[tempDoublePtr>>2]=r14>r12?r14:r12,HEAP32[tempDoublePtr>>2])|0;HEAP32[r6>>2]=0|r7;HEAP32[r6+4>>2]=r13;r13=HEAP32[r4]>>2;r6=HEAP32[((r3*36&-1)+32>>2)+r13];r3=HEAP32[((r5*36&-1)+32>>2)+r13];HEAP32[((r8*36&-1)+32>>2)+r13]=((r6|0)>(r3|0)?r6:r3)+1|0;r3=HEAP32[HEAP32[r4]+(r8*36&-1)+20>>2];if((r3|0)==-1){break}else{r10=r3}}return}function __ZN13b2DynamicTree9MoveProxyEiRK6b2AABBRK6b2Vec2(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;if((r2|0)<=-1){___assert_func(5253852,135,5260248,5252452)}if((HEAP32[r1+12>>2]|0)<=(r2|0)){___assert_func(5253852,135,5260248,5252452)}r5=r1+4|0;r6=HEAP32[r5>>2]>>2;if((HEAP32[((r2*36&-1)+24>>2)+r6]|0)!=-1){___assert_func(5253852,137,5260248,5248496)}do{if(HEAPF32[((r2*36&-1)>>2)+r6]<=HEAPF32[r3>>2]){if(HEAPF32[((r2*36&-1)+4>>2)+r6]>HEAPF32[r3+4>>2]){break}if(HEAPF32[r3+8>>2]>HEAPF32[((r2*36&-1)+8>>2)+r6]){break}if(HEAPF32[r3+12>>2]>HEAPF32[((r2*36&-1)+12>>2)+r6]){break}else{r7=0}return r7}}while(0);__ZN13b2DynamicTree10RemoveLeafEi(r1,r2);r6=r3;r8=HEAP32[r6+4>>2];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAPF32[tempDoublePtr>>2]);r6=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=r3+8|0;r3=HEAP32[r8+4>>2];r10=r9-.10000000149011612;r9=r6-.10000000149011612;r6=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAPF32[tempDoublePtr>>2])+.10000000149011612;r8=(HEAP32[tempDoublePtr>>2]=r3,HEAPF32[tempDoublePtr>>2])+.10000000149011612;r3=HEAPF32[r4>>2]*2;r11=HEAPF32[r4+4>>2]*2;if(r3<0){r12=r6;r13=r10+r3}else{r12=r3+r6;r13=r10}if(r11<0){r14=r8;r15=r9+r11}else{r14=r11+r8;r15=r9}r9=HEAP32[r5>>2];r5=r9+(r2*36&-1)|0;r8=(HEAPF32[tempDoublePtr>>2]=r13,HEAP32[tempDoublePtr>>2]);r13=(HEAPF32[tempDoublePtr>>2]=r15,HEAP32[tempDoublePtr>>2])|0;HEAP32[r5>>2]=0|r8;HEAP32[r5+4>>2]=r13;r13=r9+(r2*36&-1)+8|0;r9=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r12=(HEAPF32[tempDoublePtr>>2]=r14,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r9;HEAP32[r13+4>>2]=r12;__ZN13b2DynamicTree10InsertLeafEi(r1,r2);r7=1;return r7}function __ZN13b2DynamicTree7BalanceEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;if((r2|0)==-1){___assert_func(5253852,382,5260356,5247500)}r3=(r1+4|0)>>2;r4=HEAP32[r3],r5=r4>>2;r6=r4+(r2*36&-1)|0;r7=(r4+(r2*36&-1)+24|0)>>2;r8=HEAP32[r7];if((r8|0)==-1){r9=r2;return r9}r10=(r4+(r2*36&-1)+32|0)>>2;if((HEAP32[r10]|0)<2){r9=r2;return r9}r11=(r4+(r2*36&-1)+28|0)>>2;r12=HEAP32[r11];if((r8|0)<=-1){___assert_func(5253852,392,5260356,5247280)}r13=HEAP32[r1+12>>2];if((r8|0)>=(r13|0)){___assert_func(5253852,392,5260356,5247280)}if(!((r12|0)>-1&(r12|0)<(r13|0))){___assert_func(5253852,393,5260356,5255292)}r14=r4+(r8*36&-1)|0;r15=r4+(r12*36&-1)|0;r16=(r4+(r12*36&-1)+32|0)>>2;r17=(r4+(r8*36&-1)+32|0)>>2;r18=HEAP32[r16]-HEAP32[r17]|0;if((r18|0)>1){r19=r4+(r12*36&-1)+24|0;r20=HEAP32[r19>>2];r21=(r4+(r12*36&-1)+28|0)>>2;r22=HEAP32[r21];r23=r4+(r20*36&-1)|0;r24=r4+(r22*36&-1)|0;if(!((r20|0)>-1&(r20|0)<(r13|0))){___assert_func(5253852,407,5260356,5255096)}if(!((r22|0)>-1&(r22|0)<(r13|0))){___assert_func(5253852,408,5260356,5254728)}HEAP32[r19>>2]=r2;r19=r4+(r2*36&-1)+20|0;r25=r4+(r12*36&-1)+20|0;HEAP32[r25>>2]=HEAP32[r19>>2];HEAP32[r19>>2]=r12;r19=HEAP32[r25>>2];do{if((r19|0)==-1){HEAP32[r1>>2]=r12}else{r25=HEAP32[r3];r26=r25+(r19*36&-1)+24|0;if((HEAP32[r26>>2]|0)==(r2|0)){HEAP32[r26>>2]=r12;break}r26=r25+(r19*36&-1)+28|0;if((HEAP32[r26>>2]|0)==(r2|0)){HEAP32[r26>>2]=r12;break}else{___assert_func(5253852,424,5260356,5254008)}}}while(0);r19=(r4+(r20*36&-1)+32|0)>>2;r26=(r4+(r22*36&-1)+32|0)>>2;if((HEAP32[r19]|0)>(HEAP32[r26]|0)){HEAP32[r21]=r20;HEAP32[r11]=r22;HEAP32[((r22*36&-1)+20>>2)+r5]=r2;r25=HEAPF32[r14>>2];r27=HEAPF32[r24>>2];r28=r25<r27?r25:r27;r27=HEAPF32[((r8*36&-1)+4>>2)+r5];r25=HEAPF32[((r22*36&-1)+4>>2)+r5];r29=r6;r30=(HEAPF32[tempDoublePtr>>2]=r28,HEAP32[tempDoublePtr>>2]);r31=(HEAPF32[tempDoublePtr>>2]=r27<r25?r27:r25,HEAP32[tempDoublePtr>>2])|0;HEAP32[r29>>2]=0|r30;HEAP32[r29+4>>2]=r31;r31=HEAPF32[((r8*36&-1)+8>>2)+r5];r29=HEAPF32[((r22*36&-1)+8>>2)+r5];r30=HEAPF32[((r8*36&-1)+12>>2)+r5];r25=HEAPF32[((r22*36&-1)+12>>2)+r5];r27=r4+(r2*36&-1)+8|0;r32=(HEAPF32[tempDoublePtr>>2]=r31>r29?r31:r29,HEAP32[tempDoublePtr>>2]);r29=(HEAPF32[tempDoublePtr>>2]=r30>r25?r30:r25,HEAP32[tempDoublePtr>>2])|0;HEAP32[r27>>2]=0|r32;HEAP32[r27+4>>2]=r29;r29=HEAPF32[r23>>2];r27=HEAPF32[((r2*36&-1)+4>>2)+r5];r32=HEAPF32[((r20*36&-1)+4>>2)+r5];r25=r15;r30=(HEAPF32[tempDoublePtr>>2]=r28<r29?r28:r29,HEAP32[tempDoublePtr>>2]);r29=(HEAPF32[tempDoublePtr>>2]=r27<r32?r27:r32,HEAP32[tempDoublePtr>>2])|0;HEAP32[r25>>2]=0|r30;HEAP32[r25+4>>2]=r29;r29=HEAPF32[((r2*36&-1)+8>>2)+r5];r25=HEAPF32[((r20*36&-1)+8>>2)+r5];r30=HEAPF32[((r2*36&-1)+12>>2)+r5];r32=HEAPF32[((r20*36&-1)+12>>2)+r5];r27=r4+(r12*36&-1)+8|0;r28=(HEAPF32[tempDoublePtr>>2]=r29>r25?r29:r25,HEAP32[tempDoublePtr>>2]);r25=(HEAPF32[tempDoublePtr>>2]=r30>r32?r30:r32,HEAP32[tempDoublePtr>>2])|0;HEAP32[r27>>2]=0|r28;HEAP32[r27+4>>2]=r25;r25=HEAP32[r17];r27=HEAP32[r26];r28=((r25|0)>(r27|0)?r25:r27)+1|0;HEAP32[r10]=r28;r27=HEAP32[r19];r33=(r28|0)>(r27|0)?r28:r27}else{HEAP32[r21]=r22;HEAP32[r11]=r20;HEAP32[((r20*36&-1)+20>>2)+r5]=r2;r11=HEAPF32[r14>>2];r21=HEAPF32[r23>>2];r23=r11<r21?r11:r21;r21=HEAPF32[((r8*36&-1)+4>>2)+r5];r11=HEAPF32[((r20*36&-1)+4>>2)+r5];r27=r6;r28=(HEAPF32[tempDoublePtr>>2]=r23,HEAP32[tempDoublePtr>>2]);r25=(HEAPF32[tempDoublePtr>>2]=r21<r11?r21:r11,HEAP32[tempDoublePtr>>2])|0;HEAP32[r27>>2]=0|r28;HEAP32[r27+4>>2]=r25;r25=HEAPF32[((r8*36&-1)+8>>2)+r5];r27=HEAPF32[((r20*36&-1)+8>>2)+r5];r28=HEAPF32[((r8*36&-1)+12>>2)+r5];r11=HEAPF32[((r20*36&-1)+12>>2)+r5];r20=r4+(r2*36&-1)+8|0;r21=(HEAPF32[tempDoublePtr>>2]=r25>r27?r25:r27,HEAP32[tempDoublePtr>>2]);r27=(HEAPF32[tempDoublePtr>>2]=r28>r11?r28:r11,HEAP32[tempDoublePtr>>2])|0;HEAP32[r20>>2]=0|r21;HEAP32[r20+4>>2]=r27;r27=HEAPF32[r24>>2];r24=HEAPF32[((r2*36&-1)+4>>2)+r5];r20=HEAPF32[((r22*36&-1)+4>>2)+r5];r21=r15;r11=(HEAPF32[tempDoublePtr>>2]=r23<r27?r23:r27,HEAP32[tempDoublePtr>>2]);r27=(HEAPF32[tempDoublePtr>>2]=r24<r20?r24:r20,HEAP32[tempDoublePtr>>2])|0;HEAP32[r21>>2]=0|r11;HEAP32[r21+4>>2]=r27;r27=HEAPF32[((r2*36&-1)+8>>2)+r5];r21=HEAPF32[((r22*36&-1)+8>>2)+r5];r11=HEAPF32[((r2*36&-1)+12>>2)+r5];r20=HEAPF32[((r22*36&-1)+12>>2)+r5];r22=r4+(r12*36&-1)+8|0;r24=(HEAPF32[tempDoublePtr>>2]=r27>r21?r27:r21,HEAP32[tempDoublePtr>>2]);r21=(HEAPF32[tempDoublePtr>>2]=r11>r20?r11:r20,HEAP32[tempDoublePtr>>2])|0;HEAP32[r22>>2]=0|r24;HEAP32[r22+4>>2]=r21;r21=HEAP32[r17];r22=HEAP32[r19];r19=((r21|0)>(r22|0)?r21:r22)+1|0;HEAP32[r10]=r19;r22=HEAP32[r26];r33=(r19|0)>(r22|0)?r19:r22}HEAP32[r16]=r33+1|0;r9=r12;return r9}if((r18|0)>=-1){r9=r2;return r9}r18=r4+(r8*36&-1)+24|0;r33=HEAP32[r18>>2];r22=(r4+(r8*36&-1)+28|0)>>2;r19=HEAP32[r22];r26=r4+(r33*36&-1)|0;r21=r4+(r19*36&-1)|0;if(!((r33|0)>-1&(r33|0)<(r13|0))){___assert_func(5253852,467,5260356,5253764)}if(!((r19|0)>-1&(r19|0)<(r13|0))){___assert_func(5253852,468,5260356,5253672)}HEAP32[r18>>2]=r2;r18=r4+(r2*36&-1)+20|0;r13=r4+(r8*36&-1)+20|0;HEAP32[r13>>2]=HEAP32[r18>>2];HEAP32[r18>>2]=r8;r18=HEAP32[r13>>2];do{if((r18|0)==-1){HEAP32[r1>>2]=r8}else{r13=HEAP32[r3];r24=r13+(r18*36&-1)+24|0;if((HEAP32[r24>>2]|0)==(r2|0)){HEAP32[r24>>2]=r8;break}r24=r13+(r18*36&-1)+28|0;if((HEAP32[r24>>2]|0)==(r2|0)){HEAP32[r24>>2]=r8;break}else{___assert_func(5253852,484,5260356,5253484)}}}while(0);r18=(r4+(r33*36&-1)+32|0)>>2;r3=(r4+(r19*36&-1)+32|0)>>2;if((HEAP32[r18]|0)>(HEAP32[r3]|0)){HEAP32[r22]=r33;HEAP32[r7]=r19;HEAP32[((r19*36&-1)+20>>2)+r5]=r2;r1=HEAPF32[r15>>2];r24=HEAPF32[r21>>2];r13=r1<r24?r1:r24;r24=HEAPF32[((r12*36&-1)+4>>2)+r5];r1=HEAPF32[((r19*36&-1)+4>>2)+r5];r20=r6;r11=(HEAPF32[tempDoublePtr>>2]=r13,HEAP32[tempDoublePtr>>2]);r27=(HEAPF32[tempDoublePtr>>2]=r24<r1?r24:r1,HEAP32[tempDoublePtr>>2])|0;HEAP32[r20>>2]=0|r11;HEAP32[r20+4>>2]=r27;r27=HEAPF32[((r12*36&-1)+8>>2)+r5];r20=HEAPF32[((r19*36&-1)+8>>2)+r5];r11=HEAPF32[((r12*36&-1)+12>>2)+r5];r1=HEAPF32[((r19*36&-1)+12>>2)+r5];r24=r4+(r2*36&-1)+8|0;r23=(HEAPF32[tempDoublePtr>>2]=r27>r20?r27:r20,HEAP32[tempDoublePtr>>2]);r20=(HEAPF32[tempDoublePtr>>2]=r11>r1?r11:r1,HEAP32[tempDoublePtr>>2])|0;HEAP32[r24>>2]=0|r23;HEAP32[r24+4>>2]=r20;r20=HEAPF32[r26>>2];r24=HEAPF32[((r2*36&-1)+4>>2)+r5];r23=HEAPF32[((r33*36&-1)+4>>2)+r5];r1=r14;r11=(HEAPF32[tempDoublePtr>>2]=r13<r20?r13:r20,HEAP32[tempDoublePtr>>2]);r20=(HEAPF32[tempDoublePtr>>2]=r24<r23?r24:r23,HEAP32[tempDoublePtr>>2])|0;HEAP32[r1>>2]=0|r11;HEAP32[r1+4>>2]=r20;r20=HEAPF32[((r2*36&-1)+8>>2)+r5];r1=HEAPF32[((r33*36&-1)+8>>2)+r5];r11=HEAPF32[((r2*36&-1)+12>>2)+r5];r23=HEAPF32[((r33*36&-1)+12>>2)+r5];r24=r4+(r8*36&-1)+8|0;r13=(HEAPF32[tempDoublePtr>>2]=r20>r1?r20:r1,HEAP32[tempDoublePtr>>2]);r1=(HEAPF32[tempDoublePtr>>2]=r11>r23?r11:r23,HEAP32[tempDoublePtr>>2])|0;HEAP32[r24>>2]=0|r13;HEAP32[r24+4>>2]=r1;r1=HEAP32[r16];r24=HEAP32[r3];r13=((r1|0)>(r24|0)?r1:r24)+1|0;HEAP32[r10]=r13;r24=HEAP32[r18];r34=(r13|0)>(r24|0)?r13:r24}else{HEAP32[r22]=r19;HEAP32[r7]=r33;HEAP32[((r33*36&-1)+20>>2)+r5]=r2;r7=HEAPF32[r15>>2];r15=HEAPF32[r26>>2];r26=r7<r15?r7:r15;r15=HEAPF32[((r12*36&-1)+4>>2)+r5];r7=HEAPF32[((r33*36&-1)+4>>2)+r5];r22=r6;r6=(HEAPF32[tempDoublePtr>>2]=r26,HEAP32[tempDoublePtr>>2]);r24=(HEAPF32[tempDoublePtr>>2]=r15<r7?r15:r7,HEAP32[tempDoublePtr>>2])|0;HEAP32[r22>>2]=0|r6;HEAP32[r22+4>>2]=r24;r24=HEAPF32[((r12*36&-1)+8>>2)+r5];r22=HEAPF32[((r33*36&-1)+8>>2)+r5];r6=HEAPF32[((r12*36&-1)+12>>2)+r5];r12=HEAPF32[((r33*36&-1)+12>>2)+r5];r33=r4+(r2*36&-1)+8|0;r7=(HEAPF32[tempDoublePtr>>2]=r24>r22?r24:r22,HEAP32[tempDoublePtr>>2]);r22=(HEAPF32[tempDoublePtr>>2]=r6>r12?r6:r12,HEAP32[tempDoublePtr>>2])|0;HEAP32[r33>>2]=0|r7;HEAP32[r33+4>>2]=r22;r22=HEAPF32[r21>>2];r21=HEAPF32[((r2*36&-1)+4>>2)+r5];r33=HEAPF32[((r19*36&-1)+4>>2)+r5];r7=r14;r14=(HEAPF32[tempDoublePtr>>2]=r26<r22?r26:r22,HEAP32[tempDoublePtr>>2]);r22=(HEAPF32[tempDoublePtr>>2]=r21<r33?r21:r33,HEAP32[tempDoublePtr>>2])|0;HEAP32[r7>>2]=0|r14;HEAP32[r7+4>>2]=r22;r22=HEAPF32[((r2*36&-1)+8>>2)+r5];r7=HEAPF32[((r19*36&-1)+8>>2)+r5];r14=HEAPF32[((r2*36&-1)+12>>2)+r5];r2=HEAPF32[((r19*36&-1)+12>>2)+r5];r5=r4+(r8*36&-1)+8|0;r4=(HEAPF32[tempDoublePtr>>2]=r22>r7?r22:r7,HEAP32[tempDoublePtr>>2]);r7=(HEAPF32[tempDoublePtr>>2]=r14>r2?r14:r2,HEAP32[tempDoublePtr>>2])|0;HEAP32[r5>>2]=0|r4;HEAP32[r5+4>>2]=r7;r7=HEAP32[r16];r16=HEAP32[r18];r18=((r7|0)>(r16|0)?r7:r16)+1|0;HEAP32[r10]=r18;r10=HEAP32[r3];r34=(r18|0)>(r10|0)?r18:r10}HEAP32[r17]=r34+1|0;r9=r8;return r9}function __ZNK13b2DynamicTree13ComputeHeightEi(r1,r2){var r3,r4,r5;if((r2|0)<=-1){___assert_func(5253852,563,5256676,5252324)}if((HEAP32[r1+12>>2]|0)<=(r2|0)){___assert_func(5253852,563,5256676,5252324)}r3=HEAP32[r1+4>>2];r4=HEAP32[r3+(r2*36&-1)+24>>2];if((r4|0)==-1){return 0}else{r5=__ZNK13b2DynamicTree13ComputeHeightEi(r1,r4);r4=__ZNK13b2DynamicTree13ComputeHeightEi(r1,HEAP32[r3+(r2*36&-1)+28>>2]);return((r5|0)>(r4|0)?r5:r4)+1|0}}function __ZNK13b2DynamicTree17ValidateStructureEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=0;if((r2|0)==-1){return}r4=r1|0;r5=r1+4|0;r6=r1+12|0;r7=r2;while(1){r8=HEAP32[r5>>2]>>2;if((HEAP32[r4>>2]|0)==(r7|0)){if((HEAP32[((r7*36&-1)+20>>2)+r8]|0)!=-1){r3=596;break}}r2=HEAP32[((r7*36&-1)+24>>2)+r8];r9=HEAP32[((r7*36&-1)+28>>2)+r8];if((r2|0)==-1){r3=598;break}if((r2|0)<=-1){r3=613;break}r10=HEAP32[r6>>2];if((r2|0)>=(r10|0)){r3=614;break}if(!((r9|0)>-1&(r9|0)<(r10|0))){r3=606;break}if((HEAP32[((r2*36&-1)+20>>2)+r8]|0)!=(r7|0)){r3=608;break}if((HEAP32[((r9*36&-1)+20>>2)+r8]|0)!=(r7|0)){r3=610;break}__ZNK13b2DynamicTree17ValidateStructureEi(r1,r2);if((r9|0)==-1){r3=616;break}else{r7=r9}}if(r3==610){___assert_func(5253852,611,5256528,5251512)}else if(r3==613){___assert_func(5253852,607,5256528,5252564)}else if(r3==596){___assert_func(5253852,591,5256528,5253184)}else if(r3==616){return}else if(r3==608){___assert_func(5253852,610,5256528,5251880)}else if(r3==606){___assert_func(5253852,608,5256528,5252160)}else if(r3==598){if((r9|0)!=-1){___assert_func(5253852,602,5256528,5252960)}if((HEAP32[((r7*36&-1)+32>>2)+r8]|0)==0){return}else{___assert_func(5253852,603,5256528,5252768)}}else if(r3==614){___assert_func(5253852,607,5256528,5252564)}}function __ZNK13b2DynamicTree15ValidateMetricsEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=0;if((r2|0)==-1){return}r4=r1+4|0;r5=r1+12|0;r6=r2;while(1){r7=HEAP32[r4>>2]>>2;r2=HEAP32[((r6*36&-1)+24>>2)+r7];r8=HEAP32[((r6*36&-1)+28>>2)+r7];if((r2|0)==-1){r3=621;break}if((r2|0)<=-1){r3=645;break}r9=HEAP32[r5>>2];if((r2|0)>=(r9|0)){r3=646;break}if(!((r8|0)>-1&(r8|0)<(r9|0))){r3=629;break}r9=HEAP32[((r2*36&-1)+32>>2)+r7];r10=HEAP32[((r8*36&-1)+32>>2)+r7];if((HEAP32[((r6*36&-1)+32>>2)+r7]|0)!=(((r9|0)>(r10|0)?r9:r10)+1|0)){r3=631;break}r10=HEAPF32[((r2*36&-1)>>2)+r7];r9=HEAPF32[((r8*36&-1)>>2)+r7];r11=HEAPF32[((r2*36&-1)+4>>2)+r7];r12=HEAPF32[((r8*36&-1)+4>>2)+r7];r13=HEAPF32[((r2*36&-1)+8>>2)+r7];r14=HEAPF32[((r8*36&-1)+8>>2)+r7];r15=HEAPF32[((r2*36&-1)+12>>2)+r7];r16=HEAPF32[((r8*36&-1)+12>>2)+r7];if((r10<r9?r10:r9)!=HEAPF32[((r6*36&-1)>>2)+r7]){r3=640;break}if((r11<r12?r11:r12)!=HEAPF32[((r6*36&-1)+4>>2)+r7]){r3=641;break}if((r13>r14?r13:r14)!=HEAPF32[((r6*36&-1)+8>>2)+r7]){r3=648;break}if((r15>r16?r15:r16)!=HEAPF32[((r6*36&-1)+12>>2)+r7]){r3=647;break}__ZNK13b2DynamicTree15ValidateMetricsEi(r1,r2);if((r8|0)==-1){r3=644;break}else{r6=r8}}if(r3==631){___assert_func(5253852,644,5256580,5251368)}else if(r3==641){___assert_func(5253852,649,5256580,5251036)}else if(r3==621){if((r8|0)!=-1){___assert_func(5253852,632,5256580,5252960)}if((HEAP32[((r6*36&-1)+32>>2)+r7]|0)==0){return}else{___assert_func(5253852,633,5256580,5252768)}}else if(r3==640){___assert_func(5253852,649,5256580,5251036)}else if(r3==644){return}else if(r3==629){___assert_func(5253852,638,5256580,5252160)}else if(r3==647){___assert_func(5253852,650,5256580,5250820)}else if(r3==648){___assert_func(5253852,650,5256580,5250820)}else if(r3==645){___assert_func(5253852,637,5256580,5252564)}else if(r3==646){___assert_func(5253852,637,5256580,5252564)}}function __ZNK13b2DynamicTree8ValidateEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=0;r3=(r1|0)>>2;__ZNK13b2DynamicTree17ValidateStructureEi(r1,HEAP32[r3]);__ZNK13b2DynamicTree15ValidateMetricsEi(r1,HEAP32[r3]);r4=HEAP32[r1+16>>2];L849:do{if((r4|0)==-1){r5=0}else{r6=r1+12|0;r7=r1+4|0;r8=0;r9=r4;while(1){if((r9|0)<=-1){r2=663;break}if((r9|0)>=(HEAP32[r6>>2]|0)){r2=662;break}r10=r8+1|0;r11=HEAP32[HEAP32[r7>>2]+(r9*36&-1)+20>>2];if((r11|0)==-1){r5=r10;break L849}else{r8=r10;r9=r11}}if(r2==662){___assert_func(5253852,665,5256396,5250392)}else if(r2==663){___assert_func(5253852,665,5256396,5250392)}}}while(0);r2=HEAP32[r3];if((r2|0)==-1){r12=0}else{r12=HEAP32[HEAP32[r1+4>>2]+(r2*36&-1)+32>>2]}if((r12|0)!=(__ZNK13b2DynamicTree13ComputeHeightEi(r1,r2)|0)){___assert_func(5253852,670,5256396,5250360)}if((HEAP32[r1+8>>2]+r5|0)==(HEAP32[r1+12>>2]|0)){return}else{___assert_func(5253852,672,5256396,5250176)}}function __ZN13b2DynamicTree15RebuildBottomUpEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31;r2=0;r3=(r1+8|0)>>2;r4=_malloc(HEAP32[r3]<<2);r5=r4,r6=r5>>2;r7=r1+12|0;if((HEAP32[r7>>2]|0)<=0){r8=HEAP32[r6];r9=r1|0,r10=r9>>2;HEAP32[r10]=r8;_free(r4);__ZNK13b2DynamicTree8ValidateEv(r1);return}r11=r1+4|0;r12=r1+16|0;r13=0;r14=0;L872:while(1){r15=HEAP32[r11>>2]>>2;do{if((HEAP32[((r13*36&-1)+32>>2)+r15]|0)<0){r16=r14}else{if((HEAP32[((r13*36&-1)+24>>2)+r15]|0)==-1){HEAP32[((r13*36&-1)+20>>2)+r15]=-1;HEAP32[(r14<<2>>2)+r6]=r13;r16=r14+1|0;break}if((HEAP32[r3]|0)<=0){r2=672;break L872}HEAP32[((r13*36&-1)+20>>2)+r15]=HEAP32[r12>>2];HEAP32[HEAP32[r11>>2]+(r13*36&-1)+32>>2]=-1;HEAP32[r12>>2]=r13;HEAP32[r3]=HEAP32[r3]-1|0;r16=r14}}while(0);r15=r13+1|0;if((r15|0)<(HEAP32[r7>>2]|0)){r13=r15;r14=r16}else{break}}if(r2==672){___assert_func(5253852,98,5260320,5249952)}if((r16|0)<=1){r8=HEAP32[r6];r9=r1|0,r10=r9>>2;HEAP32[r10]=r8;_free(r4);__ZNK13b2DynamicTree8ValidateEv(r1);return}r2=r1+4|0;r14=r16;while(1){r16=HEAP32[r2>>2]>>2;r13=0;r7=-1;r3=-1;r12=3.4028234663852886e+38;while(1){r11=HEAP32[(r13<<2>>2)+r6];r15=HEAPF32[((r11*36&-1)>>2)+r16];r17=HEAPF32[((r11*36&-1)+4>>2)+r16];r18=HEAPF32[((r11*36&-1)+8>>2)+r16];r19=HEAPF32[((r11*36&-1)+12>>2)+r16];r11=r13+1|0;L891:do{if((r11|0)<(r14|0)){r20=r11;r21=r7;r22=r3;r23=r12;while(1){r24=HEAP32[(r20<<2>>2)+r6];r25=HEAPF32[((r24*36&-1)>>2)+r16];r26=HEAPF32[((r24*36&-1)+4>>2)+r16];r27=HEAPF32[((r24*36&-1)+8>>2)+r16];r28=HEAPF32[((r24*36&-1)+12>>2)+r16];r24=((r18>r27?r18:r27)-(r15<r25?r15:r25)+((r19>r28?r19:r28)-(r17<r26?r17:r26)))*2;r26=r24<r23;r28=r26?r20:r21;r25=r26?r13:r22;r27=r26?r24:r23;r24=r20+1|0;if((r24|0)==(r14|0)){r29=r28;r30=r25;r31=r27;break L891}else{r20=r24;r21=r28;r22=r25;r23=r27}}}else{r29=r7;r30=r3;r31=r12}}while(0);if((r11|0)==(r14|0)){break}else{r13=r11;r7=r29;r3=r30;r12=r31}}r12=(r30<<2)+r5|0;r3=HEAP32[r12>>2];r7=(r29<<2)+r5|0;r13=HEAP32[r7>>2];r17=__ZN13b2DynamicTree12AllocateNodeEv(r1);r19=HEAP32[r2>>2],r15=r19>>2;HEAP32[((r17*36&-1)+24>>2)+r15]=r3;HEAP32[((r17*36&-1)+28>>2)+r15]=r13;r18=HEAP32[((r3*36&-1)+32>>2)+r16];r23=HEAP32[((r13*36&-1)+32>>2)+r16];HEAP32[((r17*36&-1)+32>>2)+r15]=((r18|0)>(r23|0)?r18:r23)+1|0;r23=HEAPF32[((r3*36&-1)>>2)+r16];r18=HEAPF32[((r13*36&-1)>>2)+r16];r22=HEAPF32[((r3*36&-1)+4>>2)+r16];r21=HEAPF32[((r13*36&-1)+4>>2)+r16];r20=r19+(r17*36&-1)|0;r27=(HEAPF32[tempDoublePtr>>2]=r23<r18?r23:r18,HEAP32[tempDoublePtr>>2]);r18=(HEAPF32[tempDoublePtr>>2]=r22<r21?r22:r21,HEAP32[tempDoublePtr>>2])|0;HEAP32[r20>>2]=0|r27;HEAP32[r20+4>>2]=r18;r18=HEAPF32[((r3*36&-1)+8>>2)+r16];r20=HEAPF32[((r13*36&-1)+8>>2)+r16];r27=HEAPF32[((r3*36&-1)+12>>2)+r16];r21=HEAPF32[((r13*36&-1)+12>>2)+r16];r22=r19+(r17*36&-1)+8|0;r19=(HEAPF32[tempDoublePtr>>2]=r18>r20?r18:r20,HEAP32[tempDoublePtr>>2]);r20=(HEAPF32[tempDoublePtr>>2]=r27>r21?r27:r21,HEAP32[tempDoublePtr>>2])|0;HEAP32[r22>>2]=0|r19;HEAP32[r22+4>>2]=r20;HEAP32[((r17*36&-1)+20>>2)+r15]=-1;HEAP32[((r3*36&-1)+20>>2)+r16]=r17;HEAP32[((r13*36&-1)+20>>2)+r16]=r17;r13=r14-1|0;HEAP32[r7>>2]=HEAP32[(r13<<2>>2)+r6];HEAP32[r12>>2]=r17;if((r13|0)>1){r14=r13}else{break}}r8=HEAP32[r6];r9=r1|0,r10=r9>>2;HEAP32[r10]=r8;_free(r4);__ZNK13b2DynamicTree8ValidateEv(r1);return}function __Z14b2TimeOfImpactP11b2TOIOutputPK10b2TOIInput(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+308|0;r5=r4;r6=r4+36;r7=r4+72;r8=r4+84;r9=r4+176;r10=r4+200;r11=r4+300;r12=r4+304;HEAP32[1311759]=HEAP32[1311759]+1|0;r13=(r1|0)>>2;HEAP32[r13]=0;r14=r2+128|0;r15=(r1+4|0)>>2;HEAPF32[r15]=HEAPF32[r14>>2];r1=r2|0;r16=r2+28|0;_memcpy(r5,r2+56|0,36);_memcpy(r6,r2+92|0,36);r17=(r5+24|0)>>2;r18=HEAPF32[r17];r19=Math.floor(r18/6.2831854820251465)*6.2831854820251465;r20=r18-r19;HEAPF32[r17]=r20;r18=(r5+28|0)>>2;r21=HEAPF32[r18]-r19;HEAPF32[r18]=r21;r19=(r6+24|0)>>2;r22=HEAPF32[r19];r23=Math.floor(r22/6.2831854820251465)*6.2831854820251465;r24=r22-r23;HEAPF32[r19]=r24;r22=(r6+28|0)>>2;r25=HEAPF32[r22]-r23;HEAPF32[r22]=r25;r23=HEAPF32[r14>>2];r14=HEAPF32[r2+24>>2]+HEAPF32[r2+52>>2]-.014999999664723873;r26=r14<.004999999888241291?.004999999888241291:r14;if(r26<=.0012499999720603228){___assert_func(5249412,280,5261276,5253916)}HEAP16[r7+4>>1]=0;r14=r8>>2;r27=r2>>2;HEAP32[r14]=HEAP32[r27];HEAP32[r14+1]=HEAP32[r27+1];HEAP32[r14+2]=HEAP32[r27+2];HEAP32[r14+3]=HEAP32[r27+3];HEAP32[r14+4]=HEAP32[r27+4];HEAP32[r14+5]=HEAP32[r27+5];HEAP32[r14+6]=HEAP32[r27+6];r27=(r8+28|0)>>2;r14=r16>>2;HEAP32[r27]=HEAP32[r14];HEAP32[r27+1]=HEAP32[r14+1];HEAP32[r27+2]=HEAP32[r14+2];HEAP32[r27+3]=HEAP32[r14+3];HEAP32[r27+4]=HEAP32[r14+4];HEAP32[r27+5]=HEAP32[r14+5];HEAP32[r27+6]=HEAP32[r14+6];HEAP8[r8+88|0]=0;r14=r5+8|0;r27=r5+12|0;r2=r5+16|0;r28=r5+20|0;r29=r5|0;r30=r5+4|0;r31=r6+8|0;r32=r6+12|0;r33=r6+16|0;r34=r6+20|0;r35=r6|0;r36=r6+4|0;r37=r8+56|0;r38=r8+64|0;r39=r8+68|0;r40=r8+72|0;r41=r8+80|0;r42=r8+84|0;r43=r9+16|0;r44=r26+.0012499999720603228;r45=r26-.0012499999720603228;r46=0;r47=0;r48=r20;r20=r21;r21=r24;r24=r25;L901:while(1){r25=1-r46;r49=r25*HEAPF32[r14>>2]+r46*HEAPF32[r2>>2];r50=r25*HEAPF32[r27>>2]+r46*HEAPF32[r28>>2];r51=r25*r48+r46*r20;r52=Math.sin(r51);r53=Math.cos(r51);r51=HEAPF32[r29>>2];r54=HEAPF32[r30>>2];r55=r25*HEAPF32[r31>>2]+r46*HEAPF32[r33>>2];r56=r25*HEAPF32[r32>>2]+r46*HEAPF32[r34>>2];r57=r25*r21+r46*r24;r25=Math.sin(r57);r58=Math.cos(r57);r57=HEAPF32[r35>>2];r59=HEAPF32[r36>>2];r60=(HEAPF32[tempDoublePtr>>2]=r49-(r53*r51-r52*r54),HEAP32[tempDoublePtr>>2]);r49=(HEAPF32[tempDoublePtr>>2]=r50-(r52*r51+r53*r54),HEAP32[tempDoublePtr>>2])|0;HEAP32[r37>>2]=0|r60;HEAP32[r37+4>>2]=r49;HEAPF32[r38>>2]=r52;HEAPF32[r39>>2]=r53;r53=(HEAPF32[tempDoublePtr>>2]=r55-(r58*r57-r25*r59),HEAP32[tempDoublePtr>>2]);r55=(HEAPF32[tempDoublePtr>>2]=r56-(r25*r57+r58*r59),HEAP32[tempDoublePtr>>2])|0;HEAP32[r40>>2]=0|r53;HEAP32[r40+4>>2]=r55;HEAPF32[r41>>2]=r25;HEAPF32[r42>>2]=r58;__Z10b2DistanceP16b2DistanceOutputP14b2SimplexCachePK15b2DistanceInput(r9,r7,r8);r58=HEAPF32[r43>>2];if(r58<=0){r3=688;break}if(r58<r44){r3=690;break}__ZN20b2SeparationFunction10InitializeEPK14b2SimplexCachePK15b2DistanceProxyRK7b2SweepS5_S8_f(r10,r7,r1,r5,r16,r6,r46);r58=0;r25=r23;while(1){r55=__ZNK20b2SeparationFunction17FindMinSeparationEPiS0_f(r10,r11,r12,r25);if(r55>r44){r3=693;break L901}if(r55>r45){r61=r25;break}r53=HEAP32[r11>>2];r59=HEAP32[r12>>2];r57=__ZNK20b2SeparationFunction8EvaluateEiif(r10,r53,r59,r46);if(r57<r45){r3=696;break L901}if(r57>r44){r62=r25;r63=r46;r64=0;r65=r57;r66=r55}else{r3=698;break L901}while(1){if((r64&1|0)==0){r67=(r63+r62)*.5}else{r67=r63+(r26-r65)*(r62-r63)/(r66-r65)}r55=__ZNK20b2SeparationFunction8EvaluateEiif(r10,r53,r59,r67);r57=r55-r26;if(r57>0){r68=r57}else{r68=-r57}if(r68<.0012499999720603228){r69=r64;r70=r67;break}r57=r55>r26;r56=r64+1|0;HEAP32[1311755]=HEAP32[1311755]+1|0;if((r56|0)==50){r69=50;r70=r25;break}else{r62=r57?r62:r67;r63=r57?r67:r63;r64=r56;r65=r57?r55:r65;r66=r57?r66:r55}}r59=HEAP32[1311756];HEAP32[1311756]=(r59|0)>(r69|0)?r59:r69;r59=r58+1|0;if((r59|0)==8){r61=r46;break}else{r58=r59;r25=r70}}r25=r47+1|0;HEAP32[1311758]=HEAP32[1311758]+1|0;if((r25|0)==20){r3=710;break}r46=r61;r47=r25;r48=HEAPF32[r17];r20=HEAPF32[r18];r21=HEAPF32[r19];r24=HEAPF32[r22]}if(r3==710){HEAP32[r13]=1;HEAPF32[r15]=r61;r71=20;r72=HEAP32[1311757];r73=(r72|0)>(r71|0);r74=r73?r72:r71;HEAP32[1311757]=r74;STACKTOP=r4;return}else if(r3==688){HEAP32[r13]=2;HEAPF32[r15]=0;r71=r47;r72=HEAP32[1311757];r73=(r72|0)>(r71|0);r74=r73?r72:r71;HEAP32[1311757]=r74;STACKTOP=r4;return}else if(r3==690){HEAP32[r13]=3;HEAPF32[r15]=r46;r71=r47;r72=HEAP32[1311757];r73=(r72|0)>(r71|0);r74=r73?r72:r71;HEAP32[1311757]=r74;STACKTOP=r4;return}else if(r3==696){HEAP32[r13]=1;HEAPF32[r15]=r46}else if(r3==693){HEAP32[r13]=4;HEAPF32[r15]=r23}else if(r3==698){HEAP32[r13]=3;HEAPF32[r15]=r46}HEAP32[1311758]=HEAP32[1311758]+1|0;r71=r47+1|0;r72=HEAP32[1311757];r73=(r72|0)>(r71|0);r74=r73?r72:r71;HEAP32[1311757]=r74;STACKTOP=r4;return}function __ZN20b2SeparationFunction10InitializeEPK14b2SimplexCachePK15b2DistanceProxyRK7b2SweepS5_S8_f(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31;r8=r5>>2;r9=r3>>2;r10=r1>>2;HEAP32[r10]=r3;HEAP32[r10+1]=r5;r5=HEAP16[r2+4>>1];if(!(r5<<16>>16!=0&(r5&65535)<3)){___assert_func(5249412,50,5259084,5248368)}r3=r1+8|0;_memcpy(r3,r4,36);r4=r1+44|0;_memcpy(r4,r6,36);r6=1-r7;r11=r6*HEAPF32[r10+4]+HEAPF32[r10+6]*r7;r12=r6*HEAPF32[r10+5]+HEAPF32[r10+7]*r7;r13=r6*HEAPF32[r10+8]+HEAPF32[r10+9]*r7;r14=Math.sin(r13);r15=Math.cos(r13);r13=HEAPF32[r3>>2];r3=HEAPF32[r10+3];r16=r11-(r15*r13-r14*r3);r11=r12-(r14*r13+r15*r3);r3=r6*HEAPF32[r10+13]+HEAPF32[r10+15]*r7;r13=r6*HEAPF32[r10+14]+HEAPF32[r10+16]*r7;r12=r6*HEAPF32[r10+17]+HEAPF32[r10+18]*r7;r7=Math.sin(r12);r6=Math.cos(r12);r12=HEAPF32[r4>>2];r4=HEAPF32[r10+12];r17=r3-(r6*r12-r7*r4);r3=r13-(r7*r12+r6*r4);if(r5<<16>>16==1){HEAP32[r10+20]=0;r5=HEAPU8[r2+6|0];if((HEAP32[r9+5]|0)<=(r5|0)){___assert_func(5250220,103,5256152,5249104)}r4=(r5<<3)+HEAP32[r9+4]|0;r5=HEAP32[r4+4>>2];r12=(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAPF32[tempDoublePtr>>2]);r4=(HEAP32[tempDoublePtr>>2]=r5,HEAPF32[tempDoublePtr>>2]);r5=HEAPU8[r2+9|0];if((HEAP32[r8+5]|0)<=(r5|0)){___assert_func(5250220,103,5256152,5249104)}r13=(r5<<3)+HEAP32[r8+4]|0;r5=HEAP32[r13+4>>2];r18=(HEAP32[tempDoublePtr>>2]=HEAP32[r13>>2],HEAPF32[tempDoublePtr>>2]);r13=(HEAP32[tempDoublePtr>>2]=r5,HEAPF32[tempDoublePtr>>2]);r5=r1+92|0;r19=r17+(r6*r18-r7*r13)-(r16+(r15*r12-r14*r4));r20=r3+r7*r18+r6*r13-(r11+r14*r12+r15*r4);r4=r5;r12=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2]);r13=(HEAPF32[tempDoublePtr>>2]=r20,HEAP32[tempDoublePtr>>2])|0;HEAP32[r4>>2]=0|r12;HEAP32[r4+4>>2]=r13;r13=Math.sqrt(r19*r19+r20*r20);if(r13<1.1920928955078125e-7){r21=0;return r21}r4=1/r13;HEAPF32[r5>>2]=r19*r4;HEAPF32[r10+24]=r20*r4;r21=r13;return r21}r13=r2+6|0;r4=r2+7|0;r20=r1+80|0;if(HEAP8[r13]<<24>>24==HEAP8[r4]<<24>>24){HEAP32[r20>>2]=2;r19=HEAPU8[r2+9|0];r5=HEAP32[r8+5];if((r5|0)<=(r19|0)){___assert_func(5250220,103,5256152,5249104)}r12=HEAP32[r8+4];r18=(r19<<3)+r12|0;r19=HEAP32[r18+4>>2];r22=(HEAP32[tempDoublePtr>>2]=HEAP32[r18>>2],HEAPF32[tempDoublePtr>>2]);r18=(HEAP32[tempDoublePtr>>2]=r19,HEAPF32[tempDoublePtr>>2]);r19=HEAPU8[r2+10|0];if((r5|0)<=(r19|0)){___assert_func(5250220,103,5256152,5249104)}r5=(r19<<3)+r12|0;r12=HEAP32[r5+4>>2];r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAPF32[tempDoublePtr>>2]);r5=(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=r1+92|0;r23=r5-r18;r24=(r19-r22)*-1;r25=r12>>2;r26=(HEAPF32[tempDoublePtr>>2]=r23,HEAP32[tempDoublePtr>>2]);r27=(HEAPF32[tempDoublePtr>>2]=r24,HEAP32[tempDoublePtr>>2])|0;HEAP32[r25]=0|r26;HEAP32[r25+1]=r27;r27=Math.sqrt(r23*r23+r24*r24);if(r27<1.1920928955078125e-7){r28=r23;r29=r24}else{r26=1/r27;r27=r23*r26;HEAPF32[r12>>2]=r27;r12=r24*r26;HEAPF32[r10+24]=r12;r28=r27;r29=r12}r12=(r22+r19)*.5;r19=(r18+r5)*.5;r5=r1+84|0;r18=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r22=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2])|0;HEAP32[r5>>2]=0|r18;HEAP32[r5+4>>2]=r22;r22=HEAPU8[r13];if((HEAP32[r9+5]|0)<=(r22|0)){___assert_func(5250220,103,5256152,5249104)}r5=(r22<<3)+HEAP32[r9+4]|0;r22=HEAP32[r5+4>>2];r18=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAPF32[tempDoublePtr>>2]);r5=(HEAP32[tempDoublePtr>>2]=r22,HEAPF32[tempDoublePtr>>2]);r22=(r6*r28-r7*r29)*(r16+(r15*r18-r14*r5)-(r17+(r6*r12-r7*r19)))+(r7*r28+r6*r29)*(r11+r14*r18+r15*r5-(r3+r7*r12+r6*r19));if(r22>=0){r21=r22;return r21}r19=(HEAPF32[tempDoublePtr>>2]=-r28,HEAP32[tempDoublePtr>>2]);r28=(HEAPF32[tempDoublePtr>>2]=-r29,HEAP32[tempDoublePtr>>2])|0;HEAP32[r25]=0|r19;HEAP32[r25+1]=r28;r21=-r22;return r21}else{HEAP32[r20>>2]=1;r20=HEAPU8[r13];r13=HEAP32[r9+5];if((r13|0)<=(r20|0)){___assert_func(5250220,103,5256152,5249104)}r22=HEAP32[r9+4];r9=(r20<<3)+r22|0;r20=HEAP32[r9+4>>2];r28=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAPF32[tempDoublePtr>>2]);r9=(HEAP32[tempDoublePtr>>2]=r20,HEAPF32[tempDoublePtr>>2]);r20=HEAPU8[r4];if((r13|0)<=(r20|0)){___assert_func(5250220,103,5256152,5249104)}r13=(r20<<3)+r22|0;r22=HEAP32[r13+4>>2];r20=(HEAP32[tempDoublePtr>>2]=HEAP32[r13>>2],HEAPF32[tempDoublePtr>>2]);r13=(HEAP32[tempDoublePtr>>2]=r22,HEAPF32[tempDoublePtr>>2]);r22=r1+92|0;r4=r13-r9;r25=(r20-r28)*-1;r19=r22>>2;r29=(HEAPF32[tempDoublePtr>>2]=r4,HEAP32[tempDoublePtr>>2]);r12=(HEAPF32[tempDoublePtr>>2]=r25,HEAP32[tempDoublePtr>>2])|0;HEAP32[r19]=0|r29;HEAP32[r19+1]=r12;r12=Math.sqrt(r4*r4+r25*r25);if(r12<1.1920928955078125e-7){r30=r4;r31=r25}else{r29=1/r12;r12=r4*r29;HEAPF32[r22>>2]=r12;r22=r25*r29;HEAPF32[r10+24]=r22;r30=r12;r31=r22}r22=(r28+r20)*.5;r20=(r9+r13)*.5;r13=r1+84|0;r1=(HEAPF32[tempDoublePtr>>2]=r22,HEAP32[tempDoublePtr>>2]);r9=(HEAPF32[tempDoublePtr>>2]=r20,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r1;HEAP32[r13+4>>2]=r9;r9=HEAPU8[r2+9|0];if((HEAP32[r8+5]|0)<=(r9|0)){___assert_func(5250220,103,5256152,5249104)}r2=(r9<<3)+HEAP32[r8+4]|0;r8=HEAP32[r2+4>>2];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r2>>2],HEAPF32[tempDoublePtr>>2]);r2=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=(r15*r30-r14*r31)*(r17+(r6*r9-r7*r2)-(r16+(r15*r22-r14*r20)))+(r14*r30+r15*r31)*(r3+r7*r9+r6*r2-(r11+r14*r22+r15*r20));if(r8>=0){r21=r8;return r21}r20=(HEAPF32[tempDoublePtr>>2]=-r30,HEAP32[tempDoublePtr>>2]);r30=(HEAPF32[tempDoublePtr>>2]=-r31,HEAP32[tempDoublePtr>>2])|0;HEAP32[r19]=0|r20;HEAP32[r19+1]=r30;r21=-r8;return r21}}function __ZNK12b2ChainShape13GetChildCountEv(r1){return HEAP32[r1+16>>2]-1|0}function __ZN12b2ChainShapeD0Ev(r1){var r2;HEAP32[r1>>2]=5262320;r2=r1+12|0;_free(HEAP32[r2>>2]);HEAP32[r2>>2]=0;HEAP32[r1+16>>2]=0;__ZdlPv(r1);return}function __ZN12b2ChainShapeD2Ev(r1){var r2;HEAP32[r1>>2]=5262320;r2=r1+12|0;_free(HEAP32[r2>>2]);HEAP32[r2>>2]=0;HEAP32[r1+16>>2]=0;return}function __ZNK20b2SeparationFunction17FindMinSeparationEPiS0_f(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35;r5=r2>>2;r2=r1>>2;r6=1-r4;r7=r6*HEAPF32[r2+4]+HEAPF32[r2+6]*r4;r8=r6*HEAPF32[r2+5]+HEAPF32[r2+7]*r4;r9=r6*HEAPF32[r2+8]+HEAPF32[r2+9]*r4;r10=Math.sin(r9);r11=Math.cos(r9);r9=HEAPF32[r2+2];r12=HEAPF32[r2+3];r13=r7-(r11*r9-r10*r12);r7=r8-(r10*r9+r11*r12);r12=r6*HEAPF32[r2+13]+HEAPF32[r2+15]*r4;r9=r6*HEAPF32[r2+14]+HEAPF32[r2+16]*r4;r8=r6*HEAPF32[r2+17]+HEAPF32[r2+18]*r4;r4=Math.sin(r8);r6=Math.cos(r8);r8=HEAPF32[r2+11];r14=HEAPF32[r2+12];r15=r12-(r6*r8-r4*r14);r12=r9-(r4*r8+r6*r14);r14=HEAP32[r2+20];if((r14|0)==0){r8=r1+92|0;r9=HEAPF32[r8>>2];r16=r1+96|0;r17=HEAPF32[r16>>2];r18=r11*r9+r10*r17;r19=r9*-r10+r11*r17;r20=-r17;r17=r6*-r9+r4*r20;r21=r4*r9+r6*r20;r20=r1|0;r9=HEAP32[r20>>2];r22=HEAP32[r9+16>>2]>>2;r23=HEAP32[r9+20>>2];L993:do{if((r23|0)>1){r9=r19*HEAPF32[r22+1]+r18*HEAPF32[r22];r24=1;r25=0;while(1){r26=r18*HEAPF32[(r24<<3>>2)+r22]+r19*HEAPF32[((r24<<3)+4>>2)+r22];r27=r26>r9;r28=r27?r24:r25;r29=r24+1|0;if((r29|0)==(r23|0)){r30=r28;break L993}else{r9=r27?r26:r9;r24=r29;r25=r28}}}else{r30=0}}while(0);HEAP32[r5]=r30;r30=r1+4|0;r23=HEAP32[r30>>2];r22=HEAP32[r23+16>>2]>>2;r19=HEAP32[r23+20>>2];L998:do{if((r19|0)>1){r23=r21*HEAPF32[r22+1]+r17*HEAPF32[r22];r18=1;r25=0;while(1){r24=r17*HEAPF32[(r18<<3>>2)+r22]+r21*HEAPF32[((r18<<3)+4>>2)+r22];r9=r24>r23;r28=r9?r18:r25;r29=r18+1|0;if((r29|0)==(r19|0)){r31=r28;break L998}else{r23=r9?r24:r23;r18=r29;r25=r28}}}else{r31=0}}while(0);HEAP32[r3>>2]=r31;r19=HEAP32[r20>>2];r20=HEAP32[r5];if((r20|0)<=-1){___assert_func(5250220,103,5256152,5249104)}if((HEAP32[r19+20>>2]|0)<=(r20|0)){___assert_func(5250220,103,5256152,5249104)}r22=(r20<<3)+HEAP32[r19+16>>2]|0;r19=HEAP32[r22+4>>2];r20=(HEAP32[tempDoublePtr>>2]=HEAP32[r22>>2],HEAPF32[tempDoublePtr>>2]);r22=(HEAP32[tempDoublePtr>>2]=r19,HEAPF32[tempDoublePtr>>2]);r19=HEAP32[r30>>2];if((r31|0)<=-1){___assert_func(5250220,103,5256152,5249104)}if((HEAP32[r19+20>>2]|0)<=(r31|0)){___assert_func(5250220,103,5256152,5249104)}r30=(r31<<3)+HEAP32[r19+16>>2]|0;r19=HEAP32[r30+4>>2];r31=(HEAP32[tempDoublePtr>>2]=HEAP32[r30>>2],HEAPF32[tempDoublePtr>>2]);r30=(HEAP32[tempDoublePtr>>2]=r19,HEAPF32[tempDoublePtr>>2]);r19=HEAPF32[r8>>2]*(r15+(r6*r31-r4*r30)-(r13+(r11*r20-r10*r22)))+HEAPF32[r16>>2]*(r12+r4*r31+r6*r30-(r7+r10*r20+r11*r22));return r19}else if((r14|0)==2){r22=HEAPF32[r2+23];r20=HEAPF32[r2+24];r30=r6*r22-r4*r20;r31=r4*r22+r6*r20;r20=HEAPF32[r2+21];r22=HEAPF32[r2+22];r16=r15+(r6*r20-r4*r22);r8=r12+r4*r20+r6*r22;r22=-r31;r20=r11*-r30+r10*r22;r21=r10*r30+r11*r22;HEAP32[r3>>2]=-1;r22=r1|0;r17=HEAP32[r22>>2];r25=HEAP32[r17+16>>2]>>2;r18=HEAP32[r17+20>>2];do{if((r18|0)>1){r17=r21*HEAPF32[r25+1]+r20*HEAPF32[r25];r23=1;r28=0;while(1){r29=r20*HEAPF32[(r23<<3>>2)+r25]+r21*HEAPF32[((r23<<3)+4>>2)+r25];r24=r29>r17;r32=r24?r23:r28;r9=r23+1|0;if((r9|0)==(r18|0)){break}else{r17=r24?r29:r17;r23=r9;r28=r32}}HEAP32[r5]=r32;if((r32|0)>-1){r33=r32;break}___assert_func(5250220,103,5256152,5249104)}else{HEAP32[r5]=0;r33=0}}while(0);r32=HEAP32[r22>>2];if((HEAP32[r32+20>>2]|0)<=(r33|0)){___assert_func(5250220,103,5256152,5249104)}r22=(r33<<3)+HEAP32[r32+16>>2]|0;r32=HEAP32[r22+4>>2];r33=(HEAP32[tempDoublePtr>>2]=HEAP32[r22>>2],HEAPF32[tempDoublePtr>>2]);r22=(HEAP32[tempDoublePtr>>2]=r32,HEAPF32[tempDoublePtr>>2]);r19=r30*(r13+(r11*r33-r10*r22)-r16)+r31*(r7+r10*r33+r11*r22-r8);return r19}else if((r14|0)==1){r14=HEAPF32[r2+23];r8=HEAPF32[r2+24];r22=r11*r14-r10*r8;r33=r10*r14+r11*r8;r8=HEAPF32[r2+21];r14=HEAPF32[r2+22];r2=r13+(r11*r8-r10*r14);r13=r7+r10*r8+r11*r14;r14=-r33;r11=r6*-r22+r4*r14;r8=r4*r22+r6*r14;HEAP32[r5]=-1;r5=r1+4|0;r1=HEAP32[r5>>2];r14=HEAP32[r1+16>>2]>>2;r10=HEAP32[r1+20>>2];do{if((r10|0)>1){r1=r8*HEAPF32[r14+1]+r11*HEAPF32[r14];r7=1;r31=0;while(1){r16=r11*HEAPF32[(r7<<3>>2)+r14]+r8*HEAPF32[((r7<<3)+4>>2)+r14];r30=r16>r1;r34=r30?r7:r31;r32=r7+1|0;if((r32|0)==(r10|0)){break}else{r1=r30?r16:r1;r7=r32;r31=r34}}HEAP32[r3>>2]=r34;if((r34|0)>-1){r35=r34;break}___assert_func(5250220,103,5256152,5249104)}else{HEAP32[r3>>2]=0;r35=0}}while(0);r3=HEAP32[r5>>2];if((HEAP32[r3+20>>2]|0)<=(r35|0)){___assert_func(5250220,103,5256152,5249104)}r5=(r35<<3)+HEAP32[r3+16>>2]|0;r3=HEAP32[r5+4>>2];r35=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAPF32[tempDoublePtr>>2]);r5=(HEAP32[tempDoublePtr>>2]=r3,HEAPF32[tempDoublePtr>>2]);r19=r22*(r15+(r6*r35-r4*r5)-r2)+r33*(r12+r4*r35+r6*r5-r13);return r19}else{___assert_func(5249412,183,5256068,5254044)}}function __ZNK20b2SeparationFunction8EvaluateEiif(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=r1>>2;r1=1-r4;r6=r1*HEAPF32[r5+4]+HEAPF32[r5+6]*r4;r7=r1*HEAPF32[r5+5]+HEAPF32[r5+7]*r4;r8=r1*HEAPF32[r5+8]+HEAPF32[r5+9]*r4;r9=Math.sin(r8);r10=Math.cos(r8);r8=HEAPF32[r5+2];r11=HEAPF32[r5+3];r12=r6-(r10*r8-r9*r11);r6=r7-(r9*r8+r10*r11);r11=r1*HEAPF32[r5+13]+HEAPF32[r5+15]*r4;r8=r1*HEAPF32[r5+14]+HEAPF32[r5+16]*r4;r7=r1*HEAPF32[r5+17]+HEAPF32[r5+18]*r4;r4=Math.sin(r7);r1=Math.cos(r7);r7=HEAPF32[r5+11];r13=HEAPF32[r5+12];r14=r11-(r1*r7-r4*r13);r11=r8-(r4*r7+r1*r13);r13=HEAP32[r5+20];if((r13|0)==1){r7=HEAPF32[r5+23];r8=HEAPF32[r5+24];r15=HEAPF32[r5+21];r16=HEAPF32[r5+22];r17=HEAP32[r5+1];if((r3|0)<=-1){___assert_func(5250220,103,5256152,5249104)}if((HEAP32[r17+20>>2]|0)<=(r3|0)){___assert_func(5250220,103,5256152,5249104)}r18=(r3<<3)+HEAP32[r17+16>>2]|0;r17=HEAP32[r18+4>>2];r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r18>>2],HEAPF32[tempDoublePtr>>2]);r18=(HEAP32[tempDoublePtr>>2]=r17,HEAPF32[tempDoublePtr>>2]);r17=(r10*r7-r9*r8)*(r14+(r1*r19-r4*r18)-(r12+(r10*r15-r9*r16)))+(r9*r7+r10*r8)*(r11+r4*r19+r1*r18-(r6+r9*r15+r10*r16));return r17}else if((r13|0)==0){r16=HEAPF32[r5+23];r15=HEAPF32[r5+24];r18=HEAP32[r5];if((r2|0)<=-1){___assert_func(5250220,103,5256152,5249104)}if((HEAP32[r18+20>>2]|0)<=(r2|0)){___assert_func(5250220,103,5256152,5249104)}r19=(r2<<3)+HEAP32[r18+16>>2]|0;r18=HEAP32[r19+4>>2];r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAPF32[tempDoublePtr>>2]);r19=(HEAP32[tempDoublePtr>>2]=r18,HEAPF32[tempDoublePtr>>2]);r18=HEAP32[r5+1];if((r3|0)<=-1){___assert_func(5250220,103,5256152,5249104)}if((HEAP32[r18+20>>2]|0)<=(r3|0)){___assert_func(5250220,103,5256152,5249104)}r7=(r3<<3)+HEAP32[r18+16>>2]|0;r18=HEAP32[r7+4>>2];r3=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAPF32[tempDoublePtr>>2]);r7=(HEAP32[tempDoublePtr>>2]=r18,HEAPF32[tempDoublePtr>>2]);r17=r16*(r14+(r1*r3-r4*r7)-(r12+(r10*r8-r9*r19)))+r15*(r11+r4*r3+r1*r7-(r6+r9*r8+r10*r19));return r17}else if((r13|0)==2){r13=HEAPF32[r5+23];r19=HEAPF32[r5+24];r8=HEAPF32[r5+21];r7=HEAPF32[r5+22];r3=HEAP32[r5];if((r2|0)<=-1){___assert_func(5250220,103,5256152,5249104)}if((HEAP32[r3+20>>2]|0)<=(r2|0)){___assert_func(5250220,103,5256152,5249104)}r5=(r2<<3)+HEAP32[r3+16>>2]|0;r3=HEAP32[r5+4>>2];r2=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAPF32[tempDoublePtr>>2]);r5=(HEAP32[tempDoublePtr>>2]=r3,HEAPF32[tempDoublePtr>>2]);r17=(r1*r13-r4*r19)*(r12+(r10*r2-r9*r5)-(r14+(r1*r8-r4*r7)))+(r4*r13+r1*r19)*(r6+r9*r2+r10*r5-(r11+r4*r8+r1*r7));return r17}else{___assert_func(5249412,242,5256e3,5254044)}}function __ZNK12b2ChainShape5CloneEP16b2BlockAllocator(r1,r2){var r3,r4,r5,r6,r7;r3=__ZN16b2BlockAllocator8AllocateEi(r2,40),r2=r3>>2;if((r3|0)==0){r4=0}else{HEAP32[r2]=5262320;HEAP32[r2+1]=3;HEAPF32[r2+2]=.009999999776482582;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP8[r3+36|0]=0;HEAP8[r3+37|0]=0;r4=r3}r3=HEAP32[r1+12>>2];r2=HEAP32[r1+16>>2];r5=r4+12|0;if((HEAP32[r5>>2]|0)!=0){___assert_func(5248948,48,5260636,5253724)}r6=(r4+16|0)>>2;if((HEAP32[r6]|0)!=0){___assert_func(5248948,48,5260636,5253724)}if((r2|0)>1){HEAP32[r6]=r2;r7=_malloc(r2<<3);HEAP32[r5>>2]=r7;_memcpy(r7,r3,HEAP32[r6]<<3);r6=r4+36|0;HEAP8[r6]=0;r3=r4+37|0;HEAP8[r3]=0;r7=r1+20|0;r5=r4+20|0;r2=HEAP32[r7+4>>2];HEAP32[r5>>2]=HEAP32[r7>>2];HEAP32[r5+4>>2]=r2;r2=r1+28|0;r5=r4+28|0;r7=HEAP32[r2+4>>2];HEAP32[r5>>2]=HEAP32[r2>>2];HEAP32[r5+4>>2]=r7;HEAP8[r6]=HEAP8[r1+36|0]&1;HEAP8[r3]=HEAP8[r1+37|0]&1;return r4|0}else{___assert_func(5248948,49,5260636,5249460)}}function __ZNK12b2ChainShape9TestPointERK11b2TransformRK6b2Vec2(r1,r2,r3){return 0}function __ZN11b2EdgeShapeD1Ev(r1){return}function __ZNK13b2CircleShape13GetChildCountEv(r1){return 1}function __ZN13b2CircleShapeD1Ev(r1){return}function __ZNK11b2EdgeShape13GetChildCountEv(r1){return 1}function __ZNK11b2EdgeShape9TestPointERK11b2TransformRK6b2Vec2(r1,r2,r3){return 0}function __ZNK14b2PolygonShape13GetChildCountEv(r1){return 1}function __ZNK13b2CircleShape9TestPointERK11b2TransformRK6b2Vec2(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=HEAPF32[r2+12>>2];r5=HEAPF32[r1+12>>2];r6=HEAPF32[r2+8>>2];r7=HEAPF32[r1+16>>2];r8=HEAPF32[r3>>2]-(HEAPF32[r2>>2]+(r4*r5-r6*r7));r9=HEAPF32[r3+4>>2]-(HEAPF32[r2+4>>2]+r5*r6+r4*r7);r7=HEAPF32[r1+8>>2];return r8*r8+r9*r9<=r7*r7}function __ZNK13b2CircleShape11ComputeAABBEP6b2AABBRK11b2Transformi(r1,r2,r3,r4){var r5,r6,r7,r8,r9;r4=HEAPF32[r3+12>>2];r5=HEAPF32[r1+12>>2];r6=HEAPF32[r3+8>>2];r7=HEAPF32[r1+16>>2];r8=HEAPF32[r3>>2]+(r4*r5-r6*r7);r9=HEAPF32[r3+4>>2]+r5*r6+r4*r7;r7=r1+8|0;r1=HEAPF32[r7>>2];HEAPF32[r2>>2]=r8-r1;HEAPF32[r2+4>>2]=r9-r1;r1=HEAPF32[r7>>2];HEAPF32[r2+8>>2]=r8+r1;HEAPF32[r2+12>>2]=r9+r1;return}function __ZNK13b2CircleShape11ComputeMassEP10b2MassDataf(r1,r2,r3){var r4,r5,r6,r7,r8;r4=r1+8|0;r5=HEAPF32[r4>>2];r6=r5*r3*3.1415927410125732*r5;HEAPF32[r2>>2]=r6;r5=r1+12|0;r3=r5;r7=r2+4|0;r8=HEAP32[r3+4>>2];HEAP32[r7>>2]=HEAP32[r3>>2];HEAP32[r7+4>>2]=r8;r8=HEAPF32[r4>>2];r4=HEAPF32[r5>>2];r5=HEAPF32[r1+16>>2];HEAPF32[r2+12>>2]=r6*(r8*r8*.5+r4*r4+r5*r5);return}function __ZNK11b2EdgeShape11ComputeAABBEP6b2AABBRK11b2Transformi(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11;r4=r1>>2;r1=HEAPF32[r3+12>>2];r5=HEAPF32[r4+3];r6=HEAPF32[r3+8>>2];r7=HEAPF32[r4+4];r8=HEAPF32[r3>>2];r9=r8+(r1*r5-r6*r7);r10=HEAPF32[r3+4>>2];r3=r5*r6+r1*r7+r10;r7=HEAPF32[r4+5];r5=HEAPF32[r4+6];r11=r8+(r1*r7-r6*r5);r8=r10+r6*r7+r1*r5;r5=HEAPF32[r4+2];r4=r2;r1=(HEAPF32[tempDoublePtr>>2]=(r9<r11?r9:r11)-r5,HEAP32[tempDoublePtr>>2]);r7=(HEAPF32[tempDoublePtr>>2]=(r3<r8?r3:r8)-r5,HEAP32[tempDoublePtr>>2])|0;HEAP32[r4>>2]=0|r1;HEAP32[r4+4>>2]=r7;r7=r2+8|0;r2=(HEAPF32[tempDoublePtr>>2]=r5+(r9>r11?r9:r11),HEAP32[tempDoublePtr>>2]);r11=(HEAPF32[tempDoublePtr>>2]=r5+(r3>r8?r3:r8),HEAP32[tempDoublePtr>>2])|0;HEAP32[r7>>2]=0|r2;HEAP32[r7+4>>2]=r11;return}function __ZNK11b2EdgeShape11ComputeMassEP10b2MassDataf(r1,r2,r3){var r4,r5;HEAPF32[r2>>2]=0;r3=(HEAPF32[r1+16>>2]+HEAPF32[r1+24>>2])*.5;r4=r2+4|0;r5=(HEAPF32[tempDoublePtr>>2]=(HEAPF32[r1+12>>2]+HEAPF32[r1+20>>2])*.5,HEAP32[tempDoublePtr>>2]);r1=(HEAPF32[tempDoublePtr>>2]=r3,HEAP32[tempDoublePtr>>2])|0;HEAP32[r4>>2]=0|r5;HEAP32[r4+4>>2]=r1;HEAPF32[r2+12>>2]=0;return}function __ZNK12b2ChainShape11ComputeMassEP10b2MassDataf(r1,r2,r3){r3=r2>>2;HEAP32[r3]=0;HEAP32[r3+1]=0;HEAP32[r3+2]=0;HEAP32[r3+3]=0;return}function __ZNK13b2CircleShape5CloneEP16b2BlockAllocator(r1,r2){var r3,r4;r3=__ZN16b2BlockAllocator8AllocateEi(r2,20);if((r3|0)==0){r4=0}else{HEAP32[r3>>2]=5262172;r2=(r3+4|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;r4=r3}HEAP32[r4+4>>2]=HEAP32[r1+4>>2];HEAPF32[r4+8>>2]=HEAPF32[r1+8>>2];r3=r1+12|0;r1=r4+12|0;r2=HEAP32[r3+4>>2];HEAP32[r1>>2]=HEAP32[r3>>2];HEAP32[r1+4>>2]=r2;return r4|0}function __ZNK13b2CircleShape7RayCastEP15b2RayCastOutputRK14b2RayCastInputRK11b2Transformi(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13;r5=r3>>2;r3=HEAPF32[r4+12>>2];r6=HEAPF32[r1+12>>2];r7=HEAPF32[r4+8>>2];r8=HEAPF32[r1+16>>2];r9=HEAPF32[r5];r10=r9-(HEAPF32[r4>>2]+(r3*r6-r7*r8));r11=HEAPF32[r5+1];r12=r11-(HEAPF32[r4+4>>2]+r6*r7+r3*r8);r8=HEAPF32[r1+8>>2];r1=HEAPF32[r5+2]-r9;r9=HEAPF32[r5+3]-r11;r11=r10*r1+r12*r9;r3=r1*r1+r9*r9;r7=r11*r11-(r10*r10+r12*r12-r8*r8)*r3;if(r7<0|r3<1.1920928955078125e-7){r13=0;return r13}r8=r11+Math.sqrt(r7);r7=-r8;if(r8>-0){r13=0;return r13}if(r3*HEAPF32[r5+4]<r7){r13=0;return r13}r5=r7/r3;HEAPF32[r2+8>>2]=r5;r3=r10+r1*r5;r1=r12+r9*r5;r5=r2;r9=(HEAPF32[tempDoublePtr>>2]=r3,HEAP32[tempDoublePtr>>2]);r12=(HEAPF32[tempDoublePtr>>2]=r1,HEAP32[tempDoublePtr>>2])|0;HEAP32[r5>>2]=0|r9;HEAP32[r5+4>>2]=r12;r12=Math.sqrt(r3*r3+r1*r1);if(r12<1.1920928955078125e-7){r13=1;return r13}r5=1/r12;HEAPF32[r2>>2]=r3*r5;HEAPF32[r2+4>>2]=r1*r5;r13=1;return r13}function __ZN13b2CircleShapeD0Ev(r1){__ZdlPv(r1);return}function __ZNK11b2EdgeShape5CloneEP16b2BlockAllocator(r1,r2){var r3,r4,r5;r3=__ZN16b2BlockAllocator8AllocateEi(r2,48),r2=r3>>2;if((r3|0)==0){r4=0}else{HEAP32[r2]=5262520;HEAP32[r2+1]=1;HEAPF32[r2+2]=.009999999776482582;r2=r3+28|0;HEAP32[r2>>2]=0;HEAP32[r2+4>>2]=0;HEAP32[r2+8>>2]=0;HEAP32[r2+12>>2]=0;HEAP16[r2+16>>1]=0;r4=r3}HEAP32[r4+4>>2]=HEAP32[r1+4>>2];HEAPF32[r4+8>>2]=HEAPF32[r1+8>>2];r3=r1+12|0;r2=r4+12|0;r5=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r5;r5=r1+20|0;r2=r4+20|0;r3=HEAP32[r5+4>>2];HEAP32[r2>>2]=HEAP32[r5>>2];HEAP32[r2+4>>2]=r3;r3=r1+28|0;r2=r4+28|0;r5=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r5;r5=r1+36|0;r2=r4+36|0;r3=HEAP32[r5+4>>2];HEAP32[r2>>2]=HEAP32[r5>>2];HEAP32[r2+4>>2]=r3;HEAP8[r4+44|0]=HEAP8[r1+44|0]&1;HEAP8[r4+45|0]=HEAP8[r1+45|0]&1;return r4|0}function __ZNK11b2EdgeShape7RayCastEP15b2RayCastOutputRK14b2RayCastInputRK11b2Transformi(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r5=r3>>2;r3=HEAPF32[r4>>2];r6=HEAPF32[r5]-r3;r7=HEAPF32[r4+4>>2];r8=HEAPF32[r5+1]-r7;r9=HEAPF32[r4+12>>2];r10=HEAPF32[r4+8>>2];r4=r6*r9+r8*r10;r11=-r10;r12=r9*r8+r6*r11;r6=HEAPF32[r5+2]-r3;r3=HEAPF32[r5+3]-r7;r7=r9*r6+r10*r3-r4;r10=r6*r11+r9*r3-r12;r3=r1+12|0;r9=HEAP32[r3+4>>2];r11=(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAPF32[tempDoublePtr>>2]);r3=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2]);r9=r1+20|0;r1=HEAP32[r9+4>>2];r6=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAPF32[tempDoublePtr>>2])-r11;r9=(HEAP32[tempDoublePtr>>2]=r1,HEAPF32[tempDoublePtr>>2])-r3;r1=-r6;r8=r6*r6+r9*r9;r13=Math.sqrt(r8);if(r13<1.1920928955078125e-7){r14=r9;r15=r1}else{r16=1/r13;r14=r9*r16;r15=r16*r1}r1=(r3-r12)*r15+(r11-r4)*r14;r16=r10*r15+r7*r14;if(r16==0){r17=0;return r17}r13=r1/r16;if(r13<0){r17=0;return r17}if(HEAPF32[r5+4]<r13|r8==0){r17=0;return r17}r5=(r6*(r4+r7*r13-r11)+r9*(r12+r10*r13-r3))/r8;if(r5<0|r5>1){r17=0;return r17}HEAPF32[r2+8>>2]=r13;if(r1>0){r1=r2;r13=(HEAPF32[tempDoublePtr>>2]=-r14,HEAP32[tempDoublePtr>>2]);r5=(HEAPF32[tempDoublePtr>>2]=-r15,HEAP32[tempDoublePtr>>2])|0;HEAP32[r1>>2]=0|r13;HEAP32[r1+4>>2]=r5;r17=1;return r17}else{r5=r2;r2=(HEAPF32[tempDoublePtr>>2]=r14,HEAP32[tempDoublePtr>>2]);r14=(HEAPF32[tempDoublePtr>>2]=r15,HEAP32[tempDoublePtr>>2])|0;HEAP32[r5>>2]=0|r2;HEAP32[r5+4>>2]=r14;r17=1;return r17}}function __ZN11b2EdgeShapeD0Ev(r1){__ZdlPv(r1);return}function __ZNK14b2PolygonShape5CloneEP16b2BlockAllocator(r1,r2){var r3,r4,r5,r6;r3=__ZN16b2BlockAllocator8AllocateEi(r2,152),r2=r3>>2;if((r3|0)==0){r4=0,r5=r4>>2}else{HEAP32[r2]=5262076;HEAP32[r2+1]=2;HEAPF32[r2+2]=.009999999776482582;HEAP32[r2+37]=0;HEAPF32[r2+3]=0;HEAPF32[r2+4]=0;r4=r3,r5=r4>>2}HEAP32[r5+1]=HEAP32[r1+4>>2];HEAPF32[r5+2]=HEAPF32[r1+8>>2];r3=r1+12|0;r2=r4+12|0;r6=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r6;_memcpy(r4+20|0,r1+20|0,64);_memcpy(r4+84|0,r1+84|0,64);HEAP32[r5+37]=HEAP32[r1+148>>2];return r4|0}function __ZN14b2PolygonShape8SetAsBoxEffRK6b2Vec2f(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14;r6=r1>>2;r7=r1+148|0;HEAP32[r7>>2]=4;r8=-r2;r9=-r3;HEAPF32[r6+5]=r8;HEAPF32[r6+6]=r9;HEAPF32[r6+7]=r2;HEAPF32[r6+8]=r9;HEAPF32[r6+9]=r2;HEAPF32[r6+10]=r3;HEAPF32[r6+11]=r8;HEAPF32[r6+12]=r3;HEAPF32[r6+21]=0;HEAPF32[r6+22]=-1;HEAPF32[r6+23]=1;HEAPF32[r6+24]=0;HEAPF32[r6+25]=0;HEAPF32[r6+26]=1;HEAPF32[r6+27]=-1;HEAPF32[r6+28]=0;r3=r4>>2;r4=r1+12|0;r8=HEAP32[r3+1];HEAP32[r4>>2]=HEAP32[r3];HEAP32[r4+4>>2]=r8;r8=HEAP32[r3+1];r4=(HEAP32[tempDoublePtr>>2]=HEAP32[r3],HEAPF32[tempDoublePtr>>2]);r3=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=Math.sin(r5);r2=Math.cos(r5);r5=0;r10=r9;r9=-1;while(1){r11=(r5<<3)+r1+20|0;r12=HEAPF32[r11>>2];r13=r11;r11=(HEAPF32[tempDoublePtr>>2]=r4+(r2*r12-r8*r10),HEAP32[tempDoublePtr>>2]);r14=(HEAPF32[tempDoublePtr>>2]=r3+r8*r12+r2*r10,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r11;HEAP32[r13+4>>2]=r14;r14=(r5<<3)+r1+84|0;r13=HEAPF32[r14>>2];r11=r14;r14=(HEAPF32[tempDoublePtr>>2]=r2*r13-r8*r9,HEAP32[tempDoublePtr>>2]);r12=(HEAPF32[tempDoublePtr>>2]=r8*r13+r2*r9,HEAP32[tempDoublePtr>>2])|0;HEAP32[r11>>2]=0|r14;HEAP32[r11+4>>2]=r12;r12=r5+1|0;if((r12|0)>=(HEAP32[r7>>2]|0)){break}r5=r12;r10=HEAPF32[((r12<<3)+24>>2)+r6];r9=HEAPF32[((r12<<3)+88>>2)+r6]}return}function __ZNK12b2ChainShape12GetChildEdgeEP11b2EdgeShapei(r1,r2,r3){var r4,r5,r6,r7,r8,r9;if((r3|0)<=-1){___assert_func(5248948,89,5256940,5248712)}r4=r1+16|0;if((HEAP32[r4>>2]-1|0)<=(r3|0)){___assert_func(5248948,89,5256940,5248712)}HEAP32[r2+4>>2]=1;HEAPF32[r2+8>>2]=HEAPF32[r1+8>>2];r5=(r1+12|0)>>2;r6=(r3<<3)+HEAP32[r5]|0;r7=r2+12|0;r8=HEAP32[r6+4>>2];HEAP32[r7>>2]=HEAP32[r6>>2];HEAP32[r7+4>>2]=r8;r8=(r3+1<<3)+HEAP32[r5]|0;r7=r2+20|0;r6=HEAP32[r8+4>>2];HEAP32[r7>>2]=HEAP32[r8>>2];HEAP32[r7+4>>2]=r6;r6=r2+28|0;if((r3|0)>0){r7=(r3-1<<3)+HEAP32[r5]|0;r8=r6;r9=HEAP32[r7+4>>2];HEAP32[r8>>2]=HEAP32[r7>>2];HEAP32[r8+4>>2]=r9;HEAP8[r2+44|0]=1}else{r9=r1+20|0;r8=r6;r6=HEAP32[r9+4>>2];HEAP32[r8>>2]=HEAP32[r9>>2];HEAP32[r8+4>>2]=r6;HEAP8[r2+44|0]=HEAP8[r1+36|0]&1}r6=r2+36|0;if((HEAP32[r4>>2]-2|0)>(r3|0)){r4=(r3+2<<3)+HEAP32[r5]|0;r5=r6;r3=HEAP32[r4+4>>2];HEAP32[r5>>2]=HEAP32[r4>>2];HEAP32[r5+4>>2]=r3;HEAP8[r2+45|0]=1;return}else{r3=r1+28|0;r5=r6;r6=HEAP32[r3+4>>2];HEAP32[r5>>2]=HEAP32[r3>>2];HEAP32[r5+4>>2]=r6;HEAP8[r2+45|0]=HEAP8[r1+37|0]&1;return}}function __ZNK12b2ChainShape7RayCastEP15b2RayCastOutputRK14b2RayCastInputRK11b2Transformi(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11;r6=STACKTOP;STACKTOP=STACKTOP+48|0;r7=r6,r8=r7>>2;r9=HEAP32[r1+16>>2];if((r9|0)>(r5|0)){HEAP32[r8]=5262520;HEAP32[r8+1]=1;HEAPF32[r8+2]=.009999999776482582;r8=r7+28|0;HEAP32[r8>>2]=0;HEAP32[r8+4>>2]=0;HEAP32[r8+8>>2]=0;HEAP32[r8+12>>2]=0;HEAP16[r8+16>>1]=0;r8=r5+1|0;r10=HEAP32[r1+12>>2];r1=(r5<<3)+r10|0;r5=r7+12|0;r11=HEAP32[r1+4>>2];HEAP32[r5>>2]=HEAP32[r1>>2];HEAP32[r5+4>>2]=r11;r11=(((r8|0)==(r9|0)?0:r8)<<3)+r10|0;r10=r7+20|0;r8=HEAP32[r11+4>>2];HEAP32[r10>>2]=HEAP32[r11>>2];HEAP32[r10+4>>2]=r8;r8=__ZNK11b2EdgeShape7RayCastEP15b2RayCastOutputRK14b2RayCastInputRK11b2Transformi(r7,r2,r3,r4,0);STACKTOP=r6;return r8}else{___assert_func(5248948,129,5256828,5248300)}}function __ZNK12b2ChainShape11ComputeAABBEP6b2AABBRK11b2Transformi(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11;r5=HEAP32[r1+16>>2];if((r5|0)>(r4|0)){r6=r4+1|0;r7=(r6|0)==(r5|0)?0:r6;r6=HEAP32[r1+12>>2]>>2;r1=HEAPF32[r3+12>>2];r5=HEAPF32[(r4<<3>>2)+r6];r8=HEAPF32[r3+8>>2];r9=HEAPF32[((r4<<3)+4>>2)+r6];r4=HEAPF32[r3>>2];r10=r4+(r1*r5-r8*r9);r11=HEAPF32[r3+4>>2];r3=r5*r8+r1*r9+r11;r9=HEAPF32[(r7<<3>>2)+r6];r5=HEAPF32[((r7<<3)+4>>2)+r6];r6=r4+(r1*r9-r8*r5);r4=r11+r8*r9+r1*r5;r5=r2;r1=(HEAPF32[tempDoublePtr>>2]=r10<r6?r10:r6,HEAP32[tempDoublePtr>>2]);r9=(HEAPF32[tempDoublePtr>>2]=r3<r4?r3:r4,HEAP32[tempDoublePtr>>2])|0;HEAP32[r5>>2]=0|r1;HEAP32[r5+4>>2]=r9;r9=r2+8|0;r2=(HEAPF32[tempDoublePtr>>2]=r10>r6?r10:r6,HEAP32[tempDoublePtr>>2]);r6=(HEAPF32[tempDoublePtr>>2]=r3>r4?r3:r4,HEAP32[tempDoublePtr>>2])|0;HEAP32[r9>>2]=0|r2;HEAP32[r9+4>>2]=r6;return}else{___assert_func(5248948,148,5257e3,5248300)}}function __ZN14b2PolygonShapeD1Ev(r1){return}function __ZN6b2DrawD1Ev(r1){return}function __ZN6b2Draw11DrawPolygonEPK6b2Vec2iRK7b2Color(r1,r2,r3,r4){return}function __ZN6b2Draw16DrawSolidPolygonEPK6b2Vec2iRK7b2Color(r1,r2,r3,r4){return}function __ZN6b2Draw10DrawCircleERK6b2Vec2fRK7b2Color(r1,r2,r3,r4){return}function __ZN6b2Draw15DrawSolidCircleERK6b2Vec2fS2_RK7b2Color(r1,r2,r3,r4,r5){return}function __ZN6b2Draw11DrawSegmentERK6b2Vec2S2_RK7b2Color(r1,r2,r3,r4){return}function __ZN6b2Draw13DrawTransformERK11b2Transform(r1,r2){return}function __ZNK14b2PolygonShape9TestPointERK11b2TransformRK6b2Vec2(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=r1>>2;r1=0;r5=HEAPF32[r3>>2]-HEAPF32[r2>>2];r6=HEAPF32[r3+4>>2]-HEAPF32[r2+4>>2];r3=HEAPF32[r2+12>>2];r7=HEAPF32[r2+8>>2];r2=r5*r3+r6*r7;r8=r3*r6+r5*-r7;r7=HEAP32[r4+37];r5=0;while(1){if((r5|0)>=(r7|0)){r9=1;r1=925;break}if((r2-HEAPF32[((r5<<3)+20>>2)+r4])*HEAPF32[((r5<<3)+84>>2)+r4]+(r8-HEAPF32[((r5<<3)+24>>2)+r4])*HEAPF32[((r5<<3)+88>>2)+r4]>0){r9=0;r1=926;break}else{r5=r5+1|0}}if(r1==926){return r9}else if(r1==925){return r9}}function __ZNK14b2PolygonShape11ComputeAABBEP6b2AABBRK11b2Transformi(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r4=r1>>2;r1=HEAPF32[r3+12>>2];r5=HEAPF32[r4+5];r6=HEAPF32[r3+8>>2];r7=HEAPF32[r4+6];r8=HEAPF32[r3>>2];r9=r8+(r1*r5-r6*r7);r10=HEAPF32[r3+4>>2];r3=r5*r6+r1*r7+r10;r7=HEAP32[r4+37];L1196:do{if((r7|0)>1){r5=r3;r11=r9;r12=r3;r13=r9;r14=1;while(1){r15=HEAPF32[((r14<<3)+20>>2)+r4];r16=HEAPF32[((r14<<3)+24>>2)+r4];r17=r8+(r1*r15-r6*r16);r18=r15*r6+r1*r16+r10;r16=r11<r17?r11:r17;r15=r5<r18?r5:r18;r19=r13>r17?r13:r17;r17=r12>r18?r12:r18;r18=r14+1|0;if((r18|0)<(r7|0)){r5=r15;r11=r16;r12=r17;r13=r19;r14=r18}else{r20=r15;r21=r16;r22=r17;r23=r19;break L1196}}}else{r20=r3;r21=r9;r22=r3;r23=r9}}while(0);r9=HEAPF32[r4+2];r4=r2;r3=(HEAPF32[tempDoublePtr>>2]=r21-r9,HEAP32[tempDoublePtr>>2]);r21=(HEAPF32[tempDoublePtr>>2]=r20-r9,HEAP32[tempDoublePtr>>2])|0;HEAP32[r4>>2]=0|r3;HEAP32[r4+4>>2]=r21;r21=r2+8|0;r2=(HEAPF32[tempDoublePtr>>2]=r23+r9,HEAP32[tempDoublePtr>>2]);r23=(HEAPF32[tempDoublePtr>>2]=r22+r9,HEAP32[tempDoublePtr>>2])|0;HEAP32[r21>>2]=0|r2;HEAP32[r21+4>>2]=r23;return}function __ZNK7b2Mat337Solve33ERK6b2Vec3(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r4=r2>>2;r2=HEAPF32[r4+4];r5=HEAPF32[r4+8];r6=HEAPF32[r4+5];r7=HEAPF32[r4+7];r8=r2*r5-r6*r7;r9=HEAPF32[r4+6];r10=HEAPF32[r4+3];r11=r6*r9-r5*r10;r12=r7*r10-r2*r9;r13=HEAPF32[r4];r14=HEAPF32[r4+1];r15=HEAPF32[r4+2];r4=r8*r13+r14*r11+r12*r15;if(r4!=0){r16=1/r4}else{r16=r4}r4=HEAPF32[r3>>2];r17=HEAPF32[r3+4>>2];r18=HEAPF32[r3+8>>2];HEAPF32[r1>>2]=r16*(r8*r4+r17*r11+r12*r18);HEAPF32[r1+4>>2]=r16*((r17*r5-r18*r7)*r13+r14*(r18*r9-r5*r4)+(r7*r4-r17*r9)*r15);HEAPF32[r1+8>>2]=r16*((r2*r18-r6*r17)*r13+r14*(r6*r4-r18*r10)+(r17*r10-r2*r4)*r15);return}function __ZN14b2PolygonShapeD0Ev(r1){__ZdlPv(r1);return}function __ZN6b2DrawD0Ev(r1){__ZdlPv(r1);return}function __Z5b2LogPKcz(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3;HEAP32[r4>>2]=r2;_printf(r1,HEAP32[r4>>2]);STACKTOP=r3;return}function __ZN14b2PolygonShape3SetEPK6b2Vec2i(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r4=0;if((r3-3|0)>>>0>=6){___assert_func(5248440,122,5260144,5253580)}r5=(r1+148|0)>>2;HEAP32[r5]=r3;r3=0;while(1){r6=(r3<<3)+r2|0;r7=(r3<<3)+r1+20|0;r8=HEAP32[r6+4>>2];HEAP32[r7>>2]=HEAP32[r6>>2];HEAP32[r7+4>>2]=r8;r8=r3+1|0;r9=HEAP32[r5];if((r8|0)<(r9|0)){r3=r8}else{break}}if((r9|0)>0){r10=r9;r11=0}else{___assert_func(5248440,76,5261100,5247832)}while(1){r9=r11+1|0;r3=(r9|0)<(r10|0)?r9:0;r2=HEAPF32[r1+(r3<<3)+20>>2]-HEAPF32[r1+(r11<<3)+20>>2];r8=HEAPF32[r1+(r3<<3)+24>>2]-HEAPF32[r1+(r11<<3)+24>>2];if(r2*r2+r8*r8<=1.4210854715202004e-14){r4=943;break}r3=(r11<<3)+r1+84|0;r7=r3;r6=(HEAPF32[tempDoublePtr>>2]=r8,HEAP32[tempDoublePtr>>2]);r12=(HEAPF32[tempDoublePtr>>2]=r2*-1,HEAP32[tempDoublePtr>>2])|0;HEAP32[r7>>2]=0|r6;HEAP32[r7+4>>2]=r12;r12=(r11<<3)+r1+88|0;r7=HEAPF32[r12>>2];r6=Math.sqrt(r8*r8+r7*r7);if(r6>=1.1920928955078125e-7){r2=1/r6;HEAPF32[r3>>2]=r8*r2;HEAPF32[r12>>2]=r7*r2}r13=HEAP32[r5];if((r9|0)<(r13|0)){r10=r13;r11=r9}else{break}}if(r4==943){___assert_func(5248440,137,5260144,5251148)}r4=r1+12|0;r11=r1+20|0;if((r13|0)>2){r14=0;r15=0;r16=0;r17=0}else{___assert_func(5248440,76,5261100,5247832)}while(1){r10=(r14<<3)+r1+20|0;r5=HEAP32[r10+4>>2];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAPF32[tempDoublePtr>>2]);r10=(HEAP32[tempDoublePtr>>2]=r5,HEAPF32[tempDoublePtr>>2]);r5=r14+1|0;if((r5|0)<(r13|0)){r18=(r5<<3)+r1+20|0}else{r18=r11}r2=r18;r7=HEAP32[r2+4>>2];r12=(HEAP32[tempDoublePtr>>2]=HEAP32[r2>>2],HEAPF32[tempDoublePtr>>2]);r2=(HEAP32[tempDoublePtr>>2]=r7,HEAPF32[tempDoublePtr>>2]);r7=(r9*r2-r10*r12)*.5;r19=r15+r7;r8=r7*.3333333432674408;r20=r16+(r9+r12)*r8;r21=r17+(r10+r2)*r8;if((r5|0)==(r13|0)){break}else{r14=r5;r15=r19;r16=r20;r17=r21}}if(r19>1.1920928955078125e-7){r17=1/r19;r19=r4;r4=(HEAPF32[tempDoublePtr>>2]=r20*r17,HEAP32[tempDoublePtr>>2]);r20=(HEAPF32[tempDoublePtr>>2]=r21*r17,HEAP32[tempDoublePtr>>2])|0;HEAP32[r19>>2]=0|r4;HEAP32[r19+4>>2]=r20;return}else{___assert_func(5248440,115,5261100,5248276)}}function __ZNK14b2PolygonShape7RayCastEP15b2RayCastOutputRK14b2RayCastInputRK11b2Transformi(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r5=r3>>2;r3=r1>>2;r1=0;r6=HEAPF32[r4>>2];r7=HEAPF32[r5]-r6;r8=HEAPF32[r4+4>>2];r9=HEAPF32[r5+1]-r8;r10=r4+12|0;r11=HEAPF32[r10>>2];r12=r4+8|0;r4=HEAPF32[r12>>2];r13=r7*r11+r9*r4;r14=-r4;r15=r11*r9+r7*r14;r7=HEAPF32[r5+2]-r6;r6=HEAPF32[r5+3]-r8;r8=r11*r7+r4*r6-r13;r4=r7*r14+r11*r6-r15;r6=HEAPF32[r5+4];r5=HEAP32[r3+37];r11=0;r14=0;r7=-1;r9=r6;L1237:while(1){if((r14|0)>=(r5|0)){r1=967;break}r16=HEAPF32[((r14<<3)+84>>2)+r3];r17=HEAPF32[((r14<<3)+88>>2)+r3];r18=(HEAPF32[((r14<<3)+20>>2)+r3]-r13)*r16+(HEAPF32[((r14<<3)+24>>2)+r3]-r15)*r17;r19=r8*r16+r4*r17;L1240:do{if(r19==0){if(r18<0){r20=0;r1=973;break L1237}else{r21=r11;r22=r7;r23=r9}}else{do{if(r19<0){if(r18>=r11*r19){break}r21=r18/r19;r22=r14;r23=r9;break L1240}}while(0);if(r19<=0){r21=r11;r22=r7;r23=r9;break}if(r18>=r9*r19){r21=r11;r22=r7;r23=r9;break}r21=r11;r22=r7;r23=r18/r19}}while(0);if(r23<r21){r20=0;r1=972;break}else{r11=r21;r14=r14+1|0;r7=r22;r9=r23}}if(r1==972){return r20}else if(r1==967){if(r11<0|r11>r6){___assert_func(5248440,249,5256208,5249312)}if((r7|0)<=-1){r20=0;return r20}HEAPF32[r2+8>>2]=r11;r11=HEAPF32[r10>>2];r10=HEAPF32[((r7<<3)+84>>2)+r3];r6=HEAPF32[r12>>2];r12=HEAPF32[((r7<<3)+88>>2)+r3];r3=r2;r2=(HEAPF32[tempDoublePtr>>2]=r11*r10-r6*r12,HEAP32[tempDoublePtr>>2]);r7=(HEAPF32[tempDoublePtr>>2]=r10*r6+r11*r12,HEAP32[tempDoublePtr>>2])|0;HEAP32[r3>>2]=0|r2;HEAP32[r3+4>>2]=r7;r20=1;return r20}else if(r1==973){return r20}}function __ZNK14b2PolygonShape11ComputeMassEP10b2MassDataf(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r4=r1>>2;r5=HEAP32[r4+37];if((r5|0)>2){r6=0;r7=0;r8=0}else{___assert_func(5248440,306,5256324,5248692)}while(1){r9=r7+HEAPF32[((r8<<3)+20>>2)+r4];r10=r6+HEAPF32[((r8<<3)+24>>2)+r4];r11=r8+1|0;if((r11|0)<(r5|0)){r6=r10;r7=r9;r8=r11}else{break}}r8=1/(r5|0);r7=r9*r8;r9=r10*r8;r8=r1+20|0;r10=r1+24|0;r6=0;r11=0;r12=0;r13=0;r14=0;while(1){r15=HEAPF32[((r12<<3)+20>>2)+r4]-r7;r16=HEAPF32[((r12<<3)+24>>2)+r4]-r9;r17=r12+1|0;r18=(r17|0)<(r5|0);if(r18){r19=(r17<<3)+r1+20|0;r20=(r17<<3)+r1+24|0}else{r19=r8;r20=r10}r21=HEAPF32[r19>>2]-r7;r22=HEAPF32[r20>>2]-r9;r23=r15*r22-r16*r21;r24=r23*.5;r25=r14+r24;r26=r24*.3333333432674408;r27=r11+(r15+r21)*r26;r28=r6+(r16+r22)*r26;r29=r13+r23*.0833333358168602*(r21*r21+r15*r15+r15*r21+r22*r22+r16*r16+r16*r22);if(r18){r6=r28;r11=r27;r12=r17;r13=r29;r14=r25}else{break}}r14=r25*r3;HEAPF32[r2>>2]=r14;if(r25>1.1920928955078125e-7){r13=1/r25;r25=r27*r13;r27=r28*r13;r13=r7+r25;r7=r9+r27;r9=r2+4|0;r28=(HEAPF32[tempDoublePtr>>2]=r13,HEAP32[tempDoublePtr>>2]);r12=(HEAPF32[tempDoublePtr>>2]=r7,HEAP32[tempDoublePtr>>2])|0;HEAP32[r9>>2]=0|r28;HEAP32[r9+4>>2]=r12;HEAPF32[r2+12>>2]=r29*r3+r14*(r13*r13+r7*r7-(r25*r25+r27*r27));return}else{___assert_func(5248440,352,5256324,5248276)}}function __ZN16b2BlockAllocator8AllocateEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;if((r2|0)==0){r3=0;return r3}if((r2|0)<=0){___assert_func(5248148,104,5259644,5251024)}if((r2|0)>640){r3=_malloc(r2);return r3}r4=HEAP8[r2+5263852|0];r2=r4&255;if((r4&255)>=14){___assert_func(5248148,112,5259644,5249276)}r4=((r2<<2)+r1+12|0)>>2;r5=HEAP32[r4];if((r5|0)!=0){HEAP32[r4]=HEAP32[r5>>2];r3=r5;return r3}r5=(r1+4|0)>>2;r6=HEAP32[r5];r7=r1+8|0;r8=(r1|0)>>2;if((r6|0)==(HEAP32[r7>>2]|0)){r1=HEAP32[r8];r9=r6+128|0;HEAP32[r7>>2]=r9;r7=_malloc(r9<<3);HEAP32[r8]=r7;r9=r1;_memcpy(r7,r9,HEAP32[r5]<<3);_memset((HEAP32[r5]<<3)+HEAP32[r8]|0,0,1024);_free(r9);r10=HEAP32[r5]}else{r10=r6}r6=HEAP32[r8];r8=_malloc(16384);r9=((r10<<3)+r6+4|0)>>2;HEAP32[r9]=r8;r7=HEAP32[(r2<<2)+5264496>>2];HEAP32[r6+(r10<<3)>>2]=r7;r10=16384/(r7|0)&-1;if((Math.imul(r10,r7)|0)>=16385){___assert_func(5248148,140,5259644,5248652)}r6=r10-1|0;L1300:do{if((r6|0)>0){r10=0;r2=r8;while(1){r1=r10+1|0;HEAP32[(r2+Math.imul(r10,r7)|0)>>2]=r2+Math.imul(r1,r7)|0;r11=HEAP32[r9];if((r1|0)==(r6|0)){r12=r11;break L1300}else{r10=r1;r2=r11}}}else{r12=r8}}while(0);HEAP32[r12+Math.imul(r6,r7)>>2]=0;HEAP32[r4]=HEAP32[HEAP32[r9]>>2];HEAP32[r5]=HEAP32[r5]+1|0;r3=HEAP32[r9];return r3}function __ZN16b2StackAllocator4FreeEPv(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r3=(r1+102796|0)>>2;r4=HEAP32[r3];if((r4|0)<=0){___assert_func(5247660,63,5259324,5248632)}r5=r4-1|0;if((HEAP32[r1+(r5*12&-1)+102412>>2]|0)!=(r2|0)){___assert_func(5247660,65,5259324,5248256)}if((HEAP8[r1+(r5*12&-1)+102420|0]&1)<<24>>24==0){r6=r1+(r5*12&-1)+102416|0;r7=r1+102400|0;HEAP32[r7>>2]=HEAP32[r7>>2]-HEAP32[r6>>2]|0;r8=r4;r9=r6}else{_free(r2);r8=HEAP32[r3];r9=r1+(r5*12&-1)+102416|0}r5=r1+102404|0;HEAP32[r5>>2]=HEAP32[r5>>2]-HEAP32[r9>>2]|0;HEAP32[r3]=r8-1|0;return}function __ZN6b2BodyC2EPK9b2BodyDefP7b2World(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r4=r1>>2;r5=r2+4|0;r6=HEAPF32[r5>>2];if(!(!isNaN(r6)&!isNaN(0)&r6>-Infinity&r6<Infinity)){___assert_func(5247544,27,5258196,5253104)}r6=HEAPF32[r2+8>>2];if(!(!isNaN(r6)&!isNaN(0)&r6>-Infinity&r6<Infinity)){___assert_func(5247544,27,5258196,5253104)}r6=r2+16|0;r7=HEAPF32[r6>>2];if(!(!isNaN(r7)&!isNaN(0)&r7>-Infinity&r7<Infinity)){___assert_func(5247544,28,5258196,5250592)}r7=HEAPF32[r2+20>>2];if(!(!isNaN(r7)&!isNaN(0)&r7>-Infinity&r7<Infinity)){___assert_func(5247544,28,5258196,5250592)}r7=(r2+12|0)>>2;r8=HEAPF32[r7];if(!(!isNaN(r8)&!isNaN(0)&r8>-Infinity&r8<Infinity)){___assert_func(5247544,29,5258196,5249160)}r8=r2+24|0;r9=HEAPF32[r8>>2];if(!(!isNaN(r9)&!isNaN(0)&r9>-Infinity&r9<Infinity)){___assert_func(5247544,30,5258196,5248600)}r9=r2+32|0;r10=HEAPF32[r9>>2];if(r10<0|!isNaN(r10)&!isNaN(0)&r10>-Infinity&r10<Infinity^1){___assert_func(5247544,31,5258196,5248196)}r10=r2+28|0;r11=HEAPF32[r10>>2];if(r11<0|!isNaN(r11)&!isNaN(0)&r11>-Infinity&r11<Infinity^1){___assert_func(5247544,32,5258196,5247772)}r11=(r1+4|0)>>1;HEAP16[r11]=0;if((HEAP8[r2+39|0]&1)<<24>>24==0){r12=0}else{HEAP16[r11]=8;r12=8}if((HEAP8[r2+38|0]&1)<<24>>24==0){r13=r12}else{r14=r12|16;HEAP16[r11]=r14;r13=r14}if((HEAP8[r2+36|0]&1)<<24>>24==0){r15=r13}else{r14=r13|4;HEAP16[r11]=r14;r15=r14}if((HEAP8[r2+37|0]&1)<<24>>24==0){r16=r15}else{r14=r15|2;HEAP16[r11]=r14;r16=r14}if((HEAP8[r2+40|0]&1)<<24>>24!=0){HEAP16[r11]=r16|32}HEAP32[r4+22]=r3;r3=r5;r5=r1+12|0;r16=HEAP32[r3>>2];r11=HEAP32[r3+4>>2];HEAP32[r5>>2]=r16;HEAP32[r5+4>>2]=r11;r5=HEAPF32[r7];HEAPF32[r4+5]=Math.sin(r5);HEAPF32[r4+6]=Math.cos(r5);HEAPF32[r4+7]=0;HEAPF32[r4+8]=0;r5=r1+36|0;HEAP32[r5>>2]=r16;HEAP32[r5+4>>2]=r11;r5=r1+44|0;HEAP32[r5>>2]=r16;HEAP32[r5+4>>2]=r11;HEAPF32[r4+13]=HEAPF32[r7];HEAPF32[r4+14]=HEAPF32[r7];HEAPF32[r4+15]=0;HEAP32[r4+27]=0;HEAP32[r4+28]=0;HEAP32[r4+23]=0;HEAP32[r4+24]=0;r7=r6;r6=r1+64|0;r11=HEAP32[r7+4>>2];HEAP32[r6>>2]=HEAP32[r7>>2];HEAP32[r6+4>>2]=r11;HEAPF32[r4+18]=HEAPF32[r8>>2];HEAPF32[r4+33]=HEAPF32[r10>>2];HEAPF32[r4+34]=HEAPF32[r9>>2];HEAPF32[r4+35]=HEAPF32[r2+48>>2];HEAPF32[r4+19]=0;HEAPF32[r4+20]=0;HEAPF32[r4+21]=0;HEAPF32[r4+36]=0;r9=HEAP32[r2>>2];HEAP32[r4]=r9;r10=r1+116|0;if((r9|0)==2){HEAPF32[r10>>2]=1;HEAPF32[r4+30]=1;r9=r1+124|0;HEAPF32[r9>>2]=0;r8=r1+128|0;HEAPF32[r8>>2]=0;r11=r2+44|0;r6=HEAP32[r11>>2];r7=r1+148|0;HEAP32[r7>>2]=r6;r5=r1+100|0;HEAP32[r5>>2]=0;r16=r1+104|0;HEAP32[r16>>2]=0;return}else{HEAPF32[r10>>2]=0;HEAPF32[r4+30]=0;r9=r1+124|0;HEAPF32[r9>>2]=0;r8=r1+128|0;HEAPF32[r8>>2]=0;r11=r2+44|0;r6=HEAP32[r11>>2];r7=r1+148|0;HEAP32[r7>>2]=r6;r5=r1+100|0;HEAP32[r5>>2]=0;r16=r1+104|0;HEAP32[r16>>2]=0;return}}function __ZN6b2Body7SetTypeE10b2BodyType(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r3=r1>>2;r4=STACKTOP;STACKTOP=STACKTOP+16|0;r5=r4;r6=r1+88|0;if((HEAP32[HEAP32[r6>>2]+102868>>2]&2|0)!=0){___assert_func(5247544,115,5258276,5247512)}r7=(r1|0)>>2;if((HEAP32[r7]|0)==(r2|0)){STACKTOP=r4;return}HEAP32[r7]=r2;__ZN6b2Body13ResetMassDataEv(r1);L1368:do{if((HEAP32[r7]|0)==0){HEAPF32[r3+16]=0;HEAPF32[r3+17]=0;HEAPF32[r3+18]=0;r2=HEAPF32[r3+14];HEAPF32[r3+13]=r2;r8=r1+44|0;r9=r1+36|0;r10=HEAP32[r8>>2];r11=HEAP32[r8+4>>2];HEAP32[r9>>2]=r10;HEAP32[r9+4>>2]=r11;r9=Math.sin(r2);HEAPF32[r5+8>>2]=r9;r8=Math.cos(r2);HEAPF32[r5+12>>2]=r8;r2=HEAPF32[r3+7];r12=HEAPF32[r3+8];r13=(HEAP32[tempDoublePtr>>2]=r10,HEAPF32[tempDoublePtr>>2])-(r8*r2-r9*r12);r10=(HEAP32[tempDoublePtr>>2]=r11,HEAPF32[tempDoublePtr>>2])-(r9*r2+r8*r12);r12=r5;r8=(HEAPF32[tempDoublePtr>>2]=r13,HEAP32[tempDoublePtr>>2]);r13=(HEAPF32[tempDoublePtr>>2]=r10,HEAP32[tempDoublePtr>>2])|0;HEAP32[r12>>2]=0|r8;HEAP32[r12+4>>2]=r13;r13=HEAP32[r6>>2]+102872|0;r12=HEAP32[r3+25];if((r12|0)==0){break}r8=r1+12|0;r10=r12;while(1){__ZN9b2Fixture11SynchronizeEP12b2BroadPhaseRK11b2TransformS4_(r10,r13,r5,r8);r12=HEAP32[r10+4>>2];if((r12|0)==0){break L1368}else{r10=r12}}}}while(0);r5=r1+4|0;r1=HEAP16[r5>>1];if((r1&2)<<16>>16==0){HEAP16[r5>>1]=r1|2;HEAPF32[r3+36]=0}HEAPF32[r3+19]=0;HEAPF32[r3+20]=0;HEAPF32[r3+21]=0;r1=HEAP32[r3+25];if((r1|0)==0){STACKTOP=r4;return}else{r14=r1}while(1){__ZN9b2Fixture8RefilterEv(r14);r1=HEAP32[r14+4>>2];if((r1|0)==0){break}else{r14=r1}}STACKTOP=r4;return}function __ZN6b2Body13ResetMassDataEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3;r5=r1+116|0,r6=r5>>2;r7=r1+120|0;r8=(r1+124|0)>>2;r9=r1+128|0;r10=r1+28|0;HEAPF32[r10>>2]=0;HEAPF32[r1+32>>2]=0;r11=r5>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;r11=HEAP32[r1>>2];if((r11|0)==0|(r11|0)==1){r5=r1+12|0;r12=r1+36|0;r13=HEAP32[r5>>2];r14=HEAP32[r5+4>>2];HEAP32[r12>>2]=r13;HEAP32[r12+4>>2]=r14;r12=r1+44|0;HEAP32[r12>>2]=r13;HEAP32[r12+4>>2]=r14;HEAPF32[r1+52>>2]=HEAPF32[r1+56>>2];STACKTOP=r3;return}else if((r11|0)==2){r11=5247060;r14=HEAP32[r11+4>>2];r12=(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAPF32[tempDoublePtr>>2]);r11=(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=HEAP32[r1+100>>2];do{if((r14|0)==0){r15=0;r16=r12;r17=r11;r2=1074}else{r13=r4|0;r5=r4+4|0;r18=r4+8|0;r19=r4+12|0;r20=r11;r21=r12;r22=r14,r23=r22>>2;r24=0;r25=0;while(1){r26=HEAPF32[r23];if(r26==0){r27=r21;r28=r20;r29=r24;r30=r25}else{r31=HEAP32[r23+3];FUNCTION_TABLE[HEAP32[HEAP32[r31>>2]+28>>2]](r31,r4,r26);r26=HEAPF32[r13>>2];r31=r26+HEAPF32[r6];HEAPF32[r6]=r31;r32=r21+r26*HEAPF32[r5>>2];r33=r20+r26*HEAPF32[r18>>2];r26=HEAPF32[r19>>2]+HEAPF32[r8];HEAPF32[r8]=r26;r27=r32;r28=r33;r29=r31;r30=r26}r26=HEAP32[r23+1];if((r26|0)==0){break}else{r20=r28;r21=r27;r22=r26,r23=r22>>2;r24=r29;r25=r30}}if(r29<=0){r15=r30;r16=r27;r17=r28;r2=1074;break}r25=1/r29;HEAPF32[r7>>2]=r25;r34=r27*r25;r35=r28*r25;r36=r29;r37=r30;break}}while(0);if(r2==1074){HEAPF32[r6]=1;HEAPF32[r7>>2]=1;r34=r16;r35=r17;r36=1;r37=r15}do{if(r37>0){if((HEAP16[r1+4>>1]&16)<<16>>16!=0){r2=1080;break}r15=r37-(r35*r35+r34*r34)*r36;HEAPF32[r8]=r15;if(r15>0){r38=1/r15;break}else{___assert_func(5247544,319,5258356,5254232)}}else{r2=1080}}while(0);if(r2==1080){HEAPF32[r8]=0;r38=0}HEAPF32[r9>>2]=r38;r38=(r1+44|0)>>2;r9=HEAP32[r38+1];r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r38],HEAPF32[tempDoublePtr>>2]);r2=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2]);r9=r10;r10=(HEAPF32[tempDoublePtr>>2]=r34,HEAP32[tempDoublePtr>>2]);r36=(HEAPF32[tempDoublePtr>>2]=r35,HEAP32[tempDoublePtr>>2])|0;HEAP32[r9>>2]=0|r10;HEAP32[r9+4>>2]=r36;r36=HEAPF32[r1+24>>2];r9=HEAPF32[r1+20>>2];r10=HEAPF32[r1+12>>2]+(r36*r34-r9*r35);r37=r34*r9+r36*r35+HEAPF32[r1+16>>2];r35=0|(HEAPF32[tempDoublePtr>>2]=r10,HEAP32[tempDoublePtr>>2]);r36=(HEAPF32[tempDoublePtr>>2]=r37,HEAP32[tempDoublePtr>>2])|0;HEAP32[r38]=r35;HEAP32[r38+1]=r36;r38=r1+36|0;HEAP32[r38>>2]=r35;HEAP32[r38+4>>2]=r36;r36=HEAPF32[r1+72>>2];r38=r1+64|0;HEAPF32[r38>>2]=HEAPF32[r38>>2]+(r37-r2)*-r36;r2=r1+68|0;HEAPF32[r2>>2]=r36*(r10-r8)+HEAPF32[r2>>2];STACKTOP=r3;return}else{___assert_func(5247544,284,5258356,5254760)}}function __ZN6b2Body13CreateFixtureEPK12b2FixtureDef(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=r2>>2;r4=(r1+88|0)>>2;r5=HEAP32[r4];if((HEAP32[r5+102868>>2]&2|0)!=0){___assert_func(5247544,153,5258388,5247512)}r6=r5|0;r5=__ZN16b2BlockAllocator8AllocateEi(r6,44);if((r5|0)==0){r7=0,r8=r7>>2}else{HEAP16[r5+32>>1]=1;HEAP16[r5+34>>1]=-1;HEAP16[r5+36>>1]=0;HEAP32[r5+40>>2]=0;HEAP32[r5+24>>2]=0;HEAP32[r5+28>>2]=0;HEAP32[r5>>2]=0;HEAP32[r5+4>>2]=0;HEAP32[r5+8>>2]=0;HEAP32[r5+12>>2]=0;r7=r5,r8=r7>>2}HEAP32[r8+10]=HEAP32[r3+1];HEAPF32[r8+4]=HEAPF32[r3+2];HEAPF32[r8+5]=HEAPF32[r3+3];r8=r7+8|0;HEAP32[r8>>2]=r1;r5=r7+4|0;HEAP32[r5>>2]=0;r9=(r7+32|0)>>1;r10=(r2+22|0)>>1;HEAP16[r9]=HEAP16[r10];HEAP16[r9+1]=HEAP16[r10+1];HEAP16[r9+2]=HEAP16[r10+2];HEAP8[r7+38|0]=HEAP8[r2+20|0]&1;r2=HEAP32[r3];r10=FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2,r6);r2=(r7+12|0)>>2;HEAP32[r2]=r10;r9=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+12>>2]](r10);r10=__ZN16b2BlockAllocator8AllocateEi(r6,r9*28&-1);r6=(r7+24|0)>>2;HEAP32[r6]=r10;L1417:do{if((r9|0)>0){HEAP32[r10+16>>2]=0;HEAP32[HEAP32[r6]+24>>2]=-1;if((r9|0)==1){break}else{r11=1}while(1){HEAP32[HEAP32[r6]+(r11*28&-1)+16>>2]=0;HEAP32[HEAP32[r6]+(r11*28&-1)+24>>2]=-1;r12=r11+1|0;if((r12|0)==(r9|0)){break L1417}else{r11=r12}}}}while(0);r11=(r7+28|0)>>2;HEAP32[r11]=0;r9=r7|0;HEAPF32[r9>>2]=HEAPF32[r3+4];L1422:do{if((HEAP16[r1+4>>1]&32)<<16>>16!=0){r3=HEAP32[r4]+102872|0;r10=r1+12|0;r12=HEAP32[r2];r13=FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+12>>2]](r12);HEAP32[r11]=r13;if((r13|0)>0){r14=0}else{break}while(1){r13=HEAP32[r6],r12=r13>>2;r15=r13+(r14*28&-1)|0;r13=HEAP32[r2];r16=r15|0;FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+24>>2]](r13,r16,r10,r14);HEAP32[((r14*28&-1)+24>>2)+r12]=__ZN12b2BroadPhase11CreateProxyERK6b2AABBPv(r3,r16,r15);HEAP32[((r14*28&-1)+16>>2)+r12]=r7;HEAP32[((r14*28&-1)+20>>2)+r12]=r14;r12=r14+1|0;if((r12|0)<(HEAP32[r11]|0)){r14=r12}else{break L1422}}}}while(0);r14=r1+100|0;HEAP32[r5>>2]=HEAP32[r14>>2];HEAP32[r14>>2]=r7;r14=r1+104|0;HEAP32[r14>>2]=HEAP32[r14>>2]+1|0;HEAP32[r8>>2]=r1;if(HEAPF32[r9>>2]<=0){r17=HEAP32[r4];r18=r17+102868|0,r19=r18>>2;r20=HEAP32[r19];r21=r20|1;HEAP32[r19]=r21;return r7}__ZN6b2Body13ResetMassDataEv(r1);r17=HEAP32[r4];r18=r17+102868|0,r19=r18>>2;r20=HEAP32[r19];r21=r20|1;HEAP32[r19]=r21;return r7}function __ZN15b2ContactFilterD1Ev(r1){return}function __ZN17b2ContactListenerD1Ev(r1){return}function __ZN6b2Body4DumpEv(r1){var r2,r3,r4,r5,r6,r7;r2=r1>>2;r3=STACKTOP;r4=r1+8|0;r5=HEAP32[r4>>2];__Z5b2LogPKcz(5254040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253704,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253516,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2],tempInt));r6=HEAPF32[r2+4];__Z5b2LogPKcz(5253360,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+3],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r6,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5253080,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+14],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r6=HEAPF32[r2+17];__Z5b2LogPKcz(5252976,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+16],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r6,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5252840,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+18],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5252604,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+33],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5252200,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+34],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r6=(r1+4|0)>>1;__Z5b2LogPKcz(5252128,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP16[r6]&4,tempInt));__Z5b2LogPKcz(5251736,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP16[r6]&2,tempInt));__Z5b2LogPKcz(5251480,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP16[r6]&16,tempInt));__Z5b2LogPKcz(5251340,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP16[r6]&8,tempInt));__Z5b2LogPKcz(5250996,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP16[r6]&32,tempInt));__Z5b2LogPKcz(5250788,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+35],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5250520,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r4>>2],tempInt));__Z5b2LogPKcz(5250040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r4=HEAP32[r2+25];if((r4|0)==0){__Z5b2LogPKcz(5253796,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));STACKTOP=r3;return}else{r7=r4}while(1){__Z5b2LogPKcz(5250168,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__ZN9b2Fixture4DumpEi(r7,r5);__Z5b2LogPKcz(5250044,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r4=HEAP32[r7+4>>2];if((r4|0)==0){break}else{r7=r4}}__Z5b2LogPKcz(5253796,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));STACKTOP=r3;return}function __ZN16b2ContactManager7DestroyEP9b2Contact(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=HEAP32[HEAP32[r2+48>>2]+8>>2];r4=HEAP32[HEAP32[r2+52>>2]+8>>2];r5=HEAP32[r1+72>>2];do{if((r5|0)!=0){if((HEAP32[r2+4>>2]&2|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+12>>2]](r5,r2)}}while(0);r5=r2+8|0;r6=HEAP32[r5>>2];r7=(r2+12|0)>>2;if((r6|0)!=0){HEAP32[r6+12>>2]=HEAP32[r7]}r6=HEAP32[r7];if((r6|0)!=0){HEAP32[r6+8>>2]=HEAP32[r5>>2]}r5=r1+60|0;if((HEAP32[r5>>2]|0)==(r2|0)){HEAP32[r5>>2]=HEAP32[r7]}r7=r2+24|0;r5=HEAP32[r7>>2];r6=(r2+28|0)>>2;if((r5|0)!=0){HEAP32[r5+12>>2]=HEAP32[r6]}r5=HEAP32[r6];if((r5|0)!=0){HEAP32[r5+8>>2]=HEAP32[r7>>2]}r7=r3+112|0;if((r2+16|0)==(HEAP32[r7>>2]|0)){HEAP32[r7>>2]=HEAP32[r6]}r6=r2+40|0;r7=HEAP32[r6>>2];r3=(r2+44|0)>>2;if((r7|0)!=0){HEAP32[r7+12>>2]=HEAP32[r3]}r7=HEAP32[r3];if((r7|0)!=0){HEAP32[r7+8>>2]=HEAP32[r6>>2]}r6=r4+112|0;if((r2+32|0)!=(HEAP32[r6>>2]|0)){r8=r1+76|0;r9=HEAP32[r8>>2];__ZN9b2Contact7DestroyEPS_P16b2BlockAllocator(r2,r9);r10=r1+64|0,r11=r10>>2;r12=HEAP32[r11];r13=r12-1|0;HEAP32[r11]=r13;return}HEAP32[r6>>2]=HEAP32[r3];r8=r1+76|0;r9=HEAP32[r8>>2];__ZN9b2Contact7DestroyEPS_P16b2BlockAllocator(r2,r9);r10=r1+64|0,r11=r10>>2;r12=HEAP32[r11];r13=r12-1|0;HEAP32[r11]=r13;return}function __ZN6b2Body14DestroyFixtureEP9b2Fixture(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r3=0;r4=(r1+88|0)>>2;if((HEAP32[HEAP32[r4]+102868>>2]&2|0)!=0){___assert_func(5247544,201,5258312,5247512)}r5=r2+8|0;if((HEAP32[r5>>2]|0)!=(r1|0)){___assert_func(5247544,207,5258312,5247312)}r6=(r1+104|0)>>2;if((HEAP32[r6]|0)<=0){___assert_func(5247544,210,5258312,5247068)}r7=r1+100|0;while(1){r8=HEAP32[r7>>2];if((r8|0)==0){r3=1141;break}if((r8|0)==(r2|0)){break}else{r7=r8+4|0}}if(r3==1141){___assert_func(5247544,226,5258312,5255128)}r8=r2+4|0;HEAP32[r7>>2]=HEAP32[r8>>2];r7=HEAP32[r1+112>>2];L1488:do{if((r7|0)!=0){r9=r7;while(1){r10=HEAP32[r9+4>>2];r11=HEAP32[r9+12>>2];if((HEAP32[r10+48>>2]|0)==(r2|0)|(HEAP32[r10+52>>2]|0)==(r2|0)){__ZN16b2ContactManager7DestroyEP9b2Contact(HEAP32[r4]+102872|0,r10)}if((r11|0)==0){break L1488}else{r9=r11}}}}while(0);r7=HEAP32[r4];r4=r7|0;if((HEAP16[r1+4>>1]&32)<<16>>16!=0){r9=(r2+28|0)>>2;L1497:do{if((HEAP32[r9]|0)>0){r11=r2+24|0;r10=r7+102912|0;r12=r7+102904|0;r13=r7+102900|0;r14=r7+102872|0;r15=0;while(1){r16=HEAP32[r11>>2]+(r15*28&-1)+24|0;r17=HEAP32[r16>>2];r18=HEAP32[r10>>2];r19=0;while(1){if((r19|0)>=(r18|0)){break}r20=(r19<<2)+HEAP32[r12>>2]|0;if((HEAP32[r20>>2]|0)==(r17|0)){r3=1151;break}else{r19=r19+1|0}}if(r3==1151){r3=0;HEAP32[r20>>2]=-1}HEAP32[r13>>2]=HEAP32[r13>>2]-1|0;__ZN13b2DynamicTree12DestroyProxyEi(r14,r17);HEAP32[r16>>2]=-1;r19=r15+1|0;if((r19|0)<(HEAP32[r9]|0)){r15=r19}else{break L1497}}}}while(0);HEAP32[r9]=0}__ZN9b2Fixture7DestroyEP16b2BlockAllocator(r2,r4);HEAP32[r5>>2]=0;HEAP32[r8>>2]=0;r8=HEAP8[5263896];if((r8&255)<14){r5=((r8&255)<<2)+r7+12|0;HEAP32[r2>>2]=HEAP32[r5>>2];HEAP32[r5>>2]=r2;HEAP32[r6]=HEAP32[r6]-1|0;__ZN6b2Body13ResetMassDataEv(r1);return}else{___assert_func(5248148,173,5259684,5249276)}}function __ZN6b2Body11SetMassDataEPK10b2MassData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;if((HEAP32[HEAP32[r1+88>>2]+102868>>2]&2|0)!=0){___assert_func(5247544,340,5258496,5247512)}if((HEAP32[r1>>2]|0)!=2){return}r3=r1+120|0;HEAPF32[r3>>2]=0;r4=r1+124|0;HEAPF32[r4>>2]=0;r5=r1+128|0;HEAPF32[r5>>2]=0;r6=HEAPF32[r2>>2];r7=r6>0?r6:1;HEAPF32[r1+116>>2]=r7;HEAPF32[r3>>2]=1/r7;r3=HEAPF32[r2+12>>2];do{if(r3>0){if((HEAP16[r1+4>>1]&16)<<16>>16!=0){break}r6=HEAPF32[r2+4>>2];r8=HEAPF32[r2+8>>2];r9=r3-r7*(r6*r6+r8*r8);HEAPF32[r4>>2]=r9;if(r9>0){HEAPF32[r5>>2]=1/r9;break}else{___assert_func(5247544,366,5258496,5254232)}}}while(0);r5=(r1+44|0)>>2;r4=HEAP32[r5+1];r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r5],HEAPF32[tempDoublePtr>>2]);r3=(HEAP32[tempDoublePtr>>2]=r4,HEAPF32[tempDoublePtr>>2]);r4=r2+4|0;r2=r1+28|0;r9=HEAP32[r4>>2];r8=HEAP32[r4+4>>2];HEAP32[r2>>2]=r9;HEAP32[r2+4>>2]=r8;r2=HEAPF32[r1+24>>2];r4=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2]);r9=HEAPF32[r1+20>>2];r6=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=HEAPF32[r1+12>>2]+(r2*r4-r9*r6);r10=r4*r9+r2*r6+HEAPF32[r1+16>>2];r6=0|(HEAPF32[tempDoublePtr>>2]=r8,HEAP32[tempDoublePtr>>2]);r2=(HEAPF32[tempDoublePtr>>2]=r10,HEAP32[tempDoublePtr>>2])|0;HEAP32[r5]=r6;HEAP32[r5+1]=r2;r5=r1+36|0;HEAP32[r5>>2]=r6;HEAP32[r5+4>>2]=r2;r2=HEAPF32[r1+72>>2];r5=r1+64|0;HEAPF32[r5>>2]=HEAPF32[r5>>2]+(r10-r3)*-r2;r3=r1+68|0;HEAPF32[r3>>2]=r2*(r8-r7)+HEAPF32[r3>>2];return}function __ZN6b2Body12SetTransformERK6b2Vec2f(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r4=r1>>2;r5=r1+88|0;r6=HEAP32[r5>>2];if((HEAP32[r6+102868>>2]&2|0)!=0){___assert_func(5247544,404,5258444,5247512)}r7=r1+12|0;r8=Math.sin(r3);HEAPF32[r4+5]=r8;r9=Math.cos(r3);HEAPF32[r4+6]=r9;r10=r2;r2=r7;r11=HEAP32[r10>>2];r12=HEAP32[r10+4>>2];HEAP32[r2>>2]=r11;HEAP32[r2+4>>2]=r12;r2=HEAPF32[r4+7];r10=HEAPF32[r4+8];r13=(HEAP32[tempDoublePtr>>2]=r11,HEAPF32[tempDoublePtr>>2])+(r9*r2-r8*r10);r11=r2*r8+r9*r10+(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=r1+44|0;r10=0|(HEAPF32[tempDoublePtr>>2]=r13,HEAP32[tempDoublePtr>>2]);r13=(HEAPF32[tempDoublePtr>>2]=r11,HEAP32[tempDoublePtr>>2])|0;HEAP32[r12>>2]=r10;HEAP32[r12+4>>2]=r13;HEAPF32[r4+14]=r3;r12=r1+36|0;HEAP32[r12>>2]=r10;HEAP32[r12+4>>2]=r13;HEAPF32[r4+13]=r3;r3=r6+102872|0;r13=HEAP32[r4+25];if((r13|0)==0){r14=r6;r15=r14+102872|0;r16=r15|0;__ZN12b2BroadPhase11UpdatePairsI16b2ContactManagerEEvPT_(r16,r15);return}else{r17=r13}while(1){__ZN9b2Fixture11SynchronizeEP12b2BroadPhaseRK11b2TransformS4_(r17,r3,r7,r7);r13=HEAP32[r17+4>>2];if((r13|0)==0){break}else{r17=r13}}r14=HEAP32[r5>>2];r15=r14+102872|0;r16=r15|0;__ZN12b2BroadPhase11UpdatePairsI16b2ContactManagerEEvPT_(r16,r15);return}function __ZN6b2Body9SetActiveEb(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r3=0;r4=r1+88|0;r5=HEAP32[r4>>2];if((HEAP32[r5+102868>>2]&2|0)!=0){___assert_func(5247544,443,5258244,5247512)}r6=(r1+4|0)>>1;r7=HEAP16[r6];if(!((r7&32)<<16>>16!=0^r2)){return}if(r2){HEAP16[r6]=r7|32;r2=r5+102872|0;r8=HEAP32[r1+100>>2];if((r8|0)==0){return}r9=r1+12|0;r10=r8;while(1){r8=(r10+28|0)>>2;if((HEAP32[r8]|0)!=0){r3=1184;break}r11=r10+12|0;r12=HEAP32[r11>>2];r13=FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+12>>2]](r12);HEAP32[r8]=r13;L1552:do{if((r13|0)>0){r12=r10+24|0;r14=0;while(1){r15=HEAP32[r12>>2],r16=r15>>2;r17=r15+(r14*28&-1)|0;r15=HEAP32[r11>>2];r18=r17|0;FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+24>>2]](r15,r18,r9,r14);HEAP32[((r14*28&-1)+24>>2)+r16]=__ZN12b2BroadPhase11CreateProxyERK6b2AABBPv(r2,r18,r17);HEAP32[((r14*28&-1)+16>>2)+r16]=r10;HEAP32[((r14*28&-1)+20>>2)+r16]=r14;r16=r14+1|0;if((r16|0)<(HEAP32[r8]|0)){r14=r16}else{break L1552}}}}while(0);r8=HEAP32[r10+4>>2];if((r8|0)==0){r3=1206;break}else{r10=r8}}if(r3==1206){return}else if(r3==1184){___assert_func(5254684,124,5257272,5254988)}}HEAP16[r6]=r7&-33;r7=HEAP32[r1+100>>2];L1561:do{if((r7|0)!=0){r6=r5+102912|0;r10=r5+102904|0;r2=r5+102900|0;r9=r5+102872|0;r8=r7;while(1){r11=(r8+28|0)>>2;L1565:do{if((HEAP32[r11]|0)>0){r13=r8+24|0;r14=0;while(1){r12=HEAP32[r13>>2]+(r14*28&-1)+24|0;r16=HEAP32[r12>>2];r17=HEAP32[r6>>2];r18=0;while(1){if((r18|0)>=(r17|0)){break}r19=(r18<<2)+HEAP32[r10>>2]|0;if((HEAP32[r19>>2]|0)==(r16|0)){r3=1196;break}else{r18=r18+1|0}}if(r3==1196){r3=0;HEAP32[r19>>2]=-1}HEAP32[r2>>2]=HEAP32[r2>>2]-1|0;__ZN13b2DynamicTree12DestroyProxyEi(r9,r16);HEAP32[r12>>2]=-1;r18=r14+1|0;if((r18|0)<(HEAP32[r11]|0)){r14=r18}else{break L1565}}}}while(0);HEAP32[r11]=0;r14=HEAP32[r8+4>>2];if((r14|0)==0){break L1561}else{r8=r14}}}}while(0);r19=r1+112|0;r1=HEAP32[r19>>2];L1577:do{if((r1|0)!=0){r3=r1;while(1){r7=HEAP32[r3+12>>2];__ZN16b2ContactManager7DestroyEP9b2Contact(HEAP32[r4>>2]+102872|0,HEAP32[r3+4>>2]);if((r7|0)==0){break L1577}else{r3=r7}}}}while(0);HEAP32[r19>>2]=0;return}function __Z14b2PairLessThanRK6b2PairS1_(r1,r2){var r3,r4,r5;r3=HEAP32[r1>>2];r4=HEAP32[r2>>2];if((r3|0)<(r4|0)){r5=1;return r5}if((r3|0)!=(r4|0)){r5=0;return r5}r5=(HEAP32[r1+4>>2]|0)<(HEAP32[r2+4>>2]|0);return r5}function __ZN16b2ContactManager7AddPairEPvS0_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r4=0;r5=HEAP32[r2+16>>2];r6=HEAP32[r3+16>>2];r7=HEAP32[r2+20>>2];r2=HEAP32[r3+20>>2];r3=HEAP32[r5+8>>2];r8=HEAP32[r6+8>>2],r9=r8>>2;if((r3|0)==(r8|0)){return}r8=HEAP32[r9+28];L1594:do{if((r8|0)!=0){r10=r8,r11=r10>>2;while(1){if((HEAP32[r11]|0)==(r3|0)){r12=HEAP32[r11+1]>>2;r13=HEAP32[r12+12];r14=HEAP32[r12+13];r15=HEAP32[r12+14];r16=HEAP32[r12+15];if((r13|0)==(r5|0)&(r14|0)==(r6|0)&(r15|0)==(r7|0)&(r16|0)==(r2|0)){r4=1245;break}if((r13|0)==(r6|0)&(r14|0)==(r5|0)&(r15|0)==(r2|0)&(r16|0)==(r7|0)){r4=1244;break}}r16=HEAP32[r11+3];if((r16|0)==0){break L1594}else{r10=r16,r11=r10>>2}}if(r4==1244){return}else if(r4==1245){return}}}while(0);do{if((HEAP32[r9]|0)!=2){if((HEAP32[r3>>2]|0)==2){break}return}}while(0);r4=HEAP32[r9+27];L1609:do{if((r4|0)!=0){r9=r4,r8=r9>>2;while(1){if((HEAP32[r8]|0)==(r3|0)){if((HEAP8[HEAP32[r8+1]+61|0]&1)<<24>>24==0){break}}r10=HEAP32[r8+3];if((r10|0)==0){break L1609}else{r9=r10,r8=r9>>2}}return}}while(0);r3=HEAP32[r1+68>>2];do{if((r3|0)!=0){if(FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+8>>2]](r3,r5,r6)){break}return}}while(0);r3=__ZN9b2Contact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator(r5,r7,r6,r2,HEAP32[r1+76>>2]),r2=r3>>2;if((r3|0)==0){return}r6=HEAP32[HEAP32[r2+12]+8>>2];r7=HEAP32[HEAP32[r2+13]+8>>2];HEAP32[r2+2]=0;r5=(r1+60|0)>>2;HEAP32[r2+3]=HEAP32[r5];r4=HEAP32[r5];if((r4|0)!=0){HEAP32[r4+8>>2]=r3}HEAP32[r5]=r3;r5=r3+16|0;HEAP32[r2+5]=r3;HEAP32[r5>>2]=r7;HEAP32[r2+6]=0;r4=(r6+112|0)>>2;HEAP32[r2+7]=HEAP32[r4];r9=HEAP32[r4];if((r9|0)!=0){HEAP32[r9+8>>2]=r5}HEAP32[r4]=r5;r5=r3+32|0;HEAP32[r2+9]=r3;HEAP32[r5>>2]=r6;HEAP32[r2+10]=0;r3=(r7+112|0)>>2;HEAP32[r2+11]=HEAP32[r3];r2=HEAP32[r3];if((r2|0)!=0){HEAP32[r2+8>>2]=r5}HEAP32[r3]=r5;r5=r6+4|0;r3=HEAP16[r5>>1];if((r3&2)<<16>>16==0){HEAP16[r5>>1]=r3|2;HEAPF32[r6+144>>2]=0}r6=r7+4|0;r3=HEAP16[r6>>1];if((r3&2)<<16>>16==0){HEAP16[r6>>1]=r3|2;HEAPF32[r7+144>>2]=0}r7=r1+64|0;HEAP32[r7>>2]=HEAP32[r7>>2]+1|0;return}function __ZNK13b2DynamicTree5QueryI12b2BroadPhaseEEvPT_RK6b2AABB(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r4=STACKTOP;STACKTOP=STACKTOP+1036|0;r5=r4;r6=r5+4|0;r7=(r5|0)>>2;HEAP32[r7]=r6;r8=(r5+1028|0)>>2;HEAP32[r8]=0;r9=(r5+1032|0)>>2;HEAP32[r9]=256;HEAP32[HEAP32[r7]+(HEAP32[r8]<<2)>>2]=HEAP32[r1>>2];r5=HEAP32[r8]+1|0;HEAP32[r8]=r5;L1641:do{if((r5|0)>0){r10=r1+4|0;r11=r3|0;r12=r3+4|0;r13=r3+8|0;r14=r3+12|0;r15=(r2+56|0)>>2;r16=(r2+52|0)>>2;r17=r2+48|0;r18=(r2+44|0)>>2;r19=r5;while(1){r20=r19-1|0;HEAP32[r8]=r20;r21=HEAP32[r7];r22=HEAP32[r21+(r20<<2)>>2];do{if((r22|0)==-1){r23=r20}else{r24=HEAP32[r10>>2],r25=r24>>2;if(HEAPF32[r11>>2]-HEAPF32[((r22*36&-1)+8>>2)+r25]>0|HEAPF32[r12>>2]-HEAPF32[((r22*36&-1)+12>>2)+r25]>0|HEAPF32[((r22*36&-1)>>2)+r25]-HEAPF32[r13>>2]>0|HEAPF32[((r22*36&-1)+4>>2)+r25]-HEAPF32[r14>>2]>0){r23=r20;break}r25=r24+(r22*36&-1)+24|0;if((HEAP32[r25>>2]|0)==-1){r26=HEAP32[r15];if((r26|0)==(r22|0)){r23=r20;break}r27=HEAP32[r16];if((r27|0)==(HEAP32[r17>>2]|0)){r28=HEAP32[r18];HEAP32[r17>>2]=r27<<1;r29=_malloc(r27*24&-1);HEAP32[r18]=r29;r30=r28;_memcpy(r29,r30,HEAP32[r16]*12&-1);_free(r30);r31=HEAP32[r15];r32=HEAP32[r16]}else{r31=r26;r32=r27}HEAP32[HEAP32[r18]+(r32*12&-1)>>2]=(r31|0)>(r22|0)?r22:r31;r27=HEAP32[r15];HEAP32[HEAP32[r18]+(HEAP32[r16]*12&-1)+4>>2]=(r27|0)<(r22|0)?r22:r27;HEAP32[r16]=HEAP32[r16]+1|0;r23=HEAP32[r8];break}do{if((r20|0)==(HEAP32[r9]|0)){HEAP32[r9]=r20<<1;r27=_malloc(r20<<3);HEAP32[r7]=r27;r26=r21;_memcpy(r27,r26,HEAP32[r8]<<2);if((r21|0)==(r6|0)){break}_free(r26)}}while(0);HEAP32[HEAP32[r7]+(HEAP32[r8]<<2)>>2]=HEAP32[r25>>2];r26=HEAP32[r8]+1|0;HEAP32[r8]=r26;r27=r24+(r22*36&-1)+28|0;do{if((r26|0)==(HEAP32[r9]|0)){r30=HEAP32[r7];HEAP32[r9]=r26<<1;r29=_malloc(r26<<3);HEAP32[r7]=r29;r28=r30;_memcpy(r29,r28,HEAP32[r8]<<2);if((r30|0)==(r6|0)){break}_free(r28)}}while(0);HEAP32[HEAP32[r7]+(HEAP32[r8]<<2)>>2]=HEAP32[r27>>2];r26=HEAP32[r8]+1|0;HEAP32[r8]=r26;r23=r26}}while(0);if((r23|0)>0){r19=r23}else{break L1641}}}}while(0);r23=HEAP32[r7];if((r23|0)==(r6|0)){STACKTOP=r4;return}_free(r23);HEAP32[r7]=0;STACKTOP=r4;return}function __ZN16b2ContactManager7CollideEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r2=0;r3=HEAP32[r1+60>>2];if((r3|0)==0){return}r4=r1+12|0;r5=r1+4|0;r6=r1+72|0;r7=r1+68|0;r8=r3,r3=r8>>2;L1673:while(1){r9=HEAP32[r3+12];r10=HEAP32[r3+13];r11=HEAP32[r3+14];r12=HEAP32[r3+15];r13=HEAP32[r9+8>>2];r14=HEAP32[r10+8>>2];r15=(r8+4|0)>>2;r16=HEAP32[r15];L1675:do{if((r16&8|0)==0){r2=1287}else{do{if((HEAP32[r14>>2]|0)==2){r2=1276}else{if((HEAP32[r13>>2]|0)==2){r2=1276;break}else{break}}}while(0);L1679:do{if(r2==1276){r2=0;r17=HEAP32[r14+108>>2];L1681:do{if((r17|0)!=0){r18=r17,r19=r18>>2;while(1){if((HEAP32[r19]|0)==(r13|0)){if((HEAP8[HEAP32[r19+1]+61|0]&1)<<24>>24==0){break L1679}}r20=HEAP32[r19+3];if((r20|0)==0){break L1681}else{r18=r20,r19=r18>>2}}}}while(0);r17=HEAP32[r7>>2];do{if((r17|0)==0){r21=r16}else{if(FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+8>>2]](r17,r9,r10)){r21=HEAP32[r15];break}else{r18=HEAP32[r3+3];__ZN16b2ContactManager7DestroyEP9b2Contact(r1,r8);r22=r18;break L1675}}}while(0);HEAP32[r15]=r21&-9;r2=1287;break L1675}}while(0);r17=HEAP32[r3+3];__ZN16b2ContactManager7DestroyEP9b2Contact(r1,r8);r22=r17;break}}while(0);do{if(r2==1287){r2=0;if((HEAP16[r13+4>>1]&2)<<16>>16==0){r23=0}else{r23=(HEAP32[r13>>2]|0)!=0}if((HEAP16[r14+4>>1]&2)<<16>>16==0){r24=0}else{r24=(HEAP32[r14>>2]|0)!=0}if(!(r23|r24)){r22=HEAP32[r3+3];break}r15=HEAP32[HEAP32[r9+24>>2]+(r11*28&-1)+24>>2];r16=HEAP32[HEAP32[r10+24>>2]+(r12*28&-1)+24>>2];if((r15|0)<=-1){r2=1305;break L1673}r17=HEAP32[r4>>2];if((r17|0)<=(r15|0)){r2=1304;break L1673}r18=HEAP32[r5>>2]>>2;if(!((r16|0)>-1&(r17|0)>(r16|0))){r2=1297;break L1673}if(HEAPF32[((r16*36&-1)>>2)+r18]-HEAPF32[((r15*36&-1)+8>>2)+r18]>0|HEAPF32[((r16*36&-1)+4>>2)+r18]-HEAPF32[((r15*36&-1)+12>>2)+r18]>0|HEAPF32[((r15*36&-1)>>2)+r18]-HEAPF32[((r16*36&-1)+8>>2)+r18]>0|HEAPF32[((r15*36&-1)+4>>2)+r18]-HEAPF32[((r16*36&-1)+12>>2)+r18]>0){r18=HEAP32[r3+3];__ZN16b2ContactManager7DestroyEP9b2Contact(r1,r8);r22=r18;break}else{__ZN9b2Contact6UpdateEP17b2ContactListener(r8,HEAP32[r6>>2]);r22=HEAP32[r3+3];break}}}while(0);if((r22|0)==0){r2=1303;break}else{r8=r22,r3=r8>>2}}if(r2==1303){return}else if(r2==1304){___assert_func(5252876,159,5256772,5252452)}else if(r2==1305){___assert_func(5252876,159,5256772,5252452)}else if(r2==1297){___assert_func(5252876,159,5256772,5252452)}}function __ZN12b2BroadPhase11UpdatePairsI16b2ContactManagerEEvPT_(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4;r6=(r1+52|0)>>2;HEAP32[r6]=0;r7=(r1+40|0)>>2;r8=HEAP32[r7];do{if((r8|0)>0){r9=r1+32|0;r10=r1+56|0;r11=r1|0;r12=r1+12|0;r13=r1+4|0;r14=0;r15=r8;while(1){r16=HEAP32[HEAP32[r9>>2]+(r14<<2)>>2];HEAP32[r10>>2]=r16;if((r16|0)==-1){r17=r15}else{if((r16|0)<=-1){r3=1330;break}if((HEAP32[r12>>2]|0)<=(r16|0)){r3=1329;break}__ZNK13b2DynamicTree5QueryI12b2BroadPhaseEEvPT_RK6b2AABB(r11,r1,HEAP32[r13>>2]+(r16*36&-1)|0);r17=HEAP32[r7]}r16=r14+1|0;if((r16|0)<(r17|0)){r14=r16;r15=r17}else{r3=1314;break}}if(r3==1314){r18=HEAP32[r6];break}else if(r3==1330){___assert_func(5252876,159,5256772,5252452)}else if(r3==1329){___assert_func(5252876,159,5256772,5252452)}}else{r18=0}}while(0);HEAP32[r7]=0;r7=(r1+44|0)>>2;r17=HEAP32[r7];HEAP32[r5>>2]=1428;__ZNSt3__16__sortIRPFbRK6b2PairS3_EPS1_EEvT0_S8_T_(r17,r17+(r18*12&-1)|0,r5);if((HEAP32[r6]|0)<=0){STACKTOP=r4;return}r5=r1+12|0;r18=r1+4|0;r1=0;L1736:while(1){r17=HEAP32[r7];r8=r17+(r1*12&-1)|0;r15=HEAP32[r8>>2];if((r15|0)<=-1){r3=1327;break}r14=HEAP32[r5>>2];if((r14|0)<=(r15|0)){r3=1328;break}r13=HEAP32[r18>>2];r11=r17+(r1*12&-1)+4|0;r17=HEAP32[r11>>2];if(!((r17|0)>-1&(r14|0)>(r17|0))){r3=1321;break}__ZN16b2ContactManager7AddPairEPvS0_(r2,HEAP32[r13+(r15*36&-1)+16>>2],HEAP32[r13+(r17*36&-1)+16>>2]);r17=HEAP32[r6];r13=r1;while(1){r15=r13+1|0;if((r15|0)>=(r17|0)){r3=1331;break L1736}r14=HEAP32[r7];if((HEAP32[r14+(r15*12&-1)>>2]|0)!=(HEAP32[r8>>2]|0)){r1=r15;continue L1736}if((HEAP32[r14+(r15*12&-1)+4>>2]|0)==(HEAP32[r11>>2]|0)){r13=r15}else{r1=r15;continue L1736}}}if(r3==1331){STACKTOP=r4;return}else if(r3==1327){___assert_func(5252876,153,5256724,5252452)}else if(r3==1328){___assert_func(5252876,153,5256724,5252452)}else if(r3==1321){___assert_func(5252876,153,5256724,5252452)}}function __ZNSt3__16__sortIRPFbRK6b2PairS3_EPS1_EEvT0_S8_T_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72;r4=r3>>2;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+360|0;r7=r6;r8=r6+12;r9=r6+24;r10=r6+36;r11=r6+48;r12=r6+168;r13=r6+180;r14=r6+192;r15=r6+204;r16=r6+216;r17=r6+228;r18=r6+240;r19=r6+252;r20=r6+264;r21=r6+276;r22=r6+348;r23=r6+120>>2;r24=r6+132>>2;r25=r6+144>>2;r26=r6+156>>2;r27=r6+288>>2;r28=r6+300>>2;r29=r6+324>>2;r30=r6+336>>2;r31=r6+312>>2;r32=r6+60>>2;r33=r6+72>>2;r34=r6+84>>2;r35=r6+96>>2;r36=r6+108>>2;r37=r1;r1=r2;L1751:while(1){r2=r1;r38=r1-12|0;r39=r38>>2;r40=r37;L1753:while(1){r41=r40;r42=r2-r41|0;r43=(r42|0)/12&-1;if((r43|0)==5){r5=1347;break L1751}else if((r43|0)==3){r5=1338;break L1751}else if((r43|0)==4){r5=1346;break L1751}else if((r43|0)==2){r5=1336;break L1751}else if((r43|0)==0|(r43|0)==1){r5=1419;break L1751}if((r42|0)<372){r5=1353;break L1751}r43=(r42|0)/24&-1;r44=r40+(r43*12&-1)|0;do{if((r42|0)>11988){r45=(r42|0)/48&-1;r46=r40+(r45*12&-1)|0;r47=r40+((r45+r43)*12&-1)|0;r45=__ZNSt3__17__sort4IRPFbRK6b2PairS3_EPS1_EEjT0_S8_S8_S8_T_(r40,r46,r44,r47,r3);if(!FUNCTION_TABLE[HEAP32[r4]](r38,r47)){r48=r45;break}r49=r47>>2;HEAP32[r26]=HEAP32[r49];HEAP32[r26+1]=HEAP32[r49+1];HEAP32[r26+2]=HEAP32[r49+2];HEAP32[r49]=HEAP32[r39];HEAP32[r49+1]=HEAP32[r39+1];HEAP32[r49+2]=HEAP32[r39+2];HEAP32[r39]=HEAP32[r26];HEAP32[r39+1]=HEAP32[r26+1];HEAP32[r39+2]=HEAP32[r26+2];if(!FUNCTION_TABLE[HEAP32[r4]](r47,r44)){r48=r45+1|0;break}r47=r44>>2;HEAP32[r24]=HEAP32[r47];HEAP32[r24+1]=HEAP32[r47+1];HEAP32[r24+2]=HEAP32[r47+2];HEAP32[r47]=HEAP32[r49];HEAP32[r47+1]=HEAP32[r49+1];HEAP32[r47+2]=HEAP32[r49+2];HEAP32[r49]=HEAP32[r24];HEAP32[r49+1]=HEAP32[r24+1];HEAP32[r49+2]=HEAP32[r24+2];if(!FUNCTION_TABLE[HEAP32[r4]](r44,r46)){r48=r45+2|0;break}r49=r46>>2;HEAP32[r23]=HEAP32[r49];HEAP32[r23+1]=HEAP32[r49+1];HEAP32[r23+2]=HEAP32[r49+2];HEAP32[r49]=HEAP32[r47];HEAP32[r49+1]=HEAP32[r47+1];HEAP32[r49+2]=HEAP32[r47+2];HEAP32[r47]=HEAP32[r23];HEAP32[r47+1]=HEAP32[r23+1];HEAP32[r47+2]=HEAP32[r23+2];if(!FUNCTION_TABLE[HEAP32[r4]](r46,r40)){r48=r45+3|0;break}r46=r40>>2;HEAP32[r25]=HEAP32[r46];HEAP32[r25+1]=HEAP32[r46+1];HEAP32[r25+2]=HEAP32[r46+2];HEAP32[r46]=HEAP32[r49];HEAP32[r46+1]=HEAP32[r49+1];HEAP32[r46+2]=HEAP32[r49+2];HEAP32[r49]=HEAP32[r25];HEAP32[r49+1]=HEAP32[r25+1];HEAP32[r49+2]=HEAP32[r25+2];r48=r45+4|0}else{r45=FUNCTION_TABLE[HEAP32[r4]](r44,r40);r49=FUNCTION_TABLE[HEAP32[r4]](r38,r44);if(!r45){if(!r49){r48=0;break}r45=r44>>2;HEAP32[r36]=HEAP32[r45];HEAP32[r36+1]=HEAP32[r45+1];HEAP32[r36+2]=HEAP32[r45+2];HEAP32[r45]=HEAP32[r39];HEAP32[r45+1]=HEAP32[r39+1];HEAP32[r45+2]=HEAP32[r39+2];HEAP32[r39]=HEAP32[r36];HEAP32[r39+1]=HEAP32[r36+1];HEAP32[r39+2]=HEAP32[r36+2];if(!FUNCTION_TABLE[HEAP32[r4]](r44,r40)){r48=1;break}r46=r40>>2;HEAP32[r34]=HEAP32[r46];HEAP32[r34+1]=HEAP32[r46+1];HEAP32[r34+2]=HEAP32[r46+2];HEAP32[r46]=HEAP32[r45];HEAP32[r46+1]=HEAP32[r45+1];HEAP32[r46+2]=HEAP32[r45+2];HEAP32[r45]=HEAP32[r34];HEAP32[r45+1]=HEAP32[r34+1];HEAP32[r45+2]=HEAP32[r34+2];r48=2;break}r45=r40>>2;if(r49){HEAP32[r32]=HEAP32[r45];HEAP32[r32+1]=HEAP32[r45+1];HEAP32[r32+2]=HEAP32[r45+2];HEAP32[r45]=HEAP32[r39];HEAP32[r45+1]=HEAP32[r39+1];HEAP32[r45+2]=HEAP32[r39+2];HEAP32[r39]=HEAP32[r32];HEAP32[r39+1]=HEAP32[r32+1];HEAP32[r39+2]=HEAP32[r32+2];r48=1;break}HEAP32[r33]=HEAP32[r45];HEAP32[r33+1]=HEAP32[r45+1];HEAP32[r33+2]=HEAP32[r45+2];r49=r44>>2;HEAP32[r45]=HEAP32[r49];HEAP32[r45+1]=HEAP32[r49+1];HEAP32[r45+2]=HEAP32[r49+2];HEAP32[r49]=HEAP32[r33];HEAP32[r49+1]=HEAP32[r33+1];HEAP32[r49+2]=HEAP32[r33+2];if(!FUNCTION_TABLE[HEAP32[r4]](r38,r44)){r48=1;break}HEAP32[r35]=HEAP32[r49];HEAP32[r35+1]=HEAP32[r49+1];HEAP32[r35+2]=HEAP32[r49+2];HEAP32[r49]=HEAP32[r39];HEAP32[r49+1]=HEAP32[r39+1];HEAP32[r49+2]=HEAP32[r39+2];HEAP32[r39]=HEAP32[r35];HEAP32[r39+1]=HEAP32[r35+1];HEAP32[r39+2]=HEAP32[r35+2];r48=2}}while(0);do{if(FUNCTION_TABLE[HEAP32[r4]](r40,r44)){r50=r38;r51=r48}else{r43=r38;while(1){r52=r43-12|0;if((r40|0)==(r52|0)){break}if(FUNCTION_TABLE[HEAP32[r4]](r52,r44)){r5=1395;break}else{r43=r52}}if(r5==1395){r5=0;r43=r40>>2;HEAP32[r31]=HEAP32[r43];HEAP32[r31+1]=HEAP32[r43+1];HEAP32[r31+2]=HEAP32[r43+2];r42=r52>>2;HEAP32[r43]=HEAP32[r42];HEAP32[r43+1]=HEAP32[r42+1];HEAP32[r43+2]=HEAP32[r42+2];HEAP32[r42]=HEAP32[r31];HEAP32[r42+1]=HEAP32[r31+1];HEAP32[r42+2]=HEAP32[r31+2];r50=r52;r51=r48+1|0;break}r42=r40+12|0;if(FUNCTION_TABLE[HEAP32[r4]](r40,r38)){r53=r42}else{r43=r42;while(1){if((r43|0)==(r38|0)){r5=1418;break L1751}r54=r43+12|0;if(FUNCTION_TABLE[HEAP32[r4]](r40,r43)){break}else{r43=r54}}r42=r43>>2;HEAP32[r30]=HEAP32[r42];HEAP32[r30+1]=HEAP32[r42+1];HEAP32[r30+2]=HEAP32[r42+2];HEAP32[r42]=HEAP32[r39];HEAP32[r42+1]=HEAP32[r39+1];HEAP32[r42+2]=HEAP32[r39+2];HEAP32[r39]=HEAP32[r30];HEAP32[r39+1]=HEAP32[r30+1];HEAP32[r39+2]=HEAP32[r30+2];r53=r54}if((r53|0)==(r38|0)){r5=1432;break L1751}else{r55=r38;r56=r53}while(1){r42=r56;while(1){r57=r42+12|0;if(FUNCTION_TABLE[HEAP32[r4]](r40,r42)){r58=r55;break}else{r42=r57}}while(1){r59=r58-12|0;if(FUNCTION_TABLE[HEAP32[r4]](r40,r59)){r58=r59}else{break}}if(r42>>>0>=r59>>>0){r40=r42;continue L1753}r49=r42>>2;HEAP32[r29]=HEAP32[r49];HEAP32[r29+1]=HEAP32[r49+1];HEAP32[r29+2]=HEAP32[r49+2];r45=r59>>2;HEAP32[r49]=HEAP32[r45];HEAP32[r49+1]=HEAP32[r45+1];HEAP32[r49+2]=HEAP32[r45+2];HEAP32[r45]=HEAP32[r29];HEAP32[r45+1]=HEAP32[r29+1];HEAP32[r45+2]=HEAP32[r29+2];r55=r59;r56=r57}}}while(0);r43=r40+12|0;L1796:do{if(r43>>>0<r50>>>0){r45=r50;r49=r43;r46=r51;r47=r44;while(1){r60=r49;while(1){r61=r60+12|0;if(FUNCTION_TABLE[HEAP32[r4]](r60,r47)){r60=r61}else{r62=r45;break}}while(1){r63=r62-12|0;if(FUNCTION_TABLE[HEAP32[r4]](r63,r47)){break}else{r62=r63}}if(r60>>>0>r63>>>0){r64=r60;r65=r46;r66=r47;break L1796}r42=r60>>2;HEAP32[r28]=HEAP32[r42];HEAP32[r28+1]=HEAP32[r42+1];HEAP32[r28+2]=HEAP32[r42+2];r67=r63>>2;HEAP32[r42]=HEAP32[r67];HEAP32[r42+1]=HEAP32[r67+1];HEAP32[r42+2]=HEAP32[r67+2];HEAP32[r67]=HEAP32[r28];HEAP32[r67+1]=HEAP32[r28+1];HEAP32[r67+2]=HEAP32[r28+2];r45=r63;r49=r61;r46=r46+1|0;r47=(r47|0)==(r60|0)?r63:r47}}else{r64=r43;r65=r51;r66=r44}}while(0);do{if((r64|0)==(r66|0)){r68=r65}else{if(!FUNCTION_TABLE[HEAP32[r4]](r66,r64)){r68=r65;break}r44=r64>>2;HEAP32[r27]=HEAP32[r44];HEAP32[r27+1]=HEAP32[r44+1];HEAP32[r27+2]=HEAP32[r44+2];r43=r66>>2;HEAP32[r44]=HEAP32[r43];HEAP32[r44+1]=HEAP32[r43+1];HEAP32[r44+2]=HEAP32[r43+2];HEAP32[r43]=HEAP32[r27];HEAP32[r43+1]=HEAP32[r27+1];HEAP32[r43+2]=HEAP32[r27+2];r68=r65+1|0}}while(0);if((r68|0)==0){r69=__ZNSt3__127__insertion_sort_incompleteIRPFbRK6b2PairS3_EPS1_EEbT0_S8_T_(r40,r64,r3);r43=r64+12|0;if(__ZNSt3__127__insertion_sort_incompleteIRPFbRK6b2PairS3_EPS1_EEbT0_S8_T_(r43,r1,r3)){r5=1407;break}if(r69){r40=r43;continue}}r43=r64;if((r43-r41|0)>=(r2-r43|0)){r5=1411;break}__ZNSt3__16__sortIRPFbRK6b2PairS3_EPS1_EEvT0_S8_T_(r40,r64,r3);r40=r64+12|0}if(r5==1407){r5=0;if(r69){r5=1420;break}else{r37=r40;r1=r64;continue}}else if(r5==1411){r5=0;__ZNSt3__16__sortIRPFbRK6b2PairS3_EPS1_EEvT0_S8_T_(r64+12|0,r1,r3);r37=r40;r1=r64;continue}}if(r5==1347){r64=r40+12|0;r37=r40+24|0;r69=r40+36|0;r68=r13>>2;r13=r14>>2;r14=r15>>2;r15=r16>>2;__ZNSt3__17__sort4IRPFbRK6b2PairS3_EPS1_EEjT0_S8_S8_S8_T_(r40,r64,r37,r69,r3);if(!FUNCTION_TABLE[HEAP32[r4]](r38,r69)){STACKTOP=r6;return}r16=r69>>2;HEAP32[r15]=HEAP32[r16];HEAP32[r15+1]=HEAP32[r16+1];HEAP32[r15+2]=HEAP32[r16+2];HEAP32[r16]=HEAP32[r39];HEAP32[r16+1]=HEAP32[r39+1];HEAP32[r16+2]=HEAP32[r39+2];HEAP32[r39]=HEAP32[r15];HEAP32[r39+1]=HEAP32[r15+1];HEAP32[r39+2]=HEAP32[r15+2];if(!FUNCTION_TABLE[HEAP32[r4]](r69,r37)){STACKTOP=r6;return}r69=r37>>2;HEAP32[r13]=HEAP32[r69];HEAP32[r13+1]=HEAP32[r69+1];HEAP32[r13+2]=HEAP32[r69+2];HEAP32[r69]=HEAP32[r16];HEAP32[r69+1]=HEAP32[r16+1];HEAP32[r69+2]=HEAP32[r16+2];HEAP32[r16]=HEAP32[r13];HEAP32[r16+1]=HEAP32[r13+1];HEAP32[r16+2]=HEAP32[r13+2];if(!FUNCTION_TABLE[HEAP32[r4]](r37,r64)){STACKTOP=r6;return}r37=r64>>2;HEAP32[r68]=HEAP32[r37];HEAP32[r68+1]=HEAP32[r37+1];HEAP32[r68+2]=HEAP32[r37+2];HEAP32[r37]=HEAP32[r69];HEAP32[r37+1]=HEAP32[r69+1];HEAP32[r37+2]=HEAP32[r69+2];HEAP32[r69]=HEAP32[r68];HEAP32[r69+1]=HEAP32[r68+1];HEAP32[r69+2]=HEAP32[r68+2];if(!FUNCTION_TABLE[HEAP32[r4]](r64,r40)){STACKTOP=r6;return}r64=r40>>2;HEAP32[r14]=HEAP32[r64];HEAP32[r14+1]=HEAP32[r64+1];HEAP32[r14+2]=HEAP32[r64+2];HEAP32[r64]=HEAP32[r37];HEAP32[r64+1]=HEAP32[r37+1];HEAP32[r64+2]=HEAP32[r37+2];HEAP32[r37]=HEAP32[r14];HEAP32[r37+1]=HEAP32[r14+1];HEAP32[r37+2]=HEAP32[r14+2];STACKTOP=r6;return}else if(r5==1353){r14=r12>>2;r37=r40+24|0;r64=r40+12|0;r68=r7>>2;r7=r8>>2;r8=r9>>2;r9=r10>>2;r10=r11>>2;r11=FUNCTION_TABLE[HEAP32[r4]](r64,r40);r69=FUNCTION_TABLE[HEAP32[r4]](r37,r64);do{if(r11){r13=r40>>2;if(r69){HEAP32[r68]=HEAP32[r13];HEAP32[r68+1]=HEAP32[r13+1];HEAP32[r68+2]=HEAP32[r13+2];r16=r37>>2;HEAP32[r13]=HEAP32[r16];HEAP32[r13+1]=HEAP32[r16+1];HEAP32[r13+2]=HEAP32[r16+2];HEAP32[r16]=HEAP32[r68];HEAP32[r16+1]=HEAP32[r68+1];HEAP32[r16+2]=HEAP32[r68+2];break}HEAP32[r7]=HEAP32[r13];HEAP32[r7+1]=HEAP32[r13+1];HEAP32[r7+2]=HEAP32[r13+2];r16=r64>>2;HEAP32[r13]=HEAP32[r16];HEAP32[r13+1]=HEAP32[r16+1];HEAP32[r13+2]=HEAP32[r16+2];HEAP32[r16]=HEAP32[r7];HEAP32[r16+1]=HEAP32[r7+1];HEAP32[r16+2]=HEAP32[r7+2];if(!FUNCTION_TABLE[HEAP32[r4]](r37,r64)){break}HEAP32[r9]=HEAP32[r16];HEAP32[r9+1]=HEAP32[r16+1];HEAP32[r9+2]=HEAP32[r16+2];r13=r37>>2;HEAP32[r16]=HEAP32[r13];HEAP32[r16+1]=HEAP32[r13+1];HEAP32[r16+2]=HEAP32[r13+2];HEAP32[r13]=HEAP32[r9];HEAP32[r13+1]=HEAP32[r9+1];HEAP32[r13+2]=HEAP32[r9+2]}else{if(!r69){break}r13=r64>>2;HEAP32[r10]=HEAP32[r13];HEAP32[r10+1]=HEAP32[r13+1];HEAP32[r10+2]=HEAP32[r13+2];r16=r37>>2;HEAP32[r13]=HEAP32[r16];HEAP32[r13+1]=HEAP32[r16+1];HEAP32[r13+2]=HEAP32[r16+2];HEAP32[r16]=HEAP32[r10];HEAP32[r16+1]=HEAP32[r10+1];HEAP32[r16+2]=HEAP32[r10+2];if(!FUNCTION_TABLE[HEAP32[r4]](r64,r40)){break}r16=r40>>2;HEAP32[r8]=HEAP32[r16];HEAP32[r8+1]=HEAP32[r16+1];HEAP32[r8+2]=HEAP32[r16+2];HEAP32[r16]=HEAP32[r13];HEAP32[r16+1]=HEAP32[r13+1];HEAP32[r16+2]=HEAP32[r13+2];HEAP32[r13]=HEAP32[r8];HEAP32[r13+1]=HEAP32[r8+1];HEAP32[r13+2]=HEAP32[r8+2]}}while(0);r8=r40+36|0;if((r8|0)==(r1|0)){STACKTOP=r6;return}else{r70=r37;r71=r8}while(1){if(FUNCTION_TABLE[HEAP32[r4]](r71,r70)){r8=r71>>2;HEAP32[r14]=HEAP32[r8];HEAP32[r14+1]=HEAP32[r8+1];HEAP32[r14+2]=HEAP32[r8+2];r8=r70;r37=r71;while(1){r64=r37>>2;r72=r8>>2;HEAP32[r64]=HEAP32[r72];HEAP32[r64+1]=HEAP32[r72+1];HEAP32[r64+2]=HEAP32[r72+2];if((r8|0)==(r40|0)){break}r64=r8-12|0;if(FUNCTION_TABLE[HEAP32[r4]](r12,r64)){r37=r8;r8=r64}else{break}}HEAP32[r72]=HEAP32[r14];HEAP32[r72+1]=HEAP32[r14+1];HEAP32[r72+2]=HEAP32[r14+2]}r8=r71+12|0;if((r8|0)==(r1|0)){break}else{r70=r71;r71=r8}}STACKTOP=r6;return}else if(r5==1338){r71=r40+12|0;r70=r17>>2;r17=r18>>2;r18=r19>>2;r19=r20>>2;r20=r21>>2;r21=FUNCTION_TABLE[HEAP32[r4]](r71,r40);r1=FUNCTION_TABLE[HEAP32[r4]](r38,r71);if(!r21){if(!r1){STACKTOP=r6;return}r21=r71>>2;HEAP32[r20]=HEAP32[r21];HEAP32[r20+1]=HEAP32[r21+1];HEAP32[r20+2]=HEAP32[r21+2];HEAP32[r21]=HEAP32[r39];HEAP32[r21+1]=HEAP32[r39+1];HEAP32[r21+2]=HEAP32[r39+2];HEAP32[r39]=HEAP32[r20];HEAP32[r39+1]=HEAP32[r20+1];HEAP32[r39+2]=HEAP32[r20+2];if(!FUNCTION_TABLE[HEAP32[r4]](r71,r40)){STACKTOP=r6;return}r20=r40>>2;HEAP32[r18]=HEAP32[r20];HEAP32[r18+1]=HEAP32[r20+1];HEAP32[r18+2]=HEAP32[r20+2];HEAP32[r20]=HEAP32[r21];HEAP32[r20+1]=HEAP32[r21+1];HEAP32[r20+2]=HEAP32[r21+2];HEAP32[r21]=HEAP32[r18];HEAP32[r21+1]=HEAP32[r18+1];HEAP32[r21+2]=HEAP32[r18+2];STACKTOP=r6;return}r18=r40>>2;if(r1){HEAP32[r70]=HEAP32[r18];HEAP32[r70+1]=HEAP32[r18+1];HEAP32[r70+2]=HEAP32[r18+2];HEAP32[r18]=HEAP32[r39];HEAP32[r18+1]=HEAP32[r39+1];HEAP32[r18+2]=HEAP32[r39+2];HEAP32[r39]=HEAP32[r70];HEAP32[r39+1]=HEAP32[r70+1];HEAP32[r39+2]=HEAP32[r70+2];STACKTOP=r6;return}HEAP32[r17]=HEAP32[r18];HEAP32[r17+1]=HEAP32[r18+1];HEAP32[r17+2]=HEAP32[r18+2];r70=r71>>2;HEAP32[r18]=HEAP32[r70];HEAP32[r18+1]=HEAP32[r70+1];HEAP32[r18+2]=HEAP32[r70+2];HEAP32[r70]=HEAP32[r17];HEAP32[r70+1]=HEAP32[r17+1];HEAP32[r70+2]=HEAP32[r17+2];if(!FUNCTION_TABLE[HEAP32[r4]](r38,r71)){STACKTOP=r6;return}HEAP32[r19]=HEAP32[r70];HEAP32[r19+1]=HEAP32[r70+1];HEAP32[r19+2]=HEAP32[r70+2];HEAP32[r70]=HEAP32[r39];HEAP32[r70+1]=HEAP32[r39+1];HEAP32[r70+2]=HEAP32[r39+2];HEAP32[r39]=HEAP32[r19];HEAP32[r39+1]=HEAP32[r19+1];HEAP32[r39+2]=HEAP32[r19+2];STACKTOP=r6;return}else if(r5==1346){__ZNSt3__17__sort4IRPFbRK6b2PairS3_EPS1_EEjT0_S8_S8_S8_T_(r40,r40+12|0,r40+24|0,r38,r3);STACKTOP=r6;return}else if(r5==1336){if(!FUNCTION_TABLE[HEAP32[r4]](r38,r40)){STACKTOP=r6;return}r38=r22>>2;r22=r40>>2;HEAP32[r38]=HEAP32[r22];HEAP32[r38+1]=HEAP32[r22+1];HEAP32[r38+2]=HEAP32[r22+2];HEAP32[r22]=HEAP32[r39];HEAP32[r22+1]=HEAP32[r39+1];HEAP32[r22+2]=HEAP32[r39+2];HEAP32[r39]=HEAP32[r38];HEAP32[r39+1]=HEAP32[r38+1];HEAP32[r39+2]=HEAP32[r38+2];STACKTOP=r6;return}else if(r5==1418){STACKTOP=r6;return}else if(r5==1419){STACKTOP=r6;return}else if(r5==1420){STACKTOP=r6;return}else if(r5==1432){STACKTOP=r6;return}}function __ZNSt3__17__sort4IRPFbRK6b2PairS3_EPS1_EEjT0_S8_S8_S8_T_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r6=r5>>2;r5=STACKTOP;STACKTOP=STACKTOP+96|0;r7=r5+60;r8=r5+72;r9=r5+84;r10=r5>>2;r11=r5+12>>2;r12=r5+24>>2;r13=r5+36>>2;r14=r5+48>>2;r15=FUNCTION_TABLE[HEAP32[r6]](r2,r1);r16=FUNCTION_TABLE[HEAP32[r6]](r3,r2);do{if(r15){r17=r1>>2;if(r16){HEAP32[r10]=HEAP32[r17];HEAP32[r10+1]=HEAP32[r17+1];HEAP32[r10+2]=HEAP32[r17+2];r18=r3>>2;HEAP32[r17]=HEAP32[r18];HEAP32[r17+1]=HEAP32[r18+1];HEAP32[r17+2]=HEAP32[r18+2];HEAP32[r18]=HEAP32[r10];HEAP32[r18+1]=HEAP32[r10+1];HEAP32[r18+2]=HEAP32[r10+2];r19=1;break}HEAP32[r11]=HEAP32[r17];HEAP32[r11+1]=HEAP32[r17+1];HEAP32[r11+2]=HEAP32[r17+2];r18=r2>>2;HEAP32[r17]=HEAP32[r18];HEAP32[r17+1]=HEAP32[r18+1];HEAP32[r17+2]=HEAP32[r18+2];HEAP32[r18]=HEAP32[r11];HEAP32[r18+1]=HEAP32[r11+1];HEAP32[r18+2]=HEAP32[r11+2];if(!FUNCTION_TABLE[HEAP32[r6]](r3,r2)){r19=1;break}HEAP32[r13]=HEAP32[r18];HEAP32[r13+1]=HEAP32[r18+1];HEAP32[r13+2]=HEAP32[r18+2];r17=r3>>2;HEAP32[r18]=HEAP32[r17];HEAP32[r18+1]=HEAP32[r17+1];HEAP32[r18+2]=HEAP32[r17+2];HEAP32[r17]=HEAP32[r13];HEAP32[r17+1]=HEAP32[r13+1];HEAP32[r17+2]=HEAP32[r13+2];r19=2}else{if(!r16){r19=0;break}r17=r2>>2;HEAP32[r14]=HEAP32[r17];HEAP32[r14+1]=HEAP32[r17+1];HEAP32[r14+2]=HEAP32[r17+2];r18=r3>>2;HEAP32[r17]=HEAP32[r18];HEAP32[r17+1]=HEAP32[r18+1];HEAP32[r17+2]=HEAP32[r18+2];HEAP32[r18]=HEAP32[r14];HEAP32[r18+1]=HEAP32[r14+1];HEAP32[r18+2]=HEAP32[r14+2];if(!FUNCTION_TABLE[HEAP32[r6]](r2,r1)){r19=1;break}r18=r1>>2;HEAP32[r12]=HEAP32[r18];HEAP32[r12+1]=HEAP32[r18+1];HEAP32[r12+2]=HEAP32[r18+2];HEAP32[r18]=HEAP32[r17];HEAP32[r18+1]=HEAP32[r17+1];HEAP32[r18+2]=HEAP32[r17+2];HEAP32[r17]=HEAP32[r12];HEAP32[r17+1]=HEAP32[r12+1];HEAP32[r17+2]=HEAP32[r12+2];r19=2}}while(0);if(!FUNCTION_TABLE[HEAP32[r6]](r4,r3)){r20=r19;STACKTOP=r5;return r20}r12=r9>>2;r9=r3>>2;HEAP32[r12]=HEAP32[r9];HEAP32[r12+1]=HEAP32[r9+1];HEAP32[r12+2]=HEAP32[r9+2];r14=r4>>2;HEAP32[r9]=HEAP32[r14];HEAP32[r9+1]=HEAP32[r14+1];HEAP32[r9+2]=HEAP32[r14+2];HEAP32[r14]=HEAP32[r12];HEAP32[r14+1]=HEAP32[r12+1];HEAP32[r14+2]=HEAP32[r12+2];if(!FUNCTION_TABLE[HEAP32[r6]](r3,r2)){r20=r19+1|0;STACKTOP=r5;return r20}r3=r7>>2;r7=r2>>2;HEAP32[r3]=HEAP32[r7];HEAP32[r3+1]=HEAP32[r7+1];HEAP32[r3+2]=HEAP32[r7+2];HEAP32[r7]=HEAP32[r9];HEAP32[r7+1]=HEAP32[r9+1];HEAP32[r7+2]=HEAP32[r9+2];HEAP32[r9]=HEAP32[r3];HEAP32[r9+1]=HEAP32[r3+1];HEAP32[r9+2]=HEAP32[r3+2];if(!FUNCTION_TABLE[HEAP32[r6]](r2,r1)){r20=r19+2|0;STACKTOP=r5;return r20}r2=r8>>2;r8=r1>>2;HEAP32[r2]=HEAP32[r8];HEAP32[r2+1]=HEAP32[r8+1];HEAP32[r2+2]=HEAP32[r8+2];HEAP32[r8]=HEAP32[r7];HEAP32[r8+1]=HEAP32[r7+1];HEAP32[r8+2]=HEAP32[r7+2];HEAP32[r7]=HEAP32[r2];HEAP32[r7+1]=HEAP32[r2+1];HEAP32[r7+2]=HEAP32[r2+2];r20=r19+3|0;STACKTOP=r5;return r20}function __ZN17b2ContactListener12BeginContactEP9b2Contact(r1,r2){return}function __ZN17b2ContactListener10EndContactEP9b2Contact(r1,r2){return}function __ZN17b2ContactListener8PreSolveEP9b2ContactPK10b2Manifold(r1,r2,r3){return}function __ZN17b2ContactListener9PostSolveEP9b2ContactPK16b2ContactImpulse(r1,r2,r3){return}function __ZNSt3__127__insertion_sort_incompleteIRPFbRK6b2PairS3_EPS1_EEbT0_S8_T_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r4=r3>>2;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+192|0;r7=r6;r8=r6+12;r9=r6+24;r10=r6+36;r11=r6+48;r12=r6+108;r13=r6+120;r14=r6+132;r15=r6+144;r16=r6+156;r17=r6+168;r18=r6+180;r19=(r2-r1|0)/12&-1;if((r19|0)==5){r20=r1+12|0;r21=r1+24|0;r22=r1+36|0;r23=r2-12|0;r24=r6+60>>2;r25=r6+72>>2;r26=r6+84>>2;r27=r6+96>>2;__ZNSt3__17__sort4IRPFbRK6b2PairS3_EPS1_EEjT0_S8_S8_S8_T_(r1,r20,r21,r22,r3);if(!FUNCTION_TABLE[HEAP32[r4]](r23,r22)){r28=1;STACKTOP=r6;return r28}r29=r22>>2;HEAP32[r27]=HEAP32[r29];HEAP32[r27+1]=HEAP32[r29+1];HEAP32[r27+2]=HEAP32[r29+2];r30=r23>>2;HEAP32[r29]=HEAP32[r30];HEAP32[r29+1]=HEAP32[r30+1];HEAP32[r29+2]=HEAP32[r30+2];HEAP32[r30]=HEAP32[r27];HEAP32[r30+1]=HEAP32[r27+1];HEAP32[r30+2]=HEAP32[r27+2];if(!FUNCTION_TABLE[HEAP32[r4]](r22,r21)){r28=1;STACKTOP=r6;return r28}r22=r21>>2;HEAP32[r25]=HEAP32[r22];HEAP32[r25+1]=HEAP32[r22+1];HEAP32[r25+2]=HEAP32[r22+2];HEAP32[r22]=HEAP32[r29];HEAP32[r22+1]=HEAP32[r29+1];HEAP32[r22+2]=HEAP32[r29+2];HEAP32[r29]=HEAP32[r25];HEAP32[r29+1]=HEAP32[r25+1];HEAP32[r29+2]=HEAP32[r25+2];if(!FUNCTION_TABLE[HEAP32[r4]](r21,r20)){r28=1;STACKTOP=r6;return r28}r21=r20>>2;HEAP32[r24]=HEAP32[r21];HEAP32[r24+1]=HEAP32[r21+1];HEAP32[r24+2]=HEAP32[r21+2];HEAP32[r21]=HEAP32[r22];HEAP32[r21+1]=HEAP32[r22+1];HEAP32[r21+2]=HEAP32[r22+2];HEAP32[r22]=HEAP32[r24];HEAP32[r22+1]=HEAP32[r24+1];HEAP32[r22+2]=HEAP32[r24+2];if(!FUNCTION_TABLE[HEAP32[r4]](r20,r1)){r28=1;STACKTOP=r6;return r28}r20=r1>>2;HEAP32[r26]=HEAP32[r20];HEAP32[r26+1]=HEAP32[r20+1];HEAP32[r26+2]=HEAP32[r20+2];HEAP32[r20]=HEAP32[r21];HEAP32[r20+1]=HEAP32[r21+1];HEAP32[r20+2]=HEAP32[r21+2];HEAP32[r21]=HEAP32[r26];HEAP32[r21+1]=HEAP32[r26+1];HEAP32[r21+2]=HEAP32[r26+2];r28=1;STACKTOP=r6;return r28}else if((r19|0)==3){r26=r1+12|0;r21=r2-12|0;r20=r12>>2;r12=r13>>2;r13=r14>>2;r14=r15>>2;r15=r16>>2;r16=FUNCTION_TABLE[HEAP32[r4]](r26,r1);r24=FUNCTION_TABLE[HEAP32[r4]](r21,r26);if(!r16){if(!r24){r28=1;STACKTOP=r6;return r28}r16=r26>>2;HEAP32[r15]=HEAP32[r16];HEAP32[r15+1]=HEAP32[r16+1];HEAP32[r15+2]=HEAP32[r16+2];r22=r21>>2;HEAP32[r16]=HEAP32[r22];HEAP32[r16+1]=HEAP32[r22+1];HEAP32[r16+2]=HEAP32[r22+2];HEAP32[r22]=HEAP32[r15];HEAP32[r22+1]=HEAP32[r15+1];HEAP32[r22+2]=HEAP32[r15+2];if(!FUNCTION_TABLE[HEAP32[r4]](r26,r1)){r28=1;STACKTOP=r6;return r28}r15=r1>>2;HEAP32[r13]=HEAP32[r15];HEAP32[r13+1]=HEAP32[r15+1];HEAP32[r13+2]=HEAP32[r15+2];HEAP32[r15]=HEAP32[r16];HEAP32[r15+1]=HEAP32[r16+1];HEAP32[r15+2]=HEAP32[r16+2];HEAP32[r16]=HEAP32[r13];HEAP32[r16+1]=HEAP32[r13+1];HEAP32[r16+2]=HEAP32[r13+2];r28=1;STACKTOP=r6;return r28}r13=r1>>2;if(r24){HEAP32[r20]=HEAP32[r13];HEAP32[r20+1]=HEAP32[r13+1];HEAP32[r20+2]=HEAP32[r13+2];r24=r21>>2;HEAP32[r13]=HEAP32[r24];HEAP32[r13+1]=HEAP32[r24+1];HEAP32[r13+2]=HEAP32[r24+2];HEAP32[r24]=HEAP32[r20];HEAP32[r24+1]=HEAP32[r20+1];HEAP32[r24+2]=HEAP32[r20+2];r28=1;STACKTOP=r6;return r28}HEAP32[r12]=HEAP32[r13];HEAP32[r12+1]=HEAP32[r13+1];HEAP32[r12+2]=HEAP32[r13+2];r20=r26>>2;HEAP32[r13]=HEAP32[r20];HEAP32[r13+1]=HEAP32[r20+1];HEAP32[r13+2]=HEAP32[r20+2];HEAP32[r20]=HEAP32[r12];HEAP32[r20+1]=HEAP32[r12+1];HEAP32[r20+2]=HEAP32[r12+2];if(!FUNCTION_TABLE[HEAP32[r4]](r21,r26)){r28=1;STACKTOP=r6;return r28}HEAP32[r14]=HEAP32[r20];HEAP32[r14+1]=HEAP32[r20+1];HEAP32[r14+2]=HEAP32[r20+2];r26=r21>>2;HEAP32[r20]=HEAP32[r26];HEAP32[r20+1]=HEAP32[r26+1];HEAP32[r20+2]=HEAP32[r26+2];HEAP32[r26]=HEAP32[r14];HEAP32[r26+1]=HEAP32[r14+1];HEAP32[r26+2]=HEAP32[r14+2];r28=1;STACKTOP=r6;return r28}else if((r19|0)==2){r14=r2-12|0;if(!FUNCTION_TABLE[HEAP32[r4]](r14,r1)){r28=1;STACKTOP=r6;return r28}r26=r17>>2;r17=r1>>2;HEAP32[r26]=HEAP32[r17];HEAP32[r26+1]=HEAP32[r17+1];HEAP32[r26+2]=HEAP32[r17+2];r20=r14>>2;HEAP32[r17]=HEAP32[r20];HEAP32[r17+1]=HEAP32[r20+1];HEAP32[r17+2]=HEAP32[r20+2];HEAP32[r20]=HEAP32[r26];HEAP32[r20+1]=HEAP32[r26+1];HEAP32[r20+2]=HEAP32[r26+2];r28=1;STACKTOP=r6;return r28}else if((r19|0)==0|(r19|0)==1){r28=1;STACKTOP=r6;return r28}else if((r19|0)==4){__ZNSt3__17__sort4IRPFbRK6b2PairS3_EPS1_EEjT0_S8_S8_S8_T_(r1,r1+12|0,r1+24|0,r2-12|0,r3);r28=1;STACKTOP=r6;return r28}else{r3=r1+24|0;r19=r1+12|0;r26=r7>>2;r7=r8>>2;r8=r9>>2;r9=r10>>2;r10=r11>>2;r11=FUNCTION_TABLE[HEAP32[r4]](r19,r1);r20=FUNCTION_TABLE[HEAP32[r4]](r3,r19);do{if(r11){r17=r1>>2;if(r20){HEAP32[r26]=HEAP32[r17];HEAP32[r26+1]=HEAP32[r17+1];HEAP32[r26+2]=HEAP32[r17+2];r14=r3>>2;HEAP32[r17]=HEAP32[r14];HEAP32[r17+1]=HEAP32[r14+1];HEAP32[r17+2]=HEAP32[r14+2];HEAP32[r14]=HEAP32[r26];HEAP32[r14+1]=HEAP32[r26+1];HEAP32[r14+2]=HEAP32[r26+2];break}HEAP32[r7]=HEAP32[r17];HEAP32[r7+1]=HEAP32[r17+1];HEAP32[r7+2]=HEAP32[r17+2];r14=r19>>2;HEAP32[r17]=HEAP32[r14];HEAP32[r17+1]=HEAP32[r14+1];HEAP32[r17+2]=HEAP32[r14+2];HEAP32[r14]=HEAP32[r7];HEAP32[r14+1]=HEAP32[r7+1];HEAP32[r14+2]=HEAP32[r7+2];if(!FUNCTION_TABLE[HEAP32[r4]](r3,r19)){break}HEAP32[r9]=HEAP32[r14];HEAP32[r9+1]=HEAP32[r14+1];HEAP32[r9+2]=HEAP32[r14+2];r17=r3>>2;HEAP32[r14]=HEAP32[r17];HEAP32[r14+1]=HEAP32[r17+1];HEAP32[r14+2]=HEAP32[r17+2];HEAP32[r17]=HEAP32[r9];HEAP32[r17+1]=HEAP32[r9+1];HEAP32[r17+2]=HEAP32[r9+2]}else{if(!r20){break}r17=r19>>2;HEAP32[r10]=HEAP32[r17];HEAP32[r10+1]=HEAP32[r17+1];HEAP32[r10+2]=HEAP32[r17+2];r14=r3>>2;HEAP32[r17]=HEAP32[r14];HEAP32[r17+1]=HEAP32[r14+1];HEAP32[r17+2]=HEAP32[r14+2];HEAP32[r14]=HEAP32[r10];HEAP32[r14+1]=HEAP32[r10+1];HEAP32[r14+2]=HEAP32[r10+2];if(!FUNCTION_TABLE[HEAP32[r4]](r19,r1)){break}r14=r1>>2;HEAP32[r8]=HEAP32[r14];HEAP32[r8+1]=HEAP32[r14+1];HEAP32[r8+2]=HEAP32[r14+2];HEAP32[r14]=HEAP32[r17];HEAP32[r14+1]=HEAP32[r17+1];HEAP32[r14+2]=HEAP32[r17+2];HEAP32[r17]=HEAP32[r8];HEAP32[r17+1]=HEAP32[r8+1];HEAP32[r17+2]=HEAP32[r8+2]}}while(0);r8=r1+36|0;if((r8|0)==(r2|0)){r28=1;STACKTOP=r6;return r28}r19=r18>>2;r10=r3;r3=0;r20=r8;while(1){if(FUNCTION_TABLE[HEAP32[r4]](r20,r10)){r8=r20>>2;HEAP32[r19]=HEAP32[r8];HEAP32[r19+1]=HEAP32[r8+1];HEAP32[r19+2]=HEAP32[r8+2];r8=r10;r9=r20;while(1){r7=r9>>2;r31=r8>>2;HEAP32[r7]=HEAP32[r31];HEAP32[r7+1]=HEAP32[r31+1];HEAP32[r7+2]=HEAP32[r31+2];if((r8|0)==(r1|0)){break}r7=r8-12|0;if(FUNCTION_TABLE[HEAP32[r4]](r18,r7)){r9=r8;r8=r7}else{break}}HEAP32[r31]=HEAP32[r19];HEAP32[r31+1]=HEAP32[r19+1];HEAP32[r31+2]=HEAP32[r19+2];r8=r3+1|0;if((r8|0)==8){break}else{r32=r8}}else{r32=r3}r8=r20+12|0;if((r8|0)==(r2|0)){r28=1;r5=1502;break}else{r10=r20;r3=r32;r20=r8}}if(r5==1502){STACKTOP=r6;return r28}r28=(r20+12|0)==(r2|0);STACKTOP=r6;return r28}}function __ZN17b2ContactListenerD0Ev(r1){__ZdlPv(r1);return}function __ZN9b2Fixture11SynchronizeEP12b2BroadPhaseRK11b2TransformS4_(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r5=STACKTOP;STACKTOP=STACKTOP+40|0;r6=r5;r7=r5+16;r8=r5+32;r9=r1+28|0;if((HEAP32[r9>>2]|0)<=0){STACKTOP=r5;return}r10=r1+24|0;r11=r1+12|0;r1=r6|0;r12=r7|0;r13=r6+4|0;r14=r7+4|0;r15=r6+8|0;r16=r7+8|0;r17=r6+12|0;r18=r7+12|0;r19=r4|0;r20=r3|0;r21=r4+4|0;r22=r3+4|0;r23=r8|0;r24=r8+4|0;r25=r2|0;r26=(r2+40|0)>>2;r27=r2+36|0;r28=(r2+32|0)>>2;r2=0;while(1){r29=HEAP32[r10>>2];r30=HEAP32[r11>>2];r31=r29+(r2*28&-1)+20|0;FUNCTION_TABLE[HEAP32[HEAP32[r30>>2]+24>>2]](r30,r6,r3,HEAP32[r31>>2]);r30=HEAP32[r11>>2];FUNCTION_TABLE[HEAP32[HEAP32[r30>>2]+24>>2]](r30,r7,r4,HEAP32[r31>>2]);r31=r29+(r2*28&-1)|0;r30=HEAPF32[r1>>2];r32=HEAPF32[r12>>2];r33=HEAPF32[r13>>2];r34=HEAPF32[r14>>2];r35=r31;r36=(HEAPF32[tempDoublePtr>>2]=r30<r32?r30:r32,HEAP32[tempDoublePtr>>2]);r32=(HEAPF32[tempDoublePtr>>2]=r33<r34?r33:r34,HEAP32[tempDoublePtr>>2])|0;HEAP32[r35>>2]=0|r36;HEAP32[r35+4>>2]=r32;r32=HEAPF32[r15>>2];r35=HEAPF32[r16>>2];r36=HEAPF32[r17>>2];r34=HEAPF32[r18>>2];r33=r29+(r2*28&-1)+8|0;r30=(HEAPF32[tempDoublePtr>>2]=r32>r35?r32:r35,HEAP32[tempDoublePtr>>2]);r35=(HEAPF32[tempDoublePtr>>2]=r36>r34?r36:r34,HEAP32[tempDoublePtr>>2])|0;HEAP32[r33>>2]=0|r30;HEAP32[r33+4>>2]=r35;r35=HEAPF32[r21>>2]-HEAPF32[r22>>2];HEAPF32[r23>>2]=HEAPF32[r19>>2]-HEAPF32[r20>>2];HEAPF32[r24>>2]=r35;r35=HEAP32[r29+(r2*28&-1)+24>>2];if(__ZN13b2DynamicTree9MoveProxyEiRK6b2AABBRK6b2Vec2(r25,r35,r31,r8)){r31=HEAP32[r26];if((r31|0)==(HEAP32[r27>>2]|0)){r29=HEAP32[r28];HEAP32[r27>>2]=r31<<1;r33=_malloc(r31<<3);HEAP32[r28]=r33;r30=r29;_memcpy(r33,r30,HEAP32[r26]<<2);_free(r30);r37=HEAP32[r26]}else{r37=r31}HEAP32[HEAP32[r28]+(r37<<2)>>2]=r35;HEAP32[r26]=HEAP32[r26]+1|0}r35=r2+1|0;if((r35|0)<(HEAP32[r9>>2]|0)){r2=r35}else{break}}STACKTOP=r5;return}function __ZN9b2Fixture8RefilterEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=r1+8|0;r3=HEAP32[r2>>2];if((r3|0)==0){return}r4=HEAP32[r3+112>>2];if((r4|0)==0){r5=r3}else{r3=r4;while(1){r4=HEAP32[r3+4>>2];if((HEAP32[r4+48>>2]|0)==(r1|0)|(HEAP32[r4+52>>2]|0)==(r1|0)){r6=r4+4|0;HEAP32[r6>>2]=HEAP32[r6>>2]|8}r6=HEAP32[r3+12>>2];if((r6|0)==0){break}else{r3=r6}}r5=HEAP32[r2>>2]}r2=HEAP32[r5+88>>2];if((r2|0)==0){return}r5=r1+28|0;if((HEAP32[r5>>2]|0)<=0){return}r3=r1+24|0;r1=(r2+102912|0)>>2;r6=r2+102908|0;r4=(r2+102904|0)>>2;r2=0;r7=HEAP32[r1];while(1){r8=HEAP32[HEAP32[r3>>2]+(r2*28&-1)+24>>2];if((r7|0)==(HEAP32[r6>>2]|0)){r9=HEAP32[r4];HEAP32[r6>>2]=r7<<1;r10=_malloc(r7<<3);HEAP32[r4]=r10;r11=r9;_memcpy(r10,r11,HEAP32[r1]<<2);_free(r11);r12=HEAP32[r1]}else{r12=r7}HEAP32[HEAP32[r4]+(r12<<2)>>2]=r8;r8=HEAP32[r1]+1|0;HEAP32[r1]=r8;r11=r2+1|0;if((r11|0)<(HEAP32[r5>>2]|0)){r2=r11;r7=r8}else{break}}return}function __ZN9b2Fixture4DumpEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r3=STACKTOP;__Z5b2LogPKcz(5250016,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5249052,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r1+16>>2],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5248548,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r1+20>>2],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5248076,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r1>>2],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247724,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+38|0]&1,tempInt));__Z5b2LogPKcz(5247456,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAPU16[r1+32>>1],tempInt));__Z5b2LogPKcz(5247240,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAPU16[r1+34>>1],tempInt));__Z5b2LogPKcz(5255252,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP16[r1+36>>1]<<16>>16,tempInt));r4=HEAP32[r1+12>>2],r1=r4>>2;r5=HEAP32[r1+1];if((r5|0)==1){__Z5b2LogPKcz(5253828,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5254608,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r1+2],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r6=r4+28|0;r7=HEAPF32[r6+4>>2];__Z5b2LogPKcz(5253628,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r6>>2],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r7,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r7=HEAPF32[r1+4];__Z5b2LogPKcz(5253420,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r1+3],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r7,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r7=r4+20|0;r6=HEAPF32[r7+4>>2];__Z5b2LogPKcz(5253232,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r7>>2],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r6,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r6=HEAPF32[r1+10];__Z5b2LogPKcz(5253036,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r1+9],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r6,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5252924,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r4+44|0]&1,tempInt));__Z5b2LogPKcz(5252732,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r4+45|0]&1,tempInt))}else if((r5|0)==3){r6=r4;__Z5b2LogPKcz(5251312,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r7=(r4+16|0)>>2;__Z5b2LogPKcz(5252108,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r7],tempInt));r8=HEAP32[r7];L2023:do{if((r8|0)>0){r9=r4+12|0;r10=0;while(1){r11=HEAP32[r9>>2];r12=HEAPF32[r11+(r10<<3)>>2];r13=HEAPF32[r11+(r10<<3)+4>>2];__Z5b2LogPKcz(5251700,(tempInt=STACKTOP,STACKTOP=STACKTOP+20|0,HEAP32[tempInt>>2]=r10,HEAPF64[tempDoublePtr>>3]=r12,HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r13,HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+16>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r13=r10+1|0;r12=HEAP32[r7];if((r13|0)<(r12|0)){r10=r13}else{r14=r12;break L2023}}}else{r14=r8}}while(0);__Z5b2LogPKcz(5250964,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r14,tempInt));r14=r4+20|0;r8=HEAPF32[r14+4>>2];__Z5b2LogPKcz(5250740,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r14>>2],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r8,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r8=r4+28|0;r14=HEAPF32[r8+4>>2];__Z5b2LogPKcz(5250472,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r8>>2],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r14,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5250264,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r4+36|0]&1,tempInt));__Z5b2LogPKcz(5250128,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r6+37|0]&1,tempInt))}else if((r5|0)==0){__Z5b2LogPKcz(5255068,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5254608,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r1+2],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r6=HEAPF32[r1+4];__Z5b2LogPKcz(5254052,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r1+3],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r6,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt))}else if((r5|0)==2){__Z5b2LogPKcz(5252424,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5252108,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=8,tempInt));r5=r4+148|0;r6=HEAP32[r5>>2];L2030:do{if((r6|0)>0){r1=r4+20|0;r14=0;while(1){r8=HEAPF32[r1+(r14<<3)>>2];r7=HEAPF32[r1+(r14<<3)+4>>2];__Z5b2LogPKcz(5251700,(tempInt=STACKTOP,STACKTOP=STACKTOP+20|0,HEAP32[tempInt>>2]=r14,HEAPF64[tempDoublePtr>>3]=r8,HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r7,HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+16>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r7=r14+1|0;r8=HEAP32[r5>>2];if((r7|0)<(r8|0)){r14=r7}else{r15=r8;break L2030}}}else{r15=r6}}while(0);__Z5b2LogPKcz(5251456,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r15,tempInt))}else{STACKTOP=r3;return}__Z5b2LogPKcz(5250040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5249908,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5250040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5249728,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r2,tempInt));STACKTOP=r3;return}function __ZN9b2Fixture7DestroyEP16b2BlockAllocator(r1,r2){var r3,r4,r5,r6,r7,r8;if((HEAP32[r1+28>>2]|0)!=0){___assert_func(5254684,72,5257228,5254988)}r3=(r1+12|0)>>2;r4=HEAP32[r3];r5=FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+12>>2]](r4);r4=r1+24|0;r1=HEAP32[r4>>2];r6=r1;r7=r5*28&-1;do{if((r7|0)!=0){if((r7|0)<=0){___assert_func(5248148,164,5259684,5251024)}if((r7|0)>640){_free(r6);break}r5=HEAP8[r7+5263852|0];if((r5&255)<14){r8=((r5&255)<<2)+r2+12|0;HEAP32[r1>>2]=HEAP32[r8>>2];HEAP32[r8>>2]=r1;break}else{___assert_func(5248148,173,5259684,5249276)}}}while(0);HEAP32[r4>>2]=0;r4=HEAP32[r3],r1=r4>>2;r7=HEAP32[r1+1];if((r7|0)==2){FUNCTION_TABLE[HEAP32[HEAP32[r1]>>2]](r4);r6=HEAP8[5264004];if((r6&255)>=14){___assert_func(5248148,173,5259684,5249276)}r8=((r6&255)<<2)+r2+12|0;HEAP32[r1]=HEAP32[r8>>2];HEAP32[r8>>2]=r4;HEAP32[r3]=0;return}else if((r7|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r1]>>2]](r4);r8=HEAP8[5263872];if((r8&255)>=14){___assert_func(5248148,173,5259684,5249276)}r6=((r8&255)<<2)+r2+12|0;HEAP32[r1]=HEAP32[r6>>2];HEAP32[r6>>2]=r4;HEAP32[r3]=0;return}else if((r7|0)==3){FUNCTION_TABLE[HEAP32[HEAP32[r1]>>2]](r4);r6=HEAP8[5263892];if((r6&255)>=14){___assert_func(5248148,173,5259684,5249276)}r8=((r6&255)<<2)+r2+12|0;HEAP32[r1]=HEAP32[r8>>2];HEAP32[r8>>2]=r4;HEAP32[r3]=0;return}else if((r7|0)==1){FUNCTION_TABLE[HEAP32[HEAP32[r1]>>2]](r4);r7=HEAP8[5263900];if((r7&255)>=14){___assert_func(5248148,173,5259684,5249276)}r8=((r7&255)<<2)+r2+12|0;HEAP32[r1]=HEAP32[r8>>2];HEAP32[r8>>2]=r4;HEAP32[r3]=0;return}else{___assert_func(5254684,115,5257228,5254044)}}function __ZN8b2IslandC2EiiiP16b2StackAllocatorP17b2ContactListener(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r7=r1>>2;r8=(r1+40|0)>>2;HEAP32[r8]=r2;HEAP32[r7+11]=r3;HEAP32[r7+12]=r4;HEAP32[r7+7]=0;HEAP32[r7+9]=0;HEAP32[r7+8]=0;r9=(r1|0)>>2;HEAP32[r9]=r5;HEAP32[r7+1]=r6;r6=r2<<2;r2=(r5+102796|0)>>2;r10=HEAP32[r2];if((r10|0)>=32){___assert_func(5247660,38,5259284,5249184)}r11=(r5+(r10*12&-1)+102412|0)>>2;HEAP32[r5+(r10*12&-1)+102416>>2]=r6;r12=(r5+102400|0)>>2;r13=HEAP32[r12];if((r13+r6|0)>102400){HEAP32[r11]=_malloc(r6);HEAP8[r5+(r10*12&-1)+102420|0]=1}else{HEAP32[r11]=r5+r13|0;HEAP8[r5+(r10*12&-1)+102420|0]=0;HEAP32[r12]=HEAP32[r12]+r6|0}r12=r5+102404|0;r10=HEAP32[r12>>2]+r6|0;HEAP32[r12>>2]=r10;r12=r5+102408|0;r5=HEAP32[r12>>2];HEAP32[r12>>2]=(r5|0)>(r10|0)?r5:r10;HEAP32[r2]=HEAP32[r2]+1|0;HEAP32[r7+2]=HEAP32[r11];r11=HEAP32[r9];r2=r3<<2;r3=(r11+102796|0)>>2;r10=HEAP32[r3];if((r10|0)>=32){___assert_func(5247660,38,5259284,5249184)}r5=(r11+(r10*12&-1)+102412|0)>>2;HEAP32[r11+(r10*12&-1)+102416>>2]=r2;r12=(r11+102400|0)>>2;r6=HEAP32[r12];if((r6+r2|0)>102400){HEAP32[r5]=_malloc(r2);HEAP8[r11+(r10*12&-1)+102420|0]=1}else{HEAP32[r5]=r11+r6|0;HEAP8[r11+(r10*12&-1)+102420|0]=0;HEAP32[r12]=HEAP32[r12]+r2|0}r12=r11+102404|0;r10=HEAP32[r12>>2]+r2|0;HEAP32[r12>>2]=r10;r12=r11+102408|0;r11=HEAP32[r12>>2];HEAP32[r12>>2]=(r11|0)>(r10|0)?r11:r10;HEAP32[r3]=HEAP32[r3]+1|0;HEAP32[r7+3]=HEAP32[r5];r5=HEAP32[r9];r3=r4<<2;r4=(r5+102796|0)>>2;r10=HEAP32[r4];if((r10|0)>=32){___assert_func(5247660,38,5259284,5249184)}r11=(r5+(r10*12&-1)+102412|0)>>2;HEAP32[r5+(r10*12&-1)+102416>>2]=r3;r12=(r5+102400|0)>>2;r2=HEAP32[r12];if((r2+r3|0)>102400){HEAP32[r11]=_malloc(r3);HEAP8[r5+(r10*12&-1)+102420|0]=1}else{HEAP32[r11]=r5+r2|0;HEAP8[r5+(r10*12&-1)+102420|0]=0;HEAP32[r12]=HEAP32[r12]+r3|0}r12=r5+102404|0;r10=HEAP32[r12>>2]+r3|0;HEAP32[r12>>2]=r10;r12=r5+102408|0;r5=HEAP32[r12>>2];HEAP32[r12>>2]=(r5|0)>(r10|0)?r5:r10;HEAP32[r4]=HEAP32[r4]+1|0;HEAP32[r7+4]=HEAP32[r11];r11=HEAP32[r9];r4=HEAP32[r8]*12&-1;r10=(r11+102796|0)>>2;r5=HEAP32[r10];if((r5|0)>=32){___assert_func(5247660,38,5259284,5249184)}r12=(r11+(r5*12&-1)+102412|0)>>2;HEAP32[r11+(r5*12&-1)+102416>>2]=r4;r3=(r11+102400|0)>>2;r2=HEAP32[r3];if((r2+r4|0)>102400){HEAP32[r12]=_malloc(r4);HEAP8[r11+(r5*12&-1)+102420|0]=1}else{HEAP32[r12]=r11+r2|0;HEAP8[r11+(r5*12&-1)+102420|0]=0;HEAP32[r3]=HEAP32[r3]+r4|0}r3=r11+102404|0;r5=HEAP32[r3>>2]+r4|0;HEAP32[r3>>2]=r5;r3=r11+102408|0;r11=HEAP32[r3>>2];HEAP32[r3>>2]=(r11|0)>(r5|0)?r11:r5;HEAP32[r10]=HEAP32[r10]+1|0;HEAP32[r7+6]=HEAP32[r12];r12=HEAP32[r9];r9=HEAP32[r8]*12&-1;r8=(r12+102796|0)>>2;r7=HEAP32[r8];if((r7|0)>=32){___assert_func(5247660,38,5259284,5249184)}r10=r12+(r7*12&-1)+102412|0;HEAP32[r12+(r7*12&-1)+102416>>2]=r9;r5=(r12+102400|0)>>2;r11=HEAP32[r5];if((r11+r9|0)>102400){HEAP32[r10>>2]=_malloc(r9);HEAP8[r12+(r7*12&-1)+102420|0]=1;r3=r12+102404|0,r4=r3>>2;r2=HEAP32[r4];r6=r2+r9|0;HEAP32[r4]=r6;r13=r12+102408|0,r14=r13>>2;r15=HEAP32[r14];r16=(r15|0)>(r6|0);r17=r16?r15:r6;HEAP32[r14]=r17;r18=HEAP32[r8];r19=r18+1|0;HEAP32[r8]=r19;r20=r10|0;r21=HEAP32[r20>>2];r22=r21;r23=r1+20|0;HEAP32[r23>>2]=r22;return}else{HEAP32[r10>>2]=r12+r11|0;HEAP8[r12+(r7*12&-1)+102420|0]=0;HEAP32[r5]=HEAP32[r5]+r9|0;r3=r12+102404|0,r4=r3>>2;r2=HEAP32[r4];r6=r2+r9|0;HEAP32[r4]=r6;r13=r12+102408|0,r14=r13>>2;r15=HEAP32[r14];r16=(r15|0)>(r6|0);r17=r16?r15:r6;HEAP32[r14]=r17;r18=HEAP32[r8];r19=r18+1|0;HEAP32[r8]=r19;r20=r10|0;r21=HEAP32[r20>>2];r22=r21;r23=r1+20|0;HEAP32[r23>>2]=r22;return}}function __ZN8b2Island5SolveEP9b2ProfileRK10b2TimeStepRK6b2Vec2b(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r6=STACKTOP;STACKTOP=STACKTOP+148|0;r7=r6;r8=r6+20;r9=r6+52,r10=r9>>2;r11=r6+96,r12=r11>>2;r13=HEAPF32[r3>>2];r14=(r1+28|0)>>2;L2114:do{if((HEAP32[r14]|0)>0){r15=r1+8|0;r16=r4|0;r17=r4+4|0;r18=r1+20|0;r19=r1+24|0;r20=0;while(1){r21=HEAP32[HEAP32[r15>>2]+(r20<<2)>>2],r22=r21>>2;r23=r21+44|0;r24=HEAP32[r23>>2];r25=HEAP32[r23+4>>2];r23=HEAPF32[r22+14];r26=r21+64|0;r27=HEAP32[r26+4>>2];r28=(HEAP32[tempDoublePtr>>2]=HEAP32[r26>>2],HEAPF32[tempDoublePtr>>2]);r26=(HEAP32[tempDoublePtr>>2]=r27,HEAPF32[tempDoublePtr>>2]);r27=HEAPF32[r22+18];r29=r21+36|0;HEAP32[r29>>2]=r24;HEAP32[r29+4>>2]=r25;HEAPF32[r22+13]=r23;if((HEAP32[r22]|0)==2){r29=HEAPF32[r22+35];r21=HEAPF32[r22+30];r30=1-r13*HEAPF32[r22+33];r31=r30<1?r30:1;r30=r31<0?0:r31;r31=1-r13*HEAPF32[r22+34];r32=r31<1?r31:1;r33=(r27+r13*HEAPF32[r22+32]*HEAPF32[r22+21])*(r32<0?0:r32);r34=(r28+r13*(r29*HEAPF32[r16>>2]+r21*HEAPF32[r22+19]))*r30;r35=(r26+r13*(r29*HEAPF32[r17>>2]+r21*HEAPF32[r22+20]))*r30}else{r33=r27;r34=r28;r35=r26}r26=HEAP32[r18>>2]+(r20*12&-1)|0;HEAP32[r26>>2]=r24;HEAP32[r26+4>>2]=r25;HEAPF32[HEAP32[r18>>2]+(r20*12&-1)+8>>2]=r23;r23=HEAP32[r19>>2]+(r20*12&-1)|0;r25=(HEAPF32[tempDoublePtr>>2]=r34,HEAP32[tempDoublePtr>>2]);r26=(HEAPF32[tempDoublePtr>>2]=r35,HEAP32[tempDoublePtr>>2])|0;HEAP32[r23>>2]=0|r25;HEAP32[r23+4>>2]=r26;HEAPF32[HEAP32[r19>>2]+(r20*12&-1)+8>>2]=r33;r26=r20+1|0;if((r26|0)<(HEAP32[r14]|0)){r20=r26}else{r36=r18,r37=r36>>2;r38=r19,r39=r38>>2;break L2114}}}else{r36=r1+20|0,r37=r36>>2;r38=r1+24|0,r39=r38>>2}}while(0);r38=r8>>2;r36=r3>>2;HEAP32[r38]=HEAP32[r36];HEAP32[r38+1]=HEAP32[r36+1];HEAP32[r38+2]=HEAP32[r36+2];HEAP32[r38+3]=HEAP32[r36+3];HEAP32[r38+4]=HEAP32[r36+4];HEAP32[r38+5]=HEAP32[r36+5];r38=HEAP32[r37];HEAP32[r8+24>>2]=r38;r33=HEAP32[r39];HEAP32[r8+28>>2]=r33;r35=r9>>2;HEAP32[r35]=HEAP32[r36];HEAP32[r35+1]=HEAP32[r36+1];HEAP32[r35+2]=HEAP32[r36+2];HEAP32[r35+3]=HEAP32[r36+3];HEAP32[r35+4]=HEAP32[r36+4];HEAP32[r35+5]=HEAP32[r36+5];r36=r1+12|0;HEAP32[r10+6]=HEAP32[r36>>2];r35=(r1+36|0)>>2;HEAP32[r10+7]=HEAP32[r35];HEAP32[r10+8]=r38;HEAP32[r10+9]=r33;HEAP32[r10+10]=HEAP32[r1>>2];__ZN15b2ContactSolverC2EP18b2ContactSolverDef(r11,r9);__ZN15b2ContactSolver29InitializeVelocityConstraintsEv(r11);if((HEAP8[r3+20|0]&1)<<24>>24!=0){__ZN15b2ContactSolver9WarmStartEv(r11)}r9=(r1+32|0)>>2;L2127:do{if((HEAP32[r9]|0)>0){r10=r1+16|0;r33=0;while(1){r38=HEAP32[HEAP32[r10>>2]+(r33<<2)>>2];FUNCTION_TABLE[HEAP32[HEAP32[r38>>2]+28>>2]](r38,r8);r38=r33+1|0;if((r38|0)<(HEAP32[r9]|0)){r33=r38}else{break L2127}}}}while(0);HEAPF32[r2+12>>2]=0;r33=r3+12|0;L2133:do{if((HEAP32[r33>>2]|0)>0){r10=r1+16|0;r38=0;while(1){L2137:do{if((HEAP32[r9]|0)>0){r34=0;while(1){r4=HEAP32[HEAP32[r10>>2]+(r34<<2)>>2];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+32>>2]](r4,r8);r4=r34+1|0;if((r4|0)<(HEAP32[r9]|0)){r34=r4}else{break L2137}}}}while(0);__ZN15b2ContactSolver24SolveVelocityConstraintsEv(r11);r34=r38+1|0;if((r34|0)<(HEAP32[r33>>2]|0)){r38=r34}else{break L2133}}}}while(0);r33=HEAP32[r12+12];L2144:do{if((r33|0)>0){r38=HEAP32[r12+10],r10=r38>>2;r34=HEAP32[r12+11];r4=0;while(1){r19=HEAP32[r34+(HEAP32[((r4*152&-1)+148>>2)+r10]<<2)>>2];r18=r38+(r4*152&-1)+144|0;L2148:do{if((HEAP32[r18>>2]|0)>0){r20=0;while(1){HEAPF32[r19+(r20*20&-1)+72>>2]=HEAPF32[((r4*152&-1)+(r20*36&-1)+16>>2)+r10];HEAPF32[r19+(r20*20&-1)+76>>2]=HEAPF32[((r4*152&-1)+(r20*36&-1)+20>>2)+r10];r17=r20+1|0;if((r17|0)<(HEAP32[r18>>2]|0)){r20=r17}else{break L2148}}}}while(0);r18=r4+1|0;if((r18|0)<(r33|0)){r4=r18}else{break L2144}}}}while(0);HEAPF32[r2+16>>2]=0;L2153:do{if((HEAP32[r14]|0)>0){r33=0;while(1){r4=HEAP32[r37];r10=(r4+(r33*12&-1)|0)>>2;r38=HEAP32[r10+1];r34=(HEAP32[tempDoublePtr>>2]=HEAP32[r10],HEAPF32[tempDoublePtr>>2]);r18=(HEAP32[tempDoublePtr>>2]=r38,HEAPF32[tempDoublePtr>>2]);r38=HEAPF32[r4+(r33*12&-1)+8>>2];r4=HEAP32[r39];r19=r4+(r33*12&-1)|0;r20=HEAP32[r19+4>>2];r17=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAPF32[tempDoublePtr>>2]);r19=(HEAP32[tempDoublePtr>>2]=r20,HEAPF32[tempDoublePtr>>2]);r20=HEAPF32[r4+(r33*12&-1)+8>>2];r4=r13*r17;r16=r13*r19;r15=r4*r4+r16*r16;if(r15>4){r16=2/Math.sqrt(r15);r40=r17*r16;r41=r19*r16}else{r40=r17;r41=r19}r19=r13*r20;if(r19*r19>2.4674012660980225){if(r19>0){r42=r19}else{r42=-r19}r43=r20*(1.5707963705062866/r42)}else{r43=r20}r20=(HEAPF32[tempDoublePtr>>2]=r34+r13*r40,HEAP32[tempDoublePtr>>2]);r34=(HEAPF32[tempDoublePtr>>2]=r18+r13*r41,HEAP32[tempDoublePtr>>2])|0;HEAP32[r10]=0|r20;HEAP32[r10+1]=r34;HEAPF32[HEAP32[r37]+(r33*12&-1)+8>>2]=r38+r13*r43;r38=HEAP32[r39]+(r33*12&-1)|0;r34=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2]);r10=(HEAPF32[tempDoublePtr>>2]=r41,HEAP32[tempDoublePtr>>2])|0;HEAP32[r38>>2]=0|r34;HEAP32[r38+4>>2]=r10;HEAPF32[HEAP32[r39]+(r33*12&-1)+8>>2]=r43;r10=r33+1|0;if((r10|0)<(HEAP32[r14]|0)){r33=r10}else{break L2153}}}}while(0);r43=r3+16|0;r3=r1+16|0;r41=0;while(1){if((r41|0)>=(HEAP32[r43>>2]|0)){r44=1;break}r40=__ZN15b2ContactSolver24SolvePositionConstraintsEv(r11);L2170:do{if((HEAP32[r9]|0)>0){r42=1;r33=0;while(1){r10=HEAP32[HEAP32[r3>>2]+(r33<<2)>>2];r38=r42&FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+36>>2]](r10,r8);r10=r33+1|0;if((r10|0)<(HEAP32[r9]|0)){r42=r38;r33=r10}else{r45=r38;break L2170}}}else{r45=1}}while(0);if(r40&r45){r44=0;break}else{r41=r41+1|0}}L2176:do{if((HEAP32[r14]|0)>0){r41=r1+8|0;r45=0;while(1){r9=HEAP32[HEAP32[r41>>2]+(r45<<2)>>2],r8=r9>>2;r3=HEAP32[r37]+(r45*12&-1)|0;r43=r9+44|0;r33=HEAP32[r3>>2];r42=HEAP32[r3+4>>2];HEAP32[r43>>2]=r33;HEAP32[r43+4>>2]=r42;r43=HEAPF32[HEAP32[r37]+(r45*12&-1)+8>>2];HEAPF32[r8+14]=r43;r3=HEAP32[r39]+(r45*12&-1)|0;r38=r9+64|0;r10=HEAP32[r3+4>>2];HEAP32[r38>>2]=HEAP32[r3>>2];HEAP32[r38+4>>2]=r10;HEAPF32[r8+18]=HEAPF32[HEAP32[r39]+(r45*12&-1)+8>>2];r10=Math.sin(r43);HEAPF32[r8+5]=r10;r38=Math.cos(r43);HEAPF32[r8+6]=r38;r43=HEAPF32[r8+7];r3=HEAPF32[r8+8];r8=(HEAP32[tempDoublePtr>>2]=r33,HEAPF32[tempDoublePtr>>2])-(r38*r43-r10*r3);r33=(HEAP32[tempDoublePtr>>2]=r42,HEAPF32[tempDoublePtr>>2])-(r10*r43+r38*r3);r3=r9+12|0;r9=(HEAPF32[tempDoublePtr>>2]=r8,HEAP32[tempDoublePtr>>2]);r8=(HEAPF32[tempDoublePtr>>2]=r33,HEAP32[tempDoublePtr>>2])|0;HEAP32[r3>>2]=0|r9;HEAP32[r3+4>>2]=r8;r8=r45+1|0;if((r8|0)<(HEAP32[r14]|0)){r45=r8}else{break L2176}}}}while(0);HEAPF32[r2+20>>2]=0;r2=HEAP32[r12+10],r12=r2>>2;r39=r1+4|0;L2181:do{if((HEAP32[r39>>2]|0)!=0){if((HEAP32[r35]|0)<=0){break}r37=r7+16|0;r45=0;while(1){r41=HEAP32[HEAP32[r36>>2]+(r45<<2)>>2];r40=HEAP32[((r45*152&-1)+144>>2)+r12];HEAP32[r37>>2]=r40;L2186:do{if((r40|0)>0){r8=0;while(1){HEAPF32[r7+(r8<<2)>>2]=HEAPF32[((r45*152&-1)+(r8*36&-1)+16>>2)+r12];HEAPF32[r7+(r8<<2)+8>>2]=HEAPF32[((r45*152&-1)+(r8*36&-1)+20>>2)+r12];r3=r8+1|0;if((r3|0)==(r40|0)){break L2186}else{r8=r3}}}}while(0);r40=HEAP32[r39>>2];FUNCTION_TABLE[HEAP32[HEAP32[r40>>2]+20>>2]](r40,r41,r7);r40=r45+1|0;if((r40|0)<(HEAP32[r35]|0)){r45=r40}else{break L2181}}}}while(0);if(!r5){r46=r11+32|0,r47=r46>>2;r48=HEAP32[r47];r49=r2;__ZN16b2StackAllocator4FreeEPv(r48,r49);r50=r11+36|0,r51=r50>>2;r52=HEAP32[r51];r53=r52;__ZN16b2StackAllocator4FreeEPv(r48,r53);STACKTOP=r6;return}r5=HEAP32[r14];L2195:do{if((r5|0)>0){r35=r1+8|0;r7=3.4028234663852886e+38;r39=0;while(1){r12=HEAP32[HEAP32[r35>>2]+(r39<<2)>>2];L2199:do{if((HEAP32[r12>>2]|0)==0){r54=r7}else{do{if((HEAP16[r12+4>>1]&4)<<16>>16!=0){r36=HEAPF32[r12+72>>2];if(r36*r36>.001218469929881394){break}r36=HEAPF32[r12+64>>2];r45=HEAPF32[r12+68>>2];if(r36*r36+r45*r45>9999999747378752e-20){break}r45=r12+144|0;r36=r13+HEAPF32[r45>>2];HEAPF32[r45>>2]=r36;r54=r7<r36?r7:r36;break L2199}}while(0);HEAPF32[r12+144>>2]=0;r54=0}}while(0);r12=r39+1|0;r41=HEAP32[r14];if((r12|0)<(r41|0)){r7=r54;r39=r12}else{r55=r54;r56=r41;break L2195}}}else{r55=3.4028234663852886e+38;r56=r5}}while(0);if(!((r56|0)>0&((r55<.5|r44)^1))){r46=r11+32|0,r47=r46>>2;r48=HEAP32[r47];r49=r2;__ZN16b2StackAllocator4FreeEPv(r48,r49);r50=r11+36|0,r51=r50>>2;r52=HEAP32[r51];r53=r52;__ZN16b2StackAllocator4FreeEPv(r48,r53);STACKTOP=r6;return}r44=r1+8|0;r1=0;while(1){r55=HEAP32[HEAP32[r44>>2]+(r1<<2)>>2];r56=r55+4|0;HEAP16[r56>>1]=HEAP16[r56>>1]&-3;HEAPF32[r55+144>>2]=0;r56=(r55+64|0)>>2;HEAP32[r56]=0;HEAP32[r56+1]=0;HEAP32[r56+2]=0;HEAP32[r56+3]=0;HEAP32[r56+4]=0;HEAP32[r56+5]=0;r56=r1+1|0;if((r56|0)<(HEAP32[r14]|0)){r1=r56}else{break}}r46=r11+32|0,r47=r46>>2;r48=HEAP32[r47];r49=r2;__ZN16b2StackAllocator4FreeEPv(r48,r49);r50=r11+36|0,r51=r50>>2;r52=HEAP32[r51];r53=r52;__ZN16b2StackAllocator4FreeEPv(r48,r53);STACKTOP=r6;return}function __ZN8b2Island8SolveTOIERK10b2TimeStepii(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35;r5=STACKTOP;STACKTOP=STACKTOP+116|0;r6=r5;r7=r5+20,r8=r7>>2;r9=r5+64;r10=(r1+28|0)>>2;r11=HEAP32[r10];if((r11|0)<=(r3|0)){___assert_func(5253276,386,5257500,5254808)}if((r11|0)<=(r4|0)){___assert_func(5253276,387,5257500,5252248)}L2221:do{if((r11|0)>0){r12=r1+8|0;r13=r1+20|0;r14=r1+24|0;r15=0;while(1){r16=HEAP32[HEAP32[r12>>2]+(r15<<2)>>2];r17=r16+44|0;r18=HEAP32[r13>>2]+(r15*12&-1)|0;r19=HEAP32[r17+4>>2];HEAP32[r18>>2]=HEAP32[r17>>2];HEAP32[r18+4>>2]=r19;HEAPF32[HEAP32[r13>>2]+(r15*12&-1)+8>>2]=HEAPF32[r16+56>>2];r19=r16+64|0;r18=HEAP32[r14>>2]+(r15*12&-1)|0;r17=HEAP32[r19+4>>2];HEAP32[r18>>2]=HEAP32[r19>>2];HEAP32[r18+4>>2]=r17;HEAPF32[HEAP32[r14>>2]+(r15*12&-1)+8>>2]=HEAPF32[r16+72>>2];r16=r15+1|0;if((r16|0)<(HEAP32[r10]|0)){r15=r16}else{r20=r13,r21=r20>>2;r22=r14,r23=r22>>2;break L2221}}}else{r20=r1+20|0,r21=r20>>2;r22=r1+24|0,r23=r22>>2}}while(0);r22=r1+12|0;HEAP32[r8+6]=HEAP32[r22>>2];r20=(r1+36|0)>>2;HEAP32[r8+7]=HEAP32[r20];HEAP32[r8+10]=HEAP32[r1>>2];r11=r7>>2;r14=r2>>2;HEAP32[r11]=HEAP32[r14];HEAP32[r11+1]=HEAP32[r14+1];HEAP32[r11+2]=HEAP32[r14+2];HEAP32[r11+3]=HEAP32[r14+3];HEAP32[r11+4]=HEAP32[r14+4];HEAP32[r11+5]=HEAP32[r14+5];HEAP32[r8+8]=HEAP32[r21];HEAP32[r8+9]=HEAP32[r23];__ZN15b2ContactSolverC2EP18b2ContactSolverDef(r9,r7);r7=r2+16|0;r8=0;while(1){if((r8|0)>=(HEAP32[r7>>2]|0)){break}if(__ZN15b2ContactSolver27SolveTOIPositionConstraintsEii(r9,r3,r4)){break}else{r8=r8+1|0}}r8=(r1+8|0)>>2;r7=HEAP32[r21]+(r3*12&-1)|0;r14=HEAP32[HEAP32[r8]+(r3<<2)>>2]+36|0;r11=HEAP32[r7+4>>2];HEAP32[r14>>2]=HEAP32[r7>>2];HEAP32[r14+4>>2]=r11;HEAPF32[HEAP32[HEAP32[r8]+(r3<<2)>>2]+52>>2]=HEAPF32[HEAP32[r21]+(r3*12&-1)+8>>2];r3=HEAP32[r21]+(r4*12&-1)|0;r11=HEAP32[HEAP32[r8]+(r4<<2)>>2]+36|0;r14=HEAP32[r3+4>>2];HEAP32[r11>>2]=HEAP32[r3>>2];HEAP32[r11+4>>2]=r14;HEAPF32[HEAP32[HEAP32[r8]+(r4<<2)>>2]+52>>2]=HEAPF32[HEAP32[r21]+(r4*12&-1)+8>>2];__ZN15b2ContactSolver29InitializeVelocityConstraintsEv(r9);r4=r2+12|0;L2233:do{if((HEAP32[r4>>2]|0)>0){r14=0;while(1){__ZN15b2ContactSolver24SolveVelocityConstraintsEv(r9);r11=r14+1|0;if((r11|0)<(HEAP32[r4>>2]|0)){r14=r11}else{break L2233}}}}while(0);r4=HEAPF32[r2>>2];L2238:do{if((HEAP32[r10]|0)>0){r2=0;while(1){r14=HEAP32[r21];r11=(r14+(r2*12&-1)|0)>>2;r3=HEAP32[r11+1];r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r11],HEAPF32[tempDoublePtr>>2]);r13=(HEAP32[tempDoublePtr>>2]=r3,HEAPF32[tempDoublePtr>>2]);r3=HEAPF32[r14+(r2*12&-1)+8>>2];r14=HEAP32[r23];r15=r14+(r2*12&-1)|0;r12=HEAP32[r15+4>>2];r16=(HEAP32[tempDoublePtr>>2]=HEAP32[r15>>2],HEAPF32[tempDoublePtr>>2]);r15=(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=HEAPF32[r14+(r2*12&-1)+8>>2];r14=r4*r16;r17=r4*r15;r18=r14*r14+r17*r17;if(r18>4){r17=2/Math.sqrt(r18);r24=r16*r17;r25=r15*r17}else{r24=r16;r25=r15}r15=r4*r12;if(r15*r15>2.4674012660980225){if(r15>0){r26=r15}else{r26=-r15}r27=r12*(1.5707963705062866/r26)}else{r27=r12}r12=r7+r4*r24;r7=r13+r4*r25;r13=r3+r4*r27;r3=0|(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r15=(HEAPF32[tempDoublePtr>>2]=r7,HEAP32[tempDoublePtr>>2])|0;HEAP32[r11]=r3;HEAP32[r11+1]=r15;HEAPF32[HEAP32[r21]+(r2*12&-1)+8>>2]=r13;r11=HEAP32[r23]+(r2*12&-1)|0;r16=0|(HEAPF32[tempDoublePtr>>2]=r24,HEAP32[tempDoublePtr>>2]);r17=(HEAPF32[tempDoublePtr>>2]=r25,HEAP32[tempDoublePtr>>2])|0;HEAP32[r11>>2]=r16;HEAP32[r11+4>>2]=r17;HEAPF32[HEAP32[r23]+(r2*12&-1)+8>>2]=r27;r11=HEAP32[HEAP32[r8]+(r2<<2)>>2],r18=r11>>2;r14=r11+44|0;HEAP32[r14>>2]=r3;HEAP32[r14+4>>2]=r15;HEAPF32[r18+14]=r13;r15=r11+64|0;HEAP32[r15>>2]=r16;HEAP32[r15+4>>2]=r17;HEAPF32[r18+18]=r27;r17=Math.sin(r13);HEAPF32[r18+5]=r17;r15=Math.cos(r13);HEAPF32[r18+6]=r15;r13=HEAPF32[r18+7];r16=HEAPF32[r18+8];r18=r11+12|0;r11=(HEAPF32[tempDoublePtr>>2]=r12-(r15*r13-r17*r16),HEAP32[tempDoublePtr>>2]);r12=(HEAPF32[tempDoublePtr>>2]=r7-(r17*r13+r15*r16),HEAP32[tempDoublePtr>>2])|0;HEAP32[r18>>2]=0|r11;HEAP32[r18+4>>2]=r12;r12=r2+1|0;if((r12|0)<(HEAP32[r10]|0)){r2=r12}else{break L2238}}}}while(0);r10=HEAP32[r9+40>>2],r27=r10>>2;r8=r1+4|0;if((HEAP32[r8>>2]|0)==0){r28=r9+32|0,r29=r28>>2;r30=HEAP32[r29];r31=r10;__ZN16b2StackAllocator4FreeEPv(r30,r31);r32=r9+36|0,r33=r32>>2;r34=HEAP32[r33];r35=r34;__ZN16b2StackAllocator4FreeEPv(r30,r35);STACKTOP=r5;return}if((HEAP32[r20]|0)<=0){r28=r9+32|0,r29=r28>>2;r30=HEAP32[r29];r31=r10;__ZN16b2StackAllocator4FreeEPv(r30,r31);r32=r9+36|0,r33=r32>>2;r34=HEAP32[r33];r35=r34;__ZN16b2StackAllocator4FreeEPv(r30,r35);STACKTOP=r5;return}r1=r6+16|0;r23=0;while(1){r25=HEAP32[HEAP32[r22>>2]+(r23<<2)>>2];r24=HEAP32[((r23*152&-1)+144>>2)+r27];HEAP32[r1>>2]=r24;L2259:do{if((r24|0)>0){r21=0;while(1){HEAPF32[r6+(r21<<2)>>2]=HEAPF32[((r23*152&-1)+(r21*36&-1)+16>>2)+r27];HEAPF32[r6+(r21<<2)+8>>2]=HEAPF32[((r23*152&-1)+(r21*36&-1)+20>>2)+r27];r4=r21+1|0;if((r4|0)==(r24|0)){break L2259}else{r21=r4}}}}while(0);r24=HEAP32[r8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+20>>2]](r24,r25,r6);r24=r23+1|0;if((r24|0)<(HEAP32[r20]|0)){r23=r24}else{break}}r28=r9+32|0,r29=r28>>2;r30=HEAP32[r29];r31=r10;__ZN16b2StackAllocator4FreeEPv(r30,r31);r32=r9+36|0,r33=r32>>2;r34=HEAP32[r33];r35=r34;__ZN16b2StackAllocator4FreeEPv(r30,r35);STACKTOP=r5;return}function __ZN7b2WorldC2ERK6b2Vec2(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r3=r1>>2;r4=0;r5=r1|0;r6=r1+8|0;HEAP32[r6>>2]=128;HEAP32[r3+1]=0;r7=_malloc(1024);HEAP32[r3]=r7;_memset(r7,0,HEAP32[r6>>2]<<3);_memset(r1+12|0,0,56);do{if((HEAP8[5263848]&1)<<24>>24==0){r6=0;r7=1;while(1){if((r6|0)>=14){r4=1732;break}if((r7|0)>(HEAP32[(r6<<2)+5264496>>2]|0)){r8=r6+1|0;HEAP8[r7+5263852|0]=r8&255;r9=r8}else{HEAP8[r7+5263852|0]=r6&255;r9=r6}r8=r7+1|0;if((r8|0)<641){r6=r9;r7=r8}else{r4=1737;break}}if(r4==1732){___assert_func(5248148,73,5259604,5253464)}else if(r4==1737){HEAP8[5263848]=1;break}}}while(0);HEAP32[r3+25617]=0;HEAP32[r3+25618]=0;HEAP32[r3+25619]=0;HEAP32[r3+25716]=0;__ZN12b2BroadPhaseC2Ev(r1+102872|0);HEAP32[r3+25733]=0;HEAP32[r3+25734]=0;HEAP32[r3+25735]=5247056;HEAP32[r3+25736]=5247052;r4=r1+102948|0;HEAP32[r3+25745]=0;HEAP32[r3+25746]=0;r9=r4>>2;HEAP32[r9]=0;HEAP32[r9+1]=0;HEAP32[r9+2]=0;HEAP32[r9+3]=0;HEAP32[r9+4]=0;HEAP8[r1+102992|0]=1;HEAP8[r1+102993|0]=1;HEAP8[r1+102994|0]=0;HEAP8[r1+102995|0]=1;HEAP8[r1+102976|0]=1;r9=r2;r2=r1+102968|0;r7=HEAP32[r9+4>>2];HEAP32[r2>>2]=HEAP32[r9>>2];HEAP32[r2+4>>2]=r7;HEAP32[r3+25717]=4;HEAPF32[r3+25747]=0;HEAP32[r4>>2]=r5;_memset(r1+102996|0,0,32);return}function __ZN7b2WorldD2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=r1>>2;r3=HEAP32[r2+25738];L2279:do{if((r3|0)!=0){r4=r1|0;r5=r3;while(1){r6=HEAP32[r5+96>>2];r7=HEAP32[r5+100>>2];while(1){if((r7|0)==0){break}r8=HEAP32[r7+4>>2];HEAP32[r7+28>>2]=0;__ZN9b2Fixture7DestroyEP16b2BlockAllocator(r7,r4);r7=r8}if((r6|0)==0){break L2279}else{r5=r6}}}}while(0);_free(HEAP32[r2+25726]);_free(HEAP32[r2+25729]);_free(HEAP32[r2+25719]);if((HEAP32[r2+25617]|0)!=0){___assert_func(5247660,32,5259244,5253168)}if((HEAP32[r2+25716]|0)!=0){___assert_func(5247660,33,5259244,5250624)}r2=r1+4|0;r3=r1|0;r1=HEAP32[r3>>2];if((HEAP32[r2>>2]|0)>0){r9=0;r10=r1}else{r11=r1;r12=r11;_free(r12);return}while(1){_free(HEAP32[r10+(r9<<3)+4>>2]);r1=r9+1|0;r5=HEAP32[r3>>2];if((r1|0)<(HEAP32[r2>>2]|0)){r9=r1;r10=r5}else{r11=r5;break}}r12=r11;_free(r12);return}function __ZN7b2World11DestroyBodyEP6b2Body(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r3=0;r4=(r1+102960|0)>>2;if((HEAP32[r4]|0)<=0){___assert_func(5253128,133,5257856,5252232)}if((HEAP32[r1+102868>>2]&2|0)!=0){___assert_func(5253128,134,5257856,5254788)}r5=(r2+108|0)>>2;r6=HEAP32[r5];L2308:do{if((r6|0)!=0){r7=r1+102980|0;r8=r6;while(1){r9=HEAP32[r8+12>>2];r10=HEAP32[r7>>2];if((r10|0)==0){r11=r8+4|0}else{r12=r8+4|0;FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+8>>2]](r10,HEAP32[r12>>2]);r11=r12}__ZN7b2World12DestroyJointEP7b2Joint(r1,HEAP32[r11>>2]);HEAP32[r5]=r9;if((r9|0)==0){break L2308}else{r8=r9}}}}while(0);HEAP32[r5]=0;r5=r2+112|0;r11=HEAP32[r5>>2];L2317:do{if((r11|0)!=0){r6=r1+102872|0;r8=r11;while(1){r7=HEAP32[r8+12>>2];__ZN16b2ContactManager7DestroyEP9b2Contact(r6,HEAP32[r8+4>>2]);if((r7|0)==0){break L2317}else{r8=r7}}}}while(0);HEAP32[r5>>2]=0;r5=(r2+100|0)>>2;r11=HEAP32[r5];L2322:do{if((r11|0)==0){r13=r2+104|0}else{r8=r1+102980|0;r6=r1+102912|0;r7=r1+102904|0;r9=r1+102900|0;r12=r1+102872|0;r10=r1|0;r14=r2+104|0;r15=r11;while(1){r16=HEAP32[r15+4>>2];r17=HEAP32[r8>>2];if((r17|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+12>>2]](r17,r15)}r17=(r15+28|0)>>2;L2330:do{if((HEAP32[r17]|0)>0){r18=r15+24|0;r19=0;while(1){r20=HEAP32[r18>>2]+(r19*28&-1)+24|0;r21=HEAP32[r20>>2];r22=HEAP32[r6>>2];r23=0;while(1){if((r23|0)>=(r22|0)){break}r24=(r23<<2)+HEAP32[r7>>2]|0;if((HEAP32[r24>>2]|0)==(r21|0)){r3=1790;break}else{r23=r23+1|0}}if(r3==1790){r3=0;HEAP32[r24>>2]=-1}HEAP32[r9>>2]=HEAP32[r9>>2]-1|0;__ZN13b2DynamicTree12DestroyProxyEi(r12,r21);HEAP32[r20>>2]=-1;r23=r19+1|0;if((r23|0)<(HEAP32[r17]|0)){r19=r23}else{break L2330}}}}while(0);HEAP32[r17]=0;__ZN9b2Fixture7DestroyEP16b2BlockAllocator(r15,r10);r19=HEAP8[5263896];if((r19&255)>=14){break}r18=((r19&255)<<2)+r1+12|0;HEAP32[r15>>2]=HEAP32[r18>>2];HEAP32[r18>>2]=r15;HEAP32[r5]=r16;HEAP32[r14>>2]=HEAP32[r14>>2]-1|0;if((r16|0)==0){r13=r14;break L2322}else{r15=r16}}___assert_func(5248148,173,5259684,5249276)}}while(0);HEAP32[r5]=0;HEAP32[r13>>2]=0;r13=r2+92|0;r5=HEAP32[r13>>2];r24=(r2+96|0)>>2;if((r5|0)!=0){HEAP32[r5+96>>2]=HEAP32[r24]}r5=HEAP32[r24];if((r5|0)!=0){HEAP32[r5+92>>2]=HEAP32[r13>>2]}r13=r1+102952|0;if((HEAP32[r13>>2]|0)==(r2|0)){HEAP32[r13>>2]=HEAP32[r24]}HEAP32[r4]=HEAP32[r4]-1|0;r4=HEAP8[5264004];if((r4&255)<14){r24=((r4&255)<<2)+r1+12|0;HEAP32[r2>>2]=HEAP32[r24>>2];HEAP32[r24>>2]=r2;return}else{___assert_func(5248148,173,5259684,5249276)}}function __ZN7b2World12DestroyJointEP7b2Joint(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;if((HEAP32[r1+102868>>2]&2|0)!=0){___assert_func(5253128,274,5257816,5254788)}r3=HEAP8[r2+61|0]&1;r4=r2+8|0;r5=HEAP32[r4>>2];r6=(r2+12|0)>>2;if((r5|0)!=0){HEAP32[r5+12>>2]=HEAP32[r6]}r5=HEAP32[r6];if((r5|0)!=0){HEAP32[r5+8>>2]=HEAP32[r4>>2]}r4=r1+102956|0;if((HEAP32[r4>>2]|0)==(r2|0)){HEAP32[r4>>2]=HEAP32[r6]}r6=HEAP32[r2+48>>2];r4=HEAP32[r2+52>>2];r5=r6+4|0;r7=HEAP16[r5>>1];if((r7&2)<<16>>16==0){HEAP16[r5>>1]=r7|2;HEAPF32[r6+144>>2]=0}r7=r4+4|0;r5=HEAP16[r7>>1];if((r5&2)<<16>>16==0){HEAP16[r7>>1]=r5|2;HEAPF32[r4+144>>2]=0}r5=(r2+24|0)>>2;r7=HEAP32[r5];r8=(r2+28|0)>>2;if((r7|0)!=0){HEAP32[r7+12>>2]=HEAP32[r8]}r7=HEAP32[r8];if((r7|0)!=0){HEAP32[r7+8>>2]=HEAP32[r5]}r7=r6+108|0;if((r2+16|0)==(HEAP32[r7>>2]|0)){HEAP32[r7>>2]=HEAP32[r8]}HEAP32[r5]=0;HEAP32[r8]=0;r8=(r2+40|0)>>2;r5=HEAP32[r8];r7=(r2+44|0)>>2;if((r5|0)!=0){HEAP32[r5+12>>2]=HEAP32[r7]}r5=HEAP32[r7];if((r5|0)!=0){HEAP32[r5+8>>2]=HEAP32[r8]}r5=r4+108|0;if((r2+32|0)==(HEAP32[r5>>2]|0)){HEAP32[r5>>2]=HEAP32[r7]}HEAP32[r8]=0;HEAP32[r7]=0;__ZN7b2Joint7DestroyEPS_P16b2BlockAllocator(r2,r1|0);r2=r1+102964|0;r1=HEAP32[r2>>2];if((r1|0)<=0){___assert_func(5253128,346,5257816,5249932)}HEAP32[r2>>2]=r1-1|0;if(r3<<24>>24!=0){return}r3=HEAP32[r4+112>>2];if((r3|0)==0){return}else{r9=r3,r10=r9>>2}while(1){if((HEAP32[r10]|0)==(r6|0)){r3=HEAP32[r10+1]+4|0;HEAP32[r3>>2]=HEAP32[r3>>2]|8}r3=HEAP32[r10+3];if((r3|0)==0){break}else{r9=r3,r10=r9>>2}}return}function __ZN7b2World11CreateJointEPK10b2JointDef(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;if((HEAP32[r1+102868>>2]&2|0)!=0){___assert_func(5253128,214,5257892,5254788)}r3=__ZN7b2Joint6CreateEPK10b2JointDefP16b2BlockAllocator(r2,r1|0),r4=r3>>2;HEAP32[r4+2]=0;r5=(r1+102956|0)>>2;HEAP32[r4+3]=HEAP32[r5];r6=HEAP32[r5];if((r6|0)!=0){HEAP32[r6+8>>2]=r3}HEAP32[r5]=r3;r5=r1+102964|0;HEAP32[r5>>2]=HEAP32[r5>>2]+1|0;r5=r3+16|0;HEAP32[r4+5]=r3;r1=(r3+52|0)>>2;HEAP32[r5>>2]=HEAP32[r1];HEAP32[r4+6]=0;r6=(r3+48|0)>>2;r7=HEAP32[r6];r8=r7+108|0;HEAP32[r4+7]=HEAP32[r8>>2];r9=HEAP32[r8>>2];if((r9|0)==0){r10=r7}else{HEAP32[r9+8>>2]=r5;r10=HEAP32[r6]}HEAP32[r10+108>>2]=r5;r5=r3+32|0;HEAP32[r4+9]=r3;HEAP32[r5>>2]=HEAP32[r6];HEAP32[r4+10]=0;r6=HEAP32[r1];r10=r6+108|0;HEAP32[r4+11]=HEAP32[r10>>2];r4=HEAP32[r10>>2];if((r4|0)==0){r11=r6}else{HEAP32[r4+8>>2]=r5;r11=HEAP32[r1]}HEAP32[r11+108>>2]=r5;r5=HEAP32[r2+8>>2];if((HEAP8[r2+16|0]&1)<<24>>24!=0){return r3}r11=HEAP32[HEAP32[r2+12>>2]+112>>2];if((r11|0)==0){return r3}else{r12=r11,r13=r12>>2}while(1){if((HEAP32[r13]|0)==(r5|0)){r11=HEAP32[r13+1]+4|0;HEAP32[r11>>2]=HEAP32[r11>>2]|8}r11=HEAP32[r13+3];if((r11|0)==0){break}else{r12=r11,r13=r12>>2}}return r3}function __ZN7b2World5SolveERK10b2TimeStep(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55;r3=r1>>2;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+100|0;r6=r5;r7=r5+16,r8=r7>>2;r9=r5+68;r10=(r1+103008|0)>>2;HEAPF32[r10]=0;r11=(r1+103012|0)>>2;HEAPF32[r11]=0;r12=(r1+103016|0)>>2;HEAPF32[r12]=0;r13=r1+102960|0;r14=r1+102872|0;r15=r1+68|0;__ZN8b2IslandC2EiiiP16b2StackAllocatorP17b2ContactListener(r7,HEAP32[r13>>2],HEAP32[r3+25734],HEAP32[r3+25741],r15,HEAP32[r3+25736]);r16=(r1+102952|0)>>2;r17=HEAP32[r16];L2432:do{if((r17|0)!=0){r18=r17;while(1){r19=r18+4|0;HEAP16[r19>>1]=HEAP16[r19>>1]&-2;r19=HEAP32[r18+96>>2];if((r19|0)==0){break L2432}else{r18=r19}}}}while(0);r17=HEAP32[r3+25733];L2436:do{if((r17|0)!=0){r18=r17;while(1){r19=r18+4|0;HEAP32[r19>>2]=HEAP32[r19>>2]&-2;r19=HEAP32[r18+12>>2];if((r19|0)==0){break L2436}else{r18=r19}}}}while(0);r17=HEAP32[r3+25739];L2440:do{if((r17|0)!=0){r18=r17;while(1){HEAP8[r18+60|0]=0;r19=HEAP32[r18+12>>2];if((r19|0)==0){break L2440}else{r18=r19}}}}while(0);r17=HEAP32[r13>>2];r13=r17<<2;r18=(r1+102864|0)>>2;r19=HEAP32[r18];if((r19|0)>=32){___assert_func(5247660,38,5259284,5249184)}r20=(r1+(r19*12&-1)+102480|0)>>2;HEAP32[((r19*12&-1)+102484>>2)+r3]=r13;r21=(r1+102468|0)>>2;r22=HEAP32[r21];if((r22+r13|0)>102400){HEAP32[r20]=_malloc(r13);HEAP8[r1+(r19*12&-1)+102488|0]=1}else{HEAP32[r20]=r1+(r22+68)|0;HEAP8[r1+(r19*12&-1)+102488|0]=0;HEAP32[r21]=HEAP32[r21]+r13|0}r21=r1+102472|0;r19=HEAP32[r21>>2]+r13|0;HEAP32[r21>>2]=r19;r21=r1+102476|0;r13=HEAP32[r21>>2];HEAP32[r21>>2]=(r13|0)>(r19|0)?r13:r19;HEAP32[r18]=HEAP32[r18]+1|0;r18=HEAP32[r20];r20=r18>>2;r19=HEAP32[r16];L2452:do{if((r19|0)!=0){r13=(r7+28|0)>>2;r21=(r7+36|0)>>2;r22=(r7+32|0)>>2;r23=r7+40|0;r24=r7+8|0;r25=r7+48|0;r26=r7+16|0;r27=r7+44|0;r28=r7+12|0;r29=r1+102968|0;r30=r1+102976|0;r31=r9+12|0;r32=r9+16|0;r33=r9+20|0;r34=r19;L2454:while(1){r35=(r34+4|0)>>1;L2456:do{if((HEAP16[r35]&35)<<16>>16==34){if((HEAP32[r34>>2]|0)==0){break}HEAP32[r13]=0;HEAP32[r21]=0;HEAP32[r22]=0;HEAP32[r20]=r34;HEAP16[r35]=HEAP16[r35]|1;r36=1;while(1){r37=r36-1|0;r38=HEAP32[(r37<<2>>2)+r20],r39=r38>>2;r40=(r38+4|0)>>1;if((HEAP16[r40]&32)<<16>>16==0){r4=1882;break L2454}r41=HEAP32[r13];if((r41|0)>=(HEAP32[r23>>2]|0)){r4=1885;break L2454}HEAP32[r39+2]=r41;HEAP32[HEAP32[r24>>2]+(HEAP32[r13]<<2)>>2]=r38;HEAP32[r13]=HEAP32[r13]+1|0;r38=HEAP16[r40];if((r38&2)<<16>>16==0){HEAP16[r40]=r38|2;HEAPF32[r39+36]=0}L2466:do{if((HEAP32[r39]|0)==0){r42=r37}else{r38=HEAP32[r39+28];L2468:do{if((r38|0)==0){r43=r37}else{r40=r37;r41=r38,r44=r41>>2;while(1){r45=HEAP32[r44+1];r46=(r45+4|0)>>2;do{if((HEAP32[r46]&7|0)==6){if((HEAP8[HEAP32[r45+48>>2]+38|0]&1)<<24>>24!=0){r47=r40;break}if((HEAP8[HEAP32[r45+52>>2]+38|0]&1)<<24>>24!=0){r47=r40;break}r48=HEAP32[r21];if((r48|0)>=(HEAP32[r27>>2]|0)){r4=1896;break L2454}HEAP32[r21]=r48+1|0;HEAP32[HEAP32[r28>>2]+(r48<<2)>>2]=r45;HEAP32[r46]=HEAP32[r46]|1;r48=HEAP32[r44];r49=(r48+4|0)>>1;if((HEAP16[r49]&1)<<16>>16!=0){r47=r40;break}if((r40|0)>=(r17|0)){r4=1900;break L2454}HEAP32[(r40<<2>>2)+r20]=r48;HEAP16[r49]=HEAP16[r49]|1;r47=r40+1|0}else{r47=r40}}while(0);r46=HEAP32[r44+3];if((r46|0)==0){r43=r47;break L2468}else{r40=r47;r41=r46,r44=r41>>2}}}}while(0);r38=HEAP32[r39+27];if((r38|0)==0){r42=r43;break}else{r50=r43;r51=r38}while(1){r38=r51+4|0;r41=HEAP32[r38>>2];do{if((HEAP8[r41+60|0]&1)<<24>>24==0){r44=HEAP32[r51>>2];r40=(r44+4|0)>>1;if((HEAP16[r40]&32)<<16>>16==0){r52=r50;break}r46=HEAP32[r22];if((r46|0)>=(HEAP32[r25>>2]|0)){r4=1908;break L2454}HEAP32[r22]=r46+1|0;HEAP32[HEAP32[r26>>2]+(r46<<2)>>2]=r41;HEAP8[HEAP32[r38>>2]+60|0]=1;if((HEAP16[r40]&1)<<16>>16!=0){r52=r50;break}if((r50|0)>=(r17|0)){r4=1912;break L2454}HEAP32[(r50<<2>>2)+r20]=r44;HEAP16[r40]=HEAP16[r40]|1;r52=r50+1|0}else{r52=r50}}while(0);r38=HEAP32[r51+12>>2];if((r38|0)==0){r42=r52;break L2466}else{r50=r52;r51=r38}}}}while(0);if((r42|0)>0){r36=r42}else{break}}__ZN8b2Island5SolveEP9b2ProfileRK10b2TimeStepRK6b2Vec2b(r7,r9,r2,r29,(HEAP8[r30]&1)<<24>>24!=0);HEAPF32[r10]=HEAPF32[r31>>2]+HEAPF32[r10];HEAPF32[r11]=HEAPF32[r32>>2]+HEAPF32[r11];HEAPF32[r12]=HEAPF32[r33>>2]+HEAPF32[r12];r36=HEAP32[r13];if((r36|0)>0){r53=0;r54=r36}else{break}while(1){r36=HEAP32[HEAP32[r24>>2]+(r53<<2)>>2];if((HEAP32[r36>>2]|0)==0){r39=r36+4|0;HEAP16[r39>>1]=HEAP16[r39>>1]&-2;r55=HEAP32[r13]}else{r55=r54}r39=r53+1|0;if((r39|0)<(r55|0)){r53=r39;r54=r55}else{break L2456}}}}while(0);r35=HEAP32[r34+96>>2];if((r35|0)==0){break L2452}else{r34=r35}}if(r4==1908){___assert_func(5251208,68,5257592,5250932)}else if(r4==1900){___assert_func(5253128,495,5257776,5248524)}else if(r4==1896){___assert_func(5251208,62,5257560,5250704)}else if(r4==1882){___assert_func(5253128,445,5257776,5249004)}else if(r4==1912){___assert_func(5253128,524,5257776,5248524)}else if(r4==1885){___assert_func(5251208,54,5257624,5250440)}}}while(0);__ZN16b2StackAllocator4FreeEPv(r15,r18);r18=HEAP32[r16];L2513:do{if((r18|0)!=0){r16=r6+8|0;r15=r6+12|0;r4=r6;r55=r18;while(1){L2517:do{if((HEAP16[r55+4>>1]&1)<<16>>16!=0){if((HEAP32[r55>>2]|0)==0){break}r54=HEAPF32[r55+52>>2];r53=Math.sin(r54);HEAPF32[r16>>2]=r53;r12=Math.cos(r54);HEAPF32[r15>>2]=r12;r54=HEAPF32[r55+28>>2];r11=HEAPF32[r55+32>>2];r10=HEAPF32[r55+40>>2]-(r53*r54+r12*r11);r2=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r55+36>>2]-(r12*r54-r53*r11),HEAP32[tempDoublePtr>>2]);r11=(HEAPF32[tempDoublePtr>>2]=r10,HEAP32[tempDoublePtr>>2])|0;HEAP32[r4>>2]=0|r2;HEAP32[r4+4>>2]=r11;r11=HEAP32[r55+88>>2]+102872|0;r2=HEAP32[r55+100>>2];if((r2|0)==0){break}r10=r55+12|0;r53=r2;while(1){__ZN9b2Fixture11SynchronizeEP12b2BroadPhaseRK11b2TransformS4_(r53,r11,r6,r10);r2=HEAP32[r53+4>>2];if((r2|0)==0){break L2517}else{r53=r2}}}}while(0);r53=HEAP32[r55+96>>2];if((r53|0)==0){break L2513}else{r55=r53}}}}while(0);__ZN12b2BroadPhase11UpdatePairsI16b2ContactManagerEEvPT_(r14|0,r14);HEAPF32[r3+25755]=0;r3=(r7|0)>>2;__ZN16b2StackAllocator4FreeEPv(HEAP32[r3],HEAP32[r8+5]);__ZN16b2StackAllocator4FreeEPv(HEAP32[r3],HEAP32[r8+6]);__ZN16b2StackAllocator4FreeEPv(HEAP32[r3],HEAP32[r8+4]);__ZN16b2StackAllocator4FreeEPv(HEAP32[r3],HEAP32[r8+3]);__ZN16b2StackAllocator4FreeEPv(HEAP32[r3],HEAP32[r8+2]);STACKTOP=r5;return}function __ZN7b2World8SolveTOIERK10b2TimeStep(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+348|0;r5=r4;r6=r4+16;r7=r4+68;r8=r4+200;r9=r4+208;r10=r4+244;r11=r4+280;r12=r4+288;r13=r4+324;r14=r1+102872|0;r15=(r1+102944|0)>>2;__ZN8b2IslandC2EiiiP16b2StackAllocatorP17b2ContactListener(r6,64,32,0,r1+68|0,HEAP32[r15]);r16=r1+102995|0;L2528:do{if((HEAP8[r16]&1)<<24>>24==0){r17=r1+102932|0}else{r18=HEAP32[r1+102952>>2];L2530:do{if((r18|0)!=0){r19=r18;while(1){r20=r19+4|0;HEAP16[r20>>1]=HEAP16[r20>>1]&-2;HEAPF32[r19+60>>2]=0;r20=HEAP32[r19+96>>2];if((r20|0)==0){break L2530}else{r19=r20}}}}while(0);r18=r1+102932|0;r19=HEAP32[r18>>2];if((r19|0)==0){r17=r18;break}else{r21=r19,r22=r21>>2}while(1){r19=r21+4|0;HEAP32[r19>>2]=HEAP32[r19>>2]&-34;HEAP32[r22+32]=0;HEAPF32[r22+33]=1;r19=HEAP32[r22+3];if((r19|0)==0){r17=r18;break L2528}else{r21=r19,r22=r21>>2}}}}while(0);r21=r9;r9=r10;r10=(r6+28|0)>>2;r22=(r6+36|0)>>2;r18=r6+32|0;r19=r6+40|0;r20=(r6+8|0)>>2;r23=r6+44|0;r24=(r6+12|0)>>2;r25=r11|0;r26=r11+4|0;r27=r12;r12=r2|0;r28=r13|0;r29=r13+4|0;r30=r13+8|0;r31=r13+16|0;r32=r2+12|0;r2=r13+12|0;r33=r13+20|0;r34=r14|0;r35=r1+102994|0;r1=r5+8|0;r36=r5+12|0;r37=r5;r38=r7+16|0;r39=r7+20|0;r40=r7+24|0;r41=r7+44|0;r42=r7+48|0;r43=r7+52|0;r44=r7|0;r45=r7+28|0;r46=r7+56|0;r47=r7+92|0;r48=r7+128|0;r49=r8|0;r50=r8+4|0;L2538:while(1){r51=HEAP32[r17>>2];if((r51|0)==0){r52=1;r3=2064;break}else{r53=1;r54=0;r55=r51,r56=r55>>2}while(1){r51=(r55+4|0)>>2;r57=HEAP32[r51];do{if((r57&4|0)==0){r58=r54;r59=r53}else{if((HEAP32[r56+32]|0)>8){r58=r54;r59=r53;break}if((r57&32|0)==0){r60=HEAP32[r56+12];r61=HEAP32[r56+13];if((HEAP8[r60+38|0]&1)<<24>>24!=0){r58=r54;r59=r53;break}if((HEAP8[r61+38|0]&1)<<24>>24!=0){r58=r54;r59=r53;break}r62=HEAP32[r60+8>>2];r63=HEAP32[r61+8>>2];r64=HEAP32[r62>>2];r65=HEAP32[r63>>2];if(!((r64|0)==2|(r65|0)==2)){r3=1961;break L2538}r66=HEAP16[r62+4>>1];r67=HEAP16[r63+4>>1];if(!((r66&2)<<16>>16!=0&(r64|0)!=0|(r67&2)<<16>>16!=0&(r65|0)!=0)){r58=r54;r59=r53;break}if(!((r66&8)<<16>>16!=0|(r64|0)!=2|((r67&8)<<16>>16!=0|(r65|0)!=2))){r58=r54;r59=r53;break}r65=r62+28|0;r67=r62+60|0;r64=HEAPF32[r67>>2];r66=r63+28|0;r68=r63+60|0;r69=HEAPF32[r68>>2];do{if(r64<r69){if(r64>=1){r3=1967;break L2538}r70=(r69-r64)/(1-r64);r71=r62+36|0;r72=1-r70;r73=r72*HEAPF32[r62+40>>2]+r70*HEAPF32[r62+48>>2];r74=r71;r75=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r71>>2]*r72+r70*HEAPF32[r62+44>>2],HEAP32[tempDoublePtr>>2]);r71=(HEAPF32[tempDoublePtr>>2]=r73,HEAP32[tempDoublePtr>>2])|0;HEAP32[r74>>2]=0|r75;HEAP32[r74+4>>2]=r71;r71=r62+52|0;HEAPF32[r71>>2]=r72*HEAPF32[r71>>2]+r70*HEAPF32[r62+56>>2];HEAPF32[r67>>2]=r69;r76=r69}else{if(r69>=r64){r76=r64;break}if(r69>=1){r3=1972;break L2538}r70=(r64-r69)/(1-r69);r71=r63+36|0;r72=1-r70;r74=r72*HEAPF32[r63+40>>2]+r70*HEAPF32[r63+48>>2];r75=r71;r73=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r71>>2]*r72+r70*HEAPF32[r63+44>>2],HEAP32[tempDoublePtr>>2]);r71=(HEAPF32[tempDoublePtr>>2]=r74,HEAP32[tempDoublePtr>>2])|0;HEAP32[r75>>2]=0|r73;HEAP32[r75+4>>2]=r71;r71=r63+52|0;HEAPF32[r71>>2]=r72*HEAPF32[r71>>2]+r70*HEAPF32[r63+56>>2];HEAPF32[r68>>2]=r64;r76=r64}}while(0);if(r76>=1){r3=1976;break L2538}r64=HEAP32[r56+14];r68=HEAP32[r56+15];HEAP32[r38>>2]=0;HEAP32[r39>>2]=0;HEAPF32[r40>>2]=0;HEAP32[r41>>2]=0;HEAP32[r42>>2]=0;HEAPF32[r43>>2]=0;__ZN15b2DistanceProxy3SetEPK7b2Shapei(r44,HEAP32[r60+12>>2],r64);__ZN15b2DistanceProxy3SetEPK7b2Shapei(r45,HEAP32[r61+12>>2],r68);_memcpy(r46,r65,36);_memcpy(r47,r66,36);HEAPF32[r48>>2]=1;__Z14b2TimeOfImpactP11b2TOIOutputPK10b2TOIInput(r8,r7);if((HEAP32[r49>>2]|0)==3){r68=r76+(1-r76)*HEAPF32[r50>>2];r77=r68<1?r68:1}else{r77=1}HEAPF32[r56+33]=r77;HEAP32[r51]=HEAP32[r51]|32;r78=r77}else{r78=HEAPF32[r56+33]}if(r78>=r53){r58=r54;r59=r53;break}r58=r55;r59=r78}}while(0);r51=HEAP32[r56+3];if((r51|0)==0){break}else{r53=r59;r54=r58;r55=r51,r56=r55>>2}}if((r58|0)==0|r59>.9999988079071045){r52=1;r3=2063;break}r51=HEAP32[HEAP32[r58+48>>2]+8>>2];r57=HEAP32[HEAP32[r58+52>>2]+8>>2];r68=r51+28|0;_memcpy(r21,r68,36);r64=r57+28|0;_memcpy(r9,r64,36);r63=r51+60|0;r69=HEAPF32[r63>>2];if(r69>=1){r3=1989;break}r67=(r59-r69)/(1-r69);r69=r51+36|0;r62=1-r67;r70=r51+44|0;r71=r51+48|0;r72=HEAPF32[r69>>2]*r62+r67*HEAPF32[r70>>2];r75=r62*HEAPF32[r51+40>>2]+r67*HEAPF32[r71>>2];r73=r69;r69=0|(HEAPF32[tempDoublePtr>>2]=r72,HEAP32[tempDoublePtr>>2]);r74=(HEAPF32[tempDoublePtr>>2]=r75,HEAP32[tempDoublePtr>>2])|0;HEAP32[r73>>2]=r69;HEAP32[r73+4>>2]=r74;r73=r51+52|0;r79=(r51+56|0)>>2;r80=r62*HEAPF32[r73>>2]+r67*HEAPF32[r79];HEAPF32[r73>>2]=r80;HEAPF32[r63>>2]=r59;r63=r51+44|0;HEAP32[r63>>2]=r69;HEAP32[r63+4>>2]=r74;HEAPF32[r79]=r80;r74=Math.sin(r80);r63=r51+20|0;HEAPF32[r63>>2]=r74;r69=Math.cos(r80);r80=r51+24|0;HEAPF32[r80>>2]=r69;r73=r51+28|0;r67=HEAPF32[r73>>2];r62=r51+32|0;r81=HEAPF32[r62>>2];r82=(r51+12|0)>>2;r83=(HEAPF32[tempDoublePtr>>2]=r72-(r69*r67-r74*r81),HEAP32[tempDoublePtr>>2]);r72=(HEAPF32[tempDoublePtr>>2]=r75-(r74*r67+r69*r81),HEAP32[tempDoublePtr>>2])|0;HEAP32[r82]=0|r83;HEAP32[r82+1]=r72;r72=r57+60|0;r83=HEAPF32[r72>>2];if(r83>=1){r3=1992;break}r81=(r59-r83)/(1-r83);r83=r57+36|0;r69=1-r81;r67=r57+44|0;r74=r57+48|0;r75=HEAPF32[r83>>2]*r69+r81*HEAPF32[r67>>2];r84=r69*HEAPF32[r57+40>>2]+r81*HEAPF32[r74>>2];r85=r83;r83=0|(HEAPF32[tempDoublePtr>>2]=r75,HEAP32[tempDoublePtr>>2]);r86=(HEAPF32[tempDoublePtr>>2]=r84,HEAP32[tempDoublePtr>>2])|0;HEAP32[r85>>2]=r83;HEAP32[r85+4>>2]=r86;r85=r57+52|0;r87=(r57+56|0)>>2;r88=r69*HEAPF32[r85>>2]+r81*HEAPF32[r87];HEAPF32[r85>>2]=r88;HEAPF32[r72>>2]=r59;r72=r57+44|0;HEAP32[r72>>2]=r83;HEAP32[r72+4>>2]=r86;HEAPF32[r87]=r88;r86=Math.sin(r88);r72=r57+20|0;HEAPF32[r72>>2]=r86;r83=Math.cos(r88);r88=r57+24|0;HEAPF32[r88>>2]=r83;r85=r57+28|0;r81=HEAPF32[r85>>2];r69=r57+32|0;r89=HEAPF32[r69>>2];r90=(r57+12|0)>>2;r91=(HEAPF32[tempDoublePtr>>2]=r75-(r83*r81-r86*r89),HEAP32[tempDoublePtr>>2]);r75=(HEAPF32[tempDoublePtr>>2]=r84-(r86*r81+r83*r89),HEAP32[tempDoublePtr>>2])|0;HEAP32[r90]=0|r91;HEAP32[r90+1]=r75;__ZN9b2Contact6UpdateEP17b2ContactListener(r58,HEAP32[r15]);r75=(r58+4|0)>>2;r91=HEAP32[r75];HEAP32[r75]=r91&-33;r89=r58+128|0;HEAP32[r89>>2]=HEAP32[r89>>2]+1|0;if((r91&6|0)!=6){HEAP32[r75]=r91&-37;_memcpy(r68,r21,36);_memcpy(r64,r9,36);r64=HEAPF32[r79];r79=Math.sin(r64);HEAPF32[r63>>2]=r79;r63=Math.cos(r64);HEAPF32[r80>>2]=r63;r80=HEAPF32[r73>>2];r73=HEAPF32[r62>>2];r62=HEAPF32[r71>>2]-(r79*r80+r63*r73);r71=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r70>>2]-(r63*r80-r79*r73),HEAP32[tempDoublePtr>>2]);r73=(HEAPF32[tempDoublePtr>>2]=r62,HEAP32[tempDoublePtr>>2])|0;HEAP32[r82]=0|r71;HEAP32[r82+1]=r73;r73=HEAPF32[r87];r87=Math.sin(r73);HEAPF32[r72>>2]=r87;r72=Math.cos(r73);HEAPF32[r88>>2]=r72;r88=HEAPF32[r85>>2];r85=HEAPF32[r69>>2];r69=HEAPF32[r74>>2]-(r87*r88+r72*r85);r74=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r67>>2]-(r72*r88-r87*r85),HEAP32[tempDoublePtr>>2]);r85=(HEAPF32[tempDoublePtr>>2]=r69,HEAP32[tempDoublePtr>>2])|0;HEAP32[r90]=0|r74;HEAP32[r90+1]=r85;continue}r85=(r51+4|0)>>1;r90=HEAP16[r85];if((r90&2)<<16>>16==0){HEAP16[r85]=r90|2;HEAPF32[r51+144>>2]=0}r90=(r57+4|0)>>1;r74=HEAP16[r90];if((r74&2)<<16>>16==0){HEAP16[r90]=r74|2;HEAPF32[r57+144>>2]=0}HEAP32[r10]=0;HEAP32[r22]=0;HEAP32[r18>>2]=0;r74=HEAP32[r19>>2];if((r74|0)<=0){r3=2002;break}r69=r51+8|0;HEAP32[r69>>2]=0;r87=HEAP32[r20];HEAP32[r87>>2]=r51;HEAP32[r10]=1;if((r74|0)<=1){r3=2005;break}r74=r57+8|0;HEAP32[r74>>2]=1;HEAP32[r87+4>>2]=r57;HEAP32[r10]=2;if((HEAP32[r23>>2]|0)<=0){r3=2008;break}HEAP32[r22]=1;HEAP32[HEAP32[r24]>>2]=r58;HEAP16[r85]=HEAP16[r85]|1;HEAP16[r90]=HEAP16[r90]|1;HEAP32[r75]=HEAP32[r75]|1;HEAP32[r25>>2]=r51;HEAP32[r26>>2]=r57;r57=1;r75=r51;while(1){L2589:do{if((HEAP32[r75>>2]|0)==2){r51=HEAP32[r75+112>>2];if((r51|0)==0){break}r90=r75+4|0;r85=HEAP32[r19>>2];r87=r51,r51=r87>>2;r88=HEAP32[r10];while(1){if((r88|0)==(r85|0)){break L2589}r72=HEAP32[r22];r67=HEAP32[r23>>2];if((r72|0)==(r67|0)){break L2589}r73=HEAP32[r51+1];r82=(r73+4|0)>>2;L2596:do{if((HEAP32[r82]&1|0)==0){r71=HEAP32[r51];r62=r71|0;do{if((HEAP32[r62>>2]|0)==2){if((HEAP16[r90>>1]&8)<<16>>16!=0){break}if((HEAP16[r71+4>>1]&8)<<16>>16==0){r92=r88;break L2596}}}while(0);if((HEAP8[HEAP32[r73+48>>2]+38|0]&1)<<24>>24!=0){r92=r88;break}if((HEAP8[HEAP32[r73+52>>2]+38|0]&1)<<24>>24!=0){r92=r88;break}r79=r71+28|0;_memcpy(r27,r79,36);r80=(r71+4|0)>>1;if((HEAP16[r80]&1)<<16>>16==0){r63=r71+60|0;r70=HEAPF32[r63>>2];if(r70>=1){r3=2024;break L2538}r64=(r59-r70)/(1-r70);r70=r71+36|0;r68=1-r64;r91=HEAPF32[r70>>2]*r68+r64*HEAPF32[r71+44>>2];r89=r68*HEAPF32[r71+40>>2]+r64*HEAPF32[r71+48>>2];r83=r70;r70=0|(HEAPF32[tempDoublePtr>>2]=r91,HEAP32[tempDoublePtr>>2]);r81=(HEAPF32[tempDoublePtr>>2]=r89,HEAP32[tempDoublePtr>>2])|0;HEAP32[r83>>2]=r70;HEAP32[r83+4>>2]=r81;r83=r71+52|0;r86=r71+56|0;r84=r68*HEAPF32[r83>>2]+r64*HEAPF32[r86>>2];HEAPF32[r83>>2]=r84;HEAPF32[r63>>2]=r59;r63=r71+44|0;HEAP32[r63>>2]=r70;HEAP32[r63+4>>2]=r81;HEAPF32[r86>>2]=r84;r86=Math.sin(r84);HEAPF32[r71+20>>2]=r86;r81=Math.cos(r84);HEAPF32[r71+24>>2]=r81;r84=HEAPF32[r71+28>>2];r63=HEAPF32[r71+32>>2];r70=r71+12|0;r83=(HEAPF32[tempDoublePtr>>2]=r91-(r81*r84-r86*r63),HEAP32[tempDoublePtr>>2]);r91=(HEAPF32[tempDoublePtr>>2]=r89-(r86*r84+r81*r63),HEAP32[tempDoublePtr>>2])|0;HEAP32[r70>>2]=0|r83;HEAP32[r70+4>>2]=r91}__ZN9b2Contact6UpdateEP17b2ContactListener(r73,HEAP32[r15]);r91=HEAP32[r82];if((r91&4|0)==0){_memcpy(r79,r27,36);r70=HEAPF32[r71+56>>2];r83=Math.sin(r70);HEAPF32[r71+20>>2]=r83;r63=Math.cos(r70);HEAPF32[r71+24>>2]=r63;r70=HEAPF32[r71+28>>2];r81=HEAPF32[r71+32>>2];r84=HEAPF32[r71+48>>2]-(r83*r70+r63*r81);r86=r71+12|0;r89=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r71+44>>2]-(r63*r70-r83*r81),HEAP32[tempDoublePtr>>2]);r81=(HEAPF32[tempDoublePtr>>2]=r84,HEAP32[tempDoublePtr>>2])|0;HEAP32[r86>>2]=0|r89;HEAP32[r86+4>>2]=r81;r92=r88;break}if((r91&2|0)==0){_memcpy(r79,r27,36);r79=HEAPF32[r71+56>>2];r81=Math.sin(r79);HEAPF32[r71+20>>2]=r81;r86=Math.cos(r79);HEAPF32[r71+24>>2]=r86;r79=HEAPF32[r71+28>>2];r89=HEAPF32[r71+32>>2];r84=HEAPF32[r71+48>>2]-(r81*r79+r86*r89);r83=r71+12|0;r70=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r71+44>>2]-(r86*r79-r81*r89),HEAP32[tempDoublePtr>>2]);r89=(HEAPF32[tempDoublePtr>>2]=r84,HEAP32[tempDoublePtr>>2])|0;HEAP32[r83>>2]=0|r70;HEAP32[r83+4>>2]=r89;r92=r88;break}HEAP32[r82]=r91|1;if((r72|0)>=(r67|0)){r3=2033;break L2538}HEAP32[r22]=r72+1|0;HEAP32[HEAP32[r24]+(r72<<2)>>2]=r73;r91=HEAP16[r80];if((r91&1)<<16>>16!=0){r92=r88;break}HEAP16[r80]=r91|1;do{if((HEAP32[r62>>2]|0)!=0){if((r91&2)<<16>>16!=0){break}HEAP16[r80]=r91|3;HEAPF32[r71+144>>2]=0}}while(0);if((r88|0)>=(r85|0)){r3=2040;break L2538}HEAP32[r71+8>>2]=r88;HEAP32[HEAP32[r20]+(r88<<2)>>2]=r71;r91=r88+1|0;HEAP32[r10]=r91;r92=r91}else{r92=r88}}while(0);r73=HEAP32[r51+3];if((r73|0)==0){break L2589}else{r87=r73,r51=r87>>2;r88=r92}}}}while(0);if((r57|0)>=2){break}r88=HEAP32[r11+(r57<<2)>>2];r57=r57+1|0;r75=r88}r75=(1-r59)*HEAPF32[r12>>2];HEAPF32[r28>>2]=r75;HEAPF32[r29>>2]=1/r75;HEAPF32[r30>>2]=1;HEAP32[r31>>2]=20;HEAP32[r2>>2]=HEAP32[r32>>2];HEAP8[r33]=0;__ZN8b2Island8SolveTOIERK10b2TimeStepii(r6,r13,HEAP32[r69>>2],HEAP32[r74>>2]);r75=HEAP32[r10];L2627:do{if((r75|0)>0){r57=HEAP32[r20];r88=0;while(1){r87=HEAP32[r57+(r88<<2)>>2],r51=r87>>2;r85=r87+4|0;HEAP16[r85>>1]=HEAP16[r85>>1]&-2;L2631:do{if((HEAP32[r51]|0)==2){r85=HEAPF32[r51+13];r90=Math.sin(r85);HEAPF32[r1>>2]=r90;r66=Math.cos(r85);HEAPF32[r36>>2]=r66;r85=HEAPF32[r51+7];r65=HEAPF32[r51+8];r61=HEAPF32[r51+10]-(r90*r85+r66*r65);r60=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r51+9]-(r66*r85-r90*r65),HEAP32[tempDoublePtr>>2]);r65=(HEAPF32[tempDoublePtr>>2]=r61,HEAP32[tempDoublePtr>>2])|0;HEAP32[r37>>2]=0|r60;HEAP32[r37+4>>2]=r65;r65=HEAP32[r51+22]+102872|0;r60=HEAP32[r51+25];L2633:do{if((r60|0)!=0){r61=r87+12|0;r90=r60;while(1){__ZN9b2Fixture11SynchronizeEP12b2BroadPhaseRK11b2TransformS4_(r90,r65,r5,r61);r85=HEAP32[r90+4>>2];if((r85|0)==0){break L2633}else{r90=r85}}}}while(0);r65=HEAP32[r51+28];if((r65|0)==0){break}else{r93=r65}while(1){r65=HEAP32[r93+4>>2]+4|0;HEAP32[r65>>2]=HEAP32[r65>>2]&-34;r65=HEAP32[r93+12>>2];if((r65|0)==0){break L2631}else{r93=r65}}}}while(0);r51=r88+1|0;if((r51|0)<(r75|0)){r88=r51}else{break L2627}}}}while(0);__ZN12b2BroadPhase11UpdatePairsI16b2ContactManagerEEvPT_(r34,r14);if((HEAP8[r35]&1)<<24>>24!=0){r52=0;r3=2062;break}}if(r3==2008){___assert_func(5251208,62,5257560,5250704)}else if(r3==2002){___assert_func(5251208,54,5257624,5250440)}else if(r3==2033){___assert_func(5251208,62,5257560,5250704)}else if(r3==1961){___assert_func(5253128,641,5257732,5248024)}else if(r3==2005){___assert_func(5251208,54,5257624,5250440)}else if(r3==2062){HEAP8[r16]=r52;r35=r6|0,r14=r35>>2;r34=HEAP32[r14];r93=r6+20|0,r5=r93>>2;r37=HEAP32[r5];r36=r37;__ZN16b2StackAllocator4FreeEPv(r34,r36);r1=HEAP32[r14];r10=r6+24|0,r13=r10>>2;r33=HEAP32[r13];r32=r33;__ZN16b2StackAllocator4FreeEPv(r1,r32);r2=HEAP32[r14];r31=r6+16|0,r30=r31>>2;r29=HEAP32[r30];r28=r29;__ZN16b2StackAllocator4FreeEPv(r2,r28);r12=HEAP32[r14];r59=HEAP32[r24];r11=r59;__ZN16b2StackAllocator4FreeEPv(r12,r11);r92=HEAP32[r20];r22=r92;__ZN16b2StackAllocator4FreeEPv(r12,r22);STACKTOP=r4;return}else if(r3==2063){HEAP8[r16]=r52;r35=r6|0,r14=r35>>2;r34=HEAP32[r14];r93=r6+20|0,r5=r93>>2;r37=HEAP32[r5];r36=r37;__ZN16b2StackAllocator4FreeEPv(r34,r36);r1=HEAP32[r14];r10=r6+24|0,r13=r10>>2;r33=HEAP32[r13];r32=r33;__ZN16b2StackAllocator4FreeEPv(r1,r32);r2=HEAP32[r14];r31=r6+16|0,r30=r31>>2;r29=HEAP32[r30];r28=r29;__ZN16b2StackAllocator4FreeEPv(r2,r28);r12=HEAP32[r14];r59=HEAP32[r24];r11=r59;__ZN16b2StackAllocator4FreeEPv(r12,r11);r92=HEAP32[r20];r22=r92;__ZN16b2StackAllocator4FreeEPv(r12,r22);STACKTOP=r4;return}else if(r3==2064){HEAP8[r16]=r52;r35=r6|0,r14=r35>>2;r34=HEAP32[r14];r93=r6+20|0,r5=r93>>2;r37=HEAP32[r5];r36=r37;__ZN16b2StackAllocator4FreeEPv(r34,r36);r1=HEAP32[r14];r10=r6+24|0,r13=r10>>2;r33=HEAP32[r13];r32=r33;__ZN16b2StackAllocator4FreeEPv(r1,r32);r2=HEAP32[r14];r31=r6+16|0,r30=r31>>2;r29=HEAP32[r30];r28=r29;__ZN16b2StackAllocator4FreeEPv(r2,r28);r12=HEAP32[r14];r59=HEAP32[r24];r11=r59;__ZN16b2StackAllocator4FreeEPv(r12,r11);r92=HEAP32[r20];r22=r92;__ZN16b2StackAllocator4FreeEPv(r12,r22);STACKTOP=r4;return}else if(r3==1967){___assert_func(5251392,723,5257992,5247708)}else if(r3==1972){___assert_func(5251392,723,5257992,5247708)}else if(r3==1976){___assert_func(5253128,676,5257732,5247708)}else if(r3==1989){___assert_func(5251392,723,5257992,5247708)}else if(r3==2040){___assert_func(5251208,54,5257624,5250440)}else if(r3==1992){___assert_func(5251392,723,5257992,5247708)}else if(r3==2024){___assert_func(5251392,723,5257992,5247708)}}function __ZN7b2World4StepEfii(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+24|0;r7=r6,r8=r7>>2;r9=(r1+102868|0)>>2;r10=HEAP32[r9];if((r10&1|0)==0){r11=r10}else{r10=r1+102872|0;__ZN12b2BroadPhase11UpdatePairsI16b2ContactManagerEEvPT_(r10|0,r10);r10=HEAP32[r9]&-2;HEAP32[r9]=r10;r11=r10}HEAP32[r9]=r11|2;r11=(r7|0)>>2;HEAPF32[r11]=r2;HEAP32[r8+3]=r3;HEAP32[r8+4]=r4;r4=r2>0;if(r4){HEAPF32[r8+1]=1/r2}else{HEAPF32[r8+1]=0}r3=r1+102988|0;HEAPF32[r8+2]=HEAPF32[r3>>2]*r2;HEAP8[r7+20|0]=HEAP8[r1+102992|0]&1;__ZN16b2ContactManager7CollideEv(r1+102872|0);HEAPF32[r1+103e3>>2]=0;if(!((HEAP8[r1+102995|0]&1)<<24>>24==0|r4^1)){__ZN7b2World5SolveERK10b2TimeStep(r1,r7);HEAPF32[r1+103004>>2]=0}do{if((HEAP8[r1+102993|0]&1)<<24>>24==0){r5=2075}else{r4=HEAPF32[r11];if(r4<=0){r12=r4;break}__ZN7b2World8SolveTOIERK10b2TimeStep(r1,r7);HEAPF32[r1+103024>>2]=0;r5=2075;break}}while(0);if(r5==2075){r12=HEAPF32[r11]}if(r12>0){HEAPF32[r3>>2]=HEAPF32[r8+1]}r8=HEAP32[r9];if((r8&4|0)==0){r13=r8;r14=r13&-3;HEAP32[r9]=r14;r15=r1+102996|0,r16=r15>>2;HEAPF32[r16]=0;STACKTOP=r6;return}r3=HEAP32[r1+102952>>2];if((r3|0)==0){r13=r8;r14=r13&-3;HEAP32[r9]=r14;r15=r1+102996|0,r16=r15>>2;HEAPF32[r16]=0;STACKTOP=r6;return}else{r17=r3,r18=r17>>2}while(1){HEAPF32[r18+19]=0;HEAPF32[r18+20]=0;HEAPF32[r18+21]=0;r3=HEAP32[r18+24];if((r3|0)==0){break}else{r17=r3,r18=r17>>2}}r13=HEAP32[r9];r14=r13&-3;HEAP32[r9]=r14;r15=r1+102996|0,r16=r15>>2;HEAPF32[r16]=0;STACKTOP=r6;return}function __ZN7b2World9DrawJointEP7b2Joint(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r3=STACKTOP;STACKTOP=STACKTOP+60|0;r4=r3;r5=r3+8;r6=r3+16;r7=r3+24;r8=r3+32,r9=r8>>2;r10=r3+44;r11=r3+52;r12=HEAP32[r2+52>>2]+12|0;r13=HEAP32[r2+48>>2]+12|0;r14=r4;r15=HEAP32[r13+4>>2];HEAP32[r14>>2]=HEAP32[r13>>2];HEAP32[r14+4>>2]=r15;r15=r12;r12=r5;r14=HEAP32[r15+4>>2];HEAP32[r12>>2]=HEAP32[r15>>2];HEAP32[r12+4>>2]=r14;r14=r2;FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]>>2]](r6,r2);FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+4>>2]](r7,r2);HEAPF32[r9]=.5;HEAPF32[r9+1]=.800000011920929;HEAPF32[r9+2]=.800000011920929;r9=HEAP32[r2+4>>2];if((r9|0)==3){r14=HEAP32[r1+102984>>2];FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+24>>2]](r14,r6,r7,r8);STACKTOP=r3;return}else if((r9|0)==4){r14=r2+68|0;r12=r10;r15=HEAP32[r14+4>>2];HEAP32[r12>>2]=HEAP32[r14>>2];HEAP32[r12+4>>2]=r15;r15=r2+76|0;r2=r11;r12=HEAP32[r15+4>>2];HEAP32[r2>>2]=HEAP32[r15>>2];HEAP32[r2+4>>2]=r12;r12=(r1+102984|0)>>2;r2=HEAP32[r12];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2,r10,r6,r8);r2=HEAP32[r12];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2,r11,r7,r8);r2=HEAP32[r12];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2,r10,r11,r8);STACKTOP=r3;return}else if((r9|0)==5){STACKTOP=r3;return}else{r9=(r1+102984|0)>>2;r1=HEAP32[r9];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1,r4,r6,r8);r4=HEAP32[r9];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+24>>2]](r4,r6,r7,r8);r6=HEAP32[r9];FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+24>>2]](r6,r5,r7,r8);STACKTOP=r3;return}}function __ZN7b2World4DumpEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10;r2=r1>>2;r3=STACKTOP;if((HEAP32[r2+25717]&2|0)!=0){STACKTOP=r3;return}r4=HEAPF32[r2+25743];__Z5b2LogPKcz(5247208,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+25742],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r4,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5255224,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5255008,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+25740],tempInt));__Z5b2LogPKcz(5254456,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+25741],tempInt));r4=HEAP32[r2+25738];L2714:do{if((r4|0)!=0){r2=0;r5=r4;while(1){HEAP32[r5+8>>2]=r2;__ZN6b2Body4DumpEv(r5);r6=HEAP32[r5+96>>2];if((r6|0)==0){break L2714}else{r2=r2+1|0;r5=r6}}}}while(0);r4=(r1+102956|0)>>2;r1=HEAP32[r4];L2718:do{if((r1|0)!=0){r5=0;r2=r1;while(1){HEAP32[r2+56>>2]=r5;r6=HEAP32[r2+12>>2];if((r6|0)==0){break}else{r5=r5+1|0;r2=r6}}r2=HEAP32[r4];if((r2|0)==0){break}else{r7=r2,r8=r7>>2}while(1){if((HEAP32[r8+1]|0)!=6){__Z5b2LogPKcz(5254040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](r7);__Z5b2LogPKcz(5253796,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r2=HEAP32[r8+3];if((r2|0)==0){break}else{r7=r2,r8=r7>>2}}r2=HEAP32[r4];if((r2|0)==0){break}else{r9=r2,r10=r9>>2}while(1){if((HEAP32[r10+1]|0)==6){__Z5b2LogPKcz(5254040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));FUNCTION_TABLE[HEAP32[HEAP32[r10]+16>>2]](r9);__Z5b2LogPKcz(5253796,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r2=HEAP32[r10+3];if((r2|0)==0){break L2718}else{r9=r2,r10=r9>>2}}}}while(0);__Z5b2LogPKcz(5253608,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253400,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253216,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253020,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));STACKTOP=r3;return}function __ZN7b2World9DrawShapeEP9b2FixtureRK11b2TransformRK7b2Color(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r5=r3>>2;r6=STACKTOP;STACKTOP=STACKTOP+112|0;r7=r6;r8=r6+8;r9=r6+16;r10=r6+24;r11=r6+32;r12=r6+40;r13=r6+48;r14=HEAP32[r2+12>>2],r2=r14>>2;r15=HEAP32[r2+1];if((r15|0)==0){r16=HEAPF32[r5+3];r17=HEAPF32[r2+3];r18=HEAPF32[r5+2];r19=HEAPF32[r2+4];r20=r17*r18+r16*r19+HEAPF32[r5+1];HEAPF32[r7>>2]=HEAPF32[r5]+(r16*r17-r18*r19);HEAPF32[r7+4>>2]=r20;r20=HEAPF32[r2+2];HEAPF32[r8>>2]=r16-0;HEAPF32[r8+4>>2]=r18;r18=HEAP32[r1+102984>>2];FUNCTION_TABLE[HEAP32[HEAP32[r18>>2]+20>>2]](r18,r7,r20,r8,r4);STACKTOP=r6;return}else if((r15|0)==1){r8=HEAPF32[r5+3];r20=HEAPF32[r2+3];r7=HEAPF32[r5+2];r18=HEAPF32[r2+4];r16=HEAPF32[r5];r19=HEAPF32[r5+1];HEAPF32[r9>>2]=r16+(r8*r20-r7*r18);HEAPF32[r9+4>>2]=r20*r7+r8*r18+r19;r18=r14+20|0;r20=HEAPF32[r18>>2];r17=HEAPF32[r18+4>>2];HEAPF32[r10>>2]=r16+(r8*r20-r7*r17);HEAPF32[r10+4>>2]=r20*r7+r8*r17+r19;r19=HEAP32[r1+102984>>2];FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+24>>2]](r19,r9,r10,r4);STACKTOP=r6;return}else if((r15|0)==2){r10=HEAP32[r2+37];if((r10|0)>=9){___assert_func(5253128,1077,5257656,5247436)}r9=r13|0;L2745:do{if((r10|0)>0){r19=r14+20|0;r17=HEAPF32[r5+3];r8=HEAPF32[r5+2];r7=HEAPF32[r5];r20=HEAPF32[r5+1];r16=0;while(1){r18=HEAPF32[r19+(r16<<3)>>2];r21=HEAPF32[r19+(r16<<3)+4>>2];r22=(r16<<3)+r13|0;r23=(HEAPF32[tempDoublePtr>>2]=r7+(r17*r18-r8*r21),HEAP32[tempDoublePtr>>2]);r24=(HEAPF32[tempDoublePtr>>2]=r18*r8+r17*r21+r20,HEAP32[tempDoublePtr>>2])|0;HEAP32[r22>>2]=0|r23;HEAP32[r22+4>>2]=r24;r24=r16+1|0;if((r24|0)==(r10|0)){break L2745}else{r16=r24}}}}while(0);r13=HEAP32[r1+102984>>2];FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+12>>2]](r13,r9,r10,r4);STACKTOP=r6;return}else if((r15|0)==3){r15=HEAP32[r2+4];r10=HEAP32[r2+3]>>2;r2=r3+12|0;r9=HEAPF32[r2>>2];r13=HEAPF32[r10];r5=r3+8|0;r14=HEAPF32[r5>>2];r16=HEAPF32[r10+1];r20=r3|0;r17=HEAPF32[r20>>2];r8=r3+4|0;r3=HEAPF32[r8>>2];HEAPF32[r11>>2]=r17+(r9*r13-r14*r16);HEAPF32[r11+4>>2]=r13*r14+r9*r16+r3;if((r15|0)<=1){STACKTOP=r6;return}r16=r12|0;r13=r12+4|0;r7=r1+102984|0;r1=r12;r19=r11;r24=1;r22=r9;r9=r14;r14=r17;r17=r3;while(1){r3=HEAPF32[(r24<<3>>2)+r10];r23=HEAPF32[((r24<<3)+4>>2)+r10];HEAPF32[r16>>2]=r14+(r22*r3-r9*r23);HEAPF32[r13>>2]=r3*r9+r22*r23+r17;r23=HEAP32[r7>>2];FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+24>>2]](r23,r11,r12,r4);r23=HEAP32[r7>>2];FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+16>>2]](r23,r11,.05000000074505806,r4);r23=HEAP32[r1+4>>2];HEAP32[r19>>2]=HEAP32[r1>>2];HEAP32[r19+4>>2]=r23;r23=r24+1|0;if((r23|0)==(r15|0)){break}r24=r23;r22=HEAPF32[r2>>2];r9=HEAPF32[r5>>2];r14=HEAPF32[r20>>2];r17=HEAPF32[r8>>2]}STACKTOP=r6;return}else{STACKTOP=r6;return}}function __ZN7b2World13DrawDebugDataEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+120|0;r4=r3;r5=r3+12;r6=r3+24;r7=r3+36;r8=r3+48;r9=r3+60,r10=r9>>2;r11=r3+72;r12=r3+104;r13=(r1+102984|0)>>2;r14=HEAP32[r13];if((r14|0)==0){STACKTOP=r3;return}r15=HEAP32[r14+4>>2];L2764:do{if((r15&1|0)!=0){r14=HEAP32[r1+102952>>2];if((r14|0)==0){break}r16=r4|0;r17=r4+4|0;r18=r4+8|0;r19=r7|0;r20=r7+4|0;r21=r7+8|0;r22=r8|0;r23=r8+4|0;r24=r8+8|0;r25=r5|0;r26=r5+4|0;r27=r5+8|0;r28=r6|0;r29=r6+4|0;r30=r6+8|0;r31=r14;while(1){r14=r31+12|0;r32=HEAP32[r31+100>>2];L2769:do{if((r32|0)!=0){r33=r31+4|0;r34=r31|0;r35=r32;while(1){r36=HEAP16[r33>>1];do{if((r36&32)<<16>>16==0){HEAPF32[r16>>2]=.5;HEAPF32[r17>>2]=.5;HEAPF32[r18>>2]=.30000001192092896;__ZN7b2World9DrawShapeEP9b2FixtureRK11b2TransformRK7b2Color(r1,r35,r14,r4)}else{r37=HEAP32[r34>>2];if((r37|0)==0){HEAPF32[r25>>2]=.5;HEAPF32[r26>>2]=.8999999761581421;HEAPF32[r27>>2]=.5;__ZN7b2World9DrawShapeEP9b2FixtureRK11b2TransformRK7b2Color(r1,r35,r14,r5);break}else if((r37|0)==1){HEAPF32[r28>>2]=.5;HEAPF32[r29>>2]=.5;HEAPF32[r30>>2]=.8999999761581421;__ZN7b2World9DrawShapeEP9b2FixtureRK11b2TransformRK7b2Color(r1,r35,r14,r6);break}else{if((r36&2)<<16>>16==0){HEAPF32[r19>>2]=.6000000238418579;HEAPF32[r20>>2]=.6000000238418579;HEAPF32[r21>>2]=.6000000238418579;__ZN7b2World9DrawShapeEP9b2FixtureRK11b2TransformRK7b2Color(r1,r35,r14,r7);break}else{HEAPF32[r22>>2]=.8999999761581421;HEAPF32[r23>>2]=.699999988079071;HEAPF32[r24>>2]=.699999988079071;__ZN7b2World9DrawShapeEP9b2FixtureRK11b2TransformRK7b2Color(r1,r35,r14,r8);break}}}}while(0);r36=HEAP32[r35+4>>2];if((r36|0)==0){break L2769}else{r35=r36}}}}while(0);r14=HEAP32[r31+96>>2];if((r14|0)==0){break L2764}else{r31=r14}}}}while(0);L2786:do{if((r15&2|0)!=0){r8=HEAP32[r1+102956>>2];if((r8|0)==0){break}else{r38=r8}while(1){__ZN7b2World9DrawJointEP7b2Joint(r1,r38);r8=HEAP32[r38+12>>2];if((r8|0)==0){break L2786}else{r38=r8}}}}while(0);L2791:do{if((r15&8|0)!=0){r38=r1+102932|0;while(1){r8=HEAP32[r38>>2];if((r8|0)==0){break L2791}else{r38=r8+12|0}}}}while(0);L2796:do{if((r15&4|0)!=0){HEAPF32[r10]=.8999999761581421;HEAPF32[r10+1]=.30000001192092896;HEAPF32[r10+2]=.8999999761581421;r38=HEAP32[r1+102952>>2];if((r38|0)==0){break}r8=r1+102884|0;r7=r1+102876|0;r6=r11|0;r5=r11|0;r4=r11+4|0;r31=r11+8|0;r24=r11+12|0;r23=r11+16|0;r22=r11+20|0;r21=r11+24|0;r20=r11+28|0;r19=r38;L2799:while(1){L2801:do{if((HEAP16[r19+4>>1]&32)<<16>>16!=0){r38=HEAP32[r19+100>>2];if((r38|0)==0){break}else{r39=r38}while(1){r38=r39+28|0;L2805:do{if((HEAP32[r38>>2]|0)>0){r30=r39+24|0;r29=0;while(1){r28=HEAP32[HEAP32[r30>>2]+(r29*28&-1)+24>>2];if((r28|0)<=-1){r2=2177;break L2799}if((HEAP32[r8>>2]|0)<=(r28|0)){r2=2176;break L2799}r27=HEAP32[r7>>2]>>2;r26=HEAPF32[((r28*36&-1)>>2)+r27];r25=HEAPF32[((r28*36&-1)+4>>2)+r27];r18=HEAPF32[((r28*36&-1)+8>>2)+r27];r17=HEAPF32[((r28*36&-1)+12>>2)+r27];HEAPF32[r5>>2]=r26;HEAPF32[r4>>2]=r25;HEAPF32[r31>>2]=r18;HEAPF32[r24>>2]=r25;HEAPF32[r23>>2]=r18;HEAPF32[r22>>2]=r17;HEAPF32[r21>>2]=r26;HEAPF32[r20>>2]=r17;r17=HEAP32[r13];FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+8>>2]](r17,r6,4,r9);r17=r29+1|0;if((r17|0)<(HEAP32[r38>>2]|0)){r29=r17}else{break L2805}}}}while(0);r38=HEAP32[r39+4>>2];if((r38|0)==0){break L2801}else{r39=r38}}}}while(0);r38=HEAP32[r19+96>>2];if((r38|0)==0){break L2796}else{r19=r38}}if(r2==2177){___assert_func(5252876,159,5256772,5252452)}else if(r2==2176){___assert_func(5252876,159,5256772,5252452)}}}while(0);if((r15&16|0)==0){STACKTOP=r3;return}r15=HEAP32[r1+102952>>2];if((r15|0)==0){STACKTOP=r3;return}r1=r12>>2;r2=r12;r39=r15;while(1){r15=(r39+12|0)>>2;HEAP32[r1]=HEAP32[r15];HEAP32[r1+1]=HEAP32[r15+1];HEAP32[r1+2]=HEAP32[r15+2];HEAP32[r1+3]=HEAP32[r15+3];r15=r39+44|0;r9=HEAP32[r15+4>>2];HEAP32[r2>>2]=HEAP32[r15>>2];HEAP32[r2+4>>2]=r9;r9=HEAP32[r13];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+28>>2]](r9,r12);r9=HEAP32[r39+96>>2];if((r9|0)==0){break}else{r39=r9}}STACKTOP=r3;return}function __ZN23b2ChainAndCircleContactD1Ev(r1){return}function __ZN24b2ChainAndPolygonContactD1Ev(r1){return}function __ZN15b2ContactFilter13ShouldCollideEP9b2FixtureS1_(r1,r2,r3){var r4;r1=HEAP16[r2+36>>1];if(!(r1<<16>>16!=HEAP16[r3+36>>1]<<16>>16|r1<<16>>16==0)){r4=r1<<16>>16>0;return r4}if((HEAP16[r3+32>>1]&HEAP16[r2+34>>1])<<16>>16==0){r4=0;return r4}r4=(HEAP16[r3+34>>1]&HEAP16[r2+32>>1])<<16>>16!=0;return r4}function __ZN15b2ContactFilterD0Ev(r1){__ZdlPv(r1);return}function __ZN23b2ChainAndCircleContact8EvaluateEP10b2ManifoldRK11b2TransformS4_(r1,r2,r3,r4){var r5,r6,r7,r8;r5=STACKTOP;STACKTOP=STACKTOP+48|0;r6=r5,r7=r6>>2;r8=HEAP32[HEAP32[r1+48>>2]+12>>2];HEAP32[r7]=5262520;HEAP32[r7+1]=1;HEAPF32[r7+2]=.009999999776482582;r7=r6+28|0;HEAP32[r7>>2]=0;HEAP32[r7+4>>2]=0;HEAP32[r7+8>>2]=0;HEAP32[r7+12>>2]=0;HEAP16[r7+16>>1]=0;__ZNK12b2ChainShape12GetChildEdgeEP11b2EdgeShapei(r8,r6,HEAP32[r1+56>>2]);__Z22b2CollideEdgeAndCircleP10b2ManifoldPK11b2EdgeShapeRK11b2TransformPK13b2CircleShapeS6_(r2,r6,r3,HEAP32[HEAP32[r1+52>>2]+12>>2],r4);STACKTOP=r5;return}function __ZN23b2ChainAndCircleContactD0Ev(r1){__ZdlPv(r1);return}function __ZN24b2ChainAndPolygonContact8EvaluateEP10b2ManifoldRK11b2TransformS4_(r1,r2,r3,r4){var r5,r6,r7,r8;r5=STACKTOP;STACKTOP=STACKTOP+300|0;r6=r5+252,r7=r6>>2;r8=HEAP32[HEAP32[r1+48>>2]+12>>2];HEAP32[r7]=5262520;HEAP32[r7+1]=1;HEAPF32[r7+2]=.009999999776482582;r7=r6+28|0;HEAP32[r7>>2]=0;HEAP32[r7+4>>2]=0;HEAP32[r7+8>>2]=0;HEAP32[r7+12>>2]=0;HEAP16[r7+16>>1]=0;__ZNK12b2ChainShape12GetChildEdgeEP11b2EdgeShapei(r8,r6,HEAP32[r1+56>>2]);__ZN12b2EPCollider7CollideEP10b2ManifoldPK11b2EdgeShapeRK11b2TransformPK14b2PolygonShapeS7_(r5,r2,r6,r3,HEAP32[HEAP32[r1+52>>2]+12>>2],r4);STACKTOP=r5;return}function __ZN24b2ChainAndPolygonContactD0Ev(r1){__ZdlPv(r1);return}function __ZNK13b2DynamicTree7RayCastI21b2WorldRayCastWrapperEEvPT_RK14b2RayCastInput(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+1056|0;r6=r5;r7=r5+1036;r8=r3>>2;r9=HEAP32[r8+1];r10=(HEAP32[tempDoublePtr>>2]=HEAP32[r8],HEAPF32[tempDoublePtr>>2]);r11=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2]);r9=(r3+8|0)>>2;r12=HEAP32[r9+1];r13=(HEAP32[tempDoublePtr>>2]=HEAP32[r9],HEAPF32[tempDoublePtr>>2])-r10;r14=(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2])-r11;r12=r13*r13+r14*r14;if(r12<=0){___assert_func(5252876,204,5256436,5252704)}r15=Math.sqrt(r12);if(r15<1.1920928955078125e-7){r16=r13;r17=r14}else{r12=1/r15;r16=r13*r12;r17=r14*r12}r12=r17*-1;if(r12>0){r18=r12}else{r18=-r12}if(r16>0){r19=r16}else{r19=-r16}r17=HEAPF32[r3+16>>2];r3=r10+r13*r17;r15=r11+r14*r17;r20=r6+4|0;r21=(r6|0)>>2;HEAP32[r21]=r20;r22=(r6+1028|0)>>2;HEAP32[r22]=0;r23=(r6+1032|0)>>2;HEAP32[r23]=256;HEAP32[HEAP32[r21]+(HEAP32[r22]<<2)>>2]=HEAP32[r1>>2];r6=HEAP32[r22]+1|0;HEAP32[r22]=r6;L2855:do{if((r6|0)>0){r24=r1+4|0;r25=r7;r26=r7+8|0;r27=r7+16|0;r28=r6;r29=r11<r15?r11:r15;r30=r10<r3?r10:r3;r31=r11>r15?r11:r15;r32=r10>r3?r10:r3;r33=r17;while(1){r34=r28;while(1){r35=r34-1|0;HEAP32[r22]=r35;r36=HEAP32[r21];r37=HEAP32[r36+(r35<<2)>>2];if((r37|0)==-1){r38=r33;r39=r32;r40=r31;r41=r30;r42=r29;r43=r35;break}r44=HEAP32[r24>>2],r45=r44>>2;r46=HEAPF32[((r37*36&-1)+8>>2)+r45];r47=HEAPF32[((r37*36&-1)+12>>2)+r45];r48=HEAPF32[((r37*36&-1)>>2)+r45];r49=HEAPF32[((r37*36&-1)+4>>2)+r45];if(r30-r46>0|r29-r47>0|r48-r32>0|r49-r31>0){r50=r33;r51=r32;r52=r31;r53=r30;r54=r29;r4=2203;break}r45=r12*(r10-(r46+r48)*.5)+r16*(r11-(r47+r49)*.5);if(r45>0){r55=r45}else{r55=-r45}if(r55-(r18*(r46-r48)*.5+r19*(r47-r49)*.5)>0){r50=r33;r51=r32;r52=r31;r53=r30;r54=r29;r4=2203;break}r49=r44+(r37*36&-1)+24|0;if((HEAP32[r49>>2]|0)==-1){r4=2214;break}do{if((r35|0)==(HEAP32[r23]|0)){HEAP32[r23]=r35<<1;r47=_malloc(r35<<3);HEAP32[r21]=r47;r48=r36;_memcpy(r47,r48,HEAP32[r22]<<2);if((r36|0)==(r20|0)){break}_free(r48)}}while(0);HEAP32[HEAP32[r21]+(HEAP32[r22]<<2)>>2]=HEAP32[r49>>2];r36=HEAP32[r22]+1|0;HEAP32[r22]=r36;r35=r44+(r37*36&-1)+28|0;do{if((r36|0)==(HEAP32[r23]|0)){r48=HEAP32[r21];HEAP32[r23]=r36<<1;r47=_malloc(r36<<3);HEAP32[r21]=r47;r46=r48;_memcpy(r47,r46,HEAP32[r22]<<2);if((r48|0)==(r20|0)){break}_free(r46)}}while(0);HEAP32[HEAP32[r21]+(HEAP32[r22]<<2)>>2]=HEAP32[r35>>2];r36=HEAP32[r22]+1|0;HEAP32[r22]=r36;if((r36|0)>0){r34=r36}else{break L2855}}do{if(r4==2214){r4=0;r34=HEAP32[r8+1];HEAP32[r25>>2]=HEAP32[r8];HEAP32[r25+4>>2]=r34;r34=HEAP32[r9+1];HEAP32[r26>>2]=HEAP32[r9];HEAP32[r26+4>>2]=r34;HEAPF32[r27>>2]=r33;r34=__ZN21b2WorldRayCastWrapper15RayCastCallbackERK14b2RayCastInputi(r2,r7,r37);if(r34==0){break L2855}if(r34<=0){r50=r33;r51=r32;r52=r31;r53=r30;r54=r29;r4=2203;break}r36=r10+r13*r34;r44=r11+r14*r34;r50=r34;r51=r10>r36?r10:r36;r52=r11>r44?r11:r44;r53=r10<r36?r10:r36;r54=r11<r44?r11:r44;r4=2203;break}}while(0);if(r4==2203){r4=0;r38=r50;r39=r51;r40=r52;r41=r53;r42=r54;r43=HEAP32[r22]}if((r43|0)>0){r28=r43;r29=r42;r30=r41;r31=r40;r32=r39;r33=r38}else{break L2855}}}}while(0);r38=HEAP32[r21];if((r38|0)==(r20|0)){STACKTOP=r5;return}_free(r38);HEAP32[r21]=0;STACKTOP=r5;return}function __ZN21b2WorldRayCastWrapper15RayCastCallbackERK14b2RayCastInputi(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=r2>>2;r5=STACKTOP;STACKTOP=STACKTOP+20|0;r6=r5;r7=r5+12;r8=HEAP32[r1>>2];if((r3|0)<=-1){___assert_func(5252876,153,5256724,5252452)}if((HEAP32[r8+12>>2]|0)<=(r3|0)){___assert_func(5252876,153,5256724,5252452)}r9=HEAP32[HEAP32[r8+4>>2]+(r3*36&-1)+16>>2];r3=HEAP32[r9+16>>2];r8=HEAP32[r3+12>>2];if(FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+20>>2]](r8,r6,r2,HEAP32[r3+8>>2]+12|0,HEAP32[r9+20>>2])){r9=HEAPF32[r6+8>>2];r2=1-r9;r8=r2*HEAPF32[r4+1]+r9*HEAPF32[r4+3];HEAPF32[r7>>2]=HEAPF32[r4]*r2+r9*HEAPF32[r4+2];HEAPF32[r7+4>>2]=r8;r8=HEAP32[r1+4>>2];r1=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+8>>2]](r8,r3,r7,r6|0,r9);STACKTOP=r5;return r1}else{r1=HEAPF32[r4+4];STACKTOP=r5;return r1}}function __ZNK13b2DynamicTree5QueryI19b2WorldQueryWrapperEEvPT_RK6b2AABB(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r4=STACKTOP;STACKTOP=STACKTOP+1036|0;r5=r4;r6=r5+4|0;r7=(r5|0)>>2;HEAP32[r7]=r6;r8=(r5+1028|0)>>2;HEAP32[r8]=0;r9=(r5+1032|0)>>2;HEAP32[r9]=256;HEAP32[HEAP32[r7]+(HEAP32[r8]<<2)>>2]=HEAP32[r1>>2];r5=HEAP32[r8]+1|0;HEAP32[r8]=r5;L2902:do{if((r5|0)>0){r10=r1+4|0;r11=r3|0;r12=r3+4|0;r13=r3+8|0;r14=r3+12|0;r15=r2|0;r16=r2+4|0;r17=r5;L2904:while(1){r18=r17-1|0;HEAP32[r8]=r18;r19=HEAP32[r7];r20=HEAP32[r19+(r18<<2)>>2];do{if((r20|0)==-1){r21=r18}else{r22=HEAP32[r10>>2],r23=r22>>2;if(HEAPF32[r11>>2]-HEAPF32[((r20*36&-1)+8>>2)+r23]>0|HEAPF32[r12>>2]-HEAPF32[((r20*36&-1)+12>>2)+r23]>0|HEAPF32[((r20*36&-1)>>2)+r23]-HEAPF32[r13>>2]>0|HEAPF32[((r20*36&-1)+4>>2)+r23]-HEAPF32[r14>>2]>0){r21=r18;break}r23=r22+(r20*36&-1)+24|0;if((HEAP32[r23>>2]|0)==-1){r24=HEAP32[r15>>2];if((r20|0)<=-1){break L2904}if((HEAP32[r24+12>>2]|0)<=(r20|0)){break L2904}r25=HEAP32[r16>>2];if(!FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+8>>2]](r25,HEAP32[HEAP32[HEAP32[r24+4>>2]+(r20*36&-1)+16>>2]+16>>2])){break L2902}r21=HEAP32[r8];break}do{if((r18|0)==(HEAP32[r9]|0)){HEAP32[r9]=r18<<1;r24=_malloc(r18<<3);HEAP32[r7]=r24;r25=r19;_memcpy(r24,r25,HEAP32[r8]<<2);if((r19|0)==(r6|0)){break}_free(r25)}}while(0);HEAP32[HEAP32[r7]+(HEAP32[r8]<<2)>>2]=HEAP32[r23>>2];r25=HEAP32[r8]+1|0;HEAP32[r8]=r25;r24=r22+(r20*36&-1)+28|0;do{if((r25|0)==(HEAP32[r9]|0)){r26=HEAP32[r7];HEAP32[r9]=r25<<1;r27=_malloc(r25<<3);HEAP32[r7]=r27;r28=r26;_memcpy(r27,r28,HEAP32[r8]<<2);if((r26|0)==(r6|0)){break}_free(r28)}}while(0);HEAP32[HEAP32[r7]+(HEAP32[r8]<<2)>>2]=HEAP32[r24>>2];r25=HEAP32[r8]+1|0;HEAP32[r8]=r25;r21=r25}}while(0);if((r21|0)>0){r17=r21}else{break L2902}}___assert_func(5252876,153,5256724,5252452)}}while(0);r21=HEAP32[r7];if((r21|0)==(r6|0)){STACKTOP=r4;return}_free(r21);HEAP32[r7]=0;STACKTOP=r4;return}function __ZN23b2ChainAndCircleContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator(r1,r2,r3,r4,r5){var r6,r7,r8,r9;r6=__ZN16b2BlockAllocator8AllocateEi(r5,144),r5=r6>>2;if((r6|0)==0){r7=0;r8=r7|0;return r8}r9=r6;HEAP32[r9>>2]=5261444;HEAP32[r5+1]=4;HEAP32[r5+12]=r1;HEAP32[r5+13]=r3;HEAP32[r5+14]=r2;HEAP32[r5+15]=r4;HEAP32[r5+31]=0;HEAP32[r5+32]=0;_memset(r6+8|0,0,40);HEAPF32[r5+34]=Math.sqrt(HEAPF32[r1+16>>2]*HEAPF32[r3+16>>2]);r4=HEAPF32[r1+20>>2];r2=HEAPF32[r3+20>>2];HEAPF32[r5+35]=r4>r2?r4:r2;HEAP32[r9>>2]=5261636;if((HEAP32[HEAP32[r1+12>>2]+4>>2]|0)!=3){___assert_func(5252636,43,5258916,5254640)}if((HEAP32[HEAP32[r3+12>>2]+4>>2]|0)==0){r7=r6;r8=r7|0;return r8}else{___assert_func(5252636,44,5258916,5251992)}}function __ZN23b2ChainAndCircleContact7DestroyEP9b2ContactP16b2BlockAllocator(r1,r2){var r3,r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);r3=HEAP8[5263996];if((r3&255)<14){r4=((r3&255)<<2)+r2+12|0;HEAP32[r1>>2]=HEAP32[r4>>2];HEAP32[r4>>2]=r1;return}else{___assert_func(5248148,173,5259684,5249276)}}function __ZN24b2ChainAndPolygonContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator(r1,r2,r3,r4,r5){var r6,r7,r8,r9;r6=__ZN16b2BlockAllocator8AllocateEi(r5,144),r5=r6>>2;if((r6|0)==0){r7=0;r8=r7|0;return r8}r9=r6;HEAP32[r9>>2]=5261444;HEAP32[r5+1]=4;HEAP32[r5+12]=r1;HEAP32[r5+13]=r3;HEAP32[r5+14]=r2;HEAP32[r5+15]=r4;HEAP32[r5+31]=0;HEAP32[r5+32]=0;_memset(r6+8|0,0,40);HEAPF32[r5+34]=Math.sqrt(HEAPF32[r1+16>>2]*HEAPF32[r3+16>>2]);r4=HEAPF32[r1+20>>2];r2=HEAPF32[r3+20>>2];HEAPF32[r5+35]=r4>r2?r4:r2;HEAP32[r9>>2]=5261588;if((HEAP32[HEAP32[r1+12>>2]+4>>2]|0)!=3){___assert_func(5252496,43,5258748,5254640)}if((HEAP32[HEAP32[r3+12>>2]+4>>2]|0)==2){r7=r6;r8=r7|0;return r8}else{___assert_func(5252496,44,5258748,5251948)}}function __ZN24b2ChainAndPolygonContact7DestroyEP9b2ContactP16b2BlockAllocator(r1,r2){var r3,r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);r3=HEAP8[5263996];if((r3&255)<14){r4=((r3&255)<<2)+r2+12|0;HEAP32[r1>>2]=HEAP32[r4>>2];HEAP32[r4>>2]=r1;return}else{___assert_func(5248148,173,5259684,5249276)}}function __ZN15b2CircleContactD1Ev(r1){return}function __ZN9b2ContactD1Ev(r1){return}function __ZN15b2CircleContact8EvaluateEP10b2ManifoldRK11b2TransformS4_(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r5=HEAP32[HEAP32[r1+48>>2]+12>>2];r6=HEAP32[HEAP32[r1+52>>2]+12>>2];r1=r2+60|0;HEAP32[r1>>2]=0;r7=r5+12|0;r8=HEAPF32[r3+12>>2];r9=HEAPF32[r7>>2];r10=HEAPF32[r3+8>>2];r11=HEAPF32[r5+16>>2];r12=r6+12|0;r13=HEAPF32[r4+12>>2];r14=HEAPF32[r12>>2];r15=HEAPF32[r4+8>>2];r16=HEAPF32[r6+16>>2];r17=HEAPF32[r4>>2]+(r13*r14-r15*r16)-(HEAPF32[r3>>2]+(r8*r9-r10*r11));r18=r14*r15+r13*r16+HEAPF32[r4+4>>2]-(r9*r10+r8*r11+HEAPF32[r3+4>>2]);r3=HEAPF32[r5+8>>2]+HEAPF32[r6+8>>2];if(r17*r17+r18*r18>r3*r3){return}HEAP32[r2+56>>2]=0;r3=r7;r7=r2+48|0;r18=HEAP32[r3+4>>2];HEAP32[r7>>2]=HEAP32[r3>>2];HEAP32[r7+4>>2]=r18;HEAPF32[r2+40>>2]=0;HEAPF32[r2+44>>2]=0;HEAP32[r1>>2]=1;r1=r12;r12=r2;r18=HEAP32[r1+4>>2];HEAP32[r12>>2]=HEAP32[r1>>2];HEAP32[r12+4>>2]=r18;HEAP32[r2+16>>2]=0;return}function __ZN15b2CircleContactD0Ev(r1){__ZdlPv(r1);return}function __ZN9b2Contact6UpdateEP17b2ContactListener(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r3=r1>>2;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+192|0;r6=r5,r7=r6>>2;r8=r5+92;r9=r5+104;r10=r5+128,r11=r10>>2;r12=r1+64|0;_memcpy(r10,r12,64);r13=(r1+4|0)>>2;r14=HEAP32[r13];HEAP32[r13]=r14|4;r15=r14>>>1;r14=HEAP32[r3+12];r16=HEAP32[r3+13];r17=((HEAP8[r16+38|0]|HEAP8[r14+38|0])&1)<<24>>24!=0;r18=HEAP32[r14+8>>2];r19=HEAP32[r16+8>>2];r20=r18+12|0;r21=r19+12|0;do{if(r17){r22=HEAP32[r14+12>>2];r23=HEAP32[r16+12>>2];r24=HEAP32[r3+14];r25=HEAP32[r3+15];HEAP32[r7+4]=0;HEAP32[r7+5]=0;HEAPF32[r7+6]=0;HEAP32[r7+11]=0;HEAP32[r7+12]=0;HEAPF32[r7+13]=0;__ZN15b2DistanceProxy3SetEPK7b2Shapei(r6|0,r22,r24);__ZN15b2DistanceProxy3SetEPK7b2Shapei(r6+28|0,r23,r25);r25=(r6+56|0)>>2;r23=r20>>2;HEAP32[r25]=HEAP32[r23];HEAP32[r25+1]=HEAP32[r23+1];HEAP32[r25+2]=HEAP32[r23+2];HEAP32[r25+3]=HEAP32[r23+3];r23=(r6+72|0)>>2;r25=r21>>2;HEAP32[r23]=HEAP32[r25];HEAP32[r23+1]=HEAP32[r25+1];HEAP32[r23+2]=HEAP32[r25+2];HEAP32[r23+3]=HEAP32[r25+3];HEAP8[r6+88|0]=1;HEAP16[r8+4>>1]=0;__Z10b2DistanceP16b2DistanceOutputP14b2SimplexCachePK15b2DistanceInput(r9,r8,r6);r25=HEAPF32[r9+16>>2]<11920928955078125e-22&1;HEAP32[r3+31]=0;r26=r25;r27=r15&1}else{FUNCTION_TABLE[HEAP32[HEAP32[r3]>>2]](r1,r12,r20,r21);r25=r1+124|0;r23=(HEAP32[r25>>2]|0)>0;r24=r23&1;L2971:do{if(r23){r22=HEAP32[r11+15];r28=0;while(1){r29=r1+(r28*20&-1)+72|0;HEAPF32[r29>>2]=0;r30=r1+(r28*20&-1)+76|0;HEAPF32[r30>>2]=0;r31=HEAP32[((r28*20&-1)+80>>2)+r3];r32=0;while(1){if((r32|0)>=(r22|0)){break}if((HEAP32[((r32*20&-1)+16>>2)+r11]|0)==(r31|0)){r4=2309;break}else{r32=r32+1|0}}if(r4==2309){r4=0;HEAPF32[r29>>2]=HEAPF32[((r32*20&-1)+8>>2)+r11];HEAPF32[r30>>2]=HEAPF32[((r32*20&-1)+12>>2)+r11]}r31=r28+1|0;if((r31|0)<(HEAP32[r25>>2]|0)){r28=r31}else{break L2971}}}}while(0);r25=r15&1;if(!(r23^(r25|0)!=0)){r26=r24;r27=r25;break}r28=r18+4|0;r22=HEAP16[r28>>1];if((r22&2)<<16>>16==0){HEAP16[r28>>1]=r22|2;HEAPF32[r18+144>>2]=0}r22=r19+4|0;r28=HEAP16[r22>>1];if((r28&2)<<16>>16!=0){r26=r24;r27=r25;break}HEAP16[r22>>1]=r28|2;HEAPF32[r19+144>>2]=0;r26=r24;r27=r25}}while(0);r19=r26<<24>>24!=0;r26=HEAP32[r13];HEAP32[r13]=r19?r26|2:r26&-3;r26=r19^1;r13=(r2|0)==0;if(!((r27|0)!=0|r26|r13)){FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2,r1)}if(!(r19|(r27|0)==0|r13)){FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+12>>2]](r2,r1)}if(r17|r26|r13){STACKTOP=r5;return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+16>>2]](r2,r1,r10);STACKTOP=r5;return}function __ZN9b2ContactD0Ev(r1){__ZdlPv(r1);return}function __ZN15b2CircleContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator(r1,r2,r3,r4,r5){var r6,r7,r8,r9;r4=__ZN16b2BlockAllocator8AllocateEi(r5,144),r5=r4>>2;if((r4|0)==0){r6=0;r7=r6|0;return r7}r2=r4;HEAP32[r2>>2]=5261444;HEAP32[r5+1]=4;HEAP32[r5+12]=r1;HEAP32[r5+13]=r3;HEAP32[r5+14]=0;HEAP32[r5+15]=0;HEAP32[r5+31]=0;HEAP32[r5+32]=0;_memset(r4+8|0,0,40);HEAPF32[r5+34]=Math.sqrt(HEAPF32[r1+16>>2]*HEAPF32[r3+16>>2]);r8=HEAPF32[r1+20>>2];r9=HEAPF32[r3+20>>2];HEAPF32[r5+35]=r8>r9?r8:r9;HEAP32[r2>>2]=5262052;if((HEAP32[HEAP32[r1+12>>2]+4>>2]|0)!=0){___assert_func(5252364,44,5260084,5254564)}if((HEAP32[HEAP32[r3+12>>2]+4>>2]|0)==0){r6=r4;r7=r6|0;return r7}else{___assert_func(5252364,45,5260084,5251992)}}function __ZN15b2CircleContact7DestroyEP9b2ContactP16b2BlockAllocator(r1,r2){var r3,r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);r3=HEAP8[5263996];if((r3&255)<14){r4=((r3&255)<<2)+r2+12|0;HEAP32[r1>>2]=HEAP32[r4>>2];HEAP32[r4>>2]=r1;return}else{___assert_func(5248148,173,5259684,5249276)}}function __ZN9b2Contact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator(r1,r2,r3,r4,r5){var r6,r7,r8,r9;if((HEAP8[5263652]&1)<<24>>24==0){HEAP32[1315914]=1274;HEAP32[1315915]=582;HEAP8[5263664]=1;HEAP32[1315938]=986;HEAP32[1315939]=1822;HEAP8[5263760]=1;HEAP32[1315920]=986;HEAP32[1315921]=1822;HEAP8[5263688]=0;HEAP32[1315944]=2264;HEAP32[1315945]=1318;HEAP8[5263784]=1;HEAP32[1315926]=1232;HEAP32[1315927]=372;HEAP8[5263712]=1;HEAP32[1315917]=1232;HEAP32[1315918]=372;HEAP8[5263676]=0;HEAP32[1315932]=1660;HEAP32[1315933]=1008;HEAP8[5263736]=1;HEAP32[1315941]=1660;HEAP32[1315942]=1008;HEAP8[5263772]=0;HEAP32[1315950]=974;HEAP32[1315951]=1248;HEAP8[5263808]=1;HEAP32[1315923]=974;HEAP32[1315924]=1248;HEAP8[5263700]=0;HEAP32[1315956]=2274;HEAP32[1315957]=672;HEAP8[5263832]=1;HEAP32[1315947]=2274;HEAP32[1315948]=672;HEAP8[5263796]=0;HEAP8[5263652]=1}r6=HEAP32[HEAP32[r1+12>>2]+4>>2];r7=HEAP32[HEAP32[r3+12>>2]+4>>2];if(r6>>>0>=4){___assert_func(5252272,80,5257404,5254520)}if(r7>>>0>=4){___assert_func(5252272,81,5257404,5252064)}r8=HEAP32[(r6*48&-1)+(r7*12&-1)+5263656>>2];if((r8|0)==0){r9=0;return r9}if((HEAP8[(r6*48&-1)+(r7*12&-1)+5263664|0]&1)<<24>>24==0){r9=FUNCTION_TABLE[r8](r3,r4,r1,r2,r5);return r9}else{r9=FUNCTION_TABLE[r8](r1,r2,r3,r4,r5);return r9}}function __ZN9b2Contact7DestroyEPS_P16b2BlockAllocator(r1,r2){var r3,r4,r5,r6,r7,r8;if((HEAP8[5263652]&1)<<24>>24==0){___assert_func(5252272,103,5257340,5249884)}r3=r1+48|0;do{if((HEAP32[r1+124>>2]|0)>0){r4=HEAP32[HEAP32[r3>>2]+8>>2];r5=r4+4|0;r6=HEAP16[r5>>1];if((r6&2)<<16>>16==0){HEAP16[r5>>1]=r6|2;HEAPF32[r4+144>>2]=0}r4=r1+52|0;r6=HEAP32[HEAP32[r4>>2]+8>>2];r5=r6+4|0;r7=HEAP16[r5>>1];if((r7&2)<<16>>16!=0){r8=r4;break}HEAP16[r5>>1]=r7|2;HEAPF32[r6+144>>2]=0;r8=r4}else{r8=r1+52|0}}while(0);r4=HEAP32[HEAP32[HEAP32[r3>>2]+12>>2]+4>>2];r3=HEAP32[HEAP32[HEAP32[r8>>2]+12>>2]+4>>2];if((r4|0)>-1&(r3|0)<4){FUNCTION_TABLE[HEAP32[(r4*48&-1)+(r3*12&-1)+5263660>>2]](r1,r2);return}else{___assert_func(5252272,114,5257340,5248904)}}function __ZN15b2ContactSolverC2EP18b2ContactSolverDef(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r3=r2>>2;r4=0;r5=r1>>2;r6=r2>>2;HEAP32[r5]=HEAP32[r6];HEAP32[r5+1]=HEAP32[r6+1];HEAP32[r5+2]=HEAP32[r6+2];HEAP32[r5+3]=HEAP32[r6+3];HEAP32[r5+4]=HEAP32[r6+4];HEAP32[r5+5]=HEAP32[r6+5];r6=HEAP32[r3+10];r5=r1+32|0;HEAP32[r5>>2]=r6;r2=HEAP32[r3+7];r7=(r1+48|0)>>2;HEAP32[r7]=r2;r8=r2*88&-1;r2=(r6+102796|0)>>2;r9=HEAP32[r2];if((r9|0)>=32){___assert_func(5247660,38,5259284,5249184)}r10=(r6+(r9*12&-1)+102412|0)>>2;HEAP32[r6+(r9*12&-1)+102416>>2]=r8;r11=(r6+102400|0)>>2;r12=HEAP32[r11];if((r12+r8|0)>102400){HEAP32[r10]=_malloc(r8);HEAP8[r6+(r9*12&-1)+102420|0]=1}else{HEAP32[r10]=r6+r12|0;HEAP8[r6+(r9*12&-1)+102420|0]=0;HEAP32[r11]=HEAP32[r11]+r8|0}r11=r6+102404|0;r9=HEAP32[r11>>2]+r8|0;HEAP32[r11>>2]=r9;r11=r6+102408|0;r6=HEAP32[r11>>2];HEAP32[r11>>2]=(r6|0)>(r9|0)?r6:r9;HEAP32[r2]=HEAP32[r2]+1|0;r2=r1+36|0;HEAP32[r2>>2]=HEAP32[r10];r10=HEAP32[r5>>2];r5=HEAP32[r7]*152&-1;r9=(r10+102796|0)>>2;r6=HEAP32[r9];if((r6|0)>=32){___assert_func(5247660,38,5259284,5249184)}r11=(r10+(r6*12&-1)+102412|0)>>2;HEAP32[r10+(r6*12&-1)+102416>>2]=r5;r8=(r10+102400|0)>>2;r12=HEAP32[r8];if((r12+r5|0)>102400){HEAP32[r11]=_malloc(r5);HEAP8[r10+(r6*12&-1)+102420|0]=1}else{HEAP32[r11]=r10+r12|0;HEAP8[r10+(r6*12&-1)+102420|0]=0;HEAP32[r8]=HEAP32[r8]+r5|0}r8=r10+102404|0;r6=HEAP32[r8>>2]+r5|0;HEAP32[r8>>2]=r6;r8=r10+102408|0;r10=HEAP32[r8>>2];HEAP32[r8>>2]=(r10|0)>(r6|0)?r10:r6;HEAP32[r9]=HEAP32[r9]+1|0;r9=r1+40|0;HEAP32[r9>>2]=HEAP32[r11];HEAP32[r1+24>>2]=HEAP32[r3+8];HEAP32[r1+28>>2]=HEAP32[r3+9];r11=HEAP32[r3+6];r3=r1+44|0;HEAP32[r3>>2]=r11;if((HEAP32[r7]|0)<=0){return}r6=r1+20|0;r10=r1+8|0;r1=0;r8=r11;while(1){r11=HEAP32[r8+(r1<<2)>>2],r5=r11>>2;r12=HEAP32[r5+12];r13=HEAP32[r5+13];r14=HEAP32[r12+8>>2];r15=HEAP32[r13+8>>2];r16=HEAP32[r5+31];if((r16|0)<=0){r4=2375;break}r17=HEAPF32[HEAP32[r13+12>>2]+8>>2];r13=HEAPF32[HEAP32[r12+12>>2]+8>>2];r12=HEAP32[r9>>2],r18=r12>>2;HEAPF32[((r1*152&-1)+136>>2)+r18]=HEAPF32[r5+34];HEAPF32[((r1*152&-1)+140>>2)+r18]=HEAPF32[r5+35];r19=r14+8|0;HEAP32[((r1*152&-1)+112>>2)+r18]=HEAP32[r19>>2];r20=r15+8|0;HEAP32[((r1*152&-1)+116>>2)+r18]=HEAP32[r20>>2];r21=r14+120|0;HEAPF32[((r1*152&-1)+120>>2)+r18]=HEAPF32[r21>>2];r22=r15+120|0;HEAPF32[((r1*152&-1)+124>>2)+r18]=HEAPF32[r22>>2];r23=r14+128|0;HEAPF32[((r1*152&-1)+128>>2)+r18]=HEAPF32[r23>>2];r24=r15+128|0;HEAPF32[((r1*152&-1)+132>>2)+r18]=HEAPF32[r24>>2];HEAP32[((r1*152&-1)+148>>2)+r18]=r1;HEAP32[((r1*152&-1)+144>>2)+r18]=r16;_memset(r12+(r1*152&-1)+80|0,0,32);r25=HEAP32[r2>>2],r26=r25>>2;HEAP32[((r1*88&-1)+32>>2)+r26]=HEAP32[r19>>2];HEAP32[((r1*88&-1)+36>>2)+r26]=HEAP32[r20>>2];HEAPF32[((r1*88&-1)+40>>2)+r26]=HEAPF32[r21>>2];HEAPF32[((r1*88&-1)+44>>2)+r26]=HEAPF32[r22>>2];r22=r14+28|0;r14=r25+(r1*88&-1)+48|0;r21=HEAP32[r22+4>>2];HEAP32[r14>>2]=HEAP32[r22>>2];HEAP32[r14+4>>2]=r21;r21=r15+28|0;r15=r25+(r1*88&-1)+56|0;r14=HEAP32[r21+4>>2];HEAP32[r15>>2]=HEAP32[r21>>2];HEAP32[r15+4>>2]=r14;HEAPF32[((r1*88&-1)+64>>2)+r26]=HEAPF32[r23>>2];HEAPF32[((r1*88&-1)+68>>2)+r26]=HEAPF32[r24>>2];r24=r11+104|0;r23=r25+(r1*88&-1)+16|0;r14=HEAP32[r24+4>>2];HEAP32[r23>>2]=HEAP32[r24>>2];HEAP32[r23+4>>2]=r14;r14=r11+112|0;r23=r25+(r1*88&-1)+24|0;r24=HEAP32[r14+4>>2];HEAP32[r23>>2]=HEAP32[r14>>2];HEAP32[r23+4>>2]=r24;HEAP32[((r1*88&-1)+84>>2)+r26]=r16;HEAPF32[((r1*88&-1)+76>>2)+r26]=r13;HEAPF32[((r1*88&-1)+80>>2)+r26]=r17;HEAP32[((r1*88&-1)+72>>2)+r26]=HEAP32[r5+30];r26=0;while(1){if((HEAP8[r6]&1)<<24>>24==0){HEAPF32[((r1*152&-1)+(r26*36&-1)+16>>2)+r18]=0;HEAPF32[((r1*152&-1)+(r26*36&-1)+20>>2)+r18]=0}else{HEAPF32[((r1*152&-1)+(r26*36&-1)+16>>2)+r18]=HEAPF32[r10>>2]*HEAPF32[((r26*20&-1)+72>>2)+r5];HEAPF32[((r1*152&-1)+(r26*36&-1)+20>>2)+r18]=HEAPF32[r10>>2]*HEAPF32[((r26*20&-1)+76>>2)+r5]}HEAPF32[((r1*152&-1)+(r26*36&-1)+24>>2)+r18]=0;HEAPF32[((r1*152&-1)+(r26*36&-1)+28>>2)+r18]=0;HEAPF32[((r1*152&-1)+(r26*36&-1)+32>>2)+r18]=0;r17=r11+(r26*20&-1)+64|0;r13=(r26<<3)+r25+(r1*88&-1)|0;r24=(r12+(r1*152&-1)+(r26*36&-1)|0)>>2;HEAP32[r24]=0;HEAP32[r24+1]=0;HEAP32[r24+2]=0;HEAP32[r24+3]=0;r24=HEAP32[r17+4>>2];HEAP32[r13>>2]=HEAP32[r17>>2];HEAP32[r13+4>>2]=r24;r24=r26+1|0;if((r24|0)==(r16|0)){break}else{r26=r24}}r26=r1+1|0;if((r26|0)>=(HEAP32[r7]|0)){r4=2384;break}r1=r26;r8=HEAP32[r3>>2]}if(r4==2375){___assert_func(5251820,71,5259920,5254440)}else if(r4==2384){return}}function __ZN15b2ContactSolver9WarmStartEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r2=r1+48|0;if((HEAP32[r2>>2]|0)<=0){return}r3=r1+40|0;r4=(r1+28|0)>>2;r1=0;while(1){r5=HEAP32[r3>>2],r6=r5>>2;r7=HEAP32[((r1*152&-1)+112>>2)+r6];r8=HEAP32[((r1*152&-1)+116>>2)+r6];r9=HEAPF32[((r1*152&-1)+120>>2)+r6];r10=HEAPF32[((r1*152&-1)+128>>2)+r6];r11=HEAPF32[((r1*152&-1)+124>>2)+r6];r12=HEAPF32[((r1*152&-1)+132>>2)+r6];r13=HEAP32[((r1*152&-1)+144>>2)+r6];r14=HEAP32[r4];r15=(r14+(r7*12&-1)|0)>>2;r16=HEAP32[r15+1];r17=(HEAP32[tempDoublePtr>>2]=HEAP32[r15],HEAPF32[tempDoublePtr>>2]);r18=(HEAP32[tempDoublePtr>>2]=r16,HEAPF32[tempDoublePtr>>2]);r16=HEAPF32[r14+(r7*12&-1)+8>>2];r19=r14+(r8*12&-1)|0;r20=HEAP32[r19+4>>2];r21=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAPF32[tempDoublePtr>>2]);r19=(HEAP32[tempDoublePtr>>2]=r20,HEAPF32[tempDoublePtr>>2]);r20=HEAPF32[r14+(r8*12&-1)+8>>2];r14=r5+(r1*152&-1)+72|0;r5=HEAP32[r14+4>>2];r22=(HEAP32[tempDoublePtr>>2]=HEAP32[r14>>2],HEAPF32[tempDoublePtr>>2]);r14=(HEAP32[tempDoublePtr>>2]=r5,HEAPF32[tempDoublePtr>>2]);r5=r22*-1;L3085:do{if((r13|0)>0){r23=r18;r24=r17;r25=r19;r26=r21;r27=r16;r28=r20;r29=0;while(1){r30=HEAPF32[((r1*152&-1)+(r29*36&-1)+16>>2)+r6];r31=HEAPF32[((r1*152&-1)+(r29*36&-1)+20>>2)+r6];r32=r22*r30+r14*r31;r33=r14*r30+r5*r31;r31=r27-r10*(HEAPF32[((r1*152&-1)+(r29*36&-1)>>2)+r6]*r33-HEAPF32[((r1*152&-1)+(r29*36&-1)+4>>2)+r6]*r32);r30=r24-r9*r32;r34=r23-r9*r33;r35=r28+r12*(r33*HEAPF32[((r1*152&-1)+(r29*36&-1)+8>>2)+r6]-r32*HEAPF32[((r1*152&-1)+(r29*36&-1)+12>>2)+r6]);r36=r26+r11*r32;r32=r25+r11*r33;r33=r29+1|0;if((r33|0)==(r13|0)){r37=r34;r38=r30;r39=r32;r40=r36;r41=r31;r42=r35;break L3085}else{r23=r34;r24=r30;r25=r32;r26=r36;r27=r31;r28=r35;r29=r33}}}else{r37=r18;r38=r17;r39=r19;r40=r21;r41=r16;r42=r20}}while(0);r20=(HEAPF32[tempDoublePtr>>2]=r38,HEAP32[tempDoublePtr>>2]);r16=(HEAPF32[tempDoublePtr>>2]=r37,HEAP32[tempDoublePtr>>2])|0;HEAP32[r15]=0|r20;HEAP32[r15+1]=r16;HEAPF32[HEAP32[r4]+(r7*12&-1)+8>>2]=r41;r16=HEAP32[r4]+(r8*12&-1)|0;r20=(HEAPF32[tempDoublePtr>>2]=r40,HEAP32[tempDoublePtr>>2]);r21=(HEAPF32[tempDoublePtr>>2]=r39,HEAP32[tempDoublePtr>>2])|0;HEAP32[r16>>2]=0|r20;HEAP32[r16+4>>2]=r21;HEAPF32[HEAP32[r4]+(r8*12&-1)+8>>2]=r42;r21=r1+1|0;if((r21|0)<(HEAP32[r2>>2]|0)){r1=r21}else{break}}return}function __ZN15b2ContactSolver29InitializeVelocityConstraintsEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+56|0;r4=r3;r5=r3+16;r6=r3+32;r7=r1+48|0;if((HEAP32[r7>>2]|0)<=0){STACKTOP=r3;return}r8=r1+40|0;r9=r1+36|0;r10=r1+44|0;r11=r1+24|0;r12=r1+28|0;r1=r4+8|0;r13=r4+12|0;r14=r5+8|0;r15=r5+12|0;r16=r4;r17=r5;r18=r6;r19=0;while(1){r20=HEAP32[r8>>2],r21=r20>>2;r22=HEAP32[r9>>2];r23=HEAP32[HEAP32[r10>>2]+(HEAP32[((r19*152&-1)+148>>2)+r21]<<2)>>2];r24=HEAP32[((r19*152&-1)+112>>2)+r21];r25=HEAP32[((r19*152&-1)+116>>2)+r21];r26=HEAPF32[((r19*152&-1)+120>>2)+r21];r27=HEAPF32[((r19*152&-1)+124>>2)+r21];r28=HEAPF32[((r19*152&-1)+128>>2)+r21];r29=HEAPF32[((r19*152&-1)+132>>2)+r21];r30=r22+(r19*88&-1)+48|0;r31=HEAP32[r30+4>>2];r32=(HEAP32[tempDoublePtr>>2]=HEAP32[r30>>2],HEAPF32[tempDoublePtr>>2]);r30=(HEAP32[tempDoublePtr>>2]=r31,HEAPF32[tempDoublePtr>>2]);r31=r22+(r19*88&-1)+56|0;r33=HEAP32[r31+4>>2];r34=(HEAP32[tempDoublePtr>>2]=HEAP32[r31>>2],HEAPF32[tempDoublePtr>>2]);r31=(HEAP32[tempDoublePtr>>2]=r33,HEAPF32[tempDoublePtr>>2]);r33=HEAP32[r11>>2];r35=r33+(r24*12&-1)|0;r36=HEAP32[r35+4>>2];r37=(HEAP32[tempDoublePtr>>2]=HEAP32[r35>>2],HEAPF32[tempDoublePtr>>2]);r35=(HEAP32[tempDoublePtr>>2]=r36,HEAPF32[tempDoublePtr>>2]);r36=HEAPF32[r33+(r24*12&-1)+8>>2];r38=HEAP32[r12>>2];r39=r38+(r24*12&-1)|0;r40=HEAP32[r39+4>>2];r41=(HEAP32[tempDoublePtr>>2]=HEAP32[r39>>2],HEAPF32[tempDoublePtr>>2]);r39=(HEAP32[tempDoublePtr>>2]=r40,HEAPF32[tempDoublePtr>>2]);r40=HEAPF32[r38+(r24*12&-1)+8>>2];r24=r33+(r25*12&-1)|0;r42=HEAP32[r24+4>>2];r43=(HEAP32[tempDoublePtr>>2]=HEAP32[r24>>2],HEAPF32[tempDoublePtr>>2]);r24=(HEAP32[tempDoublePtr>>2]=r42,HEAPF32[tempDoublePtr>>2]);r42=HEAPF32[r33+(r25*12&-1)+8>>2];r33=r38+(r25*12&-1)|0;r44=HEAP32[r33+4>>2];r45=(HEAP32[tempDoublePtr>>2]=HEAP32[r33>>2],HEAPF32[tempDoublePtr>>2]);r33=(HEAP32[tempDoublePtr>>2]=r44,HEAPF32[tempDoublePtr>>2]);r44=HEAPF32[r38+(r25*12&-1)+8>>2];if((HEAP32[r23+124>>2]|0)<=0){r2=2397;break}r25=HEAPF32[r22+(r19*88&-1)+80>>2];r38=HEAPF32[r22+(r19*88&-1)+76>>2];r22=Math.sin(r36);HEAPF32[r1>>2]=r22;r46=Math.cos(r36);HEAPF32[r13>>2]=r46;r36=Math.sin(r42);HEAPF32[r14>>2]=r36;r47=Math.cos(r42);HEAPF32[r15>>2]=r47;r42=(HEAPF32[tempDoublePtr>>2]=r37-(r32*r46-r30*r22),HEAP32[tempDoublePtr>>2]);r48=(HEAPF32[tempDoublePtr>>2]=r35-(r30*r46+r32*r22),HEAP32[tempDoublePtr>>2])|0;HEAP32[r16>>2]=0|r42;HEAP32[r16+4>>2]=r48;r48=(HEAPF32[tempDoublePtr>>2]=r43-(r34*r47-r31*r36),HEAP32[tempDoublePtr>>2]);r42=(HEAPF32[tempDoublePtr>>2]=r24-(r31*r47+r34*r36),HEAP32[tempDoublePtr>>2])|0;HEAP32[r17>>2]=0|r48;HEAP32[r17+4>>2]=r42;__ZN15b2WorldManifold10InitializeEPK10b2ManifoldRK11b2TransformfS5_f(r6,r23+64|0,r4,r38,r5,r25);r25=r20+(r19*152&-1)+72|0;r38=r25;r23=HEAP32[r18+4>>2];HEAP32[r38>>2]=HEAP32[r18>>2];HEAP32[r38+4>>2]=r23;r23=(r20+(r19*152&-1)+144|0)>>2;r38=HEAP32[r23];do{if((r38|0)>0){r42=(r20+(r19*152&-1)+76|0)>>2;r48=(r25|0)>>2;r36=r26+r27;r34=-r44;r47=-r40;r31=r20+(r19*152&-1)+140|0;r22=0;while(1){r32=HEAPF32[r6+(r22<<3)+8>>2];r46=r32-r37;r30=HEAPF32[r6+(r22<<3)+12>>2];r49=r20+(r19*152&-1)+(r22*36&-1)|0;r50=(HEAPF32[tempDoublePtr>>2]=r46,HEAP32[tempDoublePtr>>2]);r51=(HEAPF32[tempDoublePtr>>2]=r30-r35,HEAP32[tempDoublePtr>>2])|0;HEAP32[r49>>2]=0|r50;HEAP32[r49+4>>2]=r51;r51=r32-r43;r32=r20+(r19*152&-1)+(r22*36&-1)+8|0;r49=(HEAPF32[tempDoublePtr>>2]=r51,HEAP32[tempDoublePtr>>2]);r50=(HEAPF32[tempDoublePtr>>2]=r30-r24,HEAP32[tempDoublePtr>>2])|0;HEAP32[r32>>2]=0|r49;HEAP32[r32+4>>2]=r50;r50=HEAPF32[r42];r32=HEAPF32[((r19*152&-1)+(r22*36&-1)+4>>2)+r21];r49=HEAPF32[r48];r30=r46*r50-r32*r49;r52=HEAPF32[((r19*152&-1)+(r22*36&-1)+12>>2)+r21];r53=r50*r51-r49*r52;r49=r36+r30*r28*r30+r53*r29*r53;if(r49>0){r54=1/r49}else{r54=0}HEAPF32[((r19*152&-1)+(r22*36&-1)+24>>2)+r21]=r54;r49=HEAPF32[r42];r53=HEAPF32[r48]*-1;r30=r46*r53-r49*r32;r50=r53*r51-r49*r52;r49=r36+r30*r28*r30+r50*r29*r50;if(r49>0){r55=1/r49}else{r55=0}HEAPF32[((r19*152&-1)+(r22*36&-1)+28>>2)+r21]=r55;r49=r20+(r19*152&-1)+(r22*36&-1)+32|0;HEAPF32[r49>>2]=0;r50=HEAPF32[r48]*(r45+r52*r34-r41-r32*r47)+HEAPF32[r42]*(r33+r44*r51-r39-r40*r46);if(r50<-1){HEAPF32[r49>>2]=r50*-HEAPF32[r31>>2]}r50=r22+1|0;if((r50|0)==(r38|0)){break}else{r22=r50}}if((HEAP32[r23]|0)!=2){break}r22=HEAPF32[((r19*152&-1)+76>>2)+r21];r31=HEAPF32[r25>>2];r42=HEAPF32[((r19*152&-1)>>2)+r21]*r22-HEAPF32[((r19*152&-1)+4>>2)+r21]*r31;r47=r22*HEAPF32[((r19*152&-1)+8>>2)+r21]-r31*HEAPF32[((r19*152&-1)+12>>2)+r21];r34=r22*HEAPF32[((r19*152&-1)+36>>2)+r21]-r31*HEAPF32[((r19*152&-1)+40>>2)+r21];r48=r22*HEAPF32[((r19*152&-1)+44>>2)+r21]-r31*HEAPF32[((r19*152&-1)+48>>2)+r21];r31=r26+r27;r22=r28*r42;r36=r29*r47;r50=r31+r42*r22+r47*r36;r47=r31+r34*r28*r34+r48*r29*r48;r42=r31+r22*r34+r36*r48;r48=r50*r47-r42*r42;if(r50*r50>=r48*1e3){HEAP32[r23]=1;break}HEAPF32[((r19*152&-1)+96>>2)+r21]=r50;HEAPF32[((r19*152&-1)+100>>2)+r21]=r42;HEAPF32[((r19*152&-1)+104>>2)+r21]=r42;HEAPF32[((r19*152&-1)+108>>2)+r21]=r47;if(r48!=0){r56=1/r48}else{r56=r48}r48=r42*-r56;HEAPF32[((r19*152&-1)+80>>2)+r21]=r47*r56;HEAPF32[((r19*152&-1)+84>>2)+r21]=r48;HEAPF32[((r19*152&-1)+88>>2)+r21]=r48;HEAPF32[((r19*152&-1)+92>>2)+r21]=r50*r56}}while(0);r21=r19+1|0;if((r21|0)<(HEAP32[r7>>2]|0)){r19=r21}else{r2=2415;break}}if(r2==2397){___assert_func(5251820,168,5259976,5252036)}else if(r2==2415){STACKTOP=r3;return}}function __ZN15b2ContactSolver24SolvePositionConstraintsEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74;r2=STACKTOP;STACKTOP=STACKTOP+52|0;r3=r2;r4=r2+16;r5=r2+32;r6=r1+48|0;if((HEAP32[r6>>2]|0)<=0){r7=0;r8=r7>=-.014999999664723873;STACKTOP=r2;return r8}r9=r1+36|0;r10=(r1+24|0)>>2;r1=r3+8|0;r11=r3+12|0;r12=r4+8|0;r13=r4+12|0;r14=r3;r15=r4;r16=r5;r17=r5+8|0;r18=r5+16|0;r19=0;r20=0;while(1){r21=HEAP32[r9>>2],r22=r21>>2;r23=r21+(r19*88&-1)|0;r24=HEAP32[((r19*88&-1)+32>>2)+r22];r25=HEAP32[((r19*88&-1)+36>>2)+r22];r26=r21+(r19*88&-1)+48|0;r27=HEAP32[r26+4>>2];r28=(HEAP32[tempDoublePtr>>2]=HEAP32[r26>>2],HEAPF32[tempDoublePtr>>2]);r26=(HEAP32[tempDoublePtr>>2]=r27,HEAPF32[tempDoublePtr>>2]);r27=HEAPF32[((r19*88&-1)+40>>2)+r22];r29=HEAPF32[((r19*88&-1)+64>>2)+r22];r30=r21+(r19*88&-1)+56|0;r21=HEAP32[r30+4>>2];r31=(HEAP32[tempDoublePtr>>2]=HEAP32[r30>>2],HEAPF32[tempDoublePtr>>2]);r30=(HEAP32[tempDoublePtr>>2]=r21,HEAPF32[tempDoublePtr>>2]);r21=HEAPF32[((r19*88&-1)+44>>2)+r22];r32=HEAPF32[((r19*88&-1)+68>>2)+r22];r33=HEAP32[((r19*88&-1)+84>>2)+r22];r22=HEAP32[r10];r34=r22+(r24*12&-1)|0;r35=HEAP32[r34+4>>2];r36=(HEAP32[tempDoublePtr>>2]=HEAP32[r34>>2],HEAPF32[tempDoublePtr>>2]);r34=(HEAP32[tempDoublePtr>>2]=r35,HEAPF32[tempDoublePtr>>2]);r35=HEAPF32[r22+(r24*12&-1)+8>>2];r37=r22+(r25*12&-1)|0;r38=HEAP32[r37+4>>2];r39=(HEAP32[tempDoublePtr>>2]=HEAP32[r37>>2],HEAPF32[tempDoublePtr>>2]);r37=(HEAP32[tempDoublePtr>>2]=r38,HEAPF32[tempDoublePtr>>2]);r38=HEAPF32[r22+(r25*12&-1)+8>>2];if((r33|0)>0){r40=r27+r21;r41=r34;r42=r36;r43=r37;r44=r39;r45=0;r46=r38;r47=r35;r48=r20;while(1){r49=Math.sin(r47);HEAPF32[r1>>2]=r49;r50=Math.cos(r47);HEAPF32[r11>>2]=r50;r51=Math.sin(r46);HEAPF32[r12>>2]=r51;r52=Math.cos(r46);HEAPF32[r13>>2]=r52;r53=(HEAPF32[tempDoublePtr>>2]=r42-(r28*r50-r26*r49),HEAP32[tempDoublePtr>>2]);r54=(HEAPF32[tempDoublePtr>>2]=r41-(r26*r50+r28*r49),HEAP32[tempDoublePtr>>2])|0;HEAP32[r14>>2]=0|r53;HEAP32[r14+4>>2]=r54;r54=(HEAPF32[tempDoublePtr>>2]=r44-(r31*r52-r30*r51),HEAP32[tempDoublePtr>>2]);r53=(HEAPF32[tempDoublePtr>>2]=r43-(r30*r52+r31*r51),HEAP32[tempDoublePtr>>2])|0;HEAP32[r15>>2]=0|r54;HEAP32[r15+4>>2]=r53;__ZN24b2PositionSolverManifold10InitializeEP27b2ContactPositionConstraintRK11b2TransformS4_i(r5,r23,r3,r4,r45);r53=HEAP32[r16+4>>2];r54=(HEAP32[tempDoublePtr>>2]=HEAP32[r16>>2],HEAPF32[tempDoublePtr>>2]);r51=(HEAP32[tempDoublePtr>>2]=r53,HEAPF32[tempDoublePtr>>2]);r53=HEAP32[r17+4>>2];r52=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAPF32[tempDoublePtr>>2]);r49=(HEAP32[tempDoublePtr>>2]=r53,HEAPF32[tempDoublePtr>>2]);r53=HEAPF32[r18>>2];r50=r52-r42;r55=r49-r41;r56=r52-r44;r52=r49-r43;r57=r48<r53?r48:r53;r49=(r53+.004999999888241291)*.20000000298023224;r53=r49<0?r49:0;r49=r51*r50-r54*r55;r58=r51*r56-r54*r52;r59=r58*r32*r58+r40+r49*r29*r49;if(r59>0){r60=-(r53<-.20000000298023224?-.20000000298023224:r53)/r59}else{r60=0}r59=r54*r60;r54=r51*r60;r61=r42-r27*r59;r62=r41-r27*r54;r63=r47-r29*(r50*r54-r55*r59);r64=r44+r21*r59;r65=r43+r21*r54;r66=r46+r32*(r56*r54-r52*r59);r59=r45+1|0;if((r59|0)==(r33|0)){break}else{r41=r62;r42=r61;r43=r65;r44=r64;r45=r59;r46=r66;r47=r63;r48=r57}}r67=r62;r68=r61;r69=r65;r70=r64;r71=r66;r72=r63;r73=r57;r74=HEAP32[r10]}else{r67=r34;r68=r36;r69=r37;r70=r39;r71=r38;r72=r35;r73=r20;r74=r22}r48=r74+(r24*12&-1)|0;r47=(HEAPF32[tempDoublePtr>>2]=r68,HEAP32[tempDoublePtr>>2]);r46=(HEAPF32[tempDoublePtr>>2]=r67,HEAP32[tempDoublePtr>>2])|0;HEAP32[r48>>2]=0|r47;HEAP32[r48+4>>2]=r46;HEAPF32[HEAP32[r10]+(r24*12&-1)+8>>2]=r72;r46=HEAP32[r10]+(r25*12&-1)|0;r48=(HEAPF32[tempDoublePtr>>2]=r70,HEAP32[tempDoublePtr>>2]);r47=(HEAPF32[tempDoublePtr>>2]=r69,HEAP32[tempDoublePtr>>2])|0;HEAP32[r46>>2]=0|r48;HEAP32[r46+4>>2]=r47;HEAPF32[HEAP32[r10]+(r25*12&-1)+8>>2]=r71;r47=r19+1|0;if((r47|0)<(HEAP32[r6>>2]|0)){r19=r47;r20=r73}else{r7=r73;break}}r8=r7>=-.014999999664723873;STACKTOP=r2;return r8}function __ZN15b2ContactSolver24SolveVelocityConstraintsEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60;r2=0;r3=r1+48|0;if((HEAP32[r3>>2]|0)<=0){return}r4=r1+40|0;r5=(r1+28|0)>>2;r1=0;L3142:while(1){r6=HEAP32[r4>>2],r7=r6>>2;r8=r6+(r1*152&-1)|0;r9=HEAP32[((r1*152&-1)+112>>2)+r7];r10=HEAP32[((r1*152&-1)+116>>2)+r7];r11=HEAPF32[((r1*152&-1)+120>>2)+r7];r12=HEAPF32[((r1*152&-1)+128>>2)+r7];r13=HEAPF32[((r1*152&-1)+124>>2)+r7];r14=HEAPF32[((r1*152&-1)+132>>2)+r7];r15=r6+(r1*152&-1)+144|0;r16=HEAP32[r15>>2];r17=HEAP32[r5];r18=r17+(r9*12&-1)|0;r19=HEAP32[r18+4>>2];r20=(HEAP32[tempDoublePtr>>2]=HEAP32[r18>>2],HEAPF32[tempDoublePtr>>2]);r18=(HEAP32[tempDoublePtr>>2]=r19,HEAPF32[tempDoublePtr>>2]);r19=HEAPF32[r17+(r9*12&-1)+8>>2];r21=r17+(r10*12&-1)|0;r22=HEAP32[r21+4>>2];r23=(HEAP32[tempDoublePtr>>2]=HEAP32[r21>>2],HEAPF32[tempDoublePtr>>2]);r21=(HEAP32[tempDoublePtr>>2]=r22,HEAPF32[tempDoublePtr>>2]);r22=HEAPF32[r17+(r10*12&-1)+8>>2];r17=r6+(r1*152&-1)+72|0;r24=HEAP32[r17+4>>2];r25=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAPF32[tempDoublePtr>>2]);r17=(HEAP32[tempDoublePtr>>2]=r24,HEAPF32[tempDoublePtr>>2]);r24=r25*-1;r26=HEAPF32[((r1*152&-1)+136>>2)+r7];if((r16-1|0)>>>0<2){r27=r18;r28=r20;r29=r21;r30=r23;r31=0;r32=r22;r33=r19}else{r2=2432;break}while(1){r19=HEAPF32[((r1*152&-1)+(r31*36&-1)+12>>2)+r7];r22=HEAPF32[((r1*152&-1)+(r31*36&-1)+8>>2)+r7];r23=HEAPF32[((r1*152&-1)+(r31*36&-1)+4>>2)+r7];r21=HEAPF32[((r1*152&-1)+(r31*36&-1)>>2)+r7];r20=r26*HEAPF32[((r1*152&-1)+(r31*36&-1)+16>>2)+r7];r18=r6+(r1*152&-1)+(r31*36&-1)+20|0;r34=HEAPF32[r18>>2];r35=r34+HEAPF32[((r1*152&-1)+(r31*36&-1)+28>>2)+r7]*-(r17*(r30+r19*-r32-r28-r23*-r33)+r24*(r29+r32*r22-r27-r33*r21));r36=-r20;r37=r35<r20?r35:r20;r20=r37<r36?r36:r37;r37=r20-r34;HEAPF32[r18>>2]=r20;r20=r17*r37;r18=r24*r37;r38=r28-r11*r20;r39=r27-r11*r18;r40=r33-r12*(r21*r18-r23*r20);r41=r30+r13*r20;r42=r29+r13*r18;r43=r32+r14*(r22*r18-r19*r20);r20=r31+1|0;if((r20|0)==(r16|0)){break}else{r27=r39;r28=r38;r29=r42;r30=r41;r31=r20;r32=r43;r33=r40}}L3147:do{if((HEAP32[r15>>2]|0)==1){r16=HEAPF32[((r1*152&-1)+12>>2)+r7];r24=HEAPF32[((r1*152&-1)+8>>2)+r7];r26=HEAPF32[((r1*152&-1)+4>>2)+r7];r20=HEAPF32[r8>>2];r19=r6+(r1*152&-1)+16|0;r18=HEAPF32[r19>>2];r22=r18+(r25*(r41+r16*-r43-r38-r26*-r40)+r17*(r42+r43*r24-r39-r40*r20)-HEAPF32[((r1*152&-1)+32>>2)+r7])*-HEAPF32[((r1*152&-1)+24>>2)+r7];r23=r22>0?r22:0;r22=r23-r18;HEAPF32[r19>>2]=r23;r23=r25*r22;r19=r17*r22;r44=r40-r12*(r20*r19-r26*r23);r45=r43+r14*(r24*r19-r16*r23);r46=r41+r13*r23;r47=r42+r13*r19;r48=r38-r11*r23;r49=r39-r11*r19}else{r19=(r6+(r1*152&-1)+16|0)>>2;r23=HEAPF32[r19];r16=(r6+(r1*152&-1)+52|0)>>2;r24=HEAPF32[r16];if(r23<0|r24<0){r2=2437;break L3142}r26=-r43;r20=HEAPF32[((r1*152&-1)+12>>2)+r7];r22=HEAPF32[((r1*152&-1)+8>>2)+r7];r18=-r40;r21=HEAPF32[((r1*152&-1)+4>>2)+r7];r37=HEAPF32[r8>>2];r34=HEAPF32[((r1*152&-1)+48>>2)+r7];r36=HEAPF32[((r1*152&-1)+44>>2)+r7];r35=HEAPF32[((r1*152&-1)+40>>2)+r7];r50=HEAPF32[((r1*152&-1)+36>>2)+r7];r51=HEAPF32[((r1*152&-1)+104>>2)+r7];r52=HEAPF32[((r1*152&-1)+100>>2)+r7];r53=r25*(r41+r20*r26-r38-r21*r18)+r17*(r42+r43*r22-r39-r40*r37)-HEAPF32[((r1*152&-1)+32>>2)+r7]-(r23*HEAPF32[((r1*152&-1)+96>>2)+r7]+r24*r51);r54=r25*(r41+r34*r26-r38-r35*r18)+r17*(r42+r43*r36-r39-r40*r50)-HEAPF32[((r1*152&-1)+68>>2)+r7]-(r23*r52+r24*HEAPF32[((r1*152&-1)+108>>2)+r7]);r18=HEAPF32[((r1*152&-1)+80>>2)+r7]*r53+HEAPF32[((r1*152&-1)+88>>2)+r7]*r54;r26=r53*HEAPF32[((r1*152&-1)+84>>2)+r7]+r54*HEAPF32[((r1*152&-1)+92>>2)+r7];r55=-r18;r56=-r26;if(!(r18>-0|r26>-0)){r26=r55-r23;r18=r56-r24;r57=r25*r26;r58=r17*r26;r26=r25*r18;r59=r17*r18;r18=r57+r26;r60=r58+r59;HEAPF32[r19]=r55;HEAPF32[r16]=r56;r44=r40-r12*(r37*r58-r21*r57+(r50*r59-r35*r26));r45=r43+r14*(r22*r58-r20*r57+(r36*r59-r34*r26));r46=r41+r13*r18;r47=r42+r13*r60;r48=r38-r11*r18;r49=r39-r11*r60;break}r60=r53*-HEAPF32[((r1*152&-1)+24>>2)+r7];do{if(r60>=0){if(r54+r60*r52<0){break}r18=r60-r23;r26=-r24;r59=r25*r18;r57=r17*r18;r18=r25*r26;r58=r17*r26;r26=r18+r59;r56=r58+r57;HEAPF32[r19]=r60;HEAPF32[r16]=0;r44=r40-r12*(r57*r37-r59*r21+(r58*r50-r18*r35));r45=r43+r14*(r57*r22-r59*r20+(r58*r36-r18*r34));r46=r41+r13*r26;r47=r42+r13*r56;r48=r38-r11*r26;r49=r39-r11*r56;break L3147}}while(0);r60=r54*-HEAPF32[((r1*152&-1)+60>>2)+r7];do{if(r60>=0){if(r53+r60*r51<0){break}r52=-r23;r56=r60-r24;r26=r25*r52;r18=r17*r52;r52=r25*r56;r58=r17*r56;r56=r26+r52;r59=r18+r58;HEAPF32[r19]=0;HEAPF32[r16]=r60;r44=r40-r12*(r18*r37-r26*r21+(r58*r50-r52*r35));r45=r43+r14*(r18*r22-r26*r20+(r58*r36-r52*r34));r46=r41+r13*r56;r47=r42+r13*r59;r48=r38-r11*r56;r49=r39-r11*r59;break L3147}}while(0);if(r53<0|r54<0){r44=r40;r45=r43;r46=r41;r47=r42;r48=r38;r49=r39;break}r60=-r23;r51=-r24;r59=r25*r60;r56=r17*r60;r60=r25*r51;r52=r17*r51;r51=r59+r60;r58=r56+r52;HEAPF32[r19]=0;HEAPF32[r16]=0;r44=r40-r12*(r56*r37-r59*r21+(r52*r50-r60*r35));r45=r43+r14*(r56*r22-r59*r20+(r52*r36-r60*r34));r46=r41+r13*r51;r47=r42+r13*r58;r48=r38-r11*r51;r49=r39-r11*r58}}while(0);r11=HEAP32[r5]+(r9*12&-1)|0;r13=(HEAPF32[tempDoublePtr>>2]=r48,HEAP32[tempDoublePtr>>2]);r14=(HEAPF32[tempDoublePtr>>2]=r49,HEAP32[tempDoublePtr>>2])|0;HEAP32[r11>>2]=0|r13;HEAP32[r11+4>>2]=r14;HEAPF32[HEAP32[r5]+(r9*12&-1)+8>>2]=r44;r14=HEAP32[r5]+(r10*12&-1)|0;r11=(HEAPF32[tempDoublePtr>>2]=r46,HEAP32[tempDoublePtr>>2]);r13=(HEAPF32[tempDoublePtr>>2]=r47,HEAP32[tempDoublePtr>>2])|0;HEAP32[r14>>2]=0|r11;HEAP32[r14+4>>2]=r13;HEAPF32[HEAP32[r5]+(r10*12&-1)+8>>2]=r45;r13=r1+1|0;if((r13|0)<(HEAP32[r3>>2]|0)){r1=r13}else{r2=2450;break}}if(r2==2437){___assert_func(5251820,406,5260032,5248876)}else if(r2==2432){___assert_func(5251820,311,5260032,5249848)}else if(r2==2450){return}}function __ZN22b2EdgeAndCircleContactD1Ev(r1){return}function __ZN23b2EdgeAndPolygonContactD1Ev(r1){return}function __ZN25b2PolygonAndCircleContactD1Ev(r1){return}function __ZN15b2ContactSolver27SolveTOIPositionConstraintsEii(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76;r4=STACKTOP;STACKTOP=STACKTOP+52|0;r5=r4;r6=r4+16;r7=r4+32;r8=r1+48|0;if((HEAP32[r8>>2]|0)<=0){r9=0;r10=r9>=-.007499999832361937;STACKTOP=r4;return r10}r11=r1+36|0;r12=(r1+24|0)>>2;r1=r5+8|0;r13=r5+12|0;r14=r6+8|0;r15=r6+12|0;r16=r5;r17=r6;r18=r7;r19=r7+8|0;r20=r7+16|0;r21=0;r22=0;while(1){r23=HEAP32[r11>>2],r24=r23>>2;r25=r23+(r21*88&-1)|0;r26=HEAP32[((r21*88&-1)+32>>2)+r24];r27=HEAP32[((r21*88&-1)+36>>2)+r24];r28=r23+(r21*88&-1)+48|0;r29=HEAP32[r28+4>>2];r30=(HEAP32[tempDoublePtr>>2]=HEAP32[r28>>2],HEAPF32[tempDoublePtr>>2]);r28=(HEAP32[tempDoublePtr>>2]=r29,HEAPF32[tempDoublePtr>>2]);r29=r23+(r21*88&-1)+56|0;r23=HEAP32[r29+4>>2];r31=(HEAP32[tempDoublePtr>>2]=HEAP32[r29>>2],HEAPF32[tempDoublePtr>>2]);r29=(HEAP32[tempDoublePtr>>2]=r23,HEAPF32[tempDoublePtr>>2]);r23=HEAP32[((r21*88&-1)+84>>2)+r24];if((r26|0)==(r2|0)|(r26|0)==(r3|0)){r32=HEAPF32[((r21*88&-1)+40>>2)+r24];r33=HEAPF32[((r21*88&-1)+64>>2)+r24]}else{r32=0;r33=0}r34=HEAPF32[((r21*88&-1)+44>>2)+r24];r35=HEAPF32[((r21*88&-1)+68>>2)+r24];r24=HEAP32[r12];r36=r24+(r26*12&-1)|0;r37=HEAP32[r36+4>>2];r38=(HEAP32[tempDoublePtr>>2]=HEAP32[r36>>2],HEAPF32[tempDoublePtr>>2]);r36=(HEAP32[tempDoublePtr>>2]=r37,HEAPF32[tempDoublePtr>>2]);r37=HEAPF32[r24+(r26*12&-1)+8>>2];r39=r24+(r27*12&-1)|0;r40=HEAP32[r39+4>>2];r41=(HEAP32[tempDoublePtr>>2]=HEAP32[r39>>2],HEAPF32[tempDoublePtr>>2]);r39=(HEAP32[tempDoublePtr>>2]=r40,HEAPF32[tempDoublePtr>>2]);r40=HEAPF32[r24+(r27*12&-1)+8>>2];if((r23|0)>0){r42=r32+r34;r43=r36;r44=r38;r45=r39;r46=r41;r47=r37;r48=r40;r49=0;r50=r22;while(1){r51=Math.sin(r47);HEAPF32[r1>>2]=r51;r52=Math.cos(r47);HEAPF32[r13>>2]=r52;r53=Math.sin(r48);HEAPF32[r14>>2]=r53;r54=Math.cos(r48);HEAPF32[r15>>2]=r54;r55=(HEAPF32[tempDoublePtr>>2]=r44-(r30*r52-r28*r51),HEAP32[tempDoublePtr>>2]);r56=(HEAPF32[tempDoublePtr>>2]=r43-(r28*r52+r30*r51),HEAP32[tempDoublePtr>>2])|0;HEAP32[r16>>2]=0|r55;HEAP32[r16+4>>2]=r56;r56=(HEAPF32[tempDoublePtr>>2]=r46-(r31*r54-r29*r53),HEAP32[tempDoublePtr>>2]);r55=(HEAPF32[tempDoublePtr>>2]=r45-(r29*r54+r31*r53),HEAP32[tempDoublePtr>>2])|0;HEAP32[r17>>2]=0|r56;HEAP32[r17+4>>2]=r55;__ZN24b2PositionSolverManifold10InitializeEP27b2ContactPositionConstraintRK11b2TransformS4_i(r7,r25,r5,r6,r49);r55=HEAP32[r18+4>>2];r56=(HEAP32[tempDoublePtr>>2]=HEAP32[r18>>2],HEAPF32[tempDoublePtr>>2]);r53=(HEAP32[tempDoublePtr>>2]=r55,HEAPF32[tempDoublePtr>>2]);r55=HEAP32[r19+4>>2];r54=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAPF32[tempDoublePtr>>2]);r51=(HEAP32[tempDoublePtr>>2]=r55,HEAPF32[tempDoublePtr>>2]);r55=HEAPF32[r20>>2];r52=r54-r44;r57=r51-r43;r58=r54-r46;r54=r51-r45;r59=r50<r55?r50:r55;r51=(r55+.004999999888241291)*.75;r55=r51<0?r51:0;r51=r53*r52-r56*r57;r60=r53*r58-r56*r54;r61=r60*r35*r60+r42+r51*r33*r51;if(r61>0){r62=-(r55<-.20000000298023224?-.20000000298023224:r55)/r61}else{r62=0}r61=r56*r62;r56=r53*r62;r63=r44-r32*r61;r64=r43-r32*r56;r65=r47-r33*(r52*r56-r57*r61);r66=r46+r34*r61;r67=r45+r34*r56;r68=r48+r35*(r58*r56-r54*r61);r61=r49+1|0;if((r61|0)==(r23|0)){break}else{r43=r64;r44=r63;r45=r67;r46=r66;r47=r65;r48=r68;r49=r61;r50=r59}}r69=r64;r70=r63;r71=r67;r72=r66;r73=r65;r74=r68;r75=r59;r76=HEAP32[r12]}else{r69=r36;r70=r38;r71=r39;r72=r41;r73=r37;r74=r40;r75=r22;r76=r24}r50=r76+(r26*12&-1)|0;r49=(HEAPF32[tempDoublePtr>>2]=r70,HEAP32[tempDoublePtr>>2]);r48=(HEAPF32[tempDoublePtr>>2]=r69,HEAP32[tempDoublePtr>>2])|0;HEAP32[r50>>2]=0|r49;HEAP32[r50+4>>2]=r48;HEAPF32[HEAP32[r12]+(r26*12&-1)+8>>2]=r73;r48=HEAP32[r12]+(r27*12&-1)|0;r50=(HEAPF32[tempDoublePtr>>2]=r72,HEAP32[tempDoublePtr>>2]);r49=(HEAPF32[tempDoublePtr>>2]=r71,HEAP32[tempDoublePtr>>2])|0;HEAP32[r48>>2]=0|r50;HEAP32[r48+4>>2]=r49;HEAPF32[HEAP32[r12]+(r27*12&-1)+8>>2]=r74;r49=r21+1|0;if((r49|0)<(HEAP32[r8>>2]|0)){r21=r49;r22=r75}else{r9=r75;break}}r10=r9>=-.007499999832361937;STACKTOP=r4;return r10}function __ZN22b2EdgeAndCircleContact8EvaluateEP10b2ManifoldRK11b2TransformS4_(r1,r2,r3,r4){__Z22b2CollideEdgeAndCircleP10b2ManifoldPK11b2EdgeShapeRK11b2TransformPK13b2CircleShapeS6_(r2,HEAP32[HEAP32[r1+48>>2]+12>>2],r3,HEAP32[HEAP32[r1+52>>2]+12>>2],r4);return}function __ZN22b2EdgeAndCircleContactD0Ev(r1){__ZdlPv(r1);return}function __ZN23b2EdgeAndPolygonContact8EvaluateEP10b2ManifoldRK11b2TransformS4_(r1,r2,r3,r4){var r5;r5=STACKTOP;STACKTOP=STACKTOP+252|0;__ZN12b2EPCollider7CollideEP10b2ManifoldPK11b2EdgeShapeRK11b2TransformPK14b2PolygonShapeS7_(r5,r2,HEAP32[HEAP32[r1+48>>2]+12>>2],r3,HEAP32[HEAP32[r1+52>>2]+12>>2],r4);STACKTOP=r5;return}function __ZN23b2EdgeAndPolygonContactD0Ev(r1){__ZdlPv(r1);return}function __ZN25b2PolygonAndCircleContact8EvaluateEP10b2ManifoldRK11b2TransformS4_(r1,r2,r3,r4){__Z25b2CollidePolygonAndCircleP10b2ManifoldPK14b2PolygonShapeRK11b2TransformPK13b2CircleShapeS6_(r2,HEAP32[HEAP32[r1+48>>2]+12>>2],r3,HEAP32[HEAP32[r1+52>>2]+12>>2],r4);return}function __ZN25b2PolygonAndCircleContactD0Ev(r1){__ZdlPv(r1);return}function __ZN24b2PositionSolverManifold10InitializeEP27b2ContactPositionConstraintRK11b2TransformS4_i(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r6=r4>>2;r7=r3>>2;r8=r2>>2;r2=r1>>2;if((HEAP32[r8+21]|0)<=0){___assert_func(5251820,617,5258624,5248420)}r9=HEAP32[r8+18];if((r9|0)==2){r10=r4+12|0;r11=HEAPF32[r10>>2];r12=HEAPF32[r8+4];r13=r4+8|0;r4=HEAPF32[r13>>2];r14=HEAPF32[r8+5];r15=r11*r12-r4*r14;r16=r12*r4+r11*r14;r14=r1>>2;r11=(HEAPF32[tempDoublePtr>>2]=r15,HEAP32[tempDoublePtr>>2]);r4=(HEAPF32[tempDoublePtr>>2]=r16,HEAP32[tempDoublePtr>>2])|0;HEAP32[r14]=0|r11;HEAP32[r14+1]=r4;r4=HEAPF32[r10>>2];r10=HEAPF32[r8+6];r11=HEAPF32[r13>>2];r13=HEAPF32[r8+7];r12=HEAPF32[r7+3];r17=HEAPF32[(r5<<3>>2)+r8];r18=HEAPF32[r7+2];r19=HEAPF32[((r5<<3)+4>>2)+r8];r20=HEAPF32[r7]+(r12*r17-r18*r19);r21=r17*r18+r12*r19+HEAPF32[r7+1];HEAPF32[r2+4]=r15*(r20-(HEAPF32[r6]+(r4*r10-r11*r13)))+(r21-(r10*r11+r4*r13+HEAPF32[r6+1]))*r16-HEAPF32[r8+19]-HEAPF32[r8+20];r13=r1+8|0;r4=(HEAPF32[tempDoublePtr>>2]=r20,HEAP32[tempDoublePtr>>2]);r20=(HEAPF32[tempDoublePtr>>2]=r21,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r4;HEAP32[r13+4>>2]=r20;r20=(HEAPF32[tempDoublePtr>>2]=-r15,HEAP32[tempDoublePtr>>2]);r15=(HEAPF32[tempDoublePtr>>2]=-r16,HEAP32[tempDoublePtr>>2])|0;HEAP32[r14]=0|r20;HEAP32[r14+1]=r15;return}else if((r9|0)==1){r15=r3+12|0;r14=HEAPF32[r15>>2];r20=HEAPF32[r8+4];r16=r3+8|0;r3=HEAPF32[r16>>2];r13=HEAPF32[r8+5];r4=r14*r20-r3*r13;r21=r20*r3+r14*r13;r13=r1;r14=(HEAPF32[tempDoublePtr>>2]=r4,HEAP32[tempDoublePtr>>2]);r3=(HEAPF32[tempDoublePtr>>2]=r21,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r14;HEAP32[r13+4>>2]=r3;r3=HEAPF32[r15>>2];r15=HEAPF32[r8+6];r13=HEAPF32[r16>>2];r16=HEAPF32[r8+7];r14=HEAPF32[r6+3];r20=HEAPF32[(r5<<3>>2)+r8];r11=HEAPF32[r6+2];r10=HEAPF32[((r5<<3)+4>>2)+r8];r5=HEAPF32[r6]+(r14*r20-r11*r10);r19=r20*r11+r14*r10+HEAPF32[r6+1];HEAPF32[r2+4]=r4*(r5-(HEAPF32[r7]+(r3*r15-r13*r16)))+(r19-(r15*r13+r3*r16+HEAPF32[r7+1]))*r21-HEAPF32[r8+19]-HEAPF32[r8+20];r21=r1+8|0;r16=(HEAPF32[tempDoublePtr>>2]=r5,HEAP32[tempDoublePtr>>2]);r5=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2])|0;HEAP32[r21>>2]=0|r16;HEAP32[r21+4>>2]=r5;return}else if((r9|0)==0){r9=HEAPF32[r7+3];r5=HEAPF32[r8+6];r21=HEAPF32[r7+2];r16=HEAPF32[r8+7];r19=HEAPF32[r7]+(r9*r5-r21*r16);r3=r5*r21+r9*r16+HEAPF32[r7+1];r7=HEAPF32[r6+3];r16=HEAPF32[r8];r9=HEAPF32[r6+2];r21=HEAPF32[r8+1];r5=HEAPF32[r6]+(r7*r16-r9*r21);r13=r16*r9+r7*r21+HEAPF32[r6+1];r6=r5-r19;r21=r13-r3;r7=r1;r9=(HEAPF32[tempDoublePtr>>2]=r6,HEAP32[tempDoublePtr>>2]);r16=(HEAPF32[tempDoublePtr>>2]=r21,HEAP32[tempDoublePtr>>2])|0;HEAP32[r7>>2]=0|r9;HEAP32[r7+4>>2]=r16;r16=Math.sqrt(r6*r6+r21*r21);if(r16<1.1920928955078125e-7){r22=r6;r23=r21}else{r7=1/r16;r16=r6*r7;HEAPF32[r2]=r16;r9=r21*r7;HEAPF32[r2+1]=r9;r22=r16;r23=r9}r9=r1+8|0;r1=(HEAPF32[tempDoublePtr>>2]=(r19+r5)*.5,HEAP32[tempDoublePtr>>2]);r5=(HEAPF32[tempDoublePtr>>2]=(r3+r13)*.5,HEAP32[tempDoublePtr>>2])|0;HEAP32[r9>>2]=0|r1;HEAP32[r9+4>>2]=r5;HEAPF32[r2+4]=r6*r22+r21*r23-HEAPF32[r8+19]-HEAPF32[r8+20];return}else{return}}function __ZN22b2EdgeAndCircleContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator(r1,r2,r3,r4,r5){var r6,r7,r8,r9;r4=__ZN16b2BlockAllocator8AllocateEi(r5,144),r5=r4>>2;if((r4|0)==0){r6=0;r7=r6|0;return r7}r2=r4;HEAP32[r2>>2]=5261444;HEAP32[r5+1]=4;HEAP32[r5+12]=r1;HEAP32[r5+13]=r3;HEAP32[r5+14]=0;HEAP32[r5+15]=0;HEAP32[r5+31]=0;HEAP32[r5+32]=0;_memset(r4+8|0,0,40);HEAPF32[r5+34]=Math.sqrt(HEAPF32[r1+16>>2]*HEAPF32[r3+16>>2]);r8=HEAPF32[r1+20>>2];r9=HEAPF32[r3+20>>2];HEAPF32[r5+35]=r8>r9?r8:r9;HEAP32[r2>>2]=5261660;if((HEAP32[HEAP32[r1+12>>2]+4>>2]|0)!=1){___assert_func(5251248,41,5259008,5254288)}if((HEAP32[HEAP32[r3+12>>2]+4>>2]|0)==0){r6=r4;r7=r6|0;return r7}else{___assert_func(5251248,42,5259008,5251992)}}function __ZN22b2EdgeAndCircleContact7DestroyEP9b2ContactP16b2BlockAllocator(r1,r2){var r3,r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);r3=HEAP8[5263996];if((r3&255)<14){r4=((r3&255)<<2)+r2+12|0;HEAP32[r1>>2]=HEAP32[r4>>2];HEAP32[r4>>2]=r1;return}else{___assert_func(5248148,173,5259684,5249276)}}function __ZN23b2EdgeAndPolygonContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator(r1,r2,r3,r4,r5){var r6,r7,r8,r9;r4=__ZN16b2BlockAllocator8AllocateEi(r5,144),r5=r4>>2;if((r4|0)==0){r6=0;r7=r6|0;return r7}r2=r4;HEAP32[r2>>2]=5261444;HEAP32[r5+1]=4;HEAP32[r5+12]=r1;HEAP32[r5+13]=r3;HEAP32[r5+14]=0;HEAP32[r5+15]=0;HEAP32[r5+31]=0;HEAP32[r5+32]=0;_memset(r4+8|0,0,40);HEAPF32[r5+34]=Math.sqrt(HEAPF32[r1+16>>2]*HEAPF32[r3+16>>2]);r8=HEAPF32[r1+20>>2];r9=HEAPF32[r3+20>>2];HEAPF32[r5+35]=r8>r9?r8:r9;HEAP32[r2>>2]=5261612;if((HEAP32[HEAP32[r1+12>>2]+4>>2]|0)!=1){___assert_func(5251080,41,5258840,5254288)}if((HEAP32[HEAP32[r3+12>>2]+4>>2]|0)==2){r6=r4;r7=r6|0;return r7}else{___assert_func(5251080,42,5258840,5251948)}}function __ZN23b2EdgeAndPolygonContact7DestroyEP9b2ContactP16b2BlockAllocator(r1,r2){var r3,r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);r3=HEAP8[5263996];if((r3&255)<14){r4=((r3&255)<<2)+r2+12|0;HEAP32[r1>>2]=HEAP32[r4>>2];HEAP32[r4>>2]=r1;return}else{___assert_func(5248148,173,5259684,5249276)}}function __ZN25b2PolygonAndCircleContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator(r1,r2,r3,r4,r5){var r6,r7,r8,r9;r4=__ZN16b2BlockAllocator8AllocateEi(r5,144),r5=r4>>2;if((r4|0)==0){r6=0;r7=r6|0;return r7}r2=r4;HEAP32[r2>>2]=5261444;HEAP32[r5+1]=4;HEAP32[r5+12]=r1;HEAP32[r5+13]=r3;HEAP32[r5+14]=0;HEAP32[r5+15]=0;HEAP32[r5+31]=0;HEAP32[r5+32]=0;_memset(r4+8|0,0,40);HEAPF32[r5+34]=Math.sqrt(HEAPF32[r1+16>>2]*HEAPF32[r3+16>>2]);r8=HEAPF32[r1+20>>2];r9=HEAPF32[r3+20>>2];HEAPF32[r5+35]=r8>r9?r8:r9;HEAP32[r2>>2]=5261564;if((HEAP32[HEAP32[r1+12>>2]+4>>2]|0)!=2){___assert_func(5250864,41,5258544,5254244)}if((HEAP32[HEAP32[r3+12>>2]+4>>2]|0)==0){r6=r4;r7=r6|0;return r7}else{___assert_func(5250864,42,5258544,5251992)}}function __ZN25b2PolygonAndCircleContact7DestroyEP9b2ContactP16b2BlockAllocator(r1,r2){var r3,r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);r3=HEAP8[5263996];if((r3&255)<14){r4=((r3&255)<<2)+r2+12|0;HEAP32[r1>>2]=HEAP32[r4>>2];HEAP32[r4>>2]=r1;return}else{___assert_func(5248148,173,5259684,5249276)}}function __ZN16b2PolygonContactD1Ev(r1){return}function __ZNK15b2DistanceJoint17GetReactionTorqueEf(r1,r2){return 0}function __ZN15b2DistanceJointD1Ev(r1){return}function __ZN15b2DistanceJoint24SolveVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r3=r1>>2;r4=r1+108|0;r5=HEAP32[r4>>2];r6=(r2+28|0)>>2;r2=HEAP32[r6];r7=r2+(r5*12&-1)|0;r8=HEAP32[r7+4>>2];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAPF32[tempDoublePtr>>2]);r7=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=HEAPF32[r2+(r5*12&-1)+8>>2];r10=(r1+112|0)>>2;r11=HEAP32[r10];r12=r2+(r11*12&-1)|0;r13=HEAP32[r12+4>>2];r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAPF32[tempDoublePtr>>2]);r12=(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r2+(r11*12&-1)+8>>2];r11=HEAPF32[r3+32];r2=HEAPF32[r3+31];r15=HEAPF32[r3+34];r16=HEAPF32[r3+33];r17=HEAPF32[r3+29];r18=HEAPF32[r3+30];r19=r1+100|0;r1=HEAPF32[r19>>2];r20=(HEAPF32[r3+19]+r17*(r14+r15*-r13-(r9+r11*-r8))+r18*(r12+r13*r16-(r7+r8*r2))+HEAPF32[r3+24]*r1)*-HEAPF32[r3+43];HEAPF32[r19>>2]=r1+r20;r1=r17*r20;r17=r18*r20;r20=HEAPF32[r3+39];r18=r8-HEAPF32[r3+41]*(r17*r2-r1*r11);r11=HEAPF32[r3+40];r2=r13+HEAPF32[r3+42]*(r17*r16-r1*r15);r15=HEAP32[r6]+(r5*12&-1)|0;r5=(HEAPF32[tempDoublePtr>>2]=r9-r20*r1,HEAP32[tempDoublePtr>>2]);r9=(HEAPF32[tempDoublePtr>>2]=r7-r20*r17,HEAP32[tempDoublePtr>>2])|0;HEAP32[r15>>2]=0|r5;HEAP32[r15+4>>2]=r9;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r18;r18=HEAP32[r6]+(HEAP32[r10]*12&-1)|0;r4=(HEAPF32[tempDoublePtr>>2]=r14+r1*r11,HEAP32[tempDoublePtr>>2]);r1=(HEAPF32[tempDoublePtr>>2]=r12+r17*r11,HEAP32[tempDoublePtr>>2])|0;HEAP32[r18>>2]=0|r4;HEAP32[r18+4>>2]=r1;HEAPF32[HEAP32[r6]+(HEAP32[r10]*12&-1)+8>>2]=r2;return}function __ZNK15b2DistanceJoint10GetAnchorAEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+48>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+80>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+84>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK15b2DistanceJoint10GetAnchorBEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+52>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+88>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+92>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK15b2DistanceJoint16GetReactionForceEf(r1,r2,r3){var r4;r4=HEAPF32[r2+100>>2]*r3;r3=r4*HEAPF32[r2+120>>2];HEAPF32[r1>>2]=HEAPF32[r2+116>>2]*r4;HEAPF32[r1+4>>2]=r3;return}function __ZN16b2PolygonContact8EvaluateEP10b2ManifoldRK11b2TransformS4_(r1,r2,r3,r4){__Z17b2CollidePolygonsP10b2ManifoldPK14b2PolygonShapeRK11b2TransformS3_S6_(r2,HEAP32[HEAP32[r1+48>>2]+12>>2],r3,HEAP32[HEAP32[r1+52>>2]+12>>2],r4);return}function __ZN16b2PolygonContactD0Ev(r1){__ZdlPv(r1);return}function __ZN15b2DistanceJoint23InitVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66;r3=r1>>2;r4=HEAP32[r3+12],r5=r4>>2;r6=HEAP32[r5+2];r7=(r1+108|0)>>2;HEAP32[r7]=r6;r8=HEAP32[r3+13],r9=r8>>2;r10=HEAP32[r9+2];r11=(r1+112|0)>>2;HEAP32[r11]=r10;r12=r4+28|0;r4=r1+140|0;r13=HEAP32[r12>>2];r14=HEAP32[r12+4>>2];HEAP32[r4>>2]=r13;HEAP32[r4+4>>2]=r14;r4=r8+28|0;r8=r1+148|0;r12=HEAP32[r4>>2];r15=HEAP32[r4+4>>2];HEAP32[r8>>2]=r12;HEAP32[r8+4>>2]=r15;r8=HEAPF32[r5+30];HEAPF32[r3+39]=r8;r4=HEAPF32[r9+30];HEAPF32[r3+40]=r4;r16=HEAPF32[r5+32];HEAPF32[r3+41]=r16;r5=HEAPF32[r9+32];HEAPF32[r3+42]=r5;r9=HEAP32[r2+24>>2];r17=r9+(r6*12&-1)|0;r18=HEAP32[r17+4>>2];r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAPF32[tempDoublePtr>>2]);r17=(HEAP32[tempDoublePtr>>2]=r18,HEAPF32[tempDoublePtr>>2]);r18=HEAPF32[r9+(r6*12&-1)+8>>2];r20=(r2+28|0)>>2;r21=HEAP32[r20];r22=r21+(r6*12&-1)|0;r23=HEAP32[r22+4>>2];r24=(HEAP32[tempDoublePtr>>2]=HEAP32[r22>>2],HEAPF32[tempDoublePtr>>2]);r22=(HEAP32[tempDoublePtr>>2]=r23,HEAPF32[tempDoublePtr>>2]);r23=HEAPF32[r21+(r6*12&-1)+8>>2];r25=r9+(r10*12&-1)|0;r26=HEAP32[r25+4>>2];r27=(HEAP32[tempDoublePtr>>2]=HEAP32[r25>>2],HEAPF32[tempDoublePtr>>2]);r25=(HEAP32[tempDoublePtr>>2]=r26,HEAPF32[tempDoublePtr>>2]);r26=HEAPF32[r9+(r10*12&-1)+8>>2];r9=r21+(r10*12&-1)|0;r28=HEAP32[r9+4>>2];r29=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAPF32[tempDoublePtr>>2]);r9=(HEAP32[tempDoublePtr>>2]=r28,HEAPF32[tempDoublePtr>>2]);r28=HEAPF32[r21+(r10*12&-1)+8>>2];r10=Math.sin(r18);r21=Math.cos(r18);r18=Math.sin(r26);r30=Math.cos(r26);r26=HEAPF32[r3+20]-(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r3+21]-(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=r21*r26-r10*r13;r31=r10*r26+r21*r13;r13=r1+124|0;r21=(HEAPF32[tempDoublePtr>>2]=r14,HEAP32[tempDoublePtr>>2]);r26=(HEAPF32[tempDoublePtr>>2]=r31,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r21;HEAP32[r13+4>>2]=r26;r26=HEAPF32[r3+22]-(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=HEAPF32[r3+23]-(HEAP32[tempDoublePtr>>2]=r15,HEAPF32[tempDoublePtr>>2]);r15=r30*r26-r18*r12;r13=r18*r26+r30*r12;r12=r1+132|0;r30=(HEAPF32[tempDoublePtr>>2]=r15,HEAP32[tempDoublePtr>>2]);r26=(HEAPF32[tempDoublePtr>>2]=r13,HEAP32[tempDoublePtr>>2])|0;HEAP32[r12>>2]=0|r30;HEAP32[r12+4>>2]=r26;r26=r1+116|0;r12=r27+r15-r19-r14;r19=r25+r13-r17-r31;r17=r26;r25=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r27=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2])|0;HEAP32[r17>>2]=0|r25;HEAP32[r17+4>>2]=r27;r27=r26|0;r26=Math.sqrt(r12*r12+r19*r19);if(r26>.004999999888241291){r17=1/r26;r25=r12*r17;HEAPF32[r27>>2]=r25;r32=r17*r19;r33=r25}else{HEAPF32[r27>>2]=0;r32=0;r33=0}HEAPF32[r3+30]=r32;r27=r32*r14-r31*r33;r25=r32*r15-r33*r13;r19=r4+r8+r27*r27*r16+r25*r25*r5;if(r19!=0){r34=1/r19}else{r34=0}r25=r1+172|0;HEAPF32[r25>>2]=r34;r27=HEAPF32[r3+17];if(r27>0){r17=r26-HEAPF32[r3+26];r26=r27*6.2831854820251465;r27=r26*r34*r26;r12=HEAPF32[r2>>2];r30=r12*(r26*r34*2*HEAPF32[r3+18]+r27*r12);r34=r1+96|0;HEAPF32[r34>>2]=r30;if(r30!=0){r35=1/r30}else{r35=0}HEAPF32[r34>>2]=r35;HEAPF32[r3+19]=r27*r17*r12*r35;r12=r19+r35;if(r12!=0){r36=1/r12}else{r36=0}HEAPF32[r25>>2]=r36}else{HEAPF32[r3+24]=0;HEAPF32[r3+19]=0}if((HEAP8[r2+20|0]&1)<<24>>24==0){HEAPF32[r3+25]=0;r3=r23;r36=r28;r25=r29;r12=r9;r35=r24;r19=r22;r17=HEAP32[r20];r27=r17+(r6*12&-1)|0;r34=r27;r30=(HEAPF32[tempDoublePtr>>2]=r35,HEAP32[tempDoublePtr>>2]);r26=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2]);r18=r26;r21=0;r10=0;r37=r18;r38=r30;r39=0;r40=r10|r38;r41=r37|r39;r42=r34|0;HEAP32[r42>>2]=r40;r43=r34+4|0;HEAP32[r43>>2]=r41;r44=HEAP32[r7];r45=HEAP32[r20];r46=r45+(r44*12&-1)+8|0;HEAPF32[r46>>2]=r3;r47=HEAP32[r11];r48=HEAP32[r20];r49=r48+(r47*12&-1)|0;r50=r49;r51=(HEAPF32[tempDoublePtr>>2]=r25,HEAP32[tempDoublePtr>>2]);r52=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r53=r52;r54=0;r55=0;r56=r53;r57=r51;r58=0;r59=r55|r57;r60=r56|r58;r61=r50|0;HEAP32[r61>>2]=r59;r62=r50+4|0;HEAP32[r62>>2]=r60;r63=HEAP32[r11];r64=HEAP32[r20];r65=r64+(r63*12&-1)+8|0;HEAPF32[r65>>2]=r36;return}else{r66=r1+100|0;r1=HEAPF32[r2+8>>2]*HEAPF32[r66>>2];HEAPF32[r66>>2]=r1;r66=r33*r1;r33=r1*r32;r3=r23-r16*(r33*r14-r66*r31);r36=r28+r5*(r33*r15-r66*r13);r25=r29+r66*r4;r12=r9+r33*r4;r35=r24-r66*r8;r19=r22-r33*r8;r17=HEAP32[r20];r27=r17+(r6*12&-1)|0;r34=r27;r30=(HEAPF32[tempDoublePtr>>2]=r35,HEAP32[tempDoublePtr>>2]);r26=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2]);r18=r26;r21=0;r10=0;r37=r18;r38=r30;r39=0;r40=r10|r38;r41=r37|r39;r42=r34|0;HEAP32[r42>>2]=r40;r43=r34+4|0;HEAP32[r43>>2]=r41;r44=HEAP32[r7];r45=HEAP32[r20];r46=r45+(r44*12&-1)+8|0;HEAPF32[r46>>2]=r3;r47=HEAP32[r11];r48=HEAP32[r20];r49=r48+(r47*12&-1)|0;r50=r49;r51=(HEAPF32[tempDoublePtr>>2]=r25,HEAP32[tempDoublePtr>>2]);r52=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r53=r52;r54=0;r55=0;r56=r53;r57=r51;r58=0;r59=r55|r57;r60=r56|r58;r61=r50|0;HEAP32[r61>>2]=r59;r62=r50+4|0;HEAP32[r62>>2]=r60;r63=HEAP32[r11];r64=HEAP32[r20];r65=r64+(r63*12&-1)+8|0;HEAPF32[r65>>2]=r36;return}}function __ZN15b2DistanceJoint24SolvePositionConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r3=r1>>2;if(HEAPF32[r3+17]>0){r4=1;return r4}r5=r1+108|0;r6=HEAP32[r5>>2];r7=(r2+24|0)>>2;r2=HEAP32[r7];r8=(r2+(r6*12&-1)|0)>>2;r9=HEAP32[r8+1];r10=(HEAP32[tempDoublePtr>>2]=HEAP32[r8],HEAPF32[tempDoublePtr>>2]);r11=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2]);r9=HEAPF32[r2+(r6*12&-1)+8>>2];r6=(r1+112|0)>>2;r1=HEAP32[r6];r12=r2+(r1*12&-1)|0;r13=HEAP32[r12+4>>2];r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAPF32[tempDoublePtr>>2]);r12=(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r2+(r1*12&-1)+8>>2];r1=Math.sin(r9);r2=Math.cos(r9);r15=Math.sin(r13);r16=Math.cos(r13);r17=HEAPF32[r3+20]-HEAPF32[r3+35];r18=HEAPF32[r3+21]-HEAPF32[r3+36];r19=r2*r17-r1*r18;r20=r1*r17+r2*r18;r18=HEAPF32[r3+22]-HEAPF32[r3+37];r2=HEAPF32[r3+23]-HEAPF32[r3+38];r17=r16*r18-r15*r2;r1=r15*r18+r16*r2;r2=r14+r17-r10-r19;r16=r12+r1-r11-r20;r18=Math.sqrt(r2*r2+r16*r16);if(r18<1.1920928955078125e-7){r21=0;r22=r2;r23=r16}else{r15=1/r18;r21=r18;r22=r2*r15;r23=r16*r15}r15=r21-HEAPF32[r3+26];r21=r15<.20000000298023224?r15:.20000000298023224;r15=r21<-.20000000298023224?-.20000000298023224:r21;r21=r15*-HEAPF32[r3+43];r16=r22*r21;r22=r23*r21;r21=HEAPF32[r3+39];r23=r9-HEAPF32[r3+41]*(r19*r22-r20*r16);r20=HEAPF32[r3+40];r19=r13+HEAPF32[r3+42]*(r17*r22-r1*r16);r1=(HEAPF32[tempDoublePtr>>2]=r10-r21*r16,HEAP32[tempDoublePtr>>2]);r10=(HEAPF32[tempDoublePtr>>2]=r11-r21*r22,HEAP32[tempDoublePtr>>2])|0;HEAP32[r8]=0|r1;HEAP32[r8+1]=r10;HEAPF32[HEAP32[r7]+(HEAP32[r5>>2]*12&-1)+8>>2]=r23;r23=HEAP32[r7]+(HEAP32[r6]*12&-1)|0;r5=(HEAPF32[tempDoublePtr>>2]=r14+r20*r16,HEAP32[tempDoublePtr>>2]);r16=(HEAPF32[tempDoublePtr>>2]=r12+r20*r22,HEAP32[tempDoublePtr>>2])|0;HEAP32[r23>>2]=0|r5;HEAP32[r23+4>>2]=r16;HEAPF32[HEAP32[r7]+(HEAP32[r6]*12&-1)+8>>2]=r19;if(r15>0){r24=r15}else{r24=-r15}r4=r24<.004999999888241291;return r4}function __ZN15b2DistanceJoint4DumpEv(r1){var r2,r3,r4,r5;r2=r1>>2;r3=STACKTOP;r4=HEAP32[HEAP32[r2+12]+8>>2];r5=HEAP32[HEAP32[r2+13]+8>>2];__Z5b2LogPKcz(5250564,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253800,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r4,tempInt));__Z5b2LogPKcz(5251428,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r5,tempInt));__Z5b2LogPKcz(5249488,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+61|0]&1,tempInt));r1=HEAPF32[r2+21];__Z5b2LogPKcz(5248748,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+20],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r1,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r1=HEAPF32[r2+23];__Z5b2LogPKcz(5248324,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+22],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r1,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247984,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+26],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5255136,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+17],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254864,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+18],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254332,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+14],tempInt));STACKTOP=r3;return}function __ZN15b2DistanceJointD0Ev(r1){__ZdlPv(r1);return}function __ZN16b2PolygonContact6CreateEP9b2FixtureiS1_iP16b2BlockAllocator(r1,r2,r3,r4,r5){var r6,r7,r8,r9;r4=__ZN16b2BlockAllocator8AllocateEi(r5,144),r5=r4>>2;if((r4|0)==0){r6=0;r7=r6|0;return r7}r2=r4;HEAP32[r2>>2]=5261444;HEAP32[r5+1]=4;HEAP32[r5+12]=r1;HEAP32[r5+13]=r3;HEAP32[r5+14]=0;HEAP32[r5+15]=0;HEAP32[r5+31]=0;HEAP32[r5+32]=0;_memset(r4+8|0,0,40);HEAPF32[r5+34]=Math.sqrt(HEAPF32[r1+16>>2]*HEAPF32[r3+16>>2]);r8=HEAPF32[r1+20>>2];r9=HEAPF32[r3+20>>2];HEAPF32[r5+35]=r8>r9?r8:r9;HEAP32[r2>>2]=5261824;if((HEAP32[HEAP32[r1+12>>2]+4>>2]|0)!=2){___assert_func(5250644,44,5259540,5254244)}if((HEAP32[HEAP32[r3+12>>2]+4>>2]|0)==2){r6=r4;r7=r6|0;return r7}else{___assert_func(5250644,45,5259540,5251948)}}function __ZN16b2PolygonContact7DestroyEP9b2ContactP16b2BlockAllocator(r1,r2){var r3,r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);r3=HEAP8[5263996];if((r3&255)<14){r4=((r3&255)<<2)+r2+12|0;HEAP32[r1>>2]=HEAP32[r4>>2];HEAP32[r4>>2]=r1;return}else{___assert_func(5248148,173,5259684,5249276)}}function __ZN15b2FrictionJoint24SolvePositionConstraintsERK12b2SolverData(r1,r2){return 1}function __ZN15b2FrictionJointD1Ev(r1){return}function __ZNK15b2FrictionJoint10GetAnchorAEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+48>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+68>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+72>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK15b2FrictionJoint10GetAnchorBEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+52>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+76>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+80>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK15b2FrictionJoint16GetReactionForceEf(r1,r2,r3){var r4;r4=HEAPF32[r2+88>>2]*r3;HEAPF32[r1>>2]=HEAPF32[r2+84>>2]*r3;HEAPF32[r1+4>>2]=r4;return}function __ZNK15b2FrictionJoint17GetReactionTorqueEf(r1,r2){return HEAPF32[r1+92>>2]*r2}function __ZN15b2FrictionJoint23InitVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67;r3=r1>>2;r4=HEAP32[r3+12],r5=r4>>2;r6=HEAP32[r5+2];r7=(r1+104|0)>>2;HEAP32[r7]=r6;r8=HEAP32[r3+13],r9=r8>>2;r10=HEAP32[r9+2];r11=(r1+108|0)>>2;HEAP32[r11]=r10;r12=r4+28|0;r4=r1+128|0;r13=HEAP32[r12>>2];r14=HEAP32[r12+4>>2];HEAP32[r4>>2]=r13;HEAP32[r4+4>>2]=r14;r4=r8+28|0;r8=r1+136|0;r12=HEAP32[r4>>2];r15=HEAP32[r4+4>>2];HEAP32[r8>>2]=r12;HEAP32[r8+4>>2]=r15;r8=HEAPF32[r5+30];HEAPF32[r3+36]=r8;r4=HEAPF32[r9+30];HEAPF32[r3+37]=r4;r16=HEAPF32[r5+32];HEAPF32[r3+38]=r16;r5=HEAPF32[r9+32];HEAPF32[r3+39]=r5;r9=HEAP32[r2+24>>2];r17=HEAPF32[r9+(r6*12&-1)+8>>2];r18=(r2+28|0)>>2;r19=HEAP32[r18];r20=r19+(r6*12&-1)|0;r21=HEAP32[r20+4>>2];r22=(HEAP32[tempDoublePtr>>2]=HEAP32[r20>>2],HEAPF32[tempDoublePtr>>2]);r20=(HEAP32[tempDoublePtr>>2]=r21,HEAPF32[tempDoublePtr>>2]);r21=HEAPF32[r19+(r6*12&-1)+8>>2];r23=HEAPF32[r9+(r10*12&-1)+8>>2];r9=r19+(r10*12&-1)|0;r24=HEAP32[r9+4>>2];r25=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAPF32[tempDoublePtr>>2]);r9=(HEAP32[tempDoublePtr>>2]=r24,HEAPF32[tempDoublePtr>>2]);r24=HEAPF32[r19+(r10*12&-1)+8>>2];r10=Math.sin(r17);r19=Math.cos(r17);r17=Math.sin(r23);r26=Math.cos(r23);r23=HEAPF32[r3+17]-(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r3+18]-(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=r19*r23-r10*r13;r27=r10*r23+r19*r13;r13=r1+112|0;r19=(HEAPF32[tempDoublePtr>>2]=r14,HEAP32[tempDoublePtr>>2]);r23=(HEAPF32[tempDoublePtr>>2]=r27,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r19;HEAP32[r13+4>>2]=r23;r23=HEAPF32[r3+19]-(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=HEAPF32[r3+20]-(HEAP32[tempDoublePtr>>2]=r15,HEAPF32[tempDoublePtr>>2]);r15=r26*r23-r17*r12;r13=r17*r23+r26*r12;r12=r1+120|0;r26=(HEAPF32[tempDoublePtr>>2]=r15,HEAP32[tempDoublePtr>>2]);r23=(HEAPF32[tempDoublePtr>>2]=r13,HEAP32[tempDoublePtr>>2])|0;HEAP32[r12>>2]=0|r26;HEAP32[r12+4>>2]=r23;r23=r8+r4;r12=r23+r27*r16*r27+r13*r5*r13;r26=r5*r15;r17=r27*r14*-r16-r13*r26;r19=r23+r14*r16*r14+r15*r26;r26=r12*r19-r17*r17;if(r26!=0){r28=1/r26}else{r28=r26}r26=r17*-r28;HEAPF32[r3+40]=r19*r28;HEAPF32[r3+41]=r26;HEAPF32[r3+42]=r26;HEAPF32[r3+43]=r12*r28;r28=r16+r5;if(r28>0){r29=1/r28}else{r29=r28}HEAPF32[r3+44]=r29;r29=r1+84|0;if((HEAP8[r2+20|0]&1)<<24>>24==0){HEAPF32[r29>>2]=0;HEAPF32[r3+22]=0;HEAPF32[r3+23]=0;r3=r21;r28=r24;r12=r25;r26=r9;r19=r22;r17=r20;r23=HEAP32[r18];r10=r23+(r6*12&-1)|0;r30=r10;r31=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2]);r32=(HEAPF32[tempDoublePtr>>2]=r17,HEAP32[tempDoublePtr>>2]);r33=r32;r34=0;r35=0;r36=r33;r37=r31;r38=0;r39=r35|r37;r40=r36|r38;r41=r30|0;HEAP32[r41>>2]=r39;r42=r30+4|0;HEAP32[r42>>2]=r40;r43=HEAP32[r7];r44=HEAP32[r18];r45=r44+(r43*12&-1)+8|0;HEAPF32[r45>>2]=r3;r46=HEAP32[r11];r47=HEAP32[r18];r48=r47+(r46*12&-1)|0;r49=r48;r50=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r51=(HEAPF32[tempDoublePtr>>2]=r26,HEAP32[tempDoublePtr>>2]);r52=r51;r53=0;r54=0;r55=r52;r56=r50;r57=0;r58=r54|r56;r59=r55|r57;r60=r49|0;HEAP32[r60>>2]=r58;r61=r49+4|0;HEAP32[r61>>2]=r59;r62=HEAP32[r11];r63=HEAP32[r18];r64=r63+(r62*12&-1)+8|0;HEAPF32[r64>>2]=r28;return}else{r65=r2+8|0;r2=HEAPF32[r65>>2];r66=r29|0;r29=r2*HEAPF32[r66>>2];HEAPF32[r66>>2]=r29;r66=r1+88|0;r67=r2*HEAPF32[r66>>2];HEAPF32[r66>>2]=r67;r66=r1+92|0;r1=HEAPF32[r65>>2]*HEAPF32[r66>>2];HEAPF32[r66>>2]=r1;r3=r21-r16*(r1+(r67*r14-r29*r27));r28=r24+r5*(r1+(r67*r15-r29*r13));r12=r25+r4*r29;r26=r9+r4*r67;r19=r22-r8*r29;r17=r20-r8*r67;r23=HEAP32[r18];r10=r23+(r6*12&-1)|0;r30=r10;r31=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2]);r32=(HEAPF32[tempDoublePtr>>2]=r17,HEAP32[tempDoublePtr>>2]);r33=r32;r34=0;r35=0;r36=r33;r37=r31;r38=0;r39=r35|r37;r40=r36|r38;r41=r30|0;HEAP32[r41>>2]=r39;r42=r30+4|0;HEAP32[r42>>2]=r40;r43=HEAP32[r7];r44=HEAP32[r18];r45=r44+(r43*12&-1)+8|0;HEAPF32[r45>>2]=r3;r46=HEAP32[r11];r47=HEAP32[r18];r48=r47+(r46*12&-1)|0;r49=r48;r50=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r51=(HEAPF32[tempDoublePtr>>2]=r26,HEAP32[tempDoublePtr>>2]);r52=r51;r53=0;r54=0;r55=r52;r56=r50;r57=0;r58=r54|r56;r59=r55|r57;r60=r49|0;HEAP32[r60>>2]=r58;r61=r49+4|0;HEAP32[r61>>2]=r59;r62=HEAP32[r11];r63=HEAP32[r18];r64=r63+(r62*12&-1)+8|0;HEAPF32[r64>>2]=r28;return}}function __ZN15b2FrictionJoint24SolveVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r3=r1>>2;r4=r1+104|0;r5=HEAP32[r4>>2];r6=(r2+28|0)>>2;r7=HEAP32[r6];r8=r7+(r5*12&-1)|0;r9=HEAP32[r8+4>>2];r10=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAPF32[tempDoublePtr>>2]);r8=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2]);r9=HEAPF32[r7+(r5*12&-1)+8>>2];r11=(r1+108|0)>>2;r12=HEAP32[r11];r13=r7+(r12*12&-1)|0;r14=HEAP32[r13+4>>2];r15=(HEAP32[tempDoublePtr>>2]=HEAP32[r13>>2],HEAPF32[tempDoublePtr>>2]);r13=(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=HEAPF32[r7+(r12*12&-1)+8>>2];r12=HEAPF32[r3+36];r7=HEAPF32[r3+37];r16=HEAPF32[r3+38];r17=HEAPF32[r3+39];r18=HEAPF32[r2>>2];r2=r1+92|0;r19=HEAPF32[r2>>2];r20=r18*HEAPF32[r3+25];r21=r19+(r14-r9)*-HEAPF32[r3+44];r22=-r20;r23=r21<r20?r21:r20;r20=r23<r22?r22:r23;HEAPF32[r2>>2]=r20;r2=r20-r19;r19=r9-r16*r2;r9=r14+r17*r2;r2=HEAPF32[r3+31];r14=HEAPF32[r3+30];r20=HEAPF32[r3+29];r23=HEAPF32[r3+28];r22=r15+r2*-r9-r10-r20*-r19;r21=r13+r14*r9-r8-r23*r19;r24=HEAPF32[r3+42]*r21+HEAPF32[r3+40]*r22;r25=HEAPF32[r3+43]*r21+HEAPF32[r3+41]*r22;r22=r1+84|0;r21=r22;r26=HEAP32[r21+4>>2];r27=(HEAP32[tempDoublePtr>>2]=HEAP32[r21>>2],HEAPF32[tempDoublePtr>>2]);r21=(HEAP32[tempDoublePtr>>2]=r26,HEAPF32[tempDoublePtr>>2]);r26=(r22|0)>>2;r22=r27-r24;HEAPF32[r26]=r22;r24=(r1+88|0)>>2;r1=HEAPF32[r24]-r25;HEAPF32[r24]=r1;r25=r18*HEAPF32[r3+24];r3=r22*r22+r1*r1;if(r3>r25*r25){r18=Math.sqrt(r3);if(r18<1.1920928955078125e-7){r28=r22;r29=r1}else{r3=1/r18;r18=r22*r3;HEAPF32[r26]=r18;r30=r1*r3;HEAPF32[r24]=r30;r28=r18;r29=r30}r30=r25*r28;HEAPF32[r26]=r30;r26=r25*r29;HEAPF32[r24]=r26;r31=r30;r32=r26}else{r31=r22;r32=r1}r1=r31-r27;r27=r32-r21;r21=HEAP32[r6]+(r5*12&-1)|0;r5=(HEAPF32[tempDoublePtr>>2]=r10-r12*r1,HEAP32[tempDoublePtr>>2]);r10=(HEAPF32[tempDoublePtr>>2]=r8-r12*r27,HEAP32[tempDoublePtr>>2])|0;HEAP32[r21>>2]=0|r5;HEAP32[r21+4>>2]=r10;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r19-r16*(r23*r27-r1*r20);r20=HEAP32[r6]+(HEAP32[r11]*12&-1)|0;r23=(HEAPF32[tempDoublePtr>>2]=r15+r7*r1,HEAP32[tempDoublePtr>>2]);r15=(HEAPF32[tempDoublePtr>>2]=r13+r7*r27,HEAP32[tempDoublePtr>>2])|0;HEAP32[r20>>2]=0|r23;HEAP32[r20+4>>2]=r15;HEAPF32[HEAP32[r6]+(HEAP32[r11]*12&-1)+8>>2]=r9+r17*(r27*r14-r1*r2);return}function __ZN15b2FrictionJoint4DumpEv(r1){var r2,r3,r4,r5;r2=r1>>2;r3=STACKTOP;r4=HEAP32[HEAP32[r2+12]+8>>2];r5=HEAP32[HEAP32[r2+13]+8>>2];__Z5b2LogPKcz(5249768,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253800,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r4,tempInt));__Z5b2LogPKcz(5251428,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r5,tempInt));__Z5b2LogPKcz(5249488,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+61|0]&1,tempInt));r1=HEAPF32[r2+18];__Z5b2LogPKcz(5248748,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+17],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r1,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r1=HEAPF32[r2+20];__Z5b2LogPKcz(5248324,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+19],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r1,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247180,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+24],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5255196,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+25],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254332,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+14],tempInt));STACKTOP=r3;return}function __ZN15b2FrictionJointD0Ev(r1){__ZdlPv(r1);return}function __ZN11b2GearJointC2EPK14b2GearJointDef(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r3=r1>>2;r4=r1|0;HEAP32[r4>>2]=5261468;r5=r2+8|0;r6=r2+12|0;if((HEAP32[r5>>2]|0)==(HEAP32[r6>>2]|0)){___assert_func(5249968,173,5258024,5251672)}HEAP32[r3+1]=HEAP32[r2>>2];HEAP32[r3+2]=0;HEAP32[r3+3]=0;r7=r1+48|0;HEAP32[r7>>2]=HEAP32[r5>>2];r5=r1+52|0;HEAP32[r5>>2]=HEAP32[r6>>2];HEAP32[r3+14]=0;HEAP8[r1+61|0]=HEAP8[r2+16|0]&1;HEAP8[r1+60|0]=0;HEAP32[r3+16]=HEAP32[r2+4>>2];_memset(r1+16|0,0,32);HEAP32[r4>>2]=5262468;r4=r1+92|0;r6=r1+100|0;r8=r1+108|0;r9=r1+116|0;r10=r1+124|0;r11=r1+132|0;r12=r2+20|0;r13=HEAP32[r12>>2],r14=r13>>2;HEAP32[r3+17]=r13;r13=r2+24|0;r15=HEAP32[r13>>2],r16=r15>>2;HEAP32[r3+18]=r15;r15=HEAP32[r14+1];HEAP32[r3+19]=r15;r17=HEAP32[r16+1];HEAP32[r3+20]=r17;if((r15-1|0)>>>0>=2){___assert_func(5250076,53,5260748,5254092)}if((r17-1|0)>>>0>=2){___assert_func(5250076,54,5260748,5251760)}r18=HEAP32[r14+12],r19=r18>>2;HEAP32[r3+21]=r18;r18=HEAP32[r14+13],r14=r18>>2;HEAP32[r7>>2]=r18;r18=HEAPF32[r14+5];r7=HEAPF32[r14+6];r20=HEAPF32[r19+5];r21=HEAPF32[r19+6];r22=HEAP32[r12>>2];if((r15|0)==1){r15=HEAPF32[r14+14];r12=HEAPF32[r19+14];r23=r22+68|0;r24=r8;r25=HEAP32[r23+4>>2];HEAP32[r24>>2]=HEAP32[r23>>2];HEAP32[r24+4>>2]=r25;r25=r22+76|0;r24=r4;r23=HEAP32[r25+4>>2];HEAP32[r24>>2]=HEAP32[r25>>2];HEAP32[r24+4>>2]=r23;r23=HEAPF32[r22+116>>2];HEAPF32[r3+35]=r23;HEAPF32[r10>>2]=0;HEAPF32[r3+32]=0;r26=r15-r12-r23}else{r23=HEAPF32[r19+4];r12=HEAPF32[r19+3];r19=HEAPF32[r14+4];r15=HEAPF32[r14+3];r14=r22+68|0;r24=r8;r8=HEAP32[r14>>2];r25=HEAP32[r14+4>>2];HEAP32[r24>>2]=r8;HEAP32[r24+4>>2]=r25;r24=r22+76|0;r14=r4;r4=HEAP32[r24>>2];r27=HEAP32[r24+4>>2];HEAP32[r14>>2]=r4;HEAP32[r14+4>>2]=r27;HEAPF32[r3+35]=HEAPF32[r22+100>>2];r14=r22+84|0;r22=r10;r10=HEAP32[r14>>2];r24=HEAP32[r14+4>>2];HEAP32[r22>>2]=r10;HEAP32[r22+4>>2]=r24;r22=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=(HEAP32[tempDoublePtr>>2]=r25,HEAPF32[tempDoublePtr>>2]);r25=(HEAP32[tempDoublePtr>>2]=r4,HEAPF32[tempDoublePtr>>2]);r4=(HEAP32[tempDoublePtr>>2]=r27,HEAPF32[tempDoublePtr>>2]);r27=r15-r12+(r7*r25-r18*r4);r12=r19-r23+r18*r25+r7*r4;r26=(HEAP32[tempDoublePtr>>2]=r10,HEAPF32[tempDoublePtr>>2])*(r21*r27+r20*r12-r22)+(HEAP32[tempDoublePtr>>2]=r24,HEAPF32[tempDoublePtr>>2])*(r27*-r20+r21*r12-r8)}r8=HEAP32[r16+12],r12=r8>>2;HEAP32[r3+22]=r8;r8=HEAP32[r16+13],r16=r8>>2;HEAP32[r5>>2]=r8;r8=HEAPF32[r16+5];r5=HEAPF32[r16+6];r21=HEAPF32[r12+5];r20=HEAPF32[r12+6];r27=HEAP32[r13>>2];if((r17|0)==1){r17=HEAPF32[r16+14];r13=HEAPF32[r12+14];r24=r27+68|0;r22=r9;r10=HEAP32[r24+4>>2];HEAP32[r22>>2]=HEAP32[r24>>2];HEAP32[r22+4>>2]=r10;r10=r27+76|0;r22=r6;r24=HEAP32[r10+4>>2];HEAP32[r22>>2]=HEAP32[r10>>2];HEAP32[r22+4>>2]=r24;r24=HEAPF32[r27+116>>2];HEAPF32[r3+36]=r24;HEAPF32[r11>>2]=0;HEAPF32[r3+34]=0;r22=r17-r13-r24;r24=r2+28|0;r13=HEAPF32[r24>>2];r17=r1+152|0;HEAPF32[r17>>2]=r13;r10=r22*r13;r4=r26+r10;r7=r1+148|0;HEAPF32[r7>>2]=r4;r25=r1+156|0;HEAPF32[r25>>2]=0;return}else{r18=HEAPF32[r12+4];r23=HEAPF32[r12+3];r12=HEAPF32[r16+4];r19=HEAPF32[r16+3];r16=r27+68|0;r15=r9;r9=HEAP32[r16>>2];r14=HEAP32[r16+4>>2];HEAP32[r15>>2]=r9;HEAP32[r15+4>>2]=r14;r15=r27+76|0;r16=r6;r6=HEAP32[r15>>2];r28=HEAP32[r15+4>>2];HEAP32[r16>>2]=r6;HEAP32[r16+4>>2]=r28;HEAPF32[r3+36]=HEAPF32[r27+100>>2];r3=r27+84|0;r27=r11;r11=HEAP32[r3>>2];r16=HEAP32[r3+4>>2];HEAP32[r27>>2]=r11;HEAP32[r27+4>>2]=r16;r27=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2]);r9=(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=(HEAP32[tempDoublePtr>>2]=r6,HEAPF32[tempDoublePtr>>2]);r6=(HEAP32[tempDoublePtr>>2]=r28,HEAPF32[tempDoublePtr>>2]);r28=r19-r23+(r5*r14-r8*r6);r23=r12-r18+r8*r14+r5*r6;r22=(HEAP32[tempDoublePtr>>2]=r11,HEAPF32[tempDoublePtr>>2])*(r20*r28+r21*r23-r27)+(HEAP32[tempDoublePtr>>2]=r16,HEAPF32[tempDoublePtr>>2])*(r28*-r21+r20*r23-r9);r24=r2+28|0;r13=HEAPF32[r24>>2];r17=r1+152|0;HEAPF32[r17>>2]=r13;r10=r22*r13;r4=r26+r10;r7=r1+148|0;HEAPF32[r7>>2]=r4;r25=r1+156|0;HEAPF32[r25>>2]=0;return}}function __ZN11b2GearJoint24SolveVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r3=r1>>2;r4=r1+160|0;r5=HEAP32[r4>>2];r6=(r2+28|0)>>2;r2=HEAP32[r6],r7=r2>>2;r8=r2+(r5*12&-1)|0;r9=HEAP32[r8+4>>2];r10=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAPF32[tempDoublePtr>>2]);r8=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2]);r9=HEAPF32[((r5*12&-1)+8>>2)+r7];r11=(r1+164|0)>>2;r12=HEAP32[r11];r13=r2+(r12*12&-1)|0;r14=HEAP32[r13+4>>2];r15=(HEAP32[tempDoublePtr>>2]=HEAP32[r13>>2],HEAPF32[tempDoublePtr>>2]);r13=(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=HEAPF32[((r12*12&-1)+8>>2)+r7];r12=(r1+168|0)>>2;r16=HEAP32[r12];r17=r2+(r16*12&-1)|0;r18=HEAP32[r17+4>>2];r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAPF32[tempDoublePtr>>2]);r17=(HEAP32[tempDoublePtr>>2]=r18,HEAPF32[tempDoublePtr>>2]);r18=HEAPF32[((r16*12&-1)+8>>2)+r7];r16=(r1+172|0)>>2;r20=HEAP32[r16];r21=r2+(r20*12&-1)|0;r2=HEAP32[r21+4>>2];r22=(HEAP32[tempDoublePtr>>2]=HEAP32[r21>>2],HEAPF32[tempDoublePtr>>2]);r21=(HEAP32[tempDoublePtr>>2]=r2,HEAPF32[tempDoublePtr>>2]);r2=HEAPF32[((r20*12&-1)+8>>2)+r7];r7=HEAPF32[r3+60];r20=HEAPF32[r3+61];r23=HEAPF32[r3+62];r24=HEAPF32[r3+63];r25=HEAPF32[r3+64];r26=HEAPF32[r3+66];r27=HEAPF32[r3+65];r28=HEAPF32[r3+67];r29=((r10-r19)*r7+(r8-r17)*r20+(r15-r22)*r23+(r13-r21)*r24+(r9*r25-r18*r26)+(r14*r27-r2*r28))*-HEAPF32[r3+68];r30=r1+156|0;HEAPF32[r30>>2]=HEAPF32[r30>>2]+r29;r30=HEAPF32[r3+52]*r29;r1=r9+r29*HEAPF32[r3+56]*r25;r25=r29*HEAPF32[r3+53];r9=r14+r29*HEAPF32[r3+57]*r27;r27=r29*HEAPF32[r3+54];r14=r18-r29*HEAPF32[r3+58]*r26;r26=r29*HEAPF32[r3+55];r18=r2-r29*HEAPF32[r3+59]*r28;r28=HEAP32[r6]+(r5*12&-1)|0;r5=(HEAPF32[tempDoublePtr>>2]=r10+r7*r30,HEAP32[tempDoublePtr>>2]);r10=(HEAPF32[tempDoublePtr>>2]=r8+r20*r30,HEAP32[tempDoublePtr>>2])|0;HEAP32[r28>>2]=0|r5;HEAP32[r28+4>>2]=r10;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r1;r1=HEAP32[r6]+(HEAP32[r11]*12&-1)|0;r4=(HEAPF32[tempDoublePtr>>2]=r15+r23*r25,HEAP32[tempDoublePtr>>2]);r15=(HEAPF32[tempDoublePtr>>2]=r13+r25*r24,HEAP32[tempDoublePtr>>2])|0;HEAP32[r1>>2]=0|r4;HEAP32[r1+4>>2]=r15;HEAPF32[HEAP32[r6]+(HEAP32[r11]*12&-1)+8>>2]=r9;r9=HEAP32[r6]+(HEAP32[r12]*12&-1)|0;r11=(HEAPF32[tempDoublePtr>>2]=r19-r7*r27,HEAP32[tempDoublePtr>>2]);r7=(HEAPF32[tempDoublePtr>>2]=r17-r20*r27,HEAP32[tempDoublePtr>>2])|0;HEAP32[r9>>2]=0|r11;HEAP32[r9+4>>2]=r7;HEAPF32[HEAP32[r6]+(HEAP32[r12]*12&-1)+8>>2]=r14;r14=HEAP32[r6]+(HEAP32[r16]*12&-1)|0;r12=(HEAPF32[tempDoublePtr>>2]=r22-r23*r26,HEAP32[tempDoublePtr>>2]);r23=(HEAPF32[tempDoublePtr>>2]=r21-r24*r26,HEAP32[tempDoublePtr>>2])|0;HEAP32[r14>>2]=0|r12;HEAP32[r14+4>>2]=r23;HEAPF32[HEAP32[r6]+(HEAP32[r16]*12&-1)+8>>2]=r18;return}
function __ZN11b2GearJoint23InitVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74;r3=r1>>2;r4=HEAP32[r3+12],r5=r4>>2;r6=HEAP32[r5+2];r7=r1+160|0;HEAP32[r7>>2]=r6;r8=HEAP32[r3+13],r9=r8>>2;r10=HEAP32[r9+2];r11=(r1+164|0)>>2;HEAP32[r11]=r10;r12=HEAP32[r3+21],r13=r12>>2;r14=HEAP32[r13+2];r15=(r1+168|0)>>2;HEAP32[r15]=r14;r16=HEAP32[r3+22],r17=r16>>2;r18=HEAP32[r17+2];r19=(r1+172|0)>>2;HEAP32[r19]=r18;r20=r4+28|0;r4=r1+176|0;r21=HEAP32[r20>>2];r22=HEAP32[r20+4>>2];HEAP32[r4>>2]=r21;HEAP32[r4+4>>2]=r22;r4=r8+28|0;r8=r1+184|0;r20=HEAP32[r4>>2];r23=HEAP32[r4+4>>2];HEAP32[r8>>2]=r20;HEAP32[r8+4>>2]=r23;r8=r12+28|0;r12=r1+192|0;r4=HEAP32[r8>>2];r24=HEAP32[r8+4>>2];HEAP32[r12>>2]=r4;HEAP32[r12+4>>2]=r24;r12=r16+28|0;r16=r1+200|0;r8=HEAP32[r12>>2];r25=HEAP32[r12+4>>2];HEAP32[r16>>2]=r8;HEAP32[r16+4>>2]=r25;r16=HEAPF32[r5+30];HEAPF32[r3+52]=r16;r12=HEAPF32[r9+30];HEAPF32[r3+53]=r12;r26=HEAPF32[r13+30];HEAPF32[r3+54]=r26;r27=HEAPF32[r17+30];HEAPF32[r3+55]=r27;r28=HEAPF32[r5+32];HEAPF32[r3+56]=r28;r5=HEAPF32[r9+32];HEAPF32[r3+57]=r5;r9=HEAPF32[r13+32];HEAPF32[r3+58]=r9;r13=HEAPF32[r17+32];HEAPF32[r3+59]=r13;r17=HEAP32[r2+24>>2]>>2;r29=HEAPF32[((r6*12&-1)+8>>2)+r17];r30=(r2+28|0)>>2;r31=HEAP32[r30],r32=r31>>2;r33=r31+(r6*12&-1)|0;r34=HEAP32[r33+4>>2];r35=(HEAP32[tempDoublePtr>>2]=HEAP32[r33>>2],HEAPF32[tempDoublePtr>>2]);r33=(HEAP32[tempDoublePtr>>2]=r34,HEAPF32[tempDoublePtr>>2]);r34=HEAPF32[((r6*12&-1)+8>>2)+r32];r36=HEAPF32[((r10*12&-1)+8>>2)+r17];r37=r31+(r10*12&-1)|0;r38=HEAP32[r37+4>>2];r39=(HEAP32[tempDoublePtr>>2]=HEAP32[r37>>2],HEAPF32[tempDoublePtr>>2]);r37=(HEAP32[tempDoublePtr>>2]=r38,HEAPF32[tempDoublePtr>>2]);r38=HEAPF32[((r10*12&-1)+8>>2)+r32];r10=HEAPF32[((r14*12&-1)+8>>2)+r17];r40=r31+(r14*12&-1)|0;r41=HEAP32[r40+4>>2];r42=(HEAP32[tempDoublePtr>>2]=HEAP32[r40>>2],HEAPF32[tempDoublePtr>>2]);r40=(HEAP32[tempDoublePtr>>2]=r41,HEAPF32[tempDoublePtr>>2]);r41=HEAPF32[((r14*12&-1)+8>>2)+r32];r14=HEAPF32[((r18*12&-1)+8>>2)+r17];r17=r31+(r18*12&-1)|0;r31=HEAP32[r17+4>>2];r43=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAPF32[tempDoublePtr>>2]);r17=(HEAP32[tempDoublePtr>>2]=r31,HEAPF32[tempDoublePtr>>2]);r31=HEAPF32[((r18*12&-1)+8>>2)+r32];r32=Math.sin(r29);r18=Math.cos(r29);r29=Math.sin(r36);r44=Math.cos(r36);r36=Math.sin(r10);r45=Math.cos(r10);r10=Math.sin(r14);r46=Math.cos(r14);r14=(r1+272|0)>>2;HEAPF32[r14]=0;r47=(HEAP32[r3+19]|0)==1;r48=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=(HEAP32[tempDoublePtr>>2]=r25,HEAPF32[tempDoublePtr>>2]);r25=(HEAP32[tempDoublePtr>>2]=r20,HEAPF32[tempDoublePtr>>2]);r20=(HEAP32[tempDoublePtr>>2]=r23,HEAPF32[tempDoublePtr>>2]);if(r47){HEAPF32[r3+60]=0;HEAPF32[r3+61]=0;HEAPF32[r3+64]=1;HEAPF32[r3+66]=1;r49=r28+r9;r50=0;r51=0;r52=1;r53=1}else{r47=(HEAP32[tempDoublePtr>>2]=r22,HEAPF32[tempDoublePtr>>2]);r22=(HEAP32[tempDoublePtr>>2]=r21,HEAPF32[tempDoublePtr>>2]);r21=(HEAP32[tempDoublePtr>>2]=r24,HEAPF32[tempDoublePtr>>2]);r24=HEAPF32[r3+31];r23=HEAPF32[r3+32];r54=r45*r24-r36*r23;r55=r36*r24+r45*r23;r23=HEAPF32[r3+27]-(HEAP32[tempDoublePtr>>2]=r4,HEAPF32[tempDoublePtr>>2]);r4=HEAPF32[r3+28]-r21;r21=HEAPF32[r3+23]-r22;r22=HEAPF32[r3+24]-r47;r47=r1+240|0;r24=(HEAPF32[tempDoublePtr>>2]=r54,HEAP32[tempDoublePtr>>2]);r56=(HEAPF32[tempDoublePtr>>2]=r55,HEAP32[tempDoublePtr>>2])|0;HEAP32[r47>>2]=0|r24;HEAP32[r47+4>>2]=r56;r56=r55*(r45*r23-r36*r4)-r54*(r36*r23+r45*r4);HEAPF32[r3+66]=r56;r4=r55*(r18*r21-r32*r22)-r54*(r32*r21+r18*r22);HEAPF32[r3+64]=r4;r49=r26+r16+r56*r9*r56+r4*r28*r4;r50=r54;r51=r55;r52=r4;r53=r56}r56=r49;HEAPF32[r14]=r56;if((HEAP32[r3+20]|0)==1){HEAPF32[r3+62]=0;HEAPF32[r3+63]=0;r49=HEAPF32[r3+38];HEAPF32[r3+65]=r49;HEAPF32[r3+67]=r49;r57=r49*r49*(r5+r13);r58=0;r59=0;r60=r49;r61=r49}else{r49=HEAPF32[r3+33];r4=HEAPF32[r3+34];r55=r46*r49-r10*r4;r54=r10*r49+r46*r4;r4=HEAPF32[r3+29]-r48;r48=HEAPF32[r3+30]-r8;r8=HEAPF32[r3+25]-r25;r25=HEAPF32[r3+26]-r20;r20=HEAPF32[r3+38];r49=r55*r20;r22=r54*r20;r18=r1+248|0;r21=(HEAPF32[tempDoublePtr>>2]=r49,HEAP32[tempDoublePtr>>2]);r32=(HEAPF32[tempDoublePtr>>2]=r22,HEAP32[tempDoublePtr>>2])|0;HEAP32[r18>>2]=0|r21;HEAP32[r18+4>>2]=r32;r32=(r54*(r46*r4-r10*r48)-r55*(r10*r4+r46*r48))*r20;HEAPF32[r3+67]=r32;r48=r20*(r54*(r44*r8-r29*r25)-r55*(r29*r8+r44*r25));HEAPF32[r3+65]=r48;r57=r20*r20*(r27+r12)+r32*r13*r32+r48*r48*r5;r58=r49;r59=r22;r60=r48;r61=r32}r32=r56+r57;HEAPF32[r14]=r32;if(r32>0){r62=1/r32}else{r62=0}HEAPF32[r14]=r62;r62=r1+156|0;if((HEAP8[r2+20|0]&1)<<24>>24==0){HEAPF32[r62>>2]=0;r63=r31;r64=r34;r65=r41;r66=r38;r67=r43;r68=r17;r69=r42;r70=r40;r71=r39;r72=r37;r73=r35;r74=r33}else{r2=HEAPF32[r62>>2];r62=r16*r2;r16=r2*r12;r12=r2*r26;r26=r2*r27;r63=r31-r2*r13*r61;r64=r34+r2*r28*r52;r65=r41-r2*r9*r53;r66=r38+r2*r5*r60;r67=r43-r58*r26;r68=r17-r59*r26;r69=r42-r50*r12;r70=r40-r51*r12;r71=r39+r58*r16;r72=r37+r16*r59;r73=r35+r50*r62;r74=r33+r62*r51}r51=HEAP32[r30]+(r6*12&-1)|0;r6=(HEAPF32[tempDoublePtr>>2]=r73,HEAP32[tempDoublePtr>>2]);r73=(HEAPF32[tempDoublePtr>>2]=r74,HEAP32[tempDoublePtr>>2])|0;HEAP32[r51>>2]=0|r6;HEAP32[r51+4>>2]=r73;HEAPF32[HEAP32[r30]+(HEAP32[r7>>2]*12&-1)+8>>2]=r64;r64=HEAP32[r30]+(HEAP32[r11]*12&-1)|0;r7=(HEAPF32[tempDoublePtr>>2]=r71,HEAP32[tempDoublePtr>>2]);r71=(HEAPF32[tempDoublePtr>>2]=r72,HEAP32[tempDoublePtr>>2])|0;HEAP32[r64>>2]=0|r7;HEAP32[r64+4>>2]=r71;HEAPF32[HEAP32[r30]+(HEAP32[r11]*12&-1)+8>>2]=r66;r66=HEAP32[r30]+(HEAP32[r15]*12&-1)|0;r11=(HEAPF32[tempDoublePtr>>2]=r69,HEAP32[tempDoublePtr>>2]);r69=(HEAPF32[tempDoublePtr>>2]=r70,HEAP32[tempDoublePtr>>2])|0;HEAP32[r66>>2]=0|r11;HEAP32[r66+4>>2]=r69;HEAPF32[HEAP32[r30]+(HEAP32[r15]*12&-1)+8>>2]=r65;r65=HEAP32[r30]+(HEAP32[r19]*12&-1)|0;r15=(HEAPF32[tempDoublePtr>>2]=r67,HEAP32[tempDoublePtr>>2]);r67=(HEAPF32[tempDoublePtr>>2]=r68,HEAP32[tempDoublePtr>>2])|0;HEAP32[r65>>2]=0|r15;HEAP32[r65+4>>2]=r67;HEAPF32[HEAP32[r30]+(HEAP32[r19]*12&-1)+8>>2]=r63;return}function __ZN11b2GearJointD1Ev(r1){return}function __ZNK11b2GearJoint10GetAnchorAEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+48>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+92>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+96>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK11b2GearJoint10GetAnchorBEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+52>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+100>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+104>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK11b2GearJoint16GetReactionForceEf(r1,r2,r3){var r4,r5;r4=HEAPF32[r2+156>>2];r5=r4*HEAPF32[r2+244>>2]*r3;HEAPF32[r1>>2]=r4*HEAPF32[r2+240>>2]*r3;HEAPF32[r1+4>>2]=r5;return}function __ZNK11b2GearJoint17GetReactionTorqueEf(r1,r2){return HEAPF32[r1+156>>2]*HEAPF32[r1+256>>2]*r2}function __ZN11b2GearJoint24SolvePositionConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r3=r1>>2;r4=r1+160|0;r5=HEAP32[r4>>2];r6=(r2+24|0)>>2;r2=HEAP32[r6],r7=r2>>2;r8=(r2+(r5*12&-1)|0)>>2;r9=HEAP32[r8+1];r10=(HEAP32[tempDoublePtr>>2]=HEAP32[r8],HEAPF32[tempDoublePtr>>2]);r11=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2]);r9=HEAPF32[((r5*12&-1)+8>>2)+r7];r5=(r1+164|0)>>2;r12=HEAP32[r5];r13=r2+(r12*12&-1)|0;r14=HEAP32[r13+4>>2];r15=(HEAP32[tempDoublePtr>>2]=HEAP32[r13>>2],HEAPF32[tempDoublePtr>>2]);r13=(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=HEAPF32[((r12*12&-1)+8>>2)+r7];r12=(r1+168|0)>>2;r16=HEAP32[r12];r17=r2+(r16*12&-1)|0;r18=HEAP32[r17+4>>2];r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAPF32[tempDoublePtr>>2]);r17=(HEAP32[tempDoublePtr>>2]=r18,HEAPF32[tempDoublePtr>>2]);r18=HEAPF32[((r16*12&-1)+8>>2)+r7];r16=(r1+172|0)>>2;r1=HEAP32[r16];r20=r2+(r1*12&-1)|0;r2=HEAP32[r20+4>>2];r21=(HEAP32[tempDoublePtr>>2]=HEAP32[r20>>2],HEAPF32[tempDoublePtr>>2]);r20=(HEAP32[tempDoublePtr>>2]=r2,HEAPF32[tempDoublePtr>>2]);r2=HEAPF32[((r1*12&-1)+8>>2)+r7];r7=Math.sin(r9);r1=Math.cos(r9);r22=Math.sin(r14);r23=Math.cos(r14);r24=Math.sin(r18);r25=Math.cos(r18);r26=Math.sin(r2);r27=Math.cos(r2);if((HEAP32[r3+19]|0)==1){r28=HEAPF32[r3+56];r29=HEAPF32[r3+58];r30=r28+r29;r31=1;r32=1;r33=r9-r18-HEAPF32[r3+35];r34=0;r35=0;r36=r28;r37=r29}else{r29=HEAPF32[r3+31];r28=HEAPF32[r3+32];r38=r25*r29-r24*r28;r39=r24*r29+r25*r28;r40=HEAPF32[r3+27]-HEAPF32[r3+48];r41=HEAPF32[r3+28]-HEAPF32[r3+49];r42=HEAPF32[r3+23]-HEAPF32[r3+44];r43=HEAPF32[r3+24]-HEAPF32[r3+45];r44=r1*r42-r7*r43;r45=r7*r42+r1*r43;r43=r39*(r25*r40-r24*r41)-r38*(r24*r40+r25*r41);r1=r39*r44-r38*r45;r42=HEAPF32[r3+58];r7=HEAPF32[r3+56];r46=r10-r19+r44;r44=r11-r17+r45;r30=HEAPF32[r3+54]+HEAPF32[r3+52]+r43*r43*r42+r1*r7*r1;r31=r43;r32=r1;r33=r29*(r25*r46+r24*r44-r40)+r28*(r46*-r24+r25*r44-r41);r34=r38;r35=r39;r36=r7;r37=r42}if((HEAP32[r3+20]|0)==1){r42=HEAPF32[r3+38];r7=HEAPF32[r3+57];r39=HEAPF32[r3+59];r47=r42*r42*(r7+r39);r48=r42;r49=r42;r50=r14-r2-HEAPF32[r3+36];r51=0;r52=0;r53=r42;r54=r7;r55=r39}else{r39=HEAPF32[r3+33];r7=HEAPF32[r3+34];r42=r27*r39-r26*r7;r38=r26*r39+r27*r7;r41=HEAPF32[r3+29]-HEAPF32[r3+50];r44=HEAPF32[r3+30]-HEAPF32[r3+51];r25=HEAPF32[r3+25]-HEAPF32[r3+46];r24=HEAPF32[r3+26]-HEAPF32[r3+47];r46=r23*r25-r22*r24;r28=r22*r25+r23*r24;r24=HEAPF32[r3+38];r23=r24*(r38*(r27*r41-r26*r44)-r42*(r26*r41+r27*r44));r25=r24*(r38*r46-r42*r28);r22=HEAPF32[r3+59];r40=HEAPF32[r3+57];r29=r15-r21+r46;r46=r13-r20+r28;r47=r24*r24*(HEAPF32[r3+55]+HEAPF32[r3+53])+r23*r23*r22+r25*r40*r25;r48=r23;r49=r25;r50=r39*(r27*r29+r26*r46-r41)+r7*(r29*-r26+r27*r46-r44);r51=r42*r24;r52=r38*r24;r53=r24;r54=r40;r55=r22}r22=r30+r47;if(r22>0){r56=-(r33+r50*r53-HEAPF32[r3+37])/r22}else{r56=0}r22=r56*HEAPF32[r3+52];r53=r56*HEAPF32[r3+53];r50=r56*HEAPF32[r3+54];r33=r56*HEAPF32[r3+55];r3=(HEAPF32[tempDoublePtr>>2]=r10+r34*r22,HEAP32[tempDoublePtr>>2]);r10=(HEAPF32[tempDoublePtr>>2]=r11+r35*r22,HEAP32[tempDoublePtr>>2])|0;HEAP32[r8]=0|r3;HEAP32[r8+1]=r10;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r9+r32*r56*r36;r36=HEAP32[r6]+(HEAP32[r5]*12&-1)|0;r32=(HEAPF32[tempDoublePtr>>2]=r15+r51*r53,HEAP32[tempDoublePtr>>2]);r15=(HEAPF32[tempDoublePtr>>2]=r13+r52*r53,HEAP32[tempDoublePtr>>2])|0;HEAP32[r36>>2]=0|r32;HEAP32[r36+4>>2]=r15;HEAPF32[HEAP32[r6]+(HEAP32[r5]*12&-1)+8>>2]=r14+r49*r56*r54;r54=HEAP32[r6]+(HEAP32[r12]*12&-1)|0;r49=(HEAPF32[tempDoublePtr>>2]=r19-r34*r50,HEAP32[tempDoublePtr>>2]);r34=(HEAPF32[tempDoublePtr>>2]=r17-r35*r50,HEAP32[tempDoublePtr>>2])|0;HEAP32[r54>>2]=0|r49;HEAP32[r54+4>>2]=r34;HEAPF32[HEAP32[r6]+(HEAP32[r12]*12&-1)+8>>2]=r18-r31*r56*r37;r37=HEAP32[r6]+(HEAP32[r16]*12&-1)|0;r31=(HEAPF32[tempDoublePtr>>2]=r21-r51*r33,HEAP32[tempDoublePtr>>2]);r51=(HEAPF32[tempDoublePtr>>2]=r20-r52*r33,HEAP32[tempDoublePtr>>2])|0;HEAP32[r37>>2]=0|r31;HEAP32[r37+4>>2]=r51;HEAPF32[HEAP32[r6]+(HEAP32[r16]*12&-1)+8>>2]=r2-r48*r56*r55;return 1}function __ZN11b2GearJoint4DumpEv(r1){var r2,r3,r4,r5,r6,r7;r2=r1>>2;r3=STACKTOP;r4=HEAP32[HEAP32[r2+12]+8>>2];r5=HEAP32[HEAP32[r2+13]+8>>2];r6=HEAP32[HEAP32[r2+17]+56>>2];r7=HEAP32[HEAP32[r2+18]+56>>2];__Z5b2LogPKcz(5248852,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253800,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r4,tempInt));__Z5b2LogPKcz(5251428,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r5,tempInt));__Z5b2LogPKcz(5249488,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+61|0]&1,tempInt));__Z5b2LogPKcz(5247408,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r6,tempInt));__Z5b2LogPKcz(5247152,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r7,tempInt));__Z5b2LogPKcz(5253960,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+38],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254332,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+14],tempInt));STACKTOP=r3;return}function __ZN11b2GearJointD0Ev(r1){__ZdlPv(r1);return}function __ZN7b2JointD1Ev(r1){return}function __ZN7b2Joint4DumpEv(r1){r1=STACKTOP;__Z5b2LogPKcz(5249660,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));STACKTOP=r1;return}function __ZN7b2JointD0Ev(r1){__ZdlPv(r1);return}function __ZN7b2Joint6CreateEPK10b2JointDefP16b2BlockAllocator(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r3=r1>>2;r4=(r1|0)>>2;r5=HEAP32[r4];if((r5|0)==3){r6=__ZN16b2BlockAllocator8AllocateEi(r2,176),r7=r6>>2;do{if((r6|0)==0){r8=0}else{r9=r6;HEAP32[r9>>2]=5261468;r10=r1+8|0;r11=r1+12|0;if((HEAP32[r10>>2]|0)==(HEAP32[r11>>2]|0)){___assert_func(5249968,173,5258024,5251672)}else{HEAP32[r7+1]=HEAP32[r4];HEAP32[r7+2]=0;HEAP32[r7+3]=0;HEAP32[r7+12]=HEAP32[r10>>2];HEAP32[r7+13]=HEAP32[r11>>2];HEAP32[r7+14]=0;HEAP8[r6+61|0]=HEAP8[r1+16|0]&1;HEAP8[r6+60|0]=0;HEAP32[r7+16]=HEAP32[r3+1];_memset(r6+16|0,0,32);HEAP32[r9>>2]=5261976;r9=r1+20|0;r11=r6+80|0;r10=HEAP32[r9+4>>2];HEAP32[r11>>2]=HEAP32[r9>>2];HEAP32[r11+4>>2]=r10;r10=r1+28|0;r11=r6+88|0;r9=HEAP32[r10+4>>2];HEAP32[r11>>2]=HEAP32[r10>>2];HEAP32[r11+4>>2]=r9;HEAPF32[r7+26]=HEAPF32[r3+9];HEAPF32[r7+17]=HEAPF32[r3+10];HEAPF32[r7+18]=HEAPF32[r3+11];HEAPF32[r7+25]=0;HEAPF32[r7+24]=0;HEAPF32[r7+19]=0;r8=r6;break}}}while(0);r6=r8|0;return r6}else if((r5|0)==10){r8=__ZN16b2BlockAllocator8AllocateEi(r2,168),r7=r8>>2;do{if((r8|0)==0){r12=0}else{r9=r8;HEAP32[r9>>2]=5261468;r11=r1+8|0;r10=r1+12|0;if((HEAP32[r11>>2]|0)==(HEAP32[r10>>2]|0)){___assert_func(5249968,173,5258024,5251672)}else{HEAP32[r7+1]=HEAP32[r4];HEAP32[r7+2]=0;HEAP32[r7+3]=0;HEAP32[r7+12]=HEAP32[r11>>2];HEAP32[r7+13]=HEAP32[r10>>2];HEAP32[r7+14]=0;HEAP8[r8+61|0]=HEAP8[r1+16|0]&1;HEAP8[r8+60|0]=0;HEAP32[r7+16]=HEAP32[r3+1];_memset(r8+16|0,0,32);HEAP32[r9>>2]=5262416;r9=r1+20|0;r10=r8+68|0;r11=HEAP32[r9+4>>2];HEAP32[r10>>2]=HEAP32[r9>>2];HEAP32[r10+4>>2]=r11;r11=r1+28|0;r10=r8+76|0;r9=HEAP32[r11+4>>2];HEAP32[r10>>2]=HEAP32[r11>>2];HEAP32[r10+4>>2]=r9;HEAPF32[r7+21]=HEAPF32[r3+9];HEAPF32[r7+40]=0;HEAPF32[r7+23]=0;HEAP32[r7+41]=0;HEAPF32[r7+22]=0;r12=r8;break}}}while(0);r6=r12|0;return r6}else if((r5|0)==2){r12=__ZN16b2BlockAllocator8AllocateEi(r2,256);if((r12|0)==0){r13=0}else{r8=r12;__ZN16b2PrismaticJointC2EPK19b2PrismaticJointDef(r8,r1);r13=r8}r6=r13|0;return r6}else if((r5|0)==7){r13=__ZN16b2BlockAllocator8AllocateEi(r2,224);if((r13|0)==0){r14=0}else{r8=r13;__ZN12b2WheelJointC2EPK15b2WheelJointDef(r8,r1);r14=r8}r6=r14|0;return r6}else if((r5|0)==8){r14=__ZN16b2BlockAllocator8AllocateEi(r2,208),r8=r14>>2;do{if((r14|0)==0){r15=0}else{r13=r14;HEAP32[r13>>2]=5261468;r12=r1+8|0;r7=r1+12|0;if((HEAP32[r12>>2]|0)==(HEAP32[r7>>2]|0)){___assert_func(5249968,173,5258024,5251672)}else{HEAP32[r8+1]=HEAP32[r4];HEAP32[r8+2]=0;HEAP32[r8+3]=0;HEAP32[r8+12]=HEAP32[r12>>2];HEAP32[r8+13]=HEAP32[r7>>2];HEAP32[r8+14]=0;HEAP8[r14+61|0]=HEAP8[r1+16|0]&1;HEAP8[r14+60|0]=0;HEAP32[r8+16]=HEAP32[r3+1];_memset(r14+16|0,0,32);HEAP32[r13>>2]=5262364;r13=r1+20|0;r7=r14+80|0;r12=HEAP32[r13+4>>2];HEAP32[r7>>2]=HEAP32[r13>>2];HEAP32[r7+4>>2]=r12;r12=r1+28|0;r7=r14+88|0;r13=HEAP32[r12+4>>2];HEAP32[r7>>2]=HEAP32[r12>>2];HEAP32[r7+4>>2]=r13;HEAPF32[r8+24]=HEAPF32[r3+9];HEAPF32[r8+17]=HEAPF32[r3+10];HEAPF32[r8+18]=HEAPF32[r3+11];HEAPF32[r8+26]=0;HEAPF32[r8+27]=0;HEAPF32[r8+28]=0;r15=r14;break}}}while(0);r6=r15|0;return r6}else if((r5|0)==1){r15=__ZN16b2BlockAllocator8AllocateEi(r2,228),r14=r15>>2;do{if((r15|0)==0){r16=0}else{r8=r15;HEAP32[r8>>2]=5261468;r13=r1+8|0;r7=r1+12|0;if((HEAP32[r13>>2]|0)==(HEAP32[r7>>2]|0)){___assert_func(5249968,173,5258024,5251672)}else{HEAP32[r14+1]=HEAP32[r4];HEAP32[r14+2]=0;HEAP32[r14+3]=0;HEAP32[r14+12]=HEAP32[r13>>2];HEAP32[r14+13]=HEAP32[r7>>2];HEAP32[r14+14]=0;HEAP8[r15+61|0]=HEAP8[r1+16|0]&1;HEAP8[r15+60|0]=0;HEAP32[r14+16]=HEAP32[r3+1];_memset(r15+16|0,0,32);HEAP32[r8>>2]=5261848;r8=r1+20|0;r7=r15+68|0;r13=HEAP32[r8+4>>2];HEAP32[r7>>2]=HEAP32[r8>>2];HEAP32[r7+4>>2]=r13;r13=r1+28|0;r7=r15+76|0;r8=HEAP32[r13+4>>2];HEAP32[r7>>2]=HEAP32[r13>>2];HEAP32[r7+4>>2]=r8;HEAPF32[r14+29]=HEAPF32[r3+9];r8=(r15+84|0)>>2;HEAP32[r8]=0;HEAP32[r8+1]=0;HEAP32[r8+2]=0;HEAP32[r8+3]=0;HEAPF32[r14+30]=HEAPF32[r3+11];HEAPF32[r14+31]=HEAPF32[r3+12];HEAPF32[r14+26]=HEAPF32[r3+15];HEAPF32[r14+27]=HEAPF32[r3+14];HEAP8[r15+112|0]=HEAP8[r1+40|0]&1;HEAP8[r15+100|0]=HEAP8[r1+52|0]&1;HEAP32[r14+56]=0;r16=r15;break}}}while(0);r6=r16|0;return r6}else if((r5|0)==5){r16=__ZN16b2BlockAllocator8AllocateEi(r2,168);if((r16|0)==0){r17=0}else{r15=r16;__ZN12b2MouseJointC2EPK15b2MouseJointDef(r15,r1);r17=r15}r6=r17|0;return r6}else if((r5|0)==9){r17=__ZN16b2BlockAllocator8AllocateEi(r2,180),r15=r17>>2;do{if((r17|0)==0){r18=0}else{r16=r17;HEAP32[r16>>2]=5261468;r14=r1+8|0;r8=r1+12|0;if((HEAP32[r14>>2]|0)==(HEAP32[r8>>2]|0)){___assert_func(5249968,173,5258024,5251672)}else{HEAP32[r15+1]=HEAP32[r4];HEAP32[r15+2]=0;HEAP32[r15+3]=0;HEAP32[r15+12]=HEAP32[r14>>2];HEAP32[r15+13]=HEAP32[r8>>2];HEAP32[r15+14]=0;HEAP8[r17+61|0]=HEAP8[r1+16|0]&1;HEAP8[r17+60|0]=0;HEAP32[r15+16]=HEAP32[r3+1];_memset(r17+16|0,0,32);HEAP32[r16>>2]=5261924;r16=r1+20|0;r8=r17+68|0;r14=HEAP32[r16+4>>2];HEAP32[r8>>2]=HEAP32[r16>>2];HEAP32[r8+4>>2]=r14;r14=r1+28|0;r8=r17+76|0;r16=HEAP32[r14+4>>2];HEAP32[r8>>2]=HEAP32[r14>>2];HEAP32[r8+4>>2]=r16;HEAPF32[r15+21]=0;HEAPF32[r15+22]=0;HEAPF32[r15+23]=0;HEAPF32[r15+24]=HEAPF32[r3+9];HEAPF32[r15+25]=HEAPF32[r3+10];r18=r17;break}}}while(0);r6=r18|0;return r6}else if((r5|0)==6){r18=__ZN16b2BlockAllocator8AllocateEi(r2,276);if((r18|0)==0){r19=0}else{r17=r18;__ZN11b2GearJointC2EPK14b2GearJointDef(r17,r1);r19=r17}r6=r19|0;return r6}else if((r5|0)==4){r5=__ZN16b2BlockAllocator8AllocateEi(r2,196);if((r5|0)==0){r20=0}else{r2=r5;__ZN13b2PulleyJointC2EPK16b2PulleyJointDef(r2,r1);r20=r2}r6=r20|0;return r6}else{___assert_func(5249968,113,5258124,5254044)}}function __ZN7b2Joint7DestroyEPS_P16b2BlockAllocator(r1,r2){var r3,r4,r5,r6;r3=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r3]+20>>2]](r1);r4=HEAP32[r3+1];if((r4|0)==3){r5=HEAP8[5264028];if((r5&255)>=14){___assert_func(5248148,173,5259684,5249276)}r6=((r5&255)<<2)+r2+12|0;HEAP32[r3]=HEAP32[r6>>2];HEAP32[r6>>2]=r1;return}else if((r4|0)==5){r6=HEAP8[5264020];if((r6&255)>=14){___assert_func(5248148,173,5259684,5249276)}r5=((r6&255)<<2)+r2+12|0;HEAP32[r3]=HEAP32[r5>>2];HEAP32[r5>>2]=r1;return}else if((r4|0)==2){r5=HEAP8[5264108];if((r5&255)>=14){___assert_func(5248148,173,5259684,5249276)}r6=((r5&255)<<2)+r2+12|0;HEAP32[r3]=HEAP32[r6>>2];HEAP32[r6>>2]=r1;return}else if((r4|0)==1){r6=HEAP8[5264080];if((r6&255)>=14){___assert_func(5248148,173,5259684,5249276)}r5=((r6&255)<<2)+r2+12|0;HEAP32[r3]=HEAP32[r5>>2];HEAP32[r5>>2]=r1;return}else if((r4|0)==4){r5=HEAP8[5264048];if((r5&255)>=14){___assert_func(5248148,173,5259684,5249276)}r6=((r5&255)<<2)+r2+12|0;HEAP32[r3]=HEAP32[r6>>2];HEAP32[r6>>2]=r1;return}else if((r4|0)==9){r6=HEAP8[5264032];if((r6&255)>=14){___assert_func(5248148,173,5259684,5249276)}r5=((r6&255)<<2)+r2+12|0;HEAP32[r3]=HEAP32[r5>>2];HEAP32[r5>>2]=r1;return}else if((r4|0)==7){r5=HEAP8[5264076];if((r5&255)>=14){___assert_func(5248148,173,5259684,5249276)}r6=((r5&255)<<2)+r2+12|0;HEAP32[r3]=HEAP32[r6>>2];HEAP32[r6>>2]=r1;return}else if((r4|0)==6){r6=HEAP8[5264128];if((r6&255)>=14){___assert_func(5248148,173,5259684,5249276)}r5=((r6&255)<<2)+r2+12|0;HEAP32[r3]=HEAP32[r5>>2];HEAP32[r5>>2]=r1;return}else if((r4|0)==8){r5=HEAP8[5264060];if((r5&255)>=14){___assert_func(5248148,173,5259684,5249276)}r6=((r5&255)<<2)+r2+12|0;HEAP32[r3]=HEAP32[r6>>2];HEAP32[r6>>2]=r1;return}else if((r4|0)==10){r4=HEAP8[5264020];if((r4&255)>=14){___assert_func(5248148,173,5259684,5249276)}r6=((r4&255)<<2)+r2+12|0;HEAP32[r3]=HEAP32[r6>>2];HEAP32[r6>>2]=r1;return}else{___assert_func(5249968,166,5258064,5254044)}}function __ZN12b2MouseJoint24SolvePositionConstraintsERK12b2SolverData(r1,r2){return 1}function __ZN12b2MouseJointD1Ev(r1){return}function __ZNK12b2MouseJoint17GetReactionTorqueEf(r1,r2){return 0}function __ZNK12b2MouseJoint10GetAnchorAEv(r1,r2){var r3;r3=r2+76|0;r2=r1;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function __ZNK12b2MouseJoint10GetAnchorBEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+52>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+68>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+72>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK12b2MouseJoint16GetReactionForceEf(r1,r2,r3){var r4;r4=HEAPF32[r2+100>>2]*r3;HEAPF32[r1>>2]=HEAPF32[r2+96>>2]*r3;HEAPF32[r1+4>>2]=r4;return}function __ZN12b2MouseJoint24SolveVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=r1>>2;r4=r1+116|0;r5=HEAP32[r4>>2];r6=(r2+28|0)>>2;r7=HEAP32[r6];r8=r7+(r5*12&-1)|0;r9=HEAP32[r8+4>>2];r10=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAPF32[tempDoublePtr>>2]);r8=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2]);r9=HEAPF32[r7+(r5*12&-1)+8>>2];r7=HEAPF32[r3+31];r11=HEAPF32[r3+30];r12=HEAPF32[r3+27];r13=r1+96|0;r14=(r13|0)>>2;r15=HEAPF32[r14];r16=(r1+100|0)>>2;r1=HEAPF32[r16];r17=-(r10+r7*-r9+HEAPF32[r3+40]+r12*r15);r18=-(r8+r9*r11+HEAPF32[r3+41]+r12*r1);r12=HEAPF32[r3+36]*r17+HEAPF32[r3+38]*r18;r19=HEAPF32[r3+37]*r17+HEAPF32[r3+39]*r18;r18=r13;r13=HEAP32[r18+4>>2];r17=(HEAP32[tempDoublePtr>>2]=HEAP32[r18>>2],HEAPF32[tempDoublePtr>>2]);r18=(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=r15+r12;HEAPF32[r14]=r13;r12=r19+r1;HEAPF32[r16]=r12;r1=HEAPF32[r2>>2]*HEAPF32[r3+26];r2=r12*r12+r13*r13;if(r2>r1*r1){r19=r1/Math.sqrt(r2);r2=r13*r19;HEAPF32[r14]=r2;r14=r19*r12;HEAPF32[r16]=r14;r20=r2;r21=r14}else{r20=r13;r21=r12}r12=r20-r17;r17=r21-r18;r18=HEAPF32[r3+34];r21=r9+HEAPF32[r3+35]*(r17*r11-r12*r7);r7=HEAP32[r6]+(r5*12&-1)|0;r5=(HEAPF32[tempDoublePtr>>2]=r10+r12*r18,HEAP32[tempDoublePtr>>2]);r12=(HEAPF32[tempDoublePtr>>2]=r8+r17*r18,HEAP32[tempDoublePtr>>2])|0;HEAP32[r7>>2]=0|r5;HEAP32[r7+4>>2]=r12;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r21;return}function __ZN12b2MouseJoint4DumpEv(r1){r1=STACKTOP;__Z5b2LogPKcz(5247944,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));STACKTOP=r1;return}function __ZN12b2MouseJointD0Ev(r1){__ZdlPv(r1);return}function __ZN12b2MouseJointC2EPK15b2MouseJointDef(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11;r3=r1>>2;r4=r1|0;HEAP32[r4>>2]=5261468;r5=r2+8|0;r6=r2+12|0;if((HEAP32[r5>>2]|0)==(HEAP32[r6>>2]|0)){___assert_func(5249968,173,5258024,5251672)}HEAP32[r3+1]=HEAP32[r2>>2];HEAP32[r3+2]=0;HEAP32[r3+3]=0;HEAP32[r3+12]=HEAP32[r5>>2];r5=HEAP32[r6>>2],r6=r5>>2;HEAP32[r3+13]=r5;HEAP32[r3+14]=0;HEAP8[r1+61|0]=HEAP8[r2+16|0]&1;HEAP8[r1+60|0]=0;HEAP32[r3+16]=HEAP32[r2+4>>2];_memset(r1+16|0,0,32);HEAP32[r4>>2]=5262268;r4=r2+20|0;r5=HEAPF32[r4>>2];if(!(!isNaN(r5)&!isNaN(0)&r5>-Infinity&r5<Infinity)){___assert_func(5249796,34,5260508,5253984)}r5=HEAPF32[r2+24>>2];if(!(!isNaN(r5)&!isNaN(0)&r5>-Infinity&r5<Infinity)){___assert_func(5249796,34,5260508,5253984)}r5=r2+28|0;r7=HEAPF32[r5>>2];if(r7<0|!isNaN(r7)&!isNaN(0)&r7>-Infinity&r7<Infinity^1){___assert_func(5249796,35,5260508,5251620)}r7=r2+32|0;r8=HEAPF32[r7>>2];if(r8<0|!isNaN(r8)&!isNaN(0)&r8>-Infinity&r8<Infinity^1){___assert_func(5249796,36,5260508,5249604)}r8=r2+36|0;r2=HEAPF32[r8>>2];if(r2<0|!isNaN(r2)&!isNaN(0)&r2>-Infinity&r2<Infinity^1){___assert_func(5249796,37,5260508,5248792)}else{r2=r4;r4=r1+76|0;r9=HEAP32[r2>>2];r10=HEAP32[r2+4>>2];HEAP32[r4>>2]=r9;HEAP32[r4+4>>2]=r10;r4=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2])-HEAPF32[r6+3];r9=(HEAP32[tempDoublePtr>>2]=r10,HEAPF32[tempDoublePtr>>2])-HEAPF32[r6+4];r10=HEAPF32[r6+6];r2=HEAPF32[r6+5];r6=r1+68|0;r1=(HEAPF32[tempDoublePtr>>2]=r4*r10+r9*r2,HEAP32[tempDoublePtr>>2]);r11=(HEAPF32[tempDoublePtr>>2]=r10*r9+r4*-r2,HEAP32[tempDoublePtr>>2])|0;HEAP32[r6>>2]=0|r1;HEAP32[r6+4>>2]=r11;HEAPF32[r3+26]=HEAPF32[r5>>2];HEAPF32[r3+24]=0;HEAPF32[r3+25]=0;HEAPF32[r3+21]=HEAPF32[r7>>2];HEAPF32[r3+22]=HEAPF32[r8>>2];HEAPF32[r3+23]=0;HEAPF32[r3+27]=0;return}}function __ZN12b2MouseJoint23InitVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35;r3=r1>>2;r4=HEAP32[r3+13],r5=r4>>2;r6=HEAP32[r5+2];r7=(r1+116|0)>>2;HEAP32[r7]=r6;r8=r4+28|0;r4=r1+128|0;r9=HEAP32[r8>>2];r10=HEAP32[r8+4>>2];HEAP32[r4>>2]=r9;HEAP32[r4+4>>2]=r10;r4=HEAPF32[r5+30];HEAPF32[r3+34]=r4;r8=HEAPF32[r5+32];HEAPF32[r3+35]=r8;r11=HEAP32[r2+24>>2];r12=r11+(r6*12&-1)|0;r13=HEAP32[r12+4>>2];r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAPF32[tempDoublePtr>>2]);r12=(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r11+(r6*12&-1)+8>>2];r11=(r2+28|0)>>2;r15=HEAP32[r11];r16=r15+(r6*12&-1)|0;r17=HEAP32[r16+4>>2];r18=(HEAP32[tempDoublePtr>>2]=HEAP32[r16>>2],HEAPF32[tempDoublePtr>>2]);r16=(HEAP32[tempDoublePtr>>2]=r17,HEAPF32[tempDoublePtr>>2]);r17=HEAPF32[r15+(r6*12&-1)+8>>2];r15=Math.sin(r13);r19=Math.cos(r13);r13=HEAPF32[r5+29];r5=HEAPF32[r3+21]*6.2831854820251465;r20=HEAPF32[r2>>2];r21=r20*r13*r5*r5;r22=r5*r13*2*HEAPF32[r3+22]+r21;r13=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2]);r9=(HEAP32[tempDoublePtr>>2]=r10,HEAPF32[tempDoublePtr>>2]);if(r22<=1.1920928955078125e-7){___assert_func(5249796,125,5260560,5248392)}r10=r20*r22;if(r10!=0){r23=1/r10}else{r23=r10}HEAPF32[r3+27]=r23;r10=r21*r23;HEAPF32[r3+23]=r10;r21=HEAPF32[r3+17]-r13;r13=HEAPF32[r3+18]-r9;r9=r19*r21-r15*r13;r22=r15*r21+r19*r13;r13=r1+120|0;r19=(HEAPF32[tempDoublePtr>>2]=r9,HEAP32[tempDoublePtr>>2]);r21=(HEAPF32[tempDoublePtr>>2]=r22,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r19;HEAP32[r13+4>>2]=r21;r21=r23+r4+r22*r8*r22;r13=r22*r9*-r8;r19=r23+r4+r9*r8*r9;r23=r21*r19-r13*r13;if(r23!=0){r24=1/r23}else{r24=r23}r23=r13*-r24;HEAPF32[r3+36]=r19*r24;HEAPF32[r3+37]=r23;HEAPF32[r3+38]=r23;HEAPF32[r3+39]=r21*r24;r24=r1+160|0;r21=r14+r9-HEAPF32[r3+19];r14=r12+r22-HEAPF32[r3+20];r12=r24;r23=(HEAPF32[tempDoublePtr>>2]=r21,HEAP32[tempDoublePtr>>2]);r19=(HEAPF32[tempDoublePtr>>2]=r14,HEAP32[tempDoublePtr>>2])|0;HEAP32[r12>>2]=0|r23;HEAP32[r12+4>>2]=r19;HEAPF32[r24>>2]=r10*r21;HEAPF32[r3+41]=r10*r14;r14=r17*.9800000190734863;r17=r1+96|0;if((HEAP8[r2+20|0]&1)<<24>>24==0){HEAPF32[r17>>2]=0;HEAPF32[r3+25]=0;r3=r14;r10=r18;r21=r16;r24=HEAP32[r11];r19=r24+(r6*12&-1)|0;r12=r19;r23=(HEAPF32[tempDoublePtr>>2]=r10,HEAP32[tempDoublePtr>>2]);r13=(HEAPF32[tempDoublePtr>>2]=r21,HEAP32[tempDoublePtr>>2]);r15=r13;r20=0;r5=0;r25=r15;r26=r23;r27=0;r28=r5|r26;r29=r25|r27;r30=r12|0;HEAP32[r30>>2]=r28;r31=r12+4|0;HEAP32[r31>>2]=r29;r32=HEAP32[r7];r33=HEAP32[r11];r34=r33+(r32*12&-1)+8|0;HEAPF32[r34>>2]=r3;return}else{r35=HEAPF32[r2+8>>2];r2=r17|0;r17=r35*HEAPF32[r2>>2];HEAPF32[r2>>2]=r17;r2=r1+100|0;r1=r35*HEAPF32[r2>>2];HEAPF32[r2>>2]=r1;r3=r14+r8*(r1*r9-r17*r22);r10=r18+r4*r17;r21=r16+r1*r4;r24=HEAP32[r11];r19=r24+(r6*12&-1)|0;r12=r19;r23=(HEAPF32[tempDoublePtr>>2]=r10,HEAP32[tempDoublePtr>>2]);r13=(HEAPF32[tempDoublePtr>>2]=r21,HEAP32[tempDoublePtr>>2]);r15=r13;r20=0;r5=0;r25=r15;r26=r23;r27=0;r28=r5|r26;r29=r25|r27;r30=r12|0;HEAP32[r30>>2]=r28;r31=r12+4|0;HEAP32[r31>>2]=r29;r32=HEAP32[r7];r33=HEAP32[r11];r34=r33+(r32*12&-1)+8|0;HEAPF32[r34>>2]=r3;return}}function __ZN16b2PrismaticJointC2EPK19b2PrismaticJointDef(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11;r3=r2>>2;r4=r1>>2;r5=r1|0;HEAP32[r5>>2]=5261468;r6=r2+8|0;r7=r2+12|0;if((HEAP32[r6>>2]|0)==(HEAP32[r7>>2]|0)){___assert_func(5249968,173,5258024,5251672)}HEAP32[r4+1]=HEAP32[r3];HEAP32[r4+2]=0;HEAP32[r4+3]=0;HEAP32[r4+12]=HEAP32[r6>>2];HEAP32[r4+13]=HEAP32[r7>>2];HEAP32[r4+14]=0;HEAP8[r1+61|0]=HEAP8[r2+16|0]&1;HEAP8[r1+60|0]=0;HEAP32[r4+16]=HEAP32[r3+1];_memset(r1+16|0,0,32);HEAP32[r5>>2]=5261772;r5=r1+84|0;r7=r2+20|0;r6=r1+68|0;r8=HEAP32[r7+4>>2];HEAP32[r6>>2]=HEAP32[r7>>2];HEAP32[r6+4>>2]=r8;r8=r2+28|0;r6=r1+76|0;r7=HEAP32[r8+4>>2];HEAP32[r6>>2]=HEAP32[r8>>2];HEAP32[r6+4>>2]=r7;r7=r2+36|0;r6=r5;r8=HEAP32[r7>>2];r9=HEAP32[r7+4>>2];HEAP32[r6>>2]=r8;HEAP32[r6+4>>2]=r9;r6=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2]);r9=Math.sqrt(r6*r6+r8*r8);if(r9<1.1920928955078125e-7){r10=r8;r11=r6}else{r7=1/r9;r9=r6*r7;HEAPF32[r5>>2]=r9;r5=r8*r7;HEAPF32[r4+22]=r5;r10=r5;r11=r9}r9=r1+92|0;r5=(HEAPF32[tempDoublePtr>>2]=r10*-1,HEAP32[tempDoublePtr>>2]);r10=(HEAPF32[tempDoublePtr>>2]=r11,HEAP32[tempDoublePtr>>2])|0;HEAP32[r9>>2]=0|r5;HEAP32[r9+4>>2]=r10;HEAPF32[r4+25]=HEAPF32[r3+11];HEAPF32[r4+63]=0;r10=(r1+104|0)>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;HEAP32[r10+3]=0;HEAPF32[r4+30]=HEAPF32[r3+13];HEAPF32[r4+31]=HEAPF32[r3+14];HEAPF32[r4+32]=HEAPF32[r3+16];HEAPF32[r4+33]=HEAPF32[r3+17];HEAP8[r1+136|0]=HEAP8[r2+48|0]&1;HEAP8[r1+137|0]=HEAP8[r2+60|0]&1;HEAP32[r4+35]=0;r4=(r1+184|0)>>2;HEAP32[r4]=0;HEAP32[r4+1]=0;HEAP32[r4+2]=0;HEAP32[r4+3]=0;return}function __ZN16b2PrismaticJoint23InitVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72;r3=r1>>2;r4=HEAP32[r3+12],r5=r4>>2;r6=HEAP32[r5+2];r7=(r1+144|0)>>2;HEAP32[r7]=r6;r8=HEAP32[r3+13],r9=r8>>2;r10=HEAP32[r9+2];r11=(r1+148|0)>>2;HEAP32[r11]=r10;r12=r4+28|0;r4=r1+152|0;r13=HEAP32[r12>>2];r14=HEAP32[r12+4>>2];HEAP32[r4>>2]=r13;HEAP32[r4+4>>2]=r14;r4=r8+28|0;r8=r1+160|0;r12=HEAP32[r4>>2];r15=HEAP32[r4+4>>2];HEAP32[r8>>2]=r12;HEAP32[r8+4>>2]=r15;r8=HEAPF32[r5+30];HEAPF32[r3+42]=r8;r4=HEAPF32[r9+30];HEAPF32[r3+43]=r4;r16=HEAPF32[r5+32];HEAPF32[r3+44]=r16;r5=HEAPF32[r9+32];HEAPF32[r3+45]=r5;r9=HEAP32[r2+24>>2];r17=r9+(r6*12&-1)|0;r18=HEAP32[r17+4>>2];r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAPF32[tempDoublePtr>>2]);r17=(HEAP32[tempDoublePtr>>2]=r18,HEAPF32[tempDoublePtr>>2]);r18=HEAPF32[r9+(r6*12&-1)+8>>2];r20=(r2+28|0)>>2;r21=HEAP32[r20];r22=r21+(r6*12&-1)|0;r23=HEAP32[r22+4>>2];r24=(HEAP32[tempDoublePtr>>2]=HEAP32[r22>>2],HEAPF32[tempDoublePtr>>2]);r22=(HEAP32[tempDoublePtr>>2]=r23,HEAPF32[tempDoublePtr>>2]);r23=HEAPF32[r21+(r6*12&-1)+8>>2];r25=r9+(r10*12&-1)|0;r26=HEAP32[r25+4>>2];r27=(HEAP32[tempDoublePtr>>2]=HEAP32[r25>>2],HEAPF32[tempDoublePtr>>2]);r25=(HEAP32[tempDoublePtr>>2]=r26,HEAPF32[tempDoublePtr>>2]);r26=HEAPF32[r9+(r10*12&-1)+8>>2];r9=r21+(r10*12&-1)|0;r28=HEAP32[r9+4>>2];r29=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAPF32[tempDoublePtr>>2]);r9=(HEAP32[tempDoublePtr>>2]=r28,HEAPF32[tempDoublePtr>>2]);r28=HEAPF32[r21+(r10*12&-1)+8>>2];r10=Math.sin(r18);r21=Math.cos(r18);r18=Math.sin(r26);r30=Math.cos(r26);r26=HEAPF32[r3+17]-(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r3+18]-(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=r21*r26-r10*r13;r31=r10*r26+r21*r13;r13=HEAPF32[r3+19]-(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=HEAPF32[r3+20]-(HEAP32[tempDoublePtr>>2]=r15,HEAPF32[tempDoublePtr>>2]);r15=r30*r13-r18*r12;r26=r18*r13+r30*r12;r12=r27-r19+r15-r14;r19=r25-r17+r26-r31;r17=HEAPF32[r3+21];r25=HEAPF32[r3+22];r27=r21*r17-r10*r25;r30=r10*r17+r21*r25;r25=r1+184|0;r17=(HEAPF32[tempDoublePtr>>2]=r27,HEAP32[tempDoublePtr>>2]);r13=(HEAPF32[tempDoublePtr>>2]=r30,HEAP32[tempDoublePtr>>2])|0;HEAP32[r25>>2]=0|r17;HEAP32[r25+4>>2]=r13;r13=r14+r12;r14=r31+r19;r31=r13*r30-r14*r27;HEAPF32[r3+52]=r31;r25=r15*r30-r26*r27;HEAPF32[r3+53]=r25;r17=r8+r4;r18=r16*r31;r32=r5*r25;r33=r17+r31*r18+r25*r32;if(r33>0){r34=1/r33}else{r34=r33}HEAPF32[r3+63]=r34;r34=HEAPF32[r3+23];r35=HEAPF32[r3+24];r36=r21*r34-r10*r35;r37=r10*r34+r21*r35;r35=r1+192|0;r21=(HEAPF32[tempDoublePtr>>2]=r36,HEAP32[tempDoublePtr>>2]);r34=(HEAPF32[tempDoublePtr>>2]=r37,HEAP32[tempDoublePtr>>2])|0;HEAP32[r35>>2]=0|r21;HEAP32[r35+4>>2]=r34;r34=r13*r37-r14*r36;HEAPF32[r3+50]=r34;r14=r15*r37-r26*r36;HEAPF32[r3+51]=r14;r26=r16*r34;r15=r5*r14;r13=r26+r15;r35=r26*r31+r15*r25;r21=r5+r16;r10=r18+r32;HEAPF32[r3+54]=r17+r34*r26+r14*r15;HEAPF32[r3+55]=r13;HEAPF32[r3+56]=r35;HEAPF32[r3+57]=r13;HEAPF32[r3+58]=r21==0?1:r21;HEAPF32[r3+59]=r10;HEAPF32[r3+60]=r35;HEAPF32[r3+61]=r10;HEAPF32[r3+62]=r33;do{if((HEAP8[r1+136|0]&1)<<24>>24==0){HEAP32[r3+35]=0;HEAPF32[r3+28]=0}else{r33=r12*r27+r19*r30;r10=HEAPF32[r3+31];r35=HEAPF32[r3+30];r21=r10-r35;if(r21>0){r38=r21}else{r38=-r21}if(r38<.009999999776482582){HEAP32[r3+35]=3;break}if(r33<=r35){r35=r1+140|0;if((HEAP32[r35>>2]|0)==1){break}HEAP32[r35>>2]=1;HEAPF32[r3+28]=0;break}r35=(r1+140|0)>>2;if(r33<r10){HEAP32[r35]=0;HEAPF32[r3+28]=0;break}if((HEAP32[r35]|0)==2){break}HEAP32[r35]=2;HEAPF32[r3+28]=0}}while(0);if((HEAP8[r1+137|0]&1)<<24>>24==0){HEAPF32[r3+29]=0}r3=r1+104|0;if((HEAP8[r2+20|0]&1)<<24>>24==0){r38=r3>>2;HEAP32[r38]=0;HEAP32[r38+1]=0;HEAP32[r38+2]=0;HEAP32[r38+3]=0;r38=r23;r19=r28;r12=r29;r35=r9;r10=r24;r33=r22;r21=HEAP32[r20];r13=r21+(r6*12&-1)|0;r15=r13;r26=(HEAPF32[tempDoublePtr>>2]=r10,HEAP32[tempDoublePtr>>2]);r17=(HEAPF32[tempDoublePtr>>2]=r33,HEAP32[tempDoublePtr>>2]);r32=r17;r18=0;r39=0;r40=r32;r41=r26;r42=0;r43=r39|r41;r44=r40|r42;r45=r15|0;HEAP32[r45>>2]=r43;r46=r15+4|0;HEAP32[r46>>2]=r44;r47=HEAP32[r7];r48=HEAP32[r20];r49=r48+(r47*12&-1)+8|0;HEAPF32[r49>>2]=r38;r50=HEAP32[r11];r51=HEAP32[r20];r52=r51+(r50*12&-1)|0;r53=r52;r54=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r55=(HEAPF32[tempDoublePtr>>2]=r35,HEAP32[tempDoublePtr>>2]);r56=r55;r57=0;r58=0;r59=r56;r60=r54;r61=0;r62=r58|r60;r63=r59|r61;r64=r53|0;HEAP32[r64>>2]=r62;r65=r53+4|0;HEAP32[r65>>2]=r63;r66=HEAP32[r11];r67=HEAP32[r20];r68=r67+(r66*12&-1)+8|0;HEAPF32[r68>>2]=r19;return}else{r69=r2+8|0;r2=HEAPF32[r69>>2];r70=r3|0;r3=r2*HEAPF32[r70>>2];HEAPF32[r70>>2]=r3;r70=r1+108|0;r71=r2*HEAPF32[r70>>2];HEAPF32[r70>>2]=r71;r70=r1+112|0;r72=r2*HEAPF32[r70>>2];HEAPF32[r70>>2]=r72;r70=r1+116|0;r1=HEAPF32[r69>>2]*HEAPF32[r70>>2];HEAPF32[r70>>2]=r1;r70=r1+r72;r72=r3*r36+r27*r70;r27=r3*r37+r70*r30;r38=r23-r16*(r3*r34+r71+r70*r31);r19=r28+r5*(r71+r3*r14+r70*r25);r12=r29+r4*r72;r35=r9+r4*r27;r10=r24-r8*r72;r33=r22-r8*r27;r21=HEAP32[r20];r13=r21+(r6*12&-1)|0;r15=r13;r26=(HEAPF32[tempDoublePtr>>2]=r10,HEAP32[tempDoublePtr>>2]);r17=(HEAPF32[tempDoublePtr>>2]=r33,HEAP32[tempDoublePtr>>2]);r32=r17;r18=0;r39=0;r40=r32;r41=r26;r42=0;r43=r39|r41;r44=r40|r42;r45=r15|0;HEAP32[r45>>2]=r43;r46=r15+4|0;HEAP32[r46>>2]=r44;r47=HEAP32[r7];r48=HEAP32[r20];r49=r48+(r47*12&-1)+8|0;HEAPF32[r49>>2]=r38;r50=HEAP32[r11];r51=HEAP32[r20];r52=r51+(r50*12&-1)|0;r53=r52;r54=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r55=(HEAPF32[tempDoublePtr>>2]=r35,HEAP32[tempDoublePtr>>2]);r56=r55;r57=0;r58=0;r59=r56;r60=r54;r61=0;r62=r58|r60;r63=r59|r61;r64=r53|0;HEAP32[r64>>2]=r62;r65=r53+4|0;HEAP32[r65>>2]=r63;r66=HEAP32[r11];r67=HEAP32[r20];r68=r67+(r66*12&-1)+8|0;HEAPF32[r68>>2]=r19;return}}function __ZN16b2PrismaticJoint24SolveVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60;r3=r1>>2;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+24|0;r6=r5;r7=r5+12,r8=r7>>2;r9=(r1+144|0)>>2;r10=HEAP32[r9];r11=(r2+28|0)>>2;r12=HEAP32[r11];r13=r12+(r10*12&-1)|0;r14=HEAP32[r13+4>>2];r15=(HEAP32[tempDoublePtr>>2]=HEAP32[r13>>2],HEAPF32[tempDoublePtr>>2]);r13=(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=HEAPF32[r12+(r10*12&-1)+8>>2];r16=(r1+148|0)>>2;r17=HEAP32[r16];r18=r12+(r17*12&-1)|0;r19=HEAP32[r18+4>>2];r20=(HEAP32[tempDoublePtr>>2]=HEAP32[r18>>2],HEAPF32[tempDoublePtr>>2]);r18=(HEAP32[tempDoublePtr>>2]=r19,HEAPF32[tempDoublePtr>>2]);r19=HEAPF32[r12+(r17*12&-1)+8>>2];r17=HEAPF32[r3+42];r12=HEAPF32[r3+43];r21=HEAPF32[r3+44];r22=HEAPF32[r3+45];do{if((HEAP8[r1+137|0]&1)<<24>>24==0){r23=r14;r24=r19;r25=r20;r26=r18;r27=r15;r28=r13}else{if((HEAP32[r3+35]|0)==3){r23=r14;r24=r19;r25=r20;r26=r18;r27=r15;r28=r13;break}r29=HEAPF32[r3+46];r30=HEAPF32[r3+47];r31=HEAPF32[r3+53];r32=HEAPF32[r3+52];r33=r1+116|0;r34=HEAPF32[r33>>2];r35=HEAPF32[r2>>2]*HEAPF32[r3+32];r36=r34+HEAPF32[r3+63]*(HEAPF32[r3+33]-((r20-r15)*r29+(r18-r13)*r30+r19*r31-r14*r32));r37=-r35;r38=r36<r35?r36:r35;r35=r38<r37?r37:r38;HEAPF32[r33>>2]=r35;r33=r35-r34;r34=r29*r33;r29=r30*r33;r23=r14-r21*r32*r33;r24=r19+r22*r31*r33;r25=r20+r12*r34;r26=r18+r12*r29;r27=r15-r17*r34;r28=r13-r17*r29}}while(0);r13=r25-r27;r15=r26-r28;r18=r1+192|0;r20=HEAPF32[r18>>2];r19=r1+196|0;r14=HEAPF32[r19>>2];r2=r1+204|0;r29=HEAPF32[r2>>2];r34=r1+200|0;r33=HEAPF32[r34>>2];r31=r13*r20+r15*r14+r24*r29-r23*r33;r32=r24-r23;do{if((HEAP8[r1+136|0]&1)<<24>>24==0){r4=2812}else{r30=r1+140|0;if((HEAP32[r30>>2]|0)==0){r4=2812;break}r35=r1+184|0;r38=r1+188|0;r37=r1+212|0;r36=r1+208|0;r39=(r1+104|0)>>2;r40=HEAPF32[r39];r41=(r1+108|0)>>2;r42=HEAPF32[r41];r43=(r1+112|0)>>2;r44=HEAPF32[r43];r45=r1+216|0;r46=-r31;r47=-r32;r48=-(r13*HEAPF32[r35>>2]+r15*HEAPF32[r38>>2]+r24*HEAPF32[r37>>2]-r23*HEAPF32[r36>>2]);HEAPF32[r8]=r46;HEAPF32[r8+1]=r47;HEAPF32[r8+2]=r48;__ZNK7b2Mat337Solve33ERK6b2Vec3(r6,r45,r7);r48=r6|0;HEAPF32[r39]=HEAPF32[r48>>2]+HEAPF32[r39];r49=r6+4|0;HEAPF32[r41]=HEAPF32[r49>>2]+HEAPF32[r41];r50=r6+8|0;r51=HEAPF32[r50>>2]+HEAPF32[r43];HEAPF32[r43]=r51;r52=HEAP32[r30>>2];if((r52|0)==1){r30=r51>0?r51:0;HEAPF32[r43]=r30;r53=r30}else if((r52|0)==2){r52=r51<0?r51:0;HEAPF32[r43]=r52;r53=r52}else{r53=r51}r51=r53-r44;r44=r46-HEAPF32[r3+60]*r51;r46=r47-r51*HEAPF32[r3+61];r47=HEAPF32[r45>>2];r45=HEAPF32[r3+57];r52=HEAPF32[r3+55];r43=HEAPF32[r3+58];r30=r47*r43-r45*r52;if(r30!=0){r54=1/r30}else{r54=r30}r30=r40+(r44*r43-r45*r46)*r54;r45=r42+(r47*r46-r44*r52)*r54;HEAPF32[r39]=r30;HEAPF32[r41]=r45;r41=r30-r40;r40=r45-r42;HEAPF32[r48>>2]=r41;HEAPF32[r49>>2]=r40;HEAPF32[r50>>2]=r51;r55=r40+r41*HEAPF32[r2>>2]+r51*HEAPF32[r37>>2];r56=r41*HEAPF32[r34>>2]+r40+r51*HEAPF32[r36>>2];r57=r41*HEAPF32[r19>>2]+r51*HEAPF32[r38>>2];r58=r41*HEAPF32[r18>>2]+r51*HEAPF32[r35>>2];r59=HEAP32[r9];break}}while(0);if(r4==2812){r4=-r31;r31=-r32;r32=HEAPF32[r3+54];r18=HEAPF32[r3+57];r19=HEAPF32[r3+55];r34=HEAPF32[r3+58];r3=r32*r34-r18*r19;if(r3!=0){r60=1/r3}else{r60=r3}r3=(r34*r4-r18*r31)*r60;r18=(r32*r31-r19*r4)*r60;r60=r1+104|0;HEAPF32[r60>>2]=HEAPF32[r60>>2]+r3;r60=r1+108|0;HEAPF32[r60>>2]=r18+HEAPF32[r60>>2];r55=r18+r3*r29;r56=r18+r3*r33;r57=r3*r14;r58=r3*r20;r59=r10}r10=HEAP32[r11]+(r59*12&-1)|0;r59=(HEAPF32[tempDoublePtr>>2]=r27-r17*r58,HEAP32[tempDoublePtr>>2]);r27=(HEAPF32[tempDoublePtr>>2]=r28-r17*r57,HEAP32[tempDoublePtr>>2])|0;HEAP32[r10>>2]=0|r59;HEAP32[r10+4>>2]=r27;HEAPF32[HEAP32[r11]+(HEAP32[r9]*12&-1)+8>>2]=r23-r21*r56;r56=HEAP32[r11]+(HEAP32[r16]*12&-1)|0;r21=(HEAPF32[tempDoublePtr>>2]=r25+r12*r58,HEAP32[tempDoublePtr>>2]);r58=(HEAPF32[tempDoublePtr>>2]=r26+r12*r57,HEAP32[tempDoublePtr>>2])|0;HEAP32[r56>>2]=0|r21;HEAP32[r56+4>>2]=r58;HEAPF32[HEAP32[r11]+(HEAP32[r16]*12&-1)+8>>2]=r24+r22*r55;STACKTOP=r5;return}function __ZN16b2PrismaticJointD1Ev(r1){return}function __ZNK16b2PrismaticJoint10GetAnchorAEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+48>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+68>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+72>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK16b2PrismaticJoint10GetAnchorBEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+52>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+76>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+80>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK16b2PrismaticJoint16GetReactionForceEf(r1,r2,r3){var r4,r5,r6;r4=r2>>2;r2=HEAPF32[r4+26];r5=HEAPF32[r4+29]+HEAPF32[r4+28];r6=(r2*HEAPF32[r4+49]+r5*HEAPF32[r4+47])*r3;HEAPF32[r1>>2]=(r2*HEAPF32[r4+48]+HEAPF32[r4+46]*r5)*r3;HEAPF32[r1+4>>2]=r6;return}function __ZNK16b2PrismaticJoint17GetReactionTorqueEf(r1,r2){return HEAPF32[r1+108>>2]*r2}function __ZN16b2PrismaticJoint24SolvePositionConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r3=r1>>2;r4=r1+144|0;r5=HEAP32[r4>>2];r6=(r2+24|0)>>2;r2=HEAP32[r6];r7=(r2+(r5*12&-1)|0)>>2;r8=HEAP32[r7+1];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r7],HEAPF32[tempDoublePtr>>2]);r10=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=HEAPF32[r2+(r5*12&-1)+8>>2];r5=(r1+148|0)>>2;r11=HEAP32[r5];r12=r2+(r11*12&-1)|0;r13=HEAP32[r12+4>>2];r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAPF32[tempDoublePtr>>2]);r12=(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r2+(r11*12&-1)+8>>2];r11=Math.sin(r8);r2=Math.cos(r8);r15=Math.sin(r13);r16=Math.cos(r13);r17=HEAPF32[r3+42];r18=HEAPF32[r3+43];r19=HEAPF32[r3+44];r20=HEAPF32[r3+45];r21=HEAPF32[r3+17]-HEAPF32[r3+38];r22=HEAPF32[r3+18]-HEAPF32[r3+39];r23=r2*r21-r11*r22;r24=r11*r21+r2*r22;r22=HEAPF32[r3+19]-HEAPF32[r3+40];r21=HEAPF32[r3+20]-HEAPF32[r3+41];r25=r16*r22-r15*r21;r26=r15*r22+r16*r21;r21=r14+r25-r9-r23;r16=r12+r26-r10-r24;r22=HEAPF32[r3+21];r15=HEAPF32[r3+22];r27=r2*r22-r11*r15;r28=r11*r22+r2*r15;r15=r23+r21;r23=r24+r16;r24=r28*r15-r27*r23;r22=r25*r28-r26*r27;r29=HEAPF32[r3+23];r30=HEAPF32[r3+24];r31=r2*r29-r11*r30;r32=r11*r29+r2*r30;r30=r32*r15-r31*r23;r23=r25*r32-r26*r31;r26=r31*r21+r32*r16;r25=r13-r8-HEAPF32[r3+25];if(r26>0){r33=r26}else{r33=-r26}if(r25>0){r34=r25}else{r34=-r25}do{if((HEAP8[r1+136|0]&1)<<24>>24==0){r35=r33;r36=0;r37=0}else{r15=r27*r21+r28*r16;r2=HEAPF32[r3+31];r29=HEAPF32[r3+30];r11=r2-r29;if(r11>0){r38=r11}else{r38=-r11}if(r38<.009999999776482582){r11=r15<.20000000298023224?r15:.20000000298023224;if(r15>0){r39=r15}else{r39=-r15}r35=r33>r39?r33:r39;r36=1;r37=r11<-.20000000298023224?-.20000000298023224:r11;break}if(r15<=r29){r11=r15-r29+.004999999888241291;r40=r11<0?r11:0;r11=r29-r15;r35=r33>r11?r33:r11;r36=1;r37=r40<-.20000000298023224?-.20000000298023224:r40;break}if(r15<r2){r35=r33;r36=0;r37=0;break}r40=r15-r2;r2=r40-.004999999888241291;r15=r2<.20000000298023224?r2:.20000000298023224;r35=r33>r40?r33:r40;r36=1;r37=r15<0?0:r15}}while(0);r33=r17+r18;r39=r19*r30;r38=r20*r23;r3=r23*r38+r33+r30*r39;r16=r38+r39;if(r36){r36=r22*r38+r24*r39;r39=r19+r20;r38=r39==0?1:r39;r39=r19*r24;r21=r20*r22;r1=r21+r39;r15=r22*r21+r33+r24*r39;r39=-r26;r33=-r25;r21=-r37;r37=r38*r15-r1*r1;r40=r1*r36-r16*r15;r2=r1*r16-r38*r36;r11=r36*r2+r3*r37+r16*r40;if(r11!=0){r41=1/r11}else{r41=r11}r11=r1*r39;r42=(r37*r39+r40*r33+r2*r21)*r41;r43=(r36*(r11-r36*r33)+r3*(r15*r33-r1*r21)+r16*(r36*r21-r15*r39))*r41;r44=(r36*(r16*r33-r38*r39)+r3*(r38*r21-r1*r33)+r16*(r11-r16*r21))*r41}else{r41=r19+r20;r21=r41==0?1:r41;r41=-r26;r26=-r25;r25=r21*r3-r16*r16;if(r25!=0){r45=1/r25}else{r45=r25}r42=(r21*r41-r16*r26)*r45;r43=(r3*r26-r16*r41)*r45;r44=0}r45=r27*r44+r31*r42;r31=r28*r44+r32*r42;r32=(HEAPF32[tempDoublePtr>>2]=r9-r17*r45,HEAP32[tempDoublePtr>>2]);r9=(HEAPF32[tempDoublePtr>>2]=r10-r17*r31,HEAP32[tempDoublePtr>>2])|0;HEAP32[r7]=0|r32;HEAP32[r7+1]=r9;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r8-r19*(r24*r44+r43+r30*r42);r30=HEAP32[r6]+(HEAP32[r5]*12&-1)|0;r24=(HEAPF32[tempDoublePtr>>2]=r14+r18*r45,HEAP32[tempDoublePtr>>2]);r45=(HEAPF32[tempDoublePtr>>2]=r12+r18*r31,HEAP32[tempDoublePtr>>2])|0;HEAP32[r30>>2]=0|r24;HEAP32[r30+4>>2]=r45;HEAPF32[HEAP32[r6]+(HEAP32[r5]*12&-1)+8>>2]=r13+r20*(r22*r44+r43+r23*r42);if(r35>.004999999888241291){r46=0;return r46}r46=r34<=.03490658849477768;return r46}function __ZN16b2PrismaticJoint4DumpEv(r1){var r2,r3,r4,r5;r2=r1>>2;r3=STACKTOP;r4=HEAP32[HEAP32[r2+12]+8>>2];r5=HEAP32[HEAP32[r2+13]+8>>2];__Z5b2LogPKcz(5251592,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253800,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r4,tempInt));__Z5b2LogPKcz(5251428,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r5,tempInt));__Z5b2LogPKcz(5249488,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+61|0]&1,tempInt));r5=HEAPF32[r2+18];__Z5b2LogPKcz(5248748,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+17],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r5,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r5=HEAPF32[r2+20];__Z5b2LogPKcz(5248324,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+19],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r5,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r5=HEAPF32[r2+22];__Z5b2LogPKcz(5247844,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+21],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r5,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247884,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+25],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247120,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+136|0]&1,tempInt));__Z5b2LogPKcz(5254952,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+30],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254404,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+31],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247584,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+137|0]&1,tempInt));__Z5b2LogPKcz(5247336,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+33],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5253548,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+32],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254332,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+14],tempInt));STACKTOP=r3;return}function __ZN16b2PrismaticJointD0Ev(r1){__ZdlPv(r1);return}function __ZN16b2PulleyJointDef10InitializeEP6b2BodyS1_RK6b2Vec2S4_S4_S4_f(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16;r9=r1>>2;HEAP32[r9+2]=r2;HEAP32[r9+3]=r3;r10=r4;r11=r1+20|0;r12=HEAP32[r10+4>>2];HEAP32[r11>>2]=HEAP32[r10>>2];HEAP32[r11+4>>2]=r12;r12=r5;r11=r1+28|0;r10=HEAP32[r12+4>>2];HEAP32[r11>>2]=HEAP32[r12>>2];HEAP32[r11+4>>2]=r10;r10=r6|0;r11=HEAPF32[r10>>2]-HEAPF32[r2+12>>2];r12=r6+4|0;r6=HEAPF32[r12>>2]-HEAPF32[r2+16>>2];r13=HEAPF32[r2+24>>2];r14=HEAPF32[r2+20>>2];r2=r1+36|0;r15=(HEAPF32[tempDoublePtr>>2]=r11*r13+r6*r14,HEAP32[tempDoublePtr>>2]);r16=(HEAPF32[tempDoublePtr>>2]=r13*r6+r11*-r14,HEAP32[tempDoublePtr>>2])|0;HEAP32[r2>>2]=0|r15;HEAP32[r2+4>>2]=r16;r16=r7|0;r2=HEAPF32[r16>>2]-HEAPF32[r3+12>>2];r15=r7+4|0;r7=HEAPF32[r15>>2]-HEAPF32[r3+16>>2];r14=HEAPF32[r3+24>>2];r11=HEAPF32[r3+20>>2];r3=r1+44|0;r1=(HEAPF32[tempDoublePtr>>2]=r2*r14+r7*r11,HEAP32[tempDoublePtr>>2]);r6=(HEAPF32[tempDoublePtr>>2]=r14*r7+r2*-r11,HEAP32[tempDoublePtr>>2])|0;HEAP32[r3>>2]=0|r1;HEAP32[r3+4>>2]=r6;r6=HEAPF32[r10>>2]-HEAPF32[r4>>2];r10=HEAPF32[r12>>2]-HEAPF32[r4+4>>2];HEAPF32[r9+13]=Math.sqrt(r6*r6+r10*r10);r10=HEAPF32[r16>>2]-HEAPF32[r5>>2];r16=HEAPF32[r15>>2]-HEAPF32[r5+4>>2];HEAPF32[r9+14]=Math.sqrt(r10*r10+r16*r16);HEAPF32[r9+15]=r8;if(r8>1.1920928955078125e-7){return}else{___assert_func(5249356,51,5259360,5253936)}}function __ZN13b2PulleyJointC2EPK16b2PulleyJointDef(r1,r2){var r3,r4,r5,r6;r3=r1>>2;r4=r1|0;HEAP32[r4>>2]=5261468;r5=r2+8|0;r6=r2+12|0;if((HEAP32[r5>>2]|0)==(HEAP32[r6>>2]|0)){___assert_func(5249968,173,5258024,5251672)}HEAP32[r3+1]=HEAP32[r2>>2];HEAP32[r3+2]=0;HEAP32[r3+3]=0;HEAP32[r3+12]=HEAP32[r5>>2];HEAP32[r3+13]=HEAP32[r6>>2];HEAP32[r3+14]=0;HEAP8[r1+61|0]=HEAP8[r2+16|0]&1;HEAP8[r1+60|0]=0;HEAP32[r3+16]=HEAP32[r2+4>>2];_memset(r1+16|0,0,32);HEAP32[r4>>2]=5262120;r4=r2+20|0;r6=r1+68|0;r5=HEAP32[r4+4>>2];HEAP32[r6>>2]=HEAP32[r4>>2];HEAP32[r6+4>>2]=r5;r5=r2+28|0;r6=r1+76|0;r4=HEAP32[r5+4>>2];HEAP32[r6>>2]=HEAP32[r5>>2];HEAP32[r6+4>>2]=r4;r4=r2+36|0;r6=r1+92|0;r5=HEAP32[r4+4>>2];HEAP32[r6>>2]=HEAP32[r4>>2];HEAP32[r6+4>>2]=r5;r5=r2+44|0;r6=r1+100|0;r1=HEAP32[r5+4>>2];HEAP32[r6>>2]=HEAP32[r5>>2];HEAP32[r6+4>>2]=r1;r1=r2+52|0;HEAPF32[r3+21]=HEAPF32[r1>>2];r6=r2+56|0;HEAPF32[r3+22]=HEAPF32[r6>>2];r5=HEAPF32[r2+60>>2];if(r5!=0){HEAPF32[r3+28]=r5;HEAPF32[r3+27]=HEAPF32[r1>>2]+r5*HEAPF32[r6>>2];HEAPF32[r3+29]=0;return}else{___assert_func(5249356,65,5260192,5251572)}}function __ZNK13b2PulleyJoint17GetReactionTorqueEf(r1,r2){return 0}function __ZN13b2PulleyJointD1Ev(r1){return}function __ZN13b2PulleyJoint24SolveVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r3=r1>>2;r4=r1+120|0;r5=HEAP32[r4>>2];r6=(r2+28|0)>>2;r2=HEAP32[r6];r7=r2+(r5*12&-1)|0;r8=HEAP32[r7+4>>2];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAPF32[tempDoublePtr>>2]);r7=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=HEAPF32[r2+(r5*12&-1)+8>>2];r10=(r1+124|0)>>2;r11=HEAP32[r10];r12=r2+(r11*12&-1)|0;r13=HEAP32[r12+4>>2];r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAPF32[tempDoublePtr>>2]);r12=(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r2+(r11*12&-1)+8>>2];r11=HEAPF32[r3+37];r2=HEAPF32[r3+36];r15=HEAPF32[r3+39];r16=HEAPF32[r3+38];r17=HEAPF32[r3+32];r18=HEAPF32[r3+33];r19=HEAPF32[r3+28];r20=HEAPF32[r3+34];r21=HEAPF32[r3+35];r22=(-((r9+r11*-r8)*r17+(r7+r8*r2)*r18)-r19*((r14+r15*-r13)*r20+(r12+r13*r16)*r21))*-HEAPF32[r3+48];r23=r1+116|0;HEAPF32[r23>>2]=HEAPF32[r23>>2]+r22;r23=-r22;r1=r17*r23;r17=r18*r23;r23=r22*-r19;r19=r20*r23;r20=r21*r23;r23=HEAPF32[r3+44];r21=r8+HEAPF32[r3+46]*(r17*r2-r1*r11);r11=HEAPF32[r3+45];r2=r13+HEAPF32[r3+47]*(r20*r16-r19*r15);r15=HEAP32[r6]+(r5*12&-1)|0;r5=(HEAPF32[tempDoublePtr>>2]=r9+r1*r23,HEAP32[tempDoublePtr>>2]);r1=(HEAPF32[tempDoublePtr>>2]=r7+r17*r23,HEAP32[tempDoublePtr>>2])|0;HEAP32[r15>>2]=0|r5;HEAP32[r15+4>>2]=r1;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r21;r21=HEAP32[r6]+(HEAP32[r10]*12&-1)|0;r4=(HEAPF32[tempDoublePtr>>2]=r14+r19*r11,HEAP32[tempDoublePtr>>2]);r19=(HEAPF32[tempDoublePtr>>2]=r12+r20*r11,HEAP32[tempDoublePtr>>2])|0;HEAP32[r21>>2]=0|r4;HEAP32[r21+4>>2]=r19;HEAPF32[HEAP32[r6]+(HEAP32[r10]*12&-1)+8>>2]=r2;return}function __ZNK13b2PulleyJoint10GetAnchorAEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+48>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+92>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+96>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK13b2PulleyJoint10GetAnchorBEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+52>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+100>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+104>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK13b2PulleyJoint16GetReactionForceEf(r1,r2,r3){var r4,r5;r4=HEAPF32[r2+116>>2];r5=r4*HEAPF32[r2+140>>2]*r3;HEAPF32[r1>>2]=r4*HEAPF32[r2+136>>2]*r3;HEAPF32[r1+4>>2]=r5;return}function __ZN13b2PulleyJoint23InitVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69;r3=r1>>2;r4=HEAP32[r3+12],r5=r4>>2;r6=HEAP32[r5+2];r7=(r1+120|0)>>2;HEAP32[r7]=r6;r8=HEAP32[r3+13],r9=r8>>2;r10=HEAP32[r9+2];r11=(r1+124|0)>>2;HEAP32[r11]=r10;r12=r4+28|0;r4=r1+160|0;r13=HEAP32[r12>>2];r14=HEAP32[r12+4>>2];HEAP32[r4>>2]=r13;HEAP32[r4+4>>2]=r14;r4=r8+28|0;r8=r1+168|0;r12=HEAP32[r4>>2];r15=HEAP32[r4+4>>2];HEAP32[r8>>2]=r12;HEAP32[r8+4>>2]=r15;r8=HEAPF32[r5+30];HEAPF32[r3+44]=r8;r4=HEAPF32[r9+30];HEAPF32[r3+45]=r4;r16=HEAPF32[r5+32];HEAPF32[r3+46]=r16;r5=HEAPF32[r9+32];HEAPF32[r3+47]=r5;r9=HEAP32[r2+24>>2];r17=r9+(r6*12&-1)|0;r18=HEAP32[r17+4>>2];r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAPF32[tempDoublePtr>>2]);r17=(HEAP32[tempDoublePtr>>2]=r18,HEAPF32[tempDoublePtr>>2]);r18=HEAPF32[r9+(r6*12&-1)+8>>2];r20=(r2+28|0)>>2;r21=HEAP32[r20];r22=r21+(r6*12&-1)|0;r23=HEAP32[r22+4>>2];r24=(HEAP32[tempDoublePtr>>2]=HEAP32[r22>>2],HEAPF32[tempDoublePtr>>2]);r22=(HEAP32[tempDoublePtr>>2]=r23,HEAPF32[tempDoublePtr>>2]);r23=HEAPF32[r21+(r6*12&-1)+8>>2];r25=r9+(r10*12&-1)|0;r26=HEAP32[r25+4>>2];r27=(HEAP32[tempDoublePtr>>2]=HEAP32[r25>>2],HEAPF32[tempDoublePtr>>2]);r25=(HEAP32[tempDoublePtr>>2]=r26,HEAPF32[tempDoublePtr>>2]);r26=HEAPF32[r9+(r10*12&-1)+8>>2];r9=r21+(r10*12&-1)|0;r28=HEAP32[r9+4>>2];r29=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAPF32[tempDoublePtr>>2]);r9=(HEAP32[tempDoublePtr>>2]=r28,HEAPF32[tempDoublePtr>>2]);r28=HEAPF32[r21+(r10*12&-1)+8>>2];r10=Math.sin(r18);r21=Math.cos(r18);r18=Math.sin(r26);r30=Math.cos(r26);r26=HEAPF32[r3+23]-(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r3+24]-(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=r21*r26-r10*r13;r31=r10*r26+r21*r13;r13=r1+144|0;r21=(HEAPF32[tempDoublePtr>>2]=r14,HEAP32[tempDoublePtr>>2]);r26=(HEAPF32[tempDoublePtr>>2]=r31,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r21;HEAP32[r13+4>>2]=r26;r26=HEAPF32[r3+25]-(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=HEAPF32[r3+26]-(HEAP32[tempDoublePtr>>2]=r15,HEAPF32[tempDoublePtr>>2]);r15=r30*r26-r18*r12;r13=r18*r26+r30*r12;r12=r1+152|0;r30=(HEAPF32[tempDoublePtr>>2]=r15,HEAP32[tempDoublePtr>>2]);r26=(HEAPF32[tempDoublePtr>>2]=r13,HEAP32[tempDoublePtr>>2])|0;HEAP32[r12>>2]=0|r30;HEAP32[r12+4>>2]=r26;r26=r1+128|0;r12=r19+r14-HEAPF32[r3+17];r19=r17+r31-HEAPF32[r3+18];r17=r26;r30=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r18=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2])|0;HEAP32[r17>>2]=0|r30;HEAP32[r17+4>>2]=r18;r18=r1+136|0;r17=r27+r15-HEAPF32[r3+19];r27=r25+r13-HEAPF32[r3+20];r25=r18;r30=(HEAPF32[tempDoublePtr>>2]=r17,HEAP32[tempDoublePtr>>2]);r21=(HEAPF32[tempDoublePtr>>2]=r27,HEAP32[tempDoublePtr>>2])|0;HEAP32[r25>>2]=0|r30;HEAP32[r25+4>>2]=r21;r21=r26|0;r26=Math.sqrt(r12*r12+r19*r19);r25=r18|0;r18=Math.sqrt(r17*r17+r27*r27);if(r26>.04999999701976776){r30=1/r26;r26=r12*r30;HEAPF32[r21>>2]=r26;r32=r30*r19;r33=r26}else{HEAPF32[r21>>2]=0;r32=0;r33=0}HEAPF32[r3+33]=r32;if(r18>.04999999701976776){r21=1/r18;r18=r21*r17;HEAPF32[r25>>2]=r18;r34=r21*r27;r35=r18}else{HEAPF32[r25>>2]=0;r34=0;r35=0}HEAPF32[r3+35]=r34;r25=r14*r32-r31*r33;r18=r15*r34-r13*r35;r27=HEAPF32[r3+28];r21=r8+r25*r25*r16+r27*r27*(r4+r18*r18*r5);if(r21>0){r36=1/r21}else{r36=r21}HEAPF32[r3+48]=r36;if((HEAP8[r2+20|0]&1)<<24>>24==0){HEAPF32[r3+29]=0;r3=r23;r36=r28;r21=r29;r18=r9;r25=r24;r17=r22;r26=HEAP32[r20];r19=r26+(r6*12&-1)|0;r30=r19;r12=(HEAPF32[tempDoublePtr>>2]=r25,HEAP32[tempDoublePtr>>2]);r10=(HEAPF32[tempDoublePtr>>2]=r17,HEAP32[tempDoublePtr>>2]);r37=r10;r38=0;r39=0;r40=r37;r41=r12;r42=0;r43=r39|r41;r44=r40|r42;r45=r30|0;HEAP32[r45>>2]=r43;r46=r30+4|0;HEAP32[r46>>2]=r44;r47=HEAP32[r7];r48=HEAP32[r20];r49=r48+(r47*12&-1)+8|0;HEAPF32[r49>>2]=r3;r50=HEAP32[r11];r51=HEAP32[r20];r52=r51+(r50*12&-1)|0;r53=r52;r54=(HEAPF32[tempDoublePtr>>2]=r21,HEAP32[tempDoublePtr>>2]);r55=(HEAPF32[tempDoublePtr>>2]=r18,HEAP32[tempDoublePtr>>2]);r56=r55;r57=0;r58=0;r59=r56;r60=r54;r61=0;r62=r58|r60;r63=r59|r61;r64=r53|0;HEAP32[r64>>2]=r62;r65=r53+4|0;HEAP32[r65>>2]=r63;r66=HEAP32[r11];r67=HEAP32[r20];r68=r67+(r66*12&-1)+8|0;HEAPF32[r68>>2]=r36;return}else{r69=r1+116|0;r1=HEAPF32[r2+8>>2]*HEAPF32[r69>>2];HEAPF32[r69>>2]=r1;r69=-r1;r2=r33*r69;r33=r32*r69;r69=r1*-r27;r27=r35*r69;r35=r34*r69;r3=r23+r16*(r33*r14-r2*r31);r36=r28+r5*(r35*r15-r27*r13);r21=r29+r27*r4;r18=r9+r35*r4;r25=r24+r2*r8;r17=r22+r33*r8;r26=HEAP32[r20];r19=r26+(r6*12&-1)|0;r30=r19;r12=(HEAPF32[tempDoublePtr>>2]=r25,HEAP32[tempDoublePtr>>2]);r10=(HEAPF32[tempDoublePtr>>2]=r17,HEAP32[tempDoublePtr>>2]);r37=r10;r38=0;r39=0;r40=r37;r41=r12;r42=0;r43=r39|r41;r44=r40|r42;r45=r30|0;HEAP32[r45>>2]=r43;r46=r30+4|0;HEAP32[r46>>2]=r44;r47=HEAP32[r7];r48=HEAP32[r20];r49=r48+(r47*12&-1)+8|0;HEAPF32[r49>>2]=r3;r50=HEAP32[r11];r51=HEAP32[r20];r52=r51+(r50*12&-1)|0;r53=r52;r54=(HEAPF32[tempDoublePtr>>2]=r21,HEAP32[tempDoublePtr>>2]);r55=(HEAPF32[tempDoublePtr>>2]=r18,HEAP32[tempDoublePtr>>2]);r56=r55;r57=0;r58=0;r59=r56;r60=r54;r61=0;r62=r58|r60;r63=r59|r61;r64=r53|0;HEAP32[r64>>2]=r62;r65=r53+4|0;HEAP32[r65>>2]=r63;r66=HEAP32[r11];r67=HEAP32[r20];r68=r67+(r66*12&-1)+8|0;HEAPF32[r68>>2]=r36;return}}function __ZN13b2PulleyJoint24SolvePositionConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31;r3=r1>>2;r4=r1+120|0;r5=HEAP32[r4>>2];r6=(r2+24|0)>>2;r2=HEAP32[r6];r7=(r2+(r5*12&-1)|0)>>2;r8=HEAP32[r7+1];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r7],HEAPF32[tempDoublePtr>>2]);r10=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=HEAPF32[r2+(r5*12&-1)+8>>2];r5=(r1+124|0)>>2;r1=HEAP32[r5];r11=r2+(r1*12&-1)|0;r12=HEAP32[r11+4>>2];r13=(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAPF32[tempDoublePtr>>2]);r11=(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=HEAPF32[r2+(r1*12&-1)+8>>2];r1=Math.sin(r8);r2=Math.cos(r8);r14=Math.sin(r12);r15=Math.cos(r12);r16=HEAPF32[r3+23]-HEAPF32[r3+40];r17=HEAPF32[r3+24]-HEAPF32[r3+41];r18=r2*r16-r1*r17;r19=r1*r16+r2*r17;r17=HEAPF32[r3+25]-HEAPF32[r3+42];r2=HEAPF32[r3+26]-HEAPF32[r3+43];r16=r15*r17-r14*r2;r1=r14*r17+r15*r2;r2=r9+r18-HEAPF32[r3+17];r15=r10+r19-HEAPF32[r3+18];r17=r13+r16-HEAPF32[r3+19];r14=r11+r1-HEAPF32[r3+20];r20=Math.sqrt(r2*r2+r15*r15);r21=Math.sqrt(r17*r17+r14*r14);if(r20>.04999999701976776){r22=1/r20;r23=r2*r22;r24=r15*r22}else{r23=0;r24=0}if(r21>.04999999701976776){r22=1/r21;r25=r17*r22;r26=r14*r22}else{r25=0;r26=0}r22=r18*r24-r19*r23;r14=r16*r26-r1*r25;r17=HEAPF32[r3+44];r15=HEAPF32[r3+46];r2=HEAPF32[r3+45];r27=HEAPF32[r3+47];r28=HEAPF32[r3+28];r29=r17+r22*r22*r15+r28*r28*(r2+r14*r14*r27);if(r29>0){r30=1/r29}else{r30=r29}r29=HEAPF32[r3+27]-r20-r21*r28;if(r29>0){r31=r29}else{r31=-r29}r21=r29*-r30;r30=-r21;r29=r23*r30;r23=r24*r30;r30=r21*-r28;r28=r25*r30;r25=r26*r30;r30=(HEAPF32[tempDoublePtr>>2]=r9+r29*r17,HEAP32[tempDoublePtr>>2]);r9=(HEAPF32[tempDoublePtr>>2]=r10+r23*r17,HEAP32[tempDoublePtr>>2])|0;HEAP32[r7]=0|r30;HEAP32[r7+1]=r9;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r8+(r18*r23-r19*r29)*r15;r15=HEAP32[r6]+(HEAP32[r5]*12&-1)|0;r29=(HEAPF32[tempDoublePtr>>2]=r13+r28*r2,HEAP32[tempDoublePtr>>2]);r13=(HEAPF32[tempDoublePtr>>2]=r11+r25*r2,HEAP32[tempDoublePtr>>2])|0;HEAP32[r15>>2]=0|r29;HEAP32[r15+4>>2]=r13;HEAPF32[HEAP32[r6]+(HEAP32[r5]*12&-1)+8>>2]=r12+r27*(r16*r25-r1*r28);return r31<.004999999888241291}function __ZN13b2PulleyJoint4DumpEv(r1){var r2,r3,r4,r5;r2=r1>>2;r3=STACKTOP;r4=HEAP32[HEAP32[r2+12]+8>>2];r5=HEAP32[HEAP32[r2+13]+8>>2];__Z5b2LogPKcz(5249524,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253800,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r4,tempInt));__Z5b2LogPKcz(5251428,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r5,tempInt));__Z5b2LogPKcz(5249488,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+61|0]&1,tempInt));r1=HEAPF32[r2+18];__Z5b2LogPKcz(5247616,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+17],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r1,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r1=HEAPF32[r2+20];__Z5b2LogPKcz(5247364,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+19],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r1,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r1=HEAPF32[r2+24];__Z5b2LogPKcz(5248748,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+23],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r1,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r1=HEAPF32[r2+26];__Z5b2LogPKcz(5248324,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+25],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r1,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254924,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+21],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254376,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+22],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5253960,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+28],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254332,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+14],tempInt));STACKTOP=r3;return}function __ZN13b2PulleyJointD0Ev(r1){__ZdlPv(r1);return}function __ZN15b2RevoluteJoint23InitVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68;r3=r1>>2;r4=HEAP32[r3+12],r5=r4>>2;r6=HEAP32[r5+2];r7=(r1+128|0)>>2;HEAP32[r7]=r6;r8=HEAP32[r3+13],r9=r8>>2;r10=HEAP32[r9+2];r11=(r1+132|0)>>2;HEAP32[r11]=r10;r12=r4+28|0;r4=r1+152|0;r13=HEAP32[r12>>2];r14=HEAP32[r12+4>>2];HEAP32[r4>>2]=r13;HEAP32[r4+4>>2]=r14;r4=r8+28|0;r8=r1+160|0;r12=HEAP32[r4>>2];r15=HEAP32[r4+4>>2];HEAP32[r8>>2]=r12;HEAP32[r8+4>>2]=r15;r8=HEAPF32[r5+30];HEAPF32[r3+42]=r8;r4=HEAPF32[r9+30];HEAPF32[r3+43]=r4;r16=HEAPF32[r5+32];HEAPF32[r3+44]=r16;r5=HEAPF32[r9+32];HEAPF32[r3+45]=r5;r9=HEAP32[r2+24>>2];r17=HEAPF32[r9+(r6*12&-1)+8>>2];r18=(r2+28|0)>>2;r19=HEAP32[r18];r20=r19+(r6*12&-1)|0;r21=HEAP32[r20+4>>2];r22=(HEAP32[tempDoublePtr>>2]=HEAP32[r20>>2],HEAPF32[tempDoublePtr>>2]);r20=(HEAP32[tempDoublePtr>>2]=r21,HEAPF32[tempDoublePtr>>2]);r21=HEAPF32[r19+(r6*12&-1)+8>>2];r23=HEAPF32[r9+(r10*12&-1)+8>>2];r9=r19+(r10*12&-1)|0;r24=HEAP32[r9+4>>2];r25=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAPF32[tempDoublePtr>>2]);r9=(HEAP32[tempDoublePtr>>2]=r24,HEAPF32[tempDoublePtr>>2]);r24=HEAPF32[r19+(r10*12&-1)+8>>2];r10=Math.sin(r17);r19=Math.cos(r17);r26=Math.sin(r23);r27=Math.cos(r23);r28=HEAPF32[r3+17]-(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r3+18]-(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=r19*r28-r10*r13;r29=r10*r28+r19*r13;r13=r1+136|0;r19=(HEAPF32[tempDoublePtr>>2]=r14,HEAP32[tempDoublePtr>>2]);r28=(HEAPF32[tempDoublePtr>>2]=r29,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r19;HEAP32[r13+4>>2]=r28;r28=HEAPF32[r3+19]-(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=HEAPF32[r3+20]-(HEAP32[tempDoublePtr>>2]=r15,HEAPF32[tempDoublePtr>>2]);r15=r27*r28-r26*r12;r13=r26*r28+r27*r12;r12=r1+144|0;r27=(HEAPF32[tempDoublePtr>>2]=r15,HEAP32[tempDoublePtr>>2]);r28=(HEAPF32[tempDoublePtr>>2]=r13,HEAP32[tempDoublePtr>>2])|0;HEAP32[r12>>2]=0|r27;HEAP32[r12+4>>2]=r28;r28=r16+r5;r12=r28==0;r27=r8+r4;HEAPF32[r3+46]=r27+r16*r29*r29+r5*r13*r13;r26=-r29;r19=r16*r14*r26-r5*r13*r15;HEAPF32[r3+49]=r19;r10=r16*r26-r5*r13;HEAPF32[r3+52]=r10;HEAPF32[r3+47]=r19;HEAPF32[r3+50]=r27+r16*r14*r14+r5*r15*r15;r27=r16*r14+r5*r15;HEAPF32[r3+53]=r27;HEAPF32[r3+48]=r10;HEAPF32[r3+51]=r27;HEAPF32[r3+54]=r28;if(r28>0){r30=1/r28}else{r30=r28}HEAPF32[r3+55]=r30;if((HEAP8[r1+100|0]&1)<<24>>24==0|r12){HEAPF32[r3+24]=0}do{if((HEAP8[r1+112|0]&1)<<24>>24==0|r12){HEAP32[r3+56]=0}else{r30=r23-r17-HEAPF32[r3+29];r28=HEAPF32[r3+31];r27=HEAPF32[r3+30];r10=r28-r27;if(r10>0){r31=r10}else{r31=-r10}if(r31<.06981317698955536){HEAP32[r3+56]=3;break}if(r30<=r27){r27=r1+224|0;if((HEAP32[r27>>2]|0)!=1){HEAPF32[r3+23]=0}HEAP32[r27>>2]=1;break}r27=(r1+224|0)>>2;if(r30<r28){HEAP32[r27]=0;HEAPF32[r3+23]=0;break}if((HEAP32[r27]|0)!=2){HEAPF32[r3+23]=0}HEAP32[r27]=2}}while(0);r3=r1+84|0;if((HEAP8[r2+20|0]&1)<<24>>24==0){r31=r3>>2;HEAP32[r31]=0;HEAP32[r31+1]=0;HEAP32[r31+2]=0;HEAP32[r31+3]=0;r31=r21;r17=r24;r23=r25;r12=r9;r27=r22;r28=r20;r30=HEAP32[r18];r10=r30+(r6*12&-1)|0;r19=r10;r26=(HEAPF32[tempDoublePtr>>2]=r27,HEAP32[tempDoublePtr>>2]);r32=(HEAPF32[tempDoublePtr>>2]=r28,HEAP32[tempDoublePtr>>2]);r33=r32;r34=0;r35=0;r36=r33;r37=r26;r38=0;r39=r35|r37;r40=r36|r38;r41=r19|0;HEAP32[r41>>2]=r39;r42=r19+4|0;HEAP32[r42>>2]=r40;r43=HEAP32[r7];r44=HEAP32[r18];r45=r44+(r43*12&-1)+8|0;HEAPF32[r45>>2]=r31;r46=HEAP32[r11];r47=HEAP32[r18];r48=r47+(r46*12&-1)|0;r49=r48;r50=(HEAPF32[tempDoublePtr>>2]=r23,HEAP32[tempDoublePtr>>2]);r51=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r52=r51;r53=0;r54=0;r55=r52;r56=r50;r57=0;r58=r54|r56;r59=r55|r57;r60=r49|0;HEAP32[r60>>2]=r58;r61=r49+4|0;HEAP32[r61>>2]=r59;r62=HEAP32[r11];r63=HEAP32[r18];r64=r63+(r62*12&-1)+8|0;HEAPF32[r64>>2]=r17;return}else{r65=r2+8|0;r2=HEAPF32[r65>>2];r66=r3|0;r3=r2*HEAPF32[r66>>2];HEAPF32[r66>>2]=r3;r66=r1+88|0;r67=r2*HEAPF32[r66>>2];HEAPF32[r66>>2]=r67;r66=r1+92|0;r68=r2*HEAPF32[r66>>2];HEAPF32[r66>>2]=r68;r66=r1+96|0;r1=HEAPF32[r65>>2]*HEAPF32[r66>>2];HEAPF32[r66>>2]=r1;r31=r21-r16*(r68+r1+(r67*r14-r3*r29));r17=r24+r5*(r68+r1+(r67*r15-r3*r13));r23=r25+r4*r3;r12=r9+r4*r67;r27=r22-r8*r3;r28=r20-r8*r67;r30=HEAP32[r18];r10=r30+(r6*12&-1)|0;r19=r10;r26=(HEAPF32[tempDoublePtr>>2]=r27,HEAP32[tempDoublePtr>>2]);r32=(HEAPF32[tempDoublePtr>>2]=r28,HEAP32[tempDoublePtr>>2]);r33=r32;r34=0;r35=0;r36=r33;r37=r26;r38=0;r39=r35|r37;r40=r36|r38;r41=r19|0;HEAP32[r41>>2]=r39;r42=r19+4|0;HEAP32[r42>>2]=r40;r43=HEAP32[r7];r44=HEAP32[r18];r45=r44+(r43*12&-1)+8|0;HEAPF32[r45>>2]=r31;r46=HEAP32[r11];r47=HEAP32[r18];r48=r47+(r46*12&-1)|0;r49=r48;r50=(HEAPF32[tempDoublePtr>>2]=r23,HEAP32[tempDoublePtr>>2]);r51=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r52=r51;r53=0;r54=0;r55=r52;r56=r50;r57=0;r58=r54|r56;r59=r55|r57;r60=r49|0;HEAP32[r60>>2]=r58;r61=r49+4|0;HEAP32[r61>>2]=r59;r62=HEAP32[r11];r63=HEAP32[r18];r64=r63+(r62*12&-1)+8|0;HEAPF32[r64>>2]=r17;return}}function __ZN15b2RevoluteJoint24SolveVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58;r3=r1>>2;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+24|0;r6=r5,r7=r6>>2;r8=r5+12,r9=r8>>2;r10=(r1+128|0)>>2;r11=HEAP32[r10];r12=(r2+28|0)>>2;r13=HEAP32[r12];r14=r13+(r11*12&-1)|0;r15=HEAP32[r14+4>>2];r16=(HEAP32[tempDoublePtr>>2]=HEAP32[r14>>2],HEAPF32[tempDoublePtr>>2]);r14=(HEAP32[tempDoublePtr>>2]=r15,HEAPF32[tempDoublePtr>>2]);r15=HEAPF32[r13+(r11*12&-1)+8>>2];r17=(r1+132|0)>>2;r18=HEAP32[r17];r19=r13+(r18*12&-1)|0;r20=HEAP32[r19+4>>2];r21=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAPF32[tempDoublePtr>>2]);r19=(HEAP32[tempDoublePtr>>2]=r20,HEAPF32[tempDoublePtr>>2]);r20=HEAPF32[r13+(r18*12&-1)+8>>2];r18=HEAPF32[r3+42];r13=HEAPF32[r3+43];r22=HEAPF32[r3+44];r23=HEAPF32[r3+45];r24=r22+r23==0;do{if((HEAP8[r1+100|0]&1)<<24>>24==0){r25=r15;r26=r20}else{if((HEAP32[r3+56]|0)==3|r24){r25=r15;r26=r20;break}r27=r1+96|0;r28=HEAPF32[r27>>2];r29=HEAPF32[r2>>2]*HEAPF32[r3+26];r30=r28+(r20-r15-HEAPF32[r3+27])*-HEAPF32[r3+55];r31=-r29;r32=r30<r29?r30:r29;r29=r32<r31?r31:r32;HEAPF32[r27>>2]=r29;r27=r29-r28;r25=r15-r22*r27;r26=r20+r23*r27}}while(0);do{if((HEAP8[r1+112|0]&1)<<24>>24==0){r4=2932}else{r20=r1+224|0;if((HEAP32[r20>>2]|0)==0|r24){r4=2932;break}r15=r1+148|0;r2=r1+144|0;r27=r1+140|0;r28=r1+136|0;r29=r21+HEAPF32[r15>>2]*-r26-r16-HEAPF32[r27>>2]*-r25;r32=r19+r26*HEAPF32[r2>>2]-r14-r25*HEAPF32[r28>>2];HEAPF32[r7]=r29;HEAPF32[r7+1]=r32;HEAPF32[r7+2]=r26-r25;r31=r1+184|0;__ZNK7b2Mat337Solve33ERK6b2Vec3(r8,r31,r6);r30=HEAPF32[r9];r33=-r30;r34=HEAPF32[r9+1];r35=-r34;r36=HEAPF32[r9+2];r37=-r36;r38=HEAP32[r20>>2];do{if((r38|0)==1){r20=r1+84|0;r39=(r1+92|0)>>2;r40=HEAPF32[r39];r41=r40-r36;if(r41>=0){r42=r20|0;HEAPF32[r42>>2]=HEAPF32[r42>>2]-r30;r42=r1+88|0;HEAPF32[r42>>2]=HEAPF32[r42>>2]-r34;HEAPF32[r39]=r41;r43=r33;r44=r35;r45=r37;break}r41=r40*HEAPF32[r3+52]-r29;r42=r40*HEAPF32[r3+53]-r32;r46=HEAPF32[r31>>2];r47=HEAPF32[r3+49];r48=HEAPF32[r3+47];r49=HEAPF32[r3+50];r50=r46*r49-r47*r48;if(r50!=0){r51=1/r50}else{r51=r50}r50=(r41*r49-r47*r42)*r51;r47=(r46*r42-r41*r48)*r51;r48=r20|0;HEAPF32[r48>>2]=r50+HEAPF32[r48>>2];r48=r1+88|0;HEAPF32[r48>>2]=r47+HEAPF32[r48>>2];HEAPF32[r39]=0;r43=r50;r44=r47;r45=-r40}else if((r38|0)==3){r40=r1+84|0;HEAPF32[r40>>2]=HEAPF32[r40>>2]-r30;r40=r1+88|0;HEAPF32[r40>>2]=HEAPF32[r40>>2]-r34;r40=r1+92|0;HEAPF32[r40>>2]=HEAPF32[r40>>2]-r36;r43=r33;r44=r35;r45=r37}else if((r38|0)==2){r40=r1+84|0;r47=(r1+92|0)>>2;r50=HEAPF32[r47];r39=r50-r36;if(r39<=0){r48=r40|0;HEAPF32[r48>>2]=HEAPF32[r48>>2]-r30;r48=r1+88|0;HEAPF32[r48>>2]=HEAPF32[r48>>2]-r34;HEAPF32[r47]=r39;r43=r33;r44=r35;r45=r37;break}r39=r50*HEAPF32[r3+52]-r29;r48=r50*HEAPF32[r3+53]-r32;r20=HEAPF32[r31>>2];r41=HEAPF32[r3+49];r42=HEAPF32[r3+47];r46=HEAPF32[r3+50];r49=r20*r46-r41*r42;if(r49!=0){r52=1/r49}else{r52=r49}r49=(r39*r46-r41*r48)*r52;r41=(r20*r48-r39*r42)*r52;r42=r40|0;HEAPF32[r42>>2]=r49+HEAPF32[r42>>2];r42=r1+88|0;HEAPF32[r42>>2]=r41+HEAPF32[r42>>2];HEAPF32[r47]=0;r43=r49;r44=r41;r45=-r50}else{r43=r33;r44=r35;r45=r37}}while(0);r53=r45+(r44*HEAPF32[r28>>2]-r43*HEAPF32[r27>>2]);r54=r45+(r44*HEAPF32[r2>>2]-r43*HEAPF32[r15>>2]);r55=r43;r56=r44;r57=HEAP32[r10];break}}while(0);if(r4==2932){r4=HEAPF32[r3+37];r44=HEAPF32[r3+36];r43=HEAPF32[r3+35];r45=HEAPF32[r3+34];r52=-(r21+r4*-r26-r16-r43*-r25);r51=-(r19+r26*r44-r14-r25*r45);r9=HEAPF32[r3+46];r6=HEAPF32[r3+49];r8=HEAPF32[r3+47];r7=HEAPF32[r3+50];r3=r9*r7-r6*r8;if(r3!=0){r58=1/r3}else{r58=r3}r3=(r7*r52-r6*r51)*r58;r6=(r9*r51-r8*r52)*r58;r58=r1+84|0;HEAPF32[r58>>2]=HEAPF32[r58>>2]+r3;r58=r1+88|0;HEAPF32[r58>>2]=r6+HEAPF32[r58>>2];r53=r6*r45-r3*r43;r54=r6*r44-r3*r4;r55=r3;r56=r6;r57=r11}r11=HEAP32[r12]+(r57*12&-1)|0;r57=(HEAPF32[tempDoublePtr>>2]=r16-r18*r55,HEAP32[tempDoublePtr>>2]);r16=(HEAPF32[tempDoublePtr>>2]=r14-r18*r56,HEAP32[tempDoublePtr>>2])|0;HEAP32[r11>>2]=0|r57;HEAP32[r11+4>>2]=r16;HEAPF32[HEAP32[r12]+(HEAP32[r10]*12&-1)+8>>2]=r25-r22*r53;r53=HEAP32[r12]+(HEAP32[r17]*12&-1)|0;r22=(HEAPF32[tempDoublePtr>>2]=r21+r13*r55,HEAP32[tempDoublePtr>>2]);r55=(HEAPF32[tempDoublePtr>>2]=r19+r13*r56,HEAP32[tempDoublePtr>>2])|0;HEAP32[r53>>2]=0|r22;HEAP32[r53+4>>2]=r55;HEAPF32[HEAP32[r12]+(HEAP32[r17]*12&-1)+8>>2]=r26+r23*r54;STACKTOP=r5;return}function __ZN15b2RevoluteJointD1Ev(r1){return}function __ZNK15b2RevoluteJoint10GetAnchorAEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+48>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+68>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+72>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK15b2RevoluteJoint10GetAnchorBEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+52>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+76>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+80>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK15b2RevoluteJoint16GetReactionForceEf(r1,r2,r3){var r4;r4=HEAPF32[r2+88>>2]*r3;HEAPF32[r1>>2]=HEAPF32[r2+84>>2]*r3;HEAPF32[r1+4>>2]=r4;return}function __ZNK15b2RevoluteJoint17GetReactionTorqueEf(r1,r2){return HEAPF32[r1+92>>2]*r2}function __ZN11b2RopeJoint24SolveVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r3=r1>>2;r4=r1+96|0;r5=HEAP32[r4>>2];r6=(r2+28|0)>>2;r7=HEAP32[r6];r8=r7+(r5*12&-1)|0;r9=HEAP32[r8+4>>2];r10=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAPF32[tempDoublePtr>>2]);r8=(HEAP32[tempDoublePtr>>2]=r9,HEAPF32[tempDoublePtr>>2]);r9=HEAPF32[r7+(r5*12&-1)+8>>2];r11=(r1+100|0)>>2;r12=HEAP32[r11];r13=r7+(r12*12&-1)|0;r14=HEAP32[r13+4>>2];r15=(HEAP32[tempDoublePtr>>2]=HEAP32[r13>>2],HEAPF32[tempDoublePtr>>2]);r13=(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=HEAPF32[r7+(r12*12&-1)+8>>2];r12=HEAPF32[r3+29];r7=HEAPF32[r3+28];r16=HEAPF32[r3+31];r17=HEAPF32[r3+30];r18=HEAPF32[r3+22]-HEAPF32[r3+21];r19=HEAPF32[r3+26];r20=HEAPF32[r3+27];r21=(r15+r16*-r14-(r10+r12*-r9))*r19+(r13+r14*r17-(r8+r9*r7))*r20;if(r18<0){r22=r21+r18*HEAPF32[r2+4>>2]}else{r22=r21}r21=r1+92|0;r1=HEAPF32[r21>>2];r2=r1+r22*-HEAPF32[r3+40];r22=r2>0?0:r2;HEAPF32[r21>>2]=r22;r21=r22-r1;r1=r19*r21;r19=r20*r21;r21=HEAPF32[r3+36];r20=r9-HEAPF32[r3+38]*(r7*r19-r12*r1);r12=HEAPF32[r3+37];r7=r14+HEAPF32[r3+39]*(r19*r17-r1*r16);r16=HEAP32[r6]+(r5*12&-1)|0;r5=(HEAPF32[tempDoublePtr>>2]=r10-r21*r1,HEAP32[tempDoublePtr>>2]);r10=(HEAPF32[tempDoublePtr>>2]=r8-r21*r19,HEAP32[tempDoublePtr>>2])|0;HEAP32[r16>>2]=0|r5;HEAP32[r16+4>>2]=r10;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r20;r20=HEAP32[r6]+(HEAP32[r11]*12&-1)|0;r4=(HEAPF32[tempDoublePtr>>2]=r15+r1*r12,HEAP32[tempDoublePtr>>2]);r1=(HEAPF32[tempDoublePtr>>2]=r13+r19*r12,HEAP32[tempDoublePtr>>2])|0;HEAP32[r20>>2]=0|r4;HEAP32[r20+4>>2]=r1;HEAPF32[HEAP32[r6]+(HEAP32[r11]*12&-1)+8>>2]=r7;return}function __ZN15b2RevoluteJoint24SolvePositionConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31;r3=r1>>2;r4=r1+128|0;r5=HEAP32[r4>>2];r6=(r2+24|0)>>2;r2=HEAP32[r6];r7=(r2+(r5*12&-1)|0)>>2;r8=HEAP32[r7+1];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r7],HEAPF32[tempDoublePtr>>2]);r10=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=HEAPF32[r2+(r5*12&-1)+8>>2];r5=(r1+132|0)>>2;r11=HEAP32[r5];r12=r2+(r11*12&-1)|0;r13=HEAP32[r12+4>>2];r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAPF32[tempDoublePtr>>2]);r12=(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r2+(r11*12&-1)+8>>2];r11=r1+176|0;r2=r1+180|0;do{if((HEAP8[r1+112|0]&1)<<24>>24==0){r15=r8;r16=r13;r17=0;r18=HEAPF32[r11>>2];r19=HEAPF32[r2>>2]}else{r20=HEAPF32[r2>>2];r21=HEAPF32[r11>>2];r22=HEAP32[r3+56];if((r22|0)==0|r20+r21==0){r15=r8;r16=r13;r17=0;r18=r21;r19=r20;break}r23=r13-r8-HEAPF32[r3+29];do{if((r22|0)==1){r24=r23-HEAPF32[r3+30];r25=r24+.03490658849477768;r26=r25<0?r25:0;r27=-r24;r28=(r26<-.13962635397911072?-.13962635397911072:r26)*-HEAPF32[r3+55]}else if((r22|0)==3){r26=r23-HEAPF32[r3+30];r24=r26<.13962635397911072?r26:.13962635397911072;r26=r24<-.13962635397911072?-.13962635397911072:r24;r24=r26*-HEAPF32[r3+55];if(r26>0){r27=r26;r28=r24;break}r27=-r26;r28=r24}else if((r22|0)==2){r24=r23-HEAPF32[r3+31];r26=r24-.03490658849477768;r25=r26<.13962635397911072?r26:.13962635397911072;r27=r24;r28=(r25<0?0:r25)*-HEAPF32[r3+55]}else{r27=0;r28=0}}while(0);r15=r8-r28*r21;r16=r13+r28*r20;r17=r27;r18=r21;r19=r20}}while(0);r27=Math.sin(r15);r28=Math.cos(r15);r13=Math.sin(r16);r8=Math.cos(r16);r11=HEAPF32[r3+17]-HEAPF32[r3+38];r2=HEAPF32[r3+18]-HEAPF32[r3+39];r1=r28*r11-r27*r2;r23=r27*r11+r28*r2;r2=HEAPF32[r3+19]-HEAPF32[r3+40];r28=HEAPF32[r3+20]-HEAPF32[r3+41];r11=r8*r2-r13*r28;r27=r13*r2+r8*r28;r28=r14+r11-r9-r1;r8=r12+r27-r10-r23;r2=Math.sqrt(r28*r28+r8*r8);r13=HEAPF32[r3+42];r22=HEAPF32[r3+43];r3=r13+r22;r25=r3+r23*r23*r18+r27*r27*r19;r24=r11*r19;r26=r23*r1*-r18-r27*r24;r29=r3+r1*r1*r18+r11*r24;r24=r25*r29-r26*r26;if(r24!=0){r30=1/r24}else{r30=r24}r24=-((r28*r29-r8*r26)*r30);r29=-((r8*r25-r28*r26)*r30);r30=(HEAPF32[tempDoublePtr>>2]=r9-r13*r24,HEAP32[tempDoublePtr>>2]);r9=(HEAPF32[tempDoublePtr>>2]=r10-r13*r29,HEAP32[tempDoublePtr>>2])|0;HEAP32[r7]=0|r30;HEAP32[r7+1]=r9;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r15-r18*(r1*r29-r23*r24);r23=HEAP32[r6]+(HEAP32[r5]*12&-1)|0;r1=(HEAPF32[tempDoublePtr>>2]=r14+r22*r24,HEAP32[tempDoublePtr>>2]);r14=(HEAPF32[tempDoublePtr>>2]=r12+r22*r29,HEAP32[tempDoublePtr>>2])|0;HEAP32[r23>>2]=0|r1;HEAP32[r23+4>>2]=r14;HEAPF32[HEAP32[r6]+(HEAP32[r5]*12&-1)+8>>2]=r16+r19*(r11*r29-r27*r24);if(r2>.004999999888241291){r31=0;return r31}r31=r17<=.03490658849477768;return r31}function __ZN15b2RevoluteJoint4DumpEv(r1){var r2,r3,r4,r5;r2=r1>>2;r3=STACKTOP;r4=HEAP32[HEAP32[r2+12]+8>>2];r5=HEAP32[HEAP32[r2+13]+8>>2];__Z5b2LogPKcz(5251544,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253800,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r4,tempInt));__Z5b2LogPKcz(5251428,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r5,tempInt));__Z5b2LogPKcz(5249488,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+61|0]&1,tempInt));r5=HEAPF32[r2+18];__Z5b2LogPKcz(5248748,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+17],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r5,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r5=HEAPF32[r2+20];__Z5b2LogPKcz(5248324,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+19],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r5,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247884,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+29],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247120,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+112|0]&1,tempInt));__Z5b2LogPKcz(5255168,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+30],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254896,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+31],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247584,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+100|0]&1,tempInt));__Z5b2LogPKcz(5247336,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+27],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247088,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+26],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254332,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+14],tempInt));STACKTOP=r3;return}function __ZN15b2RevoluteJointD0Ev(r1){__ZdlPv(r1);return}function __ZN11b2RopeJoint23InitVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r3=r1>>2;r4=HEAP32[r3+12],r5=r4>>2;r6=HEAP32[r5+2];r7=r1+96|0;HEAP32[r7>>2]=r6;r8=HEAP32[r3+13],r9=r8>>2;r10=HEAP32[r9+2];r11=(r1+100|0)>>2;HEAP32[r11]=r10;r12=r4+28|0;r4=r1+128|0;r13=HEAP32[r12>>2];r14=HEAP32[r12+4>>2];HEAP32[r4>>2]=r13;HEAP32[r4+4>>2]=r14;r4=r8+28|0;r8=r1+136|0;r12=HEAP32[r4>>2];r15=HEAP32[r4+4>>2];HEAP32[r8>>2]=r12;HEAP32[r8+4>>2]=r15;r8=HEAPF32[r5+30];HEAPF32[r3+36]=r8;r4=HEAPF32[r9+30];HEAPF32[r3+37]=r4;r16=HEAPF32[r5+32];HEAPF32[r3+38]=r16;r5=HEAPF32[r9+32];HEAPF32[r3+39]=r5;r9=HEAP32[r2+24>>2];r17=r9+(r6*12&-1)|0;r18=HEAP32[r17+4>>2];r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAPF32[tempDoublePtr>>2]);r17=(HEAP32[tempDoublePtr>>2]=r18,HEAPF32[tempDoublePtr>>2]);r18=HEAPF32[r9+(r6*12&-1)+8>>2];r20=(r2+28|0)>>2;r21=HEAP32[r20];r22=r21+(r6*12&-1)|0;r23=HEAP32[r22+4>>2];r24=(HEAP32[tempDoublePtr>>2]=HEAP32[r22>>2],HEAPF32[tempDoublePtr>>2]);r22=(HEAP32[tempDoublePtr>>2]=r23,HEAPF32[tempDoublePtr>>2]);r23=HEAPF32[r21+(r6*12&-1)+8>>2];r25=r9+(r10*12&-1)|0;r26=HEAP32[r25+4>>2];r27=(HEAP32[tempDoublePtr>>2]=HEAP32[r25>>2],HEAPF32[tempDoublePtr>>2]);r25=(HEAP32[tempDoublePtr>>2]=r26,HEAPF32[tempDoublePtr>>2]);r26=HEAPF32[r9+(r10*12&-1)+8>>2];r9=r21+(r10*12&-1)|0;r28=HEAP32[r9+4>>2];r29=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAPF32[tempDoublePtr>>2]);r9=(HEAP32[tempDoublePtr>>2]=r28,HEAPF32[tempDoublePtr>>2]);r28=HEAPF32[r21+(r10*12&-1)+8>>2];r10=Math.sin(r18);r21=Math.cos(r18);r18=Math.sin(r26);r30=Math.cos(r26);r26=HEAPF32[r3+17]-(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r3+18]-(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=r21*r26-r10*r13;r31=r10*r26+r21*r13;r13=r1+112|0;r21=(HEAPF32[tempDoublePtr>>2]=r14,HEAP32[tempDoublePtr>>2]);r26=(HEAPF32[tempDoublePtr>>2]=r31,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r21;HEAP32[r13+4>>2]=r26;r26=HEAPF32[r3+19]-(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=HEAPF32[r3+20]-(HEAP32[tempDoublePtr>>2]=r15,HEAPF32[tempDoublePtr>>2]);r15=r30*r26-r18*r12;r13=r18*r26+r30*r12;r12=r1+120|0;r30=(HEAPF32[tempDoublePtr>>2]=r15,HEAP32[tempDoublePtr>>2]);r26=(HEAPF32[tempDoublePtr>>2]=r13,HEAP32[tempDoublePtr>>2])|0;HEAP32[r12>>2]=0|r30;HEAP32[r12+4>>2]=r26;r26=r1+104|0;r12=r27+r15-r19-r14;r19=r25+r13-r17-r31;r17=r26;r25=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r27=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2])|0;HEAP32[r17>>2]=0|r25;HEAP32[r17+4>>2]=r27;r27=r26|0;r26=r1+108|0;r17=Math.sqrt(r12*r12+r19*r19);HEAPF32[r3+22]=r17;HEAP32[r3+41]=r17-HEAPF32[r3+21]>0?2:0;if(r17<=.004999999888241291){HEAPF32[r27>>2]=0;HEAPF32[r26>>2]=0;HEAPF32[r3+40]=0;HEAPF32[r3+23]=0;return}r25=1/r17;r17=r25*r12;HEAPF32[r27>>2]=r17;r27=r25*r19;HEAPF32[r26>>2]=r27;r26=r14*r27-r31*r17;r19=r27*r15-r17*r13;r25=r4+r8+r26*r26*r16+r19*r19*r5;if(r25!=0){r32=1/r25}else{r32=0}HEAPF32[r3+40]=r32;if((HEAP8[r2+20|0]&1)<<24>>24==0){HEAPF32[r3+23]=0;r33=r23;r34=r28;r35=r29;r36=r9;r37=r24;r38=r22}else{r3=r1+92|0;r1=HEAPF32[r2+8>>2]*HEAPF32[r3>>2];HEAPF32[r3>>2]=r1;r3=r17*r1;r17=r1*r27;r33=r23-r16*(r17*r14-r3*r31);r34=r28+r5*(r17*r15-r3*r13);r35=r29+r3*r4;r36=r9+r17*r4;r37=r24-r3*r8;r38=r22-r17*r8}r8=HEAP32[r20]+(r6*12&-1)|0;r6=(HEAPF32[tempDoublePtr>>2]=r37,HEAP32[tempDoublePtr>>2]);r37=(HEAPF32[tempDoublePtr>>2]=r38,HEAP32[tempDoublePtr>>2])|0;HEAP32[r8>>2]=0|r6;HEAP32[r8+4>>2]=r37;HEAPF32[HEAP32[r20]+(HEAP32[r7>>2]*12&-1)+8>>2]=r33;r33=HEAP32[r20]+(HEAP32[r11]*12&-1)|0;r7=(HEAPF32[tempDoublePtr>>2]=r35,HEAP32[tempDoublePtr>>2]);r35=(HEAPF32[tempDoublePtr>>2]=r36,HEAP32[tempDoublePtr>>2])|0;HEAP32[r33>>2]=0|r7;HEAP32[r33+4>>2]=r35;HEAPF32[HEAP32[r20]+(HEAP32[r11]*12&-1)+8>>2]=r34;return}function __ZNK11b2RopeJoint17GetReactionTorqueEf(r1,r2){return 0}function __ZN11b2RopeJointD1Ev(r1){return}function __ZNK11b2RopeJoint10GetAnchorAEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+48>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+68>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+72>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK11b2RopeJoint10GetAnchorBEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+52>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+76>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+80>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK11b2RopeJoint16GetReactionForceEf(r1,r2,r3){var r4;r4=HEAPF32[r2+92>>2]*r3;r3=r4*HEAPF32[r2+108>>2];HEAPF32[r1>>2]=HEAPF32[r2+104>>2]*r4;HEAPF32[r1+4>>2]=r3;return}function __ZN11b2WeldJoint24SolveVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31;r3=r1>>2;r4=r1+116|0;r5=HEAP32[r4>>2];r6=(r2+28|0)>>2;r2=HEAP32[r6];r7=r2+(r5*12&-1)|0;r8=HEAP32[r7+4>>2];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAPF32[tempDoublePtr>>2]);r7=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=HEAPF32[r2+(r5*12&-1)+8>>2];r10=(r1+120|0)>>2;r11=HEAP32[r10];r12=r2+(r11*12&-1)|0;r13=HEAP32[r12+4>>2];r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAPF32[tempDoublePtr>>2]);r12=(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r2+(r11*12&-1)+8>>2];r11=HEAPF32[r3+39];r2=HEAPF32[r3+40];r15=HEAPF32[r3+41];r16=HEAPF32[r3+42];if(HEAPF32[r3+17]>0){r17=r1+112|0;r18=HEAPF32[r17>>2];r19=(r13-r8+HEAPF32[r3+19]+HEAPF32[r3+25]*r18)*-HEAPF32[r3+51];HEAPF32[r17>>2]=r18+r19;r18=r8-r15*r19;r17=r13+r16*r19;r19=HEAPF32[r3+34];r20=HEAPF32[r3+33];r21=HEAPF32[r3+32];r22=HEAPF32[r3+31];r23=r14+r19*-r17-r9-r21*-r18;r24=r12+r20*r17-r7-r22*r18;r25=HEAPF32[r3+46]*r24+HEAPF32[r3+43]*r23;r26=HEAPF32[r3+47]*r24+HEAPF32[r3+44]*r23;r23=-r25;r24=-r26;r27=r1+104|0;HEAPF32[r27>>2]=HEAPF32[r27>>2]-r25;r25=r1+108|0;HEAPF32[r25>>2]=HEAPF32[r25>>2]-r26;r28=r18-r15*(r22*r24-r21*r23);r29=r17+r16*(r20*r24-r19*r23);r30=r23;r31=r24}else{r24=HEAPF32[r3+34];r23=HEAPF32[r3+33];r19=HEAPF32[r3+32];r20=HEAPF32[r3+31];r17=r14+r24*-r13-r9-r19*-r8;r21=r12+r13*r23-r7-r8*r20;r22=r13-r8;r18=r17*HEAPF32[r3+43]+r21*HEAPF32[r3+46]+r22*HEAPF32[r3+49];r26=r17*HEAPF32[r3+44]+r21*HEAPF32[r3+47]+r22*HEAPF32[r3+50];r25=r17*HEAPF32[r3+45]+r21*HEAPF32[r3+48]+r22*HEAPF32[r3+51];r3=-r18;r22=-r26;r21=r1+104|0;HEAPF32[r21>>2]=HEAPF32[r21>>2]-r18;r18=r1+108|0;HEAPF32[r18>>2]=HEAPF32[r18>>2]-r26;r26=r1+112|0;HEAPF32[r26>>2]=HEAPF32[r26>>2]-r25;r28=r8-r15*(r20*r22-r19*r3-r25);r29=r13+r16*(r23*r22-r24*r3-r25);r30=r3;r31=r22}r22=HEAP32[r6]+(r5*12&-1)|0;r5=(HEAPF32[tempDoublePtr>>2]=r9-r11*r30,HEAP32[tempDoublePtr>>2]);r9=(HEAPF32[tempDoublePtr>>2]=r7-r11*r31,HEAP32[tempDoublePtr>>2])|0;HEAP32[r22>>2]=0|r5;HEAP32[r22+4>>2]=r9;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r28;r28=HEAP32[r6]+(HEAP32[r10]*12&-1)|0;r4=(HEAPF32[tempDoublePtr>>2]=r14+r2*r30,HEAP32[tempDoublePtr>>2]);r30=(HEAPF32[tempDoublePtr>>2]=r12+r2*r31,HEAP32[tempDoublePtr>>2])|0;HEAP32[r28>>2]=0|r4;HEAP32[r28+4>>2]=r30;HEAPF32[HEAP32[r6]+(HEAP32[r10]*12&-1)+8>>2]=r29;return}function __ZN11b2RopeJoint24SolvePositionConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r3=r1>>2;r4=r1+96|0;r5=HEAP32[r4>>2];r6=(r2+24|0)>>2;r2=HEAP32[r6];r7=(r2+(r5*12&-1)|0)>>2;r8=HEAP32[r7+1];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r7],HEAPF32[tempDoublePtr>>2]);r10=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=HEAPF32[r2+(r5*12&-1)+8>>2];r5=(r1+100|0)>>2;r11=HEAP32[r5];r12=r2+(r11*12&-1)|0;r13=HEAP32[r12+4>>2];r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAPF32[tempDoublePtr>>2]);r12=(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r2+(r11*12&-1)+8>>2];r11=Math.sin(r8);r2=Math.cos(r8);r15=Math.sin(r13);r16=Math.cos(r13);r17=HEAPF32[r3+17]-HEAPF32[r3+32];r18=HEAPF32[r3+18]-HEAPF32[r3+33];r19=r2*r17-r11*r18;r20=r11*r17+r2*r18;r18=HEAPF32[r3+19]-HEAPF32[r3+34];r2=HEAPF32[r3+20]-HEAPF32[r3+35];r17=r16*r18-r15*r2;r11=r15*r18+r16*r2;r2=r14+r17-r9-r19;r16=r12+r11-r10-r20;r18=Math.sqrt(r2*r2+r16*r16);if(r18<1.1920928955078125e-7){r21=0;r22=r2;r23=r16}else{r15=1/r18;r21=r18;r22=r2*r15;r23=r16*r15}r15=r1+84|0;r1=r21-HEAPF32[r15>>2];r16=r1<.20000000298023224?r1:.20000000298023224;r1=(r16<0?0:r16)*-HEAPF32[r3+40];r16=r22*r1;r22=r23*r1;r1=HEAPF32[r3+36];r23=r8-HEAPF32[r3+38]*(r19*r22-r20*r16);r20=HEAPF32[r3+37];r19=r13+HEAPF32[r3+39]*(r17*r22-r11*r16);r11=(HEAPF32[tempDoublePtr>>2]=r9-r1*r16,HEAP32[tempDoublePtr>>2]);r9=(HEAPF32[tempDoublePtr>>2]=r10-r1*r22,HEAP32[tempDoublePtr>>2])|0;HEAP32[r7]=0|r11;HEAP32[r7+1]=r9;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r23;r23=HEAP32[r6]+(HEAP32[r5]*12&-1)|0;r4=(HEAPF32[tempDoublePtr>>2]=r14+r20*r16,HEAP32[tempDoublePtr>>2]);r16=(HEAPF32[tempDoublePtr>>2]=r12+r20*r22,HEAP32[tempDoublePtr>>2])|0;HEAP32[r23>>2]=0|r4;HEAP32[r23+4>>2]=r16;HEAPF32[HEAP32[r6]+(HEAP32[r5]*12&-1)+8>>2]=r19;return r21-HEAPF32[r15>>2]<.004999999888241291}function __ZN11b2RopeJoint4DumpEv(r1){var r2,r3,r4,r5;r2=r1>>2;r3=STACKTOP;r4=HEAP32[HEAP32[r2+12]+8>>2];r5=HEAP32[HEAP32[r2+13]+8>>2];__Z5b2LogPKcz(5249136,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253800,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r4,tempInt));__Z5b2LogPKcz(5251428,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r5,tempInt));__Z5b2LogPKcz(5249488,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+61|0]&1,tempInt));r1=HEAPF32[r2+18];__Z5b2LogPKcz(5248748,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+17],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r1,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r1=HEAPF32[r2+20];__Z5b2LogPKcz(5248324,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+19],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r1,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247916,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+21],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254332,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+14],tempInt));STACKTOP=r3;return}function __ZN11b2RopeJointD0Ev(r1){__ZdlPv(r1);return}function __ZN11b2WeldJoint23InitVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66;r3=r1>>2;r4=HEAP32[r3+12],r5=r4>>2;r6=HEAP32[r5+2];r7=(r1+116|0)>>2;HEAP32[r7]=r6;r8=HEAP32[r3+13],r9=r8>>2;r10=HEAP32[r9+2];r11=(r1+120|0)>>2;HEAP32[r11]=r10;r12=r4+28|0;r4=r1+140|0;r13=HEAP32[r12>>2];r14=HEAP32[r12+4>>2];HEAP32[r4>>2]=r13;HEAP32[r4+4>>2]=r14;r4=r8+28|0;r8=r1+148|0;r12=HEAP32[r4>>2];r15=HEAP32[r4+4>>2];HEAP32[r8>>2]=r12;HEAP32[r8+4>>2]=r15;r8=HEAPF32[r5+30];HEAPF32[r3+39]=r8;r4=HEAPF32[r9+30];HEAPF32[r3+40]=r4;r16=HEAPF32[r5+32];HEAPF32[r3+41]=r16;r5=HEAPF32[r9+32];HEAPF32[r3+42]=r5;r9=HEAP32[r2+24>>2];r17=HEAPF32[r9+(r6*12&-1)+8>>2];r18=(r2+28|0)>>2;r19=HEAP32[r18];r20=r19+(r6*12&-1)|0;r21=HEAP32[r20+4>>2];r22=(HEAP32[tempDoublePtr>>2]=HEAP32[r20>>2],HEAPF32[tempDoublePtr>>2]);r20=(HEAP32[tempDoublePtr>>2]=r21,HEAPF32[tempDoublePtr>>2]);r21=HEAPF32[r19+(r6*12&-1)+8>>2];r23=HEAPF32[r9+(r10*12&-1)+8>>2];r9=r19+(r10*12&-1)|0;r24=HEAP32[r9+4>>2];r25=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAPF32[tempDoublePtr>>2]);r9=(HEAP32[tempDoublePtr>>2]=r24,HEAPF32[tempDoublePtr>>2]);r24=HEAPF32[r19+(r10*12&-1)+8>>2];r10=Math.sin(r17);r19=Math.cos(r17);r26=Math.sin(r23);r27=Math.cos(r23);r28=HEAPF32[r3+20]-(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r3+21]-(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=r19*r28-r10*r13;r29=r10*r28+r19*r13;r13=r1+124|0;r19=(HEAPF32[tempDoublePtr>>2]=r14,HEAP32[tempDoublePtr>>2]);r28=(HEAPF32[tempDoublePtr>>2]=r29,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r19;HEAP32[r13+4>>2]=r28;r28=HEAPF32[r3+22]-(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=HEAPF32[r3+23]-(HEAP32[tempDoublePtr>>2]=r15,HEAPF32[tempDoublePtr>>2]);r15=r27*r28-r26*r12;r13=r26*r28+r27*r12;r12=r1+132|0;r27=(HEAPF32[tempDoublePtr>>2]=r15,HEAP32[tempDoublePtr>>2]);r28=(HEAPF32[tempDoublePtr>>2]=r13,HEAP32[tempDoublePtr>>2])|0;HEAP32[r12>>2]=0|r27;HEAP32[r12+4>>2]=r28;r28=r8+r4;r12=r28+r16*r29*r29+r5*r13*r13;r27=-r29;r26=r16*r14*r27-r5*r13*r15;r19=r16*r27-r5*r13;r27=r28+r16*r14*r14+r5*r15*r15;r28=r16*r14+r5*r15;r10=r16+r5;r30=HEAPF32[r3+17];r31=r1+172|0;if(r30>0){r32=r12*r27-r26*r26;if(r32!=0){r33=1/r32}else{r33=r32}HEAPF32[r31>>2]=r27*r33;r32=r26*-r33;HEAPF32[r3+46]=r32;HEAPF32[r3+45]=0;HEAPF32[r3+44]=r32;HEAPF32[r3+47]=r12*r33;r33=(r1+192|0)>>2;HEAP32[r33]=0;HEAP32[r33+1]=0;HEAP32[r33+2]=0;HEAP32[r33+3]=0;if(r10>0){r34=1/r10}else{r34=0}r33=r23-r17-HEAPF32[r3+24];r17=r30*6.2831854820251465;r30=r17*r34*r17;r23=HEAPF32[r2>>2];r32=r23*(r17*r34*2*HEAPF32[r3+18]+r23*r30);r34=r1+100|0;HEAPF32[r34>>2]=r32;if(r32!=0){r35=1/r32}else{r35=0}HEAPF32[r34>>2]=r35;HEAPF32[r3+19]=r33*r23*r30*r35;r30=r10+r35;if(r30!=0){r36=1/r30}else{r36=0}HEAPF32[r3+51]=r36}else{r36=r10*r27-r28*r28;r30=r19*r28-r10*r26;r35=r28*r26-r19*r27;r23=r19*r35+r12*r36+r26*r30;if(r23!=0){r37=1/r23}else{r37=r23}HEAPF32[r31>>2]=r36*r37;r36=r30*r37;HEAPF32[r3+44]=r36;r30=r35*r37;HEAPF32[r3+45]=r30;HEAPF32[r3+46]=r36;HEAPF32[r3+47]=(r10*r12-r19*r19)*r37;r10=(r19*r26-r12*r28)*r37;HEAPF32[r3+48]=r10;HEAPF32[r3+49]=r30;HEAPF32[r3+50]=r10;HEAPF32[r3+51]=(r12*r27-r26*r26)*r37;HEAPF32[r3+25]=0;HEAPF32[r3+19]=0}r37=r1+104|0;if((HEAP8[r2+20|0]&1)<<24>>24==0){HEAPF32[r37>>2]=0;HEAPF32[r3+27]=0;HEAPF32[r3+28]=0;r3=r21;r26=r24;r27=r25;r12=r9;r10=r22;r30=r20;r28=HEAP32[r18];r19=r28+(r6*12&-1)|0;r36=r19;r35=(HEAPF32[tempDoublePtr>>2]=r10,HEAP32[tempDoublePtr>>2]);r31=(HEAPF32[tempDoublePtr>>2]=r30,HEAP32[tempDoublePtr>>2]);r23=r31;r33=0;r34=0;r32=r23;r17=r35;r38=0;r39=r34|r17;r40=r32|r38;r41=r36|0;HEAP32[r41>>2]=r39;r42=r36+4|0;HEAP32[r42>>2]=r40;r43=HEAP32[r7];r44=HEAP32[r18];r45=r44+(r43*12&-1)+8|0;HEAPF32[r45>>2]=r3;r46=HEAP32[r11];r47=HEAP32[r18];r48=r47+(r46*12&-1)|0;r49=r48;r50=(HEAPF32[tempDoublePtr>>2]=r27,HEAP32[tempDoublePtr>>2]);r51=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r52=r51;r53=0;r54=0;r55=r52;r56=r50;r57=0;r58=r54|r56;r59=r55|r57;r60=r49|0;HEAP32[r60>>2]=r58;r61=r49+4|0;HEAP32[r61>>2]=r59;r62=HEAP32[r11];r63=HEAP32[r18];r64=r63+(r62*12&-1)+8|0;HEAPF32[r64>>2]=r26;return}else{r65=HEAPF32[r2+8>>2];r2=r37|0;r37=r65*HEAPF32[r2>>2];HEAPF32[r2>>2]=r37;r2=r1+108|0;r66=r65*HEAPF32[r2>>2];HEAPF32[r2>>2]=r66;r2=r1+112|0;r1=r65*HEAPF32[r2>>2];HEAPF32[r2>>2]=r1;r3=r21-r16*(r1+(r66*r14-r37*r29));r26=r24+r5*(r1+(r66*r15-r37*r13));r27=r25+r4*r37;r12=r9+r4*r66;r10=r22-r8*r37;r30=r20-r8*r66;r28=HEAP32[r18];r19=r28+(r6*12&-1)|0;r36=r19;r35=(HEAPF32[tempDoublePtr>>2]=r10,HEAP32[tempDoublePtr>>2]);r31=(HEAPF32[tempDoublePtr>>2]=r30,HEAP32[tempDoublePtr>>2]);r23=r31;r33=0;r34=0;r32=r23;r17=r35;r38=0;r39=r34|r17;r40=r32|r38;r41=r36|0;HEAP32[r41>>2]=r39;r42=r36+4|0;HEAP32[r42>>2]=r40;r43=HEAP32[r7];r44=HEAP32[r18];r45=r44+(r43*12&-1)+8|0;HEAPF32[r45>>2]=r3;r46=HEAP32[r11];r47=HEAP32[r18];r48=r47+(r46*12&-1)|0;r49=r48;r50=(HEAPF32[tempDoublePtr>>2]=r27,HEAP32[tempDoublePtr>>2]);r51=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r52=r51;r53=0;r54=0;r55=r52;r56=r50;r57=0;r58=r54|r56;r59=r55|r57;r60=r49|0;HEAP32[r60>>2]=r58;r61=r49+4|0;HEAP32[r61>>2]=r59;r62=HEAP32[r11];r63=HEAP32[r18];r64=r63+(r62*12&-1)+8|0;HEAPF32[r64>>2]=r26;return}}function __ZN11b2WeldJointD1Ev(r1){return}function __ZNK11b2WeldJoint10GetAnchorAEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+48>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+80>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+84>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK11b2WeldJoint10GetAnchorBEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+52>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+88>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+92>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK11b2WeldJoint16GetReactionForceEf(r1,r2,r3){var r4;r4=HEAPF32[r2+108>>2]*r3;HEAPF32[r1>>2]=HEAPF32[r2+104>>2]*r3;HEAPF32[r1+4>>2]=r4;return}function __ZNK11b2WeldJoint17GetReactionTorqueEf(r1,r2){return HEAPF32[r1+112>>2]*r2}function __ZN11b2WeldJoint24SolvePositionConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r3=r1>>2;r4=r1+116|0;r5=HEAP32[r4>>2];r6=(r2+24|0)>>2;r2=HEAP32[r6];r7=(r2+(r5*12&-1)|0)>>2;r8=HEAP32[r7+1];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r7],HEAPF32[tempDoublePtr>>2]);r10=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=HEAPF32[r2+(r5*12&-1)+8>>2];r5=(r1+120|0)>>2;r1=HEAP32[r5];r11=r2+(r1*12&-1)|0;r12=HEAP32[r11+4>>2];r13=(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAPF32[tempDoublePtr>>2]);r11=(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=HEAPF32[r2+(r1*12&-1)+8>>2];r1=Math.sin(r8);r2=Math.cos(r8);r14=Math.sin(r12);r15=Math.cos(r12);r16=HEAPF32[r3+39];r17=HEAPF32[r3+40];r18=HEAPF32[r3+41];r19=HEAPF32[r3+42];r20=HEAPF32[r3+20]-HEAPF32[r3+35];r21=HEAPF32[r3+21]-HEAPF32[r3+36];r22=r2*r20-r1*r21;r23=r1*r20+r2*r21;r21=HEAPF32[r3+22]-HEAPF32[r3+37];r2=HEAPF32[r3+23]-HEAPF32[r3+38];r20=r15*r21-r14*r2;r1=r14*r21+r15*r2;r2=r16+r17;r15=r2+r18*r23*r23+r19*r1*r1;r21=-r23;r14=r18*r22*r21-r19*r1*r20;r24=r18*r21-r19*r1;r21=r2+r18*r22*r22+r19*r20*r20;r2=r18*r22+r19*r20;r25=r18+r19;r26=r13+r20-r9-r22;r27=r11+r1-r10-r23;if(HEAPF32[r3+17]>0){r28=Math.sqrt(r26*r26+r27*r27);r29=r15*r21-r14*r14;if(r29!=0){r30=1/r29}else{r30=r29}r29=-((r21*r26-r14*r27)*r30);r31=-((r15*r27-r14*r26)*r30);r32=r22*r31-r23*r29;r33=0;r34=r28;r35=r20*r31-r1*r29;r36=r29;r37=r31}else{r31=r12-r8-HEAPF32[r3+24];r3=Math.sqrt(r26*r26+r27*r27);if(r31>0){r38=r31}else{r38=-r31}r29=r25*r21-r2*r2;r28=r2*r24-r25*r14;r30=r2*r14-r24*r21;r39=r24*r30+r15*r29+r14*r28;if(r39!=0){r40=1/r39}else{r40=r39}r39=r2*r26;r41=(r24*(r27*r14-r21*r26)+r15*(r21*r31-r2*r27)+r14*(r39-r14*r31))*r40;r21=-((r26*r29+r27*r28+r30*r31)*r40);r30=-((r24*(r39-r24*r27)+r15*(r25*r27-r2*r31)+r14*(r24*r31-r25*r26))*r40);r32=r22*r30-r23*r21-r41;r33=r38;r34=r3;r35=r20*r30-r1*r21-r41;r36=r21;r37=r30}r30=(HEAPF32[tempDoublePtr>>2]=r9-r16*r36,HEAP32[tempDoublePtr>>2]);r9=(HEAPF32[tempDoublePtr>>2]=r10-r16*r37,HEAP32[tempDoublePtr>>2])|0;HEAP32[r7]=0|r30;HEAP32[r7+1]=r9;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r8-r18*r32;r32=HEAP32[r6]+(HEAP32[r5]*12&-1)|0;r18=(HEAPF32[tempDoublePtr>>2]=r13+r17*r36,HEAP32[tempDoublePtr>>2]);r36=(HEAPF32[tempDoublePtr>>2]=r11+r17*r37,HEAP32[tempDoublePtr>>2])|0;HEAP32[r32>>2]=0|r18;HEAP32[r32+4>>2]=r36;HEAPF32[HEAP32[r6]+(HEAP32[r5]*12&-1)+8>>2]=r12+r19*r35;if(r34>.004999999888241291){r42=0;return r42}r42=r33<=.03490658849477768;return r42}function __ZN11b2WeldJoint4DumpEv(r1){var r2,r3,r4,r5;r2=r1>>2;r3=STACKTOP;r4=HEAP32[HEAP32[r2+12]+8>>2];r5=HEAP32[HEAP32[r2+13]+8>>2];__Z5b2LogPKcz(5249080,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253800,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r4,tempInt));__Z5b2LogPKcz(5251428,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r5,tempInt));__Z5b2LogPKcz(5249488,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+61|0]&1,tempInt));r1=HEAPF32[r2+21];__Z5b2LogPKcz(5248748,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+20],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r1,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r1=HEAPF32[r2+23];__Z5b2LogPKcz(5248324,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+22],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r1,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247884,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+24],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5255136,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+17],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254864,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+18],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254332,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+14],tempInt));STACKTOP=r3;return}function __ZN11b2WeldJointD0Ev(r1){__ZdlPv(r1);return}function __ZN12b2WheelJoint23InitVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67;r3=r1>>2;r4=HEAP32[r3+12],r5=r4>>2;r6=HEAP32[r5+2];r7=(r1+132|0)>>2;HEAP32[r7]=r6;r8=HEAP32[r3+13],r9=r8>>2;r10=HEAP32[r9+2];r11=(r1+136|0)>>2;HEAP32[r11]=r10;r12=r4+28|0;r4=r1+140|0;r13=HEAP32[r12>>2];r14=HEAP32[r12+4>>2];HEAP32[r4>>2]=r13;HEAP32[r4+4>>2]=r14;r4=r8+28|0;r8=r1+148|0;r12=HEAP32[r4>>2];r15=HEAP32[r4+4>>2];HEAP32[r8>>2]=r12;HEAP32[r8+4>>2]=r15;r8=HEAPF32[r5+30];HEAPF32[r3+39]=r8;r4=HEAPF32[r9+30];HEAPF32[r3+40]=r4;r16=HEAPF32[r5+32];HEAPF32[r3+41]=r16;r5=HEAPF32[r9+32];HEAPF32[r3+42]=r5;r9=HEAP32[r2+24>>2];r17=r9+(r6*12&-1)|0;r18=HEAP32[r17+4>>2];r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAPF32[tempDoublePtr>>2]);r17=(HEAP32[tempDoublePtr>>2]=r18,HEAPF32[tempDoublePtr>>2]);r18=HEAPF32[r9+(r6*12&-1)+8>>2];r20=(r2+28|0)>>2;r21=HEAP32[r20];r22=r21+(r6*12&-1)|0;r23=HEAP32[r22+4>>2];r24=(HEAP32[tempDoublePtr>>2]=HEAP32[r22>>2],HEAPF32[tempDoublePtr>>2]);r22=(HEAP32[tempDoublePtr>>2]=r23,HEAPF32[tempDoublePtr>>2]);r23=HEAPF32[r21+(r6*12&-1)+8>>2];r25=r9+(r10*12&-1)|0;r26=HEAP32[r25+4>>2];r27=(HEAP32[tempDoublePtr>>2]=HEAP32[r25>>2],HEAPF32[tempDoublePtr>>2]);r25=(HEAP32[tempDoublePtr>>2]=r26,HEAPF32[tempDoublePtr>>2]);r26=HEAPF32[r9+(r10*12&-1)+8>>2];r9=r21+(r10*12&-1)|0;r28=HEAP32[r9+4>>2];r29=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAPF32[tempDoublePtr>>2]);r9=(HEAP32[tempDoublePtr>>2]=r28,HEAPF32[tempDoublePtr>>2]);r28=HEAPF32[r21+(r10*12&-1)+8>>2];r10=Math.sin(r18);r21=Math.cos(r18);r18=Math.sin(r26);r30=Math.cos(r26);r26=HEAPF32[r3+19]-(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r3+20]-(HEAP32[tempDoublePtr>>2]=r14,HEAPF32[tempDoublePtr>>2]);r14=r21*r26-r10*r13;r31=r10*r26+r21*r13;r13=HEAPF32[r3+21]-(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=HEAPF32[r3+22]-(HEAP32[tempDoublePtr>>2]=r15,HEAPF32[tempDoublePtr>>2]);r15=r30*r13-r18*r12;r26=r18*r13+r30*r12;r12=r27+r15-r19-r14;r19=r25+r26-r17-r31;r17=HEAPF32[r3+25];r25=HEAPF32[r3+26];r27=r21*r17-r10*r25;r30=r10*r17+r21*r25;r25=r1+180|0;r17=(HEAPF32[tempDoublePtr>>2]=r27,HEAP32[tempDoublePtr>>2]);r13=(HEAPF32[tempDoublePtr>>2]=r30,HEAP32[tempDoublePtr>>2])|0;HEAP32[r25>>2]=0|r17;HEAP32[r25+4>>2]=r13;r13=r14+r12;r14=r31+r19;r31=r30*r13-r27*r14;HEAPF32[r3+49]=r31;r25=r15*r30-r26*r27;HEAPF32[r3+50]=r25;r17=r8+r4;r18=r17+r31*r16*r31+r25*r5*r25;if(r18>0){r32=1/r18}else{r32=r18}HEAPF32[r3+51]=r32;r32=(r1+212|0)>>2;HEAPF32[r32]=0;r18=r1+216|0;HEAPF32[r18>>2]=0;r33=r1+220|0;HEAPF32[r33>>2]=0;r34=HEAPF32[r3+17];do{if(r34>0){r35=HEAPF32[r3+23];r36=HEAPF32[r3+24];r37=r21*r35-r10*r36;r38=r10*r35+r21*r36;r36=r1+172|0;r35=(HEAPF32[tempDoublePtr>>2]=r37,HEAP32[tempDoublePtr>>2]);r39=(HEAPF32[tempDoublePtr>>2]=r38,HEAP32[tempDoublePtr>>2])|0;HEAP32[r36>>2]=0|r35;HEAP32[r36+4>>2]=r39;r39=r13*r38-r14*r37;HEAPF32[r3+47]=r39;r36=r15*r38-r26*r37;HEAPF32[r3+48]=r36;r35=r17+r39*r16*r39+r36*r5*r36;if(r35<=0){break}r36=1/r35;HEAPF32[r32]=r36;r39=r34*6.2831854820251465;r40=r39*r36*r39;r41=HEAPF32[r2>>2];r42=r41*(r39*r36*2*HEAPF32[r3+18]+r41*r40);if(r42>0){r43=1/r42}else{r43=r42}HEAPF32[r33>>2]=r43;HEAPF32[r18>>2]=(r12*r37+r19*r38)*r41*r40*r43;r40=r35+r43;HEAPF32[r32]=r40;if(r40<=0){break}HEAPF32[r32]=1/r40}else{HEAPF32[r3+29]=0}}while(0);do{if((HEAP8[r1+128|0]&1)<<24>>24==0){HEAPF32[r3+52]=0;HEAPF32[r3+28]=0}else{r32=r5+r16;r43=r1+208|0;HEAPF32[r43>>2]=r32;if(r32<=0){break}HEAPF32[r43>>2]=1/r32}}while(0);if((HEAP8[r2+20|0]&1)<<24>>24==0){HEAPF32[r3+27]=0;HEAPF32[r3+29]=0;HEAPF32[r3+28]=0;r32=r23;r43=r28;r19=r29;r12=r9;r18=r24;r33=r22;r34=HEAP32[r20];r17=r34+(r6*12&-1)|0;r26=r17;r15=(HEAPF32[tempDoublePtr>>2]=r18,HEAP32[tempDoublePtr>>2]);r14=(HEAPF32[tempDoublePtr>>2]=r33,HEAP32[tempDoublePtr>>2]);r13=r14;r21=0;r10=0;r40=r13;r35=r15;r41=0;r38=r10|r35;r37=r40|r41;r42=r26|0;HEAP32[r42>>2]=r38;r36=r26+4|0;HEAP32[r36>>2]=r37;r39=HEAP32[r7];r44=HEAP32[r20];r45=r44+(r39*12&-1)+8|0;HEAPF32[r45>>2]=r32;r46=HEAP32[r11];r47=HEAP32[r20];r48=r47+(r46*12&-1)|0;r49=r48;r50=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2]);r51=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r52=r51;r53=0;r54=0;r55=r52;r56=r50;r57=0;r58=r54|r56;r59=r55|r57;r60=r49|0;HEAP32[r60>>2]=r58;r61=r49+4|0;HEAP32[r61>>2]=r59;r62=HEAP32[r11];r63=HEAP32[r20];r64=r63+(r62*12&-1)+8|0;HEAPF32[r64>>2]=r43;return}else{r65=(r2+8|0)>>2;r2=r1+108|0;r66=HEAPF32[r65]*HEAPF32[r2>>2];HEAPF32[r2>>2]=r66;r2=r1+116|0;r67=HEAPF32[r65]*HEAPF32[r2>>2];HEAPF32[r2>>2]=r67;r2=r1+112|0;r1=HEAPF32[r65]*HEAPF32[r2>>2];HEAPF32[r2>>2]=r1;r2=r66*r27+r67*HEAPF32[r3+43];r27=r66*r30+r67*HEAPF32[r3+44];r32=r23-(r1+r66*r31+r67*HEAPF32[r3+47])*r16;r43=r28+(r1+r66*r25+r67*HEAPF32[r3+48])*r5;r19=r29+r2*r4;r12=r9+r27*r4;r18=r24-r2*r8;r33=r22-r27*r8;r34=HEAP32[r20];r17=r34+(r6*12&-1)|0;r26=r17;r15=(HEAPF32[tempDoublePtr>>2]=r18,HEAP32[tempDoublePtr>>2]);r14=(HEAPF32[tempDoublePtr>>2]=r33,HEAP32[tempDoublePtr>>2]);r13=r14;r21=0;r10=0;r40=r13;r35=r15;r41=0;r38=r10|r35;r37=r40|r41;r42=r26|0;HEAP32[r42>>2]=r38;r36=r26+4|0;HEAP32[r36>>2]=r37;r39=HEAP32[r7];r44=HEAP32[r20];r45=r44+(r39*12&-1)+8|0;HEAPF32[r45>>2]=r32;r46=HEAP32[r11];r47=HEAP32[r20];r48=r47+(r46*12&-1)|0;r49=r48;r50=(HEAPF32[tempDoublePtr>>2]=r19,HEAP32[tempDoublePtr>>2]);r51=(HEAPF32[tempDoublePtr>>2]=r12,HEAP32[tempDoublePtr>>2]);r52=r51;r53=0;r54=0;r55=r52;r56=r50;r57=0;r58=r54|r56;r59=r55|r57;r60=r49|0;HEAP32[r60>>2]=r58;r61=r49+4|0;HEAP32[r61>>2]=r59;r62=HEAP32[r11];r63=HEAP32[r20];r64=r63+(r62*12&-1)+8|0;HEAPF32[r64>>2]=r43;return}}function __ZN12b2WheelJointC2EPK15b2WheelJointDef(r1,r2){var r3,r4,r5,r6,r7,r8;r3=r2>>2;r4=r1>>2;r5=r1|0;HEAP32[r5>>2]=5261468;r6=r2+8|0;r7=r2+12|0;if((HEAP32[r6>>2]|0)==(HEAP32[r7>>2]|0)){___assert_func(5249968,173,5258024,5251672)}else{HEAP32[r4+1]=HEAP32[r3];HEAP32[r4+2]=0;HEAP32[r4+3]=0;HEAP32[r4+12]=HEAP32[r6>>2];HEAP32[r4+13]=HEAP32[r7>>2];HEAP32[r4+14]=0;HEAP8[r1+61|0]=HEAP8[r2+16|0]&1;HEAP8[r1+60|0]=0;HEAP32[r4+16]=HEAP32[r3+1];_memset(r1+16|0,0,32);HEAP32[r5>>2]=5262216;r5=r2+20|0;r7=r1+76|0;r6=HEAP32[r5+4>>2];HEAP32[r7>>2]=HEAP32[r5>>2];HEAP32[r7+4>>2]=r6;r6=r2+28|0;r7=r1+84|0;r5=HEAP32[r6+4>>2];HEAP32[r7>>2]=HEAP32[r6>>2];HEAP32[r7+4>>2]=r5;r5=r2+36|0;r7=r1+92|0;r6=HEAP32[r5>>2];r8=HEAP32[r5+4>>2];HEAP32[r7>>2]=r6;HEAP32[r7+4>>2]=r8;r7=r1+100|0;HEAP32[r7>>2]=0|(HEAPF32[tempDoublePtr>>2]=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2])*-1,HEAP32[tempDoublePtr>>2]);HEAP32[r7+4>>2]=r6|0;HEAPF32[r4+51]=0;HEAPF32[r4+27]=0;HEAPF32[r4+52]=0;HEAPF32[r4+28]=0;HEAPF32[r4+53]=0;HEAPF32[r4+29]=0;HEAPF32[r4+30]=HEAPF32[r3+12];HEAPF32[r4+31]=HEAPF32[r3+13];HEAP8[r1+128|0]=HEAP8[r2+44|0]&1;HEAPF32[r4+17]=HEAPF32[r3+14];HEAPF32[r4+18]=HEAPF32[r3+15];HEAPF32[r4+54]=0;HEAPF32[r4+55]=0;r4=(r1+172|0)>>2;HEAP32[r4]=0;HEAP32[r4+1]=0;HEAP32[r4+2]=0;HEAP32[r4+3]=0;return}}function __ZN12b2WheelJointD1Ev(r1){return}function __ZN12b2WheelJoint24SolveVelocityConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r3=r1>>2;r4=HEAPF32[r3+39];r5=HEAPF32[r3+40];r6=HEAPF32[r3+41];r7=HEAPF32[r3+42];r8=r1+132|0;r9=HEAP32[r8>>2];r10=(r2+28|0)>>2;r11=HEAP32[r10];r12=r11+(r9*12&-1)|0;r13=HEAP32[r12+4>>2];r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAPF32[tempDoublePtr>>2]);r12=(HEAP32[tempDoublePtr>>2]=r13,HEAPF32[tempDoublePtr>>2]);r13=HEAPF32[r11+(r9*12&-1)+8>>2];r15=(r1+136|0)>>2;r16=HEAP32[r15];r17=r11+(r16*12&-1)|0;r18=HEAP32[r17+4>>2];r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAPF32[tempDoublePtr>>2]);r17=(HEAP32[tempDoublePtr>>2]=r18,HEAPF32[tempDoublePtr>>2]);r18=HEAPF32[r11+(r16*12&-1)+8>>2];r16=HEAPF32[r3+43];r11=HEAPF32[r3+44];r20=HEAPF32[r3+48];r21=HEAPF32[r3+47];r22=r1+116|0;r23=HEAPF32[r22>>2];r24=(HEAPF32[r3+54]+(r18*r20+r16*(r19-r14)+r11*(r17-r12)-r13*r21)+HEAPF32[r3+55]*r23)*-HEAPF32[r3+53];HEAPF32[r22>>2]=r23+r24;r23=r16*r24;r16=r11*r24;r11=r14-r4*r23;r14=r12-r4*r16;r12=r13-r6*r24*r21;r21=r19+r5*r23;r23=r17+r5*r16;r16=r18+r7*r24*r20;r20=r1+112|0;r24=HEAPF32[r20>>2];r18=HEAPF32[r2>>2]*HEAPF32[r3+30];r2=r24+(r16-r12-HEAPF32[r3+31])*-HEAPF32[r3+52];r17=-r18;r19=r2<r18?r2:r18;r18=r19<r17?r17:r19;HEAPF32[r20>>2]=r18;r20=r18-r24;r24=r12-r6*r20;r12=r16+r7*r20;r20=HEAPF32[r3+45];r16=HEAPF32[r3+46];r18=HEAPF32[r3+50];r19=HEAPF32[r3+49];r17=((r21-r11)*r20+(r23-r14)*r16+r18*r12-r19*r24)*-HEAPF32[r3+51];r3=r1+108|0;HEAPF32[r3>>2]=HEAPF32[r3>>2]+r17;r3=r20*r17;r20=r16*r17;r16=HEAP32[r10]+(r9*12&-1)|0;r9=(HEAPF32[tempDoublePtr>>2]=r11-r4*r3,HEAP32[tempDoublePtr>>2]);r11=(HEAPF32[tempDoublePtr>>2]=r14-r4*r20,HEAP32[tempDoublePtr>>2])|0;HEAP32[r16>>2]=0|r9;HEAP32[r16+4>>2]=r11;HEAPF32[HEAP32[r10]+(HEAP32[r8>>2]*12&-1)+8>>2]=r24-r6*r19*r17;r19=HEAP32[r10]+(HEAP32[r15]*12&-1)|0;r6=(HEAPF32[tempDoublePtr>>2]=r21+r5*r3,HEAP32[tempDoublePtr>>2]);r3=(HEAPF32[tempDoublePtr>>2]=r23+r5*r20,HEAP32[tempDoublePtr>>2])|0;HEAP32[r19>>2]=0|r6;HEAP32[r19+4>>2]=r3;HEAPF32[HEAP32[r10]+(HEAP32[r15]*12&-1)+8>>2]=r12+r7*r18*r17;return}function __ZNK12b2WheelJoint10GetAnchorAEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+48>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+76>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+80>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK12b2WheelJoint10GetAnchorBEv(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+52>>2]>>2;r4=HEAPF32[r3+6];r5=HEAPF32[r2+84>>2];r6=HEAPF32[r3+5];r7=HEAPF32[r2+88>>2];r2=r5*r6+r4*r7+HEAPF32[r3+4];HEAPF32[r1>>2]=HEAPF32[r3+3]+(r4*r5-r6*r7);HEAPF32[r1+4>>2]=r2;return}function __ZNK12b2WheelJoint16GetReactionForceEf(r1,r2,r3){var r4,r5,r6;r4=r2>>2;r2=HEAPF32[r4+27];r5=HEAPF32[r4+29];r6=(r2*HEAPF32[r4+46]+r5*HEAPF32[r4+44])*r3;HEAPF32[r1>>2]=(r2*HEAPF32[r4+45]+r5*HEAPF32[r4+43])*r3;HEAPF32[r1+4>>2]=r6;return}function __ZNK12b2WheelJoint17GetReactionTorqueEf(r1,r2){return HEAPF32[r1+112>>2]*r2}function _emscripten_bind_b2ContactManager__get_m_contactFilter_p0(r1){return HEAP32[r1+68>>2]}function _emscripten_bind_b2ContactManager__get_m_contactCount_p0(r1){return HEAP32[r1+64>>2]}function _emscripten_bind_b2ContactManager__set_m_contactFilter_p1(r1,r2){HEAP32[r1+68>>2]=r2;return}function _emscripten_bind_b2ContactManager__set_m_allocator_p1(r1,r2){HEAP32[r1+76>>2]=r2;return}function _emscripten_bind_b2ContactManager__set_m_contactCount_p1(r1,r2){HEAP32[r1+64>>2]=r2;return}function _emscripten_bind_b2ContactManager__set_m_contactList_p1(r1,r2){HEAP32[r1+60>>2]=r2;return}function _emscripten_bind_b2ContactManager__get_m_contactListener_p0(r1){return HEAP32[r1+72>>2]}function _emscripten_bind_b2ContactManager__set_m_contactListener_p1(r1,r2){HEAP32[r1+72>>2]=r2;return}function _emscripten_bind_b2ContactManager__get_m_broadPhase_p0(r1){return r1|0}function _emscripten_bind_b2ContactManager__get_m_contactList_p0(r1){return HEAP32[r1+60>>2]}function _emscripten_bind_b2ContactManager__get_m_allocator_p0(r1){return HEAP32[r1+76>>2]}function _emscripten_bind_b2DistanceJoint__GetBodyA_p0(r1){return HEAP32[r1+48>>2]}function _emscripten_bind_b2DistanceJoint__GetBodyB_p0(r1){return HEAP32[r1+52>>2]}function _emscripten_bind_b2DistanceJoint__SetFrequency_p1(r1,r2){HEAPF32[r1+68>>2]=r2;return}function _emscripten_bind_b2DistanceJoint__GetUserData_p0(r1){return HEAP32[r1+64>>2]}function _emscripten_bind_b2DistanceJoint__SetUserData_p1(r1,r2){HEAP32[r1+64>>2]=r2;return}function _emscripten_bind_b2DistanceJoint__GetNext_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2DistanceJoint__GetLocalAnchorA_p0(r1){return r1+80|0}function _emscripten_bind_b2DistanceJoint__GetLocalAnchorB_p0(r1){return r1+88|0}function _emscripten_bind_b2DistanceJoint__GetFrequency_p0(r1){return HEAPF32[r1+68>>2]}function _emscripten_bind_b2DistanceJoint__GetLength_p0(r1){return HEAPF32[r1+104>>2]}function _emscripten_bind_b2DistanceJoint__GetDampingRatio_p0(r1){return HEAPF32[r1+72>>2]}function _emscripten_bind_b2DistanceJoint__GetCollideConnected_p0(r1){return(HEAP8[r1+61|0]&1)<<24>>24!=0}function _emscripten_bind_b2DistanceJoint__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2DistanceJoint__SetDampingRatio_p1(r1,r2){HEAPF32[r1+72>>2]=r2;return}function _emscripten_bind_b2DistanceJoint__SetLength_p1(r1,r2){HEAPF32[r1+104>>2]=r2;return}function _emscripten_bind_b2DistanceJoint__IsActive_p0(r1){var r2;if((HEAP16[HEAP32[r1+48>>2]+4>>1]&32)<<16>>16==0){r2=0;return r2}r2=(HEAP16[HEAP32[r1+52>>2]+4>>1]&32)<<16>>16!=0;return r2}function _emscripten_bind_b2Fixture__GetRestitution_p0(r1){return HEAPF32[r1+20>>2]}function _emscripten_bind_b2Fixture__SetFriction_p1(r1,r2){HEAPF32[r1+16>>2]=r2;return}function _emscripten_bind_b2Fixture__GetShape_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2Fixture__SetRestitution_p1(r1,r2){HEAPF32[r1+20>>2]=r2;return}function __ZN12b2WheelJoint24SolvePositionConstraintsERK12b2SolverData(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r3=r1>>2;r4=r1+132|0;r5=HEAP32[r4>>2];r6=(r2+24|0)>>2;r2=HEAP32[r6];r7=(r2+(r5*12&-1)|0)>>2;r8=HEAP32[r7+1];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r7],HEAPF32[tempDoublePtr>>2]);r10=(HEAP32[tempDoublePtr>>2]=r8,HEAPF32[tempDoublePtr>>2]);r8=HEAPF32[r2+(r5*12&-1)+8>>2];r5=(r1+136|0)>>2;r1=HEAP32[r5];r11=r2+(r1*12&-1)|0;r12=HEAP32[r11+4>>2];r13=(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAPF32[tempDoublePtr>>2]);r11=(HEAP32[tempDoublePtr>>2]=r12,HEAPF32[tempDoublePtr>>2]);r12=HEAPF32[r2+(r1*12&-1)+8>>2];r1=Math.sin(r8);r2=Math.cos(r8);r14=Math.sin(r12);r15=Math.cos(r12);r16=HEAPF32[r3+19]-HEAPF32[r3+35];r17=HEAPF32[r3+20]-HEAPF32[r3+36];r18=r2*r16-r1*r17;r19=r1*r16+r2*r17;r17=HEAPF32[r3+21]-HEAPF32[r3+37];r16=HEAPF32[r3+22]-HEAPF32[r3+38];r20=r15*r17-r14*r16;r21=r14*r17+r15*r16;r16=r13-r9+r20-r18;r15=r11-r10+r21-r19;r17=HEAPF32[r3+25];r14=HEAPF32[r3+26];r22=r2*r17-r1*r14;r23=r1*r17+r2*r14;r14=r22*r16+r23*r15;r2=HEAPF32[r3+39];r17=HEAPF32[r3+40];r1=HEAPF32[r3+41];r24=HEAPF32[r3+49];r25=HEAPF32[r3+42];r26=HEAPF32[r3+50];r3=r2+r17+r24*r1*r24+r26*r25*r26;if(r3!=0){r27=-r14/r3}else{r27=0}r3=r22*r27;r26=r23*r27;r24=(HEAPF32[tempDoublePtr>>2]=r9-r3*r2,HEAP32[tempDoublePtr>>2]);r9=(HEAPF32[tempDoublePtr>>2]=r10-r26*r2,HEAP32[tempDoublePtr>>2])|0;HEAP32[r7]=0|r24;HEAP32[r7+1]=r9;HEAPF32[HEAP32[r6]+(HEAP32[r4>>2]*12&-1)+8>>2]=r8-(r23*(r18+r16)-r22*(r19+r15))*r27*r1;r1=HEAP32[r6]+(HEAP32[r5]*12&-1)|0;r15=(HEAPF32[tempDoublePtr>>2]=r13+r3*r17,HEAP32[tempDoublePtr>>2]);r3=(HEAPF32[tempDoublePtr>>2]=r11+r26*r17,HEAP32[tempDoublePtr>>2])|0;HEAP32[r1>>2]=0|r15;HEAP32[r1+4>>2]=r3;HEAPF32[HEAP32[r6]+(HEAP32[r5]*12&-1)+8>>2]=r12+(r20*r23-r21*r22)*r27*r25;if(r14>0){r28=r14;r29=r28<=.004999999888241291;return r29}r28=-r14;r29=r28<=.004999999888241291;return r29}function __ZN12b2WheelJoint4DumpEv(r1){var r2,r3,r4,r5;r2=r1>>2;r3=STACKTOP;r4=HEAP32[HEAP32[r2+12]+8>>2];r5=HEAP32[HEAP32[r2+13]+8>>2];__Z5b2LogPKcz(5249028,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z5b2LogPKcz(5253800,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r4,tempInt));__Z5b2LogPKcz(5251428,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r5,tempInt));__Z5b2LogPKcz(5249488,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+61|0]&1,tempInt));r5=HEAPF32[r2+20];__Z5b2LogPKcz(5248748,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+19],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r5,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r5=HEAPF32[r2+22];__Z5b2LogPKcz(5248324,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+21],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r5,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r5=HEAPF32[r2+24];__Z5b2LogPKcz(5247844,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+23],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r5,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247584,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[r1+128|0]&1,tempInt));__Z5b2LogPKcz(5247336,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+31],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5247088,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+30],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5255136,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+17],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254864,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=HEAPF32[r2+18],HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z5b2LogPKcz(5254332,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+14],tempInt));STACKTOP=r3;return}function __ZN12b2WheelJointD0Ev(r1){__ZdlPv(r1);return}function _emscripten_bind_b2ContactManager__b2ContactManager_p0(){var r1,r2;r1=__Znwj(80),r2=r1>>2;__ZN12b2BroadPhaseC2Ev(r1);HEAP32[r2+15]=0;HEAP32[r2+16]=0;HEAP32[r2+17]=5247056;HEAP32[r2+18]=5247052;HEAP32[r2+19]=0;return r1}function _emscripten_bind_b2ContactManager__AddPair_p2(r1,r2,r3){__ZN16b2ContactManager7AddPairEPvS0_(r1,r2,r3);return}function _emscripten_bind_b2ContactManager__Collide_p0(r1){__ZN16b2ContactManager7CollideEv(r1);return}function _emscripten_bind_b2ContactManager__FindNewContacts_p0(r1){__ZN12b2BroadPhase11UpdatePairsI16b2ContactManagerEEvPT_(r1|0,r1);return}function _emscripten_bind_b2ContactManager____destroy___p0(r1){if((r1|0)==0){return}_free(HEAP32[r1+32>>2]);_free(HEAP32[r1+44>>2]);_free(HEAP32[r1+4>>2]);__ZdlPv(r1);return}function _emscripten_bind_b2ContactManager__Destroy_p1(r1,r2){__ZN16b2ContactManager7DestroyEP9b2Contact(r1,r2);return}function _emscripten_bind_b2ContactManager__set_m_broadPhase_p1(r1,r2){_memcpy(r1,r2,60);return}function _emscripten_bind_b2DistanceJoint__GetAnchorB_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264716]<<24>>24==0){if((___cxa_guard_acquire(5264716)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243276;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243276}function _emscripten_bind_b2DistanceJoint__GetAnchorA_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264724]<<24>>24==0){if((___cxa_guard_acquire(5264724)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243268;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243268}function _emscripten_bind_b2DistanceJoint__GetReactionForce_p1(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;do{if(HEAP8[5264596]<<24>>24==0){if((___cxa_guard_acquire(5264596)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r4,r1,r2);r2=r4;r4=HEAP32[r2+4>>2];r1=5243180;HEAP32[r1>>2]=HEAP32[r2>>2];HEAP32[r1+4>>2]=r4;STACKTOP=r3;return 5243180}function _emscripten_bind_b2DistanceJoint____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);return}function _emscripten_bind_b2DistanceJoint__Dump_p0(r1){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1);return}function _emscripten_bind_b2DistanceJoint__GetReactionTorque_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1,r2)}function _emscripten_bind_b2Fixture__SetFilterData_p1(r1,r2){var r3,r4;r3=(r1+32|0)>>1;r4=r2>>1;HEAP16[r3]=HEAP16[r4];HEAP16[r3+1]=HEAP16[r4+1];HEAP16[r3+2]=HEAP16[r4+2];__ZN9b2Fixture8RefilterEv(r1);return}function _emscripten_bind_b2Fixture__b2Fixture_p0(){var r1;r1=__Znwj(44);HEAP16[r1+32>>1]=1;HEAP16[r1+34>>1]=-1;HEAP16[r1+36>>1]=0;HEAP32[r1+40>>2]=0;HEAP32[r1+24>>2]=0;HEAP32[r1+28>>2]=0;HEAP32[r1>>2]=0;HEAP32[r1+4>>2]=0;HEAP32[r1+8>>2]=0;HEAP32[r1+12>>2]=0;return r1}function _emscripten_bind_b2DistanceJoint__b2DistanceJoint_p1(r1){var r2,r3,r4,r5,r6,r7;r2=r1>>2;r3=__Znwj(176),r4=r3>>2;r5=r3;HEAP32[r5>>2]=5261468;r6=HEAP32[r2+2];r7=HEAP32[r2+3];if((r6|0)!=(r7|0)){HEAP32[r4+1]=HEAP32[r2];HEAP32[r4+2]=0;HEAP32[r4+3]=0;HEAP32[r4+12]=r6;HEAP32[r4+13]=r7;HEAP32[r4+14]=0;HEAP8[r3+61|0]=HEAP8[r1+16|0]&1;HEAP8[r3+60|0]=0;HEAP32[r4+16]=HEAP32[r2+1];_memset(r3+16|0,0,32);HEAP32[r5>>2]=5261976;r5=r1+20|0;r7=r3+80|0;r6=HEAP32[r5+4>>2];HEAP32[r7>>2]=HEAP32[r5>>2];HEAP32[r7+4>>2]=r6;r6=r1+28|0;r1=r3+88|0;r7=HEAP32[r6+4>>2];HEAP32[r1>>2]=HEAP32[r6>>2];HEAP32[r1+4>>2]=r7;HEAPF32[r4+26]=HEAPF32[r2+9];HEAPF32[r4+17]=HEAPF32[r2+10];HEAPF32[r4+18]=HEAPF32[r2+11];HEAPF32[r4+25]=0;HEAPF32[r4+24]=0;HEAPF32[r4+19]=0;return r3}___assert_func(5249968,173,5258024,5251672)}function _emscripten_bind_b2Fixture__GetBody_p0(r1){return HEAP32[r1+8>>2]}function _emscripten_bind_b2Fixture__GetNext_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2Fixture__GetFriction_p0(r1){return HEAPF32[r1+16>>2]}function _emscripten_bind_b2Fixture__GetUserData_p0(r1){return HEAP32[r1+40>>2]}function _emscripten_bind_b2Fixture__SetDensity_p1(r1,r2){HEAPF32[r1>>2]=r2;return}function _emscripten_bind_b2Fixture__SetSensor_p1(r1,r2){var r3,r4,r5;r3=r1+38|0;if((r2&1|0)==(HEAP8[r3]&1|0)){return}r4=HEAP32[r1+8>>2];r1=r4+4|0;r5=HEAP16[r1>>1];if((r5&2)<<16>>16==0){HEAP16[r1>>1]=r5|2;HEAPF32[r4+144>>2]=0}HEAP8[r3]=r2&1;return}function _emscripten_bind_b2Fixture__GetAABB_p1(r1,r2){return HEAP32[r1+24>>2]+(r2*28&-1)|0}function _emscripten_bind_b2Fixture__SetUserData_p1(r1,r2){HEAP32[r1+40>>2]=r2;return}function _emscripten_bind_b2Fixture__GetFilterData_p0(r1){return r1+32|0}function _emscripten_bind_b2Fixture__IsSensor_p0(r1){return(HEAP8[r1+38|0]&1)<<24>>24!=0}function _emscripten_bind_b2Fixture__GetType_p0(r1){return HEAP32[HEAP32[r1+12>>2]+4>>2]}function _emscripten_bind_b2Fixture__GetDensity_p0(r1){return HEAPF32[r1>>2]}function _emscripten_bind_b2MouseJoint__GetBodyA_p0(r1){return HEAP32[r1+48>>2]}function _emscripten_bind_b2MouseJoint__GetBodyB_p0(r1){return HEAP32[r1+52>>2]}function _emscripten_bind_b2MouseJoint__SetFrequency_p1(r1,r2){HEAPF32[r1+84>>2]=r2;return}function _emscripten_bind_b2MouseJoint__GetUserData_p0(r1){return HEAP32[r1+64>>2]}function _emscripten_bind_b2MouseJoint__SetMaxForce_p1(r1,r2){HEAPF32[r1+104>>2]=r2;return}function _emscripten_bind_b2MouseJoint__SetUserData_p1(r1,r2){HEAP32[r1+64>>2]=r2;return}function _emscripten_bind_b2MouseJoint__GetNext_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2MouseJoint__GetMaxForce_p0(r1){return HEAPF32[r1+104>>2]}function _emscripten_bind_b2MouseJoint__GetTarget_p0(r1){return r1+76|0}function _emscripten_bind_b2MouseJoint__GetFrequency_p0(r1){return HEAPF32[r1+84>>2]}function _emscripten_bind_b2MouseJoint__GetDampingRatio_p0(r1){return HEAPF32[r1+88>>2]}function _emscripten_bind_b2MouseJoint__GetCollideConnected_p0(r1){return(HEAP8[r1+61|0]&1)<<24>>24!=0}function _emscripten_bind_b2MouseJoint__SetTarget_p1(r1,r2){var r3,r4,r5;r3=HEAP32[r1+52>>2];r4=r3+4|0;r5=HEAP16[r4>>1];if((r5&2)<<16>>16==0){HEAP16[r4>>1]=r5|2;HEAPF32[r3+144>>2]=0}r3=r2;r2=r1+76|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2MouseJoint__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2MouseJoint__SetDampingRatio_p1(r1,r2){HEAPF32[r1+88>>2]=r2;return}function _emscripten_bind_b2MouseJoint__IsActive_p0(r1){var r2;if((HEAP16[HEAP32[r1+48>>2]+4>>1]&32)<<16>>16==0){r2=0;return r2}r2=(HEAP16[HEAP32[r1+52>>2]+4>>1]&32)<<16>>16!=0;return r2}function _emscripten_bind_b2PulleyJoint__GetBodyA_p0(r1){return HEAP32[r1+48>>2]}function _emscripten_bind_b2PulleyJoint__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2PulleyJoint__GetUserData_p0(r1){return HEAP32[r1+64>>2]}function _emscripten_bind_b2PulleyJoint__GetBodyB_p0(r1){return HEAP32[r1+52>>2]}function _emscripten_bind_b2PulleyJoint__GetCollideConnected_p0(r1){return(HEAP8[r1+61|0]&1)<<24>>24!=0}function _emscripten_bind_b2PulleyJoint__SetUserData_p1(r1,r2){HEAP32[r1+64>>2]=r2;return}function _emscripten_bind_b2PulleyJoint__GetNext_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2PulleyJoint__IsActive_p0(r1){var r2;if((HEAP16[HEAP32[r1+48>>2]+4>>1]&32)<<16>>16==0){r2=0;return r2}r2=(HEAP16[HEAP32[r1+52>>2]+4>>1]&32)<<16>>16!=0;return r2}function _emscripten_bind_b2PulleyJoint__GetRatio_p0(r1){return HEAPF32[r1+112>>2]}function _emscripten_bind_b2BroadPhase__GetTreeQuality_p0(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=HEAP32[r1>>2];if((r2|0)==-1){r3=0;return r3}r4=HEAP32[r1+4>>2]>>2;r5=(HEAPF32[((r2*36&-1)+8>>2)+r4]-HEAPF32[((r2*36&-1)>>2)+r4]+(HEAPF32[((r2*36&-1)+12>>2)+r4]-HEAPF32[((r2*36&-1)+4>>2)+r4]))*2;r2=HEAP32[r1+12>>2];L4066:do{if((r2|0)>0){r1=0;r6=0;while(1){if((HEAP32[((r6*36&-1)+32>>2)+r4]|0)<0){r7=r1}else{r7=r1+(HEAPF32[((r6*36&-1)+8>>2)+r4]-HEAPF32[((r6*36&-1)>>2)+r4]+(HEAPF32[((r6*36&-1)+12>>2)+r4]-HEAPF32[((r6*36&-1)+4>>2)+r4]))*2}r8=r6+1|0;if((r8|0)==(r2|0)){r9=r7;break L4066}else{r1=r7;r6=r8}}}else{r9=0}}while(0);r3=r9/r5;return r3}function _emscripten_bind_b2BroadPhase__GetTreeHeight_p0(r1){var r2,r3;r2=HEAP32[r1>>2];if((r2|0)==-1){r3=0;return r3}r3=HEAP32[HEAP32[r1+4>>2]+(r2*36&-1)+32>>2];return r3}function _emscripten_bind_b2BroadPhase__GetProxyCount_p0(r1){return HEAP32[r1+28>>2]}function _emscripten_bind_b2Fixture__GetMassData_p1(r1,r2){var r3;r3=HEAP32[r1+12>>2];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+28>>2]](r3,r2,HEAPF32[r1>>2]);return}function _emscripten_bind_b2Fixture__TestPoint_p1(r1,r2){var r3;r3=HEAP32[r1+12>>2];return FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+16>>2]](r3,HEAP32[r1+8>>2]+12|0,r2)}function _emscripten_bind_b2Fixture____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2Fixture__RayCast_p3(r1,r2,r3,r4){var r5;r5=HEAP32[r1+12>>2];return FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+20>>2]](r5,r2,r3,HEAP32[r1+8>>2]+12|0,r4)}function _emscripten_bind_b2Fixture__Refilter_p0(r1){__ZN9b2Fixture8RefilterEv(r1);return}function _emscripten_bind_b2Fixture__Dump_p1(r1,r2){__ZN9b2Fixture4DumpEi(r1,r2);return}function _emscripten_bind_b2MouseJoint__GetAnchorB_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264780]<<24>>24==0){if((___cxa_guard_acquire(5264780)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243092;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243092}function _emscripten_bind_b2MouseJoint__GetAnchorA_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264788]<<24>>24==0){if((___cxa_guard_acquire(5264788)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243004;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243004}function _emscripten_bind_b2MouseJoint__b2MouseJoint_p1(r1){var r2;r2=__Znwj(168);__ZN12b2MouseJointC2EPK15b2MouseJointDef(r2,r1);return r2}function _emscripten_bind_b2MouseJoint__GetReactionForce_p1(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;do{if(HEAP8[5264636]<<24>>24==0){if((___cxa_guard_acquire(5264636)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r4,r1,r2);r2=r4;r4=HEAP32[r2+4>>2];r1=5242912;HEAP32[r1>>2]=HEAP32[r2>>2];HEAP32[r1+4>>2]=r4;STACKTOP=r3;return 5242912}function _emscripten_bind_b2MouseJoint____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);return}function _emscripten_bind_b2MouseJoint__Dump_p0(r1){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1);return}function _emscripten_bind_b2MouseJoint__GetReactionTorque_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1,r2)}function _emscripten_bind_b2PulleyJoint____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);return}function _emscripten_bind_b2PulleyJoint__GetAnchorA_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264740]<<24>>24==0){if((___cxa_guard_acquire(5264740)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5242904;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5242904}function _emscripten_bind_b2PulleyJoint__GetGroundAnchorB_p0(r1){var r2,r3;do{if(HEAP8[5264612]<<24>>24==0){if((___cxa_guard_acquire(5264612)|0)==0){break}}}while(0);r2=r1+76|0;r1=HEAP32[r2+4>>2];r3=5242896;HEAP32[r3>>2]=HEAP32[r2>>2];HEAP32[r3+4>>2]=r1;return 5242896}function _emscripten_bind_b2PulleyJoint__GetReactionTorque_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1,r2)}function _emscripten_bind_b2PulleyJoint__Dump_p0(r1){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1);return}function _emscripten_bind_b2PulleyJoint__GetGroundAnchorA_p0(r1){var r2,r3;do{if(HEAP8[5264620]<<24>>24==0){if((___cxa_guard_acquire(5264620)|0)==0){break}}}while(0);r2=r1+68|0;r1=HEAP32[r2+4>>2];r3=5242888;HEAP32[r3>>2]=HEAP32[r2>>2];HEAP32[r3+4>>2]=r1;return 5242888}function _emscripten_bind_b2PulleyJoint__GetLengthB_p0(r1){var r2,r3,r4,r5,r6,r7,r8;r2=HEAP32[r1+52>>2]>>2;r3=HEAPF32[r2+6];r4=HEAPF32[r1+100>>2];r5=HEAPF32[r2+5];r6=HEAPF32[r1+104>>2];r7=HEAPF32[r2+3]+(r3*r4-r5*r6);r8=r4*r5+r3*r6+HEAPF32[r2+4];r2=r1+76|0;r1=HEAP32[r2+4>>2];r6=r7-(HEAP32[tempDoublePtr>>2]=HEAP32[r2>>2],HEAPF32[tempDoublePtr>>2]);r2=r8-(HEAP32[tempDoublePtr>>2]=r1,HEAPF32[tempDoublePtr>>2]);return Math.sqrt(r6*r6+r2*r2)}function _emscripten_bind_b2PulleyJoint__GetLengthA_p0(r1){var r2,r3,r4,r5,r6,r7,r8;r2=HEAP32[r1+48>>2]>>2;r3=HEAPF32[r2+6];r4=HEAPF32[r1+92>>2];r5=HEAPF32[r2+5];r6=HEAPF32[r1+96>>2];r7=HEAPF32[r2+3]+(r3*r4-r5*r6);r8=r4*r5+r3*r6+HEAPF32[r2+4];r2=r1+68|0;r1=HEAP32[r2+4>>2];r6=r7-(HEAP32[tempDoublePtr>>2]=HEAP32[r2>>2],HEAPF32[tempDoublePtr>>2]);r2=r8-(HEAP32[tempDoublePtr>>2]=r1,HEAPF32[tempDoublePtr>>2]);return Math.sqrt(r6*r6+r2*r2)}function _emscripten_bind_b2PulleyJoint__GetAnchorB_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264732]<<24>>24==0){if((___cxa_guard_acquire(5264732)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5242880;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5242880}function _emscripten_bind_b2PulleyJoint__GetReactionForce_p1(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;do{if(HEAP8[5264604]<<24>>24==0){if((___cxa_guard_acquire(5264604)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r4,r1,r2);r2=r4;r4=HEAP32[r2+4>>2];r1=5243260;HEAP32[r1>>2]=HEAP32[r2>>2];HEAP32[r1+4>>2]=r4;STACKTOP=r3;return 5243260}function _emscripten_bind_b2PulleyJoint__b2PulleyJoint_p1(r1){var r2;r2=__Znwj(196);__ZN13b2PulleyJointC2EPK16b2PulleyJointDef(r2,r1);return r2}function _emscripten_bind_b2BroadPhase____destroy___p0(r1){if((r1|0)==0){return}_free(HEAP32[r1+32>>2]);_free(HEAP32[r1+44>>2]);_free(HEAP32[r1+4>>2]);__ZdlPv(r1);return}function _emscripten_bind_b2BroadPhase__b2BroadPhase_p0(){var r1;r1=__Znwj(60);__ZN12b2BroadPhaseC2Ev(r1);return r1}function _emscripten_bind_b2BroadPhase__GetFatAABB_p1(r1,r2){do{if((r2|0)>-1){if((HEAP32[r1+12>>2]|0)<=(r2|0)){break}return HEAP32[r1+4>>2]+(r2*36&-1)|0}}while(0);___assert_func(5252876,159,5256772,5252452)}function _emscripten_bind_b2BroadPhase__GetUserData_p1(r1,r2){do{if((r2|0)>-1){if((HEAP32[r1+12>>2]|0)<=(r2|0)){break}return HEAP32[HEAP32[r1+4>>2]+(r2*36&-1)+16>>2]}}while(0);___assert_func(5252876,153,5256724,5252452)}function _emscripten_bind_b2BroadPhase__GetTreeBalance_p0(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=0;r3=HEAP32[r1+12>>2];if((r3|0)<=0){r4=0;return r4}r5=HEAP32[r1+4>>2]>>2;r1=0;r6=0;while(1){if((HEAP32[((r1*36&-1)+32>>2)+r5]|0)<2){r7=r6}else{r8=HEAP32[((r1*36&-1)+24>>2)+r5];if((r8|0)==-1){r2=3286;break}r9=HEAP32[((HEAP32[((r1*36&-1)+28>>2)+r5]*36&-1)+32>>2)+r5]-HEAP32[((r8*36&-1)+32>>2)+r5]|0;r8=(r9|0)>0?r9:-r9|0;r7=(r6|0)>(r8|0)?r6:r8}r8=r1+1|0;if((r8|0)<(r3|0)){r1=r8;r6=r7}else{r4=r7;r2=3291;break}}if(r2==3291){return r4}else if(r2==3286){___assert_func(5253852,686,5256632,5250052)}}function _emscripten_bind_b2BroadPhase__TestOverlap_p2(r1,r2,r3){var r4,r5;if((r2|0)<=-1){___assert_func(5252876,159,5256772,5252452)}r4=HEAP32[r1+12>>2];if((r4|0)<=(r2|0)){___assert_func(5252876,159,5256772,5252452)}r5=HEAP32[r1+4>>2]>>2;if((r3|0)>-1&(r4|0)>(r3|0)){return(HEAPF32[((r3*36&-1)>>2)+r5]-HEAPF32[((r2*36&-1)+8>>2)+r5]>0|HEAPF32[((r3*36&-1)+4>>2)+r5]-HEAPF32[((r2*36&-1)+12>>2)+r5]>0|HEAPF32[((r2*36&-1)>>2)+r5]-HEAPF32[((r3*36&-1)+8>>2)+r5]>0|HEAPF32[((r2*36&-1)+4>>2)+r5]-HEAPF32[((r3*36&-1)+12>>2)+r5]>0)^1}else{___assert_func(5252876,159,5256772,5252452)}}function _emscripten_bind_b2World__SetSubStepping_p1(r1,r2){HEAP8[r1+102994|0]=r2&1;return}function _emscripten_bind_b2World__GetTreeQuality_p0(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=HEAP32[r1+102872>>2];if((r2|0)==-1){r3=0;return r3}r4=HEAP32[r1+102876>>2]>>2;r5=(HEAPF32[((r2*36&-1)+8>>2)+r4]-HEAPF32[((r2*36&-1)>>2)+r4]+(HEAPF32[((r2*36&-1)+12>>2)+r4]-HEAPF32[((r2*36&-1)+4>>2)+r4]))*2;r2=HEAP32[r1+102884>>2];L4194:do{if((r2|0)>0){r1=0;r6=0;while(1){if((HEAP32[((r6*36&-1)+32>>2)+r4]|0)<0){r7=r1}else{r7=r1+(HEAPF32[((r6*36&-1)+8>>2)+r4]-HEAPF32[((r6*36&-1)>>2)+r4]+(HEAPF32[((r6*36&-1)+12>>2)+r4]-HEAPF32[((r6*36&-1)+4>>2)+r4]))*2}r8=r6+1|0;if((r8|0)==(r2|0)){r9=r7;break L4194}else{r1=r7;r6=r8}}}else{r9=0}}while(0);r3=r9/r5;return r3}function _emscripten_bind_b2World__GetTreeHeight_p0(r1){var r2,r3;r2=HEAP32[r1+102872>>2];if((r2|0)==-1){r3=0;return r3}r3=HEAP32[HEAP32[r1+102876>>2]+(r2*36&-1)+32>>2];return r3}function _emscripten_bind_b2World__GetProfile_p0(r1){return r1+102996|0}function _emscripten_bind_b2World__GetSubStepping_p0(r1){return(HEAP8[r1+102994|0]&1)<<24>>24!=0}function _emscripten_bind_b2World__GetContactManager_p0(r1){return r1+102872|0}function _emscripten_bind_b2World__SetContactListener_p1(r1,r2){HEAP32[r1+102944>>2]=r2;return}function _emscripten_bind_b2World__SetContinuousPhysics_p1(r1,r2){HEAP8[r1+102993|0]=r2&1;return}function _emscripten_bind_b2World__SetGravity_p1(r1,r2){var r3;r3=r2;r2=r1+102968|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2World__GetBodyCount_p0(r1){return HEAP32[r1+102960>>2]}function _emscripten_bind_b2World__GetAutoClearForces_p0(r1){return(HEAP32[r1+102868>>2]&4|0)!=0}function _emscripten_bind_b2World__GetContinuousPhysics_p0(r1){return(HEAP8[r1+102993|0]&1)<<24>>24!=0}function _emscripten_bind_b2World__GetJointList_p0(r1){return HEAP32[r1+102956>>2]}function _emscripten_bind_b2World__GetBodyList_p0(r1){return HEAP32[r1+102952>>2]}function _emscripten_bind_b2World__SetDestructionListener_p1(r1,r2){HEAP32[r1+102980>>2]=r2;return}function _emscripten_bind_b2World__GetJointCount_p0(r1){return HEAP32[r1+102964>>2]}function _emscripten_bind_b2World__ClearForces_p0(r1){var r2,r3,r4;r2=HEAP32[r1+102952>>2];if((r2|0)==0){return}else{r3=r2,r4=r3>>2}while(1){HEAPF32[r4+19]=0;HEAPF32[r4+20]=0;HEAPF32[r4+21]=0;r2=HEAP32[r4+24];if((r2|0)==0){break}else{r3=r2,r4=r3>>2}}return}function _emscripten_bind_b2World__GetWarmStarting_p0(r1){return(HEAP8[r1+102992|0]&1)<<24>>24!=0}function _emscripten_bind_b2World__SetAllowSleeping_p1(r1,r2){var r3,r4;r3=r1+102976|0;if((r2&1|0)==(HEAP8[r3]&1|0)){return}HEAP8[r3]=r2&1;if(r2){return}r2=HEAP32[r1+102952>>2];if((r2|0)==0){return}else{r4=r2}while(1){r2=r4+4|0;r1=HEAP16[r2>>1];if((r1&2)<<16>>16==0){HEAP16[r2>>1]=r1|2;HEAPF32[r4+144>>2]=0}r1=HEAP32[r4+96>>2];if((r1|0)==0){break}else{r4=r1}}return}function _emscripten_bind_b2World__GetAllowSleeping_p0(r1){return(HEAP8[r1+102976|0]&1)<<24>>24!=0}function _emscripten_bind_b2World__GetProxyCount_p0(r1){return HEAP32[r1+102900>>2]}function _emscripten_bind_b2World__IsLocked_p0(r1){return(HEAP32[r1+102868>>2]&2|0)!=0}function _emscripten_bind_b2World__GetContactList_p0(r1){return HEAP32[r1+102932>>2]}function _emscripten_bind_b2World__SetDebugDraw_p1(r1,r2){HEAP32[r1+102984>>2]=r2;return}function _emscripten_bind_b2World__SetAutoClearForces_p1(r1,r2){var r3;r3=r1+102868|0;r1=HEAP32[r3>>2];HEAP32[r3>>2]=r2?r1|4:r1&-5;return}function _emscripten_bind_b2World__GetContactCount_p0(r1){return HEAP32[r1+102936>>2]}function _emscripten_bind_b2World__SetWarmStarting_p1(r1,r2){HEAP8[r1+102992|0]=r2&1;return}function _emscripten_bind_b2World__SetContactFilter_p1(r1,r2){HEAP32[r1+102940>>2]=r2;return}function _emscripten_bind_b2PrismaticJoint__GetBodyA_p0(r1){return HEAP32[r1+48>>2]}function _emscripten_bind_b2PrismaticJoint__GetBodyB_p0(r1){return HEAP32[r1+52>>2]}function _emscripten_bind_b2PrismaticJoint__GetUserData_p0(r1){return HEAP32[r1+64>>2]}function _emscripten_bind_b2PrismaticJoint__GetLocalAxisA_p0(r1){return r1+84|0}function _emscripten_bind_b2PrismaticJoint__GetLowerLimit_p0(r1){return HEAPF32[r1+120>>2]}function _emscripten_bind_b2PrismaticJoint__GetNext_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2PrismaticJoint__GetLocalAnchorA_p0(r1){return r1+68|0}function _emscripten_bind_b2PrismaticJoint__SetMotorSpeed_p1(r1,r2){var r3,r4,r5,r6;r3=HEAP32[r1+48>>2];r4=r3+4|0;r5=HEAP16[r4>>1];if((r5&2)<<16>>16==0){HEAP16[r4>>1]=r5|2;HEAPF32[r3+144>>2]=0}r3=HEAP32[r1+52>>2];r5=r3+4|0;r4=HEAP16[r5>>1];if((r4&2)<<16>>16!=0){r6=r1+132|0;HEAPF32[r6>>2]=r2;return}HEAP16[r5>>1]=r4|2;HEAPF32[r3+144>>2]=0;r6=r1+132|0;HEAPF32[r6>>2]=r2;return}function _emscripten_bind_b2PrismaticJoint__GetLocalAnchorB_p0(r1){return r1+76|0}function _emscripten_bind_b2PrismaticJoint__GetMotorSpeed_p0(r1){return HEAPF32[r1+132>>2]}function _emscripten_bind_b2PrismaticJoint__SetMaxMotorForce_p1(r1,r2){var r3,r4,r5,r6;r3=HEAP32[r1+48>>2];r4=r3+4|0;r5=HEAP16[r4>>1];if((r5&2)<<16>>16==0){HEAP16[r4>>1]=r5|2;HEAPF32[r3+144>>2]=0}r3=HEAP32[r1+52>>2];r5=r3+4|0;r4=HEAP16[r5>>1];if((r4&2)<<16>>16!=0){r6=r1+128|0;HEAPF32[r6>>2]=r2;return}HEAP16[r5>>1]=r4|2;HEAPF32[r3+144>>2]=0;r6=r1+128|0;HEAPF32[r6>>2]=r2;return}function _emscripten_bind_b2PrismaticJoint__EnableLimit_p1(r1,r2){var r3,r4,r5,r6;r3=r1+136|0;if((r2&1|0)==(HEAP8[r3]&1|0)){return}r4=HEAP32[r1+48>>2];r5=r4+4|0;r6=HEAP16[r5>>1];if((r6&2)<<16>>16==0){HEAP16[r5>>1]=r6|2;HEAPF32[r4+144>>2]=0}r4=HEAP32[r1+52>>2];r6=r4+4|0;r5=HEAP16[r6>>1];if((r5&2)<<16>>16==0){HEAP16[r6>>1]=r5|2;HEAPF32[r4+144>>2]=0}HEAP8[r3]=r2&1;HEAPF32[r1+112>>2]=0;return}function _emscripten_bind_b2PrismaticJoint__IsMotorEnabled_p0(r1){return(HEAP8[r1+137|0]&1)<<24>>24!=0}function _emscripten_bind_b2PrismaticJoint__SetUserData_p1(r1,r2){HEAP32[r1+64>>2]=r2;return}function _emscripten_bind_b2PrismaticJoint__GetMaxMotorForce_p0(r1){return HEAPF32[r1+128>>2]}function _emscripten_bind_b2PrismaticJoint__GetCollideConnected_p0(r1){return(HEAP8[r1+61|0]&1)<<24>>24!=0}function _emscripten_bind_b2PrismaticJoint__GetJointSpeed_p0(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r2=r1>>2;r1=HEAP32[r2+12],r3=r1>>2;r4=HEAP32[r2+13],r5=r4>>2;r6=HEAPF32[r2+17]-HEAPF32[r3+7];r7=HEAPF32[r2+18]-HEAPF32[r3+8];r8=HEAPF32[r3+6];r9=HEAPF32[r3+5];r10=r6*r8-r7*r9;r11=r8*r7+r6*r9;r6=HEAPF32[r2+19]-HEAPF32[r5+7];r7=HEAPF32[r2+20]-HEAPF32[r5+8];r12=HEAPF32[r5+6];r13=HEAPF32[r5+5];r14=r6*r12-r7*r13;r15=r12*r7+r6*r13;r13=r14+HEAPF32[r5+11]-(r10+HEAPF32[r3+11]);r6=r15+HEAPF32[r5+12]-(r11+HEAPF32[r3+12]);r7=HEAPF32[r2+21];r12=HEAPF32[r2+22];r2=r8*r7-r9*r12;r16=r9*r7+r8*r12;r12=r1+64|0;r1=HEAP32[r12+4>>2];r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAPF32[tempDoublePtr>>2]);r12=(HEAP32[tempDoublePtr>>2]=r1,HEAPF32[tempDoublePtr>>2]);r1=r4+64|0;r4=HEAP32[r1+4>>2];r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r1>>2],HEAPF32[tempDoublePtr>>2]);r1=HEAPF32[r3+18];r3=HEAPF32[r5+18];r5=-r1;return r6*r2*r1+r13*r16*r5+r16*((HEAP32[tempDoublePtr>>2]=r4,HEAPF32[tempDoublePtr>>2])+r14*r3-r12-r10*r1)+r2*(r7+r15*-r3-r8-r11*r5)}function _emscripten_bind_b2BroadPhase__TouchProxy_p1(r1,r2){var r3,r4,r5,r6,r7,r8;r3=(r1+40|0)>>2;r4=HEAP32[r3];r5=r1+36|0;r6=(r1+32|0)>>2;if((r4|0)==(HEAP32[r5>>2]|0)){r1=HEAP32[r6];HEAP32[r5>>2]=r4<<1;r5=_malloc(r4<<3);HEAP32[r6]=r5;r7=r1;_memcpy(r5,r7,HEAP32[r3]<<2);_free(r7);r8=HEAP32[r3]}else{r8=r4}HEAP32[HEAP32[r6]+(r8<<2)>>2]=r2;HEAP32[r3]=HEAP32[r3]+1|0;return}function _emscripten_bind_b2BroadPhase__CreateProxy_p2(r1,r2,r3){return __ZN12b2BroadPhase11CreateProxyERK6b2AABBPv(r1,r2,r3)}function _emscripten_bind_b2BroadPhase__MoveProxy_p3(r1,r2,r3,r4){var r5,r6,r7,r8;if(!__ZN13b2DynamicTree9MoveProxyEiRK6b2AABBRK6b2Vec2(r1|0,r2,r3,r4)){return}r4=(r1+40|0)>>2;r3=HEAP32[r4];r5=r1+36|0;r6=(r1+32|0)>>2;if((r3|0)==(HEAP32[r5>>2]|0)){r1=HEAP32[r6];HEAP32[r5>>2]=r3<<1;r5=_malloc(r3<<3);HEAP32[r6]=r5;r7=r1;_memcpy(r5,r7,HEAP32[r4]<<2);_free(r7);r8=HEAP32[r4]}else{r8=r3}HEAP32[HEAP32[r6]+(r8<<2)>>2]=r2;HEAP32[r4]=HEAP32[r4]+1|0;return}function _emscripten_bind_b2BroadPhase__DestroyProxy_p1(r1,r2){var r3,r4,r5,r6,r7;r3=0;r4=HEAP32[r1+40>>2];r5=r1+32|0;r6=0;while(1){if((r6|0)>=(r4|0)){break}r7=(r6<<2)+HEAP32[r5>>2]|0;if((HEAP32[r7>>2]|0)==(r2|0)){r3=3405;break}else{r6=r6+1|0}}if(r3==3405){HEAP32[r7>>2]=-1}r7=r1+28|0;HEAP32[r7>>2]=HEAP32[r7>>2]-1|0;__ZN13b2DynamicTree12DestroyProxyEi(r1|0,r2);return}function _emscripten_bind_b2World__QueryAABB_p2(r1,r2,r3){var r4,r5,r6;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;r6=r1+102872|0;HEAP32[r5>>2]=r6;HEAP32[r5+4>>2]=r2;__ZNK13b2DynamicTree5QueryI19b2WorldQueryWrapperEEvPT_RK6b2AABB(r6|0,r5,r3);STACKTOP=r4;return}function _emscripten_bind_b2World__DrawDebugData_p0(r1){__ZN7b2World13DrawDebugDataEv(r1);return}function _emscripten_bind_b2World__DestroyJoint_p1(r1,r2){__ZN7b2World12DestroyJointEP7b2Joint(r1,r2);return}function _emscripten_bind_b2World__b2World_p1(r1){var r2;r2=__Znwj(103028);__ZN7b2WorldC2ERK6b2Vec2(r2,r1);return r2}function _emscripten_bind_b2World__Step_p3(r1,r2,r3,r4){__ZN7b2World4StepEfii(r1,r2,r3,r4);return}function _emscripten_bind_b2World__DestroyBody_p1(r1,r2){__ZN7b2World11DestroyBodyEP6b2Body(r1,r2);return}function _emscripten_bind_b2World__CreateJoint_p1(r1,r2){return __ZN7b2World11CreateJointEPK10b2JointDef(r1,r2)}function _emscripten_bind_b2World__RayCast_p3(r1,r2,r3,r4){var r5,r6,r7,r8;r5=STACKTOP;STACKTOP=STACKTOP+28|0;r6=r5;r7=r5+8;r8=r1+102872|0;HEAP32[r6>>2]=r8;HEAP32[r6+4>>2]=r2;HEAPF32[r7+16>>2]=1;r2=r3;r3=r7;r1=HEAP32[r2+4>>2];HEAP32[r3>>2]=HEAP32[r2>>2];HEAP32[r3+4>>2]=r1;r1=r4;r4=r7+8|0;r3=HEAP32[r1+4>>2];HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;__ZNK13b2DynamicTree7RayCastI21b2WorldRayCastWrapperEEvPT_RK14b2RayCastInput(r8|0,r6,r7);STACKTOP=r5;return}function _emscripten_bind_b2World____destroy___p0(r1){if((r1|0)==0){return}__ZN7b2WorldD2Ev(r1);__ZdlPv(r1);return}function _emscripten_bind_b2World__Dump_p0(r1){__ZN7b2World4DumpEv(r1);return}function _emscripten_bind_b2World__GetGravity_p0(r1){var r2,r3;do{if(HEAP8[5264876]<<24>>24==0){if((___cxa_guard_acquire(5264876)|0)==0){break}}}while(0);r2=r1+102968|0;r1=HEAP32[r2+4>>2];r3=5243252;HEAP32[r3>>2]=HEAP32[r2>>2];HEAP32[r3+4>>2]=r1;return 5243252}function _emscripten_bind_b2PrismaticJoint__GetAnchorA_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264676]<<24>>24==0){if((___cxa_guard_acquire(5264676)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243244;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243244}function _emscripten_bind_b2PrismaticJoint__b2PrismaticJoint_p1(r1){var r2;r2=__Znwj(256);__ZN16b2PrismaticJointC2EPK19b2PrismaticJointDef(r2,r1);return r2}function _emscripten_bind_b2PrismaticJoint__GetReactionForce_p1(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;do{if(HEAP8[5264572]<<24>>24==0){if((___cxa_guard_acquire(5264572)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r4,r1,r2);r2=r4;r4=HEAP32[r2+4>>2];r1=5243236;HEAP32[r1>>2]=HEAP32[r2>>2];HEAP32[r1+4>>2]=r4;STACKTOP=r3;return 5243236}function _emscripten_bind_b2World__GetTreeBalance_p0(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=0;r3=HEAP32[r1+102884>>2];if((r3|0)<=0){r4=0;return r4}r5=HEAP32[r1+102876>>2]>>2;r1=0;r6=0;while(1){if((HEAP32[((r1*36&-1)+32>>2)+r5]|0)<2){r7=r6}else{r8=HEAP32[((r1*36&-1)+24>>2)+r5];if((r8|0)==-1){r2=3444;break}r9=HEAP32[((HEAP32[((r1*36&-1)+28>>2)+r5]*36&-1)+32>>2)+r5]-HEAP32[((r8*36&-1)+32>>2)+r5]|0;r8=(r9|0)>0?r9:-r9|0;r7=(r6|0)>(r8|0)?r6:r8}r8=r1+1|0;if((r8|0)<(r3|0)){r1=r8;r6=r7}else{r4=r7;r2=3449;break}}if(r2==3444){___assert_func(5253852,686,5256632,5250052)}else if(r2==3449){return r4}}function _emscripten_bind_b2World__CreateBody_p1(r1,r2){var r3,r4,r5,r6,r7,r8,r9;if((HEAP32[r1+102868>>2]&2|0)!=0){___assert_func(5253128,109,5257944,5254788)}r3=__ZN16b2BlockAllocator8AllocateEi(r1|0,152);if((r3|0)==0){r4=0}else{r5=r3;__ZN6b2BodyC2EPK9b2BodyDefP7b2World(r5,r2,r1);r4=r5}HEAP32[r4+92>>2]=0;r5=(r1+102952|0)>>2;HEAP32[r4+96>>2]=HEAP32[r5];r2=HEAP32[r5];if((r2|0)==0){HEAP32[r5]=r4;r6=r1+102960|0,r7=r6>>2;r8=HEAP32[r7];r9=r8+1|0;HEAP32[r7]=r9;return r4}HEAP32[r2+92>>2]=r4;HEAP32[r5]=r4;r6=r1+102960|0,r7=r6>>2;r8=HEAP32[r7];r9=r8+1|0;HEAP32[r7]=r9;return r4}function _emscripten_bind_b2CircleShape__GetVertexCount_p0(r1){return 1}function _emscripten_bind_b2CircleShape__GetSupport_p1(r1,r2){return 0}function _emscripten_bind_b2PrismaticJoint__EnableMotor_p1(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r1+48>>2];r4=r3+4|0;r5=HEAP16[r4>>1];if((r5&2)<<16>>16==0){HEAP16[r4>>1]=r5|2;HEAPF32[r3+144>>2]=0}r3=HEAP32[r1+52>>2];r5=r3+4|0;r4=HEAP16[r5>>1];if((r4&2)<<16>>16!=0){r6=r1+137|0;r7=r2&1;HEAP8[r6]=r7;return}HEAP16[r5>>1]=r4|2;HEAPF32[r3+144>>2]=0;r6=r1+137|0;r7=r2&1;HEAP8[r6]=r7;return}function _emscripten_bind_b2PrismaticJoint__GetReferenceAngle_p0(r1){return HEAPF32[r1+100>>2]}function _emscripten_bind_b2PrismaticJoint__GetMotorForce_p1(r1,r2){return HEAPF32[r1+116>>2]*r2}function _emscripten_bind_b2PrismaticJoint__GetJointTranslation_p0(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r2=r1>>2;r1=HEAP32[r2+12]>>2;r3=HEAPF32[r1+6];r4=HEAPF32[r2+17];r5=HEAPF32[r1+5];r6=HEAPF32[r2+18];r7=HEAP32[r2+13]>>2;r8=HEAPF32[r7+6];r9=HEAPF32[r2+19];r10=HEAPF32[r7+5];r11=HEAPF32[r2+20];r12=HEAPF32[r2+21];r13=HEAPF32[r2+22];return(HEAPF32[r7+3]+(r8*r9-r10*r11)-(HEAPF32[r1+3]+(r3*r4-r5*r6)))*(r3*r12-r5*r13)+(r9*r10+r8*r11+HEAPF32[r7+4]-(r4*r5+r3*r6+HEAPF32[r1+4]))*(r5*r12+r3*r13)}function _emscripten_bind_b2PrismaticJoint__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2PrismaticJoint__IsLimitEnabled_p0(r1){return(HEAP8[r1+136|0]&1)<<24>>24!=0}function _emscripten_bind_b2PrismaticJoint__GetUpperLimit_p0(r1){return HEAPF32[r1+124>>2]}function _emscripten_bind_b2PrismaticJoint__IsActive_p0(r1){var r2;if((HEAP16[HEAP32[r1+48>>2]+4>>1]&32)<<16>>16==0){r2=0;return r2}r2=(HEAP16[HEAP32[r1+52>>2]+4>>1]&32)<<16>>16!=0;return r2}function _emscripten_bind_b2CircleShape__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2CircleShape__set_m_radius_p1(r1,r2){HEAPF32[r1+8>>2]=r2;return}function _emscripten_bind_b2CircleShape__get_m_radius_p0(r1){return HEAPF32[r1+8>>2]}function _emscripten_bind_b2CircleShape__GetVertex_p1(r1,r2){return r1+12|0}function _emscripten_bind_b2CircleShape__GetSupportVertex_p1(r1,r2){return r1+12|0}function _emscripten_bind_b2CircleShape__set_m_p_p1(r1,r2){var r3;r3=r2;r2=r1+12|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2CircleShape__get_m_p_p0(r1){return r1+12|0}function _emscripten_bind_b2WheelJoint__GetBodyA_p0(r1){return HEAP32[r1+48>>2]}function _emscripten_bind_b2WheelJoint__GetBodyB_p0(r1){return HEAP32[r1+52>>2]}function _emscripten_bind_b2WheelJoint__GetUserData_p0(r1){return HEAP32[r1+64>>2]}function _emscripten_bind_b2WheelJoint__GetLocalAxisA_p0(r1){return r1+92|0}function _emscripten_bind_b2WheelJoint__SetSpringDampingRatio_p1(r1,r2){HEAPF32[r1+72>>2]=r2;return}function _emscripten_bind_b2WheelJoint__GetNext_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2WheelJoint__GetSpringFrequencyHz_p0(r1){return HEAPF32[r1+68>>2]}function _emscripten_bind_b2WheelJoint__GetLocalAnchorA_p0(r1){return r1+76|0}function _emscripten_bind_b2WheelJoint__SetMotorSpeed_p1(r1,r2){var r3,r4,r5,r6;r3=HEAP32[r1+48>>2];r4=r3+4|0;r5=HEAP16[r4>>1];if((r5&2)<<16>>16==0){HEAP16[r4>>1]=r5|2;HEAPF32[r3+144>>2]=0}r3=HEAP32[r1+52>>2];r5=r3+4|0;r4=HEAP16[r5>>1];if((r4&2)<<16>>16!=0){r6=r1+124|0;HEAPF32[r6>>2]=r2;return}HEAP16[r5>>1]=r4|2;HEAPF32[r3+144>>2]=0;r6=r1+124|0;HEAPF32[r6>>2]=r2;return}function _emscripten_bind_b2WheelJoint__GetLocalAnchorB_p0(r1){return r1+84|0}function _emscripten_bind_b2WheelJoint__GetMotorSpeed_p0(r1){return HEAPF32[r1+124>>2]}function _emscripten_bind_b2WheelJoint__GetMotorTorque_p1(r1,r2){return HEAPF32[r1+112>>2]*r2}function _emscripten_bind_b2WheelJoint__GetMaxMotorTorque_p0(r1){return HEAPF32[r1+120>>2]}function _emscripten_bind_b2WheelJoint__IsMotorEnabled_p0(r1){return(HEAP8[r1+128|0]&1)<<24>>24!=0}function _emscripten_bind_b2WheelJoint__SetUserData_p1(r1,r2){HEAP32[r1+64>>2]=r2;return}function _emscripten_bind_b2WheelJoint__GetSpringDampingRatio_p0(r1){return HEAPF32[r1+72>>2]}function _emscripten_bind_b2WheelJoint__SetMaxMotorTorque_p1(r1,r2){var r3,r4,r5,r6;r3=HEAP32[r1+48>>2];r4=r3+4|0;r5=HEAP16[r4>>1];if((r5&2)<<16>>16==0){HEAP16[r4>>1]=r5|2;HEAPF32[r3+144>>2]=0}r3=HEAP32[r1+52>>2];r5=r3+4|0;r4=HEAP16[r5>>1];if((r4&2)<<16>>16!=0){r6=r1+120|0;HEAPF32[r6>>2]=r2;return}HEAP16[r5>>1]=r4|2;HEAPF32[r3+144>>2]=0;r6=r1+120|0;HEAPF32[r6>>2]=r2;return}function _emscripten_bind_b2WheelJoint__GetCollideConnected_p0(r1){return(HEAP8[r1+61|0]&1)<<24>>24!=0}function _emscripten_bind_b2WheelJoint__GetJointSpeed_p0(r1){return HEAPF32[HEAP32[r1+52>>2]+72>>2]-HEAPF32[HEAP32[r1+48>>2]+72>>2]}function _emscripten_bind_b2WheelJoint__EnableMotor_p1(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r1+48>>2];r4=r3+4|0;r5=HEAP16[r4>>1];if((r5&2)<<16>>16==0){HEAP16[r4>>1]=r5|2;HEAPF32[r3+144>>2]=0}r3=HEAP32[r1+52>>2];r5=r3+4|0;r4=HEAP16[r5>>1];if((r4&2)<<16>>16!=0){r6=r1+128|0;r7=r2&1;HEAP8[r6]=r7;return}HEAP16[r5>>1]=r4|2;HEAPF32[r3+144>>2]=0;r6=r1+128|0;r7=r2&1;HEAP8[r6]=r7;return}function _emscripten_bind_b2WheelJoint__GetJointTranslation_p0(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r2=r1>>2;r1=HEAP32[r2+12]>>2;r3=HEAP32[r2+13]>>2;r4=HEAPF32[r1+6];r5=HEAPF32[r2+19];r6=HEAPF32[r1+5];r7=HEAPF32[r2+20];r8=HEAPF32[r3+6];r9=HEAPF32[r2+21];r10=HEAPF32[r3+5];r11=HEAPF32[r2+22];r12=HEAPF32[r2+23];r13=HEAPF32[r2+24];return(HEAPF32[r3+3]+(r8*r9-r10*r11)-(HEAPF32[r1+3]+(r4*r5-r6*r7)))*(r4*r12-r6*r13)+(r9*r10+r8*r11+HEAPF32[r3+4]-(r5*r6+r4*r7+HEAPF32[r1+4]))*(r6*r12+r4*r13)}function _emscripten_bind_b2WheelJoint__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2WheelJoint__SetSpringFrequencyHz_p1(r1,r2){HEAPF32[r1+68>>2]=r2;return}function _emscripten_bind_b2WheelJoint__IsActive_p0(r1){var r2;if((HEAP16[HEAP32[r1+48>>2]+4>>1]&32)<<16>>16==0){r2=0;return r2}r2=(HEAP16[HEAP32[r1+52>>2]+4>>1]&32)<<16>>16!=0;return r2}function _emscripten_bind_b2Draw__AppendFlags_p1(r1,r2){var r3;r3=r1+4|0;HEAP32[r3>>2]=HEAP32[r3>>2]|r2;return}function _emscripten_bind_b2Draw__ClearFlags_p1(r1,r2){var r3;r3=r1+4|0;HEAP32[r3>>2]=HEAP32[r3>>2]&(r2^-1);return}function _emscripten_bind_b2Draw__SetFlags_p1(r1,r2){HEAP32[r1+4>>2]=r2;return}function _emscripten_bind_b2Draw__GetFlags_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2Joint__GetNext_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2Joint__GetBodyA_p0(r1){return HEAP32[r1+48>>2]}function _emscripten_bind_b2Joint__GetBodyB_p0(r1){return HEAP32[r1+52>>2]}function _emscripten_bind_b2Joint__GetUserData_p0(r1){return HEAP32[r1+64>>2]}function _emscripten_bind_b2Joint__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2Joint__SetUserData_p1(r1,r2){HEAP32[r1+64>>2]=r2;return}function _emscripten_bind_b2Joint__GetCollideConnected_p0(r1){return(HEAP8[r1+61|0]&1)<<24>>24!=0}function _emscripten_bind_b2PrismaticJoint____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);return}function _emscripten_bind_b2PrismaticJoint__Dump_p0(r1){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1);return}function _emscripten_bind_b2PrismaticJoint__GetReactionTorque_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1,r2)}function _emscripten_bind_b2PrismaticJoint__GetAnchorB_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264668]<<24>>24==0){if((___cxa_guard_acquire(5264668)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243228;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243228}function _emscripten_bind_b2CircleShape____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);return}function _emscripten_bind_b2CircleShape__ComputeMass_p2(r1,r2,r3){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+28>>2]](r1,r2,r3);return}function _emscripten_bind_b2CircleShape__Clone_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1,r2)}function _emscripten_bind_b2CircleShape__RayCast_p4(r1,r2,r3,r4,r5){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1,r2,r3,r4,r5)}function _emscripten_bind_b2CircleShape__ComputeAABB_p3(r1,r2,r3,r4){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1,r2,r3,r4);return}function _emscripten_bind_b2CircleShape__GetChildCount_p0(r1){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1)}function _emscripten_bind_b2CircleShape__TestPoint_p2(r1,r2,r3){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1,r2,r3)}function _emscripten_bind_b2CircleShape__b2CircleShape_p0(){var r1,r2;r1=__Znwj(20);HEAP32[r1>>2]=5262172;r2=(r1+4|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;return r1}function _emscripten_bind_b2WheelJoint__GetAnchorB_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264764]<<24>>24==0){if((___cxa_guard_acquire(5264764)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243220;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243220}function _emscripten_bind_b2WheelJoint__GetAnchorA_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264772]<<24>>24==0){if((___cxa_guard_acquire(5264772)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243212;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243212}function _emscripten_bind_b2WheelJoint__b2WheelJoint_p1(r1){var r2;r2=__Znwj(224);__ZN12b2WheelJointC2EPK15b2WheelJointDef(r2,r1);return r2}function _emscripten_bind_b2WheelJoint__GetReactionForce_p1(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;do{if(HEAP8[5264628]<<24>>24==0){if((___cxa_guard_acquire(5264628)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r4,r1,r2);r2=r4;r4=HEAP32[r2+4>>2];r1=5243204;HEAP32[r1>>2]=HEAP32[r2>>2];HEAP32[r1+4>>2]=r4;STACKTOP=r3;return 5243204}function _emscripten_bind_b2WheelJoint____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);return}function _emscripten_bind_b2WheelJoint__Dump_p0(r1){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1);return}function _emscripten_bind_b2WheelJoint__GetReactionTorque_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1,r2)}function _emscripten_bind_b2Draw____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);return}function _emscripten_bind_b2Draw__DrawTransform_p1(r1,r2){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+28>>2]](r1,r2);return}function _emscripten_bind_b2Draw__DrawPolygon_p3(r1,r2,r3,r4){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1,r2,r3,r4);return}function _emscripten_bind_b2Draw__DrawSolidCircle_p4(r1,r2,r3,r4,r5){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1,r2,r3,r4,r5);return}function _emscripten_bind_b2Draw__DrawSolidPolygon_p3(r1,r2,r3,r4){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1,r2,r3,r4);return}function _emscripten_bind_b2Draw__DrawCircle_p3(r1,r2,r3,r4){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1,r2,r3,r4);return}function _emscripten_bind_b2Draw__DrawSegment_p3(r1,r2,r3,r4){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1,r2,r3,r4);return}function _emscripten_bind_b2Draw__b2Draw_p0(){var r1;r1=__Znwj(8);HEAP32[r1>>2]=5261520;HEAP32[r1+4>>2]=0;return r1}function _emscripten_bind_b2Joint__GetReactionTorque_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1,r2)}function _emscripten_bind_b2Joint__GetAnchorA_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264892]<<24>>24==0){if((___cxa_guard_acquire(5264892)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243196;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243196}function _emscripten_bind_b2Joint__Dump_p0(r1){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1);return}function _emscripten_bind_b2PrismaticJoint__SetLimits_p2(r1,r2,r3){var r4,r5,r6,r7;r4=r1>>2;if(r2>r3){___assert_func(5249548,575,5259488,5253900)}r5=r1+120|0;do{if(HEAPF32[r5>>2]==r2){if(HEAPF32[r4+31]!=r3){break}return}}while(0);r1=HEAP32[r4+12];r6=r1+4|0;r7=HEAP16[r6>>1];if((r7&2)<<16>>16==0){HEAP16[r6>>1]=r7|2;HEAPF32[r1+144>>2]=0}r1=HEAP32[r4+13];r7=r1+4|0;r6=HEAP16[r7>>1];if((r6&2)<<16>>16==0){HEAP16[r7>>1]=r6|2;HEAPF32[r1+144>>2]=0}HEAPF32[r5>>2]=r2;HEAPF32[r4+31]=r3;HEAPF32[r4+28]=0;return}function _emscripten_bind_b2Joint__IsActive_p0(r1){var r2;if((HEAP16[HEAP32[r1+48>>2]+4>>1]&32)<<16>>16==0){r2=0;return r2}r2=(HEAP16[HEAP32[r1+52>>2]+4>>1]&32)<<16>>16!=0;return r2}function _emscripten_bind_b2GearJoint__GetJoint1_p0(r1){return HEAP32[r1+68>>2]}function _emscripten_bind_b2GearJoint__GetJoint2_p0(r1){return HEAP32[r1+72>>2]}function _emscripten_bind_b2GearJoint__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2GearJoint__GetUserData_p0(r1){return HEAP32[r1+64>>2]}function _emscripten_bind_b2GearJoint__GetBodyB_p0(r1){return HEAP32[r1+52>>2]}function _emscripten_bind_b2GearJoint__GetCollideConnected_p0(r1){return(HEAP8[r1+61|0]&1)<<24>>24!=0}function _emscripten_bind_b2GearJoint__SetUserData_p1(r1,r2){HEAP32[r1+64>>2]=r2;return}function _emscripten_bind_b2GearJoint__GetBodyA_p0(r1){return HEAP32[r1+48>>2]}function _emscripten_bind_b2GearJoint__GetNext_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2GearJoint__IsActive_p0(r1){var r2;if((HEAP16[HEAP32[r1+48>>2]+4>>1]&32)<<16>>16==0){r2=0;return r2}r2=(HEAP16[HEAP32[r1+52>>2]+4>>1]&32)<<16>>16!=0;return r2}function _emscripten_bind_b2GearJoint__GetRatio_p0(r1){return HEAPF32[r1+152>>2]}function _emscripten_bind_b2DynamicTree__GetHeight_p0(r1){var r2,r3;r2=HEAP32[r1>>2];if((r2|0)==-1){r3=0;return r3}r3=HEAP32[HEAP32[r1+4>>2]+(r2*36&-1)+32>>2];return r3}function _emscripten_bind_b2DynamicTree__GetAreaRatio_p0(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=HEAP32[r1>>2];if((r2|0)==-1){r3=0;return r3}r4=HEAP32[r1+4>>2]>>2;r5=(HEAPF32[((r2*36&-1)+8>>2)+r4]-HEAPF32[((r2*36&-1)>>2)+r4]+(HEAPF32[((r2*36&-1)+12>>2)+r4]-HEAPF32[((r2*36&-1)+4>>2)+r4]))*2;r2=HEAP32[r1+12>>2];L4568:do{if((r2|0)>0){r1=0;r6=0;while(1){if((HEAP32[((r6*36&-1)+32>>2)+r4]|0)<0){r7=r1}else{r7=r1+(HEAPF32[((r6*36&-1)+8>>2)+r4]-HEAPF32[((r6*36&-1)>>2)+r4]+(HEAPF32[((r6*36&-1)+12>>2)+r4]-HEAPF32[((r6*36&-1)+4>>2)+r4]))*2}r8=r6+1|0;if((r8|0)==(r2|0)){r9=r7;break L4568}else{r1=r7;r6=r8}}}else{r9=0}}while(0);r3=r9/r5;return r3}function _emscripten_bind_b2WeldJoint__GetBodyA_p0(r1){return HEAP32[r1+48>>2]}function _emscripten_bind_b2WeldJoint__GetBodyB_p0(r1){return HEAP32[r1+52>>2]}function _emscripten_bind_b2WeldJoint__SetFrequency_p1(r1,r2){HEAPF32[r1+68>>2]=r2;return}function _emscripten_bind_b2WeldJoint__GetUserData_p0(r1){return HEAP32[r1+64>>2]}function _emscripten_bind_b2WeldJoint__SetUserData_p1(r1,r2){HEAP32[r1+64>>2]=r2;return}function _emscripten_bind_b2WeldJoint__GetNext_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2WeldJoint__GetLocalAnchorA_p0(r1){return r1+80|0}function _emscripten_bind_b2WeldJoint__GetLocalAnchorB_p0(r1){return r1+88|0}function _emscripten_bind_b2WeldJoint__GetFrequency_p0(r1){return HEAPF32[r1+68>>2]}function _emscripten_bind_b2WeldJoint__GetDampingRatio_p0(r1){return HEAPF32[r1+72>>2]}function _emscripten_bind_b2WeldJoint__GetCollideConnected_p0(r1){return(HEAP8[r1+61|0]&1)<<24>>24!=0}function _emscripten_bind_b2WeldJoint__GetReferenceAngle_p0(r1){return HEAPF32[r1+96>>2]}function _emscripten_bind_b2WeldJoint__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2WeldJoint__SetDampingRatio_p1(r1,r2){HEAPF32[r1+72>>2]=r2;return}function _emscripten_bind_b2WeldJoint__IsActive_p0(r1){var r2;if((HEAP16[HEAP32[r1+48>>2]+4>>1]&32)<<16>>16==0){r2=0;return r2}r2=(HEAP16[HEAP32[r1+52>>2]+4>>1]&32)<<16>>16!=0;return r2}function _emscripten_bind_b2RevoluteJoint__GetBodyA_p0(r1){return HEAP32[r1+48>>2]}function _emscripten_bind_b2RevoluteJoint__GetBodyB_p0(r1){return HEAP32[r1+52>>2]}function _emscripten_bind_b2RevoluteJoint__GetUserData_p0(r1){return HEAP32[r1+64>>2]}function _emscripten_bind_b2RevoluteJoint__GetLowerLimit_p0(r1){return HEAPF32[r1+120>>2]}function _emscripten_bind_b2Joint__GetAnchorB_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264884]<<24>>24==0){if((___cxa_guard_acquire(5264884)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243188;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243188}function _emscripten_bind_b2Joint__GetReactionForce_p1(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;do{if(HEAP8[5264748]<<24>>24==0){if((___cxa_guard_acquire(5264748)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r4,r1,r2);r2=r4;r4=HEAP32[r2+4>>2];r1=5243172;HEAP32[r1>>2]=HEAP32[r2>>2];HEAP32[r1+4>>2]=r4;STACKTOP=r3;return 5243172}function _emscripten_bind_b2GearJoint__b2GearJoint_p1(r1){var r2;r2=__Znwj(276);__ZN11b2GearJointC2EPK14b2GearJointDef(r2,r1);return r2}function _emscripten_bind_b2GearJoint__GetAnchorA_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264836]<<24>>24==0){if((___cxa_guard_acquire(5264836)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243164;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243164}function _emscripten_bind_b2GearJoint__GetReactionTorque_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1,r2)}function _emscripten_bind_b2GearJoint__Dump_p0(r1){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1);return}function _emscripten_bind_b2GearJoint____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);return}function _emscripten_bind_b2GearJoint__GetAnchorB_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264828]<<24>>24==0){if((___cxa_guard_acquire(5264828)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243156;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243156}function _emscripten_bind_b2GearJoint__GetReactionForce_p1(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;do{if(HEAP8[5264660]<<24>>24==0){if((___cxa_guard_acquire(5264660)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r4,r1,r2);r2=r4;r4=HEAP32[r2+4>>2];r1=5243148;HEAP32[r1>>2]=HEAP32[r2>>2];HEAP32[r1+4>>2]=r4;STACKTOP=r3;return 5243148}function _emscripten_bind_b2RayCastCallback__ReportFixture_p4(r1,r2,r3,r4,r5){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1,r2,r3,r4,r5)}function _emscripten_bind_b2RayCastCallback__b2RayCastCallback_p0(){var r1;r1=__Znwj(4);HEAP32[r1>>2]=5261712;return r1}function _emscripten_bind_b2RayCastCallback____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);return}function _emscripten_bind_b2DynamicTree____destroy___p0(r1){if((r1|0)==0){return}_free(HEAP32[r1+4>>2]);__ZdlPv(r1);return}function _emscripten_bind_b2DynamicTree__b2DynamicTree_p0(){var r1,r2,r3,r4,r5,r6;r1=__Znwj(28),r2=r1>>2;r3=r1;HEAP32[r2]=-1;HEAP32[r2+3]=16;HEAP32[r2+2]=0;r1=_malloc(576);r4=r1;HEAP32[r2+1]=r4;_memset(r1,0,576);r5=0;while(1){r6=r5+1|0;HEAP32[r4+(r5*36&-1)+20>>2]=r6;HEAP32[r4+(r5*36&-1)+32>>2]=-1;if((r6|0)<15){r5=r6}else{break}}HEAP32[r1+560>>2]=-1;HEAP32[r1+572>>2]=-1;HEAP32[r2+4]=0;HEAP32[r2+5]=0;HEAP32[r2+6]=0;return r3}function _emscripten_bind_b2DynamicTree__RebuildBottomUp_p0(r1){__ZN13b2DynamicTree15RebuildBottomUpEv(r1);return}function _emscripten_bind_b2DynamicTree__CreateProxy_p2(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=__ZN13b2DynamicTree12AllocateNodeEv(r1);r5=(r1+4|0)>>2;r6=HEAPF32[r2+4>>2]-.10000000149011612;r7=HEAP32[r5]+(r4*36&-1)|0;r8=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r2>>2]-.10000000149011612,HEAP32[tempDoublePtr>>2]);r9=(HEAPF32[tempDoublePtr>>2]=r6,HEAP32[tempDoublePtr>>2])|0;HEAP32[r7>>2]=0|r8;HEAP32[r7+4>>2]=r9;r9=HEAPF32[r2+12>>2]+.10000000149011612;r7=HEAP32[r5]+(r4*36&-1)+8|0;r8=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r2+8>>2]+.10000000149011612,HEAP32[tempDoublePtr>>2]);r2=(HEAPF32[tempDoublePtr>>2]=r9,HEAP32[tempDoublePtr>>2])|0;HEAP32[r7>>2]=0|r8;HEAP32[r7+4>>2]=r2;HEAP32[HEAP32[r5]+(r4*36&-1)+16>>2]=r3;HEAP32[HEAP32[r5]+(r4*36&-1)+32>>2]=0;__ZN13b2DynamicTree10InsertLeafEi(r1,r4);return r4}function _emscripten_bind_b2DynamicTree__MoveProxy_p3(r1,r2,r3,r4){return __ZN13b2DynamicTree9MoveProxyEiRK6b2AABBRK6b2Vec2(r1,r2,r3,r4)}function _emscripten_bind_b2DynamicTree__Validate_p0(r1){__ZNK13b2DynamicTree8ValidateEv(r1);return}function _emscripten_bind_b2DynamicTree__DestroyProxy_p1(r1,r2){__ZN13b2DynamicTree12DestroyProxyEi(r1,r2);return}function _emscripten_bind_b2WeldJoint__GetAnchorB_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264796]<<24>>24==0){if((___cxa_guard_acquire(5264796)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243140;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243140}function _emscripten_bind_b2WeldJoint__GetAnchorA_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264804]<<24>>24==0){if((___cxa_guard_acquire(5264804)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243132;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243132}function _emscripten_bind_b2WeldJoint__GetReactionForce_p1(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;do{if(HEAP8[5264644]<<24>>24==0){if((___cxa_guard_acquire(5264644)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r4,r1,r2);r2=r4;r4=HEAP32[r2+4>>2];r1=5243124;HEAP32[r1>>2]=HEAP32[r2>>2];HEAP32[r1+4>>2]=r4;STACKTOP=r3;return 5243124}function _emscripten_bind_b2WeldJoint____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);return}function _emscripten_bind_b2WeldJoint__Dump_p0(r1){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1);return}function _emscripten_bind_b2WeldJoint__GetReactionTorque_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1,r2)}function _emscripten_bind_b2RevoluteJoint__GetAnchorA_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264692]<<24>>24==0){if((___cxa_guard_acquire(5264692)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243116;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243116}function _emscripten_bind_b2GearJoint__SetRatio_p1(r1,r2){if(!isNaN(r2)&!isNaN(0)&r2>-Infinity&r2<Infinity){HEAPF32[r1+152>>2]=r2;return}else{___assert_func(5250076,398,5260800,5249708)}}function _emscripten_bind_b2DynamicTree__GetFatAABB_p1(r1,r2){do{if((r2|0)>-1){if((HEAP32[r1+12>>2]|0)<=(r2|0)){break}return HEAP32[r1+4>>2]+(r2*36&-1)|0}}while(0);___assert_func(5252876,159,5256772,5252452)}function _emscripten_bind_b2DynamicTree__GetUserData_p1(r1,r2){do{if((r2|0)>-1){if((HEAP32[r1+12>>2]|0)<=(r2|0)){break}return HEAP32[HEAP32[r1+4>>2]+(r2*36&-1)+16>>2]}}while(0);___assert_func(5252876,153,5256724,5252452)}function _emscripten_bind_b2DynamicTree__GetMaxBalance_p0(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=0;r3=HEAP32[r1+12>>2];if((r3|0)<=0){r4=0;return r4}r5=HEAP32[r1+4>>2]>>2;r1=0;r6=0;while(1){if((HEAP32[((r1*36&-1)+32>>2)+r5]|0)<2){r7=r6}else{r8=HEAP32[((r1*36&-1)+24>>2)+r5];if((r8|0)==-1){r2=3763;break}r9=HEAP32[((HEAP32[((r1*36&-1)+28>>2)+r5]*36&-1)+32>>2)+r5]-HEAP32[((r8*36&-1)+32>>2)+r5]|0;r8=(r9|0)>0?r9:-r9|0;r7=(r6|0)>(r8|0)?r6:r8}r8=r1+1|0;if((r8|0)<(r3|0)){r1=r8;r6=r7}else{r4=r7;r2=3767;break}}if(r2==3767){return r4}else if(r2==3763){___assert_func(5253852,686,5256632,5250052)}}function _emscripten_bind_b2WeldJoint__b2WeldJoint_p1(r1){var r2,r3,r4,r5,r6,r7;r2=r1>>2;r3=__Znwj(208),r4=r3>>2;r5=r3;HEAP32[r5>>2]=5261468;r6=HEAP32[r2+2];r7=HEAP32[r2+3];if((r6|0)!=(r7|0)){HEAP32[r4+1]=HEAP32[r2];HEAP32[r4+2]=0;HEAP32[r4+3]=0;HEAP32[r4+12]=r6;HEAP32[r4+13]=r7;HEAP32[r4+14]=0;HEAP8[r3+61|0]=HEAP8[r1+16|0]&1;HEAP8[r3+60|0]=0;HEAP32[r4+16]=HEAP32[r2+1];_memset(r3+16|0,0,32);HEAP32[r5>>2]=5262364;r5=r1+20|0;r7=r3+80|0;r6=HEAP32[r5+4>>2];HEAP32[r7>>2]=HEAP32[r5>>2];HEAP32[r7+4>>2]=r6;r6=r1+28|0;r1=r3+88|0;r7=HEAP32[r6+4>>2];HEAP32[r1>>2]=HEAP32[r6>>2];HEAP32[r1+4>>2]=r7;HEAPF32[r4+24]=HEAPF32[r2+9];HEAPF32[r4+17]=HEAPF32[r2+10];HEAPF32[r4+18]=HEAPF32[r2+11];HEAPF32[r4+26]=0;HEAPF32[r4+27]=0;HEAPF32[r4+28]=0;return r3}___assert_func(5249968,173,5258024,5251672)}function _emscripten_bind_b2Timer__Reset_p0(r1){return}function _emscripten_bind_b2Timer__GetMilliseconds_p0(r1){return 0}function _emscripten_bind_b2RevoluteJoint__GetNext_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2RevoluteJoint__GetLocalAnchorA_p0(r1){return r1+68|0}function _emscripten_bind_b2RevoluteJoint__SetMotorSpeed_p1(r1,r2){var r3,r4,r5,r6;r3=HEAP32[r1+48>>2];r4=r3+4|0;r5=HEAP16[r4>>1];if((r5&2)<<16>>16==0){HEAP16[r4>>1]=r5|2;HEAPF32[r3+144>>2]=0}r3=HEAP32[r1+52>>2];r5=r3+4|0;r4=HEAP16[r5>>1];if((r4&2)<<16>>16!=0){r6=r1+108|0;HEAPF32[r6>>2]=r2;return}HEAP16[r5>>1]=r4|2;HEAPF32[r3+144>>2]=0;r6=r1+108|0;HEAPF32[r6>>2]=r2;return}function _emscripten_bind_b2RevoluteJoint__GetLocalAnchorB_p0(r1){return r1+76|0}function _emscripten_bind_b2RevoluteJoint__GetJointAngle_p0(r1){return HEAPF32[HEAP32[r1+52>>2]+56>>2]-HEAPF32[HEAP32[r1+48>>2]+56>>2]-HEAPF32[r1+116>>2]}function _emscripten_bind_b2RevoluteJoint__GetMotorSpeed_p0(r1){return HEAPF32[r1+108>>2]}function _emscripten_bind_b2RevoluteJoint__GetMotorTorque_p1(r1,r2){return HEAPF32[r1+96>>2]*r2}function _emscripten_bind_b2RevoluteJoint__IsLimitEnabled_p0(r1){return(HEAP8[r1+112|0]&1)<<24>>24!=0}function _emscripten_bind_b2RevoluteJoint__EnableLimit_p1(r1,r2){var r3,r4,r5,r6;r3=r1+112|0;if((r2&1|0)==(HEAP8[r3]&1|0)){return}r4=HEAP32[r1+48>>2];r5=r4+4|0;r6=HEAP16[r5>>1];if((r6&2)<<16>>16==0){HEAP16[r5>>1]=r6|2;HEAPF32[r4+144>>2]=0}r4=HEAP32[r1+52>>2];r6=r4+4|0;r5=HEAP16[r6>>1];if((r5&2)<<16>>16==0){HEAP16[r6>>1]=r5|2;HEAPF32[r4+144>>2]=0}HEAP8[r3]=r2&1;HEAPF32[r1+92>>2]=0;return}function _emscripten_bind_b2RevoluteJoint__IsMotorEnabled_p0(r1){return(HEAP8[r1+100|0]&1)<<24>>24!=0}function _emscripten_bind_b2RevoluteJoint__SetUserData_p1(r1,r2){HEAP32[r1+64>>2]=r2;return}function _emscripten_bind_b2RevoluteJoint__SetMaxMotorTorque_p1(r1,r2){var r3,r4,r5,r6;r3=HEAP32[r1+48>>2];r4=r3+4|0;r5=HEAP16[r4>>1];if((r5&2)<<16>>16==0){HEAP16[r4>>1]=r5|2;HEAPF32[r3+144>>2]=0}r3=HEAP32[r1+52>>2];r5=r3+4|0;r4=HEAP16[r5>>1];if((r4&2)<<16>>16!=0){r6=r1+104|0;HEAPF32[r6>>2]=r2;return}HEAP16[r5>>1]=r4|2;HEAPF32[r3+144>>2]=0;r6=r1+104|0;HEAPF32[r6>>2]=r2;return}function _emscripten_bind_b2RevoluteJoint__GetCollideConnected_p0(r1){return(HEAP8[r1+61|0]&1)<<24>>24!=0}function _emscripten_bind_b2RevoluteJoint__GetJointSpeed_p0(r1){return HEAPF32[HEAP32[r1+52>>2]+72>>2]-HEAPF32[HEAP32[r1+48>>2]+72>>2]}function _emscripten_bind_b2RevoluteJoint__EnableMotor_p1(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r1+48>>2];r4=r3+4|0;r5=HEAP16[r4>>1];if((r5&2)<<16>>16==0){HEAP16[r4>>1]=r5|2;HEAPF32[r3+144>>2]=0}r3=HEAP32[r1+52>>2];r5=r3+4|0;r4=HEAP16[r5>>1];if((r4&2)<<16>>16!=0){r6=r1+100|0;r7=r2&1;HEAP8[r6]=r7;return}HEAP16[r5>>1]=r4|2;HEAPF32[r3+144>>2]=0;r6=r1+100|0;r7=r2&1;HEAP8[r6]=r7;return}function _emscripten_bind_b2RevoluteJoint__GetReferenceAngle_p0(r1){return HEAPF32[r1+116>>2]}function _emscripten_bind_b2RevoluteJoint__GetMaxMotorTorque_p0(r1){return HEAPF32[r1+104>>2]}function _emscripten_bind_b2RevoluteJoint__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2RevoluteJoint__GetUpperLimit_p0(r1){return HEAPF32[r1+124>>2]}function _emscripten_bind_b2RevoluteJoint__IsActive_p0(r1){var r2;if((HEAP16[HEAP32[r1+48>>2]+4>>1]&32)<<16>>16==0){r2=0;return r2}r2=(HEAP16[HEAP32[r1+52>>2]+4>>1]&32)<<16>>16!=0;return r2}function _emscripten_bind_b2ChainShape__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2ChainShape__set_m_radius_p1(r1,r2){HEAPF32[r1+8>>2]=r2;return}function _emscripten_bind_b2ChainShape__get_m_radius_p0(r1){return HEAPF32[r1+8>>2]}function _emscripten_bind_b2ChainShape__get_m_vertices_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2ChainShape__get_m_count_p0(r1){return HEAP32[r1+16>>2]}function _emscripten_bind_b2ChainShape__SetPrevVertex_p1(r1,r2){var r3,r4;r3=r2;r2=r1+20|0;r4=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r4;HEAP8[r1+36|0]=1;return}function _emscripten_bind_b2ChainShape__set_m_vertices_p1(r1,r2){HEAP32[r1+12>>2]=r2;return}function _emscripten_bind_b2ChainShape__SetNextVertex_p1(r1,r2){var r3,r4;r3=r2;r2=r1+28|0;r4=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r4;HEAP8[r1+37|0]=1;return}function _emscripten_bind_b2ChainShape__set_m_count_p1(r1,r2){HEAP32[r1+16>>2]=r2;return}function _emscripten_bind_b2RevoluteJoint__GetReactionForce_p1(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;do{if(HEAP8[5264580]<<24>>24==0){if((___cxa_guard_acquire(5264580)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r4,r1,r2);r2=r4;r4=HEAP32[r2+4>>2];r1=5243108;HEAP32[r1>>2]=HEAP32[r2>>2];HEAP32[r1+4>>2]=r4;STACKTOP=r3;return 5243108}function _emscripten_bind_b2RevoluteJoint____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);return}function _emscripten_bind_b2RevoluteJoint__Dump_p0(r1){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1);return}function _emscripten_bind_b2RevoluteJoint__GetReactionTorque_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1,r2)}function _emscripten_bind_b2RevoluteJoint__GetAnchorB_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264684]<<24>>24==0){if((___cxa_guard_acquire(5264684)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243100;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243100}function _emscripten_bind_b2Timer__b2Timer_p0(){return __Znwj(1)}function _emscripten_bind_b2Timer____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1|0);return}function _emscripten_bind_b2ContactListener____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);return}function _emscripten_bind_b2ContactListener__b2ContactListener_p0(){var r1;r1=__Znwj(4);HEAP32[r1>>2]=5261736;return r1}function _emscripten_bind_b2ContactListener__EndContact_p1(r1,r2){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1,r2);return}function _emscripten_bind_b2ContactListener__BeginContact_p1(r1,r2){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1,r2);return}function _emscripten_bind_b2ContactListener__PreSolve_p2(r1,r2,r3){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1,r2,r3);return}function _emscripten_bind_b2ContactListener__PostSolve_p2(r1,r2,r3){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1,r2,r3);return}function _emscripten_bind_b2ChainShape____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);return}function _emscripten_bind_b2ChainShape__ComputeMass_p2(r1,r2,r3){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+28>>2]](r1,r2,r3);return}function _emscripten_bind_b2ChainShape__Clone_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1,r2)}function _emscripten_bind_b2ChainShape__GetChildEdge_p2(r1,r2,r3){__ZNK12b2ChainShape12GetChildEdgeEP11b2EdgeShapei(r1,r2,r3);return}function _emscripten_bind_b2ChainShape__b2ChainShape_p0(){var r1,r2;r1=__Znwj(40),r2=r1>>2;HEAP32[r2]=5262320;HEAP32[r2+1]=3;HEAPF32[r2+2]=.009999999776482582;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP8[r1+36|0]=0;HEAP8[r1+37|0]=0;return r1}function _emscripten_bind_b2ChainShape__ComputeAABB_p3(r1,r2,r3,r4){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1,r2,r3,r4);return}function _emscripten_bind_b2ChainShape__RayCast_p4(r1,r2,r3,r4,r5){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1,r2,r3,r4,r5)}function _emscripten_bind_b2ChainShape__GetChildCount_p0(r1){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1)}function _emscripten_bind_b2ChainShape__TestPoint_p2(r1,r2,r3){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1,r2,r3)}function _emscripten_bind_b2QueryCallback__ReportFixture_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1,r2)}function _emscripten_bind_b2QueryCallback____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);return}function _emscripten_bind_b2QueryCallback__b2QueryCallback_p0(){var r1;r1=__Znwj(4);HEAP32[r1>>2]=5261900;return r1}function _emscripten_bind_b2BlockAllocator____destroy___p0(r1){var r2,r3,r4,r5,r6,r7,r8,r9;if((r1|0)==0){return}r2=r1+4|0;r3=r1|0;r4=HEAP32[r3>>2];L4836:do{if((HEAP32[r2>>2]|0)>0){r5=0;r6=r4;while(1){_free(HEAP32[r6+(r5<<3)+4>>2]);r7=r5+1|0;r8=HEAP32[r3>>2];if((r7|0)<(HEAP32[r2>>2]|0)){r5=r7;r6=r8}else{r9=r8;break L4836}}}else{r9=r4}}while(0);_free(r9);__ZdlPv(r1);return}function _emscripten_bind_b2BlockAllocator__Clear_p0(r1){var r2,r3,r4,r5;r2=(r1+4|0)>>2;r3=r1|0;L4842:do{if((HEAP32[r2]|0)>0){r4=0;while(1){_free(HEAP32[HEAP32[r3>>2]+(r4<<3)+4>>2]);r5=r4+1|0;if((r5|0)<(HEAP32[r2]|0)){r4=r5}else{break L4842}}}}while(0);HEAP32[r2]=0;_memset(HEAP32[r3>>2],0,HEAP32[r1+8>>2]<<3);_memset(r1+12|0,0,56);return}function _emscripten_bind_b2RevoluteJoint__b2RevoluteJoint_p1(r1){var r2,r3,r4,r5,r6,r7;r2=r1>>2;r3=__Znwj(228),r4=r3>>2;r5=r3;HEAP32[r5>>2]=5261468;r6=HEAP32[r2+2];r7=HEAP32[r2+3];if((r6|0)!=(r7|0)){HEAP32[r4+1]=HEAP32[r2];HEAP32[r4+2]=0;HEAP32[r4+3]=0;HEAP32[r4+12]=r6;HEAP32[r4+13]=r7;HEAP32[r4+14]=0;HEAP8[r3+61|0]=HEAP8[r1+16|0]&1;HEAP8[r3+60|0]=0;HEAP32[r4+16]=HEAP32[r2+1];_memset(r3+16|0,0,32);HEAP32[r5>>2]=5261848;r5=r1+20|0;r7=r3+68|0;r6=HEAP32[r5+4>>2];HEAP32[r7>>2]=HEAP32[r5>>2];HEAP32[r7+4>>2]=r6;r6=r1+28|0;r7=r3+76|0;r5=HEAP32[r6+4>>2];HEAP32[r7>>2]=HEAP32[r6>>2];HEAP32[r7+4>>2]=r5;HEAPF32[r4+29]=HEAPF32[r2+9];r5=(r3+84|0)>>2;HEAP32[r5]=0;HEAP32[r5+1]=0;HEAP32[r5+2]=0;HEAP32[r5+3]=0;HEAPF32[r4+30]=HEAPF32[r2+11];HEAPF32[r4+31]=HEAPF32[r2+12];HEAPF32[r4+26]=HEAPF32[r2+15];HEAPF32[r4+27]=HEAPF32[r2+14];HEAP8[r3+112|0]=HEAP8[r1+40|0]&1;HEAP8[r3+100|0]=HEAP8[r1+52|0]&1;HEAP32[r4+56]=0;return r3}___assert_func(5249968,173,5258024,5251672)}function _emscripten_bind_b2RevoluteJoint__SetLimits_p2(r1,r2,r3){var r4,r5,r6,r7;r4=r1>>2;if(r2>r3){___assert_func(5249220,473,5259728,5253900)}r5=r1+120|0;do{if(HEAPF32[r5>>2]==r2){if(HEAPF32[r4+31]!=r3){break}return}}while(0);r1=HEAP32[r4+12];r6=r1+4|0;r7=HEAP16[r6>>1];if((r7&2)<<16>>16==0){HEAP16[r6>>1]=r7|2;HEAPF32[r1+144>>2]=0}r1=HEAP32[r4+13];r7=r1+4|0;r6=HEAP16[r7>>1];if((r6&2)<<16>>16==0){HEAP16[r7>>1]=r6|2;HEAPF32[r1+144>>2]=0}HEAPF32[r4+23]=0;HEAPF32[r5>>2]=r2;HEAPF32[r4+31]=r3;return}function _emscripten_bind_b2ChainShape__CreateChain_p2(r1,r2,r3){var r4,r5,r6;r4=r1+12|0;if((HEAP32[r4>>2]|0)!=0){___assert_func(5248948,48,5260636,5253724)}r5=(r1+16|0)>>2;if((HEAP32[r5]|0)!=0){___assert_func(5248948,48,5260636,5253724)}if((r3|0)>1){HEAP32[r5]=r3;r6=_malloc(r3<<3);HEAP32[r4>>2]=r6;_memcpy(r6,r2,HEAP32[r5]<<3);HEAP8[r1+36|0]=0;HEAP8[r1+37|0]=0;return}else{___assert_func(5248948,49,5260636,5249460)}}function _emscripten_bind_b2ChainShape__CreateLoop_p2(r1,r2,r3){var r4,r5,r6,r7;r4=(r1+12|0)>>2;if((HEAP32[r4]|0)!=0){___assert_func(5248948,34,5260692,5253724)}r5=(r1+16|0)>>2;if((HEAP32[r5]|0)!=0){___assert_func(5248948,34,5260692,5253724)}if((r3|0)>2){r6=r3+1|0;HEAP32[r5]=r6;r7=_malloc(r6<<3);HEAP32[r4]=r7;_memcpy(r7,r2,r3<<3);r2=HEAP32[r4];r7=r2;r6=(r3<<3)+r2|0;r2=HEAP32[r7+4>>2];HEAP32[r6>>2]=HEAP32[r7>>2];HEAP32[r6+4>>2]=r2;r2=HEAP32[r4];r4=(HEAP32[r5]-2<<3)+r2|0;r5=r1+20|0;r6=HEAP32[r4+4>>2];HEAP32[r5>>2]=HEAP32[r4>>2];HEAP32[r5+4>>2]=r6;r6=r2+8|0;r2=r1+28|0;r5=HEAP32[r6+4>>2];HEAP32[r2>>2]=HEAP32[r6>>2];HEAP32[r2+4>>2]=r5;HEAP8[r1+36|0]=1;HEAP8[r1+37|0]=1;return}else{___assert_func(5248948,35,5260692,5247832)}}function _emscripten_bind_b2RopeJoint__GetNext_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2RopeJoint__GetMaxLength_p0(r1){return HEAPF32[r1+84>>2]}function _emscripten_bind_b2RopeJoint__GetBodyA_p0(r1){return HEAP32[r1+48>>2]}function _emscripten_bind_b2RopeJoint__GetCollideConnected_p0(r1){return(HEAP8[r1+61|0]&1)<<24>>24!=0}function _emscripten_bind_b2RopeJoint__GetUserData_p0(r1){return HEAP32[r1+64>>2]}function _emscripten_bind_b2RopeJoint__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2RopeJoint__GetBodyB_p0(r1){return HEAP32[r1+52>>2]}function _emscripten_bind_b2RopeJoint__GetLocalAnchorA_p0(r1){return r1+68|0}function _emscripten_bind_b2RopeJoint__SetMaxLength_p1(r1,r2){HEAPF32[r1+84>>2]=r2;return}function _emscripten_bind_b2RopeJoint__GetLocalAnchorB_p0(r1){return r1+76|0}function _emscripten_bind_b2RopeJoint__SetUserData_p1(r1,r2){HEAP32[r1+64>>2]=r2;return}function _emscripten_bind_b2RopeJoint__GetLimitState_p0(r1){return HEAP32[r1+164>>2]}function _emscripten_bind_b2RopeJoint__IsActive_p0(r1){var r2;if((HEAP16[HEAP32[r1+48>>2]+4>>1]&32)<<16>>16==0){r2=0;return r2}r2=(HEAP16[HEAP32[r1+52>>2]+4>>1]&32)<<16>>16!=0;return r2}function _emscripten_bind_b2PolygonShape__set_m_radius_p1(r1,r2){HEAPF32[r1+8>>2]=r2;return}function _emscripten_bind_b2PolygonShape__get_m_radius_p0(r1){return HEAPF32[r1+8>>2]}function _emscripten_bind_b2PolygonShape__GetVertex_p1(r1,r2){return(r2<<3)+r1+20|0}function _emscripten_bind_b2PolygonShape__SetAsBox_p2(r1,r2,r3){var r4,r5;r4=r1>>2;HEAP32[r4+37]=4;r1=-r2;r5=-r3;HEAPF32[r4+5]=r1;HEAPF32[r4+6]=r5;HEAPF32[r4+7]=r2;HEAPF32[r4+8]=r5;HEAPF32[r4+9]=r2;HEAPF32[r4+10]=r3;HEAPF32[r4+11]=r1;HEAPF32[r4+12]=r3;HEAPF32[r4+21]=0;HEAPF32[r4+22]=-1;HEAPF32[r4+23]=1;HEAPF32[r4+24]=0;HEAPF32[r4+25]=0;HEAPF32[r4+26]=1;HEAPF32[r4+27]=-1;HEAPF32[r4+28]=0;HEAPF32[r4+3]=0;HEAPF32[r4+4]=0;return}function _emscripten_bind_b2PolygonShape__set_m_centroid_p1(r1,r2){var r3;r3=r2;r2=r1+12|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2PolygonShape__set_m_vertexCount_p1(r1,r2){HEAP32[r1+148>>2]=r2;return}function _emscripten_bind_b2PolygonShape__GetVertexCount_p0(r1){return HEAP32[r1+148>>2]}function _emscripten_bind_b2PolygonShape__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2PolygonShape__get_m_vertexCount_p0(r1){return HEAP32[r1+148>>2]}function _emscripten_bind_b2PolygonShape__get_m_centroid_p0(r1){return r1+12|0}function _emscripten_bind_b2EdgeShape__Set_p2(r1,r2,r3){var r4,r5;r4=r2;r2=r1+12|0;r5=HEAP32[r4+4>>2];HEAP32[r2>>2]=HEAP32[r4>>2];HEAP32[r2+4>>2]=r5;r5=r3;r3=r1+20|0;r2=HEAP32[r5+4>>2];HEAP32[r3>>2]=HEAP32[r5>>2];HEAP32[r3+4>>2]=r2;HEAP8[r1+44|0]=0;HEAP8[r1+45|0]=0;return}function _emscripten_bind_b2EdgeShape__set_m_radius_p1(r1,r2){HEAPF32[r1+8>>2]=r2;return}function _emscripten_bind_b2EdgeShape__get_m_radius_p0(r1){return HEAPF32[r1+8>>2]}function _emscripten_bind_b2EdgeShape__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2Contact__GetNext_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2Contact__SetEnabled_p1(r1,r2){var r3;r3=r1+4|0;r1=HEAP32[r3>>2];HEAP32[r3>>2]=r2?r1|4:r1&-5;return}function _emscripten_bind_b2Contact__GetRestitution_p0(r1){return HEAPF32[r1+140>>2]}function _emscripten_bind_b2Contact__GetFriction_p0(r1){return HEAPF32[r1+136>>2]}function _emscripten_bind_b2Contact__IsTouching_p0(r1){return(HEAP32[r1+4>>2]&2|0)!=0}function _emscripten_bind_b2Contact__IsEnabled_p0(r1){return(HEAP32[r1+4>>2]&4|0)!=0}function _emscripten_bind_b2Contact__GetFixtureB_p0(r1){return HEAP32[r1+52>>2]}function _emscripten_bind_b2Contact__SetFriction_p1(r1,r2){HEAPF32[r1+136>>2]=r2;return}function _emscripten_bind_b2Contact__GetFixtureA_p0(r1){return HEAP32[r1+48>>2]}function _emscripten_bind_b2Contact__GetChildIndexA_p0(r1){return HEAP32[r1+56>>2]}function _emscripten_bind_b2Contact__GetChildIndexB_p0(r1){return HEAP32[r1+60>>2]}function _emscripten_bind_b2Contact__SetRestitution_p1(r1,r2){HEAPF32[r1+140>>2]=r2;return}function _emscripten_bind_b2Contact__GetManifold_p0(r1){return r1+64|0}function _emscripten_bind_b2Contact__ResetRestitution_p0(r1){var r2,r3;r2=HEAPF32[HEAP32[r1+48>>2]+20>>2];r3=HEAPF32[HEAP32[r1+52>>2]+20>>2];HEAPF32[r1+140>>2]=r2>r3?r2:r3;return}function _emscripten_bind_b2Shape__get_m_radius_p0(r1){return HEAPF32[r1+8>>2]}function _emscripten_bind_b2Shape__set_m_radius_p1(r1,r2){HEAPF32[r1+8>>2]=r2;return}function _emscripten_bind_b2Shape__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2Body__GetAngle_p0(r1){return HEAPF32[r1+56>>2]}function _emscripten_bind_b2Body__GetUserData_p0(r1){return HEAP32[r1+148>>2]}function _emscripten_bind_b2Body__IsSleepingAllowed_p0(r1){return(HEAP16[r1+4>>1]&4)<<16>>16!=0}function _emscripten_bind_b2Body__SetAngularDamping_p1(r1,r2){HEAPF32[r1+136>>2]=r2;return}function _emscripten_bind_b2Body__SetGravityScale_p1(r1,r2){HEAPF32[r1+140>>2]=r2;return}function _emscripten_bind_b2Body__SetUserData_p1(r1,r2){HEAP32[r1+148>>2]=r2;return}function _emscripten_bind_b2Body__GetAngularVelocity_p0(r1){return HEAPF32[r1+72>>2]}function _emscripten_bind_b2Body__GetFixtureList_p0(r1){return HEAP32[r1+100>>2]}function _emscripten_bind_b2Body__ApplyForce_p2(r1,r2,r3){var r4,r5;if((HEAP32[r1>>2]|0)!=2){return}r4=r1+4|0;r5=HEAP16[r4>>1];if((r5&2)<<16>>16==0){HEAP16[r4>>1]=r5|2;HEAPF32[r1+144>>2]=0}r5=r2|0;r4=r1+76|0;HEAPF32[r4>>2]=HEAPF32[r5>>2]+HEAPF32[r4>>2];r4=r2+4|0;r2=r1+80|0;HEAPF32[r2>>2]=HEAPF32[r4>>2]+HEAPF32[r2>>2];r2=r1+84|0;HEAPF32[r2>>2]=HEAPF32[r2>>2]+((HEAPF32[r3>>2]-HEAPF32[r1+44>>2])*HEAPF32[r4>>2]-(HEAPF32[r3+4>>2]-HEAPF32[r1+48>>2])*HEAPF32[r5>>2]);return}function _emscripten_bind_b2BlockAllocator__Allocate_p1(r1,r2){return __ZN16b2BlockAllocator8AllocateEi(r1,r2)}function _emscripten_bind_b2RopeJoint____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);return}function _emscripten_bind_b2RopeJoint__GetAnchorA_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264820]<<24>>24==0){if((___cxa_guard_acquire(5264820)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243084;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243084}function _emscripten_bind_b2RopeJoint__GetReactionTorque_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1,r2)}function _emscripten_bind_b2RopeJoint__Dump_p0(r1){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1);return}function _emscripten_bind_b2RopeJoint__GetAnchorB_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264812]<<24>>24==0){if((___cxa_guard_acquire(5264812)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5243076;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5243076}function _emscripten_bind_b2RopeJoint__GetReactionForce_p1(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;do{if(HEAP8[5264652]<<24>>24==0){if((___cxa_guard_acquire(5264652)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r4,r1,r2);r2=r4;r4=HEAP32[r2+4>>2];r1=5243068;HEAP32[r1>>2]=HEAP32[r2>>2];HEAP32[r1+4>>2]=r4;STACKTOP=r3;return 5243068}function _emscripten_bind_b2PolygonShape____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);return}function _emscripten_bind_b2PolygonShape__Set_p2(r1,r2,r3){__ZN14b2PolygonShape3SetEPK6b2Vec2i(r1,r2,r3);return}function _emscripten_bind_b2PolygonShape__ComputeMass_p2(r1,r2,r3){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+28>>2]](r1,r2,r3);return}function _emscripten_bind_b2PolygonShape__Clone_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1,r2)}function _emscripten_bind_b2PolygonShape__RayCast_p4(r1,r2,r3,r4,r5){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1,r2,r3,r4,r5)}function _emscripten_bind_b2PolygonShape__SetAsBox_p4(r1,r2,r3,r4,r5){__ZN14b2PolygonShape8SetAsBoxEffRK6b2Vec2f(r1,r2,r3,r4,r5);return}function _emscripten_bind_b2PolygonShape__ComputeAABB_p3(r1,r2,r3,r4){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1,r2,r3,r4);return}function _emscripten_bind_b2PolygonShape__GetChildCount_p0(r1){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1)}function _emscripten_bind_b2PolygonShape__TestPoint_p2(r1,r2,r3){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1,r2,r3)}function _emscripten_bind_b2PolygonShape__b2PolygonShape_p0(){var r1,r2;r1=__Znwj(152),r2=r1>>2;HEAP32[r2]=5262076;HEAP32[r2+1]=2;HEAPF32[r2+2]=.009999999776482582;HEAP32[r2+37]=0;HEAPF32[r2+3]=0;HEAPF32[r2+4]=0;return r1}function _emscripten_bind_b2EdgeShape____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);return}function _emscripten_bind_b2EdgeShape__ComputeMass_p2(r1,r2,r3){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+28>>2]](r1,r2,r3);return}function _emscripten_bind_b2EdgeShape__Clone_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1,r2)}function _emscripten_bind_b2EdgeShape__RayCast_p4(r1,r2,r3,r4,r5){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1,r2,r3,r4,r5)}function _emscripten_bind_b2EdgeShape__ComputeAABB_p3(r1,r2,r3,r4){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1,r2,r3,r4);return}function _emscripten_bind_b2EdgeShape__GetChildCount_p0(r1){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1)}function _emscripten_bind_b2EdgeShape__TestPoint_p2(r1,r2,r3){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1,r2,r3)}function _emscripten_bind_b2EdgeShape__b2EdgeShape_p0(){var r1,r2;r1=__Znwj(48),r2=r1>>2;HEAP32[r2]=5262520;HEAP32[r2+1]=1;HEAPF32[r2+2]=.009999999776482582;r2=r1+28|0;HEAP32[r2>>2]=0;HEAP32[r2+4>>2]=0;HEAP32[r2+8>>2]=0;HEAP32[r2+12>>2]=0;HEAP16[r2+16>>1]=0;return r1}function _emscripten_bind_b2Contact__GetWorldManifold_p1(r1,r2){var r3,r4;r3=HEAP32[r1+48>>2];r4=HEAP32[r1+52>>2];__ZN15b2WorldManifold10InitializeEPK10b2ManifoldRK11b2TransformfS5_f(r2,r1+64|0,HEAP32[r3+8>>2]+12|0,HEAPF32[HEAP32[r3+12>>2]+8>>2],HEAP32[r4+8>>2]+12|0,HEAPF32[HEAP32[r4+12>>2]+8>>2]);return}function _emscripten_bind_b2Contact__ResetFriction_p0(r1){HEAPF32[r1+136>>2]=Math.sqrt(HEAPF32[HEAP32[r1+48>>2]+16>>2]*HEAPF32[HEAP32[r1+52>>2]+16>>2]);return}function _emscripten_bind_b2Contact__Evaluate_p3(r1,r2,r3,r4){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]>>2]](r1,r2,r3,r4);return}function _emscripten_bind_b2Shape__ComputeMass_p2(r1,r2,r3){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+28>>2]](r1,r2,r3);return}function _emscripten_bind_b2Shape__Clone_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1,r2)}function _emscripten_bind_b2Shape__RayCast_p4(r1,r2,r3,r4,r5){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1,r2,r3,r4,r5)}function _emscripten_bind_b2Shape__ComputeAABB_p3(r1,r2,r3,r4){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1,r2,r3,r4);return}function _emscripten_bind_b2Shape__GetChildCount_p0(r1){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1)}function _emscripten_bind_b2Shape__TestPoint_p2(r1,r2,r3){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1,r2,r3)}function _emscripten_bind_b2Body__SetActive_p1(r1,r2){__ZN6b2Body9SetActiveEb(r1,r2);return}function _emscripten_bind_b2BlockAllocator__Free_p2(r1,r2,r3){var r4;if((r3|0)==0){return}if((r3|0)<=0){___assert_func(5248148,164,5259684,5251024)}if((r3|0)>640){_free(r2);return}r4=HEAP8[r3+5263852|0];if((r4&255)>=14){___assert_func(5248148,173,5259684,5249276)}r3=((r4&255)<<2)+r1+12|0;HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r3>>2]=r2;return}function _emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0(){var r1,r2,r3,r4,r5,r6,r7,r8;r1=0;r2=__Znwj(68),r3=r2>>2;r4=r2;HEAP32[r3+2]=128;HEAP32[r3+1]=0;r5=_malloc(1024);HEAP32[r3]=r5;_memset(r5,0,1024);_memset(r2+12|0,0,56);if((HEAP8[5263848]&1)<<24>>24==0){r6=0;r7=1}else{return r4}while(1){if((r6|0)>=14){r1=4062;break}if((r7|0)>(HEAP32[(r6<<2)+5264496>>2]|0)){r2=r6+1|0;HEAP8[r7+5263852|0]=r2&255;r8=r2}else{HEAP8[r7+5263852|0]=r6&255;r8=r6}r2=r7+1|0;if((r2|0)<641){r6=r8;r7=r2}else{r1=4068;break}}if(r1==4068){HEAP8[5263848]=1;return r4}else if(r1==4062){___assert_func(5248148,73,5259604,5253464)}}function _emscripten_bind_b2RopeJoint__b2RopeJoint_p1(r1){var r2,r3,r4,r5,r6,r7;r2=r1>>2;r3=__Znwj(168),r4=r3>>2;r5=r3;HEAP32[r5>>2]=5261468;r6=HEAP32[r2+2];r7=HEAP32[r2+3];if((r6|0)!=(r7|0)){HEAP32[r4+1]=HEAP32[r2];HEAP32[r4+2]=0;HEAP32[r4+3]=0;HEAP32[r4+12]=r6;HEAP32[r4+13]=r7;HEAP32[r4+14]=0;HEAP8[r3+61|0]=HEAP8[r1+16|0]&1;HEAP8[r3+60|0]=0;HEAP32[r4+16]=HEAP32[r2+1];_memset(r3+16|0,0,32);HEAP32[r5>>2]=5262416;r5=r1+20|0;r7=r3+68|0;r6=HEAP32[r5+4>>2];HEAP32[r7>>2]=HEAP32[r5>>2];HEAP32[r7+4>>2]=r6;r6=r1+28|0;r1=r3+76|0;r7=HEAP32[r6+4>>2];HEAP32[r1>>2]=HEAP32[r6>>2];HEAP32[r1+4>>2]=r7;HEAPF32[r4+21]=HEAPF32[r2+9];HEAPF32[r4+40]=0;HEAPF32[r4+23]=0;HEAP32[r4+41]=0;HEAPF32[r4+22]=0;return r3}___assert_func(5249968,173,5258024,5251672)}function _emscripten_bind_b2Body__SetLinearVelocity_p1(r1,r2){var r3,r4,r5,r6;if((HEAP32[r1>>2]|0)==0){return}r3=HEAPF32[r2>>2];r4=HEAPF32[r2+4>>2];do{if(r3*r3+r4*r4>0){r5=r1+4|0;r6=HEAP16[r5>>1];if((r6&2)<<16>>16!=0){break}HEAP16[r5>>1]=r6|2;HEAPF32[r1+144>>2]=0}}while(0);r4=r2;r2=r1+64|0;r1=HEAP32[r4+4>>2];HEAP32[r2>>2]=HEAP32[r4>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2Body__GetJointList_p0(r1){return HEAP32[r1+108>>2]}function _emscripten_bind_b2Body__GetNext_p0(r1){return HEAP32[r1+96>>2]}function _emscripten_bind_b2Body__SetSleepingAllowed_p1(r1,r2){var r3,r4;r3=(r1+4|0)>>1;r4=HEAP16[r3];if(r2){HEAP16[r3]=r4|4;return}r2=r4&-5;HEAP16[r3]=r2;if((r4&2)<<16>>16!=0){return}HEAP16[r3]=r2|2;HEAPF32[r1+144>>2]=0;return}function _emscripten_bind_b2Body__GetMass_p0(r1){return HEAPF32[r1+116>>2]}function _emscripten_bind_b2Body__SetAngularVelocity_p1(r1,r2){var r3,r4;if((HEAP32[r1>>2]|0)==0){return}do{if(r2*r2>0){r3=r1+4|0;r4=HEAP16[r3>>1];if((r4&2)<<16>>16!=0){break}HEAP16[r3>>1]=r4|2;HEAPF32[r1+144>>2]=0}}while(0);HEAPF32[r1+72>>2]=r2;return}function _emscripten_bind_b2Body__GetMassData_p1(r1,r2){var r3,r4,r5,r6;r3=r1+116|0;HEAPF32[r2>>2]=HEAPF32[r3>>2];r4=r1+28|0;r5=HEAPF32[r4>>2];r6=HEAPF32[r1+32>>2];HEAPF32[r2+12>>2]=HEAPF32[r1+124>>2]+HEAPF32[r3>>2]*(r5*r5+r6*r6);r6=r4;r4=r2+4|0;r2=HEAP32[r6+4>>2];HEAP32[r4>>2]=HEAP32[r6>>2];HEAP32[r4+4>>2]=r2;return}function _emscripten_bind_b2Body__ApplyForceToCenter_p1(r1,r2){var r3,r4;if((HEAP32[r1>>2]|0)!=2){return}r3=r1+4|0;r4=HEAP16[r3>>1];if((r4&2)<<16>>16==0){HEAP16[r3>>1]=r4|2;HEAPF32[r1+144>>2]=0}r4=r1+76|0;HEAPF32[r4>>2]=HEAPF32[r2>>2]+HEAPF32[r4>>2];r4=r1+80|0;HEAPF32[r4>>2]=HEAPF32[r2+4>>2]+HEAPF32[r4>>2];return}function _emscripten_bind_b2Body__ApplyTorque_p1(r1,r2){var r3,r4;if((HEAP32[r1>>2]|0)!=2){return}r3=r1+4|0;r4=HEAP16[r3>>1];if((r4&2)<<16>>16==0){HEAP16[r3>>1]=r4|2;HEAPF32[r1+144>>2]=0}r4=r1+84|0;HEAPF32[r4>>2]=HEAPF32[r4>>2]+r2;return}function _emscripten_bind_b2Body__IsAwake_p0(r1){return(HEAP16[r1+4>>1]&2)<<16>>16!=0}function _emscripten_bind_b2Body__GetTransform_p0(r1){return r1+12|0}function _emscripten_bind_b2Body__GetWorldCenter_p0(r1){return r1+44|0}function _emscripten_bind_b2Body__GetAngularDamping_p0(r1){return HEAPF32[r1+136>>2]}function _emscripten_bind_b2Body__ApplyLinearImpulse_p2(r1,r2,r3){var r4,r5,r6,r7,r8;r4=r1>>2;if((HEAP32[r4]|0)!=2){return}r5=r1+4|0;r6=HEAP16[r5>>1];if((r6&2)<<16>>16==0){HEAP16[r5>>1]=r6|2;HEAPF32[r4+36]=0}r6=HEAPF32[r4+30];r5=r2|0;r7=r2+4|0;r2=r6*HEAPF32[r7>>2];r8=r1+64|0;HEAPF32[r8>>2]=r6*HEAPF32[r5>>2]+HEAPF32[r8>>2];r8=r1+68|0;HEAPF32[r8>>2]=r2+HEAPF32[r8>>2];r8=r1+72|0;HEAPF32[r8>>2]=HEAPF32[r8>>2]+HEAPF32[r4+32]*((HEAPF32[r3>>2]-HEAPF32[r4+11])*HEAPF32[r7>>2]-(HEAPF32[r3+4>>2]-HEAPF32[r4+12])*HEAPF32[r5>>2]);return}function _emscripten_bind_b2Body__IsFixedRotation_p0(r1){return(HEAP16[r1+4>>1]&16)<<16>>16!=0}function _emscripten_bind_b2Body__GetLocalCenter_p0(r1){return r1+28|0}function _emscripten_bind_b2Body__GetContactList_p0(r1){return HEAP32[r1+112>>2]}function _emscripten_bind_b2Body__GetLinearDamping_p0(r1){return HEAPF32[r1+132>>2]}function _emscripten_bind_b2Body__IsBullet_p0(r1){return(HEAP16[r1+4>>1]&8)<<16>>16!=0}function _emscripten_bind_b2Body__GetWorld_p0(r1){return HEAP32[r1+88>>2]}function _emscripten_bind_b2Body__SetLinearDamping_p1(r1,r2){HEAPF32[r1+132>>2]=r2;return}function _emscripten_bind_b2Body__SetBullet_p1(r1,r2){var r3;r3=r1+4|0;r1=HEAP16[r3>>1];HEAP16[r3>>1]=r2?r1|8:r1&-9;return}function _emscripten_bind_b2Body__GetType_p0(r1){return HEAP32[r1>>2]}function _emscripten_bind_b2Body__GetGravityScale_p0(r1){return HEAPF32[r1+140>>2]}function _emscripten_bind_b2Body__GetInertia_p0(r1){var r2,r3;r2=HEAPF32[r1+28>>2];r3=HEAPF32[r1+32>>2];return HEAPF32[r1+124>>2]+HEAPF32[r1+116>>2]*(r2*r2+r3*r3)}function _emscripten_bind_b2Body__IsActive_p0(r1){return(HEAP16[r1+4>>1]&32)<<16>>16!=0}function _emscripten_bind_b2Body__ApplyAngularImpulse_p1(r1,r2){var r3,r4;if((HEAP32[r1>>2]|0)!=2){return}r3=r1+4|0;r4=HEAP16[r3>>1];if((r4&2)<<16>>16==0){HEAP16[r3>>1]=r4|2;HEAPF32[r1+144>>2]=0}r4=r1+72|0;HEAPF32[r4>>2]=HEAPF32[r4>>2]+HEAPF32[r1+128>>2]*r2;return}function _emscripten_bind_b2Body__GetPosition_p0(r1){return r1+12|0}function _emscripten_bind_b2FrictionJoint__GetMaxForce_p0(r1){return HEAPF32[r1+96>>2]}function _emscripten_bind_b2FrictionJoint__GetCollideConnected_p0(r1){return(HEAP8[r1+61|0]&1)<<24>>24!=0}function _emscripten_bind_b2FrictionJoint__GetUserData_p0(r1){return HEAP32[r1+64>>2]}function _emscripten_bind_b2FrictionJoint__GetType_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2FrictionJoint__GetBodyB_p0(r1){return HEAP32[r1+52>>2]}function _emscripten_bind_b2FrictionJoint__GetLocalAnchorA_p0(r1){return r1+68|0}function _emscripten_bind_b2Body__GetLocalPoint_p1(r1,r2){var r3,r4,r5,r6;do{if(HEAP8[5264868]<<24>>24==0){if((___cxa_guard_acquire(5264868)|0)==0){break}}}while(0);r3=HEAPF32[r2>>2]-HEAPF32[r1+12>>2];r4=HEAPF32[r2+4>>2]-HEAPF32[r1+16>>2];r2=HEAPF32[r1+24>>2];r5=HEAPF32[r1+20>>2];r1=(HEAPF32[tempDoublePtr>>2]=r3*r2+r4*r5,HEAP32[tempDoublePtr>>2]);r6=(HEAPF32[tempDoublePtr>>2]=r2*r4+r3*-r5,HEAP32[tempDoublePtr>>2])|0;r5=5243060;HEAP32[r5>>2]=0|r1;HEAP32[r5+4>>2]=r6;return 5243060}function _emscripten_bind_b2Body__GetLinearVelocity_p0(r1){var r2,r3;do{if(HEAP8[5264756]<<24>>24==0){if((___cxa_guard_acquire(5264756)|0)==0){break}}}while(0);r2=r1+64|0;r1=HEAP32[r2+4>>2];r3=5243052;HEAP32[r3>>2]=HEAP32[r2>>2];HEAP32[r3+4>>2]=r1;return 5243052}function _emscripten_bind_b2Body__SetTransform_p2(r1,r2,r3){__ZN6b2Body12SetTransformERK6b2Vec2f(r1,r2,r3);return}function _emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1(r1,r2){var r3,r4,r5;r3=r1>>2;do{if(HEAP8[5264556]<<24>>24==0){if((___cxa_guard_acquire(5264556)|0)==0){break}}}while(0);r1=HEAPF32[r3+18];r4=r1*(HEAPF32[r2>>2]-HEAPF32[r3+11])+HEAPF32[r3+17];r5=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r3+16]+(HEAPF32[r2+4>>2]-HEAPF32[r3+12])*-r1,HEAP32[tempDoublePtr>>2]);r1=(HEAPF32[tempDoublePtr>>2]=r4,HEAP32[tempDoublePtr>>2])|0;r4=5243044;HEAP32[r4>>2]=0|r5;HEAP32[r4+4>>2]=r1;return 5243044}function _emscripten_bind_b2Body__ResetMassData_p0(r1){__ZN6b2Body13ResetMassDataEv(r1);return}function _emscripten_bind_b2Body__SetType_p1(r1,r2){__ZN6b2Body7SetTypeE10b2BodyType(r1,r2);return}function _emscripten_bind_b2Body__CreateFixture_p1(r1,r2){return __ZN6b2Body13CreateFixtureEPK12b2FixtureDef(r1,r2)}function _emscripten_bind_b2Body__CreateFixture_p2(r1,r2,r3){var r4,r5;r4=STACKTOP;STACKTOP=STACKTOP+28|0;r5=r4;HEAP16[r5+22>>1]=1;HEAP16[r5+24>>1]=-1;HEAP16[r5+26>>1]=0;HEAP32[r5+4>>2]=0;HEAPF32[r5+8>>2]=.20000000298023224;HEAPF32[r5+12>>2]=0;HEAP8[r5+20|0]=0;HEAP32[r5>>2]=r2;HEAPF32[r5+16>>2]=r3;r3=__ZN6b2Body13CreateFixtureEPK12b2FixtureDef(r1,r5);STACKTOP=r4;return r3}function _emscripten_bind_b2Body__SetMassData_p1(r1,r2){__ZN6b2Body11SetMassDataEPK10b2MassData(r1,r2);return}function _emscripten_bind_b2Body__GetWorldVector_p1(r1,r2){var r3,r4,r5,r6;do{if(HEAP8[5264844]<<24>>24==0){if((___cxa_guard_acquire(5264844)|0)==0){break}}}while(0);r3=HEAPF32[r1+24>>2];r4=HEAPF32[r2>>2];r5=HEAPF32[r1+20>>2];r1=HEAPF32[r2+4>>2];r2=(HEAPF32[tempDoublePtr>>2]=r3*r4-r5*r1,HEAP32[tempDoublePtr>>2]);r6=(HEAPF32[tempDoublePtr>>2]=r4*r5+r3*r1,HEAP32[tempDoublePtr>>2])|0;r1=5243036;HEAP32[r1>>2]=0|r2;HEAP32[r1+4>>2]=r6;return 5243036}function _emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1(r1,r2){var r3,r4,r5,r6,r7,r8;r3=r1>>2;do{if(HEAP8[5264564]<<24>>24==0){if((___cxa_guard_acquire(5264564)|0)==0){break}}}while(0);r1=HEAPF32[r3+6];r4=HEAPF32[r2>>2];r5=HEAPF32[r3+5];r6=HEAPF32[r2+4>>2];r2=HEAPF32[r3+18];r7=r2*(HEAPF32[r3+3]+(r1*r4-r5*r6)-HEAPF32[r3+11])+HEAPF32[r3+17];r8=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r3+16]+(r4*r5+r1*r6+HEAPF32[r3+4]-HEAPF32[r3+12])*-r2,HEAP32[tempDoublePtr>>2]);r2=(HEAPF32[tempDoublePtr>>2]=r7,HEAP32[tempDoublePtr>>2])|0;r7=5243028;HEAP32[r7>>2]=0|r8;HEAP32[r7+4>>2]=r2;return 5243028}function _emscripten_bind_b2Body__GetWorldPoint_p1(r1,r2){var r3,r4,r5,r6,r7;do{if(HEAP8[5264860]<<24>>24==0){if((___cxa_guard_acquire(5264860)|0)==0){break}}}while(0);r3=HEAPF32[r1+24>>2];r4=HEAPF32[r2>>2];r5=HEAPF32[r1+20>>2];r6=HEAPF32[r2+4>>2];r2=r4*r5+r3*r6+HEAPF32[r1+16>>2];r7=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r1+12>>2]+(r3*r4-r5*r6),HEAP32[tempDoublePtr>>2]);r6=(HEAPF32[tempDoublePtr>>2]=r2,HEAP32[tempDoublePtr>>2])|0;r2=5243020;HEAP32[r2>>2]=0|r7;HEAP32[r2+4>>2]=r6;return 5243020}function _emscripten_bind_b2Body__SetAwake_p1(r1,r2){var r3,r4;r3=(r1+4|0)>>1;r4=HEAP16[r3];if(!r2){HEAP16[r3]=r4&-3;HEAPF32[r1+144>>2]=0;r2=(r1+64|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;return}if((r4&2)<<16>>16!=0){return}HEAP16[r3]=r4|2;HEAPF32[r1+144>>2]=0;return}function _emscripten_bind_b2Body__GetLocalVector_p1(r1,r2){var r3,r4,r5,r6;do{if(HEAP8[5264852]<<24>>24==0){if((___cxa_guard_acquire(5264852)|0)==0){break}}}while(0);r3=HEAPF32[r1+24>>2];r4=HEAPF32[r2>>2];r5=HEAPF32[r1+20>>2];r1=HEAPF32[r2+4>>2];r2=(HEAPF32[tempDoublePtr>>2]=r3*r4+r5*r1,HEAP32[tempDoublePtr>>2]);r6=(HEAPF32[tempDoublePtr>>2]=r4*-r5+r3*r1,HEAP32[tempDoublePtr>>2])|0;r1=5243012;HEAP32[r1>>2]=0|r2;HEAP32[r1+4>>2]=r6;return 5243012}function _emscripten_bind_b2Body__Dump_p0(r1){__ZN6b2Body4DumpEv(r1);return}function _emscripten_bind_b2Body__DestroyFixture_p1(r1,r2){__ZN6b2Body14DestroyFixtureEP9b2Fixture(r1,r2);return}function _emscripten_bind_b2Body__SetFixedRotation_p1(r1,r2){var r3,r4;r3=r1+4|0;r4=HEAP16[r3>>1];HEAP16[r3>>1]=r2?r4|16:r4&-17;__ZN6b2Body13ResetMassDataEv(r1);return}function _emscripten_bind_b2FrictionJoint__GetAnchorA_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264708]<<24>>24==0){if((___cxa_guard_acquire(5264708)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5242996;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5242996}function _emscripten_bind_b2FrictionJoint__GetReactionTorque_p1(r1,r2){return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1,r2)}function _emscripten_bind_b2FrictionJoint__Dump_p0(r1){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1);return}function _emscripten_bind_b2FrictionJoint____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);return}function _emscripten_bind_b2FrictionJoint__SetMaxTorque_p1(r1,r2){do{if(!isNaN(r2)&!isNaN(0)&r2>-Infinity){if(!(r2<Infinity&r2>=0)){break}HEAPF32[r1+100>>2]=r2;return}}while(0);___assert_func(5250304,228,5259780,5251912)}function _emscripten_bind_b2FrictionJoint__SetMaxForce_p1(r1,r2){do{if(!isNaN(r2)&!isNaN(0)&r2>-Infinity){if(!(r2<Infinity&r2>=0)){break}HEAPF32[r1+96>>2]=r2;return}}while(0);___assert_func(5250304,217,5259824,5254196)}function _emscripten_bind_b2FrictionJoint__GetLocalAnchorB_p0(r1){return r1+76|0}function _emscripten_bind_b2FrictionJoint__SetUserData_p1(r1,r2){HEAP32[r1+64>>2]=r2;return}function _emscripten_bind_b2FrictionJoint__GetBodyA_p0(r1){return HEAP32[r1+48>>2]}function _emscripten_bind_b2FrictionJoint__GetNext_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2FrictionJoint__GetMaxTorque_p0(r1){return HEAPF32[r1+100>>2]}function _emscripten_bind_b2FrictionJoint__IsActive_p0(r1){var r2;if((HEAP16[HEAP32[r1+48>>2]+4>>1]&32)<<16>>16==0){r2=0;return r2}r2=(HEAP16[HEAP32[r1+52>>2]+4>>1]&32)<<16>>16!=0;return r2}function _emscripten_bind_b2StackAllocator__GetMaxAllocation_p0(r1){return HEAP32[r1+102408>>2]}function _emscripten_bind_b2Filter__set_maskBits_p1(r1,r2){HEAP16[r1+2>>1]=r2;return}function _emscripten_bind_b2Filter__set_categoryBits_p1(r1,r2){HEAP16[r1>>1]=r2;return}function _emscripten_bind_b2Filter__get_groupIndex_p0(r1){return HEAP16[r1+4>>1]}function _emscripten_bind_b2Filter__set_groupIndex_p1(r1,r2){HEAP16[r1+4>>1]=r2;return}function _emscripten_bind_b2Filter__get_maskBits_p0(r1){return HEAP16[r1+2>>1]}function _emscripten_bind_b2Filter__get_categoryBits_p0(r1){return HEAP16[r1>>1]}function _emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1(r1,r2){var r3;r3=r2;r2=r1+20|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2FrictionJointDef__get_bodyA_p1(r1,r2){return HEAP32[r1+8>>2]}function _emscripten_bind_b2FrictionJointDef__get_bodyB_p1(r1,r2){return HEAP32[r1+12>>2]}function _emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1(r1,r2){var r3;r3=r2;r2=r1+28|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2FrictionJointDef__set_bodyA_p1(r1,r2){HEAP32[r1+8>>2]=r2;return}function _emscripten_bind_b2FrictionJointDef__set_bodyB_p1(r1,r2){HEAP32[r1+12>>2]=r2;return}function _emscripten_bind_b2FrictionJointDef__get_maxForce_p0(r1){return HEAPF32[r1+36>>2]}function _emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0(r1){return r1+20|0}function _emscripten_bind_b2FrictionJointDef__set_maxForce_p1(r1,r2){HEAPF32[r1+36>>2]=r2;return}function _emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0(r1){return r1+28|0}function _emscripten_bind_b2FrictionJointDef__get_collideConnected_p1(r1,r2){return(HEAP8[r1+16|0]&1)<<24>>24!=0}function _emscripten_bind_b2FrictionJointDef__set_maxTorque_p1(r1,r2){HEAPF32[r1+40>>2]=r2;return}function _emscripten_bind_b2FrictionJointDef__set_collideConnected_p1(r1,r2){HEAP8[r1+16|0]=r2&1;return}function _emscripten_bind_b2FrictionJointDef__Initialize_p3(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11;HEAP32[r1+8>>2]=r2;HEAP32[r1+12>>2]=r3;r5=r4|0;r6=HEAPF32[r5>>2]-HEAPF32[r2+12>>2];r7=r4+4|0;r4=HEAPF32[r7>>2]-HEAPF32[r2+16>>2];r8=HEAPF32[r2+24>>2];r9=HEAPF32[r2+20>>2];r2=r1+20|0;r10=(HEAPF32[tempDoublePtr>>2]=r6*r8+r4*r9,HEAP32[tempDoublePtr>>2]);r11=(HEAPF32[tempDoublePtr>>2]=r8*r4+r6*-r9,HEAP32[tempDoublePtr>>2])|0;HEAP32[r2>>2]=0|r10;HEAP32[r2+4>>2]=r11;r11=HEAPF32[r5>>2]-HEAPF32[r3+12>>2];r5=HEAPF32[r7>>2]-HEAPF32[r3+16>>2];r7=HEAPF32[r3+24>>2];r2=HEAPF32[r3+20>>2];r3=r1+28|0;r1=(HEAPF32[tempDoublePtr>>2]=r11*r7+r5*r2,HEAP32[tempDoublePtr>>2]);r10=(HEAPF32[tempDoublePtr>>2]=r7*r5+r11*-r2,HEAP32[tempDoublePtr>>2])|0;HEAP32[r3>>2]=0|r1;HEAP32[r3+4>>2]=r10;return}function _emscripten_bind_b2FrictionJointDef__get_maxTorque_p0(r1){return HEAPF32[r1+40>>2]}function _emscripten_bind_b2BodyDef__get_linearDamping_p0(r1){return HEAPF32[r1+28>>2]}function _emscripten_bind_b2BodyDef__get_awake_p0(r1){return(HEAP8[r1+37|0]&1)<<24>>24!=0}function _emscripten_bind_b2BodyDef__get_type_p0(r1){return HEAP32[r1>>2]}function _emscripten_bind_b2BodyDef__get_allowSleep_p0(r1){return(HEAP8[r1+36|0]&1)<<24>>24!=0}function _emscripten_bind_b2BodyDef__set_position_p1(r1,r2){var r3;r3=r2;r2=r1+4|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2BodyDef__set_linearVelocity_p1(r1,r2){var r3;r3=r2;r2=r1+16|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2BodyDef__get_bullet_p0(r1){return(HEAP8[r1+39|0]&1)<<24>>24!=0}function _emscripten_bind_b2BodyDef__get_userData_p0(r1){return HEAP32[r1+44>>2]}function _emscripten_bind_b2BodyDef__set_angularDamping_p1(r1,r2){HEAPF32[r1+32>>2]=r2;return}function _emscripten_bind_b2BodyDef__set_fixedRotation_p1(r1,r2){HEAP8[r1+38|0]=r2&1;return}function _emscripten_bind_b2BodyDef__set_allowSleep_p1(r1,r2){HEAP8[r1+36|0]=r2&1;return}function _emscripten_bind_b2BodyDef__get_gravityScale_p0(r1){return HEAPF32[r1+48>>2]}function _emscripten_bind_b2BodyDef__set_angularVelocity_p1(r1,r2){HEAPF32[r1+24>>2]=r2;return}function _emscripten_bind_b2BodyDef__set_userData_p1(r1,r2){HEAP32[r1+44>>2]=r2;return}function _emscripten_bind_b2BodyDef__get_position_p0(r1){return r1+4|0}function _emscripten_bind_b2BodyDef__set_type_p1(r1,r2){HEAP32[r1>>2]=r2;return}function _emscripten_bind_b2BodyDef__set_gravityScale_p1(r1,r2){HEAPF32[r1+48>>2]=r2;return}function _emscripten_bind_b2BodyDef__get_angularDamping_p0(r1){return HEAPF32[r1+32>>2]}function _emscripten_bind_b2BodyDef__set_bullet_p1(r1,r2){HEAP8[r1+39|0]=r2&1;return}function _emscripten_bind_b2BodyDef__set_active_p1(r1,r2){HEAP8[r1+40|0]=r2&1;return}function _emscripten_bind_b2BodyDef__set_angle_p1(r1,r2){HEAPF32[r1+12>>2]=r2;return}function _emscripten_bind_b2BodyDef__get_angle_p0(r1){return HEAPF32[r1+12>>2]}function _emscripten_bind_b2BodyDef__get_angularVelocity_p0(r1){return HEAPF32[r1+24>>2]}function _emscripten_bind_b2BodyDef__get_linearVelocity_p0(r1){return r1+16|0}function _emscripten_bind_b2BodyDef__get_active_p0(r1){return(HEAP8[r1+40|0]&1)<<24>>24!=0}function _emscripten_bind_b2BodyDef__set_linearDamping_p1(r1,r2){HEAPF32[r1+28>>2]=r2;return}function _emscripten_bind_b2BodyDef__get_fixedRotation_p0(r1){return(HEAP8[r1+38|0]&1)<<24>>24!=0}function _emscripten_bind_b2BodyDef__set_awake_p1(r1,r2){HEAP8[r1+37|0]=r2&1;return}function _emscripten_bind_b2Vec2__set_x_p1(r1,r2){HEAPF32[r1>>2]=r2;return}function _emscripten_bind_b2Vec2__Set_p2(r1,r2,r3){HEAPF32[r1>>2]=r2;HEAPF32[r1+4>>2]=r3;return}function _emscripten_bind_b2Vec2__get_x_p0(r1){return HEAPF32[r1>>2]}function _emscripten_bind_b2Vec2__get_y_p0(r1){return HEAPF32[r1+4>>2]}function _emscripten_bind_b2Vec2__set_y_p1(r1,r2){HEAPF32[r1+4>>2]=r2;return}function _emscripten_bind_b2Vec2__IsValid_p0(r1){var r2,r3;r2=HEAPF32[r1>>2];if(!(!isNaN(r2)&!isNaN(0)&r2>-Infinity&r2<Infinity)){r3=0;return r3}r2=HEAPF32[r1+4>>2];if(!(!isNaN(r2)&!isNaN(0)&r2>-Infinity)){r3=0;return r3}r3=r2<Infinity;return r3}function _emscripten_bind_b2Vec2__LengthSquared_p0(r1){var r2,r3;r2=HEAPF32[r1>>2];r3=HEAPF32[r1+4>>2];return r2*r2+r3*r3}function _emscripten_bind_b2Vec2__op_add_p1(r1,r2){var r3;r3=r1|0;HEAPF32[r3>>2]=HEAPF32[r2>>2]+HEAPF32[r3>>2];r3=r1+4|0;HEAPF32[r3>>2]=HEAPF32[r2+4>>2]+HEAPF32[r3>>2];return}function _emscripten_bind_b2Vec2__SetZero_p0(r1){HEAPF32[r1>>2]=0;HEAPF32[r1+4>>2]=0;return}function _emscripten_bind_b2Vec2__op_mul_p1(r1,r2){var r3;r3=r1|0;HEAPF32[r3>>2]=HEAPF32[r3>>2]*r2;r3=r1+4|0;HEAPF32[r3>>2]=HEAPF32[r3>>2]*r2;return}function _emscripten_bind_b2Vec3__set_z_p1(r1,r2){HEAPF32[r1+8>>2]=r2;return}function _emscripten_bind_b2FrictionJoint__GetAnchorB_p0(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;do{if(HEAP8[5264700]<<24>>24==0){if((___cxa_guard_acquire(5264700)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r3,r1);r1=r3;r3=HEAP32[r1+4>>2];r4=5242988;HEAP32[r4>>2]=HEAP32[r1>>2];HEAP32[r4+4>>2]=r3;STACKTOP=r2;return 5242988}function _emscripten_bind_b2FrictionJoint__GetReactionForce_p1(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;do{if(HEAP8[5264588]<<24>>24==0){if((___cxa_guard_acquire(5264588)|0)==0){break}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r4,r1,r2);r2=r4;r4=HEAP32[r2+4>>2];r1=5242980;HEAP32[r1>>2]=HEAP32[r2>>2];HEAP32[r1+4>>2]=r4;STACKTOP=r3;return 5242980}function _emscripten_bind_b2StackAllocator__b2StackAllocator_p0(){var r1,r2;r1=__Znwj(102800),r2=r1>>2;HEAP32[r2+25600]=0;HEAP32[r2+25601]=0;HEAP32[r2+25602]=0;HEAP32[r2+25699]=0;return r1}function _emscripten_bind_b2StackAllocator__Free_p1(r1,r2){__ZN16b2StackAllocator4FreeEPv(r1,r2);return}function _emscripten_bind_b2DestructionListener____destroy___p0(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);return}function _emscripten_bind_b2DestructionListener__SayGoodbye_p1(r1,r2){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1,r2);return}function _emscripten_bind_b2DestructionListener__b2DestructionListener_p0(){var r1;r1=__Znwj(4);HEAP32[r1>>2]=5261684;return r1}function _emscripten_bind_b2Filter____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2Filter__b2Filter_p0(){var r1,r2;r1=__Znwj(6),r2=r1>>1;HEAP16[r2]=1;HEAP16[r2+1]=-1;HEAP16[r2+2]=0;return r1}function _emscripten_bind_b2FrictionJointDef____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0(){var r1,r2,r3;r1=__Znwj(44),r2=r1>>2;r3=r1;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP8[r1+16|0]=0;HEAP32[r2]=9;r2=(r1+20|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;return r3}function _emscripten_bind_b2BodyDef__b2BodyDef_p0(){var r1,r2;r1=__Znwj(52),r2=r1>>2;HEAP32[r2+11]=0;_memset(r1+4|0,0,32);HEAP8[r1+36|0]=1;HEAP8[r1+37|0]=1;HEAP8[r1+38|0]=0;HEAP8[r1+39|0]=0;HEAP32[r2]=0;HEAP8[r1+40|0]=1;HEAPF32[r2+12]=1;return r1}function _emscripten_bind_b2BodyDef____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2Vec2__Normalize_p0(r1){var r2,r3,r4,r5,r6,r7;r2=r1|0;r3=HEAPF32[r2>>2];r4=r1+4|0;r1=HEAPF32[r4>>2];r5=Math.sqrt(r3*r3+r1*r1);if(r5<1.1920928955078125e-7){r6=0;return r6}r7=1/r5;HEAPF32[r2>>2]=r3*r7;HEAPF32[r4>>2]=r1*r7;r6=r5;return r6}function _emscripten_bind_b2Vec2__b2Vec2_p0(){return __Znwj(8)}function _emscripten_bind_b2Vec2__b2Vec2_p2(r1,r2){var r3;r3=__Znwj(8);HEAPF32[r3>>2]=r1;HEAPF32[r3+4>>2]=r2;return r3}function _emscripten_bind_b2Vec2__Skew_p0(r1){var r2,r3;do{if(HEAP8[5264948]<<24>>24==0){if((___cxa_guard_acquire(5264948)|0)==0){break}}}while(0);r2=HEAPF32[r1>>2];r3=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r1+4>>2],HEAP32[tempDoublePtr>>2]);r1=(HEAPF32[tempDoublePtr>>2]=r2,HEAP32[tempDoublePtr>>2])|0;r2=5242972;HEAP32[r2>>2]=0|r3;HEAP32[r2+4>>2]=r1;return 5242972}function _emscripten_bind_b2Vec2__Length_p0(r1){var r2,r3;r2=HEAPF32[r1>>2];r3=HEAPF32[r1+4>>2];return Math.sqrt(r2*r2+r3*r3)}function _emscripten_bind_b2Vec2____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2Vec2__op_sub_p0(r1){var r2,r3;do{if(HEAP8[5264940]<<24>>24==0){if((___cxa_guard_acquire(5264940)|0)==0){break}}}while(0);r2=-HEAPF32[r1+4>>2];r3=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r1>>2],HEAP32[tempDoublePtr>>2]);r1=(HEAPF32[tempDoublePtr>>2]=r2,HEAP32[tempDoublePtr>>2])|0;r2=5242964;HEAP32[r2>>2]=0|r3;HEAP32[r2+4>>2]=r1;return 5242964}function _emscripten_bind_b2Vec3____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2FrictionJoint__b2FrictionJoint_p1(r1){var r2,r3,r4,r5,r6,r7;r2=r1>>2;r3=__Znwj(180),r4=r3>>2;r5=r3;HEAP32[r5>>2]=5261468;r6=HEAP32[r2+2];r7=HEAP32[r2+3];if((r6|0)!=(r7|0)){HEAP32[r4+1]=HEAP32[r2];HEAP32[r4+2]=0;HEAP32[r4+3]=0;HEAP32[r4+12]=r6;HEAP32[r4+13]=r7;HEAP32[r4+14]=0;HEAP8[r3+61|0]=HEAP8[r1+16|0]&1;HEAP8[r3+60|0]=0;HEAP32[r4+16]=HEAP32[r2+1];_memset(r3+16|0,0,32);HEAP32[r5>>2]=5261924;r5=r1+20|0;r7=r3+68|0;r6=HEAP32[r5+4>>2];HEAP32[r7>>2]=HEAP32[r5>>2];HEAP32[r7+4>>2]=r6;r6=r1+28|0;r1=r3+76|0;r7=HEAP32[r6+4>>2];HEAP32[r1>>2]=HEAP32[r6>>2];HEAP32[r1+4>>2]=r7;HEAPF32[r4+21]=0;HEAPF32[r4+22]=0;HEAPF32[r4+23]=0;HEAPF32[r4+24]=HEAPF32[r2+9];HEAPF32[r4+25]=HEAPF32[r2+10];return r3}___assert_func(5249968,173,5258024,5251672)}function _emscripten_bind_b2StackAllocator____destroy___p0(r1){if((r1|0)==0){return}if((HEAP32[r1+102400>>2]|0)!=0){___assert_func(5247660,32,5259244,5253168)}if((HEAP32[r1+102796>>2]|0)==0){__ZdlPv(r1|0);return}else{___assert_func(5247660,33,5259244,5250624)}}function _emscripten_bind_b2StackAllocator__Allocate_p1(r1,r2){var r3,r4,r5,r6,r7;r3=(r1+102796|0)>>2;r4=HEAP32[r3];if((r4|0)>=32){___assert_func(5247660,38,5259284,5249184)}r5=(r1+(r4*12&-1)+102412|0)>>2;HEAP32[r1+(r4*12&-1)+102416>>2]=r2;r6=(r1+102400|0)>>2;r7=HEAP32[r6];if((r7+r2|0)>102400){HEAP32[r5]=_malloc(r2);HEAP8[r1+(r4*12&-1)+102420|0]=1}else{HEAP32[r5]=r1+r7|0;HEAP8[r1+(r4*12&-1)+102420|0]=0;HEAP32[r6]=HEAP32[r6]+r2|0}r6=r1+102404|0;r4=HEAP32[r6>>2]+r2|0;HEAP32[r6>>2]=r4;r6=r1+102408|0;r1=HEAP32[r6>>2];HEAP32[r6>>2]=(r1|0)>(r4|0)?r1:r4;HEAP32[r3]=HEAP32[r3]+1|0;return HEAP32[r5]}function _emscripten_bind_b2Vec3__Set_p3(r1,r2,r3,r4){HEAPF32[r1>>2]=r2;HEAPF32[r1+4>>2]=r3;HEAPF32[r1+8>>2]=r4;return}function _emscripten_bind_b2Vec3__get_z_p0(r1){return HEAPF32[r1+8>>2]}function _emscripten_bind_b2Vec3__op_add_p1(r1,r2){var r3;r3=r1|0;HEAPF32[r3>>2]=HEAPF32[r2>>2]+HEAPF32[r3>>2];r3=r1+4|0;HEAPF32[r3>>2]=HEAPF32[r2+4>>2]+HEAPF32[r3>>2];r3=r1+8|0;HEAPF32[r3>>2]=HEAPF32[r2+8>>2]+HEAPF32[r3>>2];return}function _emscripten_bind_b2Vec3__SetZero_p0(r1){HEAPF32[r1>>2]=0;HEAPF32[r1+4>>2]=0;HEAPF32[r1+8>>2]=0;return}function _emscripten_bind_b2Vec3__op_mul_p1(r1,r2){var r3;r3=r1|0;HEAPF32[r3>>2]=HEAPF32[r3>>2]*r2;r3=r1+4|0;HEAPF32[r3>>2]=HEAPF32[r3>>2]*r2;r3=r1+8|0;HEAPF32[r3>>2]=HEAPF32[r3>>2]*r2;return}function _emscripten_bind_b2DistanceProxy__get_m_radius_p0(r1){return HEAPF32[r1+24>>2]}function _emscripten_bind_b2DistanceProxy__set_m_radius_p1(r1,r2){HEAPF32[r1+24>>2]=r2;return}function _emscripten_bind_b2DistanceProxy__get_m_vertices_p0(r1){return HEAP32[r1+16>>2]}function _emscripten_bind_b2DistanceProxy__GetSupportVertex_p1(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r3=HEAP32[r1+16>>2],r4=r3>>2;r5=HEAP32[r1+20>>2];if((r5|0)<=1){r6=0;r7=(r6<<3)+r3|0;return r7}r1=HEAPF32[r2+4>>2];r8=HEAPF32[r2>>2];r2=r1*HEAPF32[r4+1]+r8*HEAPF32[r4];r9=1;r10=0;while(1){r11=r8*HEAPF32[(r9<<3>>2)+r4]+r1*HEAPF32[((r9<<3)+4>>2)+r4];r12=r11>r2;r13=r12?r9:r10;r14=r9+1|0;if((r14|0)==(r5|0)){r6=r13;break}else{r2=r12?r11:r2;r9=r14;r10=r13}}r7=(r6<<3)+r3|0;return r7}function _emscripten_bind_b2DistanceProxy__get_m_count_p0(r1){return HEAP32[r1+20>>2]}function _emscripten_bind_b2DistanceProxy__GetVertexCount_p0(r1){return HEAP32[r1+20>>2]}function _emscripten_bind_b2DistanceProxy__GetSupport_p1(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r3=HEAP32[r1+16>>2]>>2;r4=HEAP32[r1+20>>2];if((r4|0)<=1){r5=0;return r5}r1=HEAPF32[r2+4>>2];r6=HEAPF32[r2>>2];r2=r1*HEAPF32[r3+1]+r6*HEAPF32[r3];r7=1;r8=0;while(1){r9=r6*HEAPF32[(r7<<3>>2)+r3]+r1*HEAPF32[((r7<<3)+4>>2)+r3];r10=r9>r2;r11=r10?r7:r8;r12=r7+1|0;if((r12|0)==(r4|0)){r5=r11;break}else{r2=r10?r9:r2;r7=r12;r8=r11}}return r5}function _emscripten_bind_b2DistanceProxy__set_m_vertices_p1(r1,r2){HEAP32[r1+16>>2]=r2;return}function _emscripten_bind_b2DistanceProxy__set_m_count_p1(r1,r2){HEAP32[r1+20>>2]=r2;return}function _emscripten_bind_b2FixtureDef__get_isSensor_p0(r1){return(HEAP8[r1+20|0]&1)<<24>>24!=0}function _emscripten_bind_b2FixtureDef__set_userData_p1(r1,r2){HEAP32[r1+4>>2]=r2;return}function _emscripten_bind_b2FixtureDef__set_shape_p1(r1,r2){HEAP32[r1>>2]=r2;return}function _emscripten_bind_b2FixtureDef__get_density_p0(r1){return HEAPF32[r1+16>>2]}function _emscripten_bind_b2FixtureDef__get_shape_p0(r1){return HEAP32[r1>>2]}function _emscripten_bind_b2FixtureDef__set_density_p1(r1,r2){HEAPF32[r1+16>>2]=r2;return}function _emscripten_bind_b2FixtureDef__set_restitution_p1(r1,r2){HEAPF32[r1+12>>2]=r2;return}function _emscripten_bind_b2FixtureDef__get_restitution_p0(r1){return HEAPF32[r1+12>>2]}function _emscripten_bind_b2FixtureDef__set_isSensor_p1(r1,r2){HEAP8[r1+20|0]=r2&1;return}function _emscripten_bind_b2FixtureDef__get_filter_p0(r1){return r1+22|0}function _emscripten_bind_b2FixtureDef__get_friction_p0(r1){return HEAPF32[r1+8>>2]}function _emscripten_bind_b2FixtureDef__set_friction_p1(r1,r2){HEAPF32[r1+8>>2]=r2;return}function _emscripten_bind_b2FixtureDef__get_userData_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2Manifold__get_localPoint_p0(r1){return r1+48|0}function _emscripten_bind_b2Manifold__set_localPoint_p1(r1,r2){var r3;r3=r2;r2=r1+48|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2Manifold__set_localNormal_p1(r1,r2){var r3;r3=r2;r2=r1+40|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2Manifold__set_type_p1(r1,r2){HEAP32[r1+56>>2]=r2;return}function _emscripten_bind_b2Manifold__get_pointCount_p0(r1){return HEAP32[r1+60>>2]}function _emscripten_bind_b2Manifold__get_type_p0(r1){return HEAP32[r1+56>>2]}function _emscripten_bind_b2Manifold__set_pointCount_p1(r1,r2){HEAP32[r1+60>>2]=r2;return}function _emscripten_bind_b2Manifold__get_localNormal_p0(r1){return r1+40|0}function _emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1(r1,r2){var r3;r3=r2;r2=r1+20|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1(r1,r2){var r3;r3=r2;r2=r1+28|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0(r1){return HEAPF32[r1+68>>2]}function _emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0(r1){return(HEAP8[r1+60|0]&1)<<24>>24!=0}function _emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0(r1){return HEAPF32[r1+44>>2]}function _emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1(r1,r2){HEAP8[r1+48|0]=r2&1;return}function _emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1(r1,r2){HEAPF32[r1+68>>2]=r2;return}function _emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0(r1){return r1+36|0}function _emscripten_bind_b2PrismaticJointDef__set_bodyA_p1(r1,r2){HEAP32[r1+8>>2]=r2;return}function _emscripten_bind_b2PrismaticJointDef__set_bodyB_p1(r1,r2){HEAP32[r1+12>>2]=r2;return}function _emscripten_bind_b2PrismaticJointDef__Initialize_p4(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r6=r3>>2;HEAP32[r1+8>>2]=r2;HEAP32[r1+12>>2]=r3;r3=r4|0;r7=HEAPF32[r3>>2]-HEAPF32[r2+12>>2];r8=r4+4|0;r4=HEAPF32[r8>>2]-HEAPF32[r2+16>>2];r9=r2+24|0;r10=HEAPF32[r9>>2];r11=r2+20|0;r12=HEAPF32[r11>>2];r13=r1+20|0;r14=(HEAPF32[tempDoublePtr>>2]=r7*r10+r4*r12,HEAP32[tempDoublePtr>>2]);r15=(HEAPF32[tempDoublePtr>>2]=r10*r4+r7*-r12,HEAP32[tempDoublePtr>>2])|0;HEAP32[r13>>2]=0|r14;HEAP32[r13+4>>2]=r15;r15=HEAPF32[r3>>2]-HEAPF32[r6+3];r3=HEAPF32[r8>>2]-HEAPF32[r6+4];r8=HEAPF32[r6+6];r13=HEAPF32[r6+5];r14=r1+28|0;r12=(HEAPF32[tempDoublePtr>>2]=r15*r8+r3*r13,HEAP32[tempDoublePtr>>2]);r7=(HEAPF32[tempDoublePtr>>2]=r8*r3+r15*-r13,HEAP32[tempDoublePtr>>2])|0;HEAP32[r14>>2]=0|r12;HEAP32[r14+4>>2]=r7;r7=HEAPF32[r9>>2];r9=HEAPF32[r5>>2];r14=HEAPF32[r11>>2];r11=HEAPF32[r5+4>>2];r5=r1+36|0;r12=(HEAPF32[tempDoublePtr>>2]=r7*r9+r14*r11,HEAP32[tempDoublePtr>>2]);r13=(HEAPF32[tempDoublePtr>>2]=r9*-r14+r7*r11,HEAP32[tempDoublePtr>>2])|0;HEAP32[r5>>2]=0|r12;HEAP32[r5+4>>2]=r13;HEAPF32[r1+44>>2]=HEAPF32[r6+14]-HEAPF32[r2+56>>2];return}function _emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1(r1,r2){HEAPF32[r1+52>>2]=r2;return}function _emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0(r1){return HEAPF32[r1+56>>2]}function _emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0(r1){return(HEAP8[r1+48|0]&1)<<24>>24!=0}function _emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1(r1,r2){HEAPF32[r1+44>>2]=r2;return}function _emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0(r1){return r1+20|0}function _emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0(r1){return r1+28|0}function _emscripten_bind_b2PrismaticJointDef__get_collideConnected_p1(r1,r2){return(HEAP8[r1+16|0]&1)<<24>>24!=0}function _emscripten_bind_b2PrismaticJointDef__get_bodyA_p1(r1,r2){return HEAP32[r1+8>>2]}function _emscripten_bind_b2PrismaticJointDef__get_bodyB_p1(r1,r2){return HEAP32[r1+12>>2]}function _emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1(r1,r2){HEAPF32[r1+56>>2]=r2;return}function _emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0(r1){return HEAPF32[r1+64>>2]}function _emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1(r1,r2){HEAPF32[r1+64>>2]=r2;return}function _emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1(r1,r2){HEAP8[r1+60|0]=r2&1;return}function _emscripten_bind_b2PrismaticJointDef__set_collideConnected_p1(r1,r2){HEAP8[r1+16|0]=r2&1;return}function _emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0(r1){return HEAPF32[r1+52>>2]}function _emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1(r1,r2){var r3;r3=r2;r2=r1+36|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2Rot__set_c_p1(r1,r2){HEAPF32[r1+4>>2]=r2;return}function _emscripten_bind_b2Rot__SetIdentity_p0(r1){HEAPF32[r1>>2]=0;HEAPF32[r1+4>>2]=1;return}function _emscripten_bind_b2Rot__get_c_p0(r1){return HEAPF32[r1+4>>2]}function _emscripten_bind_b2WheelJointDef__set_localAnchorA_p1(r1,r2){var r3;r3=r2;r2=r1+20|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2WheelJointDef__set_localAnchorB_p1(r1,r2){var r3;r3=r2;r2=r1+28|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2WheelJointDef__get_motorSpeed_p0(r1){return HEAPF32[r1+52>>2]}function _emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1(r1,r2){HEAPF32[r1+48>>2]=r2;return}function _emscripten_bind_b2WheelJointDef__set_frequencyHz_p1(r1,r2){HEAPF32[r1+56>>2]=r2;return}function _emscripten_bind_b2WheelJointDef__set_motorSpeed_p1(r1,r2){HEAPF32[r1+52>>2]=r2;return}function _emscripten_bind_b2WheelJointDef__get_localAxisA_p0(r1){return r1+36|0}function _emscripten_bind_b2WheelJointDef__set_bodyA_p1(r1,r2){HEAP32[r1+8>>2]=r2;return}function _emscripten_bind_b2WheelJointDef__set_bodyB_p1(r1,r2){HEAP32[r1+12>>2]=r2;return}function _emscripten_bind_b2WheelJointDef__Initialize_p4(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14;HEAP32[r1+8>>2]=r2;HEAP32[r1+12>>2]=r3;r6=r4|0;r7=HEAPF32[r6>>2]-HEAPF32[r2+12>>2];r8=r4+4|0;r4=HEAPF32[r8>>2]-HEAPF32[r2+16>>2];r9=r2+24|0;r10=HEAPF32[r9>>2];r11=r2+20|0;r2=HEAPF32[r11>>2];r12=r1+20|0;r13=(HEAPF32[tempDoublePtr>>2]=r7*r10+r4*r2,HEAP32[tempDoublePtr>>2]);r14=(HEAPF32[tempDoublePtr>>2]=r10*r4+r7*-r2,HEAP32[tempDoublePtr>>2])|0;HEAP32[r12>>2]=0|r13;HEAP32[r12+4>>2]=r14;r14=HEAPF32[r6>>2]-HEAPF32[r3+12>>2];r6=HEAPF32[r8>>2]-HEAPF32[r3+16>>2];r8=HEAPF32[r3+24>>2];r12=HEAPF32[r3+20>>2];r3=r1+28|0;r13=(HEAPF32[tempDoublePtr>>2]=r14*r8+r6*r12,HEAP32[tempDoublePtr>>2]);r2=(HEAPF32[tempDoublePtr>>2]=r8*r6+r14*-r12,HEAP32[tempDoublePtr>>2])|0;HEAP32[r3>>2]=0|r13;HEAP32[r3+4>>2]=r2;r2=HEAPF32[r9>>2];r9=HEAPF32[r5>>2];r3=HEAPF32[r11>>2];r11=HEAPF32[r5+4>>2];r5=r1+36|0;r1=(HEAPF32[tempDoublePtr>>2]=r2*r9+r3*r11,HEAP32[tempDoublePtr>>2]);r13=(HEAPF32[tempDoublePtr>>2]=r9*-r3+r2*r11,HEAP32[tempDoublePtr>>2])|0;HEAP32[r5>>2]=0|r1;HEAP32[r5+4>>2]=r13;return}function _emscripten_bind_b2Vec3__b2Vec3_p0(){return __Znwj(12)}function _emscripten_bind_b2Vec3__b2Vec3_p3(r1,r2,r3){var r4,r5;r4=__Znwj(12),r5=r4>>2;HEAPF32[r5]=r1;HEAPF32[r5+1]=r2;HEAPF32[r5+2]=r3;return r4}function _emscripten_bind_b2Vec3__op_sub_p0(r1){var r2,r3;do{if(HEAP8[5264932]<<24>>24==0){if((___cxa_guard_acquire(5264932)|0)==0){break}}}while(0);r2=-HEAPF32[r1+4>>2];r3=-HEAPF32[r1+8>>2];HEAPF32[1310738]=-HEAPF32[r1>>2];HEAPF32[1310739]=r2;HEAPF32[1310740]=r3;return 5242952}function _emscripten_bind_b2DistanceProxy__Set_p2(r1,r2,r3){__ZN15b2DistanceProxy3SetEPK7b2Shapei(r1,r2,r3);return}function _emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0(){var r1,r2;r1=__Znwj(28),r2=r1>>2;HEAP32[r2+4]=0;HEAP32[r2+5]=0;HEAPF32[r2+6]=0;return r1}function _emscripten_bind_b2DistanceProxy____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2FixtureDef____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2FixtureDef__b2FixtureDef_p0(){var r1;r1=__Znwj(28);HEAP16[r1+22>>1]=1;HEAP16[r1+24>>1]=-1;HEAP16[r1+26>>1]=0;HEAP32[r1>>2]=0;HEAP32[r1+4>>2]=0;HEAPF32[r1+8>>2]=.20000000298023224;HEAPF32[r1+12>>2]=0;HEAPF32[r1+16>>2]=0;HEAP8[r1+20|0]=0;return r1}function _emscripten_bind_b2FixtureDef__set_filter_p1(r1,r2){var r3;r3=(r1+22|0)>>1;r1=r2>>1;HEAP16[r3]=HEAP16[r1];HEAP16[r3+1]=HEAP16[r1+1];HEAP16[r3+2]=HEAP16[r1+2];return}function _emscripten_bind_b2Manifold____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2Manifold__b2Manifold_p0(){return __Znwj(64)}function _emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0(){var r1,r2,r3,r4;r1=__Znwj(72),r2=r1>>2;r3=r1;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP8[r1+16|0]=0;HEAP32[r2]=2;r4=(r1+20|0)>>2;HEAP32[r4]=0;HEAP32[r4+1]=0;HEAP32[r4+2]=0;HEAP32[r4+3]=0;HEAPF32[r2+9]=1;HEAPF32[r2+10]=0;HEAPF32[r2+11]=0;HEAP8[r1+48|0]=0;HEAPF32[r2+13]=0;HEAPF32[r2+14]=0;HEAP8[r1+60|0]=0;HEAPF32[r2+16]=0;HEAPF32[r2+17]=0;return r3}function _emscripten_bind_b2PrismaticJointDef____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2Rot____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2Rot__Set_p1(r1,r2){HEAPF32[r1>>2]=Math.sin(r2);HEAPF32[r1+4>>2]=Math.cos(r2);return}function _emscripten_bind_b2Rot__GetAngle_p0(r1){return Math.atan2(HEAPF32[r1>>2],HEAPF32[r1+4>>2])}function _emscripten_bind_b2Rot__GetYAxis_p0(r1){var r2,r3;do{if(HEAP8[5264916]<<24>>24==0){if((___cxa_guard_acquire(5264916)|0)==0){break}}}while(0);r2=HEAPF32[r1+4>>2];r3=(HEAPF32[tempDoublePtr>>2]=-HEAPF32[r1>>2],HEAP32[tempDoublePtr>>2]);r1=(HEAPF32[tempDoublePtr>>2]=r2,HEAP32[tempDoublePtr>>2])|0;r2=5242944;HEAP32[r2>>2]=0|r3;HEAP32[r2+4>>2]=r1;return 5242944}function _emscripten_bind_b2Rot__GetXAxis_p0(r1){var r2,r3;do{if(HEAP8[5264924]<<24>>24==0){if((___cxa_guard_acquire(5264924)|0)==0){break}}}while(0);r2=HEAPF32[r1>>2];r3=(HEAPF32[tempDoublePtr>>2]=HEAPF32[r1+4>>2],HEAP32[tempDoublePtr>>2]);r1=(HEAPF32[tempDoublePtr>>2]=r2,HEAP32[tempDoublePtr>>2])|0;r2=5242936;HEAP32[r2>>2]=0|r3;HEAP32[r2+4>>2]=r1;return 5242936}function _emscripten_bind_b2Rot__b2Rot_p0(){return __Znwj(8)}function _emscripten_bind_b2Rot__b2Rot_p1(r1){var r2;r2=__Znwj(8);HEAPF32[r2>>2]=Math.sin(r1);HEAPF32[r2+4>>2]=Math.cos(r1);return r2}function _emscripten_bind_b2DistanceProxy__GetVertex_p1(r1,r2){do{if((r2|0)>-1){if((HEAP32[r1+20>>2]|0)<=(r2|0)){break}return(r2<<3)+HEAP32[r1+16>>2]|0}}while(0);___assert_func(5250220,103,5256152,5249104)}function _emscripten_bind_b2WheelJointDef__get_frequencyHz_p0(r1){return HEAPF32[r1+56>>2]}function _emscripten_bind_b2WheelJointDef__set_dampingRatio_p1(r1,r2){HEAPF32[r1+60>>2]=r2;return}function _emscripten_bind_b2WheelJointDef__get_localAnchorA_p0(r1){return r1+20|0}function _emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0(r1){return HEAPF32[r1+48>>2]}function _emscripten_bind_b2WheelJointDef__get_localAnchorB_p0(r1){return r1+28|0}function _emscripten_bind_b2WheelJointDef__get_collideConnected_p1(r1,r2){return(HEAP8[r1+16|0]&1)<<24>>24!=0}function _emscripten_bind_b2WheelJointDef__get_enableMotor_p0(r1){return(HEAP8[r1+44|0]&1)<<24>>24!=0}function _emscripten_bind_b2WheelJointDef__get_dampingRatio_p0(r1){return HEAPF32[r1+60>>2]}function _emscripten_bind_b2WheelJointDef__get_bodyA_p1(r1,r2){return HEAP32[r1+8>>2]}function _emscripten_bind_b2WheelJointDef__get_bodyB_p1(r1,r2){return HEAP32[r1+12>>2]}function _emscripten_bind_b2WheelJointDef__set_enableMotor_p1(r1,r2){HEAP8[r1+44|0]=r2&1;return}function _emscripten_bind_b2WheelJointDef__set_collideConnected_p1(r1,r2){HEAP8[r1+16|0]=r2&1;return}function _emscripten_bind_b2WheelJointDef__set_localAxisA_p1(r1,r2){var r3;r3=r2;r2=r1+36|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1(r1,r2){var r3;r3=r2;r2=r1+20|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0(r1){return HEAPF32[r1+44>>2]}function _emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1(r1,r2){var r3;r3=r2;r2=r1+28|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1(r1,r2){HEAPF32[r1+44>>2]=r2;return}function _emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0(r1){return(HEAP8[r1+52|0]&1)<<24>>24!=0}function _emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1(r1,r2){HEAPF32[r1+48>>2]=r2;return}function _emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0(r1){return HEAPF32[r1+36>>2]}function _emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1(r1,r2){HEAP8[r1+40|0]=r2&1;return}function _emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0(r1){return HEAPF32[r1+56>>2]}function _emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1(r1,r2){HEAPF32[r1+56>>2]=r2;return}function _emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0(r1){return HEAPF32[r1+60>>2]}function _emscripten_bind_b2RevoluteJointDef__set_bodyA_p1(r1,r2){HEAP32[r1+8>>2]=r2;return}function _emscripten_bind_b2RevoluteJointDef__set_bodyB_p1(r1,r2){HEAP32[r1+12>>2]=r2;return}function _emscripten_bind_b2RevoluteJointDef__Initialize_p3(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r5=r3>>2;r6=r2>>2;HEAP32[r1+8>>2]=r2;HEAP32[r1+12>>2]=r3;r3=r4|0;r2=HEAPF32[r3>>2]-HEAPF32[r6+3];r7=r4+4|0;r4=HEAPF32[r7>>2]-HEAPF32[r6+4];r8=HEAPF32[r6+6];r9=HEAPF32[r6+5];r10=r1+20|0;r11=(HEAPF32[tempDoublePtr>>2]=r2*r8+r4*r9,HEAP32[tempDoublePtr>>2]);r12=(HEAPF32[tempDoublePtr>>2]=r8*r4+r2*-r9,HEAP32[tempDoublePtr>>2])|0;HEAP32[r10>>2]=0|r11;HEAP32[r10+4>>2]=r12;r12=HEAPF32[r3>>2]-HEAPF32[r5+3];r3=HEAPF32[r7>>2]-HEAPF32[r5+4];r7=HEAPF32[r5+6];r10=HEAPF32[r5+5];r11=r1+28|0;r9=(HEAPF32[tempDoublePtr>>2]=r12*r7+r3*r10,HEAP32[tempDoublePtr>>2]);r2=(HEAPF32[tempDoublePtr>>2]=r7*r3+r12*-r10,HEAP32[tempDoublePtr>>2])|0;HEAP32[r11>>2]=0|r9;HEAP32[r11+4>>2]=r2;HEAPF32[r1+36>>2]=HEAPF32[r5+14]-HEAPF32[r6+14];return}function _emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0(r1){return(HEAP8[r1+40|0]&1)<<24>>24!=0}function _emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0(r1){return HEAPF32[r1+48>>2]}function _emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1(r1,r2){HEAPF32[r1+36>>2]=r2;return}function _emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0(r1){return r1+20|0}function _emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0(r1){return r1+28|0}function _emscripten_bind_b2RevoluteJointDef__get_collideConnected_p1(r1,r2){return(HEAP8[r1+16|0]&1)<<24>>24!=0}function _emscripten_bind_b2RevoluteJointDef__get_bodyA_p1(r1,r2){return HEAP32[r1+8>>2]}function _emscripten_bind_b2RevoluteJointDef__get_bodyB_p1(r1,r2){return HEAP32[r1+12>>2]}function _emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1(r1,r2){HEAPF32[r1+60>>2]=r2;return}function _emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1(r1,r2){HEAP8[r1+52|0]=r2&1;return}function _emscripten_bind_b2RevoluteJointDef__set_collideConnected_p1(r1,r2){HEAP8[r1+16|0]=r2&1;return}function _emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1(r1,r2){var r3;r3=r2;r2=r1+36|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1(r1,r2){var r3;r3=r2;r2=r1+44|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2PulleyJointDef__set_ratio_p1(r1,r2){HEAPF32[r1+60>>2]=r2;return}function _emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1(r1,r2){var r3;r3=r2;r2=r1+28|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1(r1,r2){var r3;r3=r2;r2=r1+20|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0(r1){return r1+28|0}function _emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0(r1){return r1+20|0}function _emscripten_bind_b2PulleyJointDef__set_bodyA_p1(r1,r2){HEAP32[r1+8>>2]=r2;return}function _emscripten_bind_b2PulleyJointDef__set_bodyB_p1(r1,r2){HEAP32[r1+12>>2]=r2;return}function _emscripten_bind_b2PulleyJointDef__get_ratio_p0(r1){return HEAPF32[r1+60>>2]}function _emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0(r1){return r1+36|0}function _emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0(r1){return r1+44|0}function _emscripten_bind_b2PulleyJointDef__get_collideConnected_p1(r1,r2){return(HEAP8[r1+16|0]&1)<<24>>24!=0}function _emscripten_bind_b2PulleyJointDef__set_lengthB_p1(r1,r2){HEAPF32[r1+56>>2]=r2;return}function _emscripten_bind_b2PulleyJointDef__set_lengthA_p1(r1,r2){HEAPF32[r1+52>>2]=r2;return}function _emscripten_bind_b2PulleyJointDef__get_bodyA_p1(r1,r2){return HEAP32[r1+8>>2]}function _emscripten_bind_b2PulleyJointDef__get_bodyB_p1(r1,r2){return HEAP32[r1+12>>2]}function _emscripten_bind_b2PulleyJointDef__get_lengthB_p0(r1){return HEAPF32[r1+56>>2]}function _emscripten_bind_b2PulleyJointDef__get_lengthA_p0(r1){return HEAPF32[r1+52>>2]}function _emscripten_bind_b2PulleyJointDef__set_collideConnected_p1(r1,r2){HEAP8[r1+16|0]=r2&1;return}function _emscripten_bind_b2JointDef__get_bodyA_p0(r1){return HEAP32[r1+8>>2]}function _emscripten_bind_b2JointDef__set_userData_p1(r1,r2){HEAP32[r1+4>>2]=r2;return}function _emscripten_bind_b2JointDef__set_bodyA_p1(r1,r2){HEAP32[r1+8>>2]=r2;return}function _emscripten_bind_b2JointDef__set_bodyB_p1(r1,r2){HEAP32[r1+12>>2]=r2;return}function _emscripten_bind_b2JointDef__get_bodyB_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2JointDef__set_type_p1(r1,r2){HEAP32[r1>>2]=r2;return}function _emscripten_bind_b2JointDef__get_collideConnected_p0(r1){return(HEAP8[r1+16|0]&1)<<24>>24!=0}function _emscripten_bind_b2JointDef__get_type_p0(r1){return HEAP32[r1>>2]}function _emscripten_bind_b2JointDef__set_collideConnected_p1(r1,r2){HEAP8[r1+16|0]=r2&1;return}function _emscripten_bind_b2JointDef__get_userData_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2Transform__set_p_p1(r1,r2){var r3;r3=r2;r2=r1;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2Transform__set_q_p1(r1,r2){var r3;r3=r2;r2=r1+8|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2Transform__get_p_p0(r1){return r1|0}function _emscripten_bind_b2Transform__get_q_p0(r1){return r1+8|0}function _emscripten_bind_b2Transform__SetIdentity_p0(r1){HEAPF32[r1>>2]=0;HEAPF32[r1+4>>2]=0;HEAPF32[r1+8>>2]=0;HEAPF32[r1+12>>2]=1;return}function _emscripten_bind_b2Color__Set_p3(r1,r2,r3,r4){HEAPF32[r1>>2]=r2;HEAPF32[r1+4>>2]=r3;HEAPF32[r1+8>>2]=r4;return}function _emscripten_bind_b2Color__set_r_p1(r1,r2){HEAPF32[r1>>2]=r2;return}function _emscripten_bind_b2Color__get_r_p0(r1){return HEAPF32[r1>>2]}function _emscripten_bind_b2Color__set_b_p1(r1,r2){HEAPF32[r1+8>>2]=r2;return}function _emscripten_bind_b2Color__get_g_p0(r1){return HEAPF32[r1+4>>2]}function _emscripten_bind_b2Color__get_b_p0(r1){return HEAPF32[r1+8>>2]}function _emscripten_bind_b2Color__set_g_p1(r1,r2){HEAPF32[r1+4>>2]=r2;return}function _emscripten_bind_b2AABB__set_upperBound_p1(r1,r2){var r3;r3=r2;r2=r1+8|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2AABB__IsValid_p0(r1){var r2,r3,r4,r5,r6;r2=HEAPF32[r1+8>>2];r3=HEAPF32[r1>>2];r4=HEAPF32[r1+12>>2];r5=HEAPF32[r1+4>>2];if(!(r2-r3>=0&r4-r5>=0)){r6=0;return r6}if(!(!isNaN(r3)&!isNaN(0)&r3>-Infinity&r3<Infinity)){r6=0;return r6}if(!(!isNaN(r5)&!isNaN(0)&r5>-Infinity&r5<Infinity)){r6=0;return r6}if(!(!isNaN(r2)&!isNaN(0)&r2>-Infinity&r2<Infinity)){r6=0;return r6}if(!(!isNaN(r4)&!isNaN(0)&r4>-Infinity)){r6=0;return r6}r6=r4<Infinity;return r6}function _emscripten_bind_b2AABB__Contains_p1(r1,r2){var r3;if(HEAPF32[r1>>2]>HEAPF32[r2>>2]){r3=0;return r3}if(HEAPF32[r1+4>>2]>HEAPF32[r2+4>>2]){r3=0;return r3}if(HEAPF32[r2+8>>2]>HEAPF32[r1+8>>2]){r3=0;return r3}r3=HEAPF32[r2+12>>2]<=HEAPF32[r1+12>>2];return r3}function _emscripten_bind_b2AABB__get_upperBound_p0(r1){return r1+8|0}function _emscripten_bind_b2AABB__GetPerimeter_p0(r1){return(HEAPF32[r1+8>>2]-HEAPF32[r1>>2]+(HEAPF32[r1+12>>2]-HEAPF32[r1+4>>2]))*2}function _emscripten_bind_b2AABB__Combine_p1(r1,r2){var r3,r4,r5,r6,r7,r8;r3=HEAPF32[r1>>2];r4=HEAPF32[r2>>2];r5=HEAPF32[r1+4>>2];r6=HEAPF32[r2+4>>2];r7=r1;r8=(HEAPF32[tempDoublePtr>>2]=r3<r4?r3:r4,HEAP32[tempDoublePtr>>2]);r4=(HEAPF32[tempDoublePtr>>2]=r5<r6?r5:r6,HEAP32[tempDoublePtr>>2])|0;HEAP32[r7>>2]=0|r8;HEAP32[r7+4>>2]=r4;r4=r1+8|0;r7=HEAPF32[r4>>2];r8=HEAPF32[r2+8>>2];r6=HEAPF32[r1+12>>2];r1=HEAPF32[r2+12>>2];r2=r4;r4=(HEAPF32[tempDoublePtr>>2]=r7>r8?r7:r8,HEAP32[tempDoublePtr>>2]);r8=(HEAPF32[tempDoublePtr>>2]=r6>r1?r6:r1,HEAP32[tempDoublePtr>>2])|0;HEAP32[r2>>2]=0|r4;HEAP32[r2+4>>2]=r8;return}function _emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0(){var r1,r2,r3,r4;r1=__Znwj(64),r2=r1>>2;r3=r1;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP8[r1+16|0]=0;HEAP32[r2]=7;r4=(r1+20|0)>>2;HEAP32[r4]=0;HEAP32[r4+1]=0;HEAP32[r4+2]=0;HEAP32[r4+3]=0;HEAPF32[r2+9]=1;HEAPF32[r2+10]=0;HEAP8[r1+44|0]=0;HEAPF32[r2+12]=0;HEAPF32[r2+13]=0;HEAPF32[r2+14]=2;HEAPF32[r2+15]=.699999988079071;return r3}function _emscripten_bind_b2WheelJointDef____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0(){var r1,r2,r3,r4,r5;r1=__Znwj(64),r2=r1>>2;r3=r1;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP8[r1+16|0]=0;HEAP32[r2]=1;r4=r1+20|0,r5=r4>>2;HEAPF32[r2+11]=0;HEAPF32[r2+12]=0;HEAPF32[r2+15]=0;HEAPF32[r2+14]=0;HEAP8[r1+52|0]=0;HEAP32[r5]=0;HEAP32[r5+1]=0;HEAP32[r5+2]=0;HEAP32[r5+3]=0;HEAP32[r5+4]=0;HEAP8[r4+20|0]=0;return r3}function _emscripten_bind_b2RevoluteJointDef____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2PulleyJointDef__Initialize_p7(r1,r2,r3,r4,r5,r6,r7,r8){__ZN16b2PulleyJointDef10InitializeEP6b2BodyS1_RK6b2Vec2S4_S4_S4_f(r1,r2,r3,r4,r5,r6,r7,r8);return}function _emscripten_bind_b2PulleyJointDef____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0(){var r1,r2;r1=__Znwj(64),r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2]=4;HEAPF32[r2+5]=-1;HEAPF32[r2+6]=1;HEAPF32[r2+7]=1;HEAPF32[r2+8]=1;HEAPF32[r2+9]=-1;HEAPF32[r2+10]=0;HEAPF32[r2+11]=1;HEAPF32[r2+12]=0;HEAPF32[r2+13]=0;HEAPF32[r2+14]=0;HEAPF32[r2+15]=1;HEAP8[r1+16|0]=1;return r1}function _emscripten_bind_b2JointDef____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2JointDef__b2JointDef_p0(){var r1,r2,r3;r1=__Znwj(20),r2=r1>>2;r3=r1;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP8[r1+16|0]=0;return r3}function _emscripten_bind_b2Transform____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2Transform__Set_p2(r1,r2,r3){var r4,r5;r4=r2;r2=r1;r5=HEAP32[r4+4>>2];HEAP32[r2>>2]=HEAP32[r4>>2];HEAP32[r2+4>>2]=r5;HEAPF32[r1+8>>2]=Math.sin(r3);HEAPF32[r1+12>>2]=Math.cos(r3);return}function _emscripten_bind_b2Transform__b2Transform_p0(){return __Znwj(16)}function _emscripten_bind_b2Transform__b2Transform_p2(r1,r2){var r3,r4,r5;r3=__Znwj(16);r4=r1;r1=r3;r5=HEAP32[r4+4>>2];HEAP32[r1>>2]=HEAP32[r4>>2];HEAP32[r1+4>>2]=r5;r5=r2;r2=r3+8|0;r1=HEAP32[r5+4>>2];HEAP32[r2>>2]=HEAP32[r5>>2];HEAP32[r2+4>>2]=r1;return r3}function _emscripten_bind_b2Color____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2Color__b2Color_p0(){return __Znwj(12)}function _emscripten_bind_b2Color__b2Color_p3(r1,r2,r3){var r4,r5;r4=__Znwj(12),r5=r4>>2;HEAPF32[r5]=r1;HEAPF32[r5+1]=r2;HEAPF32[r5+2]=r3;return r4}function _emscripten_bind_b2AABB____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2AABB__b2AABB_p0(){return __Znwj(16)}function _emscripten_bind_b2AABB__GetExtents_p0(r1){var r2,r3;do{if(HEAP8[5264900]<<24>>24==0){if((___cxa_guard_acquire(5264900)|0)==0){break}}}while(0);r2=(HEAPF32[r1+12>>2]-HEAPF32[r1+4>>2])*.5;r3=(HEAPF32[tempDoublePtr>>2]=(HEAPF32[r1+8>>2]-HEAPF32[r1>>2])*.5,HEAP32[tempDoublePtr>>2]);r1=(HEAPF32[tempDoublePtr>>2]=r2,HEAP32[tempDoublePtr>>2])|0;r2=5242928;HEAP32[r2>>2]=0|r3;HEAP32[r2+4>>2]=r1;return 5242928}function _emscripten_bind_b2AABB__GetCenter_p0(r1){var r2,r3;do{if(HEAP8[5264908]<<24>>24==0){if((___cxa_guard_acquire(5264908)|0)==0){break}}}while(0);r2=(HEAPF32[r1+4>>2]+HEAPF32[r1+12>>2])*.5;r3=(HEAPF32[tempDoublePtr>>2]=(HEAPF32[r1>>2]+HEAPF32[r1+8>>2])*.5,HEAP32[tempDoublePtr>>2]);r1=(HEAPF32[tempDoublePtr>>2]=r2,HEAP32[tempDoublePtr>>2])|0;r2=5242920;HEAP32[r2>>2]=0|r3;HEAP32[r2+4>>2]=r1;return 5242920}function __ZN21b2DestructionListenerD1Ev(r1){return}function __ZN21b2DestructionListener10SayGoodbyeEP7b2Joint(r1,r2){return}function __ZN21b2DestructionListener10SayGoodbyeEP9b2Fixture(r1,r2){return}function __ZN15b2QueryCallbackD1Ev(r1){return}function __ZN15b2QueryCallback13ReportFixtureEP9b2Fixture(r1,r2){return 0}function __ZN17b2RayCastCallbackD1Ev(r1){return}function __ZN17b2RayCastCallback13ReportFixtureEP9b2FixtureRK6b2Vec2S4_f(r1,r2,r3,r4,r5){return 0}function __ZN10__cxxabiv116__shim_type_infoD2Ev(r1){return}function __ZNK10__cxxabiv116__shim_type_info5noop1Ev(r1){return}function __ZNK10__cxxabiv116__shim_type_info5noop2Ev(r1){return}function _emscripten_bind_b2AABB__Combine_p2(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=HEAPF32[r2>>2];r5=HEAPF32[r3>>2];r6=HEAPF32[r2+4>>2];r7=HEAPF32[r3+4>>2];r8=r1;r9=(HEAPF32[tempDoublePtr>>2]=r4<r5?r4:r5,HEAP32[tempDoublePtr>>2]);r5=(HEAPF32[tempDoublePtr>>2]=r6<r7?r6:r7,HEAP32[tempDoublePtr>>2])|0;HEAP32[r8>>2]=0|r9;HEAP32[r8+4>>2]=r5;r5=HEAPF32[r2+8>>2];r8=HEAPF32[r3+8>>2];r9=HEAPF32[r2+12>>2];r2=HEAPF32[r3+12>>2];r3=r1+8|0;r1=(HEAPF32[tempDoublePtr>>2]=r5>r8?r5:r8,HEAP32[tempDoublePtr>>2]);r8=(HEAPF32[tempDoublePtr>>2]=r9>r2?r9:r2,HEAP32[tempDoublePtr>>2])|0;HEAP32[r3>>2]=0|r1;HEAP32[r3+4>>2]=r8;return}function _emscripten_bind_b2AABB__set_lowerBound_p1(r1,r2){var r3;r3=r2;r2=r1;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2AABB__get_lowerBound_p0(r1){return r1|0}function _emscripten_bind_b2WeldJointDef__set_localAnchorA_p1(r1,r2){var r3;r3=r2;r2=r1+20|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2WeldJointDef__get_bodyA_p1(r1,r2){return HEAP32[r1+8>>2]}function _emscripten_bind_b2WeldJointDef__get_bodyB_p1(r1,r2){return HEAP32[r1+12>>2]}function _emscripten_bind_b2WeldJointDef__set_localAnchorB_p1(r1,r2){var r3;r3=r2;r2=r1+28|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2WeldJointDef__get_frequencyHz_p0(r1){return HEAPF32[r1+40>>2]}function _emscripten_bind_b2WeldJointDef__set_bodyA_p1(r1,r2){HEAP32[r1+8>>2]=r2;return}function _emscripten_bind_b2WeldJointDef__set_bodyB_p1(r1,r2){HEAP32[r1+12>>2]=r2;return}function _emscripten_bind_b2WeldJointDef__set_referenceAngle_p1(r1,r2){HEAPF32[r1+36>>2]=r2;return}function _emscripten_bind_b2WeldJointDef__get_localAnchorA_p0(r1){return r1+20|0}function _emscripten_bind_b2WeldJointDef__get_referenceAngle_p0(r1){return HEAPF32[r1+36>>2]}function _emscripten_bind_b2WeldJointDef__get_localAnchorB_p0(r1){return r1+28|0}function _emscripten_bind_b2WeldJointDef__get_collideConnected_p1(r1,r2){return(HEAP8[r1+16|0]&1)<<24>>24!=0}function _emscripten_bind_b2WeldJointDef__get_dampingRatio_p0(r1){return HEAPF32[r1+44>>2]}function _emscripten_bind_b2WeldJointDef__set_collideConnected_p1(r1,r2){HEAP8[r1+16|0]=r2&1;return}function _emscripten_bind_b2WeldJointDef__set_frequencyHz_p1(r1,r2){HEAPF32[r1+40>>2]=r2;return}function _emscripten_bind_b2WeldJointDef__Initialize_p3(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r5=r3>>2;r6=r2>>2;HEAP32[r1+8>>2]=r2;HEAP32[r1+12>>2]=r3;r3=r4|0;r2=HEAPF32[r3>>2]-HEAPF32[r6+3];r7=r4+4|0;r4=HEAPF32[r7>>2]-HEAPF32[r6+4];r8=HEAPF32[r6+6];r9=HEAPF32[r6+5];r10=r1+20|0;r11=(HEAPF32[tempDoublePtr>>2]=r2*r8+r4*r9,HEAP32[tempDoublePtr>>2]);r12=(HEAPF32[tempDoublePtr>>2]=r8*r4+r2*-r9,HEAP32[tempDoublePtr>>2])|0;HEAP32[r10>>2]=0|r11;HEAP32[r10+4>>2]=r12;r12=HEAPF32[r3>>2]-HEAPF32[r5+3];r3=HEAPF32[r7>>2]-HEAPF32[r5+4];r7=HEAPF32[r5+6];r10=HEAPF32[r5+5];r11=r1+28|0;r9=(HEAPF32[tempDoublePtr>>2]=r12*r7+r3*r10,HEAP32[tempDoublePtr>>2]);r2=(HEAPF32[tempDoublePtr>>2]=r7*r3+r12*-r10,HEAP32[tempDoublePtr>>2])|0;HEAP32[r11>>2]=0|r9;HEAP32[r11+4>>2]=r2;HEAPF32[r1+36>>2]=HEAPF32[r5+14]-HEAPF32[r6+14];return}function _emscripten_bind_b2WeldJointDef__set_dampingRatio_p1(r1,r2){HEAPF32[r1+44>>2]=r2;return}function _emscripten_bind_b2MouseJointDef__get_bodyA_p1(r1,r2){return HEAP32[r1+8>>2]}function _emscripten_bind_b2MouseJointDef__get_bodyB_p1(r1,r2){return HEAP32[r1+12>>2]}function _emscripten_bind_b2MouseJointDef__set_dampingRatio_p1(r1,r2){HEAPF32[r1+36>>2]=r2;return}function _emscripten_bind_b2MouseJointDef__set_bodyA_p1(r1,r2){HEAP32[r1+8>>2]=r2;return}function _emscripten_bind_b2MouseJointDef__set_bodyB_p1(r1,r2){HEAP32[r1+12>>2]=r2;return}function _emscripten_bind_b2MouseJointDef__get_maxForce_p0(r1){return HEAPF32[r1+28>>2]}function _emscripten_bind_b2MouseJointDef__set_target_p1(r1,r2){var r3;r3=r2;r2=r1+20|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2MouseJointDef__set_maxForce_p1(r1,r2){HEAPF32[r1+28>>2]=r2;return}function _emscripten_bind_b2MouseJointDef__get_frequencyHz_p0(r1){return HEAPF32[r1+32>>2]}function _emscripten_bind_b2MouseJointDef__get_target_p0(r1){return r1+20|0}function _emscripten_bind_b2MouseJointDef__get_collideConnected_p1(r1,r2){return(HEAP8[r1+16|0]&1)<<24>>24!=0}function _emscripten_bind_b2MouseJointDef__set_collideConnected_p1(r1,r2){HEAP8[r1+16|0]=r2&1;return}function _emscripten_bind_b2MouseJointDef__set_frequencyHz_p1(r1,r2){HEAPF32[r1+32>>2]=r2;return}function _emscripten_bind_b2MouseJointDef__get_dampingRatio_p0(r1){return HEAPF32[r1+36>>2]}function _emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1(r1,r2){var r3;r3=r2;r2=r1+20|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2DistanceJointDef__get_bodyA_p1(r1,r2){return HEAP32[r1+8>>2]}function _emscripten_bind_b2DistanceJointDef__get_bodyB_p1(r1,r2){return HEAP32[r1+12>>2]}function _emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1(r1,r2){var r3;r3=r2;r2=r1+28|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1(r1,r2){HEAPF32[r1+44>>2]=r2;return}function _emscripten_bind_b2DistanceJointDef__set_bodyA_p1(r1,r2){HEAP32[r1+8>>2]=r2;return}function _emscripten_bind_b2DistanceJointDef__set_bodyB_p1(r1,r2){HEAP32[r1+12>>2]=r2;return}function _emscripten_bind_b2DistanceJointDef__get_length_p0(r1){return HEAPF32[r1+36>>2]}function _emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0(r1){return r1+20|0}function _emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0(r1){return HEAPF32[r1+40>>2]}function _emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0(r1){return r1+28|0}function _emscripten_bind_b2DistanceJointDef__get_collideConnected_p1(r1,r2){return(HEAP8[r1+16|0]&1)<<24>>24!=0}function _emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0(r1){return HEAPF32[r1+44>>2]}function _emscripten_bind_b2DistanceJointDef__set_collideConnected_p1(r1,r2){HEAP8[r1+16|0]=r2&1;return}function _emscripten_bind_b2DistanceJointDef__set_length_p1(r1,r2){HEAPF32[r1+36>>2]=r2;return}function _emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1(r1,r2){HEAPF32[r1+40>>2]=r2;return}function _emscripten_bind_b2GearJointDef__get_bodyA_p1(r1,r2){return HEAP32[r1+8>>2]}function _emscripten_bind_b2GearJointDef__get_bodyB_p1(r1,r2){return HEAP32[r1+12>>2]}function _emscripten_bind_b2GearJointDef__get_joint1_p0(r1){return HEAP32[r1+20>>2]}function _emscripten_bind_b2GearJointDef__set_bodyA_p1(r1,r2){HEAP32[r1+8>>2]=r2;return}function _emscripten_bind_b2GearJointDef__set_bodyB_p1(r1,r2){HEAP32[r1+12>>2]=r2;return}function _emscripten_bind_b2GearJointDef__set_joint2_p1(r1,r2){HEAP32[r1+24>>2]=r2;return}function _emscripten_bind_b2GearJointDef__set_ratio_p1(r1,r2){HEAPF32[r1+28>>2]=r2;return}function _emscripten_bind_b2GearJointDef__get_collideConnected_p1(r1,r2){return(HEAP8[r1+16|0]&1)<<24>>24!=0}function _emscripten_bind_b2GearJointDef__get_joint2_p0(r1){return HEAP32[r1+24>>2]}function _emscripten_bind_b2GearJointDef__set_collideConnected_p1(r1,r2){HEAP8[r1+16|0]=r2&1;return}function _emscripten_bind_b2GearJointDef__get_ratio_p0(r1){return HEAPF32[r1+28>>2]}function _emscripten_bind_b2GearJointDef__set_joint1_p1(r1,r2){HEAP32[r1+20>>2]=r2;return}function _emscripten_bind_b2ContactEdge__set_contact_p1(r1,r2){HEAP32[r1+4>>2]=r2;return}function _emscripten_bind_b2ContactEdge__get_prev_p0(r1){return HEAP32[r1+8>>2]}function _emscripten_bind_b2ContactEdge__get_other_p0(r1){return HEAP32[r1>>2]}function _emscripten_bind_b2ContactEdge__set_prev_p1(r1,r2){HEAP32[r1+8>>2]=r2;return}function _emscripten_bind_b2ContactEdge__get_next_p0(r1){return HEAP32[r1+12>>2]}function _emscripten_bind_b2ContactEdge__set_other_p1(r1,r2){HEAP32[r1>>2]=r2;return}function _emscripten_bind_b2ContactEdge__set_next_p1(r1,r2){HEAP32[r1+12>>2]=r2;return}function _emscripten_bind_b2ContactEdge__get_contact_p0(r1){return HEAP32[r1+4>>2]}function _emscripten_bind_b2RopeJointDef__set_localAnchorA_p1(r1,r2){var r3;r3=r2;r2=r1+20|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2RopeJointDef__get_bodyA_p1(r1,r2){return HEAP32[r1+8>>2]}function _emscripten_bind_b2RopeJointDef__get_bodyB_p1(r1,r2){return HEAP32[r1+12>>2]}function _emscripten_bind_b2RopeJointDef__set_localAnchorB_p1(r1,r2){var r3;r3=r2;r2=r1+28|0;r1=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r1;return}function _emscripten_bind_b2RopeJointDef__set_bodyA_p1(r1,r2){HEAP32[r1+8>>2]=r2;return}function _emscripten_bind_b2RopeJointDef__set_bodyB_p1(r1,r2){HEAP32[r1+12>>2]=r2;return}function _emscripten_bind_b2RopeJointDef__get_localAnchorA_p0(r1){return r1+20|0}function _emscripten_bind_b2RopeJointDef__get_maxLength_p0(r1){return HEAPF32[r1+36>>2]}function _emscripten_bind_b2RopeJointDef__get_localAnchorB_p0(r1){return r1+28|0}function _emscripten_bind_b2RopeJointDef__get_collideConnected_p1(r1,r2){return(HEAP8[r1+16|0]&1)<<24>>24!=0}function _emscripten_bind_b2RopeJointDef__set_collideConnected_p1(r1,r2){HEAP8[r1+16|0]=r2&1;return}function _emscripten_bind_b2RopeJointDef__set_maxLength_p1(r1,r2){HEAPF32[r1+36>>2]=r2;return}function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5;if((HEAP32[r2+8>>2]|0)!=(r1|0)){return}r1=r2+16|0;r5=HEAP32[r1>>2];if((r5|0)==0){HEAP32[r1>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r5|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1|0;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r3=r2+24|0;if((HEAP32[r3>>2]|0)!=2){return}HEAP32[r3>>2]=r4;return}function _emscripten_bind_b2AABB__RayCast_p2(r1,r2,r3){return __ZNK6b2AABB7RayCastEP15b2RayCastOutputRK14b2RayCastInput(r1,r2,r3)}function _emscripten_bind_b2WeldJointDef____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0(){var r1,r2,r3;r1=__Znwj(48),r2=r1>>2;r3=r1;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP8[r1+16|0]=0;HEAP32[r2]=8;r2=(r1+20|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;HEAP32[r2+6]=0;return r3}function _emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0(){var r1,r2,r3;r1=__Znwj(40),r2=r1>>2;r3=r1;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP8[r1+16|0]=0;HEAP32[r2]=5;HEAPF32[r2+5]=0;HEAPF32[r2+6]=0;HEAPF32[r2+7]=0;HEAPF32[r2+8]=5;HEAPF32[r2+9]=.699999988079071;return r3}function _emscripten_bind_b2MouseJointDef____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0(){var r1,r2,r3,r4;r1=__Znwj(48),r2=r1>>2;r3=r1;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP8[r1+16|0]=0;HEAP32[r2]=3;r4=(r1+20|0)>>2;HEAP32[r4]=0;HEAP32[r4+1]=0;HEAP32[r4+2]=0;HEAP32[r4+3]=0;HEAPF32[r2+9]=1;HEAPF32[r2+10]=0;HEAPF32[r2+11]=0;return r3}function _emscripten_bind_b2DistanceJointDef____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2DistanceJointDef__Initialize_p4(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12;HEAP32[r1+8>>2]=r2;HEAP32[r1+12>>2]=r3;r6=r4|0;r7=HEAPF32[r6>>2]-HEAPF32[r2+12>>2];r8=r4+4|0;r4=HEAPF32[r8>>2]-HEAPF32[r2+16>>2];r9=HEAPF32[r2+24>>2];r10=HEAPF32[r2+20>>2];r2=r1+20|0;r11=(HEAPF32[tempDoublePtr>>2]=r7*r9+r4*r10,HEAP32[tempDoublePtr>>2]);r12=(HEAPF32[tempDoublePtr>>2]=r9*r4+r7*-r10,HEAP32[tempDoublePtr>>2])|0;HEAP32[r2>>2]=0|r11;HEAP32[r2+4>>2]=r12;r12=r5|0;r2=HEAPF32[r12>>2]-HEAPF32[r3+12>>2];r11=r5+4|0;r5=HEAPF32[r11>>2]-HEAPF32[r3+16>>2];r10=HEAPF32[r3+24>>2];r7=HEAPF32[r3+20>>2];r3=r1+28|0;r4=(HEAPF32[tempDoublePtr>>2]=r2*r10+r5*r7,HEAP32[tempDoublePtr>>2]);r9=(HEAPF32[tempDoublePtr>>2]=r10*r5+r2*-r7,HEAP32[tempDoublePtr>>2])|0;HEAP32[r3>>2]=0|r4;HEAP32[r3+4>>2]=r9;r9=HEAPF32[r12>>2]-HEAPF32[r6>>2];r6=HEAPF32[r11>>2]-HEAPF32[r8>>2];HEAPF32[r1+36>>2]=Math.sqrt(r9*r9+r6*r6);return}function _emscripten_bind_b2GearJointDef____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2GearJointDef__b2GearJointDef_p0(){var r1,r2,r3;r1=__Znwj(32),r2=r1>>2;r3=r1;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP8[r1+16|0]=0;HEAP32[r2]=6;HEAP32[r2+5]=0;HEAP32[r2+6]=0;HEAPF32[r2+7]=1;return r3}function _emscripten_bind_b2ContactEdge____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2ContactEdge__b2ContactEdge_p0(){return __Znwj(16)}function _emscripten_bind_b2RopeJointDef____destroy___p0(r1){if((r1|0)==0){return}__ZdlPv(r1);return}function _emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0(){var r1,r2,r3;r1=__Znwj(40),r2=r1>>2;r3=r1;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP8[r1+16|0]=0;HEAP32[r2]=10;HEAPF32[r2+5]=-1;HEAPF32[r2+6]=0;HEAPF32[r2+7]=1;HEAPF32[r2+8]=0;HEAPF32[r2+9]=0;return r3}function __ZN21b2DestructionListenerD0Ev(r1){__ZdlPv(r1);return}function __ZN15b2QueryCallbackD0Ev(r1){__ZdlPv(r1);return}function __ZN17b2RayCastCallbackD0Ev(r1){__ZdlPv(r1);return}function __ZN10__cxxabiv117__class_type_infoD0Ev(r1){__ZdlPv(r1);return}function __ZN10__cxxabiv120__si_class_type_infoD0Ev(r1){__ZdlPv(r1);return}function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=STACKTOP;STACKTOP=STACKTOP+56|0;r5=r4,r6=r5>>2;do{if((r1|0)==(r2|0)){r7=1}else{if((r2|0)==0){r7=0;break}r8=___dynamic_cast(r2,5263316,5263304,-1);r9=r8;if((r8|0)==0){r7=0;break}_memset(r5,0,56);HEAP32[r6]=r9;HEAP32[r6+2]=r1;HEAP32[r6+3]=-1;HEAP32[r6+12]=1;FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+28>>2]](r9,r5,HEAP32[r3>>2],1);if((HEAP32[r6+6]|0)!=1){r7=0;break}HEAP32[r3>>2]=HEAP32[r6+4];r7=1}}while(0);STACKTOP=r4;return r7}function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6;r5=r2>>2;if((HEAP32[r5+2]|0)==(r1|0)){if((HEAP32[r5+1]|0)!=(r3|0)){return}r6=r2+28|0;if((HEAP32[r6>>2]|0)==1){return}HEAP32[r6>>2]=r4;return}if((HEAP32[r5]|0)!=(r1|0)){return}do{if((HEAP32[r5+4]|0)!=(r3|0)){r1=r2+20|0;if((HEAP32[r1>>2]|0)==(r3|0)){break}HEAP32[r5+8]=r4;HEAP32[r1>>2]=r3;r1=r2+40|0;HEAP32[r1>>2]=HEAP32[r1>>2]+1|0;do{if((HEAP32[r5+9]|0)==1){if((HEAP32[r5+6]|0)!=2){break}HEAP8[r2+54|0]=1}}while(0);HEAP32[r5+11]=4;return}}while(0);if((r4|0)!=1){return}HEAP32[r5+8]=1;return}function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7;r6=r2>>2;if((HEAP32[r6+2]|0)!=(r1|0)){return}HEAP8[r2+53|0]=1;if((HEAP32[r6+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r1=HEAP32[r4>>2];if((r1|0)==0){HEAP32[r4>>2]=r3;HEAP32[r6+6]=r5;HEAP32[r6+9]=1;if(!((HEAP32[r6+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r1|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1|0;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r1=HEAP32[r3>>2];if((r1|0)==2){HEAP32[r3>>2]=r5;r7=r5}else{r7=r1}if(!((HEAP32[r6+12]|0)==1&(r7|0)==1)){return}HEAP8[r2+54|0]=1;return}function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5;if((r1|0)!=(HEAP32[r2+8>>2]|0)){r5=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+28>>2]](r5,r2,r3,r4);return}r5=r2+16|0;r1=HEAP32[r5>>2];if((r1|0)==0){HEAP32[r5>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r1|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1|0;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r3=r2+24|0;if((HEAP32[r3>>2]|0)!=2){return}HEAP32[r3>>2]=r4;return}function ___dynamic_cast(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r5=STACKTOP;STACKTOP=STACKTOP+56|0;r6=r5,r7=r6>>2;r8=HEAP32[r1>>2];r9=r1+HEAP32[r8-8>>2]|0;r10=HEAP32[r8-4>>2];r8=r10;HEAP32[r7]=r3;HEAP32[r7+1]=r1;HEAP32[r7+2]=r2;HEAP32[r7+3]=r4;r4=r6+16|0;r2=r6+20|0;r1=r6+24|0;r11=r6+28|0;r12=r6+32|0;r13=r6+40|0;_memset(r4,0,39);if((r10|0)==(r3|0)){HEAP32[r7+12]=1;FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+20>>2]](r8,r6,r9,r9,1,0);STACKTOP=r5;return(HEAP32[r1>>2]|0)==1?r9:0}FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+24>>2]](r8,r6,r9,1,0);r9=HEAP32[r7+9];do{if((r9|0)==0){if((HEAP32[r13>>2]|0)!=1){r14=0;break}if((HEAP32[r11>>2]|0)!=1){r14=0;break}r14=(HEAP32[r12>>2]|0)==1?HEAP32[r2>>2]:0}else if((r9|0)==1){if((HEAP32[r1>>2]|0)!=1){if((HEAP32[r13>>2]|0)!=0){r14=0;break}if((HEAP32[r11>>2]|0)!=1){r14=0;break}if((HEAP32[r12>>2]|0)!=1){r14=0;break}}r14=HEAP32[r4>>2]}else{r14=0}}while(0);STACKTOP=r5;return r14}function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13;r6=r2>>2;r7=0;r8=r1|0;if((r8|0)==(HEAP32[r6+2]|0)){if((HEAP32[r6+1]|0)!=(r3|0)){return}r9=r2+28|0;if((HEAP32[r9>>2]|0)==1){return}HEAP32[r9>>2]=r4;return}if((r8|0)!=(HEAP32[r6]|0)){r8=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+24>>2]](r8,r2,r3,r4,r5);return}do{if((HEAP32[r6+4]|0)!=(r3|0)){r8=r2+20|0;if((HEAP32[r8>>2]|0)==(r3|0)){break}HEAP32[r6+8]=r4;r9=(r2+44|0)>>2;if((HEAP32[r9]|0)==4){return}r10=r2+52|0;HEAP8[r10]=0;r11=r2+53|0;HEAP8[r11]=0;r12=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+20>>2]](r12,r2,r3,r3,1,r5);do{if((HEAP8[r11]&1)<<24>>24==0){r13=0;r7=4912}else{if((HEAP8[r10]&1)<<24>>24==0){r13=1;r7=4912;break}else{break}}}while(0);L5951:do{if(r7==4912){HEAP32[r8>>2]=r3;r10=r2+40|0;HEAP32[r10>>2]=HEAP32[r10>>2]+1|0;do{if((HEAP32[r6+9]|0)==1){if((HEAP32[r6+6]|0)!=2){r7=4915;break}HEAP8[r2+54|0]=1;if(r13){break L5951}else{break}}else{r7=4915}}while(0);if(r7==4915){if(r13){break}}HEAP32[r9]=4;return}}while(0);HEAP32[r9]=3;return}}while(0);if((r4|0)!=1){return}HEAP32[r6+8]=1;return}function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7,r8,r9;r7=r2>>2;if((r1|0)!=(HEAP32[r7+2]|0)){r8=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+20>>2]](r8,r2,r3,r4,r5,r6);return}HEAP8[r2+53|0]=1;if((HEAP32[r7+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r6=HEAP32[r4>>2];if((r6|0)==0){HEAP32[r4>>2]=r3;HEAP32[r7+6]=r5;HEAP32[r7+9]=1;if(!((HEAP32[r7+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r6|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1|0;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r6=HEAP32[r3>>2];if((r6|0)==2){HEAP32[r3>>2]=r5;r9=r5}else{r9=r6}if(!((HEAP32[r7+12]|0)==1&(r9|0)==1)){return}HEAP8[r2+54|0]=1;return}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95;r2=0;do{if(r1>>>0<245){if(r1>>>0<11){r3=16}else{r3=r1+11&-8}r4=r3>>>3;r5=HEAP32[1313846];r6=r5>>>(r4>>>0);if((r6&3|0)!=0){r7=(r6&1^1)+r4|0;r8=r7<<1;r9=(r8<<2)+5255424|0;r10=(r8+2<<2)+5255424|0;r8=HEAP32[r10>>2];r11=r8+8|0;r12=HEAP32[r11>>2];do{if((r9|0)==(r12|0)){HEAP32[1313846]=r5&(1<<r7^-1)}else{if(r12>>>0<HEAP32[1313850]>>>0){_abort()}r13=r12+12|0;if((HEAP32[r13>>2]|0)==(r8|0)){HEAP32[r13>>2]=r9;HEAP32[r10>>2]=r12;break}else{_abort()}}}while(0);r12=r7<<3;HEAP32[r8+4>>2]=r12|3;r10=r8+(r12|4)|0;HEAP32[r10>>2]=HEAP32[r10>>2]|1;r14=r11;return r14}if(r3>>>0<=HEAP32[1313848]>>>0){r15=r3,r16=r15>>2;break}if((r6|0)!=0){r10=2<<r4;r12=r6<<r4&(r10|-r10);r10=(r12&-r12)-1|0;r12=r10>>>12&16;r9=r10>>>(r12>>>0);r10=r9>>>5&8;r13=r9>>>(r10>>>0);r9=r13>>>2&4;r17=r13>>>(r9>>>0);r13=r17>>>1&2;r18=r17>>>(r13>>>0);r17=r18>>>1&1;r19=(r10|r12|r9|r13|r17)+(r18>>>(r17>>>0))|0;r17=r19<<1;r18=(r17<<2)+5255424|0;r13=(r17+2<<2)+5255424|0;r17=HEAP32[r13>>2];r9=r17+8|0;r12=HEAP32[r9>>2];do{if((r18|0)==(r12|0)){HEAP32[1313846]=r5&(1<<r19^-1)}else{if(r12>>>0<HEAP32[1313850]>>>0){_abort()}r10=r12+12|0;if((HEAP32[r10>>2]|0)==(r17|0)){HEAP32[r10>>2]=r18;HEAP32[r13>>2]=r12;break}else{_abort()}}}while(0);r12=r19<<3;r13=r12-r3|0;HEAP32[r17+4>>2]=r3|3;r18=r17;r5=r18+r3|0;HEAP32[r18+(r3|4)>>2]=r13|1;HEAP32[r18+r12>>2]=r13;r12=HEAP32[1313848];if((r12|0)!=0){r18=HEAP32[1313851];r4=r12>>>3;r12=r4<<1;r6=(r12<<2)+5255424|0;r11=HEAP32[1313846];r8=1<<r4;do{if((r11&r8|0)==0){HEAP32[1313846]=r11|r8;r20=r6;r21=(r12+2<<2)+5255424|0}else{r4=(r12+2<<2)+5255424|0;r7=HEAP32[r4>>2];if(r7>>>0>=HEAP32[1313850]>>>0){r20=r7;r21=r4;break}_abort()}}while(0);HEAP32[r21>>2]=r18;HEAP32[r20+12>>2]=r18;HEAP32[r18+8>>2]=r20;HEAP32[r18+12>>2]=r6}HEAP32[1313848]=r13;HEAP32[1313851]=r5;r14=r9;return r14}r12=HEAP32[1313847];if((r12|0)==0){r15=r3,r16=r15>>2;break}r8=(r12&-r12)-1|0;r12=r8>>>12&16;r11=r8>>>(r12>>>0);r8=r11>>>5&8;r17=r11>>>(r8>>>0);r11=r17>>>2&4;r19=r17>>>(r11>>>0);r17=r19>>>1&2;r4=r19>>>(r17>>>0);r19=r4>>>1&1;r7=HEAP32[((r8|r12|r11|r17|r19)+(r4>>>(r19>>>0))<<2)+5255688>>2];r19=r7;r4=r7,r17=r4>>2;r11=(HEAP32[r7+4>>2]&-8)-r3|0;while(1){r7=HEAP32[r19+16>>2];if((r7|0)==0){r12=HEAP32[r19+20>>2];if((r12|0)==0){break}else{r22=r12}}else{r22=r7}r7=(HEAP32[r22+4>>2]&-8)-r3|0;r12=r7>>>0<r11>>>0;r19=r22;r4=r12?r22:r4,r17=r4>>2;r11=r12?r7:r11}r19=r4;r9=HEAP32[1313850];if(r19>>>0<r9>>>0){_abort()}r5=r19+r3|0;r13=r5;if(r19>>>0>=r5>>>0){_abort()}r5=HEAP32[r17+6];r6=HEAP32[r17+3];L6049:do{if((r6|0)==(r4|0)){r18=r4+20|0;r7=HEAP32[r18>>2];do{if((r7|0)==0){r12=r4+16|0;r8=HEAP32[r12>>2];if((r8|0)==0){r23=0,r24=r23>>2;break L6049}else{r25=r8;r26=r12;break}}else{r25=r7;r26=r18}}while(0);while(1){r18=r25+20|0;r7=HEAP32[r18>>2];if((r7|0)!=0){r25=r7;r26=r18;continue}r18=r25+16|0;r7=HEAP32[r18>>2];if((r7|0)==0){break}else{r25=r7;r26=r18}}if(r26>>>0<r9>>>0){_abort()}else{HEAP32[r26>>2]=0;r23=r25,r24=r23>>2;break}}else{r18=HEAP32[r17+2];if(r18>>>0<r9>>>0){_abort()}r7=r18+12|0;if((HEAP32[r7>>2]|0)!=(r4|0)){_abort()}r12=r6+8|0;if((HEAP32[r12>>2]|0)==(r4|0)){HEAP32[r7>>2]=r6;HEAP32[r12>>2]=r18;r23=r6,r24=r23>>2;break}else{_abort()}}}while(0);L6071:do{if((r5|0)!=0){r6=r4+28|0;r9=(HEAP32[r6>>2]<<2)+5255688|0;do{if((r4|0)==(HEAP32[r9>>2]|0)){HEAP32[r9>>2]=r23;if((r23|0)!=0){break}HEAP32[1313847]=HEAP32[1313847]&(1<<HEAP32[r6>>2]^-1);break L6071}else{if(r5>>>0<HEAP32[1313850]>>>0){_abort()}r18=r5+16|0;if((HEAP32[r18>>2]|0)==(r4|0)){HEAP32[r18>>2]=r23}else{HEAP32[r5+20>>2]=r23}if((r23|0)==0){break L6071}}}while(0);if(r23>>>0<HEAP32[1313850]>>>0){_abort()}HEAP32[r24+6]=r5;r6=HEAP32[r17+4];do{if((r6|0)!=0){if(r6>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r24+4]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);r6=HEAP32[r17+5];if((r6|0)==0){break}if(r6>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r24+5]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);if(r11>>>0<16){r5=r11+r3|0;HEAP32[r17+1]=r5|3;r6=r5+(r19+4)|0;HEAP32[r6>>2]=HEAP32[r6>>2]|1}else{HEAP32[r17+1]=r3|3;HEAP32[r19+(r3|4)>>2]=r11|1;HEAP32[r19+r11+r3>>2]=r11;r6=HEAP32[1313848];if((r6|0)!=0){r5=HEAP32[1313851];r9=r6>>>3;r6=r9<<1;r18=(r6<<2)+5255424|0;r12=HEAP32[1313846];r7=1<<r9;do{if((r12&r7|0)==0){HEAP32[1313846]=r12|r7;r27=r18;r28=(r6+2<<2)+5255424|0}else{r9=(r6+2<<2)+5255424|0;r8=HEAP32[r9>>2];if(r8>>>0>=HEAP32[1313850]>>>0){r27=r8;r28=r9;break}_abort()}}while(0);HEAP32[r28>>2]=r5;HEAP32[r27+12>>2]=r5;HEAP32[r5+8>>2]=r27;HEAP32[r5+12>>2]=r18}HEAP32[1313848]=r11;HEAP32[1313851]=r13}r6=r4+8|0;if((r6|0)==0){r15=r3,r16=r15>>2;break}else{r14=r6}return r14}else{if(r1>>>0>4294967231){r15=-1,r16=r15>>2;break}r6=r1+11|0;r7=r6&-8,r12=r7>>2;r19=HEAP32[1313847];if((r19|0)==0){r15=r7,r16=r15>>2;break}r17=-r7|0;r9=r6>>>8;do{if((r9|0)==0){r29=0}else{if(r7>>>0>16777215){r29=31;break}r6=(r9+1048320|0)>>>16&8;r8=r9<<r6;r10=(r8+520192|0)>>>16&4;r30=r8<<r10;r8=(r30+245760|0)>>>16&2;r31=14-(r10|r6|r8)+(r30<<r8>>>15)|0;r29=r7>>>((r31+7|0)>>>0)&1|r31<<1}}while(0);r9=HEAP32[(r29<<2)+5255688>>2];L6119:do{if((r9|0)==0){r32=0;r33=r17;r34=0}else{if((r29|0)==31){r35=0}else{r35=25-(r29>>>1)|0}r4=0;r13=r17;r11=r9,r18=r11>>2;r5=r7<<r35;r31=0;while(1){r8=HEAP32[r18+1]&-8;r30=r8-r7|0;if(r30>>>0<r13>>>0){if((r8|0)==(r7|0)){r32=r11;r33=r30;r34=r11;break L6119}else{r36=r11;r37=r30}}else{r36=r4;r37=r13}r30=HEAP32[r18+5];r8=HEAP32[((r5>>>31<<2)+16>>2)+r18];r6=(r30|0)==0|(r30|0)==(r8|0)?r31:r30;if((r8|0)==0){r32=r36;r33=r37;r34=r6;break L6119}else{r4=r36;r13=r37;r11=r8,r18=r11>>2;r5=r5<<1;r31=r6}}}}while(0);if((r34|0)==0&(r32|0)==0){r9=2<<r29;r17=r19&(r9|-r9);if((r17|0)==0){r15=r7,r16=r15>>2;break}r9=(r17&-r17)-1|0;r17=r9>>>12&16;r31=r9>>>(r17>>>0);r9=r31>>>5&8;r5=r31>>>(r9>>>0);r31=r5>>>2&4;r11=r5>>>(r31>>>0);r5=r11>>>1&2;r18=r11>>>(r5>>>0);r11=r18>>>1&1;r38=HEAP32[((r9|r17|r31|r5|r11)+(r18>>>(r11>>>0))<<2)+5255688>>2]}else{r38=r34}L6134:do{if((r38|0)==0){r39=r33;r40=r32,r41=r40>>2}else{r11=r38,r18=r11>>2;r5=r33;r31=r32;while(1){r17=(HEAP32[r18+1]&-8)-r7|0;r9=r17>>>0<r5>>>0;r13=r9?r17:r5;r17=r9?r11:r31;r9=HEAP32[r18+4];if((r9|0)!=0){r11=r9,r18=r11>>2;r5=r13;r31=r17;continue}r9=HEAP32[r18+5];if((r9|0)==0){r39=r13;r40=r17,r41=r40>>2;break L6134}else{r11=r9,r18=r11>>2;r5=r13;r31=r17}}}}while(0);if((r40|0)==0){r15=r7,r16=r15>>2;break}if(r39>>>0>=(HEAP32[1313848]-r7|0)>>>0){r15=r7,r16=r15>>2;break}r19=r40,r31=r19>>2;r5=HEAP32[1313850];if(r19>>>0<r5>>>0){_abort()}r11=r19+r7|0;r18=r11;if(r19>>>0>=r11>>>0){_abort()}r17=HEAP32[r41+6];r13=HEAP32[r41+3];L6147:do{if((r13|0)==(r40|0)){r9=r40+20|0;r4=HEAP32[r9>>2];do{if((r4|0)==0){r6=r40+16|0;r8=HEAP32[r6>>2];if((r8|0)==0){r42=0,r43=r42>>2;break L6147}else{r44=r8;r45=r6;break}}else{r44=r4;r45=r9}}while(0);while(1){r9=r44+20|0;r4=HEAP32[r9>>2];if((r4|0)!=0){r44=r4;r45=r9;continue}r9=r44+16|0;r4=HEAP32[r9>>2];if((r4|0)==0){break}else{r44=r4;r45=r9}}if(r45>>>0<r5>>>0){_abort()}else{HEAP32[r45>>2]=0;r42=r44,r43=r42>>2;break}}else{r9=HEAP32[r41+2];if(r9>>>0<r5>>>0){_abort()}r4=r9+12|0;if((HEAP32[r4>>2]|0)!=(r40|0)){_abort()}r6=r13+8|0;if((HEAP32[r6>>2]|0)==(r40|0)){HEAP32[r4>>2]=r13;HEAP32[r6>>2]=r9;r42=r13,r43=r42>>2;break}else{_abort()}}}while(0);L6169:do{if((r17|0)!=0){r13=r40+28|0;r5=(HEAP32[r13>>2]<<2)+5255688|0;do{if((r40|0)==(HEAP32[r5>>2]|0)){HEAP32[r5>>2]=r42;if((r42|0)!=0){break}HEAP32[1313847]=HEAP32[1313847]&(1<<HEAP32[r13>>2]^-1);break L6169}else{if(r17>>>0<HEAP32[1313850]>>>0){_abort()}r9=r17+16|0;if((HEAP32[r9>>2]|0)==(r40|0)){HEAP32[r9>>2]=r42}else{HEAP32[r17+20>>2]=r42}if((r42|0)==0){break L6169}}}while(0);if(r42>>>0<HEAP32[1313850]>>>0){_abort()}HEAP32[r43+6]=r17;r13=HEAP32[r41+4];do{if((r13|0)!=0){if(r13>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r43+4]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);r13=HEAP32[r41+5];if((r13|0)==0){break}if(r13>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r43+5]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);do{if(r39>>>0<16){r17=r39+r7|0;HEAP32[r41+1]=r17|3;r13=r17+(r19+4)|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1}else{HEAP32[r41+1]=r7|3;HEAP32[((r7|4)>>2)+r31]=r39|1;HEAP32[(r39>>2)+r31+r12]=r39;r13=r39>>>3;if(r39>>>0<256){r17=r13<<1;r5=(r17<<2)+5255424|0;r9=HEAP32[1313846];r6=1<<r13;do{if((r9&r6|0)==0){HEAP32[1313846]=r9|r6;r46=r5;r47=(r17+2<<2)+5255424|0}else{r13=(r17+2<<2)+5255424|0;r4=HEAP32[r13>>2];if(r4>>>0>=HEAP32[1313850]>>>0){r46=r4;r47=r13;break}_abort()}}while(0);HEAP32[r47>>2]=r18;HEAP32[r46+12>>2]=r18;HEAP32[r12+(r31+2)]=r46;HEAP32[r12+(r31+3)]=r5;break}r17=r11;r6=r39>>>8;do{if((r6|0)==0){r48=0}else{if(r39>>>0>16777215){r48=31;break}r9=(r6+1048320|0)>>>16&8;r13=r6<<r9;r4=(r13+520192|0)>>>16&4;r8=r13<<r4;r13=(r8+245760|0)>>>16&2;r30=14-(r4|r9|r13)+(r8<<r13>>>15)|0;r48=r39>>>((r30+7|0)>>>0)&1|r30<<1}}while(0);r6=(r48<<2)+5255688|0;HEAP32[r12+(r31+7)]=r48;HEAP32[r12+(r31+5)]=0;HEAP32[r12+(r31+4)]=0;r5=HEAP32[1313847];r30=1<<r48;if((r5&r30|0)==0){HEAP32[1313847]=r5|r30;HEAP32[r6>>2]=r17;HEAP32[r12+(r31+6)]=r6;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}if((r48|0)==31){r49=0}else{r49=25-(r48>>>1)|0}r30=r39<<r49;r5=HEAP32[r6>>2];while(1){if((HEAP32[r5+4>>2]&-8|0)==(r39|0)){break}r50=(r30>>>31<<2)+r5+16|0;r6=HEAP32[r50>>2];if((r6|0)==0){r2=5099;break}else{r30=r30<<1;r5=r6}}if(r2==5099){if(r50>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r50>>2]=r17;HEAP32[r12+(r31+6)]=r5;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}}r30=r5+8|0;r6=HEAP32[r30>>2];r13=HEAP32[1313850];if(r5>>>0<r13>>>0){_abort()}if(r6>>>0<r13>>>0){_abort()}else{HEAP32[r6+12>>2]=r17;HEAP32[r30>>2]=r17;HEAP32[r12+(r31+2)]=r6;HEAP32[r12+(r31+3)]=r5;HEAP32[r12+(r31+6)]=0;break}}}while(0);r31=r40+8|0;if((r31|0)==0){r15=r7,r16=r15>>2;break}else{r14=r31}return r14}}while(0);r40=HEAP32[1313848];if(r15>>>0<=r40>>>0){r50=r40-r15|0;r39=HEAP32[1313851];if(r50>>>0>15){r49=r39;HEAP32[1313851]=r49+r15|0;HEAP32[1313848]=r50;HEAP32[(r49+4>>2)+r16]=r50|1;HEAP32[r49+r40>>2]=r50;HEAP32[r39+4>>2]=r15|3}else{HEAP32[1313848]=0;HEAP32[1313851]=0;HEAP32[r39+4>>2]=r40|3;r50=r40+(r39+4)|0;HEAP32[r50>>2]=HEAP32[r50>>2]|1}r14=r39+8|0;return r14}r39=HEAP32[1313849];if(r15>>>0<r39>>>0){r50=r39-r15|0;HEAP32[1313849]=r50;r39=HEAP32[1313852];r40=r39;HEAP32[1313852]=r40+r15|0;HEAP32[(r40+4>>2)+r16]=r50|1;HEAP32[r39+4>>2]=r15|3;r14=r39+8|0;return r14}do{if((HEAP32[1310821]|0)==0){r39=_sysconf(8);if((r39-1&r39|0)==0){HEAP32[1310823]=r39;HEAP32[1310822]=r39;HEAP32[1310824]=-1;HEAP32[1310825]=2097152;HEAP32[1310826]=0;HEAP32[1313957]=0;HEAP32[1310821]=_time(0)&-16^1431655768;break}else{_abort()}}}while(0);r39=r15+48|0;r50=HEAP32[1310823];r40=r15+47|0;r49=r50+r40|0;r48=-r50|0;r50=r49&r48;if(r50>>>0<=r15>>>0){r14=0;return r14}r46=HEAP32[1313956];do{if((r46|0)!=0){r47=HEAP32[1313954];r41=r47+r50|0;if(r41>>>0<=r47>>>0|r41>>>0>r46>>>0){r14=0}else{break}return r14}}while(0);L6261:do{if((HEAP32[1313957]&4|0)==0){r46=HEAP32[1313852];L6263:do{if((r46|0)==0){r2=5129}else{r41=r46;r47=5255832;while(1){r51=r47|0;r42=HEAP32[r51>>2];if(r42>>>0<=r41>>>0){r52=r47+4|0;if((r42+HEAP32[r52>>2]|0)>>>0>r41>>>0){break}}r42=HEAP32[r47+8>>2];if((r42|0)==0){r2=5129;break L6263}else{r47=r42}}if((r47|0)==0){r2=5129;break}r41=r49-HEAP32[1313849]&r48;if(r41>>>0>=2147483647){r53=0;break}r5=_sbrk(r41);r17=(r5|0)==(HEAP32[r51>>2]+HEAP32[r52>>2]|0);r54=r17?r5:-1;r55=r17?r41:0;r56=r5;r57=r41;r2=5138;break}}while(0);do{if(r2==5129){r46=_sbrk(0);if((r46|0)==-1){r53=0;break}r7=r46;r41=HEAP32[1310822];r5=r41-1|0;if((r5&r7|0)==0){r58=r50}else{r58=r50-r7+(r5+r7&-r41)|0}r41=HEAP32[1313954];r7=r41+r58|0;if(!(r58>>>0>r15>>>0&r58>>>0<2147483647)){r53=0;break}r5=HEAP32[1313956];if((r5|0)!=0){if(r7>>>0<=r41>>>0|r7>>>0>r5>>>0){r53=0;break}}r5=_sbrk(r58);r7=(r5|0)==(r46|0);r54=r7?r46:-1;r55=r7?r58:0;r56=r5;r57=r58;r2=5138;break}}while(0);L6283:do{if(r2==5138){r5=-r57|0;if((r54|0)!=-1){r59=r55,r60=r59>>2;r61=r54,r62=r61>>2;r2=5149;break L6261}do{if((r56|0)!=-1&r57>>>0<2147483647&r57>>>0<r39>>>0){r7=HEAP32[1310823];r46=r40-r57+r7&-r7;if(r46>>>0>=2147483647){r63=r57;break}if((_sbrk(r46)|0)==-1){_sbrk(r5);r53=r55;break L6283}else{r63=r46+r57|0;break}}else{r63=r57}}while(0);if((r56|0)==-1){r53=r55}else{r59=r63,r60=r59>>2;r61=r56,r62=r61>>2;r2=5149;break L6261}}}while(0);HEAP32[1313957]=HEAP32[1313957]|4;r64=r53;r2=5146;break}else{r64=0;r2=5146}}while(0);do{if(r2==5146){if(r50>>>0>=2147483647){break}r53=_sbrk(r50);r56=_sbrk(0);if(!((r56|0)!=-1&(r53|0)!=-1&r53>>>0<r56>>>0)){break}r63=r56-r53|0;r56=r63>>>0>(r15+40|0)>>>0;r55=r56?r53:-1;if((r55|0)==-1){break}else{r59=r56?r63:r64,r60=r59>>2;r61=r55,r62=r61>>2;r2=5149;break}}}while(0);do{if(r2==5149){r64=HEAP32[1313954]+r59|0;HEAP32[1313954]=r64;if(r64>>>0>HEAP32[1313955]>>>0){HEAP32[1313955]=r64}r64=HEAP32[1313852],r50=r64>>2;L6303:do{if((r64|0)==0){r55=HEAP32[1313850];if((r55|0)==0|r61>>>0<r55>>>0){HEAP32[1313850]=r61}HEAP32[1313958]=r61;HEAP32[1313959]=r59;HEAP32[1313961]=0;HEAP32[1313855]=HEAP32[1310821];HEAP32[1313854]=-1;r55=0;while(1){r63=r55<<1;r56=(r63<<2)+5255424|0;HEAP32[(r63+3<<2)+5255424>>2]=r56;HEAP32[(r63+2<<2)+5255424>>2]=r56;r56=r55+1|0;if((r56|0)==32){break}else{r55=r56}}r55=r61+8|0;if((r55&7|0)==0){r65=0}else{r65=-r55&7}r55=r59-40-r65|0;HEAP32[1313852]=r61+r65|0;HEAP32[1313849]=r55;HEAP32[(r65+4>>2)+r62]=r55|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[1313853]=HEAP32[1310825]}else{r55=5255832,r56=r55>>2;while(1){r66=HEAP32[r56];r67=r55+4|0;r68=HEAP32[r67>>2];if((r61|0)==(r66+r68|0)){r2=5161;break}r63=HEAP32[r56+2];if((r63|0)==0){break}else{r55=r63,r56=r55>>2}}do{if(r2==5161){if((HEAP32[r56+3]&8|0)!=0){break}r55=r64;if(!(r55>>>0>=r66>>>0&r55>>>0<r61>>>0)){break}HEAP32[r67>>2]=r68+r59|0;r55=HEAP32[1313852];r63=HEAP32[1313849]+r59|0;r53=r55;r57=r55+8|0;if((r57&7|0)==0){r69=0}else{r69=-r57&7}r57=r63-r69|0;HEAP32[1313852]=r53+r69|0;HEAP32[1313849]=r57;HEAP32[r69+(r53+4)>>2]=r57|1;HEAP32[r63+(r53+4)>>2]=40;HEAP32[1313853]=HEAP32[1310825];break L6303}}while(0);if(r61>>>0<HEAP32[1313850]>>>0){HEAP32[1313850]=r61}r56=r61+r59|0;r53=5255832;while(1){r70=r53|0;if((HEAP32[r70>>2]|0)==(r56|0)){r2=5171;break}r63=HEAP32[r53+8>>2];if((r63|0)==0){break}else{r53=r63}}do{if(r2==5171){if((HEAP32[r53+12>>2]&8|0)!=0){break}HEAP32[r70>>2]=r61;r56=r53+4|0;HEAP32[r56>>2]=HEAP32[r56>>2]+r59|0;r56=r61+8|0;if((r56&7|0)==0){r71=0}else{r71=-r56&7}r56=r59+(r61+8)|0;if((r56&7|0)==0){r72=0,r73=r72>>2}else{r72=-r56&7,r73=r72>>2}r56=r61+r72+r59|0;r63=r56;r57=r71+r15|0,r55=r57>>2;r40=r61+r57|0;r57=r40;r39=r56-(r61+r71)-r15|0;HEAP32[(r71+4>>2)+r62]=r15|3;do{if((r63|0)==(HEAP32[1313852]|0)){r54=HEAP32[1313849]+r39|0;HEAP32[1313849]=r54;HEAP32[1313852]=r57;HEAP32[r55+(r62+1)]=r54|1}else{if((r63|0)==(HEAP32[1313851]|0)){r54=HEAP32[1313848]+r39|0;HEAP32[1313848]=r54;HEAP32[1313851]=r57;HEAP32[r55+(r62+1)]=r54|1;HEAP32[(r54>>2)+r62+r55]=r54;break}r54=r59+4|0;r58=HEAP32[(r54>>2)+r62+r73];if((r58&3|0)==1){r52=r58&-8;r51=r58>>>3;L6338:do{if(r58>>>0<256){r48=HEAP32[((r72|8)>>2)+r62+r60];r49=HEAP32[r73+(r62+(r60+3))];r5=(r51<<3)+5255424|0;do{if((r48|0)!=(r5|0)){if(r48>>>0<HEAP32[1313850]>>>0){_abort()}if((HEAP32[r48+12>>2]|0)==(r63|0)){break}_abort()}}while(0);if((r49|0)==(r48|0)){HEAP32[1313846]=HEAP32[1313846]&(1<<r51^-1);break}do{if((r49|0)==(r5|0)){r74=r49+8|0}else{if(r49>>>0<HEAP32[1313850]>>>0){_abort()}r47=r49+8|0;if((HEAP32[r47>>2]|0)==(r63|0)){r74=r47;break}_abort()}}while(0);HEAP32[r48+12>>2]=r49;HEAP32[r74>>2]=r48}else{r5=r56;r47=HEAP32[((r72|24)>>2)+r62+r60];r46=HEAP32[r73+(r62+(r60+3))];L6359:do{if((r46|0)==(r5|0)){r7=r72|16;r41=r61+r54+r7|0;r17=HEAP32[r41>>2];do{if((r17|0)==0){r42=r61+r7+r59|0;r43=HEAP32[r42>>2];if((r43|0)==0){r75=0,r76=r75>>2;break L6359}else{r77=r43;r78=r42;break}}else{r77=r17;r78=r41}}while(0);while(1){r41=r77+20|0;r17=HEAP32[r41>>2];if((r17|0)!=0){r77=r17;r78=r41;continue}r41=r77+16|0;r17=HEAP32[r41>>2];if((r17|0)==0){break}else{r77=r17;r78=r41}}if(r78>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r78>>2]=0;r75=r77,r76=r75>>2;break}}else{r41=HEAP32[((r72|8)>>2)+r62+r60];if(r41>>>0<HEAP32[1313850]>>>0){_abort()}r17=r41+12|0;if((HEAP32[r17>>2]|0)!=(r5|0)){_abort()}r7=r46+8|0;if((HEAP32[r7>>2]|0)==(r5|0)){HEAP32[r17>>2]=r46;HEAP32[r7>>2]=r41;r75=r46,r76=r75>>2;break}else{_abort()}}}while(0);if((r47|0)==0){break}r46=r72+(r61+(r59+28))|0;r48=(HEAP32[r46>>2]<<2)+5255688|0;do{if((r5|0)==(HEAP32[r48>>2]|0)){HEAP32[r48>>2]=r75;if((r75|0)!=0){break}HEAP32[1313847]=HEAP32[1313847]&(1<<HEAP32[r46>>2]^-1);break L6338}else{if(r47>>>0<HEAP32[1313850]>>>0){_abort()}r49=r47+16|0;if((HEAP32[r49>>2]|0)==(r5|0)){HEAP32[r49>>2]=r75}else{HEAP32[r47+20>>2]=r75}if((r75|0)==0){break L6338}}}while(0);if(r75>>>0<HEAP32[1313850]>>>0){_abort()}HEAP32[r76+6]=r47;r5=r72|16;r46=HEAP32[(r5>>2)+r62+r60];do{if((r46|0)!=0){if(r46>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r76+4]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r46=HEAP32[(r54+r5>>2)+r62];if((r46|0)==0){break}if(r46>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r76+5]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r79=r61+(r52|r72)+r59|0;r80=r52+r39|0}else{r79=r63;r80=r39}r54=r79+4|0;HEAP32[r54>>2]=HEAP32[r54>>2]&-2;HEAP32[r55+(r62+1)]=r80|1;HEAP32[(r80>>2)+r62+r55]=r80;r54=r80>>>3;if(r80>>>0<256){r51=r54<<1;r58=(r51<<2)+5255424|0;r46=HEAP32[1313846];r47=1<<r54;do{if((r46&r47|0)==0){HEAP32[1313846]=r46|r47;r81=r58;r82=(r51+2<<2)+5255424|0}else{r54=(r51+2<<2)+5255424|0;r48=HEAP32[r54>>2];if(r48>>>0>=HEAP32[1313850]>>>0){r81=r48;r82=r54;break}_abort()}}while(0);HEAP32[r82>>2]=r57;HEAP32[r81+12>>2]=r57;HEAP32[r55+(r62+2)]=r81;HEAP32[r55+(r62+3)]=r58;break}r51=r40;r47=r80>>>8;do{if((r47|0)==0){r83=0}else{if(r80>>>0>16777215){r83=31;break}r46=(r47+1048320|0)>>>16&8;r52=r47<<r46;r54=(r52+520192|0)>>>16&4;r48=r52<<r54;r52=(r48+245760|0)>>>16&2;r49=14-(r54|r46|r52)+(r48<<r52>>>15)|0;r83=r80>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r83<<2)+5255688|0;HEAP32[r55+(r62+7)]=r83;HEAP32[r55+(r62+5)]=0;HEAP32[r55+(r62+4)]=0;r58=HEAP32[1313847];r49=1<<r83;if((r58&r49|0)==0){HEAP32[1313847]=r58|r49;HEAP32[r47>>2]=r51;HEAP32[r55+(r62+6)]=r47;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}if((r83|0)==31){r84=0}else{r84=25-(r83>>>1)|0}r49=r80<<r84;r58=HEAP32[r47>>2];while(1){if((HEAP32[r58+4>>2]&-8|0)==(r80|0)){break}r85=(r49>>>31<<2)+r58+16|0;r47=HEAP32[r85>>2];if((r47|0)==0){r2=5244;break}else{r49=r49<<1;r58=r47}}if(r2==5244){if(r85>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r85>>2]=r51;HEAP32[r55+(r62+6)]=r58;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}}r49=r58+8|0;r47=HEAP32[r49>>2];r52=HEAP32[1313850];if(r58>>>0<r52>>>0){_abort()}if(r47>>>0<r52>>>0){_abort()}else{HEAP32[r47+12>>2]=r51;HEAP32[r49>>2]=r51;HEAP32[r55+(r62+2)]=r47;HEAP32[r55+(r62+3)]=r58;HEAP32[r55+(r62+6)]=0;break}}}while(0);r14=r61+(r71|8)|0;return r14}}while(0);r53=r64;r55=5255832,r40=r55>>2;while(1){r86=HEAP32[r40];if(r86>>>0<=r53>>>0){r87=HEAP32[r40+1];r88=r86+r87|0;if(r88>>>0>r53>>>0){break}}r55=HEAP32[r40+2],r40=r55>>2}r55=r86+(r87-39)|0;if((r55&7|0)==0){r89=0}else{r89=-r55&7}r55=r86+(r87-47)+r89|0;r40=r55>>>0<(r64+16|0)>>>0?r53:r55;r55=r40+8|0,r57=r55>>2;r39=r61+8|0;if((r39&7|0)==0){r90=0}else{r90=-r39&7}r39=r59-40-r90|0;HEAP32[1313852]=r61+r90|0;HEAP32[1313849]=r39;HEAP32[(r90+4>>2)+r62]=r39|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[1313853]=HEAP32[1310825];HEAP32[r40+4>>2]=27;HEAP32[r57]=HEAP32[1313958];HEAP32[r57+1]=HEAP32[1313959];HEAP32[r57+2]=HEAP32[1313960];HEAP32[r57+3]=HEAP32[1313961];HEAP32[1313958]=r61;HEAP32[1313959]=r59;HEAP32[1313961]=0;HEAP32[1313960]=r55;r55=r40+28|0;HEAP32[r55>>2]=7;L6457:do{if((r40+32|0)>>>0<r88>>>0){r57=r55;while(1){r39=r57+4|0;HEAP32[r39>>2]=7;if((r57+8|0)>>>0<r88>>>0){r57=r39}else{break L6457}}}}while(0);if((r40|0)==(r53|0)){break}r55=r40-r64|0;r57=r55+(r53+4)|0;HEAP32[r57>>2]=HEAP32[r57>>2]&-2;HEAP32[r50+1]=r55|1;HEAP32[r53+r55>>2]=r55;r57=r55>>>3;if(r55>>>0<256){r39=r57<<1;r63=(r39<<2)+5255424|0;r56=HEAP32[1313846];r47=1<<r57;do{if((r56&r47|0)==0){HEAP32[1313846]=r56|r47;r91=r63;r92=(r39+2<<2)+5255424|0}else{r57=(r39+2<<2)+5255424|0;r49=HEAP32[r57>>2];if(r49>>>0>=HEAP32[1313850]>>>0){r91=r49;r92=r57;break}_abort()}}while(0);HEAP32[r92>>2]=r64;HEAP32[r91+12>>2]=r64;HEAP32[r50+2]=r91;HEAP32[r50+3]=r63;break}r39=r64;r47=r55>>>8;do{if((r47|0)==0){r93=0}else{if(r55>>>0>16777215){r93=31;break}r56=(r47+1048320|0)>>>16&8;r53=r47<<r56;r40=(r53+520192|0)>>>16&4;r57=r53<<r40;r53=(r57+245760|0)>>>16&2;r49=14-(r40|r56|r53)+(r57<<r53>>>15)|0;r93=r55>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r93<<2)+5255688|0;HEAP32[r50+7]=r93;HEAP32[r50+5]=0;HEAP32[r50+4]=0;r63=HEAP32[1313847];r49=1<<r93;if((r63&r49|0)==0){HEAP32[1313847]=r63|r49;HEAP32[r47>>2]=r39;HEAP32[r50+6]=r47;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}if((r93|0)==31){r94=0}else{r94=25-(r93>>>1)|0}r49=r55<<r94;r63=HEAP32[r47>>2];while(1){if((HEAP32[r63+4>>2]&-8|0)==(r55|0)){break}r95=(r49>>>31<<2)+r63+16|0;r47=HEAP32[r95>>2];if((r47|0)==0){r2=5279;break}else{r49=r49<<1;r63=r47}}if(r2==5279){if(r95>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r95>>2]=r39;HEAP32[r50+6]=r63;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}}r49=r63+8|0;r55=HEAP32[r49>>2];r47=HEAP32[1313850];if(r63>>>0<r47>>>0){_abort()}if(r55>>>0<r47>>>0){_abort()}else{HEAP32[r55+12>>2]=r39;HEAP32[r49>>2]=r39;HEAP32[r50+2]=r55;HEAP32[r50+3]=r63;HEAP32[r50+6]=0;break}}}while(0);r50=HEAP32[1313849];if(r50>>>0<=r15>>>0){break}r64=r50-r15|0;HEAP32[1313849]=r64;r50=HEAP32[1313852];r55=r50;HEAP32[1313852]=r55+r15|0;HEAP32[(r55+4>>2)+r16]=r64|1;HEAP32[r50+4>>2]=r15|3;r14=r50+8|0;return r14}}while(0);HEAP32[___errno_location()>>2]=12;r14=0;return r14}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=r1>>2;r3=0;if((r1|0)==0){return}r4=r1-8|0;r5=r4;r6=HEAP32[1313850];if(r4>>>0<r6>>>0){_abort()}r7=HEAP32[r1-4>>2];r8=r7&3;if((r8|0)==1){_abort()}r9=r7&-8,r10=r9>>2;r11=r1+(r9-8)|0;r12=r11;L6520:do{if((r7&1|0)==0){r13=HEAP32[r4>>2];if((r8|0)==0){return}r14=-8-r13|0,r15=r14>>2;r16=r1+r14|0;r17=r16;r18=r13+r9|0;if(r16>>>0<r6>>>0){_abort()}if((r17|0)==(HEAP32[1313851]|0)){r19=(r1+(r9-4)|0)>>2;if((HEAP32[r19]&3|0)!=3){r20=r17,r21=r20>>2;r22=r18;break}HEAP32[1313848]=r18;HEAP32[r19]=HEAP32[r19]&-2;HEAP32[r15+(r2+1)]=r18|1;HEAP32[r11>>2]=r18;return}r19=r13>>>3;if(r13>>>0<256){r13=HEAP32[r15+(r2+2)];r23=HEAP32[r15+(r2+3)];r24=(r19<<3)+5255424|0;do{if((r13|0)!=(r24|0)){if(r13>>>0<r6>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r17|0)){break}_abort()}}while(0);if((r23|0)==(r13|0)){HEAP32[1313846]=HEAP32[1313846]&(1<<r19^-1);r20=r17,r21=r20>>2;r22=r18;break}do{if((r23|0)==(r24|0)){r25=r23+8|0}else{if(r23>>>0<r6>>>0){_abort()}r26=r23+8|0;if((HEAP32[r26>>2]|0)==(r17|0)){r25=r26;break}_abort()}}while(0);HEAP32[r13+12>>2]=r23;HEAP32[r25>>2]=r13;r20=r17,r21=r20>>2;r22=r18;break}r24=r16;r19=HEAP32[r15+(r2+6)];r26=HEAP32[r15+(r2+3)];L6554:do{if((r26|0)==(r24|0)){r27=r14+(r1+20)|0;r28=HEAP32[r27>>2];do{if((r28|0)==0){r29=r14+(r1+16)|0;r30=HEAP32[r29>>2];if((r30|0)==0){r31=0,r32=r31>>2;break L6554}else{r33=r30;r34=r29;break}}else{r33=r28;r34=r27}}while(0);while(1){r27=r33+20|0;r28=HEAP32[r27>>2];if((r28|0)!=0){r33=r28;r34=r27;continue}r27=r33+16|0;r28=HEAP32[r27>>2];if((r28|0)==0){break}else{r33=r28;r34=r27}}if(r34>>>0<r6>>>0){_abort()}else{HEAP32[r34>>2]=0;r31=r33,r32=r31>>2;break}}else{r27=HEAP32[r15+(r2+2)];if(r27>>>0<r6>>>0){_abort()}r28=r27+12|0;if((HEAP32[r28>>2]|0)!=(r24|0)){_abort()}r29=r26+8|0;if((HEAP32[r29>>2]|0)==(r24|0)){HEAP32[r28>>2]=r26;HEAP32[r29>>2]=r27;r31=r26,r32=r31>>2;break}else{_abort()}}}while(0);if((r19|0)==0){r20=r17,r21=r20>>2;r22=r18;break}r26=r14+(r1+28)|0;r16=(HEAP32[r26>>2]<<2)+5255688|0;do{if((r24|0)==(HEAP32[r16>>2]|0)){HEAP32[r16>>2]=r31;if((r31|0)!=0){break}HEAP32[1313847]=HEAP32[1313847]&(1<<HEAP32[r26>>2]^-1);r20=r17,r21=r20>>2;r22=r18;break L6520}else{if(r19>>>0<HEAP32[1313850]>>>0){_abort()}r13=r19+16|0;if((HEAP32[r13>>2]|0)==(r24|0)){HEAP32[r13>>2]=r31}else{HEAP32[r19+20>>2]=r31}if((r31|0)==0){r20=r17,r21=r20>>2;r22=r18;break L6520}}}while(0);if(r31>>>0<HEAP32[1313850]>>>0){_abort()}HEAP32[r32+6]=r19;r24=HEAP32[r15+(r2+4)];do{if((r24|0)!=0){if(r24>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r32+4]=r24;HEAP32[r24+24>>2]=r31;break}}}while(0);r24=HEAP32[r15+(r2+5)];if((r24|0)==0){r20=r17,r21=r20>>2;r22=r18;break}if(r24>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r32+5]=r24;HEAP32[r24+24>>2]=r31;r20=r17,r21=r20>>2;r22=r18;break}}else{r20=r5,r21=r20>>2;r22=r9}}while(0);r5=r20,r31=r5>>2;if(r5>>>0>=r11>>>0){_abort()}r5=r1+(r9-4)|0;r32=HEAP32[r5>>2];if((r32&1|0)==0){_abort()}do{if((r32&2|0)==0){if((r12|0)==(HEAP32[1313852]|0)){r6=HEAP32[1313849]+r22|0;HEAP32[1313849]=r6;HEAP32[1313852]=r20;HEAP32[r21+1]=r6|1;if((r20|0)==(HEAP32[1313851]|0)){HEAP32[1313851]=0;HEAP32[1313848]=0}if(r6>>>0<=HEAP32[1313853]>>>0){return}_sys_trim(0);return}if((r12|0)==(HEAP32[1313851]|0)){r6=HEAP32[1313848]+r22|0;HEAP32[1313848]=r6;HEAP32[1313851]=r20;HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;return}r6=(r32&-8)+r22|0;r33=r32>>>3;L6625:do{if(r32>>>0<256){r34=HEAP32[r2+r10];r25=HEAP32[((r9|4)>>2)+r2];r8=(r33<<3)+5255424|0;do{if((r34|0)!=(r8|0)){if(r34>>>0<HEAP32[1313850]>>>0){_abort()}if((HEAP32[r34+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r25|0)==(r34|0)){HEAP32[1313846]=HEAP32[1313846]&(1<<r33^-1);break}do{if((r25|0)==(r8|0)){r35=r25+8|0}else{if(r25>>>0<HEAP32[1313850]>>>0){_abort()}r4=r25+8|0;if((HEAP32[r4>>2]|0)==(r12|0)){r35=r4;break}_abort()}}while(0);HEAP32[r34+12>>2]=r25;HEAP32[r35>>2]=r34}else{r8=r11;r4=HEAP32[r10+(r2+4)];r7=HEAP32[((r9|4)>>2)+r2];L6627:do{if((r7|0)==(r8|0)){r24=r9+(r1+12)|0;r19=HEAP32[r24>>2];do{if((r19|0)==0){r26=r9+(r1+8)|0;r16=HEAP32[r26>>2];if((r16|0)==0){r36=0,r37=r36>>2;break L6627}else{r38=r16;r39=r26;break}}else{r38=r19;r39=r24}}while(0);while(1){r24=r38+20|0;r19=HEAP32[r24>>2];if((r19|0)!=0){r38=r19;r39=r24;continue}r24=r38+16|0;r19=HEAP32[r24>>2];if((r19|0)==0){break}else{r38=r19;r39=r24}}if(r39>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r39>>2]=0;r36=r38,r37=r36>>2;break}}else{r24=HEAP32[r2+r10];if(r24>>>0<HEAP32[1313850]>>>0){_abort()}r19=r24+12|0;if((HEAP32[r19>>2]|0)!=(r8|0)){_abort()}r26=r7+8|0;if((HEAP32[r26>>2]|0)==(r8|0)){HEAP32[r19>>2]=r7;HEAP32[r26>>2]=r24;r36=r7,r37=r36>>2;break}else{_abort()}}}while(0);if((r4|0)==0){break}r7=r9+(r1+20)|0;r34=(HEAP32[r7>>2]<<2)+5255688|0;do{if((r8|0)==(HEAP32[r34>>2]|0)){HEAP32[r34>>2]=r36;if((r36|0)!=0){break}HEAP32[1313847]=HEAP32[1313847]&(1<<HEAP32[r7>>2]^-1);break L6625}else{if(r4>>>0<HEAP32[1313850]>>>0){_abort()}r25=r4+16|0;if((HEAP32[r25>>2]|0)==(r8|0)){HEAP32[r25>>2]=r36}else{HEAP32[r4+20>>2]=r36}if((r36|0)==0){break L6625}}}while(0);if(r36>>>0<HEAP32[1313850]>>>0){_abort()}HEAP32[r37+6]=r4;r8=HEAP32[r10+(r2+2)];do{if((r8|0)!=0){if(r8>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r37+4]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);r8=HEAP32[r10+(r2+3)];if((r8|0)==0){break}if(r8>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r37+5]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;if((r20|0)!=(HEAP32[1313851]|0)){r40=r6;break}HEAP32[1313848]=r6;return}else{HEAP32[r5>>2]=r32&-2;HEAP32[r21+1]=r22|1;HEAP32[(r22>>2)+r31]=r22;r40=r22}}while(0);r22=r40>>>3;if(r40>>>0<256){r31=r22<<1;r32=(r31<<2)+5255424|0;r5=HEAP32[1313846];r36=1<<r22;do{if((r5&r36|0)==0){HEAP32[1313846]=r5|r36;r41=r32;r42=(r31+2<<2)+5255424|0}else{r22=(r31+2<<2)+5255424|0;r37=HEAP32[r22>>2];if(r37>>>0>=HEAP32[1313850]>>>0){r41=r37;r42=r22;break}_abort()}}while(0);HEAP32[r42>>2]=r20;HEAP32[r41+12>>2]=r20;HEAP32[r21+2]=r41;HEAP32[r21+3]=r32;return}r32=r20;r41=r40>>>8;do{if((r41|0)==0){r43=0}else{if(r40>>>0>16777215){r43=31;break}r42=(r41+1048320|0)>>>16&8;r31=r41<<r42;r36=(r31+520192|0)>>>16&4;r5=r31<<r36;r31=(r5+245760|0)>>>16&2;r22=14-(r36|r42|r31)+(r5<<r31>>>15)|0;r43=r40>>>((r22+7|0)>>>0)&1|r22<<1}}while(0);r41=(r43<<2)+5255688|0;HEAP32[r21+7]=r43;HEAP32[r21+5]=0;HEAP32[r21+4]=0;r22=HEAP32[1313847];r31=1<<r43;do{if((r22&r31|0)==0){HEAP32[1313847]=r22|r31;HEAP32[r41>>2]=r32;HEAP32[r21+6]=r41;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20}else{if((r43|0)==31){r44=0}else{r44=25-(r43>>>1)|0}r5=r40<<r44;r42=HEAP32[r41>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r40|0)){break}r45=(r5>>>31<<2)+r42+16|0;r36=HEAP32[r45>>2];if((r36|0)==0){r3=5458;break}else{r5=r5<<1;r42=r36}}if(r3==5458){if(r45>>>0<HEAP32[1313850]>>>0){_abort()}else{HEAP32[r45>>2]=r32;HEAP32[r21+6]=r42;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20;break}}r5=r42+8|0;r6=HEAP32[r5>>2];r36=HEAP32[1313850];if(r42>>>0<r36>>>0){_abort()}if(r6>>>0<r36>>>0){_abort()}else{HEAP32[r6+12>>2]=r32;HEAP32[r5>>2]=r32;HEAP32[r21+2]=r6;HEAP32[r21+3]=r42;HEAP32[r21+6]=0;break}}}while(0);r21=HEAP32[1313854]-1|0;HEAP32[1313854]=r21;if((r21|0)==0){r46=5255840}else{return}while(1){r21=HEAP32[r46>>2];if((r21|0)==0){break}else{r46=r21+8|0}}HEAP32[1313854]=-1;return}function __ZNKSt9bad_alloc4whatEv(r1){return 5249472}function __ZdlPv(r1){if((r1|0)==0){return}_free(r1);return}function __ZNSt9bad_allocD0Ev(r1){__ZdlPv(r1);return}function __ZNSt9bad_allocD2Ev(r1){return}function _sys_trim(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;do{if((HEAP32[1310821]|0)==0){r2=_sysconf(8);if((r2-1&r2|0)==0){HEAP32[1310823]=r2;HEAP32[1310822]=r2;HEAP32[1310824]=-1;HEAP32[1310825]=2097152;HEAP32[1310826]=0;HEAP32[1313957]=0;HEAP32[1310821]=_time(0)&-16^1431655768;break}else{_abort()}}}while(0);if(r1>>>0>=4294967232){r3=0;r4=r3&1;return r4}r2=HEAP32[1313852];if((r2|0)==0){r3=0;r4=r3&1;return r4}r5=HEAP32[1313849];do{if(r5>>>0>(r1+40|0)>>>0){r6=HEAP32[1310823];r7=Math.imul(Math.floor(((-40-r1-1+r5+r6|0)>>>0)/(r6>>>0))-1|0,r6);r8=r2;r9=5255832,r10=r9>>2;while(1){r11=HEAP32[r10];if(r11>>>0<=r8>>>0){if((r11+HEAP32[r10+1]|0)>>>0>r8>>>0){r12=r9;break}}r11=HEAP32[r10+2];if((r11|0)==0){r12=0;break}else{r9=r11,r10=r9>>2}}if((HEAP32[r12+12>>2]&8|0)!=0){break}r9=_sbrk(0);r10=(r12+4|0)>>2;if((r9|0)!=(HEAP32[r12>>2]+HEAP32[r10]|0)){break}r8=_sbrk(-(r7>>>0>2147483646?-2147483648-r6|0:r7)|0);r11=_sbrk(0);if(!((r8|0)!=-1&r11>>>0<r9>>>0)){break}r8=r9-r11|0;if((r9|0)==(r11|0)){break}HEAP32[r10]=HEAP32[r10]-r8|0;HEAP32[1313954]=HEAP32[1313954]-r8|0;r10=HEAP32[1313852];r13=HEAP32[1313849]-r8|0;r8=r10;r14=r10+8|0;if((r14&7|0)==0){r15=0}else{r15=-r14&7}r14=r13-r15|0;HEAP32[1313852]=r8+r15|0;HEAP32[1313849]=r14;HEAP32[r15+(r8+4)>>2]=r14|1;HEAP32[r13+(r8+4)>>2]=40;HEAP32[1313853]=HEAP32[1310825];r3=(r9|0)!=(r11|0);r4=r3&1;return r4}}while(0);if(HEAP32[1313849]>>>0<=HEAP32[1313853]>>>0){r3=0;r4=r3&1;return r4}HEAP32[1313853]=-1;r3=0;r4=r3&1;return r4}function __Znwj(r1){var r2,r3,r4;r2=0;r3=(r1|0)==0?1:r1;while(1){r4=_malloc(r3);if((r4|0)!=0){r2=5544;break}r1=(tempValue=HEAP32[1316138],HEAP32[1316138]=tempValue,tempValue);if((r1|0)==0){break}FUNCTION_TABLE[r1]()}if(r2==5544){return r4}r4=___cxa_allocate_exception(4);HEAP32[r4>>2]=5261420;___cxa_throw(r4,5263280,194)}
// EMSCRIPTEN_END_FUNCS
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_STATIC) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_STATIC));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_STATIC);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module.callMain(args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}
// Bindings utilities
var Object__cache = {}; // we do it this way so we do not modify |Object|
function wrapPointer(ptr, __class__) {
  var cache = __class__ ? __class__.prototype.__cache__ : Object__cache;
  var ret = cache[ptr];
  if (ret) return ret;
  __class__ = __class__ || Object;
  ret = Object.create(__class__.prototype);
  ret.ptr = ptr;
  ret.__class__ = __class__;
  return cache[ptr] = ret;
}
Module['wrapPointer'] = wrapPointer;
function castObject(obj, __class__) {
  return wrapPointer(obj.ptr, __class__);
}
Module['castObject'] = castObject;
Module['NULL'] = wrapPointer(0);
function destroy(obj) {
  if (!obj['__destroy__']) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
  obj['__destroy__']();
  // Remove from cache, so the object can be GC'd and refs added onto it released
  if (obj.__class__ !== Object) {
    delete obj.__class__.prototype.__cache__[obj.ptr];
  } else {
    delete Object__cache[obj.ptr];
  }
}
Module['destroy'] = destroy;
function compare(obj1, obj2) {
  return obj1.ptr === obj2.ptr;
}
Module['compare'] = compare;
function getPointer(obj) {
  return obj.ptr;
}
Module['getPointer'] = getPointer;
function getClass(obj) {
  return obj.__class__;
}
Module['getClass'] = getClass;
function customizeVTable(object, replacementPairs) {
  // Does not handle multiple inheritance
  // Does not work with asm.js
  // Find out vtable size
  var vTable = getValue(object.ptr, 'void*');
  // This assumes our modification where we null-terminate vtables
  var size = 0;
  while (getValue(vTable + Runtime.QUANTUM_SIZE*size, 'void*')) {
    size++;
  }
  // Prepare replacement lookup table and add replacements to FUNCTION_TABLE
  // There is actually no good way to do this! So we do the following hack:
  // We create a fake vtable with canary functions, to detect which actual
  // function is being called
  var vTable2 = _malloc(size*Runtime.QUANTUM_SIZE);
  setValue(object.ptr, vTable2, 'void*');
  var canaryValue;
  var functions = FUNCTION_TABLE.length;
  for (var i = 0; i < size; i++) {
    var index = FUNCTION_TABLE.length;
    (function(j) {
      FUNCTION_TABLE.push(function() {
        canaryValue = j;
      });
    })(i);
    FUNCTION_TABLE.push(0);
    setValue(vTable2 + Runtime.QUANTUM_SIZE*i, index, 'void*');
  }
  var args = [{ptr: 0}];
  replacementPairs.forEach(function(pair) {
    // We need the wrapper function that converts arguments to not fail. Keep adding arguments til it works.
    while(1) {
      try {
        pair['original'].apply(object, args);
        break;
      } catch(e) {
        args.push(args[0]);
      }
    }
    pair.originalIndex = getValue(vTable + canaryValue*Runtime.QUANTUM_SIZE, 'void*');
  });
  FUNCTION_TABLE = FUNCTION_TABLE.slice(0, functions);
  // Do the replacements
  var replacements = {};
  replacementPairs.forEach(function(pair) {
    var replacementIndex = FUNCTION_TABLE.length;
    FUNCTION_TABLE.push(pair['replacement']);
    FUNCTION_TABLE.push(0);
    replacements[pair.originalIndex] = replacementIndex;
  });
  // Copy and modify vtable
  for (var i = 0; i < size; i++) {
    var value = getValue(vTable + Runtime.QUANTUM_SIZE*i, 'void*');
    if (value in replacements) value = replacements[value];
    setValue(vTable2 + Runtime.QUANTUM_SIZE*i, value, 'void*');
  }
  return object;
}
Module['customizeVTable'] = customizeVTable;
// Converts a value into a C-style string.
function ensureString(value) {
  if (typeof value == 'number') return value;
  return allocate(intArrayFromString(value), 'i8', ALLOC_STACK);
}
b2ContactManager.prototype['get_m_contactFilter'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactManager__get_m_contactFilter_p0(this.ptr), Module['b2ContactFilter']);
}
b2ContactManager.prototype['get_m_contactCount'] = function() {
    return _emscripten_bind_b2ContactManager__get_m_contactCount_p0(this.ptr);
}
b2ContactManager.prototype['set_m_contactFilter'] = function(arg0) {
    _emscripten_bind_b2ContactManager__set_m_contactFilter_p1(this.ptr, arg0.ptr);
}
function b2ContactManager() {
    this.ptr = _emscripten_bind_b2ContactManager__b2ContactManager_p0();
  b2ContactManager.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2ContactManager;
}
b2ContactManager.prototype.__cache__ = {};
Module['b2ContactManager'] = b2ContactManager;
b2ContactManager.prototype['AddPair'] = function(arg0, arg1) {
    _emscripten_bind_b2ContactManager__AddPair_p2(this.ptr, arg0, arg1);
}
b2ContactManager.prototype['set_m_allocator'] = function(arg0) {
    _emscripten_bind_b2ContactManager__set_m_allocator_p1(this.ptr, arg0.ptr);
}
b2ContactManager.prototype['set_m_contactCount'] = function(arg0) {
    _emscripten_bind_b2ContactManager__set_m_contactCount_p1(this.ptr, arg0);
}
b2ContactManager.prototype['Collide'] = function() {
    _emscripten_bind_b2ContactManager__Collide_p0(this.ptr);
}
b2ContactManager.prototype['set_m_contactList'] = function(arg0) {
    _emscripten_bind_b2ContactManager__set_m_contactList_p1(this.ptr, arg0.ptr);
}
b2ContactManager.prototype['FindNewContacts'] = function() {
    _emscripten_bind_b2ContactManager__FindNewContacts_p0(this.ptr);
}
b2ContactManager.prototype['get_m_contactListener'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactManager__get_m_contactListener_p0(this.ptr), Module['b2ContactListener']);
}
b2ContactManager.prototype['__destroy__'] = function() {
    _emscripten_bind_b2ContactManager____destroy___p0(this.ptr);
}
b2ContactManager.prototype['set_m_contactListener'] = function(arg0) {
    _emscripten_bind_b2ContactManager__set_m_contactListener_p1(this.ptr, arg0.ptr);
}
b2ContactManager.prototype['get_m_broadPhase'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactManager__get_m_broadPhase_p0(this.ptr), Module['b2BroadPhase']);
}
b2ContactManager.prototype['Destroy'] = function(arg0) {
    _emscripten_bind_b2ContactManager__Destroy_p1(this.ptr, arg0.ptr);
}
b2ContactManager.prototype['set_m_broadPhase'] = function(arg0) {
    _emscripten_bind_b2ContactManager__set_m_broadPhase_p1(this.ptr, arg0.ptr);
}
b2ContactManager.prototype['get_m_contactList'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactManager__get_m_contactList_p0(this.ptr), Module['b2Contact']);
}
b2ContactManager.prototype['get_m_allocator'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactManager__get_m_allocator_p0(this.ptr), Module['b2BlockAllocator']);
}
b2DistanceJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2DistanceJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2DistanceJoint.prototype['SetFrequency'] = function(arg0) {
    _emscripten_bind_b2DistanceJoint__SetFrequency_p1(this.ptr, arg0);
}
b2DistanceJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2DistanceJoint__GetUserData_p0(this.ptr);
}
b2DistanceJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2DistanceJoint__SetUserData_p1(this.ptr, arg0);
}
b2DistanceJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2DistanceJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2DistanceJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2DistanceJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2DistanceJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2DistanceJoint.prototype['GetFrequency'] = function() {
    return _emscripten_bind_b2DistanceJoint__GetFrequency_p0(this.ptr);
}
b2DistanceJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2DistanceJoint.prototype['GetLength'] = function() {
    return _emscripten_bind_b2DistanceJoint__GetLength_p0(this.ptr);
}
b2DistanceJoint.prototype['GetDampingRatio'] = function() {
    return _emscripten_bind_b2DistanceJoint__GetDampingRatio_p0(this.ptr);
}
b2DistanceJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2DistanceJoint__GetCollideConnected_p0(this.ptr);
}
b2DistanceJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2DistanceJoint____destroy___p0(this.ptr);
}
b2DistanceJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2DistanceJoint__Dump_p0(this.ptr);
}
b2DistanceJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2DistanceJoint__GetType_p0(this.ptr);
}
function b2DistanceJoint(arg0) {
    this.ptr = _emscripten_bind_b2DistanceJoint__b2DistanceJoint_p1(arg0.ptr);
  b2DistanceJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2DistanceJoint;
}
b2DistanceJoint.prototype.__cache__ = {};
Module['b2DistanceJoint'] = b2DistanceJoint;
b2DistanceJoint.prototype['SetDampingRatio'] = function(arg0) {
    _emscripten_bind_b2DistanceJoint__SetDampingRatio_p1(this.ptr, arg0);
}
b2DistanceJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2DistanceJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2DistanceJoint.prototype['SetLength'] = function(arg0) {
    _emscripten_bind_b2DistanceJoint__SetLength_p1(this.ptr, arg0);
}
b2DistanceJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2DistanceJoint__IsActive_p0(this.ptr);
}
b2Fixture.prototype['GetRestitution'] = function() {
    return _emscripten_bind_b2Fixture__GetRestitution_p0(this.ptr);
}
b2Fixture.prototype['SetFilterData'] = function(arg0) {
    _emscripten_bind_b2Fixture__SetFilterData_p1(this.ptr, arg0.ptr);
}
b2Fixture.prototype['SetFriction'] = function(arg0) {
    _emscripten_bind_b2Fixture__SetFriction_p1(this.ptr, arg0);
}
function b2Fixture() {
    this.ptr = _emscripten_bind_b2Fixture__b2Fixture_p0();
  b2Fixture.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Fixture;
}
b2Fixture.prototype.__cache__ = {};
Module['b2Fixture'] = b2Fixture;
b2Fixture.prototype['GetShape'] = function() {
    return wrapPointer(_emscripten_bind_b2Fixture__GetShape_p0(this.ptr), Module['b2Shape']);
}
b2Fixture.prototype['SetRestitution'] = function(arg0) {
    _emscripten_bind_b2Fixture__SetRestitution_p1(this.ptr, arg0);
}
b2Fixture.prototype['GetBody'] = function() {
    return wrapPointer(_emscripten_bind_b2Fixture__GetBody_p0(this.ptr), Module['b2Body']);
}
b2Fixture.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2Fixture__GetNext_p0(this.ptr), Module['b2Fixture']);
}
b2Fixture.prototype['GetFriction'] = function() {
    return _emscripten_bind_b2Fixture__GetFriction_p0(this.ptr);
}
b2Fixture.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2Fixture__GetUserData_p0(this.ptr);
}
b2Fixture.prototype['SetDensity'] = function(arg0) {
    _emscripten_bind_b2Fixture__SetDensity_p1(this.ptr, arg0);
}
b2Fixture.prototype['GetMassData'] = function(arg0) {
    _emscripten_bind_b2Fixture__GetMassData_p1(this.ptr, arg0.ptr);
}
b2Fixture.prototype['SetSensor'] = function(arg0) {
    _emscripten_bind_b2Fixture__SetSensor_p1(this.ptr, arg0);
}
b2Fixture.prototype['GetAABB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Fixture__GetAABB_p1(this.ptr, arg0), Module['b2AABB']);
}
b2Fixture.prototype['TestPoint'] = function(arg0) {
    return _emscripten_bind_b2Fixture__TestPoint_p1(this.ptr, arg0.ptr);
}
b2Fixture.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2Fixture__SetUserData_p1(this.ptr, arg0);
}
b2Fixture.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Fixture____destroy___p0(this.ptr);
}
b2Fixture.prototype['RayCast'] = function(arg0, arg1, arg2) {
    return _emscripten_bind_b2Fixture__RayCast_p3(this.ptr, arg0.ptr, arg1.ptr, arg2);
}
b2Fixture.prototype['Refilter'] = function() {
    _emscripten_bind_b2Fixture__Refilter_p0(this.ptr);
}
b2Fixture.prototype['Dump'] = function(arg0) {
    _emscripten_bind_b2Fixture__Dump_p1(this.ptr, arg0);
}
b2Fixture.prototype['GetFilterData'] = function() {
    return wrapPointer(_emscripten_bind_b2Fixture__GetFilterData_p0(this.ptr), Module['b2Filter']);
}
b2Fixture.prototype['IsSensor'] = function() {
    return _emscripten_bind_b2Fixture__IsSensor_p0(this.ptr);
}
b2Fixture.prototype['GetType'] = function() {
    return _emscripten_bind_b2Fixture__GetType_p0(this.ptr);
}
b2Fixture.prototype['GetDensity'] = function() {
    return _emscripten_bind_b2Fixture__GetDensity_p0(this.ptr);
}
b2MouseJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2MouseJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2MouseJoint.prototype['SetFrequency'] = function(arg0) {
    _emscripten_bind_b2MouseJoint__SetFrequency_p1(this.ptr, arg0);
}
b2MouseJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2MouseJoint__GetUserData_p0(this.ptr);
}
b2MouseJoint.prototype['SetMaxForce'] = function(arg0) {
    _emscripten_bind_b2MouseJoint__SetMaxForce_p1(this.ptr, arg0);
}
b2MouseJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2MouseJoint__SetUserData_p1(this.ptr, arg0);
}
b2MouseJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2MouseJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
function b2MouseJoint(arg0) {
    this.ptr = _emscripten_bind_b2MouseJoint__b2MouseJoint_p1(arg0.ptr);
  b2MouseJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2MouseJoint;
}
b2MouseJoint.prototype.__cache__ = {};
Module['b2MouseJoint'] = b2MouseJoint;
b2MouseJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2MouseJoint.prototype['GetMaxForce'] = function() {
    return _emscripten_bind_b2MouseJoint__GetMaxForce_p0(this.ptr);
}
b2MouseJoint.prototype['GetTarget'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetTarget_p0(this.ptr), Module['b2Vec2']);
}
b2MouseJoint.prototype['GetFrequency'] = function() {
    return _emscripten_bind_b2MouseJoint__GetFrequency_p0(this.ptr);
}
b2MouseJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2MouseJoint.prototype['GetDampingRatio'] = function() {
    return _emscripten_bind_b2MouseJoint__GetDampingRatio_p0(this.ptr);
}
b2MouseJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2MouseJoint__GetCollideConnected_p0(this.ptr);
}
b2MouseJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2MouseJoint____destroy___p0(this.ptr);
}
b2MouseJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2MouseJoint__Dump_p0(this.ptr);
}
b2MouseJoint.prototype['SetTarget'] = function(arg0) {
    _emscripten_bind_b2MouseJoint__SetTarget_p1(this.ptr, arg0.ptr);
}
b2MouseJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2MouseJoint__GetType_p0(this.ptr);
}
b2MouseJoint.prototype['SetDampingRatio'] = function(arg0) {
    _emscripten_bind_b2MouseJoint__SetDampingRatio_p1(this.ptr, arg0);
}
b2MouseJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2MouseJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2MouseJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2MouseJoint__IsActive_p0(this.ptr);
}
b2PulleyJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2PulleyJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2PulleyJoint____destroy___p0(this.ptr);
}
b2PulleyJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2PulleyJoint__GetType_p0(this.ptr);
}
b2PulleyJoint.prototype['GetGroundAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetGroundAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2PulleyJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2PulleyJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2PulleyJoint__Dump_p0(this.ptr);
}
b2PulleyJoint.prototype['GetGroundAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetGroundAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJoint.prototype['GetLengthB'] = function() {
    return _emscripten_bind_b2PulleyJoint__GetLengthB_p0(this.ptr);
}
b2PulleyJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2PulleyJoint__GetUserData_p0(this.ptr);
}
b2PulleyJoint.prototype['GetLengthA'] = function() {
    return _emscripten_bind_b2PulleyJoint__GetLengthA_p0(this.ptr);
}
b2PulleyJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2PulleyJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2PulleyJoint__GetCollideConnected_p0(this.ptr);
}
b2PulleyJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2PulleyJoint__SetUserData_p1(this.ptr, arg0);
}
b2PulleyJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2PulleyJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
function b2PulleyJoint(arg0) {
    this.ptr = _emscripten_bind_b2PulleyJoint__b2PulleyJoint_p1(arg0.ptr);
  b2PulleyJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2PulleyJoint;
}
b2PulleyJoint.prototype.__cache__ = {};
Module['b2PulleyJoint'] = b2PulleyJoint;
b2PulleyJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2PulleyJoint__IsActive_p0(this.ptr);
}
b2PulleyJoint.prototype['GetRatio'] = function() {
    return _emscripten_bind_b2PulleyJoint__GetRatio_p0(this.ptr);
}
b2BroadPhase.prototype['GetTreeQuality'] = function() {
    return _emscripten_bind_b2BroadPhase__GetTreeQuality_p0(this.ptr);
}
b2BroadPhase.prototype['GetFatAABB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2BroadPhase__GetFatAABB_p1(this.ptr, arg0), Module['b2AABB']);
}
b2BroadPhase.prototype['GetUserData'] = function(arg0) {
    return _emscripten_bind_b2BroadPhase__GetUserData_p1(this.ptr, arg0);
}
b2BroadPhase.prototype['__destroy__'] = function() {
    _emscripten_bind_b2BroadPhase____destroy___p0(this.ptr);
}
b2BroadPhase.prototype['GetTreeHeight'] = function() {
    return _emscripten_bind_b2BroadPhase__GetTreeHeight_p0(this.ptr);
}
function b2BroadPhase() {
    this.ptr = _emscripten_bind_b2BroadPhase__b2BroadPhase_p0();
  b2BroadPhase.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2BroadPhase;
}
b2BroadPhase.prototype.__cache__ = {};
Module['b2BroadPhase'] = b2BroadPhase;
b2BroadPhase.prototype['GetProxyCount'] = function() {
    return _emscripten_bind_b2BroadPhase__GetProxyCount_p0(this.ptr);
}
b2BroadPhase.prototype['GetTreeBalance'] = function() {
    return _emscripten_bind_b2BroadPhase__GetTreeBalance_p0(this.ptr);
}
b2BroadPhase.prototype['TestOverlap'] = function(arg0, arg1) {
    return _emscripten_bind_b2BroadPhase__TestOverlap_p2(this.ptr, arg0, arg1);
}
b2BroadPhase.prototype['TouchProxy'] = function(arg0) {
    _emscripten_bind_b2BroadPhase__TouchProxy_p1(this.ptr, arg0);
}
b2BroadPhase.prototype['CreateProxy'] = function(arg0, arg1) {
    return _emscripten_bind_b2BroadPhase__CreateProxy_p2(this.ptr, arg0.ptr, arg1);
}
b2BroadPhase.prototype['MoveProxy'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2BroadPhase__MoveProxy_p3(this.ptr, arg0, arg1.ptr, arg2.ptr);
}
b2BroadPhase.prototype['DestroyProxy'] = function(arg0) {
    _emscripten_bind_b2BroadPhase__DestroyProxy_p1(this.ptr, arg0);
}
b2World.prototype['QueryAABB'] = function(arg0, arg1) {
    _emscripten_bind_b2World__QueryAABB_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2World.prototype['SetSubStepping'] = function(arg0) {
    _emscripten_bind_b2World__SetSubStepping_p1(this.ptr, arg0);
}
b2World.prototype['GetTreeQuality'] = function() {
    return _emscripten_bind_b2World__GetTreeQuality_p0(this.ptr);
}
b2World.prototype['GetTreeHeight'] = function() {
    return _emscripten_bind_b2World__GetTreeHeight_p0(this.ptr);
}
b2World.prototype['GetProfile'] = function() {
    return wrapPointer(_emscripten_bind_b2World__GetProfile_p0(this.ptr), Module['b2Profile']);
}
b2World.prototype['GetTreeBalance'] = function() {
    return _emscripten_bind_b2World__GetTreeBalance_p0(this.ptr);
}
b2World.prototype['GetSubStepping'] = function() {
    return _emscripten_bind_b2World__GetSubStepping_p0(this.ptr);
}
b2World.prototype['GetContactManager'] = function() {
    return wrapPointer(_emscripten_bind_b2World__GetContactManager_p0(this.ptr), Module['b2ContactManager']);
}
b2World.prototype['SetContactListener'] = function(arg0) {
    _emscripten_bind_b2World__SetContactListener_p1(this.ptr, arg0.ptr);
}
b2World.prototype['DrawDebugData'] = function() {
    _emscripten_bind_b2World__DrawDebugData_p0(this.ptr);
}
b2World.prototype['SetContinuousPhysics'] = function(arg0) {
    _emscripten_bind_b2World__SetContinuousPhysics_p1(this.ptr, arg0);
}
b2World.prototype['SetGravity'] = function(arg0) {
    _emscripten_bind_b2World__SetGravity_p1(this.ptr, arg0.ptr);
}
b2World.prototype['GetBodyCount'] = function() {
    return _emscripten_bind_b2World__GetBodyCount_p0(this.ptr);
}
b2World.prototype['GetAutoClearForces'] = function() {
    return _emscripten_bind_b2World__GetAutoClearForces_p0(this.ptr);
}
b2World.prototype['GetContinuousPhysics'] = function() {
    return _emscripten_bind_b2World__GetContinuousPhysics_p0(this.ptr);
}
b2World.prototype['GetJointList'] = function() {
    return wrapPointer(_emscripten_bind_b2World__GetJointList_p0(this.ptr), Module['b2Joint']);
}
b2World.prototype['CreateBody'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2World__CreateBody_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2World.prototype['GetBodyList'] = function() {
    return wrapPointer(_emscripten_bind_b2World__GetBodyList_p0(this.ptr), Module['b2Body']);
}
b2World.prototype['SetDestructionListener'] = function(arg0) {
    _emscripten_bind_b2World__SetDestructionListener_p1(this.ptr, arg0.ptr);
}
b2World.prototype['DestroyJoint'] = function(arg0) {
    _emscripten_bind_b2World__DestroyJoint_p1(this.ptr, arg0.ptr);
}
function b2World(arg0) {
    this.ptr = _emscripten_bind_b2World__b2World_p1(arg0.ptr);
  b2World.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2World;
}
b2World.prototype.__cache__ = {};
Module['b2World'] = b2World;
b2World.prototype['GetJointCount'] = function() {
    return _emscripten_bind_b2World__GetJointCount_p0(this.ptr);
}
b2World.prototype['Step'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2World__Step_p3(this.ptr, arg0, arg1, arg2);
}
b2World.prototype['ClearForces'] = function() {
    _emscripten_bind_b2World__ClearForces_p0(this.ptr);
}
b2World.prototype['GetWarmStarting'] = function() {
    return _emscripten_bind_b2World__GetWarmStarting_p0(this.ptr);
}
b2World.prototype['SetAllowSleeping'] = function(arg0) {
    _emscripten_bind_b2World__SetAllowSleeping_p1(this.ptr, arg0);
}
b2World.prototype['DestroyBody'] = function(arg0) {
    _emscripten_bind_b2World__DestroyBody_p1(this.ptr, arg0.ptr);
}
b2World.prototype['GetAllowSleeping'] = function() {
    return _emscripten_bind_b2World__GetAllowSleeping_p0(this.ptr);
}
b2World.prototype['CreateJoint'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2World__CreateJoint_p1(this.ptr, arg0.ptr), Module['b2Joint']);
}
b2World.prototype['GetProxyCount'] = function() {
    return _emscripten_bind_b2World__GetProxyCount_p0(this.ptr);
}
b2World.prototype['RayCast'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2World__RayCast_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
}
b2World.prototype['IsLocked'] = function() {
    return _emscripten_bind_b2World__IsLocked_p0(this.ptr);
}
b2World.prototype['GetContactList'] = function() {
    return wrapPointer(_emscripten_bind_b2World__GetContactList_p0(this.ptr), Module['b2Contact']);
}
b2World.prototype['SetDebugDraw'] = function(arg0) {
    _emscripten_bind_b2World__SetDebugDraw_p1(this.ptr, arg0.ptr);
}
b2World.prototype['__destroy__'] = function() {
    _emscripten_bind_b2World____destroy___p0(this.ptr);
}
b2World.prototype['Dump'] = function() {
    _emscripten_bind_b2World__Dump_p0(this.ptr);
}
b2World.prototype['SetAutoClearForces'] = function(arg0) {
    _emscripten_bind_b2World__SetAutoClearForces_p1(this.ptr, arg0);
}
b2World.prototype['GetGravity'] = function() {
    return wrapPointer(_emscripten_bind_b2World__GetGravity_p0(this.ptr), Module['b2Vec2']);
}
b2World.prototype['GetContactCount'] = function() {
    return _emscripten_bind_b2World__GetContactCount_p0(this.ptr);
}
b2World.prototype['SetWarmStarting'] = function(arg0) {
    _emscripten_bind_b2World__SetWarmStarting_p1(this.ptr, arg0);
}
b2World.prototype['SetContactFilter'] = function(arg0) {
    _emscripten_bind_b2World__SetContactFilter_p1(this.ptr, arg0.ptr);
}
b2PrismaticJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2PrismaticJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2PrismaticJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetUserData_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetLocalAxisA'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetLocalAxisA_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJoint.prototype['GetLowerLimit'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetLowerLimit_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
function b2PrismaticJoint(arg0) {
    this.ptr = _emscripten_bind_b2PrismaticJoint__b2PrismaticJoint_p1(arg0.ptr);
  b2PrismaticJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2PrismaticJoint;
}
b2PrismaticJoint.prototype.__cache__ = {};
Module['b2PrismaticJoint'] = b2PrismaticJoint;
b2PrismaticJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJoint.prototype['SetMotorSpeed'] = function(arg0) {
    _emscripten_bind_b2PrismaticJoint__SetMotorSpeed_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJoint.prototype['GetMotorSpeed'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetMotorSpeed_p0(this.ptr);
}
b2PrismaticJoint.prototype['SetMaxMotorForce'] = function(arg0) {
    _emscripten_bind_b2PrismaticJoint__SetMaxMotorForce_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['EnableLimit'] = function(arg0) {
    _emscripten_bind_b2PrismaticJoint__EnableLimit_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['IsMotorEnabled'] = function() {
    return _emscripten_bind_b2PrismaticJoint__IsMotorEnabled_p0(this.ptr);
}
b2PrismaticJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2PrismaticJoint__SetUserData_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2PrismaticJoint.prototype['GetMaxMotorForce'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetMaxMotorForce_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetCollideConnected_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetJointSpeed'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetJointSpeed_p0(this.ptr);
}
b2PrismaticJoint.prototype['EnableMotor'] = function(arg0) {
    _emscripten_bind_b2PrismaticJoint__EnableMotor_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2PrismaticJoint____destroy___p0(this.ptr);
}
b2PrismaticJoint.prototype['GetReferenceAngle'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetReferenceAngle_p0(this.ptr);
}
b2PrismaticJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2PrismaticJoint__Dump_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetMotorForce'] = function(arg0) {
    return _emscripten_bind_b2PrismaticJoint__GetMotorForce_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['GetJointTranslation'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetJointTranslation_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetType_p0(this.ptr);
}
b2PrismaticJoint.prototype['IsLimitEnabled'] = function() {
    return _emscripten_bind_b2PrismaticJoint__IsLimitEnabled_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2PrismaticJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['SetLimits'] = function(arg0, arg1) {
    _emscripten_bind_b2PrismaticJoint__SetLimits_p2(this.ptr, arg0, arg1);
}
b2PrismaticJoint.prototype['GetUpperLimit'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetUpperLimit_p0(this.ptr);
}
b2PrismaticJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2PrismaticJoint__IsActive_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2CircleShape.prototype['__destroy__'] = function() {
    _emscripten_bind_b2CircleShape____destroy___p0(this.ptr);
}
b2CircleShape.prototype['GetType'] = function() {
    return _emscripten_bind_b2CircleShape__GetType_p0(this.ptr);
}
b2CircleShape.prototype['ComputeMass'] = function(arg0, arg1) {
    _emscripten_bind_b2CircleShape__ComputeMass_p2(this.ptr, arg0.ptr, arg1);
}
b2CircleShape.prototype['set_m_radius'] = function(arg0) {
    _emscripten_bind_b2CircleShape__set_m_radius_p1(this.ptr, arg0);
}
b2CircleShape.prototype['get_m_radius'] = function() {
    return _emscripten_bind_b2CircleShape__get_m_radius_p0(this.ptr);
}
b2CircleShape.prototype['GetVertex'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2CircleShape__GetVertex_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2CircleShape.prototype['Clone'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2CircleShape__Clone_p1(this.ptr, arg0.ptr), Module['b2Shape']);
}
b2CircleShape.prototype['GetSupportVertex'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2CircleShape__GetSupportVertex_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2CircleShape.prototype['RayCast'] = function(arg0, arg1, arg2, arg3) {
    return _emscripten_bind_b2CircleShape__RayCast_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3);
}
b2CircleShape.prototype['ComputeAABB'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2CircleShape__ComputeAABB_p3(this.ptr, arg0.ptr, arg1.ptr, arg2);
}
b2CircleShape.prototype['GetVertexCount'] = function() {
    return _emscripten_bind_b2CircleShape__GetVertexCount_p0(this.ptr);
}
b2CircleShape.prototype['GetChildCount'] = function() {
    return _emscripten_bind_b2CircleShape__GetChildCount_p0(this.ptr);
}
b2CircleShape.prototype['TestPoint'] = function(arg0, arg1) {
    return _emscripten_bind_b2CircleShape__TestPoint_p2(this.ptr, arg0.ptr, arg1.ptr);
}
function b2CircleShape() {
    this.ptr = _emscripten_bind_b2CircleShape__b2CircleShape_p0();
  b2CircleShape.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2CircleShape;
}
b2CircleShape.prototype.__cache__ = {};
Module['b2CircleShape'] = b2CircleShape;
b2CircleShape.prototype['GetSupport'] = function(arg0) {
    return _emscripten_bind_b2CircleShape__GetSupport_p1(this.ptr, arg0.ptr);
}
b2CircleShape.prototype['set_m_p'] = function(arg0) {
    _emscripten_bind_b2CircleShape__set_m_p_p1(this.ptr, arg0.ptr);
}
b2CircleShape.prototype['get_m_p'] = function() {
    return wrapPointer(_emscripten_bind_b2CircleShape__get_m_p_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2WheelJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2WheelJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2WheelJoint__GetUserData_p0(this.ptr);
}
b2WheelJoint.prototype['GetLocalAxisA'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetLocalAxisA_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJoint.prototype['SetSpringDampingRatio'] = function(arg0) {
    _emscripten_bind_b2WheelJoint__SetSpringDampingRatio_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2WheelJoint.prototype['GetSpringFrequencyHz'] = function() {
    return _emscripten_bind_b2WheelJoint__GetSpringFrequencyHz_p0(this.ptr);
}
b2WheelJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJoint.prototype['SetMotorSpeed'] = function(arg0) {
    _emscripten_bind_b2WheelJoint__SetMotorSpeed_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJoint.prototype['GetMotorSpeed'] = function() {
    return _emscripten_bind_b2WheelJoint__GetMotorSpeed_p0(this.ptr);
}
b2WheelJoint.prototype['GetMotorTorque'] = function(arg0) {
    return _emscripten_bind_b2WheelJoint__GetMotorTorque_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['GetMaxMotorTorque'] = function() {
    return _emscripten_bind_b2WheelJoint__GetMaxMotorTorque_p0(this.ptr);
}
function b2WheelJoint(arg0) {
    this.ptr = _emscripten_bind_b2WheelJoint__b2WheelJoint_p1(arg0.ptr);
  b2WheelJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2WheelJoint;
}
b2WheelJoint.prototype.__cache__ = {};
Module['b2WheelJoint'] = b2WheelJoint;
b2WheelJoint.prototype['IsMotorEnabled'] = function() {
    return _emscripten_bind_b2WheelJoint__IsMotorEnabled_p0(this.ptr);
}
b2WheelJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2WheelJoint__SetUserData_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2WheelJoint.prototype['GetSpringDampingRatio'] = function() {
    return _emscripten_bind_b2WheelJoint__GetSpringDampingRatio_p0(this.ptr);
}
b2WheelJoint.prototype['SetMaxMotorTorque'] = function(arg0) {
    _emscripten_bind_b2WheelJoint__SetMaxMotorTorque_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2WheelJoint__GetCollideConnected_p0(this.ptr);
}
b2WheelJoint.prototype['GetJointSpeed'] = function() {
    return _emscripten_bind_b2WheelJoint__GetJointSpeed_p0(this.ptr);
}
b2WheelJoint.prototype['EnableMotor'] = function(arg0) {
    _emscripten_bind_b2WheelJoint__EnableMotor_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2WheelJoint____destroy___p0(this.ptr);
}
b2WheelJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2WheelJoint__Dump_p0(this.ptr);
}
b2WheelJoint.prototype['GetJointTranslation'] = function() {
    return _emscripten_bind_b2WheelJoint__GetJointTranslation_p0(this.ptr);
}
b2WheelJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2WheelJoint__GetType_p0(this.ptr);
}
b2WheelJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2WheelJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['SetSpringFrequencyHz'] = function(arg0) {
    _emscripten_bind_b2WheelJoint__SetSpringFrequencyHz_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2WheelJoint__IsActive_p0(this.ptr);
}
b2Draw.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Draw____destroy___p0(this.ptr);
}
b2Draw.prototype['AppendFlags'] = function(arg0) {
    _emscripten_bind_b2Draw__AppendFlags_p1(this.ptr, arg0);
}
b2Draw.prototype['DrawTransform'] = function(arg0) {
    _emscripten_bind_b2Draw__DrawTransform_p1(this.ptr, arg0.ptr);
}
b2Draw.prototype['ClearFlags'] = function(arg0) {
    _emscripten_bind_b2Draw__ClearFlags_p1(this.ptr, arg0);
}
b2Draw.prototype['DrawPolygon'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Draw__DrawPolygon_p3(this.ptr, arg0.ptr, arg1, arg2.ptr);
}
b2Draw.prototype['DrawSolidCircle'] = function(arg0, arg1, arg2, arg3) {
    _emscripten_bind_b2Draw__DrawSolidCircle_p4(this.ptr, arg0.ptr, arg1, arg2.ptr, arg3.ptr);
}
b2Draw.prototype['DrawSolidPolygon'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Draw__DrawSolidPolygon_p3(this.ptr, arg0.ptr, arg1, arg2.ptr);
}
b2Draw.prototype['DrawCircle'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Draw__DrawCircle_p3(this.ptr, arg0.ptr, arg1, arg2.ptr);
}
b2Draw.prototype['SetFlags'] = function(arg0) {
    _emscripten_bind_b2Draw__SetFlags_p1(this.ptr, arg0);
}
b2Draw.prototype['DrawSegment'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Draw__DrawSegment_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
}
function b2Draw() {
    this.ptr = _emscripten_bind_b2Draw__b2Draw_p0();
  b2Draw.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Draw;
}
b2Draw.prototype.__cache__ = {};
Module['b2Draw'] = b2Draw;
b2Draw.prototype['GetFlags'] = function() {
    return _emscripten_bind_b2Draw__GetFlags_p0(this.ptr);
}
function b2Joint(){ throw "b2Joint is abstract!" }
b2Joint.prototype.__cache__ = {};
Module['b2Joint'] = b2Joint;
b2Joint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2Joint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2Joint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2Joint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2Joint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2Joint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2Joint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2Joint__GetReactionTorque_p1(this.ptr, arg0);
}
b2Joint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2Joint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2Joint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2Joint__GetUserData_p0(this.ptr);
}
b2Joint.prototype['GetType'] = function() {
    return _emscripten_bind_b2Joint__GetType_p0(this.ptr);
}
b2Joint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2Joint__SetUserData_p1(this.ptr, arg0);
}
b2Joint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2Joint__GetCollideConnected_p0(this.ptr);
}
b2Joint.prototype['Dump'] = function() {
    _emscripten_bind_b2Joint__Dump_p0(this.ptr);
}
b2Joint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2Joint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2Joint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Joint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2Joint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2Joint__IsActive_p0(this.ptr);
}
b2GearJoint.prototype['GetJoint1'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetJoint1_p0(this.ptr), Module['b2Joint']);
}
function b2GearJoint(arg0) {
    this.ptr = _emscripten_bind_b2GearJoint__b2GearJoint_p1(arg0.ptr);
  b2GearJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2GearJoint;
}
b2GearJoint.prototype.__cache__ = {};
Module['b2GearJoint'] = b2GearJoint;
b2GearJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2GearJoint.prototype['GetJoint2'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetJoint2_p0(this.ptr), Module['b2Joint']);
}
b2GearJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2GearJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2GearJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2GearJoint__Dump_p0(this.ptr);
}
b2GearJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2GearJoint____destroy___p0(this.ptr);
}
b2GearJoint.prototype['SetRatio'] = function(arg0) {
    _emscripten_bind_b2GearJoint__SetRatio_p1(this.ptr, arg0);
}
b2GearJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2GearJoint__GetType_p0(this.ptr);
}
b2GearJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2GearJoint__GetUserData_p0(this.ptr);
}
b2GearJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2GearJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2GearJoint__GetCollideConnected_p0(this.ptr);
}
b2GearJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2GearJoint__SetUserData_p1(this.ptr, arg0);
}
b2GearJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2GearJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2GearJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2GearJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2GearJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2GearJoint__IsActive_p0(this.ptr);
}
b2GearJoint.prototype['GetRatio'] = function() {
    return _emscripten_bind_b2GearJoint__GetRatio_p0(this.ptr);
}
b2RayCastCallback.prototype['ReportFixture'] = function(arg0, arg1, arg2, arg3) {
    return _emscripten_bind_b2RayCastCallback__ReportFixture_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3);
}
function b2RayCastCallback() {
    this.ptr = _emscripten_bind_b2RayCastCallback__b2RayCastCallback_p0();
  b2RayCastCallback.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2RayCastCallback;
}
b2RayCastCallback.prototype.__cache__ = {};
Module['b2RayCastCallback'] = b2RayCastCallback;
b2RayCastCallback.prototype['__destroy__'] = function() {
    _emscripten_bind_b2RayCastCallback____destroy___p0(this.ptr);
}
b2DynamicTree.prototype['__destroy__'] = function() {
    _emscripten_bind_b2DynamicTree____destroy___p0(this.ptr);
}
function b2DynamicTree() {
    this.ptr = _emscripten_bind_b2DynamicTree__b2DynamicTree_p0();
  b2DynamicTree.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2DynamicTree;
}
b2DynamicTree.prototype.__cache__ = {};
Module['b2DynamicTree'] = b2DynamicTree;
b2DynamicTree.prototype['GetFatAABB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2DynamicTree__GetFatAABB_p1(this.ptr, arg0), Module['b2AABB']);
}
b2DynamicTree.prototype['GetUserData'] = function(arg0) {
    return _emscripten_bind_b2DynamicTree__GetUserData_p1(this.ptr, arg0);
}
b2DynamicTree.prototype['GetMaxBalance'] = function() {
    return _emscripten_bind_b2DynamicTree__GetMaxBalance_p0(this.ptr);
}
b2DynamicTree.prototype['GetHeight'] = function() {
    return _emscripten_bind_b2DynamicTree__GetHeight_p0(this.ptr);
}
b2DynamicTree.prototype['GetAreaRatio'] = function() {
    return _emscripten_bind_b2DynamicTree__GetAreaRatio_p0(this.ptr);
}
b2DynamicTree.prototype['RebuildBottomUp'] = function() {
    _emscripten_bind_b2DynamicTree__RebuildBottomUp_p0(this.ptr);
}
b2DynamicTree.prototype['CreateProxy'] = function(arg0, arg1) {
    return _emscripten_bind_b2DynamicTree__CreateProxy_p2(this.ptr, arg0.ptr, arg1);
}
b2DynamicTree.prototype['MoveProxy'] = function(arg0, arg1, arg2) {
    return _emscripten_bind_b2DynamicTree__MoveProxy_p3(this.ptr, arg0, arg1.ptr, arg2.ptr);
}
b2DynamicTree.prototype['Validate'] = function() {
    _emscripten_bind_b2DynamicTree__Validate_p0(this.ptr);
}
b2DynamicTree.prototype['DestroyProxy'] = function(arg0) {
    _emscripten_bind_b2DynamicTree__DestroyProxy_p1(this.ptr, arg0);
}
b2WeldJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2WeldJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2WeldJoint.prototype['SetFrequency'] = function(arg0) {
    _emscripten_bind_b2WeldJoint__SetFrequency_p1(this.ptr, arg0);
}
b2WeldJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2WeldJoint__GetUserData_p0(this.ptr);
}
b2WeldJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2WeldJoint__SetUserData_p1(this.ptr, arg0);
}
b2WeldJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2WeldJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJoint.prototype['GetFrequency'] = function() {
    return _emscripten_bind_b2WeldJoint__GetFrequency_p0(this.ptr);
}
function b2WeldJoint(arg0) {
    this.ptr = _emscripten_bind_b2WeldJoint__b2WeldJoint_p1(arg0.ptr);
  b2WeldJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2WeldJoint;
}
b2WeldJoint.prototype.__cache__ = {};
Module['b2WeldJoint'] = b2WeldJoint;
b2WeldJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2WeldJoint.prototype['GetDampingRatio'] = function() {
    return _emscripten_bind_b2WeldJoint__GetDampingRatio_p0(this.ptr);
}
b2WeldJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2WeldJoint__GetCollideConnected_p0(this.ptr);
}
b2WeldJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2WeldJoint____destroy___p0(this.ptr);
}
b2WeldJoint.prototype['GetReferenceAngle'] = function() {
    return _emscripten_bind_b2WeldJoint__GetReferenceAngle_p0(this.ptr);
}
b2WeldJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2WeldJoint__Dump_p0(this.ptr);
}
b2WeldJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2WeldJoint__GetType_p0(this.ptr);
}
b2WeldJoint.prototype['SetDampingRatio'] = function(arg0) {
    _emscripten_bind_b2WeldJoint__SetDampingRatio_p1(this.ptr, arg0);
}
b2WeldJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2WeldJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2WeldJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2WeldJoint__IsActive_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2RevoluteJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2RevoluteJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetUserData_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetLowerLimit'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetLowerLimit_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
function b2RevoluteJoint(arg0) {
    this.ptr = _emscripten_bind_b2RevoluteJoint__b2RevoluteJoint_p1(arg0.ptr);
  b2RevoluteJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2RevoluteJoint;
}
b2RevoluteJoint.prototype.__cache__ = {};
Module['b2RevoluteJoint'] = b2RevoluteJoint;
b2RevoluteJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2RevoluteJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2RevoluteJoint.prototype['SetMotorSpeed'] = function(arg0) {
    _emscripten_bind_b2RevoluteJoint__SetMotorSpeed_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2RevoluteJoint.prototype['GetJointAngle'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetJointAngle_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetMotorSpeed'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetMotorSpeed_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetMotorTorque'] = function(arg0) {
    return _emscripten_bind_b2RevoluteJoint__GetMotorTorque_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['IsLimitEnabled'] = function() {
    return _emscripten_bind_b2RevoluteJoint__IsLimitEnabled_p0(this.ptr);
}
b2RevoluteJoint.prototype['EnableLimit'] = function(arg0) {
    _emscripten_bind_b2RevoluteJoint__EnableLimit_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['IsMotorEnabled'] = function() {
    return _emscripten_bind_b2RevoluteJoint__IsMotorEnabled_p0(this.ptr);
}
b2RevoluteJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2RevoluteJoint__SetUserData_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2RevoluteJoint.prototype['SetMaxMotorTorque'] = function(arg0) {
    _emscripten_bind_b2RevoluteJoint__SetMaxMotorTorque_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetCollideConnected_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetJointSpeed'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetJointSpeed_p0(this.ptr);
}
b2RevoluteJoint.prototype['EnableMotor'] = function(arg0) {
    _emscripten_bind_b2RevoluteJoint__EnableMotor_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2RevoluteJoint____destroy___p0(this.ptr);
}
b2RevoluteJoint.prototype['GetReferenceAngle'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetReferenceAngle_p0(this.ptr);
}
b2RevoluteJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2RevoluteJoint__Dump_p0(this.ptr);
}
b2RevoluteJoint.prototype['SetLimits'] = function(arg0, arg1) {
    _emscripten_bind_b2RevoluteJoint__SetLimits_p2(this.ptr, arg0, arg1);
}
b2RevoluteJoint.prototype['GetMaxMotorTorque'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetMaxMotorTorque_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetType_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2RevoluteJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['GetUpperLimit'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetUpperLimit_p0(this.ptr);
}
b2RevoluteJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2RevoluteJoint__IsActive_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
function b2Timer() {
    this.ptr = _emscripten_bind_b2Timer__b2Timer_p0();
  b2Timer.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Timer;
}
b2Timer.prototype.__cache__ = {};
Module['b2Timer'] = b2Timer;
b2Timer.prototype['Reset'] = function() {
    _emscripten_bind_b2Timer__Reset_p0(this.ptr);
}
b2Timer.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Timer____destroy___p0(this.ptr);
}
b2Timer.prototype['GetMilliseconds'] = function() {
    return _emscripten_bind_b2Timer__GetMilliseconds_p0(this.ptr);
}
b2ContactListener.prototype['__destroy__'] = function() {
    _emscripten_bind_b2ContactListener____destroy___p0(this.ptr);
}
function b2ContactListener() {
    this.ptr = _emscripten_bind_b2ContactListener__b2ContactListener_p0();
  b2ContactListener.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2ContactListener;
}
b2ContactListener.prototype.__cache__ = {};
Module['b2ContactListener'] = b2ContactListener;
b2ContactListener.prototype['EndContact'] = function(arg0) {
    _emscripten_bind_b2ContactListener__EndContact_p1(this.ptr, arg0.ptr);
}
b2ContactListener.prototype['BeginContact'] = function(arg0) {
    _emscripten_bind_b2ContactListener__BeginContact_p1(this.ptr, arg0.ptr);
}
b2ContactListener.prototype['PreSolve'] = function(arg0, arg1) {
    _emscripten_bind_b2ContactListener__PreSolve_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2ContactListener.prototype['PostSolve'] = function(arg0, arg1) {
    _emscripten_bind_b2ContactListener__PostSolve_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2ChainShape.prototype['__destroy__'] = function() {
    _emscripten_bind_b2ChainShape____destroy___p0(this.ptr);
}
b2ChainShape.prototype['GetType'] = function() {
    return _emscripten_bind_b2ChainShape__GetType_p0(this.ptr);
}
b2ChainShape.prototype['CreateChain'] = function(arg0, arg1) {
    _emscripten_bind_b2ChainShape__CreateChain_p2(this.ptr, arg0.ptr, arg1);
}
b2ChainShape.prototype['set_m_radius'] = function(arg0) {
    _emscripten_bind_b2ChainShape__set_m_radius_p1(this.ptr, arg0);
}
b2ChainShape.prototype['get_m_radius'] = function() {
    return _emscripten_bind_b2ChainShape__get_m_radius_p0(this.ptr);
}
b2ChainShape.prototype['get_m_vertices'] = function() {
    return wrapPointer(_emscripten_bind_b2ChainShape__get_m_vertices_p0(this.ptr), Module['b2Vec2']);
}
b2ChainShape.prototype['ComputeMass'] = function(arg0, arg1) {
    _emscripten_bind_b2ChainShape__ComputeMass_p2(this.ptr, arg0.ptr, arg1);
}
b2ChainShape.prototype['Clone'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2ChainShape__Clone_p1(this.ptr, arg0.ptr), Module['b2Shape']);
}
b2ChainShape.prototype['get_m_count'] = function() {
    return _emscripten_bind_b2ChainShape__get_m_count_p0(this.ptr);
}
b2ChainShape.prototype['GetChildEdge'] = function(arg0, arg1) {
    _emscripten_bind_b2ChainShape__GetChildEdge_p2(this.ptr, arg0.ptr, arg1);
}
function b2ChainShape() {
    this.ptr = _emscripten_bind_b2ChainShape__b2ChainShape_p0();
  b2ChainShape.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2ChainShape;
}
b2ChainShape.prototype.__cache__ = {};
Module['b2ChainShape'] = b2ChainShape;
b2ChainShape.prototype['ComputeAABB'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2ChainShape__ComputeAABB_p3(this.ptr, arg0.ptr, arg1.ptr, arg2);
}
b2ChainShape.prototype['RayCast'] = function(arg0, arg1, arg2, arg3) {
    return _emscripten_bind_b2ChainShape__RayCast_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3);
}
b2ChainShape.prototype['GetChildCount'] = function() {
    return _emscripten_bind_b2ChainShape__GetChildCount_p0(this.ptr);
}
b2ChainShape.prototype['TestPoint'] = function(arg0, arg1) {
    return _emscripten_bind_b2ChainShape__TestPoint_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2ChainShape.prototype['SetPrevVertex'] = function(arg0) {
    _emscripten_bind_b2ChainShape__SetPrevVertex_p1(this.ptr, arg0.ptr);
}
b2ChainShape.prototype['CreateLoop'] = function(arg0, arg1) {
    _emscripten_bind_b2ChainShape__CreateLoop_p2(this.ptr, arg0.ptr, arg1);
}
b2ChainShape.prototype['set_m_vertices'] = function(arg0) {
    _emscripten_bind_b2ChainShape__set_m_vertices_p1(this.ptr, arg0.ptr);
}
b2ChainShape.prototype['SetNextVertex'] = function(arg0) {
    _emscripten_bind_b2ChainShape__SetNextVertex_p1(this.ptr, arg0.ptr);
}
b2ChainShape.prototype['set_m_count'] = function(arg0) {
    _emscripten_bind_b2ChainShape__set_m_count_p1(this.ptr, arg0);
}
b2QueryCallback.prototype['ReportFixture'] = function(arg0) {
    return _emscripten_bind_b2QueryCallback__ReportFixture_p1(this.ptr, arg0.ptr);
}
b2QueryCallback.prototype['__destroy__'] = function() {
    _emscripten_bind_b2QueryCallback____destroy___p0(this.ptr);
}
function b2QueryCallback() {
    this.ptr = _emscripten_bind_b2QueryCallback__b2QueryCallback_p0();
  b2QueryCallback.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2QueryCallback;
}
b2QueryCallback.prototype.__cache__ = {};
Module['b2QueryCallback'] = b2QueryCallback;
b2BlockAllocator.prototype['__destroy__'] = function() {
    _emscripten_bind_b2BlockAllocator____destroy___p0(this.ptr);
}
b2BlockAllocator.prototype['Clear'] = function() {
    _emscripten_bind_b2BlockAllocator__Clear_p0(this.ptr);
}
b2BlockAllocator.prototype['Free'] = function(arg0, arg1) {
    _emscripten_bind_b2BlockAllocator__Free_p2(this.ptr, arg0, arg1);
}
b2BlockAllocator.prototype['Allocate'] = function(arg0) {
    return _emscripten_bind_b2BlockAllocator__Allocate_p1(this.ptr, arg0);
}
function b2BlockAllocator() {
    this.ptr = _emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0();
  b2BlockAllocator.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2BlockAllocator;
}
b2BlockAllocator.prototype.__cache__ = {};
Module['b2BlockAllocator'] = b2BlockAllocator;
b2RopeJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2RopeJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2RopeJoint____destroy___p0(this.ptr);
}
b2RopeJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2RopeJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2RopeJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2RopeJoint.prototype['GetMaxLength'] = function() {
    return _emscripten_bind_b2RopeJoint__GetMaxLength_p0(this.ptr);
}
b2RopeJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2RopeJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2RopeJoint__GetCollideConnected_p0(this.ptr);
}
b2RopeJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2RopeJoint__GetUserData_p0(this.ptr);
}
b2RopeJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2RopeJoint__GetType_p0(this.ptr);
}
b2RopeJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2RopeJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2RopeJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2RopeJoint__Dump_p0(this.ptr);
}
b2RopeJoint.prototype['SetMaxLength'] = function(arg0) {
    _emscripten_bind_b2RopeJoint__SetMaxLength_p1(this.ptr, arg0);
}
b2RopeJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2RopeJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2RopeJoint__SetUserData_p1(this.ptr, arg0);
}
b2RopeJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2RopeJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
function b2RopeJoint(arg0) {
    this.ptr = _emscripten_bind_b2RopeJoint__b2RopeJoint_p1(arg0.ptr);
  b2RopeJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2RopeJoint;
}
b2RopeJoint.prototype.__cache__ = {};
Module['b2RopeJoint'] = b2RopeJoint;
b2RopeJoint.prototype['GetLimitState'] = function() {
    return _emscripten_bind_b2RopeJoint__GetLimitState_p0(this.ptr);
}
b2RopeJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2RopeJoint__IsActive_p0(this.ptr);
}
b2PolygonShape.prototype['__destroy__'] = function() {
    _emscripten_bind_b2PolygonShape____destroy___p0(this.ptr);
}
b2PolygonShape.prototype['Set'] = function(arg0, arg1) {
    _emscripten_bind_b2PolygonShape__Set_p2(this.ptr, arg0.ptr, arg1);
}
b2PolygonShape.prototype['ComputeMass'] = function(arg0, arg1) {
    _emscripten_bind_b2PolygonShape__ComputeMass_p2(this.ptr, arg0.ptr, arg1);
}
b2PolygonShape.prototype['set_m_radius'] = function(arg0) {
    _emscripten_bind_b2PolygonShape__set_m_radius_p1(this.ptr, arg0);
}
b2PolygonShape.prototype['get_m_radius'] = function() {
    return _emscripten_bind_b2PolygonShape__get_m_radius_p0(this.ptr);
}
b2PolygonShape.prototype['Clone'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PolygonShape__Clone_p1(this.ptr, arg0.ptr), Module['b2Shape']);
}
b2PolygonShape.prototype['GetVertex'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PolygonShape__GetVertex_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2PolygonShape.prototype['RayCast'] = function(arg0, arg1, arg2, arg3) {
    return _emscripten_bind_b2PolygonShape__RayCast_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3);
}
b2PolygonShape.prototype['SetAsBox'] = function(arg0, arg1, arg2, arg3) {
  if (arg2 === undefined)
    _emscripten_bind_b2PolygonShape__SetAsBox_p2(this.ptr, arg0, arg1);
  else 
    _emscripten_bind_b2PolygonShape__SetAsBox_p4(this.ptr, arg0, arg1, arg2.ptr, arg3);
}
b2PolygonShape.prototype['set_m_centroid'] = function(arg0) {
    _emscripten_bind_b2PolygonShape__set_m_centroid_p1(this.ptr, arg0.ptr);
}
b2PolygonShape.prototype['ComputeAABB'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2PolygonShape__ComputeAABB_p3(this.ptr, arg0.ptr, arg1.ptr, arg2);
}
b2PolygonShape.prototype['set_m_vertexCount'] = function(arg0) {
    _emscripten_bind_b2PolygonShape__set_m_vertexCount_p1(this.ptr, arg0);
}
b2PolygonShape.prototype['GetVertexCount'] = function() {
    return _emscripten_bind_b2PolygonShape__GetVertexCount_p0(this.ptr);
}
b2PolygonShape.prototype['GetChildCount'] = function() {
    return _emscripten_bind_b2PolygonShape__GetChildCount_p0(this.ptr);
}
b2PolygonShape.prototype['TestPoint'] = function(arg0, arg1) {
    return _emscripten_bind_b2PolygonShape__TestPoint_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2PolygonShape.prototype['GetType'] = function() {
    return _emscripten_bind_b2PolygonShape__GetType_p0(this.ptr);
}
function b2PolygonShape() {
    this.ptr = _emscripten_bind_b2PolygonShape__b2PolygonShape_p0();
  b2PolygonShape.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2PolygonShape;
}
b2PolygonShape.prototype.__cache__ = {};
Module['b2PolygonShape'] = b2PolygonShape;
b2PolygonShape.prototype['get_m_vertexCount'] = function() {
    return _emscripten_bind_b2PolygonShape__get_m_vertexCount_p0(this.ptr);
}
b2PolygonShape.prototype['get_m_centroid'] = function() {
    return wrapPointer(_emscripten_bind_b2PolygonShape__get_m_centroid_p0(this.ptr), Module['b2Vec2']);
}
b2EdgeShape.prototype['__destroy__'] = function() {
    _emscripten_bind_b2EdgeShape____destroy___p0(this.ptr);
}
b2EdgeShape.prototype['Set'] = function(arg0, arg1) {
    _emscripten_bind_b2EdgeShape__Set_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2EdgeShape.prototype['ComputeMass'] = function(arg0, arg1) {
    _emscripten_bind_b2EdgeShape__ComputeMass_p2(this.ptr, arg0.ptr, arg1);
}
b2EdgeShape.prototype['set_m_radius'] = function(arg0) {
    _emscripten_bind_b2EdgeShape__set_m_radius_p1(this.ptr, arg0);
}
b2EdgeShape.prototype['get_m_radius'] = function() {
    return _emscripten_bind_b2EdgeShape__get_m_radius_p0(this.ptr);
}
b2EdgeShape.prototype['Clone'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2EdgeShape__Clone_p1(this.ptr, arg0.ptr), Module['b2Shape']);
}
b2EdgeShape.prototype['GetType'] = function() {
    return _emscripten_bind_b2EdgeShape__GetType_p0(this.ptr);
}
b2EdgeShape.prototype['RayCast'] = function(arg0, arg1, arg2, arg3) {
    return _emscripten_bind_b2EdgeShape__RayCast_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3);
}
b2EdgeShape.prototype['ComputeAABB'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2EdgeShape__ComputeAABB_p3(this.ptr, arg0.ptr, arg1.ptr, arg2);
}
b2EdgeShape.prototype['GetChildCount'] = function() {
    return _emscripten_bind_b2EdgeShape__GetChildCount_p0(this.ptr);
}
b2EdgeShape.prototype['TestPoint'] = function(arg0, arg1) {
    return _emscripten_bind_b2EdgeShape__TestPoint_p2(this.ptr, arg0.ptr, arg1.ptr);
}
function b2EdgeShape() {
    this.ptr = _emscripten_bind_b2EdgeShape__b2EdgeShape_p0();
  b2EdgeShape.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2EdgeShape;
}
b2EdgeShape.prototype.__cache__ = {};
Module['b2EdgeShape'] = b2EdgeShape;
function b2Contact(){ throw "b2Contact is abstract!" }
b2Contact.prototype.__cache__ = {};
Module['b2Contact'] = b2Contact;
b2Contact.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2Contact__GetNext_p0(this.ptr), Module['b2Contact']);
}
b2Contact.prototype['SetEnabled'] = function(arg0) {
    _emscripten_bind_b2Contact__SetEnabled_p1(this.ptr, arg0);
}
b2Contact.prototype['GetWorldManifold'] = function(arg0) {
    _emscripten_bind_b2Contact__GetWorldManifold_p1(this.ptr, arg0.ptr);
}
b2Contact.prototype['GetRestitution'] = function() {
    return _emscripten_bind_b2Contact__GetRestitution_p0(this.ptr);
}
b2Contact.prototype['ResetFriction'] = function() {
    _emscripten_bind_b2Contact__ResetFriction_p0(this.ptr);
}
b2Contact.prototype['GetFriction'] = function() {
    return _emscripten_bind_b2Contact__GetFriction_p0(this.ptr);
}
b2Contact.prototype['IsTouching'] = function() {
    return _emscripten_bind_b2Contact__IsTouching_p0(this.ptr);
}
b2Contact.prototype['IsEnabled'] = function() {
    return _emscripten_bind_b2Contact__IsEnabled_p0(this.ptr);
}
b2Contact.prototype['GetFixtureB'] = function() {
    return wrapPointer(_emscripten_bind_b2Contact__GetFixtureB_p0(this.ptr), Module['b2Fixture']);
}
b2Contact.prototype['SetFriction'] = function(arg0) {
    _emscripten_bind_b2Contact__SetFriction_p1(this.ptr, arg0);
}
b2Contact.prototype['GetFixtureA'] = function() {
    return wrapPointer(_emscripten_bind_b2Contact__GetFixtureA_p0(this.ptr), Module['b2Fixture']);
}
b2Contact.prototype['GetChildIndexA'] = function() {
    return _emscripten_bind_b2Contact__GetChildIndexA_p0(this.ptr);
}
b2Contact.prototype['GetChildIndexB'] = function() {
    return _emscripten_bind_b2Contact__GetChildIndexB_p0(this.ptr);
}
b2Contact.prototype['Evaluate'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Contact__Evaluate_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
}
b2Contact.prototype['SetRestitution'] = function(arg0) {
    _emscripten_bind_b2Contact__SetRestitution_p1(this.ptr, arg0);
}
b2Contact.prototype['GetManifold'] = function() {
    return wrapPointer(_emscripten_bind_b2Contact__GetManifold_p0(this.ptr), Module['b2Manifold']);
}
b2Contact.prototype['ResetRestitution'] = function() {
    _emscripten_bind_b2Contact__ResetRestitution_p0(this.ptr);
}
function b2Shape(){ throw "b2Shape is abstract!" }
b2Shape.prototype.__cache__ = {};
Module['b2Shape'] = b2Shape;
b2Shape.prototype['get_m_radius'] = function() {
    return _emscripten_bind_b2Shape__get_m_radius_p0(this.ptr);
}
b2Shape.prototype['ComputeMass'] = function(arg0, arg1) {
    _emscripten_bind_b2Shape__ComputeMass_p2(this.ptr, arg0.ptr, arg1);
}
b2Shape.prototype['set_m_radius'] = function(arg0) {
    _emscripten_bind_b2Shape__set_m_radius_p1(this.ptr, arg0);
}
b2Shape.prototype['Clone'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Shape__Clone_p1(this.ptr, arg0.ptr), Module['b2Shape']);
}
b2Shape.prototype['GetType'] = function() {
    return _emscripten_bind_b2Shape__GetType_p0(this.ptr);
}
b2Shape.prototype['RayCast'] = function(arg0, arg1, arg2, arg3) {
    return _emscripten_bind_b2Shape__RayCast_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3);
}
b2Shape.prototype['ComputeAABB'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Shape__ComputeAABB_p3(this.ptr, arg0.ptr, arg1.ptr, arg2);
}
b2Shape.prototype['GetChildCount'] = function() {
    return _emscripten_bind_b2Shape__GetChildCount_p0(this.ptr);
}
b2Shape.prototype['TestPoint'] = function(arg0, arg1) {
    return _emscripten_bind_b2Shape__TestPoint_p2(this.ptr, arg0.ptr, arg1.ptr);
}
function b2Body(){ throw "b2Body is abstract!" }
b2Body.prototype.__cache__ = {};
Module['b2Body'] = b2Body;
b2Body.prototype['GetAngle'] = function() {
    return _emscripten_bind_b2Body__GetAngle_p0(this.ptr);
}
b2Body.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2Body__GetUserData_p0(this.ptr);
}
b2Body.prototype['IsSleepingAllowed'] = function() {
    return _emscripten_bind_b2Body__IsSleepingAllowed_p0(this.ptr);
}
b2Body.prototype['SetAngularDamping'] = function(arg0) {
    _emscripten_bind_b2Body__SetAngularDamping_p1(this.ptr, arg0);
}
b2Body.prototype['SetActive'] = function(arg0) {
    _emscripten_bind_b2Body__SetActive_p1(this.ptr, arg0);
}
b2Body.prototype['SetGravityScale'] = function(arg0) {
    _emscripten_bind_b2Body__SetGravityScale_p1(this.ptr, arg0);
}
b2Body.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2Body__SetUserData_p1(this.ptr, arg0);
}
b2Body.prototype['GetAngularVelocity'] = function() {
    return _emscripten_bind_b2Body__GetAngularVelocity_p0(this.ptr);
}
b2Body.prototype['GetFixtureList'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetFixtureList_p0(this.ptr), Module['b2Fixture']);
}
b2Body.prototype['ApplyForce'] = function(arg0, arg1) {
    _emscripten_bind_b2Body__ApplyForce_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2Body.prototype['GetLocalPoint'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Body__GetLocalPoint_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2Body.prototype['SetLinearVelocity'] = function(arg0) {
    _emscripten_bind_b2Body__SetLinearVelocity_p1(this.ptr, arg0.ptr);
}
b2Body.prototype['GetJointList'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetJointList_p0(this.ptr), Module['b2JointEdge']);
}
b2Body.prototype['GetLinearVelocity'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetLinearVelocity_p0(this.ptr), Module['b2Vec2']);
}
b2Body.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetNext_p0(this.ptr), Module['b2Body']);
}
b2Body.prototype['SetSleepingAllowed'] = function(arg0) {
    _emscripten_bind_b2Body__SetSleepingAllowed_p1(this.ptr, arg0);
}
b2Body.prototype['SetTransform'] = function(arg0, arg1) {
    _emscripten_bind_b2Body__SetTransform_p2(this.ptr, arg0.ptr, arg1);
}
b2Body.prototype['GetMass'] = function() {
    return _emscripten_bind_b2Body__GetMass_p0(this.ptr);
}
b2Body.prototype['SetAngularVelocity'] = function(arg0) {
    _emscripten_bind_b2Body__SetAngularVelocity_p1(this.ptr, arg0);
}
b2Body.prototype['GetMassData'] = function(arg0) {
    _emscripten_bind_b2Body__GetMassData_p1(this.ptr, arg0.ptr);
}
b2Body.prototype['GetLinearVelocityFromWorldPoint'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2Body.prototype['ResetMassData'] = function() {
    _emscripten_bind_b2Body__ResetMassData_p0(this.ptr);
}
b2Body.prototype['ApplyForceToCenter'] = function(arg0) {
    _emscripten_bind_b2Body__ApplyForceToCenter_p1(this.ptr, arg0.ptr);
}
b2Body.prototype['ApplyTorque'] = function(arg0) {
    _emscripten_bind_b2Body__ApplyTorque_p1(this.ptr, arg0);
}
b2Body.prototype['IsAwake'] = function() {
    return _emscripten_bind_b2Body__IsAwake_p0(this.ptr);
}
b2Body.prototype['SetType'] = function(arg0) {
    _emscripten_bind_b2Body__SetType_p1(this.ptr, arg0);
}
b2Body.prototype['CreateFixture'] = function(arg0, arg1) {
  if (arg1 === undefined)
    return wrapPointer(_emscripten_bind_b2Body__CreateFixture_p1(this.ptr, arg0.ptr), Module['b2Fixture']);
  else 
    return wrapPointer(_emscripten_bind_b2Body__CreateFixture_p2(this.ptr, arg0.ptr, arg1), Module['b2Fixture']);
}
b2Body.prototype['SetMassData'] = function(arg0) {
    _emscripten_bind_b2Body__SetMassData_p1(this.ptr, arg0.ptr);
}
b2Body.prototype['GetTransform'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetTransform_p0(this.ptr), Module['b2Transform']);
}
b2Body.prototype['GetWorldCenter'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetWorldCenter_p0(this.ptr), Module['b2Vec2']);
}
b2Body.prototype['GetAngularDamping'] = function() {
    return _emscripten_bind_b2Body__GetAngularDamping_p0(this.ptr);
}
b2Body.prototype['ApplyLinearImpulse'] = function(arg0, arg1) {
    _emscripten_bind_b2Body__ApplyLinearImpulse_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2Body.prototype['IsFixedRotation'] = function() {
    return _emscripten_bind_b2Body__IsFixedRotation_p0(this.ptr);
}
b2Body.prototype['GetLocalCenter'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetLocalCenter_p0(this.ptr), Module['b2Vec2']);
}
b2Body.prototype['GetWorldVector'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Body__GetWorldVector_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2Body.prototype['GetLinearVelocityFromLocalPoint'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2Body.prototype['GetContactList'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetContactList_p0(this.ptr), Module['b2ContactEdge']);
}
b2Body.prototype['GetWorldPoint'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Body__GetWorldPoint_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2Body.prototype['SetAwake'] = function(arg0) {
    _emscripten_bind_b2Body__SetAwake_p1(this.ptr, arg0);
}
b2Body.prototype['GetLinearDamping'] = function() {
    return _emscripten_bind_b2Body__GetLinearDamping_p0(this.ptr);
}
b2Body.prototype['IsBullet'] = function() {
    return _emscripten_bind_b2Body__IsBullet_p0(this.ptr);
}
b2Body.prototype['GetWorld'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetWorld_p0(this.ptr), Module['b2World']);
}
b2Body.prototype['GetLocalVector'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Body__GetLocalVector_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2Body.prototype['SetLinearDamping'] = function(arg0) {
    _emscripten_bind_b2Body__SetLinearDamping_p1(this.ptr, arg0);
}
b2Body.prototype['Dump'] = function() {
    _emscripten_bind_b2Body__Dump_p0(this.ptr);
}
b2Body.prototype['SetBullet'] = function(arg0) {
    _emscripten_bind_b2Body__SetBullet_p1(this.ptr, arg0);
}
b2Body.prototype['GetType'] = function() {
    return _emscripten_bind_b2Body__GetType_p0(this.ptr);
}
b2Body.prototype['GetGravityScale'] = function() {
    return _emscripten_bind_b2Body__GetGravityScale_p0(this.ptr);
}
b2Body.prototype['DestroyFixture'] = function(arg0) {
    _emscripten_bind_b2Body__DestroyFixture_p1(this.ptr, arg0.ptr);
}
b2Body.prototype['GetInertia'] = function() {
    return _emscripten_bind_b2Body__GetInertia_p0(this.ptr);
}
b2Body.prototype['IsActive'] = function() {
    return _emscripten_bind_b2Body__IsActive_p0(this.ptr);
}
b2Body.prototype['SetFixedRotation'] = function(arg0) {
    _emscripten_bind_b2Body__SetFixedRotation_p1(this.ptr, arg0);
}
b2Body.prototype['ApplyAngularImpulse'] = function(arg0) {
    _emscripten_bind_b2Body__ApplyAngularImpulse_p1(this.ptr, arg0);
}
b2Body.prototype['GetPosition'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetPosition_p0(this.ptr), Module['b2Vec2']);
}
b2FrictionJoint.prototype['SetMaxTorque'] = function(arg0) {
    _emscripten_bind_b2FrictionJoint__SetMaxTorque_p1(this.ptr, arg0);
}
b2FrictionJoint.prototype['GetMaxForce'] = function() {
    return _emscripten_bind_b2FrictionJoint__GetMaxForce_p0(this.ptr);
}
b2FrictionJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2FrictionJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2FrictionJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2FrictionJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2FrictionJoint__Dump_p0(this.ptr);
}
b2FrictionJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2FrictionJoint____destroy___p0(this.ptr);
}
b2FrictionJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2FrictionJoint__GetCollideConnected_p0(this.ptr);
}
b2FrictionJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2FrictionJoint__GetUserData_p0(this.ptr);
}
b2FrictionJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2FrictionJoint__GetType_p0(this.ptr);
}
b2FrictionJoint.prototype['SetMaxForce'] = function(arg0) {
    _emscripten_bind_b2FrictionJoint__SetMaxForce_p1(this.ptr, arg0);
}
b2FrictionJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2FrictionJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
function b2FrictionJoint(arg0) {
    this.ptr = _emscripten_bind_b2FrictionJoint__b2FrictionJoint_p1(arg0.ptr);
  b2FrictionJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2FrictionJoint;
}
b2FrictionJoint.prototype.__cache__ = {};
Module['b2FrictionJoint'] = b2FrictionJoint;
b2FrictionJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2FrictionJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2FrictionJoint__SetUserData_p1(this.ptr, arg0);
}
b2FrictionJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2FrictionJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2FrictionJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2FrictionJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2FrictionJoint.prototype['GetMaxTorque'] = function() {
    return _emscripten_bind_b2FrictionJoint__GetMaxTorque_p0(this.ptr);
}
b2FrictionJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2FrictionJoint__IsActive_p0(this.ptr);
}
b2StackAllocator.prototype['GetMaxAllocation'] = function() {
    return _emscripten_bind_b2StackAllocator__GetMaxAllocation_p0(this.ptr);
}
b2StackAllocator.prototype['__destroy__'] = function() {
    _emscripten_bind_b2StackAllocator____destroy___p0(this.ptr);
}
function b2StackAllocator() {
    this.ptr = _emscripten_bind_b2StackAllocator__b2StackAllocator_p0();
  b2StackAllocator.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2StackAllocator;
}
b2StackAllocator.prototype.__cache__ = {};
Module['b2StackAllocator'] = b2StackAllocator;
b2StackAllocator.prototype['Allocate'] = function(arg0) {
    return _emscripten_bind_b2StackAllocator__Allocate_p1(this.ptr, arg0);
}
b2StackAllocator.prototype['Free'] = function(arg0) {
    _emscripten_bind_b2StackAllocator__Free_p1(this.ptr, arg0);
}
b2DestructionListener.prototype['__destroy__'] = function() {
    _emscripten_bind_b2DestructionListener____destroy___p0(this.ptr);
}
b2DestructionListener.prototype['SayGoodbye'] = function(arg0) {
    _emscripten_bind_b2DestructionListener__SayGoodbye_p1(this.ptr, arg0.ptr);
}
function b2DestructionListener() {
    this.ptr = _emscripten_bind_b2DestructionListener__b2DestructionListener_p0();
  b2DestructionListener.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2DestructionListener;
}
b2DestructionListener.prototype.__cache__ = {};
Module['b2DestructionListener'] = b2DestructionListener;
b2Filter.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Filter____destroy___p0(this.ptr);
}
b2Filter.prototype['set_maskBits'] = function(arg0) {
    _emscripten_bind_b2Filter__set_maskBits_p1(this.ptr, arg0);
}
b2Filter.prototype['set_categoryBits'] = function(arg0) {
    _emscripten_bind_b2Filter__set_categoryBits_p1(this.ptr, arg0);
}
b2Filter.prototype['get_groupIndex'] = function() {
    return _emscripten_bind_b2Filter__get_groupIndex_p0(this.ptr);
}
b2Filter.prototype['set_groupIndex'] = function(arg0) {
    _emscripten_bind_b2Filter__set_groupIndex_p1(this.ptr, arg0);
}
b2Filter.prototype['get_maskBits'] = function() {
    return _emscripten_bind_b2Filter__get_maskBits_p0(this.ptr);
}
function b2Filter() {
    this.ptr = _emscripten_bind_b2Filter__b2Filter_p0();
  b2Filter.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Filter;
}
b2Filter.prototype.__cache__ = {};
Module['b2Filter'] = b2Filter;
b2Filter.prototype['get_categoryBits'] = function() {
    return _emscripten_bind_b2Filter__get_categoryBits_p0(this.ptr);
}
b2FrictionJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2FrictionJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2FrictionJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2FrictionJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2FrictionJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2FrictionJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2FrictionJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2FrictionJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2FrictionJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2FrictionJointDef____destroy___p0(this.ptr);
}
b2FrictionJointDef.prototype['get_maxForce'] = function() {
    return _emscripten_bind_b2FrictionJointDef__get_maxForce_p0(this.ptr);
}
function b2FrictionJointDef() {
    this.ptr = _emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0();
  b2FrictionJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2FrictionJointDef;
}
b2FrictionJointDef.prototype.__cache__ = {};
Module['b2FrictionJointDef'] = b2FrictionJointDef;
b2FrictionJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2FrictionJointDef.prototype['set_maxForce'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_maxForce_p1(this.ptr, arg0);
}
b2FrictionJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2FrictionJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2FrictionJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2FrictionJointDef.prototype['set_maxTorque'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_maxTorque_p1(this.ptr, arg0);
}
b2FrictionJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2FrictionJointDef.prototype['Initialize'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2FrictionJointDef__Initialize_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
}
b2FrictionJointDef.prototype['get_maxTorque'] = function() {
    return _emscripten_bind_b2FrictionJointDef__get_maxTorque_p0(this.ptr);
}
b2BodyDef.prototype['get_linearDamping'] = function() {
    return _emscripten_bind_b2BodyDef__get_linearDamping_p0(this.ptr);
}
b2BodyDef.prototype['get_awake'] = function() {
    return _emscripten_bind_b2BodyDef__get_awake_p0(this.ptr);
}
b2BodyDef.prototype['get_type'] = function() {
    return _emscripten_bind_b2BodyDef__get_type_p0(this.ptr);
}
b2BodyDef.prototype['get_allowSleep'] = function() {
    return _emscripten_bind_b2BodyDef__get_allowSleep_p0(this.ptr);
}
b2BodyDef.prototype['set_position'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_position_p1(this.ptr, arg0.ptr);
}
b2BodyDef.prototype['set_linearVelocity'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_linearVelocity_p1(this.ptr, arg0.ptr);
}
function b2BodyDef() {
    this.ptr = _emscripten_bind_b2BodyDef__b2BodyDef_p0();
  b2BodyDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2BodyDef;
}
b2BodyDef.prototype.__cache__ = {};
Module['b2BodyDef'] = b2BodyDef;
b2BodyDef.prototype['get_bullet'] = function() {
    return _emscripten_bind_b2BodyDef__get_bullet_p0(this.ptr);
}
b2BodyDef.prototype['get_userData'] = function() {
    return _emscripten_bind_b2BodyDef__get_userData_p0(this.ptr);
}
b2BodyDef.prototype['set_angularDamping'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_angularDamping_p1(this.ptr, arg0);
}
b2BodyDef.prototype['set_fixedRotation'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_fixedRotation_p1(this.ptr, arg0);
}
b2BodyDef.prototype['set_allowSleep'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_allowSleep_p1(this.ptr, arg0);
}
b2BodyDef.prototype['get_gravityScale'] = function() {
    return _emscripten_bind_b2BodyDef__get_gravityScale_p0(this.ptr);
}
b2BodyDef.prototype['set_angularVelocity'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_angularVelocity_p1(this.ptr, arg0);
}
b2BodyDef.prototype['set_userData'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_userData_p1(this.ptr, arg0);
}
b2BodyDef.prototype['get_position'] = function() {
    return wrapPointer(_emscripten_bind_b2BodyDef__get_position_p0(this.ptr), Module['b2Vec2']);
}
b2BodyDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2BodyDef____destroy___p0(this.ptr);
}
b2BodyDef.prototype['set_type'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_type_p1(this.ptr, arg0);
}
b2BodyDef.prototype['set_gravityScale'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_gravityScale_p1(this.ptr, arg0);
}
b2BodyDef.prototype['get_angularDamping'] = function() {
    return _emscripten_bind_b2BodyDef__get_angularDamping_p0(this.ptr);
}
b2BodyDef.prototype['set_bullet'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_bullet_p1(this.ptr, arg0);
}
b2BodyDef.prototype['set_active'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_active_p1(this.ptr, arg0);
}
b2BodyDef.prototype['set_angle'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_angle_p1(this.ptr, arg0);
}
b2BodyDef.prototype['get_angle'] = function() {
    return _emscripten_bind_b2BodyDef__get_angle_p0(this.ptr);
}
b2BodyDef.prototype['get_angularVelocity'] = function() {
    return _emscripten_bind_b2BodyDef__get_angularVelocity_p0(this.ptr);
}
b2BodyDef.prototype['get_linearVelocity'] = function() {
    return wrapPointer(_emscripten_bind_b2BodyDef__get_linearVelocity_p0(this.ptr), Module['b2Vec2']);
}
b2BodyDef.prototype['get_active'] = function() {
    return _emscripten_bind_b2BodyDef__get_active_p0(this.ptr);
}
b2BodyDef.prototype['set_linearDamping'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_linearDamping_p1(this.ptr, arg0);
}
b2BodyDef.prototype['get_fixedRotation'] = function() {
    return _emscripten_bind_b2BodyDef__get_fixedRotation_p0(this.ptr);
}
b2BodyDef.prototype['set_awake'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_awake_p1(this.ptr, arg0);
}
b2Vec2.prototype['Normalize'] = function() {
    return _emscripten_bind_b2Vec2__Normalize_p0(this.ptr);
}
b2Vec2.prototype['set_x'] = function(arg0) {
    _emscripten_bind_b2Vec2__set_x_p1(this.ptr, arg0);
}
function b2Vec2(arg0, arg1) {
  if (arg0 === undefined)
    this.ptr = _emscripten_bind_b2Vec2__b2Vec2_p0();
  else 
    this.ptr = _emscripten_bind_b2Vec2__b2Vec2_p2(arg0, arg1);
  b2Vec2.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Vec2;
}
b2Vec2.prototype.__cache__ = {};
Module['b2Vec2'] = b2Vec2;
b2Vec2.prototype['Set'] = function(arg0, arg1) {
    _emscripten_bind_b2Vec2__Set_p2(this.ptr, arg0, arg1);
}
b2Vec2.prototype['get_x'] = function() {
    return _emscripten_bind_b2Vec2__get_x_p0(this.ptr);
}
b2Vec2.prototype['get_y'] = function() {
    return _emscripten_bind_b2Vec2__get_y_p0(this.ptr);
}
b2Vec2.prototype['set_y'] = function(arg0) {
    _emscripten_bind_b2Vec2__set_y_p1(this.ptr, arg0);
}
b2Vec2.prototype['IsValid'] = function() {
    return _emscripten_bind_b2Vec2__IsValid_p0(this.ptr);
}
b2Vec2.prototype['Skew'] = function() {
    return wrapPointer(_emscripten_bind_b2Vec2__Skew_p0(this.ptr), Module['b2Vec2']);
}
b2Vec2.prototype['LengthSquared'] = function() {
    return _emscripten_bind_b2Vec2__LengthSquared_p0(this.ptr);
}
b2Vec2.prototype['op_add'] = function(arg0) {
    _emscripten_bind_b2Vec2__op_add_p1(this.ptr, arg0.ptr);
}
b2Vec2.prototype['SetZero'] = function() {
    _emscripten_bind_b2Vec2__SetZero_p0(this.ptr);
}
b2Vec2.prototype['Length'] = function() {
    return _emscripten_bind_b2Vec2__Length_p0(this.ptr);
}
b2Vec2.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Vec2____destroy___p0(this.ptr);
}
b2Vec2.prototype['op_mul'] = function(arg0) {
    _emscripten_bind_b2Vec2__op_mul_p1(this.ptr, arg0);
}
b2Vec2.prototype['op_sub'] = function() {
    return wrapPointer(_emscripten_bind_b2Vec2__op_sub_p0(this.ptr), Module['b2Vec2']);
}
b2Vec3.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Vec3____destroy___p0(this.ptr);
}
b2Vec3.prototype['set_z'] = function(arg0) {
    _emscripten_bind_b2Vec3__set_z_p1(this.ptr, arg0);
}
b2Vec3.prototype['Set'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Vec3__Set_p3(this.ptr, arg0, arg1, arg2);
}
b2Vec3.prototype['get_z'] = function() {
    return _emscripten_bind_b2Vec3__get_z_p0(this.ptr);
}
b2Vec3.prototype['op_add'] = function(arg0) {
    _emscripten_bind_b2Vec3__op_add_p1(this.ptr, arg0.ptr);
}
b2Vec3.prototype['SetZero'] = function() {
    _emscripten_bind_b2Vec3__SetZero_p0(this.ptr);
}
function b2Vec3(arg0, arg1, arg2) {
  if (arg0 === undefined)
    this.ptr = _emscripten_bind_b2Vec3__b2Vec3_p0();
  else 
    this.ptr = _emscripten_bind_b2Vec3__b2Vec3_p3(arg0, arg1, arg2);
  b2Vec3.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Vec3;
}
b2Vec3.prototype.__cache__ = {};
Module['b2Vec3'] = b2Vec3;
b2Vec3.prototype['op_mul'] = function(arg0) {
    _emscripten_bind_b2Vec3__op_mul_p1(this.ptr, arg0);
}
b2Vec3.prototype['op_sub'] = function() {
    return wrapPointer(_emscripten_bind_b2Vec3__op_sub_p0(this.ptr), Module['b2Vec3']);
}
b2DistanceProxy.prototype['get_m_radius'] = function() {
    return _emscripten_bind_b2DistanceProxy__get_m_radius_p0(this.ptr);
}
b2DistanceProxy.prototype['Set'] = function(arg0, arg1) {
    _emscripten_bind_b2DistanceProxy__Set_p2(this.ptr, arg0.ptr, arg1);
}
function b2DistanceProxy() {
    this.ptr = _emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0();
  b2DistanceProxy.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2DistanceProxy;
}
b2DistanceProxy.prototype.__cache__ = {};
Module['b2DistanceProxy'] = b2DistanceProxy;
b2DistanceProxy.prototype['set_m_radius'] = function(arg0) {
    _emscripten_bind_b2DistanceProxy__set_m_radius_p1(this.ptr, arg0);
}
b2DistanceProxy.prototype['__destroy__'] = function() {
    _emscripten_bind_b2DistanceProxy____destroy___p0(this.ptr);
}
b2DistanceProxy.prototype['get_m_vertices'] = function() {
    return _emscripten_bind_b2DistanceProxy__get_m_vertices_p0(this.ptr);
}
b2DistanceProxy.prototype['GetSupportVertex'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2DistanceProxy__GetSupportVertex_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2DistanceProxy.prototype['get_m_count'] = function() {
    return _emscripten_bind_b2DistanceProxy__get_m_count_p0(this.ptr);
}
b2DistanceProxy.prototype['GetVertexCount'] = function() {
    return _emscripten_bind_b2DistanceProxy__GetVertexCount_p0(this.ptr);
}
b2DistanceProxy.prototype['GetVertex'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2DistanceProxy__GetVertex_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2DistanceProxy.prototype['GetSupport'] = function(arg0) {
    return _emscripten_bind_b2DistanceProxy__GetSupport_p1(this.ptr, arg0.ptr);
}
b2DistanceProxy.prototype['set_m_vertices'] = function(arg0) {
    _emscripten_bind_b2DistanceProxy__set_m_vertices_p1(this.ptr, arg0.ptr);
}
b2DistanceProxy.prototype['set_m_count'] = function(arg0) {
    _emscripten_bind_b2DistanceProxy__set_m_count_p1(this.ptr, arg0);
}
b2FixtureDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2FixtureDef____destroy___p0(this.ptr);
}
b2FixtureDef.prototype['get_isSensor'] = function() {
    return _emscripten_bind_b2FixtureDef__get_isSensor_p0(this.ptr);
}
b2FixtureDef.prototype['set_userData'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_userData_p1(this.ptr, arg0);
}
b2FixtureDef.prototype['set_shape'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_shape_p1(this.ptr, arg0.ptr);
}
b2FixtureDef.prototype['get_density'] = function() {
    return _emscripten_bind_b2FixtureDef__get_density_p0(this.ptr);
}
b2FixtureDef.prototype['get_shape'] = function() {
    return _emscripten_bind_b2FixtureDef__get_shape_p0(this.ptr);
}
function b2FixtureDef() {
    this.ptr = _emscripten_bind_b2FixtureDef__b2FixtureDef_p0();
  b2FixtureDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2FixtureDef;
}
b2FixtureDef.prototype.__cache__ = {};
Module['b2FixtureDef'] = b2FixtureDef;
b2FixtureDef.prototype['set_density'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_density_p1(this.ptr, arg0);
}
b2FixtureDef.prototype['set_restitution'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_restitution_p1(this.ptr, arg0);
}
b2FixtureDef.prototype['get_restitution'] = function() {
    return _emscripten_bind_b2FixtureDef__get_restitution_p0(this.ptr);
}
b2FixtureDef.prototype['set_isSensor'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_isSensor_p1(this.ptr, arg0);
}
b2FixtureDef.prototype['get_filter'] = function() {
    return wrapPointer(_emscripten_bind_b2FixtureDef__get_filter_p0(this.ptr), Module['b2Filter']);
}
b2FixtureDef.prototype['get_friction'] = function() {
    return _emscripten_bind_b2FixtureDef__get_friction_p0(this.ptr);
}
b2FixtureDef.prototype['set_friction'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_friction_p1(this.ptr, arg0);
}
b2FixtureDef.prototype['get_userData'] = function() {
    return _emscripten_bind_b2FixtureDef__get_userData_p0(this.ptr);
}
b2FixtureDef.prototype['set_filter'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_filter_p1(this.ptr, arg0.ptr);
}
b2Manifold.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Manifold____destroy___p0(this.ptr);
}
b2Manifold.prototype['get_localPoint'] = function() {
    return wrapPointer(_emscripten_bind_b2Manifold__get_localPoint_p0(this.ptr), Module['b2Vec2']);
}
function b2Manifold() {
    this.ptr = _emscripten_bind_b2Manifold__b2Manifold_p0();
  b2Manifold.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Manifold;
}
b2Manifold.prototype.__cache__ = {};
Module['b2Manifold'] = b2Manifold;
b2Manifold.prototype['set_localPoint'] = function(arg0) {
    _emscripten_bind_b2Manifold__set_localPoint_p1(this.ptr, arg0.ptr);
}
b2Manifold.prototype['set_localNormal'] = function(arg0) {
    _emscripten_bind_b2Manifold__set_localNormal_p1(this.ptr, arg0.ptr);
}
b2Manifold.prototype['set_type'] = function(arg0) {
    _emscripten_bind_b2Manifold__set_type_p1(this.ptr, arg0);
}
b2Manifold.prototype['get_pointCount'] = function() {
    return _emscripten_bind_b2Manifold__get_pointCount_p0(this.ptr);
}
b2Manifold.prototype['get_type'] = function() {
    return _emscripten_bind_b2Manifold__get_type_p0(this.ptr);
}
b2Manifold.prototype['set_pointCount'] = function(arg0) {
    _emscripten_bind_b2Manifold__set_pointCount_p1(this.ptr, arg0);
}
b2Manifold.prototype['get_localNormal'] = function() {
    return wrapPointer(_emscripten_bind_b2Manifold__get_localNormal_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2PrismaticJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2PrismaticJointDef.prototype['get_motorSpeed'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0(this.ptr);
}
b2PrismaticJointDef.prototype['get_enableMotor'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0(this.ptr);
}
b2PrismaticJointDef.prototype['get_referenceAngle'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0(this.ptr);
}
b2PrismaticJointDef.prototype['set_enableLimit'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['set_motorSpeed'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['get_localAxisA'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2PrismaticJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
function b2PrismaticJointDef() {
    this.ptr = _emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0();
  b2PrismaticJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2PrismaticJointDef;
}
b2PrismaticJointDef.prototype.__cache__ = {};
Module['b2PrismaticJointDef'] = b2PrismaticJointDef;
b2PrismaticJointDef.prototype['Initialize'] = function(arg0, arg1, arg2, arg3) {
    _emscripten_bind_b2PrismaticJointDef__Initialize_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3.ptr);
}
b2PrismaticJointDef.prototype['set_lowerTranslation'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['get_upperTranslation'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0(this.ptr);
}
b2PrismaticJointDef.prototype['get_enableLimit'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0(this.ptr);
}
b2PrismaticJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2PrismaticJointDef____destroy___p0(this.ptr);
}
b2PrismaticJointDef.prototype['set_referenceAngle'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2PrismaticJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PrismaticJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2PrismaticJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PrismaticJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2PrismaticJointDef.prototype['set_upperTranslation'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['get_maxMotorForce'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0(this.ptr);
}
b2PrismaticJointDef.prototype['set_maxMotorForce'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['set_enableMotor'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['get_lowerTranslation'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0(this.ptr);
}
b2PrismaticJointDef.prototype['set_localAxisA'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1(this.ptr, arg0.ptr);
}
b2Rot.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Rot____destroy___p0(this.ptr);
}
b2Rot.prototype['Set'] = function(arg0) {
    _emscripten_bind_b2Rot__Set_p1(this.ptr, arg0);
}
b2Rot.prototype['GetAngle'] = function() {
    return _emscripten_bind_b2Rot__GetAngle_p0(this.ptr);
}
b2Rot.prototype['GetYAxis'] = function() {
    return wrapPointer(_emscripten_bind_b2Rot__GetYAxis_p0(this.ptr), Module['b2Vec2']);
}
b2Rot.prototype['GetXAxis'] = function() {
    return wrapPointer(_emscripten_bind_b2Rot__GetXAxis_p0(this.ptr), Module['b2Vec2']);
}
b2Rot.prototype['set_c'] = function(arg0) {
    _emscripten_bind_b2Rot__set_c_p1(this.ptr, arg0);
}
b2Rot.prototype['SetIdentity'] = function() {
    _emscripten_bind_b2Rot__SetIdentity_p0(this.ptr);
}
function b2Rot(arg0) {
  if (arg0 === undefined)
    this.ptr = _emscripten_bind_b2Rot__b2Rot_p0();
  else 
    this.ptr = _emscripten_bind_b2Rot__b2Rot_p1(arg0);
  b2Rot.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Rot;
}
b2Rot.prototype.__cache__ = {};
Module['b2Rot'] = b2Rot;
b2Rot.prototype['get_c'] = function() {
    return _emscripten_bind_b2Rot__get_c_p0(this.ptr);
}
b2WheelJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2WheelJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2WheelJointDef.prototype['get_motorSpeed'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_motorSpeed_p0(this.ptr);
}
b2WheelJointDef.prototype['set_maxMotorTorque'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['set_frequencyHz'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_frequencyHz_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['set_motorSpeed'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_motorSpeed_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['get_localAxisA'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJointDef__get_localAxisA_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2WheelJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2WheelJointDef.prototype['Initialize'] = function(arg0, arg1, arg2, arg3) {
    _emscripten_bind_b2WheelJointDef__Initialize_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3.ptr);
}
function b2WheelJointDef() {
    this.ptr = _emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0();
  b2WheelJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2WheelJointDef;
}
b2WheelJointDef.prototype.__cache__ = {};
Module['b2WheelJointDef'] = b2WheelJointDef;
b2WheelJointDef.prototype['get_frequencyHz'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_frequencyHz_p0(this.ptr);
}
b2WheelJointDef.prototype['set_dampingRatio'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_dampingRatio_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2WheelJointDef____destroy___p0(this.ptr);
}
b2WheelJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJointDef.prototype['get_maxMotorTorque'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0(this.ptr);
}
b2WheelJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2WheelJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['get_enableMotor'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_enableMotor_p0(this.ptr);
}
b2WheelJointDef.prototype['get_dampingRatio'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_dampingRatio_p0(this.ptr);
}
b2WheelJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2WheelJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2WheelJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2WheelJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2WheelJointDef.prototype['set_enableMotor'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_enableMotor_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['set_localAxisA'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_localAxisA_p1(this.ptr, arg0.ptr);
}
b2RevoluteJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2RevoluteJointDef.prototype['get_lowerAngle'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2RevoluteJointDef.prototype['set_lowerAngle'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_enableMotor'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_upperAngle'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_referenceAngle'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_enableLimit'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_motorSpeed'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_motorSpeed'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_maxMotorTorque'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2RevoluteJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
function b2RevoluteJointDef() {
    this.ptr = _emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0();
  b2RevoluteJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2RevoluteJointDef;
}
b2RevoluteJointDef.prototype.__cache__ = {};
Module['b2RevoluteJointDef'] = b2RevoluteJointDef;
b2RevoluteJointDef.prototype['Initialize'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2RevoluteJointDef__Initialize_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
}
b2RevoluteJointDef.prototype['get_enableLimit'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0(this.ptr);
}
b2RevoluteJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2RevoluteJointDef____destroy___p0(this.ptr);
}
b2RevoluteJointDef.prototype['get_upperAngle'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_referenceAngle'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2RevoluteJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2RevoluteJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2RevoluteJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2RevoluteJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2RevoluteJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2RevoluteJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2RevoluteJointDef.prototype['set_maxMotorTorque'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['set_enableMotor'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2PulleyJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['set_ratio'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_ratio_p1(this.ptr, arg0);
}
b2PulleyJointDef.prototype['set_groundAnchorB'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['set_groundAnchorA'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['get_groundAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJointDef.prototype['get_groundAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['Initialize'] = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    _emscripten_bind_b2PulleyJointDef__Initialize_p7(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3.ptr, arg4.ptr, arg5.ptr, arg6);
}
b2PulleyJointDef.prototype['get_ratio'] = function() {
    return _emscripten_bind_b2PulleyJointDef__get_ratio_p0(this.ptr);
}
b2PulleyJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2PulleyJointDef____destroy___p0(this.ptr);
}
b2PulleyJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2PulleyJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2PulleyJointDef.prototype['set_lengthB'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_lengthB_p1(this.ptr, arg0);
}
b2PulleyJointDef.prototype['set_lengthA'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_lengthA_p1(this.ptr, arg0);
}
b2PulleyJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2PulleyJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2PulleyJointDef.prototype['get_lengthB'] = function() {
    return _emscripten_bind_b2PulleyJointDef__get_lengthB_p0(this.ptr);
}
b2PulleyJointDef.prototype['get_lengthA'] = function() {
    return _emscripten_bind_b2PulleyJointDef__get_lengthA_p0(this.ptr);
}
b2PulleyJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_collideConnected_p1(this.ptr, arg0);
}
function b2PulleyJointDef() {
    this.ptr = _emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0();
  b2PulleyJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2PulleyJointDef;
}
b2PulleyJointDef.prototype.__cache__ = {};
Module['b2PulleyJointDef'] = b2PulleyJointDef;
b2JointDef.prototype['get_bodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2JointDef__get_bodyA_p0(this.ptr), Module['b2Body']);
}
b2JointDef.prototype['set_userData'] = function(arg0) {
    _emscripten_bind_b2JointDef__set_userData_p1(this.ptr, arg0);
}
b2JointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2JointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2JointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2JointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2JointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2JointDef____destroy___p0(this.ptr);
}
b2JointDef.prototype['get_bodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2JointDef__get_bodyB_p0(this.ptr), Module['b2Body']);
}
b2JointDef.prototype['set_type'] = function(arg0) {
    _emscripten_bind_b2JointDef__set_type_p1(this.ptr, arg0);
}
b2JointDef.prototype['get_collideConnected'] = function() {
    return _emscripten_bind_b2JointDef__get_collideConnected_p0(this.ptr);
}
b2JointDef.prototype['get_type'] = function() {
    return _emscripten_bind_b2JointDef__get_type_p0(this.ptr);
}
b2JointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2JointDef__set_collideConnected_p1(this.ptr, arg0);
}
function b2JointDef() {
    this.ptr = _emscripten_bind_b2JointDef__b2JointDef_p0();
  b2JointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2JointDef;
}
b2JointDef.prototype.__cache__ = {};
Module['b2JointDef'] = b2JointDef;
b2JointDef.prototype['get_userData'] = function() {
    return _emscripten_bind_b2JointDef__get_userData_p0(this.ptr);
}
b2Transform.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Transform____destroy___p0(this.ptr);
}
b2Transform.prototype['Set'] = function(arg0, arg1) {
    _emscripten_bind_b2Transform__Set_p2(this.ptr, arg0.ptr, arg1);
}
b2Transform.prototype['set_p'] = function(arg0) {
    _emscripten_bind_b2Transform__set_p_p1(this.ptr, arg0.ptr);
}
b2Transform.prototype['set_q'] = function(arg0) {
    _emscripten_bind_b2Transform__set_q_p1(this.ptr, arg0.ptr);
}
b2Transform.prototype['get_p'] = function() {
    return wrapPointer(_emscripten_bind_b2Transform__get_p_p0(this.ptr), Module['b2Vec2']);
}
b2Transform.prototype['get_q'] = function() {
    return wrapPointer(_emscripten_bind_b2Transform__get_q_p0(this.ptr), Module['b2Rot']);
}
function b2Transform(arg0, arg1) {
  if (arg0 === undefined)
    this.ptr = _emscripten_bind_b2Transform__b2Transform_p0();
  else 
    this.ptr = _emscripten_bind_b2Transform__b2Transform_p2(arg0.ptr, arg1.ptr);
  b2Transform.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Transform;
}
b2Transform.prototype.__cache__ = {};
Module['b2Transform'] = b2Transform;
b2Transform.prototype['SetIdentity'] = function() {
    _emscripten_bind_b2Transform__SetIdentity_p0(this.ptr);
}
b2Color.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Color____destroy___p0(this.ptr);
}
b2Color.prototype['Set'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Color__Set_p3(this.ptr, arg0, arg1, arg2);
}
b2Color.prototype['set_r'] = function(arg0) {
    _emscripten_bind_b2Color__set_r_p1(this.ptr, arg0);
}
b2Color.prototype['get_r'] = function() {
    return _emscripten_bind_b2Color__get_r_p0(this.ptr);
}
function b2Color(arg0, arg1, arg2) {
  if (arg0 === undefined)
    this.ptr = _emscripten_bind_b2Color__b2Color_p0();
  else 
    this.ptr = _emscripten_bind_b2Color__b2Color_p3(arg0, arg1, arg2);
  b2Color.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Color;
}
b2Color.prototype.__cache__ = {};
Module['b2Color'] = b2Color;
b2Color.prototype['set_b'] = function(arg0) {
    _emscripten_bind_b2Color__set_b_p1(this.ptr, arg0);
}
b2Color.prototype['get_g'] = function() {
    return _emscripten_bind_b2Color__get_g_p0(this.ptr);
}
b2Color.prototype['get_b'] = function() {
    return _emscripten_bind_b2Color__get_b_p0(this.ptr);
}
b2Color.prototype['set_g'] = function(arg0) {
    _emscripten_bind_b2Color__set_g_p1(this.ptr, arg0);
}
b2AABB.prototype['__destroy__'] = function() {
    _emscripten_bind_b2AABB____destroy___p0(this.ptr);
}
function b2AABB() {
    this.ptr = _emscripten_bind_b2AABB__b2AABB_p0();
  b2AABB.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2AABB;
}
b2AABB.prototype.__cache__ = {};
Module['b2AABB'] = b2AABB;
b2AABB.prototype['set_upperBound'] = function(arg0) {
    _emscripten_bind_b2AABB__set_upperBound_p1(this.ptr, arg0.ptr);
}
b2AABB.prototype['IsValid'] = function() {
    return _emscripten_bind_b2AABB__IsValid_p0(this.ptr);
}
b2AABB.prototype['Contains'] = function(arg0) {
    return _emscripten_bind_b2AABB__Contains_p1(this.ptr, arg0.ptr);
}
b2AABB.prototype['GetExtents'] = function() {
    return wrapPointer(_emscripten_bind_b2AABB__GetExtents_p0(this.ptr), Module['b2Vec2']);
}
b2AABB.prototype['GetCenter'] = function() {
    return wrapPointer(_emscripten_bind_b2AABB__GetCenter_p0(this.ptr), Module['b2Vec2']);
}
b2AABB.prototype['get_upperBound'] = function() {
    return wrapPointer(_emscripten_bind_b2AABB__get_upperBound_p0(this.ptr), Module['b2Vec2']);
}
b2AABB.prototype['GetPerimeter'] = function() {
    return _emscripten_bind_b2AABB__GetPerimeter_p0(this.ptr);
}
b2AABB.prototype['Combine'] = function(arg0, arg1) {
  if (arg1 === undefined)
    _emscripten_bind_b2AABB__Combine_p1(this.ptr, arg0.ptr);
  else 
    _emscripten_bind_b2AABB__Combine_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2AABB.prototype['RayCast'] = function(arg0, arg1) {
    return _emscripten_bind_b2AABB__RayCast_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2AABB.prototype['set_lowerBound'] = function(arg0) {
    _emscripten_bind_b2AABB__set_lowerBound_p1(this.ptr, arg0.ptr);
}
b2AABB.prototype['get_lowerBound'] = function() {
    return wrapPointer(_emscripten_bind_b2AABB__get_lowerBound_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2WeldJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2WeldJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2WeldJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2WeldJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2WeldJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2WeldJointDef.prototype['get_frequencyHz'] = function() {
    return _emscripten_bind_b2WeldJointDef__get_frequencyHz_p0(this.ptr);
}
b2WeldJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2WeldJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2WeldJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2WeldJointDef____destroy___p0(this.ptr);
}
b2WeldJointDef.prototype['set_referenceAngle'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_referenceAngle_p1(this.ptr, arg0);
}
b2WeldJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJointDef.prototype['get_referenceAngle'] = function() {
    return _emscripten_bind_b2WeldJointDef__get_referenceAngle_p0(this.ptr);
}
b2WeldJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2WeldJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2WeldJointDef.prototype['get_dampingRatio'] = function() {
    return _emscripten_bind_b2WeldJointDef__get_dampingRatio_p0(this.ptr);
}
b2WeldJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2WeldJointDef.prototype['set_frequencyHz'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_frequencyHz_p1(this.ptr, arg0);
}
b2WeldJointDef.prototype['Initialize'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2WeldJointDef__Initialize_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
}
b2WeldJointDef.prototype['set_dampingRatio'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_dampingRatio_p1(this.ptr, arg0);
}
function b2WeldJointDef() {
    this.ptr = _emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0();
  b2WeldJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2WeldJointDef;
}
b2WeldJointDef.prototype.__cache__ = {};
Module['b2WeldJointDef'] = b2WeldJointDef;
b2MouseJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2MouseJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2MouseJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2MouseJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2MouseJointDef.prototype['set_dampingRatio'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_dampingRatio_p1(this.ptr, arg0);
}
b2MouseJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2MouseJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
function b2MouseJointDef() {
    this.ptr = _emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0();
  b2MouseJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2MouseJointDef;
}
b2MouseJointDef.prototype.__cache__ = {};
Module['b2MouseJointDef'] = b2MouseJointDef;
b2MouseJointDef.prototype['get_maxForce'] = function() {
    return _emscripten_bind_b2MouseJointDef__get_maxForce_p0(this.ptr);
}
b2MouseJointDef.prototype['set_target'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_target_p1(this.ptr, arg0.ptr);
}
b2MouseJointDef.prototype['set_maxForce'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_maxForce_p1(this.ptr, arg0);
}
b2MouseJointDef.prototype['get_frequencyHz'] = function() {
    return _emscripten_bind_b2MouseJointDef__get_frequencyHz_p0(this.ptr);
}
b2MouseJointDef.prototype['get_target'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJointDef__get_target_p0(this.ptr), Module['b2Vec2']);
}
b2MouseJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2MouseJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2MouseJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2MouseJointDef____destroy___p0(this.ptr);
}
b2MouseJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2MouseJointDef.prototype['set_frequencyHz'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_frequencyHz_p1(this.ptr, arg0);
}
b2MouseJointDef.prototype['get_dampingRatio'] = function() {
    return _emscripten_bind_b2MouseJointDef__get_dampingRatio_p0(this.ptr);
}
b2DistanceJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2DistanceJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2DistanceJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2DistanceJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2DistanceJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2DistanceJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2DistanceJointDef.prototype['set_dampingRatio'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1(this.ptr, arg0);
}
b2DistanceJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2DistanceJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2DistanceJointDef.prototype['get_length'] = function() {
    return _emscripten_bind_b2DistanceJointDef__get_length_p0(this.ptr);
}
b2DistanceJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2DistanceJointDef.prototype['get_frequencyHz'] = function() {
    return _emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0(this.ptr);
}
b2DistanceJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2DistanceJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2DistanceJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2DistanceJointDef.prototype['get_dampingRatio'] = function() {
    return _emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0(this.ptr);
}
function b2DistanceJointDef() {
    this.ptr = _emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0();
  b2DistanceJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2DistanceJointDef;
}
b2DistanceJointDef.prototype.__cache__ = {};
Module['b2DistanceJointDef'] = b2DistanceJointDef;
b2DistanceJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2DistanceJointDef____destroy___p0(this.ptr);
}
b2DistanceJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2DistanceJointDef.prototype['set_length'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_length_p1(this.ptr, arg0);
}
b2DistanceJointDef.prototype['set_frequencyHz'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1(this.ptr, arg0);
}
b2DistanceJointDef.prototype['Initialize'] = function(arg0, arg1, arg2, arg3) {
    _emscripten_bind_b2DistanceJointDef__Initialize_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3.ptr);
}
b2GearJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2GearJointDef____destroy___p0(this.ptr);
}
b2GearJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2GearJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2GearJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2GearJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2GearJointDef.prototype['get_joint1'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJointDef__get_joint1_p0(this.ptr), Module['b2Joint']);
}
b2GearJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2GearJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2GearJointDef.prototype['set_joint2'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_joint2_p1(this.ptr, arg0.ptr);
}
b2GearJointDef.prototype['set_ratio'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_ratio_p1(this.ptr, arg0);
}
b2GearJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2GearJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2GearJointDef.prototype['get_joint2'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJointDef__get_joint2_p0(this.ptr), Module['b2Joint']);
}
b2GearJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_collideConnected_p1(this.ptr, arg0);
}
function b2GearJointDef() {
    this.ptr = _emscripten_bind_b2GearJointDef__b2GearJointDef_p0();
  b2GearJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2GearJointDef;
}
b2GearJointDef.prototype.__cache__ = {};
Module['b2GearJointDef'] = b2GearJointDef;
b2GearJointDef.prototype['get_ratio'] = function() {
    return _emscripten_bind_b2GearJointDef__get_ratio_p0(this.ptr);
}
b2GearJointDef.prototype['set_joint1'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_joint1_p1(this.ptr, arg0.ptr);
}
b2ContactEdge.prototype['__destroy__'] = function() {
    _emscripten_bind_b2ContactEdge____destroy___p0(this.ptr);
}
b2ContactEdge.prototype['set_contact'] = function(arg0) {
    _emscripten_bind_b2ContactEdge__set_contact_p1(this.ptr, arg0.ptr);
}
b2ContactEdge.prototype['get_prev'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactEdge__get_prev_p0(this.ptr), Module['b2ContactEdge']);
}
b2ContactEdge.prototype['get_other'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactEdge__get_other_p0(this.ptr), Module['b2Body']);
}
b2ContactEdge.prototype['set_prev'] = function(arg0) {
    _emscripten_bind_b2ContactEdge__set_prev_p1(this.ptr, arg0.ptr);
}
b2ContactEdge.prototype['get_next'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactEdge__get_next_p0(this.ptr), Module['b2ContactEdge']);
}
b2ContactEdge.prototype['set_other'] = function(arg0) {
    _emscripten_bind_b2ContactEdge__set_other_p1(this.ptr, arg0.ptr);
}
b2ContactEdge.prototype['set_next'] = function(arg0) {
    _emscripten_bind_b2ContactEdge__set_next_p1(this.ptr, arg0.ptr);
}
function b2ContactEdge() {
    this.ptr = _emscripten_bind_b2ContactEdge__b2ContactEdge_p0();
  b2ContactEdge.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2ContactEdge;
}
b2ContactEdge.prototype.__cache__ = {};
Module['b2ContactEdge'] = b2ContactEdge;
b2ContactEdge.prototype['get_contact'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactEdge__get_contact_p0(this.ptr), Module['b2Contact']);
}
b2RopeJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2RopeJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2RopeJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2RopeJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2RopeJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2RopeJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2RopeJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2RopeJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2RopeJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2RopeJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2RopeJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2RopeJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2RopeJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2RopeJointDef____destroy___p0(this.ptr);
}
b2RopeJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2RopeJointDef.prototype['get_maxLength'] = function() {
    return _emscripten_bind_b2RopeJointDef__get_maxLength_p0(this.ptr);
}
b2RopeJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2RopeJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2RopeJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2RopeJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2RopeJointDef__set_collideConnected_p1(this.ptr, arg0);
}
function b2RopeJointDef() {
    this.ptr = _emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0();
  b2RopeJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2RopeJointDef;
}
b2RopeJointDef.prototype.__cache__ = {};
Module['b2RopeJointDef'] = b2RopeJointDef;
b2RopeJointDef.prototype['set_maxLength'] = function(arg0) {
    _emscripten_bind_b2RopeJointDef__set_maxLength_p1(this.ptr, arg0);
}
this['Box2D'] = Module; // With or without a closure, the proper usage is Box2D.*
// Additional bindings that the bindings generator does not automatically generate (like enums)
Module['b2_staticBody']    = 0;
Module['b2_kinematicBody'] = 1;
Module['b2_dynamicBody']   = 2;
