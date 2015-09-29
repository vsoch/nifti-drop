var cx;
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
    }
    if (fileparts[fileparts.length-1] == "ttl") {
        nidm = true
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


// Rendering function

function export_svg() {

    $("#canvas-svg").remove()
    var cx = $($("canvas")[0]).get(0).getContext("2d");
    var image = cx.canvas.toDataURL("image/png");
    var svgimg = document.createElementNS("http://www.w3.org/2000/svg", "image");
    svgimg.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', image);
    CanvasToSVG.convert(cx.canvas, svgimg);
    document.getElementById('export').href = svgimg.firstChild.imageData;
    $("#svgexport").append($("<img src='" + svgimg.firstChild.imageData+ "' alt='file.svg' id='canvas-svg'>"));
    $('#exportmodal').modal('toggle');
    $('.modal-backdrop').remove();

}

// Get variables from the URL
     function getUrlVars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
           vars[key] = value;
        });
        return vars;
     }

     //Get json name from the browser url
     var file = getUrlVars()

     if (typeof file["file"] == 'undefined'){ file = "none";}
     else { file = file["file"].replace("/",""); }

     // If a file is specified, read it!
     if (file != "none") {

        $("#url").attr("value",file)
        $("#urlbutton").click()

}
