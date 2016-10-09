var routeControl = (function(){
	var hashMap = {//路由关系映射表
		'city':cityObj,
		'address':addressObj,
		/*'list':listObj,
		'details':detailsObj*/
	};
	var preModule = null;//前一模块
	var curModule = null;//当前模块

	var CachePageMap = {};//模块是否缓存过的映射表
	function init(name){
		console.log('我获取了路由的名字',name);
		var module = hashMap[name] || hashMap['city'];
		if(module){//路由映射表中有这个方法
			if(typeof CachePageMap[name] === 'undefined'){
				//该模块未被实例化，需要进行初始化操作
				module.init(name);//初始化
				CachePageMap[name] = module;//进行赋值，已缓存过

				preModule = curModule;
				curModule = module;

				if(preModule){//前一模块不为空时，
					preModule.leave();//离开前一模块
				}
				console.log(preModule);
				module.enter();//进入当前模块
			}else{//该模块已被实例化，不需要再次进行初始化操作
				console.log('已被实例化过，当前为',name);
				preModule = curModule;
				curModule = module;
				if(preModule){//前一模块不为空时，
					preModule.leave();//离开前一模块
				}
				module.enter();//进入当前模块
			}
		}
	}
	return {
		init:init
	}
})()