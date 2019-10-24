
const _ = require('lodash');

const detailProductConfirm = detail => detail.status == "成品已確認"; 

module.exports = {
	// orders
	orderCanPay: order => order.status == "未付款",
	orderCanShowDetail: order => _.includes(["已付款", "成品已確認", "已完成"], order.status),
	orderCanFinalPay: order => order.status == "成品已確認",
	orderCanCancel: order => order.status == "已付款",
	orderCanRating: order => order.status == "已完成" && _.isEmpty(order.ratingInfo),
	orderHasCancelled: order => order.status == "已取消",
	orderReadOnly: order => order.status == "已完成",

	// details
	detailsCanFinalPay: details => _.filter(details, detailProductConfirm).length == details.length
};
