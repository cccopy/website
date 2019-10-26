
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
	orderCanShowQuote: order => _.includes(["已付款", "成品已確認"], order.status),

	// details
	detailsCanFinalPay: details => _.filter(details, detailProductConfirm).length == details.length,

	// detail for actions
	detailCanSubmitFactor: detail => _.includes(["等待審核素材", "素材審核失敗"], detail.status),
	detailHasSubmitFactor: detail => detail.status == "素材審核中",
	detailHasReviewFactor: detail => detail.status == "拍攝剪輯中",
	detailCanModify: detail => _.includes(["A copy交付", "B copy交付"], detail.status),
	detailHasSubmitModify: detail => _.includes(["A copy修改", "B copy修改"], detail.status),

	// detail for product
	detailCanSeeAcopy: detail => _.includes(["A copy交付", "A copy修改"], detail.status),
	detailCanSeeBcopy: detail => _.includes(["B copy交付", "B copy修改"], detail.status),
	detailCanSeeCcopy: detail => detail.status == "C copy交付",
	detailWaitFinalPay: detail => detail.status == "成品已確認",
	detailCanDownload: detail => detail.status == "成品已確認" && (detail.products && detail.products.length)
};
