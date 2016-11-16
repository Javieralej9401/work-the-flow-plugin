<?php

/*  
 * Extension de la clase class-wtf-fu-fileupload-shortcode
 * Desarrollo para Jesús Castillo
 */

require_once( plugin_dir_path(__FILE__) . '../../includes/class-wtf-fu-options.php' );
require_once( plugin_dir_path(__FILE__) . '../../includes/wtf-fu-common-utils.php' );
require_once( plugin_dir_path(__FILE__) . 'wtf-fu-templates.php' );
require_once( plugin_dir_path(__FILE__) . 'wtf-fu-JC-templates.php' );


/**
 * class-wtf-fu-workflow-shortcode.php
 * Wtf_Fu_Fileupload_Shortcode
 * 
 * This class handles the File Upload capability.
 * 
 * @author EJCSoftwareSolutions <www.ejcsoftwaresolutions.com.ve>
 */
class Wtf_Fu_Fileupload_JC_Shortcode extends Wtf_Fu_Fileupload_Shortcode {

      /**
     * Renders the File upload form and sets up the options for the UploadHandler.
     * @param array $options
     * @return type
     */
    function uploadFilesHtml($options) {

        $form_vars = '';

        // Add the ajax handler action for jQuery to our options.
        $options['action'] = 'load_ajax_function';

        // 
        // Put unmassaged options into POST vars for subsequent posts of 
        // the form. These are then read by the ajax handler load_ajax_function.
        // and then passed as options to the UploadHandler class. 
        // 
        foreach ($options as $k => $v) {
            $form_vars = $form_vars . '<input type="hidden" name="' . $k . '" value="' . $v . '" />';
        };
        
        
        // log_me(array("form created"=>$form_vars));

        // The form action MUST be the wp admin hander which will then delegate
        // to our ajax hook load_ajax_function. 
        $action_href = admin_url() . 'admin-ajax.php';

        $html = get_file_upload_form_JC($action_href, $form_vars)
                . getGalleryWidgetTemplate()
                . getUploadJSTemplate_JC()
                . getDownloadJSTemplate_JC();

        return ($html);
    }

    public static function getAudioFileData($id){

        global $wpdb;

        $currentUser = wp_get_current_user();

        $queryRs = $wpdb->get_results( "SELECT ID, file_name 
                                        FROM ". $wpdb->prefix ."user_audio_files 
                                        WHERE user_id = ". $currentUser->ID .
                                        ' AND ID =  '.$id);

        return  $queryRs[0];

    }

     /*
      * Funcion que se ejecuta para procesar los audios selecionados
      */
    public static function processAudioHandler() {

        ob_start();

        extract($_POST);

        //Ids de los audios pasados en la vista.
        $selectedAudioId = $params['selectedAudioId'];

        // Se busca la data del audio seleccionado del usuario
        $audioFileData = self::getAudioFileData($selectedAudioId);

        if(!audioFileData){
            throw new Exception("No fue posible encontrar el registro", 1);
            return;
        }

        // Parametros ingresados desde la vista.
        $leftEarSettingValue = $params['audioSettings']['leftEar'];
        $rightEarSettingValue = $params['audioSettings']['rightEar'];

        // Comandos plantillas a ejecutar para cada oido.
        $leftEarCommand1 = 'sox [NOMBRE_AUDIO] -C 320 -c 1 [NOM_NUEVO_AUDIO] sinc [PARAM] mixer -l';
        $rightEarCommand1 = 'sox [NOMBRE_AUDIO] -C 320 -c 1 [NOM_NUEVO_AUDIO] sinc [PARAM] mixer -r';

        /* Se ejecuta los comandos para el audio seleccionado  */
      

        // Variables a reemplazar en la plantilla
        $variablesInCommand = array(
              '[NOMBRE_AUDIO]',
              '[NOM_NUEVO_AUDIO]',
              '[PARAM]'
        );

        // Argumentos para el odio izquierdo
        $leftEarCommandArguments = array(
              $audioFileData->file_name,
              'nombrenuevo',
               escapeshellarg($leftEarSettingValue)
        );

        // Argumentos para el odio derecho
        $rightEarCommandArguments = array(
              $audioFileData->file_name,
              'nombrenuevo',
               escapeshellarg($rightEarSettingValue)
        );


        /* Se reeemplazan las variables con los datos correspondientes en los comandos */
        $leftC = str_replace($variablesInCommand, $leftEarCommandArguments, $leftEarCommand1);
        $rightC = str_replace($variablesInCommand, $rightEarCommandArguments, $rightEarCommand1);

        /* Ejecucion de los comandos para cada oido */
    
        /*  
            try {

               shell_exec(escapeshellcmd($leftC));
               shell_exec(escapeshellcmd($rightC)); 

            } catch (\Exception $e) {
              
            }
          

        */

        $response = array( 'success' => true, 'audioData' => [$audioFileData]  );
      
        exit( json_encode( $response ) ) ;
    }


}
