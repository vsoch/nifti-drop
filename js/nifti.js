var nifti;
var res = {};

res.error = null;
littleEndian = false;
res.dim_info = 0;
dims = [];
res.intent_p1 = 0;
res.intent_p2 = 0;
res.intent_p3 = 0;
res.intent_code = 0;
res.datatypeCode = 0;
res.numBitsPerVoxel = 0;
res.slice_start = 0;
res.slice_end = 0;
res.slice_code = 0;
pixDims = [];
res.vox_offset = 0;
res.scl_slope = 1;
res.scl_inter = 0;
res.xyzt_units = 0;
res.cal_max = 0;
res.cal_min = 0;
res.slice_duration = 0;
res.toffset = 0;
res.description = "";
res.aux_file = "";
res.intent_name = "";
res.qform_code = 0;
res.sform_code = 0;
res.quatern_b = 0;
res.quatern_c = 0;
res.quatern_d = 0;
res.qoffset_x = 0;
res.qoffset_y = 0;
res.qoffset_z = 0;
affine = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
res.magic = 0;

var nifti;

// Nifti Reading Functions
function parseNIfTIRawData(buffer, type, dim, options) {
  var i, arr, view, totalLen = 1, endianFlag = options.endianFlag, endianness = endianFlag ? 'little' : 'big'
  for(i=1; i<dim.length; i++) {
    totalLen *= dim[i]
  }
  if (type == 'block') {
    // Don't do anything special, just return the slice containing all blocks.
    return buffer.slice(0,totalLen*options.blockSize)
  } else if (type == 'int8' || type == 'uint8' || endianness == systemEndianness) {
        switch(type) {
        case "int8": checkSize(1); return new Int8Array(buffer.slice(0,totalLen))
        case "uint8": checkSize(1); return new Uint8Array(buffer.slice(0,totalLen))
        case "int16": checkSize(2); return new Int16Array(buffer.slice(0,totalLen*2))
        case "uint16": checkSize(2); return new Uint16Array(buffer.slice(0,totalLen*2))
        case "int32": checkSize(4); return new Int32Array(buffer.slice(0,totalLen*4))
        case "uint32": checkSize(4); return new Uint32Array(buffer.slice(0,totalLen*4))
        case "float": checkSize(4); return new Float32Array(buffer.slice(0,totalLen*4))
        case "double": checkSize(8); return new Float64Array(buffer.slice(0,totalLen*8))
        default:
            console.warn("Unsupported NIfTI type: " + type)
            return undefined
         }
    } else {
        view = new DataView(buffer)
        switch(type) {
            case "int8": arr = new Int8Array(totalLen)
                for(i=0; i<totalLen; i++) { arr[i] = view.getInt8(i) }
                return arr
            case "uint8": arr = new Uint8Array(totalLen)
                for(i=0; i<totalLen; i++) { arr[i] = view.getUint8(i) }
                return arr
            case "int16": arr = new Int16Array(totalLen)
                for(i=0; i<totalLen; i++) { arr[i] = view.getInt16(i*2) }
                return arr
            case "uint16": arr = new Uint16Array(totalLen)
                for(i=0; i<totalLen; i++) { arr[i] = view.getUint16(i*2) }
                return arr
            case "int32": arr = new Int32Array(totalLen)
                for(i=0; i<totalLen; i++) { arr[i] = view.getInt32(i*4)}
                return arr
            case "uint32": arr = new Uint32Array(totalLen)
                for(i=0; i<totalLen; i++) { arr[i] = view.getUint32(i*4) }
                return arr
            case "float": arr = new Float32Array(totalLen)
                for(i=0; i<totalLen; i++) { arr[i] = view.getFloat32(i*4)}
                return arr
            case "double": arr = new Float64Array(totalLen)
                for(i=0; i<totalLen; i++) { arr[i] = view.getFloat64(i*8)}
                return arr
            default:
                console.warn("Unsupported NRRD type: " + type)
                return undefined
            }
        }
  function checkSize(sizeOfType) {
    if (buffer.byteLength<totalLen*sizeOfType) throw new Error("NIfTI file does not contain enough data!")
  }
}

// Nifti DataType
function decodeNIfTIDataType(datatype) {
  switch(datatype) {
  case 1: return 'bit'
  case 2: return 'uint8'
  case 4: return 'int16'
  case 8: return 'int32'
  case 16: return 'float'
  case 32: return 'complex64'
  case 64: return 'double'
  case 128: return 'rgb24'
  case 256: return 'int8'
  case 512: return 'uint16'
  case 768: return 'uint32'
  case 1024: return 'int64'
  case 1280: return 'uint64'
  case 1536: return 'float128'
  case 1792: return 'complex128'
  case 2048: return 'complex256'
  case 2304: return 'rgba32'
  default:  console.warn("Unrecognized NIfTI data type: " + datatype)
  return datatype
  }
}

// Nifti Units
function decodeNIfTIUnits(units) {
  var space, time
  switch(units & 7) {
      case 0: space = ""; break
      case 1: space = "m"; break
      case 2: space = "mm"; break
      case 3: space = "um"; break
      default:
          console.warn("Unrecognized NIfTI unit: " + (units&7))
          space = ""
       }
  switch(units & 56) {
      case 0: time = ""; break
      case 8: time = "s"; break
      case 16: time = "ms"; break
      case 24: time = "us"; break
      case 32: time = "Hz"; break
      case 40: time = "ppm"; break
      case 48: time = "rad/s"; break
      default:
          console.warn("Unrecognized NIfTI unit: " + (units&56))
          time = ""
      }
  return (space === "" && time === "") ? undefined : [space, space, space, time]
}

getStringAt = function (data, start, end) {
    var str = "", ctr, ch;

    for (ctr = start; ctr < end; ctr += 1) {
        ch = data.getUint8(ctr);

        if (ch !== 0) {
            str += String.fromCharCode(ch);
        }
    }

    return str;
};



getByteAt = function (data, start) {
    return data.getInt8(start);
};



getShortAt = function (data, start, littleEndian) {
    return data.getInt16(start, littleEndian);
};



getIntAt = function (data, start, littleEndian) {
    return data.getInt32(start, littleEndian);
};


getFloatAt = function (data, start, littleEndian) {
    return data.getFloat32(start, littleEndian);
};


getQformMat = function () {
    return convertNiftiQFormToNiftiSForm(quatern_b, quatern_c, quatern_d, qoffset_x,
    qoffset_y, qoffset_z, pixDims[1], pixDims[2], pixDims[3], pixDims[0]);
};

convertNiftiQFormToNiftiSForm = function (qb, qc, qd, qx, qy, qz, dx, dy, dz,
                                                                              qfac) {
    var R = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        a,
        b = qb,
        c = qc,
        d = qd,
        xd,
        yd,
        zd;

    // last row is always [ 0 0 0 1 ]
    R[3][0] = R[3][1] = R[3][2] = 0.0;
    R[3][3] = 1.0;

    // compute a parameter from b,c,d
    a = 1.0 - (b * b + c * c + d * d);
    if (a < 0.0000001) {                   /* special case */

        a = 1.0 / Math.sqrt(b * b + c * c + d * d);
        b *= a;
        c *= a;
        d *= a;        /* normalize (b,c,d) vector */
        a = 0.0;                        /* a = 0 ==> 180 degree rotation */
    } else {

        a = Math.sqrt(a);                     /* angle = 2*arccos(a) */
    }

    // load rotation matrix, including scaling factors for voxel sizes
    xd = (dx > 0.0) ? dx : 1.0;       /* make sure are positive */
    yd = (dy > 0.0) ? dy : 1.0;
    zd = (dz > 0.0) ? dz : 1.0;

    if (qfac < 0.0) {
        zd = -zd;         /* left handedness? */
    }

    R[0][0] =       (a * a + b * b - c * c - d * d) * xd;
    R[0][1] = 2.0 * (b * c - a * d) * yd;
    R[0][2] = 2.0 * (b * d + a * c) * zd;
    R[1][0] = 2.0 * (b * c + a * d) * xd;
    R[1][1] =       (a * a + c * c - b * b - d * d) * yd;
    R[1][2] = 2.0 * (c * d - a * b) * zd;
    R[2][0] = 2.0 * (b * d - a * c) * xd;
    R[2][1] = 2.0 * (c * d + a * b) * yd;
    R[2][2] =       (a * a + d * d - c * c - b * b) * zd;

    // load offsets
    R[0][3] = qx;
    R[1][3] = qy;
    R[2][3] = qz;

    return R;
};

readFileData = function (data) {

    res = {}

    var rawData = new DataView(data),
        magicCookieVal = getIntAt(rawData, 0, littleEndian),
        ctr,
        ctrOut,
        ctrIn,
        index;

    if (magicCookieVal !== 348) {  // try as little endian
    littleEndian = true;
        magicCookieVal = getIntAt(rawData, 0, littleEndian);
    }

    if (magicCookieVal !== 348) {
    error = new Error("This does not appear to be a NIFTI file!");
        return;
    }

res.dim_info = getByteAt(rawData, 39);

    for (ctr = 0; ctr < 8; ctr += 1) {
        index = 40 + (ctr * 2);
        dims[ctr] = getShortAt(rawData, index, littleEndian);
    }

res.intent_p1 = getFloatAt(rawData, 56, littleEndian);
res.intent_p2 = getFloatAt(rawData, 60, littleEndian);
res.intent_p3 = getFloatAt(rawData, 64, littleEndian);
res.intent_code = getShortAt(rawData, 68, littleEndian);

res.datatypeCode = getShortAt(rawData, 70, littleEndian);
res.numBitsPerVoxel = getShortAt(rawData, 72, littleEndian);

res.slice_start = getShortAt(rawData, 74, littleEndian);

    for (ctr = 0; ctr < 8; ctr += 1) {
        index = 76 + (ctr * 4);
        pixDims[ctr] = getFloatAt(rawData, index, littleEndian);
    }

res.vox_offset = getFloatAt(rawData, 108, littleEndian);

res.scl_slope = getFloatAt(rawData, 112, littleEndian);
res.scl_inter = getFloatAt(rawData, 116, littleEndian);

res.slice_end = getShortAt(rawData, 120, littleEndian);
res.slice_code = getByteAt(rawData, 122);

res.xyzt_units = getByteAt(rawData, 123);

res.cal_max = getFloatAt(rawData, 124, littleEndian);
res.cal_min = getFloatAt(rawData, 128, littleEndian);

res.slice_duration = getFloatAt(rawData, 132, littleEndian);
res.toffset = getFloatAt(rawData, 136, littleEndian);

res.description = getStringAt(rawData, 148, 228);

res.qform_code = getShortAt(rawData, 252, littleEndian);
res.sform_code = getShortAt(rawData, 254, littleEndian);

res.quatern_b = getFloatAt(rawData, 256, littleEndian);
res.quatern_c = getFloatAt(rawData, 260, littleEndian);
res.quatern_d = getFloatAt(rawData, 264, littleEndian);
res.qoffset_x = getFloatAt(rawData, 268, littleEndian);
res.qoffset_y = getFloatAt(rawData, 272, littleEndian);
res.qoffset_z = getFloatAt(rawData, 276, littleEndian);

    for (ctrOut = 0; ctrOut < 3; ctrOut += 1) {
        for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
            index = 280 + (((ctrOut * 4) + ctrIn) * 4);
            affine[ctrOut][ctrIn] = getFloatAt(rawData, index, littleEndian);
        }
    }

    affine[3][0] = 0;
    affine[3][1] = 0;
    affine[3][2] = 0;
    affine[3][3] = 1;

res.intent_name = getStringAt(rawData, 328, 344);
res.magic = getStringAt(rawData, 344, 348);
res.affine = affine;
res.pixdims = pixDims;
res.dims = dims;

var type = decodeNIfTIDataType(res.datatypeCode)

nifti = {}
data_region = data.slice(Math.floor(res.vox_offset))
nifti.data = parseNIfTIRawData(data_region, type, dims, {endianFlag: littleEndian});
nifti.header = res;

return nifti;
};
