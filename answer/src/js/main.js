var A = (function(){
	var NO_LOGIN_DEBUG = false,    //PC测试用 
		isMusicPlay = true,     //取消音乐
		serverurl = 'http://weixin.ichsh.com.cn',
        //serverurl = 'http://www.doyoteam.com:8082/tpcluster',
		//serverurl = 'http://192.183.3.91/tpcluster',
		baseHref = location.href.match(/.*\//)[0],
		wCallback =  null,
		wConfig = {},
		lotterychance = 0,   //抽奖次数
		prizeType = false,   //中奖信息：一等奖等
		prizeFlag = false,   //是否中奖
		isStatic = true,     //静态版
        isDue = Date.now() < new Date('2016/10/1 12:00').getTime()?true:false, //10.1:12:00准时开始活动
		staticData = [
			{"questionId":"124","questionInfo":"发生在北京卢沟桥的历史事变名叫？","questionA":"七七事件","questionB":"九一八事变","questionC":"五四运动","questionD":"台儿庄会战"},
			{"questionId":"50","questionInfo":"人民英雄纪念碑上的雕塑作品《五四运动》是？","questionA":"浮雕","questionB":"素描","questionC":"3D画","questionD":"炭画"},
			{"questionId":"99","questionInfo":'李白笔下的"飞流直下三千尺， 疑是银河落九天"指的是哪个风景区？',"questionA":"庐山","questionB":"泰山","questionC":"衡山","questionD":"嵩山"},
			{"questionId":"3","questionInfo":"吴敬梓是哪本名著的作者？ ","questionA":"《黄帝内经》","questionB":"《盗墓笔记》","questionC":"《鬼吹灯》","questionD":"《儒林外史》"},
			{"questionId":"137","questionInfo":'"从何时起，对最高统治者称"王"？',"questionA":"唐朝","questionB":"商朝","questionC":"明朝","questionD":"清朝"}
		],
		time = 30,  //设置答题时间
		weixinInit = function() {
            getJsonP(serverurl + "/index.php/Activity/Public/getJssdkTicket", {
                url: location.href.split("#")[0]
            }, "weixincallback").then(function(data) {
                console.info(data);
                if (data.status == "1") {
                    data = data.data;
                } else {
                    notify(data.msg);
                    return;
                }
                wConfig = {
                    debug: false,
                    appId: data.appId,
                    timestamp: data.timestamp,
                    nonceStr: data.nonceStr,
                    signature: data.signature,
                    jsApiList: ["checkJsApi", "onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareWeibo", "showMenuItems"],
                };
                wx.config(wConfig);

                wx.ready(function() {
                    console.info("ready");
                    window.WEIXINREADY = true; 
                    wCallback && wCallback();
                    wx.showMenuItems({
                        menuList: ["menuItem:profile", "menuItem:addContact"]
                    });

                });
                wx.error(function(res) {
                    console.error(res.errMsg);
                });
            });
        },
        weixinShare = function(title, desc, logoUrl, link) {
            var shareData = {
                title: title || "中国邮政“祖国在我心中”国庆主题活动",
                desc: desc ||  "答题、拼图大抽奖，每天都有抽奖机会！连玩7天~豪礼多多，快来参与吧！",
                link: link || 'http://weixin.ichsh.com.cn/guoqing/',
                imgUrl: logoUrl || (baseHref + "images/logo.jpg"),
                success: function(res) {},
                cancel: function(res) {}
            };
            var timelineData = $.extend({}, shareData);
            if (desc) {
                timelineData.title = timelineData.desc;
            }
            var SetShare = function() {
                wx.onMenuShareQQ(shareData);
                wx.onMenuShareWeibo(shareData);
                wx.onMenuShareAppMessage(shareData);
                wx.onMenuShareTimeline(timelineData);
                wConfig.swapTitleInWX = false;
            };
            if (window.WEIXINREADY) {
                SetShare();
            } else {
                wCallback = function() {
                    SetShare();
                };
            }
        },
		login = function(){
			var dtd = $.Deferred();
			getJsonP(serverurl + "/index.php/Activity/Guoqing/isLogin", '',  'isLoginCallback')
			.then(function(data){
				NO_LOGIN_DEBUG && (data.status = 1);
				if(data.status == 1){
					dtd.resolve();
				}else {
					var appId = data.data && data.data.appid || "wxac7d69a69e29b843",
                    	currentUrl = encodeURIComponent(window.location.href),
                    	weixinUrl = serverurl + "/index.php/Activity/Public/go2login?jump=" + currentUrl;
					window.location.href = weixinUrl;
				}
			});
			return dtd.promise();
		},
		getJsonP = function(url, param, callbackName) {
            return $.ajax({
                url: url,
                type: 'get',
                data: param,
                async: true,
                dataType: "jsonp",
                jsonp: "callback",
                jsonpCallback: callbackName,
                success: function() {},
                error: function() {}
            });
        },
        submitAnswer = function(answers) {
        	$('.loading').removeClass("hide");
        	getJsonP(serverurl + '/index.php/Activity/GuoqingQa/play', {
        		ans: JSON.stringify(answers),
        	}, 'submitAnswersCallback')
        	.then(function(data){
        		$('.loading').addClass("hide");
                if(data.status !==1) {
                    notify(data.msg);
                    return;
                }
        		//填上中奖描述信息
        		var point = data.data.point,
        			str = '';
        		lotterychance = data.data.lotterychance;
        		prizeFlag = data.data.prizeFlag;
        		prizeType = prizeFlag && data.data.prize.prizetype;
        			switch(true) {
	        			case point>=3 && point<=5: {
	        				if(data.data.doneLottery) {  // 0的情况，判断抽奖次数是否用光
	        					str = '<p class="title">恭喜你答对' + point + '道题！</p>' + 
	        					'<img class="text" src="images/text-onechance.png"><br/>' + 
	        					'<a class="result-btn gift"></a>';
	        				}else {
	        					str = '<p class="title">恭喜您，挑战成功！</p>' + 
	        					'<img class="text useup" src="images/text-useup.png"><br/>' + 
	        					'<a class="result-btn cry"></a><br/>' + 
                                '<a class="result-btn try-again">继续挑战</a>';
	        				}	
	        				break;
	        			}
	        			case point <= 2: {
	        				str = '<p class="title">很遗憾，您只答对' + point + '道题！</p>' + 
	        					'<img class="text" src="images/text-fail.png"><br/>' + 
	        					'<a class="result-btn try-again">继续挑战</a>';
	        				break;
	        			}
	        			default: {
	        				str = '<p class="title">报错了</p>' + 
	        					'<img class="text" src="images/text-fail.png"><br/>' + 
	        					'<a class="result-btn try-again">继续挑战</a>';
	        				break;
	        			}
	        		}
        		$('.result').removeClass('hide');
        		$('.result .content').html(str);

        	});
        },
        notify = function(msg){
            var str =  '<p class="title">' + msg + '</p>';
            $('.result').removeClass('hide');
            $('.result .content').html(str);
        },
        buildGame = function(){
        	var data;

            var tickTimeHandler = function(timing){
                    $('.time').text(timing + 's');
                },
                notifyHandler = function(){
                    var str = '<p class="title">&nbsp;</p>' + 
                        '<img class="text" src="images/text-check.png"><br/>' + 
                        '<a class="result-btn return"></a>';
                    $('.result').removeClass('hide');
                    $('.result .content').html(str);
                },
                timeoutHandler = function(){
                    var str = '<p class="title">很遗憾，时间已用完</p>' + 
                        '<img class="text" src="images/text-fail.png"><br/>' + 
                        '<a class="result-btn try-again">继续挑战</a>';
                    $('.result').removeClass('hide');
                    $('.result .content').html(str);
                };

        	if(isDue && isStatic) {
        		Problem.init($('.play .questions-container'), {
	        		timing: time,
	        		data: staticData,
	        		tickTimeHandler: tickTimeHandler,
                    notifyHandler: notifyHandler,
	        		gameOverHandler: function(answers, isTimeout){
	        			if(isTimeout) {
	        				timeoutHandler();
	        			}else {
		        			str = '<p class="title">恭喜您，挑战成功！</p>' + 
        					'<img class="text wait" src="images/text-wait.png"><br/>' + 
        					'<a class="result-btn try-again smile">继续挑战</a>';
        					$('.result').removeClass('hide');
	        				$('.result .content').html(str);
	        			}
	        		},
	        	});
	        	$('.i-ready').addClass('hide');
	        	return;
        	}

        	getJsonP(serverurl + '/index.php/Activity/GuoqingQa/getQuestion', '','getAnswerCB')
        	.then(function(res){
        		if(res.status!==1) {
                    notify(res.msg);
                    return;
                }
        		data = res.questions;
        		Problem.init($('.play .questions-container'), {
	        		timing: time,
	        		data: data,
                    notifyHandler: notifyHandler,
	        		tickTimeHandler: tickTimeHandler,
	        		gameOverHandler: function(answers, isTimeout){
	        			if(isTimeout) {
	        				timeoutHandler();
	        			}else {
		        			submitAnswer(answers);
	        			}
	        		},
	        	});
	        	$('.i-ready').addClass('hide');
        	});
        },
        registerActions = function(){
        	$('.swrap').on('touchend', function(e){
        		var $tar = $(e.target);

        		// 开始答题
        		if($tar.hasClass('to-begin')){
        			$('.sample').addClass('hide');
        			$('.play').removeClass('hide');
        			$('.i-ready').removeClass("hide");
        			buildGame();
        			//$('.time').text(page.time + 's');
        			if(isMusicPlay) {
        				$('audio')[0].play();
        			} else {
                        $('.i-music').addClass('off');
                    }
        		}

        		// 播放/暂停音乐
        		if($tar.hasClass('i-music')){
        			var audio = $('audio')[0];
        			if($tar.hasClass('off')) {
        				audio.play();
                        $tar.removeClass('off');
                        sessionStorage.setItem('isMusic', true);
        			}else {
        				audio.pause();
        				$tar.addClass('off');
                        sessionStorage.setItem('isMusic', false);
        			}
        		}

        		//继续挑战
        		if($tar.hasClass('try-again')){
        			$('.result').addClass('hide');
        			$('.i-ready').removeClass("hide");
        			buildGame();
        			//$('.time').text(Problem.getTiming() + 's');
        		}

        		//抽奖
        		if($tar.hasClass("gift")){
        			var str = '', substr = '';
        			if(prizeFlag) { 
    					str = '<p class="title">今天还剩' + lotterychance + '次抽奖机会</p>' + 
                            '恭喜您！<br/>' +
    						'<img class="text" src="images/prize' + prizeType + '.png"><br/>' + 
    						'<a class="result-btn get-prize" href="/tpcluster/guoqing/#/my-prize">去领奖</a>';
        			}else {
                        if(lotterychance) {
                            str = '<p class="title">今天还剩' + lotterychance + '次抽奖机会</p>' + 
                                '<img class="text" src="images/text-sorry.png"><br/>' + 
                                '<a class="result-btn try-again">继续挑战</a>';

                        } else {
                            str = '<p class="title">您今天的抽奖次数已用完，<br/>明天再接再厉噢~</p>' + 
                            '<img class="text" src="images/text-sorry.png"><br/>' + 
                            '<a class="result-btn try-again">继续挑战</a>';
                        }
        			}
        			
    				$('.result .content').html(str);
        		}

                if($tar.hasClass("return")) {
                    $('.result').addClass('hide');
                }
        	});
        },
        init = function(){
        		//var width = document.documentElement.clientWidth > 600 ? 600 : document.documentElement.clientWidth;
    		//$('html').css({'font-size': width/20});
    		window.onload = function(){
    			$('.loading').addClass('hide');
                isMusicPlay = sessionStorage.getItem('isMusic') === 'false'?false:true;
                console.log('is' + isMusicPlay);
                if(isStatic && isDue) {
                    registerActions();
                    weixinInit();
                    weixinShare();
               }else {
                    login().then(function(){
                        registerActions();
                        weixinInit();
                        weixinShare();
                    });
               }
				
    		};
        };

		return {
			i: init
		};
}());
A.i();
Problem = function(){
	var options = {
			timing: 30,
			tickTimeHandler: function() {},
			notifyHandler: function(){},
			gameOverHandler: function(){},
			data: [],
		},
		gameInterval= null,
		user_answers= [],
		index= 0, // 现在是第几题
		isFirst = true,  //用户首次答题，加载事件
		tickTime= function(){
			options.tickTimeHandler(options.timing);
			options.timing--;
			if(options.timing < 0){
				gameOver(true);  //true 的情况，表明没及时提交答案
			}  
		},
		notify = function(){
			options.notifyHandler();
		},
		gameOver= function(isTimeout){  //isTimeout,是否没及时提交答案
			var result = {};
			gameInterval && clearInterval(gameInterval);
			options.data.forEach(function(item, index, array){
				result[item.questionId] = item.rule[user_answers[index]]?item.rule[user_answers[index]]:'s';
			});
			options.gameOverHandler(result, isTimeout);
		},
		addTarget= function($eles){
			options.data.forEach(function(item,index, array){
				item.rule = ['A','B','C','D'].sort(function(){ return 0.5 - Math.random();});
			});

			if(!isFirst) return;
			$('.play').on('touchend',function(e){
				var $tar = $(e.target);
				if($tar.hasClass('to-next')){
					var $ele = $(this).find('.answer.checked');
					if($ele.length) {
						user_answers.push($ele.attr('data-i'));
					}else {
						notify();  //用户没点击答案，传空字符串 
						return;
					} 

					if(index == options.data.length-1) {   //第5题的按钮文字改为提交答案
						gameOver();
					}else {
						index++;
						if(index == options.data.length -1) $tar.text('提交答案');
						changeQuestion($eles, index);
					}
				}

				if($tar.hasClass("answer")){
					$tar.addClass("checked").siblings().removeClass("checked");
				}
			});
			isFirst = false;
		},
		changeQuestion = function($eles, index){  //打乱题目的答案顺序
			var str = '', arr = ['A', 'B', 'C','D'],
				data = options.data[index];
			$eles.find('.question').text(index+1 + '.' + data.questionInfo);
			data.rule.forEach(function(item, index, array){
				str += '<li class="answer" data-i="' + index + '">' + arr[index] + '.' + data['question' + item] + '</li>';
			});
			$eles.find('.answers').html(str);
		},
		reset= function(){
			index = 0;
			user_answers = [];
			$('.to-next').text('下一题');
		},
		init = function($eles, custom_options) {
			options = $.extend(options, custom_options);
			reset();
			addTarget($eles);

			//显示第一个问题
			changeQuestion($eles, index);

			//计时
			gameInterval && clearInterval(gameInterval);
			tickTime();
			gameInterval = setInterval(function(){
				tickTime();
			}, 1000);
		},
		getTiming =  function(){
			return options.timing;
		};

	return {
		init: init,
		getTiming: getTiming,
	};
}();