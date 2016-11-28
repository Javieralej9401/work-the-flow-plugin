<?php

/*  
 * Extension de la clase class-wtf-fu-fileupload-shortcode
 * Desarrollo para Jesús Castillo
 */

require_once( plugin_dir_path(__FILE__) . '../../includes/class-wtf-fu-options.php' );
require_once( plugin_dir_path(__FILE__) . '../../includes/wtf-fu-common-utils.php' );
require_once( plugin_dir_path(__FILE__) . 'wtf-fu-templates.php' );
require_once( plugin_dir_path(__FILE__) . 'wtf-fu-JC-templates.php' );
require_once( plugin_dir_path(__FILE__) . 'UploadHandler.php' );



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
         * Renders the File upload form and sets up the options for the 

    UploadHandler.
         * @param array $options
         * @return type
         */
    function uploadFilesHtml($options) {

      $form_vars = '';

            // Add the ajax handler action for jQuery to our options.
      $options['action'] = 'load_JC_ajax_function';

            // 
            // Put unmassaged options into POST vars for subsequent posts of 
            // the form. These are then read by the ajax handler load_ajax_function.
            // and then passed as options to the UploadHandler class. 
            // 
      foreach ($options as $k => $v) {
        $form_vars = $form_vars . '<input type="hidden" name="' . $k . '" 

        value="' . $v . '" />';
      };


            // log_me(array("form created"=>$form_vars));

            // The form action MUST be the wp admin hander which will then delegate
            // to our ajax hook load_ajax_function. 
      $action_href = admin_url() . 'admin-ajax.php';

      $html = get_file_upload_form_JC($action_href, $form_vars)
      . getGalleryWidgetTemplate()
      . getUploadJSTemplate_JC()
      . getDownloadJSTemplate_JC()
      . getLoadingStateView();
     
      return ($html);
    }

    public static function wtf_fu_load_ajax_function(){
           
//        log_me(array("ajax handler REQUEST:" => $_REQUEST));        
//        check_ajax_referer( 'wtf_fu_upload_nonce', 'security' );
        ob_start();
      
        // Get the option defaults.
        $db_options = Wtf_Fu_Options::get_upload_options();

        if ((wtf_fu_get_value($db_options, 'deny_public_uploads') == true) && !is_user_logged_in()) {
            ob_end_clean();
            die("<div class=\"alert\">Public upload access is not allowed. Please log in and try again.</div>");
        }   
           
        $options = $db_options;
        
        // Overwrite defaults with options set by the request.
        foreach (array_keys($options) as $k) {
            if (isset($_REQUEST[$k])) {
                $options[$k] = $_REQUEST[$k];
            }
        }

        // put in a fornat suitable for the UploadHandler.
        $options = self::massageUploadHandlerOptions($options);
        
        // Add in deny options from database AFTER we have processed form field options.
        $options['deny_file_types'] = '/\.('. $db_options['deny_file_types'] . ')$/i';   

        // Include the upload handler.
        require_once('UploadHandler.php');

        error_reporting(E_ALL | E_STRICT);
       
        ob_end_clean(); // Discard any warnings output.
        $options =  $options + array("wtf-jc-audios" =>  true);
        $upload_handler = new UploadHandler($options);

        die(); // always exit after an ajax call.
    }


    public static function getAudioFileData($id){

      global $wpdb;

      $currentUser = wp_get_current_user();

      $queryRs = $wpdb->get_results( "SELECT ID, file_name, file_path 
        FROM ". $wpdb->prefix ."user_audio_files 
        WHERE user_id = ". $currentUser->ID .
        ' AND ID =  '.$id);

      return  $queryRs[0];

    }

    /**
     * Función que retorna los intervalos de frecuencia para ambos oidos
     */
    public static function getFrequencyIntervals($baseRightEar,$baseLeftEar){
        $leftEarStep = $rightEarStep = 500; // constante para ambos oidos.

        $rightBottom = $baseRightEar-$rightEarStep;
        $rightTop = $baseRightEar+$rightEarStep;

        $leftBottom = $baseLeftEar-$leftEarStep;
        $leftTop = $baseLeftEar+$leftEarStep;

      
        return array(
          'rightEarInterval' => array(
                                  'bottom' => $rightBottom, //Baja
                                  'top' => $rightTop //Alta
                                  ),
          'leftEarInterval' => array(
                                  'bottom' => $leftBottom, // Baja
                                  'top' => $leftTop //Alta
                                  )
          );
    }

    /*
    * Función que genera un nombre de archivo manteniendo la extension.
    */
    public static function generateFileName($file_name = '', $newNamePrefix = '', $newNameSufix = '', $ext = null){

      // Nombre del archivo sin extension
      $withoutExt = preg_replace('/\\.[^.\\s]{3,4}$/', '', $file_name);
         //Nuevo nombre temporal
      $newName = !$ext ? str_replace($withoutExt, $newNamePrefix.$withoutExt.$newNameSufix , $file_name)
                  :  $newNamePrefix.$withoutExt.$newNameSufix.$ext;     
      $newName = preg_replace('/\s+/', '_', $newName);

      return $newName;
    }

    /*
    * Función que retorna la ruta de los archivos subidos por el usuario
    * Usar esta ruta en el comando final y el archivo procesado pueda ser visto.
    */
    public static function getUploadPath($absolute = false) {
      $pluginOptions = Wtf_Fu_Options::get_upload_options();
      $return = wtf_fu_get_user_upload_paths(
        $pluginOptions['wtf_upload_dir'], 
        $pluginOptions['wtf_upload_subdir'], 0, 
        $pluginOptions['use_public_dir']
        );

      $return = $absolute ? $return['upload_dir'] : $return['upload_url'];

      return $return;
    }

    /**
     * Función que retorna la ruta temporal del archivo (preprocesamiento)
     */
    public static function getTempAudioPath($absolute = false){

      $uploadPath = self::getUploadPath($absolute);
      $tempFolderName = 'tmp';

      $tempFolderPath = $uploadPath.'/'.$tempFolderName;

      if(!file_exists($tempFolderPath)) {
        mkdir($tempFolderPath, 0755, true);
      }

      return $tempFolderPath;
    }

    /*
    * Vaciar carpeta temporal
    */
    public static function clearTmpFolder(){
      $files = glob(self::getTempAudioPath(true).'/*');
      foreach($files as $file){
          if(is_file($file)) // si se trata de un archivo
            unlink($file); // lo elimina
      }
    }

    public static function executeCommandBatch($commands){

      $executedCommands = array();

      foreach ($commands as $command) {

        $finalCommand = str_replace(
          $command['commandTemplateVariables'], 
          $command['commandTemplateArguments'], 
          $command['commandTemplate']
        );

        // Se almacena los comandos ejecutados (con parametros sustituidos)
        array_push($executedCommands, $finalCommand);

        // Se ejecuta el comando
        try {
          shell_exec(escapeshellcmd($finalCommand));
          // Aqui se puede colocar en executedCommands el resultado de la  ejecucion (Exito o fracaso)
        } catch (\Exception $e) {

        }

      }

      return $executedCommands;
    } 

    public static function registerFinalOutput($baseUrl, $fileName, $fileName2){

       global $wpdb;

       $tableName = $wpdb->prefix . "user_audio_files";
       $currentUser = wp_get_current_user();
       $queryRs = $wpdb->get_var( "SELECT EXISTS( SELECT * FROM $tableName 
                                   WHERE user_id = ". $currentUser->ID 
                                   . " AND file_name = '". $fileName. "' )");
      
        if($queryRs == 0 && file_exists( self::getUploadPath(true) . "/" . $fileName) ){

            $wpdb->insert( 
               $tableName, 
               array(
                'user_id' => $currentUser->ID,
                'file_name' => $fileName,
                'file_path' => self::getUploadPath() . "/" . $fileName,
                'processed' => 1,
                )
             );

             $wpdb->insert( 
               $tableName, 
               array(
                'user_id' => $currentUser->ID,
                'file_name' => $fileName2,
                'file_path' => self::getUploadPath() . "/" . $fileName2,
                'processed' => 1,
                'type' => "image"
                )
             );
        }

    }
    public static function createImgThumbnail($imgName){

        $newFile = new stdClass();
        $newFile->name =  $imgName;
        $newFile->type =  "image/png";
        $newFile->url =  self::getUploadPath(true).'/'. $imgName;

        if(file_exists($newFile->url)){

            $db_options = Wtf_Fu_Options::get_upload_options();
            if ((wtf_fu_get_value($db_options, 'deny_public_uploads') == true) && !is_user_logged_in()) {
                ob_end_clean();
                die("<div class=\"alert\">Public upload access is not allowed. Please log in and try again.</div>");
            }   
           $options = $db_options;
           // put in a fornat suitable for the UploadHandler.
           $options = self::massageUploadHandlerOptions($options);
           // Add in deny options from database AFTER we have processed form field options.
           $options['deny_file_types'] = '/\.('. $db_options['deny_file_types'] . ')$/i';   
           
           $uphand  = new UploadHandler($options, false);
           $filePath =  self::getUploadPath(true).'/'. $imgName;
           $uphand->handle_image_file($filePath, $newFile );
      
        }

        return true;
    }
 /*
    * Función que se ejecuta para procesar los audios selecionados
    */
    public static function processAudioHandler() {

        ob_start();

        extract($_POST);

          //Ids de los audios pasados en la vista.
        $selectedAudioId = $params['selectedAudioId'];

          // Se busca la data del audio seleccionado del usuario
        $audioFileData = self::getAudioFileData($selectedAudioId);

        if(!$audioFileData){
          throw new Exception("No fue posible encontrar el registro", 1);
          return;
        }

          // Parametros ingresados desde la vista.
        $leftEarSettingValue = $params['audioSettings']['leftEar'];
        $rightEarSettingValue = $params['audioSettings']['rightEar'];

        $preProcessingData = array(
          'audioFileData' => $audioFileData,
          'leftEarSettingValue' => $leftEarSettingValue,
          'rightEarSettingValue' => $rightEarSettingValue
        ); 

        /* Aqui se guarda los intervalos de frecuencia para cada oido
            $earFrequencyIntervals['leftEarInterval']['bottom'] y $earFrequencyIntervals['leftEarInterval']['top']
            $earFrequencyIntervals['rightEarInterval']['bottom'] y $earFrequencyIntervals['rightEarInterval']['top']
        */
        $earFrequencyIntervals = self::getFrequencyIntervals($rightEarSettingValue, $leftEarSettingValue);
        // Ruta de la carpeta temporal dentro de la carpeta del usuario. (/ruta/de/la/carpeta/tmp)
        $ruta_carpeta_temp = self::getTempAudioPath(true);
        // Ruta de la carpeta de los audios del usuario.
        $carpeta_audios_usuario = self::getUploadPath(true);

        //Nombre del audio final  ejemplo: Miaudio.mp3 (Izq: 250, Der: 550) ---> 250-550Miaudio.mp3
        $NOMBRE_AUDIO_FINAL = self::generateFileName(
                                     $preProcessingData['audioFileData']->file_name, //Nombre base
                                     $preProcessingData['leftEarSettingValue'].'-'.$preProcessingData['rightEarSettingValue'] // prefijo
                                     // '_sufijo' // Sufijo    
                              );
       
        $NOMBRE_IMAGEN_FINAL =  self::generateFileName(
                                      $preProcessingData['audioFileData']->file_name, //Nombre base
                                      $preProcessingData['leftEarSettingValue'].'-'.$preProcessingData['rightEarSettingValue'], // prefijo
                                      null,
                                      '.png'
                                 );

        // Aqui se debe guardar la ruta completa con el nombre del audio final  procesado.
        $RUTA_AUDIO_FINAL = $carpeta_audios_usuario.'/'. $NOMBRE_AUDIO_FINAL;

        // Si ya existe ese archivo se borra, para evitar duplicados
        // (Caso en que se procese dos veces un audio con los mismos parametros de entrada)
        if(file_exists($RUTA_AUDIO_FINAL)){
            unlink(self::getUploadPath(true) . '/' . $NOMBRE_AUDIO_FINAL );

        }

        /*=============================================
        =      Estructura de la cola de comandos      =
        =============================================*/
          /**
             array(
                'commandTemplate' --> Estructura del comando,coloca variables que seran reemplazadas
                'commandTemplateVariables' --> Nombra las variables que se usaron en las plantillas
                'commandTemplateArguments' --> Argumentos a reemplazar (En el mismo orden)
             )
          */
        /*===== Estructura de la cola de comandos ====*/

          //variables de Ejemplo
        $out1 = $ruta_carpeta_temp.'/'. self::generateFileName( 'out1','','','.wav');
        $out2 = $ruta_carpeta_temp.'/'. self::generateFileName('out2','','','.wav');

        $myCommandBatch = array(
              array(
                'commandTemplate' => 'sox [RUTA_AUDIO] -C 320 -c 1 [RUTA_TMP_AUDIO]  sinc [PARAM] -l', // Plantilla del comando
                'commandTemplateVariables' => array(
                  '[RUTA_AUDIO]',
                  '[RUTA_TMP_AUDIO]',
                  '[PARAM]'
                ), // Variables que tiene el comando (Deben existir en la plantilla)
                'commandTemplateArguments' => array( // En el mismo orden anterior
                    $audioFileData->file_path, //RUTA_AUDIO
                    $out1, //RUTA_TMP_AUDIO
                    escapeshellarg($earFrequencyIntervals['leftEarInterval']['top']."-".$earFrequencyIntervals['leftEarInterval']['bottom']) //PARAM
                 ) // Los argumentos que se sustituye
              ),
              array(
                'commandTemplate' => 'sox [RUTA_AUDIO] -C 320 -c 1 [RUTA_TMP_AUDIO]  sinc [PARAM] -r',   
                'commandTemplateVariables' => array(
                  '[RUTA_AUDIO]',
                  '[RUTA_TMP_AUDIO]',
                  '[PARAM]'
                ), 
                'commandTemplateArguments' => array(
                  $audioFileData->file_path, 
                  $out2, 
                  escapeshellarg($earFrequencyIntervals['rightEarInterval']['top']."-".$earFrequencyIntervals['rightEarInterval']['bottom'] ) 
                ) 
              ),
              array(
                'commandTemplate' => 'sox --combine merge [AUDIO_ENTRADA1] -C 320 [AUDIO_ENTRADA2] [AUDIO_SALIDA]', 
                'commandTemplateVariables' => array(
                  '[AUDIO_ENTRADA1]',
                  '[AUDIO_ENTRADA2]',
                  '[AUDIO_SALIDA]'
                ), 
                'commandTemplateArguments' => array(
                  $out1, 
                  $out2, 
                  $RUTA_AUDIO_FINAL
                ) 
              ),
              // array(
              //   'commandTemplate' => 'sox [PARAM1] -C 320 [AUDIO_SALIDA]', 
              //   'commandTemplateVariables' => array(
              //     '[PARAM1]',
              //     '[AUDIO_SALIDA]',
              //   ), 
              //   'commandTemplateArguments' => array(
              //     $ruta_carpeta_temp.'/'.'mixed.mp3',
              //     $RUTA_AUDIO_FINAL, // El audio final debe estar en la carpeta  de subidas del usuario
              //   ) 
              // ),
              array(
                'commandTemplate' => 'sox [AUDIO_SALIDA] -n spectrogram -c [PARAM1]  -o [PARAM2]', 
                'commandTemplateVariables' => array(
                  '[AUDIO_SALIDA]',
                  '[PARAM1]',
                  '[PARAM2]'
                ), 
                'commandTemplateArguments' => array(
                  $RUTA_AUDIO_FINAL, 
                  escapeshellarg("By SoBi Labs"), 
                  $carpeta_audios_usuario.'/'. $NOMBRE_IMAGEN_FINAL,
                ) 
              ),
        );


        //Simulando la ejecucion del comando final (crea un archivo .mp3 vacio)
        /* file_put_contents(self::getUploadPath(true).'/'. $NOMBRE_AUDIO_FINAL, '' );
         if(copy(self::getUploadPath(true).'/test/'."20161118_113744.png", 
             self::getUploadPath(true).'/'. $NOMBRE_IMAGEN_FINAL));*/
       
        // Se ejecuta la cola de comandos
        $executedCommands = self::executeCommandBatch($myCommandBatch);
        self::createImgThumbnail($NOMBRE_IMAGEN_FINAL);

        // Vaciando la carpeta temporal
        self::clearTmpFolder();
 
        /**
         * Se registra el audio final en la tabla, verificando de que existe el audio generado
         * por la cola de comandos.
         */
        self::registerFinalOutput(self::getUploadPath(), $NOMBRE_AUDIO_FINAL, $NOMBRE_IMAGEN_FINAL);

        // var_dump($executedCommands);
        /* 
          Coloca el flag DEBUG en true o false para visualizar una alerta con los
          comandos ejecutados desde la vista
        // */
        $response = array( 'success' => true, 
                           'audioData' => [$audioFileData],
                           'executedCommands' => $executedCommands, 
                           'debug' => true 
                         );

        exit( json_encode( $response ) ) ;
    }


}
