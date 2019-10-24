
const _ = require('lodash');

const detailProductConfirm = detail => detail.status == "成品已確認"; 

module.exports = {
	// orders
	orderCanPay: order => order.status == "未付款",
	orderCanShowDetail: order => order.status == "已付款",
	orderCanFinalPay: details => _.filter(details, detailProductConfirm).length == details.length,
	orderCanCancel: order => order.status == "已付款",
	orderCanEvaluate: order => order.status == "已完成",
	orderCanRating: order => order.status == "已完成" && _.isEmpty(order.ratingInfo),
	orderHasCancelled: order => order.status == "已取消"
};
