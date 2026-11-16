from datetime import datetime, timedelta
from uuid import uuid4

from conexion import obtener_conexion
from servicios.recomendador_neuronal import extraer_palabras_clave


def crear_propuesta_proyecto(
    estudiante_id: int,
    titulo_tentativo: str,
    docente_tutor_ids: list[int],
    pdf_url: str = ""
):
    docentes = list(dict.fromkeys(docente_tutor_ids))
    if not 1 <= len(docentes) <= 2:
        raise ValueError("Una propuesta debe enviarse a uno o dos docentes.")
    if estudiante_id in docentes:
        raise ValueError("El estudiante no puede seleccionarse como docente.")

    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        palabras_str = ", ".join(extraer_palabras_clave(titulo_tentativo))
        ahora = datetime.now()
        limite_72h = ahora + timedelta(hours=72)
        grupo_propuesta_id = str(uuid4())
        proyectos = []

        for docente_tutor_id in docentes:
            cursor.execute("""
                INSERT INTO proyectos_grado (
                    estudiante_id, titulo_tentativo, palabras_clave, pdf_documento_url,
                    grupo_propuesta_id, docente_tutor_id, estado, fecha_envio,
                    fecha_limite_72h
                )
                VALUES (%s, %s, %s, %s, %s, %s, 'enviado_a_tutor', %s, %s)
                RETURNING id, estudiante_id, titulo_tentativo, palabras_clave,
                          grupo_propuesta_id, docente_tutor_id, estado,
                          fecha_envio, fecha_limite_72h;
            """, (
                estudiante_id, titulo_tentativo, palabras_str, pdf_url,
                grupo_propuesta_id, docente_tutor_id, ahora, limite_72h
            ))
            proyecto = cursor.fetchone()
            proyectos.append(proyecto)
            cursor.execute("""
                INSERT INTO notificaciones (usuario_id, proyecto_id, asunto, mensaje)
                VALUES (%s, %s, 'Nueva propuesta de Proyecto de Grado',
                        'Un estudiante ha enviado su propuesta para revisión. Tienes 72 horas para responder.');
            """, (docente_tutor_id, proyecto["id"]))

        conexion.commit()
        return proyectos
    except Exception:
        conexion.rollback()
        raise
    finally:
        cursor.close()
        conexion.close()


def listar_proyectos_de_estudiante(estudiante_id: int):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute("""
            SELECT p.id, p.titulo_tentativo, p.palabras_clave, p.pdf_documento_url,
                   p.grupo_propuesta_id, p.estado, p.fecha_envio,
                   p.fecha_limite_72h, p.observacion_tutor,
                   d.nombre AS docente_nombre, d.email AS docente_email
            FROM proyectos_grado p
            LEFT JOIN usuarios d ON p.docente_tutor_id = d.id
            WHERE p.estudiante_id = %s
            ORDER BY p.creado_en DESC;
        """, (estudiante_id,))
        proyectos = cursor.fetchall()
        ahora = datetime.now()
        for proyecto in proyectos:
            if (
                proyecto["estado"] == "enviado_a_tutor"
                and proyecto["fecha_limite_72h"]
                and ahora > proyecto["fecha_limite_72h"]
            ):
                proyecto["estado"] = "expirado_72h"
                proyecto["observacion_tutor"] = (
                    "El docente no respondió en 72 horas. Debes buscar otro tutor."
                )
        return proyectos
    finally:
        cursor.close()
        conexion.close()


def buzon_proyectos_docente(docente_id: int):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute("""
            SELECT p.id, p.titulo_tentativo, p.palabras_clave, p.pdf_documento_url,
                   p.grupo_propuesta_id, p.estado, p.fecha_envio,
                   p.fecha_limite_72h, e.id AS estudiante_id,
                   e.nombre AS estudiante_nombre, e.email AS estudiante_email,
                   e.codigo_saga AS estudiante_saga
            FROM proyectos_grado p
            JOIN usuarios e ON p.estudiante_id = e.id
            WHERE p.docente_tutor_id = %s
            ORDER BY p.fecha_envio DESC;
        """, (docente_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conexion.close()


def responder_propuesta_docente(
    proyecto_id: int,
    docente_id: int,
    accion: str,
    observacion: str = ""
):
    if accion not in ("aceptar", "rechazar"):
        raise ValueError("La acción debe ser aceptar o rechazar.")

    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute("""
            SELECT id, estudiante_id, titulo_tentativo, grupo_propuesta_id, estado
            FROM proyectos_grado
            WHERE id = %s AND docente_tutor_id = %s
            FOR UPDATE;
        """, (proyecto_id, docente_id))
        proyecto = cursor.fetchone()
        if not proyecto:
            return None
        if proyecto["estado"] != "enviado_a_tutor":
            raise ValueError("Esta propuesta ya fue respondida.")

        nuevo_estado = "aceptado" if accion == "aceptar" else "rechazado"
        ahora = datetime.now()
        cursor.execute("""
            UPDATE proyectos_grado
            SET estado = %s, fecha_respuesta = %s, observacion_tutor = %s
            WHERE id = %s;
        """, (nuevo_estado, ahora, observacion, proyecto_id))
        proyecto["estado"] = nuevo_estado

        revisores_asignados = []
        if nuevo_estado == "aceptado":
            cursor.execute("""
                SELECT id, docente_tutor_id
                FROM proyectos_grado
                WHERE grupo_propuesta_id = %s
                  AND id <> %s
                  AND estado = 'enviado_a_tutor'
                FOR UPDATE;
            """, (proyecto["grupo_propuesta_id"], proyecto_id))
            alternativa = cursor.fetchone()
            if alternativa:
                cursor.execute("""
                    UPDATE proyectos_grado
                    SET estado = 'revisor_asignado', fecha_respuesta = %s,
                        observacion_tutor = %s
                    WHERE id = %s;
                """, (
                    ahora,
                    "Asignado automáticamente como revisor porque el otro docente aceptó.",
                    alternativa["id"]
                ))
                cursor.execute("""
                    INSERT INTO proyecto_revisores
                        (proyecto_id, revisor_id, afinidad_score, estado)
                    VALUES (%s, %s, 100, 'asignado')
                    ON CONFLICT (proyecto_id, revisor_id) DO NOTHING;
                """, (proyecto_id, alternativa["docente_tutor_id"]))
                cursor.execute("""
                    INSERT INTO notificaciones (usuario_id, proyecto_id, asunto, mensaje)
                    VALUES (%s, %s, 'Asignación como revisor',
                            'El otro docente aceptó la tutoría. Has sido asignado como revisor.');
                """, (alternativa["docente_tutor_id"], proyecto_id))
                revisores_asignados.append({
                    "revisor_id": alternativa["docente_tutor_id"],
                    "afinidad_score": 100
                })

        if nuevo_estado == "aceptado":
            mensaje = (
                f"El docente aceptó tu propuesta '{proyecto['titulo_tentativo']}'."
            )
            if revisores_asignados:
                mensaje += " El segundo docente fue asignado como revisor."
        else:
            cursor.execute("""
                SELECT COUNT(*) AS pendientes
                FROM proyectos_grado
                WHERE grupo_propuesta_id = %s AND estado = 'enviado_a_tutor';
            """, (proyecto["grupo_propuesta_id"],))
            pendientes = cursor.fetchone()["pendientes"]
            mensaje = (
                "Un docente rechazó tu propuesta. El otro docente seleccionado aún puede responder."
                if pendientes else
                "Los docentes rechazaron tu propuesta. Debes volver al recomendador para buscar otro tutor."
            )

        cursor.execute("""
            INSERT INTO notificaciones (usuario_id, proyecto_id, asunto, mensaje)
            VALUES (%s, %s, %s, %s);
        """, (
            proyecto["estudiante_id"],
            proyecto_id,
            f"Respuesta de Tutoría: {nuevo_estado.upper()}",
            mensaje
        ))
        conexion.commit()
        return {"proyecto": proyecto, "revisores_asignados": revisores_asignados}
    except Exception:
        conexion.rollback()
        raise
    finally:
        cursor.close()
        conexion.close()


def listar_notificaciones(usuario_id: int):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute("""
            SELECT id, proyecto_id, asunto, mensaje, leido, creado_en
            FROM notificaciones
            WHERE usuario_id = %s
            ORDER BY creado_en DESC;
        """, (usuario_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conexion.close()


def marcar_notificacion_leida(usuario_id: int, notificacion_id: int):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute("""
            UPDATE notificaciones
            SET leido = TRUE
            WHERE id = %s AND usuario_id = %s
            RETURNING id;
        """, (notificacion_id, usuario_id))
        resultado = cursor.fetchone()
        conexion.commit()
        return resultado
    finally:
        cursor.close()
        conexion.close()


def obtener_revisores_de_proyecto(proyecto_id: int):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute("""
            SELECT r.id, u.id AS revisor_id, u.nombre AS revisor_nombre,
                   u.email AS revisor_email, r.afinidad_score, r.estado,
                   r.asignado_en
            FROM proyecto_revisores r
            JOIN usuarios u ON r.revisor_id = u.id
            WHERE r.proyecto_id = %s;
        """, (proyecto_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conexion.close()
