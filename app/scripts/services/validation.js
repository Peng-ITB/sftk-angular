app.factory('validationService', function(){
	return {
		processValidationErrors: function(error){
			var errorObject = $.parseJSON(error.responseText);
            $.each(errorObject, function(index, error){
                $.each(error.fields, function(index, field){
                    $('#'+field+'Group').addClass('has-error');
                    $('#'+field).parent().after('<div class="text-danger removeError">'+error.message+'</div>');
                });
            });
		},
		clearValidationErrors: function(){
			$('#errorMessageDiv').empty();
        	$('.removeError').remove();
        	$('.has-error').removeClass('has-error');
		}
	};
});
