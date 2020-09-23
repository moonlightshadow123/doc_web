var $editBtn = $("#editBtn");
var $editModal = $("#editModal");
var $editForm = $("#editForm");


var $confirmBtn = $("#confirmBtn");

$msgContainer.css("width", $msgContainer.width()-60);

// Code mirror!
var codemirror = CodeMirror.fromTextArea($("#codemirror")[0],{
                mode:"xml", 
                lineWrapping:true,
                lineNumbers:true,
                theme: "monokai"
        });
codemirror.setSize("100%","100%");

function setCMValue(value){
	codemirror.getDoc().setValue(value);
	setTimeout(function() {codemirror.refresh();},1);
}

function getCMValue(){
	return codemirror.getValue();
}

$editBtn.click(function(){
	openModal($editModal);
	setCMValue(doc_str);
});

var updateContentUrl = "/updateContent";
$confirmBtn.click(function(){
	var new_content = getCMValue();
	var post_data = {content:getCMValue(), nodeId:theData["nodeId"]};
	postData(updateContentUrl, post_data, (data)=>{
		console.log(data);
		setTimeout(()=>{location.reload()}, 2000);
	});
});


