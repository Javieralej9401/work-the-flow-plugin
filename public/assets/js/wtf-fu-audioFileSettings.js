var JC_AudioSettings = (function($){

    /**
     *
     * variables de vista
     *
     */
    
    var viewNames = {
       fileUploadForm: '.jc_FileUploadForm',
       uploadFilesBar: '.jc_FileUploadForm .fileupload-buttonbar',
       audioTableRow: '.files .template-download',
       processAudioSettingsBtn : '.btn_process_audio',
       audioSettingsViewContainer: '.audioOptionViewContainer'
    }

    var getSelectedAudiosData = function(){
        var $selectedAudioRows = $(viewNames.audioTableRow).find("input:radio:checked");
      
        return $selectedAudioRows.map(function(i, e){
            var $row = $(e).closest('tr');
            var id = $row.attr('data-id') || '';
            return id;
        }).toArray() || [];

    }
    /**
     *
     * Verifica si existe algun archivo de audio seleccionado en la tabla.
     * 
     */
    
    var anyAudioFileSelected = function(){

        var selectedAudioRows  = getSelectedAudiosData();
        return  selectedAudioRows.length > 0
    }

    /**
     *
     * Obtiene los datos establecidos por el usuario
     *
     */
    
    var getAudioSettingsData = function(){

        var $leftEarInput = $(viewNames.audioSettingsViewContainer).find('.l_input');
        var $rightEarInput = $(viewNames.audioSettingsViewContainer).find('.r_input');

        return {
            leftEar: $leftEarInput.val().trim() || "",
            rightEar: $rightEarInput.val().trim() || "",
        }

    }

    /**
     *
     * Guarda y aplica los cambios realizados a los audios seleccionados
     *
     */
    var applySettings = function(){

        var audioSettings = getAudioSettingsData();
        var selectedAudioRows  = getSelectedAudiosData();
        var selectedAudioId = selectedAudioRows[0];

        $.ajax({
            url: WtfFuAjaxVars.url,
            type: 'POST',
            dataType: 'json',
            data: {action: 'wtf_fu_JC', 
                    'params': {
                     'selectedAudioId':  selectedAudioId,
                     'audioSettings' : audioSettings
                    } 
            },
            beforeSend: function(){

                $(viewNames.processAudioSettingsBtn).find('.texto').html('Procesando...');
            }
        })
        .done(function(result) {
            $(viewNames.processAudioSettingsBtn).find('.texto').html('Procesar');
            var audioNames = result.audioData.map(function(index, elem) {
                return index['file_name'];
            }).join();

            resetSelectedAudios();

            $('.files').html('');
            wtf_file_upload_init($);

            if(result.debug){
                showMessage({title: 'Audios procesados', msg: result.executedCommands.join('\n\n') })
            }
           
        })
        .fail(function() {
            $(viewNames.processAudioSettingsBtn).find('.texto').html('Procesar');
            //showMessage({title: 'Operación sin éxito', msg: 'No fue posible procesar el audio seleccionado. Por favor, intentalo nuevamente.'})
        })
        
    }

    /**
     *
     * Borra los audios seleccionados
     *
     */
    
    var resetSelectedAudios = function(){

        $(viewNames.fileUploadForm).find('input:radio').removeAttr('checked');
       // $(viewNames.audioSettingsViewContainer).find('input').val('0');
        $(viewNames.processAudioSettingsBtn).attr('disabled', 'disabled');

    }

    var showMessage = function(data){
       
        alert(data.msg);
    }

    var init = function(){

       

        /**
         *
         * Evento click al procesar los audios seleccionados
         *
         */
        
        $(viewNames.processAudioSettingsBtn).on('click', function(e){
            e.preventDefault();

            if(anyAudioFileSelected()){

                var audioSettings = getAudioSettingsData();

                if( audioSettings.leftEar === '' 
                    && audioSettings.rightEar === ''){

                    return;
                }
          
                applySettings();
              
            }else{
                showMessage({title: 'Ningún audio seleccionado', msg: 'Por favor selecciona al menos un audio de la lista.'})
            }

        });

        $(viewNames.fileUploadForm).on('change', '.files input:radio', function(){

            if(!anyAudioFileSelected()){

                $(viewNames.processAudioSettingsBtn).attr({
                                                            'disabled' : 'disabled',
                                                            'title': 'Selecciona al menos un archivo de audio de la lista'
                                                          })

            }else{
                $(viewNames.processAudioSettingsBtn)
                           .removeAttr('disabled')
                           .removeAttr('title');
            }

        })

        

    }

    return {
        init : init
    }

}(jQuery));

jQuery(document).ready(function($) {
     JC_AudioSettings.init();
});