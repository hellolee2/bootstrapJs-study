/**
 * tab.js 学习
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

        var $PreviousA = $Ul.find('.active a')[0]; //前一个ative 下的 a标签
        var e          = $.Event('show.bao.tab', {
            relatedTarget: $PreviousA
        });
        //提供tab.js api中开始show的接口(详情见tab.js api: http://v3.bootcss.com/javascript/)
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
			$Target.trigger({
                type: 'shown.bao.tabPane',
				element: $ElemA,
                relatedTarget: $PreviousA
            });
        });
    };

    /**
     * tab中 两个区域
     * @param  {[type]}   $TargetElement [description]
     * @param  {[type]}   container      [description]
     * @param  {Function} callback       [description]
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

        canTransition
            ? $NowActive.one(supportTransitionEvent, end).emulateTransitionEnd(150)
            : end();

        $NowActive.removeClass('in');
    };

    var old = $.fn.tab;

    //放到fn属性上
    $.fn.tab = function ( option ) {
        return this.each(function () {
            var $This = $(this);
            var data = $This.data('bao.tab');
            //单例
            if (!data) {
                //(data = new Tab(this)) 括号内赋值运算, 再data('bao.tab', data); 运算
                $This.data('bao.tab', (data = new Tab(this)));
            }
            //简单工厂
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.tab.Constructor = Tab;

    //防止冲突
    $.fn.tab.noConflict = function () {
        $.fn.tab = old;
        return this;
    };

    //给document统一加点击事件, 并带有命名空间, 通过冒泡来实现tab功能
    $(document).on('click.bao.tab', '[data-toggle="tab"]', function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

})(jQuery);
