/// <reference path="ThirdLib/jquery.js" />
/// <reference path="Cmn.js" />

//检查Cmn有没有定义，如果没有定义就定义下
if (typeof (Cmn) == "undefined") { Cmn = {}; }
if (typeof (Cmn.Func) == "undefined") { Cmn.Func = {}; }
//---------------------------------------

(function () {
    /// <field name="Cmn.Func.BaiduMapKey" type="String">百度key</field>
    Cmn.Func.BaiduMapKey = "9KAiuPrKKoy1soPCrBrmskPg";
    //--------------------------------------- 
    Cmn.Func.GetAddrByLbs = function (callBackFunc, baiduMapKey) {
        /// <summary>获取当前用户地址根据经纬度和百度地图接口</summary>
        /// <param name="callBackFunc" type="function">回调函数,成功返回参数：{"city":"南通市","district":"海门市","province":"江苏省","street":"云富北路","street_number":""},错误回调参数为：null</param>
        /// <param name="baiduMapKey" type="String">百度地图的key,如果不传取得是Cmn.Func.BaiduMapKey </param>

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(GetPositionCallBack, function () {
                callBackFunc(null);
            });
        }
        else { callBackFunc(null); }

        function GetPositionCallBack(position) {
            var _badiduMapKey = baiduMapKey;

            if (_badiduMapKey == undefined || _badiduMapKey == "") {
                _badiduMapKey = Cmn.Func.BaiduMapKey;
            }

            $.ajax({
                type: "Post",
                url: "http://api.map.baidu.com/geocoder/v2/?ak=" + _badiduMapKey + "&location=" +
                    position.coords.latitude + "," + position.coords.longitude + "&output=json&pois=0",

                contentType: "application/x-www-form-urlencoded",
                dataType: "jsonp",
                jsonp: "callback",
                success: function (retData) {
                    //{"status":0,"result":{"location":{"lng":121.32298703305,"lat":31.983423980434},"formatted_address":"江苏省南通市海门市云富北路","business":"","addressComponent":{"city":"南通市","district":"海门市","province":"江苏省","street":"云富北路","street_number":""},"cityCode":161}}

                    if (retData.status == 0) { callBackFunc(retData.result.addressComponent); }
                    else { callBackFunc(null); }

                    return true;
                },
                error: function (httpRequest) {
                    callBackFunc(null);

                    return false;
                }
            });
        }
    }
    //---------------------------------------
    Cmn.Func.GetCurPosition = function (callBackFunc) {
        /// <summary>获取当前位置</summary>
        /// <param name="callBackFunc" type="function">回调函数，失败返回参数 null,成功返回参数{"coords":{"latitude":"longitude",""}}</param>

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(callBackFunc, function () {
                callBackFunc(null);
            });
        }
        else { callBackFunc(null); }
    }
    //---------------------------------------
    var LastIsHorizontalScreen = null; //记录最后一次是否是横屏，解决安卓第一次横竖屏错误的问题
    var LastOrientation = null;
    var HasOrrentationchange = false; //是否已经转过屏

    $(window).on("orientationchange", function () { HasOrrentationchange = true; });

    Cmn.Func.IsHorizontalScreen = function () {
        /// <summary>是否是横屏</summary>
        /// <returns type="bool" />

        //安卓4.4.2 下，横屏下扫描直接进入，会判断为竖屏，

        //这个注释掉了，因为安卓下第一次横屏进入后，再竖屏就判断错了。
        if (HasOrrentationchange == false && LastIsHorizontalScreen != null) { return LastIsHorizontalScreen; }

        if (LastIsHorizontalScreen == null && Cmn.Func.IsAndroid()) {
            if ($(window).width() > $(window).height()) { LastIsHorizontalScreen = true; }
            else { LastIsHorizontalScreen = false; }
        }
        else {
            if (window.orientation == 0 || window.orientation == 180) { LastIsHorizontalScreen = false; }
            else if (window.orientation == 90 || window.orientation == -90) { LastIsHorizontalScreen = true; }
        }

        LastOrientation = window.orientation;

        if (LastIsHorizontalScreen === null) { return false; } //可能在pc上默认为竖屏
        else { return LastIsHorizontalScreen; }
    }
    //---------------------------------------
    Cmn.Func.GetHeightWidthRate = function () {
        /// <summary>返回屏幕显示区域的高宽比率</summary>

        if (Cmn.Func.IsIphone4() && Cmn.Func.IsWeiXin()) {
            if (Cmn.Func.IsHorizontalScreen()) { return 640 / 832; } else { return 832 / 640; }
        }
        else if (Cmn.Func.IsIphone5() && Cmn.Func.IsWeiXin()) {
            if (Cmn.Func.IsHorizontalScreen()) { return 640 / 1008; } else { return 1008 / 640; }
        }
        else if (Cmn.Func.IsIPad()) {
            if (Cmn.Func.IsHorizontalScreen()) { return 768 / 1024; } else { return 1024 / 768; }
        }
        else { return $(window).height() / $(window).width(); }
    }
    //---------------------------------------
    Cmn.Func.GetWindowsWidth = function () {
        /// <summary>获取windows的宽度（和默认的不一样，由于设置了viewport的放大倍数）</summary>

        return $("body").width();
    }
    //---------------------------------------
    Cmn.Func.GetWindowsHeight = function () {
        /// <summary>获取windows的高度（和默认的不一样，由于设置了viewport的放大倍数）</summary>

        return $("body").width() * Cmn.Func.GetHeightWidthRate();
    }
    //---------------------------------------
    //记录浏览器窗口初始的宽度
    var _InitWindowWidth = null; //竖屏时的宽
    var _InitWindowHeight = null; //竖屏时的高
    var _HasBindOrientationchange = false; //是否绑定过转屏事件
    var _HasTargetDensitydpi = false;  //是否设置过TargetDensitydpi（感觉设置过以后，设置放大倍数都没有用了）
    var _HasSetViewPort = false; //是否设置过ViewPort,（ViewPort只是需要设置一次，因为横竖屏总是至少一个需要是百分比切的）

    Cmn.Func.MobileAdaptiveMode = {
        /// <field name="name" type="String">只适应宽度</field>
        Width: "Width",
        /// <field name="name" type="String">宽高都适应，在一屏内显示全部内容</field>
        WidthHeight: "WidthHeight",
        /// <field name="name" type="String">适应宽度，如果屏幕高度大于主要内容高度的时候裁剪</field>
        WidthCutOutHeight: "WidthCutOutHeight"
    }

    var ProcessAdviseVerticalImg = function (adviseVerticalImgUrl, mainViewIsHorizontal) {
        /// <summary>处理竖屏提示</summary>
        /// <param name="adviseVerticalImgUrl" type="String">建议竖屏图片url</param>
        /// <param name="mainViewIsHorizontal" type="bool">是不是横屏看的网站,默认是竖屏</param>
        /// <returns type="bool" />


        //判断是否有竖屏提示图片
        if (adviseVerticalImgUrl != undefined && adviseVerticalImgUrl != "" && Cmn.Func.IsString(adviseVerticalImgUrl)) {
            //Cmn.DebugLog("有提示图片");
            //Cmn.DebugLog("mainViewIsHorizontal:" + mainViewIsHorizontal);

            if ((Cmn.Func.IsHorizontalScreen() && mainViewIsHorizontal == false) ||
                (Cmn.Func.IsHorizontalScreen() == false && mainViewIsHorizontal == true)) {
                //Cmn.DebugLog("显示横竖屏提示2 GetWindowsHeight" + Cmn.Func.GetWindowsHeight() + " window.height:" + $(window).height() +
                //    "window.width:" + $(window).width());

                //var _zoom = window.screen.width/window.screen.height;

                //if(_zoom>1) { _zoom = 1/_zoom; }

                var _width = $(window).width(); //Cmn.Func.GetWindowsWidth();
                var _height = $(window).height(); //_width*_zoom;

                //处理iphone上没有撑满宽度的情况，可能自动调整了放大倍数
                //if (Cmn.Func.IsIOS() && _width < Cmn.Func.GetWindowsWidth()) { _width = Cmn.Func.GetWindowsWidth(); }

                //解决点击输入框后横屏提示没有撑满的问题
                //if (Cmn.Func.IsIOS()) {
                //    if (Cmn.Func.IsIphone4()) { _width = 1120; } 
                //    else if (Cmn.Func.IsIPad() || Cmn.Func.IsIphone5()) { }
                //    else {  _width = 1136;  }

                //    $("body").width(_width);

                //    $("[name='viewport']").attr("content", "width=" + _width + ",user-scalable=no;");
                //}

                //$("body").width(_width);

                //SetViewPort("width=1167,user-scalable=no;");
                $("body").css("width", "100%");



                var _ajustImgPos = function () {
                    /// <summary>调整提示图片，使图片上下居中</summary>

                    if ($(".AdviseVerticalImg img").height() != undefined && $(".AdviseVerticalImg img").height() > 0) {
                        $(".AdviseVerticalImg img").css("margin-top",
                            ($(".AdviseVerticalImg").height() - $(".AdviseVerticalImg img").height()) / 2 + "px");
                    }
                    else { setTimeout(_ajustImgPos, 100); }
                }

                if ($("body .AdviseVerticalImg").length <= 0) {
                    //$("body").append("<div class='AdviseVerticalImg' " +
                    //    "style='position:fixed; left:0px;top:0px;z-index:10001;" +
                    //    "background:rgba(00, 00, 00, 1) none repeat scroll 0 0 !important;filter:Alpha(opacity=100);" +
                    //    "background:#000000;width:" + _width + "px;height:" + (_height+1) + "px;text-align:center;'> " +
                    //    "<img style='margin-top:" + (_height * 0.1) + "px' height='" + (_height * 0.8) + "px' src='" + adviseVerticalImgUrl + "' /></div>");


                    var _imgStyle = "style='margin-top:5%;' height='80%'";

                    if (Cmn.Func.IsHorizontalScreen() == false) { //是竖屏
                        var _imgStyle = "style='margin-top:5%;' width='80%'";
                    }

                    //加了一个底层的图片，有的时候头部会拉到里面，导致底部有空白
                    $("body").append(
                       "<div class='AdviseVerticalImgBg' style='position:fixed;left:0px;top:0px;z-index:10000;background:#000000;width:100%;height:120%;'></div>" +
                       "<div class='AdviseVerticalImg cg-DefaultImgHint' " +
                       "style='position:fixed; left:0px;top:0px;z-index:10001;" +
                       "background:rgba(00, 00, 00, 1) none repeat scroll 0 0 !important;filter:Alpha(opacity=100);" +
                       "background:#000000;width:100%;height:100%;text-align:center;'> " +
                       "<img " + _imgStyle + " src='" + adviseVerticalImgUrl + "' /></div>");

                    _ajustImgPos();
                }
                else {
                    //$(".AdviseVerticalImg").width(_width);
                    //$(".AdviseVerticalImg img").height(_height * 0.8);

                    $(".AdviseVerticalImg,.AdviseVerticalImgBg").fadeIn(100);

                    if ($(".cg-DefaultImgHint").length > 0) { _ajustImgPos(); } //系统默认的提示需要调整图片位置
                }

                $(".AdviseVerticalImg,.AdviseVerticalImgBg").off("touchstart").on("touchstart", function (e) {
                    e.preventDefault();
                    Cmn.DebugLog("触摸横屏提示层");
                });


                ////防止有时候没有显示出来
                //setTimeout(function () {
                //    $(".AdviseVerticalImg img").height(_height * 0.8-1);
                //    $(".AdviseVerticalImg").show();
                //    alert("hhh");
                //}, 2000);


                Cmn.DebugLog("ProcessAdviseVerticalImg::body width:" + $("body").width());

                return true;
            }
            else {
                $(".AdviseVerticalImg,.AdviseVerticalImgBg").hide();
                $(".AdviseVerticalImg,.AdviseVerticalImgBg").off("touchstart");
                //$(".AdviseVerticalImg").off("touchmove");
            }
        }

        Cmn.DebugLog("body width:" + $("body").width());

        return false;
    }

    var SetViewPort = function (viewPortContent) {
        /// <summary>设置ViewPort</summary>
        /// <param name="viewPortContent" type="String">ViewPort内容</param>

        $("[name='viewport']").attr("content", viewPortContent);
        _HasSetViewPort = true;
    }

    Cmn.Func.MobileAdaptive = function (mainContentWidth, mainContentHeight, adviseVerticalImgUrl, adaptiveMode,
        onOrientationchange, mainViewIsHorizontal) {
        /// <summary>移动设备网页宽度自适应(body宽度需要定宽，否则安卓下有问题；viewport为<meta content="width=device-width,user-scalable=no;" name="viewport" />)</summary>
        /// <param name="mainContentWidth" type="int">主要内容区域的宽度</param>
        /// <param name="mainContentHeight" type="int">主要内容区域的高度</param>
        /// <param name="adviseVerticalImgUrl" type="String">建议竖屏提示图片</param>
        /// <param name="adaptiveMode" type="Cmn.Func.MobileAdaptiveMode">自适应方案(默认为Width只适应宽度)</param>
        /// <param name="onOrientationchange" type="function">转屏处理结束回调事件</param>
        /// <param name="mainViewIsHorizontal" type="bool">主视角是不是横屏,默认是竖屏</param>

        Cmn.DebugLog("自适应版本3.2.9");

        if (mainViewIsHorizontal == undefined) { mainViewIsHorizontal = false; }
        if (onOrientationchange == "" || onOrientationchange == null) { onOrientationchange = undefined; }

        //默认为只适应宽度
        if (adaptiveMode == undefined) { adaptiveMode = Cmn.Func.MobileAdaptiveMode.Width; }

        ProcessAdviseVerticalImg(adviseVerticalImgUrl, mainViewIsHorizontal);

        if ((Cmn.Func.IsHorizontalScreen() && mainViewIsHorizontal == true) ||
            (Cmn.Func.IsHorizontalScreen() == false && mainViewIsHorizontal == false)) {

            if (_HasSetViewPort) { Cmn.DebugLog("ViewPort已经设置过，直接退出"); return; }
            else { Cmn.DebugLog("ViewPort没有设置过，开始设置..."); }

            if (adaptiveMode == Cmn.Func.MobileAdaptiveMode.Width || adaptiveMode == Cmn.Func.MobileAdaptiveMode.WidthCutOutHeight) {
                $("body").width(mainContentWidth);

                if (Cmn.Func.IsIOS()) {
                    Cmn.DebugLog("是IOS系统");

                    //点击输入框后，再切换横竖屏，自适应存在问题
                    var _width = mainContentWidth;

                    //下面这段注释是感觉不对了，因为在横屏状态下刷新页面后就回不去了, at 20150410
                    //if (Cmn.Func.IsIphone4()) {
                    //    if (Cmn.Func.IsHorizontalScreen()) { _width = 1120; }
                    //}
                    //else if (Cmn.Func.IsIPad()) { }
                    //else {
                    //    if (Cmn.Func.IsHorizontalScreen()) { _width = 1136; }
                    //}

                    $("body").width(_width);

                    SetViewPort("width=" + _width + ",user-scalable=no;");
                }
                else if (navigator.userAgent.match(/Nexus/i) != null) {
                    Cmn.DebugLog("操作系统Nexus");

                    $("body").css("zoom", $(window).width() / mainContentWidth * 100 + "%");
                }
                else if (navigator.userAgent.match(/android\s*[\d\.]+/i) != null) { //是安卓手机
                    Cmn.DebugLog("是安卓系统");

                    var _androidVersion = Cmn.Func.GetAndroidVersion();

                    _InitWindowWidth = $(window).width();
                    _InitWindowHeight = $(window).height();

                    var _multiple = _InitWindowWidth / mainContentWidth;

                    //if (_androidVersion >= 4.4) {
                    //    Cmn.DebugLog("安卓版本大于等于4.4:" + _androidVersion);

                    //    $("body").css("zoom", $(window).width() / mainContentWidth * 100 + "%");
                    //}
                    //else { //小于4.4版本
                    Cmn.DebugLog("安卓版本小于4.4:.." + _androidVersion);

                    //if (navigator.userAgent.match(/Android\s*4.2.2/i) != null) {
                    Cmn.DebugLog("安卓版本 4.2.2,window.screen.width:" + window.screen.width +
                        " window.devicePixelRatio:" + window.devicePixelRatio);

                    var _densitydpi = mainContentWidth / window.screen.width * window.devicePixelRatio * 160;


                    if (Cmn.Func.IsWeiXin() && _androidVersion >= 4.4 && _androidVersion < 5.0) { //解决4.4以上，点击输入框后页面放大的问题,但原先是注释掉的，可能有问题
                        SetViewPort("width=device-width,initial-scale=" + _multiple + ",maximum-scale=" + _multiple +
                                     ",minimum-scale=" + _multiple + ",user-scalable=no;");
                    }
                    else {
                        if (_densitydpi <= 400) { //超过400，手机上无效
                            SetViewPort("width=" + mainContentWidth + ", user-scalable=no, target-densitydpi=" + _densitydpi.toFixed(0) + ";");
                        }
                        else {
                            if (_androidVersion == 4.2) { //设置放大倍数没有用
                                SetViewPort("width=" + mainContentWidth + ", user-scalable=no, target-densitydpi=400;");
                            }
                            else {
                                Cmn.DebugLog("window.Width:" + _InitWindowWidth + "window.Height:" + _InitWindowHeight);

                                SetViewPort("width=device-width,initial-scale=" + _multiple + ",maximum-scale=" + _multiple +
                                    ",minimum-scale=" + _multiple + ",user-scalable=no;");
                            }
                        }
                    }
                    // }
                }
                else if (navigator.userAgent.match(/Windows Phone/i) != null) {
                    Cmn.DebugLog("Windows Phone");

                    //用js设置viewport好像不起作用
                }
                else { //其他操作系统
                    Cmn.DebugLog("是其他操作系统");

                    _InitWindowWidth = $(window).width();
                    _InitWindowHeight = $(window).height();

                    Cmn.DebugLog("window.Width:" + _InitWindowWidth + "window.Height:" + _InitWindowHeight);

                    var _multiple = _InitWindowWidth / mainContentWidth;

                    SetViewPort("width=device-width,initial-scale=" + _multiple + ",maximum-scale=" + _multiple +
                        ",minimum-scale=" + _multiple + ",user-scalable=no;");
                }

                //处理高度超出裁剪
                if (adaptiveMode == Cmn.Func.MobileAdaptiveMode.WidthCutOutHeight) {
                    Cmn.DebugLog("是WidthCutOutHeight  GetWindowsHeight:" + Cmn.Func.GetWindowsHeight() +
                        " mainContentHeight：" + mainContentHeight + " bodyHeight:" + $("body").height());

                    if (Cmn.Func.GetWindowsHeight() > mainContentHeight) {
                        Cmn.DebugLog("满足条件，需要隐藏滚动条");

                        if ($("body").height() > Cmn.Func.GetWindowsHeight()) {
                            $("body").height(Cmn.Func.GetWindowsHeight());
                            $("body").css("overflow-y", "hidden");
                        }
                    }
                    else { $("body").css("overflow-y", "scroll"); }
                }
            }
            else if (adaptiveMode == Cmn.Func.MobileAdaptiveMode.WidthHeight) { //宽高都需要适应，一屏内显示
                if (Cmn.Func.IsIOS()) {
                    var _width = mainContentWidth;// 1024 / $(window).height() * 640;

                    if (Cmn.Func.IsIphone4()) {
                        Cmn.DebugLog("是Iphone4");

                        if (Cmn.Func.IsWeiXin()) {
                            if (Cmn.Func.IsHorizontalScreen()) { _width = 1120; } //_width = 1120;
                            else {
                                //if (mainContentWidth * $(window).height() / $(window).width() < mainContentHeight) {
                                //    _width = mainContentHeight / ($(window).height() / $(window).width());
                                //}

                                //因为iphone4在升级微信浏览器后这个屏幕的宽高比算出来就不对了，所以固定了
                                if (mainContentWidth * Cmn.Func.GetHeightWidthRate() < mainContentHeight) {
                                    _width = mainContentHeight / Cmn.Func.GetHeightWidthRate();
                                }
                            }
                        }
                        else {//safari浏览器，二次设置viewport好像不起作用，所以固定了宽度
                            if (mainViewIsHorizontal === true) {
                                if (Cmn.Func.IsHorizontalScreen()) { _width = mainContentWidth; }
                                else { _width = mainContentHeight; }
                            }
                            else {
                                if (Cmn.Func.IsHorizontalScreen()) { _width = mainContentHeight; }
                                else {
                                    if (mainContentWidth * Cmn.Func.GetHeightWidthRate() < mainContentHeight) {
                                        _width = mainContentHeight / Cmn.Func.GetHeightWidthRate();
                                    }
                                }
                            }
                        }
                    }
                    else if (Cmn.Func.IsIPad()) {
                        Cmn.DebugLog("ipad mainContentWidth:" + mainContentWidth + "  Cmn.Func.GetHeightWidthRate():" +
                             Cmn.Func.GetHeightWidthRate() + "  mainContentHeight:" + mainContentHeight);

                        if (Cmn.Func.IsWeiXin()) { //微信浏览器
                            if (mainContentWidth * Cmn.Func.GetHeightWidthRate() < mainContentHeight) {
                                _width = mainContentHeight / Cmn.Func.GetHeightWidthRate();
                            }
                        }
                        else { //safari浏览器，二次设置viewport好像不起作用，所以固定了宽度
                            if (Cmn.Func.IsHorizontalScreen()) { _width = mainContentWidth; }
                            else { _width = mainContentHeight; }
                        }
                    }
                    else if (Cmn.Func.IsIphone5()) {
                        Cmn.DebugLog("是Iphone5");

                        if (Cmn.Func.IsWeiXin()) {
                            if (Cmn.Func.IsHorizontalScreen()) { _width = 1136; }
                            else { _width = mainContentWidth; }
                        }
                        else { //其他浏览器
                            if (mainViewIsHorizontal === true) { //横屏浏览网站
                                if (Cmn.Func.IsHorizontalScreen()) { _width = mainContentWidth; }
                                else { _width = mainContentHeight; }
                            }
                            else { //竖屏浏览网站
                                if (Cmn.Func.IsHorizontalScreen()) { _width = mainContentHeight; }
                                else { _width = mainContentWidth; }
                            }
                        }
                    }
                    else {
                        Cmn.DebugLog("是其他 ios 设备");

                        if (Cmn.Func.IsHorizontalScreen()) { _width = 1136; }
                        else { _width = mainContentWidth; }
                    }

                    $("body").width(_width);
                    //$("body").height(_width * $(window).height() / $(window).width());

                    SetViewPort("width=" + _width + ",user-scalable=no;");

                    Cmn.DebugLog("windowWidth5:" + $(window).width() + " windowHeight:" + $(window).height() +
                        " mainContentWidth:" + mainContentWidth);
                }
                    //else if (navigator.userAgent.match(/Android\s*4.4/i) != null) {
                    //    Cmn.DebugLog("Android 4.4");
                    //    $("body").width(mainContentWidth); //可能页面宽度没有，例如100%,会导致比例算得不对,add at 2014/8/19
                    //    $("body").css("zoom", $(window).width() / mainContentWidth * 100 + "%");
                    //}
                else { //安卓等其他的
                    _InitWindowWidth = $(window).width();
                    _InitWindowHeight = $(window).height();

                    var _androidVersion = Cmn.Func.GetAndroidVersion();

                    if (_HasTargetDensitydpi && (_androidVersion < 4.4 || navigator.userAgent.indexOf("4.4.4") >= 0)) { //这个属性设置过以后，再设置viewport就没有用了
                        Cmn.DebugLog(" 已经设置过_HasTargetDensitydpi ");
                        $("body").width(_InitWindowWidth);
                    }
                    else {
                        var _multiple = _InitWindowWidth / mainContentWidth;

                        if (_InitWindowHeight / mainContentHeight < _multiple) { _multiple = _InitWindowHeight / mainContentHeight; }

                        $("body").width(_InitWindowWidth / _multiple);


                        Cmn.DebugLog("window.Width:" + _InitWindowWidth + "window.Height:" + _InitWindowHeight +
                            " _multiple：" + _multiple + "  body.width:" + $("body").width() + "  body.Height:" + $("body").height());

                        var _densitydpi = _InitWindowWidth / _multiple / window.screen.width * window.devicePixelRatio * 160;


                        if (Cmn.Func.IsWeiXin() && _androidVersion >= 4.4 && _androidVersion < 5.0) {
                            //解决4.4以上，点击输入框后页面放大的问题,但原先是注释掉的，可能有问题
                            //但这样后可能引发了安卓上4.4 视频全屏后缩小页面放大了(这个问题还没解决) at 20150424
                            $("[name='viewport']").attr("content",
                                       "width=device-width,initial-scale=" + _multiple + ",maximum-scale=" + _multiple +
                                       ",minimum-scale=" + _multiple + ",user-scalable=no;");
                        }
                        else {
                            Cmn.DebugLog("_densitydpi:" + _densitydpi);

                            if (_densitydpi <= 400) { //超过400，手机上无效
                                SetViewPort("width=" + (_InitWindowWidth / _multiple) + ", user-scalable=no, target-densitydpi=" +
                                    _densitydpi.toFixed(0) + ";");

                                _HasTargetDensitydpi = true;
                            }
                            else {
                                if (_androidVersion == 4.2) { //设置放大倍数没有用
                                    SetViewPort("width=" + (_InitWindowWidth / _multiple) + ", user-scalable=no, target-densitydpi=400;");

                                    _HasTargetDensitydpi = true;
                                }
                                else {
                                    SetViewPort("width=device-width,initial-scale=" + _multiple + ",maximum-scale=" + _multiple +
                                        ",minimum-scale=" + _multiple + ",user-scalable=no,target-densitydpi=device-dpi;");
                                }
                            }
                        }
                    }
                }
            }
        }
        else { Cmn.DebugLog("不是主要显示的方向，不需要对ViewPort做任何处理。"); }


        ////横屏和竖屏默认宽高
        //var _defaultVerticalWidth = null;
        //var _defaultVerticalHeight = null;
        //var _defaultHorizontalWidth = null
        //var _defaultHorizontalHeight = null;

        //if(Cmn.Func.IsHorizontalScreen()) { //是横屏
        //    if(_defaultHorizontalWidth==null) {
        //        _defaultHorizontalWidth = $(window).width();
        //        _defaultHorizontalHeight = $(window).height();
        //    }
        //}
        //else { //是竖屏
        //    if (_defaultVerticalWidth == null) {
        //        _defaultVerticalWidth = $(window).width();
        //        _defaultVerticalHeight = $(window).height();
        //    }
        //}




        //绑定旋转事件，只绑定一次
        if (_HasBindOrientationchange == false) {
            _HasBindOrientationchange = true;

            //处理 viewport 动态改变导致 input 获取焦点后无法顶至可是区域
            ResetInoutOffset();
            //旋转事件
            var _onOrientationchange = function (event) {
                $(".AdviseVerticalImg,.AdviseVerticalImgBg").hide(); //隐藏竖屏提示

                var _widthBeforChange = $(window).width(); //改变viewport之前的宽度

                //重置viewport,ios的先不重置,ios的重置后会导致锁屏图片显示不正确
                if (!Cmn.Func.IsIOS()) {

                    //安卓4.4.2  设置 viewport 后会触发旋转事件
                    //$("[name='viewport']").attr("content", "width=device-width,user-scalable=no;");
                }

                Cmn.DebugLog("旋转" + window.orientation + "  _widthBeforChange:" + _widthBeforChange +
                    "  window.width:" + $(window).width() + "  IsHorizontalScreen:" + Cmn.Func.IsHorizontalScreen());

                //var _setTimeoutCount = 0;

                function AdaptiveAfterChange() {
                    /// <summary>改变viewport后需要自适应</summary>

                    //_setTimeoutCount++;

                    //if (_setTimeoutCount > 10) {
                    //    Cmn.Func.MobileAdaptive(mainContentWidth, mainContentHeight, adviseVerticalImgUrl, adaptiveMode);
                    //    if (onOrientationchange != undefined) { onOrientationchange(); }
                    //    return;
                    //}

                    // setTimeout(function () {
                    //if (_widthBeforChange != $(window).width()) {
                    //Cmn.Func.MobileAdaptive(mainContentWidth, mainContentHeight, adviseVerticalImgUrl, adaptiveMode);
                    //if (onOrientationchange != undefined) { onOrientationchange(); }
                    //}
                    //else { AdaptiveAfterChange(); }



                    //判断是否转屏完成
                    if ((Cmn.Func.IsHorizontalScreen() && $(window).width() >= $(window).height()) ||
                        (Cmn.Func.IsHorizontalScreen() == false && $(window).width() <= $(window).height())) {
                        //if (onOrientationchange != undefined) { onOrientationchange(); }

                        //在宽高自适应的时候，宽高需要调换位置
                        if (adaptiveMode == Cmn.Func.MobileAdaptiveMode.WidthHeight) {
                            if (Cmn.Func.IsHorizontalScreen()) {
                                Cmn.Func.MobileAdaptive(mainContentHeight, mainContentWidth, adviseVerticalImgUrl,
                                    adaptiveMode, onOrientationchange, mainViewIsHorizontal);
                            }
                            else {
                                Cmn.Func.MobileAdaptive(mainContentWidth, mainContentHeight, adviseVerticalImgUrl,
                                    adaptiveMode, onOrientationchange, mainViewIsHorizontal);
                            }
                        }
                        else {
                            Cmn.Func.MobileAdaptive(mainContentWidth, mainContentHeight, adviseVerticalImgUrl,
                                adaptiveMode, onOrientationchange, mainViewIsHorizontal);
                        }

                        //从上面搬到下面来了，也就是要等viewport设置后再执行,at 20150412
                        if (onOrientationchange != undefined) { onOrientationchange(); }
                    }
                    else { setTimeout(AdaptiveAfterChange, 10); }




                    //if (_widthBeforChange != $(window).width() || _setTimeoutCount > 10 ||
                    //    (Cmn.Func.IsHorizontalScreen() && _defaultHorizontalWidth != null 
                    //    && _defaultHorizontalWidth == $(window).width()) || (
                    //    Cmn.Func.IsHorizontalScreen() == false && _defaultVerticalWidth != null &&
                    //    _defaultVerticalWidth == $(window).width())) {

                    //    Cmn.DebugLog("跳转前：window.width:" + $(window).width() + "  viewPort:" + $("[name='viewport']").attr("content"));

                    //    if (Cmn.Func.IsHorizontalScreen()) {
                    //        Cmn.Func.MobileAdaptive(mainContentHeight, mainContentWidth, adviseVerticalImgUrl, adaptiveMode);
                    //    }
                    //    else {
                    //        Cmn.Func.MobileAdaptive(mainContentWidth, mainContentHeight, adviseVerticalImgUrl, adaptiveMode);
                    //    }

                    //    if (onOrientationchange != undefined) { onOrientationchange(); }
                    //}
                    //else { AdaptiveAfterChange(); }
                    // }, 50);
                }

                AdaptiveAfterChange();
            }

            $(window).on("orientationchange", _onOrientationchange);

            //第一次也要调用一下
            if (onOrientationchange != undefined) { onOrientationchange(); }


            //判断viewprot有没有加，没加的话提示，放在这里是为了只做一次
            if ($("[name='viewport']").length < 1) {
                alert("页面上必须要加上默认的viewport。(<meta content='width=device-width,user-scalable=no;' name='viewport' />)");
            }

            Cmn.DebugLog(navigator.userAgent + "  自适应方案：" + adaptiveMode);

            //第一次进来是横屏，需要触发一下，在宽高自适应的时候，宽高需要调换位置
            if (adaptiveMode == Cmn.Func.MobileAdaptiveMode.WidthHeight && Cmn.Func.IsHorizontalScreen()) {
                Cmn.Func.MobileAdaptive(mainContentHeight, mainContentWidth, adviseVerticalImgUrl, adaptiveMode, onOrientationchange,
                     mainViewIsHorizontal);

                if (onOrientationchange != undefined) { onOrientationchange(); }
            }
        }

        Cmn.DebugLog("自适应后viewport:" + $("[name='viewport']").attr("content") + " HasSetViewPort:" + _HasSetViewPort);
    }

    //专治各种输入框不顶上去 不服气的行为
    function ResetInoutOffset() {

        if (Cmn.Func.IsIOS() && navigator.userAgent.indexOf("8") >= 0) { return; }
        if (Cmn.Func.IsIOS()) {
            var _foucs = function () {
                var _self = $(this);
                var _y = $(_self).offset().top;
                setTimeout(function () {
                    _y += ($(window).height() - $(_self).height()) / 2;
                    $("html,body").stop(true, true).animate({ scrollTop: _y }, 700);
                }, 50);
            }
            $("input").off("focus", _foucs).on("focus", _foucs);
            $("input").blur(function () { $("html,body").scrollTop(0); });
        }
        $("body").height($(window).height());
    }


    //---------------------------------------
    Cmn.Func.GetAndroidVersion = function () {
        /// <summary>获取安卓版本号(是一个小数，可以比较版本号的大小的)</summary>
        /// <returns type="float" />

        var _androidVersion = navigator.userAgent.match(/android\s*[\d\.]+/i);

        if (_androidVersion != null) {
            _androidVersion = _androidVersion[0].replace(/android\s*/i, "");
        }
        else { return 0; }

        if (_androidVersion.indexOf(".") > 0) { //存在点例如4.4.2
            _androidVersion = _androidVersion.match(/[\d]+\.[\d]+/i);
        }

        return _androidVersion;
    }
    //---------------------------------------
    Cmn.Func.GotoUrl = function (url) {
        /// <summary>跳转到某个Url页面，主要是为了解决手机端页面跳转时放大的问题,做了延时跳转处理</summary>
        /// <param name="url" type="String">Url网址</param>

        $("body").hide();
        setTimeout(function () { window.location.href = url; }, 200);
    }
    //---------------------------------------
    //改变url
    Cmn.Func.ChangeBrowserUrlTo = function (url) {
        /// <summary>改变当前浏览器的url</summary>
        /// <param name="param" type="String">新的url,必须是同一主域下的url</param>

        if (url.indexOf("http:") < 0) { //不是绝对路径
            url = Cmn.Func.GetAbsoluteUrl(url);
        }

        window.history.pushState({}, 0, url);
    }
    //---------------------------------------
    Cmn.Func.SaveImgToLocal = function (imgUrl) {
        /// <summary>移动端保存图片到本地</summary>
        /// <param name="imgUrl" type="String">图片地址</param>

        imgUrl = Cmn.Func.GetAbsoluteUrl(imgUrl);

        if (Cmn.Func.IsWeiXin()) {
            var _list = new Array();

            _list[0] = imgUrl;

            WeixinJSBridge.invoke('imagePreview', { 'current': $(this).attr('src'), 'urls': _list });
        }
        else { //不是微信浏览器

            //保存图片
            //var downloadMime = 'image/octet-stream';
            //strData = strData.replace("image/jpeg", downloadMime);
            //document.location.href = strData;


            var _oPop = window.open(imgUrl, "", "width=1, height=1, top=5000, left=5000");

            for (; _oPop.document.readyState != "complete";) {
                if (_oPop.document.readyState == "complete") break;
            }

            _oPop.document.execCommand("SaveAs");
            _oPop.close();
        }
    }
    //---------------------------------------
    //摇一摇
    Cmn.Func.Shake = function (threshold, fn) {
        /// <summary>摇一摇</summary>
        /// <param name="threshold" type="int">摇一摇灵敏度 默认800</param>
        /// <param name="fn" type="function">摇一摇触发之后执行的函数</param>
        var _self = this;
        _self.shakeCallbackFn = function () { };
        if (arguments.length == 1) {
            if (typeof arguments[0] == "function") { _self.shakeCallbackFn = arguments[0]; }
            if (typeof arguments[0] == "boolean") {
                window.IsShake = true;
                return 'undefined';
            }
        }
        else {
            _self.shakeCallbackFn = fn;
        }


        var SHAKE_THRESHOLD = threshold || 800;
        var lastUpdate = 0;
        var x, y, z, last_x, last_y, last_z;
        window.IsShake = true;
        window.IsBindShake = $("body").attr("shake");

        function deviceMotionHandler(eventData) {
            if (IsShake == false) { return; }
            var acceleration = eventData.accelerationIncludingGravity;
            var curTime = new Date().getTime();
            if ((curTime - lastUpdate) > 100) {
                var diffTime = (curTime - lastUpdate);
                lastUpdate = curTime;
                x = acceleration.x;
                y = acceleration.y;
                z = acceleration.z;
                var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;
                if (speed > SHAKE_THRESHOLD) {
                    if (!!fn && IsShake) { IsShake = false; _self.shakeCallbackFn(); }

                }
                last_x = x;
                last_y = y;
                last_z = z;
            }
        }
        if (!window.IsBindShake) {
            window.addEventListener("devicemotion", deviceMotionHandler, false);
            $("body").attr("shake", "true");
        }
    }

    Cmn.Func.ListenDeviceOrientation = function (deviceorientation) {
        /// <summary>监听设备方向</summary> 
        /// <param name="fn" type="function">触发的函数</param>
        /// <param name="angle" type="int">角度</param>
        /// <param name="orientation" type="Cmn.Func.DeviceOrientation">设备方向 默认Cmn.Func.DeviceOrientation.Horizontal</param>

        if (!window.DeviceMotionEvent) { return; }

        var _self = this;
        if (!_self.deviceorientation) { _self.deviceorientation = function () { }; }
        if (typeof deviceorientation == "function") { _self.deviceorientation = deviceorientation; }

        _self.beforAlpha = ""; //初始的alpha值 
        _self.beforBeta = "";//初始的beta值
        _self.beforGamma = "";//初始的gamma值
        _self.zRotationOrientation = "";//沿Z轴转动的方向 left or  right
        var _curDeviceOrientation = "Vertical"; //当前设备方向 默认是纵向
        if (!_curDeviceOrientation) { _curDeviceOrientation = "Vertical"; } //


        if (!_self.isBindListenDeviceOrientation) {
            window.addEventListener("deviceorientation", function (event) {
                // 处理event.alpha、event.beta及event.gamma


                var _beta = Math.ceil(event.beta);//当前的beta值
                var _alpha = Math.ceil(event.alpha);//当前的alpha值
                var _gamma = Math.ceil(event.gamma);//当前的gamma值

                //记录用户当前设备方向数据
                if (_self.beforAlpha == "") { _self.beforAlpha = _alpha }
                if (_self.beforBeta == "") { _self.beforBeta = _beta }
                if (_self.beforGamma == "") { _self.beforGamma = _gamma }

                //判断设备大方向
                if (Math.abs(_beta) < 60) { _curDeviceOrientation = "Horizontal"; }
                else { _curDeviceOrientation = "Vertical"; }

                if (_alpha && _self.beforAlpha != _alpha) {
                    var _alphaDiffe = _self.beforAlpha - _alpha;
                    if (Math.abs(_alphaDiffe) > 4) { _alphaDiffe = _alphaDiffe / (Math.abs(_alphaDiffe)) * -1; }
                    _self.beforAlpha = _alpha;
                    _self.deviceorientation(event, _alphaDiffe, _curDeviceOrientation);
                }

            }, true);

            _self.isBindListenDeviceOrientation = true;
        }

    }

    //------------------------------------待测试。。。


    //触摸滑动
    Cmn.Func.TouchSlide = function (selector, touchThreshold, moveFn, endFn, model, preventDefaultOrientation) {
        /// <summary>触摸滑动</summary>
        /// <param name="selector" type="string">触摸的容器选择器</param>
        /// <param name="touchThreshold" type="int">触摸滑动的距离</param>
        /// <param name="moveFn" type="function">touchmove触发之后执行的函数</param>
        /// <param name="endFn" type="function">touchend 触发之后执行的函数</param>
        /// <param name="model" type="string">1：touchmove 的时候触发一次 2：:touchmove的时候总是触发 默认为1</param>
        /// <param name="preventDefaultOrientation" type="string">禁用那个方向的默认事件 默认horizontal,vertical,all</param>
        var _$touchSlideBox = $(selector);
        if (_$touchSlideBox.length < 1) { return false; }
        var _startX = null;//起始x坐标
        var _startY = null;//其实y坐标
        var _direction = "";//滑动的方向
        if (!preventDefaultOrientation) { preventDefaultOrientation = "all"; }

        var _eventType = {
            touchstart: ("createTouch" in document) ? "touchstart" : "mousedown",
            touchmove: ("createTouch" in document) ? "touchmove" : "mousemove",
            touchend: ("createTouch" in document) ? "touchend" : "mouseup"
        }


        _$touchSlideBox.off(_eventType.touchstart).on(_eventType.touchstart, function (e) {
            e.stopPropagation();
            e = event.touches ? event.touches[0] : e;
            if (_startX == null && _startY == null) _startX = e.pageX; _startY = e.pageY;
        });
        _$touchSlideBox.off(_eventType.touchmove).on(_eventType.touchmove, function (ev) {
            ev.stopPropagation();
            var e = event.touches ? event.touches[0] : ev;

            if (_startX == null && _startY == null) { ev.preventDefault(); return; }
            var _transverseThreshold = Math.abs(e.pageX - _startX);
            var _vertical = Math.abs(e.pageY - _startY);

            if (_transverseThreshold > _vertical) {

                if (e.pageX - _startX > 0) {
                    if (Math.abs(e.pageX - _startX) > touchThreshold) {
                        //fn 第一个参数方向 第二个参数移动距离
                        _direction = "right";
                        if (!!moveFn) { moveFn(_direction, _transverseThreshold); }

                        if (!model || model == "1") { _startX = null; _startY = null; }
                        else { _startX = e.pageX; _startY = e.pageY; }
                    }
                }
                else if (e.pageX - _startX < 0) {

                    if (Math.abs(e.pageX - _startX) > touchThreshold) {
                        //fn 第一个参数方向 第二个参数移动距离
                        _direction = "left";
                        if (!!moveFn) { moveFn(_direction, _transverseThreshold); }

                        if (!model || model == "1") { _startX = null; _startY = null; }
                        else { _startX = e.pageX; _startY = e.pageY; }
                    }
                }
                if (preventDefaultOrientation != "vertical") ev.preventDefault();
            }
            else if (_transverseThreshold < _vertical) {

                if (e.pageY - _startY > 0) {
                    if (Math.abs(e.pageY - _startY) > touchThreshold) {
                        //fn 第一个参数方向 第二个参数移动距离
                        _direction = "down";
                        if (!!moveFn) { moveFn(_direction, _vertical); }

                        if (!model || model == "1") { _startX = null; _startY = null; }
                        else { _startX = e.pageX; _startY = e.pageY; }
                    }
                }

                else if (e.pageY - _startY < 0) {

                    if (Math.abs(e.pageY - _startY) > touchThreshold) {
                        //fn 第一个参数方向 第二个参数移动距离
                        _direction = "up";
                        if (!!moveFn) { moveFn(_direction, _vertical); }

                        if (!model || model == "1") { _startX = null; _startY = null; }
                        else { _startX = e.pageX; _startY = e.pageY; }
                    }
                }

                if (preventDefaultOrientation != "horizontal") ev.preventDefault();
            }
        });

        _$touchSlideBox.off(_eventType.touchend).on(_eventType.touchend, function (e) {
            e.stopPropagation();
            _startX = null; _startY = null;
            if (!!_direction && !!endFn) { endFn(_direction); }
            _direction = "";
        });
    }

    //------------------------------------图片懒加载
    Cmn.Func.ImageLazyLoading = function (selector, progressCallback, completeCallback, realUrlAttrName, loadCount) {
        /// <summary>图片懒加载 图片真实路径放到 lazypath 里面</summary>
        /// <param name="selector" type="string"> 要懒加载图片容器选择器 </param>
        /// <param name="progressCallback" type="function"> progressCallback 进度总大小为100</param>
        /// <param name="callback" type="function">所有图片loading完的回调</param>
        /// <param name="realUrlAttrName" type="string">真实路径的属性名称 默认lazypath </param>
        /// <param name="loadCount" type="int">每批加载的图片个数 </param>

        if (!selector) { selector = "body"; }
        if (!realUrlAttrName) { realUrlAttrName = "lazypath"; }
        if (!loadCount) { loadCount = 3; }

        //当前加载的图片个数
        var _loadCount = 0;
        //所有的图片元素
        var _$arrImg = $(selector).find("img[" + realUrlAttrName + "]") || $(selector).find("img");

        //需要加载的图片总数
        var _loadTotal = _$arrImg.length;

        if (_loadTotal == 0) {
            progressCallback && progressCallback(100, "");
            completeCallback && completeCallback(_error);
            return false;
        }

        //加载错误图片数组
        var _error = [];
        var _loadCompleteCount = 0;

        function _load(index) {
            var _count = index + loadCount;
            if (_count > _$arrImg.length) { _count = _$arrImg.length; }

            for (var _i = index; _i < _count; _i++) {
                var _item = _$arrImg[_i];

                if ($(_item).attr(realUrlAttrName) !== undefined) {
                    var _src = $(_item).attr(realUrlAttrName);
                    if (_src) { _preload(_src, _item, _i); }
                }
                else { _loadCount++; }
            }
        }

        _load(0);
        //loading
        function _preload(src, obj, index) {
            var _img = new Image();

            _img.onload = function () { _loadComplete(obj, src, false, index); };
            _img.onerror = function () { _loadComplete(obj, src, true, index); }
            _img.src = src;

            if (_img.complete) { _loadComplete(obj, src, false, index); }
        }

        //图片load的回调函数
        function _loadComplete(obj, src, isErr, index) {
            if (!$(obj).attr(realUrlAttrName)) { return; }

            $(obj).removeAttr(realUrlAttrName);
            _loadCount++;

            var _progress = Math.ceil(_loadCount / _loadTotal * 100);
            _progress = (_loadCount == _loadTotal ? 100 : _progress >= 100 ? 100 : _progress);

            if (isErr) { _error.push(src); }
            else { $(obj).attr("src", src); }

            progressCallback && progressCallback(_progress, src);

            if (_loadCount >= _loadTotal) { completeCallback && completeCallback(_error); }
            else {
                _loadCompleteCount++;
                if (_loadCompleteCount % loadCount == 0) { _load(_loadCompleteCount); }
            }
        }
    }
    //------------------------------------
    //精灵图动画
    Cmn.Func.FrameAnimation = (function () {

        var _FrameAnimation = function (selector, speed, count, callback) {
            this.frames = $(selector).eq(0).css({ "visibility": "visible" }).siblings().css({ "visibility": "hidden" });
            this.index = 0;
            this.interval = 0;
            this.Play(speed, count, callback);
        }


        _FrameAnimation.prototype = {
            Run: function (speed, count, callback) {
                var _sefl = this;
                _sefl.frames.eq(_sefl.index).css({ "visibility": "visible" }).siblings().css({ "visibility": "hidden" });
                _sefl.interval = setInterval(function () {
                    _sefl.index++;
                    _sefl.frames.eq(_sefl.index).css({ "visibility": "visible" }).siblings().css({ "visibility": "hidden" });
                    if (_sefl.frames.length - 1 <= _sefl.index) {
                        count--;
                        if (count <= 0) { _sefl.Stop(); _sefl.index = 0; callback && callback(); }
                        else { _sefl.index = 0; }
                    }

                }, speed);

            },
            Play: function (speed, isLoop, callback) {
                this.index = 0;
                this.Run(speed, isLoop, callback);
            },
            Stop: function () {
                window.clearInterval(this.interval);
            }
        }

        return function (selector, speed, count, callback) {
            /// <summary>精灵图动画</summary>
            /// <param name="selector" type="string"> 每一帧的选择器集合 </param>
            /// <param name="speed" type="function"> 多少毫秒渲染一帧</param>
            /// <param name="count" type="function">0代表不循环 循环次数</param>
            /// <param name="callback" type="string">非循环动画结束的回调 </param>
            return new _FrameAnimation(selector, speed, count, callback);
        }
    })();


    //队列动画控制
    Cmn.Func.AnimteQueue = (function () {

        var _AnimteQueue = function () {
            this.index = 0;
            this.queue = [];
            this.position = [];
            this.isStopQueue = true;
        }


        _AnimteQueue.prototype = {

            InitPostion: function (index) {
                this.index = index;
                for (var i = index; i < this.position.length; i++) {
                    if (typeof this.position[i] == "function") {
                        this.position[i].apply(this);
                    }
                }
            },
            Add: function (fun) {
                this.queue.push(fun);
                return this;
            },
            Run: function (index) {
                var _self = this;
                _self.index = index;
                var callback = function () {
                    _self.index++;
                    if (_self.index < _self.queue.length && _self.isStopQueue) {
                        _self.Run(_self.index);
                    }
                }

                this.position.push(this.queue[_self.index].apply(this, [callback]));

            },
            Start: function () {
                this.isStopQueue = true;
                this.Run(this.index);
            },
            Stop: function () {
                this.isStopQueue = false;
            }

        }

        return function () {

            return new _AnimteQueue();
        }

    })();



})();

