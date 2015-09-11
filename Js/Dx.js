/// <reference path="jquery-1.9.1.min.js" />
/// <reference path="Cmn.js" />
/// <reference path="CmnAjax.js" />
/// <reference path="CmnFuncExd.js" />
/// <reference path="animate/AnimateFrame.js" />
/// <reference path="animate/Scenes.js" />
/// <reference path="animate/ScenesSwitch.js" />


$(document).ready(function () {

     

    Cmn.PageIsLock = true;


    if (Cmn.Func.IsIphone4()) {
        $(".car_box").css("top", "100px");
        $(".province_set").css("left", "100px");
        $(".city_set").css("right", "100px");
        $(".header").css("height", "82px");
        $(".change_box").css("top", "82px");
        $(".round_num").css("top", "868px");
        $(".round_num").css("left", "356px");
        $(".round").css("top", "890px");
        $(".round").css("left", "322px");
        $(".mechanism_bg").css("top", "-150px");
        $(".mechanism_bg").css("z-index", "1");
        $(".activity_car").css("z-index", "2");
        $(".people").css("z-index", "2");
        $(".activity_tip").css("z-index", "2");
        $(".join_btn").css("z-index", "2"); 
        $(".mechanism_box").css("z-index", "2")
        $(".activity_inner").css("background", "#f8b519")
        $(".join_btn").css("top", "896px");
        $(".mechanism_box").css("top", "682px");
        $(".activity_car img").css("width", "110%");
        $(".activity_tip img").css("width", "105%");
        $(".set_deploy select").css("width", "220px");
        $(".mechanism_box").css("left", "140px");
        $(".home_nav li").css("width", "800px");
        $(".inf_pop_box").css("overflow-x", "hidden");
    } else {
      
    }
 

    if (Cmn.Func.IsIphone5()) {
        $(".configure_con").css("height", "570px");
        $(".home_carousel").css("top", "650px");
        $(".mechanism_box").css("top", "662px");
        $(".join_btn").css("top", "866px");
        $(".pull_box").css("top", "912px");
        } else {
    }
    AnimateFrame.Init(500, SwitchMode.Shifting, Direction.Up, Direction.Down);
    Cmn.Func.ImageLazyLoading("body", function (pro) {
         
    }, function () {
    });
    $("#RevolveBG").css("top", $(window).height() - 1040 + "px");

    $(".inf_item,.inf_pop_box,.configure_con").on("touchstart", function (e) {
        e.stopPropagation();
    })
    $(".inf_item,.inf_pop_box,.configure_con").on("touchmove", function (e) {
        e.stopPropagation();
    });


    $("input").focus(function () {//点击输入框的时候
        $(".footer").hide();//底部的东西隐藏

    });
    $("input").blur(function () {
        $(".footer").show();
    });





})