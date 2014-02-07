var BD = require('../BD')
	, sanitize = require('validator').sanitize
	, check = require('validator').check
	, crypto = require('crypto');

/*
 * GET users listing.
 */

exports.ocupation = function(req, res){
	try {
		check(req.query.zona).notNull();
		check(req.query.ipt_umbral).notNull().isNumeric();
		 	
		zona = sanitize(req.query.zona).xss();
		zona = sanitize(zona).entityDecode();
		
		umbral = sanitize(req.query.ipt_umbral).xss();
		umbral = sanitize(umbral).entityDecode();		
				
		// Buscamos el identificador de la zona
		objBD = BD.BD();
		objBD.connect();
		objBD.query("SELECT frequency, COUNT(*) AS total FROM potency_frequency GROUP BY frequency",
		function(err, rows, fields) {
	    if (err){
	    	console.log(err);
				res.render('index'); 
			}							
	    else {
	    	var resultado = new Array();
	    	var totales = rows;
				objBD = BD.BD();
				objBD.connect();
				objBD.query("SELECT frequency, COUNT(*) AS pasaron_umbral FROM potency_frequency WHERE potency > "+ objBD.escape(umbral) +" GROUP BY frequency ",
				function(err, rows, fields) {
			    if (err){
			    	console.log(err);
						res.render('index'); 
					}							
			    else {

			    	var pasaron = rows;
			    	var tablaFinal = new Array();
			    	
						for(i=0; i < totales.length; i++){
							
							for(j=0; j < pasaron.length; j++){
								
								if(totales[i].frequency == pasaron[j].frequency){
									tablaFinal.push([totales[i].frequency / 1000, pasaron[j].pasaron_umbral / totales[i].total]);
									break;
								} 
								else if(totales[i].frequency < pasaron[j].frequency){
									tablaFinal.push([totales[i].frequency / 1000, 0]);
									break;
								}
							}	
						}
						res.render('ocupation',{ data:tablaFinal, umbral: umbral, zona:zona }); 
				  }
				});
				objBD.end();  	
		  }
		});
		objBD.end();  	
								
	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
};


exports.selectFrequency = function(req, res){
	try {
		check(req.query.zona).notNull();
		check(req.query.ipt_umbral).notNull().isNumeric();
		
		umbral = sanitize(req.query.ipt_umbral).xss();
		umbral = sanitize(umbral).entityDecode();		
		
		zona = sanitize(req.query.zona).xss();
		zona = sanitize(zona).entityDecode();
		
		res.render('heatmap/select_frequency',{ umbral:umbral, zona:zona }); 
	
	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
}

exports.formFrequency = function(req, res){
	try {
		
		check(req.query.ipt_umbral).notNull().isNumeric();
		check(req.query.from_frequency).notNull().isNumeric();
		check(req.query.to_frequency).notNull().isNumeric();
		check(req.query.zona).notNull();
		 	
		zona = sanitize(req.query.zona).xss();
		zona = sanitize(zona).entityDecode();
		
		umbral = sanitize(req.query.ipt_umbral).xss();
		umbral = sanitize(umbral).entityDecode();		
		
		from = sanitize(req.query.from_frequency).xss();
		from = sanitize(from).entityDecode()*1000;		

		to = sanitize(req.query.to_frequency).xss();
		to = sanitize(to).entityDecode()*1000;	
		
		objBD = BD.BD();
		objBD.connect();
		objBD.query("SELECT id_place FROM places WHERE name = "+ objBD.escape(zona) +"",
		function(err, rows, fields) {
	    if (err){
	    	console.log(err);
				res.render('index'); 
			}							
	    else {
	    	id_place = rows[0].id_place;
	    	objBD = BD.BD();
				objBD.connect();
				objBD.query("SELECT coordinates.latitude as lat, coordinates.longitude as lng, COUNT(*) as count FROM (SELECT coordinates_vs_potency_frequency.id_coordinate as id_coordinate FROM potency_frequency, coordinates_vs_potency_frequency WHERE potency_frequency.id_potency_frequency = coordinates_vs_potency_frequency.id_potency_frequency AND potency_frequency.potency > "+ objBD.escape(umbral) +" AND potency_frequency.frequency BETWEEN "+ objBD.escape(from) +" AND "+ objBD.escape(to) +") as aux, coordinates WHERE aux.id_coordinate = coordinates.id_coordinate AND coordinates.id_place = "+ objBD.escape(id_place) +" GROUP BY latitude, longitude ORDER BY count DESC",
				function(err, rows, fields) {
			    if (err){
			    	console.log(err);
						res.render('index'); 
					}							
			    else {
						if(rows[0]!= undefined){
				    	max = rows[0].count;
							from = from / 1000;
							to = to / 1000;
							res.render('heatmap/heatmap', {umbral:umbral, type:"frequency" ,from:from, to:to , zona:zona, data: rows, max:max}); 	    		
						}
						else
							res.render('heatmap/select_frequency',{ umbral:umbral, zona:zona, error:"Frequency values ​​are not recorded. Do you want to try again?" }); 
				  }
				});
				objBD.end();
		  }
		});
		objBD.end();  	
			
	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
}

exports.selectChannel = function(req, res){
	try {
		check(req.query.zona).notNull();
		check(req.query.ipt_umbral).notNull().isNumeric();
		
		umbral = sanitize(req.query.ipt_umbral).xss();
		umbral = sanitize(umbral).entityDecode();		
		
		zona = sanitize(req.query.zona).xss();
		zona = sanitize(zona).entityDecode();
		
		res.render('heatmap/select_channel',{ umbral:umbral, zona:zona }); 
	
	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
}

exports.loginSend = function(req, res){

	try {
	  check(req.body.login_user).notNull().len(6, 64).isEmail();
	  check(req.body.login_pass).notNull();
		
		login_user = sanitize(req.body.login_user).trim(); 	
		login_user = sanitize(login_user).xss();
		login_user = sanitize(login_user).entityDecode();
				
		pass = sanitize(req.body.login_pass).trim(); 	
		pass = sanitize(pass).xss();
		pass = sanitize(pass).entityDecode();
		
		pass= crypto.createHash('sha256').update(pass).digest("hex");
		pass= pass.substr(0,1)+"u"+pass.substr(2,pass.length/2)+"se"+pass.substr(pass.length/2)+"r";
				
		
		objBD = BD.BD();
		objBD.connect();
		objBD.query("SELECT email FROM user WHERE email = "+ objBD.escape(login_user) +" AND password = "+ objBD.escape(pass) +"",
		function(err, rows, fields) {
	    if (err){
	    	console.log(err);
				res.send('1'); 
			}							
	    else {
		    if (rows.length == 1){
		    	req.session.user = login_user;
		    	res.send('/admin');
				}
				else
					res.send('1');
			}
		});
		objBD.end();  	
								
	} catch (e) {
	  res.send('1'); 
	  console.log(e.message);
	}
}
