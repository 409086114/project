var detailsObj = Object.create(cityObj);
$.extend(detailsObj,{
	name:'我是餐厅详情列表页',
	dom:$('#details'),
	init:function(){	
		//console.log(this.geohash);			
	},
	loadlist:function(name){
		var _this = this;
		this.addressID = name.split('-')[1];//截取获得hash值
		this.geohash = name.split('-')[2];//截取获得店铺IDhash值
		this.loadInformation();
		$('.scroll-wrap dl').html(' ');
		this.loadMenu();
	},
	bindEvent:function(){
		if(typeof myScrollFood !== 'undefined') {
			myScrollFood.destroy(); //删掉
		}
		if(typeof myScroll !== 'undefined') {
			myScrollFood.destroy(); //删掉
		}
		window.myScrollFood = new IScroll('.menu-list', {
		    scrollbars: true,
		    bounce: true,
		    preventDefault: false, //让点击事件得以执行
		    probeType:2, //让滚动条滚动正常
		    interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
		window.myScroll = new IScroll('.menu-view', {
			    scrollbars: true,
			    bounce: true,
			    preventDefault: false, //让点击事件得以执行
			    probeType:2, //让滚动条滚动正常
			    interactiveScrollbars: true,
				shrinkScrollbars: 'scale',
				fadeScrollbars: true
			});	
	},
	loadInformation:function(){//渲染店铺名字
		var _this = this;
		var data = store(this.addressID);
		this.latitude = data.latitude;
		this.longitude = data.longitude;
		$.ajax({///shopping/restaurant/402763?extras[]=activities&extras[]=album&extras[]=license&extras[]=identification&extras[]=statistics&latitude=40.84316&longitude=122.75118
			url:'/shopping/restaurant/'+ this.geohash +'?extras[]=activities&extras[]=album&extras[]=license&extras[]=identification&extras[]=statistics&latitude='+ this.latitude +'&longitude='+ this.longitude,
			type:'GET',
			success:function(res){
				_this.renderInformation(res);
			}
		})
	},
	renderInformation:function(data){//activities	
		var src = data.image_path;//图片转换
		var first = src.slice(0,1);
		var second = src.slice(1,3);
		var third = src.slice(3);
		var format = src.slice(32);
		this.img = first+"/"+second+"/"+third;
		this.activities = data.activities;//活动内容
		this.order_time = data.order_lead_time;//延时送货时间
		console.log(this.img,format);
		var html = '';
		html += '<div class="business-background" style="background-image: url(https://fuss10.elemecdn.com/'+ this.img +'.'+ format +'?imageMogr/quality/80/format/webp/thumbnail/!40p/blur/50x40/);">'+
					'<div class="business-main">'+
						'<img src="https://fuss10.elemecdn.com/'+ this.img +'.'+ format +'?imageMogr/quality/80/format/webp/" alt="" class="business-img">'+
						'<div class="business-information">'+
							'<h2>'+ data.name +'</h2>'+
							'<p>'+
								'<span>商家配送</span>'+
								this.renderOrdertime() +
								'<span>'+ data.piecewise_agent_fee.description +'</span>'+
							'</p>'+
							'<div class="business-activity">'+
								this.renderActivities() +
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>'+
				'<div class="activity-word">'+
					'<p>公告</p>'+
					'<span>'+ data.promotion_info +'</span>'+
					'<b>〉</b>'+
				'</div>';
		$('.datails-header').html(html);
	},
	renderActivities:function(){//渲染活动
		var str = '';
		if(this.activities.length === 0){
			return str;
		}
		str += '<ul>';
		for(var i = 0;i < this.activities.length;i++){
			str +=  '<li>'+
						'<i style="background-color:#'+ this.activities[i].icon_color +';">'+ this.activities[i].icon_name +'</i>'+
						'<span>'+ this.activities[i].description +'</span>'+
					'</li>';
		}
		str += '</ul>';
		str += '<div class="activity-information">'+
					'<span>'+ this.activities.length +'个活动</span>'+
					'<span>〉</span>'+
				'</div>';
		return str;
	},
	renderOrdertime:function(){
		var str = '';
		if(this.order_time === 0){
			return str;
		}
		return str = '<span>'+ this.order_time +'分钟送达</span>';
	},
	loadMenu:function(){
		var _this = this;
		$.ajax({
			url:'/shopping/v1/menu?restaurant_id='+this.geohash,
			type:'GET',
			success:function(res){	
				var me =  _this			
				_this.renderMenu(res);		
				setTimeout(function(){//滚动条。
					me.bindEvent();
				})
			} 
		})
	},
	renderMenu:function(data){//渲染左侧列表
		console.log(data)
		var html = '';
		for(var i = 0;i < data.length;i++){
			var str = '';
			this.foods = data[i].foods;
			this.foodsName = data[i].name;//分类名
			this.description = data[i].description;//简介
			this.renderViewTit();
			this.renderView();
			if(data[i].icon_url.length){
				var src = data[i].icon_url;//图片转换
				var first = src.slice(0,1);
				var second = src.slice(1,3);
				var third = src.slice(3);
				var format = src.slice(32);
				this.pic = first+"/"+second+"/"+third;
				str += '<img class="menu-img" src="//fuss10.elemecdn.com/'+ this.pic +'.'+ format +'">';
			}
			html += '<li>'+ str +'<span>'+ this.foodsName +'</span></li>';
		}
		$('.menu-view ul').html(html);
	},
	renderViewTit:function(){
		var str = '';
		str += '<dt>'+
					'<p class="menu-tit">'+
						'<span class="food-name">'+ this.foodsName +'</span>'+
						'<span>'+ this.description +'</span>'+
						'<i></i>'+
					'</p>'+
				'</dt>';
		$('.scroll-wrap dl').append(str);	
	},
	renderView:function(){
		var html = '';
		for(var i = 0;i < this.foods.length;i++){
			//console.log(this.foods[i].image_path)
			this.foodsSrc = this.foods[i].image_path;
			html += 
					'<dd>'+
						this.renderImg() +
						'<div class="foodinfo">'+
							'<header>'+ this.foods[i].name +'</header>'+
							'<p>'+ this.foods[i].description +'</p>'+
							'<p class="foodsales">'+
								'<span>月售'+ this.foods[i].month_sales +'份</span>'+
								'<span>好评率'+ this.foods[i].satisfy_rate +'%</span>'+
							'</p>'+
							'<strong class="foodprice">'+
								'¥<span>'+ this.foods[i].specfoods[0].price +'</span>'+
							'</strong>'+
							'<div class="cartbutton">'+
								'<a href="javascript:" class="minus iconfont">&#xe600;</a>' +
								'<span class="entityquantity">1</span>'+
								'<a href="javascript:" class="plus iconfont">&#xe655;</a>' +
							'</div>'+
						'</div>'+
					'</dd>';
		}
		$('.scroll-wrap dl').append(html);
	},
	renderImg:function(){
		var str = '';
		
		if(this.foodsSrc === null){
			return '';
		}
		var src = this.foodsSrc;//图片转换
		var first = src.slice(0,1);
		var second = src.slice(1,3);
		var third = src.slice(3);
		var format = src.slice(32);
		this.url = first+"/"+second+"/"+third;
		return str +=   '<div class="list-img">'+
							'<img src="//fuss10.elemecdn.com/'+ this.url +'.'+ format +'?imageMogr/thumbnail/140x140/format/webp/quality/85" alt="" class="food-img">'+
						'</div>';
	}
})
				