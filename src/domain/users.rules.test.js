const { validarUsuario } = require('./users.rules');

describe('Pruebas unitarias de UserRules - Cobertura Total', () => {
    
    test('Debería validar un usuario con todos los datos correctos', () => {
        const usuario = {
            primer_nombre: 'Ricardo',
            apellido_paterno: 'Baranda',
            apellido_materno: 'Cisneros',
            rfc: 'VABR950101XYZ',
            email: 'ricardo@mail.com',
            password_hash: 'supersegura123',
            rol: 'admin'
        };
        const resultado = validarUsuario(usuario);
        expect(resultado.ok).toBe(true);
        expect(resultado.data.rol).toBe('admin');
        expect(resultado.data.apellido_materno).toBe('Cisneros');
    });

    test('Debería validar un usuario sin apellido materno (es opcional)', () => {
        const usuario = {
            primer_nombre: 'Ricardo',
            apellido_paterno: 'Baranda',
            rfc: 'VABR950101XYZ',
            email: 'ricardo@mail.com',
            password_hash: 'supersegura123',
            rol: 'user'
        };
        const resultado = validarUsuario(usuario);
        expect(resultado.ok).toBe(true);
        expect(resultado.data.apellido_materno).toBeNull();
    });

    test('Debería asignar el rol "user" por defecto si intentan inyectar un rol raro', () => {
        const usuario = {
            primer_nombre: 'Ricardo',
            apellido_paterno: 'Baranda',
            rfc: 'VABR950101XYZ',
            email: 'ricardo@mail.com',
            password_hash: 'supersegura123',
            rol: 'superhacker'
        };
        const resultado = validarUsuario(usuario);
        expect(resultado.ok).toBe(true);
        expect(resultado.data.rol).toBe('user');
    });


    test('Debería rechazar un nombre vacío o con menos de 2 letras', () => {
        const usuario = {
            primer_nombre: 'R',
            apellido_paterno: 'Baranda',
            rfc: 'VABR950101XYZ',
            email: 'ricardo@mail.com',
            password_hash: 'supersegura123'
        };
        const resultado = validarUsuario(usuario);
        expect(resultado.ok).toBe(false);
        expect(resultado.error).toBe('El nombre es inválido. Debe contener al menos 2 letras y no tener números.');
    });

    test('Debería rechazar un nombre con números', () => {
        const usuario = {
            primer_nombre: 'Ricardo123',
            apellido_paterno: 'Baranda',
            rfc: 'VABR950101XYZ',
            email: 'ricardo@mail.com',
            password_hash: 'supersegura123'
        };
        const resultado = validarUsuario(usuario);
        expect(resultado.ok).toBe(false);
        expect(resultado.error).toBe('El nombre es inválido. Debe contener al menos 2 letras y no tener números.');
    });

    test('Debería rechazar si falta el apellido paterno', () => {
        const usuario = {
            primer_nombre: 'Ricardo',
            rfc: 'VABR950101XYZ',
            email: 'ricardo@mail.com',
            password_hash: 'supersegura123'
        };
        const resultado = validarUsuario(usuario);
        expect(resultado.ok).toBe(false);
        expect(resultado.error).toBe('El apellido paterno es inválido.');
    });

    test('Debería rechazar un apellido materno con números', () => {
        const usuario = {
            primer_nombre: 'Ricardo',
            apellido_paterno: 'Baranda',
            apellido_materno: 'Cisner0s',
            rfc: 'VABR950101XYZ',
            email: 'ricardo@mail.com',
            password_hash: 'supersegura123'
        };
        const resultado = validarUsuario(usuario);
        expect(resultado.ok).toBe(false);
        expect(resultado.error).toBe('El apellido materno contiene caracteres inválidos.');
    });

    test('Debería rechazar un RFC inválido', () => {
        const usuario = {
            primer_nombre: 'Ricardo',
            apellido_paterno: 'Baranda',
            rfc: 'RFC_MALO',
            email: 'ricardo@mail.com',
            password_hash: 'supersegura123'
        };
        const resultado = validarUsuario(usuario);
        expect(resultado.ok).toBe(false);
        expect(resultado.error).toBe('Formato de RFC inválido. Debe ser de persona física (13 caracteres).');
    });

    test('Debería rechazar un correo electrónico sin el formato correcto', () => {
        const usuario = {
            primer_nombre: 'Ricardo',
            apellido_paterno: 'Baranda',
            rfc: 'VABR950101XYZ',
            email: 'ricardomail.com',
            password_hash: 'supersegura123'
        };
        const resultado = validarUsuario(usuario);
        expect(resultado.ok).toBe(false);
        expect(resultado.error).toBe('Correo electrónico inválido. Verifica que tenga el formato correcto (ej. usuario@mail.com).');
    });

    test('Debería rechazar una contraseña demasiado corta', () => {
        const usuario = {
            primer_nombre: 'Ricardo',
            apellido_paterno: 'Baranda',
            rfc: 'VABR950101XYZ',
            email: 'ricardo@mail.com',
            password_hash: '123'
        };
        const resultado = validarUsuario(usuario);
        expect(resultado.ok).toBe(false);
        expect(resultado.error).toBe('La contraseña debe tener al menos 8 caracteres.');
    });

});