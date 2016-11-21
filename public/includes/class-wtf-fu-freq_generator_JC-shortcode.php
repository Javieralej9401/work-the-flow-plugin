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
 * This class handles a Frequency Generator.
 * 
 * @author EJCSoftwareSolutions <www.ejcsoftwaresolutions.com.ve>
 * 
 */
class Wtf_Fu_FrequencyGenerator_JC_Shortcode  {
  protected $options;
  /**
   *
   * Renders a Frequency Genenerator View
   *
   */
  
    function uploadFilesHtml($options) {

       $html = getFrequencyGeneratorView();

       return ($html);
    }
   
     public function generate_content() {

        // set the defaults and allowed options to those stored in the database.
        $defaults = Wtf_Fu_Options::get_upload_options();

        if ((wtf_fu_get_value($defaults, 'deny_public_uploads') == true) && !is_user_logged_in()) {
            return("<div class=\"alert\">Public upload access is denied. Please log in and try again.</div>");
        }

        // override with any short code attributes.
        $options = shortcode_atts($defaults, $this->options);

   
        return $this->uploadFilesHtml($options);
    }

  }
