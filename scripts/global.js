function append_zoom(target, meta) {
  // use templates to build and insert the .full-size <div> or swap its contents if already present

  if($('.full-size').length === 0) {
    // use mustache.js to insert the .full-size div after the target <figure>
    var template = $('#template-full-size').html();
    var html = Mustache.render(template);
    $('figure').eq(target).after(html);
  }

  // mustache.js the template to (the top of) .full-size, pass in meta object
  var template = $('#template-image-contents').html();
  var html = Mustache.render(template, meta);
  $('.full-size').prepend(html);

  load_full_size();
}


function close_zoom(photo, scroll, next) {
  // remove the .full-size element, reset scroll (if necessary), call open_zoom() for next image if needed
  if (scroll === undefined) {
    scroll = false;
  }

  if (next === undefined) {
    next = null;
  }

  var same_target = false;
  if(get_target(photo) === get_target(next)) {
    same_target = true;
  }

  // if scrolling is required, animate scroll to top of .selected
  if(scroll) {
    scroll_to(photo);  
  }

  // add inline CSS to image with its pixel height to aid animation, animate .full-size div to height: 0
  var image = $('.full-size img');
  $(image).css("height", $(image).height());

  if(next == null) {
    $('.controls').remove();
    $('.full-size').animate({
      height: "0"}, 500,
      function() {
        // Remove 'selected' class from thumbnail, delete 'full-size' div
        $(photo).removeClass('selected');
        $('.full-size').remove();
    });
  } else {
    $(photo).removeClass('selected');
    if(same_target) {
      $('.image-wrap, .image-meta-wrap').remove();
    } else {
      $('.full-size').remove();
    }
    open_zoom(next);
  }
  
}


function get_camera_class(camera) {
  // Return CSS class string for specific model cameras that have a unique icon, otherwise return default
  var cameras = [
    { key: 'Sony DSC-H20', value: 'sony-dsc-h20' },
    { key: 'Canon EOS Rebel T2i', value: 'canon-t2i' },
    { key: 'Apple iPhone 3GS', value: 'apple-iphone-3gs' },
    { key: 'Apple iPhone 5', value: 'apple-iphone-5' },
    { key: 'Apple iPhone 6', value: 'apple-iphone-6' },
  ];

  var camera_class = 'default';

  var search = true;
  var i = 0;

  while(search && cameras[i]) {
    if(cameras[i].key === camera) {
      search = false;
      camera_class = cameras[i].value;
    }
    i++;
  }

  return camera_class;
}


function get_columns() {
  return parseInt(window.getComputedStyle(document.querySelector('body'), '::after').getPropertyValue('content').match(/\d/g));
}


function get_photo_meta(photo) {
  // retrieve image details from HTML attributes of the photo passed in, return meta object
  var meta = new Object();

  meta.src = $(photo).css('background-image');
  meta.src = meta.src.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
  // http://stackoverflow.com/questions/8809876/can-i-get-divs-background-image-url

  meta.description = $(photo).find('span').attr('data-description');
  meta.location = $(photo).find('span').attr('data-location');
  meta.date = $(photo).find('span').attr('data-date');
  meta.camera = $(photo).find('span').attr('data-camera');
  meta.camera_class = get_camera_class(meta.camera);

  return meta;
}


function get_target(photo) {
  // return .full-size <div> insert point ("after <figure> X") based on a photo object being passed in

  // retrieve number of columns from css-generated body pseudo element, remove extra quotes, cast to integer
  var columns = get_columns();

  var index = $('figure').index(photo);
  var count = $('figure').length;
  var offset = (index+1) % columns;

  var target;
  // check to make sure insert target is within range
  if ((index + offset) < count) {
    // if offset is not 0, insert target is (current photo's index + (num columns - offset))
    // if offset is 0, insert target is current photo's index
    target = offset !== 0 ? index + (columns - offset) : index;  
  } else {
    // place after last figure element
    target = count-1;
  }

  return target;
}


function load_full_size() {
  // retrieve image src and load full-size image; after load is complete, remove loader animation, prepend image and create new draggable instance
  // ?v=full found in template requests full resolution file fron server rather than adapative images processed version
  var src = $('.image-loader').attr('data-src');
  
  var newImage = new Image;
  newImage.onload = function() {
    $('.image-loader').remove();
    $('#image-scroller').prepend($('<img>', {src: this.src}))
    Draggable.create("#image-scroller", {type:"scrollLeft", edgeResistance:0.85, throwProps:true, lockAxis:true});
  }

  newImage.src = src;
}


function open_zoom(photo) {
  // add class selected to the photo clicked to display triangle :after
  $(photo).addClass('selected');

  var target = get_target(photo);

  // get photo's meta information for the caption panel
  var meta = get_photo_meta(photo);

  append_zoom(target, meta);

  // position top of viewport with 50% of selected element, if available
  scroll_to(photo, ($(photo).outerHeight()/2));
}


function scroll_to(photo, offset) {
  // scroll to target photo, off set from top of element if offset value is passed to function
  if (offset === undefined) {
    offset = 0;
  }

  var target = Math.floor($(photo).offset().top + offset);

  $('html, body').animate(
    { scrollTop: target }, 300
  );
}


function toggle_meta(photo) {
  // toggle animation class on .full-size element to hide or show image information panel
  var target = $(photo).parents('.full-size');
  $(target).toggleClass('show-meta');
}



////////////////////////////////////////////////////////////////


$(document).ready(function() {
  
  ;(function() {
    // Initialize image lazy load
    var bLazy = new Blazy({
      offset: Math.ceil(window.innerHeight * .5)
    });
    })();

    //preload selected images (loader animation bg, full-size bg)
    var image_directory = 'images/';
    var images = ['layout/loader.svg', 'layout/pattern.svg'];
    for (i = 0; i < images.length; i++) {
      var new_image = new Image();
      new_image.src = image_directory + images[i];
    }

});


$('#container').on("click", 'figure', function() {
  // apply click behavior for photo thumbnails
  if($('.selected').length !== 0) {
    if($(this).hasClass('selected')) {
      // if click target is currently .selected, close .full-size
      close_zoom(this, true);
    } else {
      // if there is already a .selected element that is not the clicked object, close .full-size without scolling, send clicked element to be opened next
      close_zoom($('.selected'), false, this);
    }
  } else {
    // send Google Analytics event containing description of image that was clicked
    ga('send', 'event', 'Open Zoom', $(this).children('span').attr('data-description'), 'Interactions');

    // open .full-size element for clicked thumbnail
    open_zoom(this);
  }
});


// apply click events for close/information buttons
$('#container').on('click', '.button-close', function() {
  close_zoom($('.selected'), true);
});

$('#container').on('click', '.button-information', function() {
  // if meta panel is currently closed, send Google Analytics event with description
  if($('.full-size').hasClass('show-meta') === false) {
    ga('send', 'event', 'Open Meta', $('.selected').children('span').attr('data-description'), 'Interactions');
  }

  toggle_meta(this);
});

// append touch class to body ontouchstart event -- use in conjunction with body:not(.touch) CSS selector for :hover styles
if ('ontouchstart' in window) {
  if(!$('body').hasClass('touch')) {
    $('body').addClass('touch');
  }
}


// use rate limited resize listener to reset zoom after resize is complete
// https://css-tricks.com/snippets/jquery/done-resizing-event/
var resizeTimer;

$(window).on('resize', function(e) {

  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    // if a full-size image is open, close zoom
    if($('.full-size').length > 0) {
      close_zoom($('.selected'), true);
    }

  }, 250);

});