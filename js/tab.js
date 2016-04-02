/**
 * tab.js 学习和分析
 * @author libaoxu 2016-03-20
*/
(function ($) {

    /**
     * Tab选项卡
     * @param {string} el 选项卡当前的a标签
     */
    var Tab = function (el) {
        this.elem = $(el);
    };

    Tab.prototype.show = function () {
        var $ElemA = this.elem;//这个就是那个点击的a标签
        var $Ul = $ElemA.closest('ul'); //最近的父级ul
        var targetSelector = $ElemA.data('target');

        //data-target 和 href 二选一
        if ( !targetSelector ) {
            targetSelector = $ElemA.attr('href');
            targetSelector = targetSelector && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        //如果是该tab-pane已经active了, 再点击就返回
        if ($ElemA.parent('li').hasClass('active')) return;

        var $PreviousA = $Ul.find('.active a')[0]; //当前的li.ative下的a标签, 是下一个 li.active a标签 的前li.active a
        //绑定自定义事件
        var e          = $.Event('show.bao.tab', {
            relatedTarget: $PreviousA
        });
        //触发自定义事件 提供tab.js api中开始show的接口(详情见tab.js api: http://v3.bootcss.com/javascript/)
        $ElemA.trigger(e);

        var $Target = $(targetSelector);
		$Target.trigger('show.bao.tabPane');

        //点击的a的li, 即将变为active的li
        this.activeChange($ElemA.parent('li'), $Ul);

        //tab-content中 oTarget的active变化
        this.activeChange($Target, $Target.parent(), function () {
            //提供a标签展示之后(shown)的api接口
            $ElemA.trigger({
                type: 'shown.bao.tab',
                relatedTarget: $PreviousA
            });
            //tab-pane 区域展示后(shown) 的api接口
            //trigger 传过去的参数 可以再绑定该自定义事件函数中 通过e(即第一个参数) e.relatedTarget 获得
			$Target.trigger({
                type: 'shown.bao.tabPane',
				element: $ElemA,
                relatedTarget: $PreviousA
            });
        });
    };

    /**
     * tab中 两个区域
     * @param  {$}   $TargetElement [目标的元素(jq对象, 非dom对象)]
     * @param  {$}   container      [承载元素的容器]
     * @param  {Function} callback       [回调函数]
     * @return {[type]}                  [description]
     */
    Tab.prototype.activeChange = function ($TargetElement, container, callback) {
        var $NowActive = container.find('> .active'); //当前的active元素
        var supportTransitionEvent = $.support.transition.end; //页面加载完就获取到的transtion兼容事件, 详见transition.js
        var canTransition = callback && supportTransitionEvent && $NowActive.hasClass('fade');

        function end() {
            $NowActive.removeClass('active');

            $TargetElement.addClass('active');

            if (canTransition) {
				$TargetElement[0].offsetWidth;
                $TargetElement.addClass('in');
            } else {
                $TargetElement.removeClass('fade');
            }

            callback && callback.call($TargetElement);
        }

        //绑定一次性 transtion事件, 即只执行一次,
        //防止每次点击都绑定, 绑定多次, 会多次执行多洗 end函数
        // emulateTransitionEnd transiton.js会有说明
        canTransition
            ? $NowActive.one(supportTransitionEvent, end).emulateTransitionEnd(150)
            : end();

        //透明度为1, 元素属性变化, 会触发 supportTransitionEvent对应的 end函数
        $NowActive.removeClass('in');
    };

    // 如果全局已经有一个 $.fn.tab 了 ,则先存一下, 下边接着用这个名, 回头吧old 通过noConflict传回去
    var old = $.fn.tab;

    /*
        把tab放到$.fn上, 如果问$. 与 $.fn 的区别 去学习下基本的jq吧
        这里简单说下, $.fn 就是 $(selector)一样, 所以 下面可以$(this).tab('show'); 进行调用tab
     */
    $.fn.tab = function ( option ) {
        return this.each(function () {
            var $This = $(this);
            var data = $This.data('bao.tab');
            //单例
            if (!data) {
                //(data = new Tab(this)) 括号内赋值运算, 再data('bao.tab', data); 运算
                $This.data('bao.tab', (data = new Tab(this)));
            }
            //data 就是 new Tab() 的对象, 可以使用期构造函数
            //如果string 为show, 则 data.show(); 则执行 Tab.prototype.show();
            //所以简单的面向对象知识还需要了解的
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    //起一个Constructor属性, 而不是 $.fn.tab.prototpe.constructor的指向更改,
    $.fn.tab.Constructor = Tab;

    //防止冲突
    $.fn.tab.noConflict = function () {
        //把old 值给回 $.fn.tab 那个已经有的值了, 然后返回this --> $.fn.tab
        $.fn.tab = old;
        return this;
    };

    //给document统一加点击事件, 并带有命名空间, 通过冒泡来实现tab功能
    $(document).on('click.bao.tab', '[data-toggle="tab"]', function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

})(jQuery);
