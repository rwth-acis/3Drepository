<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html;charset=utf-8'></meta>
    <link rel='stylesheet' type='text/css' href='http://www.x3dom.org/x3dom/release/x3dom.css'></link>
    <script type='text/javascript' src='http://www.x3dom.org/x3dom/release/x3dom.js'></script>
    <script type="text/javascript" src="http://code.jquery.com/jquery-2.1.0.min.js" ></script>
     
    <style type="text/css">  
        textarea {
            width: 100%;
        }        
        button {
            margin: 5px;
        }
#viewer-div {
    height: 600px;
    width: 45%;
    float: left;
    padding: 10px;
}
#x3dViewer {
    height: 90%;
    width: 100%;
    margin-bottom: 10px;
}
#annotations {
    float:left;
    padding:10px;
    height: 600px;
    width: 45%;
    overflow-y: auto;
}
#gallery-div {
    width: 99%;
    float: bottom;
    padding:5px;
    overflow-x: auto;
    clear: both;
}
#gallery {
    
}
#gallery img {
  width:256px;
  height:256px;
}
#gallery td img
{
  border:1px solid grey;
  text-decoration:none;
}
#debug_div{
    display: none;
}
img {
    margin-right: 5px;
}
.time_column {
    width: 150px;
}
.hide {
    display: none;
}
     </style>
  </head>
  <body>
    <div id="viewer-div">
      <!-- X3D ---------------------------------------------------- -->
      <x3d id='x3dViewer' showStat='false' showLog='false' x='0px' y='0px'>
        <scene>
          <inline id='inlineBox'></inline>
		</scene>
      </x3d>
      
      <!-- INFO --------------------------------------------------- -->
      <?php 
        function formatSizeUnits($bytes)
          {
            if ($bytes >= 1073741824) return number_format($bytes / 1073741824, 2) . ' GB';
            if ($bytes >= 1048576) return number_format($bytes / 1048576, 2) . ' MB';
            if ($bytes >= 1024) return number_format($bytes / 1024, 2) . ' KB';
            if ($bytes > 1) return $bytes . ' byte(s)';
          }
        echo "Meshsize:" . formatSizeUnits(filesize($x3dFile))
      ?>
      <button type="button" id="btnInfo">Meshinfo on</button> 
    </div>
    <!-- ANNOTATIONS -------------------------------------------- -->
    <div id="annotations">
      <div id="divAdd">
        <h4 id="headerAddAnnotation">Add new annotation</h4>
        <textarea rows="4" id="textNewAnnotation"></textarea> 
        <button type="button" id="btnAddAnnotation"><img src="images/add.png">Add</button>
      </div>
      <div id="divEdit" class=" hide">
        <h4 id="headerEditAnnotation">Edit selected annotation</h4>
        <textarea rows="4" id="textEditAnnotation"></textarea> 
        <button type="button" id="btnEditAnnotation"><img src="images/ok.png">Save</button>
        <button type="button" id="btnCancelEdit"><img src="images/close.png">Cancel</button>
        <button type="button" id="btnDeleteAnnotation"><img src="images/Recycle.png">Delete</button>
      </div>
      <div id="scrollable_annotations">
        <img src="ajax-loader.gif" alt="Loader" style="display:none" id="ajax_loader">
        <table id="annotationTable">
          <tr>
            <th class="time_column">Time</th>
            <th>Annotation</th>
          </tr>
        </table>
      </div>
    </div>
    
    <!-- NAVIGATION/GALLERY ------------------------------------- -->
    <div id="gallery-div">
      <table id="gallery" class="gallery">
        <tr>
        </tr>
      </table>
    </div>
    <div id="debug_div" style="display: none;">Debug:</div>
    
    <script type="text/javascript" src="annotations.js" ></script>    
  </body>
</html>

