import asyncHandler from '../middlewares/async-Handler.js';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import sgMail from '@sendgrid/mail';

// @desc Auth user & get token        //descrição
// @route POST /api/user/login        /rota
// @access Public                     //acesso (Public, Private, Admin)
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      appRegistered: user.appRegistered,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error('Email ou senha inválidos');
  }
});

// @desc Register user
// @route POST /api/user
// @access Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Usuário já existe');
  }
  const user = await User.create({
    name,
    email,
    password,
  });
  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      appRegistered: user.appRegistered,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc Logout user  & clear cookie
// @route POST /api/user/logout
// @access Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) }); //remove o cookie 'jwt'

  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc Get user profile
// @route GET /api/user/profile
// @access Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      appRegistered: user.appRegistered,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }
});

// @desc Update user profile
// @route PUT /api/user/profile
// @access Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = name || user.name;
    user.email = email || user.email;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      appRegistered: user.appRegistered,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }
});

// @desc Update user profile
// @route PUT /api/user/profile/password
// @access Private
export const updateUserPassword = asyncHandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    if (oldpassword && newpassword && (await user.matchPassword(oldpassword))) {
      if (oldpassword === newpassword) {
        res.status(404);
        throw new Error('Senha nova é igual a antiga. Altere a nova senha.');
      }
      user.password = newpassword;
      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        appRegistered: user.appRegistered,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404);
      throw new Error('Senha inválida');
    }
  } else {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }
});

// @desc Update user profile
// @route DELETE /api/user/profile
// @access Private
export const deleteProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Não é possível deletar um usuário administrador');
    }
    await User.deleteOne({ _id: user._id });
    res.status(200).json({ message: 'User deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }
});

// @desc Get users
// @route GET /api/user
// @access Private/admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
});

// @desc Get user by id
// @route GET /api/user/:id
// @access Private/admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }
});

// @desc Delete user
// @route DELETE /api/user/:id
// @access Private/admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Não é possível deletar um usuário administrador');
    }
    await User.deleteOne({ _id: user._id });
    res.status(200).json({ message: 'User deleted successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc Update user
// @route PUT /api/user/:id
// @access Private/admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);
    user.appRegistered = Boolean(req.body.appRegistered);

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      appRegistered: user.appRegistered,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }
});

function getMessage(name, email, message) {
  const body = `email: ${email}. message: ${message}`;
  return {
    to: process.env.EMAIL_TO_RECEIVE,
    from: process.env.EMAIL_TO_SEND,
    subject: `Email from ${name} of my portfolio page`,
    text: body,
    // html: `<strong>${body}</strong>`,
  };
}

// @desc Send a email
// @route POST /api/user/sendemail
// @access Public
export const sendEmailAPI = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  process.env.SENDGRID_API_KEY &&
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    await sgMail.send(getMessage(name, email, message));
    res.status(200).json({
      message: `Obrigada ${name} por sua mensagem! O email foi enviado com sucesso`,
    });
  } catch (error) {
    console.error(error);
    throw new Error(
      'Erro ao enviar sua mensagem. Tente mais tarde ou utilize as minhas redes sociais.'
    );
  }
});
