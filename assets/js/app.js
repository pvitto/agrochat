var datosActuales = [];
$(document).ready(function(){ 
    var socket = io.connect('http://192.168.0.205:4000');

//var url = "http://localhost/agro/"
    var time = 100;
    var images = 6;
    var tabla = document.getElementById("tabla"); 

    socket.on('news',function(msg){
		var obj = JSON.parse(msg);
		console.log(obj);	
		var proceso = '';
		var color = '';
		
		switch(obj.IdTransTipo) {
			case 0:
				proceso = 'En Bodega';
				color = 'indianred';
				break;
			case 1:
				proceso = 'Recogiendo';
				color = 'orange';
				break;
			case 2:
				proceso = 'Recogido';
				color = 'orange';
				break;
			case 3:
				proceso = 'Empacando';
				color = 'yellow';
				break;
			case 4:
				proceso = 'Empacado';
				color = 'lightgreen';
				break;
			case 6:
				proceso = 'Verificada';
				color = 'lightgreen';
				break;
		}
		
		if(obj.IdTransTipo === 0 && $("#"+obj.TransId)[0] === undefined){
			var row = tabla.insertRow(1);
			row.style.display = "none";
			// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
			var cell1 = row.insertCell(0);
			var cell2 = row.insertCell(1);
			var cell3 = row.insertCell(2);
			var cell4 = row.insertCell(3);
			// Add some text to the new cells:
			cell1.innerHTML = obj.TransId;
			cell2.innerHTML = obj.cliente;
			cell3.innerHTML = obj.vendedor;
			cell4.innerHTML = proceso;
			cell4.style.borderRadius = "0px";
			cell4.style.textAlign = "center";
			cell4.style.backgroundColor = color;
			row.id = obj.TransId;
			$("#"+obj.TransId).fadeIn(1000,"swing");
		}
		
		else if(obj.IdTransTipo != 0){		
			$("#"+obj.TransId).fadeOut(1000,"swing");
			var ee = $("#"+obj.TransId)[0];
			tabla.deleteRow($("#"+obj.TransId)[0].rowIndex);
			var tt = tabla.insertRow(1);
			tt.style.display = "none";
			tt.innerHTML = ee.innerHTML;
			tt.cells[3].innerHTML = proceso;
			tt.cells[3].style.borderRadius = "0px";
			tt.cells[3].style.backgroundColor = color;
			tt.cells[3].style.textAlign = "center";
			tt.id = ee.id;
			$("#"+tt.id).fadeIn(1000,"swing");		
			
			if(obj.IdTransTipo === 6){
				setTimeout(function(){
					$("#"+obj.TransId).fadeOut(2000,"swing");
					tabla.deleteRow($("#"+obj.TransId)[0].rowIndex);		
				}, 5000);
			}
		}
	});

	//socket.emit('message', "Hola denuevo");	
    
    function ponerTexto(){
        var texto = "Agro-Costa SAS, tiene por objeto social la importación, distribución y comercialización de repuestos para maquinaria pesada, manejando para CATERPILLAR: rodaje marca BERCO, partes para mando final, empaquetaduras y sellos para parte hidraulica, sellos y empaques en general, partes de motor, suspensión, discos de freno y fricción, herramientas de corte, entre otras; y contamos con un amplio surtido en rodaje marca BERCO y herramienta de corte para maquinaria de las marcas: KOMATSU, HITACHI, KOBELCO,JOHN DEERE, FIAT ALLIS, CASE, DOOSAN, LIUGONG, entre otras.<br><br> Ofrecemos una amplia gama de martillos hidraulicos y baldes para excavadoras y cargadores.<br><br> En Agro-Costa SAS no solo entregamos repuestos y servicio de excelente calidad; también encontrara increíbles precios y el apoyo que usted necesita para recibir su pedido ágil y eficaz.";
        maquina("typer",texto,100,0);
    };

    function maquina(contenedor,texto,intervalo,n){
        var i=0,
        // Creamos el timer
        largo = 0;
        timer = setInterval(function() {
            if ( i<texto.length ) {
                // Si NO hemos llegado al final del texto..
                // Vamos añadiendo letra por letra y la _ al final.                
                $("#"+contenedor).html(texto.substr(0,i++) + "_");
                if($('#typer')[0].scrollHeight > largo){
                    $('#typer').scrollTop( $('#typer').height());
                    largo = $('#typer')[0].scrollHeight;
                }
            } else {
                // En caso contrario..
                // Salimos del Timer y quitamos la barra baja (_)
                clearInterval(timer);
                $("#"+contenedor).html(texto);
                // Auto invocamos la rutina n veces (0 para infinito)
                if ( --n!=0 ) {
                    setTimeout(function() {
                        largo = 0;
                        maquina(contenedor,texto,intervalo,n);
                    },3600);
                }
            }
        },intervalo);
    };

    function imagenes(){
        return (Math.floor(Math.random() * 6) + 1)+".png";
    };

    function ponerImagenes(){
        $("#slide").css("background-image","url('assets/img/1.png')");

        setInterval(function(){
            $("#slide").fadeOut(1000,"swing",function(){
                $("#slide").css("background-image","url('assets/img/"+imagenes()+"')");
                $("#slide").fadeIn(1000,"swing");
            });   
        },10000);   
    };

    function getVeri(){
        var veri = false;
        $.each(tabla.rows, function(i, field){
            if(i>0){
                if(datosActuales.find(x => x.TransId === field.id)){
                                
                }else{
                    veri = true;
                }
                
            }
        });        
        return veri;
    };
	
	function ponerVerificadas(){
        var verificada = [];       
        //console.log("VERI",getVeri());
        if(getVeri() === true){            
            $.each(tabla.rows, function(i, field){
                if(i > 0 ){                    
                    setTimeout(function(){                    
                        if(datosActuales.find(x => x.TransId === field.id)){
                            
                        }else{
                            //console.log("entró");
                            $("#"+field.id).fadeOut(1000,"swing");
                            var ee = $("#"+field.id)[0];
                            tabla.deleteRow($("#"+field.id)[0].rowIndex);
                            var tt = tabla.insertRow(1);
                            tt.style.display = "none";
                            tt.innerHTML = ee.innerHTML;
                            tt.cells[3].innerHTML = "VERIFICADA";
                            tt.cells[3].style.borderRadius = "0px";
                            tt.cells[3].style.backgroundColor = 'lightgreen';
                            tt.cells[3].style.textAlign = "center";
                            tt.id = ee.id;
                            $("#"+tt.id).fadeIn(1000,"swing");
                            verificada.push(field.id);                            
                        }

                        if(i == tabla.rows.length-1){
                            time = 300;
                            setTimeout(function(){
                                //console.log("Quitar verificadas");
                                quitarVerificadas(verificada);
                            },5000);
                        }
                        
                        /*if(i == tabla.rows.length-1){
                            time = 300;
                            if(verificada.length > 0){
                                setTimeout(function(){
                                    quitarVerificadas(verificada);
                                },5000);
                            }else{
                                setTimeout(function(){
                                    console.log("Actualizar datos Si no hay para verificar 1");
                                    actualizarDatos();
                                },1000);
                            }
                        }*/
                    }, time);
                    time+=300;
                }
            });
        }else{
            setTimeout(function(){
                //console.log("Actualizar datos Si no hay para verificar 2");   
                time = 300;                 
                actualizarDatos();
            },1000);
        }
	};
	
	function quitarVerificadas(data){
		$.each(data, function(i, field){
			setTimeout(function(){
				$("#"+field).fadeOut(1000,"swing");
				tabla.deleteRow($("#"+field)[0].rowIndex);
				
				if(i == data.length-1){
					time = 300;
					setTimeout(function(){
                        //console.log("Actualizar datos Despues de quitar verificadas");
						actualizarDatos();
					},1000);
				}			
			}, time);
			time+=300;
		});
	};

    function actualizarDatos(){
        $.getJSON("welcome/obtenerDatos", function(result){            
            if(result.count > 0){
                datosActuales = result.data;
                $.each(result.data, function(i, field){
                    setTimeout(function(){
                        if(document.getElementById(field.TransId) == null /*&& field.Proceso != "Verificada"*/)
                        {
                            var row = tabla.insertRow(1);
                            row.style.display = "none";
                            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
                            var cell1 = row.insertCell(0);
                            var cell2 = row.insertCell(1);
                            var cell3 = row.insertCell(2);
                            var cell4 = row.insertCell(3);
                            // Add some text to the new cells:
                            cell1.innerHTML = field.TransId;
                            cell2.innerHTML = field.CustName;
                            cell3.innerHTML = field.Vendedor;
                            cell4.innerHTML = field.Proceso;
                            cell4.style.borderRadius = "0px";
                            cell4.style.textAlign = "center";
                            cell4.style.backgroundColor = field.Color;
                            row.id = field.TransId;
                            $("#"+field.TransId).fadeIn(1000,"swing");
                        }
                        else if(document.getElementById(field.TransId) && field.Proceso != $("#"+field.TransId)[0].cells[3].innerHTML){
                            $("#"+field.TransId).fadeOut(1000,"swing");
                            var ee = $("#"+field.TransId)[0];
                            tabla.deleteRow($("#"+field.TransId)[0].rowIndex);
                            var tt = tabla.insertRow(1);
                            tt.style.display = "none";
                            tt.innerHTML = ee.innerHTML;
                            tt.cells[3].innerHTML = field.Proceso;
                            tt.cells[3].style.borderRadius = "0px";
                            tt.cells[3].style.backgroundColor = field.Color;
                            tt.cells[3].style.textAlign = "center";
                            tt.id = ee.id;
                            $("#"+tt.id).fadeIn(1000,"swing");
                        } 
                        /*else if(document.getElementById(field.TransId) && field.Proceso == $("#"+field.TransId)[0].cells[3].innerHTML && field.Proceso == "Verificada"){
                            $("#"+field.TransId).fadeOut(1000,"swing");
                            tabla.deleteRow($("#"+field.TransId)[0].rowIndex);
                        }*/             
                        if(i == result.data.length-1){
                            time = 300;
                            setTimeout(function(){
                                ponerVerificadas();
                            },1000);
                            //ponerVerificadas();
                            //setTimeout(function(){
                                /*time = 300;
                                if(datosActuales.length > 0){
                                    ponerVerificadas();
                                }else{
                                    setTimeout(function(){
                                        actualizarDatos();
                                    },1000);
                                }*/
                                //actualizarDatos();
                            //},10000);
                        }  
                    }, time);
                    time+=300;
                });  
            }else{
                setTimeout(function(){
                    time = 300;
                    actualizarDatos();
                },10000);
            }      
        });
    };

    function traerDatos(){
        $.getJSON("welcome/obtenerDatos", function(result){
            //console.log("datos",result);
            //if(result.length > 0){
                $.each(result.data, function(i, field){
                    //setTimeout(function(){
                        var row = tabla.insertRow(1);
                        row.style.display = "none";
                        // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);
                        var cell4 = row.insertCell(3);
                        // Add some text to the new cells:
                        cell1.innerHTML = field.TransId;
                        cell2.innerHTML = field.CustName;
                        cell3.innerHTML = field.Vendedor;
                        cell4.innerHTML = field.Proceso;
                        cell4.style.borderRadius = "0px";
                        cell4.style.backgroundColor = field.Color;
                        cell4.style.textAlign = "center";
                        row.id = field.TransId;                 
                        $("#"+field.TransId).fadeIn(300,"swing");
                        /*if(i== result.data.length-1){
                            time = 300;
                            actualizarDatos();
                        }*/
                    //},time);
                    //time+=100;
                });  
            /*}else{
                setTimeout(function(){
                    traerDatos();
                },10000);
            }*/      
        });
    };         

    //ponerTexto();
    ponerImagenes();
    traerDatos();
});