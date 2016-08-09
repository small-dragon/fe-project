var objectPlayer=new aodianPlayer({
    container:'play',//播放器容器ID，必要参数
    rtmpUrl: 'rtmp://22837.lssplay.aodianyun.com/testddsssdee/stream',//控制台开通的APP rtmp地址，必要参数
    hlsUrl: 'http://22837.hlsplay.aodianyun.com/testddsssdee/stream.m3u8',//控制台开通的APP hls地址，必要参数
    /* 以下为可选参数*/
    width: '100%',//播放器宽度，可用数字、百分比等
    height: '720',//播放器高度，可用数字、百分比等
    uin: '22837',//用户ID
    mpsId: '380',//播放器ID
    autostart: false,//是否自动播放，默认为false
    bufferlength: '1',//视频缓冲时间，默认为3秒。hls不支持！手机端不支持
    maxbufferlength: '2',//最大视频缓冲时间，默认为2秒。hls不支持！手机端不支持
    stretching: '2',//设置全屏模式,1代表按比例撑满至全屏,2代表铺满全屏,3代表视频原始大小,默认值为1。hls初始设置不支持，手机端不支持
    controlbardisplay: 'disabled',//是否显示控制栏，值为：disable、enable默认为disable。
    adveDeAddr: '',//封面图片链接
    //adveWidth: 320,//封面图宽度
    //adveHeight: 240,//封面图高度
    //adveReAddr: ''//封面图点击链接
});



/*(function($){*/
    var vm = new Vue({
        el: 'body',
        data: {
            tabs: {
                comment: true,
                activities: false,
                brief: false,
            },
            activityTabs: {
                main: true,
                ticket: false,
                vote: false,
                question: false,
            },
            isPlay: true,
            popupshow: false,
            flag: true, //设置2S提交1次到后台的阈值
            popupMsg: '',
            yourComment: '',
            yourQuestion: '',
            comments: [
                {imgurl: 'images/sample/user.png', name:'雅子Love', date: '2016年8月3号', time: '15:19:00', word: '试试楼上的开户送快递很快收到货款收到客户收递号开始的开始看到好的开始时到客户的刷卡还是打款还是看到合适的客户收到客户送快递号开始的开始看到好的开始时'},
                {imgurl: 'images/sample/user.png', name:'雅子Love', date: '2016年8月3号', time: '15:19:00', word: '试试楼上的开户送快递很快收到货款收到客户收收到客户送快递号开始的开始看到好的开始时'},
                {imgurl: 'images/sample/user.png', name:'雅子Love', date: '2016年8月3号', time: '15:19:00', word: '试试楼上的开户送快递到合适的客户收到客户送快递号开始的开始看到好的开始时'},
                {imgurl: 'images/sample/user.png', name:'雅子Love', date: '2016年8月3号', time: '15:19:00', word: '试试楼户的刷卡还是始看到好的开始时'},
                {imgurl: 'images/sample/user.png', name:'雅子Love', date: '2016年8月3号', time: '15:19:00', word: '试试楼上的开户送快递很快收到货款收到开始的开始看到好的开始时'},
            ],
            activities: [
                {imgUrl: 'images/sample/user.png', heading: '分享领券', btnText: '分享', desc: '这是一个分享活动领优惠券的简介', countdown: '', isExpired: false},
                {imgUrl: 'images/sample/user.png', heading: '抽奖活动', btnText: '抽奖', desc: '这是一个分享活动领优惠券的简介', countdown: '', isExpired: true},
                {imgUrl: 'images/sample/user.png', heading: '问答活动', btnText: '问答', desc: '这是一个分享活动领优惠券的简介', countdown: '18:59', isExpired: false},
                {imgUrl: 'images/sample/user.png', heading: '投票活动', btnText: '投票', desc: '这是一个分享活动领优惠券的简介', countdown: '', isExpired: false},
            ],
            questions: [
                {imgurl: 'images/sample/user.png', name:'雅子Love', date: '2016年8月3号', time: '15:19:00', word: '试试楼上的开户送快递很快收到货款收到客户收递号开始的开始看到好的开始时到客户的刷卡还是打款还是看到合适的客户收到客户送快递号开始的开始看到好的开始时'},
                {imgurl: 'images/sample/user.png', name:'雅子Love', date: '2016年8月3号', time: '15:19:00', word: '试试楼上的开户送快递很快收到货款收到客户收收到客户送快递号开始的开始看到好的开始时'},
                {imgurl: 'images/sample/user.png', name:'雅子Love', date: '2016年8月3号', time: '15:19:00', word: '试试楼上的开户送快递到合适的客户收到客户送快递号开始的开始看到好的开始时'},
                {imgurl: 'images/sample/user.png', name:'雅子Love', date: '2016年8月3号', time: '15:19:00', word: '试试楼户的刷卡还是始看到好的开始时'},
                {imgurl: 'images/sample/user.png', name:'雅子Love', date: '2016年8月3号', time: '15:19:00', word: '试试楼上的开户送快递很快收到货款收到开始的开始看到好的开始时'},
            ],
            vote: {
                isVoted: false,
                sections: [
                    {id: 'app1', name: 'app',  rate: '40%', text: '是否是减肥了手机费老师及福利时间浪费就是了附'},
                    {id: 'app2', name: 'app', rate: '20%', text: '是否是减肥了手机费老师及福利时了附'},
                    {id: 'app3', name: 'app', rate: '10%', text: '是否是减肥了手机费老了附'},
                    {id: 'app4', name: 'app', rate: '30%', text: '是否是时间浪附'},
                ],
                index: 0, //被选中的按钮
            },
            questionTimes: 0,
            activityName: '',
            shareShow: false,
            isBlur: false,
            ticket: {
                phoneNumber: '',
                noSend: true,
                show: false,
            }
        },
        methods: {
            /**
             * 弹出提示信息
             */
            popup: function(text) {
                switch(text) {
                    case 'comment': {
                        this.yourComment = '';  //清空评论，发送给后台
                        this.popupMsg = '您已成功发送您的内容！';
                        break;
                    }
                    case 'question': {
                        if(this.questionTimes === 0) {
                            this.popupMsg = '您的问题已收到，主播会挑选部分问题进行回答，请留意答复。';
                            this.questionTimes++;
                        }else {
                            this.popupMsg = '您的问题已提交，请耐心等候主播回复。';
                            
                        }
                        this.yourQuestion = '您的问题已提交，请耐心等候主播回复。';
                        break;
                    }
                    default: {
                        this.popupMsg = text;
                        break;
                    }
                }
                
                this.popupshow = true;
                this.flag = false;
                window.setTimeout(function(){
                    vm.popupshow = false;
                    vm.flag = true;
                }, 2000);
            },
            /**
             * 切换到不同区块，比如活动页面
             */
            changeTab: function(type){
                if(this.tabs[type]) return;
                $.each(this.tabs, function(name){
                    vm.tabs[name] = false;
                });
                this.tabs[type] = true;
            },
            /**
             * 在活动页面切换到不同活动区块
             */
            enterPage: function(text){
                switch(text) {
                    case '分享': {
                        this.popUpShare();
                        this.changeActivityTab('ticket');
                        this.activityName = '-分享领券';
                        break;
                    }
                    case '问答': {
                        this.changeActivityTab('question');
                        this.activityName = '-回答活动';
                        break;
                    }
                    case '投票': {
                        this.changeActivityTab('vote');
                        this.activityName = '-投票活动';
                        break;
                    }
                    default:{}
                }
            },
            /**
             * 弹出分享弹窗
             * @return {[type]} [description]
             */
            popUpShare: function(){
                this.shareShow = ! this.shareShow; 
                this.isBlur = !this.isBlur;
            },
            /**
             * 活动页面之前的切换
             */
            changeActivityTab: function(type){
                if(this.activityTabs[type]) return;
                $.each(this.activityTabs, function(name){
                    vm.activityTabs[name] = false;
                });
                this.activityTabs[type] = true;
            },
            /**
             * 选择投哪个票
             */
            clickRadio: function(index, event){
                var $ele = $(event.currentTarget),
                    $par = $ele.parents('.vote-section');

                this.vote.index = index;
                console.log(index);
                $par.addClass('on').siblings().removeClass('on');
            },
            clickVote: function(){
                if($('.vote-section .hidden-input:checked').length) {
                    this.vote.isVoted = true;
                }else {
                    this.popup('请选择您要投的票');
                }
            },
            /**
             * 奥迪云方法
             */     
            startPlay: function(){
                this.isPlay = false;
                objectPlayer.startPlay();
            },
            pausePlay: function(){
                this.isPlay = true;
                objectPlayer.pausePlay();
            },
            setFullScreenMode: function(){
                objectPlayer.setFullScreenMode(1);
            },
            //输入手机号码获得优惠券
            sendPhoneNumber: function(){
                //判断是否已经发送
                if(!this.ticket.noSend) return;

                var reg = /^1[3|4|5|7|8]\d{9}$/;  //手机号码正则表达式
                if(reg.test(this.ticket.phoneNumber)) {
                    this.ticket.noSend = false;
                }else {
                    this.popup('请输入正确的手机号码！');
                }
            },
        },
        ready: function(){
            console.log('vue.js is ready!');
        }
    });

/*})(jQuery);*/


//上拉加载评论
 // dropload
$('body').dropload({
    scrollArea : window,
    domUp : {
        domClass   : 'dropload-up',
        domRefresh : '<div class="dropload-refresh">↓下拉刷新-自定义内容</div>',
        domUpdate  : '<div class="dropload-update">↑释放-更新评论</div>',
        domLoad    : '<div class="dropload-load"><span class="loading"></span>加载评论中...</div>'
    },
    loadUpFn : function(me){
        // 为了测试，延迟1秒加载
        setTimeout(function(){
            vm.comments.unshift({imgurl: 'images/sample/user.png', name:'上拉加载', date: '2016年8月3号', time: '15:19:00', word: '试试楼上的开户送快递很快收到货款收到客户收递号开始的开始看到好的开始时到客户的刷卡还是打款还是看到合适的客户收到客户送快递号开始的开始看到好的开始时'});
            // 每次数据加载完，必须重置
            me.resetload();
            // 解锁
            me.unlock();
            me.noData(false);
        },1000);
        /*$.ajax({
            type: 'GET',
            url: 'json/update.json',
            dataType: 'json',
            success: function(data){
                var result = '';
                for(var i = 0; i < data.lists.length; i++){
                    result +=   '<a class="item opacity" href="'+data.lists[i].link+'">'
                                    +'<img src="'+data.lists[i].pic+'" alt="">'
                                    +'<h3>'+data.lists[i].title+'</h3>'
                                    +'<span class="date">'+data.lists[i].date+'</span>'
                                +'</a>';
                }
                // 为了测试，延迟1秒加载
                setTimeout(function(){
                    $('.lists').html(result);
                    // 每次数据加载完，必须重置
                    me.resetload();
                    // 重置索引值，重新拼接more.json数据
                    counter = 0;
                    // 解锁
                    me.unlock();
                    me.noData(false);
                },1000);
            },
            error: function(xhr, type){
                alert('Ajax error!');
                // 即使加载出错，也得重置
                me.resetload();
            }
        });*/
    },
    threshold : 50
});