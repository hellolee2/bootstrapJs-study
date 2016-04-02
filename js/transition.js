/**
 * bootstrap中 transition.js 学习分析
 * @author libaoxu 2016-03-20
*/
if (typeof jQuery === 'undefined') {
	throw new Error('transitionjs是依赖jQuery的, 请引入! 请引入! 请引入! 重要的事情说三遍.');
}

+function ($) {
    //如果$下没有$.support 做一下兼容
    $.support = $.support || {};
    /*
        作用: 因为不同浏览器的兼容性不同,
             这里通过创建元素, 根据元素.style.* 写法来判断浏览器兼容哪个transiton事件
             防止重复绑定 各种内核前缀事件

     */
    function transitionEndSupport() {
        var el = document.createElement('shipai');

        /*
            左边的key是js中 style.样式写法
                比如: obj.style.WebkitTransition = '';
            右边的value是transition对应事件的名
                eg: obj.addEventListener('webkitTransitionEnd', fn);
         */
        var transEndEventNames = {
            'WebkitTransition' : 'webkitTransitionEnd',
            'MozTransition'    : 'transitionend',
            'OTransition'      : 'oTransitionEnd otransitionend',
            'transition'       : 'transitionend'
        };

        //找到合适的transtion事件名称
        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }
        return false;
    }

    /**
     * 通过定时器,对不兼容绑定transtion事件的浏览器, 模拟transitionend事件处理
     * @param  {number} duration [traisiont-duration属性的时间]
     */
    $.fn.emulateTransitionEnd = function (duration) {
        var fired = false,
            _this = this,
            $This = $(this),
            supportTransitionEvent = $.support.transition.end;

        $This.one(supportTransitionEvent, function(){
            //只触发一次, 触发过标识
            fired = true;
        });

        var callback = function () {
            if (!fired) {
                //当定时器时间到了, 还没触发过, 就主动触发一下
                $This.trigger(supportTransitionEvent);
            }
        };
        setTimeout(callback, duration);
        //这里保持jq中的链式调用
        return this;
    };

    $(function () {
        //页面已加载完, 就找到对应支持的 tansition事件, 方面后面调用
        $.support.transition = transitionEndSupport();
    });

}(jQuery);
