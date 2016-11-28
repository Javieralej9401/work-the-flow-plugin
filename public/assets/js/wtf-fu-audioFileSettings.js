var JC_AudioSettings = (function($){

    /**
     *
     * variables de vista
     *
     */
   
    var viewNames = {
       fileUploadForm: '.jc_FileUploadForm',
       uploadFilesBar: '.jc_FileUploadForm .fileupload-buttonbar',
       audioTableRow: '.files  tr',
       processAudioSettingsBtn : '.btn_process_audio',
       audioSettingsViewContainer: '.audioOptionViewContainer',
       loadingStateView:  '.loadingStateContainer'
    }

    var getSelectedAudiosData = function($form){
        var $selectedAudioRows = $form.find(viewNames.audioTableRow)
                                       .find("input:radio:checked");
      
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
    
    var anyAudioFileSelected = function($mainForm){

        var selectedAudioRows  = getSelectedAudiosData($mainForm);
        return  selectedAudioRows.length > 0
    }

    /**
     *
     * Obtiene los datos establecidos por el usuario
     *
     */
    
    var getAudioSettingsData = function($mainForm){

        var $audioSettingsViewContainer = $mainForm.find(viewNames.audioSettingsViewContainer);
        var $leftEarInput = $audioSettingsViewContainer.find('.l_input');
        var $rightEarInput = $audioSettingsViewContainer.find('.r_input');

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
    var applySettings = function(form, fn){

        var audioSettings = getAudioSettingsData(form);
        var selectedAudioRows  = getSelectedAudiosData(form);
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
                $(viewNames.loadingStateView).addClass("show");
            }
        })
        .done(function(result) {
            fn(result);
           
            
        })
        .fail(function() {
            $(viewNames.loadingStateView).removeClass("show");
            //showMessage({title: 'Operación sin éxito', msg: 'No fue posible procesar el audio seleccionado. Por favor, intentalo nuevamente.'})
        })
        
    }

    /**
     *
     * Borra los audios seleccionados
     *
     */
    
    var resetSelectedAudios = function($form){

        $form.find('input:radio').removeAttr('checked');
       // $(viewNames.audioSettingsViewContainer).find('input').val('0');
        $form.find(viewNames.processAudioSettingsBtn).attr('disabled', 'disabled');

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
            
            $mainForm =  $(this).closest("form");

            if(anyAudioFileSelected($mainForm)){

                var audioSettings = getAudioSettingsData($mainForm);

                if( audioSettings.leftEar === '' 
                    && audioSettings.rightEar === ''){

                    return;
                }

                //Busca el la tabla de audios procesados o la tabla para mostrar todos.
                $processedForms =   $(viewNames.fileUploadForm).filter(function() {
                                            return $.inArray($(this).data("audio-filter"), 
                                                    ["", "processed"]) > -1;
                                          });

                $processedClosestForm = $(this).closest(viewNames.fileUploadForm);

                applySettings($processedClosestForm,  function(result){
                    $(viewNames.loadingStateView).removeClass("show");
                    var audioNames = result.audioData.map(function(index, elem) {
                        return index['file_name'];
                    }).join();

                    resetSelectedAudios($processedClosestForm);

                    $processedForms.find(".files").html('');

                    $processedForms.each(function(index, el) {
                         wtf_file_upload_init($,   el);
                    });
                    
                    if(result.debug){
                        showMessage({title: 'Audios procesados', msg: result.executedCommands.join('\n\n') })
                    }
                });
              
            }else{
                showMessage({title: 'Ningún audio seleccionado', msg: 'Por favor selecciona al menos un audio de la lista.'})
            }

        });

        $(viewNames.fileUploadForm).on('change', '.files input:radio', function(){

            $mainForm = $(this).closest("form");
            $processAudioSettingsBtn = $mainForm.find(viewNames.processAudioSettingsBtn);

            if(!anyAudioFileSelected($mainForm)){

                $processAudioSettingsBtn.attr({
                                                'disabled' : 'disabled',
                                                'title': 'Selecciona al menos un archivo de audio de la lista'
                                              })

            }else{
                $processAudioSettingsBtn.removeAttr('disabled')
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