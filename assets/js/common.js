
window.paceOptions = {
	ajax: { trackMethods: ['GET', 'POST'] }
};

function bindMoreRC(){
	$(".moreRC").owlCarousel({
	    loop:false,
	    dots:true,
	    margin: 0,
	    responsiveClass:true,
	    responsive:{
	        0:{
	            items:1,
	            nav:true
	        },
	        720:{
	            items:2,
	            nav:true
	        },
	        1000:{
	            items:3,
	            nav:true
	        }
	    }
	});
}

function bindBuyMore(){
	$(".buyMore").owlCarousel({
	    loop:false,
	    dots:true,
	    margin: 0,
	    responsiveClass:true,
	    responsive:{
	        0:{
	            items:2,
	            nav:true
	        },
	        720:{
	            items:3,
	            nav:true
	        },
	        1000:{
	            items:5,
	            nav:true
	        }
	    }
	});
}

function bindSwebFlow(){
	$(".swebflow").owlCarousel({
	    loop:false,
	    dots:true,
	    margin: 0,
	    responsiveClass:true,
	    responsive:{
	        0:{
	            items:3,
	            nav:false
	        },
	        600:{
	            items:4,
	            nav:false
	        },
	        720:{
	            items:5,
	            nav:false
	        },
	        1000:{
	            items:7,
	            nav:false
	        }
	    }
	});
}

function bindSindexkv(){
	$(".sindexkv").owlCarousel({
	    loop:true,
	    autoplay:true,
	    dots:true,
	    nav:false,
	    margin: 0,
	    responsiveClass:true,
	    responsive:{
	        0:{
	            items:1,
	        },
	        600:{
	            items:1,
	        },
	        720:{
	            items:1,
	        },
	        1000:{
	            items:1,
	        }
	    }
	});
}

function bindIndexPL(){
	$(".indexPL").owlCarousel({
	    loop:false,
	    dots:true,
	    margin: 0,
	    responsiveClass:true,
	    responsive:{
	        0:{
	            items:1,
	            nav:true
	        },
	        720:{
	            items:2,
	            nav:true
	        },
	        1000:{
	            items:3,
	            nav:true
	        }
	    }
	});
}

function bindFormSubmit(){
	$(document.body).on('submit', 'section.login form', function(event) {
		// event.preventDefault(); // stop default submit behavior when it bubbles to <body>
		$.pjax.submit(event, '#main-pjax-container', { 
			scrollTo: false,
			timeout: 7000, 
			push: false, 
			replace: true,
			type: "POST"
		});
	});

	$(document.body).on('submit', 'form[header-search]', function(event){
		// event.preventDefault();
		$.pjax.submit(event, '#main-pjax-container', { timeout: 7000, type: "GET" });
	});

	$(document.body).on('submit', 'form[order-cancel]', function(event){
		$.pjax.submit(event, '#main-pjax-container', { 
			timeout: 7000, 
			push: false, 
			replace: true,
			type: "POST"
		});
	});
}

function bindCartConfirm(){
	$(document.body).on('submit', 'form[cart-confirm]', function(event){
		// event.preventDefault();
		$.pjax.submit(event, '#main-pjax-container', { 
			timeout: 7000, 
			push: false, 
			replace: true,
			type: "POST"
		});
	});
}

function bindLogoutLink(){
	$(document.body).on('click', 'a[logout-link]', function(event) {
		// event.preventDefault();
		$.pjax.click(event, '#main-pjax-container', {
			timeout: 7000, 
			push: false, 
			replace: true
		});
	});
}

function bindRatingForm(){
	$(document.body).on('click', 'form[rating-form] .score span', function(event) {
		var selfjq = $(this),
			selfParent = selfjq.parent(), 
			starSpans = selfParent.children(),
			prepare = selfParent.siblings(".prepare"),
			ratingInput = selfParent.siblings("input[name=rating]"),
			activeSrc = prepare.children("img[rating-active]").attr("src"),
			emptySrc = prepare.children("img[rating-empty]").attr("src"),
			index = selfjq.index();

		starSpans.each(function(idx){
			var img = $(this).children("img");
			if ( idx <= index ) {
				img.attr("src", activeSrc);
			} else {
				img.attr("src", emptySrc);
			}
		});
		ratingInput.val(index + 1);
	});

	$(document.body).on('submit', 'form[rating-form]', function(event){
		$.pjax.submit(event, '#main-pjax-container', { 
			timeout: 7000, 
			push: false, 
			replace: true,
			type: "POST"
		});
	});
}

function bindMoreAjax(){
	$('a[more-ajax]').click(moreAjaxHandler);
}

function bindAddCartAjax(){
	$('a[addcart-ajax]').click(function(e){
		e.preventDefault();
		var errorMsg = "加入購物車失敗";
		$.ajax({ url: $(this).attr('href'), method: "POST", data: { item: $(this).attr('item') } })
			.done(function(response){
				if (response.success) {
					// renew add link
					$("div[add-addition-static]").each(function(){
						var jqthis = $(this);
						var itemId = jqthis.attr("item");
						var pitemId = jqthis.attr("pitem");
						jqthis.replaceWith('<a add-addition-ajax href="/ajax/addition/add" item="' + itemId
							 + '" pitem="' + pitemId + '" class="btn">加購</a>');
					});
					bindAddAdditionAjax();
					alert("已加入購物車");
				} else alert(response.message || errorMsg);
				if (response.count) $("a[cart-link] span[cart-count]").text(response.count);
			})
			.fail(function(e){ 
				console.error(e);
				alert(errorMsg);
			});	
	});
}

function bindAddFavoriteAjax(){
	$(document.body).on('click', 'a[add-favorite-ajax]', function(e){
		e.preventDefault();
		var errorMsg = "加入收藏失敗";
		$.ajax({ url: $(this).attr('href'), method: "POST", data: { item: $(this).attr('item') } })
			.done(function(response){
				if (response.success) {
					alert("已加入收藏");
				} else alert(response.message || errorMsg);
			})
			.fail(function(e){ 
				console.error(e);
				alert(errorMsg);
			});	
	});
}

function bindAddAdditionAjax(){
	$('a[add-addition-ajax]').click(function(e){
		e.preventDefault();
		var jqthis = $(this);
		var errorMsg = "加購失敗";
		$.ajax({ url: jqthis.attr('href'), method: "POST", data: { item: jqthis.attr('item'), pitem: jqthis.attr('pitem') } })
			.done(function(response){
				if (response.success) alert(response.message || "已加入購物車");
				else alert(response.message || errorMsg);
				if (response.count) $("a[cart-link] span[cart-count]").text(response.count);
			})
			.fail(function(e){ 
				console.error(e);
				alert(errorMsg);
			});	
	});
}

function moreAjaxHandler(e) {
	e.preventDefault();
	$.ajax({ url: $(this).attr('href') })
		.done(function(response){
			$("#more-replacer").replaceWith(response);
			bindMoreAjax();
		});
}

function bindTooltip(){
	$(document.body).tooltip({
		selector: "[tool-tip]",
		container: "#main-pjax-container"
	});
}

function bindAdditionTypeSelection(){
	$("select[addition-type]").change(function(){
		var jqthis = $(this);
		var idx = jqthis.find(":selected").index();
		var wrap = jqthis.parent();
		var spanWrap = wrap.siblings(".price").find("b span");
		spanWrap.addClass("hidden");
		spanWrap.eq(idx).removeClass("hidden");
		wrap.siblings("a[add-addition-ajax]").attr("item", jqthis.val());
		wrap.siblings("div[add-addition-static]").attr("item", jqthis.val());
	});
}

function bindCartDomEvents(){
	// maybe change to Vue
	function getAdditionTuple(price, title, type, pid, id){
		return '<div class="row tbody" jq-price="' + price + '">' + 
			'<div class="td col-lg-4"><span>' +
				'<span class="sth">加購項目</span>' +
				title +
			'</span></div>' +
			'<div class="td col-lg-2"><span>' +
				'<span class="sth">規格</span>' +
				(type || "") +
			'</span></div>' +
			'<div class="td col-lg-1"><span>' +
				'<span class="sth">價格</span>' +
				'$' + parseInt(price).toLocaleString() +
			'</span></div>' +
			'<div class="td col-lg-1"></div>' +
			'<div class="td col-lg-1"></div>' +
			'<div class="td col-lg-1"></div>' +
			'<div class="td col-lg-2 edit">' +
				'<span><a remove-addition-ajax href="/ajax/addition/remove" pitem="' + pid +
				'" item="' + id + '">刪除</a></span>' +
			'</div>' +
		'</div>';
	}

	$("[jq-group]").each(function(){
		var jqthis = $(this);
		var maintype = jqthis.find("select[maintype]");
		var subtype = jqthis.find("select[subtype]");
		var typeprice = jqthis.find("span[type-price]");
		var ajaxAnchor = jqthis.find("a[add-addition-ajax-cart]");
		maintype.change(function(){
			var option = maintype.children(":selected");
			var linkgroupName = option.attr("link-to");
			var linkOptions = subtype.children("option[link-from=" + linkgroupName + "]");
			subtype.children("option[link-from]").attr("hidden", "");
			if (linkOptions.length) {
				linkOptions.removeAttr("hidden");
				typeprice.text("-");
				ajaxAnchor.attr("item", "");
				subtype.val("").show();
			} else {
				subtype.hide();
				ajaxAnchor.attr("item", option.val());
				typeprice.text( "$" + parseInt(option.attr("price")).toLocaleString() );
			}
		});
		subtype.change(function(){
			var option = subtype.children(":selected");
			ajaxAnchor.attr("item", option.val());
			typeprice.text( "$" + parseInt(option.attr("price")).toLocaleString() );
		});

		ajaxAnchor.click(function(e){
			e.preventDefault();
			var item = ajaxAnchor.attr("item");
			var pitem = ajaxAnchor.attr("pitem");
			var errorMsg = "加入購物車失敗";
			if ( item == "") alert("請選擇規格");
			else {
				$.ajax({ url: ajaxAnchor.attr('href'), method: "POST", data: { item: item, pitem: pitem } })
					.done(function(response){
						if (response.success) {
							var infos = response.infos;
							var insertHtml = getAdditionTuple(infos.price, infos.title, infos.type, infos.pid, infos.id);
							$(insertHtml).insertAfter(jqthis.find("[new-addition-append]").last());
							triggerCartPriceRefresh();
							alert(response.message || "已加入購物車");
						} else alert(response.message || errorMsg);
						if (response.count) $("a[cart-link] span[cart-count]").text(response.count);
					})
					.fail(function(e){ 
						console.error(e);
						alert(errorMsg);
					});	
			}
		});
	});
}

function triggerCartPriceRefresh(){
	var totalPrice = 0;
	$("[jq-group]").each(function(){
		var jqthis = $(this);
		var sum = 0;
		jqthis.find("[jq-price]").each(function(){
			sum += parseInt($(this).attr("jq-price"));
		});
		jqthis.find("[jq-total]").text(sum.toLocaleString());
		totalPrice += sum;
	});
	$("[jq-alltotal]").text( totalPrice.toLocaleString() );
}

function bindRemoveAdditionAjax(){
	$(document.body).on('click', 'a[remove-addition-ajax]', function(e){
		e.preventDefault();
		var jqthis = $(this);
		var errorMsg = "刪除失敗";
		$.ajax({ url: jqthis.attr('href'), method: "POST", data: { item: jqthis.attr('item'), pitem: jqthis.attr('pitem') } })
			.done(function(response){
				if (response.success) {
					jqthis.parents("[new-addition-append]").remove();
					triggerCartPriceRefresh();
					alert(response.message || "已刪除");
				}
				else alert(response.message || errorMsg);
				if (response.count) $("a[cart-link] span[cart-count]").text(response.count);
			})
			.fail(function(e){ 
				console.error(e);
				alert(errorMsg);
			});	
	});
}

function bindRemoveCartAjax(){
	$(document.body).on('click', 'a[removecart-ajax]', function(e){
		e.preventDefault();
		var jqthis = $(this);
		var errorMsg = "刪除失敗";
		$.ajax({ url: jqthis.attr('href'), method: "POST", data: { item: jqthis.attr('item') } })
			.done(function(response){
				if (response.success) {
					var stableWrap = jqthis.parents("[jq-group]");	
					if ( response.count == 0 ) {
						stableWrap.removeAttr("jq-group");
						$("[remove-when-empty]").remove();
						stableWrap.append('<div class="row tbody"><div class="td col-lg-12">購物車無商品</div></div>');
					} else {
						stableWrap.remove();
						triggerCartPriceRefresh();
					}
					alert(response.message || "已刪除");
				}
				else alert(response.message || errorMsg);
				if (response.count) $("a[cart-link] span[cart-count]").text(response.count);
			})
			.fail(function(e){ 
				console.error(e);
				alert(errorMsg);
			});	
	});
}

$(document).ready(function() {
	var x; 
	x=$(window).width();
	if (x>1023) {
		$('.menu').hover(function(){
			var _this = $(this),
				_submenuOpen = _this.find('.submenu');
			_submenuOpen.stop(true, true).slideToggle(200);
		});
	}
	if (x<1023) {
		$('.menu').click(function(){
			var _this = $(this),
				_submenuOpen = _this.find('.submenu');
				_arrowDown = _this.find('span');
			_submenuOpen.stop(true, true).slideToggle(200);

		});
	}




	$('body').addClass('js');
	var $menu = $('#menu'),
	$menulink = $('.menu-link');

	$menulink.click(function() {
		$menulink.toggleClass('active');
		$menu.toggleClass('active');
		return false;
	});

	new WOW().init();


	$("[data-fancybox]").fancybox({
		// Options will go here
	});
	
	bindIndexPL();
	
	bindMoreRC();

	bindBuyMore();
	
	bindSwebFlow();

	bindSindexkv();
	
	$('.basic-select').select2();
	$( "#datepicker" ).datepicker();


	$('a.page-scroll').bind('click', function(event) {
		var $anchor = $(this);
		$('html, body').stop().animate({
			scrollTop: $($anchor.attr('href')).offset().top
		}, 500);
		event.preventDefault();
	});

	$('.openUpgrate').click(function(){
		$('.popUpgrate').fadeIn();
	});

	$('.popclose').click(function(){
		$('.pop').fadeOut();
	});

	$(document).pjax('a[main-pjax-link]', '#main-pjax-container', { timeout: 7000 });

	bindMoreAjax();
	bindFormSubmit();
	bindCartConfirm();
	bindAddCartAjax();
	bindLogoutLink();
	bindTooltip();
	bindAdditionTypeSelection();
	bindAddAdditionAjax();
	bindCartDomEvents();
	bindRemoveAdditionAjax();
	bindRemoveCartAjax();
	bindAddFavoriteAjax();
	bindRatingForm();

	$('a[fast-search-link]').click(function(event){
		event.preventDefault();
		var jqform = $("form[header-search]"),
			jqinput = jqform.find("input[name=s]");
		jqinput.val($(this).text());
		jqform.submit();
		jqinput.val("");
	});
});

$(document).on('pjax:end', function(event) {
	if ( window._headtitle ) {
		document.title = _headtitle + " - CCcopy";
	}
	if ( window._wrapcls ) {
		$("#wrap").removeClass("index inpage").addClass(_wrapcls);

		// in detail (do again)
		bindMoreRC();
		bindAddCartAjax();

		bindMoreAjax();
		// bindFormSubmit();
		bindIndexPL();
		bindBuyMore();
		bindSwebFlow();
		bindSindexkv();
		bindTooltip();
		bindAdditionTypeSelection();
		bindAddAdditionAjax();
		bindCartDomEvents();
	}
	if ( window._toLogged ) {
		$("a[login-link]").replaceWith('<a logout-link href="/auth/logout">登出</a>' + 
			'<a ugindex-link main-pjax-link href="/user/ugindex">會員專區</a>' + 
			'<a cart-link main-pjax-link href="/user/cart">購物車(<span cart-count>' + window._cartCount + '</span>)</a>');
		window._toLogged = false;
	}
	if ( window._toLogout ) {
		$("a[logout-link]").replaceWith('<a login-link main-pjax-link href="/auth/login">登入</a>');
		$("a[ugindex-link], a[cart-link]").remove();
		window._toLogout = false;
	}
});
