var buffer
var nifti

// Functions to fill table
function fill_header_table(nifti) {

    // Resize window to fit nifti header data
    $("#bluetable").removeClass("col-md-6")
    $("#bluetable").addClass("col-md-3")
    $("#pappy").removeClass("col-md-6")
    $("#pappy").addClass("col-md-9")

    // Create new table with nifti-header
    nifti_table(nifti.header)

}


function processNifti(file) {

     var reader = new FileReader();

     reader.onloadend = function(evt) {
          if (evt.target.readyState == FileReader.DONE) { // DONE == 2
              // Set global variable buffer with content from file
              var buffer = evt.target.result; 

              if (zipfile){

                  finishedDecompress = function (data) {
                      buffer = data;
                      nifti = readFileData(buffer)
                      fill_header_table(nifti);
                      viewimage(file);
                 
                  };          
                  pako.inflate(new Uint8Array(buffer), null, null,
                      function (data) {finishedDecompress(data.buffer); });

               } else {
    
                  nifti = readFileData(buffer);
                  fill_header_table(nifti);
                  viewimage(file); 
               }         
            }
          
        };

     // Read in nifti file
     var blob = file.slice(0, file.size);
     reader.readAsArrayBuffer(blob)
 
};
