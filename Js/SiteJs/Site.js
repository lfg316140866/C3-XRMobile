
 
$(function () {

    //指向当前程序作用域
    var _Self = this;

    //页面加载的时候的业务逻辑
    (PageLoad = new function () {
        /// <summary>页面加载的时候的业务逻辑</summary>
            
        this.ResLoadComplete = function () {
            /// <summary>资源加载完成之后</summary>
            

        }

        //AnimateFrame.OnBeforeScenesChange = function (hideScenes, showScenes) {
        //    _Self[showScenes.ID].Init();
        //}

    });


    //首页业务逻辑 此处名称可以和页面对应起来 也可以和场景ID对应
    (Home = new function () {
        /// <summary>首页业务逻辑</summary>

        //设置网站默认分享
        SiteFunc.Share("设置网站默认分享");

        //获取随机数
        var _random = SiteFunc.GetRandom();

        //调用测试检测
        SiteFunc.Testing("进入首页场景");

        PageLoad.ResLoadComplete = function () {


        }

        //绑定点击首页场景触发的事件
        $("#Home").click(function () { })

        this.Init = function () {
            /// <summary>页面或者场景的初始化</summary>

        }

        this.a=2;

    });


    //首页业务逻辑 此处名称可以和页面对应起来 也可以和场景ID对应
    (Product = new function () {
        /// <summary>首页业务逻辑</summary>

        //获取随机数
        var _random = SiteFunc.GetRandom();

        //调用测试检测
        SiteFunc.Testing("进入产品场景");


        this.Init = function () {
            /// <summary>页面或者场景的初始化</summary>

        }

    });

});


