
var file;
var nifti;

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    file = files[0]
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

  // Function to fill table
  function fill_header_table(nifti) {

             // Set data values in table
             var table = document.getElementById("fresh-table");
 
             for (var key in nifti.header) {
                 if (nifti.header.hasOwnProperty(key)) {
                     var value = nifti.header[key];
                     if (key == "srow"){
                         value =  Array.prototype.slice.call(value);
                         value = value.toString();
                     }
                     var row = table.insertRow(0);
                     var cell1 = row.insertCell(0);
                     var cell2 = row.insertCell(1);
                     var cell3 = row.insertCell(2);
                     cell1.innerHTML = key;
                     cell2.innerHTML = value;
                 }
             }

  }

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

              if (zipfile){

                  finishedDecompress = function (data) {
                      buffer = data;
                      nifti = readFileData(buffer)
                      console.log(nifti);
                      fill_header_table(nifti);
                      $("#histogram_svg").remove()
                      make_histogram(nifti.data,"#histy")

                  };          
                  pako.inflate(new Uint8Array(buffer), null, null,
                      function (data) {finishedDecompress(data.buffer); });

               } else {
    
                  nifti = readFileData(buffer);
                  console.log(nifti);
                  fill_header_table(nifti);
                  $("#histogram_svg").remove()
                  make_histogram(nifti.data,"#histy")

               }
            
          }
      };

     // Read in file
     var blob = file.slice(0, file.size);

     reader.readAsArrayBuffer(blob);
  }
