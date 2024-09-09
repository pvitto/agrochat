###################
Agro-Costa App Bodega
###################

Esta aplicación web, desarrollada en PHP y JavaScript, es el sistema utilizado en la bodega de Agro-COSTA para administrar diversos aspectos del inventario y las remisiones realizadas por los clientes. La aplicación se conecta a la base de datos de **Agro-Costa SAS** y está diseñada para ser utilizado tanto por los trabajadores de piso como por el personal de oficina, ofreciendo una interfaz práctica y funcional que agiliza la gestión del inventario y de las órdenes.

*******************
Funcionalidad (v3.0.0)
*******************

La funcionalidad de esta aplicación web se basa en el uso de controladores en PHP, que integran su lógica con archivos JavaScript para cumplir con sus distintos objetivos. Toda la información gestionada y visualizada en la aplicación proviene de la base de datos de la empresa en el software **Traverse**, lo que garantiza la fiabilidad de los datos y que cualquier cambio realizado desde la interfaz del sistema se refleje en tiempo real en los datos de la empresa.

- **Bodega:** Módulo utilizado por los operarios para visualizar las remisiones pendientes de verificación. Permite consultar los ítems de las remisiones, identificar al responsable de completarlas y gestionar su estado si son los responsables.
- **Bodega Admin:** Módulo utilizado por los administradores para gestionar las remisiones pendientes. Permite ver los ítems, asignar operarios y administrar el estado de las remisiones.
- **Localizar/Localizar Etiquetas:** Módulo que permite a los usuarios consultar la localización de los ítems de una remisión utilizando su número de despacho. Muestra la localización, cantidad disponible, proveedor, entre otros datos. La versión "Localizar Etiquetas" añade la funcionalidad de generar códigos de barras para los ítems.
- **Localizaciones/Localizaciones Etiquetas:** Módulo utilizado para consultar la información de un ítem específico mediante su número de referencia. Muestra la descripción, bodega, cantidad disponible y localización. La versión "Localizaciones Etiquetas" permite generar un código de barras para el ítem.
- **Traslado/Traslado Etiquetas:** Módulo para que los administradores consulten los ítems asignados a traslados entre bodegas, utilizando un número de traslado. Muestra la localización, cantidad disponible, proveedor, entre otros datos. La versión "Traslado Etiquetas" permite generar códigos de barras para los ítems del traslado.
- **Históricos (En desarrollo):** Módulo que será utilizado para consultar remisiones ya despachadas mediante su número de remisión. Permitirá ver los ítems de las remisiones, el responsable, la fecha de despacho, entre otros. En la versión actual, esta funcionalidad no está terminada, ya que las remisiones despachadas aún no se guardan en la base de datos; por lo tanto, se muestran remisiones con el ID ingresado, independientemente de su estado.
- **Bodega Item:** Diseñado para ser utilizado por los operarios en bodega, este módulo muestra únicamente las remisiones asignadas a un usuario en función del login utilizado. Permite procesar remisiones de manera individual, actualizando su estado conforme se completan las distintas etapas del proceso.
- **Bodega Item Admin:** Exclusivo para supervisores de bodega, este módulo proporciona acceso a todas las remisiones disponibles, junto con la información relevante, y permite asignar operarios a cada remisión.
- **Bodega Despacho:** Dirigido a los operarios que gestionan remisiones ya verificadas, este módulo permite controlar los estados posteriores (Por despachar, Ubicado, Despachado) para una adecuada gestión del despacho.

*******************
Versiones
*******************

1. `AppBodega_v1.0 <https://github.com/jdavidIP/AgroCosta_AppBodega/releases/tag/v1.0.0>`_
2. `AppBodega_v2.0 <https://github.com/jdavidIP/AgroCosta_AppBodega/releases/tag/v2.0.0>`_ 
3. `AppBodega_v3.0 <https://github.com/jdavidIP/AgroCosta_AppBodega/releases/tag/v3.0.0>`_ (Versión mas reciente)
