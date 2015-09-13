
var file;
var header;

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    file = files[0]
    for (var i = 0, f; f = files[i]; i++) {
      output.push('<li><strong>', escape(f.name), '</strong> - ',
                  f.size, ' bytes, last modified: ',
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

      var reader = new FileReader();

      // Do we have a zipped file?
      zipfile = false;
      var fileparts = file.name.split(".");
      if (fileparts[fileparts.length-2] + "." + fileparts[fileparts.length-1] == "nii.gz") {
          zipfile = true;          
      }

      // Here is the function that fires when the file is read
      // If we use onloadend, we need to check the readyState.
      reader.onloadend = function(evt) {
          if (evt.target.readyState == FileReader.DONE) { // DONE == 2
              // Set global variable buffer with content from file
              var buffer = evt.target.result; 
              nifti = readNifti(buffer);

              // Here is our nifti!
              console.log(nifti);

             // Set data values in table
             var table = document.getElementById("fresh-table");
 
             for (var key in nifti.header) {
                 if (nifti.header.hasOwnProperty(key)) {
                     var value = nifti.header[key];
                     var row = table.insertRow(0);
                     var cell1 = row.insertCell(0);
                     var cell2 = row.insertCell(1);
                     var cell3 = row.insertCell(2);
                     cell1.innerHTML = key;
                     cell2.innerHTML = value
                 }
             }
          }
      };

     // Read in file
     var blob = file.slice(0, file.size);

     if (zipfile){
         throw new Error("Compressed nifti are not yet supported!")
     }    
     reader.readAsArrayBuffer(blob);
  }
