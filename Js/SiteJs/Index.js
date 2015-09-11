/// <reference path="../Cmn.js" />
/// <reference path="../Dx.js" />
/// <reference path="../jquery-1.9.1.min.js" />
/// <reference path="../Cmn.js" />
/// <reference path="../CmnAjax.js" />
/// <reference path="../CmnFuncExd.js" />

var _Sex = "男";
Index = new function () {


    this.Alert = function (message) {
        alert(message);
    }
    //东雪留资
    this.SubmitDongXueUserInfo = function (name, phone,successfunc) {
        $.ajax({
            dataType: "jsonp",
            url: "http://c4l.dongfeng-citroen.com.cn/api_qingrenjie/userinfo_api.php?action=adduserinfo&key=lk3*3lflEDL3w0&name=" + encodeURI(name) + "&phone=" + encodeURI(phone) + "&site=" + encodeURI("C3-XR手机版官网") + "&utm_source=" + encodeURI(location.href) + "",
            type: "GET",
            //成功后的方法,返回0就代表提交成功，-1则为失败
            success: function (result) {
                successfunc && successfunc(result);
            }
        });
    }

    $(function () {
        //首页图片轮播
            $(".home_nav").cycle("destroy").cycle({
                fx: 'scrollHorz',
                timeout: 2000,
                speed: 500,
                pause: 0,
                pager: $(".home_carousel"),
                activePagerClass: 'carousel_set',
                prev: ".JscKvLefts",
                next: ".JscKvRights"
            });
            Cmn.Func.TouchSlide(".home_nav", 20, function (dir) {
                if (dir == "left")
                {
                    $(".JscKvRights").click();
                }
                if (dir == "right") {
                    $(".JscKvLefts").click();
                }
            });

       
        //右边导航跳留资
        // $(".diver").on("touchstart", function () {
        //     AnimateFrame.SlideTo("home");
        //     $(".footer_btn").removeClass("footer_set");

        //});

        //
         //$(".change_btn").on("touchstart", function () {
         //    $(".change_btn").removeClass("change_set");
         //    $(this).addClass("change_set");
        //});
        //点击跳转首页
            $("#JscReturn").on("click", function () {
                TestDiverMoveUp();
                $(this).addClass("change_set");
            })
        //右边导航跳经销商
         $(".search").on("touchstart", function () {
             AnimateFrame.SlideTo("dealer");
             TestDiverMoveDown();
             $(".footer_btn").removeClass("footer_set");
        });
        
        //点击活动
        $(".activity_btn").on("touchstart", function () {
            AnimateFrame.SlideTo("activity_mechanism");
            TestDiverMoveDown();
            $(".footer_btn").removeClass("footer_set");
            $(this).addClass("footer_set");
            //$(".change_btn").removeClass("change_set");
        });

        //点击亮点
        $(".drop_btn").on("touchstart", function () {
            AnimateFrame.SlideTo("bright");
            TestDiverMoveDown();
            $(".footer_btn").removeClass("footer_set");
            $(this).addClass("footer_set");
            //$(".change_btn").removeClass("change_set");
        });

        //配置
        $(".deploy_btn").on("touchstart", function () {
            AnimateFrame.SlideTo("configure");
            TestDiverMoveDown();
            $(".footer_btn").removeClass("footer_set");
            $(this).addClass("footer_set");
            //$(".change_btn").removeClass("change_set");
        });

        //添加选中框
        $(".Js_check_set").click(function () {
            if ($(this).hasClass("check_update")) {
                $(".Js_check_set").removeClass("check_update");
            } else {
                $(this).addClass("check_update");
            }
        });

        //免责声明
        $('.Js_attesting').click(function () {
            $(".Js_attesting_float").show();
        });

        //免责声明关闭
        $('.Js_attesting_float').click(function () {
            $(".Js_attesting_float").hide();
        });

        //360
        $(".limit_btn").on("touchstart", function () {
            AnimateFrame.SlideTo("revolve");
            TestDiverMoveDown();
            $(".footer_btn").removeClass("footer_set");
            $(this).addClass("footer_set");
            //$(".change_btn").removeClass("change_set");
        });

        //资讯
        $(".information_btn").on("touchstart", function () {
            AnimateFrame.SlideTo("information");
            TestDiverMoveDown();
            $(".footer_btn").removeClass("footer_set");
            $(this).addClass("footer_set");
            //$(".change_btn").removeClass("change_set");
            $(".JscNewsInf").hide();
            $(".JscNewsList").show();
        });

        //配置
        $(".set_deploy").change(function () {
            $(".pub_price").hide();
            $(".configuration_details").hide();
            var _index = $(".set_deploy select option:selected").index();
            $(".pub_price").eq(_index).show();
            $(".configuration_details").eq(_index).show();

        });

        //填充新闻数据
        var _NewDate;
        function GetNewList(newstype) {
            CmnAjax.FillData(".inf_bar", "Itf/Php/Itf.php?method=SelectNews", { "news_type": newstype }, function (dat) {
                if (dat.IsSuccess == "1") {
                    _NewDate = dat.data;
                    NewsInfoList();
                }
            });
        }
        GetNewList("0");
        //选中新闻状态
        $(".inf_sidemenu").on("touchstart", function () {
            var _newstype = $(this).attr("newtype");
            $(".inf_sidemenu").removeClass("inf_select");
            $(this).addClass("inf_select");
            GetNewList(_newstype);
        });

        //媒体资讯信息
        function NewsInfoList() {
            $(".inf_con").on("click", function () {
                var _date_id = $(this).children(".inf_arrow").children("a").attr("news_id");
                for (var _i = 0; _i < _NewDate.length; _i++) {
                    if (_NewDate[_i]["news_id"] == _date_id) {
                        $("#JscMedia").html(_NewDate[_i]["new_media"]);
                        $("#NewsTitle").html(_NewDate[_i]["title"]);
                        $("#JscConent").html(_NewDate[_i]["content"]);
                        $(".JscFanHui").on("click", function () {
                            $(".JscNewsList").show();
                            $(".JscNewsInf").hide();
                        });
                    }
                }
                $(".JscNewsList").hide();
                $(".JscNewsInf").show();
            });

        }

  
        //选择男女
        $(".Js_LyfSexCon").on("touchstart", function () {
            if ($(this).hasClass("set_sex")) {

            }
            else {
                $(".Js_LyfSexCon").removeClass("set_sex");
                $(this).addClass("set_sex");
                _Sex = $(this).attr("value");
            }

        })

        //什么鬼的留资
        var _IsOk = false;
        $(".Js_LyfYuYueBtn").on("touchstart", function () {
            if (_IsOk) { return; }
            var _name = $(".Js_LyfName").val();
            var _phone = $(".Js_LyfPhone").val();
            var _checkPhone = /^0?1[3|4|5|8][0-9]\d{8}$/;
            if (_name == "") {
                Index.Alert("姓名不能为空！");
                return;
            }
            if (_phone == "") {
                Index.Alert("电话不能为空！");
                return;
            }
            if (!_checkPhone.test(_phone)) {
                Index.Alert("请输入正确的号码！");
                return;
            }
            //东雪留资
            _Submit = true;
            Index.SubmitDongXueUserInfo(_name, _phone,  function (result) {
            });

            //数据库留资
            var _plame = {
                "name": _name,
                "phone": _phone,
                "sex":_Sex,
                "site": "手机_自由购车",
                "source": location.href
            }
            _Submit = true;
            CmnAjax.PostData("/Itf/Php/Itf.php?method=AddReservation", _plame, function (dat) {
                if (dat.IsSuccess == "1") {
                    Index.Alert("提交成功");
                    _Submit = false;
                }
            });


        })


        //预约试驾
        var _Submit = false;
        $(".JscBtn").on("touchstart", function () {
            if (_Submit) { return; }
            var _name = $(".JscResName").val();
            var _phone = $(".JscResPhone").val();
            var _checkPhone = /^0?1[3|4|5|8][0-9]\d{8}$/;
            if (_name == "") {
                Index.Alert("姓名不能为空！");
                return;
            }
            if (_phone == "") {
                Index.Alert("电话不能为空！");
                return;
            }
            if (!_checkPhone.test(_phone)) {
                Index.Alert("请输入正确的号码！");
                return;
            }
            //东雪留资
            _Submit = true;
            Index.SubmitDongXueUserInfo(_name, _phone, function (result) {
            });

            //数据库留资
            var _plame = {
                "name": _name,
                "phone": _phone,
                "site": "手机",
                "source": location.href
            }
            _Submit = true;
            CmnAjax.PostData("/Itf/Php/Itf.php?method=AddReservation", _plame, function (dat) {
                if (dat.IsSuccess == "1") {
                    Index.Alert("提交成功");
                    _Submit = false;
                }
            });
        });
    });
}