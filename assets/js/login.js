Ext.onReady(function() {
    var url = "/agro/historico/";

    var loginWindow = Ext.create('Ext.window.Window', {
        title: 'Inicio de Sesión',
        modal: true,
        closable: false,
        draggable: false,
        resizable: false,
        width: 300,
        layout: 'fit',
        items: [{
            xtype: 'form',
            id: 'loginForm',
            bodyPadding: 10,
            defaults: {
                xtype: 'textfield',
                anchor: '100%',
                allowBlank: false
            },
            items: [{
                fieldLabel: 'Usuario',
                name: 'username',
                id: 'username',
                allowBlank: false
            }, {
                fieldLabel: 'Contraseña',
                name: 'password',
                id: 'password',
                inputType: 'password',
                allowBlank: false
            }],
            buttons: [{
                text: 'Ingresar',
                formBind: true,
                listeners: {
                    click: function() {
                        var form = this.up('form').getForm();
                        if (form.isValid()) {
                            form.submit({
                                url: url + 'chequearUsuario',
                                method: 'POST',
                                params: {
                                    Usuario: form.findField('username').getValue(),
                                    Contraseña: form.findField('password').getValue()
                                },
                                success: function(form, action) {
                                    var response = Ext.decode(action.response.responseText);
                                    if (response.success) {
                                        localStorage.setItem('auth', true); // Guardar autenticación
                                        window.location.href = 'historico'; // Redirigir a la página principal
                                    } else {
                                        Ext.Msg.alert('Error', 'Usuario o contraseña incorrectos');
                                    }
                                },
                                failure: function(form, action) {
                                    Ext.Msg.alert('Error', 'Usuario o contraseña incorrectos');
                                }
                            });
                        }
                    }
                }
            }]
        }]
    });

    loginWindow.show();
});
