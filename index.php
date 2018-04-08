<?php 
  // load json if file exists, if it doesn't, prase empty json
  if(file_exists('photos.json')) {
    $json = json_decode(file_get_contents('photos.json'));
  } else {
    $json = json_decode('{"config" : { "directory" : "images"}, "photos" : []}');
  }

  //create config and photo arrays
  $config = $json->config;

  $photos = array();
  foreach ($json->photos as $photo) {
    $photos[] = $photo;
  }

  //shuffle photo array
  shuffle($photos);
?>

<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="keywords" content="" />
    <meta name="description" content="" />
    <meta property="og:title" content="Panorama Viewer" />
    <meta property="og:description" content="Panoramic pictures from my travels" />
    <meta property="og:url" content="http://panorama.galacti.co" />
    <meta property="og:image" content="http://panorama.galacti.co/images/og-panorama.jpg" />
    <meta property="og:type" content="website" />
    <meta charset="UTF-8" />

    <script>document.cookie='resolution='+Math.max(screen.width,screen.height)+'; path=/';</script>

    <title>Panorama Viewer</title>

    <link href='https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700' rel='stylesheet' type='text/css'>

    <link rel="stylesheet" type="text/css" href="css/base.css">

    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-71249747-4', 'auto');
      ga('send', 'pageview');

    </script>
  </head>

  <body>
    <div id="container">
      <section id="intro">
        <h1>Panorama Viewer</h1>
      </section>

      <?php foreach ($photos as $photo): ?>
      <figure data-src="<?php echo $config->directory;?>/<?php echo $photo->filename; ?>" class="b-lazy shade-<?php echo rand(1,4); ?>">
        <span data-description="<?php echo $photo->description; ?>" data-location="<?php echo $photo->location; ?>" data-date="<?php echo $photo->date; ?>" data-camera="<?php echo $photo->camera; ?>"></span>
      </figure>
      <?php endforeach; ?>

      <footer>
        <p>&copy;2016<?php if(date('Y') !== "2016"): ?>&ndash;<?php echo date('Y'); ?><?php endif; ?></p>
      </footer>
    </div>

    <script type="text/javascript" src="scripts/jquery.min.js"></script>
    <script type="text/javascript" src="scripts/utilities.js"></script>
    <script type="text/javascript" src="scripts/global.js"></script>
    
    <script type="text/template" id="template-full-size">
      <div class="full-size">
        <div class="controls">
          <div class="button button-information"><span></span></div>
          <div class="button button button-close"><span></span></div>
        </div>
      </div>
    </script>

    <script type="text/template" id="template-image-contents">
        <div class="image-wrap" id="image-scroller">
          <div class="image-loader" data-src="{{src}}?v=full">
            <div class="image-loader-background">
              <div class="image-loader-mask"></div>
              <div class="image-loader-frame"></div>
            </div>
          </div>
        </div>
        
        <div class="image-meta-wrap">
          <div class="image-meta">
            <ul class="image-meta-list">
              <li><span class="meta-title">Title:</span> <p>{{description}}</p></li>
              <li><span class="meta-location">Location:</span> <p>{{location}}</p></li>
              <li><span class="meta-date">Date:</span> <p>{{date}}</p></li>
              <li><span class="meta-camera camera-{{camera_class}}">Camera:</span> <p>{{camera}}</p></li>
            </ul>
          </div>
        </div>
    </script>
  </body>
</html>