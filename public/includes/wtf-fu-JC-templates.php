<?php

/**
 *
 * Plantillas HTML usadas
 * Desarrollo para Jesús Castillo
 *
 */


/**
 *
 * Vista HTML de las opciones aplicables para cada audio.
 *
 */

function getUploadedAudioOptionsView(){

    $view = '<div class="audioOptionViewContainer well">';
    $view .= ' <div class="flex-container"> ';
    $view .= '       <div class="input-container"> ';
    $view .= '        <label for="">Oído Izquierdo</label>';
    $view .= '        <input step="0.5" value=0 style="width:100%" type="number" class="l_input" type="text"> ';
    $view .= '       </div> ';
    $view .= '       <div class="input-container"> ';
    $view .= '        <label for="">Oído Derecho</label>';
    $view .= '        <input step="0.5" value=0 style="width:100%" type="number" class="r_input" type="text"> ';
    $view .= '       </div> ';
    $view .= '  </div>';
    $view .= ' <div class="flex-container right-valign"> ';
    $view .= '        <button title="Selecciona al menos un archivo de audio de la lista" disabled type="button" class="pull-right btn btn-info btn-md btn_process_audio"> <i class="glyphicon glyphicon-chevron-right"></i>  <span class="texto">Procesar</span>  </button> ';
    $view .= ' </div>';
    $view .= '</div>';


    return $view;
}
function getMainAudioTableView($admin = true, $processFiles = true, $title=""){
    $view = '';
    if($title !==""){
     $view .= ' <h2 class="audioTitle">'.$title.'</h2>';
    }
    $view .= '<table id="main-table" role="presentation" class="table table-striped table-responsive">';
    $view .= '   <thead>';
    if( $processFiles){
    $view .= '        <th>Procesar</th>';
    }
    $view .= '        <th class="hidden-small">Previsualizar</th>';
    $view .= '        <th>Archivo</th>';
    $view .= '        <th class="hidden-small">Tamaño</th>';
    if($admin){
    $view .= '        <th>Acciones</th>';
    }
    $view .= '   </thead>';
    $view .= '   <tbody class="files"></tbody>';
    $view .= '</table>';

    return $view;
}


function getLoaderContainerView(){
     $view = '    <div class="loadingStateContainer">';
     $view .= '           <div class="loaderContainer">';
     $view .= '               <i class="glyphicon glyphicon-repeat spin">';
     $view .= '               </i>';
     $view .= '               <br>';
     $view .= '              Procesando tu sonido';
     $view .= '           </div>';
     $view .= '     </div>';

     return $view;
}
function get_file_upload_form_JC($action_href, $form_vars ) {

    $audioOptionsView = getUploadedAudioOptionsView();
    $mainTableView = getMainAudioTableView(true, true);
    $loaderContainerView =  getLoaderContainerView();

            $html = <<<EOUPLOADFILESHTML
<div class="panel-body tbs">
    <!-- The file upload form used as target for the file upload widget -->
    <form id="fileUpload" data-audio-filter="" class='fileUpload jc_FileUploadForm' action="$action_href" method="POST" enctype="multipart/form-data">
        <!-- Redirect browsers with JavaScript disabled to the origin page -->
        $form_vars
        <!-- The fileupload-buttonbar contains buttons to add/delete files and start/cancel the upload -->
        <div class="fileupload-buttonbar">
            <div class="flex-container btn-bar-header-container">
                 <div class="buttons-container">
                    <!-- The fileinput-button span is used to style the file input field as button -->
                    <div class="column">
                        <span class="btn btn-success fileinput-button">
                            <i class="glyphicon glyphicon-plus"></i>
                            <span>Agregar archivos...</span>
                            <input type="file" name="files[]" multiple>
                        </span>
                    </div>
                    <div class="column">
                        <button type="submit" class="btn btn-primary start">
                            <i class="glyphicon glyphicon-upload"></i>
                            <span>Subir archivos</span>
                        </button>
                    </div>
                    <div class="column">
                        <button type="reset" class="btn btn-warning cancel">
                            <i class="glyphicon glyphicon-ban-circle"></i>
                            <span>Cancelar subida</span>
                        </button>
                    </div>
                    <div class="column">
                        <button type="button" class="btn btn-danger delete">
                        <i class="glyphicon glyphicon-trash"></i>
                        <span>Eliminar</span>
                        </button>
                        <input id='chk_all_files' type="checkbox" class="toggle">
                        <!-- The global file processing state -->
                        <span class="fileupload-process"></span>
                    </div>
                  </div>
                  <div class="right-panel-container">
                    $audioOptionsView
                  </div>

            </div>




            <!-- The global progress state -->
            <div class="col-lg-5 fileupload-progress fade">
                <!-- The global progress bar -->
                <div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-bar progress-bar-success" style="width:0%;"></div>
                </div>
                <!-- The extended global progress state -->
                <div class="progress-extended">&nbsp;</div>
            </div>
        </div>
        <!-- The table listing the files available for upload/download -->
        $mainTableView
        $loaderContainerView
    </form>
    <br>
</div>
EOUPLOADFILESHTML;
            return $html;
}

function getProcessAudioForm($action_href, $form_vars, $formId, $audioFilter = "",  $admin = true, $processFiles = true, $tmpId = "template-download") {

    $audioOptionsView = " <div class='right-panel-container' style='display:flex; justify-content:center'>" .
                             getUploadedAudioOptionsView() . "</div>";
    if(!$processFiles){
        $audioOptionsView = '';
    }
    $title = $processFiles ? "Sonidos no procesados" :  "Sonidos procesados";

    $mainTableView = getMainAudioTableView($admin, $processFiles, $title);
    $loaderContainerView =  getLoaderContainerView();
    $html = <<<MAINPROCESSAUDIOFORM
    <div class="panel-body tbs">
        <!-- The file upload form used as target for the file upload widget -->
        <form data-template-id="$tmpId" id= "$formId" data-audio-filter="$audioFilter" class='fileUpload jc_FileUploadForm' action="$action_href" method="POST" enctype="multipart/form-data">
            <!-- Redirect browsers with JavaScript disabled to the origin page -->
            $form_vars

            $audioOptionsView
           
            <!-- The table listing the files available for upload/download -->
            $mainTableView
            $loaderContainerView
        </form>
        <br>
    </div>
MAINPROCESSAUDIOFORM;
            return $html;
}

function getUploadJSTemplate_JC($admin = true, $processFiles = true) {
    $script = '
        <!-- The template to display files available for upload -->
        <script id="template-upload" type="text/x-tmpl">
        {% for (var i=0, file; file=o.files[i]; i++) { %}
            <tr class="template-upload fade">
    ';
if($processFiles){
    $script .= ' <td>
                 </td>';
 }
    $script .= '<td class="hidden-small">
                    <span class="preview"></span>
                </td>
                <td>
                    <p class="name">{%=file.name%}</p>
                    <strong class="error text-danger"></strong>
                </td>
                <td class="hidden-small">
                    <p class="size">Procesando...</p>
                    <div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress-bar progress-bar-success" style="width:0%;"></div></div>
                </td>
     ';           
 if ($admin) {
                

     $script .= ' <td>
                        {% if (!i && !o.options.autoUpload) { %}
                            <button class="btn btn-primary start" disabled>
                                <i class="glyphicon glyphicon-upload"></i>
                                <span>Comenzar</span>
                            </button>
                        {% } %}
                        {% if (!i) { %}
                            <button class="btn btn-warning cancel">
                                <i class="glyphicon glyphicon-ban-circle"></i>
                                <span>Cancelar</span>
                            </button>
                        {% } %}
                    </td> ';
 }
     $script .= '                    
            </tr>
        {% } %}
      </script> ' ;

    return $script;
}


function getDownloadJSTemplate_JC($admin = true, $processFiles = true, $tmpId = "template-download") {
    $script = '
<!-- The template to display files available for download -->
<script id="'.$tmpId.'" type="text/x-tmpl">
   {% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr data-id="{%=file.id%}" class="'.$tmpId.' template-download" fade">
    ';
if($processFiles){
    $script .= '
        <td style="background: rgba(0,0,0,0.02); vertical-align: middle; text-align: center;">
            {% if (!file.processed) { %}
                 <input type="radio" name="chk_procesar">
            {% } %}
        </td>';
 }
    $script .= '

        <td class="hidden-small">
            <span class="preview">
                {% if (file.thumbnailUrl) { %}
                    <a href="{%=file.url%}" title="{%=file.name%}" download="{%=file.name%}" data-gallery><img src="{%=file.thumbnailUrl%}"></a>
                {% } %}
            </span>
        </td>
        <td>

            <p class="name">
                {% if (file.url) { %}
                    <a href="{%=file.url%}" title="{%=file.name%}" download="{%=file.name%}" {%=file.thumbnailUrl?"data-gallery":""%}>{%=file.name%}</a>
                {% } else { %}
                    <span>{%=file.name%}</span>
                {% } %}
            </p>
            {% if (file.error) { %}
                <div><span class="label label-danger">Error</span> {%=file.error%}</div>
            {% } %}
        </td>
        <td class="hidden-small">
            <span class="size">{%=o.formatFileSize(file.size)%}</span>
        </td>
       ';
if($admin) {
$script .= ' <td>

              {% if (file.deleteUrl) { %}
                    <button class="btn btn-danger delete" data-type="{%=file.deleteType%}" data-url="{%=file.deleteUrl%}&action=load_ajax_function"{% if (file.deleteWithCredentials) { %} data-xhr-fields="{"withCredentials":true}"{% } %}>
                        <i class="glyphicon glyphicon-trash"></i>
                        <span>Eliminar</span>
                    </button>
                    <input type="checkbox" name="delete" value="1" class="toggle">
                {% } else { %}
                    <button class="btn btn-warning cancel">
                        <i class="glyphicon glyphicon-ban-circle"></i>
                        <span>Cancelar</span>
                    </button>
                {% } %}

        </td> ';
}
$script .=  '   </tr>
{% } %}

</script>';
    return $script;
}

function getLoadingStateView() {
    $script = <<<LoadingStateContainer
<!-- The template to display files available for download -->
<script id="template-loading" type="text/x-tmpl">
    <div class="loadingStateContainer">
            <div class="loaderContainer">
                 Procesandoooooo
            </div>
    </div>
</script>
LoadingStateContainer;
    return $script;
}

function getFrequencyGeneratorView(){
 $script = <<<FrequencyGenerator
    <div  class="freqGenContainer">
            <button class="button" id="play-button" title="Play/Stop [Space]" onclick="freqGen.onPlayButtonClick()">Play</button>
            <span id="play-indicator" class="stopped"></span>

            <div id="slider" style="margin: 40px 0px 18px 0px" class="ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all"><div class="ui-slider-range ui-widget-header ui-corner-all ui-slider-range-min" style="width: 44.1155%;"></div><span class="ui-slider-handle ui-state-default ui-corner-all" tabindex="0" style="left: 44.1155%;"></span></div>
            <div class="controls">
                <span class="control-group">
                    <label id="volume-slider-label"></label>    
                    <span id="volume-slider" class="ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all"><div class="ui-slider-range ui-widget-header ui-corner-all ui-slider-range-min" style="width: 100%;"></div><span class="ui-slider-handle ui-state-default ui-corner-all" tabindex="0" style="left: 100%;"></span></span>
                    <span id="volume-readout">100%</span>
                    <span class="separator"></span>
                </span>
                <span class="control-group">
                    <button class="octave-button" id="octave-down-button" title="− 1 octave (frequency ÷ 2)" style="margin-right: 10px">×½</button>
                    <button class="freq-button" id="freq-down-button" title="– 1 Hz [Shift+←]"></button>
                    <span id="freq-readout"><small></small>404<small> Hz</small></span>
                    <button class="freq-button" id="freq-up-button" title="+ 1 Hz [Shift+→]"></button>
                    <button class="octave-button" id="octave-up-button" title="+ 1 octave (frequency × 2)" style="margin-left: 10px;">×2</button>
                    <span class="separator"></span>
                </span>
                <span class="control-group">
                    <label id="note-selector-label"></label>
                    <button name="note-selector" id="note-selector" style="width: 110px; margin-right: 20px;" class="">~ G♯4 / A♭4</button>     
                    <button style="display:none" name="get-link" id="get-link">Get link</button>
                </span>
            </div>

     </div>

 
FrequencyGenerator;
    return $script;
}