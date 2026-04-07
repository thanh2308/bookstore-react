import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort('-createdAt')
            .exec();

        const count = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('orderHistory');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

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

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        const { name, email, role } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Đã xóa người dùng'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Toggle user block status
// @route   PUT /api/users/:id/block
// @access  Private/Admin
export const toggleUserBlock = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Không thể khóa tài khoản admin'
            });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add address
// @route   POST /api/users/address
// @access  Private
export const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // If this is the first address or isDefault is true, set as default
        if (user.addresses.length === 0 || req.body.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
            req.body.isDefault = true;
        }

        user.addresses.push(req.body);
        await user.save();

        res.status(200).json({
            success: true,
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update address
// @route   PUT /api/users/address/:addressId
// @access  Private
export const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const address = user.addresses.id(req.params.addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy địa chỉ'
            });
        }

        Object.assign(address, req.body);

        if (req.body.isDefault) {
            user.addresses.forEach(addr => {
                if (addr._id.toString() !== req.params.addressId) {
                    addr.isDefault = false;
                }
            });
        }

        await user.save();

        res.status(200).json({
            success: true,
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete address
// @route   DELETE /api/users/address/:addressId
// @access  Private
export const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== req.params.addressId
        );

        await user.save();

        res.status(200).json({
            success: true,
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Toggle wishlist
// @route   POST /api/users/wishlist/:bookId
// @access  Private
export const toggleWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const bookId = req.params.bookId;

        const index = user.wishlist.indexOf(bookId);

        if (index > -1) {
            // Remove from wishlist
            user.wishlist.splice(index, 1);
        } else {
            // Add to wishlist
            user.wishlist.push(bookId);
        }

        await user.save();

        // Populate wishlist before sending back
        await user.populate('wishlist');

        res.status(200).json({
            success: true,
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');

        res.status(200).json({
            success: true,
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all wishlists (Admin)
// @route   GET /api/users/wishlists/all
// @access  Private/Admin
export const getAllWishlists = async (req, res) => {
    try {
        const users = await User.find({ 'wishlist.0': { $exists: true } })
            .select('name email wishlist')
            .populate('wishlist', 'title author image price');

        // Calculate book popularity
        const bookPopularity = {};
        users.forEach(user => {
            user.wishlist.forEach(book => {
                if (book) {
                    const bookId = book._id.toString();
                    if (!bookPopularity[bookId]) {
                        bookPopularity[bookId] = {
                            book: book,
                            count: 0,
                            users: []
                        };
                    }
                    bookPopularity[bookId].count++;
                    bookPopularity[bookId].users.push({
                        name: user.name,
                        email: user.email
                    });
                }
            });
        });

        // Convert to array and sort by popularity
        const popularBooks = Object.values(bookPopularity)
            .sort((a, b) => b.count - a.count);

        res.status(200).json({
            success: true,
            totalUsers: users.length,
            wishlists: users,
            popularBooks: popularBooks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
