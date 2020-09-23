/*var vars = getUrlVars();
var $content = $("#content");
var doc_str = ""

//extract file name
function extract_filename(str){
  var arr = str.split("/");
  return arr[arr.length - 1];
}*/
var doc_str = theData["content"];
var name = theData["name"];
//var $content = $("#content");
var $container = $("#container");
//var $deckContainer_template = $("#deckContainer").clone();
//$("#deckContainer").remove();
var $deckContainer = $("#deckContainer");
var $deckContent = $("#deckContent");

$(function(){
	document.title = name;
	$deckContent.replaceWith(doc_str);
	$.deck(".slide");
});

