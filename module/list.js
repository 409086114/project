var listObj = Object.create(cityObj);
$.extend(listObj,{
	name:'我的餐厅列表页',
	dom:$('#list'),
	offset:0,
	init:function(name){
		var _this = this;
		setTimeout(function(){
			_this.bindEvend();
		})
	},
	loadlist: function(name){//加载列表
		this.geohash = name.split('-')[1];//截取获得hash值
		this.loadAddress();
		$('.business-list').html(' ');//重新加载页面
		this.loadFoodsList();	 	
	},
	bindEvend:function(){
		var _this = this;
		var mySwiper = new Swiper('#slide',{
			pagination: '.swiper-pagination',
			paginationType : 'bullets',
			loop:true
		});

		window.addEventListener('scroll', this.scrollHandle);

		$('.goback').click(function(){
			$(window).scrollTop(0);
		});
	},
	scrollHandle:function(){
		var _this = listObj;
		if($(window).scrollTop() > $(window).height()){//回到顶部的显示与隐藏
			$('.goback').children().show();
		}else{
			$('.goback').children().hide();
		}
		if($(window).scrollTop() > $('.list-header').height()){
			$('.list-header').css({
				position:'fixed',
				top:'0',
				left:'0',
				'z-index':'99'
			})
		}else{
			$('.list-header').css('position','');
		}
		if($(window).scrollTop() >= ($('.business-list').height() - $(window).height())){
			$('.index-loadmore').show();
			_this.offset += 20;
			_this.loadBusiness();
		}
	},
	leave:function(){//解绑滚动事件
		this.dom.hide();
		window.removeEventListener('scroll', this.scrollHandle);
	},
	loadAddress:function(){//加载现在选择的地址名称
		var _this = this;
		console.log(this.geohash)
		var data = store(this.geohash);
		
		this.geohashList = data;
		if(data){
			this.history = data;
			this.latitude = this.geohashList.latitude;//经纬度
			this.longitude = this.geohashList.longitude;//经纬度
			this.loadBusiness();
			$('.center').html('<span>'+ this.history.name +'</span>');
			return;
		}
		$.ajax({
			url:'/v2/pois/'+this.geohash,
			type:'GET',
			success:function(res){
				console.log(_this.geohash);
				store(_this.geohash,res);
				_this.geohashList = res

				//console.log(_this.geohash,res.latitude);

				_this.latitude = res.latitude;//经纬度
				_this.longitude = res.longitude;//经纬度
				$('.center').html('<span>'+ res.name +'</span>');
				_this.loadBusiness();
			}
		})
	},
	loadFoodsList:function(){
		var _this = this;
		var data = store('foods');
		if(data){
			this.foodsList = data;
			this.renderFoods();
			return;
		}
		$.ajax({//geohash=wx4g1e82vps&group_type=1&flags[]=F
			url:'v2/index_entry?',
			type:'GET',
			data:{
				'geohash':this.geohash,
				'group_type':'1',
				'flags[]':'F'
			},
			success:function(res){
				store('foods',res);
				_this.foodsList = res;
				_this.renderFoods();
			}
		})
	},
	renderFoods:function(){
		var html = '';
		var str = '';
		for(var i = 0; i < this.foodsList.length;i++){
			if(i < this.foodsList.length/2){//分页进行展示
				html += '<a href="javascript:;'+ this.foodsList[i].id +'" class="food-list"><img src="//fuss10.elemecdn.com/'+ this.foodsList[i].image_url +'" alt=""><span>'+ this.foodsList[i].title +'</span></a>';
			}else{
				str += '<a href="javascript:;'+ this.foodsList[i].id +'" class="food-list"><img src="//fuss10.elemecdn.com/'+ this.foodsList[i].image_url +'" alt=""><span>'+ this.foodsList[i].title +'</span></a>';
			}
			
		}
		$('.slide1').html(html);
		$('.slide2').html(str);
	},
	loadBusiness:function(){//请求商家列表
		var _this = this;
		this.starNum = 5;
		if(this.sock) {
			return;
		}
		this.sock = true; //ajax锁，防止数据正在加载的过程中，再次触发该方法
		//console.log(this.latitude,this.longitude);
		$.ajax({//latitude=30.2768&longitude=120.12478&offset=0&limit=20&extras[]=activities
			url:'/shopping/restaurants?',
			type:'GET',
			data:{
				'latitude':this.latitude,
				'longitude':this.longitude,
				'offset':this.offset,
				'limit':20,
				'extras[]':'activities'
			},
			success:function(res){
				console.log(res);
				_this.sock = false;
				_this.renderBusiness(res);
				$('.index-loadmore').hide();
			}
		})
	},
	renderBusiness:function(data){//is_premium//品牌
		var html = '';
		
		this.prevgeohah = this.curgeohash;//存储geohash
		this.curgeohash = this.geohash;
		console.log(this.prevgeohah,this.curgeohash);
		if(data.length === 0){
			return $('.business-list').append('<div class="error">当前地址无匹配商家，请更换地址后重新搜索！</div>');
		}
		for(var i = 0; i < data.length;i++){
			this.premium = data[i].is_premium;//品牌标签
			this.ensure = data[i].supports;//保、票、准时达
			this.hummingbird = data[i].delivery_mode;//蜂鸟专送delivery_mode
			this.piecewise = data[i].piecewise_agent_fee//运费
			this.rating = data[i].rating;//评分数
			this.time = data[i].order_lead_time;//送货时间
			this.distance = data[i].distance;//距离
			//转换图片路径格式
			var src = data[i].image_path;
			var first = src.slice(0,1);
			var second = src.slice(1,3);
			var third = src.slice(3);
			var format = src.slice(32);
			this.img = first+'/'+second+'/'+third;
			
			if(this.rating === 0){//评分数判断，若是0则评分隐藏
				this.rating = '';
			}
			if(this.premium){//品牌标签判断，若为true则显示
				this.premium = '&#xe62d;';
			}else{
				this.premium = '';
			}

			html += '<div class="business-section">'+
						'<a href="#details-'+ this.geohash +'-'+ data[i].id +'">'+
							'<img src="//fuss10.elemecdn.com/'+ this.img +'.'+ format +'?imageMogr/format/webp/thumbnail/!130x130r/gravity/Center/crop/130x130/" alt="" class="business-logo">'+
							'<div class="information-wrap">'+
								'<section class="business-title">'+
									'<h4>'+
										'<i class="iconfont" id="brand">'+ this.premium +'</i>'+
										'<span class="business-name">'+ data[i].name +'</span>'+
										'<div class="business-ensure">'+
											this.renderEnsure() +
										'</div>'+	
									'</h4>'+
								'</section>'+
								'<section class="business-title business-evaluate">'+
									this.renderStar() +
									'<div class="evaluate-wrap">'+
										'<span class="evaluate-num">'+ this.rating +'</span>'+
										'<span class="volume">月售'+ data[i].recent_order_num +'单</span>'+
									'</div>'+
									'<div class="promise">'+
										this.renderOntime() +
									'</div>'+
								'</section>'+
								'<section class="prompt-title">'+
									'<div class="money-prompt">'+
										'<span>¥'+ this.piecewise.rules[0].price +'起送</span>'+
										'<span class="cost">'+ this.piecewise.tips +'</span>'+
									'</div>'+	
									'<div class="time-prompt">'+
										this.renderDistance() +
									'</div>'+
								'</section>'+
							'</div>'+
						'</a>'+
					'</div>';
		}
		$('.business-list').append(html);
	},
	renderEnsure:function(){//渲染保、票
		var str = '';
		for(var i = 0;i < this.ensure.length;i++){
			if(this.ensure[i].icon_name !== '准'){
				str += '<span>'+ this.ensure[i].icon_name +'</span>';
			}
		}
		return str;
	},
	renderOntime:function(){//渲染准时达和蜂鸟专送
		var str = '';
		if(typeof this.hummingbird !== 'undefined'){
			str += '<span class="hummingbird">'+ this.hummingbird.text +'</span>'
		}
		for(var i = 0;i < this.ensure.length;i++){
			if(this.ensure[i].name === '准时达'){
				str += '<span class="ontime">'+ this.ensure[i].name +'</span>';
			}
		}
		return str;
	},
	renderStar:function(){//渲染星级评分
		var str = '';
		if(this.rating === ''){
			return str = '<div></div>';
		}else{
			var Percentage = this.rating/this.starNum;//获得评分占总分的百分比
			var starWidth = Percentage.toFixed(2)*100;
			//console.log(starWidth);

			return str = '<div class="star-wrap">'+
							'<p class="evaluate">'+
								'<span class="iconfont evaluate-star">&#xe744;</span>'+
								'<span class="iconfont evaluate-star">&#xe744;</span>'+
								'<span class="iconfont evaluate-star">&#xe744;</span>'+
								'<span class="iconfont evaluate-star">&#xe744;</span>'+
								'<span class="iconfont evaluate-star">&#xe744;</span>'+
							'</p>'+
							'<p class="cover" style="width:'+ starWidth +'%;">'+
								'<span class="iconfont evaluate-star">&#xe744;</span>'+
								'<span class="iconfont evaluate-star">&#xe744;</span>'+
								'<span class="iconfont evaluate-star">&#xe744;</span>'+
								'<span class="iconfont evaluate-star">&#xe744;</span>'+
								'<span class="iconfont evaluate-star">&#xe744;</span>'+
							'</p>'+
						'</div>';
		}
	},
	renderDistance:function(){//渲染距离和到达的时间
		var str = '';
		var distance = this.distance;
		this.distance = (this.distance/1000).toFixed(2);
		if(this.distance < 1){
			this.distance = distance;
		}else{
			this.distance += 'k';
		}
		if(this.time === 0){
			return str = '<span>'+ this.distance +'m</span>';
		}else{
			this.time += '分钟';
			return str = '<span>'+ this.distance +'m</span>'+
						 '<span class="cost">'+ this.time +'</span>';
		}
	}
})