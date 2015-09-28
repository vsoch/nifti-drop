// Create tables dynamically for either nifti or nidm results

function nifti_table(header) {
           
    header = typeof header !== 'undefined' ? header : "EMPTY";

    var tablehtml = '<div class="fresh-table full-color-blue"><output id="list"></output><div class="toolbar"><button id="export" class="btn btn-default">Export SVG</button></div><table id="fresh-table" class="table"><thead><th data-field="name" data-sortable="true">Name</th><th data-field="value" data-sortable="true">Value</th><th data-field="actions" data-formatter="operateFormatter" data-events="operateEvents"></th></thead><tbody>'

    // Add the rows to the table
    if (header != "EMPTY"){
        for (var key in header) {
            if (header.hasOwnProperty(key)) {
                var value = header[key];
                    if (key == "srow"){
                        value =  Array.prototype.slice.call(value);
                        value = value.toString();
                     }
                     tablehtml = tablehtml + '<tr style="background-color:none"><td>' + key +'</td><td>' + value + '</td><td></td></tr>'
             }
        }
    } else {
        tablehtml = tablehtml + '<tr style="background-color:none"><td></td><td></td><td></td></tr>'
    }

    tablehtml = tablehtml + '</tbody></table></div>'

    $("#tablerow").empty()
    $("#tablerow").append($(tablehtml))

    var $table = $('#fresh-table'),
    $exportBtn = $('#export'), 
    full_screen = false,
    window_height;
 
    window_height = $(window).height();
    table_height = window_height - 20;
                   
    $table.bootstrapTable({
        toolbar: ".toolbar",
        showRefresh: false,
        search: true,
        showToggle: false,
        showColumns: false,
        pagination: true,
        striped: true,
        sortable: true,
        height: table_height,
        pageSize: 25,
        pageList: [25,50,100],
                
        formatShowingRows: function(pageFrom, pageTo, totalRows){
             //do nothing here, we don't want to show the text "showing x of y from..." 
        },
        formatRecordsPerPage: function(pageNumber){
            return pageNumber + " rows visible";
        },
        icons: {
            refresh: 'fa fa-refresh',
            toggle: 'fa fa-th-list',
            columns: 'fa fa-columns',
            detailOpen: 'fa fa-plus-circle',
            detailClose: 'fa fa-minus-circle'
         }
    });
            
    window.operateEvents = {
        //'click .like': function (e, value, row, index) {
        //    alert('You click like icon, row: ' + JSON.stringify(row));
        //    console.log(value, row, index);
        //},
        //'click .edit': function (e, value, row, index) {
        //    alert('You click edit icon, row: ' + JSON.stringify(row));
        //    console.log(value, row, index);    
        //},
        'click .remove': function (e, value, row, index) {
        $table.bootstrapTable('remove', {
            field: 'id',
            values: [row.id]
            });   
           }
        };
            
        $exportBtn.attr("onclick","export_svg()")
            
        $(window).resize(function () {
           $table.bootstrapTable('resetView');
        });    
 
}

function nidm_table(columns,data) {
           
    var tablehtml = '<div class="fresh-table full-color-blue"><output id="list"></output><div class="toolbar"><button id="export" class="btn btn-default">Export SVG</button></div><table id="fresh-table" class="table"><thead><th data-field="cluster" data-sortable="true">Cluster</th><th data-field="x" data-sortable="true">X</th><th data-field="y" data-sortable="true">Y</th><th data-field="z" data-sortable="true">Z</th><th data-field="equiv_z" data-sortable="true">Equiv_Z</th><th data-field="pval_fwer" data-sortable="true">pval_fwer</th><th data-field="actions"></th></thead><tbody>'


    // Now add data to the table!
    for(var i=0; i<data.length; i++) {
        result = data[i]              
        var coords = result["x"].replace("[","").replace("]","").split(",")
        tablehtml = tablehtml + '<tr style="background-color:none"><td>' +
                                result["cluster"] +'</td><td>' + 
                                parseFloat(coords[0]) +'</td><td>' + 
                                parseFloat(coords[1]) +'</td><td>' + 
                                parseFloat(coords[2]) +'</td><td>' + 
                                parseFloat(result["equiv_z"]).toFixed(3) + '</td><td>' + 
                                parseFloat(result["pval_fwer"]).toFixed(3) + '</td>' + 
                                '<td><button class="btn btn-default circle" style="padding:2px" onclick=move_coordinate(' + 
                                parseFloat(coords[0]) + ',' + parseFloat(coords[1]) + ',' +
                                parseFloat(coords[2]) + ')><i class="fb icon-crosshair"></i></button></td></tr>'
    }  

    tablehtml = tablehtml + '</tbody></table></div>'

    $("#tablerow").empty()
    $("#tablerow").append($(tablehtml))

    var $table = $('#fresh-table'),
    $exportBtn = $('#export'), 
    full_screen = false,
    window_height;
 
    window_height = $(window).height();
    table_height = window_height - 20;
                   
    $table.bootstrapTable({
        toolbar: ".toolbar",
        showRefresh: false,
        search: true,
        showToggle: false,
        showColumns: false,
        pagination: true,
        striped: true,
        sortable: true,
        height: table_height,
        pageSize: 25,
        pageList: [25,50,100],
                
        formatShowingRows: function(pageFrom, pageTo, totalRows){
             //do nothing here, we don't want to show the text "showing x of y from..." 
        },
        formatRecordsPerPage: function(pageNumber){
            return pageNumber + " rows visible";
        },
        icons: {
            refresh: 'fa fa-refresh',
            toggle: 'fa fa-th-list',
            columns: 'fa fa-columns',
            detailOpen: 'fa fa-plus-circle',
            detailClose: 'fa fa-minus-circle'
         }
    });
            
    window.operateEvents = {
        //'click .like': function (e, value, row, index) {
        //    alert('You click like icon, row: ' + JSON.stringify(row));
        //    console.log(value, row, index);
        //},
        //'click .edit': function (e, value, row, index) {
        //    alert('You click edit icon, row: ' + JSON.stringify(row));
        //    console.log(value, row, index);    
        //},
        'click .remove': function (e, value, row, index) {
        $table.bootstrapTable('remove', {
            field: 'id',
            values: [row.id]
            });   
           }
        };
            
        $exportBtn.attr("onclick","export_svg()")
            
        $(window).resize(function () {
           $table.bootstrapTable('resetView');
        });    
 
}
