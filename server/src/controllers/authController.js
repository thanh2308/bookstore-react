import User from '../models/User.js';
import crypto from 'crypto';
import emailService from '../services/emailService.js'; 

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Determine role based on email (for demo)
        const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        // Generate token
        const token = user.generateToken();

        try {
            await emailService.sendWelcomeEmail(user);
        } catch (emailError) {
            console.error('Lỗi gửi email chào mừng:', emailError);
        }
        // --------------------------------------------------

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mật khẩu'
            });
        }

        // Check user exists (VÀ lấy luôn cả trường password đã bị ẩn)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn đã bị khóa'
            });
        }

        const isPasswordMatch = await user.comparePassword(password);
        
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng' 
            });
        }

        // Generate token
        const token = user.generateToken();

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                addresses: user.addresses
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, newAddress } = req.body;

        const user = await User.findById(req.user.id);

        if (user) {
            user.name = name || user.name;
            if (phone !== undefined) {
                user.phone = phone;
            }
            
            if (newAddress) {
                user.addresses.push(newAddress);
            }

            if (email && email !== user.email) {
                // Check if new email already exists
                const emailExists = await User.findOne({ email });
                if (emailExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email đã được sử dụng'
                    });
                }
                user.email = email;
            }

            const updatedUser = await user.save();

            res.status(200).json({
                success: true,
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    avatar: updatedUser.avatar,
                    role: updatedUser.role,
                    addresses: updatedUser.addresses
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Gửi email quên mật khẩu
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng với email này'
            });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await emailService.sendResetPasswordEmail(user, resetUrl);

            res.status(200).json({
                success: true,
                message: 'Email khôi phục mật khẩu đã được gửi'
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Không thể gửi email, vui lòng thử lại sau'
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Đặt lại mật khẩu mới
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Mã khôi phục không hợp lệ hoặc đã hết hạn'
            });
        }

        user.password = req.body.password;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = user.generateToken();

        res.status(200).json({
            success: true,
            message: 'Đặt lại mật khẩu thành công',
            token
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};