//var $modal = $("#newFileModal");
var addNodeUrl = "/addNode";
var rmNodeUrl = "/rmNode";
var updateNodeUrl = "/updateNode";

function getMenuData($this, opt){
    $.contextMenu.getInputValues(opt, $this.data());
    var menuData = $this.data();
    return menuData;
}

$(function() {
        $.contextMenu({
            selector: '.node', 
            callback: function(key, options) {
                //var m = "clicked: " + key;
                //window.console && console.log(m) || alert(m);
                console.log($(this).attr("data-id"));
                console.log($(this).attr("data-nodeType"));
                console.log($(this).attr("data-extra"));
                var nodeId = $(this).attr("data-id");
                var nodeType = $(this).attr("data-nodeType");
                var extra = $(this).attr("data-extra");
                if(key == "confirm"){
                    var menuData = getMenuData(this, options);
                    var name = menuData["new"];
                    var url = addNodeUrl + "?projId=" + projId  + "&parentId="+ nodeId +"&name=" + name;
                    //if(parentId) url += "&parentId="+ parentId; 
                    //$newfModal.css("display", "flex").hide().fadeIn();
                    console.log(url);
                    dialogPop("Are you sure to Add a new Node '"+name+"'?", ()=>{
                        getData(url, (data)=>{init(data)});    
                    });
                }
                if(key == "edit"){
                    console.log($updateForm.find('input[name="nodeId"]')[0]);
                    clearForm($updateForm);
                    $updateForm.find('input[name="nodeId"]').val(nodeId);
                    $updateForm.find('input[name="projId"]').val(projId);
                    var url = listExtraUrl + "?projId=" + projId; 
                    getData(url, (data)=>{
                        updateExtraList(data);
                        presetForm($updateForm, {"type":nodeType, "extra":extra});
                        openModal($updateModal);
                    }, false);
                }
                if(key == "delete") {
                    //alertmsg("alert!");
                    var url = rmNodeUrl + "?projId=" + projId + "&nodeId=" + nodeId;
                    dialogPop("Are you sure to Delete Node with id '"+nodeId+"'?", ()=>{
                        getData(url, (data)=>{init(data)});
                    });
                }
            },
            items: {
                "add": {name: "Add", icon: "fa-plus", items:{
                    new:{type:"text", value:"node name"},
                    confirm: {name:"Confirm", icon:"fa-check"}
                }},
                "edit": {name: "Edit", icon: "edit"},
                "delete": {name: "Delete", icon: "delete"},
                "sep1": "---------",
                "quit": {name: "Quit", icon:"quit", callback: (a, b, c)=>{}},
            }
        });

        $('.context-menu-one').on('click', function(e){
            console.log('clicked', this);
        })    
    });