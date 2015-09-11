/// <reference path="../Cmn.js" />
/// <reference path="../CmnAjax.js" />
/// <reference path="../ThirdLib/TweenMax.min.js" />
(function (window, undefined) {
    var Cg = window.Cmn,
        CgAjax = window.CmnAjax;


    //健壮性检测
    if (!Cg) { alert("为引用Cmn"); }
    if (!Cg.UI) { Cg.UI = {}; }

    //------------------------------插件基类
    Cg.UI.BasPlugin = function (resources) {

        //相对路径
        this.Resources = resources || [];
        //网站根目录
        this.RootPath = Cg.Func.GetJsPath("Cmn.js");
        //加载插件相关库
        this.Load();

    }

    Cg.UI.BasPlugin.prototype.Load = function () {
        /// <summary>load方法 </summary> 
        if (this.Resources.length < 1) { return; } 
        if (!CgAjax) { Cg.alert("CmnAjax.js 未引用！"); }

        //遍历加载资源
        for (var _i = 0; _i < this.Resources.length; _i++) {
            var _path = this.RootPath + this.Resources[_i];

            CgAjax.GetFile && CgAjax.GetFile(_path, function () { }, false);
        }

    }

    //------------------------------Cg.UI组件的扩展
    //
    $.extend(Cg.UI, {
        CanTouch: Cg.Func.IsMobile(),           //是否支持touch
        CanHtml5: typeof (Worker) !== "undefined",//是否支持html5
        KeyCode: {                                //键盘对应的键值
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
        },
        EventType: {
            Mousedown: Cg.Func.IsMobile() ? "touchstart" : "mousedown",
            Mousemove: Cg.Func.IsMobile() ? "touchmove" : "mousemove",
            Mouseup: Cg.Func.IsMobile() ? "touchend" : "mouseup"
        },
        StopBubble: function (e) {
            //如果提供了事件对象，则这是一个非IE浏览器
            //因此它支持W3C的stopPropagation()方法
            if (e && e.stopPropagation) { e.stopPropagation(); }
                //否则，我们需要使用IE的方式来取消事件冒泡
            else { window.event.cancelBubble = true; }

        },
        //阻止浏览器的默认行为
        StopDefault: function (e) {
            //阻止默认浏览器动作(W3C)
            if (e && e.preventDefault) { e.preventDefault(); }
                //IE中阻止函数器默认动作的方式
            else { window.event.returnValue = false; }
            return false;
        },
        GetSelectorName: function (selector) {
            /// <summary>获取选择器名称 去掉.#</summary>
            /// <param name="selector" type="String">选择器</param>
            return selector.replace(/[\s\S]*([\.]|[\#])/g, "")
        },

        //精灵帧动画
        FrameAnimation: function (selector, speed) {
            /// <summary>精灵帧动画</summary>
            /// <param name="selector" type="String">帧的选择器</param>


            return new function () {

                var _self = this;
                _self.frames = $(selector);                                 //帧集合
                _self.index = 0;                                            //当前索引
                _self.timer = 0;                                            //计时器

                var _length = _self.frames.length,                          //帧总长度
                    _speed = speed / _length,                               //速度
                    _playSort = "ASC";                                      //播放顺序 默认正序
                _isStop = true;                                         //是否停止

                //没有帧的时候直接返回
                if (_self.frames.length < 1) { return; }

                _self.onStop = function () { };                             //停止的事件

                _self.Init = function () {
                    /// <summary>初始化</summary>
                    window.clearInterval(_self.timer);
                    _self.frames.eq(_self.index).show().siblings().hide();
                    _isStop = true;
                }


                _self.Play = function () {
                    /// <summary>播放</summary>
                    this.PlayToStop();
                }

                _self.Stop = function () {
                    /// <summary>停止</summary>
                    window.clearInterval(_self.timer);
                }

                _self.PlayToStop = function (toIndex, speed) {
                    /// <summary>播放到某一帧停止</summary>
                    /// <param name="toIndex" type="String">目标帧</param>
                    /// <param name="speed" type="int">速度</param>

                    //目标帧数没传的话默认最后一帧
                    var _toIndex = _length;
                    if (!!toIndex) { _toIndex = toIndex; };
                    //当前播放多少帧
                    var _playFrameLen = _toIndex - _self.index;
                    //为0 的话直接返回
                    if (!_playFrameLen) { return; };

                    //小于当前帧的时候就是倒序播放
                    if (_playFrameLen < 0) { _playSort = "DESC"; }
                    else { _playSort = "ASC"; }

                    _playFrameLen = Math.abs(_playFrameLen);

                    //速度
                    if (!!speed) { _speed = (speed / _playFrameLen); }

                    window.clearInterval(_self.timer);

                    _self.timer = window.setInterval(function () {

                        if (_playSort == "ASC") {
                            _self.index++;
                            if (_self.index > _toIndex) {
                                _self.index = _toIndex;
                                window.clearInterval(_self.timer);
                                return;
                            }
                        }
                        else {
                            _self.index--;
                            if (_self.index < _toIndex) {
                                _self.index = _toIndex;
                                window.clearInterval(_self.timer);
                                return;
                            }
                        }

                        _self.frames.eq(_self.index).show().siblings().hide();


                    }, _speed);
                }
                _self.Init();
            }
        },
        //拖动
        Drag: function (selector, opt) {
            /// <summary>拖动</summary>
            /// <param name="selector" type="String">拖动对象选择器</param>
            /// <param name="opt" type="Jjon">拖动配置</param>

            var _self = this,
                _opt = $.extend({
                    dragParent: $("body"),                       //拖动元素的父亲
                    containment: $("body"),                     //拖动对象的拖动区域对象
                    drag: selector,                               //拖动元素本身
                    axis: "",                                       //拖动方向 x y 空
                    onStart: function () { },                       //开始拖动
                    onMove: function () { },                        //拖动
                    onEnd: function () { }                          //拖动结束
                }, opt),
            _isMoveDown = false,                              //是否点击
            _dragFn = {                                       //拖动私有函数     
                getMousePoint: function (ev) {
                    ev = event.touches ? event.touches[0] : ev;
                    return { 'x': ev.pageX, 'y': ev.pageY };
                }
            },
            _dragRect = null,                                     //拖动对象的区域     
            _astrict = null,                                      //限制的点       
            _nowPoint = { x: 0, y: 0 },                          //当前的点
            _initPoint = { x: 0, y: 0 },                         //初始的点
            _startPoint = { x: 0, y: 0 };                        //开始的点

            $(_opt.containment).css("position", "relative");
            $(_opt.containment).find(_opt.drag).css("position", "absolute");

            $(_opt.dragParent).undelegate(_opt.drag, _self.EventType.Mousedown, _dragStartHandle)
                .delegate(_opt.drag, _self.EventType.Mousedown, _dragStartHandle);

            function _dragStartHandle(e) {
                Cg.UI.StopBubble(e);
                Cg.UI.StopDefault(e);

                //如果在拖动状态就不允许点击
                if (_isMoveDown) { return false; }
                //点击

                _isMoveDown = true;
                //设置当前拖动对象
                _opt.drag = $(this);
                //设置限制的区域
                _astrict = { left: 0, right: $(_opt.containment).width(), top: 0, bottom: $(_opt.containment).height() };
                //设置拖动的区域初始位置
                _dragRect = { left: 0, right: 0, top: 0, bottom: 0 };
                //拖动物品的宽
                _dragWidth = _opt.drag.width();
                //拖动物品的高 
                _dragHeight = _opt.drag.height();

                _opt.containment = $(_opt.containment);
                //起始点
                _startPoint = _dragFn.getMousePoint(e);
                //初始点
                _initPoint = _opt.drag.position();
                //开始拖动的事件
                _opt.onStart.call(_opt.drag, _dragFn.getMousePoint(e));


                $(_opt.dragParent).off(_self.EventType.Mousemove).on(_self.EventType.Mousemove, _dragMoveHandle);

                function _dragMoveHandle (e) {
                    Cg.UI.StopBubble(e);
                    Cg.UI.StopDefault(e);//取消文档的默认行为[鼠标移动、触摸移动]
                    _nowPoint = _dragFn.getMousePoint(e);

                    var _moveCss = {}, _isDrag = false;


                    _dragRect.left = (_initPoint.left + _nowPoint.x - _startPoint.x);
                    _dragRect.top = (_initPoint.top + _nowPoint.y - _startPoint.y);
                    _dragRect.right = _dragWidth + _dragRect.left;
                    _dragRect.bottom = _dragRect.top + _dragHeight;

                    if (_opt.axis == "x") { _moveCss.left = _dragRect.left + "px"; }
                    else if (_opt.axis == "y") { _moveCss.top = _dragRect.top + "px"; }
                    else {
                        _moveCss.left = _dragRect.left + "px";
                        _moveCss.top = _dragRect.top + "px";
                    }
                    if (!!_opt.containment) {
                        if (((_astrict.left <= _dragRect.left && _astrict.right >= _dragRect.right) || (_opt.axis == "y"))
                            && ((_astrict.top <= _dragRect.top && _astrict.bottom >= _dragRect.bottom) || (_opt.axis == "x"))) {
                            _isDrag = true;
                        }
                    }
                    else { _isDrag = true; }
                    _isDrag = true;
                    if (_isDrag) { _opt.onMove.call(_opt.drag.css(_moveCss), _dragFn.getMousePoint(e)); }
                    return false;
                }


                $(window).off(_self.EventType.Mouseup).on(_self.EventType.Mouseup, _dragEndHandle);

                function _dragEndHandle(e) {
                    $(window).off(Cg.UI.EventType.Mouseup);
                    $(_opt.dragParent).off(Cg.UI.EventType.Mousemove);
                    _initPoint = { left: 0, top: 0 };
                    _isMoveDown = false;
                    _opt.onEnd.call(_opt.drag, _dragFn.getMousePoint(e));
                }
            }

        },
        //自定义滚动条
        CustomScroll: function (selector, opt) {
            /// <summary>自定义滚动条</summary>
            /// <param name="selector" type="String">容器选择器</param>
            /// <param name="opt" type="Json">插件配置</param>

            return new function () {

                var _self = this,
                    //容器
                    _container = $(selector),
                    //容器里面的类容
                    _content = $("<div>").css({ "height": "100%", "width": "100%", "overflow": "hidden", "position": "relative" })
                                .html(_container.html()).addClass("cmn-scrollContent").appendTo(_container.empty()),
                     //配置
                    _opt = $.extend({
                        selector: {   //选择器
                            ScrollBar: ".cmn-ScrollBar",                          //滚动条选择器
                            BarBtn: ".cmn-ScrollBarBtn"                           //滚动条按钮选择器
                        },
                        rollStyle: Cg.Animate.Easing.easeOutQuint,                //滚动的动画
                        dragBarAutoSize: false,                                   //拖动手柄是否自动计算高度
                        orientation: -1,                                          //滚动条方向 -1 竖 1 横 0 横竖都检测 
                        scrollWidth: _content.prop("scrollWidth"),                //scroll的宽度
                        scrollHeight: _content.prop("scrollHeight"),              //scroll的高度
                        onScrollBarDown: function () { },                         //鼠标按下滚动条
                        onScrollBarUp: function () { },                           //鼠标谈起滚动条
                        onStart: function () { },                                 //开始拖动
                        onMove: function () { },                                  //拖动
                        onEnd: function () { }                                    //拖动结束
                    }, opt),
                    _scrollBar = _container.find(_opt.selector.ScrollBar),        //滚动条
                    _scrollBarBtn = _container.find(_opt.selector.BarBtn),        //滚动条按钮
                    _scrollBarHeight = _scrollBar.outerHeight(true),              //滚动条高度
                    _scrollBarWidth = _scrollBar.outerWidth(true),                //滚动条宽度度
                    _scrollBarBtnHeight = _scrollBarBtn.outerHeight(true),        //滚动条按钮高度
                    _scrollBarBtnWidth = _scrollBarBtn.outerWidth(true),          //滚动条按钮宽度
                    _displayHeight = _container.innerHeight(),                    //显示区域的高度
                    _displayWidth = _container.innerWidth(),                      //显示区域的宽度
                    _step = 10,                                                   //当前鼠标滚动的时候滚动条滚动的步长
                    _curScrollBarBtnTop = 0,                                      //当前滚动条拖动按钮的高度
                    _curScrollHeight = 0,                                         //当前滚动条高度
                    _brforScrollHeight = 0;                                       //上一次滚动条的高度

                if (_container.length > 1) { alert("滚动条容器冲突！请检查！"); return; }

                //没有内容超出
                if (_opt.scrollHeight - _displayHeight <= 0) {
                    _scrollBar.hide();
                    return;
                }
                else { _scrollBar.show(); }

                //偷梁换柱 将原来的内容放到创建的容器里面去
                _container.append(_scrollBar);

                // 计算scrollbar 的高度
                _scrollBarHeight = _displayHeight - parseInt(_scrollBar.css("top")) * 2;
                _scrollBar.height(_scrollBarHeight);

                if (_opt.dragBarAutoSize) {
                    //计算滚动条按钮的高度
                    _scrollBarBtnHeight = _scrollBarHeight / _opt.scrollHeight * _scrollBarBtnHeight;
                    _scrollBarBtnHeight = _scrollBarBtnHeight < 30 ? 30 : _scrollBarBtnHeight;
                    _scrollBarBtn.height(_scrollBarBtnHeight);
                }

                //滚动条的行为
                _self.Scrollfn = {
                    roll: function (curScrollBarBtnTop) {
                        /// <summary>滚动滚动条</summary>
                        /// <param name="curScrollBarBtnTop" type="int">当前拖动按钮的位置</param>

                        _curScrollBarBtnTop = curScrollBarBtnTop || _curScrollBarBtnTop;
                        _scrollBarBtn.css("top", _curScrollBarBtnTop);
                        _curScrollHeight = (_opt.scrollHeight - _displayHeight) / (_scrollBarHeight - _scrollBarBtnHeight) * _curScrollBarBtnTop;

                        //之前和之后滚动条的差异超过滚动条滚动的步长2倍的时候启用动画
                        if (Math.abs(_brforScrollHeight - _curScrollHeight) > _step / 2) {
                            _content.stop(true, false).animate({ scrollTop: _curScrollHeight }, 300, _opt.rollStyle, function () {
                                _brforScrollHeight = _content.scrollTop();
                            });
                        }
                        else {
                            _content.stop(true, false).scrollTop(_curScrollHeight);
                        }
                        _brforScrollHeight = _curScrollHeight;
                    },
                    MouseDown: function (point) {
                        /// <summary>点击滚动条</summary>
                        /// <param name="point" type="JSON">点击的点</param>

                        //当前拖动按钮默认的tuo为当前点击的y点 - 当前多动按钮的一半
                        _curScrollBarBtnTop = point.y - _scrollBarBtnHeight / 2;

                        if (_scrollBarHeight - _curScrollBarBtnTop - _scrollBarBtnHeight < _step) {
                            _curScrollBarBtnTop = _scrollBarHeight - _scrollBarBtnHeight;
                        }
                        else if (_curScrollBarBtnTop - _step <= 0) { _curScrollBarBtnTop = 0; }

                        this.roll();
                    }
                }


                //----点击滚动条
                _scrollBar.off(Cg.UI.EventType.Mousedown).on(Cg.UI.EventType.Mousedown, function (event) {

                    if (event.which == 3) { return; }
                    event = event || window.event;

                    //点击的点
                    var _point = {
                        y: event.offsetY || event.originalEvent.layerY,
                        x: event.offsetX || event.originalEvent.layerX
                    }

                    _self.Scrollfn.MouseDown(_point);

                    _opt.onScrollBarDown(event);

                    return Cg.UI.StopBubble(event);
                });
                _scrollBar.off(Cg.UI.EventType.Mouseup).on(Cg.UI.EventType.Mouseup, function (event) {
                    _opt.onScrollBarUp(event);
                });
                //拖动

                Cg.UI.Drag(_scrollBarBtn, {
                    containment: _scrollBar, axis: "y",
                    onStart: function () { _opt.onStart(); },
                    onMove: function () {//拖动
                        _self.Scrollfn.roll(this.position().top);
                        _opt.onMove();
                    },
                    onEnd: function () { _opt.onEnd(); }

                });

                //鼠标滚轴
                if (Cg.UI.CanTouch) {

                }
                else {
                    //-------------------事件
                    _container.hover(function () { _scrollBar.fadeIn(300); }, function () { _scrollBar.fadeOut(300); });

                    _container.on('mousewheel DOMMouseScroll', function (event) {
                        var _delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;

                        if (_delta < 0) {
                            if (_curScrollBarBtnTop < _scrollBarHeight - _scrollBarBtnHeight) {

                                if (_scrollBarHeight - _curScrollBarBtnTop - _scrollBarBtnHeight < _step) {
                                    _curScrollBarBtnTop = _scrollBarHeight - _scrollBarBtnHeight;
                                }
                                else {
                                    _curScrollBarBtnTop = _curScrollBarBtnTop + _step;
                                }
                            }
                        } else if (_delta > 0) {
                            if (_curScrollBarBtnTop > 0) {
                                if (_curScrollBarBtnTop - _step <= 0) {
                                    _curScrollBarBtnTop = 0;
                                } else {
                                    _curScrollBarBtnTop = _curScrollBarBtnTop - _step;
                                }
                            }
                        }

                        _self.Scrollfn.roll();
                        Cg.UI.StopDefault(event);
                        return false;
                    });
                }

            }

        },
        //自定义下拉框
        CustomSelect: function (selector, data, option) {
            /// <summary>自定义下拉框</summary>
            /// <param name="selector" type="String">自定义下拉框主容器</param>
            /// <param name="data" type="JsonArray">option的项数据 json数组</param>
            /// <param name="option" type="Json">下拉框配置</param>
            /// <field name="opt" type="插件配置">控件配置</field>
            /// <field name="HideInput" type="jQuery">隐藏的输入框 一般用于值传递以及焦点控制</field>

            return new function () {
                /// <summary>自定义下拉框</summary>
                /// <field name="opt" type="插件配置">控件配置</field>
                /// <field name="HideInput" type="jQuery">隐藏的输入框 一般用于值传递以及焦点控制</field>

                var _self = this;
                //配置信息
                _self.opt = $.extend({
                    Selector: {},
                    OnChange:function(){}
                }, option);

                _self.Selector = $.extend({
                    Selector: selector,
                    ViewValue: ".cmn-SelectValue",                       //显示选择值的容器选择器                  
                    Icon: ".cmn-SelectIcon",                             //显示icon选择
                    IconState: ".cmn-SelectIconShow",                     //icon在下拉框展开之后的状态选择器
                    OptionContent: ".cmn-SelectOptionContent",           //下拉框内容面板选择器
                    OptionList: ".cmn-SelectOptionList",                 //下拉框项列表容器选择器
                    OoptionItem: ".cmn-SelectOptionItem",                 //下拉框项选择器
                    ScrollBar: ".cmn-ScrollBar",                        //滚动条选择器
                    BarBtn: ".cmn-ScrollBarBtn"                         //滚动条按钮选择器
                }, _self.opt.Selector);

                _self.SelfDom = $(_self.Selector.Selector);             //插件对象本身

                _self.State = false;                                    //当前控件的状态判断当前是否是失去焦点

                //隐藏的输入框 一般用于值传递以及焦点控制
                _self.HideInput = $("<input type=\"text\" class='cmn-SelectHideInput' />").css({ "position": "absolute", "top": "-100px", "left": "0px" });


                //展开list面板
                _self.OptionContentOpen = function () {
                    _self.SelfDom.find(_self.Selector.Icon).addClass(Cg.UI.GetSelectorName(_self.Selector.IconState));
                    _self.SelfDom.find(_self.Selector.OptionContent).stop().show();
                }

                //关闭list面板
                _self.OptionContentClose = function () {
                    _self.SelfDom.find(_self.Selector.Icon).removeClass(Cg.UI.GetSelectorName(_self.Selector.IconState));
                    _self.SelfDom.find(_self.Selector.OptionContent).slideUp(50);
                }

                //填充项
                this.SetValueList = function (arr) {
                    var _itemDom = _self.SelfDom.find(_self.Selector.OptionList).find(_self.Selector.OoptionItem).remove().eq(0);
                    var _itemList = _self.SelfDom.find(_self.Selector.OptionList);
                    $.each(arr, function (index, item) {
                        var _itemClone = _itemDom.clone(true, true),
                            _key = index,//键值
                            _val = item,//val
                            _data = [],//sql里面多余的值
                            _length = 0;//长度

                        if (Cg.Object.IsType(item, "object")) {
                            //遍历json里面的值
                            $.each(item, function (key, val) {
                                if (_length == 0) { _key = val; }               //拿到第一个给key
                                else if (_length == 1) { _val = val; }          //拿到第二个给value
                                else { _data.push({ "name": _key, "value": _val }); }// 保存多余的数据
                                _length++;
                            });
                        }

                        _itemClone.attr("value", _key);
                        _itemClone.html(_val);
                        _itemClone.data(_data);
                        _itemList.append(_itemClone);
                    });
                }
 
                //初始化
                this.Init = function (listValue) {
                    /// <summary>初始化插件</summary>
                    /// <param name="listValue" type="ArrayJson">填充的数据</param>

                    if (_self.SelfDom.find(".cmn-SelectHideInput").size() < 1) {
                        _self.SelfDom.append($("<div>").css({
                            "width": "1px", "height": "1px", "opacity": "0", "cursor": "pointer",
                            "position": "absolute", "top": "0px", "left": "0px", "overflow": "hidden"
                        }).append(_self.HideInput));
                    }

                    if (!!listValue) { _self.SetValueList(listValue); }


                    var _optionContent = _self.SelfDom.find(_self.Selector.OptionContent).css({ "opacity": "0", "filter": "alpha(opacity=0)" }).show(),
                        _option = _optionContent.find(_self.Selector.OoptionItem),
                        _optionTotalHeight = _option.eq(0).outerHeight(true) * _option.length;

                    if (_optionContent.innerHeight() > _optionTotalHeight) {
                        _optionContent.height(_optionTotalHeight);
                    }
                    else if (_optionContent.innerHeight() * 3 < _optionTotalHeight) {

                    }

                    if (_self.SelfDom.find(_self.Selector.ScrollBar).length > 0) {
                        //绑定滚动条
                        Cg.UI.CustomScroll(_optionContent, {
                            onScrollBarDown: function () { _self.State = true; },
                            onStart: function () { _self.State = true; },
                            onMove: function () { _self.State = true; },
                            onScrollBarUp: function () {
                                _self.HideInput.focus();
                                _self.State = false;
                            },
                            onEnd: function () {
                                _self.HideInput.focus();
                                _self.State = false;
                            }
                        });
                    }
                   

                    //初始化
                    _optionContent.hide().css({ "opacity": "1", "filter": "alpha(opacity=100)" });
                    _self.OptionContentClose();

                    //点击下拉框
                    _self.SelfDom.off("click").on("click", function () { _self.HideInput.focus(); });

                    //焦点移除的时候关闭
                    _self.HideInput.off("blur").on("blur", function () {
                        if (_self.State == false) { _self.OptionContentClose(); }
                    });

                    //获得焦点的时候打开
                    _self.HideInput.off("focus").on("focus", function () { _self.OptionContentOpen(); });

                    //选择某个项
                    _self.SelfDom.find(_self.Selector.OptionContent).off(Cg.UI.EventType.Mousedown)
                       .on(Cg.UI.EventType.Mousedown, _self.Selector.OoptionItem, function (e) {
                           _self.State = true;
                       });
                    _self.SelfDom.find(_self.Selector.OptionContent).off("click")
                        .on("click", _self.Selector.OoptionItem, function (e) {
                            Cg.UI.StopBubble();
                            var _text = $(this).text();
                            var _val = $(this).attr("value");
                            _self.HideInput.val(_val);
                            $(_self.Selector.ViewValue).html(_text);

                            _self.opt.OnChange.call(this, {
                                target: $(this),
                                value: _val,
                                text: _text
                            });

                            _self.State = false;
                            _self.HideInput.blur();
                        });

                    var _curItem = _self.SelfDom.find(_self.Selector.OoptionItem).eq(0);
                    $(_self.Selector.ViewValue).html(_curItem.text());
                    _self.HideInput.val(_curItem.attr("value"));
                };

                this.Init(Cg.Object.IsType(data, "array") ? data : {});


                //设值
                this.SetValue = function (val) {
                    var _curItem = _self.SelfDom.find(_self.Selector.OoptionItem + "[value=" + val + "]").eq(0);
                    
                    if (_curItem.length > 0) {
                        $(_self.Selector.ViewValue).html(_curItem.text());
                        _self.HideInput.val(val);
                    }
                    
                }

                //获取值
                this.GetValue = function () {
                    return _self.HideInput.val();
                }

            }


        },
        //自定义单选按钮
        CustomRadioBox: function (selector, data, option) {
            /// <summary>自定义单选按钮</summary>
            /// <param name="selector" type="String">自定义单选按钮主容器</param>
            /// <param name="data" type="JsonArray">option的项数据 json数组</param>
            /// <param name="option" type="Json">单选按钮配置</param>
            /// <field name="opt" type="插件配置">控件配置</field>
            /// <field name="HideInput" type="jQuery">隐藏的输入框 一般用于值传递以及焦点控制</field>


            return new function () {
                /// <summary>自定义下拉框</summary>
                /// <field name="opt" type="插件配置">插件配置</field>

                var _self = this;
                //配置信息
                _self.opt = $.extend({
                    Selector: {},
                    IsRequired:true,
                    InputName: "Cg_InputName" + "-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000)
                }, option);

                _self.Selector = $.extend({
                    Selector: selector,                                 
                    Item: ".cg-Radio-Item",
                    Selected: ".Select",
                    ItemText: ".cg-Radio-ItemText"
                }, _self.opt.Selector);

                _self.SelfDom = $(_self.Selector.Selector);             //插件对象本身
                 

                var _FormatValue = function (val) {
                    if (Cg.Object.IsType(val,"string") && val.toLowerCase() == "true") {
                        return 1;
                    }
                    else if (Cg.Object.IsType(val, "string") && val.toLowerCase() == "false") {
                        return 0;
                    }
                    
                    return val;
                }
  
                //填充项
                this.SetValueList = function (arr) {
                    var _itemDom = "";

                    if (!_self.SelfDom.find(_self.Selector.Item).length) {
                        _itemDom = _self.SelfDom.data("item");
                    }
                    else {
                        _itemDom = _self.SelfDom.find(_self.Selector.Item).remove().eq(0).removeClass(Cg.UI.GetSelectorName(_self.Selector.Selected));
                        _self.SelfDom.data("item", _itemDom);
                    }
                   

                    if (_itemDom.find("input[type=radio]").length < 1) {
                        _itemDom.append($('<input type="radio" name="' + _self.opt.InputName + '" />').hide());
                    }
                   
                    $.each(arr, function (index, item) {
                        var _itemClone = _itemDom.clone(true, true),
                            _key = _FormatValue(index),//键值
                            _val = item,//val
                            _data = [],//sql里面多余的值
                            _length = 0;//长度

                        if (Cg.Object.IsType(item, "object")) {
                            //遍历json里面的值
                            $.each(item, function (key, val) {
                                if (_length == 0) { _key = _FormatValue(val); }               //拿到第一个给key
                                else if (_length == 1) { _val = val; }                         //拿到第二个给value
                                else { _data.push({ "name": _key, "value": _val }); }          // 保存多余的数据
                                _length++;
                            });
                        }

                        _itemClone.attr("value", _key);
                        _itemClone.find(_self.Selector.ItemText).html(_val);
                        _itemClone.data(_data);
                        _self.SelfDom.append(_itemClone);
                    });
                }
                //初始化
                this.Init = function (listValue) {
                    /// <summary>初始化插件</summary>
                    /// <param name="listValue" type="ArrayJson">填充的数据</param>
                 
                    if (!!listValue) { _self.SetValueList(listValue); }
                    
                    _self.SelfDom.find(_self.Selector.Item).off("click").on("click", function (e) {
                        if ($(this).find("input")[0].checked) {
                            if (!_self.opt.IsRequired) { $(this).find("input")[0].checked = false; }
                            
                        }
                        else {
                            $(this).find("input")[0].checked = true;
                        }
                        _self.SelfDom.find("input").change();
                    });
        
                    _self.SelfDom.find("input").off("change").on("change", function () {
                        if ($(this)[0].checked) {
                            $(this).parents(_self.Selector.Item).eq(0).addClass(Cg.UI.GetSelectorName(_self.Selector.Selected));
                        }
                        else {
                            $(this).parents(_self.Selector.Item).eq(0).removeClass(Cg.UI.GetSelectorName(_self.Selector.Selected));
                        }
                    });

                };

                this.Init(Cg.Object.IsType(data, "array") ? data : {});

                //设值
                this.SetValue = function (val) {
                    if (!!val) {
                        var _input = _self.SelfDom.find(_self.Selector.Item + "[value=" + _FormatValue(val) + "]").find("input")[0];
                        if (!!_input) { _input.checked = true; }
                    }
                    else {
                        _self.SelfDom.find(_self.Selector.Item).find("input").attr("checked",false);
                    }
                    _self.SelfDom.find("input").change();
                }

                //获取值
                this.GetValue = function () {
                    return _self.SelfDom.find(_self.Selector.Selected).attr("value");
                }


            }

           

        },
        //自定义aotoComplete
        CustomAutoComplete: function (selector, dataItf, option) {
            /// <summary>自定义AutoComplete</summary>
            /// <param name="selector" type="String">input选择器</param>
            /// <param name="dataItf" type="JsonArray">数据接口地址</param>
            /// <param name="option" type="Json">下拉框配置</param>

            return new function () {
                //指向当前对象
                _self = this;
                //插件配置
                _self.option = $.extend({
                    Selector: {},
                    value: "data-val",                                //隐藏的值
                    SerializeParam: function (val) {                 //序列化参数列表
                        return { "param": val };
                    },
                    Limit: 30,                                      //检索的数据条数
                    FormatData: function (data) {                       //格式化显示的项
                        if (!!data && Cg.Object.IsType(data, "string")) { data = $.parseJSON(data); }
                        if (!!data.data) {
                            if (Cg.Object.IsType(data.data, "string")) { data = $.parseJSON(data.data); }
                            else { data = data.data; }
                        }
                        return data || {};
                    },
                    Change: function () { },                        //选择改变的时候触发的事件
                    Click: function () { }                          //点击选择的事件


                }, option);


                _self.Selector = $.extend({
                    Selector: selector,
                    InputSelector: ".Cg-AutoComplete-Input",     //输入框选择器
                    OptionList: ".Cg-AutoComplete-OptionList",   //显示的数据集合的容器选择器
                    Item: ".Cg-AutoComplete-Item",               //显示的项选择器
                    Text: ".Cg-AutoComplete-Text",               //显示的文本选择器
                    ItemSelect: ".Cg-AutoComplete-ItemHover"      //选中项的选择器
                }, _self.option.Selector);

                _self.DataItf = dataItf;                            //数据接口
                _self.SerializeParam = _self.option.SerializeParam;
                _self.onFormatData = _self.option.FormatData;               //格式化显示的项
                _self.onChange = _self.option.Change;               //选择改变的时候触发的事件
                _self.onClick = _self.option.Click;                 //点击选择的事件

                var _Container = $(_self.Selector.Selector),
                    _ItemTemp = _Container.find(_self.Selector.Item).remove().clone(true, true)
                    .removeClass(Cg.UI.GetSelectorName(_self.Selector.ItemSelect)),
                    _OptionList = _Container.find(_self.Selector.OptionList);

                if (!_OptionList.data("itemTemp")) { _OptionList.data("itemTemp", _ItemTemp); }

                //autoComplete输入框对象
                _self.AutoCompleteInput = _Container.find(_self.Selector.InputSelector).val("");

                //选择某个选项
                function _SelectItem(index) {
                    _OptionList.find(_self.Selector.Item).eq(index)
                      .addClass(Cg.UI.GetSelectorName(_self.Selector.ItemSelect))
                          .siblings(_self.Selector.Item).removeClass(Cg.UI.GetSelectorName(_self.Selector.ItemSelect));
                }

                //显示数据列表
                function _OpenItemPanel(data) {
                    _OptionList.empty().hide();
                    if (!data) {
                        _OptionList.find(_self.Selector.Item + "[" + _self.option.value + "=" + _self.AutoCompleteInput.attr(_self.option.value) + "]")
                        .addClass(Cg.UI.GetSelectorName(_self.Selector.ItemSelect))
                            .siblings(_self.Selector.Item).removeClass(Cg.UI.GetSelectorName(_self.Selector.ItemSelect));
                        _OptionList.show();
                        return false;
                    }
                    else if (!!data.length && data.length > 0) {
                        $.each(data, function (index, item) {
                            if (index > _self.option.Limit) { return; }
                            var _itemTempClone = _OptionList.data("itemTemp").clone(true, true);
                            var _itemTxtDom = _itemTempClone.find(_self.Selector.Text).length > 0 ?
                                _itemTempClone.find(_self.Selector.Text) : _itemTempClone;
                            if (Cg.Object.IsType(item, "object")) {
                                var _index = 0, _data = [];
                                $.each(item, function (key, val) {
                                    if (_index == 0) {
                                        _itemTempClone.attr(_self.option.value, val);
                                    }
                                    else if (_index == 1) {
                                        _itemTxtDom.text(val);
                                    }
                                    else {
                                        var _keyToVal = {};
                                        _keyToVal[key] = val;
                                        _data.push(_keyToVal);
                                    }
                                    _index++;
                                });
                                _itemTempClone.data(_data);
                            }
                            else {
                                _itemTempClone.attr(_self.option.value, index);
                                _itemTxtDom.text(item);
                            }

                            _OptionList.append(_itemTempClone);
                        });
                        _OptionList.show();
                    }


                }

                //设置值
                function _SetValue(val, text) {
                    if (val !== _self.AutoCompleteInput.attr(_self.option.value, val)) {
                        _self.AutoCompleteInput.val(text).attr(_self.option.value, val);
                        _self.option.Change({
                            val: val,
                            text: text
                        });
                    }
                }

                //隐藏数据列
                function _CloseItemPanel() { _OptionList.hide(); }

                //键盘按键事件句柄
                function _KeyDown(event) {

                    switch (event.keyCode) {
                        case Cg.UI.KeyCode.HOME:
                            break;
                        case Cg.UI.KeyCode.END:
                            break;
                        case Cg.UI.KeyCode.UP:

                            Cg.UI.StopDefault(event);
                            break;
                        case Cg.UI.KeyCode.DOWN:
                            Cg.UI.StopDefault(event);
                            break;
                        case Cg.UI.KeyCode.LEFT:

                            break;
                        case Cg.UI.KeyCode.RIGHT:

                            break;
                        case Cg.UI.KeyCode.ENTER:
                        case Cg.UI.KeyCode.SPACE:
                            //this._activate(event);
                            break;
                        case Cg.UI.KeyCode.BACKSPACE:

                            break;
                        case Cg.UI.KeyCode.ESCAPE:

                            break;
                        default:

                            break;
                    }
                }
                function _KeyUp(event) {
                    Cg.UI.StopBubble(event);
                    Cg.UI.StopDefault(event);
                    switch (event.keyCode) {
                        case Cg.UI.KeyCode.HOME:
                            //  this._move("first", "first", event);
                            break;
                        case Cg.UI.KeyCode.END:
                            // this._move("last", "last", event);
                            break;
                        case Cg.UI.KeyCode.UP:
                            var _index = _OptionList.find(_self.Selector.Item).index($(_self.Selector.ItemSelect));

                            _index = _index <= 0 ? 0 : _index--;
                            _SelectItem(_index);
                            Cg.UI.StopDefault(event)
                            break;
                        case Cg.UI.KeyCode.DOWN:
                            var _index = _OptionList.find(_self.Selector.Item).index($(_self.Selector.ItemSelect));
                            _index = _index <= 0 ? -1 : _index;
                            _index = _index >= _OptionList.find(_self.Selector.Item).length - 1 ? _OptionList.find(_self.Selector.Item).length - 1 : _index++;
                            _SelectItem(_index);

                            break;
                        case Cg.UI.KeyCode.LEFT:

                            break;
                        case Cg.UI.KeyCode.RIGHT:

                            break;
                        case Cg.UI.KeyCode.ENTER:
                        case Cg.UI.KeyCode.SPACE:
                            _Search.call(this);
                            break;
                        case Cg.UI.KeyCode.BACKSPACE:
                            if (!$(this).val()) { _CloseItemPanel(); }
                            else { _Search.call(this); }
                            break;
                        case Cg.UI.KeyCode.ESCAPE:
                            //this.collapse(event);
                            break;
                        default:
                            _Search.call(this);
                            break;
                    }
                }
                //搜索
                function _Search() {
                    //当前输入框的内容
                    var _val = $(this).val();//.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");

                    if (/[\S]+/.test((Cg.Object.IsType(_val, "string") ? _val : "").trim())) {

                        CgAjax.PostData(_self.DataItf, _self.SerializeParam(_val), function (data) {
                            data = _self.onFormatData(data);
                            _OpenItemPanel(data);
                        })
                    }
                }

                _self.AutoCompleteInput.off("keyup").on("keyup", _KeyUp);
                _self.AutoCompleteInput.off("keydown").on("keydown", _KeyDown);
                _self.AutoCompleteInput.off("blur").on("blur", function () { _CloseItemPanel(); });
                _self.AutoCompleteInput.off("focus").on("focus", function () {
                    if (!!$(this).val()) {
                        if (_Container.find(_self.Selector.Item).length > 0) {
                            _OptionList.show();
                        }
                        else { _Search.call(this); }
                    }

                });

                _OptionList.undelegate(Cg.UI.EventType.Mousedown)
                          .delegate(_self.Selector.Item, Cg.UI.EventType.Mousedown, function (e) {
                              if (event.which == 3) { return; }
                              event = event || window.event;

                              _SetValue($(this).attr(_self.option.value), $(this).text());

                          });

            }
        }

    });

    //=============================================================
    Cmn.Extend(Cmn.UI, {
        //图片切换模式
        ImageCarouselModel: {
            //3d 卡片切换
            ThreeDCard: "ThreeDCard"
        },
        //图片轮播插件 默认 3 d 切换
        ImageCarousel: function (selector, option) {
            /// <summary>图片轮播插件 默认3d卡片切换 ThreeDCard </summary>
            /// <param name="selector" type="String">容器选择器</param>
            /// <param name="option" type="Json">插件配置</param>

            //指向当前UI对象
            var _Self_UI = this;
          
            return new function () {
               
                //指向当前插件
                var _Self_IC = this,
                    //当前插件容器对象
                    _ic_Container = $(selector);

                _Self_IC.Option = Cmn.Extend({
                    //模式
                    Model: _Self_UI.ImageCarouselModel.ThreeDCard,
                    //自动
                    Auto: false,
                    //速度
                    Speed: 460,
                    //切换的项
                    Item: ".cmn-ui-item",
                    //控件宽度
                    Width: 0,
                    //高度
                    Height:0,
                    //项索引
                    IndexItem: ".cmn-ui-index",
                    //选中选择器
                    Selected: ".Selected",
                    //默认显示索引
                    DefaultIndex:0

                }, option);
             
 
                //获取下一个索引
                _Self_IC.GetNextIndex = function (index) {
                    index = (index == undefined) ? _index : index;
                    if (index >= _ic_item.length - 1) { return 0; }
                    else { return (index + 1); }
                }

                //获取上一个索引
                _Self_IC.GetPrevIndex = function (index) {
                    index = (index == undefined) ? _index : index;
                    if (index <= 0) { return _ic_item.length - 1; }
                    else { return (index - 1); }
                }

                //切换项
                var _ic_item = $(selector).find(_Self_IC.Option.Item),
                    _isRunComplete = true,
                    //当前索引
                    _index = _Self_IC.Option.DefaultIndex,
                    _nextIndex = _Self_IC.GetNextIndex(),
                    _prevIndex = _Self_IC.GetPrevIndex();

                //初始化 size
                if (_Self_IC.Option.Width == 0) {
                    _Self_IC.Option.Width = _ic_Container.width();
                }

                if (_Self_IC.Option.Height == 0) {
                    _Self_IC.Option.Height = _ic_Container.height();
                }

                //初始化容器视距
                //如果是3d卡片切换的话  初始化视距
                if (_Self_IC.Option.Model == _Self_UI.ImageCarouselModel.ThreeDCard) {
                    TweenMax.set(_ic_Container, {
                        perspective: 900,
                        transformStyle: "preserve-3d",
                        perspectiveOrigin: "50% 50%",
                        width: _Self_IC.Option.Width,
                        height: _Self_IC.Option.Height
                    });

                    TweenMax.set(_ic_item, {
                        zIndex: 0, z: (_Self_IC.Option.Width/2)*-1,
                        width: _Self_IC.Option.Width,
                        height: _Self_IC.Option.Height
                    });

                    TweenMax.set(_ic_item.eq(_index), { zIndex: 3, z: "0px" });
                    TweenMax.set(_ic_item.eq(_nextIndex), { zIndex: 2, x: (_Self_IC.Option.Width / 2) });
                    TweenMax.set(_ic_item.eq(_prevIndex), { zIndex: 2, x: (_Self_IC.Option.Width / 2) * -1 });
                    
                }

                //下一个
                _Self_IC.Next = function () {
                    /// <summary>下一页</summary>
                    var _distance = _ic_item.width() / 2;
                    var _next = function (index,callback) {

                        var _param = {
                            zIndex: 0, x: (_Self_IC.Option.Width / 2) * -1, z: (_Self_IC.Option.Width / 2) * -1, onComplete: function () {
                                if (index == _Self_IC.GetNextIndex(_nextIndex)) {
                                    _prevIndex = _index;
                                    _index = _nextIndex;
                                    _nextIndex = index;
                                    callback && callback();
                                }
                            }
                        };

                        if (index == _prevIndex) {
                            _param.zIndex = 0;
                            _param.x = 0;
                        }
                        else if (index == _index) {
                            _param.zIndex = 2;
                            _param.x = (_Self_IC.Option.Width / 2) * -1;
                            _param.z = _param.x;
                        }
                        else if (index == _nextIndex) {
                            _param.zIndex = 3;
                            _param.x = 0;
                            _param.z = 0;
                        }
                        else {
                            _param.zIndex = 2;
                            _param.x = (_Self_IC.Option.Width / 2);
                        }

                        TweenMax.to(_ic_item.eq(index), _Self_IC.Option.Speed / 1000, _param);
                        if (index != _Self_IC.GetNextIndex(_nextIndex)) {
                            _next(_Self_IC.GetNextIndex(index), callback);
                        }
                    }

                    if (_isRunComplete) {
                        _isRunComplete = false;
                        _next(_prevIndex, function () {
                            _isRunComplete = true;
                        }); 
                    }
                   
                }

                //上一个
                _Self_IC.Prev = function () {
                    /// <summary>上一页</summary>

                    var _next = function (index, callback) {

                        var _param = {
                            zIndex: 0, x: 0, z: (_Self_IC.Option.Width / 2) * -1, onComplete: function () {
                                if (index == _Self_IC.GetPrevIndex(_prevIndex)) {
                                    _nextIndex = _index;
                                    _index = _prevIndex;
                                    _prevIndex = index;
                                    callback && callback();
                                }
                            }
                        };

                        if (index == _prevIndex) {
                            _param.zIndex = 3;
                            _param.x = 0;
                            _param.z = 0;
                           
                        }
                        else if (index == _index) {
                            _param.zIndex = 2;
                            _param.x = (_Self_IC.Option.Width / 2);
                            _param.z = _param.x*-1;
                        }
                        else if (index == _nextIndex) {
                            _param.zIndex = 0;
                            _param.x = 0;
                        }
                        else {
                            _param.zIndex = 2;
                            _param.x = (_Self_IC.Option.Width / 2)*-1;
                        }

                        TweenMax.to(_ic_item.eq(index), _Self_IC.Option.Speed / 1000, _param);
                        if (index != _Self_IC.GetPrevIndex(_prevIndex)) {
                            _next(_Self_IC.GetPrevIndex(index), callback);
                        }
                    }

                    if (_isRunComplete) {
                        _isRunComplete = false;
                        _next(_nextIndex, function () {
                            _isRunComplete = true;
                        });
                    }

                }
            }
        }

    });

})(window);





