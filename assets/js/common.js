

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
			timeout: 5000, 
			push: false, 
			replace: true,
			type: "POST"
		});
	});

	$(document.body).on('submit', 'form[header-search]', function(event){
		$.pjax.submit(event, '#main-pjax-container', { timeout: 5000, type: "GET" });
	});
}

function bindLogoutLink(){
	$(document.body).on('click', 'a[logout-link]', function(event) {
		$.pjax.click(event, '#main-pjax-container', {
			timeout: 5000, 
			push: false, 
			replace: true
		});
	});
}

function bindMoreAjax(){
	$('a[more-ajax]').click(moreAjaxHandler);
}

function bindAddCartAjax(){
	$('a[addcart-ajax]').click(function(e){
		e.preventDefault();
		$.ajax({ url: $(this).attr('href'), method: "POST", data: { item: $(this).attr('item') } })
			.done(function(response){
				if (response.success) {
					$("a[cart-link] span[cart-count]").text(response.count);
					alert("已加入購物車");
				} else {
					alert("加入購物車失敗");
				}
			})
			.fail(function(){ alert("加入購物車失敗"); });	
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

	$(document).pjax('a[main-pjax-link]', '#main-pjax-container', { timeout: 5000 });

	bindMoreAjax();
	bindFormSubmit();
	bindAddCartAjax();
	bindLogoutLink();

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
	}
	if ( window._toLogged ) {
		$("a[login-link]").replaceWith('<a logout-link href="/auth/logout">登出</a>' + 
			'<a ugindex-link main-pjax-link href="/user/ugindex">會員專區</a>' + 
			'<a cart-link main-pjax-link href="/user/cart">購物車(<span cart-count>' + window._cartCount + '</span>)</a>');
		bindLogoutLink();
		window._toLogged = false;
	}
	if ( window._toLogout ) {
		$("a[logout-link]").replaceWith('<a login-link main-pjax-link href="/auth/login">登入</a>');
		$("a[ugindex-link], a[cart-link]").remove();
		window._toLogout = false;
	}
});
