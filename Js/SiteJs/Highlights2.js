/// <reference path="../animate/AnimateFrame.js" />
/// <reference path="../jquery-1.9.1.min.js" />
/// <reference path="../Cmn.js" />
/// <reference path="../CmnAjax.js" />

//锁定滑动屏幕
AnimateFrame.OnTouchSwitchScenes = function () { return false; }

$(function () {

    //页面加载之后
    //是否第一次进入旋转场景
    var _IsFirstToRevolve = false;
    //是否第一次进入经销商场景
    var _IsFirstToDealer = false;
    AnimateFrame.OnScenesAfterShow = function (scenes) {
        //360°旋转如果在旋转场景中默认给到红色车型
        if (scenes.ID == "revolve") {
            if (_IsFirstToRevolve) { return; }
            var _framesArr = [];
            for (var _i = 6; _i > 0 ; _i--) {
                _framesArr.push('images/360/red/car_red' + _i + '_03' + '.png');
            };
            //调用到绑定滚动
            RotateImg(".car_red1_03 img", _framesArr);
            _IsFirstToRevolve = true;
        }

        //查询经销商默认给到北京市
        if (scenes.ID == "dealer") {
            if (_IsFirstToDealer) { return; };
            var _shcityid = "1024"
            CmnAjax.PostData("Itf/Php/Itf.php?method=Dealers", { "city_id": _shcityid }, function (dat) {
                if (dat.IsSuccess == "1") {
                    NewBaiduMap(dat);
                    _IsFirstToRevolve = true;
                }
                else {
                    _IsFirstToRevolve = false;
                }
            });
        }
    }


    //经销商查询
    //填充省下拉框
    CmnAjax.FillData(".JscProvince", "Itf/Php/Itf.php?method=Province", {}, function (dat) {
        if (dat.IsSuccess == "1") {
            ProvinceCityChange();
            $("#DealerProvince").change();
        }
    });

    //填充城市下拉框
    function ProvinceCityChange() {
        $("#DealerProvince").on("change", function () {
            var _provinceid = $(this).val();
            CmnAjax.FillData(".JscCity", "Itf/Php/Itf.php?method=City", { "province_id": _provinceid }, function (dat) {
                if (dat.IsSuccess == "1") {

                }
                else {

                }
            });
        });
    };

    //点击查找经销商
    $(".JscDealer_btn").on("click", function () {
        //判断城市ID是否为空
        var _cityid = $("#DealerCity").val();
        if (_cityid != "") {
            CmnAjax.PostData("Itf/Php/Itf.php?method=Dealers", { "city_id": _cityid }, function (dat) {
                if (dat.IsSuccess == "1") {
                    NewBaiduMap(dat);
                }
                else {

                }
            });
        }
    });

    //百度地图
    function NewBaiduMap(dat) {
        if (dat.data.length > 0) {
            window.map = new BMap.Map("l-map");
            map.centerAndZoom(new BMap.Point((dat.data[0]["coord_x"] == "" ? 121.481144 : dat.data[0]["coord_x"]), (dat.data[0]["coord_y"] == "" ? 31.233107 : dat.data[0]["coord_y"])), 10);
            //map.centerAndZoom(new BMap.Point(121.47985,31.225202), 10);
            map.addControl(new BMap.MapTypeControl());   //添加地图类型控件
            map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
            for (var _i = 0; _i < dat.data.length; _i++) {
                if (dat.data[_i]["coord_x"] == "" || dat.data[_i]["coord_y"] == "")
                { continue; }
                var point = new BMap.Point(dat.data[_i]["coord_x"], dat.data[_i]["coord_y"]);// 创建标注
                _address = "地址：" + dat.data[_i]["address"] + "<br/>销售热线：" + dat.data[_i]["sales_phone"] + "<br/>售后预约：" + dat.data[_i]["service_phone"];
                addMarker(point, dat.data[_i]["dealer_desc"], "http://" + Cmn.Func.GetMainDomain(location.href) + "/images/Maplogo.gif", _address, dat.data[_i]["dealer_desc"]);
            }
        };
    }
    function addMarker(point, sStoreName, pic, address, Title) {  // 创建图标对象   
        var _logoSize = {
            width: 35,
            height: 35
        }
        var myIcon = new BMap.Icon(pic,
            new BMap.Size(_logoSize.width, _logoSize.height), {
                // 指定定位位置。     
                // 当标注显示在地图上时，其所指向的地理位置距离图标左上      
                // 角各偏移7像素和25像素。您可以看到在本例中该位置即是     
                // 图标中央下端的尖角位置。      
                anchor: new BMap.Size(15, 37)
            });
        // 创建标注对象并添加到地图     
        var marker = new BMap.Marker(point, { icon: myIcon });
        map.addOverlay(marker);
        marker.addEventListener("click", function (e) {
            map.openInfoWindow(infoWindow, marker.getPosition());      // 打开信息窗口
        });
        var opts = {
            width: 250,     // 信息窗口宽度      
            height: 120,     // 信息窗口高度      
            title: Title,  // 信息窗口标题
            enableMessage: false//设置允许信息窗发送短息(关闭掉小手机)
        }
        var infoWindow = new BMap.InfoWindow(address, opts);  // 创建信息窗口对象
    };


    //亮点

    //场景当前下标
    var _HomeKvIndex = 0;
    //是否正在执行动画
    var _IsAnimate = false;
    //执行动画的速度
    var _AnimateSpeed = 300;
    //执行的动画元素
    var _AnimateObj = $(".bright_nav>li");
    //捕捉滑动事件
    Cmn.Func.TouchSlide(_AnimateObj, 20, function (dir) {
        if (_IsAnimate) { return; }
        _IsAnimate = true;
        //所有场景长度
        var _length = _AnimateObj.length;
        if (dir == "left") {
            //跑当前下标场景
            _AnimateObj.eq(_HomeKvIndex).animate({ "left": "-100%" }, _AnimateSpeed, function () {
                $(this).hide();
            });
            //将下一场景的下标赋值成当前下标
            _HomeKvIndex = (_HomeKvIndex + 1) == _length ? 0 : (_HomeKvIndex + 1);
            //跑下一个场景
            _AnimateObj.eq(_HomeKvIndex).css("left", "100%").show().animate({ "left": "0%" }, _AnimateSpeed, function () {
                _IsAnimate = false;
            });
        }
        else if (dir == "right") {
            _AnimateObj.eq(_HomeKvIndex).animate({ "left": "100%" }, _AnimateSpeed, function () {
                $(this).hide();
            });
            _HomeKvIndex = (_HomeKvIndex == 0 ? (_length - 1) : (_HomeKvIndex - 1));
            _AnimateObj.eq(_HomeKvIndex).css("left", "-100%").show().animate({ "left": "0%" }, _AnimateSpeed, function () {
                _IsAnimate = false;
            });
        }
        //跟着滑动的小东西
        $(".drag_bar").stop(true).animate({ "left": (12.3) * _HomeKvIndex - 3 + "%" }, _AnimateSpeed);
    });


    //360°旋转

    //滑动旋转车子
    $(".revolve_nav>li").on("touchstart", function () {
        //当前圈圈选中状态
        $(".revolve_nav>li").removeClass("color_select");
        $(this).addClass("color_select");
        //拿到当前车子颜色的属性
        var _carColor = $(this).attr("carcolor");
        //将所有颜色的车子先隐藏
        $(".color_car").hide();
        //显示当前选中的车子
        $(".color_car[carcolor=" + _carColor + "]").show();
        //选择到每个旋转图片
        var _obj = $(".color_car[carcolor=" + _carColor + "]").children(".car_box").children("img");
        //通过滑动循环显示6张图片
        var frames = SpriteSpin.sourceArray('images/360/' + _carColor + '/car_' + _carColor + '{frame}_03' + '.png', {
            frame: [1, 6],
            digits: 1
        });
        //调用到绑定滚动
        RotateImg(".car_" + _carColor + "1_03", frames);
    });
    function RotateImg(ImgSelector, ImgArryList) {

        $(ImgSelector).spritespin({
            source: ImgArryList,
            width: 640,
            height: 1040,
            frames: ImgArryList.length,
            behavior: "drag", // "hold"
            module: "360",
            sense: 1,
            animate: false,
            loop: true,
            frameWrap: true,
            frameStep: 1,
            frameTime: 10,
            loopFrame: 10,
            renderer: 'background',
            onLoad: function () {
                
            }
        });

    };
});





