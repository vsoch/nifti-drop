var store;

// Function to fill the nidm table
function fill_nidm_table(columns,data) {


    // Resize to fit a larger table for nidm
    $("#bluetable").removeClass("col-md-3")
    $("#bluetable").addClass("col-md-6")
    $("#pappy").removeClass("col-md-9")
    $("#pappy").addClass("col-md-6") 
    $("table tr").remove()
    $("#papayaContainer0").css("padding-left","0px")     
    
    // Fill new nidm table
    nidm_table(columns,data)
}

// Function to navigate to coordinate in papaya viewer
function move_coordinate(x,y,z) {
    var coor = new papaya.core.Coordinate();
    papayaContainers[0].viewer.getIndexCoordinateAtWorld(parseFloat(x), parseFloat(y), parseFloat(z), coor);
    papayaContainers[0].viewer.gotoCoordinate(coor);
}

function processNidm(file) {

      readnidm = new FileReader()
      readnidm.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { 
          var buffer = evt.target.result; 
          store = new rdfstore.Store();
          
          // Read in main store data on first load, including clusters, peaks, statmaps
          store.load("text/turtle", buffer,
          function(success, results) {
              store.execute("PREFIX nidm: <http://purl.org/nidash/nidm#> \
                         PREFIX prov: <http://www.w3.org/ns/prov#> \
                         prefix peak: <http://purl.org/nidash/nidm#NIDM_0000062> \
                         prefix significant_cluster: <http://purl.org/nidash/nidm#NIDM_0000070> \
                         prefix coordinate: <http://purl.org/nidash/nidm#NIDM_0000086> \
                         prefix equivalent_zstatistic: <http://purl.org/nidash/nidm#NIDM_0000092> \
                         prefix pvalue_fwer: <http://purl.org/nidash/nidm#NIDM_0000115> \
                         prefix pvalue_uncorrected: <http://purl.org/nidash/nidm#NIDM_0000116> \
                         prefix statistic_map: <http://purl.org/nidash/nidm#NIDM_0000076> \
                         prefix statistic_type: <http://purl.org/nidash/nidm#NIDM_0000123> \
                         prefix coordinateVector: <http://purl.org/nidash/nidm#NIDM_0000086> \
                         SELECT DISTINCT ?cluster ?peak ?x ?equiv_z ?pval_fwer ?stat WHERE \
                         { ?peak a peak: . \
                           ?cluster a significant_cluster: . \
                           ?peak prov:wasDerivedFrom ?cluster .\
                           ?peak prov:atLocation ?coordinate . \
                           ?coordinate coordinateVector: ?x . \
                           ?peak equivalent_zstatistic: ?equiv_z .\
                           ?peak pvalue_fwer: ?pval_fwer .\
                           ?cluster prov:wasDerivedFrom/prov:wasGeneratedBy/prov:used ?statmap .\
                           ?statmap a statistic_map: .\
                           ?statmap statistic_type: ?stat .\
                         }\
                         ORDER BY ?cluster ?peak\
                         ",
                  function(success, results) {
                      columns = []
                      data = []
                      for(var i=0; i<results.length; i++) {
                          if (columns.length == 0){
                              for (var key in results[i]) {
                                  columns.push({id: key, name: key, field: key})
                              }
                          }
                          var datum = {}
                          for (var key in results[i]) {
                              datum[key] = results[i][key]["value"].replace('http://iri.nidash.org/', '').replace('http://www.incf.org/ns/nidash/nidm#', '')
                          }
                          data.push(datum)
                      }
                     
                      // add data to interface here
                      fill_nidm_table(columns,data);
                  }); // close success function

              // Second execute will get filenames to load into viewer!
              store.execute("PREFIX nidm: <http://purl.org/nidash/nidm#> \
                  PREFIX prov: <http://www.w3.org/ns/prov#> \
                  prefix nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#> \
                  SELECT ?filename ?location WHERE \
                  { ?file prov:atLocation ?location . \
                  ?file nfo:fileName ?filename . \
                  FILTER regex(?filename, \"TS*\")\
                  }",
                  function(success, results) {
                      var niifiles2load = []
                      
                      // This is not ideal for now, as it will not read in the header
                      console.log(results)
                      for(var i=0; i<results.length; i++) {
                          console.log(results[i]["location"])
                          console.log(results[i]["location"]["value"])
                          niifiles2load.push(results[i]["location"]["value"]);
                          var filename = results[i]["location"]["value"].replace(/^.*[\\\/]/, '')
                          params[filename] = {"parametric": true,  "lut":"OrRd", "negative_lut":"PuBu", "alpha":"0.75", "min":0};
                      }
                      viewimage(niifiles2load[0],"url")
                      
                  }); 

              }); // close store execute
          } // store success function

      }; // close nidmreader function
         
     // Read in turtle file
     readnidm.readAsBinaryString(file)

};
