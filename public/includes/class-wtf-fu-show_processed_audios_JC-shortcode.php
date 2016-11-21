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
 * This class handles the processed audios capability.
 * 
 * @author EJCSoftwareSolutions <www.ejcsoftwaresolutions.com.ve>
 * 
 */
class Wtf_Fu_ShowProcessedAudios_JC_Shortcode  extends Wtf_Fu_Fileupload_JC_Shortcode{

     /**
         * Renders the File upload form and sets up the options for the 

    UploadHandler.
         * @param array $options
         * @return type
         */
    function uploadFilesHtml($options) {

      $form_vars = '';
       
            // Add the ajax handler action for jQuery to our options.
      $options['action'] = 'processed_audio_load_ajax_function';

            // 
            // Put unmassaged options into POST vars for subsequent posts of 
            // the form. These are then read by the ajax handler load_ajax_function.
            // and then passed as options to the UploadHandler class. 
            // 
      foreach ($options as $k => $v) {
        $form_vars = $form_vars . '<input type="hidden" name="' . $k . '" 

        value="' . $v . '" />';
      };
    

      $action_href = admin_url() . 'admin-ajax.php';

      $html = getProcessAudioForm($action_href, $form_vars, true, false)
      . getGalleryWidgetTemplate()
      . getUploadJSTemplate_JC(true, false)
      . getDownloadJSTemplate_JC(true, false)
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
        $options =  $options + array("audioFilter" => 'processed');
        $upload_handler = new UploadHandler($options);

        die(); // always exit after an ajax call.
    }
   
     public function generate_content() {

        // set the defaults and allowed options to those stored in the database.
        $defaults = Wtf_Fu_Options::get_upload_options();

        if ((wtf_fu_get_value($defaults, 'deny_public_uploads') == true) && !is_user_logged_in()) {
            return("<div class=\"alert\">Public upload access is denied. Please log in and try again.</div>");
        }

        // override with any short code attributes.
        $options = shortcode_atts($defaults, $this->options);

        // modify this max_file_size from Mb to bytes.
        // done here b/c the html form will validate file size against 
        // this value when it is posted as a hidden field.
        $options['max_file_size'] = (int) $options['max_file_size'] * 1048576;
        return $this->uploadFilesHtml($options);
    }

  }
