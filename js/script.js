
var file;
var nifti;

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    file = files[0];
    for (var i = 0, f; f = files[i]; i++) {
      output.push('<li><strong>', escape(f.name), '</strong> - ',
                  f.size, ' bytes, modified: ',
                  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                  '</li>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
    nifti = readBlob(file)

  }

  function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }


  // Setup the dnd listeners.
  var dropZone = document.getElementById('drop_zone');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileSelect, false);

  // Determine system endianness!
  var systemEndianness = (function() {
      var buf = new ArrayBuffer(4),
      intArr = new Uint32Array(buf),
      byteArr = new Uint8Array(buf)
      intArr[0] = 0x01020304
      if (byteArr[0]==1 && byteArr[1]==2 && byteArr[2]==3 && byteArr[3]==4) {y
          return 'big'
      } else if (byteArr[0]==4 && byteArr[1]==3 && byteArr[2]==2 && byteArr[3]==1) {
          return 'little'
      }
      console.warn("Unrecognized system endianness!")
      return undefined
  })()

  // Function to read FILE BLOB.
  function readBlob(file) {

      // Do we have a zipped file?
      zipfile = false;
      nidm = false
      var fileparts = file.name.split(".");
      if (fileparts[fileparts.length-2] + "." + fileparts[fileparts.length-1] == "nii.gz") {
          zipfile = true;          
          console.log("Found compressed nifti!");
      }
      if (fileparts[fileparts.length-1] == "ttl") {
          nidm = true
          console.log("Found nidm file!");

      }

      // Here are functions to fire depending on the file being read
      // If we use onloadend, we need to check the readyState.
    
      if (nidm) {
  
          console.log("Found nidm file!")
          processNidm(file);
  
      } else {

          console.log("Found nifti file!")
          processNifti(file);    

      }

   };
