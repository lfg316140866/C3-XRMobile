/// <reference path="ScenesSwitch.js" />
///Version:3.0 改了几个事件名
///Version:2.0 加了菜单支持
///Version:1.0
/// <reference path="../jquery-1.8.3.js" />
/// <reference path="Scenes.js" />
(function (window, undefined) {

    var _AnimateFrame = function () {
        /// <summary>动画框架</summary>
        /// <field name="CurScenes" type="Scenes">当前场景</field>
        /// <field name="allScenes" type="Scenes">所有场景数组</field>

        /// <summary>当前场景对象 默认为空</summary>
        this.CurScenes = null;
        /// <summary>是否锁定场景 默认不锁定</summary>
        this.IsLockScenes = false;
        /// <summary>选择器</summary>
        this.Selector = {
            /// <field name="AnimteFrameContainer" type="String">框架容器选择器</field>
            AnimteFrameContainer: ".cmn-AnimteFrameContainer",
            /// <field name="ScenesContainer" type="String">场景容器选择器</field>
            ScenesContainer: ".cmn-ScenesContainer",
            /// <field name="Scenes" type="String">场景选择器</field>
            Scenes: ".cmn-Scenes",
            /// <field name="MenuContainer" type="String">菜单容器</field>
            MenuContainer: ".cmn-MenuContainer",
            /// <field name="Menu" type="String">菜单</field>
            Menu: ".cmn-Menu",
            /// <field name="MenuItem" type="String">菜单项</field>
            MenuItem: ".cmn-MenuItem"
        }
        //所有场景队列
        this.allScenes = [];

        //场景切换参数
        this.ScenesChangeParam = {
            EnterSpeed: null,
            QuitSpeed: null
        }

        /// 当前用户的响应;1:向下切换场景;-1：向上切换场景
        var _UserOperations = 1;
        //所有场景队列
        var _AllScenes = [];
        //场景切换模式
        var _SwitchModel = "";
        //场景回退的方向
        var _DirectionAsc = "";
        //场景进入的方向
        var _DirectionDesc = "";
        //场景容器的选择器
        var _Selector = "";
        //之前的场景对象
        var _BeforScenes = null;
        //框架对象本身
        var _Self = this;
        //场景是否在切换
        var _IsChangingScene = null;
        //缓存用户点击的最后一个场景
        var _CacheToScene = {
            scenesNoOrID: "",
            swtichMode: "",
            direction: "",
            funcAfterShow: ""
        };
        //记录最后的动画时间
        var _LastAnimateTime = 0;
        //记录开始不切换场景的时间
        var _StartStopChangeScenesTime = 0;
        //记录最后一次鼠标滚动的Delta
        var _LastRollerSwitchDelta = 0;
        //标记当前在一次touchmove的过程中是否执行完毕切换动作
        var _IsTouchComplete = false;

        //----------------------------------
        this.OnUserWantToChangeScenes = function (allScenes, index, userOperations) {
            /// <summary>场景切换之前触发的事件</summary>
            /// <param name="allScenes" type="array">当前所有的场景</param>
            /// <param name="index" type="index">当前显示的场景下标</param>
            /// <param name="userOperations" type="int">当前用户的响应;1:向下切换场景;-1：向上切换场景</param>
        }
        //----------------------------------
        this.OnBeforeScenesChange = function (hideScenes, showScenes) {
            /// <summary>场景切换之前触发的事件</summary>
            /// <param name="hideScenes" type="Scenes">当前隐藏的场景</param>
            /// <param name="showScenes" type="Scenes">当前显示的场景</param>
        }
        //----------------------------------
        this.OnScenesAfterHide = function (scenes) {
            /// <summary>场景隐藏的之后触发</summary>
            /// <param name="scenes" type="Scenes">当前要改变的场景</param>
        }
        //----------------------------------
        this.OnScenesAfterShow = function (scenes) {
            /// <summary>场景显示之后触发</summary>
            /// <param name="scenes" type="Scenes">当前显示的场景</param>
        }
        //----------------------------------
        this.OnScenesLoadAllComplete = function () {
            /// <summary>所有场景加载完毕之后的回调</summary>
        }
        //----------------------------------
        this.OnRollerSwitchScenes = function (delta, toScenesNo) {
            /// <summary>当鼠标滚轮触发场景切换的时候调用</summary>
        }
        //----------------------------------
        this.OnKeyboardSwitchScenes = function (toScenesNo) {
            /// <summary>当键盘触发场景切换的时候调用</summary>
        }
        this.OnTouchSwitchScenes = function (toScenesNo) {
            /// <summary>当触摸事件触发场景切换的时候调用</summary>
        }
        //----------------------------------
        var ScenesIDToNo = function (ScenesID) {
            /// <summary>将场景id转成对应的index</summary>
            var _scenesno = 0;
            if ($.type(ScenesID) == "string" && ScenesID != "") {
                for (var i = 0; i < _AllScenes.length; i++) {
                    var _item = _AllScenes[i];

                    if (_item.ID == ScenesID) {
                        _scenesno = _item.ScenesNo;
                        break;
                    }
                }
            }

            return _scenesno;
        }
        //----------------------------------
        //监测 场景是否需要初始化（加载场景）
        var InitScenes = function (index) {
            var _scenes = _AllScenes[index],
                _index = index,
                _isNeedInit = false;

            _scenes.Init(function () {
                //处理url参数跳转场景
                var _scenesIDFromUrl = Cmn.Func.GetParamFromUrl("ScenesID");

                if (_scenesIDFromUrl != "") {
                    if (ScenesIDToNo(_scenesIDFromUrl) == _index) {
                        _Self.SlideTo(_index, ScenesSwitch.None, Direction.None, _scenes.OnJumpFromUrl);
                    }
                } else {
                    var _scenesNoFromUrl = Cmn.Func.GetParamFromUrl("ScenesNo");

                    if (_scenesNoFromUrl != "" && parseInt(_scenesNoFromUrl) == _index) {
                        _Self.SlideTo(_index, ScenesSwitch.None, Direction.None, _scenes.OnJumpFromUrl);
                    }
                }


                if (_Self.CurScenes != null && _Self.CurScenes.HasLoad == false) { //当前场景没有加载
                    _isNeedInit = true;
                    _index = _Self.CurScenes.ScenesNo;
                }
                else {
                    for (var _i = 0; _i < _AllScenes.length; _i++) {
                        if (!_AllScenes[_i].HasLoad) {
                            _isNeedInit = true;
                            _index = _i;

                            break;
                        }
                    }
                }

                //如果是当前场景的话触发相关事件
                if (_Self.CurScenes.ScenesNo == _scenes.ScenesNo) {
                    _Self.OnScenesAfterShow(_scenes);
                    _scenes.OnScenesAfterShow();
                }

                if (_isNeedInit) {
                    if (_AllScenes.length > 0 && _index == 1) {

                        _Self.CurScenes.Show(SwitchMode.None, Direction.None, function (scenes) {
                            _Self.OnScenesAfterShow(scenes);
                            scenes.OnScenesAfterShow();
                            scenes.RunQueueAnimate(0);
                            scenes.AnimateMan.RunAutoRunAnimate();
                        });
                    }

                    InitScenes(_index);
                }
                else {

                    _Self.OnScenesLoadAllComplete();
                }
            });
        }
        //----------------------------------
        var InitMenu = function () {
            /// <summary>初始化菜单</summary>

            var _menuContainer = $(_Self.Selector.MenuContainer);

            if (_menuContainer.length <= 0) { return false; } //找不到菜单容器返回


            //绑定菜单点击事件
            _menuContainer.find(_Self.Selector.Menu).unbind("click").bind("click", function () {
                var _scenesid = $(this).attr("scenesid");

                if (_scenesid != undefined && _scenesid != "") {
                    _Self.SlideTo($(this).attr("scenesid"));
                }
                else {
                    var _parent = $(this);

                    for (var _i = 0; _i < 4; _i++) {
                        if (_parent.find(_Self.Selector.MenuItem).length > 0) {
                            _Self.SlideTo(_parent.find(_Self.Selector.MenuItem).first().attr("scenesid").split(",")[0]);
                            break;
                        }

                        _parent = _parent.parent();
                    }
                }
            });

            //绑定菜单项点击事件
            _menuContainer.find(_Self.Selector.MenuItem).unbind("click").bind("click", function () {
                _Self.SlideTo($(this).attr("scenesid").split(",")[0]);
            });
        }
        //----------------------------------
        var ActiveMenu = function (scenesID) {
            /// <summary>选中某个菜单</summary>
            /// <param name="scenesID" type="String">场景id</param>

            var _menuContainer = $(_Self.Selector.MenuContainer);

            if (_menuContainer.length <= 0) { return false; } //找不到菜单容器返回

            //读取菜单配置
            var _cfg = _menuContainer.attr("cfg");

            if (typeof _cfg == "string" && _cfg != "") {
                try { _cfg = eval("(" + _cfg + ")"); }
                catch (err) {
                    Cmn.Log("菜单配置错误！错误信息：" + err.message);

                    return false;
                }
            }

            if (_cfg == undefined) { return false; }

            //var _menuItem = _menuContainer.find(AnimateFrame.Selector.MenuItem + "[scenesid = '" + scenesID + "']");
            var _menuItem = _menuContainer.find(_Self.Selector.MenuItem + "[scenesid *= '" + scenesID + "']");

            //加菜单项的选中状态
            if (_cfg.MenuItemActiveClass != undefined) {
                _menuContainer.find(_Self.Selector.MenuItem).removeClass(_cfg.MenuItemActiveClass);
                _menuItem.addClass(_cfg.MenuItemActiveClass);
            }

            //加菜单的选中状态
            if (_cfg.MenuActiveClass != undefined) {
                _menuContainer.find(_Self.Selector.Menu).removeClass(_cfg.MenuActiveClass);

                var _parent = _menuItem.parent();

                for (var _i = 0; _i < 3; _i++) {
                    if (_parent.hasClass(_Self.Selector.Menu.replace(".", ""))) {
                        _parent.addClass(_cfg.MenuActiveClass);
                        break;
                    }
                    else if (_parent.find(_Self.Selector.Menu).length > 0) {
                        _parent.find(_Self.Selector.Menu).addClass(_cfg.MenuActiveClass);
                        break;
                    }

                    _parent = _parent.parent();
                }
            }

            return true;
        }
        //----------------------------------
        this.GetNextScenesNo = function (fromScenesIndex) {
            /// <summary>取得下一个场景的序号(在正常场景队列中)</summary>
            /// <param name="fromScenesIndex" type="int">从哪个场景序号开始</param>

            if (fromScenesIndex == undefined) { fromScenesIndex = _Self.CurScenes.ScenesNo; }

            var _toScenesIndex = fromScenesIndex;
            var _scenesQueueName = _Self.allScenes[fromScenesIndex].ScenesQueueName;

            for (var _i = fromScenesIndex + 1; _i < _Self.allScenes.length; _i++) {
                if (_Self.allScenes[_i].IsInNormalQueue == true && _Self.allScenes[_i].ScenesQueueName == _scenesQueueName) {
                    _toScenesIndex = _i; break;
                }
            }

            return _toScenesIndex;
        }
        //----------------------------------
        this.GetPreScenesNo = function (fromScenesIndex) {
            /// <summary>取得前一个场景的序号(在正常场景队列中)</summary>
            /// <param name="fromScenesIndex" type="int">从哪个场景序号开始</param>

            if (fromScenesIndex == undefined) { fromScenesIndex = _Self.CurScenes.ScenesNo; }

            var _toScenesIndex = fromScenesIndex;
            var _scenesQueueName = _Self.allScenes[fromScenesIndex].ScenesQueueName;

            for (var _i = fromScenesIndex - 1; _i >= 0; _i--) {
                if (_Self.allScenes[_i].IsInNormalQueue == true && _Self.allScenes[_i].ScenesQueueName == _scenesQueueName) {
                    _toScenesIndex = _i; break;
                }
            }

            return _toScenesIndex
        }

        //----------------------------------
        this.GetPreNormalQueueNo = function (fromScenesIndex) {
            /// <summary>取得前一个分组的序号(在正常场景队列中)</summary>
            /// <param name="fromScenesIndex" type="int">从哪个场景序号开始</param>

            if (fromScenesIndex == undefined) { fromScenesIndex = _Self.CurScenes.ScenesNo; }
            var _scenesQueue = [];
            var _scenesQueueName = _Self.allScenes[fromScenesIndex].ScenesQueueName;

            for (var _i = fromScenesIndex - 1; _i >= 0; _i--) {
                if (_Self.allScenes[_i].IsInNormalQueue == true && _Self.allScenes[_i].ScenesQueueName != _scenesQueueName) {
                    _scenesQueueName = _Self.allScenes[_i].ScenesQueueName;
                    _scenesQueue.push(_i);
                    for (var _j = _i - 1; _j >= 0; _j--) {
                        if (_Self.allScenes[_j].IsInNormalQueue == true && _Self.allScenes[_j].ScenesQueueName == _scenesQueueName) {
                            _scenesQueue.push(_j);
                        }
                    }

                    break;
                }
            }
            if (_scenesQueue.length == 0) { _scenesQueue.push(fromScenesIndex); }
            return _scenesQueue[_scenesQueue.length - 1];
        }

        //----------------------------------
        this.GetNextNormalQueueNo = function (fromScenesIndex) {
            /// <summary>取得下一个分组的序号(在正常场景队列中)</summary>
            /// <param name="fromScenesIndex" type="int">从哪个场景序号开始</param>


            if (fromScenesIndex == undefined) { fromScenesIndex = _Self.CurScenes.ScenesNo; }

            var _toScenesIndex = fromScenesIndex;
            var _scenesQueueName = _Self.allScenes[fromScenesIndex].ScenesQueueName;

            for (var _i = fromScenesIndex + 1; _i < _Self.allScenes.length; _i++) {
                if (_Self.allScenes[_i].IsInNormalQueue == true && _Self.allScenes[_i].ScenesQueueName != _scenesQueueName) {
                    _toScenesIndex = _i; break;
                }
            }

            return _toScenesIndex;
        }


        //----------------------------------
        var RollerSwitchScenes = function (delta) {
            /// <summary>滚轴切换场景</summary>
            var _scenesIndex = _Self.CurScenes.ScenesNo;

            if (delta > 0) {
                _UserOperations = -1;
                _scenesIndex = _Self.GetPreScenesNo(_scenesIndex);
            }
            else {
                _UserOperations = 1;
                _scenesIndex = _Self.GetNextScenesNo(_scenesIndex);
            }

            if (_Self.OnRollerSwitchScenes(delta, _scenesIndex) === false) { return; }
            _Self.SlideTo(_scenesIndex);
        }

        //----------------------------------
        var DirectionSwitchScenes = function (ev) {
            /// <summary>键盘方向键切换场景</summary>
            /// <param name="ev" type="event">事件对象</param>

            var _index = _Self.CurScenes.ScenesNo, _direction = "";

            switch (ev.keyCode) {
                case 38:          //up
                    ev.preventDefault();
                    _UserOperations = -1;
                    _index = _Self.GetPreScenesNo(_index);
                    _direction = Direction.Down;
                    break;
                case 40:           //down
                    ev.preventDefault();
                    _UserOperations = 1;
                    _index = _Self.GetNextScenesNo(_index);
                    _direction = Direction.Up;
                    break;
                case 37:            //left
                    ev.preventDefault();
                    _UserOperations = -1;
                    _index = _Self.GetPreScenesNo(_index);
                    _direction = Direction.Right;
                    break;
                case 39:            //right
                    ev.preventDefault();
                    _UserOperations = 1;
                    _index = _Self.GetNextScenesNo(_index);
                    _direction = Direction.Left;
                    break;
                default:
                    break;
            }

            if (_Self.OnKeyboardSwitchScenes(_index) === false || !_direction) { return; }
            _Self.SlideTo(_index, _SwitchModel, _direction);
        }

        //--------------------------------------- 暂时未开发---------------//

        var TouchListenScoll = function (dir, distance) {
            /// <summary>触摸的时候监听是否有scroll 有的话滚动scroll</summary>
            /// <param name="dir" type="String">方向</param>
            /// <param name="distance" type="移动距离">方向</param>
            return false;
        }
        //----------------------------------暂时未开发 ---------------------//
        var TouchSwitchScenes = function (e, offsetX, offsetY) {
            /// <summary>触摸切换场景</summary>
            /// <param name="offsetX" type="String">手指落下的x坐标</param>
            /// <param name="offsetY" type="String">手指落下的y坐标</param>
            if (_IsTouchComplete) { return false; }
            //达到切换的距离,(确定触摸的敏感度)
            var _achieveSlideToDistance = 50,
                //当前场景的索引
                _scenesIndex = _Self.CurScenes.ScenesNo,
                 //向上下滑动的距离
                _touchUpAndDownDistance = Math.abs(e.pageY - offsetY),
                 //向左右滑动的距离
                _touchLeftAndRightDistance = Math.abs(e.pageX - offsetX),
                //方向
                _direction = "";

            //此时用户的行为是左右滑动的
            //if (_touchLeftAndRightDistance > _touchUpAndDownDistance && _touchLeftAndRightDistance > _touchUpAndDownDistance) {

            //    if (e.pageX - offsetX > 0) {
            //        //向左滑
            //        if (TouchListenScoll("L", _touchLeftAndRightDistance)) { return false; }
            //        else if (Math.abs(e.pageX - offsetX) > _achieveSlideToDistance) {
            //            _scenesIndex = _Self.GetPreScenesNo(_scenesIndex);
            //            _direction = Direction.Right;
            //            _UserOperations = -1;
            //        }

            //    }
            //    else if (e.pageX - offsetX < 0) {
            //        //向右滑

            //        if (TouchListenScoll("R", _touchLeftAndRightDistance * -1)) { return false; }
            //        else if (Math.abs(e.pageX - offsetX) > _achieveSlideToDistance) {
            //            _scenesIndex = _Self.GetNextScenesNo(_scenesIndex);
            //            _direction = Direction.Left;
            //            _UserOperations = 1;
            //        }
            //    }

            //}
            //else 
            if (_touchLeftAndRightDistance < _touchUpAndDownDistance) {

                if (e.pageY - offsetY > 0) {
                    //向上
                    if (TouchListenScoll("U", _touchLeftAndRightDistance)) { return false; }
                    else if (Math.abs(e.pageY - offsetY) > _achieveSlideToDistance) {
                        _scenesIndex = _Self.GetPreScenesNo(_scenesIndex);
                        _direction = Direction.Down;
                        _UserOperations = -1;
                    }

                }
                else if (e.pageY - offsetY < 0) {
                    //向下
                    if (TouchListenScoll("D", _touchLeftAndRightDistance * -1)) { return false; }
                    else if (Math.abs(e.pageY - offsetY) > _achieveSlideToDistance) {
                        _scenesIndex = _Self.GetNextScenesNo(_scenesIndex);
                        _direction = Direction.Up;
                        _UserOperations = 1;
                    }

                }

            }

            if (_Self.CurScenes.ScenesNo != _scenesIndex) {
                if (_IsTouchComplete == false) {
                    _IsTouchComplete = true;

                    if (_Self.OnTouchSwitchScenes(_scenesIndex) === false) { return false; }

                    AnimateFrame.SlideTo(_scenesIndex, _SwitchModel, _direction);

                    return true;
                }
            }

            return false;
        }
        //----------------------------------
        var BindEvent = function () {
            /// <summary>这里绑定所有的动画监听事件 包括 mousewheel 移动端的</summary>

            //是否支持touch事件
            var _supportsTouches = ("createTouch" in document),
                //记录手指坐标
               _offsetX = null, _offsetY = null;

            if (_supportsTouches) {  //Touches
                $(_Selector).on("touchstart", function (e) {
                    //e.preventDefault();
                    e = event.touches ? event.touches[0] : e;
                    _offsetX = e.pageX; _offsetY = e.pageY;
                });

                $(_Selector).on("touchmove", function (e) {
                    e.preventDefault();
                    e = event.touches ? event.touches[0] : e;
                    var _timeNow = new Date().getTime();

                    if (_timeNow - _LastAnimateTime < 50 + _Self.CurScenes.Speed) { return; }

                    //触摸切换场景
                    if (TouchSwitchScenes(e, _offsetX, _offsetY)) {

                        _LastAnimateTime = _timeNow;

                        _offsetX = _offsetY = null;
                    }
                });

                $(_Selector).on("touchend", function (e) {
                    _IsTouchComplete = false;
                    _offsetX = _offsetY = null;
                });
            }
            else {  //mousewheel
                $(_Selector).bind('mousewheel DOMMouseScroll', function (event) {

                    event.preventDefault();
                    var _delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
                    var _timeNow = new Date().getTime();
                    if (_timeNow - _StartStopChangeScenesTime < 500) {

                        if ((_LastRollerSwitchDelta <= 0 && _delta <= 0) || (_LastRollerSwitchDelta > 0 && _delta > 0)) {
                            //方向和上次一致，就忽略
                            return;
                        }
                    }

                    _LastRollerSwitchDelta = _delta;

                    //滚轴切换场景
                    RollerSwitchScenes(_delta);

                    _StartStopChangeScenesTime = _timeNow;
                });
            }

            //绑定键盘切换场景
            _Self.BindKeyboardSwitch();
        }
        //----------------------------------
        this.UnBindKeyboardSwitch = function () {
            /// <summary>解除绑定键盘切换场景</summary>
            $(document).off("keydown", DirectionSwitchScenes);
        }
        //----------------------------------
        this.BindKeyboardSwitch = function () {
            /// <summary>绑定键盘切换场景</summary>
            _Self.UnBindKeyboardSwitch();
            $(document).on("keydown", DirectionSwitchScenes);
        }
        //----------------------------------
        this.Init = function (speed, switchModel, directionAsc, directionDesc, easing) {
            /// <summary>初始化所有动画元素 包括场景</summary>
            /// <param name="speed" type="int">切换的时间</param>
            /// <param name="switchModel" type="ScenesSwitch">切换的模式</param>
            /// <param name="directionAsc" type="Direction">场景正序切换时的方向</param>
            /// <param name="directionDesc" type="Direction">场景倒序切换时的方向</param>
            /// <param name="directionDesc" type="Direction">场景切换的方式 默认 swing</param>
            _DirectionAsc = directionAsc || Direction.Up;
            _DirectionDesc = directionDesc || Direction.Down;
            _SwitchModel = switchModel || SwitchMode.Shifting;
            _Selector = _Self.Selector.AnimteFrameContainer;

            //初始化框架容器的样式
            $(_Selector + " , " + _Self.Selector.ScenesContainer).css({
                "width": "100%",
                "height": "100%",
                "width": "100%",
                "top": "0px",
                "position": "relative",
                "left": "0px"
            });
            $(_Self.Selector.ScenesContainer).css({ "position": "absolute" });

            //加载初始化场景对象
            $(_Self.Selector.Scenes).each(function (index, item) {
                $(item).css({ "height": "100%", "width": "100%", "display": "none", "opacity": "0", "position": "absolute", "z-index": "0" });
                var scenes = new Scenes(item, speed, easing);
                _AllScenes.push(scenes);
                scenes.ScenesNo = index;

                //设置场景队列名称
                var _scenesQueueName = $(item).attr("scenesqueuename");
                if ($(item).attr("scenesqueuename") == undefined) { _scenesQueueName = ""; }
                scenes.ScenesQueueName = _scenesQueueName; //设置队列名称
            });

            this.CurScenes = _BeforScenes = _AllScenes[0];

            this.allScenes = _AllScenes;
            //初始化场景
            InitScenes(0);
            //初始化菜单
            InitMenu();
            ActiveMenu(_Self.CurScenes.ID);
            //绑定事件
            BindEvent();

            return _Self;

        }
        //----------------------------------
        this.SlideTo = function (scenesNoOrID, swtichMode, direction, funcAfterShow) {
            /// <summary>场景切换</summary>
            /// <param name="scenesNoOrID" type="int">场景的序号或者id </param>
            /// <param name="swtichMode" type="string">切换的模式 </param>
            /// <param name="directionDesc" type="Direction">出场的方向id </param>
            /// <param name="funcAfterShow" type="function">场景显示的回调函数 </param>
            //看是不是正在切换场景，如果是，记录要切换的场景，并退出
            if (_IsChangingScene === true) {
                _CacheToScene.scenesNoOrID = scenesNoOrID;
                _CacheToScene.swtichMode = swtichMode;
                _CacheToScene.direction = direction;
                _CacheToScene.funcAfterShow = funcAfterShow;
                return;
            }

            //是否正在切换场景
            _IsChangingScene = true;
            //场景切换动画停止次数
            var _stopCount = 0;
            //场景的下标
            var _scenesIndex = 0;
            var _ChangingSceneComplete = function () {
                /// <summary>切换场景结束调用的函数(可能是切换失败的)</summary>

                _BeforScenes = _Self.CurScenes;



                _IsChangingScene = false;

                if (_CacheToScene.scenesNoOrID !== "") {
                    var _tmpToScene = _CacheToScene.scenesNoOrID;
                    _CacheToScene.scenesNoOrID = "";
                    _Self.SlideTo(_tmpToScene, _CacheToScene.swtichMode, _CacheToScene.direction, _CacheToScene.funcAfterShow);
                }
            }

            //找到要切换到的场景index
            if (typeof scenesNoOrID == "string" && scenesNoOrID != "") {
                _scenesIndex = ScenesIDToNo(scenesNoOrID);
            }
            else if (typeof scenesNoOrID == "number") { _scenesIndex = scenesNoOrID; }
            else { _ChangingSceneComplete(); return; }


            //用户当前的操作的事件
            if (_Self.OnUserWantToChangeScenes(_AllScenes, _scenesIndex, _UserOperations) === false) {
                _ChangingSceneComplete(); return;
            }


            //如果是当前场景，或者超出范围 或者场景被锁定，则直接返回
            if (_scenesIndex == _Self.CurScenes.ScenesNo
                || _scenesIndex < 0
                || _scenesIndex > _AllScenes.length - 1
                || _Self.IsLockScenes) {
                _ChangingSceneComplete(); return;
            }

            //设置当前场景
            _Self.CurScenes = _AllScenes[_scenesIndex];

            //选中菜单
            ActiveMenu(_Self.CurScenes.ID);


            //if (!_Self.CurScenes.HasLoad) { _Self.CurScenes.Init(); }//初始化当前场景
            _BeforScenes.AnimateMan.ExitScene(); //退出上一个场景



            //设置进场退场速度
            if (_Self.ScenesChangeParam.QuitSpeed !== null) { _BeforScenes.Speed = _Self.ScenesChangeParam.QuitSpeed; }
            if (_Self.ScenesChangeParam.EnterSpeed !== null) { _Self.CurScenes.Speed = _Self.ScenesChangeParam.EnterSpeed; }

            //场景切换事件
            _Self.OnBeforeScenesChange(_BeforScenes, _Self.CurScenes);

            if (_scenesIndex < _BeforScenes.ScenesNo) { //当前场景序号小于上个场景，向上切换
                _BeforScenes.AnimateMan.Stop();

                _BeforScenes.Hide(swtichMode || _SwitchModel, direction || _DirectionDesc, function (scenes) {
                    scenes.AnimateMan.Stop();
                    scenes.AnimateMan.Init();
                    _Self.OnScenesAfterHide(scenes);
                    scenes.OnScenesAfterHide();

                    if (++_stopCount == 2) { _ChangingSceneComplete(); }

                });


                _Self.CurScenes.Show(swtichMode || _SwitchModel, direction || _DirectionDesc, function (scenes) {
                    _Self.OnScenesAfterShow(scenes);
                    scenes.OnScenesAfterShow();
                    scenes.RunQueueAnimate(0);
                    scenes.AnimateMan.RunAutoRunAnimate();

                    if (++_stopCount == 2) { _ChangingSceneComplete(); }
                    if ($.type(funcAfterShow) == "function") { funcAfterShow(); }

                });

            }
            else { //向下切换
                _BeforScenes.AnimateMan.Stop();

                _BeforScenes.Hide(swtichMode || _SwitchModel, direction || _DirectionAsc, function (scenes) {
                    scenes.AnimateMan.Stop();
                    scenes.AnimateMan.Init();
                    _Self.OnScenesAfterHide(scenes);
                    scenes.OnScenesAfterHide();

                    if (++_stopCount == 2) { _ChangingSceneComplete(); }
                });


                _Self.CurScenes.Show(swtichMode || _SwitchModel, direction || _DirectionAsc, function (scenes) {
                    _Self.OnScenesAfterShow(scenes);
                    scenes.OnScenesAfterShow();
                    scenes.RunQueueAnimate(0);
                    scenes.AnimateMan.RunAutoRunAnimate();

                    if (++_stopCount == 2) { _ChangingSceneComplete(); }
                    if ($.type(funcAfterShow) == "function") { funcAfterShow(); }

                });


            }
        }
    }

    window.AnimateFrame = new _AnimateFrame();

})(window)