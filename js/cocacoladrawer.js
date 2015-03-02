/*globals*/

//begin youtube stuff
var ytPlayer;

function onYouTubePlayerAPIReady() {
  // create the global player from the specific iframe (#video)
  ytPlayer = new YT.Player('video', {
    events: {
      // call this function when player is ready to use
      'onReady': onPlayerReady
    }
  });
}

function onPlayerReady(event) {
  // bind events
  var playButton = $('.drawer-video');
  playButton.on("click", function() {
    ytPlayer.playVideo();
  });

  var pauseButton = $('.video-scrim');
  pauseButton.on("click", function() {
    ytPlayer.seekTo(0, true);
    ytPlayer.pauseVideo();
  });

}
// end youtube stuff

// This config block is for Preview within the studio. For deployment, the paths are changed by the specified 'mainConfigFile'.
require.config({
  shim: {
  },
  paths: {
    jquery: '/bower_components/jquery/dist/jquery',
    lodash: '/bower_components/lodash/dist/lodash',
    uibootstrapper: '/fuiszplayer/common/js/utils/uibootstrapper'
  }
});


require([
  'jquery',
  'uibootstrapper'

], function($, UiBootstrapper) {
  'use strict';

  var Heineken = function(player) {

    var CLICK,
        ACTIVE = 'active';

    var $win                  = $(window),
        $cont                 = $('#template_container'),
        $splashScreen         = $('.splash-screen'),
        $indicatorsLayer      = $cont.find('.indicators-layer'),
        $initCta              = $cont.find('.init-cta'),
        $drawer               = $cont.find('.drawer'),
        $drawerNav            = $cont.find('.drawer-nav'),
        $drawerClose          = $cont.find('.drawer-close-btn'),
        $smallVid             = $cont.find('.drawer-video'),
        $smallVidScrim        = $cont.find('.video-scrim'),
        $buttonSocial         = $cont.find('.button-social'),
        $socialScrim          = $cont.find('.social-scrim'),
        $followIndic;

    var mouseX;
    var mouseY;
    var inside = false;
    var indicActive = false;
    var firstPlay = false;

    this.init = function() {
      //
      CLICK = player.isMobile() ? 'touchstart' : 'click';
    };


    function initUi() {
      // Inject YouTube API script
      var tag = document.createElement('script');
      tag.src = "//www.youtube.com/player_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      $drawerClose.on('click', hideDrawer);
      $drawerNav.delegate('.blip', 'click', handleDrawerNavClick);
      $drawer.on("DOMMouseScroll mousewheel", handleDrawerScroll);

      $smallVid.on('click', handleSmallVidClick);
      $smallVidScrim.on('click', handleScrimClick);

      $buttonSocial.on('click', handleSocialButtonClick);
      $socialScrim.on('click', handleSocialScrimClick);

      $indicatorsLayer.delegate('.indicator', 'click', function() {
        deactivateIndicator();
      });
      $indicatorsLayer.delegate('.sub-indicator', 'click', handleSubIndicatorClick);

      $splashScreen.on(CLICK, function() {
        $splashScreen.removeClass('show-splash');
        player.play();
        _.delay(hideInitCta, 3500);
      });

      firstPlay = true;
    }


    function hideInitCta() {
      $initCta.removeClass('is-visible');
    }

    function showInitCta() {
      $initCta.addClass('is-visible');

      // do the cursor thing
      var $indic = $($('#indicator_template').html());
      $indic.css({
        left: 30,
        top: 26
      });
      $initCta.append($indic);

      _.delay(function() {
        $initCta.find('img').css('opacity', 0.5);
        $indic.addClass(ACTIVE);
        $indic.find('.sub-indicator').each(function(index) {
          _.delay(function() {
            var $sub = $indic.find('.sub-indicator').eq(index)
            $sub.addClass(ACTIVE);
            _.delay(function() {
              $sub.removeClass(ACTIVE);
            }, 100);
          }, index*200 + 400);
        });
        _.delay(function() {
          $indic.removeClass(ACTIVE);
        }, 1400);
      }, 1000);
    }

    function showIndicators() {
      var tags = player.getCurrentAnnotations();
      if(!tags || tags.length < 1) return;

      var $indic,
        x, y, w, h;

      tags.forEach(function(obj, i) {
        $indic = $($('#indicator_template').html()).addClass('i'+obj.item_id);

        x = obj.coordinates[0];
        y = obj.coordinates[1];
        w = obj.coordinates[2];
        h = obj.coordinates[3];

        //centered
        x += (w/2);
        y += (h/2);

        $indic.offset({
          left: x,
          top:  y
        })

        $indicatorsLayer.append($indic);
      });
    }

    function hideIndicators() {
      $indicatorsLayer.children().remove();
    }

    function handleSubIndicatorClick(e) {
      var cIndex = $(e.currentTarget).data('contentIndex');


      setDrawer(cIndex);
      showDrawer();

      hideIndicators();
    }

    function showDrawer() {
      $drawer.removeClass('hidden');
    }

    function hideDrawer() {
      $drawer.addClass('hidden');
    }

    function toggleDrawer() {
      $drawer.hasClass('hidden') ? $drawer.removeClass('hidden') : $drawer.addClass('hidden');
    }

    function setDrawer(drawerNum) {
      var blipNum = drawerNum + 1;
      $('.blip').removeClass('on');
      $('.blip:nth-child(' + blipNum + ')').addClass('on');
      $('.drawer-position').removeClass('p0 p1 p2 p3 p4').addClass('transition p' + drawerNum);
      setTimeout( function(){
        $('.drawer-position').removeClass('transition');
      }, 900);
    }

    function handleDrawerNavClick(e) {
      var $selection = $(e.currentTarget);
      var drawerNum = $selection.index();
      setDrawer(drawerNum);
    }

    function handleDrawerScroll(e){
      var currentDrawer = $('.blip.on').index();
      var nextDrawer, prevDrawer;
      var totalDrawers = $('.drawer-section').length - 1;

      totalDrawers == currentDrawer ? nextDrawer = 0 : nextDrawer = currentDrawer + 1;
      currentDrawer == 0 ? prevDrawer = totalDrawers : prevDrawer = currentDrawer - 1;

      var e = e.originalEvent ? e.originalEvent : e;
      var delta = e.wheelDelta ? e.wheelDelta/1000 : e.detail ? -e.detail/1000 : 0;
      if ( $('.drawer-position').hasClass('transition') ) {
        return;
      }
      if (delta < 0 && totalDrawers != currentDrawer ) {
        setDrawer(nextDrawer);
        return e.preventDefault() && false;
      }
      else if (delta > 0 && currentDrawer != 0 ) {
        setDrawer(prevDrawer);
        return e.preventDefault() && false;
      }
    }

    function handleSmallVidClick() {
      $('.video-modal').removeClass('hidden');
      player.pause();
    }

    function handleScrimClick() {
      $('.video-modal').addClass('hidden');
      player.play();
    }

    function handleSocialButtonClick() {
      $('.social-modal').removeClass('hidden');
    }

    function handleSocialScrimClick() {
      $('.social-modal').addClass('hidden');
    }

    function handleClickItem(e) {
      e.event.stopPropagation();

      if($followIndic.hasClass(ACTIVE)) {
        indicActive = false;
        $followIndic.removeClass(ACTIVE);
        startIndicatorMouseFollow();

      } else {
        indicActive = true;
        $followIndic.addClass(ACTIVE);
        stopIndicatorMouseFollow();
      }
    }

    function startIndicatorMouseFollow() {
      $(document).on('mousemove.cocacola', _.bind(function(e){
        mouseX = e.pageX;
        mouseY = e.pageY;
        $followIndic.css({
            left:  mouseX - 24,
            top:   mouseY - 22
          });
      }, this));
    }
    function stopIndicatorMouseFollow() {
      $(document).unbind('mousemove.cocacola');
    }

    function deactivateIndicator() {
      if(!$followIndic) {
        console.warn('cannot kill an indic that does not exist');
        return;
      }
      $followIndic.removeClass(ACTIVE);
      indicActive = false;
    }


    // Player Events
    player.on('playerReady', function(data) {
      initUi();
    });

    player.on('play', function(data) {
      if(firstPlay) {
        _.delay(function() {
          $initCta.addClass(ACTIVE);
          _.delay(showInitCta, 100);
        }, 500);
        firstPlay = false;
      }

      hideIndicators();
      $('#fuisz-layer').removeClass('paused');
    });

    player.on('pause', function(data) {
      showIndicators();
      if ( inside === true ) {
        $('.indicator').css({
          left:  mouseX,
          top:   mouseY
        });
      }
      $('#fuisz-layer').addClass('paused');
    });

    player.on('pointerEnterVideo', function(data) {
    });

    player.on('pointerLeaveVideo', function(data) {
    });

    // fake pointerEnterVideo events cuz real ones not triggering

    player.on('videoClicked', function(data) {
      if(indicActive) {
        deactivateIndicator();
        hideIndicators();
        if(player.paused) {
          showIndicators();
        }
      }
    });

    player.on('enterHover', function(data) {
      // start tracking mouse
      inside = true;

      if(indicActive) return;

      showIndicators();

      $followIndic = $indicatorsLayer.find('.i'+data.item.item_id);
      startIndicatorMouseFollow();
    });

    player.on('leaveHover', function(data) {
      inside = false;

      if(indicActive) return;

      hideIndicators();
      if( player.paused ) {
        showIndicators();
      }
    });

    player.on('clickItem', handleClickItem);

    player.on('timeupdate', function(data) {
    });

    player.on('complete', function(data) {
    });

    // Redraw indicators on resize
    player.on('resize',function(data){
      hideIndicators();
      if (player.paused){
       showIndicators();
      }
    });

    player.on('orientationChange', function(e) {
    });
  };

  UiBootstrapper.bootstrap(Heineken);
})
