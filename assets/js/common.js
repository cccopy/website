

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

});

$(document).on('pjax:end', function(event) {
	if (_headtitle) {
		document.title = _headtitle + " - CCcopy";
	}
	if (_wrapcls) {
		$("#wrap").removeClass("index inpage").addClass(_wrapcls);

		// in detail (do again)
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
});
