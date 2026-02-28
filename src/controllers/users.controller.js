const bcrypt = require('bcryptjs');
const { sign } = require('../auth');
const { UsersRepository } = require('../repositories/users.repository');
const { validarUsuario } = require('../domain/users.rules');
const { asyncHandler } = require('../utils/asyncHandler');
const e = require('express');

const repo = new UsersRepository();

const create = asyncHandler(async (req, res) => {
    const validacion = validarUsuario(req.body);

    if (!validacion.ok) {
        return res.status(400).json({ error: validacion.error });
    }

    const { primer_nombre, apellido_paterno, apellido_materno, rfc, email, password_hash, rol } = validacion.data;

    const usuarioExistente = await repo.findByEmail(email);
    if(usuarioExistente){
        return res.status(400).json({error: 'Ya existe un usuario registrado con este correo electrónico'});
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password_hash, salt);

    const user = await repo.create({
        primer_nombre,
        apellido_paterno,
        apellido_materno,
        rfc,
        email,
        passwordHash: hash,
        rol: rol || 'user'
    });

    return res.status(201).json({ ok: true, user });
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await repo.findByEmail(email);

    if (!user) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = sign({
        id: user.id,
        email: user.email,
        role: user.rol,
        rfc: user.rfc
    });

    return res.json({ token });
});

const getAll = asyncHandler(async (req, res) => {
    const tokenUserRole = req.user.rol;

    if (tokenUserRole !== 'admin') {
        return res.status(403).json({ 
            error: 'Acceso denegado. Solo los administradores pueden ver todos los usuarios.' 
        });
    }

    const usuarios = await repo.findAll(); 
    res.json({ ok: true, data: usuarios });
});

const getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tokenUserId = req.user.id;
    const tokenUserRole = req.user.rol;

    if (Number(id) !== tokenUserId && tokenUserRole !== 'admin') {
        return res.status(403).json({ 
            error: 'No tienes permiso para ver la información de otro usuario.' 
        });
    }

    const usuario = await repo.findById(id);
    
    if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ ok: true, data: usuario });
});

const update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tokenUserId = req.user.id;
    const tokenUserRole = req.user.rol;

    if (Number(id) !== tokenUserId && tokenUserRole !== 'admin') {
        return res.status(403).json({ 
            error: 'No tienes permiso para modificar el perfil de otro usuario.' 
        });
    }

    const actualizado = await repo.update(id, req.body);
    
    if (!actualizado) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ ok: true, data: actualizado });
});

const remove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tokenUserId = req.user.id;
    const tokenUserRole = req.user.role; 

    if (Number(id) !== tokenUserId && tokenUserRole !== 'admin') {
        return res.status(403).json({ 
            error: 'No tienes permiso para eliminar la cuenta de otro usuario.' 
        });
    }

    const eliminado = await repo.delete(id);
    
    if (!eliminado) {
        return res.status(404).json({ error: 'Usuario no encontrado para eliminar' });
    }

    return res.status(204).json({ message: 'Usuario eliminado correctamente' }); 
});

module.exports = { loginUser, create, getAll, getById, update, remove };