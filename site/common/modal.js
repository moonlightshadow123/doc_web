// MSG
var $msgContainer = $("#msgContainer");
var $msg_temp = $(".msgbox").clone();
$(".msgbox").remove();

// POP
/*var $confirmBtn = $("#confirmBtn");
var $cancelBtn = $("#cancelBtn");*/
var $dialogModal = $("#dialogModal");
var $dialogConfirm = $("#dialogConfirm"); 
var $dialogCancel = $(".dialogCancel");

///////////////////////// Ajax
function getData(url, cbk, dismsg=true){
    $.ajax({
        url: url,
        success: function(data)
        {
            console.log(data);
            if(data["res"]){
                cbk(data["res"]);
                if(dismsg)
                    infomsg(data["msg"]);
            }else{
                alertmsg(data["msg"]);
            }
        },
        error:function(){
            alertmsg("Ajax Post Form Failed!");
        }
    });
}

function postData(url, data, cbk){
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: url,
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function(data)
        {
            console.log(data);
            if(data["res"]){
                cbk(data["res"]); // show response from the php script.
                infomsg(data["msg"]);
            }else{
                alertmsg(data["msg"]);
            }
        },
        error: function(){
            alertmsg("Ajax Post Form Failed!");
        }
    });
}

function postFileData(url, data ,cbk){
    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        success: function(data)
        {
            console.log(data);
            if(data["res"]){
                cbk(data["res"]); // show response from the php script.
                infomsg(data["msg"]);
            }else{
                alertmsg(data["msg"]);
            }
        },
        error: function(){
            alertmsg("Ajax Post File Fomr Failed!");
        }
    });
}

// Msg and Modal
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
    $ele.slideDown();
}

//// dialog
var confirmCBK;
var cancelCBK;

$dialogConfirm.click(function(event){
    if(confirmCBK!=null)
        confirmCBK();
});

$dialogCancel.click(function(event){
    if(cancelCBK!=null)
        cancelCBK();
});

function dialogPop(msg, callback=null, callback2=null){
    $dialogModal.find(".msg").html(msg);
    openModal($dialogModal);
    confirmCBK = callback;
    cancelCBK = callback2;
}