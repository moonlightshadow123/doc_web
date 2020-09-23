var $editBtn = $("#editBtn");
var $editModal = $("#editModal");
var $editForm = $("#editForm");

var $confirmBtn = $("#confirmBtn");

// Code mirror!
var codemirror = CodeMirror.fromTextArea($("#codemirror")[0],{
                mode:"markdown", 
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

// Msg and Modal

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
/*
$(".closeModal").click(function(){
	$(this).closest(".modal").fadeOut();
});

function openModal($modal){
	$modal.css("display", "flex").hide().fadeIn();
}

$("body").on("click", ".closeMsg", function(){
	$(this).closest(".msgbox").slideUp();
});


function infomsg(msg){
	openmsg(msg, "msginfo");
}

function alertmsg(msg){
	openmsg(msg, "msgalert");
}

function openmsg(msg, classname){
	$ele = $msg_temp.clone();
	$msgContainer.prepend($ele);
	$ele.addClass(classname).find(".msg").html(msg);
	//console.log($ele.width());
	$ele.slideDown();
	$ele.css("width", $ele.width()-60);
	//if(nav_on)
	//	$ele.css("width", $ele.width()-nav_width);
}

$confirmBtn.click(function(){
	infomsg("Confirmed!");
});

$cancelBtn.click(function(){
	alertmsg("Canceled!");
});*/

