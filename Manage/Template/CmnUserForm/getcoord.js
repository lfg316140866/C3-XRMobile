
CmnMis.CurUserForm.EventUpdateInitComplete = function (recID, data) {

    GenGetPointControl();
}

function GenGetPointControl() {
    if ($(".JscGetcoord").length > 0) { return; }
    $("[name=address]").find("textarea").after('<input type="button" style="display: block;' +
                                                    ' float: left;' +
                                                    'position: relative;' +
                                                    'left: 403px;' +
                                                    'top: -48px;' +
                                                    'border: solid 2px #505050;' +
                                                    'width: 100px;' +
                                                    'text-indent: 2px;' +
                                                     'height: 40px;cursor:pointer;" class="JscGetcoord" value="获取坐标">' +
                                                     '<a href="http://api.map.baidu.com/lbsapi/getpoint/index.html" target="_blank"><div style="display: block;float: left;position: relative;left: 408px;top: -48px;border: solid 2px #505050;width: 100px;text-indent: 2px;height:37px;cursor:pointer;line-height:38px;font-size:15px;color:black;">百度获取坐标</div></a>');
    $(".JscGetcoord").click(function () {
        GetCode();
    })
  
}

function GetCode() {
    var _myGeo = new BMap.Geocoder();

    var _address = $("[name=address]").find("textarea").val();
    if (_address == "") {
        alert("请输入地址!");
        $("div[name=address]").find("textarea").focus();
        return;
    }
    if (!_myGeo) {
        alert("生成地图对象失败，请刷新后尝试！");
        return;
    }

    _myGeo.getPoint(_address, function (point) {
        if (point) {
            $("[name=coord_x]").find("input").val(point.lng);//.attr('disabled', 'disabled');
            $("[name=coord_y]").find("input").val(point.lat)
        } else {
            alert('您输入的地址有误，百度地图获取不到！');
        }
    }, "上海市");
}