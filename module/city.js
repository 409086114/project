var cityObj = {
	name:'我是城市切换页',
	dom:$('#city'),
	init:function(){
		this.bindEvent();
	},
	bindEvent:function(){

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