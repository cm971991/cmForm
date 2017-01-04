/**
 * Created by hale on 2017/1/3.
 */

;(function ($, window, document, undefined) {
	"use strict";
	
	//构造函数
	var cmForm = function (ele, options) {
		this.$element = ele,
			this.defaults = {
				url: "",
				type: "post",
				dataType: "json",
				success: function () {},
				error: function () {}
			}
		this.options = $.extend({}, this.defaults, options);
	};
	var cmValidator = function () {};
	
	cmForm.prototype = {
		submit: function () {
			var _opt = {
				success: this.options.success,
				error: this.options.error
			};
			
			if (cmForm.prototype.isEmpty(this.$element)) {
				console.log("element:", "element is empty");
				return this.$element;
			}
			
			if (cmForm.prototype.isEmpty(this.options.url)) {
				console.log("url:", "url is empty");
				return this.$element;
			}
			
			//验证表单
			var verify = new cmValidator();
			if (!verify.validate(GLOBAL_OBJECT.ELEMENT)) {
				console.log("validate:", "validate is false");
				return this.$element;
			}
			
			var data = cmForm.prototype.getFormData();
			if (cmForm.prototype.isEmptyObject(data)) {
				console.log("getFormData:", "data is empty");
				return this.$element;
			}
			
			$.ajax({
				url: this.options.url,
				type: "post",
				dataType: this.options.dataType,
				data: data,
				success: function () {
					_opt.success();
				},
				error: function () {
					_opt.error();
				}
			});
		},
		
		getFormData: function () {
			//赋值
			var dataArray = {};
			GLOBAL_OBJECT.ELEMENT.find("[name]").each(function (index, ele) {
				if (ele.type == "checkbox" || ele.type == "radio") {
					if (!ele.checked) {
						return;
					}
				} else if (ele.type == "select-one" && ele.tagName.toLowerCase() == 'select') {
					var name = ele.name, val = $(ele).find("option:selected").val();
					dataArray[name] = val;
					return;
				}
				dataArray[ele.name] = ele.value;
			});
			return dataArray;
		},
		
		isEmpty: function (val) {
			if (val && val.length > 0) {
				return false;
			}
			return true;
		},
		
		isEmptyObject: function (obj) {
			var t;
			for (t in obj)
				return !1;
			return !0
		}
	};
	
	cmValidator.prototype = {
		validate: function (element) {
			if (GLOBAL_ATTRIBUTE.POSTBACK >= 1) {
				if (!(element instanceof jQuery)) {
					if ($(GLOBAL_OBJECT.ELEMENT).attr("cmValidate") == "true") {
						GLOBAL_ATTRIBUTE.POSTBACK++;
						GLOBAL_OBJECT.VALIDATOR.regFilter(element);
					}
				} else {
					if (element.attr("cmValidate") == "true") {
						var flag = true;
						var flagArray = [];
						element.find("[name]").each(function () {
							flagArray.push(GLOBAL_OBJECT.VALIDATOR.regFilter(this));
						});
						
						GLOBAL_ATTRIBUTE.POSTBACK++;
						
						for (var i = 0; i < flagArray.length; i++) {
							if (!flagArray[i]) {
								flag = false;
								break;
							}
						}
						return flag;
					}
				}
			} else {
				//添加blur事件监听
				element.find("[name]").blur(function (e) {
					//获取数据并验证
					var verify = new cmValidator();
					var ele = e.target || e.srcElement;
					verify.validate(ele);
				});
				GLOBAL_ATTRIBUTE.POSTBACK++;
			}
		},
		
		regFilter: function (element) {
			if ($(element).attr("expression") != undefined) {
				
				var regExp = GLOBAL_OBJECT.VALIDATOR.regExp;
				var html = GLOBAL_OBJECT.VALIDATOR.regHtml;
				var lang = GLOBAL_OBJECT.VALIDATOR.lang;
				var disPlayflag = GLOBAL_OBJECT.VALIDATOR.regflag;
				var isPass = true;
				var message = "";
				var value = $(element).val().trim();
				var span = $(element).next("span");
				
				switch ($(element).attr("expression")) {
					case "notNull":
						if (!regExp.isEmpty(value)) {
							message = lang.notNull.replace('{0}', $(element).attr("err"));
							isPass = false;
						}
						break;
					case "isMob":
						if (!regExp.isMob(value)) {
							message = lang.mob;
							isPass = false;
						}
						break;
					case "isNum":
						if (!regExp.isNumber(value)) {
							message = lang.number;
							isPass = false;
						}
						break;
					case "isEMail":
						if (!regExp.isEMail(value)) {
							message = lang.email;
							isPass = false;
						}
						break;
					case "isUrl":
						if (!regExp.isUrl(value)) {
							message = lang.url;
							isPass = false;
						}
						break;
					case "isChinese":
						if (!regExp.isChinese(value)) {
							message = lang.chinese;
							isPass = false;
						}
						break;
					case "isIdCard":
						if (!regExp.isIdCard(value)) {
							message = lang.idCard;
							isPass = false;
						}
						break;
				}
				
				if (!isPass) {
					if (span && span.length == 0) {
						$(element).after($(html._errorHtml).html(message));
						disPlayflag = true;
					} else if (span && span.length == 1) {
						disPlayflag = true;
					}
				}
				
				if (!disPlayflag) {
					$(element).next("span").remove();
				}
				
				return isPass;
			} else {
				return true;
			}
		},
		
		regExp: {
			isEmpty: function (val) {
				if (val && val.length > 0) {
					return true;
				}
				return false;
			},
			isMob: function (val) {
				return /^1[3|4|5|6|7|8|9]\d{9}$/.test(val);
			},
			isNumber: function (val) {
				return isNaN(val);
			},
			isEMail: function (val) {
				return /^[\w\+\-]+(\.[\w\+\-]+)*@[a-z\d\-]+(\.[a-z\d\-]+)*\.([a-z]{2,4})$/i.test(val);
			},
			isUrl: function (val) {
				return /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test(val);
			},
			isChinese: function (val) {
				return /([\u4e00-\u9fa5])+/.test(val);
			},
			isIdCard: function (val) {
				return /\d{17}[\d|x]|\d{15}/.test(val);
			}
		},
		
		regHtml: {
			_errorHtml: "<span style='font-size: 12px;margin-left: 10px;color:red;'></span>",
			_infoHtml: "<span style='font-size: 12px;margin-left: 10px;color:limegreen;'></span>"
		},
		
		lang: {
			notNull: "{0}不能为空!",
			mob: "请输入正确的手机号!",
			number: "请输入数字!",
			email: "请输入正确的邮箱地址",
			url: "请输入正确的网址!",
			chinese: "请输入中文!",
			idCard: "请输入正确的身份证号码!"
		},
		
		regflag: false
	};
	
	/**全局对象 */
	var GLOBAL_OBJECT = {
		ELEMENT: {},
		VALIDATOR: new cmValidator()
	};
	
	var GLOBAL_ATTRIBUTE = {
		POSTBACK: 0,
		ISPASS: false
	};
	
	window.GLOBAL_OBJECT = GLOBAL_OBJECT;
	
	$.fn.cmFromSubmit = function (options) {
		GLOBAL_OBJECT.ELEMENT = this;
		
		var form = new cmForm(this, options);
		return form.submit();
	};
	
	$.fn.cmValidate = function () {
		GLOBAL_OBJECT.ELEMENT = this;
		
		var validator = new cmValidator();
		validator.validate(this);
	};
	
})(jQuery, window, document);