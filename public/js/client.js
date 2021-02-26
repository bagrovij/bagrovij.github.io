let user = {};
let chat_auto_scroll = true;
let chat_visible = true;

isChatFocused = () => {
    return $("#messages").hasClass("focused") ? true : false;
};

escapeHtml = (text) => {
    var map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }
    return text.replace(/[&<>"']/g, (m) => { 
        return map[m]; 
    });
};

$(() =>  {
    socket.emit("connected");
    //Add focus on chat by pressing Enter
    $(window.document).on("keyup", (e) => {
        if(e.keyCode == 13 && !isChatFocused()) {
            $("#messages").addClass("focused");
            $(".chat-input input").focus();
            $("#messages").css({
                "overflow": "auto"
            });
        //Unfocus by pressing Enter / ESC
        } else if(e.keyCode == 13 || e.keyCode == 27 && isChatFocused()) {
            $(".chat-input input").blur();
            $("#messages").removeClass("focused");
            $("#messages").css({
                "overflow": "hidden"
            });
        }
    });
    //Add focus by clicking on chat input
    $(".chat-input input").on("click", () => {
        $("#messages").addClass("focused");
        $("#messages").css({
            "overflow": "auto"
        });
    });
    //Send message by pressing Enter
    $(".chat-input input").on("keyup", (e) => {
        var input = $(".chat-input input");
        var message = input.val();
        if(e.keyCode == 13) {
            message = escapeHtml(message);
            if(message.trim().length > 0) {
                $("#messages").removeClass("focused");
                socket.emit("chat message", {message: message});
                input.val("");
                input.blur();
                if(chat_auto_scroll == true) {
                    $("#messages").scrollTop($("#messages")[0].scrollHeight);
                }
            }
        }
    });
    socket.on("get message", (data) => {
        $("#messages").append(
            `<div class="message"><div class="name">` + data.user.name + `</div><div class="message-text">` + data.message + `</div></div>`
        )
        console.log(data.user.id);
    });
    socket.on("leave", (data) => {
        $("#messages").append(
            `<div class="message"><div class="name">Server</div><div class="message-text">` + data.user.name +`left</div></div>`
        ) 
    })
    //Unfocus by clicking on page
    $(window.document).on("click", (e) => {
        if(!e.target.closest("body")) {
            if(isChatFocused()) {
                $("#messages").removeClass("focused");
                $("#messages").css({
                    "overflow": "hidden"
                });
            } 
        }
    });
    //Disable auto-scrolling when scrolling up
    $("#messages").bind("mousewheel", (e) => {
        if(e.originalEvent.wheelDelta >= 0) {
            chat_auto_scroll = false;
        } else {
            chat_auto_scroll = true;
        }
    });
    //Select username and paste in input
    $("#messages").on("click", ".name", (e) => {
        var username = $(e.target).text();
        var input = $(".chat-input input");
        input.val(input.val() + "@" + username + " ");
        $(input).focus();
    });
    //Toggle chat
    $(".toggle-chat").on("click", () => {
        if(chat_visible) {
            $(".toggle-chat").html('<i class="fas fa-eye"></i>');
            $("#chat").animate({left: "-=615"}, 800);
            chat_visible = false;
        } else {
            $(".toggle-chat").html('<i class="fas fa-eye-slash"></i>');
            $("#chat").animate({left: "0"}, 800);
            chat_visible = true;
        }
    });
});