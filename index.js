var route = new Router({
	'/:page':function(name){
		routeControl.init(name);
	}
});
route.init('/city');