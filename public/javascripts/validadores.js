$(document).ready(function(){
//Ppal Validados-------------------------------------------------------
	var error;
	function validator(stringError,funciones,id,min){
		if(stringError=='name') error=" You must put your first name and last name. Do you want to try again?";
		if(stringError=='correo') error="Invalid Email. Do you want to try again?";
		if(stringError=='ci') error="Invalid Id format. Try again, take this as an example: V12345678, E12345678";
		if(stringError=='pass') error="Short password are easy to guess. Try again. Use at least 6 characters.";
		if (validar(funciones,id,min)){
			document.getElementById(id).style.backgroundImage="url('images/check.png')";
	  	document.getElementById(id).style.backgroundRepeat="no-repeat";
	  	document.getElementById(id).style.backgroundPosition="right center";
	  	document.getElementById(id).style.backgroundColor="transparent";
	  	$(document.getElementById(stringError)).remove();
	  	return true;
		}
		else{
			document.getElementById(id).style.backgroundImage="url('images/false.png')";
	  	document.getElementById(id).style.backgroundRepeat="no-repeat";
	  	document.getElementById(id).style.backgroundPosition="right center";
	  	document.getElementById(id).style.backgroundColor="rgba(253,160,160,0.43)";
	  	if(document.getElementById(stringError) == null)
	  		$('.error').append('<div id="'+stringError+'"><font size="5">* </font>'+error+'</div>');
	  	return false;
		}
	}
	function validar(funciones,id,min){
		empty = true;
		number = true;
		ci = true;
		formatoImagen = true;
	  correo = true;
	  correo_formato = true;
	  minimo = true;
		funciones = funciones.split(',');
		for(i=0;i<funciones.length;i++){
			if(funciones[i]=='empty')
				empty = IsEmpty(document.getElementById(id));
			if(funciones[i]=='number')
				number = IsNumeric(document.getElementById(id));
			if(funciones[i]=='formatImage')
				number = formatImage(document.getElementById(id));
			if(funciones[i]=='IsCorreo')
				correo_formato = validaCorreo(document.getElementById(id).value);		
			if(funciones[i]=='CorreoAvailability')
				correo = CorreoAvailability(document.getElementById(id));		
			if(funciones[i]=='min')
				minimo = minChar(document.getElementById(id),min);		
			if(funciones[i]=='ci')
				ci = IsCi(document.getElementById(id));		
		}
		return empty && number && formatoImagen && correo && correo_formato && minimo && ci;	
	}
  window.validator=validator;
//Funciones-validadoras--------------------------------------------------------------------
	function IsEmpty(el){
	  if(el.value == '')
	  	return false;
	  else if(el.value != '')
		  return true;
  }
  function IsNumeric(el){
	  RE = /^-{0,1}\d*\.{0,1}\d+$/;
	  return RE.test(el.value);
  }
  function formatImage(el){
	  ext = el.value.split('.').pop().toLowerCase(); 	
		if (! (ext && /^(jpg|png|jpeg|gif)$/.test(ext)))
			return false;
		else
			return true;  
  }
  function minChar(el,min){
	  if(el.value.length < min)
	  	return false;
	  else 
		  return true;
  }
  function IsCi(el){
  	RE = /^([V|E|v|e])([0-9]{5,8})$/;
  	if(RE.test(el.value)){
	  	ci_data = 'cedula='+ el.value;
	  	$.ajax({
				type: "POST",
				url: "/disponibilidad/ci",
				data: ci_data,
				async: false,
				beforeSend: function(){
				  //$("#btn_update_enviar").attr("disabled", true);
				  el.style.backgroundImage="url('images/loader.gif')";
				  el.style.backgroundRepeat="no-repeat";
				  el.style.backgroundPosition="right center";
				},
				success: function( respuesta_ci ){
					//$("#btn_update_enviar").attr("disabled", false);
					if(respuesta_ci == '1'){
						resCi = false; 
						error = "Id already exist.Try again?";
					}
					else if(respuesta_ci == '0')
						resCi = true;
				}
			});
			return resCi;
  	}
  	else return false;
  }
  function validaCorreo(valor) {
		var expresion = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
		return expresion.test(valor);
	}
	function CorreoAvailability(el){
		if(validaCorreo(el.value)){
			email_data = 'email='+ el.value;
			$.ajax({
				type: "POST",
				url: "/disponibilidad/email",
				data: email_data,
				async: false,
				beforeSend: function(){
				  //$("#btn_update_enviar").attr("disabled", true);
				  el.style.backgroundImage="url('images/loader.gif')";
				  el.style.backgroundRepeat="no-repeat";
				  el.style.backgroundPosition="right center";
				},
				success: function( respuesta_email ){
					//$("#btn_update_enviar").attr("disabled", false);
					if(respuesta_email == '1'){
						resEmail = false; 
						error = "Email already exist.Try again?";
					}
					else if(respuesta_email == '0')
						resEmail = true;
				}
			});
			return resEmail;
		}
		else return false;	
	}
//----AJAX----------------------------------------------------------------------------------
	function ajaxNormal(url,datos,reload,renderID){
		$(document.getElementById(renderID)).fadeOut('fast');
		$.ajax({
	  	type: 'POST',
			url: url,
			data: datos,
	    beforeSend: function(){
			 	$("#bowlG").show();
			},
	    success: function(res){
	    	$("#bowlG").hide();
	    	if (res == '1')
	      	alert("error");
	    	else {
		    	if(reload)	window.location = res;
		    	else {
			    	if(renderID)
			    		$(document.getElementById(renderID)).html(res).fadeIn('fast');
			    	else
			    		alert("No RENDER");
		    	}
	    	}
			}
		});
	}
	function ajaxDatos(url,id){
		$(document.getElementById(id)).ajaxForm({
	  	type: 'POST',
			url: url,
	    beforeSend: function(){
			 	$("#bowlG").show();
			},
	    success: function(res){
	    	$("#bowlG").hide();
	    	if (res == '1')
	      	errorHandler(id);
	    	else 
	        $("#wrapper").html(res);
			}
		});
	}
	function ajaxDatosReload(url,id,error_id,type_send){
		$(document.getElementById(id)).ajaxForm({
	  	type: 'POST',
			url: url,
	    beforeSend: function(){
			 	$("#bowlG").show();
			},
	    success: function(res){
	    	$("#bowlG").hide();
	    	if (res == '1')
	    		if(error_id)
		      	errorHandler(error_id);
		      else
		      	alert("Error");
	    	else 
	        window.location = res;
			}
		});
	}
	function focusEmpty(id){document.getElementById(id).value=''}
	window.ajaxNormal=ajaxNormal;	
	window.ajaxDatos=ajaxDatos;	
	window.ajaxDatosReload=ajaxDatosReload;		
	window.focusEmpty=focusEmpty;	

	function errorHandler(id){
		if(id=="form-login")	stringHandlerError = "You can Log in with your email address. Please be sure to write the correctly data..";
		if(id=="form-login_inv")	stringHandlerError = "<h3>Invalid Data!</h3> <br />You can Log in with any email address.Please, be sure to write the correctly data..";
		if(id=="form-registrar")	stringHandlerError = "Wow! An error has occurred, try again in a few seconds";
		
		if(id=="sync-enviar-1")	stringHandlerError = "You must upload both files (measure & tracks)";
		if(id=="sync-enviar-3")	stringHandlerError = "The files must be on .txt";
		if(id=="sync-enviar-3")	stringHandlerError = "Wow! An error has occurred, try again in a few seconds";
		
		if(document.getElementById(id+'-error') == null)
	  		$('.error').append('<div id="'+id+'-error"><font size="5">* </font>'+stringHandlerError+'</div>');
	}
	window.errorHandler=errorHandler;
	function spanishDate(d){
		var weekday=["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
		var monthname=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
		return weekday[d.getDay()]+", "+d.getDate()+" de "+monthname[d.getMonth()];
	}
	
/*	function englishDate(d){
		var weekday=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		var monthname=["January","February","March","April","May","June","July","August","September","October","November","December"];
		return weekday[d.getDay()]+", "+d.getDate()+" de "+monthname[d.getMonth()];
	}*/
	function sendDate(){
		d = $("#datepicker").datepicker("getDate");
		$('.day_big_view').html(d.getDate());
		$('.day_completa_view').html(spanishDate(d)+"<br />"+d.getFullYear());
		window.location = '/#events/'+d;
	}
	//window.englishDate=englishDate;
	window.spanishDate=spanishDate;
	window.sendDate=sendDate;
	
});