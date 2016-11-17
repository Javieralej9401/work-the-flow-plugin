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

function get_file_upload_form_JC($action_href, $form_vars ) {

    $audioOptionsView = getUploadedAudioOptionsView();

            $html = <<<EOUPLOADFILESHTML
<div class="panel-body tbs">
    <!-- The file upload form used as target for the file upload widget -->
    <form id="fileupload" class='jc_FileUploadForm' action="$action_href" method="POST" enctype="multipart/form-data">
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
        <div >
          <table role="presentation" class="table table-striped table-responsive">
            <thead>
                <td>Procesar</td>
                <td class='visible-md visible-lg'>Previsualizar</td>
                <td>Archivo</td>
                <td>Tamaño</td>
                <td>Acciones</td>
            </thead>
            <tbody class="files"></tbody>
         </table>

        </div>
      
    </form>
    <br>
</div>              
EOUPLOADFILESHTML;
            return $html;
}



function getUploadJSTemplate_JC() {
    $script = <<<UPLOADJSTEMPLATE
<!-- The template to display files available for upload -->
<script id="template-upload" type="text/x-tmpl">
{% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr class="template-upload fade">
         <td>
        </td> 
        <td class='visible-md visible-lg'>
            <span class="preview"></span>
        </td>
        <td>
            <p class="name">{%=file.name%}</p>
            <strong class="error text-danger"></strong>
        </td>
        <td>
            <p class="size">Procesando...</p>
            <div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress-bar progress-bar-success" style="width:0%;"></div></div>
        </td>
        <td>
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
        </td>
    </tr>
{% } %}
</script>

UPLOADJSTEMPLATE;
    return $script;
}

function getDownloadJSTemplate_JC() {
    $script = <<<DOWNLOADJSTEMPLATE
<!-- The template to display files available for download -->
<script id="template-download" type="text/x-tmpl">
   {% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr data-id="{%=file.id%}" class="template-download fade"> 
        <td style='background: rgba(0,0,0,0.02); vertical-align: middle; text-align: center;'>
            <input type="radio" name='chk_procesar'>
        </td> 
        <td class='visible-md visible-lg'>
            <span class="preview">
                {% if (file.thumbnailUrl) { %}
                    <a href="{%=file.url%}" title="{%=file.name%}" download="{%=file.name%}" data-gallery><img src="{%=file.thumbnailUrl%}"></a>
                {% } %}
            </span>
        </td>
        <td>
            <p class="name">
                {% if (file.url) { %}
                    <a href="{%=file.url%}" title="{%=file.name%}" download="{%=file.name%}" {%=file.thumbnailUrl?'data-gallery':''%}>{%=file.name%}</a>
                {% } else { %}
                    <span>{%=file.name%}</span>
                {% } %}
            </p>
            {% if (file.error) { %}
                <div><span class="label label-danger">Error</span> {%=file.error%}</div>
            {% } %}
        </td>
        <td>
            <span class="size">{%=o.formatFileSize(file.size)%}</span>
        </td>
        <td>
            {% if (file.deleteUrl) { %}
                <button class="btn btn-danger delete" data-type="{%=file.deleteType%}" data-url="{%=file.deleteUrl%}&action=load_ajax_function"{% if (file.deleteWithCredentials) { %} data-xhr-fields='{"withCredentials":true}'{% } %}>
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
        </td>
    </tr>
{% } %} 
</script>
DOWNLOADJSTEMPLATE;
    return $script;
}

