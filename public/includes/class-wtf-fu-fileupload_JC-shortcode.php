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
         * Renders the File upload form and sets up the options for the 

    UploadHandler.
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
      . getDownloadJSTemplate_JC();

      return ($html);
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
    public function getFrequencyIntervals($baseRightEar,$baseLeftEar){
        $leftEarStep = $rightEarStep = 500; // constante para ambos oidos.

        return array(
          'rightEarInterval' => array(
                                  'bottom' => $baseRightEar-$rightEarStep, //Baja
                                  'top' => $baseRightEar+$rightEarStep //Alta
                                  ),
          'leftEarInterval' => array(
                                  'bottom' => $baseLeftEar-$leftEarStep, // Baja
                                  'top' => $baseLeftEar+$leftEarStep //Alta
                                  )
          );
      }

    /*
    * Función que genera un nombre de archivo manteniendo la extension.
    */
    public function generateFileName($file_name = '', $newNamePrefix = '', $newNameSufix = ''){

      // Nombre del archivo sin extension
      $withoutExt = preg_replace('/\\.[^.\\s]{3,4}$/', '', $file_name);

      //Nuevo nombre temporal
      $newName = str_replace($withoutExt, $newNamePrefix.$withoutExt.$newNameSufix , $file_name);

      return $newName;
    }

    /*
    * Función que retorna la ruta de los archivos subidos por el usuario
    * Usar esta ruta en el comando final y el archivo procesado pueda ser visto.
    */
    public function getUploadPath($absolute = false) {
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
    public function getTempAudioPath($absolute = false){

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
    public function emptyTmpFolder(){
      $files = glob(self::getTempAudioPath(true).'/*');
      foreach($files as $file){
          if(is_file($file)) // si se trata de un archivo
            unlink($file); // lo elimina
      }
    }

    public function executeCommandBatch($commands){

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

    public function registerFinalOutput($audioPath, $fileName){

       global $wpdb;

       $tableName = $wpdb->prefix . "user_audio_files";
       $currentUser = wp_get_current_user();
       $queryRs = $wpdb->get_var( "SELECT EXISTS( SELECT * FROM $tableName 
                                   WHERE user_id = ". $currentUser->ID 
                                   . " AND file_name = '". $fileName. "' )");
      
        if($queryRs == 0 && file_exists(self::getUploadPath(true) . '/' . $fileName ) ){

            $wpdb->insert( 
               $tableName, 
               array(
                'user_id' => $currentUser->ID,
                'file_name' => $fileName,
                'file_path' => $audioPath,
                'processed' => 1,
                )
             );
        }


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

        if(!audioFileData){
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
        $ruta_carpeta_temp = self::getTempAudioPath();
        // Ruta de la carpeta de los audios del usuario.
        $carpeta_audios_usuario = self::getUploadPath();

        //Nombre del audio final  ejemplo: Miaudio.mp3 (Izq: 250, Der: 550) ---> 250-550Miaudio.mp3
        $NOMBRE_AUDIO_FINAL = self::generateFileName(
                                     $preProcessingData['audioFileData']->file_name, //Nombre base
                                     $preProcessingData['leftEarSettingValue'].'-'.$preProcessingData['rightEarSettingValue'] // prefijo
                                     // '_sufijo' // Sufijo    
                              );
        // Aqui se debe guardar la ruta completa con el nombre del audio final  procesado.
        $RUTA_AUDIO_FINAL = $carpeta_audios_usuario.'/'. $NOMBRE_AUDIO_FINAL;

        // Si ya existe ese archivo se borra, para evitar duplicados
        // (Caso en que se procese dos veces un audio con los mismos parametros de entrada)
        if(file_exists(self::getUploadPath(true) . '/' . $NOMBRE_AUDIO_FINAL )){
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
        $out1 = $ruta_carpeta_temp.'/'. self::generateFileName($preProcessingData['audioFileData']->file_name,
                                                              'L_');
        $out2 = $ruta_carpeta_temp.'/'. self::generateFileName($preProcessingData['audioFileData']->file_name,
                                                               'R_');
        $myCommandBatch = array(
              array(
                'commandTemplate' => 'sox [RUTA_AUDIO] -C 320 -c 1 [RUTA_TMP_AUDIO]  sinc [PARAM] mixer -l', // Plantilla del comando
                'commandTemplateVariables' => array(
                  '[RUTA_AUDIO]',
                  '[RUTA_TMP_AUDIO]',
                  '[PARAM]'
                ), // Variables que tiene el comando (Deben existir en la plantilla)
                'commandTemplateArguments' => array( // En el mismo orden anterior
                    $audioFileData->file_path, //RUTA_AUDIO
                    $out1, //RUTA_TMP_AUDIO
                    escapeshellarg($earFrequencyIntervals['leftEarInterval']['top']."-".$earFrequencyIntervals['leftEarInterval']['bottom'] ) //PARAM
                 ) // Los argumentos que se sustituye
              ),
              array(
                'commandTemplate' => 'sox [RUTA_AUDIO] -C 320 -c 1 [RUTA_TMP_AUDIO]  sinc [PARAM] mixer -r', 
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
                'commandTemplate' => 'sox --combine merge [AUDIO_ENTRADA1] [AUDIO_ENTRADA2] [AUDIO_SALIDA]', 
                'commandTemplateVariables' => array(
                  '[AUDIO_ENTRADA1]',
                  '[AUDIO_ENTRADA2]',
                  '[AUDIO_SALIDA]'
                ), 
                'commandTemplateArguments' => array(
                  $out1, 
                  $out2, 
                  $ruta_carpeta_temp.'/'.'mixed.mp3'
                ) 
              ),
              array(
                'commandTemplate' => 'sox [PARAM1] -c 320 [AUDIO_SALIDA]', 
                'commandTemplateVariables' => array(
                  '[PARAM1]',
                  '[AUDIO_SALIDA]',
                ), 
                'commandTemplateArguments' => array(
                  $ruta_carpeta_temp.'/'.'mixed.mp3',
                  $RUTA_AUDIO_FINAL, // El audio final debe estar en la carpeta  de subidas del usuario
                ) 
              ),
              array(
                'commandTemplate' => 'sox [AUDIO_SALIDA] -n spectogram -c [PARAM1]  -o [PARAM2]', 
                'commandTemplateVariables' => array(
                  '[AUDIO_SALIDA]',
                  '[PARAM1]',
                  '[PARAM2]'
                ), 
                'commandTemplateArguments' => array(
                  $RUTA_AUDIO_FINAL, 
                  escapeshellarg('By SoBi Labs'), 
                  $ruta_carpeta_temp.'/'.'chakras.png'
                ) 
              ),
        );


        //Simulando la ejecucion del comando final (crea un archivo .mp3 vacio)
        // file_put_contents(self::getUploadPath(true).'/'. $NOMBRE_AUDIO_FINAL, '' );

        // Se ejecuta la cola de comandos
        $executedCommands = self::executeCommandBatch($myCommandBatch);

        // Vaciando la carpeta temporal
        self::emptyTmpFolder();
 
        /**
         * Se registra el audio final en la tabla, verificando de que existe el audio generado
         * por la cola de comandos.
         */
        self::registerFinalOutput($RUTA_AUDIO_FINAL, $NOMBRE_AUDIO_FINAL);

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
