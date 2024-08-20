###################
Agro-Costa App Bodega
###################

Esta web app desarrollada en PHP y JavaScript es el sistema utilizado en la bodega de Agro-COSTA para administrar distintos aspectos alrededor de los productos en el inventario y las remisiones hechas por los clientes.
Este sistema se conecta a la base de datos de "Agro-Costa SAS" y está hecho para ser utilizado tanto por los trabajadores de piso como los de oficina para lo que sus labores les requiera, y busca ser lo mas práctico y funcional en su uso para agilizar el funcionamiento de 
la compañía en cuanto al manejamiento de inventario y órdenes se refiere.

*******************
Funcionalidad
*******************

La funcionalidad de esta web app esta basada en el uso de controllers en PHP que luego integran su funcionalidad con archivos JavaScript para asi lograr sus distintos cometidos. Toda la información que se muestra y administra en la app
viene de la base de datos de la empresa en el software de "Traverse", por lo que esto asegura que es fiable y que los cambios hechos desde el interfaz del sistema van a representar un cambio real en los datos que la emprese maneje. 
Los controladores y funcionalidad hasta la última versión de la aplicación liberada son:

-  `Bodega - Esta es la pestaña utilizada por los operarios para ver las remisiones que aún no han sido verificadas en el sistema. Les permite ver los items de las remisiones, quién es el responsable de completarlas y ver y administrar el estado en el que están si ellos son los responsables.`
-  `Bodega Admin - Esta es la pestaña utilizada por los administradores para ver las remisiones que aún no han sido verificadas en el sistema. Les permite ver los items de las remisiones, quién es el responsable de completarlas, ver y administrar el estado en el que están, y asignar operarios a cada remisión.`
- `Localizar/Localizar_Etiquetas - Esta es la pestaña utilizada por los usuarios para consultar en que localizaciónes se encuentran los items de una remisión usando su numero de despacho. Les permite ver los items de las remisiones, sus localizaciones, cantidad disponible, proveedor, entre otras cosas. En "Localizar_Eitquetas" a esto se le agrega la funcionalidad de generar códigos de barras para los items de la orden.`
- `Localizaciones/Localizaciones_Etiquetas - Esta es la pestaña utilizada por los usuarios para consultar la información de un item en específico utilizando su número de referencia. Les permite ver la referencia, descripción, bodega, cantidad disponible y localización del item. En "Localizaciones_Etiquetas" a esto se le agrega la funcionalidad de generar un codigo de barras al item.`
- `Traslado/Traslado_Etiquetas - Esta es la pestaña utilizada por los administradores para consultar la información de los items que hayan sido asignados a traslados entre bodegas utilizando un número de traslado.  Les permite ver los items de los traslados, sus localizaciones, cantidad disponible, proveedor, entre otras cosas. En "Traslado_Eitquetas" a esto se le agrega la funcionalidad de generar códigos de barras para los items del traslado.`
- `Históricos (Por Terminar) - Esta pestaña va a ser utilizada por usuarios para consultar remisiones ya despachadas utilizando su numero de remision. Les permite ver los items de las remisiones, quién fue el responsable de completarlas, la fecha de despacho, etc. En la versión mas reciente, la funcionalidad de este módulo aun no esta terminada ya que en la base de datos aun no se guardan las remisiones ya despachadas, por lo que se muestra cualquier remision que tenga el ID ingresado por el usuario sin importar su estado.`

*******************
Versiones
*******************

1. `AppBodega_v1.0`
2. `AppBodega_v2.0 (Latest)`
