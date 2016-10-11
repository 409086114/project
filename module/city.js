var cityObj = {
	name:'我是城市切换页',
	dom:$('#city'),
	hotName:'hotCity',
	init:function(){
		this.bindEvent();
		this.loadHotCity();
		this.loadAllCity();
	},
	bindEvent:function(){
		$(window).scroll(function(){//回到顶部的显示与隐藏
			if($(window).scrollTop() > $(window).height()){
				$('.backtop').children().show();
			}else{
				$('.backtop').children().hide();
			}
		})
		$('.backtop').click(function(){//点击回到顶部
			console.log('回到顶部！');
			$(window).scrollTop(0);
		})
	},
	loadHotCity:function(){//加载热门城市
		var _this = this;
		var data = store(this.hotName);
		if(data){
			this.hotCity = data
			this.render();
			return;
		}
		$.ajax({
			url:'/v1/cities?type=hot',
			type:'GET',
			success:function(res){
				store(_this.hotName,res);
				_this.hotCity = res;
				_this.render();
			}
		}) 
	},
	render:function(){//渲染热门城市
		var html = '';
		for(var i = 0; i < this.hotCity.length;i++){
			html += '<li class="city-list"><a href="#address-'+ this.hotCity[i].id +'">'+ this.hotCity[i].name +'</a></li>';
		}
		$('.hot-wrap').html(html);
	},
	loadAllCity:function(){//加载全部城市
		var keyword = ["A","B","C","D","E","F","G","H","J","K","L","M","N","P","Q","R","S","T","W","X","Y","Z"];
		var _this = this;
		var data = store(this.cityName);
		$.ajax({
			url:'v1/cities?type=group',
			type:'GET',
			success:function(res){
				_this.renderAll(keyword,res)
				_this.renderEn(keyword);
			}
		})
	},
	renderEn:function(keyword){//渲染索引表
		var _this = this;
		var html = '';
		for(var i = 0;i < keyword.length;i++){
			html += '<li><a href="javascript:;">'+ keyword[i] +'</a></li>';
		}
		$('.indexes-list').html(html);

		$('.indexes-list').find('li').click(function(){//字母检索
			//console.log($(this));
			_this.stairs($(this));
		})
	},
	renderAll:function(keyword,data){//渲染城市开头字母标题
		var str = '';
		for(var i = 0;i < keyword.length;i++){
			var key = keyword[i];
			var cityList = data[key];
			
			str += '<div class="current-city"><h4 class="current">'+ keyword[i] +' (按字母排序)</h4><ul class="allCity-wrap city-list-wrap">'+ this.renderCity(cityList) +'</ul></div>';
		}
		$('.city-wrap').html(str);
	},
	stairs:function(dom){//楼梯
		var now = $('.city-wrap').children().eq(dom.index())[0];//转换成原生DOM元素
		$(window).scrollTop(now.offsetTop);
	},
	renderCity:function(data){//渲染对应城市
		var str = '';
		for(var i = 0;i < data.length;i++){
			str += '<li class="city-list"><a href="#address-'+ data[i].id +'">'+ data[i].name +'</a></li>';
		}
		return str;
	},
	enter: function(){
		//进入该模块
		this.dom.show();	 	
	},
	leave: function(){
		//离开该模块
		this.dom.hide();
	}
}