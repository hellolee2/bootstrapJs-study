/**
 * 实拍app公共组件
 * 部分组件参考bootstrap.js中组件思想及结构模式,但不依赖
 * @author libaoxu 2016-03-20
 */

if (typeof jQuery === 'undefined') {
	throw new Error('实拍H5是依赖jQuery的, 请引入! 请引入! 请引入! 重要的事情说三遍.');
}
//实拍命名空间
var sp = sp || {};
$.fn.sp = $.fn.sp || sp;

/**
 * transition控制区域
 */


//tab选项卡区域


//弹层区域
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
				this.oElement.trigger('loaded.sp.modal');
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
		var e 	 = $.Event('show.sp.modal', {relatedTarget: _relatedTarget});
		//加载初始触发事件, 提供接口
		this.$Element.trigger(e);
		//显示标识
		this.isShown = true;

		//关闭按钮的冒泡事件绑定
		this.$Element.on('click.dismiss.sp.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this));

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

			var e = $.Event('shown.sp.modal', { relatedTarget: _relatedTarget, element: self.$Element });
			self.$Element.trigger(e);
			// transition ? self.$Element.find('.modal-dialog').one($.support.transition.end, function () {
			// 		//这里为什么药触发叫点呢?
			// 		self.$Element.focus().trigger(e);
			// 	}).emulateTransitionEnd(300):
			// 	self.$Element.focus().trigger(e);
		});
	};

	//创建遮罩
	Modal.prototype.backdrop = function (callback) {
		var isAnimate = this.$Element.hasClass('fade') ? 'fade' : ''; // fade类是是否有动画的判断依据
		//如是正在展示, 且需要弹层
		if (this.isShown && this.options.backdrop) {
			var doAnimate = $.support.transition && isAnimate;

			this.$Backdrop = $('<div class="modal-backdrop ' + isAnimate + '" />').appendTo($(document.body));

			//绑定遮罩消失逻辑, 如果是点击是同一个区域, 就动画消失Event
			this.$Element.on('click.dismiss.sp.modal', $.proxy(function (e) {
				if (e.target !== e.currentTarget) return;
				//遮罩的一个设置, 默认为true, 走hide方法
				this.options.backdrop == 'static' ?
				this.$Element[0].focus.call(this.$Element[0]) : this.hide.call(this);
			}, this));

			if ( doAnimate ) this.$Backdrop[0].offsetWidth; //force reflow, 强制回流, 应该跟动画有关,不懂

			//遮罩加in, 显示
			this.$Backdrop.addClass('in');

			if (callback) {
				//遮罩动画结束操作
				doAnimate ? this.$Backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback();
			}

		} else if (!this.isShown && this.$Backdrop) {
			//如果弹窗不是显示, 就把遮罩隐藏掉
			this.$Backdrop.removeClass('in');

			$.support.transition && this.$Element.hasClass('fade') ?
				this.$Backdrop.one($.support.transition.end, callback).emulateTransitionEnd()
				: callback();
		} else if ( callback ) {
			callback();
		}
	};

	//弹窗带动画出屏幕区域
	Modal.prototype.hide = function (e) {
		if (e) e.preventDefault();

		e = $.Event('hide.sp.modal');

		this.$Element.trigger(e);

		if ( !this.isShown && e.isDefaultPrevented() ) return;

		this.isShown = false; //显示标识为假

		$(document).off('focusin.sp.modal');

		this.$Element.removeClass('in').attr('aria-hidden', true).off('click.dismiss.sp.modal');

		$.support.transition && this.$Element.hasClass('fade') ?
			this.$Element.one( $.support.transition.end, $.proxy(this.hideModal, this) ).emulateTransitionEnd(300)
			: this.hideModal();

	};

	//弹窗隐藏
	Modal.prototype.hideModal = function () {
		var self = this;
		this.$Element.hide();
		this.backdrop(function () {
			self.removeBackdrop();
			//已经消失的接口
			self.$Element.trigger('hidden.sp.modal');
		});
	};

	//删除遮罩
	Modal.prototype.removeBackdrop = function () {
		this.$Backdrop && this.$Backdrop.remove();
		this.$Backdrop = null;
	};

	//强制绑定触发事件的父级, 绑定focusin事件, 可以冒泡
	// Modal.prototype.enforceFocus = function () {
	// 	$(document).off('focusin.sp.modal')
	// 		.on('focusin.sp.modal', $.proxy(function (e) {
	// 			if (this.$Element[0] !== e.target && !this.$Element.has(e.target).length ) {
	// 				this.$Element.focus();
	// 			}
	// 		}, this));
	// };

	//PLUGIN DEFINITION
	// 如果全局已经有一个 $.fn.modal 了 ,则先存一下, 这边接着用这个名, 回头吧old 通过noConflict传回去
	var old = $.fn.modal;

	//弹窗初始化, 工厂和单例, _relatedTarget: 就是跟遮罩相关的 data-toggle="modal"
	$.fn.modal = function (option, _relatedTarget) {
		return this.each(function () {
			var $This = $(this);
			var oModal = $This.data('sp.modal');

			var options = $.extend({}, Modal.DEFAULTS, $This.data(), typeof option == 'Object' && option);

			if (!oModal) {
				//单例工厂, 只new一次
				$This.data('sp.modal',(oModal = new Modal(this, options)) );
			}
			if (typeof option == 'string') {
				oModal[option](_relatedTarget);
			} else if (options.show) {
				oModal.show(_relatedTarget);
			}

		});
	};

	$.fn.modal.Constructor = Modal;

	//NO CONFLICT
	$.fn.modal.noConflict = function () {
		//把old 值给回 $.fn.modal 那个已经有的值了, 然后返回this, 就是已经写好的$.fn.modal
		$.fn.modal = old;
		return this;
	};


	$(document).on('click.sp.modal', '[data-toggle="modal"]', function (e) {
		var $This = $(this);
		var href = $This.attr('href');
		var $Target = $($This.data('target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); //兼容ie7
		var option = $Target.data('sp.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $Target.data(), $This.data() );
		//如果是a 标签, 阻止默认事件
		if ( $This.is('a') ) e.preventDefault();

		$Target
			.modal(option, this)
			.one('hide', function () {
			$This.is(':visible') && $This.focus();
		});
	});

	$(document).on('show.sp.modal', '.modal', function () {
		$(document.body).addClass('modal-open');
	}).on('hidden.bs.modal', '.modal', function () {
		$(document.body).removeClass('modal-open');
	});


}(jQuery);


//上传图片区域
(function ($) {

    var UploadImgPreview = function (oFileElem, opts) {
        this.$FileElem = oFileElem;
        this.options = $.extend({
            imgId: "sp_img_prew",
            imgUnit: '0.49rem',
            imgType: ["gif", "jpeg", "jpg", "bmp", "png"],
			noChangeWidth: false
        }, opts || {});
    };

    UploadImgPreview.prototype.changeInit = function (callback) {
        var _this = this;
        this.$FileElem.on('change', function () {
            if (this.value) {

                if (!RegExp("\.(" + _this.options.imgType.join("|") + ")$", "i").test(this.value.toLowerCase())) {
                    alert("选择文件错误,图片类型必须是" + _this.options.imgType.join("，") + "中的一种");
                    this.value = "";
                    return false;
                }
                var $ImgObj = $(_this.options.imgId);
                var imgSrc = _this.getObjectURL(this.files[0]);

                _this.setImgWidthOrHeight($ImgObj, imgSrc, function(){
                    //ie情况
                    if ( navigator.userAgent.indexOf('MSIE') != -1 ) {
                        try {
                            $ImgObj.attr( 'src', _this.getObjectURL(this.files[0]) );
                        } catch (e) {
                            var src = "";
                            _this.$FileElem.select();
                            if (top != self) {
                                window.parent.document.body.focus();
                            } else {
                                _this.$FileElem.blur();
                            }
                            src = document.selection.createRange().text;
                            document.selection.empty();
                            var oImgWrap = $ImgObj.parent("div").css({
                                'filter': 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)',
                            });
                            oImgWrap[0].filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = src;
                        }
                    } else {
                        //目前支持上传一个文件
                        $ImgObj.attr('src', imgSrc);
                    }
                    callback && callback.call(_this.$FileElem, _this.$FileElem);
                });

            }
        });
    };

    //获得图片的url 路径
    UploadImgPreview.prototype.getObjectURL = function (file) {
        var url = null;
        if (window.createObjectURL !== undefined) {
            url = window.createObjectURL(file);
        } else if (window.URL !== undefined) {
            url = window.URL.createObjectURL(file);
        } else if (window.webkitURL !== undefined) {
            url = window.webkitURL.createObjectURL(file);
        }
        return url;
    };

    //根据图片的横竖来进行判断
    UploadImgPreview.prototype.setImgWidthOrHeight = function($ImgObj, imgSrc, fn) {
		if ( this.options.noChangeWidth ) {
			fn && fn();
			return;
		}

		var _this = this;
        var oImg = new Image();

        oImg.src = imgSrc;
        oImg.onload = function () {
            //宽高比较判断横竖图
            if ( this.width / this.height > 1.2 ) {
                $ImgObj.css({width: 'auto', height: _this.options.imgUnit});
            } else {
                $ImgObj.css({height: 'auto', width: _this.options.imgUnit});
            }

            fn && fn();
        };

        oImg.onerror = function () {
            alert('图片上传失败');
        };
    };

	$.fn.uploadImgPreview = function (opts, fn) {

	    new UploadImgPreview($(this), opts).changeInit(fn);

	};

})(jQuery);

//表单输入流程控制区域
(function ($) {
	/**
	 * 表单输入流程控制
	 * @param {$} $Container 控制容器
	 * @param {json} opts    配置控制的 input: text/ checbox /file, del按钮 等
	 */
	function InputAndDelStatus($Container, opts) {
		this.$Container = $Container;
		this.$SaveBtn = opts.$SaveBtn;
		this.iNow = 0;
		this.iCount = opts.iCount;

		this.options = $.extend(opts);
		this.init();
	}

	InputAndDelStatus.prototype.init = function() {
		var _this = this,
			$AInputControl = this.$Container.find('[data-toggle="InputControl"]'),
			$InputValue, $Del, inputName,
			inputValueClass = this.options['inputValueClass'] || '.sp_input_value',
			inputDelClass = this.options['inputDelClass'] || '.sp_input_del',
			checkboxClass = this.options['checkboxClass'] || '.sp_input_checkbox',
			inputFileClass = this.options['inputFileClass'] || '.sp_input_file',
			related = {
				key: '',
				inputValueClass: function () {
					return inputValueClass + '[data-bg-related="' + this.key + '"]';
				},
				delClass: function () {
					return inputDelClass + '[data-bg-related="' + this.key + '"]';
				}
			};


		//点击输入信息流程控制
		$AInputControl.on('input.sp.phone', inputValueClass, function () {
			$InputValue = $(this);
			related.key = $InputValue.data('bg-related');
			//对应相关的删除按钮, 没有就获取
			this.$RelatedDel = this.$RelatedDel || $(related.delClass());
			inputName = $InputValue.attr('name');

			if ( this.value ) {
				this.$RelatedDel.show();
				//没有激活过 才能激活标识
				if ( !this.actived ) {
					_this.iNow ++;
					this.actived = true;
				}
			} else {
				this.$RelatedDel.hide();
				this.actived = false;
				_this.iNow --;
			}

			judgeStatus();
		});

		//点击删除内同控制
		$AInputControl.on('click.sp.del', inputDelClass, function () {
			$Del = $(this);
			related.key = $(this).data('bg-related');
			this.$RelatedInputValue = this.$RelatedInputValue || $(related.inputValueClass());

			this.$RelatedInputValue.val('').trigger('focus');
			$Del.hide();

			this.$RelatedInputValue[0].actived = false;
			_this.$SaveBtn.removeClass('active');
			_this.iNow --;

			judgeStatus();
		});

		//同意按钮
		$AInputControl.on('change.sp.checkbox', checkboxClass, function () {
			if (this.checked) {
				_this.iNow ++;
			} else {
				_this.iNow --;
			}
			judgeStatus();
		});

		//文件自定义事件
		$AInputControl.on('baochange.sp.file', inputFileClass, function (e, callback) {
			_this.iNow ++;
			judgeStatus(callback);
		});

		//判断状态
		function judgeStatus(callback) {
			//所有按钮都激活了才能触发自定义"保存的事件"及按钮颜色变化
			if (_this.iNow == _this.iCount) {
				_this.$SaveBtn.addClass('active');
				callback &&	callback();
			} else {
				_this.$SaveBtn.removeClass('active');
			}
			console.log('inputvalue: iNow: ', _this.iNow);
		}
	};

	$.fn.inputAndDelStatus = function (opts) {
		new InputAndDelStatus(this, opts);
	};

})(jQuery);

//验证表单的类
(function ($) {
	/**
	 * 表单输入验证器
	 */
	function InputValidators() {
		//存放 需要验证的表单带"对应验证的策略"的数组, 数组里面存放相同的匿名函数, 但是策略名, 和 策略方法不同
		this.validators = [];
		//验证策略的json, 存放验证策略名(key) 和 策略方法(value), 在执行的时候根据返回值进行判断
		this.strategies = {};
	}

	/**
	 * 导入策略json
	 * @param  {json} strategies name: 策略名
	 *                           strategy: 策略函数
	 */
	InputValidators.prototype.importStrategies = function (strategies) {
		for ( var strategyName in strategies ) {
			this.addValidationStrategy(strategyName, strategies[strategyName]);
		}
		return this;
	};

	//增加策略值, 这个方法抽离出来, 方便外部扩展
	InputValidators.prototype.addValidationStrategy = function (strategyName, strategyFn) {
		this.strategies[strategyName] = strategyFn;
		return this;
	};

	/**
	 * 添加验证数组
	 * @param {string} rule    [验证的策略字符串 --> 策略名: 策略规则]
	 * @param {dom} element [验证的dom元素]
	 * @param {string} errMsg  [验证失败的提示信息]
	 * @param {} value   [dom的具体值]
	 */
	InputValidators.prototype.addValidator = function (rule, element, errMsg, value1, value2 ) {
		var _this = this;
		var ruleElements = Array.prototype.shift.call(arguments).split(':'); // equalLength:6 --> ['equalLength', '6']
		var params = arguments;

		//存放 需要验证的表单带"对应验证的策略"的数组, 数组里面存放相同的匿名函数, 但是策略名, 和 策略方法不同
		this.validators.push(function () {
			var strategyName = ruleElements.shift(0,1); // 'equalLength'
			// 讲rule的点第一个参数策略名(脱离开变为策略json的key) 和 第二个策略规则分开(放到结尾) , 这样就不用限制于参数了
			// _this.strategies['equalLength']					[element, errMsg, value, 6]
			return _this.strategies[strategyName].apply(_this, Array.prototype.slice.call(params, 0).concat(ruleElements) );
		});
		return this;
	};

	//删除验证内容
	InputValidators.prototype.emptyValidators = function () {
		this.validators = [];
		return this;
	};

	//验证失败时, 返回:element: dom元素, errMrg:错误信息, value: 值
	InputValidators.prototype.invalidErrResult = function (element, errMsg, value) {
		return {
			'element': element,
			'errMsg': errMsg,
			'value': value
		};
	};

	//开始验证
	InputValidators.prototype.check = function () {
		//这里var 里面两个变量, i++ 是后加
		for ( var i = 0, validator; validator = this.validators[i++]; ) {
			var result = validator();
			if (result) {
				return result;
			}
		}
		return undefined;
	};

	//验证策略json, 包含策略名, 和 策略函数
	var validationStrategies = {
		//如下一切都是再为 "假" 的时候返回 InputValidators 对象的 无效对象
		isNoEmpty: function (element, errMsg, value) {
			if (value === '') {
				return this.invalidErrResult(element, errMsg, value);
			}
		},
		minLength: function(element, errMsg, value, length) {
          if(value.length < length){
            return this.invalidErrResult(element, errMsg, value);
          }
        },
        maxLength: function(element, errMsg, value, length) {
          if(value.length > length){
            return this.invalidErrResult(element, errMsg, value);
          }
        },
		equalLength: function (element, errMsg, value, length) {
			if (value.length != length) {
				return this.invalidErrResult(element, errMsg, value);
			}
		},
		isTelephone: function (element, errMsg, value) {
			var reg = /^1[3578]{1}[0-9]{9}$/;
			if (!reg.test(value)) {
				return this.invalidErrResult( element, errMsg, value );
			}
		},
		isEqual: function (element, errMsg, value1, value2) {
			if( value1 !== value2 ){
            	return this.invalidErrResult(element, errMsg, value1, value2);
  	        }
		},
		isMail: function(element, errMsg, value) {
			var reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
			if(!reg.test(value)){
            	return this.invalidErrResult(element, errMsg, value);
  	        }
      	},
		isNumber: function (element, errMsg, value) {
			if (!/^[0-9]*$/.test(value)) {
				return this.invalidErrResult(element, errMsg, value);
			}
		},
		isChineseName: function (element, errMsg, value) {
			if (!/^[\u2E80-\u9FFF]+$/.test(value)) {
				return this.invalidErrResult(element, errMsg, value);
			}
		},
		isIndentifyCard: function (element, errMsg, value) {
			if (!/^\d{15}|\d{}18$/.test(value)) {
				return this.invalidErrResult(element, errMsg, value);
			}
		}
	};

	$.fn.inputValidators = $.fn.sp.inputValidators = function () {
		//导入策略
		return new InputValidators().importStrategies(validationStrategies);
	};

})(jQuery);


//状态模式区域
(function ($) {

})(jQuery);
