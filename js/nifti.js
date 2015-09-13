// Nifti Parsing: @scijs https://github.com/scijs/nifti-js

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

// Read NiftiFile  
function readNifti(buffer) {

      var header = {};
     
      if (buffer.byteLength<348) {
        throw new Error("The buffer is not even large enough to contain the minimal header I would expect from a NIfTI file!")
      }
      var buf8 = new Uint8Array(buffer)
      var view = new DataView(buffer)

      // What is the byte order?
      var littleEndian = true
      var dim = new Array(8)
      dim[0] = view.getInt16(40, littleEndian)
      if (1>dim[0] || dim[0]>7) {
          littleEndian = !littleEndian
          dim[0] = view.getInt16(40, littleEndian)
      }
      if (1>dim[0] || dim[0]>7) {
          // Even if there were other /byte/ orders, we wouldn't be able to detect them using a short (16 bits, so only two bytes).
          console.warn("dim[0] is out-of-range, we'll simply try continuing to read the file, but this will most likely fail horribly.")
      }
      header.dim0 = dim[0]  

      // Get size of header (should be 348)
      var sizeof_hdr = view.getInt32(0, littleEndian)
      if (sizeof_hdr !== 348 && (1>dim[0] || dim[0]>7)) {
          // Try to recover from weird dim info
          littleEndian = !littleEndian
          dim[0] = view.getInt16(40, littleEndian)
          sizeof_hdr = view.getInt32(0, littleEndian)
      if (sizeof_hdr !== 348) {
          throw new Error("I'm sorry, but I really cannot determine the byte order of the (NIfTI) file at all.")
       }
       } else if (sizeof_hdr < 348) {
          throw new Error("Header of file is smaller than expected, I cannot deal with this.")
       } else if (sizeof_hdr !== 348) {
          console.warn("Size of NIfTI header different from what I expect, but I'll try to do my best anyway (might cause trouble).")
       }
       var magic = String.fromCharCode.apply(null, buf8.subarray(344, 348))
       if (magic !== "ni1\0" && magic !== "n+1\0") {
           throw new Error("Sorry, but this does not appear to be a NIfTI-1 file. Maybe Analyze 7.5 format? or NIfTI-2?")
       }
       header.sizeof_hdr = sizeof_hdr;
       header.magic = magic  

       // Continue reading actual header fields
       var dim_info = view.getInt8(39)
       dim.length = 1+Math.min(7, dim[0])
       for(var i=1; i<dim.length; i++) {
           dim[i] = view.getInt16(40+2*i, littleEndian)
           if (dim[i]<=0) {
               console.warn("dim[0] was probably wrong or corrupt")
               dim.length = i
           }
        }
        if (dim.length === 1) throw new Error("No valid dimensions!")
        header.dim_info = dim_info
        header.dim = dim  

       // NIFTI HEADER
       header.intent_p1 = view.getFloat32(56, littleEndian)
       header.intent_p2 = view.getFloat32(56, littleEndian)
       header.intent_p3 = view.getFloat32(56, littleEndian)
       header.intent_code = view.getInt16(68, littleEndian)
       header.datatype = decodeNIfTIDataType(view.getInt16(70, littleEndian))
       header.bitpix = view.getInt16(72, littleEndian)
       header.slice_start = view.getInt16(74, littleEndian)  
       header.pixdim = new Array(dim.length)
       for(var i=0; i<header.pixdim.length; i++) {
           header.pixdim[i] = view.getFloat32(76+4*i, littleEndian)
       } 
       header.vox_offset = view.getFloat32(108, littleEndian)
       header.scl_slope = view.getFloat32(112, littleEndian)
       header.scl_inter = view.getFloat32(116, littleEndian)
       header.slice_end = view.getInt16(120, littleEndian)
       header.slice_code = view.getInt8(122)
       header.xyzt_units = decodeNIfTIUnits(view.getInt8(123))
       header.cal_max = view.getFloat32(124, littleEndian)
       header.cal_min = view.getFloat32(128, littleEndian)
       header.slice_duration = view.getFloat32(132, littleEndian)
       header.toffset = view.getFloat32(136, littleEndian)
       header.descrip = String.fromCharCode.apply(null, buf8.subarray(148, 228))
       header.aux_file = String.fromCharCode.apply(null, buf8.subarray(228, 252))
       header.qform_code = view.getInt16(252, littleEndian)
       header.sform_code = view.getInt16(254, littleEndian)
       header.quatern_b = view.getFloat32(256, littleEndian)
       header.quatern_c = view.getFloat32(260, littleEndian)
       header.quatern_d = view.getFloat32(264, littleEndian)
       header.qoffset_x = view.getFloat32(268, littleEndian)
       header.qoffset_y = view.getFloat32(272, littleEndian)
       header.qoffset_z = view.getFloat32(276, littleEndian)
       header.srow = new Float32Array(12)
       for(var i=0; i<12; i++) {
          header.srow[i] = view.getFloat32(280+4*i, littleEndian)
        }
       header.intent_name = String.fromCharCode.apply(null, buf8.subarray(328, 344))  
       header.extension = view.getInt32(348, littleEndian) 
       if (header.extension !== 0) {
           console.warn("Looks like there are extensions in use in this NIfTI file, which will all be ignored!")
       }
   
       // Notes from scijs:
       // Check bitpix
       // "Normalize" datatype (so that rgb/complex become several normal floats rather than compound types, possibly also do something about bits)
      // Note that there is actually both an rgb datatype and an rgb intent... (My guess is that the datatype corresponds to sizes = [3,dim[0],...], while the intent might correspond to sizes = [dim[0],...,dim[5]=3].)
      // Convert to NRRD-compatible structure
      var ret = {}
      ret.dimension = dim[0]
      ret.type = header.datatype // Do we feed anything incompatible?
      ret.encoding = 'raw'
      ret.endian = littleEndian ? 'little' : 'big'
      ret.sizes = header.dim.slice(1) // Note that both NRRD and NIfTI use the convention that the fastest axis comes first!

      if (header.xyzt_units !== undefined) {
          ret.spaceUnits = header.xyzt_units
          while(ret.spaceUnits.length < ret.dimension) { // Pad if necessary
              ret.spaceUnits.push("")
           }
           ret.spaceUnits.length = ret.dimension // Shrink if necessary
      }
  
      if (header.qform_code === 0) { // "method 1"
          ret.spacings = pixdim.slice(1)
          while(ret.spacings.length < ret.dimension) {
              ret.spacings.push(NaN)
          }
          // For now assume 3D space
          ret.spaceDimension = Math.min(ret.dimension, 3) 
      } else if (header.qform_code > 0) { // "method 2"
        // What to do with the different qform codes?
        ret.space = "right-anterior-superior" 
        var pixdim = header.pixdim;
        var qfac = pixdim[0] === 0.0 ? 1 : pixdim[0]
        var a = Math.sqrt(Math.max(0.0,1.0-(header.quatern_b*header.quatern_b+header.quatern_c*header.quatern_c+header.quatern_d*header.quatern_d)))
        var b = header.quatern_b
        var c = header.quatern_c
        var d = header.quatern_d
        ret.spaceDirections = [
            [pixdim[1]*(a*a+b*b-c*c-d*d),pixdim[1]*(2*b*c+2*a*d),pixdim[1]*(2*b*d-2*a*c)],
            [pixdim[2]*(2*b*c-2*a*d),pixdim[2]*(a*a+c*c-b*b-d*d),pixdim[2]*(2*c*d+2*a*b)],
            [qfac*pixdim[3]*(2*b*d+2*a*c),qfac*pixdim[3]*(2*c*d-2*a*b),qfac*pixdim[3]*(a*a+d*d-c*c-b*b)]]
            ret.spaceOrigin = [header.qoffset_x,header.qoffset_y,header.qoffset_z]
        } else {
            console.warn("Invalid qform_code: " + header.qform_code + ", orientation is probably messed up.")
        }

        if (header.sform_code > 0) {
            console.warn("sform transformation are currently ignored.")
        }

       // Read data if it is here
       if (header.magic === "n+1\0") {
           if (header.vox_offset<352 || header.vox_offset>buffer.byteLength) {
               throw new Error("Illegal vox_offset!")
           }
           ret.buffer = buffer.slice(Math.floor(header.vox_offset))
           if (header.datatype !== 0) {
               ret.data = parseNIfTIRawData(ret.buffer, header.datatype, dim, {endianFlag: littleEndian})
           }
  
      }
      nifti = {}
      nifti.data = ret;
      nifti.header = header;
      return nifti;
}
