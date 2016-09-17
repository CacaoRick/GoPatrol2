// 只保留小數後6位
Math.decimal6 = function(num) {
	return Math.floor(num * 1000000 + 0.5) / 1000000
}

// 將角度轉換為弧度
Math.radians = function(degrees) {
	return degrees * Math.PI / 180;
};

// 將弧度轉換為角度
Math.degrees = function(radians) {
	return radians * 180 / Math.PI;
};