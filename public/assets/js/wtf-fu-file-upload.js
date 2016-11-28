
function wtf_file_upload_init($, el) {
    
    if ($(el).length === 0) {
        return; // nothing to do.
    } 
    templateID = $(el).data("template-id") || "template-download";
    
    //console.log('wtf_init activation.');
       
    // Capture form data fields to pass on to ajax request as POST vars.
    var WtfFuUploadFormData = $(el).serializeArray();
   
    // add in the nonce to the request data.
    // WtfFuUploadFormData.push({name : "security", value : WtfFuAjaxVars.security}); 
    
    // console.log(WtfFuUploadFormData);
    // Initialize the jQuery File Upload widget:
    $(el).fileupload({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},
        url: WtfFuAjaxVars.url,
        downloadTemplateId: templateID,
    });

    // Enable iframe cross-domain access via redirect option:
    $(el).fileupload(
        'option',
        'redirect',
        WtfFuAjaxVars.absoluteurl
    );

    // Load spinners.
    $(el).addClass('fileupload-processing');
 
    $.ajax({
       url: WtfFuAjaxVars.url, 
       data: WtfFuUploadFormData, 
       dataType: 'json',
       context: $(el)[0]
    }).always(function () {
        $(this).removeClass('fileupload-processing');
    }).done(function (result) {

        $(this).fileupload('option', 'done')
            .call(this, $.Event('done'), {result: result});

    });    

    
} //end wtf_init


(function ($) {
    'use strict';

    var $forms = $(".fileUpload");

    $forms.each(function(index, el) {
         var id =  $(el).attr("id");

         if( $("#" + id).length ){
            // call at load time.
            wtf_file_upload_init($, $("#" + id));
         }

    });


})(jQuery);


