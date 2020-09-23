var $content = $("#content");

var $confModal = $("#confModal");
var $newpModal = $("#newpModal");
var $newfModal = $("#newfModal");
var $loginModal = $("loginModal");

var $newpForm = $("#newpForm");
var $newfForm = $("#newfForm");
var $loginForm = $("#loginForm");

var $newProjBtn = $("#newProjBtn");
var $deleteProjBtn = $("#deleteProjBtn");

var $navBtn = $("#navBtn");
//var ori_width = $content.width();
var nav_on = false;
var nav_width = 250;

// Nav
var $navItems = $("#navItems"); 

$(function(){
	addNavItems(projs);
});

function addNavItems(projs){
    $navItems.children().remove();
    projs.forEach(function(proj){
        $navItems.append('<a class="navItem" href="#" data-id="'+proj.id+'">'+proj.name+'</a>');
    }); 
}

var indexUrl = "/index?projId=";

$("body").on("click", ".navItem", function(){
    var url = indexUrl + $(this).attr("data-id");
    openURL(url);
});

var newProjUrl = "/newProj?name=";
var deleteProjUrl = "/deleteProj?projId=";
var $newProjInput = $("#newProjInput");

$newProjBtn.click(function(){
    if($newProjInput.val()=="")
        dialogPop("Please Put in New Proj Name!");
    else{
        var name = $newProjInput.val();
        dialogPop("Are you sure to create new Proj '" +name+"'?",()=>{
            var url = newProjUrl + name;
            getData(url, (data)=>{addNavItems(data);$newProjInput.val("");})
        });
    }
});

$deleteProjBtn.click(function(){
    dialogPop("Are you sure to delete Proj with id '"+projId+"'?", ()=>{
        var url = deleteProjUrl + projId;
        getData(url, (data)=>{addNavItems(data);})
    });
});


$(".openNav").click(function(){
	if(nav_on)
		return;
	$("#mySidenav").css("width", nav_width);
	$content.css("width", $content.width()-nav_width);
	$navBtn.css("display", "none"); 
	nav_on = true;
});

$(".closeNav").click(function(){
	if(!nav_on)
		return;
	$content.css("width", $content.width($(window).width()));
	$("#mySidenav").css("width", "0");
	$navBtn.css("display", ""); 
	nav_on = false;
});

$(window).on("resize", function(){
	var fullwidth = $("body")[0].offsetWidth;
	if(nav_on)
		$content.css("width", fullwidth-nav_width);
	else
		$content.css("width", fullwidth);
});


// Extra modal
var extraFilesList = [];

var $extraBtn = $("#extraBtn");
var $extraModal = $("#extraModal");
var $extraConf = $("#extraConf");
var $extraForm = $("#extraForm");
var editExtraUrl = "/editExtra";
var listExtraUrl = "/listExtra";

function updateExtraList(data){
    $("body").find("select.extraList").children().remove();
    $("body").find("select.extraList").append('<option value=""></option>');
    data.forEach((filename)=>{
        $("body").find("select.extraList").append($('<option value="'+filename+'">').html(filename));
    });   
}

function clearForm($form){
    $form.find("input").val("");
    $form.find("select").val("");
    $form.find(".disable").prop("disabled", "disabled");
}

function presetForm($form, data){
    $.each(data, (key, data)=>{
        $form.find('input[name="'+key+'"]').val(data);
         $form.find('select[name="'+key+'"]').val(data);
    });
    typeOnChange();
}

$extraBtn.click(function(){
    clearForm($extraForm);
    $extraForm.find('input[name="projId"]').val(projId);
    //$extraForm.attr("action", extraUrl);
    var url = listExtraUrl + "?projId=" + projId; 
    getData(url, (data)=>{
        updateExtraList(data);
        openModal($extraModal);
    }, false);
});

$extraConf.click(function(){
    dialogPop("Are you sure to make those changes to extra files?", ()=>{
        //$extraForm.submit();
        postFileData(editExtraUrl, new FormData($extraForm[0]), (data)=>{
            console.log(data);
            extraFilesList = data;
        });  
    });
});


// Update Modal
var $updateModal = $("#updateModal");
var $updateConf = $("#updateConf");
var $updateForm = $("#updateForm");
var $typeSelect = $('#typeSelect');
var updateUrl = "/updateNode";

$typeSelect.change(function(){
    typeOnChange();
});

function typeOnChange(){
    if($typeSelect.val()=="extra"){
        $updateForm.find('select[name="extra"]').prop("disabled", false);
    }else{
        $updateForm.find('select[name="extra"]').prop("disabled", "disabled").val("");
    }
}


$updateConf.click(function(){
    var data = $updateForm.serialize();
    console.log(data);
    var url = updateUrl + "?" + data;
    getData(url, (data)=>{init(data)});
});
