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