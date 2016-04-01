/**
 * modal弹层解析
 * @author libaoxu 2016-03-20
 */
+function ($){
	'use strict';
	/**
	 * Modal 弹层组件
	 * @param {dom} element 弹框元素
	 * @param {} options 配置
	 */
    var Modal = function (oElement, options) {
		this.options = options;
		this.$Element = $(oElement);
		this.$Backdrop =
		this.isShown = null;

		//远程调控, 加载完成触发
		if (this.options.remote) {
			this.oElement.find('.modal-content').load(this.options.remote, $.proxy(function () {
				this.oElement.trigger('loaded.bao.modal');
			}, this));
		}

    };

	Modal.DEFAULTS = {
		backdrop: true,
		keyboard: true,
		show: true
	};

	//弹窗切换
	Modal.prototype.toggle = function (_relatedTarget) {
		return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
	};

	//弹窗展现, 这里关闭键盘处理
	Modal.prototype.show = function (_relatedTarget) {
		var self = this;
		var e 	 = $.Event('show.bao.modal', {relatedTarget: _relatedTarget});
		//加载初始触发事件, 提供接口
		this.$Element.trigger(e);
		//显示标识
		this.isShown = true;

		//关闭按钮的冒泡的自定义事件绑定, 这个只针对 data-dismiss="modal" 按钮的处理
		this.$Element.on('click.dismiss.bao.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this));

		/**
		 * 1 backdrop:遮罩的显示,
		 * 2 绑定关闭backdrop遮罩方式,
		 * @param  [function] 回调函数 (backdrop处理完之后, 回调函数逻辑是处理modal的)
		 */
		this.backdrop(function () {
			var transition = $.support.transition && self.$Element.hasClass('fade');

			if (!self.$Element.parent().length) {
				self.$Element.appendTo(document.body);	 //如果没有弹窗, 就把该弹窗创建到document里
			}

			self.$Element.show().scrollTop(0); //去top 0 啥意思

			if ( transition ) {
				self.$Element[0].offsetWidth; //force reflow 防止css3 transition 渲染失败, 我这样理解
			}

			self.$Element.addClass('in').attr('aria-hidden', false);

			//self.enforceFocus();

			var e = $.Event('shown.bao.modal', { relatedTarget: _relatedTarget, element: self.$Element });
			self.$Element.trigger(e);
			// transition ? self.$Element.find('.modal-dialog').one($.support.transition.end, function () {
			// 		//这里为什么药触发叫点呢?
			// 		self.$Element.focus().trigger(e);
			// 	}).emulateTransitionEnd(300):
			// 	self.$Element.focus().trigger(e);
		});
	};

	/**
	 * 遮罩的创建于关闭, 并处理创建 和 关闭 的回调函数
	 * @param  {Function} callback [创建遮罩时候的回调函数]
	 */
	Modal.prototype.backdrop = function (callback) {
		var isAnimate = this.$Element.hasClass('fade') ? 'fade' : ''; // fade类是是否有动画的判断依据

        //如是正在展示, 且需要弹层 => 这里是创建
		if (this.isShown && this.options.backdrop) {
            //判断是否有动画
			var doAnimate = $.support.transition && isAnimate;

			this.$Backdrop = $('<div class="modal-backdrop ' + isAnimate + '" />').appendTo($(document.body));

			//绑定遮罩消失逻辑, 点击任何区域都会触发! 但不是任何时候都消失
			this.$Element.on('click.dismiss.bao.modal', $.proxy(function (e) {
                //这里就是如果点击自己, 就不消失, 如果点击的是弹窗之外位置, 就遮罩等消失,
				if (e.target !== e.currentTarget) return;

				//遮罩的一个设置, 默认为true, 走hide方法
				this.options.backdrop == 'static' ?
				this.$Element[0].focus.call(this.$Element[0]) : this.hide.call(this);
			}, this));

			if ( doAnimate ) this.$Backdrop[0].offsetWidth; //force reflow, 强制回流, 应该跟动画有关,不懂

			//遮罩加in, 显示
			this.$Backdrop.addClass('in');

			if (callback) {
				//遮罩动画结束操作, 这里就是简单的桥接模式, 不用管callback本身如何实现, 自己做好自己就可以了
				doAnimate ? this.$Backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback();
			}

		} else if (!this.isShown && this.$Backdrop) {
			//如果弹窗不是显示且有遮罩, 就把遮罩(淡出掉)
			this.$Backdrop.removeClass('in');

            //api中有说明, 只有当有fade类名时候, 才有淡入淡出动画
			$.support.transition && this.$Element.hasClass('fade') ?
				this.$Backdrop.one($.support.transition.end, callback).emulateTransitionEnd()
				: callback();
		} else if ( callback ) {
            //单纯的执行回调
			callback();
		}
	};

	//弹窗动画消失
	Modal.prototype.hide = function (e) {
		if (e) e.preventDefault();

		e = $.Event('hide.bao.modal');
        //tab中有说明, 这不重复了
		this.$Element.trigger(e);

		if ( !this.isShown && e.isDefaultPrevented() ) return;

		this.isShown = false; //显示标识为假

		$(document).off('focusin.bao.modal');

        //弹窗开始消失
		this.$Element.removeClass('in').attr('aria-hidden', true).off('click.dismiss.bao.modal');

        //绑定弹窗带动画淡出消失之后事件
		$.support.transition && this.$Element.hasClass('fade') ?
			this.$Element.one( $.support.transition.end, $.proxy(this.hideModal, this) ).emulateTransitionEnd(300)
			: this.hideModal();

	};

	//弹窗消失之后, 这里通过this.backdrop这个代理, 主要处理遮罩消失及移除
	Modal.prototype.hideModal = function () {
		var self = this;
		this.$Element.hide();
		this.backdrop(function () {
            //移出弹层, 上面只是消失, 这里工body里remove掉
			self.removeBackdrop();
			//对外提供, 已经消失 hiden 的接口
			self.$Element.trigger('hidden.bao.modal');
		});
	};

	//删除遮罩
	Modal.prototype.removeBackdrop = function () {
		this.$Backdrop && this.$Backdrop.remove();
		this.$Backdrop = null;
	};

	//强制绑定触发事件的父级, 绑定focusin事件, 可以冒泡
	// Modal.prototype.enforceFocus = function () {
	// 	$(document).off('focusin.bao.modal')
	// 		.on('focusin.bao.modal', $.proxy(function (e) {
	// 			if (this.$Element[0] !== e.target && !this.$Element.has(e.target).length ) {
	// 				this.$Element.focus();
	// 			}
	// 		}, this));
	// };

	// 如果全局已经有一个 $.fn.modal 了 ,则先存一下, 这边接着用这个名, 回头吧old 通过noConflict传回去
	var old = $.fn.modal;

	//弹窗初始化, 工厂和单例, _relatedTarget: 就是跟遮罩相关的 data-toggle="modal"
	$.fn.modal = function (option, _relatedTarget) {
		return this.each(function () {
			var $This = $(this);
			var oModal = $This.data('bao.modal');
            //利用$.extend 把所有默认属性, 用户传的属性, 叠加到一起, 重复的后者代替前者
			var options = $.extend({}, Modal.DEFAULTS, $This.data(), typeof option == 'Object' && option);

			if (!oModal) {
				//单例工厂, 只new一次
				$This.data('bao.modal',(oModal = new Modal(this, options)) );
			}
            //两种模式, 做个兼容
			if (typeof option == 'string') {
				oModal[option](_relatedTarget);
			} else if (options.show) {
				oModal.show(_relatedTarget);
			}

		});
	};

	$.fn.modal.Constructor = Modal;

	$.fn.modal.noConflict = function () {
		//把old 值给回 $.fn.modal 那个已经有的值了, 然后返回this, 就是已经写好的$.fn.modal
		$.fn.modal = old;
		return this;
	};


	$(document).on('click.bao.modal', '[data-toggle="modal"]', function (e) {
		var $This = $(this);
		var href = $This.attr('href');
		var $Target = $($This.data('target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); //兼容ie7
		var option = $Target.data('bao.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $Target.data(), $This.data() );
		//如果是a 标签, 阻止默认事件
		if ( $This.is('a') ) e.preventDefault();

		$Target
			.modal(option, this)
			.one('hide', function () {
			$This.is(':visible') && $This.focus(); //如果是隐藏情况, 就触发焦点
		});
	});

    //利用.modal的自定义事件, 给body加类名.modal-open, 对css样式控制, 而不是直接操作dom
	$(document).on('show.bao.modal', '.modal', function () {
		$(document.body).addClass('modal-open');
	}).on('hidden.bao.modal', '.modal', function () {
		$(document.body).removeClass('modal-open');
	});


}(jQuery);
