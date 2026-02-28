function validarUsuario(datos) {
    const { 
        primer_nombre, 
        apellido_paterno, 
        apellido_materno, 
        rfc, 
        email, 
        password_hash, 
        rol 
    } = datos;

    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!primer_nombre || typeof primer_nombre !== 'string' || primer_nombre.trim().length < 2 || !nombreRegex.test(primer_nombre)) {
        return { ok: false, error: 'El nombre es inválido. Debe contener al menos 2 letras y no tener números.' };
    }

    if (!apellido_paterno || typeof apellido_paterno !== 'string' || apellido_paterno.trim().length < 2 || !nombreRegex.test(apellido_paterno)) {
        return { ok: false, error: 'El apellido paterno es inválido.' };
    }

    if (apellido_materno && (typeof apellido_materno !== 'string' || !nombreRegex.test(apellido_materno))) {
        return { ok: false, error: 'El apellido materno contiene caracteres inválidos.' };
    }

    const rfcRegex = /^[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfc || !rfcRegex.test(rfc.toUpperCase())) {
        return { ok: false, error: 'Formato de RFC inválido. Debe ser de persona física (13 caracteres).' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || email.length > 100 || !emailRegex.test(email)) {
        return { ok: false, error: 'Correo electrónico inválido. Verifica que tenga el formato correcto (ej. usuario@mail.com).' };
    }

    if (!password_hash || typeof password_hash !== 'string' || password_hash.length < 8) {
        return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
    }

    const rolesValidos = ['admin', 'user'];
    const rolSeguro = rol && rolesValidos.includes(rol.toLowerCase()) ? rol.toLowerCase() : 'user';

    return { 
        ok: true, 
        data: { 
            primer_nombre: primer_nombre.trim(), 
            apellido_paterno: apellido_paterno.trim(),
            apellido_materno: apellido_materno ? apellido_materno.trim() : null,
            rfc: rfc.toUpperCase(), 
            email: email.toLowerCase().trim(),
            password_hash,
            rol: rolSeguro
        } 
    };
}

module.exports = { validarUsuario };