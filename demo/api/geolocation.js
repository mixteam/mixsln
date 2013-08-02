function geo_getLocation() {
	api.geolocation.get(function(json) {
		alert(JSON.stringify(json));
	});
}

function geo_searchLocation() {
	api.geolocation.search('中国浙江省杭州市西湖区塘苗路18号', function(json) {
		alert(JSON.stringify(json));
	});
}