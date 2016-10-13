var addressObj = Object.create(cityObj);
$.extend(addressObj,{
	name:'我是地址搜索页',
	dom:$('#address'),
	init:function(name){
		this.cityId = name.split('-')[1];//获取城市页面传递的城市对应ID
		//console.log(this.cityId);
		this.loadCityName();
		this.bindEvent();
	},
	loadCityName:function(){
		var _this = this;
		var data = store(this.cityId);//获取现在城市ID
		if(data){//若当前城市ID已缓存过，将不再进行ajax请求，直接进行读取
			this.curCity = data;
			this.render();
			return;
		}
		$.ajax({//请求对应城市ID的信息
			url:'v1/cities/'+ this.cityId,
			type:'GET',
			success:function(res){
				console.log(res);
				store(_this.cityId,res);//将城市信息存储到本地
				_this.curCity = res;
				_this.render()
			}
		})
	},
	render:function(){//渲染选择城市名
		$('.city-name').html(this.curCity.name);
	},
	bindEvent:function(){
		var _this = this;
		$('.search-btn').click(function(event){//点击搜索按钮
			event.preventDefault();//阻止form的默认行为
			var keyword = $('.search-txt').val();//获取搜索框中输入的内容
			if(!keyword){
				return;
			}
			console.log('我在进行搜索操作！',keyword);
			$('.search-history').children().hide();//历史搜索记录区域隐藏
			var data = store(this.cityId + keyword);
			if(data){
				_this.searchList = data;
				_this.renderSearch();
				_this.history();
				return;
			}
			$.ajax({//对输入框的要搜索的内容进行AJAX请求
				url:'/v1/pois?',
				type:'GET',
				data:{
					city_id:_this.cityId,
					keyword:keyword,
					type:'search'
				},
				success:function(res){
					store(_this.cityId + keyword,res);
					_this.searchList = res;
					_this.renderSearch();
					_this.history();
				}
			})
		});
	},
	history:function(){
		$('.search-history').children('a').click(function(event){
			//event.preventDefault();
			var html = $(this)[0].innerText;
			console.log(html);//$(this)[0].hash --> 对应地址hash
		})
	},
	renderSearch:function(){//渲染搜索结果列表
		var html = '';
		for(var i = 0;i < this.searchList.length;i++){
			//console.log(this.searchList[i]);
			html += '<a class="history-address" href="#list-'+ this.searchList[i].geohash +'">' +
						'<p class="address-name">'+ this.searchList[i].name +'</p>' +
						'<p class="specific-address">'+ this.searchList[i].address +'</p>' +
					'</a>';
		}
		$('.search-history').html(html);
	}
})